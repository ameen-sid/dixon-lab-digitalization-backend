import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ITestCategoryService } from '../services/test-category.service';
import { SystemLogFactory } from '../factories/system-log.factory';

export class TestCategoryController {

	private testCategoryService: ITestCategoryService;
	constructor(testCategoryService: ITestCategoryService) {
		this.testCategoryService = testCategoryService;
	}

	addTestCategory = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Test Category', { body: req.body });
		const newTestCategory = await this.testCategoryService.addTestCategory(req.body.name, req.body.testTypeId);
		logger.info('Test Category Created Successfully', { testCategory: newTestCategory });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'CREATE',
				entity: 'TestCategory',
				entityId: String(newTestCategory.id),
				details: JSON.stringify({ name: newTestCategory.name, testTypeId: newTestCategory.testTypeId }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for TestCategory creation', logErr);
		}

		res.status(201).json({
			success: true,
			message: 'Test Category Created Successfully',
			data: newTestCategory
		});
	}

	getTestCategories = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Test Categories', { query: req.query });
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

		const testCategories = await this.testCategoryService.getTestCategories(where, sortBy, sortOrder, skip, limit);
		logger.info('Fetched Test Categories Successfully', { testCategories });
		res.status(200).json({
			success: true,
			message: 'Fetched Test Categories Successfully',
			data: testCategories
		});
	}

	updateTestCategory = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Updating Test Category', { body: req.body, id: req.params.id });

		let oldCategory: any = null;
		try {
			const items = await this.testCategoryService.getTestCategories({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldCategory = { name: items[0].name, testTypeId: items[0].testTypeId };
			}
		} catch (e) {
			logger.warn('Failed to fetch test category before update', e);
		}

		const updateTestCategory = await this.testCategoryService.updateTestCategory(Number(req.params.id), req.body.name, req.body.testTypeId);
		logger.info('Updated Test Category Successfully', { updateTestCategory });

		if (updateTestCategory) {
			try {
				await SystemLogFactory.getSystemLogService().createLog({
					action: 'UPDATE',
					entity: 'TestCategory',
					entityId: String(updateTestCategory.id),
					details: JSON.stringify({
						old: oldCategory || {},
						new: { name: updateTestCategory.name, testTypeId: updateTestCategory.testTypeId }
					}),
					performedBy: (req as any).user?.username || 'Unknown'
				});
			} catch (logErr) {
				logger.error('Failed to create system log for TestCategory update', logErr);
			}
		}

		res.status(200).json({
			success: true,
			message: 'Updated Test Category Successfully',
			data: updateTestCategory
		});
	}

	deleteTestCategory = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Test Category', { id: req.params.id });

		let oldName = '';
		try {
			const items = await this.testCategoryService.getTestCategories({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldName = items[0].name;
			}
		} catch (e) {
			logger.warn('Failed to fetch test category before delete', e);
		}

		const deleteTestCategory = await this.testCategoryService.deleteTestCategory(Number(req.params.id));
		logger.info('Deleted Test Category Successfully', { deleteTestCategory });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'DELETE',
				entity: 'TestCategory',
				entityId: String(req.params.id),
				details: JSON.stringify({ name: oldName, success: deleteTestCategory }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for TestCategory deletion', logErr);
		}

		res.status(200).json({
			success: true,
			message: 'Deleted Test Category Successfully',
			data: deleteTestCategory
		});
	}
}