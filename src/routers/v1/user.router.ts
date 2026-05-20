import express from 'express';
import { UserFactory } from '../../factories/user.factory';
import { createUserSchema, updateUserSchema, userQuerySchema, userIdParamSchema } from '../../validators/user.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';

const userRouter = express.Router();

const userController = UserFactory.getUserController();

userRouter.post(
	'/',
	validateRequestBody(createUserSchema),
	asyncHandler(userController.createUser)
);

userRouter.get(
	'/',
	validateQueryParams(userQuerySchema),
	asyncHandler(userController.getUsers)
);

userRouter.patch(
	'/:id',
	validateRequestParams(userIdParamSchema),
	validateRequestBody(updateUserSchema),
	asyncHandler(userController.updateUser)
);

userRouter.delete(
	'/:id',
	validateRequestParams(userIdParamSchema),
	asyncHandler(userController.deleteUser)
);

export default userRouter;