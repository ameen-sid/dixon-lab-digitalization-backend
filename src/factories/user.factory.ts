import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';

export class UserFactory {

	private static userRepository: UserRepository;
	private static userService: UserService;
	private static userController: UserController;

	static getUserRepository(): UserRepository {
		if (!this.userRepository) this.userRepository = new UserRepository();
		return this.userRepository;
	}

	static getUserService(): UserService {
		if (!this.userService) this.userService = new UserService(this.getUserRepository());
		return this.userService;
	}

	static getUserController(): UserController {
		if (!this.userController) this.userController = new UserController(this.getUserService());
		return this.userController;
	}
}