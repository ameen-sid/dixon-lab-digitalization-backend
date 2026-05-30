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
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/departments', authenticateToken, requireRole(['Admin']), departmentRouter);
v1Router.use('/users', authenticateToken, requireRole(['Admin']), userRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/test-types', authenticateToken, requireRole(['Admin']), testTypeRouter);
v1Router.use('/test-categories', authenticateToken, requireRole(['Admin']), testCategoryRouter);
v1Router.use('/test-protocols', authenticateToken, requireRole(['Admin']), testProtocolRouter);
v1Router.use('/product-parts', authenticateToken, requireRole(['Admin']), productPartRouter);
v1Router.use('/supplier-customers', authenticateToken, requireRole(['Admin']), supplierCustomerRouter);
v1Router.use('/testing-equipments', authenticateToken, requireRole(['Admin']), testingEquipmentRouter);
v1Router.use('/test-requests', authenticateToken, testRequestRouter);

export default v1Router;