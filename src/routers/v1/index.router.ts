import express from 'express';
import pingRouter from './ping.router';
import departmentRouter from './department.router';
import userRouter from './user.router';
import authRouter from './auth.router';
import testTypeRouter from './test-type.router';
import testCategoryRouter from './test-category.router';
import testProtocolRouter from './test-protocol.router';
import productPartRouter from './product-part.router';
import supplierCustomerRouter from './supplier-customer.router';
import testingEquipmentRouter from './testing-equipment.router';
import testRequestRouter from './test-request.router';
import platformAvailabilityRouter from './platform-availability.router';
import nablStationAvailabilityRouter from './nabl-station-availability.router';
import reliabilityChecksheetRouter from './reliability-checksheet.router';
import capaRouter from './capa.router';
import systemLogRouter from './system-log.router';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/departments', authenticateToken, departmentRouter);
v1Router.use('/users', authenticateToken, userRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/test-types', authenticateToken, requireRole(['Admin', 'Lab Manager', 'Head', 'Engineer', 'Inspector', 'CEO', 'Requester']), testTypeRouter);
v1Router.use('/test-categories', authenticateToken, requireRole(['Admin', 'Lab Manager', 'Head', 'Engineer', 'Inspector', 'Requester', 'CEO']), testCategoryRouter);
v1Router.use('/test-protocols', authenticateToken, requireRole(['Admin', 'Lab Manager', 'Head', 'Engineer', 'Inspector', 'Requester', 'CEO']), testProtocolRouter);
v1Router.use('/product-parts', authenticateToken, requireRole(['Admin']), productPartRouter);
v1Router.use('/supplier-customers', authenticateToken, requireRole(['Admin']), supplierCustomerRouter);
v1Router.use('/testing-equipments', authenticateToken, requireRole(['Admin', 'Lab Manager', 'Head', 'Engineer', 'Inspector', 'Requester', 'CEO']), testingEquipmentRouter);
v1Router.use('/test-requests', authenticateToken, testRequestRouter);
v1Router.use('/platform-availability', authenticateToken, requireRole(['Admin', 'Lab Manager', 'CEO', 'Engineer']), platformAvailabilityRouter);
v1Router.use('/nabl-station-availability', authenticateToken, requireRole(['Admin', 'Lab Manager', 'CEO']), nablStationAvailabilityRouter);
v1Router.use('/reliability-checksheets', authenticateToken, requireRole(['Admin', 'Lab Manager', 'Inspector', 'CEO']), reliabilityChecksheetRouter);
v1Router.use('/capas', authenticateToken, requireRole(['Requester', 'Lab Manager', 'Head', 'Admin', 'CEO']), capaRouter);
v1Router.use('/system-logs', authenticateToken, requireRole(['Admin']), systemLogRouter);

export default v1Router;