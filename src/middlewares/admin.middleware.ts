import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.model";
import mongoose from "mongoose";
import { JWT_SECRET } from "../config/env";
import jwt from "jsonwebtoken";

// Get the User model from mongoose
const User = mongoose.model<IUser>('User');

// Ensure consistent type with auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
      admin?: any;
    }
  }
}

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No estás autenticado. Por favor inicia sesión.'
      });
    }

    // 2) Verify token
    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // 3) Check if admin still exists
    const currentAdmin = await User.findById(decoded.id);
    if (!currentAdmin || currentAdmin.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'El administrador ya no existe o no tiene permisos.'
      });
    }

    // 4) GRANT ACCESS TO PROTECTED ROUTE
    req.admin = currentAdmin;
    next();
  } catch (error) {
    console.error('Error en el middleware de administrador:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación del administrador',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export default adminMiddleware;
