import { getActiveUsers } from '../utils/trackUser.utils.js';
import { io } from '../../sockets/index.js';
import logger from '../../configs/pino.config.js';

export const sendLeadUpdate = async ({ type }) => {
  try {
    const activeUsers = getActiveUsers();

    for (const [userId, socketSet] of activeUsers.entries()) {
      for (const socketId of socketSet) {
        io.to(socketId).emit('lead_update', { type });
      }
    }
  } catch (err) {
    logger.error(err, 'Error in sendLeadUpdate');
  }
};

export const sendAILeadStatus = async ({ recipient, statusMsg }) => {
  try {
    const activeUsers = getActiveUsers();

    const socketIds = activeUsers.get(recipient.toString());
    for (const socketId of socketIds) {
      io.to(socketId).emit('ai_lead_status', statusMsg);
    }
  } catch (err) {
    logger.error(err, 'Error in sendAILeadStatus');
  }
};
