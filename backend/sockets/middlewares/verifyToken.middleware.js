import { User } from '../../models/index.js';
import mongoose from 'mongoose';

export const verifyToken = async (socket, next) => {
  try {
    const authHeader = socket.handshake.auth.userId;

    if (!authHeader) {
      return next(new Error('Missing or invalid Authorization Id'));
    }
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(authHeader),
      isDeleted: false,
      isVerified: true,
    });
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;

    return next();
  } catch (err) {
    return next(new Error('Invalid or expired token'));
  }
};
