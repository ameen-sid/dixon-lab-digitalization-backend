import express from 'express';
import { ReliabilityChecksheetFactory } from '../../factories/reliability-checksheet.factory';
import { asyncHandler } from '../../utils/helpers/async.handler';

const reliabilityChecksheetRouter = express.Router();

const controller = ReliabilityChecksheetFactory.getReliabilityChecksheetController();

reliabilityChecksheetRouter.post(
	'/upsert',
	asyncHandler(controller.upsertEntry)
);

reliabilityChecksheetRouter.get(
	'/:planKey',
	asyncHandler(controller.getEntriesByPlan)
);

export default reliabilityChecksheetRouter;