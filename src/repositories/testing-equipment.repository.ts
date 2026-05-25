import { TestingEquipment } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface ITestingEquipmentRepository {
	addTestingEquipment(name: string, calibrationDueDate: Date | null, status?: string): Promise<TestingEquipment>;
	getTestingEquipments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestingEquipment[]>;
	updateTestingEquipment(id: number, name?: string, calibrationDueDate?: Date | null, status?: string): Promise<TestingEquipment | null>;
	deleteTestingEquipment(id: number): Promise<Boolean>;
}

export class TestingEquipmentRepository implements ITestingEquipmentRepository {
	async addTestingEquipment(name: string, calibrationDueDate: Date | null, status?: string): Promise<TestingEquipment> {
		return await prisma.testingEquipment.create({ data: { name, calibrationDueDate, status } });
	}

	async getTestingEquipments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestingEquipment[]> {
		return await prisma.testingEquipment.findMany({
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit
		});
	}

	async updateTestingEquipment(id: number, name?: string, calibrationDueDate?: Date | null, status?: string): Promise<TestingEquipment | null> {
		return await prisma.testingEquipment.update({ where: { id }, data: { name, calibrationDueDate, status } });
	}

	async deleteTestingEquipment(id: number): Promise<Boolean> {
		return await prisma.testingEquipment.delete({ where: { id } }) ? true : false;
	}
}