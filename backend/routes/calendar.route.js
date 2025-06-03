import express from 'express';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import {
  getEvents,
  createEvent,
  deleteEvent,
  updateEvent,
} from '../controllers/calendar.controller.js';

const router = express.Router();

router.get('/', verifyToken, getEvents);
router.post('/', verifyToken, createEvent);
router.put('/:id', verifyToken, updateEvent);
router.delete('/:id', verifyToken, deleteEvent);

export default router;
