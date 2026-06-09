import { NablStationAvailability } from '@prisma/client';
import { INablStationAvailabilityRepository } from '../repositories/nabl-station-availability.repository';

export interface INablStationAvailabilityService {
	getAllPlatforms(): Promise<NablStationAvailability[]>;
	togglePlatform(stationNo: number, platformNo: number): Promise<NablStationAvailability>;
	reservePlatforms(
		stationNo: number,
		platformNos: number[],
		testRequestId: number,
		occupiedBy: string,
		modelNo: string,
		occupiedUntil: Date
	): Promise<NablStationAvailability[]>;
	releasePlatforms(stationNo: number, platformNos: number[]): Promise<NablStationAvailability[]>;
	releaseByRequest(testRequestId: number): Promise<any>;
}

export class NablStationAvailabilityService implements INablStationAvailabilityService {
	private repo: INablStationAvailabilityRepository;

	constructor(repo: INablStationAvailabilityRepository) {
		this.repo = repo;
	}

	async getAllPlatforms(): Promise<NablStationAvailability[]> {
		return await this.repo.getAllPlatforms();
	}

	async togglePlatform(stationNo: number, platformNo: number): Promise<NablStationAvailability> {
		return await this.repo.togglePlatform(stationNo, platformNo);
	}

	async reservePlatforms(
		stationNo: number,
		platformNos: number[],
		testRequestId: number,
		occupiedBy: string,
		modelNo: string,
		occupiedUntil: Date
	): Promise<NablStationAvailability[]> {
		const results: NablStationAvailability[] = [];
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

	async releasePlatforms(stationNo: number, platformNos: number[]): Promise<NablStationAvailability[]> {
		const results: NablStationAvailability[] = [];
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