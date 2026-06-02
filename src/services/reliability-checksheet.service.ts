import { ReliabilityChecksheetEntry } from '@prisma/client';
import { IReliabilityChecksheetRepository } from '../repositories/reliability-checksheet.repository';
import { BadRequestError } from '../utils/errors/app.error';

export interface IReliabilityChecksheetService {
	upsertEntry(planKey: string, date: string, data: any): Promise<ReliabilityChecksheetEntry>;
	getEntriesByPlan(planKey: string): Promise<any[]>;
}

export class ReliabilityChecksheetService implements IReliabilityChecksheetService {
	private reliabilityChecksheetRepository: IReliabilityChecksheetRepository;

	constructor(reliabilityChecksheetRepository: IReliabilityChecksheetRepository) {
		this.reliabilityChecksheetRepository = reliabilityChecksheetRepository;
	}

	async upsertEntry(planKey: string, date: string, data: any): Promise<ReliabilityChecksheetEntry> {
		if (!planKey) throw new BadRequestError('Plan key is required');
		if (!date) throw new BadRequestError('Date is required');
		if (!data) throw new BadRequestError('Data is required');

		const dataStr = JSON.stringify(data);
		return await this.reliabilityChecksheetRepository.upsertEntry(planKey, date, dataStr);
	}

	async getEntriesByPlan(planKey: string): Promise<any[]> {
		if (!planKey) throw new BadRequestError('Plan key is required');
		const entries = await this.reliabilityChecksheetRepository.getEntriesByPlan(planKey);
		return entries.map(entry => {
			let parsedData = {};
			try {
				parsedData = JSON.parse(entry.data);
			} catch (e) {
				console.error('Failed to parse checksheet entry data JSON:', e);
			}
			return {
				id: entry.id,
				planKey: entry.planKey,
				date: entry.date,
				data: parsedData,
				createdAt: entry.createdAt,
				updatedAt: entry.updatedAt
			};
		});
	}
}