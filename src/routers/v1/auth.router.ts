import express from 'express';
import { AuthFactory } from '../../factories/auth.factory';
import { loginSchema } from '../../validators/auth.validator';
import { validateRequestBody } from '../../validators';

const authRouter = express.Router();

const authController = AuthFactory.getAuthController();

authRouter.post(
	'/login',
	validateRequestBody(loginSchema),
	authController.login
);

authRouter.post(
	'/logout',
	authController.logout
);

export default authRouter;