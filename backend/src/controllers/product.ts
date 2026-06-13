import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';
import ConflictError from '../errors/ConflictError';
import config from '../config';

function moveFile(fileName: string): void {
  if (!fileName) return;
  const parts = fileName.split('/');
  const name = parts[parts.length - 1];
  const tempSrc = path.join(__dirname, '..', config.uploadPathTemp, name);
  const imagesDest = path.join(__dirname, '..', 'public', config.uploadPath, name);

  if (fs.existsSync(tempSrc)) {
    fs.copyFileSync(tempSrc, imagesDest);
    try {
      fs.unlinkSync(tempSrc);
    } catch {
      // ignore cleanup error
    }
  }
}

export const getProducts = (_req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => {
      res.json({ items: products, total: products.length });
    })
    .catch(next);
};

export const getProductById = (req: Request, res: Response, next: NextFunction) => {
  Product.findById(req.params.productId)
    .then((product) => {
      if (!product) {
        next(new NotFoundError('Товар не найден'));
        return;
      }
      res.json(product);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный ID товара'));
        return;
      }
      next(err);
    });
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;

  if (image && image.fileName) {
    moveFile(image.fileName);
  }

  Product.create({
    title, image, category, description, price,
  })
    .then((product) => res.status(201).json(product))
    .catch((err) => {
      if (err instanceof MongooseError.ValidationError) {
        next(new BadRequestError(err.message));
        return;
      }
      if (err instanceof Error && err.message.includes('E11000')) {
        next(new ConflictError('Товар с таким названием уже существует'));
        return;
      }
      next(err);
    });
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const { image } = req.body;

  if (image && image.fileName) {
    moveFile(image.fileName);
  }

  Product.findByIdAndUpdate(productId, req.body, { new: true, runValidators: true })
    .then((product) => {
      if (!product) {
        next(new NotFoundError('Товар не найден'));
        return;
      }
      res.json(product);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный ID товара'));
        return;
      }
      if (err instanceof MongooseError.ValidationError) {
        next(new BadRequestError(err.message));
        return;
      }
      if (err instanceof Error && err.message.includes('E11000')) {
        next(new ConflictError('Товар с таким названием уже существует'));
        return;
      }
      next(err);
    });
};

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  Product.findByIdAndDelete(req.params.productId)
    .then((product) => {
      if (!product) {
        next(new NotFoundError('Товар не найден'));
        return;
      }
      res.json(product);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный ID товара'));
        return;
      }
      next(err);
    });
};
