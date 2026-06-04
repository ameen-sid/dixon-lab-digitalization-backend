import { CapaRepository, CreateCapaInput } from '../repositories/capa.repository';

export class CapaService {
	constructor(private repo: CapaRepository) {}

	async create(data: CreateCapaInput) {
		return await this.repo.create(data);
	}

	async getAll(where: any = {}) {
		return await this.repo.findAll(where);
	}

	async getById(id: number) {
		return await this.repo.findById(id);
	}

	async getByCapaId(capaId: string) {
		return await this.repo.findByCapaId(capaId);
	}

	async updateStatus(id: number, status: string, remark?: string) {
		return await this.repo.updateStatus(id, status, remark);
	}

	async updateStatusByCapaId(capaId: string, status: string, remark?: string) {
		return await this.repo.updateStatusByCapaId(capaId, status, remark);
	}
}