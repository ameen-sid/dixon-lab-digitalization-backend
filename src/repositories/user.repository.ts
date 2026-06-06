import { prisma } from '../configs/prisma.config';
import { User } from '@prisma/client';

export interface IUserRepository {
	createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
	getUsers(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<Omit<User, 'password' | 'updatedAt'>[]>;
	updateUser(id: number, updateData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null>;	
	deleteUser(id: number): Promise<Boolean>;
	getUserByUsername(username: string): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
	async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
		return await prisma.user.create({ data: user });
	}

	async getUsers(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<Omit<User, 'password' | 'updatedAt'>[]> {
		return await prisma.user.findMany({
			where,
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				role: true,
				createdAt: true,
				departmentId: true
			},
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit
		});
	}

	async updateUser(id: number, updateData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
		return await prisma.user.update({
			where: { id },
			data: updateData
		});
	}

	async deleteUser(id: number): Promise<Boolean> {
		return await prisma.user.delete({ where: { id } }) ? true : false;
	}

	async getUserByUsername(username: string): Promise<User | null> {
		return await prisma.user.findUnique({ where: { username } });
	}
}