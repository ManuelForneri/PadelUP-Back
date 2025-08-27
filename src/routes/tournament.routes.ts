import { Router } from 'express';
import { celebrate } from 'celebrate';
import multer from 'multer';
import path from 'path';
import {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
} from '../controllers/tournament.controller';
import {
  validateCreateTournament,
  validateTournamentId,
  validateUpdateTournament,
  validateImageUpload,
} from '../middleware/validators/tournament.validator';
import { isAuthenticated, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/tournaments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'tournament-' + uniqueSuffix + ext);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG)'));
    }
  },
});

// Public routes (temporalmente sin autenticación para pruebas)
router.get('/', getTournaments);
router.get('/:id', validateTournamentId, getTournamentById);
router.post(
  '/',
  upload.single('image'),
  validateCreateTournament,
  createTournament
);

router.put(
  '/:id',
  validateTournamentId,
  upload.single('image'),
  validateUpdateTournament,
  updateTournament
);

router.delete(
  '/:id',
  validateTournamentId,
  deleteTournament
);

export default router;
