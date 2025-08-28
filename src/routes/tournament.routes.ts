import { Router } from "express";
import multer from "multer";
import { configureCloudinary } from "../config/cloudinary";
import {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
} from "../controllers/tournament.controller";
import {
  validateCreateTournament,
  validateTournamentId,
  validateUpdateTournament,
} from "../middlewares/validators/tournament.validator";

const router = Router();

// Configura Cloudinary
const cloudinaryConfig = configureCloudinary();
const upload = multer({
  storage: cloudinaryConfig.storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      file.originalname.toLowerCase().match(/\.[0-9a-z]+$/)?.[0] || ""
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG)"));
    }
  },
});

// Public routes (temporalmente sin autenticación para pruebas)
router.get("/", getTournaments);
router.get("/:id", validateTournamentId, getTournamentById);
router.post(
  "/",
  upload.single("image"),
  validateCreateTournament,
  createTournament
);

router.put(
  "/:id",
  validateTournamentId,
  upload.single("image"),
  validateUpdateTournament,
  updateTournament
);

router.delete("/:id", validateTournamentId, deleteTournament);

export default router;
