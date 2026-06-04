import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { CapaService } from '../services/capa.service';

export class CapaController {
	constructor(private capaService: CapaService) {}

	create = async (req: Request, res: Response, next: NextFunction) => {
		const currentUser = (req as any).user;
		logger.info('Creating CAPA report', { body: req.body, userId: currentUser?.id });

		const capaCount = await this.capaService.getAll({});
		const nextId = capaCount.length + 1;
		const currentYear = new Date().getFullYear();
		const capaId = `CAPA-${currentYear}-${String(nextId).padStart(3, '0')}`;

		const data = {
			...req.body,
			capaId,
			submittedById: currentUser?.id || req.body.submittedById,
			owner: currentUser?.name || req.body.owner || 'Lab Team',
		};

		const capa = await this.capaService.create(data);
		logger.info('CAPA report created', { id: capa.id });
		res.status(201).json({ success: true, message: 'CAPA created successfully', data: capa });
	};

	getAll = async (req: Request, res: Response, next: NextFunction) => {
		const currentUser = (req as any).user;
		logger.info('Fetching CAPA reports', { userId: currentUser?.id, role: currentUser?.role });

		const where: any = {};
		// Requester and Manager see only their own CAPAs
		if (currentUser?.role?.toLowerCase() === 'requester' || currentUser?.role?.toLowerCase() === 'lab manager') {
			where.submittedById = currentUser.id;
		}
		// Head sees all

		const capas = await this.capaService.getAll(where);
		res.status(200).json({ success: true, message: 'Fetched CAPA reports', data: capas });
	};

	getById = async (req: Request, res: Response, next: NextFunction) => {
		const id = Number(req.params.id);
		const capa = await this.capaService.getById(id);
		if (!capa) {
			res.status(404).json({ success: false, message: 'CAPA not found' });
			return;
		}
		res.status(200).json({ success: true, data: capa });
	};

	updateStatus = async (req: Request, res: Response, next: NextFunction) => {
		const id = Number(req.params.id);
		const { status } = req.body;
		const updated = await this.capaService.updateStatus(id, status);
		res.status(200).json({ success: true, message: 'CAPA status updated', data: updated });
	};
}