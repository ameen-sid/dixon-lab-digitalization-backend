import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ISupplierCustomerService } from '../services/supplier-customer.service';
import { SystemLogFactory } from '../factories/system-log.factory';

export class SupplierCustomerController {

	private supplierCustomerService: ISupplierCustomerService;
	constructor(supplierCustomerService: ISupplierCustomerService) {
		this.supplierCustomerService = supplierCustomerService;
	}

	addSupplierCustomer = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Supplier Customer', { body: req.body });
		const newSupplierCustomer = await this.supplierCustomerService.addSupplierCustomer(req.body.name);
		logger.info('Supplier Customer Created Successfully', { newSupplierCustomer });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'CREATE',
				entity: 'SupplierCustomer',
				entityId: String(newSupplierCustomer.id),
				details: JSON.stringify({ name: newSupplierCustomer.name }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for SupplierCustomer creation', logErr);
		}

		res.status(201).json({
			success: true,
			message: 'Supplier Customer Created Successfully',
			data: newSupplierCustomer
		});
	}

	getSupplierCustomers = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Supplier Customers', { query: req.query });
		const page = Math.max(1, parseInt(req.query.page as string || '1'));
		const limit = Math.max(1, parseInt(req.query.limit as string || '1000'));
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

		let oldName = '';
		try {
			const items = await this.supplierCustomerService.getSupplierCustomers({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldName = items[0].name;
			}
		} catch (e) {
			logger.warn('Failed to fetch supplier customer before update', e);
		}

		const updateSupplierCustomer = await this.supplierCustomerService.updateSupplierCustomer(Number(req.params.id), req.body.name);
		logger.info('Updated Supplier Customer Successfully', { updateSupplierCustomer });

		if (updateSupplierCustomer) {
			try {
				await SystemLogFactory.getSystemLogService().createLog({
					action: 'UPDATE',
					entity: 'SupplierCustomer',
					entityId: String(updateSupplierCustomer.id),
					details: JSON.stringify({
						old: { name: oldName },
						new: { name: updateSupplierCustomer.name }
					}),
					performedBy: (req as any).user?.username || 'Unknown'
				});
			} catch (logErr) {
				logger.error('Failed to create system log for SupplierCustomer update', logErr);
			}
		}

		res.status(200).json({
			success: true,
			message: 'Updated Supplier Customer Successfully',
			data: updateSupplierCustomer
		});
	}

	deleteSupplierCustomer = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Supplier Customer', { id: req.params.id });

		let oldName = '';
		try {
			const items = await this.supplierCustomerService.getSupplierCustomers({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldName = items[0].name;
			}
		} catch (e) {
			logger.warn('Failed to fetch supplier customer before delete', e);
		}

		const deleteSupplierCustomer = await this.supplierCustomerService.deleteSupplierCustomer(Number(req.params.id));
		logger.info('Deleted Supplier Customer Successfully', { deleteSupplierCustomer });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'DELETE',
				entity: 'SupplierCustomer',
				entityId: String(req.params.id),
				details: JSON.stringify({ name: oldName, success: deleteSupplierCustomer }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for SupplierCustomer deletion', logErr);
		}

		res.status(200).json({
			success: true,
			message: 'Deleted Supplier Customer Successfully',
			data: deleteSupplierCustomer
		});
	}
}