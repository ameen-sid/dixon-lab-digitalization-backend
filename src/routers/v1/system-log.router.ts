import express from 'express';
import { SystemLogFactory } from '../../factories/system-log.factory';
import { systemLogQuerySchema } from '../../validators/system-log.validator';
import { validateQueryParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';
import { requireRole } from '../../middlewares/auth.middleware';

const systemLogRouter = express.Router();
const systemLogController = SystemLogFactory.getSystemLogController();

systemLogRouter.get(
	'/',
	requireRole(['Admin']),
	validateQueryParams(systemLogQuerySchema),
	asyncHandler(systemLogController.getLogs)
);

export default systemLogRouter;
