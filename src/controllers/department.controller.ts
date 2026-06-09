import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { IDepartmentService } from '../services/department.service';
import { SystemLogFactory } from '../factories/system-log.factory';

export class DepartmentController {

	private departmentService: IDepartmentService;
	constructor(departmentService: IDepartmentService) {
		this.departmentService = departmentService;
	}

	addDepartment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Department', { body: req.body });
		const newDepartment = await this.departmentService.addDepartment(req.body.name);
		logger.info('Department Created Successfully', { department: newDepartment });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'CREATE',
				entity: 'Department',
				entityId: String(newDepartment.id),
				details: JSON.stringify({ name: newDepartment.name }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for Department creation', logErr);
		}

		res.status(201).json({
			success: true,
			message: 'Department Created Successfully',
			data: newDepartment
		});
	}

	getDepartments = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Departments', { query: req.query });
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

		const departments = await this.departmentService.getDepartments(where, sortBy, sortOrder, skip, limit);
		logger.info('Fetched Departments Successfully', { departments: departments });
		res.status(200).json({
			success: true,
			message: 'Fetched Departments Successfully',
			data: departments,
		});
	}

	updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Updating Department', { body: req.body, id: req.params.id });

		let oldName = '';
		try {
			const depts = await this.departmentService.getDepartments({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (depts && depts[0]) {
				oldName = depts[0].name;
			}
		} catch (e) {
			logger.warn('Failed to fetch department before update', e);
		}

		const updatedDepartment = await this.departmentService.updateDepartment(Number(req.params.id), req.body.name);
		logger.info('Updated Department Successfully', { department: updatedDepartment });

		if (updatedDepartment) {
			try {
				await SystemLogFactory.getSystemLogService().createLog({
					action: 'UPDATE',
					entity: 'Department',
					entityId: String(updatedDepartment.id),
					details: JSON.stringify({
						old: { name: oldName },
						new: { name: updatedDepartment.name }
					}),
					performedBy: (req as any).user?.username || 'Unknown'
				});
			} catch (logErr) {
				logger.error('Failed to create system log for Department update', logErr);
			}
		}

		res.status(200).json({
			success: true,
			message: 'Updated Department Successfully',
			data: updatedDepartment
		});
	}

	deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Department', { id: req.params.id });

		let oldName = '';
		try {
			const depts = await this.departmentService.getDepartments({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			if (depts && depts[0]) {
				oldName = depts[0].name;
			}
		} catch (e) {
			logger.warn('Failed to fetch department before delete', e);
		}

		const deleteDepartment = await this.departmentService.deleteDepartment(Number(req.params.id));
		logger.info('Deleted Department Successfully', { data: deleteDepartment });

		try {
			await SystemLogFactory.getSystemLogService().createLog({
				action: 'DELETE',
				entity: 'Department',
				entityId: String(req.params.id),
				details: JSON.stringify({ name: oldName, success: deleteDepartment }),
				performedBy: (req as any).user?.username || 'Unknown'
			});
		} catch (logErr) {
			logger.error('Failed to create system log for Department deletion', logErr);
		}

		res.status(200).json({
			success: true,
			message: 'Deleted Department Successfully',
			data: deleteDepartment
		});
	}
}