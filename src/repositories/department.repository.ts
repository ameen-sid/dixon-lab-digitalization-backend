import { prisma } from '../configs/prisma.config';
import { Department } from '@prisma/client';
import { ConflictError, NotFoundError } from '../utils/errors/app.error';

export interface IDepartmentRepository {
	addDepartment(name: string): Promise<Department>;
	getDepartments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<Department[]>;
	updateDepartment(id: number, name: string): Promise<Department | null>;
	deleteDepartment(id: number): Promise<Boolean>;
}

export class DepartmentRepository implements IDepartmentRepository {
	async addDepartment(name: string): Promise<Department> {
		return await prisma.department.create({ data: { name: name.trim() }});
	}

	async getDepartments(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<Department[]> {
		return await prisma.department.findMany({
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit
		});
	}

	async updateDepartment(id: number, name: string): Promise<Department | null> {
		return await prisma.department.update({
			where: { id },
			data: { name: name.trim() }
		});
	}

	async deleteDepartment(id: number): Promise<Boolean> {
		try {
			await prisma.department.delete({ where: { id } });
			return true;
		} catch (error: any) {
			if (error.code === 'P2025') throw new NotFoundError('Department not found');
			if (error.code === 'P2003') throw new ConflictError('Cannot delete department because user are assigned to it');
			throw error;
		}
	}
}