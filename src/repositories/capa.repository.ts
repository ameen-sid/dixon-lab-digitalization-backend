import { prisma } from '../configs/prisma.config';

export interface CreateCapaInput {
	capaId: string;
	relatedRequest: string;
	productName: string;
	nonConformity: string;
	rootCause: string;
	correctiveAction: string;
	preventiveAction: string;
	targetedDate: string;
	status: string;
	owner?: string | null;

	// Extended fields — all nullable since they come from FormData as strings
	partProduct?: string | null;
	modelName?: string | null;
	customerSupplier?: string | null;
	date?: string | null;
	result?: string | null;
	title?: string | null;
	improvementType?: string | null;
	partName?: string | null;
	problem?: string | null;
	model?: string | null;
	defectQty?: string | null;
	venue?: string | null;
	imageUrl?: string | null;
	why1?: string | null;
	why2?: string | null;
	why3?: string | null;
	why4?: string | null;
	undetectedWhy1?: string | null;
	undetectedWhy2?: string | null;
	undetectedWhy3?: string | null;
	tempCountermeasure?: string | null;
	radicalCountermeasure?: string | null;
	inspectionControl?: string | null;
	processControl?: string | null;
	beforeImprovementImgUrl?: string | null;
	afterImprovementImgUrl?: string | null;
	preventionImgUrl?: string | null;
	remark?: string | null;

	submittedById: number;
}


export class CapaRepository {
	async create(data: CreateCapaInput) {
		return await prisma.capaReport.create({ data });
	}

	async findAll(where: any = {}) {
		return await prisma.capaReport.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			include: {
				submittedBy: {
					select: { id: true, name: true, username: true, role: true }
				}
			}
		});
	}

	async findById(id: number) {
		return await prisma.capaReport.findUnique({
			where: { id },
			include: {
				submittedBy: {
					select: { id: true, name: true, username: true, role: true }
				}
			}
		});
	}

	async findByCapaId(capaId: string) {
		return await prisma.capaReport.findUnique({
			where: { capaId },
			include: {
				submittedBy: {
					select: { id: true, name: true, username: true, role: true }
				}
			}
		});
	}

	async updateStatus(id: number, status: string, remark?: string) {
		return await prisma.capaReport.update({
			where: { id },
			data: { status, remark }
		});
	}

	async updateStatusByCapaId(capaId: string, status: string, remark?: string) {
		return await prisma.capaReport.update({
			where: { capaId },
			data: { status, remark }
		});
	}
}