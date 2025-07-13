import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import logger from '../configs/pino.config.js';
import { Task } from '../models/index.js';
import { sendTaskUpdate } from '../sockets/events/task.event.js';

export const getTasks = async (req, res) => {
  try {
    const { userId } = req.user;
    const tasks = await Task.find({
      createdBy: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    });
    return res.status(200).json({ success: true, message: 'Tasks fetched successfully', tasks });
  } catch (err) {
    logger.error(err, 'Error in getTasks');
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, description, label, status, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      label,
      status,
      priority,
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

    const task = await Task.findByIdAndUpdate(
      id,
      { ...updates, createdBy: userId },
      { new: true, runValidators: true },
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    sendTaskUpdate({ type: 'refresh' });
    return res.status(200).json({ success: true, message: 'Task updated successfully', task });
  } catch (err) {
    logger.error(err, 'Error in updateTask');
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE (soft delete) task
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
    const { userId } = req.user; // assuming req.user is populated via auth middleware

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
