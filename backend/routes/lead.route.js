import express from 'express';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import {
  addLead,
  deleteLead,
  getLeads,
  getLeadStatusCounts,
  updateLead,
} from '../controllers/lead.controller.js';

const router = express.Router();

router.get('/', verifyToken, getLeads);
router.get('/pie-chart', verifyToken, getLeadStatusCounts);
router.post('/', verifyToken, addLead);
router.put('/:id', verifyToken, updateLead);
router.delete('/:id', verifyToken, deleteLead);

export default router;
