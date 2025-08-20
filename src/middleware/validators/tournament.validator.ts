import { check, ValidationChain, param } from "express-validator/check";
import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";

// Helper function to validate dates
const isFutureDate = (value: string) => {
  const date = new Date(value);
  return date > new Date();
};

// Type for the request with body
interface TournamentRequest extends Request {
  body: {
    name: string;
    category: "Principiante" | "Intermedio" | "Avanzado" | "Profesional";
    isMixed: boolean;
    location: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    posterUrl?: string;
    registrationFee: number;
  };
}

// Validate and sanitize input data for creating a tournament
export const validateCreateTournament: ValidationChain[] = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre del torneo es requerido")
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe tener entre 3 y 100 caracteres"),

  check("category")
    .isIn(["Principiante", "Intermedio", "Avanzado", "Profesional"] as const)
    .withMessage("Categoría no válida"),

  check("isMixed")
    .isBoolean()
    .withMessage("El campo isMixed debe ser un valor booleano"),

  check("location")
    .trim()
    .notEmpty()
    .withMessage("La ubicación es requerida")
    .isLength({ max: 200 })
    .withMessage("La ubicación no puede tener más de 200 caracteres"),

  check("startDate")
    .isISO8601()
    .withMessage("Fecha de inicio inválida")
    .custom((value: string) => {
      if (new Date(value) <= new Date()) {
        throw new Error("La fecha de inicio debe ser futura");
      }
      return true;
    }),

  check("endDate")
    .isISO8601()
    .withMessage("Fecha de finalización inválida")
    .custom((value: string, { req }) => {
      const startDate = (req as TournamentRequest).body.startDate;
      if (new Date(value) <= new Date(startDate)) {
        throw new Error(
          "La fecha de finalización debe ser posterior a la fecha de inicio"
        );
      }
      return true;
    }),

  check("registrationDeadline")
    .isISO8601()
    .withMessage("Fecha límite de registro inválida")
    .custom((value: string, { req }) => {
      const startDate = (req as TournamentRequest).body.startDate;
      if (new Date(value) >= new Date(startDate)) {
        throw new Error(
          "La fecha límite de registro debe ser anterior a la fecha de inicio"
        );
      }
      return true;
    }),

  check("posterUrl")
    .optional({ nullable: true })
    .isURL()
    .withMessage("La URL del póster no es válida"),

  check("registrationFee")
    .isNumeric()
    .withMessage("La cuota de inscripción debe ser un número")
    .isFloat({ min: 0 })
    .withMessage("La cuota de inscripción no puede ser negativa"),
];

// Validate and sanitize input data for updating a tournament
export const validateUpdateTournament: (
  | ValidationChain
  | ((req: Request, res: Response, next: NextFunction) => void)
)[] = [
  check("id").isMongoId().withMessage("ID de torneo no válido"),

  check("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe tener entre 3 y 100 caracteres"),

  check("category")
    .optional()
    .isIn(["Principiante", "Intermedio", "Avanzado", "Profesional"] as const)
    .withMessage("Categoría no válida"),

  check("isMixed")
    .optional()
    .isBoolean()
    .withMessage("El campo isMixed debe ser un valor booleano"),

  check("location")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("La ubicación no puede tener más de 200 caracteres"),

  check("startDate")
    .optional()
    .isISO8601()
    .withMessage("Fecha de inicio inválida"),

  check("endDate")
    .optional()
    .isISO8601()
    .withMessage("Fecha de finalización inválida"),

  check("registrationDeadline")
    .optional()
    .isISO8601()
    .withMessage("Fecha límite de registro inválida"),

  check("posterUrl")
    .optional()
    .isURL()
    .withMessage("La URL del póster no es válida"),

  check("registrationFee")
    .optional()
    .isNumeric()
    .withMessage("La cuota de inscripción debe ser un número")
    .isFloat({ min: 0 })
    .withMessage("La cuota de inscripción no puede ser negativa"),

  // Custom validator to check date consistency
  (req: Request, res: any, next: NextFunction) => {
    const { startDate, endDate, registrationDeadline } = req.body as {
      startDate?: string;
      endDate?: string;
      registrationDeadline?: string;
    };

    const errors: { msg: string }[] = [];

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      errors.push({
        msg: "La fecha de inicio debe ser anterior a la fecha de finalización",
      });
    }

    if (
      startDate &&
      registrationDeadline &&
      new Date(registrationDeadline) >= new Date(startDate)
    ) {
      errors.push({
        msg: "La fecha límite de registro debe ser anterior a la fecha de inicio",
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  },
];

// Validate tournament ID
export const validateTournamentId = [
  param('id')
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('ID de torneo no válido');
      }
      return true;
    })
    .withMessage('ID de torneo no válido')
];

// Validate tournament dates consistency
export const validateTournamentDates = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { startDate, endDate, registrationDeadline } = req.body;
  const errors: { msg: string }[] = [];

  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    errors.push({
      msg: 'La fecha de inicio debe ser anterior a la fecha de finalización',
    });
  }

  if (
    startDate &&
    registrationDeadline &&
    new Date(registrationDeadline) >= new Date(startDate)
  ) {
    errors.push({
      msg: 'La fecha límite de registro debe ser anterior a la fecha de inicio',
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
