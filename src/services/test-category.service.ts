import { TestCategory } from '@prisma/client';
import { ITestCategoryRepository } from '../repositories/test-category.repository';
import { BadRequestError } from '../utils/errors/app.error';

export interface ITestCategoryService {
	addTestCategory(name: string, testTypeId: number): Promise<TestCategory>;
	getTestCategories(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestCategory[]>;
	updateTestCategory(id: number, name?: string, testTypeId?: number): Promise<TestCategory | null>;
	deleteTestCategory(id: number): Promise<Boolean>;
}

export class TestCategoryService implements ITestCategoryService {

	private testCategoryRepository: ITestCategoryRepository;
	constructor(testCategoryRepository: ITestCategoryRepository) {
		this.testCategoryRepository = testCategoryRepository;
	}

	async addTestCategory(name: string, testTypeId: number): Promise<TestCategory> {
		if (!name) throw new BadRequestError('Test category name is required');
		return await this.testCategoryRepository.addTestCategory(name, testTypeId);
	}

	async getTestCategories(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestCategory[]> {
		return await this.testCategoryRepository.getTestCategories(where, sortBy, sortOrder, skip, limit);
	}

	async updateTestCategory(id: number, name?: string, testTypeId?: number): Promise<TestCategory | null> {
		if (name !== undefined && !name.trim())	throw new BadRequestError('Test category name cannot be empty');
		return await this.testCategoryRepository.updateTestCategory(id, name, testTypeId);
	}

	async deleteTestCategory(id: number): Promise<Boolean> {
		return await this.testCategoryRepository.deleteTestCategory(id);
	}
}