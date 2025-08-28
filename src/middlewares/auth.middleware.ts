// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

// Extend the Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
      token?: string;
    }
  }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
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

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Assign user data to req.user
    req.user = {
      id: decoded.userId,
      role: decoded.role || 'user' // Default to 'user' if role is not in token
    };
    
    // Add token to request for potential use in subsequent handlers
    req.token = token;

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

// Exportar authMiddleware como alias de isAuthenticated para mantener compatibilidad
export const authMiddleware = isAuthenticated;
