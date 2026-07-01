import express from 'express';
import { TestRequestFactory } from '../../factories/test-request.factory';
import { asyncHandler } from '../../utils/helpers/async.handler';
import { upload, inspectionUpload, reportUpload } from '../../middlewares/upload.middleware';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { createTestRequestSchema, updateTestRequestSchema, testRequestQuerySchema, testRequestIdParamSchema } from '../../validators/test-request.validator';

const testRequestRouter = express.Router();

const testRequestController = TestRequestFactory.getTestRequestController();

testRequestRouter.post(
	'/',
	upload.array('files'),
	(req, res, next) => {
		if ((req as any).user?.id) {
			req.body.requesterId = (req as any).user.id;
		}
		next();
	},
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

testRequestRouter.post(
	'/:id/sample-inspections',
	validateRequestParams(testRequestIdParamSchema),
	inspectionUpload.array('images'),
	asyncHandler(testRequestController.saveSampleInspection)
);

testRequestRouter.post(
	'/:id/sample-reports',
	validateRequestParams(testRequestIdParamSchema),
	reportUpload.any(),
	asyncHandler(testRequestController.saveSampleInspection)
);

testRequestRouter.post(
	'/:id/test-plans',
	validateRequestParams(testRequestIdParamSchema),
	asyncHandler(testRequestController.saveSampleTestPlan)
);

testRequestRouter.get(
	'/:id/test-plans',
	validateRequestParams(testRequestIdParamSchema),
	asyncHandler(testRequestController.getSampleTestPlans)
);

testRequestRouter.delete(
	'/:id/test-plans/:planId',
	validateRequestParams(testRequestIdParamSchema),
	asyncHandler(testRequestController.deleteSampleTestPlan)
);

testRequestRouter.get(
	'/:id/test-plans/:planId/tear-down-report',
	validateRequestParams(testRequestIdParamSchema),
	asyncHandler(testRequestController.downloadTearDownReport)
);

export default testRequestRouter;