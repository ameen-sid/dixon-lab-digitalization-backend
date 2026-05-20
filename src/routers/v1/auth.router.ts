import express from 'express';
import { AuthFactory } from '../../factories/auth.factory';
import { loginSchema } from '../../validators/auth.validator';
import { validateRequestBody } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';

const authRouter = express.Router();

const authController = AuthFactory.getAuthController();

authRouter.post(
	'/login',
	validateRequestBody(loginSchema),
	asyncHandler(authController.login)
);

authRouter.post(
	'/logout',
	asyncHandler(authController.logout)
);

export default authRouter;