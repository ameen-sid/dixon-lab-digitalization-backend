import { prisma } from '../configs/prisma.config';
import { MailFactory } from '../factories/mail.factory';
import logger from '../configs/logger.config';

export class NotificationService {
	
	// Helper to get all Heads
	static async getHeads() {
		return await prisma.user.findMany({
			where: { role: 'Head' }
		});
	}

	// Helper to get all Lab Managers by department type (NABL vs non-NABL)
	static async getLabManagers(isNabl: boolean) {
		const users = await prisma.user.findMany({
			where: { role: 'Lab Manager' },
			include: { department: true }
		});
		return users.filter(user => {
			const deptName = user.department?.name || '';
			const hasNabl = deptName.toLowerCase().includes('nabl');
			return isNabl ? hasNabl : !hasNabl;
		});
	}

	// Helper to get all Engineers by department type (NABL vs non-NABL)
	static async getEngineers(isNabl: boolean) {
		const users = await prisma.user.findMany({
			where: { role: 'Engineer' },
			include: { department: true }
		});
		return users.filter(user => {
			const deptName = user.department?.name || '';
			const hasNabl = deptName.toLowerCase().includes('nabl');
			return isNabl ? hasNabl : !hasNabl;
		});
	}

	// Helper to get all Inspectors
	static async getInspectors() {
		return await prisma.user.findMany({
			where: { role: 'Inspector' }
		});
	}

	// Safe sender helper
	static async sendNotification(toEmails: string[], subject: string, html: string) {
		const mailService = MailFactory.getMailService();
		const validEmails = toEmails.filter(e => e && e.trim() !== '');
		if (validEmails.length === 0) {
			logger.warn(`No valid recipient emails for subject: ${subject}`);
			return;
		}

		for (const email of validEmails) {
			try {
				await mailService.sendEmail(email, subject, html);
			} catch (err) {
				logger.error(`Error sending email to ${email}`, err);
			}
		}
	}

	// 1. When requester creates a new request -> notify all heads
	static async notifyHeadsNewRequest(requestId: number) {
		try {
			const request = await prisma.testRequest.findUnique({
				where: { id: requestId },
				include: { requester: true }
			});
			if (!request) return;

			const heads = await this.getHeads();
			const emails = heads.map(h => h.email).filter(Boolean) as string[];

			const subject = `New Test Request Submitted: ${request.requestId || request.id}`;
			const html = `
				<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
					<h2>New Testing Request Submitted</h2>
					<p>Dear Head of Lab,</p>
					<p>A new testing request has been submitted and is awaiting your approval.</p>
					<table style="border-collapse: collapse; width: 100%; max-width: 600px; margin-top: 15px;">
						<tr>
							<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 150px;">Request ID:</td>
							<td style="padding: 8px; border: 1px solid #ddd;">${request.requestId || `REQ-00${request.id}`}</td>
						</tr>
						<tr>
							<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Brand Name:</td>
							<td style="padding: 8px; border: 1px solid #ddd;">${request.brandName}</td>
						</tr>
						<tr>
							<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Model No:</td>
							<td style="padding: 8px; border: 1px solid #ddd;">${request.modelNo}</td>
						</tr>
						<tr>
							<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Requester:</td>
							<td style="padding: 8px; border: 1px solid #ddd;">${request.requester?.name || 'Unknown'}</td>
						</tr>
					</table>
					<p style="margin-top: 20px;">Please log in to the administrative portal to review and approve/reject the request.</p>
				</div>
			`;
			await this.sendNotification(emails, subject, html);
		} catch (err) {
			logger.error('Error in notifyHeadsNewRequest', err);
		}
	}

