import { TestProtocolRepository } from '../repositories/test-protocol.repository';
import { TestProtocolService } from '../services/test-protocol.service';
import { TestProtocolController } from '../controllers/test-protocol.controller';

export class TestProtocolFactory {

	private static testProtocolRepository: TestProtocolRepository;
	private static testProtocolService: TestProtocolService;
	private static testProtocolController: TestProtocolController;

	static getTestProtocolRepository(): TestProtocolRepository {
		if (!this.testProtocolRepository) this.testProtocolRepository = new TestProtocolRepository();
		return this.testProtocolRepository;
	}

	static getTestProtocolService(): TestProtocolService {
		if (!this.testProtocolService) this.testProtocolService = new TestProtocolService(this.getTestProtocolRepository());
		return this.testProtocolService;
	}

	static getTestProtocolController(): TestProtocolController {
		if (!this.testProtocolController) this.testProtocolController = new TestProtocolController(this.getTestProtocolService());
		return this.testProtocolController;
	}
}