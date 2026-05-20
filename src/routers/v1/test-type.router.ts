import express from 'express';
import { TestTypeFactory } from '../../factories/test-type.factory';
import { createTestTypeSchema, updateTestTypeSchema, testTypeQuerySchema, testTypeIdParamSchema } from '../../validators/test-type.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';

const testTypeRouter = express.Router();

const testTypeController = TestTypeFactory.getTestTypeController();

testTypeRouter.post(
	'/',
	validateRequestBody(createTestTypeSchema),
	asyncHandler(testTypeController.addTestType)
);

testTypeRouter.get(
	'/',
	validateQueryParams(testTypeQuerySchema),
	asyncHandler(testTypeController.getTestTypes)
);

testTypeRouter.patch(
	'/:id',
	validateRequestParams(testTypeIdParamSchema),
	validateRequestBody(updateTestTypeSchema),
	asyncHandler(testTypeController.updateTestType)
);

testTypeRouter.delete(
	'/:id',
	validateRequestParams(testTypeIdParamSchema),
	asyncHandler(testTypeController.deleteTestType)
);

export default testTypeRouter;