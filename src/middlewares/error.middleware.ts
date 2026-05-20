import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors/app.error';

export const appErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
	console.log(err);
	if (err.statusCode) {
		return res.status(err.statusCode).json({
			success: false,
			message: err.message,
		});
	}
	next(err);
};

export const prismaErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	if (err?.code === 'P2025') {
		return res.status(404).json({
			success: false,
			message: err?.meta?.cause || 'Record not found',
		});
	}
	if (err?.code === 'P2002') {
		const field = err?.meta?.target?.[0] || 'field';
		return res.status(409).json({
			success: false,
			message: `A record with this ${field} already exists`,
		});
	}
	if (err?.code === 'P2003') {
		return res.status(409).json({
			success: false,
			message: 'Cannot complete this operation because the record is linked to other data',
		});
	}
	next(err);
};

export const genericErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
	console.log(err);
	res.status(500).json({
		success: false,
		message: 'Internal Server Error',
	});
};