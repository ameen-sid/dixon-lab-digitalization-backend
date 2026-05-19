import express from 'express';
import { UserFactory } from '../../factories/user.factory';
import { createUserSchema, updateUserSchema, userQuerySchema, userIdParamSchema } from '../../validators/user.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';

const userRouter = express.Router();

const userController = UserFactory.getUserController();

userRouter.post(
	'/',
	validateRequestBody(createUserSchema),
	userController.createUser
);

userRouter.get(
	'/',
	validateQueryParams(userQuerySchema),
	userController.getUsers
);

userRouter.patch(
	'/:id',
	validateRequestParams(userIdParamSchema),
	validateRequestBody(updateUserSchema),
	userController.updateUser
);

userRouter.delete(
	'/:id',
	validateRequestParams(userIdParamSchema),
	userController.deleteUser
);

export default userRouter;