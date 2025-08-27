import { Request, Response, NextFunction } from "express";
import { IUser, UserRole } from "../models/user.model";

// Ensure consistent type with auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user from request (set by auth middleware)
    const user = req.user;
    
    if (!user || !user.id) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Check if user is admin
    const dbUser = await User.findById(user.id).exec();
    
    if (!dbUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Check if user has admin role
    const userRole = (dbUser as IUser).role as UserRole;
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren privilegios de administrador' 
      });
    }

    // User is admin, proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Error de autenticación' });
  }
};

const User = require('../models/user.model');

export default adminMiddleware;
