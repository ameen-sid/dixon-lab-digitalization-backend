import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ITestTypeService } from '../services/test-type.service';
import { SystemLogFactory } from '../factories/system-log.factory';

export class TestTypeController {

	private testTypeService: ITestTypeService;
	constructor(testTypeService: ITestTypeService) {
		this.testTypeService = testTypeService;
	}

	addTestType = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Test Type', { body: req.body });
		const newTestType = await this.testTypeService.addTestType(req.body.name);
		logger.info('Test Type Created Successfully', { testType: newTestType });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'CREATE',
				entity: 'TestType',
				entityId: String(newTestType.id),
				details: JSON.stringify({ name: newTestType.name }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for TestType creation', logErr);
		}

		res.status(201).json({
			success: true,
			message: 'Test Type Created Successfully',
			data: newTestType
		});
	}

	getTestTypes = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Test Types', { query: req.query });
		const page = Math.max(1, parseInt(req.query.page as string || '1'));
		const limit = Math.max(1, parseInt(req.query.limit as string || '1000'));
		const search = (req.query.search as string || '').trim();
		const sortBy = (req.query.sortBy as string || 'createdAt');
		const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

		const skip = (page - 1) * limit;
		const where: any = {};
		if (search) {
			where.name = { contains: search };
		}

		const testTypes = await this.testTypeService.getTestTypes(where, sortBy, sortOrder, skip, limit);
		logger.info('Fetched Test Types Successfully', { testTypes: testTypes });
		res.status(200).json({
			success: true,
			message: 'Fetched Test Types Successfully',
			data: testTypes
		});
	}

	updateTestType = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Updating Test Type', { body: req.body, id: req.params.id });

		let oldName = '';
		try {
			const items = await this.testTypeService.getTestTypes({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldName = items[0].name;
			}
		} catch (e) {
			logger.warn('Failed to fetch test type before update', e);
		}

		const updateTestType = await this.testTypeService.updateTestType(Number(req.params.id), req.body.name);
		logger.info('Updated Test Type Successfully', { testType: updateTestType });

		if (updateTestType) {
			try {
				await SystemLogFactory.getSystemLogService().createLog({
					action: 'UPDATE',
					entity: 'TestType',
					entityId: String(updateTestType.id),
					details: JSON.stringify({
						old: { name: oldName },
						new: { name: updateTestType.name }
					}),
					performedBy: (req as any).user?.username || 'Unknown'
				});
			} catch (logErr) {
				logger.error('Failed to create system log for TestType update', logErr);
			}
		}

		res.status(200).json({
			success: true,
			message: 'Updated Test Type Successfully',
			data: updateTestType
		});
	}

	deleteTestType = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Test Type', { id: req.params.id });

		let oldName = '';
		try {
			const items = await this.testTypeService.getTestTypes({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldName = items[0].name;
			}
		} catch (e) {
			logger.warn('Failed to fetch test type before delete', e);
		}

		const deleteTestType = await this.testTypeService.deleteTestType(Number(req.params.id));
		logger.info('Deleted Test Type Successfully', { data: deleteTestType });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'DELETE',
				entity: 'TestType',
				entityId: String(req.params.id),
				details: JSON.stringify({ name: oldName, success: deleteTestType }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for TestType deletion', logErr);
		}

		res.status(200).json({
			success: true,
			message: 'Deleted Test Type Successfully',
			data: deleteTestType
		});
	}
}