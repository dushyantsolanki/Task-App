import mongoose from 'mongoose';
import logger from '../configs/pino.config.js';
import Template from '../models/template.model.js';

export const addTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    console.log(req.user);
    if (!name || !subject || !body) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const template = await Template.create({
      name,
      subject,
      body,
      createdBy: req.user?.userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Template created successfully',
      template,
    });
  } catch (err) {
    logger.error(err, 'Error in addTemplate');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await Template.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: 'createdBy', select: 'avatar name' })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Templates fetched successfully',
      templates,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      pageSize: limit,
    });
  } catch (err) {
    logger.error(err, 'Error in getTemplates');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body } = req.body;

    const template = await Template.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { name, subject, body },
      { new: true, runValidators: true },
    );

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      template,
    });
  } catch (err) {
    logger.error(err, 'Error in updateTemplate');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findByIdAndUpdate(new mongoose.Types.ObjectId(id), {
      isDeleted: true,
    });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (err) {
    logger.error(err, 'Error in deleteTemplate');
    return res.status(500).json({ success: false, message: err.message });
  }
};
