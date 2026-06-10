import { NablStationAvailability } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface INablStationAvailabilityRepository {
	getAllPlatforms(): Promise<NablStationAvailability[]>;
	togglePlatform(stationNo: number, platformNo: number): Promise<NablStationAvailability>;
	updateOccupancy(
		stationNo: number,
		platformNo: number,
		isAvailable: boolean,
		occupiedBy?: string | null,
		testRequestId?: number | null,
		modelNo?: string | null,
		occupiedUntil?: Date | null
	): Promise<NablStationAvailability>;
	releaseByRequest(testRequestId: number): Promise<any>;
	getWeeklyPlatformAnalytics(year: number, monthIndex: number, stationNo?: number, platformNo?: number, testTypeId?: number): Promise<any[]>;
}

export class NablStationAvailabilityRepository implements INablStationAvailabilityRepository {
	async getAllPlatforms(): Promise<NablStationAvailability[]> {
		// Clean up/reset any existing 'System Pre-Allocated' records to make them available
		await prisma.nablStationAvailability.updateMany({
			where: {
				occupiedBy: 'System Pre-Allocated'
			},
			data: {
				isAvailable: true,
				occupiedBy: null,
				testRequestId: null,
				modelNo: null,
				occupiedUntil: null
			}
		});

		let platforms = await prisma.nablStationAvailability.findMany({
			orderBy: [
				{ stationNo: 'asc' },
				{ platformNo: 'asc' }
			]
		});

		// Self-healing seeding: If database table is empty, auto-populate 1 station with 10 platforms
		if (platforms.length === 0) {
			const seedData = [];
			// Only 1 station ("1") with 10 platforms ("1" to "10")
			for (let p = 1; p <= 10; p++) {
				seedData.push({
					stationNo: "1",
					platformNo: String(p),
					isAvailable: true, // All platforms free by default
					occupiedBy: null,
					testRequestId: null,
					modelNo: null,
					occupiedUntil: null
				});
			}

			await prisma.nablStationAvailability.createMany({
				data: seedData
			});

			platforms = await prisma.nablStationAvailability.findMany({
				orderBy: [
					{ stationNo: 'asc' },
					{ platformNo: 'asc' }
				]
			});
		}

		return platforms;
	}

	async togglePlatform(stationNo: number, platformNo: number): Promise<NablStationAvailability> {
		const record = await prisma.nablStationAvailability.findUnique({
			where: {
				stationNo_platformNo: { 
					stationNo: String(stationNo), 
					platformNo: String(platformNo) 
				}
			}
		});

		if (!record) {
			throw new Error(`NABL Station S${stationNo} Platform #${platformNo} not found.`);
		}

		const nextState = !record.isAvailable;

		return await prisma.nablStationAvailability.update({
			where: {
				stationNo_platformNo: { 
					stationNo: String(stationNo), 
					platformNo: String(platformNo) 
				}
			},
			data: {
				isAvailable: nextState,
				occupiedBy: nextState ? null : 'Manual Ad-hoc Occupancy',
				modelNo: nextState ? null : 'Unspecified Telemetry Device',
				testRequestId: nextState ? null : 0,
				occupiedUntil: nextState ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			}
		});
	}

	async updateOccupancy(
		stationNo: number,
		platformNo: number,
		isAvailable: boolean,
		occupiedBy?: string | null,
		testRequestId?: number | null,
		modelNo?: string | null,
		occupiedUntil?: Date | null
	): Promise<NablStationAvailability> {
		return await prisma.nablStationAvailability.update({
			where: {
				stationNo_platformNo: { 
					stationNo: String(stationNo), 
					platformNo: String(platformNo) 
				}
			},
			data: {
				isAvailable,
				occupiedBy: isAvailable ? null : occupiedBy,
				testRequestId: isAvailable ? null : testRequestId,
				modelNo: isAvailable ? null : modelNo,
				occupiedUntil: isAvailable ? null : occupiedUntil
			}
		});
	}

	async releaseByRequest(testRequestId: number): Promise<any> {
		return await prisma.nablStationAvailability.updateMany({
			where: {
				testRequestId: testRequestId
			},
			data: {
				isAvailable: true,
				occupiedBy: null,
				testRequestId: null,
				modelNo: null,
				occupiedUntil: null
			}
		});
	}

	async getWeeklyPlatformAnalytics(year: number, monthIndex: number, stationNo?: number, platformNo?: number, testTypeId?: number): Promise<any[]> {
		const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

		const whereClause: any = {
			NOT: [
				{ startDate: null },
				{ endDate: null }
			]
		};

		if (stationNo !== undefined && !isNaN(stationNo)) {
			whereClause.stationNo = stationNo;
		}

		if (testTypeId !== undefined && !isNaN(testTypeId)) {
			whereClause.testTypeId = testTypeId;
		}

		const plans = await prisma.testPlan.findMany({
			where: whereClause
		});

		let capacityDivisor = 10; // 1 station * 10 platforms
		if (stationNo !== undefined && !isNaN(stationNo)) {
			if (platformNo !== undefined && !isNaN(platformNo)) {
				capacityDivisor = 1;
			} else {
				capacityDivisor = 10;
			}
		} else if (platformNo !== undefined && !isNaN(platformNo)) {
			capacityDivisor = 1;
		}

		return Array.from({ length: 4 }, (_, i) => {
			const weekStart = new Date(year, monthIndex, i * 7 + 1, 0, 0, 0);
			const weekEnd = new Date(year, monthIndex, i === 3 ? totalDaysInMonth : (i + 1) * 7, 23, 59, 59);

			let occupiedHours = 0;

			plans.forEach((plan) => {
				if (!plan.startDate || !plan.endDate) return;

				let platformNosParsed: number[] = [];
				if (plan.platformNos) {
					try {
						const parsed = typeof plan.platformNos === 'string' ? JSON.parse(plan.platformNos) : plan.platformNos;
						platformNosParsed = Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
					} catch (e) {
						platformNosParsed = [];
					}
				}

				if (platformNo !== undefined && !isNaN(platformNo)) {
					if (!platformNosParsed.includes(platformNo)) {
						return;
					}
				}

				const planStart = new Date(plan.startDate);
				const planEnd = new Date(plan.endDate);

				const overlapStart = new Date(Math.max(weekStart.getTime(), planStart.getTime()));
				const overlapEnd = new Date(Math.min(weekEnd.getTime(), planEnd.getTime()));

				if (overlapStart <= overlapEnd) {
					const diffTime = Math.abs(overlapEnd.getTime() - overlapStart.getTime());
					const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

					const countPlatforms = (platformNo !== undefined && !isNaN(platformNo))
						? 1
						: platformNosParsed.length;

					occupiedHours += diffDays * 24 * countPlatforms;
				}
			});

			const avgOccupied = Math.min(168, occupiedHours / capacityDivisor);
			const availableHours = 168 - avgOccupied;

			return {
				label: `Week ${i + 1}`,
				occupied: avgOccupied,
				available: availableHours,
				total: 168
			};
		});
	}
}