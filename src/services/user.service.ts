import { User } from '@prisma/client';
import { IUserRepository } from '../repositories/user.repository';
import { BadRequestError, ConflictError } from '../utils/errors/app.error';

export interface IUserService {
	createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
	getUsers(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<any[]>;
	updateUser(id: number, updateData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null>;
	deleteUser(id: number): Promise<Boolean>;
}

export class UserService implements IUserService {

	private userRepository: IUserRepository;
	constructor(userRepository: IUserRepository) {
		this.userRepository = userRepository;
	}

	async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
		if (!user) throw new BadRequestError('User details are required');

		const existingUser = await this.userRepository.getUserByUsername(user.username);
		if (existingUser) throw new ConflictError(`Username '${user.username}' is already taken`);

		return await this.userRepository.createUser(user);
	}

	async getUsers(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<any[]> {
		return await this.userRepository.getUsers(where, sortBy, sortOrder, skip, limit);
	}

	async updateUser(id: number, updateData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
		if (!updateData) throw new BadRequestError('User details are required');
		return await this.userRepository.updateUser(id, updateData);
	}

	async deleteUser(id: number): Promise<Boolean> {
		return await this.userRepository.deleteUser(id);
	}
}