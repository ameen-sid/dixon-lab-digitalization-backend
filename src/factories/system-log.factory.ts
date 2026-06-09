import { SystemLogRepository } from '../repositories/system-log.repository';
import { SystemLogService } from '../services/system-log.service';
import { SystemLogController } from '../controllers/system-log.controller';

export class SystemLogFactory {
	private static systemLogRepository: SystemLogRepository;
	private static systemLogService: SystemLogService;
	private static systemLogController: SystemLogController;

	static getSystemLogRepository(): SystemLogRepository {
		if (!this.systemLogRepository) this.systemLogRepository = new SystemLogRepository();
		return this.systemLogRepository;
	}

	static getSystemLogService(): SystemLogService {
		if (!this.systemLogService) this.systemLogService = new SystemLogService(this.getSystemLogRepository());
		return this.systemLogService;
	}

	static getSystemLogController(): SystemLogController {
		if (!this.systemLogController) this.systemLogController = new SystemLogController(this.getSystemLogService());
		return this.systemLogController;
	}
}