	// 2, 3, 4, 10, 11, 12: Handle request status change transitions
	static async handleRequestStatusChange(requestId: number, oldStatus: string, newStatus: string, remarks?: string) {
		try {
			const request = await prisma.testRequest.findUnique({
				where: { id: requestId },
				include: { requester: true, testType: true }
			});
			if (!request) return;

			const requesterEmail = request.requester?.email;
			const isNabl = request.testType?.name?.toLowerCase().includes('nabl') || false;

			// 2. Head rejects a request -> notify requester
			if (newStatus === 'REJECTED') {
				if (requesterEmail) {
					const subject = `Test Request Rejected: ${request.requestId || request.id}`;
					const html = `
						<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
							<h2>Test Request Rejection</h2>
							<p>Dear ${request.requester.name},</p>
							<p>Your testing request has been rejected by the Head of Lab.</p>
							<p><strong>Rejection Remarks:</strong> ${remarks || 'No remarks provided.'}</p>
							<p>Please review the remarks and resubmit the request if necessary.</p>
						</div>
					`;
					await this.sendNotification([requesterEmail], subject, html);
				}
			}

			// 3 & 4. Head approves a request -> notify requester and appropriate lab managers
			if (oldStatus === 'PENDING_APPROVAL' && newStatus === 'UNDER_INSPECTION') {
				// Notify requester
				if (requesterEmail) {
					const subject = `Test Request Approved: ${request.requestId || request.id}`;
					const html = `
						<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
							<h2>Test Request Approved</h2>
							<p>Dear ${request.requester.name},</p>
							<p>Your testing request has been approved by the Head of Lab. It has now moved to the inspection phase.</p>
						</div>
					`;
					await this.sendNotification([requesterEmail], subject, html);
				}

				// Notify managers
				const managers = await this.getLabManagers(isNabl);
				const managerEmails = managers.map(m => m.email).filter(Boolean) as string[];
				const subjectManager = `New Approved Request Pending Inspection: ${request.requestId || request.id}`;
				const htmlManager = `
					<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
						<h2>New Approved Request Assigned to Your Department</h2>
						<p>Dear Lab Manager,</p>
						<p>A new test request has been approved by the Head of Lab and requires engineer assignment for sample checking/inspection.</p>
						<p><strong>Request ID:</strong> ${request.requestId || `REQ-00${request.id}`}</p>
						<p><strong>Test Type:</strong> ${request.testType?.name || 'N/A'}</p>
					</div>
				`;
				await this.sendNotification(managerEmails, subjectManager, htmlManager);
			}

			// 12. Head returns to retesting -> notify appropriate lab managers
			if (newStatus === 'RETEST') {
				const managers = await this.getLabManagers(isNabl);
				const managerEmails = managers.map(m => m.email).filter(Boolean) as string[];
				const subjectManager = `Request Returned for Retesting: ${request.requestId || request.id}`;
				const htmlManager = `
					<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
						<h2>Request Returned for Retesting</h2>
						<p>Dear Lab Manager,</p>
						<p>The request <strong>${request.requestId || `REQ-00${request.id}`}</strong> has been returned for retesting by the Head of Lab.</p>
						<p>Please configure the retesting plan for the samples.</p>
					</div>
				`;
				await this.sendNotification(managerEmails, subjectManager, htmlManager);
			}

			// 11. Head returns to requester in failure decision page -> notify requester
			if (newStatus === 'FAILED' || newStatus === 'INSPECTION_FAILED') {
				if (requesterEmail) {
					const subject = `Test Request Failed: ${request.requestId || request.id}`;
					const html = `
						<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
							<h2>Test Request Failure Notification</h2>
							<p>Dear ${request.requester.name},</p>
							<p>The Head of Lab has signed off on the failure report for your request <strong>${request.requestId || `REQ-00${request.id}`}</strong>.</p>
							<p><strong>Result:</strong> FAILED</p>
							<p>Please log in to review the final report and results.</p>
						</div>
					`;
					await this.sendNotification([requesterEmail], subject, html);
				}
			}

			// 10. Head approves the final report from completed report page -> notify requester
			if (newStatus === 'COMPLETED') {
				if (requesterEmail) {
					const subject = `Final Report Approved: ${request.requestId || request.id}`;
					const html = `
						<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
							<h2>Final Report Approved & Released</h2>
							<p>Dear ${request.requester.name},</p>
							<p>We are pleased to inform you that the final report for request <strong>${request.requestId || `REQ-00${request.id}`}</strong> has been approved by the Head of Lab.</p>
							<p>You can now download/view the completed report in your panel.</p>
						</div>
					`;
					await this.sendNotification([requesterEmail], subject, html);
				}
			}
		} catch (err) {
			logger.error('Error in handleRequestStatusChange', err);
		}
	}

