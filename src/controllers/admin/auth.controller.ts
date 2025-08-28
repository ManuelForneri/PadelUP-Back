import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../../models/admin.model';
import { JWT_SECRET } from '../../config/env';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

declare global {
  namespace Express {
    interface Request {
      admin?: any;
    }
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa email y contraseña'
      });
    }

    // 2) Check if admin exists && password is correct
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // 3) Verify JWT_SECRET is properly configured
    if (!JWT_SECRET || typeof JWT_SECRET !== 'string' || JWT_SECRET.trim() === '') {
      throw new Error('JWT_SECRET is not properly configured');
    }
    
    // Create a non-null assertion since we've already validated JWT_SECRET
    const secret: string = JWT_SECRET;

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      secret,
      { expiresIn: '1d' }
    );

    // 4) Remove password from output
    (admin as any).password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: {
        admin
      }
    });
  } catch (error) {
    console.error('Error en login de administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const protect = async (req: Request, res: Response, next: any) => {
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

    // 2) Verification token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // 3) Check if admin still exists
    const currentAdmin = await Admin.findById(decoded.id);
    if (!currentAdmin) {
      return res.status(401).json({
        success: false,
        message: 'El administrador ya no existe.'
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    (req as any).admin = currentAdmin;
    next();
  } catch (error) {
    console.error('Error en autenticación de administrador:', error);
    return res.status(401).json({
      success: false,
      message: 'Sesión inválida o expirada. Por favor inicia sesión nuevamente.'
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: any) => {
    // roles ['admin', 'super-admin']
    if (!roles.includes((req as any).admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para realizar esta acción'
      });
    }
    next();
  };
};
