import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator/check";

interface ValidationErrorResponse {
  field: string;
  message: string;
}

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorResponse: ValidationErrorResponse[] = errors
      .array()
      .map((err: ValidationError) => ({
        field: err.param,
        message: err.msg,
      }));

    return res.status(400).json({
      success: false,
      errors: errorResponse,
    });
  }
  next();
};
