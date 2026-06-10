import { CapaRepository, CreateCapaInput } from '../repositories/capa.repository';
import { NotificationService } from './notification.service';
import logger from '../configs/logger.config';

export class CapaService {
	constructor(private repo: CapaRepository) {}

	async create(data: CreateCapaInput) {
		const capa = await this.repo.create(data);
		NotificationService.notifyHeadsOfCapaSubmission(capa.id).catch(err => {
			logger.error('Failed to trigger CAPA submission notification', err);
		});
		return capa;
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
		const result = await this.repo.updateStatus(id, status, remark);
		if (status === 'CLOSED') {
			NotificationService.notifyOwnerOfCapaClosure(result.id).catch(err => {
				logger.error('Failed to trigger CAPA closure notification', err);
			});
		}
		return result;
	}

	async updateStatusByCapaId(capaId: string, status: string, remark?: string) {
		const result = await this.repo.updateStatusByCapaId(capaId, status, remark);
		if (status === 'CLOSED') {
			NotificationService.notifyOwnerOfCapaClosure(result.id).catch(err => {
				logger.error('Failed to trigger CAPA closure notification', err);
			});
		}
		return result;
	}
}