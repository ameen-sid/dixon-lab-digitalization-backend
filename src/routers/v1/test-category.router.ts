import express from 'express';
import { TestCategoryFactory } from '../../factories/test-category.factory';
import { createTestCategorySchema, updateTestCategorySchema, testCategoryQuerySchema, testCategoryIdParamSchema } from '../../validators/test-category.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';

const testCategoryRouter = express.Router();

const testCategoryController = TestCategoryFactory.getTestCategoryController();

testCategoryRouter.post(
	'/',
	validateRequestBody(createTestCategorySchema),
	asyncHandler(testCategoryController.addTestCategory)
);

testCategoryRouter.get(
	'/',
	validateQueryParams(testCategoryQuerySchema),
	asyncHandler(testCategoryController.getTestCategories)
);

testCategoryRouter.patch(
	'/:id',
	validateRequestParams(testCategoryIdParamSchema),
	validateRequestBody(updateTestCategorySchema),
	asyncHandler(testCategoryController.updateTestCategory)
);

testCategoryRouter.delete(
	'/:id',
	validateRequestParams(testCategoryIdParamSchema),
	asyncHandler(testCategoryController.deleteTestCategory)
);

export default testCategoryRouter;