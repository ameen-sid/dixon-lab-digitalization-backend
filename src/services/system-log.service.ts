import { SystemLog } from '@prisma/client';
import { ISystemLogRepository } from '../repositories/system-log.repository';

export interface ISystemLogService {
	createLog(data: {
		action: string;
		entity: string;
		entityId?: string;
		details?: string;
		performedBy?: string;
	}): Promise<SystemLog>;
	getLogs(
		where: any,
		sortBy: string,
		sortOrder: string,
		skip: number,
		limit: number
	): Promise<{ logs: SystemLog[]; total: number }>;
	countLogs(where: any): Promise<number>;
}

export class SystemLogService implements ISystemLogService {
	private systemLogRepository: ISystemLogRepository;

	constructor(systemLogRepository: ISystemLogRepository) {
		this.systemLogRepository = systemLogRepository;
	}

	async createLog(data: {
		action: string;
		entity: string;
		entityId?: string;
		details?: string;
		performedBy?: string;
	}): Promise<SystemLog> {
		return await this.systemLogRepository.createLog(data);
	}

	async getLogs(
		where: any,
		sortBy: string,
		sortOrder: string,
		skip: number,
		limit: number
	): Promise<{ logs: SystemLog[]; total: number }> {
		const [logs, total] = await Promise.all([
			this.systemLogRepository.getLogs(where, sortBy, sortOrder, skip, limit),
			this.systemLogRepository.countLogs(where)
		]);
		return { logs, total };
	}

	async countLogs(where: any): Promise<number> {
		return await this.systemLogRepository.countLogs(where);
	}
}
