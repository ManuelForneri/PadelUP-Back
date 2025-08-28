import { Request, Response, NextFunction } from "express";
import { IUser, UserRole } from "../models/user.model";
import mongoose from "mongoose";

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
      return res.status(401).json({ 
        success: false,
        message: 'No autorizado - Usuario no autenticado' 
      });
    }

    // Check if user is admin
    const dbUser = await User.findById(user.id).select('+role').lean().exec();
    
    if (!dbUser) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    // Check if user has admin role
    const userRole = dbUser.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Acceso denegado. Se requieren privilegios de administrador' 
      });
    }

    // Attach the full user to the request for use in subsequent middleware
    req.user = {
      id: dbUser._id.toString(),
      role: dbUser.role,
      ...dbUser.toObject()
    };

    // User is admin, proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en el servidor al verificar privilegios de administrador' 
    });
  }
};

export default adminMiddleware;
