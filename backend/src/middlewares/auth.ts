import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import UnauthorizedError from '../errors/UnauthorizedError';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

const auth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Необходима авторизация'));
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { _id: string };
    req.user = { _id: payload._id };
    next();
  } catch {
    next(new UnauthorizedError('Необходима авторизация'));
  }
};

export default auth;
