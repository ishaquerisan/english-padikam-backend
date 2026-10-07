import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { ValidationError, UniqueConstraintError, DatabaseError } from 'sequelize';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('🔥 Global Exception Handler:', err);

  // Sequelize Unique Constraint Error
  if (err instanceof UniqueConstraintError) {
    const messages = err.errors.map((e) => e.message || `${e.path} must be unique`);
    ApiResponse.error(res, 'A record with this information already exists', 409, messages);
    return;
  }

  // Sequelize General Validation Error
  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message);
    ApiResponse.error(res, 'Database validation error', 422, messages);
    return;
  }

  // Sequelize Database Error
  if (err instanceof DatabaseError) {
    ApiResponse.error(res, 'Database operation error', 500, [err.message]);
    return;
  }

  // General Error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An internal server error occurred';
  ApiResponse.error(res, message, statusCode, [message]);
};
