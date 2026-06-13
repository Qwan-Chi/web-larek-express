/* eslint-disable import/no-unresolved */
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Request } from 'express';
import config from '../config';
import BadRequestError from '../errors/BadRequestError';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', config.uploadPathTemp),
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${uuidv4()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedTypes = [
    'image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml',
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new BadRequestError('Недопустимый тип файла'));
    return;
  }
  cb(null, true);
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
