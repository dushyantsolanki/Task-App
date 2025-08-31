import { getActiveUsers } from '../utils/trackUser.utils.js';
import { io } from '../../sockets/index.js';
import { Notification } from '../../models/index.js';
import logger from '../../configs/pino.config.js';

// export const sendNotification = async ({
//   senderId,
//   userIds,
//   type,
//   path,
//   title,
//   body,
//   eventType,
// }) => {
//   try {
//     const recipients = Array.isArray(userIds) ? userIds : [userIds];
//     const notifications = await Promise.all(
//       recipients.map((recipient) =>
//         Notification.create({
//           recipient,
//           sender: senderId,
//           type,
//           path,
//           title,
//           body,
//         }),
//       ),
//     );

//     const notification = notifications.map((notif) => ({
//       _id: notif._id,
//       type: notif.type,
//       title: notif.title,
//       body: notif.body,
//       path: notif.path,
//       createdAt: notif.createdAt,
//     }));

//     const activeUsers = getActiveUsers();

//     for (const recipient of recipients) {
//       const socketIds = activeUsers.get(recipient.toString());
//       if (!socketIds) continue;

//       for (const socketId of socketIds) {
//         io.to(socketId).emit(eventType, { notification });
//       }
//     }
//   } catch (err) {
//     logger.error(err, 'Error in sendNotification');
//   }
// };

export const sendNotification = async ({
  senderId,
  userIds,
  type,
  path,
  title,
  body,
  eventType,
}) => {
  try {
    const recipients = Array.isArray(userIds) ? userIds : [userIds];
    const activeUsers = getActiveUsers();

    // create notifications for all recipients
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

    // send each recipient only their own notification
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const notif = notifications[i]; // <- match recipient with created notif

      const notification = {
        _id: notif._id,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        path: notif.path,
        createdAt: notif.createdAt,
      };

      const socketIds = activeUsers.get(recipient.toString());
      if (!socketIds) continue;

      for (const socketId of socketIds) {
        io.to(socketId).emit(eventType, notification);
      }
    }
  } catch (err) {
    logger.error(err, 'Error in sendNotification');
  }
};
