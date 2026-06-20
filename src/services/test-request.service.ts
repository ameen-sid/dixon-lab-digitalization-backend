import { TestRequest, TestRequestAttachment } from '@prisma/client';
import { ITestRequestRepository, CreateTestRequestInput } from '../repositories/test-request.repository';
import { BadRequestError, NotFoundError } from '../utils/errors/app.error';
import { NotificationService } from './notification.service';
import logger from '../configs/logger.config';

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
		
		const newRequest = await this.testRequestRepository.addTestRequest(data, attachments);
		
		// Send notification
		NotificationService.notifyHeadsNewRequest(newRequest.id).catch(err => {
			logger.error('Failed to send new request notification to Heads', err);
		});

		return newRequest;
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

		const oldStatus = request.status;
		const oldAssignedToId = request.assignedToId;

		const updateData: any = { status };
		if (remarks !== undefined) updateData.remarks = remarks;
		if (assignedToId !== undefined) {
			updateData.assignedToId = assignedToId;
			if (assignedToId !== oldAssignedToId) {
				updateData.assignedDate = new Date();
			}
		}

		const updatedRequest = await this.testRequestRepository.updateTestRequest(id, updateData);

		// Trigger immediate resource cleanup if transition is to a finalized/retest/failed state
		if (status !== oldStatus && ['COMPLETED', 'FAILED', 'RETEST', 'REJECTED', 'INSPECTION_FAILED', 'TESTING_FAILED'].includes(status)) {
			import('./resource-cleanup.service').then(({ ResourceCleanupService }) => {
				ResourceCleanupService.cleanupExpiredResources().catch(err => {
					logger.error('Failed to run immediate resource cleanup:', err);
				});
			}).catch(err => {
				logger.error('Failed to import ResourceCleanupService for immediate cleanup:', err);
			});
		}

		// Trigger notifications
		if (status !== oldStatus) {
			NotificationService.handleRequestStatusChange(id, oldStatus, status, remarks).catch(err => {
				logger.error('Failed to handle request status change notification', err);
			});
		}
		if (assignedToId !== undefined && assignedToId !== oldAssignedToId) {
			NotificationService.handleEngineerAssignment(id, assignedToId).catch(err => {
				logger.error('Failed to send engineer assignment notification', err);
			});
		}

		return updatedRequest;
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

		// Trigger notification
		NotificationService.handleInspectionSubmission(testRequestId, Number(data.sampleIndex), data.status).catch(err => {
			logger.error('Failed to trigger inspection submission notification', err);
		});

		return resultRecord;
	}

	async saveSampleTestPlan(testRequestId: number, data: any): Promise<any> {
		const { prisma } = await import('../configs/prisma.config');

		const sampleIndex = Number(data.sampleIndex);
		const testTypeId = Number(data.testTypeId);
		const testCategoryId = Number(data.testCategoryId);
		const testProtocolId = Number(data.testProtocolId);

		const planData: any = {};
		if (data.testTypeId !== undefined) planData.testTypeId = Number(data.testTypeId);
		if (data.testCategoryId !== undefined) planData.testCategoryId = Number(data.testCategoryId);
		if (data.testProtocolId !== undefined) planData.testProtocolId = Number(data.testProtocolId);
		if (data.productType !== undefined) planData.productType = data.productType || null;
		if (data.stationNo !== undefined) planData.stationNo = data.stationNo ? Number(data.stationNo) : null;
		if (data.platformNos !== undefined) {
			planData.platformNos = data.platformNos ? (typeof data.platformNos === 'string' ? data.platformNos : JSON.stringify(data.platformNos)) : null;
		}
		if (data.equipmentId !== undefined) planData.equipmentId = data.equipmentId ? Number(data.equipmentId) : null;
		if (data.numberOfDays !== undefined) planData.numberOfDays = data.numberOfDays ? Number(data.numberOfDays) : null;
		if (data.startDate !== undefined) planData.startDate = data.startDate || null;
		if (data.endDate !== undefined) planData.endDate = data.endDate || null;
		if (data.remarks !== undefined) planData.remarks = data.remarks || null;
		if (data.evaluationStatus !== undefined) planData.evaluationStatus = data.evaluationStatus || null;
		if (data.evaluationRemarks !== undefined) planData.evaluationRemarks = data.evaluationRemarks || null;
		if (data.evaluatedAt !== undefined) planData.evaluatedAt = data.evaluatedAt ? new Date(data.evaluatedAt) : null;
		if (data.evaluatedBy !== undefined) planData.evaluatedBy = data.evaluatedBy || null;

		const existing = await prisma.testPlan.findFirst({
			where: {
				testRequestId,
				sampleIndex
			}
		});

		let resultPlan: any;

		if (existing) {
			resultPlan = await prisma.testPlan.update({
				where: { id: existing.id },
				data: planData
			});

			// If request is in RETEST status, notify about reconfiguration of retesting plan
			const request = await prisma.testRequest.findUnique({ where: { id: testRequestId } });
			if (request && request.status === 'RETEST') {
				const currentTestTypeId = planData.testTypeId || existing.testTypeId;
				NotificationService.handleRetestingPlanConfig(testRequestId, currentTestTypeId).catch(err => {
					logger.error('Failed to trigger retesting plan config notification', err);
				});
			}
		} else {
			const fullPlanData = {
				testTypeId: planData.testTypeId || 0,
				testCategoryId: planData.testCategoryId || 0,
				testProtocolId: planData.testProtocolId || 0,
				productType: planData.productType || null,
				stationNo: planData.stationNo || null,
				platformNos: planData.platformNos || null,
				equipmentId: planData.equipmentId || null,
				numberOfDays: planData.numberOfDays || null,
				startDate: planData.startDate || null,
				endDate: planData.endDate || null,
				remarks: planData.remarks || null,
				evaluationStatus: planData.evaluationStatus || null,
				evaluationRemarks: planData.evaluationRemarks || null,
				evaluatedAt: planData.evaluatedAt || null,
				evaluatedBy: planData.evaluatedBy || null,
			};
			resultPlan = await prisma.testPlan.create({
				data: {
					testRequestId,
					sampleIndex,
					...fullPlanData
				}
			});

			const request = await prisma.testRequest.findUnique({ where: { id: testRequestId } });
			if (request) {
				if (request.status === 'RETEST') {
					NotificationService.handleRetestingPlanConfig(testRequestId, testTypeId).catch(err => {
						logger.error('Failed to trigger retesting plan config notification', err);
					});
				} else {
					NotificationService.handleTestPlanCreation(testRequestId, testTypeId).catch(err => {
						logger.error('Failed to trigger test plan creation notification', err);
					});
				}
			}
		}

		// Notify evaluation submission if status is provided
		if (data.evaluationStatus) {
			NotificationService.handleEvaluationSubmission(testRequestId, sampleIndex, data.evaluationStatus).catch(err => {
				logger.error('Failed to trigger evaluation submission notification', err);
			});
		}

		return resultPlan;
	}

	async getSampleTestPlans(testRequestId: number): Promise<any[]> {
		const { prisma } = await import('../configs/prisma.config');
		return await prisma.testPlan.findMany({
			where: { testRequestId }
		});
	}
}