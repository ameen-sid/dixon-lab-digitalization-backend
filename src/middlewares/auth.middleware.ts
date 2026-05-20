import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { serverConfig } from '../configs';
import { UnauthorizedError, ForbiddenError } from '../utils/errors/app.error';

export interface AuthenticatedRequest extends Request {
	user?: {
		id: number;
		username: string;
		role: string;
		departmentId: number | null;
	};
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) throw new UnauthorizedError('Access token is missing or invalid');

	jwt.verify(token, serverConfig.JWT_SECRET, (err, decoded: any) => {
		if (err) throw new ForbiddenError('Token verification failed');
		req.user = decoded;
		next();
	});
};

export const requireRole = (roles: string[]) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			throw new ForbiddenError('Access forbidden: Insufficient privileges');
		}
		next();
	};
};