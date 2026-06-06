import { z } from 'zod';

const ROLES = ['Admin', 'CEO', 'Head', 'Lab Manager', 'Engineer', 'Inspector', 'Requester'];

export const createUserSchema = z.object({
	name: z.string().min(1, 'Name cannot be empty').trim(),
	username: z.string().min(3, 'Username cannot be empty').trim(),
	password: z.string().min(4, 'Password must be at least 4 characters'),
	role: z.enum(ROLES as [string, ...string[]]).default('Requester'),
	departmentId: z.number().nullable().optional(),
	email: z.string().email('Invalid email address').trim()
});

export const updateUserSchema = z.object({
	name: z.string().optional(),
	username: z.string().optional(),
	password: z.string().optional(),
	role: z.enum(ROLES as [string, ...string[]]).optional(),
	departmentId: z.number().nullable().optional(),
	email: z.string().email('Invalid email address').trim().optional()
});

export const userQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    role: z.string().optional(),
    departmentId: z.string().regex(/^\d+$/, "Department ID must be a numeric string").optional(),
    sortBy: z.enum(['id', 'name', 'username', 'role', 'createdAt', 'updatedAt', 'departmentId']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
});


export const userIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, "User ID must be a numeric string")
});