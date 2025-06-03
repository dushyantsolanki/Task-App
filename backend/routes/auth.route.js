import express from 'express';
import passport from 'passport';
import {
  forgotPassword,
  login,
  loginWithGithub,
  loginWithGoogle,
  logout,
  refreshAccessToken,
  register,
  resendOTP,
  resetPassword,
  verifyEmail,
  verifyOtp,
} from '../controllers/auth.controller.js';
import verifyToken from '../middlewares/verifyToken.middleware.js';

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  loginWithGoogle,
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  loginWithGithub,
);

router.post('/refresh-token', refreshAccessToken);

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/forgot-password/verify-otp', verifyOtp);
router.post('/forgot-password/reset-password', resetPassword);
router.get('/logout', logout);

router.get('/users', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Hello from users',
  });
});

export default router;
