import express from 'express';
import { DepartmentFactory } from '../../factories/department.factory';
import { createDepartmentSchema, updateDepartmentSchema, departmentQuerySchema, departmentIdParamSchema } from '../../validators/department.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';
import { requireRole } from '../../middlewares/auth.middleware';

const departmentRouter = express.Router();

const departmentController = DepartmentFactory.getDepartmentController();

departmentRouter.post(
	'/',
	requireRole(['Admin']),
	validateRequestBody(createDepartmentSchema),
	asyncHandler(departmentController.addDepartment)
);

departmentRouter.get(
	'/',
	requireRole(['Admin', 'Lab Manager', 'Head', 'Engineer', 'Inspector', 'Requester', 'CEO']),
	validateQueryParams(departmentQuerySchema),
	asyncHandler(departmentController.getDepartments)
);

departmentRouter.patch(
	'/:id',
	requireRole(['Admin']),
	validateRequestParams(departmentIdParamSchema),
	validateRequestBody(updateDepartmentSchema),
	asyncHandler(departmentController.updateDepartment)
);

departmentRouter.delete(
	'/:id',
	requireRole(['Admin']),
	validateRequestParams(departmentIdParamSchema),
	asyncHandler(departmentController.deleteDepartment)
);

export default departmentRouter;