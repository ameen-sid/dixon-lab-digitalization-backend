import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { IAuthService } from '../services/auth.service';

export class AuthController {

	private authService: IAuthService;
	constructor(authService: IAuthService) {
		this.authService = authService;
	}

	login = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('Authenticating User', { username: req.body.username });
		const { token, user } = await this.authService.login(req.body.username, req.body.password);
		logger.info('User Authenticated Successfully', { username: user.username, role: user.role });
		res.status(200).json({
			success: true,
			message: 'Login Successful',
			data: {
				token,
				user
			}
		});
	}

	logout = async (req: Request, res: Response, next: NextFunction) => {
		logger.info('User Logging Out');
		// Stateless JWT logout is handled on client by clearing the token
		res.status(200).json({
			success: true,
			message: 'Logged Out Successfully'
		});
	}
}