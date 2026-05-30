import { TestRequestRepository } from '../repositories/test-request.repository';
import { TestRequestService } from '../services/test-request.service';
import { TestRequestController } from '../controllers/test-request.controller';

export class TestRequestFactory {

	private static testRequestRepository: TestRequestRepository;
	private static testRequestService: TestRequestService;
	private static testRequestController: TestRequestController;

	static getTestRequestRepository(): TestRequestRepository {
		if (!this.testRequestRepository)	this.testRequestRepository = new TestRequestRepository();
		return this.testRequestRepository;
	}

	static getTestRequestService(): TestRequestService {
		if (!this.testRequestService)	this.testRequestService = new TestRequestService(this.getTestRequestRepository());
		return this.testRequestService;
	}

	static getTestRequestController(): TestRequestController {
		if (!this.testRequestController)	this.testRequestController = new TestRequestController(this.getTestRequestService());
		return this.testRequestController;
	}
}