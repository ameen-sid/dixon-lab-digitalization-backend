import express from 'express';
import { prisma } from '../../configs/prisma.config';
import { asyncHandler } from '../../utils/helpers/async.handler';

const router = express.Router();

// Fetch key value
router.get(
	'/:key',
	asyncHandler(async (req, res) => {
		const key = req.params.key as string;
		const record = await prisma.localStorageSync.findUnique({
			where: { key }
		});
		res.json({
			success: true,
			value: record ? record.value : null
		});
	})
);

// Save or Update key value
router.post(
	'/:key',
	asyncHandler(async (req, res) => {
		const key = req.params.key as string;
		const { value } = req.body;

		const record = await prisma.localStorageSync.upsert({
			where: { key },
			update: { value },
			create: { key, value }
		});

		res.json({
			success: true,
			record
		});
	})
);

export default router;
