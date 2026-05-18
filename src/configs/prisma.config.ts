import { PrismaClient } from '@prisma/client';

declare global {
	// Allow global sharing of prisma instance in development to prevent duplicate connections
	var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
	log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma;
}