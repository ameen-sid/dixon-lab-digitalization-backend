import { TestRequest, TestRequestAttachment } from '@prisma/client';
import { ITestRequestRepository, CreateTestRequestInput } from '../repositories/test-request.repository';
import { BadRequestError, NotFoundError } from '../utils/errors/app.error';

export interface ITestRequestService {
	addTestRequest(data: CreateTestRequestInput, attachments: { fileName: string; filePath: string; fileSize: number }[]): Promise<TestRequest>;
	getTestRequests(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestRequest[]>;
	getTestRequestById(id: number): Promise<TestRequest & { attachments: TestRequestAttachment[]; sampleInspections: any[]; testPlans: any[] }>;
	updateTestRequestStatus(id: number, status: string, remarks?: string, assignedToId?: number): Promise<TestRequest | null>;
	saveSampleInspection(testRequestId: number, data: any, uploadedFiles?: Express.Multer.File[]): Promise<any>;
	saveSampleTestPlan(testRequestId: number, data: any): Promise<any>;
	getSampleTestPlans(testRequestId: number): Promise<any[]>;
}

export class TestRequestService implements ITestRequestService {

	private testRequestRepository: ITestRequestRepository;
	constructor(testRequestRepository: ITestRequestRepository) {
		this.testRequestRepository = testRequestRepository;
	}

	async addTestRequest(data: CreateTestRequestInput, attachments: { fileName: string; filePath: string; fileSize: number }[]): Promise<TestRequest> {
		if (!data.customerNameAddress) throw new BadRequestError('Customer name and address is required');
		if (!data.manufacturerNameAddress) throw new BadRequestError('Manufacturer name and address is required');
		if (!data.customerContactDetails) throw new BadRequestError('Customer contact details is required');
		if (!data.sampleDescription) throw new BadRequestError('Sample description is required');
		if (!data.modelNo) throw new BadRequestError('Model number is required');
		if (!data.productRating) throw new BadRequestError('Product rating is required');
		if (!data.sampleQty || Number(data.sampleQty) <= 0) throw new BadRequestError('Sample quantity must be a positive number');
		if (!data.brandName) throw new BadRequestError('Brand name is required');
		if (!data.testMethodRef) throw new BadRequestError('Test method reference is required');
		if (!data.requesterId) throw new BadRequestError('Requester ID is required');

		if (data.witnessRequired === 'Yes' && !data.witnessPersonDetails)	throw new BadRequestError('Witness details are required when witness is requested');
		if (data.conformityStatement === 'Required' && !data.decisionRule)	throw new BadRequestError('Decision rule is required when conformity statement is requested');
		return await this.testRequestRepository.addTestRequest(data, attachments);
	}

	async getTestRequests(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestRequest[]> {
		return await this.testRequestRepository.getTestRequests(where, sortBy, sortOrder, skip, limit);
	}

	async getTestRequestById(id: number): Promise<TestRequest & { attachments: TestRequestAttachment[]; sampleInspections: any[]; testPlans: any[] }> {
		const request = await this.testRequestRepository.getTestRequestById(id);
		if (!request) throw new NotFoundError('Testing request not found');
		return request;
	}

	async updateTestRequestStatus(id: number, status: string, remarks?: string, assignedToId?: number): Promise<TestRequest | null> {
		const request = await this.testRequestRepository.getTestRequestById(id);
		if (!request) throw new NotFoundError('Testing request not found');

		const updateData: any = { status };
		if (remarks !== undefined) updateData.remarks = remarks;
		if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

		return await this.testRequestRepository.updateTestRequest(id, updateData);
	}

	async saveSampleInspection(testRequestId: number, data: any, uploadedFiles?: Express.Multer.File[]): Promise<any> {
		const { prisma } = await import('../configs/prisma.config');
		const checksStr = JSON.stringify(data.checks ? JSON.parse(data.checks) : {});

		// Build image paths from newly uploaded files
		const newImagePaths: string[] = (uploadedFiles || []).map(file => {
			const p = file.path.replace(/\\/g, '/');
			const i = p.indexOf('uploads/');
			const status = data.status;
			const folderName = status === 'UNDER_REVIEW' ? 'reports' : 'inspection';
			return i !== -1 ? '/' + p.slice(i) : `/uploads/${folderName}/${new Date().toISOString().split('T')[0]}/${file.filename}`;
		});

		const existing = await prisma.testSampleInspection.findFirst({
			where: {
				testRequestId,
				sampleIndex: Number(data.sampleIndex)
			}
		});

		let resultRecord: any;

		if (existing) {
			// Merge existing image paths with newly uploaded ones
			let existingPaths: string[] = [];
			try {
				existingPaths = existing.images ? JSON.parse(existing.images) : [];
			} catch {
				existingPaths = [];
			}
			const mergedPaths = [...existingPaths, ...newImagePaths];

			resultRecord = await prisma.testSampleInspection.update({
				where: { id: existing.id },
				data: {
					allottedId: data.allottedId,
					remarks: data.remarks,
					status: data.status,
					checks: checksStr,
					images: JSON.stringify(mergedPaths)
				}
			});
		} else {
			resultRecord = await prisma.testSampleInspection.create({
				data: {
					testRequestId,
					sampleIndex: Number(data.sampleIndex),
					allottedId: data.allottedId,
					remarks: data.remarks,
					status: data.status,
					checks: checksStr,
					images: JSON.stringify(newImagePaths)
				}
			});
		}

		return resultRecord;
	}

	async saveSampleTestPlan(testRequestId: number, data: any): Promise<any> {
		const { prisma } = await import('../configs/prisma.config');

		const sampleIndex = Number(data.sampleIndex);
		const testTypeId = Number(data.testTypeId);
		const testCategoryId = Number(data.testCategoryId);
		const testProtocolId = Number(data.testProtocolId);

		const planData: any = {
			testTypeId,
			testCategoryId,
			testProtocolId,
			productType: data.productType || null,
			stationNo: data.stationNo ? Number(data.stationNo) : null,
			platformNos: data.platformNos ? (typeof data.platformNos === 'string' ? data.platformNos : JSON.stringify(data.platformNos)) : null,
			equipmentId: data.equipmentId ? Number(data.equipmentId) : null,
			numberOfDays: data.numberOfDays ? Number(data.numberOfDays) : null,
			startDate: data.startDate || null,
			endDate: data.endDate || null,
			remarks: data.remarks || null,
			evaluationStatus: data.evaluationStatus || null,
			evaluationRemarks: data.evaluationRemarks || null,
			evaluatedAt: data.evaluatedAt ? new Date(data.evaluatedAt) : null,
			evaluatedBy: data.evaluatedBy || null,
		};

		const existing = await prisma.testPlan.findUnique({
			where: {
				testRequestId_sampleIndex: {
					testRequestId,
					sampleIndex
				}
			}
		});

		if (existing) {
			return await prisma.testPlan.update({
				where: { id: existing.id },
				data: planData
			});
		} else {
			return await prisma.testPlan.create({
				data: {
					testRequestId,
					sampleIndex,
					...planData
				}
			});
		}
	}

	async getSampleTestPlans(testRequestId: number): Promise<any[]> {
		const { prisma } = await import('../configs/prisma.config');
		return await prisma.testPlan.findMany({
			where: { testRequestId }
		});
	}
}