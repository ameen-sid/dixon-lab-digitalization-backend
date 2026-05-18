import { DepartmentRepository } from '../repositories/department.repository';
import { DepartmentService } from '../services/department.service';
import { DepartmentController } from '../controllers/department.controller';

export class DepartmentFactory {

	private static departmentRepository: DepartmentRepository;
	private static departmentService: DepartmentService;
	private static departmentController: DepartmentController;

	static getDepartmentRepository(): DepartmentRepository {
		if (!this.departmentRepository) this.departmentRepository = new DepartmentRepository();
		return this.departmentRepository;
	}

	static getDepartmentService(): DepartmentService {
		if (!this.departmentService) this.departmentService = new DepartmentService(this.getDepartmentRepository());
		return this.departmentService;
	}

	static getDepartmentController(): DepartmentController {
		if (!this.departmentController) this.departmentController = new DepartmentController(this.getDepartmentService());
		return this.departmentController;
	}
}