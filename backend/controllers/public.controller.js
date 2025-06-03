import { getMessaging } from 'firebase-admin/messaging';
import { User } from '../models/index.js';
import logger from '../configs/pino.config.js';

export const saveUserToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return res.status(400).send({ success: false, message: 'FCM token is required' });
    }

    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false,
      isVerified: true,
    }).select('fcmToken');

    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    if (user.fcmToken.includes(fcm_token)) {
      return res.status(200).send({ message: 'FCM token already exists' });
    }

    user.fcmToken.push(fcm_token);

    await user.save();

    res.status(200).send({ success: true, message: 'FCM token saved successfully' });
  } catch (err) {
    logger.error(err, 'Error in saveUserToken');
    res.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const notificationTest = async (req, res) => {
  try {
    const message = {
      notification: {
        title: req.body?.title || 'Test',
        body: req.body?.body || 'Demo test body',
        imageUrl: 'https://cdn.pixabay.com/photo/2021/06/26/18/11/live-6366830_960_720.png',
      },
      tokens: [
        'dDkaQTzZVqq0OQzU8vy4yK:APA91bETN0Oo4J1Onsn6g84mvsAG8M653ySDqr0GhWXltJVgEiBoXbCnIVBaD8kBVLG61mpyy0oLIe3zgDM8b17vLPgkrqEqHwxMsxQXLhl7FyNFL-etHNs',
      ],
      webpush: {
        fcm_options: {
          // link: 'https://firebase-messaging-five.vercel.app/'
          link: process.env.FRONTEND_URL,
        },
      },
    };

    getMessaging()
      .sendEachForMulticast(message)
      .then((response) => {
        if (response.failureCount > 0) {
          logger.info({
            function: 'notificationTest',
            message: 'Failed to send notification to user role',
          });
        }
        logger.info({
          function: 'notificationTest',
          message: 'Notification send successfully to user role',
        });
        res.status(200).send({
          success: true,
          message: 'Notfication sent',
        });
      })
      .catch((err) => {
        logger.error(err, 'Error in ', notificationTest);
        res.status(400).send({
          success: false,
          message: 'Notfication sent error',
        });
      });
  } catch (err) {
    logger.error(err, 'Error in notificationTest');
    res.status(500).send({
      success: false,
      message: 'Notfication sent error from catch',
    });
  }
};
