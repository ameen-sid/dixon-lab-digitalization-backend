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
	getWeeklyEquipmentAnalytics(monthStr: string, equipmentId?: string, testTypeId?: string): Promise<any[]>;
}

export class TestingEquipmentService implements ITestingEquipmentService {

	private testingEquipmentRepository: ITestingEquipmentRepository;
	constructor(testingEquipmentRepository: ITestingEquipmentRepository) {
		this.testingEquipmentRepository = testingEquipmentRepository;
	}

	private checkAndOverrideExpired(eq: TestingEquipment): TestingEquipment;
	private checkAndOverrideExpired(eq: TestingEquipment | null): TestingEquipment | null;
	private checkAndOverrideExpired(eq: any): any {
		if (!eq) return null;
		const now = new Date();
		if (eq.calibrationDueDate && new Date(eq.calibrationDueDate) < now) {
			return { ...eq, status: 'MAINTENANCE' };
		}
		return eq;
	}

	private checkAndOverrideExpiredArray(eqs: TestingEquipment[]): TestingEquipment[] {
		const now = new Date();
		return eqs.map(eq => {
			if (eq.calibrationDueDate && new Date(eq.calibrationDueDate) < now) {
				return { ...eq, status: 'MAINTENANCE' };
			}
			return eq;
		});
	}

	async addTestingEquipment(name: string, calibrationDueDate: Date, status?: string): Promise<TestingEquipment> {
		if (!name) throw new BadRequestError('Testing equipment name is required');
		const eq = await this.testingEquipmentRepository.addTestingEquipment(name, calibrationDueDate, status);
		return this.checkAndOverrideExpired(eq);
	}

	async getTestingEquipments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestingEquipment[]> {
		const eqs = await this.testingEquipmentRepository.getTestingEquipments(where, sortBy, sortOrder, skip, limit);
		return this.checkAndOverrideExpiredArray(eqs);
	}

	async updateTestingEquipment(id: number, name?: string, calibrationDueDate?: Date, status?: string): Promise<TestingEquipment | null> {
		if (name !== undefined && !name.trim()) throw new BadRequestError('Testing equipment name cannot be empty');
		const eq = await this.testingEquipmentRepository.updateTestingEquipment(id, name, calibrationDueDate, status);
		return this.checkAndOverrideExpired(eq);
	}

	async deleteTestingEquipment(id: number): Promise<Boolean> {
		return await this.testingEquipmentRepository.deleteTestingEquipment(id);
	}

	async reserveEquipment(id: number, testRequestId: number, occupiedBy: string, modelNo: string, occupiedUntil: Date): Promise<TestingEquipment> {
		const eq = await this.testingEquipmentRepository.updateOccupancy(id, false, occupiedBy, testRequestId, modelNo, occupiedUntil);
		return this.checkAndOverrideExpired(eq);
	}

	async releaseEquipment(id: number): Promise<TestingEquipment> {
		const eq = await this.testingEquipmentRepository.updateOccupancy(id, true, null, null, null, null);
		return this.checkAndOverrideExpired(eq);
	}

	async getWeeklyEquipmentAnalytics(monthStr: string, equipmentId?: string, testTypeId?: string): Promise<any[]> {
		const [year, month] = monthStr.split('-').map(Number);
		const eqId = equipmentId ? Number(equipmentId) : undefined;
		const parsedTestTypeId = testTypeId ? Number(testTypeId) : undefined;
		return await this.testingEquipmentRepository.getWeeklyEquipmentAnalytics(year, month - 1, eqId, parsedTestTypeId);
	}
}