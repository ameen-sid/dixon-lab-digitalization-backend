import { z } from 'zod';

export const createTestProtocolSchema = z.object({
	name: z.string().min(1, 'Test protocol name cannot be empty').trim(),
	testTypeId: z.union([
		z.number().int().positive(),
		z.string().regex(/^\d+$/).transform(Number)
	]),
	testCategoryId: z.union([
		z.number().int().positive(),
		z.string().regex(/^\d+$/).transform(Number)
	]),
	productType: z.string().min(1, 'Test protocol productType cannot be empty').trim(),
	testMethod: z.string().min(1, 'Test protocol testMethod cannot be empty').trim(),
	judgementCriteria: z.string().min(1, 'Test protocol judgementCriteria cannot be empty').trim()
});

export const updateTestProtocolSchema = createTestProtocolSchema.partial();

export const testProtocolQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(['id', 'name', 'testTypeId', 'testCategoryId', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});

export const testProtocolIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, 'Test protocol ID must be a numeric string')
});