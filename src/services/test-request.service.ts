import { TestRequest, TestRequestAttachment } from '@prisma/client';
import { ITestRequestRepository, CreateTestRequestInput } from '../repositories/test-request.repository';
import { BadRequestError, NotFoundError } from '../utils/errors/app.error';

export interface ITestRequestService {
	addTestRequest(data: CreateTestRequestInput, attachments: { fileName: string; filePath: string; fileSize: number }[]): Promise<TestRequest>;
	getTestRequests(where: any, sortBy: string, sortOrder: string, skip: number, limit: number): Promise<TestRequest[]>;
	getTestRequestById(id: number): Promise<TestRequest & { attachments: TestRequestAttachment[] }>;
	updateTestRequestStatus(id: number, status: string, remarks?: string, assignedToId?: number): Promise<TestRequest | null>;
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

	async getTestRequestById(id: number): Promise<TestRequest & { attachments: TestRequestAttachment[] }> {
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
}