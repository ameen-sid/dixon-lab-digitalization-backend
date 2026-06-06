import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ITestTypeService } from '../services/test-type.service';

export class TestTypeController {

	private testTypeService: ITestTypeService;
	constructor(testTypeService: ITestTypeService) {
		this.testTypeService = testTypeService;
	}

	addTestType = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Test Type', { body: req.body });
		const newTestType = await this.testTypeService.addTestType(req.body.name);
		logger.info('Test Type Created Successfully', { testType: newTestType });
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
		const updateTestType = await this.testTypeService.updateTestType(Number(req.params.id), req.body.name);
		logger.info('Updated Test Type Successfully', { testType: updateTestType });
		res.status(200).json({
			success: true,
			message: 'Updated Test Type Successfully',
			data: updateTestType
		});
	}

	deleteTestType = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Test Type', { id: req.params.id });
		const deleteTestType = await this.testTypeService.deleteTestType(Number(req.params.id));
		logger.info('Deleted Test Type Successfully', { data: deleteTestType });
		res.status(200).json({
			success: true,
			message: 'Deleted Test Type Successfully',
			data: deleteTestType
		});
	}
}