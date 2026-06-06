import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ITestProtocolService } from '../services/test-protocol.service';

export class TestProtocolController {

	private testProtocolService: ITestProtocolService;
	constructor(testProtocolService: ITestProtocolService) {
		this.testProtocolService = testProtocolService;
	}

	addTestProtocol = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Test Protocol', { body: req.body });
		const newTestProtocol = await this.testProtocolService.addTestProtocol(req.body.name, req.body.testTypeId, req.body.testCategoryId, req.body.productType, req.body.testMethod, req.body.judgementCriteria);
		logger.info('Test Protocol Created Successfully', { newTestProtocol });
		res.status(201).json({
			success: true,
			message: 'Test Protocol Created Successfully',
			data: newTestProtocol
		});
	}

	getTestProtocols = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Test Protocols', { query: req.query });
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

		const testProtocols = await this.testProtocolService.getTestProtocols(where, sortBy, sortOrder, skip, limit);
		logger.info('Fetched Test Protocols Successfully', { testProtocols });
		res.status(200).json({
			success: true,
			message: 'Fetched Test Protocols Successfully',
			data: testProtocols
		});
	}

	updateTestProtocol = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Updating Test Protocol', { body: req.body, id: req.params.id });
		const updateTestProtocol = await this.testProtocolService.updateTestProtocol(Number(req.params.id), req.body.name, req.body.testTypeId, req.body.testCategoryId, req.body.productType, req.body.testMethod, req.body.judgementCriteria);
		logger.info('Updated Test Protocol Successfully', { updateTestProtocol });
		res.status(200).json({
			success: true,
			message: 'Updated Test Protocol Successfully',
			data: updateTestProtocol
		});
	}

	deleteTestProtocol = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Test Protocol', { id: req.params.id });
		const deleteTestProtocol = await this.testProtocolService.deleteTestProtocol(Number(req.params.id));
		logger.info('Deleted Test Protocol Successfully', { deleteTestProtocol });
		res.status(200).json({
			success: true,
			message: 'Deleted Test Protocol Successfully',
			data: deleteTestProtocol
		});
	}
}