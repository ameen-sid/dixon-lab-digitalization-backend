import { TestingEquipment } from '@prisma/client';
import { ITestingEquipmentRepository } from '../repositories/testing-equipment.repository';
import { BadRequestError } from '../utils/errors/app.error';

export interface ITestingEquipmentService {
	addTestingEquipment(name: string, calibrationDueDate: Date, status?: string): Promise<TestingEquipment>;
	getTestingEquipments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestingEquipment[]>;
	updateTestingEquipment(id: number, name?: string, calibrationDueDate?: Date, status?: string): Promise<TestingEquipment | null>;
	deleteTestingEquipment(id: number): Promise<Boolean>;
	reserveEquipment(id: number, testRequestId: number, occupiedBy: string, modelNo: string, occupiedUntil: Date): Promise<TestingEquipment>;
	releaseEquipment(id: number): Promise<TestingEquipment>;
}

export class TestingEquipmentService implements ITestingEquipmentService {

	private testingEquipmentRepository: ITestingEquipmentRepository;
	constructor(testingEquipmentRepository: ITestingEquipmentRepository) {
		this.testingEquipmentRepository = testingEquipmentRepository;
	}

	async addTestingEquipment(name: string, calibrationDueDate: Date, status?: string): Promise<TestingEquipment> {
		if (!name) throw new BadRequestError('Testing equipment name is required');
		return await this.testingEquipmentRepository.addTestingEquipment(name, calibrationDueDate, status);
	}

	async getTestingEquipments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestingEquipment[]> {
		return await this.testingEquipmentRepository.getTestingEquipments(where, sortBy, sortOrder, skip, limit);
	}

	async updateTestingEquipment(id: number, name?: string, calibrationDueDate?: Date, status?: string): Promise<TestingEquipment | null> {
		if (name !== undefined && !name.trim()) throw new BadRequestError('Testing equipment name cannot be empty');
		return await this.testingEquipmentRepository.updateTestingEquipment(id, name, calibrationDueDate, status);
	}

	async deleteTestingEquipment(id: number): Promise<Boolean> {
		return await this.testingEquipmentRepository.deleteTestingEquipment(id);
	}

	async reserveEquipment(id: number, testRequestId: number, occupiedBy: string, modelNo: string, occupiedUntil: Date): Promise<TestingEquipment> {
		return await this.testingEquipmentRepository.updateOccupancy(id, false, occupiedBy, testRequestId, modelNo, occupiedUntil);
	}

	async releaseEquipment(id: number): Promise<TestingEquipment> {
		return await this.testingEquipmentRepository.updateOccupancy(id, true, null, null, null, null);
	}
}