	// 5. When lab manager assigns an engineer -> notify engineer
	static async handleEngineerAssignment(requestId: number, engineerId: number) {
		try {
			const request = await prisma.testRequest.findUnique({
				where: { id: requestId }
			});
			const engineer = await prisma.user.findUnique({
				where: { id: engineerId }
			});
			if (!request || !engineer || !engineer.email) return;

			const subject = `Assigned to Test Request for Inspection: ${request.requestId || request.id}`;
			const html = `
				<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
					<h2>New Assignment for Inspection</h2>
					<p>Dear ${engineer.name},</p>
					<p>You have been assigned to perform the sample check and inspection for request <strong>${request.requestId || `REQ-00${request.id}`}</strong>.</p>
					<p>Please log in to your dashboard to view the details and submit the inspection report.</p>
				</div>
			`;
			await this.sendNotification([engineer.email], subject, html);
		} catch (err) {
			logger.error('Error in handleEngineerAssignment', err);
		}
	}

	// 6. When engineer submits the inspections -> notify managers, heads, owner requester
	static async handleInspectionSubmission(requestId: number, sampleIndex: number, status: string) {
		try {
			const request = await prisma.testRequest.findUnique({
				where: { id: requestId },
				include: { requester: true, testType: true }
			});
			if (!request) return;

			const isNabl = request.testType?.name?.toLowerCase().includes('nabl') || false;

			const managers = await this.getLabManagers(isNabl);
			const managerEmails = managers.map(m => m.email).filter(Boolean) as string[];

			const requesterEmail = request.requester?.email;

			const heads = await this.getHeads();
			const headEmails = heads.map(h => h.email).filter(Boolean) as string[];

			const allEmails = Array.from(new Set([
				...managerEmails,
				...(requesterEmail ? [requesterEmail] : []),
				...headEmails
			]));

			const subject = `Sample Inspection Submitted: ${request.requestId || request.id} (Sample #${sampleIndex + 1})`;
			const html = `
				<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
					<h2>Sample Inspection Submitted</h2>
					<p>An inspection report has been submitted for a sample under request <strong>${request.requestId || `REQ-00${request.id}`}</strong>.</p>
					<p><strong>Sample Index:</strong> #${sampleIndex + 1}</p>
					<p><strong>Inspection Result:</strong> <span style="color: ${status === 'PASSED' ? 'green' : 'red'}; font-weight: bold;">${status}</span></p>
				</div>
			`;
			await this.sendNotification(allEmails, subject, html);
		} catch (err) {
			logger.error('Error in handleInspectionSubmission', err);
		}
	}

