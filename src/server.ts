import express from 'express';
import path from 'path';
import { serverConfig } from './configs';
import v1Router from './routers/v1/index.router';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, prismaErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
import logger from './configs/logger.config';
import { NotificationService } from './services/notification.service';

const app = express();

app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Registering all the routers and their corresponding routes without app server object.
app.use(attachCorrelationIdMiddleware);
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// Add the error handler middleware
app.use(appErrorHandler);
app.use(prismaErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
	logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
	logger.info(`Press Ctrl+C to stop the server.`);
	
	// Start periodic notification checks (last day of test plan, calibration due, missing test plan alerts)
	NotificationService.startPeriodicChecks();
});