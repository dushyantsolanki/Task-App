import express from 'express';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import {
  addLead,
  deleteLead,
  exportLeadsToExcel,
  generateAILead,
  getLeads,
  getLeadStatusCounts,
  sendColdMail,
  updateLead,
} from '../controllers/lead.controller.js';

const router = express.Router();

router.get('/', verifyToken, getLeads);
router.get('/export-leads', verifyToken, exportLeadsToExcel);
router.get('/pie-chart', verifyToken, getLeadStatusCounts);
router.post('/', verifyToken, addLead);
router.post('/cold-mail', verifyToken, sendColdMail);
router.post('/ai-lead', verifyToken, generateAILead);
router.put('/:id', verifyToken, updateLead);
router.delete('/:id', verifyToken, deleteLead);

export default router;
