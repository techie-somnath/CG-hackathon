import express from "express";
import { getEmployees } from "../controllers/employeeController.js";
const router = express.Router();

router.post("/", getEmployees);

export default router;
