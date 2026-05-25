import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ISupplierCustomerService } from '../services/supplier-customer.service';

export class SupplierCustomerController {

	private supplierCustomerService: ISupplierCustomerService;
	constructor(supplierCustomerService: ISupplierCustomerService) {
		this.supplierCustomerService = supplierCustomerService;
	}

	addSupplierCustomer = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Supplier Customer', { body: req.body });
		const newSupplierCustomer = await this.supplierCustomerService.addSupplierCustomer(req.body.name);
		logger.info('Supplier Customer Created Successfully', { newSupplierCustomer });
		res.status(201).json({
			success: true,
			message: 'Supplier Customer Created Successfully',
			data: newSupplierCustomer
		});
	}

	getSupplierCustomers = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Supplier Customers', { query: req.query });
		const page = Math.max(1, parseInt(req.query.page as string || '1'));
		const limit = Math.max(1, parseInt(req.query.limit as string || '10'));
		const search = (req.query.search as string || '').trim();
		const sortBy = (req.query.sortBy as string || 'createdAt');
		const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

		const skip = (page - 1) * limit;
		const where: any = {};
		if (search) {
			where.name = { contains: search };
		}

		const supplierCustomers = await this.supplierCustomerService.getSupplierCustomers(where, sortBy, sortOrder, skip, limit);
		logger.info('Fetched Supplier Customers Successfully', { supplierCustomers });
		res.status(200).json({
			success: true,
			message: 'Fetched Supplier Customers Successfully',
			data: supplierCustomers
		});
	}

	updateSupplierCustomer = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Updating Supplier Customer', { body: req.body, id: req.params.id });
		const updateSupplierCustomer = await this.supplierCustomerService.updateSupplierCustomer(Number(req.params.id), req.body.name);
		logger.info('Updated Supplier Customer Successfully', { updateSupplierCustomer });
		res.status(200).json({
			success: true,
			message: 'Updated Supplier Customer Successfully',
			data: updateSupplierCustomer
		});
	}

	deleteSupplierCustomer = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Supplier Customer', { id: req.params.id });
		const deleteSupplierCustomer = await this.supplierCustomerService.deleteSupplierCustomer(Number(req.params.id));
		logger.info('Deleted Supplier Customer Successfully', { deleteSupplierCustomer });
		res.status(200).json({
			success: true,
			message: 'Deleted Supplier Customer Successfully',
			data: deleteSupplierCustomer
		});
	}
}