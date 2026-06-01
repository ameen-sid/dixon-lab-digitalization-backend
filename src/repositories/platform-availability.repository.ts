import { PlatformAvailability } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface IPlatformAvailabilityRepository {
	getAllPlatforms(): Promise<PlatformAvailability[]>;
	togglePlatform(stationNo: number, platformNo: number): Promise<PlatformAvailability>;
	updateOccupancy(
		stationNo: number,
		platformNo: number,
		isAvailable: boolean,
		occupiedBy?: string | null,
		testRequestId?: number | null,
		modelNo?: string | null,
		occupiedUntil?: Date | null
	): Promise<PlatformAvailability>;
	releaseByRequest(testRequestId: number): Promise<any>;
}

export class PlatformAvailabilityRepository implements IPlatformAvailabilityRepository {
	async getAllPlatforms(): Promise<PlatformAvailability[]> {
		// Clean up/reset any existing 'System Pre-Allocated' records to make them available
		await prisma.platformAvailability.updateMany({
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

		let platforms = await prisma.platformAvailability.findMany({
			orderBy: [
				{ stationNo: 'asc' },
				{ platformNo: 'asc' }
			]
		});

		// Self-healing seeding: If database table is empty, auto-populate all 140 slots!
		if (platforms.length === 0) {
			const seedData = [];
			for (let s = 1; s <= 14; s++) {
				for (let p = 1; p <= 10; p++) {
					seedData.push({
						stationNo: String(s),
						platformNo: String(p),
						isAvailable: true, // All platforms free by default
						occupiedBy: null,
						testRequestId: null,
						modelNo: null,
						occupiedUntil: null
					});
				}
			}

			await prisma.platformAvailability.createMany({
				data: seedData
			});

			platforms = await prisma.platformAvailability.findMany({
				orderBy: [
					{ stationNo: 'asc' },
					{ platformNo: 'asc' }
				]
			});
		}

		return platforms;
	}

	async togglePlatform(stationNo: number, platformNo: number): Promise<PlatformAvailability> {
		const record = await prisma.platformAvailability.findUnique({
			where: {
				stationNo_platformNo: { 
					stationNo: String(stationNo), 
					platformNo: String(platformNo) 
				}
			}
		});

		if (!record) {
			throw new Error(`Platform S${stationNo} Platform #${platformNo} not found.`);
		}

		const nextState = !record.isAvailable;

		return await prisma.platformAvailability.update({
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
	): Promise<PlatformAvailability> {
		return await prisma.platformAvailability.update({
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
		return await prisma.platformAvailability.updateMany({
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
}
