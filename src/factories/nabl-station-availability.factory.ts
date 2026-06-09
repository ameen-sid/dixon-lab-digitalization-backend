import { NablStationAvailabilityRepository } from '../repositories/nabl-station-availability.repository';
import { NablStationAvailabilityService } from '../services/nabl-station-availability.service';
import { NablStationAvailabilityController } from '../controllers/nabl-station-availability.controller';

export class NablStationAvailabilityFactory {
	private static repo: NablStationAvailabilityRepository;
	private static service: NablStationAvailabilityService;
	private static controller: NablStationAvailabilityController;

	static getRepository(): NablStationAvailabilityRepository {
		if (!this.repo) this.repo = new NablStationAvailabilityRepository();
		return this.repo;
	}

	static getService(): NablStationAvailabilityService {
		if (!this.service) this.service = new NablStationAvailabilityService(this.getRepository());
		return this.service;
	}

	static getController(): NablStationAvailabilityController {
		if (!this.controller) this.controller = new NablStationAvailabilityController(this.getService());
		return this.controller;
	}
}