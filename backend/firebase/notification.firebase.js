import logger from '../configs/pino.config.js';
import { User } from '../models/index.js';
import { admin } from '../configs/firebase.config.js';

/**
 * Send FCM notification based on mode
 * @param {Object} options
 * @param {'creator'|'selected'|'all'} options.mode - Notification mode
 * @param {string} [options.creatorId] - User ID of event creator
 * @param {string[]} [options.selectedUserIds] - Array of user IDs to notify
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 */

export const sendFirebaseNotification = async ({
  mode,
  creatorId,
  selectedUserIds,
  title,
  body,
  imageUrl,
  pageLink,
}) => {
  try {
    let tokens = [];

    if (mode === 'creator') {
      // creator mode mode only send a message who create this
      if (!creatorId) throw new Error("creatorId is required for 'creator' mode");
      const user = await User.findById(creatorId);
      if (user?.fcmToken) {
        tokens = Array.isArray(user.fcmToken) ? user.fcmToken : [user.fcmToken];
      }
    } else if (mode === 'selected') {
      if (!Array.isArray(selectedUserIds) || selectedUserIds.length === 0)
        throw new Error("selectedUserIds is required for 'selected' mode");

      const users = await User.find({
        _id: { $in: selectedUserIds },
        fcmToken: { $exists: true, $ne: null },
        isDeleted: false,
        isVerified: true,
      });
      tokens = users.flatMap((user) =>
        Array.isArray(user.fcmToken) ? user.fcmToken : [user.fcmToken],
      );
    } else if (mode === 'all') {
      const users = await User.find({
        fcmToken: { $exists: true, $ne: null },
        isDeleted: false,
        isVerified: true,
      });
      tokens = users.flatMap((user) =>
        Array.isArray(user.fcmToken) ? user.fcmToken : [user.fcmToken],
      );
    }

    if (tokens.length === 0) {
      console.log('No FCM tokens found to send');
      return;
    }

    const message = {
      notification: { title, body, ...(imageUrl && { image: imageUrl }) },
      tokens,
      webpush: {
        fcm_options: {
          link: `${pageLink}`,
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    logger.info({
      function: 'sendFirebaseNotification',
      message: `Sent to ${response.successCount}/${tokens.length} devices`,
    });

    if (response.failureCount > 0) {
      response.responses.forEach((resp, i) => {
        if (!resp.success) {
          logger.info({
            function: 'sendFirebaseNotification',
            message: `Token failed: ${tokens[i]} - ${resp.error.message}`,
          });
        }
      });
    }
  } catch (err) {
    logger.error(err, 'Error in sendFirebaseNotification');
  }
};
