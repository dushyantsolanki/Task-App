import { getActiveUsers } from '../utils/trackUser.utils.js';
import { io } from '../../sockets/index.js';
import { Notification } from '../../models/index.js';
import logger from '../../configs/pino.config.js';

export const sendNotification = async ({ senderId, userIds, type, path, title, body }) => {
  try {
    const recipients = Array.isArray(userIds) ? userIds : [userIds];
    const notifications = await Promise.all(
      recipients.map((recipient) =>
        Notification.create({
          recipient,
          sender: senderId,
          type,
          path,
          title,
          body,
        }),
      ),
    );

    const notification = notifications.map((notif) => ({
      _id: notif._id,
      type: notif.type,
      title: notif.title,
      body: notif.body,
      path: notif.path,
      createdAt: notif.createdAt,
    }));

    const activeUsers = getActiveUsers();

    for (const recipient of recipients) {
      const socketIds = activeUsers.get(recipient.toString());
      if (!socketIds) continue;

      for (const socketId of socketIds) {
        io.to(socketId).emit('calendar_notification', { notification });
      }
    }
  } catch (err) {
    logger.error(err, 'Error in sendNotification');
  }
};
