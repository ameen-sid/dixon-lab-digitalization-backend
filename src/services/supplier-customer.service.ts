import { SupplierCustomer } from '@prisma/client';
import { ISupplierCustomerRepository } from '../repositories/supplier-customer.repository';
import { BadRequestError } from '../utils/errors/app.error';

export interface ISupplierCustomerService {
	addSupplierCustomer(name: string): Promise<SupplierCustomer>;
	getSupplierCustomers(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<SupplierCustomer[]>;
	updateSupplierCustomer(id: number, name: string): Promise<SupplierCustomer | null>;
	deleteSupplierCustomer(id: number): Promise<Boolean>;
}

export class SupplierCustomerService implements ISupplierCustomerService {

	private supplierCustomerService: ISupplierCustomerRepository;
	constructor(supplierCustomerService: ISupplierCustomerRepository) {
		this.supplierCustomerService = supplierCustomerService;
	}

	async addSupplierCustomer(name: string): Promise<SupplierCustomer> {
		if (!name) throw new BadRequestError('Supplier customer name is required');
		return await this.supplierCustomerService.addSupplierCustomer(name);
	}

	async getSupplierCustomers(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<SupplierCustomer[]> {
		return await this.supplierCustomerService.getSupplierCustomers(where, sortBy, sortOrder, skip, limit);
	}

	async updateSupplierCustomer(id: number, name: string): Promise<SupplierCustomer | null> {
		if (name !== undefined && !name.trim()) throw new BadRequestError('Supplier customer name cannot be empty');
		return await this.supplierCustomerService.updateSupplierCustomer(id, name);
	}

	async deleteSupplierCustomer(id: number): Promise<Boolean> {
		return await this.supplierCustomerService.deleteSupplierCustomer(id);
	}
}