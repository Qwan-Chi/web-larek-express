/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/BadRequestError';
import config from '../config';

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    next(new BadRequestError('Файл не загружен'));
    return;
  }

  const fileName = `/${config.uploadPath}/${req.file.filename}`;
  const originalName = req.file.originalname;

  res.json({ fileName, originalName });
};
