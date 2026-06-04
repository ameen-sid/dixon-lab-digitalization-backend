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

// Dedicated upload instance for sample inspection images
const inspectionResultsDir = path.join(process.cwd(), 'uploads', 'inspection_results');
if (!fs.existsSync(inspectionResultsDir)) {
	fs.mkdirSync(inspectionResultsDir, { recursive: true });
}

const inspectionStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, inspectionResultsDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
		cb(null, `inspection-${baseName}-${uniqueSuffix}${ext}`);
	}
});

export const inspectionUpload = multer({
	storage: inspectionStorage,
	limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB per file
	fileFilter: (req, file, cb) => {
		const allowed = /jpeg|jpg|png|gif|webp/i;
		const ext = path.extname(file.originalname);
		if (allowed.test(ext)) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed for inspection results.'));
		}
	}
});

// Dedicated upload instance for CAPA report images
// Stored in uploads/capa/{YYYY-MM-DD}/
const capaStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
		const dir = path.join(process.cwd(), 'uploads', 'capa', today);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
		cb(null, `capa-${baseName}-${uniqueSuffix}${ext}`);
	}
});

export const capaUpload = multer({
	storage: capaStorage,
	limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB per file
	fileFilter: (req, file, cb) => {
		const allowed = /jpeg|jpg|png|gif|webp/i;
		const ext = path.extname(file.originalname);
		if (allowed.test(ext)) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed for CAPA reports.'));
		}
	}
});