import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { IProductPartService } from '../services/product-part.service';
import { SystemLogFactory } from '../factories/system-log.factory';

export class ProductPartController {

	private productPartService: IProductPartService;
	constructor(productPartService: IProductPartService) {
		this.productPartService = productPartService;
	}

	addProductPart = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Product Part', { body: req.body });
		const newProductPart = await this.productPartService.addProductPart(req.body.name, req.body.partNo);
		logger.info('Product Part Created Successfully', { newProductPart });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'CREATE',
				entity: 'ProductPart',
				entityId: String(newProductPart.id),
				details: JSON.stringify({ name: newProductPart.name, partNo: newProductPart.partNo }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for ProductPart creation', logErr);
		}

		res.status(201).json({
			success: true,
			message: 'Product Part Created Successfully',
			data: newProductPart
		});
	}

	getProductParts = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Product Parts', { query: req.query });
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

		const productParts = await this.productPartService.getProductParts(where, sortBy, sortOrder, skip, limit);
		logger.info('Fetched Product Parts Successfully', { productParts });
		res.status(200).json({
			success: true,
			message: 'Fetched Product Parts Successfully',
			data: productParts
		});
	}

	updateProductPart = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Updating Product Part', { body: req.body, id: req.params.id });

		let oldPart: any = null;
		try {
			const items = await this.productPartService.getProductParts({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldPart = { name: items[0].name, partNo: items[0].partNo };
			}
		} catch (e) {
			logger.warn('Failed to fetch product part before update', e);
		}

		const updateProductPart = await this.productPartService.updateProductPart(Number(req.params.id), req.body.name, req.body.partNo);
		logger.info('Updated Product Part Successfully', { updateProductPart });

		if (updateProductPart) {
			try {
				await SystemLogFactory.getSystemLogService().createLog({
					action: 'UPDATE',
					entity: 'ProductPart',
					entityId: String(updateProductPart.id),
					details: JSON.stringify({
						old: oldPart || {},
						new: { name: updateProductPart.name, partNo: updateProductPart.partNo }
					}),
					performedBy: (req as any).user?.username || 'Unknown'
				});
			} catch (logErr) {
				logger.error('Failed to create system log for ProductPart update', logErr);
			}
		}

		res.status(200).json({
			success: true,
			message: 'Updated Product Part Successfully',
			data: updateProductPart
		});
	}

	deleteProductPart = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Product Part', { id: req.params.id });

		let oldName = '';
		try {
			const items = await this.productPartService.getProductParts({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldName = items[0].name || items[0].partNo || '';
			}
		} catch (e) {
			logger.warn('Failed to fetch product part before delete', e);
		}

		const deleteProductPart = await this.productPartService.deleteProductPart(Number(req.params.id));
		logger.info('Deleted Product Part Successfully', { deleteProductPart });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'DELETE',
				entity: 'ProductPart',
				entityId: String(req.params.id),
				details: JSON.stringify({ name: oldName, success: deleteProductPart }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for ProductPart deletion', logErr);
		}

		res.status(200).json({
			success: true,
			message: 'Deleted Product Part Successfully',
			data: deleteProductPart
		});
	}
}