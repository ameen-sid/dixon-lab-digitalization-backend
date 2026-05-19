import dotenv from 'dotenv';

type ServerConfig = {
	PORT: number;
	DATABASE_URL: string;
	NODE_ENV: string;
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
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
};