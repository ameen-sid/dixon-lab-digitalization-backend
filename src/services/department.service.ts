import { Department } from '@prisma/client';
import { IDepartmentRepository } from '../repositories/department.repository';
import { BadRequestError } from '../utils/errors/app.error';

export interface IDepartmentService {
	addDepartment(name: string): Promise<Department>;
	getDepartments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<Department[]>;
	updateDepartment(id: number, name: string): Promise<Department | null>;
	deleteDepartment(id: number): Promise<Boolean>;
}

export class DepartmentService implements IDepartmentService {

	private departmentRepository: IDepartmentRepository;
	constructor(departmentRepository: IDepartmentRepository) {
		this.departmentRepository = departmentRepository;
	}

	async addDepartment(name: string): Promise<Department> {
		if (!name) throw new BadRequestError('Department name is required');
		return await this.departmentRepository.addDepartment(name);
	}

	async getDepartments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<Department[]> {
		return await this.departmentRepository.getDepartments(where, sortBy, sortOrder, skip, limit);
	}

	async updateDepartment(id: number, name: string): Promise<Department | null> {
		if (!name) throw new BadRequestError('Department name is required');
		return await this.departmentRepository.updateDepartment(id, name);
	}

	async deleteDepartment(id: number): Promise<Boolean> {
		return await this.departmentRepository.deleteDepartment(id);
	}
}