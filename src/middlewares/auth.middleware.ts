// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

interface JwtPayload {
  userId: string;  // Cambiado de 'id' a 'userId' para coincidir con el token
  email: string;
  iat: number;
  exp: number;
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
): void => {
  // Añadimos el tipo de retorno explícito
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No autorizado - Token no proporcionado",
      });
      return; // Asegúrate de salir de la función después de enviar la respuesta
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Asignar el ID del usuario a req.user
    req.user = {
      id: decoded.userId,  // Usamos userId que es lo que está en el token
    };

    console.log("Usuario autenticado con ID:", req.user.id);
    next(); // Continuar con el siguiente middleware
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(401).json({
      success: false,
      message: "No autorizado - Token inválido o expirado",
    });
    return; // Asegúrate de salir de la función después de enviar la respuesta
  }
};
