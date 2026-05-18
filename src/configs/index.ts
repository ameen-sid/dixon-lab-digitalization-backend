import dotenv from 'dotenv';

type ServerConfig = {
	PORT: number;
	DATABASE_URL: string;
	NODE_ENV: string;
};

const loadEnv = () => {
	dotenv.config();
	console.log(`Environment Variables are Loaded`);
};
loadEnv();

export const serverConfig: ServerConfig = {
	PORT: Number(process.env.PORT) || 3001,
	DATABASE_URL: process.env.DATABASE_URL || 'sqlserver://31.97.229.146:1433;database=dixon;user=dixon_user;password=Dixon@12345Sarvagya;encrypt=true;trustServerCertificate=true;',
	NODE_ENV: process.env.NODE_ENV || 'development'
};