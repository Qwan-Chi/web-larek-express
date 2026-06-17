import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
} from '../controllers/auth';
import auth from '../middlewares/auth';

const router = Router();

const authBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerBodySchema = authBodySchema.keys({
  name: Joi.string().min(2).max(30).optional(),
});

router.post('/register', celebrate({ [Segments.BODY]: registerBodySchema }), register);
router.post('/login', celebrate({ [Segments.BODY]: authBodySchema }), login);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
