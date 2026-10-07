import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponse } from './utils/apiResponse';

dotenv.config();

const app = express();

// Security and compression middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  ApiResponse.success(
    res,
    {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Padikam (പഠിക്കാം) English Learning API',
      database: 'MySQL Sequelize',
    },
    'Server is healthy and operational'
  );
});

// Mount all API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global error handler
app.use(errorHandler);

export default app;
