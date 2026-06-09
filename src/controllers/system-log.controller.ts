import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ISystemLogService } from '../services/system-log.service';

export class SystemLogController {
	private systemLogService: ISystemLogService;

	constructor(systemLogService: ISystemLogService) {
		this.systemLogService = systemLogService;
	}

	getLogs = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching System Logs', { query: req.query });
		const page = Math.max(1, parseInt(req.query.page as string || '1'));
		const limit = Math.max(1, parseInt(req.query.limit as string || '50'));
		const search = (req.query.search as string || '').trim();
		const entity = (req.query.entity as string || '').trim();
		const action = (req.query.action as string || '').trim();
		const sortBy = (req.query.sortBy as string || 'createdAt');
		const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

		const skip = (page - 1) * limit;
		const where: any = {};

		if (entity) {
			where.entity = entity;
		}
		if (action) {
			where.action = action;
		}

		if (search) {
			where.OR = [
				{ details: { contains: search } },
				{ performedBy: { contains: search } },
				{ entityId: { contains: search } }
			];
		}

		const [
			{ logs, total },
			createCount,
			updateCount,
			deleteCount
		] = await Promise.all([
			this.systemLogService.getLogs(where, sortBy, sortOrder, skip, limit),
			this.systemLogService.countLogs({ ...where, action: 'CREATE' }),
			this.systemLogService.countLogs({ ...where, action: 'UPDATE' }),
			this.systemLogService.countLogs({ ...where, action: 'DELETE' })
		]);

		logger.info('Fetched System Logs Successfully', { count: logs.length, total });
		res.status(200).json({
			success: true,
			message: 'Fetched System Logs Successfully',
			data: {
				logs,
				total,
				page,
				limit,
				stats: {
					CREATE: createCount,
					UPDATE: updateCount,
					DELETE: deleteCount
				}
			}
		});
	}
}
