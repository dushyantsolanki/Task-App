import logger from '../configs/pino.config.js';
import { Notification } from '../models/index.js';

export const createNotification = async (req, res) => {
  try {
    const { recipient, sender, type, path, title, body } = req.body;

    if (!recipient && !sender && !type && !path && !title && !body)
      return res.status(400).json({ success: false, message: 'Invalid data' });

    const notification = new Notification({ recipient, sender, type, path, title, body });

    const saved = await notification.save();

    res.status(201).json({ success: true, message: 'Notification created successfully', saved });
  } catch (err) {
    logger.error(err, 'Error in createNotification');

    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const recipientId = req.user.userId;

    const filter = { isDeleted: false, read: false };

    if (recipientId) filter.recipient = recipientId;

    const notifications = await Notification.find(filter)
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, message: 'Notification fetched successfully', notifications });
  } catch (err) {
    logger.error(err, 'Error in getNotifications');
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate(
      'sender',
      'name email',
    );

    if (!notification || notification.isDeleted) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res
      .status(200)
      .json({ success: true, message: 'Notification fetched successfully', notification });
  } catch (err) {
    logger.error(err, 'Error in getNotificationById');
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, read: true },
      { new: true },
    );

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    logger.error(err, 'Error in deleteNotification');
    res.status(500).json({ success: false, message: err.message });
  }
};
