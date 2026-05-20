import express from 'express';
import { TestTypeFactory } from '../../factories/test-type.factory';
import { createTestTypeSchema, updateTestTypeSchema, testTypeQuerySchema, testTypeIdParamSchema } from '../../validators/test-type.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';

const testTypeRouter = express.Router();

const testTypeController = TestTypeFactory.getTestTypeController();

testTypeRouter.post(
	'/',
	validateRequestBody(createTestTypeSchema),
	testTypeController.addTestType
);

testTypeRouter.get(
	'/',
	validateQueryParams(testTypeQuerySchema),
	testTypeController.getTestTypes
);

testTypeRouter.patch(
	'/:id',
	validateRequestParams(testTypeIdParamSchema),
	validateRequestBody(updateTestTypeSchema),
	testTypeController.updateTestType
);

testTypeRouter.delete(
	'/:id',
	validateRequestParams(testTypeIdParamSchema),
	testTypeController.deleteTestType
);

export default testTypeRouter;