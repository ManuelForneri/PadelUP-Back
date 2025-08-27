import { Router } from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../../controller/admin/user.controller";

const router = Router();

// Apply auth and admin middleware to all routes
router.use(isAuthenticated, adminMiddleware);

// Admin user management routes
router.get("/", getUsers);
router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
