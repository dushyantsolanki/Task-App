import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Counter } from '../models/index.js';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '15d' });
};

export const generateOTP = () => {
  const otp = crypto.randomInt(100000, 1000000); // 6-digit otp
  return otp.toString();
};

export const getNextSequence = async (name) => {
  try {
    let counter = await Counter.findOne({ entity: name });

    if (!counter) {
      counter = new Counter({ entity: name, count: 0 });
    }

    counter.count++;

    await counter.save();

    return counter.count;
  } catch (error) {
    console.error('Error fetching next sequence:', error);
    throw error;
  }
};
