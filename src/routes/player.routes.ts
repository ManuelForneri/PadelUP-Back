import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getPlayers,
  getPlayerById,
  voteForPlayer,
} from "../controller/player.controller";

const router = Router();

// Rutas que requieren autenticación
const authRouter = Router();
authRouter.use(authMiddleware);

authRouter.get("/", getPlayers);
authRouter.get("/:id", getPlayerById);

// Usar las rutas con autenticación
router.use(authRouter);

// Ruta para votar por un jugador (temporalmente sin autenticación)
router.post("/:id/vote", voteForPlayer);

export default router;
