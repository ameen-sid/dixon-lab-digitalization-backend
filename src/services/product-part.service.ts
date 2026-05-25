import { ProductPart } from '@prisma/client';
import { IProductPartRepository } from '../repositories/product-part.repository';
import { BadRequestError } from '../utils/errors/app.error';

export interface IProductPartService {
	addProductPart(name: string, partNo?: string): Promise<ProductPart>;
	getProductParts(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<ProductPart[]>;
	updateProductPart(id: number, name?: string, partNo?: string): Promise<ProductPart | null>;
	deleteProductPart(id: number): Promise<Boolean>;
}

export class ProductPartService implements IProductPartService {

	private productPartService: IProductPartRepository;
	constructor(productPartService: IProductPartRepository) {
		this.productPartService = productPartService;
	}

	async addProductPart(name: string, partNo?: string): Promise<ProductPart> {
		if (!name) throw new BadRequestError('Product part name is required');
		return await this.productPartService.addProductPart(name, partNo);
	}

	async getProductParts(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<ProductPart[]> {
		return await this.productPartService.getProductParts(where, sortBy, sortOrder, skip, limit);
	}

	async updateProductPart(id: number, name?: string, partNo?: string): Promise<ProductPart | null> {
		if (name !== undefined && !name.trim()) throw new BadRequestError('Product part name cannot be empty');
		return await this.productPartService.updateProductPart(id, name, partNo);
	}

	async deleteProductPart(id: number): Promise<Boolean> {
		return await this.productPartService.deleteProductPart(id);
	}
}