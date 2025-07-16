import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getPlayers, getPlayerById, voteForPlayer } from "../controller/player.controller";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas de jugadores
router.use(authMiddleware);

router.get("/", getPlayers);

router.get("/:id", getPlayerById);

// Ruta para votar por un jugador
router.post("/:id/vote", voteForPlayer);

export default router;
