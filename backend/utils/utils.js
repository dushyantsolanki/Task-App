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

const SECRET_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRETE).digest();
const ALGO = 'aes-256-cbc';

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return {
    encryptedData: encrypted,
    iv: iv.toString('base64'),
  };
}

export function textToHtml(text, mailId) {
  let html = text.replace(/\n/g, '<br>');
  if (mailId) {
    html += `
  <span style="display:flex; align-items:center;">
    <img src="https://api.dushyantportfolio.store/track/open?mailId=${mailId}" width="20" height="20" />
    Tracking By Taskmate
  </span>
`;
  }
  return html;
}

export function formatDateToIST(date) {
  if (!date) return null;
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
