import { TestingEquipmentRepository } from '../repositories/testing-equipment.repository';
import { TestingEquipmentService } from '../services/testing-equipment.service';
import { TestingEquipmentController } from '../controllers/testing-equipment.controller';

export class TestingEquipmentFactory {

	private static testingEquipmentRepository: TestingEquipmentRepository;
	private static testingEquipmentService: TestingEquipmentService;
	private static testingEquipmentController: TestingEquipmentController;

	static getTestingEquipmentRepository(): TestingEquipmentRepository {
		if (!this.testingEquipmentRepository) this.testingEquipmentRepository = new TestingEquipmentRepository();
		return this.testingEquipmentRepository;
	}

	static getTestingEquipmentService(): TestingEquipmentService {
		if (!this.testingEquipmentService) this.testingEquipmentService = new TestingEquipmentService(this.getTestingEquipmentRepository());
		return this.testingEquipmentService;
	}

	static getTestingEquipmentController(): TestingEquipmentController {
		if (!this.testingEquipmentController) this.testingEquipmentController = new TestingEquipmentController(this.getTestingEquipmentService());
		return this.testingEquipmentController;
	}
}