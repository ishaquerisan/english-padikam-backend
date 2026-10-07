import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { ApiResponse } from '../utils/apiResponse';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    ApiResponse.error(res, 'Access denied. Administrator privileges required.', 403);
    return;
  }
  next();
};
