import express from 'express';
import pingRouter from './ping.router';
import departmentRouter from './department.router';
import userRouter from './user.router';
import authRouter from './auth.router';
import testTypeRouter from './test-type.router';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/departments', departmentRouter);
v1Router.use('/users', userRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/test-types', testTypeRouter);

export default v1Router;