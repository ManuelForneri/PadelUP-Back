import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

interface CloudinaryError extends Error {
  http_code?: number;
  name: string;
  code?: string;
}

export const uploadImageToCloudinary = (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validar que el archivo tenga contenido
    if (!file || !file.buffer || file.buffer.length === 0) {
      const error: CloudinaryError = new Error('El archivo está vacío o no tiene contenido');
      error.name = 'EmptyFileError';
      return reject(error);
    }

    // Validar tipo MIME
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      const error: CloudinaryError = new Error('Tipo de archivo no soportado. Solo se permiten imágenes');
      error.name = 'InvalidMimeType';
      error.code = 'INVALID_MIME_TYPE';
      return reject(error);
    }

    console.log("Configurando Cloudinary con:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
      api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
      has_api_secret: !!process.env.CLOUDINARY_API_SECRET,
      file_size: file.size,
      file_mimetype: file.mimetype,
      file_originalname: file.originalname,
    });

    // Validar configuración de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      const error: CloudinaryError = new Error('Configuración de Cloudinary incompleta');
      error.name = 'CloudinaryConfigError';
      return reject(error);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "padelSAG_users",
        resource_type: 'auto',
        timeout: 30000, // 30 segundos de timeout
      },
      (error: any, result) => {
        if (error) {
          console.error("Error en upload_stream:", {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
            code: error.code,
          });
          return reject(error);
        }
        
        if (!result) {
          const error: CloudinaryError = new Error("No se recibió respuesta de Cloudinary");
          error.name = 'NoResponseError';
          return reject(error);
        }
        
        if (!result.secure_url) {
          const error: CloudinaryError = new Error("La URL segura de la imagen no está disponible");
          error.name = 'NoSecureUrlError';
          return reject(error);
        }
        
        console.log("Imagen subida correctamente a Cloudinary:", {
          url: result.secure_url,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
        
        resolve(result.secure_url);
      }
    );

    // Configurar manejadores de eventos para el stream
    uploadStream.on('error', (error: any) => {
      console.error('Error en el stream de carga:', error);
      const streamError: CloudinaryError = new Error(`Error en el proceso de carga: ${error.message}`);
      streamError.name = 'UploadStreamError';
      reject(streamError);
    });

    // Crear stream legible desde el buffer
    const readable = new Readable();
    readable._read = () => {}; // Método _read necesario
    readable.push(file.buffer);
    readable.push(null); // Fin del stream
    
    // Conectar el stream legible al de carga
    readable.pipe(uploadStream);
  });
};
// Agrega esta función en cloudinary.ts
export const deleteImageFromCloudinary = async (
  imageUrl: string
): Promise<void> => {
  try {
    console.log("Intentando eliminar imagen:", imageUrl);
    // Extraer el public_id de la URL
    const publicId = imageUrl.split("/").pop()?.split(".")[0];
    if (!publicId) {
      console.log("No se pudo extraer public_id de la URL");
      return;
    }

    const fullPublicId = `padelSAG_users/${publicId}`;
    console.log("Eliminando de Cloudinary con public_id:", fullPublicId);

    // Eliminar la imagen
    const result = await cloudinary.uploader.destroy(fullPublicId);
    console.log("Respuesta de Cloudinary al eliminar:", result);
  } catch (error) {
    console.error("Error en deleteImageFromCloudinary:", error);
    // No lanzamos el error para no interrumpir el flujo principal
  }
};
