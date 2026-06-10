import { TestingEquipment } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface ITestingEquipmentRepository {
	addTestingEquipment(name: string, calibrationDueDate: Date, status?: string): Promise<TestingEquipment>;
	getTestingEquipments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestingEquipment[]>;
	updateTestingEquipment(id: number, name?: string, calibrationDueDate?: Date, status?: string): Promise<TestingEquipment | null>;
	deleteTestingEquipment(id: number): Promise<Boolean>;
	updateOccupancy(id: number, isAvailable: boolean, occupiedBy?: string | null, testRequestId?: number | null, modelNo?: string | null, occupiedUntil?: Date | null): Promise<TestingEquipment>;
	getWeeklyEquipmentAnalytics(year: number, monthIndex: number, equipmentId?: number, testTypeId?: number): Promise<any[]>;
}

export class TestingEquipmentRepository implements ITestingEquipmentRepository {
	async addTestingEquipment(name: string, calibrationDueDate: Date, status?: string): Promise<TestingEquipment> {
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

	async updateTestingEquipment(id: number, name?: string, calibrationDueDate?: Date, status?: string): Promise<TestingEquipment | null> {
		return await prisma.testingEquipment.update({ where: { id }, data: { name, calibrationDueDate, status } });
	}

	async deleteTestingEquipment(id: number): Promise<Boolean> {
		return await prisma.testingEquipment.delete({ where: { id } }) ? true : false;
	}

	async updateOccupancy(id: number, isAvailable: boolean, occupiedBy?: string | null, testRequestId?: number | null, modelNo?: string | null, occupiedUntil?: Date | null): Promise<TestingEquipment> {
		return await prisma.testingEquipment.update({
			where: { id },
			data: {
				isAvailable,
				occupiedBy: isAvailable ? null : occupiedBy,
				testRequestId: isAvailable ? null : testRequestId,
				modelNo: isAvailable ? null : modelNo,
				occupiedUntil: isAvailable ? null : occupiedUntil
			}
		});
	}

	async getWeeklyEquipmentAnalytics(year: number, monthIndex: number, equipmentId?: number, testTypeId?: number): Promise<any[]> {
		const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

		const whereClause: any = {
			NOT: [
				{ startDate: null },
				{ endDate: null },
				{ equipmentId: null }
			]
		};

		if (equipmentId !== undefined && !isNaN(equipmentId)) {
			whereClause.equipmentId = equipmentId;
		}

		if (testTypeId !== undefined && !isNaN(testTypeId)) {
			whereClause.testTypeId = testTypeId;
		}

		const plans = await prisma.testPlan.findMany({
			where: whereClause
		});

		const planKeys = plans.map(p => `${p.testRequestId}-sample-${p.sampleIndex}`);
		const entries = await prisma.reliabilityChecksheetEntry.findMany({
			where: {
				planKey: { in: planKeys }
			}
		});

		return Array.from({ length: 4 }, (_, i) => {
			const weekStart = new Date(year, monthIndex, i * 7 + 1, 0, 0, 0);
			const weekEnd = new Date(year, monthIndex, i === 3 ? totalDaysInMonth : (i + 1) * 7, 23, 59, 59);

			let allocatedHours = 0;
			let actualHours = 0;
			let activeCount = 0;

			plans.forEach((plan) => {
				const planStart = new Date(plan.startDate!);
				const planEnd = new Date(plan.endDate!);

				const overlapStart = new Date(Math.max(weekStart.getTime(), planStart.getTime()));
				const overlapEnd = new Date(Math.min(weekEnd.getTime(), planEnd.getTime()));

				if (overlapStart <= overlapEnd) {
					const diffTime = Math.abs(overlapEnd.getTime() - overlapStart.getTime());
					const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
					allocatedHours += diffDays * 24;

					const planKey = `${plan.testRequestId}-sample-${plan.sampleIndex}`;
					const planEntries = entries.filter(e => e.planKey === planKey);
					const entriesInWeek = planEntries.filter(entry => {
						const entryDate = new Date(entry.date);
						return entryDate >= weekStart && entryDate <= weekEnd;
					});

					if (entriesInWeek.length > 0) {
						actualHours += entriesInWeek.length * 24;
					} else {
						actualHours += diffDays * 22.8;
					}
					activeCount++;
				}
			});

			if (allocatedHours === 0) {
				return {
					label: `Week ${i + 1}`,
					allocated: 0,
					actual: 0
				};
			}

			const avgAllocated = Math.min(168, allocatedHours / activeCount);
			const avgActual = Math.min(avgAllocated, actualHours / activeCount);

			return {
				label: `Week ${i + 1}`,
				allocated: avgAllocated,
				actual: avgActual
			};
		});
	}
}