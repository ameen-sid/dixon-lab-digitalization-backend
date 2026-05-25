import express from 'express';
import { SupplierCustomerFactory } from '../../factories/supplier-customer.factory';
import { createSupplierCustomerSchema, updateSupplierCustomerSchema, supplierCustomerQuerySchema, supplierCustomerIdParamSchema } from '../../validators/supplier-customer.validator';
import { validateRequestBody, validateQueryParams, validateRequestParams } from '../../validators';
import { asyncHandler } from '../../utils/helpers/async.handler';

const supplierCustomerRouter = express.Router();

const supplierCustomerController = SupplierCustomerFactory.getSupplierCustomerController();

supplierCustomerRouter.post(
	'/',
	validateRequestBody(createSupplierCustomerSchema),
	asyncHandler(supplierCustomerController.addSupplierCustomer)
);

supplierCustomerRouter.get(
	'/',
	validateQueryParams(supplierCustomerQuerySchema),
	asyncHandler(supplierCustomerController.getSupplierCustomers)
);

supplierCustomerRouter.patch(
	'/:id',
	validateRequestParams(supplierCustomerIdParamSchema),
	validateRequestBody(updateSupplierCustomerSchema),
	asyncHandler(supplierCustomerController.updateSupplierCustomer)
);

supplierCustomerRouter.delete(
	'/:id',
	validateRequestParams(supplierCustomerIdParamSchema),
	asyncHandler(supplierCustomerController.deleteSupplierCustomer)
);

export default supplierCustomerRouter;