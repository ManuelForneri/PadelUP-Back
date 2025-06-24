import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadImageToCloudinary = (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("Configurando Cloudinary con:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? "✅" : "❌",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "✅" : "❌",
      file_size: file.size,
      file_mimetype: file.mimetype,
    });

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "padelSAG_users",
      },
      (error, result) => {
        if (error) {
          console.error("Error en upload_stream:", error);
          return reject(error);
        }
        if (!result) {
          console.error("No se recibió resultado de Cloudinary");
          return reject(new Error("No result from Cloudinary"));
        }
        console.log("Imagen subida correctamente a Cloudinary");
        resolve(result.secure_url);
      }
    );

    const readable = new Readable();
    readable.push(file.buffer);
    readable.push(null);
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
