import { TestCategoryRepository } from '../repositories/test-category.repository';
import { TestCategoryService } from '../services/test-category.service';
import { TestCategoryController } from '../controllers/test-category.controller';

export class TestCategoryFactory {

	private static testCategoryRepository: TestCategoryRepository;
	private static testCategoryService: TestCategoryService;
	private static testCategoryController: TestCategoryController;

	static getTestCategoryRepository(): TestCategoryRepository {
		if (!this.testCategoryRepository) this.testCategoryRepository = new TestCategoryRepository();
		return this.testCategoryRepository;
	}

	static getTestCategoryService(): TestCategoryService {
		if (!this.testCategoryService) this.testCategoryService = new TestCategoryService(this.getTestCategoryRepository());
		return this.testCategoryService;
	}

	static getTestCategoryController(): TestCategoryController {
		if (!this.testCategoryController) this.testCategoryController = new TestCategoryController(this.getTestCategoryService());
		return this.testCategoryController;
	}
}