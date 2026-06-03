import { z } from 'zod';

export const createTestRequestSchema = z.object({
	customerNameAddress: z.string().min(1, 'Customer name and address is required').trim(),
	manufacturerNameAddress: z.string().min(1, 'Manufacturer name and address is required').trim(),
	customerContactDetails: z.string().min(1, 'Customer contact details is required').trim(),
	sampleDescription: z.string().min(1, 'Sample description is required').trim(),
	modelNo: z.string().min(1, 'Model number is required').trim(),
	familyModel: z.string().nullable().optional(),
	serialNumber: z.string().nullable().optional(),
	productRating: z.string().min(1, 'Product rating is required').trim(),
	sampleQty: z.union([
		z.number().int().positive('Sample quantity must be a positive integer'),
		z.string().regex(/^\d+$/).transform(Number)
	]),
	brandName: z.string().min(1, 'Brand name is required').trim(),
	attachmentMention: z.string().nullable().optional(),
	witnessRequired: z.enum(['Yes', 'No']).default('No'),
	witnessPersonDetails: z.string().nullable().optional(),
	testMethodRef: z.string().min(1, 'Test method reference is required').trim(),
	conformityStatement: z.enum(['Required', 'not Required']).default('not Required'),
	decisionRule: z.string().nullable().optional(),
	collectBack: z.enum(['Yes', 'No', 'No_Retain']).default('No'),
	requesterId: z.union([
		z.number().int().positive('Requester ID must be a positive integer'),
		z.string().regex(/^\d+$/).transform(Number)
	])
}).refine(
	(data) => {
		if (data.witnessRequired === 'Yes' && !data.witnessPersonDetails)	return false;
		return true;
	},
	{ message: 'Witness details are required when witness is requested', path: ['witnessPersonDetails'] }
).refine(
	(data) => {
		if (data.conformityStatement === 'Required' && !data.decisionRule)	return false;
		return true;
	},
	{ message: 'Decision rule is required when conformity statement is requested', path: ['decisionRule'] }
);

export const updateTestRequestSchema = z.object({
	status: z.enum(['PENDING_APPROVAL', 'UNDER_INSPECTION', 'UNDER_TEST', 'PASS', 'FAIL', 'PARTIAL', 'COMPLETED', 'REJECTED']).optional(),
	remarks: z.string().optional(),
	assignedToId: z.union([
		z.number().int().positive(),
		z.string().regex(/^\d+$/).transform(Number)
	]).optional()
}).refine(
	(data) => {
		if (data.status === 'REJECTED' && (!data.remarks || data.remarks.trim() === ''))	return false;
		return true;
	},
	{ message: 'Remarks are mandatory when rejecting a request', path: ['remarks'] }
);

export const testRequestQuerySchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(['id', 'brandName', 'modelNo', 'status', 'createdDate', 'requestId']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional()
});

export const testRequestIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, 'Test request ID must be a numeric string')
});