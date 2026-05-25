import { SupplierCustomer } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface ISupplierCustomerRepository {
	addSupplierCustomer(name: string): Promise<SupplierCustomer>;
	getSupplierCustomers(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<SupplierCustomer[]>;
	updateSupplierCustomer(id: number, name: string): Promise<SupplierCustomer | null>;
	deleteSupplierCustomer(id: number): Promise<Boolean>;
}

export class SupplierCustomerRepository implements ISupplierCustomerRepository {
	async addSupplierCustomer(name: string): Promise<SupplierCustomer> {
		return await prisma.supplierCustomer.create({ data: { name } });
	}

	async getSupplierCustomers(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<SupplierCustomer[]> {
		return await prisma.supplierCustomer.findMany({
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit
		});
	}

	async updateSupplierCustomer(id: number, name: string): Promise<SupplierCustomer | null> {
		return await prisma.supplierCustomer.update({ where: { id }, data: { name } });
	}

	async deleteSupplierCustomer(id: number): Promise<Boolean> {
		return await prisma.productPart.delete({ where: { id } }) ? true : false;
	}
}