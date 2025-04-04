import express from 'express';
import EmployeeRoute from './EmployeeRoute.js';

const router = express.Router();

router.use('/employees', EmployeeRoute);

export default router;