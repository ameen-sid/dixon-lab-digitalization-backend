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
		return await prisma.reliabilityChecksheetEntry.findMany({
			where: { planKey },
			orderBy: { date: 'asc' }
		});
	}
}