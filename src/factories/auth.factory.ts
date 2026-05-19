import { UserFactory } from './user.factory';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';

export class AuthFactory {

	private static authService: AuthService;
	private static authController: AuthController;

	static getAuthService(): AuthService {
		if (!this.authService)	this.authService = new AuthService(UserFactory.getUserRepository());
		return this.authService;
	}

	static getAuthController(): AuthController {
		if (!this.authController)	this.authController = new AuthController(this.getAuthService());
		return this.authController;
	}
}