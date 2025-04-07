import express from 'express';

const router = express.Router();

import {getEmployees} from '../controllers/employeeController.js';

router.get('/', getEmployees);

export default router;