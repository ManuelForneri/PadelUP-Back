import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// The Request type is extended in src/@types/express/index.d.ts

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as any;
    
    // Add user from payload - check both id and userId for compatibility
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      throw new Error('No user ID found in token');
    }
    
    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid',
      });
    }

    // Add user to request with proper typing
    const userObj = user as any;
    req.user = {
      id: userObj._id ? userObj._id.toString() : '',
      role: userObj.role || 'user',
      ...userObj
    };
    delete (req.user as any).password; // Ensure password is not included
    next();
  } catch (err) {
    console.error('Error in authentication middleware:', err);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid',
    });
  }
};

// For backward compatibility
export const authMiddleware = isAuthenticated;

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No user found in request',
      });
    }

    // Check if user has admin role
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
      });
    }

    next();
  } catch (err) {
    console.error('Error in admin middleware:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
