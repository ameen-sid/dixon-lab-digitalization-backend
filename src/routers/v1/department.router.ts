import express from 'express';
import { DepartmentFactory } from '../../factories/department.factory';
import { createDepartmentSchema, updateDepartmentSchema, departmentQuerySchema, departmentIdParamSchema } from '../../validators/department.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';

const departmentRouter = express.Router();

const departmentController = DepartmentFactory.getDepartmentController();

departmentRouter.post(
	'/',
	validateRequestBody(createDepartmentSchema),
	departmentController.addDepartment
);

departmentRouter.get(
	'/',
	validateQueryParams(departmentQuerySchema),
	departmentController.getDepartments
);

departmentRouter.patch(
	'/:id',
	validateRequestParams(departmentIdParamSchema),
	validateRequestBody(updateDepartmentSchema),
	departmentController.updateDepartment
);

departmentRouter.delete(
	'/:id',
	validateRequestParams(departmentIdParamSchema),
	departmentController.deleteDepartment
);

export default departmentRouter;