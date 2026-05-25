import { z } from 'zod';

export const createProductPartSchema = z.object({
	name: z.string().min(1, 'Product part name cannot be empty').trim(),
	partNo: z.string().min(1, 'Product part no cannot be empty').trim()
});

export const updateProductPartSchema = createProductPartSchema.partial();

export const productPartQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(['id', 'name', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});

export const productPartIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, 'Product part ID must be a numeric string')
});