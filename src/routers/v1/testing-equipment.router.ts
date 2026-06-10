import express from 'express';
import { TestingEquipmentFactory } from '../../factories/testing-equipment.factory';
import { createTestingEquipmentSchema, updateTestingEquipmentSchema, testingEquipmentQuerySchema, testingEquipmentIdParamSchema } from '../../validators/testing-equipment.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';

const testingEquipmentRouter = express.Router();

const testingEquipmentController = TestingEquipmentFactory.getTestingEquipmentController();

testingEquipmentRouter.post(
	'/',
	validateRequestBody(createTestingEquipmentSchema),
	asyncHandler(testingEquipmentController.addTestingEquipment)
);

testingEquipmentRouter.get(
	'/',
	validateQueryParams(testingEquipmentQuerySchema),
	asyncHandler(testingEquipmentController.getTestingEquipments)
);

testingEquipmentRouter.get(
	'/weekly-analytics',
	asyncHandler(testingEquipmentController.getWeeklyAnalytics)
);

testingEquipmentRouter.patch(
	'/:id',
	validateRequestParams(testingEquipmentIdParamSchema),
	validateRequestBody(updateTestingEquipmentSchema),
	asyncHandler(testingEquipmentController.updateTestingEquipment)
);

testingEquipmentRouter.delete(
	'/:id',
	validateRequestParams(testingEquipmentIdParamSchema),
	asyncHandler(testingEquipmentController.deleteTestingEquipment)
);

testingEquipmentRouter.post(
	'/reserve',
	asyncHandler(testingEquipmentController.reserveEquipment)
);

testingEquipmentRouter.post(
	'/release',
	asyncHandler(testingEquipmentController.releaseEquipment)
);

export default testingEquipmentRouter;