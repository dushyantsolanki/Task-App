import express from 'express';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import {
  createTask,
  deleteTask,
  exportTasksToExcel,
  getStatusAreaChart,
  getStatusPieChart,
  getTasks,
  updateTask,
} from '../controllers/task.controller.js';

const router = express.Router();

router.get('/', verifyToken, getTasks);
router.post('/', verifyToken, createTask);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);
router.get('/export/excel', verifyToken, exportTasksToExcel);
router.get('/status-lookup-pie', verifyToken, getStatusPieChart);
router.get('/status-lookup-area', verifyToken, getStatusAreaChart);

export default router;
