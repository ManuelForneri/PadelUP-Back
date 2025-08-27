import * as cloudinary from "cloudinary";
import cloudinaryStorage from "multer-storage-cloudinary";

export const configureCloudinary = () => {
  // Configuración de Cloudinary
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Configuración del almacenamiento
  const storage = cloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: "padelup/tournaments",
      format: "jpg",
      public_id: (req: any, file: any) => `tournament-${Date.now()}`,
    } as any,
  });

  return { cloudinary: cloudinary.v2, storage };
};
