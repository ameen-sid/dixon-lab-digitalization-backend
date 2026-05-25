import { z } from 'zod';

export const createSupplierCustomerSchema = z.object({
	name: z.string().min(1, 'Supplier customer name cannot be empty').trim()
});

export const updateSupplierCustomerSchema = createSupplierCustomerSchema.partial();

export const supplierCustomerQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(['id', 'name', 'createdAt', 'updatedAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});

export const supplierCustomerIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, 'Supplier customer ID must be a numeric string')
});