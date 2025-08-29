import express from 'express';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import {
  addTemplate,
  deleteTemplate,
  getTemplates,
  updateTemplate,
} from '../controllers/template.controller.js';

const router = express.Router();

router.get('/', verifyToken, getTemplates);
router.post('/', verifyToken, addTemplate);
router.put('/:id', verifyToken, updateTemplate);
router.delete('/:id', verifyToken, deleteTemplate);

export default router;
