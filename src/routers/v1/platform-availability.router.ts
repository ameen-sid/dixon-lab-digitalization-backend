import express from 'express';
import { PlatformAvailabilityFactory } from '../../factories/platform-availability.factory';
import { asyncHandler } from '../../utils/helpers/async.handler';

const platformAvailabilityRouter = express.Router();
const controller = PlatformAvailabilityFactory.getController();

platformAvailabilityRouter.get(
	'/',
	asyncHandler(controller.getAllPlatforms)
);

platformAvailabilityRouter.post(
	'/toggle',
	asyncHandler(controller.togglePlatform)
);

platformAvailabilityRouter.post(
	'/reserve',
	asyncHandler(controller.reservePlatforms)
);

platformAvailabilityRouter.post(
	'/release',
	asyncHandler(controller.releasePlatforms)
);

export default platformAvailabilityRouter;
