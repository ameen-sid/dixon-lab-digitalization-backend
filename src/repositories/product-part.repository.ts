import { ProductPart } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface IProductPartRepository {
	addProductPart(name: string, partNo?: string): Promise<ProductPart>;
	getProductParts(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<ProductPart[]>;
	updateProductPart(id: number, name?: string, partNo?: string): Promise<ProductPart | null>;
	deleteProductPart(id: number): Promise<Boolean>;
}

export class ProductPartRepository implements IProductPartRepository {
	async addProductPart(name: string, partNo?: string): Promise<ProductPart> {
		return await prisma.productPart.create({ data: { name, partNo } });
	}

	async getProductParts(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<ProductPart[]> {
		return await prisma.productPart.findMany({
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit
		});
	}

	async updateProductPart(id: number, name?: string, partNo?: string): Promise<ProductPart | null> {
		return await prisma.productPart.update({ where: { id }, data: { name, partNo } });
	}

	async deleteProductPart(id: number): Promise<Boolean> {
		return await prisma.productPart.delete({ where: { id } }) ? true : false;
	}
}