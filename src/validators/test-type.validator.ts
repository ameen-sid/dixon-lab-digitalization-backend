import { z } from 'zod';

export const createTestTypeSchema = z.object({
	name: z.string().min(1, 'Test type name cannot be empty').trim()
});

export const updateTestTypeSchema = z.object({
	name: z.string().min(1, 'Test type name cannot be empty').trim()
});

export const testTypeQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(['id', 'name', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});

export const testTypeIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, 'Test type ID must be a numeric string')
});