	// 7. When lab manager creates a test plan -> notify based on test type (NABL/Reliability/Other)
	static async handleTestPlanCreation(requestId: number, testTypeId: number) {
		try {
			const request = await prisma.testRequest.findUnique({
				where: { id: requestId },
				include: { requester: true, assignedTo: true }
			});
			const testType = await prisma.testType.findUnique({
				where: { id: testTypeId }
			});
			if (!request || !testType) return;

			const testTypeName = testType.name?.toLowerCase() || '';
			const isNabl = testTypeName.includes('nabl');
			const isReliability = testTypeName.includes('reliability');

			let recipientEmails: string[] = [];

			if (isNabl) {
				const engineers = await this.getEngineers(true);
				recipientEmails = engineers.map(e => e.email).filter(Boolean) as string[];
			} else if (isReliability) {
				const inspectors = await this.getInspectors();
				recipientEmails = inspectors.map(i => i.email).filter(Boolean) as string[];
			} else {
				const engineers = await this.getEngineers(false);
				const engineerEmails = engineers.map(e => e.email).filter(Boolean) as string[];

				const heads = await this.getHeads();
				const headEmails = heads.map(h => h.email).filter(Boolean) as string[];

				const requesterEmail = request.requester?.email;
				const assignedToEmail = request.assignedTo?.email;

				recipientEmails = Array.from(new Set([
					...engineerEmails,
					...headEmails,
					...(requesterEmail ? [requesterEmail] : []),
					...(assignedToEmail ? [assignedToEmail] : [])
				]));
			}

			const subject = `Test Plan Created: ${request.requestId || request.id}`;
			const html = `
				<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
					<h2>Test Plan Created Successfully</h2>
					<p>A new test plan has been configured and created for request <strong>${request.requestId || `REQ-00${request.id}`}</strong>.</p>
					<p><strong>Test Type:</strong> ${testType.name}</p>
				</div>
			`;
			await this.sendNotification(recipientEmails, subject, html);
		} catch (err) {
			logger.error('Error in handleTestPlanCreation', err);
		}
	}

	// 9. When lab manager submits evaluation -> notify all heads and requester
	static async handleEvaluationSubmission(requestId: number, sampleIndex: number, evaluationStatus: string) {
		try {
			const request = await prisma.testRequest.findUnique({
				where: { id: requestId },
				include: { requester: true }
			});
			if (!request) return;

			const heads = await this.getHeads();
			const headEmails = heads.map(h => h.email).filter(Boolean) as string[];

			const requesterEmail = request.requester?.email;

			const emails = Array.from(new Set([
				...headEmails,
				...(requesterEmail ? [requesterEmail] : [])
			]));

			const subject = `Test Plan Evaluation Submitted: ${request.requestId || request.id} (Sample #${sampleIndex + 1})`;
			const html = `
				<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
					<h2>Test Plan Evaluation Submitted</h2>
					<p>Lab Manager has submitted the evaluation for the test plan of request <strong>${request.requestId || `REQ-00${request.id}`}</strong>.</p>
					<p><strong>Sample Index:</strong> #${sampleIndex + 1}</p>
					<p><strong>Evaluation Result:</strong> <span style="color: ${evaluationStatus === 'PASSED' ? 'green' : 'red'}; font-weight: bold;">${evaluationStatus}</span></p>
				</div>
			`;
			await this.sendNotification(emails, subject, html);
		} catch (err) {
			logger.error('Error in handleEvaluationSubmission', err);
		}
	}

	// 13. When lab manager reconfigures retesting plan -> notify engineers or inspectors based on type
	static async handleRetestingPlanConfig(requestId: number, testTypeId: number) {
		try {
			const request = await prisma.testRequest.findUnique({
				where: { id: requestId }
			});
			const testType = await prisma.testType.findUnique({
				where: { id: testTypeId }
			});
			if (!request || !testType) return;

			const testTypeName = testType.name?.toLowerCase() || '';
			const isNabl = testTypeName.includes('nabl');
			const isReliability = testTypeName.includes('reliability');

			let recipientEmails: string[] = [];

			if (isNabl) {
				const engineers = await this.getEngineers(true);
				recipientEmails = engineers.map(e => e.email).filter(Boolean) as string[];
			} else if (isReliability) {
				const inspectors = await this.getInspectors();
				recipientEmails = inspectors.map(i => i.email).filter(Boolean) as string[];
			} else {
				const engineers = await this.getEngineers(false);
				recipientEmails = engineers.map(e => e.email).filter(Boolean) as string[];
			}

			const subject = `Retesting Plan Configured: ${request.requestId || request.id}`;
			const html = `
				<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
					<h2>Retesting Plan Reconfigured</h2>
					<p>The retesting plan for request <strong>${request.requestId || `REQ-00${request.id}`}</strong> has been configured/reconfigured by the Lab Manager.</p>
					<p><strong>Test Type:</strong> ${testType.name}</p>
				</div>
			`;
			await this.sendNotification(recipientEmails, subject, html);
		} catch (err) {
			logger.error('Error in handleRetestingPlanConfig', err);
		}
	}

