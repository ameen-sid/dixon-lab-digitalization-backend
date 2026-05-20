import { TestType } from '@prisma/client';
import { ITestTypeRepository } from '../repositories/test-type.repository';
import { BadRequestError } from '../utils/errors/app.error';

export interface ITestTypeService {
	addTestType(name: string): Promise<TestType>;
	getTestTypes(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestType[]>;
	updateTestType(id: number, name: string): Promise<TestType | null>;
	deleteTestType(id: number): Promise<Boolean>;
}

export class TestTypeService implements ITestTypeService {

	private testTypeRepository: ITestTypeRepository;
	constructor(testTypeRepository: ITestTypeRepository) {
		this.testTypeRepository = testTypeRepository;
	}

	async addTestType(name: string): Promise<TestType> {
		if (!name) throw new BadRequestError('Test type name is required');
		return await this.testTypeRepository.addTestType(name);
	}

	async getTestTypes(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestType[]> {
		return await this.testTypeRepository.getTestTypes(where, sortBy, sortOrder, skip, limit);
	}

	async updateTestType(id: number, name: string): Promise<TestType | null> {
		if (!name) throw new BadRequestError('Test type name is required');
		return await this.testTypeRepository.updateTestType(id, name);
	}

	async deleteTestType(id: number): Promise<Boolean> {
		return await this.testTypeRepository.deleteTestType(id);
	}
}