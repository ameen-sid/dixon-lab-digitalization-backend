import { TestTypeRepository } from '../repositories/test-type.repository';
import { TestTypeService } from '../services/test-type.service';
import { TestTypeController } from '../controllers/test-type.controller';

export class TestTypeFactory {

	private static testTypeRepository: TestTypeRepository;
	private static testTypeService: TestTypeService;
	private static testTypeController: TestTypeController;

	static getTestTypeRepository(): TestTypeRepository {
		if (!this.testTypeRepository) this.testTypeRepository = new TestTypeRepository();
		return this.testTypeRepository;
	}

	static getTestTypeService(): TestTypeService {
		if (!this.testTypeService) this.testTypeService = new TestTypeService(this.getTestTypeRepository());
		return this.testTypeService;
	}

	static getTestTypeController(): TestTypeController {
		if (!this.testTypeController) this.testTypeController = new TestTypeController(this.getTestTypeService());
		return this.testTypeController;
	}
}