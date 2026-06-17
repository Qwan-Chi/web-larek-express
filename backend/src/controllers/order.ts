/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/BadRequestError';

export const createOrder = (req: Request, res: Response, next: NextFunction) => {
  const { items, total }: { items: string[]; total: number } = req.body;

  Product.find({ _id: { $in: items } })
    .then((products) => {
      if (products.length !== items.length) {
        throw new BadRequestError('Один или несколько товаров не найдены');
      }

      const hasPriceless = products.some((p) => p.price === null);
      if (hasPriceless) {
        throw new BadRequestError('Один или несколько товаров недоступны для продажи');
      }

      const expectedTotal = products.reduce((sum, p) => sum + (p.price || 0), 0);
      if (expectedTotal !== total) {
        throw new BadRequestError('Сумма заказа не совпадает');
      }

      const id = faker.string.uuid();

      res.json({ id, total });
    })
    .catch(next);
};
