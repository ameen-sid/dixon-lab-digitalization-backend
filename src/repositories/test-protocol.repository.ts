import { TestProtocol } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface ITestProtocolRepository {
	addTestProtocol(name: string, testTypeId: number, testCategoryId: number, productType: string, testMethod: string, judgementCriteria: string): Promise<TestProtocol>;
	getTestProtocols(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestProtocol[]>;
	updateTestProtocol(id: number, name?: string, testTypeId?: number, testCategoryId?: number, productType?: string, testMethod?: string, judgementCriteria?: string): Promise<TestProtocol | null>;
	deleteTestProtocol(id: number): Promise<Boolean>;
}

export class TestProtocolRepository implements ITestProtocolRepository {
	async addTestProtocol(name: string, testTypeId: number, testCategoryId: number, productType: string, testMethod: string, judgementCriteria: string): Promise<TestProtocol> {
		return await prisma.testProtocol.create({
			data: { name, testTypeId, testCategoryId, productType, testMethod, judgementCriteria }
		});
	}

	async getTestProtocols(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestProtocol[]> {
		return await prisma.testProtocol.findMany({
			include: { testType: true, testCategory: true },
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit
		});
	}

	async updateTestProtocol(id: number, name?: string, testTypeId?: number, testCategoryId?: number, productType?: string, testMethod?: string, judgementCriteria?: string): Promise<TestProtocol | null> {
		return await prisma.testProtocol.update({
			where: { id },
			data: { name, testTypeId, testCategoryId, productType, testMethod, judgementCriteria }
		});
	}

	async deleteTestProtocol(id: number): Promise<Boolean> {
		return await prisma.testProtocol.delete({ where: { id } }) ? true : false;
	}
}