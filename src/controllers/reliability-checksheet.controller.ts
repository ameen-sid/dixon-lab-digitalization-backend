import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { IReliabilityChecksheetService } from '../services/reliability-checksheet.service';

export class ReliabilityChecksheetController {
	private reliabilityChecksheetService: IReliabilityChecksheetService;

	constructor(reliabilityChecksheetService: IReliabilityChecksheetService) {
		this.reliabilityChecksheetService = reliabilityChecksheetService;
	}

	upsertEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		logger.info('Upserting Reliability Checksheet Entry', { body: req.body });
		const { planKey, date, data } = req.body;
		const entry = await this.reliabilityChecksheetService.upsertEntry(planKey, date, data);
		logger.info('Reliability Checksheet Entry Upserted Successfully', { entry });
		res.status(200).json({
			success: true,
			message: 'Reliability Checksheet Entry Upserted Successfully',
			data: entry
		});
	};

	getEntriesByPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		logger.info('Fetching Reliability Checksheet Entries by Plan', { planKey: req.params.planKey });
		const { planKey } = req.params;
		const entries = await this.reliabilityChecksheetService.getEntriesByPlan(planKey as string);
		logger.info('Fetched Reliability Checksheet Entries Successfully', { count: entries.length });
		res.status(200).json({
			success: true,
			message: 'Fetched Reliability Checksheet Entries Successfully',
			data: entries
		});
	};
}