import { TestProtocol } from '@prisma/client';
import { ITestProtocolRepository } from '../repositories/test-protocol.repository';
import { BadRequestError } from '../utils/errors/app.error';

export interface ITestProtocolService {
	addTestProtocol(name: string, testTypeId: number, testCategoryId: number, productType: string, testMethod: string, judgementCriteria: string): Promise<TestProtocol>;
	getTestProtocols(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestProtocol[]>;
	updateTestProtocol(id: number, name?: string, testTypeId?: number, testCategoryId?: number, productType?: string, testMethod?: string, judgementCriteria?: string): Promise<TestProtocol | null>;
	deleteTestProtocol(id: number): Promise<Boolean>;
}

export class TestProtocolService implements ITestProtocolService {

	private testProtocolRepository: ITestProtocolRepository;
	constructor(testProtocolRepository: ITestProtocolRepository) {
		this.testProtocolRepository = testProtocolRepository;
	}

	async addTestProtocol(name: string, testTypeId: number, testCategoryId: number, productType: string, testMethod: string, judgementCriteria: string): Promise<TestProtocol> {
		if (!name || !productType || !testMethod || !judgementCriteria) throw new BadRequestError('All fields are required');
		return await this.testProtocolRepository.addTestProtocol(name, testTypeId, testCategoryId, productType, testMethod, judgementCriteria);
	}

	async getTestProtocols(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestProtocol[]> {
		return await this.testProtocolRepository.getTestProtocols(where, sortBy, sortOrder, skip, limit);
	}

	async updateTestProtocol(id: number, name?: string, testTypeId?: number, testCategoryId?: number, productType?: string, testMethod?: string, judgementCriteria?: string): Promise<TestProtocol | null> {
		if (name !== undefined && !name.trim()) throw new BadRequestError('Test protocol name cannot be empty');
		if (productType !== undefined && !productType.trim()) throw new BadRequestError('Test protocol productType cannot be empty');
		if (testMethod !== undefined && !testMethod.trim()) throw new BadRequestError('Test protocol testMethod cannot be empty');
		if (judgementCriteria !== undefined && !judgementCriteria.trim()) throw new BadRequestError('Test protocol judgementCriteria cannot be empty');
		return await this.testProtocolRepository.updateTestProtocol(id, name, testTypeId, testCategoryId, productType, testMethod, judgementCriteria);
	}

	async deleteTestProtocol(id: number): Promise<Boolean> {
		return await this.testProtocolRepository.deleteTestProtocol(id);
	}
}