import { z } from 'zod';

export const createTestCategorySchema = z.object({
	name: z.string().min(1, 'Test category name cannot be empty').trim(),
	testTypeId: z.union([
		z.number().int().positive(),
		z.string().regex(/^\d+$/).transform(Number)
	])
});

export const updateTestCategorySchema = createTestCategorySchema.partial();

export const testCategoryQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(['id', 'name', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});

export const testCategoryIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, 'Test category ID must be a numeric string')
});