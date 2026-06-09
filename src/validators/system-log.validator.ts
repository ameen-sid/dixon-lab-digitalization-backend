import { z } from 'zod';

export const systemLogQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	entity: z.string().optional(),
	action: z.string().optional(),
	sortBy: z.enum(['id', 'action', 'entity', 'entityId', 'performedBy', 'createdAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});
