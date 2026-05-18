import { z } from 'zod';

export const createDepartmentSchema = z.object({
	name: z.string().min(1, 'Department name cannot be empty').trim()
});

export const updateDepartmentSchema = z.object({
	name: z.string().min(1, 'Department name cannot be empty').trim()
});

export const departmentQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(['id', 'name', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});

export const departmentIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, 'Department ID must be a numeric string')
});