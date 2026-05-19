import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { serverConfig } from '../configs';
import { User } from '@prisma/client';
import { IUserRepository } from '../repositories/user.repository';
import { UnauthorizedError } from '../utils/errors/app.error';

export interface IAuthService {
	login(username: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> }>;
}

export class AuthService implements IAuthService {

	private userRepository: IUserRepository;
	constructor(userRepository: IUserRepository) {
		this.userRepository = userRepository;
	}

	async login(username: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> }> {
		const user = await this.userRepository.getUserByUsername(username);
		if (!user)	throw new UnauthorizedError('Invalid username or password');

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid)	throw new UnauthorizedError('Invalid username or password');

		const token = jwt.sign(
			{
				id: user.id,
				username: user.username,
				role: user.role,
				departmentId: user.departmentId
			},
			serverConfig.JWT_SECRET,
			{ expiresIn: serverConfig.JWT_EXPIRES_IN as any }
		);

		const { password: _, ...userWithoutPassword } = user;
		return {
			token,
			user: userWithoutPassword
		};
	}
}