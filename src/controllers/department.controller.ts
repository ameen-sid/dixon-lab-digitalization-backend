import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { IDepartmentService } from '../services/department.service';

export class DepartmentController {

	private departmentService: IDepartmentService;
	constructor(departmentService: IDepartmentService) {
		this.departmentService = departmentService;
	}

	addDepartment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating Department', { body: req.body });
		const newDepartment = await this.departmentService.addDepartment(req.body.name);
		logger.info('Department Created Successfully', { department: newDepartment });
		res.status(201).json({
			success: true,
			message: 'Department Created Successfully',
			data: newDepartment
		});
	}

	getDepartments = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Departments', { query: req.query });
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
		const updatedDepartment = await this.departmentService.updateDepartment(Number(req.params.id), req.body.name);
		logger.info('Updated Department Successfully', { department: updatedDepartment });
		res.status(200).json({
			success: true,
			message: 'Updated Department Successfully',
			data: updatedDepartment
		});
	}

	deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting Department', { id: req.params.id });
		const deleteDepartment = await this.departmentService.deleteDepartment(Number(req.params.id));
		logger.info('Deleted Department Successfully', { data: deleteDepartment });
		res.status(200).json({
			success: true,
			message: 'Deleted Department Successfully',
			data: deleteDepartment
		});
	}
}