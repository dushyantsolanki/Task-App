import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  forgotPassword,
  getAllUsersLookup,
  login,
  loginWithGitHub,
  loginWithGoogle,
  logout,
  refreshAccessToken,
  register,
  resendOTP,
  resetPassword,
  resetProfilePassword,
  sendOTP,
  updateProfile,
  updateProfilePicture,
  verifyEmail,
  verifyOTP,
  verifyOtp,
} from '../controllers/auth.controller.js';
import verifyToken from '../middlewares/verifyToken.middleware.js';

const uploadDir = path.join(process.cwd(), '/medias/profiles');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log('midleware ::', req.user);
    const userId = req.user?.userId;
    if (!userId) {
      return cb(new Error('User ID not found'));
    }
    const ext = path.extname(file.originalname);
    cb(null, `${userId}${ext}`);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = express.Router();

router.post('/google', loginWithGoogle);
router.post('/github', loginWithGitHub);
router.post('/refresh-token', refreshAccessToken);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/forgot-password/verify-otp', verifyOtp);
router.post('/forgot-password/reset-password', resetPassword);
router.post('/profile/send-otp', verifyToken, sendOTP);
router.post('/profile/verify-otp', verifyToken, verifyOTP);
router.get('/logout', logout);
router.get('/user-lookup', verifyToken, getAllUsersLookup);
router.put('/profile/:id', updateProfile);
router.patch('/profile/reset-password/:id', verifyToken, resetProfilePassword);
router.patch('/profile/picture', verifyToken, upload.single('avatar'), updateProfilePicture);

export default router;
