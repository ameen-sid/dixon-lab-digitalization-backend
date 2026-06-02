import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ITestingEquipmentService } from '../services/testing-equipment.service';

export class TestingEquipmentController {

	private testingEquipmentService: ITestingEquipmentService;
	constructor(testingEquipmentService: ITestingEquipmentService) {
		this.testingEquipmentService = testingEquipmentService;
	}

	addTestingEquipment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Testing Equipment', { body: req.body });
		const newEquipment = await this.testingEquipmentService.addTestingEquipment(req.body.name, req.body.calibrationDueDate, req.body.status);
		logger.info('Testing Equipment Created Successfully', { newEquipment });
		res.status(201).json({
			success: true,
			message: 'Testing Equipment Created Successfully',
			data: newEquipment
		});
	}

	getTestingEquipments = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Testing Equipments', { query: req.query });
		const page = Math.max(1, parseInt(req.query.page as string || '1'));
		const limit = Math.max(1, parseInt(req.query.limit as string || '10'));
		const search = (req.query.search as string || '').trim();
		const sortBy = (req.query.sortBy as string || 'createdAt');
		const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

		const skip = (page - 1) * limit;
		const where: any = {};
		if (search) {
			where.name = { contains: search };
		}

		const equipments = await this.testingEquipmentService.getTestingEquipments(where, sortBy, sortOrder, skip, limit);
		logger.info('Fetched Testing Equipments Successfully', { equipments });
		res.status(200).json({
			success: true,
			message: 'Fetched Testing Equipments Successfully',
			data: equipments
		});
	}

	updateTestingEquipment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Updating Testing Equipment', { body: req.body, id: req.params.id });
		const updatedEquipment = await this.testingEquipmentService.updateTestingEquipment(Number(req.params.id), req.body.name, req.body.calibrationDueDate, req.body.status);
		logger.info('Updated Testing Equipment Successfully', { updatedEquipment });
		res.status(200).json({
			success: true,
			message: 'Updated Testing Equipment Successfully',
			data: updatedEquipment
		});
	}

	deleteTestingEquipment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Testing Equipment', { id: req.params.id });
		const isDeleted = await this.testingEquipmentService.deleteTestingEquipment(Number(req.params.id));
		logger.info('Deleted Testing Equipment Successfully', { isDeleted });
		res.status(200).json({
			success: true,
			message: 'Deleted Testing Equipment Successfully',
			data: isDeleted
		});
	}

	reserveEquipment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Reserving Testing Equipment', { body: req.body });
		const { id, testRequestId, occupiedBy, modelNo, occupiedUntil } = req.body;
		const updatedEquipment = await this.testingEquipmentService.reserveEquipment(Number(id), Number(testRequestId), occupiedBy, modelNo, new Date(occupiedUntil));
		logger.info('Testing Equipment Reserved Successfully', { updatedEquipment });
		res.status(200).json({
			success: true,
			message: 'Testing Equipment Reserved Successfully',
			data: updatedEquipment
		});
	}

	releaseEquipment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Releasing Testing Equipment', { body: req.body });
		const { id } = req.body;
		const updatedEquipment = await this.testingEquipmentService.releaseEquipment(Number(id));
		logger.info('Testing Equipment Released Successfully', { updatedEquipment });
		res.status(200).json({
			success: true,
			message: 'Testing Equipment Released Successfully',
			data: updatedEquipment
		});
	}
}