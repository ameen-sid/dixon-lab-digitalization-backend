import express from 'express';
import { ProductPartFactory } from '../../factories/product-part.factory';
import { createProductPartSchema, updateProductPartSchema, productPartQuerySchema, productPartIdParamSchema } from '../../validators/product-part.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';

const productPartRouter = express.Router();

const productPartController = ProductPartFactory.getProductPartController();

productPartRouter.post(
	'/',
	validateRequestBody(createProductPartSchema),
	asyncHandler(productPartController.addProductPart)
);

productPartRouter.get(
	'/',
	validateQueryParams(productPartQuerySchema),
	asyncHandler(productPartController.getProductParts)
);

productPartRouter.patch(
	'/:id',
	validateRequestParams(productPartIdParamSchema),
	validateRequestBody(updateProductPartSchema),
	asyncHandler(productPartController.updateProductPart)
);

productPartRouter.delete(
	'/:id',
	validateRequestParams(productPartIdParamSchema),
	asyncHandler(productPartController.deleteProductPart)
);

export default productPartRouter;