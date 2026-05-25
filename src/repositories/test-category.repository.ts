import { TestCategory } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface ITestCategoryRepository {
	addTestCategory(name: string, testTypeId: number): Promise<TestCategory>;
	getTestCategories(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestCategory[]>;
	updateTestCategory(id: number, name?: string, testTypeId?: number): Promise<TestCategory | null>;
	deleteTestCategory(id: number): Promise<Boolean>;
}

export class TestCategoryRepository implements ITestCategoryRepository {
	async addTestCategory(name: string, testTypeId: number): Promise<TestCategory> {
		return await prisma.testCategory.create({
			data: { name, testTypeId }
		});
	}

	async getTestCategories(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestCategory[]> {
		return await prisma.testCategory.findMany({
			include: { testType: true },
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit
		});
	}

	async updateTestCategory(id: number, name?: string, testTypeId?: number): Promise<TestCategory | null> {
		return await prisma.testCategory.update({
			where: { id },
			data: { name, testTypeId }
		});
	}

	async deleteTestCategory(id: number): Promise<Boolean> {
		return await prisma.testCategory.delete({ where: { id } }) ? true : false;
	}
}