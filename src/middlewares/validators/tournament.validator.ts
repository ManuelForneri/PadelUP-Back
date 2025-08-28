import { check, body, param } from 'express-validator/check';
import { Request, Response, NextFunction } from 'express';

export const validateCreateTournament = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del torneo es requerido')
    .isLength({ min: 5, max: 100 })
    .withMessage('El nombre debe tener entre 5 y 100 caracteres'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isLength({ min: 2, max: 50 })
    .withMessage('La categoría debe tener entre 2 y 50 caracteres'),

  body('isMixed')
    .isBoolean()
    .withMessage('Debe especificar si el torneo es mixto o no'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('La sede del torneo es requerida')
    .isLength({ min: 5, max: 200 })
    .withMessage('La sede debe tener entre 5 y 200 caracteres'),

  body('startDate')
    .notEmpty()
    .withMessage('La fecha de inicio es requerida')
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value: string, { req }) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        throw new Error('La fecha de inicio no puede ser en el pasado');
      }
      
      return true;
    }),

  body('endDate')
    .notEmpty()
    .withMessage('La fecha de fin es requerida')
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value: string, { req }) => {
      if (!req.body.startDate) return true;
      
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      
      if (endDate <= startDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      
      return true;
    }),

  body('registrationDeadline')
    .notEmpty()
    .withMessage('La fecha límite de inscripción es requerida')
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value: string, { req }) => {
      if (!req.body.startDate) return true;
      
      const registrationDeadline = new Date(value);
      const startDate = new Date(req.body.startDate);
      
      if (registrationDeadline >= startDate) {
        throw new Error('La fecha límite de inscripción debe ser anterior a la fecha de inicio');
      }
      
      return true;
    }),

  body('registrationFee')
    .notEmpty()
    .withMessage('El valor de la inscripción es requerido')
    .isNumeric()
    .withMessage('El valor de la inscripción debe ser un número')
    .isFloat({ min: 0 })
    .withMessage('El valor de la inscripción no puede ser negativo'),
];

export const validateTournamentId = [
  param('id')
    .isMongoId()
    .withMessage('ID de torneo inválido'),
];

export const validateUpdateTournament = [
  param('id')
    .isMongoId()
    .withMessage('ID de torneo inválido'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('El nombre debe tener entre 5 y 100 caracteres'),

  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La categoría debe tener entre 2 y 50 caracteres'),

  body('isMixed')
    .optional()
    .isBoolean()
    .withMessage('Debe ser un valor booleano'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('La sede debe tener entre 5 y 200 caracteres'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido'),

  body('registrationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido'),

  body('registrationFee')
    .optional()
    .isNumeric()
    .withMessage('El valor de la inscripción debe ser un número')
    .isFloat({ min: 0 })
    .withMessage('El valor de la inscripción no puede ser negativo'),
];

export const validateImageUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido. Solo se permiten imágenes JPG, JPEG o PNG',
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'La imagen es demasiado grande. El tamaño máximo permitido es 5MB',
    });
  }

  next();
};
