import express from 'express';
const router = express.Router();
import { getAllEmployees } from '../controllers/EmployeeController.js';

router.get('/', getAllEmployees);

export default router;