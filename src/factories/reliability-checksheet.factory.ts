import { ReliabilityChecksheetRepository } from '../repositories/reliability-checksheet.repository';
import { ReliabilityChecksheetService } from '../services/reliability-checksheet.service';
import { ReliabilityChecksheetController } from '../controllers/reliability-checksheet.controller';

export class ReliabilityChecksheetFactory {

	private static reliabilityChecksheetRepository: ReliabilityChecksheetRepository;
	private static reliabilityChecksheetService: ReliabilityChecksheetService;
	private static reliabilityChecksheetController: ReliabilityChecksheetController;

	static getReliabilityChecksheetRepository(): ReliabilityChecksheetRepository {
		if (!this.reliabilityChecksheetRepository)	this.reliabilityChecksheetRepository = new ReliabilityChecksheetRepository();
		return this.reliabilityChecksheetRepository;
	}

	static getReliabilityChecksheetService(): ReliabilityChecksheetService {
		if (!this.reliabilityChecksheetService)	this.reliabilityChecksheetService = new ReliabilityChecksheetService(this.getReliabilityChecksheetRepository());
		return this.reliabilityChecksheetService;
	}

	static getReliabilityChecksheetController(): ReliabilityChecksheetController {
		if (!this.reliabilityChecksheetController) this.reliabilityChecksheetController = new ReliabilityChecksheetController(this.getReliabilityChecksheetService());
		return this.reliabilityChecksheetController;
	}
}