	// 14. CAPA report submitted -> notify heads
	static async notifyHeadsOfCapaSubmission(capaId: number) {
		try {
			const capa = await prisma.capaReport.findUnique({
				where: { id: capaId },
				include: { submittedBy: true }
			});
			if (!capa) return;

			const heads = await this.getHeads();
			const emails = heads.map(h => h.email).filter(Boolean) as string[];

			const subject = `New CAPA Report Submitted: ${capa.capaId}`;
			const html = `
				<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
					<h2>New CAPA Report Submission</h2>
					<p>Dear Head of Lab,</p>
					<p>A new CAPA report has been submitted by <strong>${capa.submittedBy?.name || 'Unknown'}</strong>.</p>
					<p><strong>CAPA ID:</strong> ${capa.capaId}</p>
					<p><strong>Related Request:</strong> ${capa.relatedRequest}</p>
					<p><strong>Product Name:</strong> ${capa.productName}</p>
				</div>
			`;
			await this.sendNotification(emails, subject, html);
		} catch (err) {
			logger.error('Error in notifyHeadsOfCapaSubmission', err);
		}
	}

	// 15. CAPA closed -> notify CAPA owner (requester or lab manager)
	static async notifyOwnerOfCapaClosure(capaId: number) {
		try {
			const capa = await prisma.capaReport.findUnique({
				where: { id: capaId },
				include: { submittedBy: true }
			});
			if (!capa || !capa.submittedBy?.email) return;

			const ownerEmail = capa.submittedBy.email;
			const subject = `CAPA Closed: ${capa.capaId}`;
			const html = `
				<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
					<h2>CAPA Report Closed</h2>
					<p>Dear ${capa.submittedBy.name},</p>
					<p>Your CAPA report <strong>${capa.capaId}</strong> has been officially closed by the Head of Lab.</p>
					<p><strong>Remark:</strong> ${capa.remark || 'N/A'}</p>
				</div>
			`;
			await this.sendNotification([ownerEmail], subject, html);
		} catch (err) {
			logger.error('Error in notifyOwnerOfCapaClosure', err);
		}
	}

	// Periodic startup & interval configuration
	static startPeriodicChecks() {
		this.runPeriodicChecks().catch(err => logger.error('Error running periodic notifications', err));
		setInterval(() => {
			this.runPeriodicChecks().catch(err => logger.error('Error running periodic notifications', err));
		}, 24 * 60 * 60 * 1000); // 24 Hours
	}

	static async runPeriodicChecks() {
		logger.info('Starting daily system notification checks...');
		await this.checkLastDayOfTestPlans();
		await this.checkEquipmentCalibrationDue();
		await this.checkTestPlanNotCreatedAlerts();
		logger.info('Completed daily system notification checks.');
	}

	// 8. On last day of test plan -> notify managers
	static async checkLastDayOfTestPlans() {
		try {
			const todayStr = new Date().toISOString().split('T')[0];
			const activePlans = await prisma.testPlan.findMany({
				where: {
					endDate: todayStr,
					evaluationStatus: null
				},
				include: {
					testType: true,
					testRequest: true
				}
			});

			for (const plan of activePlans) {
				const isNabl = plan.testType?.name?.toLowerCase().includes('nabl') || false;
				const managers = await this.getLabManagers(isNabl);
				const emails = managers.map(m => m.email).filter(Boolean) as string[];

				const subject = `Test Plan Last Day / Evaluation Due: Request ${plan.testRequest.requestId || plan.testRequestId}`;
				const html = `
					<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
						<h2>Test Plan Evaluation Required</h2>
						<p>Dear Lab Manager,</p>
						<p>Today is the last day of the test plan for request <strong>${plan.testRequest.requestId || `REQ-00${plan.testRequestId}`}</strong> (Sample #${plan.sampleIndex + 1}).</p>
						<p>Please log in and perform the final test plan evaluation.</p>
					</div>
				`;
				await this.sendNotification(emails, subject, html);
			}
		} catch (err) {
			logger.error('Error in checkLastDayOfTestPlans', err);
		}
	}

