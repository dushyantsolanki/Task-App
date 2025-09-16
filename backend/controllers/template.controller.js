import mongoose from 'mongoose';
import logger from '../configs/pino.config.js';
import Template from '../models/template.model.js';
import path from 'path';
import fs from 'fs';

export const addTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    console.log(req.user);
    if (!name || !subject || !body) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const attachments = req?.files?.map((file) => ({
      filename: file.filename,
      url: `/medias/templates/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const template = await Template.create({
      name,
      subject,
      body,
      attachments,
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
    let { name, subject, body, existingAttachments = [] } = req.body;
    existingAttachments = JSON.parse(existingAttachments);

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    let attachments = [];

    const removed = template.attachments.filter(
      (att) => !existingAttachments.some((ex) => ex.url === att.url),
    );

    removed.forEach((att) => {
      const filePath = path.join(process.cwd(), att.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    attachments = template.attachments.filter((att) =>
      existingAttachments.some((ex) => ex.url === att.url),
    );

    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map((file) => ({
        filename: file.filename,
        url: `/medias/templates/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
      }));
      attachments = [...attachments, ...newFiles];
    }

    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.body = body || template.body;
    template.attachments = attachments;

    await template.save();

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

export const getTemplatesLookup = async (req, res) => {
  try {
    const { userId } = req.user;
    const query = { isDeleted: false, createdBy: new mongoose.Types.ObjectId(userId) };

    const templates = await Template.find(query, { name: 1 }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Templates fetched successfully',
      templates,
    });
  } catch (err) {
    logger.error(err, 'Error in templatesLookup');
    return res.status(500).json({ success: false, message: err.message });
  }
};
