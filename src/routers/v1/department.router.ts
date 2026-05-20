import express from 'express';
import { DepartmentFactory } from '../../factories/department.factory';
import { createDepartmentSchema, updateDepartmentSchema, departmentQuerySchema, departmentIdParamSchema } from '../../validators/department.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';

const departmentRouter = express.Router();

const departmentController = DepartmentFactory.getDepartmentController();

departmentRouter.post(
	'/',
	validateRequestBody(createDepartmentSchema),
	asyncHandler(departmentController.addDepartment)
);

departmentRouter.get(
	'/',
	validateQueryParams(departmentQuerySchema),
	asyncHandler(departmentController.getDepartments)
);

departmentRouter.patch(
	'/:id',
	validateRequestParams(departmentIdParamSchema),
	validateRequestBody(updateDepartmentSchema),
	asyncHandler(departmentController.updateDepartment)
);

departmentRouter.delete(
	'/:id',
	validateRequestParams(departmentIdParamSchema),
	asyncHandler(departmentController.deleteDepartment)
);

export default departmentRouter;