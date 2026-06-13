import { Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import ms from 'ms';
import { Error as MongooseError } from 'mongoose';
import User from '../models/user';
import BadRequestError from '../errors/BadRequestError';
import UnauthorizedError from '../errors/UnauthorizedError';
import NotFoundError from '../errors/NotFoundError';
import ConflictError from '../errors/ConflictError';
import config from '../config';
import { AuthRequest } from '../middlewares/auth';

interface TokenPayload {
  _id: string;
}

function signAccess(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.authAccessTokenExpiry,
  } as SignOptions);
}

function signRefresh(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.authRefreshTokenExpiry,
  } as SignOptions);
}

function setRefreshCookie(res: Response, token: string): void {
  const maxAgeMs = ms(config.authRefreshTokenExpiry as ms.StringValue);
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: maxAgeMs,
    path: '/',
  });
}

function clearRefreshCookie(res: Response): void {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 0,
    path: '/',
  });
}

function sendAuth(
  res: Response,
  userData: { email: string; name: string; _id: string },
): void {
  const accessToken = signAccess({ _id: userData._id });
  const refreshToken = signRefresh({ _id: userData._id });
  setRefreshCookie(res, refreshToken);
  res.json({
    user: { email: userData.email, name: userData.name },
    success: true,
    accessToken,
  });
}

export const register = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  User.create({ name, email, password })
    .then((user) => User.findById(user._id).select('+tokens').then((found) => {
      if (!found) {
        next(new NotFoundError('Пользователь не найден'));
        return;
      }
      const token = signRefresh({ _id: user._id });
      found.tokens.push({ token });
      found.save().then(() => {
        sendAuth(res, { email: user.email, name: user.name, _id: user._id.toString() });
      });
    }))
    .catch((err) => {
      if (err instanceof MongooseError.ValidationError) {
        next(new BadRequestError(err.message));
        return;
      }
      if (err instanceof Error && err.message.includes('E11000')) {
        next(new ConflictError('Пользователь с таким email уже существует'));
        return;
      }
      next(err);
    });
};

export const login = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password +tokens')
    .then((user) => {
      if (!user) {
        next(new UnauthorizedError('Неверный email или пароль'));
        return;
      }
      bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          next(new UnauthorizedError('Неверный email или пароль'));
          return;
        }
        const refreshToken = signRefresh({ _id: user._id });
        user.tokens.push({ token: refreshToken });
        user.save().then(() => {
          sendAuth(res, { email: user.email, name: user.name, _id: user._id.toString() });
        });
      });
    })
    .catch(next);
};

export const logout = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    clearRefreshCookie(res);
    res.json({ success: true });
    return;
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    clearRefreshCookie(res);
    res.json({ success: true });
    return;
  }

  User.findById(payload._id)
    .select('+tokens')
    .then((user) => {
      if (!user) {
        clearRefreshCookie(res);
        res.json({ success: true });
        return;
      }
      /* eslint-disable-next-line no-param-reassign */
      user.tokens = user.tokens.filter((t) => t.token !== token);
      user.save().then(() => {
        clearRefreshCookie(res);
        res.json({ success: true });
      });
    })
    .catch(next);
};

export const refreshAccessToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    next(new UnauthorizedError('Токен не предоставлен'));
    return;
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    next(new UnauthorizedError('Токен недействителен'));
    return;
  }

  User.findById(payload._id)
    .select('+tokens')
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
        return;
      }
      const hasToken = user.tokens.some((t) => t.token === token);
      if (!hasToken) {
        next(new UnauthorizedError('Токен недействителен'));
        return;
      }
      /* eslint-disable-next-line no-param-reassign */
      user.tokens = user.tokens.filter((t) => t.token !== token);
      const newAccess = signAccess({ _id: user._id });
      const newRefresh = signRefresh({ _id: user._id });
      user.tokens.push({ token: newRefresh });
      user.save().then(() => {
        setRefreshCookie(res, newRefresh);
        res.json({
          user: { email: user.email, name: user.name },
          success: true,
          accessToken: newAccess,
        });
      });
    })
    .catch(next);
};

export const getCurrentUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  User.findById(req.user!._id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
        return;
      }
      res.json({
        user: { email: user.email, name: user.name },
        success: true,
      });
    })
    .catch(next);
};
