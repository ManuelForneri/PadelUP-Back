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
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "padelSAG_users",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary"));
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
    // Extraer el public_id de la URL
    const publicId = imageUrl.split("/").pop()?.split(".")[0];
    if (!publicId) return;

    // Eliminar la imagen
    await cloudinary.uploader.destroy(`padelSAG_users/${publicId}`);
    console.log("Imagen eliminada de Cloudinary:", publicId);
  } catch (error) {
    console.error("Error al eliminar la imagen de Cloudinary:", error);
    // No lanzamos el error para no interrumpir el flujo principal
  }
};
