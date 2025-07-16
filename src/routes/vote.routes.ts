import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { votePlayer, checkUserVote } from "../controller/vote.controller";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas de votación
router.use(authMiddleware);

/**
 * @route POST /api/votes/:playerId
 * @description Registra un voto para un jugador
 * @access Privado
 * @param {string} playerId - ID del jugador que recibe el voto
 * @body {string} voteType - Tipo de voto ('up' o 'down')
 */
router.post("/:playerId", votePlayer);

/**
 * @route GET /api/votes/:playerId/check
 * @description Verifica si el usuario actual ya votó por un jugador
 * @access Privado
 * @param {string} playerId - ID del jugador a verificar
 */
router.get("/:playerId/check", checkUserVote);

export default router;
