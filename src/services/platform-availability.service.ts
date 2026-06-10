import { PlatformAvailability } from '@prisma/client';
import { IPlatformAvailabilityRepository } from '../repositories/platform-availability.repository';

export interface IPlatformAvailabilityService {
	getAllPlatforms(): Promise<PlatformAvailability[]>;
	togglePlatform(stationNo: number, platformNo: number): Promise<PlatformAvailability>;
	reservePlatforms(
		stationNo: number,
		platformNos: number[],
		testRequestId: number,
		occupiedBy: string,
		modelNo: string,
		occupiedUntil: Date
	): Promise<PlatformAvailability[]>;
	releasePlatforms(stationNo: number, platformNos: number[]): Promise<PlatformAvailability[]>;
	releaseByRequest(testRequestId: number): Promise<any>;
	getWeeklyPlatformAnalytics(monthStr: string, station?: string, platform?: string, testTypeId?: string): Promise<any[]>;
}

export class PlatformAvailabilityService implements IPlatformAvailabilityService {
	private repo: IPlatformAvailabilityRepository;

	constructor(repo: IPlatformAvailabilityRepository) {
		this.repo = repo;
	}

	async getWeeklyPlatformAnalytics(monthStr: string, station?: string, platform?: string, testTypeId?: string): Promise<any[]> {
		const [year, month] = monthStr.split('-').map(Number);
		const stationNo = station ? Number(station) : undefined;
		const platformNo = platform ? Number(platform) : undefined;
		const parsedTestTypeId = testTypeId ? Number(testTypeId) : undefined;
		return await this.repo.getWeeklyPlatformAnalytics(year, month - 1, stationNo, platformNo, parsedTestTypeId);
	}

	async getAllPlatforms(): Promise<PlatformAvailability[]> {
		return await this.repo.getAllPlatforms();
	}

	async togglePlatform(stationNo: number, platformNo: number): Promise<PlatformAvailability> {
		return await this.repo.togglePlatform(stationNo, platformNo);
	}

	async reservePlatforms(
		stationNo: number,
		platformNos: number[],
		testRequestId: number,
		occupiedBy: string,
		modelNo: string,
		occupiedUntil: Date
	): Promise<PlatformAvailability[]> {
		const results: PlatformAvailability[] = [];
		for (const pNum of platformNos) {
			const res = await this.repo.updateOccupancy(
				stationNo,
				pNum,
				false, // isAvailable = false
				occupiedBy,
				testRequestId,
				modelNo,
				occupiedUntil
			);
			results.push(res);
		}
		return results;
	}

	async releasePlatforms(stationNo: number, platformNos: number[]): Promise<PlatformAvailability[]> {
		const results: PlatformAvailability[] = [];
		for (const pNum of platformNos) {
			const res = await this.repo.updateOccupancy(
				stationNo,
				pNum,
				true, // isAvailable = true
				null,
				null,
				null,
				null
			);
			results.push(res);
		}
		return results;
	}

	async releaseByRequest(testRequestId: number): Promise<any> {
		return await this.repo.releaseByRequest(testRequestId);
	}
}
