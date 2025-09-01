import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import logger from '../configs/pino.config.js';
import { Task, User } from '../models/index.js';
import { sendShareTask, sendTaskUpdate } from '../sockets/events/task.event.js';
import { getNextSequence } from '../utils/utils.js';
import { sendFirebaseNotification } from '../firebase/notification.firebase.js';
import { sendNotification } from '../sockets/events/notification.event.js';

export const getTasks = async (req, res) => {
  try {
    const { userId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    const query = {
      isDeleted: false,
      $or: [{ createdBy: userId }, { 'share.shareTo': new mongoose.Types.ObjectId(userId) }],
    };

    if (search) {
      query.$and = [
        {
          $or: [{ createdBy: userId }, { 'share.shareTo': new mongoose.Types.ObjectId(userId) }],
        },
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { label: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    } else {
      query.$or = [{ createdBy: userId }, { 'share.shareTo': new mongoose.Types.ObjectId(userId) }];
    }

    const totalCount = await Task.countDocuments(query);

    const totalPages = Math.ceil(totalCount / limit);

    const tasks = await Task.find(query)
      .sort({ createdAt: -1, 'share.sharedAt': -1 })
      .populate({ path: 'createdBy', select: 'name avatar' })
      .populate({ path: 'share.shareTo', select: 'name avatar' })
      .populate({ path: 'share.sharedBy', select: 'name avatar' })
      .skip(skip)
      .limit(limit)
      .lean(); // for better performance

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message: 'Tasks fetched successfully',
      tasks,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage,
      hasPrevPage,
      pageSize: limit,
    });
  } catch (err) {
    logger.error(err, 'Error in getTasks');
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, description, label, status, priority } = req.body;

    const counter = await getNextSequence('Task');

    const task = await Task.create({
      title,
      description,
      label,
      status,
      priority,
      taskId: 'Task - ' + counter,
      createdBy: userId,
    });

    sendTaskUpdate({ type: 'refresh' });
    return res.status(201).json({ success: true, message: 'Task created successfully', task });
  } catch (err) {
    logger.error(err, 'Error in createTask');
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(new mongoose.Types.ObjectId(userId), { name: 1 });

    const task = await Task.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { ...updates },
      { new: true, runValidators: true },
    )
      .populate({ path: 'createdBy', select: 'name avatar' })
      .populate({ path: 'share.shareTo', select: 'name avatar' })
      .populate({ path: 'share.sharedBy', select: 'name avatar' });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const shareTo = task?.share?.map((item) => item?.shareTo?._id.toString()) || [];
    const creatorId = task.createdBy._id.toString();

    // Determine notification recipients
    let notificationRecipients = [];

    if (userId.toString() === creatorId) {
      // If the current user is the creator, notify only the shared users
      notificationRecipients = shareTo.filter((id) => id !== userId.toString());
    } else {
      // If the current user is not the creator, notify the creator and other shared users
      notificationRecipients = [...new Set([creatorId, ...shareTo])].filter(
        (id) => id !== userId.toString(),
      );
    }

    await sendTaskUpdate({ type: 'refresh' });
    if (notificationRecipients.length > 0) {
      await sendShareTask({ type: 'shareTask', recipients: notificationRecipients });
      await sendNotification({
        senderId: userId,
        userIds: notificationRecipients,
        type: 'shared task update',
        path: '/task',
        title: `Task shared update.`,
        body: `${user?.name} has updated the task details.`,
        eventType: 'notification',
      });

      await sendFirebaseNotification({
        mode: 'selected',
        selectedUserIds: notificationRecipients,
        creatorId: userId?.toString(),
        title: 'Task Update',
        body: `Task updated by "${user?.name}" at ${new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
        })}`,
        imageUrl: 'https://i.ibb.co/Xfv4LYf8/Chat-GPT-Image-Aug-30-2025-12-17-18-AM.png',
        pageLink: '/task',
      });
    }

    return res.status(200).json({ success: true, message: 'Task updated successfully', task });
  } catch (err) {
    logger.error(err, 'Error in updateTask');
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(id, { isDeleted: true });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    sendTaskUpdate({ type: 'refresh' });
    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    logger.error(err, 'Error in deleteTask');
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const exportTasksToExcel = async (req, res) => {
  try {
    const { userId } = req.user;

    // Fetch tasks
    const tasks = await Task.find({ createdBy: userId, isDeleted: false }).populate(
      'createdBy',
      'name email',
    );

    // Create a workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');

    // Define columns
    worksheet.columns = [
      { header: 'Title', key: 'title', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Label', key: 'label', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'User Name', key: 'name', width: 24 },
      { header: 'User Email', key: 'email', width: 24 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];

    // Add rows
    tasks.forEach((task) => {
      worksheet.addRow({
        title: task.title,
        description: task.description,
        label: task.label,
        status: task.status,
        priority: task.priority,
        name: task.createdBy.name,
        email: task.createdBy.email,
        createdAt: task.createdAt?.toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        updatedAt: task.updatedAt?.toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export error:', err);
    logger.error(err, 'Error in exportTasksToExcel');
    res.status(500).json({ success: false, message: 'Failed to export tasks to Excel' });
  }
};

export const getStatusPieChart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const statusStats = await Task.aggregate([
      {
        $match: {
          // createdBy: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    // Format for easier frontend use
    const formatted = {
      pending: 0,
      processing: 0,
      success: 0,
      failed: 0,
    };

    statusStats.forEach((item) => {
      formatted[item.status] = item.count;
    });

    return res.status(200).json({
      success: true,
      message: 'Task status lookup fetched successfully',
      data: formatted,
    });
  } catch (err) {
    logger.error(err, 'Error in getStatusLookup');
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch task status lookup',
    });
  }
};

export const getStatusAreaChart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const statusStats = await Task.aggregate([
      {
        $match: {
          // createdBy: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $addFields: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
        },
      },
      {
        $group: {
          _id: { date: '$date', status: '$status' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              k: '$_id.status',
              v: '$count',
            },
          },
        },
      },
      {
        $addFields: {
          statusCounts: { $arrayToObject: '$statuses' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          pending: { $ifNull: ['$statusCounts.pending', 0] },
          processing: { $ifNull: ['$statusCounts.processing', 0] },
          success: { $ifNull: ['$statusCounts.success', 0] },
          failed: { $ifNull: ['$statusCounts.failed', 0] },
        },
      },
      {
        $sort: { date: 1 }, // optional: sort by date ascending
      },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Daily task status lookup fetched successfully',
      data: statusStats,
    });
  } catch (err) {
    logger.error(err, 'Error in getStatusLookup');
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch task status lookup',
    });
  }
};

export const taskShare = async (req, res) => {
  try {
    const { shareTo, permission, task, username } = req.body;
    const currentUserId = req.user?.userId;

    if (!shareTo || !username || !permission || !Array.isArray(task) || task.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    if (!mongoose.Types.ObjectId.isValid(shareTo)) {
      return res.status(400).json({ success: false, message: 'Invalid shareTo userId' });
    }

    for (const taskId of task) {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ success: false, message: `Invalid taskId: ${taskId}` });
      }

      const foundTask = await Task.findById(taskId);

      if (!foundTask) {
        return res.status(404).json({ success: false, message: `Task not found: ${taskId}` });
      }

      const alreadyShared = foundTask.share.some((s) => s.shareTo.toString() === shareTo);

      if (alreadyShared) {
        return res.status(400).json({
          success: false,
          message: `Task ${foundTask.taskId} already shared with this user`,
        });
      }
    }

    const updates = await Task.updateMany(
      { _id: { $in: task } },
      {
        $push: {
          share: {
            shareTo,
            sharedBy: currentUserId,
            permission,
          },
        },
      },
    );

    sendShareTask({ type: 'shareTask', recipients: Array.isArray(shareTo) ? shareTo : [shareTo] });
    await sendNotification({
      senderId: currentUserId,
      // userIds: 'userId' | ['user1Id , user2Id]
      userIds: shareTo,
      type: 'share task',
      path: '/task',
      title: `New task details share by ${username} `,
      body: `New task details shared.`,
      eventType: 'notification',
    });

    await sendFirebaseNotification({
      mode: 'selected',
      selectedUserIds: Array.isArray(shareTo) ? shareTo : [shareTo],
      creatorId: currentUserId?.toString(),
      title: 'Task Share',
      body: `New task share by "${username}" at ${new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
      })}`,
      imageUrl: 'https://i.ibb.co/Xfv4LYf8/Chat-GPT-Image-Aug-30-2025-12-17-18-AM.png',
      pageLink: '/task',
    });

    return res.status(200).json({
      message: 'Tasks shared successfully',
      result: updates,
    });
  } catch (error) {
    console.error('Error sharing tasks:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
