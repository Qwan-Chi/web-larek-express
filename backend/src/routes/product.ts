import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product';
import auth from '../middlewares/auth';

const router = Router();

const imageSchema = Joi.object({
  fileName: Joi.string().required(),
  originalName: Joi.string().required(),
});

const productBodySchema = Joi.object({
  title: Joi.string().min(2).max(30).required(),
  image: imageSchema.required(),
  category: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().allow(null).optional(),
});

const productIdSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
});

router.get('/', getProducts);
router.get('/:productId', celebrate({ [Segments.PARAMS]: productIdSchema }), getProductById);
router.post('/', auth, celebrate({ [Segments.BODY]: productBodySchema }), createProduct);
router.patch(
  '/:productId',
  auth,
  celebrate({
    [Segments.PARAMS]: productIdSchema,
    [Segments.BODY]: productBodySchema.fork(
      ['title', 'image', 'category'],
      (schema) => schema.optional(),
    ),
  }),
  updateProduct,
);
router.delete(
  '/:productId',
  auth,
  celebrate({ [Segments.PARAMS]: productIdSchema }),
  deleteProduct,
);

export default router;
