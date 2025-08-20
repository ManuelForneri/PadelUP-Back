import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import { Document, Types } from 'mongoose';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateJWT = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    
    const user = await User.findById(decoded.userId).select('-password').lean().exec();
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Type assertion for the user document
    const userDoc = user as unknown as IUser & { _id: { toString: () => string } };
    
    // For now, we'll use 'admin' role for users with '1ra' category
    // You might want to add a proper role field to the User model later
    const userRole = userDoc.category === '1ra' ? 'admin' : 'user';
    
    req.user = {
      id: userDoc._id.toString(),
      role: userRole
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
