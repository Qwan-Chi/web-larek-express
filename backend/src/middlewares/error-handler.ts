import { Request, Response, NextFunction } from 'express';

interface IError {
  statusCode: number;
  message: string;
  name: string;
  code?: number;
}

const errorHandler = (
  err: IError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'На сервере произошла ошибка';

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    statusCode = 400;
    message = err.message;
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    message = 'Запись с таким полем уже существует';
  }

  res.status(statusCode).json({ message });
};

export default errorHandler;
