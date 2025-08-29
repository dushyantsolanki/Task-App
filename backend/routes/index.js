import express from 'express';
import authRoute from './auth.route.js';
import calendarRoute from './calendar.route.js';
import notificationRoute from './notification.route.js';
import taskRoute from './task.route.js';
import portfolioRoute from './portfolio.route.js';
import leadRoute from './lead.route.js';
import templateRoute from './template.route.js';
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
router.use('/portfolio', portfolioRoute);
router.use('/lead', leadRoute);
router.use('/template', templateRoute);

// public apis
router.post('/firebase/:id/token', saveUserToken);
router.post('/send', notificationTest);

export default router;
