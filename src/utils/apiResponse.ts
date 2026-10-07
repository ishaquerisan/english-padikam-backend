import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  meta?: Record<string, any>;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200, meta?: Record<string, any>) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    });
  }

  static error(res: Response, message = 'An error occurred', statusCode = 400, errors: any[] = []) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : [message],
    });
  }
}
