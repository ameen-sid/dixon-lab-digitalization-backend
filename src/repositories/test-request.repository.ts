import { TestRequest, TestRequestAttachment, Prisma } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface CreateTestRequestInput {
	customerNameAddress: string;
	manufacturerNameAddress: string;
	customerContactDetails: string;
	sampleDescription: string;
	modelNo: string;
	familyModel?: string | null;
	serialNumber?: string | null;
	productRating: string;
	sampleQty: number | string;
	brandName: string;
	attachmentMention?: string | null;
	witnessRequired: string;
	witnessPersonDetails?: string | null;
	testMethodRef: string;
	conformityStatement: string;
	decisionRule?: string | null;
	collectBack: string;
	requesterId: number | string;
}

export interface ITestRequestRepository {
	addTestRequest(data: CreateTestRequestInput, attachments: { fileName: string; filePath: string; fileSize: number }[]): Promise<TestRequest>;
	getTestRequests(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestRequest[]>;
	getTestRequestById(id: number): Promise<(TestRequest & { attachments: TestRequestAttachment[]; sampleInspections: any[] }) | null>;
	updateTestRequest(id: number, data: Prisma.TestRequestUpdateInput): Promise<TestRequest | null>;
}

export class TestRequestRepository implements ITestRequestRepository {
	async addTestRequest(data: CreateTestRequestInput, attachments: { fileName: string; filePath: string; fileSize: number }[]): Promise<TestRequest> {
		const lastRecord = await prisma.testRequest.findFirst({ orderBy: { id: 'desc' } });
		const nextId = lastRecord ? lastRecord.id + 1 : 1;
		const currentYear = new Date().getFullYear();
		const uniqueId = `REQ-${currentYear}-${String(nextId).padStart(3, '0')}`;

		return await prisma.testRequest.create({
			data: {
				requestId: uniqueId,
				customerNameAddress: data.customerNameAddress.trim(),
				manufacturerNameAddress: data.manufacturerNameAddress.trim(),
				customerContactDetails: data.customerContactDetails.trim(),
				sampleDescription: data.sampleDescription.trim(),
				modelNo: data.modelNo.trim(),
				familyModel: data.familyModel ? data.familyModel.trim() : null,
				serialNumber: data.serialNumber ? data.serialNumber.trim() : null,
				productRating: data.productRating.trim(),
				sampleQty: Number(data.sampleQty),
				brandName: data.brandName.trim(),
				attachmentMention: data.attachmentMention ? data.attachmentMention.trim() : null,
				witnessRequired: data.witnessRequired || 'No',
				witnessPersonDetails: data.witnessPersonDetails ? data.witnessPersonDetails.trim() : null,
				testMethodRef: data.testMethodRef.trim(),
				conformityStatement: data.conformityStatement || 'not Required',
				decisionRule: data.decisionRule ? data.decisionRule.trim() : null,
				collectBack: data.collectBack || 'No',
				status: 'PENDING_APPROVAL',
				requesterId: Number(data.requesterId),
				attachments: { create: attachments }
			},
			include: { attachments: true }
		});
	}

	async getTestRequests(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestRequest[]> {
		return await prisma.testRequest.findMany({
			where,
			orderBy: { [sortBy]: sortOrder },
			skip,
			take: limit,
			include: {
				attachments: true,
				sampleInspections: true,
				requester: {
					select: { id: true, name: true, username: true, role: true }
				},
				assignedTo: {
					select: { id: true, name: true, username: true, role: true }
				}
			}
		});
	}

	async getTestRequestById(id: number): Promise<(TestRequest & { attachments: TestRequestAttachment[]; sampleInspections: any[] }) | null> {
		return await prisma.testRequest.findUnique({
			where: { id },
			include: {
				attachments: true,
				sampleInspections: true,
				requester: {
					select: { id: true, name: true, username: true, role: true }
				},
				assignedTo: {
					select: { id: true, name: true, username: true, role: true }
				}
			}
		});
	}

	async updateTestRequest(id: number, data: Prisma.TestRequestUpdateInput): Promise<TestRequest | null> {
		return await prisma.testRequest.update({
			where: { id },
			data: { ...data },
			include: { attachments: true }
		});
	}
}