import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { ITestingEquipmentService } from '../services/testing-equipment.service';
import { SystemLogFactory } from '../factories/system-log.factory';
import { BadRequestError } from '../utils/errors/app.error';

export class TestingEquipmentController {

	private testingEquipmentService: ITestingEquipmentService;
	constructor(testingEquipmentService: ITestingEquipmentService) {
		this.testingEquipmentService = testingEquipmentService;
	}

	addTestingEquipment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Testing Equipment', { body: req.body });
		const newEquipment = await this.testingEquipmentService.addTestingEquipment(req.body.name, req.body.calibrationDueDate, req.body.status);
		logger.info('Testing Equipment Created Successfully', { newEquipment });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'CREATE',
				entity: 'TestingEquipment',
				entityId: String(newEquipment.id),
				details: JSON.stringify({ name: newEquipment.name, calibrationDueDate: newEquipment.calibrationDueDate, status: newEquipment.status }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for TestingEquipment creation', logErr);
		}

		res.status(201).json({
			success: true,
			message: 'Testing Equipment Created Successfully',
			data: newEquipment
		});
	}

	getTestingEquipments = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Testing Equipments', { query: req.query });
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

		let oldEquipment: any = null;
		try {
			const items = await this.testingEquipmentService.getTestingEquipments({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldEquipment = {
					name: items[0].name,
					calibrationDueDate: items[0].calibrationDueDate,
					status: items[0].status
				};
			}
		} catch (e) {
			logger.warn('Failed to fetch testing equipment before update', e);
		}

		const updatedEquipment = await this.testingEquipmentService.updateTestingEquipment(Number(req.params.id), req.body.name, req.body.calibrationDueDate, req.body.status);
		logger.info('Updated Testing Equipment Successfully', { updatedEquipment });

		if (updatedEquipment) {
			try {
				await SystemLogFactory.getSystemLogService().createLog({
					action: 'UPDATE',
					entity: 'TestingEquipment',
					entityId: String(updatedEquipment.id),
					details: JSON.stringify({
						old: oldEquipment || {},
						new: {
							name: updatedEquipment.name,
							calibrationDueDate: updatedEquipment.calibrationDueDate,
							status: updatedEquipment.status
						}
					}),
					performedBy: (req as any).user?.username || 'Unknown'
				});
			} catch (logErr) {
				logger.error('Failed to create system log for TestingEquipment update', logErr);
			}
		}

		res.status(200).json({
			success: true,
			message: 'Updated Testing Equipment Successfully',
			data: updatedEquipment
		});
	}

	deleteTestingEquipment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Testing Equipment', { id: req.params.id });

		let oldName = '';
		try {
			const items = await this.testingEquipmentService.getTestingEquipments({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (items && items[0]) {
				oldName = items[0].name;
			}
		} catch (e) {
			logger.warn('Failed to fetch testing equipment before delete', e);
		}

		const isDeleted = await this.testingEquipmentService.deleteTestingEquipment(Number(req.params.id));
		logger.info('Deleted Testing Equipment Successfully', { isDeleted });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'DELETE',
				entity: 'TestingEquipment',
				entityId: String(req.params.id),
				details: JSON.stringify({ name: oldName, success: isDeleted }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for TestingEquipment deletion', logErr);
		}

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

	getWeeklyAnalytics = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const month = req.query.month as string;
			const equipmentId = req.query.equipmentId as string;
			const testTypeId = req.query.testTypeId as string;
			if (!month) {
				throw new BadRequestError('Month query parameter (YYYY-MM) is required.');
			}
			logger.info('Fetching weekly testing equipment utilization analytics', { month, equipmentId, testTypeId });
			const analytics = await this.testingEquipmentService.getWeeklyEquipmentAnalytics(month, equipmentId, testTypeId);
			res.status(200).json({
				success: true,
				message: 'Fetched Testing Equipment Analytics Successfully',
				data: analytics
			});
		} catch (error) {
			next(error);
		}
	}
}