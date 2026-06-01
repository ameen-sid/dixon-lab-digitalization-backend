import { PlatformAvailabilityRepository } from '../repositories/platform-availability.repository';
import { PlatformAvailabilityService } from '../services/platform-availability.service';
import { PlatformAvailabilityController } from '../controllers/platform-availability.controller';

export class PlatformAvailabilityFactory {
	private static repo: PlatformAvailabilityRepository;
	private static service: PlatformAvailabilityService;
	private static controller: PlatformAvailabilityController;

	static getRepository(): PlatformAvailabilityRepository {
		if (!this.repo) this.repo = new PlatformAvailabilityRepository();
		return this.repo;
	}

	static getService(): PlatformAvailabilityService {
		if (!this.service) this.service = new PlatformAvailabilityService(this.getRepository());
		return this.service;
	}

	static getController(): PlatformAvailabilityController {
		if (!this.controller) this.controller = new PlatformAvailabilityController(this.getService());
		return this.controller;
	}
}
