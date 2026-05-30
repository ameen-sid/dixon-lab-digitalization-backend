import express from 'express';
import { TestRequestFactory } from '../../factories/test-request.factory';
import { asyncHandler } from '../../utils/helpers/async.handler';
import { upload } from '../../middlewares/upload.middleware';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { createTestRequestSchema, updateTestRequestSchema, testRequestQuerySchema, testRequestIdParamSchema } from '../../validators/test-request.validator';

const testRequestRouter = express.Router();

const testRequestController = TestRequestFactory.getTestRequestController();

testRequestRouter.post(
	'/',
	upload.array('files'),
	validateRequestBody(createTestRequestSchema),
	asyncHandler(testRequestController.addTestRequest)
);

testRequestRouter.get(
	'/',
	validateQueryParams(testRequestQuerySchema),
	asyncHandler(testRequestController.getTestRequests)
);

testRequestRouter.get(
	'/:id',
	validateRequestParams(testRequestIdParamSchema),
	asyncHandler(testRequestController.getTestRequestById)
);

testRequestRouter.patch(
	'/:id',
	validateRequestParams(testRequestIdParamSchema),
	validateRequestBody(updateTestRequestSchema),
	asyncHandler(testRequestController.updateTestRequestStatus)
);

export default testRequestRouter;