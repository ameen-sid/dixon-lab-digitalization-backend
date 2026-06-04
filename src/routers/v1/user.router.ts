import express from 'express';
import { UserFactory } from '../../factories/user.factory';
import { createUserSchema, updateUserSchema, userQuerySchema, userIdParamSchema } from '../../validators/user.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';
import { requireRole } from '../../middlewares/auth.middleware';

const userRouter = express.Router();

const userController = UserFactory.getUserController();

userRouter.post(
	'/',
	requireRole(['Admin', 'Lab Manager', 'Head']),
	validateRequestBody(createUserSchema),
	asyncHandler(userController.createUser)
);

userRouter.get(
	'/',
	requireRole(['Admin', 'Lab Manager', 'Head', 'Engineer', 'Inspector', 'Requester', 'CEO']),
	validateQueryParams(userQuerySchema),
	asyncHandler(userController.getUsers)
);

userRouter.patch(
	'/:id',
	requireRole(['Admin', 'Lab Manager', 'Head']),
	validateRequestParams(userIdParamSchema),
	validateRequestBody(updateUserSchema),
	asyncHandler(userController.updateUser)
);

userRouter.delete(
	'/:id',
	requireRole(['Admin', 'Lab Manager', 'Head']),
	validateRequestParams(userIdParamSchema),
	asyncHandler(userController.deleteUser)
);

export default userRouter;