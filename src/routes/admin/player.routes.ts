import { Router } from "express";
import { listPlayers } from "../../controllers/admin/player.controller";
import { protect } from "../../controllers/admin/auth.controller";

const router = Router();

router.use(protect);

router.get("/", listPlayers);

export default router;
