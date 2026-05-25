import { SupplierCustomerRepository } from '../repositories/supplier-customer.repository';
import { SupplierCustomerService } from '../services/supplier-customer.service';
import { SupplierCustomerController } from '../controllers/supplier-customer.controller';

export class SupplierCustomerFactory {

	private static supplierCustomerRepository: SupplierCustomerRepository;
	private static supplierCustomerService: SupplierCustomerService;
	private static supplierCustomerController: SupplierCustomerController;

	static getSupplierCustomerRepository(): SupplierCustomerRepository {
		if (!this.supplierCustomerRepository) this.supplierCustomerRepository = new SupplierCustomerRepository();
		return this.supplierCustomerRepository;
	}

	static getSupplierCustomerService(): SupplierCustomerService {
		if (!this.supplierCustomerService) this.supplierCustomerService = new SupplierCustomerService(this.getSupplierCustomerRepository());
		return this.supplierCustomerService;
	}

	static getSupplierCustomerController(): SupplierCustomerController {
		if (!this.supplierCustomerController) this.supplierCustomerController = new SupplierCustomerController(this.getSupplierCustomerService());
		return this.supplierCustomerController;
	}
}