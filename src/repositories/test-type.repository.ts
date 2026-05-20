import { TestType } from '@prisma/client';
import { prisma } from '../configs/prisma.config';
import { ConflictError, NotFoundError } from '../utils/errors/app.error';

export interface ITestTypeRepository {
	addTestType(name: string): Promise<TestType>;
	getTestTypes(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestType[]>;
	updateTestType(id: number, name: string): Promise<TestType | null>;
	deleteTestType(id: number): Promise<Boolean>;
}

export class TestTypeRepository implements ITestTypeRepository {
	async addTestType(name: string): Promise<TestType> {
		return await prisma.testType.create({ data: { name: name.trim() } });
	}

	async getTestTypes(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestType[]> {
		return await prisma.testType.findMany({
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit
		});
	}

	async updateTestType(id: number, name: string): Promise<TestType | null> {
		return await prisma.testType.update({
			where: { id },
			data: { name: name.trim() }
		});
	}

	async deleteTestType(id: number): Promise<Boolean> {
		try {
			await prisma.testType.delete({ where: { id } });
			return true;
		} catch (error: any) {
			if (error.code === 'P2025') throw new NotFoundError('Test type not found');
			if (error.code === 'P2003') throw new ConflictError('Cannot delete test type because test plans are assigned to it');
			throw error;
		}
	}
}