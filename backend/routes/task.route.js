import express from 'express';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import {
  createTask,
  deleteTask,
  exportTasksToExcel,
  getStatusAreaChart,
  getStatusPieChart,
  getTasks,
  getTasksForKanban,
  taskShare,
  updateTask,
  updateTaskStatus,
} from '../controllers/task.controller.js';

const router = express.Router();

router.get('/', verifyToken, getTasks);
router.get('/kanban-view', verifyToken, getTasksForKanban);
router.patch('/kanban-view/:id', verifyToken, updateTaskStatus);
router.post('/', verifyToken, createTask);
router.put('/:id', verifyToken, updateTask);
router.patch('/', verifyToken, taskShare);
router.delete('/:id', verifyToken, deleteTask);
router.get('/export/excel', verifyToken, exportTasksToExcel);
router.get('/status-lookup-pie', verifyToken, getStatusPieChart);
router.get('/status-lookup-area', verifyToken, getStatusAreaChart);

export default router;
