import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ITestRequestService } from '../services/test-request.service';

export class TestRequestController {

	private testRequestService: ITestRequestService;
	constructor(testRequestService: ITestRequestService) {
		this.testRequestService = testRequestService;
	}

	addTestRequest = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Initiating Testing Request Submission', { body: req.body });
		const files = req.files as Express.Multer.File[] || [];
		const attachments = files.map(file => ({
			fileName: file.originalname,
			filePath: file.path.replace(/\\/g, '/'),
			fileSize: file.size
		}));

		const requesterId = (req as any).user?.id || req.body.requesterId;
		const requestData = {
			...req.body,
			requesterId: requesterId ? Number(requesterId) : undefined
		};

		const newRequest = await this.testRequestService.addTestRequest(requestData, attachments);
		logger.info('Testing Request Submitted Successfully', { request: newRequest });
		res.status(201).json({
			success: true,
			message: 'Testing Request Submitted Successfully',
			data: newRequest
		});
	}

	getTestRequests = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Testing Requests Register', { query: req.query });	
		const page = Math.max(1, parseInt(req.query.page as string || '1'));
		const limit = Math.max(1, parseInt(req.query.limit as string || '1000'));
		const search = (req.query.search as string || '').trim();
		const sortBy = (req.query.sortBy as string || 'createdAt');
		const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
		const status = req.query.status as string;

		const where: any = {};
		const currentUser = (req as any).user;
		if (currentUser && currentUser.role?.toLowerCase() === 'requester') {
			where.requesterId = currentUser.id;
		}
		if (status) {
			where.status = status;
		}
		if (search) {
			where.OR = [
				{ brandName: { contains: search } },
				{ modelNo: { contains: search } },
				{ sampleDescription: { contains: search } }
			];
		}

		const skip = (page - 1) * limit;
		const requests = await this.testRequestService.getTestRequests(where, sortBy, sortOrder, skip, limit);
		logger.info('Fetched Testing Requests Successfully', { count: requests.length });
		res.status(200).json({
			success: true,
			message: 'Fetched Testing Requests Successfully',
			data: requests
		});
	}

	getTestRequestById = async (req: Request, res: Response, next: NextFunction) => {
		const id = Number(req.params.id);
		logger.info('Fetching Testing Request Details', { id });
		const request = await this.testRequestService.getTestRequestById(id);
		
		const currentUser = (req as any).user;
		if (currentUser && currentUser.role?.toLowerCase() === 'requester' && Number(request.requesterId) !== Number(currentUser.id)) {
			res.status(403).json({
				success: false,
				message: 'Access Denied. You are not authorized to view this request.'
			});
			return;
		}

		logger.info('Fetched Testing Request Details Successfully', { id });
		res.status(200).json({
			success: true,
			message: 'Fetched Testing Request Details Successfully',
			data: request
		});
	}

	updateTestRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Updating Testing Request Status/Assignment', { body: req.body, id: req.params.id });
		const updatedRequest = await this.testRequestService.updateTestRequestStatus(
			Number(req.params.id), 
			req.body.status, 
			req.body.remarks, 
			req.body.assignedToId ? Number(req.body.assignedToId) : undefined
		);
		logger.info('Updated Testing Request Successfully', { id: req.params.id, status: req.body.status });
		res.status(200).json({
			success: true,
			message: 'Updated Testing Request Successfully',
			data: updatedRequest
		});
	}

	saveSampleInspection = async (req: Request, res: Response, next: NextFunction) => {
		const testRequestId = Number(req.params.id);
		const uploadedFiles = req.files as Express.Multer.File[] | undefined;
		logger.info('Saving Sample Inspection Report', { id: testRequestId, filesCount: uploadedFiles?.length ?? 0 });
		const result = await this.testRequestService.saveSampleInspection(testRequestId, req.body, uploadedFiles);
		logger.info('Saved Sample Inspection Report Successfully', { id: testRequestId, sampleIndex: req.body.sampleIndex });
		res.status(200).json({
			success: true,
			message: 'Saved Sample Inspection Report Successfully',
			data: result
		});
	}

	saveSampleTestPlan = async (req: Request, res: Response, next: NextFunction) => {
		const testRequestId = Number(req.params.id);
		logger.info('Saving Sample Test Plan', { id: testRequestId, body: req.body });
		const result = await this.testRequestService.saveSampleTestPlan(testRequestId, req.body);
		logger.info('Saved Sample Test Plan Successfully', { id: testRequestId, sampleIndex: req.body.sampleIndex });
		res.status(200).json({
			success: true,
			message: 'Saved Sample Test Plan Successfully',
			data: result
		});
	}

	getSampleTestPlans = async (req: Request, res: Response, next: NextFunction) => {
		const testRequestId = Number(req.params.id);
		logger.info('Fetching Sample Test Plans', { id: testRequestId });
		const result = await this.testRequestService.getSampleTestPlans(testRequestId);
		res.status(200).json({
			success: true,
			data: result
		});
	}
}