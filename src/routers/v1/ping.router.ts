import express from 'express';
import { pingHandler } from '../../controllers/ping.controller';
import { validateRequestBody } from '../../validators';
import { pingSchema } from '../../validators/ping.validator';
import { asyncHandler } from '../../utils/helpers/async.handler';

const pingRouter = express.Router();

pingRouter.get('/', validateRequestBody(pingSchema), asyncHandler(pingHandler));

pingRouter.get('/health', (req, res) => {
	res.status(200).send('OK');
});

export default pingRouter;