import dotenv from 'dotenv';

type ServerConfig = {
	PORT: number;
	DATABASE_URL: string;
	NODE_ENV: string;
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
	SMTP_HOST: string;
	SMTP_PORT: number;
	SMTP_USER: string;
	SMTP_PASS: string;
	SMTP_FROM: string;
};

const loadEnv = () => {
	dotenv.config();
	console.log(`Environment Variables are Loaded`);
};
loadEnv();

export const serverConfig: ServerConfig = {
	PORT: Number(process.env.PORT) || 3001,
	DATABASE_URL: process.env.DATABASE_URL || 'sqlserver://31.97.229.146:1433;database=dixon;user=dixon_user;password=Dixon@12345Sarvagya;encrypt=true;trustServerCertificate=true;',
	NODE_ENV: process.env.NODE_ENV || 'development',
	JWT_SECRET: process.env.JWT_SECRET || 'dixon_super_secret_key_123',
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
	SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
	SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
	SMTP_USER: process.env.SMTP_USER || '',
	SMTP_PASS: process.env.SMTP_PASS || '',
	SMTP_FROM: process.env.SMTP_FROM || '"Dixon Lab System" <noreply@dixon.com>',
};