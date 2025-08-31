import bcrypt from 'bcryptjs';
import logger from '../configs/pino.config.js';
import { User } from '../models/index.js';
import { sendVerificationMail } from '../templates/email/mailer.js';
import { generateAccessToken, generateOTP, generateRefreshToken } from '../utils/utils.js';
import jwt from 'jsonwebtoken';
import { verifyIdToken } from '../configs/firebase.config.js';
import mongoose from 'mongoose';
import fs from 'fs';

const COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax',
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
};

export const loginWithGoogle = async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];

    if (!idToken) return res.status(401).json({ success: false, message: 'No token provided' });

    const decodedUser = await verifyIdToken(idToken); // custom util
    const { email, name, picture, uid } = decodedUser;

    // Check if user exists or create one
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        authProvider: 'google',
        oauthId: uid,
        avatar: picture,
        googleId: uid,
        role: 'Member',
        isVerified: true,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
      .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
      .json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          authProvider: user.authProvider,
          gender: user.gender,
          dateOfBirth: user,
          dateOfBirth: user.dateOfBirth,
          mobileNumber: user.mobileNumber,
        },
      });
  } catch (err) {
    logger.error(err, 'Error in loginWithGoogle');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const loginWithGitHub = async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) return res.status(401).json({ success: false, message: 'Missing token' });

    const decoded = await verifyIdToken(idToken);

    const { email, name, picture, uid } = decoded;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        avatar: picture,
        authProvider: 'github',
        oauthId: uid,
        role: 'Member',
        isVerified: true,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
      .json({
        success: true,
        message: 'GitHub login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          authProvider: user.authProvider,
          gender: user.gender,
          dateOfBirth: user,
          dateOfBirth: user.dateOfBirth,
          mobileNumber: user.mobileNumber,
        },
      });
  } catch (err) {
    console.error('Error in loginWithGitHub:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, authProvider: 'local' }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return res
      .cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
      .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
      .status(200)
      .json({
        success: true,
        message: 'Login successful',
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          authProvider: user.authProvider,
          gender: user.gender,
          dateOfBirth: user,
          dateOfBirth: user.dateOfBirth,
          mobileNumber: user.mobileNumber,
        },
      });
  } catch (err) {
    logger.error(err, 'Error in login');
    res.status(500).json({ success: false, message: err.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken != token) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    // Generate new access token and refresh token
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res
      .cookie('accessToken', newAccessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    logger.error(err, 'Error in refreshAccessToken');
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const register = async (req, res) => {
  try {
    const { firstname, surname, email, password, gender, dateOfBirth, mobileNumber } = req.body;

    const existingUser = await User.findOne({
      email,
      isVerified: true,
      authProvider: 'local',
      isDeleted: false,
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const otp = generateOTP();

    const user = new User({
      name: firstname + ' ' + surname,
      email,
      password,
      gender,
      otp,
      dateOfBirth,
      mobileNumber,
      otpPurpose: 'verify_account',
      otpExpiry: new Date(Date.now() + 2 * 60 * 1000), // 2 min expiry
    });

    const emailResponse = await sendVerificationMail(email, surname, otp, 2, 'verify_account'); // Send OTP email
    if (!emailResponse?.messageId) {
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }

    await user.save(); // pre-save hook will hash password

    return res.status(201).json({
      success: true,
      message: 'User registered. OTP sent to email for verification.',
    });
  } catch (err) {
    logger.error(err, 'Error in register');
    return res.status(500).json({ message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, isDeleted: false, authProvider: 'local' }).select(
      '+otp +otpExpiry +otpPurpose',
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isOtpValid = user.otp == otp;
    const isPurposeValid = user.otpPurpose === 'verify_account';
    const isOtpNotExpired = user.otpExpiry && user.otpExpiry > Date.now();

    if (!isOtpValid || !isPurposeValid || !isOtpNotExpired) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = undefined;
    await user.save();

    return res.status(201).json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    logger.error(err, 'Error in verifyEmail');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ success: false, message: 'Email and purpose are required' });
    }

    if (!['verify_account', 'forgot_password'].includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP purpose' });
    }

    const user = await User.findOne({ email, isDeleted: false, authProvider: 'local' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (purpose === 'verify_account' && user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    if (purpose === 'forgot_password' && user.authProvider !== 'local') {
      return res
        .status(400)
        .json({ success: false, message: 'OAuth users cannot reset password via email' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpPurpose = purpose;
    user.otpExpiry = new Date(Date.now() + 2 * 60 * 1000);

    const emailResponse = await sendVerificationMail(email, user.name, otp, 2, 'resend_otp'); // Send OTP email;

    if (!emailResponse?.messageId) {
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }

    await user.save();

    return res.status(201).json({ success: true, message: 'OTP resent to email' });
  } catch (err) {
    logger.error(err, 'Error in resendOTP');
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, authProvider: 'local', isDeleted: false });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpPurpose = 'forgot_password';
    user.otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 min expiry

    const emailResponse = await sendVerificationMail(email, user.name, otp, 2, 'forgot_password');
    if (!emailResponse.messageId) {
      return res
        .status(500)
        .json({ success: false, message: 'Failed to send forgot password otp to email' });
    }
    await user.save();

    return res.status(201).json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    logger.error(err, 'Error in forgotPassword');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, authProvider: 'local', isDeleted: false }).select(
      '+otp +otpExpiry +otpPurpose',
    );

    if (
      !user ||
      user.otp !== otp ||
      user.otpPurpose !== 'forgot_password' ||
      user.otpExpiry < new Date()
    ) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (err) {
    logger.error(err, 'Error in verifyOtp');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, authProvider: 'local', isDeleted: false }).select(
      '+otp +otpPurpose +otpExpiry +password',
    );
    if (!user || user.otp != otp || user.otpPurpose !== 'forgot_password') {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (otp != user.otp) {
      return res.status(400).json({ message: 'OTP is required.' });
    }

    user.password = newPassword; // bcrypt will hash it if using pre-save hook
    user.otp = undefined;
    user.otpPurpose = undefined;
    user.otpExpiry = undefined;

    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    logger.error(err, 'Error in resetPassword');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    // Clear refresh token from user
    user.refreshToken = null;
    await user.save();

    return res
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    logger.error(err, 'Error in logout');
    return res
      .status(500)
      .json({ success: false, message: err.message || 'Internal Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstname, surname, email, gender, dateOfBirth, mobileNumber, avatar } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        name: `${firstname} ${surname}`,
        email,
        gender,
        dateOfBirth,
        mobileNumber,
        avatar,
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
        gender: user.gender,
        dateOfBirth: user,
        dateOfBirth: user.dateOfBirth,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (err) {
    logger.error(err, 'Error in updateProfile');
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct image path
    const imagePath = `/medias/profiles/${file.filename}`;

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), { avatar: imagePath });

    res.status(200).json({
      sucess: true,
      message: 'Profile updated successfully',
      imagePath: imagePath,
    });
  } catch (err) {
    res.status(500).json({ sucess: false, message: err.message });
  }
};

let OTPExp = {};
export const sendOTP = async (req, res) => {
  try {
    const { surname, email } = req.body;
    const { type } = req.query;

    const existingUser = await User.findOne({
      email,
      isVerified: true,
      authProvider: 'local',
      isDeleted: false,
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const otp = generateOTP();

    OTPExp.otp = otp;
    OTPExp.otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 min expiry

    if (type === 'forgot_password') {
      const emailResponse = await sendVerificationMail(email, surname, otp, 2, 'forgot_password');
      if (!emailResponse?.messageId) {
        return res
          .status(500)
          .json({ success: false, message: 'Failed to send verification email' });
      }
    } else {
      const emailResponse = await sendVerificationMail(email, surname, otp, 2, 'verify_account');
      if (!emailResponse?.messageId) {
        return res
          .status(500)
          .json({ success: false, message: 'Failed to send verification email' });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'User registered. OTP sent to email for verification.',
    });
  } catch (err) {
    logger.error(err, 'Error in register');
    return res.status(500).json({ message: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!OTPExp.otp || !OTPExp.otpExpiry) {
      return res.status(400).json({ success: false, message: 'No OTP has been generated.' });
    }

    if (new Date() > OTPExp.otpExpiry) {
      OTPExp = {};
      return res
        .status(400)
        .json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (OTPExp.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    OTPExp = {};

    return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const resetProfilePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
      isVerified: true,
    }).select('+password');

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User either not verified or deleted' });
    }

    user.password = newPassword; // will be hashed by pre('save')

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllUsersLookup = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false, isVerified: true }, 'name avatar');

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
