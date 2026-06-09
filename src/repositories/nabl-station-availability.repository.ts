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
}