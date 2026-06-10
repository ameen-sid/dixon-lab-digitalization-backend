import { Router } from 'express';
import { NablStationAvailabilityFactory } from '../../factories/nabl-station-availability.factory';
import { asyncHandler } from '../../utils/helpers/async.handler';

const nablStationAvailabilityRouter = Router();
const controller = NablStationAvailabilityFactory.getController();

nablStationAvailabilityRouter.get(
	'/',
	asyncHandler(controller.getAllPlatforms)
);

nablStationAvailabilityRouter.get(
	'/weekly-analytics',
	asyncHandler(controller.getWeeklyAnalytics)
);

nablStationAvailabilityRouter.post(
	'/toggle',
	asyncHandler(controller.togglePlatform)
);

nablStationAvailabilityRouter.post(
	'/reserve',
	asyncHandler(controller.reservePlatforms)
);

nablStationAvailabilityRouter.post(
	'/release',
	asyncHandler(controller.releasePlatforms)
);

export default nablStationAvailabilityRouter;