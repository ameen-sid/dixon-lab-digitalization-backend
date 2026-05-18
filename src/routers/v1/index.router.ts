import express from 'express';
import pingRouter from './ping.router';
import departmentRouter from './department.router';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/departments', departmentRouter);

export default v1Router;