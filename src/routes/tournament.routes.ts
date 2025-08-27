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

// Public routes
router.get('/', getTournaments);
router.get('/:id', validateTournamentId, getTournamentById);

// Protected routes (require authentication and admin role)
router.post(
  '/',
  isAuthenticated,
  isAdmin,
  upload.single('image'),
  validateImageUpload,
  validateCreateTournament,
  createTournament
);

router.put(
  '/:id',
  isAuthenticated,
  isAdmin,
  upload.single('image'),
  validateImageUpload,
  validateTournamentId,
  validateUpdateTournament,
  updateTournament
);

router.delete(
  '/:id',
  isAuthenticated,
  isAdmin,
  validateTournamentId,
  deleteTournament
);

export default router;
