import express from 'express';
import { CapaFactory } from '../../factories/capa.factory';
import { asyncHandler } from '../../utils/helpers/async.handler';
import { capaUpload } from '../../middlewares/upload.middleware';

const capaRouter = express.Router();
const capaController = CapaFactory.getCapaController();

const capaImageFields = capaUpload.fields([
	{ name: 'imageFile',               maxCount: 1 },
	{ name: 'beforeImprovementFile',   maxCount: 1 },
	{ name: 'afterImprovementFile',    maxCount: 1 },
	{ name: 'preventionFile',          maxCount: 1 },
]);

capaRouter.post('/', capaImageFields, asyncHandler(capaController.create));
capaRouter.get('/', asyncHandler(capaController.getAll));
capaRouter.get('/:id', asyncHandler(capaController.getById));
capaRouter.patch('/:id/status', asyncHandler(capaController.updateStatus));

export default capaRouter;