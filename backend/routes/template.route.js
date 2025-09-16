import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import {
  addTemplate,
  deleteTemplate,
  getTemplates,
  getTemplatesLookup,
  updateTemplate,
} from '../controllers/template.controller.js';

const uploadDir = path.join(process.cwd(), '/medias/templates');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDF, DOC, DOCX, and TXT files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

const router = express.Router();

router.get('/', verifyToken, getTemplates);
router.get('/lookup', verifyToken, getTemplatesLookup);
router.post(
  '/',
  verifyToken,
  (req, res, next) => {
    upload.array('attachments', 5)(req, res, function (err) {
      console.log(err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  addTemplate,
);

router.put(
  '/:id',
  verifyToken,
  (req, res, next) => {
    upload.array('attachments', 5)(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  updateTemplate,
);

router.delete('/:id', verifyToken, deleteTemplate);

export default router;
