import { Router } from "express";
import multer from "multer";
import {
  register,
  login,
  testConnection,
  updateProfile,
} from "../controller/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
// Asegúrate de tener este middleware configurado
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(), // <-- Usamos memoryStorage
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});
const router = Router();

router.get("/test", testConnection);

// Aplicar multer solo a la ruta de registro
router.post("/register", upload.single("image"), register);
// Ruta de login
router.post("/login", login);
router.put(
  "/profile",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

export default router;
