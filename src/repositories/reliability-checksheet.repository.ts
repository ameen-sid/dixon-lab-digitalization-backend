import { ReliabilityChecksheetEntry } from '@prisma/client';
import { prisma } from '../configs/prisma.config';

export interface IReliabilityChecksheetRepository {
	upsertEntry(planKey: string, date: string, data: string): Promise<ReliabilityChecksheetEntry>;
	getEntriesByPlan(planKey: string): Promise<ReliabilityChecksheetEntry[]>;
}

export class ReliabilityChecksheetRepository implements IReliabilityChecksheetRepository {
	async upsertEntry(planKey: string, date: string, data: string): Promise<ReliabilityChecksheetEntry> {
		const existing = await prisma.reliabilityChecksheetEntry.findUnique({
			where: {
				planKey_date: { planKey, date }
			}
		});

		if (existing) {
			return await prisma.reliabilityChecksheetEntry.update({
				where: { id: existing.id },
				data: { data }
			});
		} else {
			return await prisma.reliabilityChecksheetEntry.create({
				data: { planKey, date, data }
			});
		}
	}

	async getEntriesByPlan(planKey: string): Promise<ReliabilityChecksheetEntry[]> {
		const planKeysToQuery = [planKey];

		// If it's the new format: requestId-plan-planId
		if (planKey.includes('-plan-')) {
			const parts = planKey.split('-plan-');
			const planId = parseInt(parts[1], 10);
			if (!isNaN(planId)) {
				try {
					const plan = await prisma.testPlan.findUnique({
						where: { id: planId }
					});
					if (plan) {
						const legacyKey = `${plan.testRequestId}-sample-${plan.sampleIndex}`;
						if (!planKeysToQuery.includes(legacyKey)) {
							planKeysToQuery.push(legacyKey);
						}
					}
				} catch (e) {
					console.error('Failed to look up test plan for legacy checksheet fallback:', e);
				}
			}
		} 
		// If it's the legacy format: requestId-sample-sampleIndex
		else if (planKey.includes('-sample-')) {
			const parts = planKey.split('-sample-');
			const requestId = parseInt(parts[0], 10);
			const sampleIndex = parseInt(parts[1], 10);
			if (!isNaN(requestId) && !isNaN(sampleIndex)) {
				try {
					const plan = await prisma.testPlan.findFirst({
						where: { testRequestId: requestId, sampleIndex: sampleIndex }
					});
					if (plan) {
						const newKey = `${requestId}-plan-${plan.id}`;
						if (!planKeysToQuery.includes(newKey)) {
							planKeysToQuery.push(newKey);
						}
					}
				} catch (e) {
					console.error('Failed to look up test plan for new checksheet fallback:', e);
				}
			}
		}

		return await prisma.reliabilityChecksheetEntry.findMany({
			where: {
				planKey: {
					in: planKeysToQuery
				}
			},
			orderBy: { date: 'asc' }
		});
	}
}