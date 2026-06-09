import { prisma } from '../configs/prisma.config';
import { SystemLog } from '@prisma/client';

export interface ISystemLogRepository {
	createLog(data: {
		action: string;
		entity: string;
		entityId?: string;
		details?: string;
		performedBy?: string;
	}): Promise<SystemLog>;
	getLogs(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<SystemLog[]>;
	countLogs(where: any): Promise<number>;
}

export class SystemLogRepository implements ISystemLogRepository {
	async createLog(data: {
		action: string;
		entity: string;
		entityId?: string;
		details?: string;
		performedBy?: string;
	}): Promise<SystemLog> {
		return await prisma.systemLog.create({
			data: {
				action: data.action,
				entity: data.entity,
				entityId: data.entityId || null,
				details: data.details || null,
				performedBy: data.performedBy || null,
			}
		});
	}

	async getLogs(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<SystemLog[]> {
		return await prisma.systemLog.findMany({
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit
		});
	}

	async countLogs(where: any): Promise<number> {
		return await prisma.systemLog.count({ where });
	}
}
