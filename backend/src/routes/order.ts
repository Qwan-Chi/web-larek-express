import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import { createOrder } from '../controllers/order';

const router = Router();

const orderBodySchema = Joi.object({
  payment: Joi.string().valid('card', 'online').required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  total: Joi.number().required(),
  items: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

router.post('/', celebrate({ [Segments.BODY]: orderBodySchema }), createOrder);

export default router;
