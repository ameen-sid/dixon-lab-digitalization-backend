import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { IProductPartService } from '../services/product-part.service';

export class ProductPartController {

	private productPartService: IProductPartService;
	constructor(productPartService: IProductPartService) {
		this.productPartService = productPartService;
	}

	addProductPart = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Product Part', { body: req.body });
		const newProductPart = await this.productPartService.addProductPart(req.body.name, req.body.partNo);
		logger.info('Product Part Created Successfully', { newProductPart });
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
		const updateProductPart = await this.productPartService.updateProductPart(Number(req.params.id), req.body.name, req.body.partNo);
		logger.info('Updated Product Part Successfully', { updateProductPart });
		res.status(200).json({
			success: true,
			message: 'Updated Product Part Successfully',
			data: updateProductPart
		});
	}

	deleteProductPart = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Product Part', { id: req.params.id });
		const deleteProductPart = await this.productPartService.deleteProductPart(Number(req.params.id));
		logger.info('Deleted Product Part Successfully', { deleteProductPart });
		res.status(200).json({
			success: true,
			message: 'Deleted Product Part Successfully',
			data: deleteProductPart
		});
	}
}