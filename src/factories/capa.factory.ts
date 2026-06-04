import { CapaRepository } from '../repositories/capa.repository';
import { CapaService } from '../services/capa.service';
import { CapaController } from '../controllers/capa.controller';

export class CapaFactory {
	private static capaRepository: CapaRepository;
	private static capaService: CapaService;
	private static capaController: CapaController;

	static getCapaRepository(): CapaRepository {
		if (!this.capaRepository) this.capaRepository = new CapaRepository();
		return this.capaRepository;
	}

	static getCapaService(): CapaService {
		if (!this.capaService) this.capaService = new CapaService(this.getCapaRepository());
		return this.capaService;
	}

	static getCapaController(): CapaController {
		if (!this.capaController) this.capaController = new CapaController(this.getCapaService());
		return this.capaController;
	}
}