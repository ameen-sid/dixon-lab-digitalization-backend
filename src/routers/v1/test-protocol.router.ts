import express from 'express';
import { TestProtocolFactory } from '../../factories/test-protocol.factory';
import { createTestProtocolSchema, updateTestProtocolSchema, testProtocolQuerySchema, testProtocolIdParamSchema } from '../../validators/test-protocol.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';

const testProtocolRouter = express.Router();

const testProtocolController = TestProtocolFactory.getTestProtocolController();

testProtocolRouter.post(
	'/',
	validateRequestBody(createTestProtocolSchema),
	asyncHandler(testProtocolController.addTestProtocol)
);

testProtocolRouter.get(
	'/',
	validateQueryParams(testProtocolQuerySchema),
	asyncHandler(testProtocolController.getTestProtocols)
);

testProtocolRouter.patch(
	'/:id',
	validateRequestParams(testProtocolIdParamSchema),
	validateRequestBody(updateTestProtocolSchema),
	asyncHandler(testProtocolController.updateTestProtocol)
);

testProtocolRouter.delete(
	'/:id',
	validateRequestParams(testProtocolIdParamSchema),
	asyncHandler(testProtocolController.deleteTestProtocol)
);

export default testProtocolRouter;