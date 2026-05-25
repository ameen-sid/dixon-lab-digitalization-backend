import { z } from 'zod';

export const createTestingEquipmentSchema = z.object({
	name: z.string().min(1, 'Testing equipment name cannot be empty').trim(),
	calibrationDueDate: z.preprocess((arg) => {
		if (typeof arg === 'string' && arg.trim() === '') return null;
		if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
		return arg;
	}, z.date().nullable().optional()),
	status: z.string().trim().optional()
});

export const updateTestingEquipmentSchema = createTestingEquipmentSchema.partial();

export const testingEquipmentQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(['id', 'name', 'calibrationDueDate', 'status', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});

export const testingEquipmentIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, 'Testing equipment ID must be a numeric string')
});