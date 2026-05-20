import { Request, Response, NextFunction } from 'express';

type AsyncControllerFn = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncControllerFn): AsyncControllerFn => {
	return (req: Request, res: Response, next: NextFunction) => {
		return Promise.resolve(fn(req, res, next)).catch(next);
	};
};