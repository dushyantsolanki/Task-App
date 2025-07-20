import express from 'express';
import { createQuery, getVisitor } from '../controllers/portfolio.controller.js';

const router = express.Router();

router.get('/', getVisitor);
router.post('/', createQuery);

export default router;
