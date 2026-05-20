import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { IUserService } from '../services/user.service';

export class UserController {

	private userService: IUserService;
	constructor(userService: IUserService) {
		this.userService = userService;
	}

	createUser = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Creating User', { body: req.body });
		if (!['Admin', 'CEO', 'ceo'].includes(req.body.role) && !req.body.departmentId) {
			res.status(400).json({
				success: false,
				message: `User with the ${req.body.role} role must be assigned to a department`
			});
			return;
		}

		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		const newUser = await this.userService.createUser({
			name: req.body.name,
			username: req.body.username.toLowerCase().trim(),
			role: req.body.role,
			password: hashedPassword,
			departmentId: req.body.departmentId ? parseInt(req.body.departmentId.toString()) : null
		});
		const { password: _, ...userWithoutPassword } = newUser;
		logger.info('User Created Successfully', { user: userWithoutPassword });
		res.status(201).json({
			success: true,
			message: 'User Created Successfully',
			data: userWithoutPassword
		});
	}

	getUsers = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Fetching Users', { query: req.query });
		const page = Math.max(1, parseInt(req.query.page as string || '1'));
		const limit = Math.max(1, parseInt(req.query.limit as string || '10'));
		const search = (req.query.search as string || '').trim();
		const role = (req.query.role as string || '').trim();
		const departmentId = (req.query.departmentId as string || '').trim();
		const sortBy = (req.query.sortBy as string || 'createdAt');
		const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

		const skip = (page - 1) * limit;
		const where: any = {};
		if (search) {
			where.OR = [
				{ name: { contains: search } },
				{ username: { contains: search } }
			];
		}
		if (role) where.role = role;
		if (departmentId) where.departmentId = parseInt(departmentId);

		const users = await this.userService.getUsers(where, sortBy, sortOrder, skip, limit);
		logger.info('Fetched Users Successfully', { users: users });
		res.status(200).json({
			success: true,
			message: 'Fetched Users Successfully',
			data: users
		});
	}

	updateUser = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Updating User', { body: req.body, id: req.params.id });
		const updateData: any = {};
		if (req.body.name) updateData.name = req.body.name;
		if (req.body.username) updateData.username = req.body.username.toLowerCase().trim();
		if (req.body.role) updateData.role = req.body.role;
		if (req.body.departmentId !== undefined) {
			updateData.departmentId = req.body.departmentId ? parseInt(req.body.departmentId.toString()) : null;
		}
		if (req.body.password && req.body.password.trim() !== '') {
			updateData.password = await bcrypt.hash(req.body.password, 10);
		}

		const targetRole = req.body.role;
		const targetDeptId = req.body.departmentId;
		if (targetRole !== undefined || targetDeptId !== undefined) {
			const existingUsers = await this.userService.getUsers({ id: Number(req.params.id) }, 'id', 'asc', 0, 1);
			const currentUser = existingUsers[0];
			if (!currentUser) {
				res.status(404).json({
					success: false,
					message: 'User not found'
				});
				return;
			}

			const finalRole = targetRole !== undefined ? targetRole : currentUser.role;
			const finalDeptId = targetDeptId !== undefined
				? (targetDeptId ? parseInt(targetDeptId.toString()) : null)
				: currentUser.departmentId;

			if (!['Admin', 'CEO', 'ceo'].includes(finalRole) && !finalDeptId) {
				res.status(400).json({
					success: false,
					message: `User with the ${finalRole} role must be assigned to a department`
				});
				return;
			}
		}

		const updatedUser = await this.userService.updateUser(Number(req.params.id), updateData);
		if (!updatedUser) {
			res.status(404).json({
				success: false,
				message: 'User not found',
			});
			return;
		}

		const { password: _, ...userWithoutPassword } = updatedUser;
		logger.info('User Updated Successfully', { updatedUser: userWithoutPassword });
		res.status(200).json({
			success: true,
			message: 'User Updated Successfully',
			data: userWithoutPassword
		});
	}

	deleteUser = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Deleting User', { id: req.params.id });
		const user = await this.userService.deleteUser(Number(req.params.id));
		logger.info('User Deleted Successfully', { data: user });
		res.status(200).json({
			success: true,
			message: 'User Deleted Successfully',
			data: user
		});
	}
}