import { Router } from 'express';
import * as tournamentController from '../controllers/tournament.controller';

const router = Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Ruta temporal para crear torneos sin autenticación
router.post(
  '/',
  asyncHandler(tournamentController.createTournament)
);

// Ruta para obtener todos los torneos
router.get('/', asyncHandler(tournamentController.getTournaments));

// Ruta para obtener un torneo por ID
router.get(
  '/:id',
  asyncHandler(tournamentController.getTournamentById)
);

// Nota: Las demás rutas (PUT, DELETE) están temporalmente deshabilitadas
// para simplificar las pruebas

export default router;
