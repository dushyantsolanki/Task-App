import logger from '../configs/pino.config.js';
import { Calendar } from '../models/index.js';

export const getEvents = async (req, res) => {
  try {
    const { userId } = req.user;
    const events = await Calendar.find({ createdBy: userId, isDeleted: false });
    return res.status(200).json({ success: true, message: 'Events fetched successfully', events });
  } catch (err) {
    logger.error(err, 'Error in getEvents');
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, description, start, end, backgroundColor } = req.body;
    const event = await Calendar.create({
      title,
      description,
      start,
      end,
      backgroundColor,
      createdBy: userId,
    });
    return res.status(201).json({ success: true, message: 'Event created successfully', event });
  } catch (err) {
    logger.error(err, 'Error in createEvent');
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    const event = await Calendar.findByIdAndUpdate(
      id,
      { ...updates, createdBy: userId, reminderSent: false },
      { new: true },
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    return res.status(200).json({ success: true, message: 'Event updated successfully', event });
  } catch (err) {
    logger.error(err, 'Error in updateEvent');
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Calendar.findByIdAndUpdate(id, { isDeleted: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    return res.status(200).json({ success: true, message: 'Event created successfully' });
  } catch (err) {
    logger.error(err, 'Error in deleteEvent');
    return res.status(400).json({ success: false, message: err.message });
  }
};
