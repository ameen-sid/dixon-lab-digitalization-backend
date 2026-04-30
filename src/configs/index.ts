import dotenv from 'dotenv';

type ServerConfig = {
	PORT: number;
};

const loadEnv = () => {
	dotenv.config();
	console.log(`Environment Variables are Loaded`);
};
loadEnv();

export const serverConfig: ServerConfig = {
	PORT: Number(process.env.PORT) || 3001,
};