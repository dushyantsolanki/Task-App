import express from 'express';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import {
  createNotification,
  deleteNotification,
  getNotificationById,
  getNotifications,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.get('/:id', verifyToken, getNotificationById);
router.post('/', verifyToken, createNotification);
router.delete('/:id', verifyToken, deleteNotification);

export default router;
