import { Request, Response, NextFunction } from 'express';
import logger from '../configs/logger.config';
import { IPlatformAvailabilityService } from '../services/platform-availability.service';
import { BadRequestError } from '../utils/errors/app.error';

export class PlatformAvailabilityController {
	private service: IPlatformAvailabilityService;

	constructor(service: IPlatformAvailabilityService) {
		this.service = service;
	}

	getWeeklyAnalytics = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const month = req.query.month as string;
			const station = req.query.station as string;
			const platform = req.query.platform as string;
			const testTypeId = req.query.testTypeId as string;
			if (!month) {
				throw new BadRequestError('Month query parameter (YYYY-MM) is required.');
			}
			logger.info('Fetching weekly platform availability analytics', { month, station, platform, testTypeId });
			const analytics = await this.service.getWeeklyPlatformAnalytics(month, station, platform, testTypeId);
			res.status(200).json({
				success: true,
				message: 'Fetched Platform Availability Analytics Successfully',
				data: analytics
			});
		} catch (error) {
			next(error);
		}
	}

	getAllPlatforms = async (req: Request, res: Response, next: NextFunction) => {
		try {
			logger.info('Fetching Platform Availability Grid');
			const platforms = await this.service.getAllPlatforms();
			res.status(200).json({
				success: true,
				message: 'Fetched Platform Availability Successfully',
				data: platforms
			});
		} catch (error) {
			next(error);
		}
	}

	togglePlatform = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { stationNo, platformNo } = req.body;
			if (!stationNo || !platformNo) {
				throw new BadRequestError('Both stationNo and platformNo are required.');
			}
			logger.info('Toggling Platform Occupancy', { stationNo, platformNo });
			const updated = await this.service.togglePlatform(Number(stationNo), Number(platformNo));
			res.status(200).json({
				success: true,
				message: 'Platform Toggled Successfully',
				data: updated
			});
		} catch (error) {
			next(error);
		}
	}

	reservePlatforms = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { stationNo, platformNos, testRequestId, occupiedBy, modelNo, occupiedUntil } = req.body;
			if (!stationNo || !platformNos || !Array.isArray(platformNos) || !testRequestId || !occupiedBy || !modelNo || !occupiedUntil) {
				throw new BadRequestError('Missing reservation parameters: stationNo, platformNos[], testRequestId, occupiedBy, modelNo, occupiedUntil.');
			}

			logger.info('Reserving Platforms', { stationNo, platformNos, testRequestId });
			const results = await this.service.reservePlatforms(
				Number(stationNo),
				platformNos.map(Number),
				Number(testRequestId),
				occupiedBy,
				modelNo,
				new Date(occupiedUntil)
			);

			res.status(200).json({
				success: true,
				message: 'Platforms Reserved Successfully',
				data: results
			});
		} catch (error) {
			next(error);
		}
	}

	releasePlatforms = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { stationNo, platformNos } = req.body;
			if (!stationNo || !platformNos || !Array.isArray(platformNos)) {
				throw new BadRequestError('Missing release parameters: stationNo, platformNos[].');
			}

			logger.info('Releasing Platforms', { stationNo, platformNos });
			const results = await this.service.releasePlatforms(Number(stationNo), platformNos.map(Number));

			res.status(200).json({
				success: true,
				message: 'Platforms Released Successfully',
				data: results
			});
		} catch (error) {
			next(error);
		}
	}
}
