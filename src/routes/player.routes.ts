import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getPlayers, getPlayerById } from "../controllers/player.controller";
import { getRanking } from "../controllers/ranking.controller";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas de jugadores
router.use(authMiddleware);

router.get("/", getPlayers);

router.get("/:id", getPlayerById);

// Ruta para obtener el ranking de jugadores
router.get("/ranking/list", getRanking);

export default router;
