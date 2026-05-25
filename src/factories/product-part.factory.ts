import { ProductPartRepository } from '../repositories/product-part.repository';
import { ProductPartService } from '../services/product-part.service';
import { ProductPartController } from '../controllers/product-part.controller';

export class ProductPartFactory {

	private static productPartRepository: ProductPartRepository;
	private static productPartService: ProductPartService;
	private static productPartController: ProductPartController;

	static getProductPartRepository(): ProductPartRepository {
		if (!this.productPartRepository) this.productPartRepository = new ProductPartRepository();
		return this.productPartRepository;
	}

	static getProductPartService(): ProductPartService {
		if (!this.productPartService) this.productPartService = new ProductPartService(this.getProductPartRepository());
		return this.productPartService;
	}

	static getProductPartController(): ProductPartController {
		if (!this.productPartController) this.productPartController = new ProductPartController(this.getProductPartService());
		return this.productPartController;
	}
}