import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
		cb(null, `${baseName}-${uniqueSuffix}${ext}`);
	}
});

export const upload = multer({
	storage,
	limits: { fileSize: 15 * 1024 * 1024 } // Max 15MB per file
});