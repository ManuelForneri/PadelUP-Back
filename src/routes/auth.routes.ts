import { Router } from "express";
import multer from "multer";
import {
  register,
  login,
  testConnection,
  updateProfile,
} from "../controller/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

// Asegúrate de tener este middleware configurado
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"), false);
  }
};

console.log("Configurando middleware de carga de archivos...");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    fieldSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Máximo 1 archivo
  },
  fileFilter,
});

// Middleware para manejar errores de multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err) {
    console.error("Error en multer:", {
      code: err.code,
      message: err.message,
      field: err.field,
      name: err.name,
    });
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'El archivo es demasiado grande. Tamaño máximo: 10MB',
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Solo se permite 1 archivo',
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Error al procesar el archivo',
      error: err.message,
    });
  }
  next();
};
const router = Router();

router.get("/test", testConnection);

// Aplicar multer solo a la ruta de registro
router.post("/register", 
  upload.single("image"),
  handleMulterError,
  register
);
// Ruta de login
router.post("/login", login);
router.put(
  "/profile",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

export default router;
