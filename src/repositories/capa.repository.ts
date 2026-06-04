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
	owner?: string;

	// Extended fields
	partProduct?: string;
	modelName?: string;
	customerSupplier?: string;
	date?: string;
	result?: string;
	title?: string;
	improvementType?: string;
	partName?: string;
	problem?: string;
	model?: string;
	defectQty?: string;
	venue?: string;
	imageUrl?: string;
	why1?: string;
	why2?: string;
	why3?: string;
	why4?: string;
	undetectedWhy1?: string;
	undetectedWhy2?: string;
	undetectedWhy3?: string;
	tempCountermeasure?: string;
	radicalCountermeasure?: string;
	inspectionControl?: string;
	processControl?: string;
	beforeImprovementImgUrl?: string;
	afterImprovementImgUrl?: string;
	preventionImgUrl?: string;
	remark?: string;

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

	async updateStatus(id: number, status: string) {
		return await prisma.capaReport.update({
			where: { id },
			data: { status }
		});
	}
}