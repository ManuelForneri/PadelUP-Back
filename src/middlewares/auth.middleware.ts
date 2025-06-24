// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

interface JwtPayload {
  id: string;
  [key: string]: any;
}

// Extendemos la interfaz Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autorizado - Token no proporcionado",
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Asignar el ID del usuario a req.user
    req.user = {
      id: decoded.id,
    };

    console.log("Usuario autenticado con ID:", req.user.id); // Log para depuración

    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(401).json({
      success: false,
      message: "No autorizado - Token inválido o expirado",
    });
  }
};
