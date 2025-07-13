import { getActiveUsers } from '../utils/trackUser.utils.js';
import { io } from '../../sockets/index.js';
import logger from '../../configs/pino.config.js';

export const sendTaskUpdate = async ({ type }) => {
  try {
    const activeUsers = getActiveUsers();

    for (const [userId, socketSet] of activeUsers.entries()) {
      for (const socketId of socketSet) {
        io.to(socketId).emit('task_update', { type });
      }
    }
  } catch (err) {
    logger.error(err, 'Error in sendTaskUpdate');
  }
};