	// 15 (due soon). R&D equipment calibration due -> notify managers and heads
	static async checkEquipmentCalibrationDue() {
		try {
			const nextWeek = new Date();
			nextWeek.setDate(nextWeek.getDate() + 7);

			const dueEquipment = await prisma.testingEquipment.findMany({
				where: {
					calibrationDueDate: {
						lte: nextWeek
					},
					status: 'ACTIVE'
				}
			});

			if (dueEquipment.length > 0) {
				const heads = await this.getHeads();
				const managers = await prisma.user.findMany({ where: { role: 'Lab Manager' } });
				const emails = Array.from(new Set([
					...heads.map(h => h.email),
					...managers.map(m => m.email)
				])).filter(Boolean) as string[];

				for (const eq of dueEquipment) {
					const subject = `Equipment Calibration Due: ${eq.name}`;
					const html = `
						<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
							<h2>Equipment Calibration Due Alert</h2>
							<p>Dear Lab Team,</p>
							<p>The testing equipment <strong>${eq.name}</strong> is due for calibration.</p>
							<p><strong>Calibration Due Date:</strong> ${eq.calibrationDueDate.toLocaleDateString()}</p>
							<p>Please take necessary action for calibration immediately.</p>
						</div>
					`;
					await this.sendNotification(emails, subject, html);
				}
			}
		} catch (err) {
			logger.error('Error in checkEquipmentCalibrationDue', err);
		}
	}

	// 16. Test plan not created under 2 days OR all sample inspections pass and no plan exists -> notify managers, heads, owner
	static async checkTestPlanNotCreatedAlerts() {
		try {
			const twoDaysAgo = new Date();
			twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

			const requests = await prisma.testRequest.findMany({
				where: {
					status: {
						in: ['UNDER_INSPECTION', 'INSPECTION_COMPLETED', 'UNDER_TESTING', 'RETEST']
					}
				},
				include: {
					testPlans: true,
					sampleInspections: true,
					requester: true
				}
			});

			for (const req of requests) {
				const hasPlan = req.testPlans.length > 0;

				const isOlderThan2Days = req.createdAt <= twoDaysAgo;
				const cond1 = !hasPlan && isOlderThan2Days;

				const qty = req.sampleQty || 1;
				const passedInspections = req.sampleInspections.filter(i => i.status === 'PASSED');
				const allPassed = passedInspections.length === qty;
				const cond2 = !hasPlan && allPassed;

				if (cond1 || cond2) {
					const managers = await prisma.user.findMany({ where: { role: 'Lab Manager' } });
					const heads = await this.getHeads();
					const requesterEmail = req.requester?.email;

					const emails = Array.from(new Set([
						...managers.map(m => m.email),
						...heads.map(h => h.email),
						...(requesterEmail ? [requesterEmail] : [])
					])).filter(Boolean) as string[];

					const subject = `ALERT: Test Plan Not Created for Request ${req.requestId || req.id}`;
					const html = `
						<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
							<h2>Test Plan Missing Alert</h2>
							<p>Dear Lab Team,</p>
							<p>A test plan has not been configured/created for request <strong>${req.requestId || `REQ-00${req.id}`}</strong>.</p>
							<p><strong>Reason for Alert:</strong> ${cond2 ? 'All sample inspections have PASSED, but no test plan exists.' : 'The request has been active for more than 2 days without a test plan.'}</p>
							<p>Please log in and create a test plan immediately.</p>
						</div>
					`;
					await this.sendNotification(emails, subject, html);
				}
			}
		} catch (err) {
			logger.error('Error in checkTestPlanNotCreatedAlerts', err);
		}
	}
}