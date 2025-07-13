import express from 'express';
import authRoute from './auth.route.js';
import calendarRoute from './calendar.route.js';
import notificationRoute from './notification.route.js';
import taskRoute from './task.route.js';
import { notificationTest, saveUserToken } from '../controllers/public.controller.js';

const router = express.Router();
// Auth routes
router.get('/', (req, res) => {
  res.send('API is running...');
});
router.use('/auth', authRoute);
router.use('/calendar', calendarRoute);
router.use('/notification', notificationRoute);
router.use('/task', taskRoute);

// public apis
router.post('/firebase/:id/token', saveUserToken);
router.post('/send', notificationTest);

export default router;
