import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { CapaService } from '../services/capa.service';

export class CapaController {
	constructor(private capaService: CapaService) {}

	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const currentUser = (req as any).user;
			const b = req.body; // all strings when coming from FormData/multipart
			logger.info('Creating CAPA report', { userId: currentUser?.id, body: b });

			// Build a safe CAPA ID
			const capaCount = await this.capaService.getAll({});
			const nextId = capaCount.length + 1;
			const currentYear = new Date().getFullYear();
			const capaId = `CAPA-${currentYear}-${String(nextId).padStart(3, '0')}`;

			// Resolve uploaded file public URLs
			const uploadedFiles = req.files as { [f: string]: Express.Multer.File[] } | undefined;
			const toUrl = (field: string): string | null => {
				const arr = uploadedFiles?.[field];
				if (!arr?.length) return null;
				const p = arr[0].path.replace(/\\/g, '/');
				const i = p.indexOf('uploads/');
				return i !== -1 ? '/' + p.slice(i) : null;
			};

			// Explicitly map ONLY fields that exist in the CapaReport Prisma model
			const data = {
				capaId,
				relatedRequest:         String(b.relatedRequest         || ''),
				productName:            String(b.productName            || `${b.partProduct || ''} ${b.modelName || ''}`.trim()),
				nonConformity:          String(b.nonConformity          || b.problem || b.title || ''),
				rootCause:              String(b.rootCause              || b.why1    || ''),
				correctiveAction:       String(b.correctiveAction       || b.tempCountermeasure   || ''),
				preventiveAction:       String(b.preventiveAction       || b.radicalCountermeasure || ''),
				targetedDate:           String(b.targetedDate           || b.targetDate || ''),
				status:                 String(b.status                 || 'OPEN'),
				owner:                  String(currentUser?.name        || b.owner || 'Lab Team'),

				// Extended optional fields
				partProduct:            b.partProduct            ? String(b.partProduct)            : null,
				modelName:              b.modelName              ? String(b.modelName)              : null,
				customerSupplier:       b.customerSupplier       ? String(b.customerSupplier)       : null,
				date:                   b.date                   ? String(b.date)                   : null,
				result:                 b.result                 ? String(b.result)                 : null,
				title:                  b.title                  ? String(b.title)                  : null,
				improvementType:        b.improvementType        ? String(b.improvementType)        : null,
				partName:               b.partName               ? String(b.partName)               : null,
				problem:                b.problem                ? String(b.problem)                : null,
				model:                  b.model                  ? String(b.model)                  : null,
				defectQty:              b.defectQty              ? String(b.defectQty)              : null,
				venue:                  b.venue                  ? String(b.venue)                  : null,
				why1:                   b.why1                   ? String(b.why1)                   : null,
				why2:                   b.why2                   ? String(b.why2)                   : null,
				why3:                   b.why3                   ? String(b.why3)                   : null,
				why4:                   b.why4                   ? String(b.why4)                   : null,
				undetectedWhy1:         b.undetectedWhy1         ? String(b.undetectedWhy1)         : null,
				undetectedWhy2:         b.undetectedWhy2         ? String(b.undetectedWhy2)         : null,
				undetectedWhy3:         b.undetectedWhy3         ? String(b.undetectedWhy3)         : null,
				tempCountermeasure:     b.tempCountermeasure     ? String(b.tempCountermeasure)     : null,
				radicalCountermeasure:  b.radicalCountermeasure  ? String(b.radicalCountermeasure)  : null,
				inspectionControl:      b.inspectionControl      ? String(b.inspectionControl)      : null,
				processControl:         b.processControl         ? String(b.processControl)         : null,
				remark:                 b.remark                 ? String(b.remark)                 : null,

				// Image URLs — prefer freshly uploaded files, fallback to any string passed
				imageUrl:               toUrl('imageFile')             ?? (b.imageUrl               ? String(b.imageUrl)               : null),
				beforeImprovementImgUrl: toUrl('beforeImprovementFile') ?? (b.beforeImprovementImgUrl ? String(b.beforeImprovementImgUrl) : null),
				afterImprovementImgUrl:  toUrl('afterImprovementFile')  ?? (b.afterImprovementImgUrl  ? String(b.afterImprovementImgUrl)  : null),
				preventionImgUrl:        toUrl('preventionFile')         ?? (b.preventionImgUrl         ? String(b.preventionImgUrl)         : null),

				// FK — must be Int
				submittedById: currentUser?.id ? Number(currentUser.id) : Number(b.submittedById),
			};

			const capa = await this.capaService.create(data);
			logger.info('CAPA report created', { id: capa.id, capaId });
			res.status(201).json({ success: true, message: 'CAPA created successfully', data: capa });
		} catch (err) {
			logger.error('Error creating CAPA report', { err });
			next(err);
		}
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
		const idParam = req.params.id as string;
		let capa;
		if (idParam && idParam.startsWith('CAPA-')) {
			capa = await this.capaService.getByCapaId(idParam);
		} else {
			const id = Number(idParam);
			capa = await this.capaService.getById(isNaN(id) ? 0 : id);
		}
		if (!capa) {
			res.status(404).json({ success: false, message: 'CAPA not found' });
			return;
		}
		res.status(200).json({ success: true, data: capa });
	};

	updateStatus = async (req: Request, res: Response, next: NextFunction) => {
		const idParam = req.params.id as string;
		const { status, remark } = req.body;
		let updated;
		if (idParam && idParam.startsWith('CAPA-')) {
			updated = await this.capaService.updateStatusByCapaId(idParam, status, remark);
		} else {
			const id = Number(idParam);
			updated = await this.capaService.updateStatus(isNaN(id) ? 0 : id, status, remark);
		}
		res.status(200).json({ success: true, message: 'CAPA status updated', data: updated });
	};
}