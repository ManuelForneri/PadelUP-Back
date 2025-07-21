import { Router, type Request, type Response, type NextFunction } from "express";
import { registerVoteController } from "../controller/vote.controller";

export const voteRouter = Router();

// Test endpoint
voteRouter.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "ruta andando exitosamente" });
});

// Register a vote for a user
voteRouter.post(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await registerVoteController(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default voteRouter;
