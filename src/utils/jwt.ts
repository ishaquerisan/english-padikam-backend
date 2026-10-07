import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_english_learning_app_2026_malayalam_pro';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export interface TokenPayload {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
