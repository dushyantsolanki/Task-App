import mongoose from 'mongoose';
import logger from '../configs/pino.config.js';
import { Lead } from '../models/index.js';

export const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { countryCode: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await Lead.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const leads = await Lead.find(query)
      .sort({ createdAt: -1, _id: 1 })
      .populate({ path: 'createdBy', select: 'avatar name' })
      .skip(skip)
      .limit(limit)
      .lean();

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message: 'Leads fetched successfully',
      leads,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage,
      hasPrevPage,
      pageSize: limit,
    });
  } catch (err) {
    logger.error(err, 'Error in getLeads');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addLead = async (req, res) => {
  try {
    const {
      title,
      address,
      city,
      postalCode,
      state,
      countryCode,
      website,
      phone,
      categories,
      domain,
      emails,
      phones,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const lead = await Lead.create({
      title,
      address,
      city,
      postalCode,
      state,
      countryCode,
      website,
      phone,
      categories: categories || [],
      domain,
      emails: emails || [],
      phones: phones || [],
      createdBy: req.user?.userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead,
    });
  } catch (err) {
    logger.error(err, 'Error in addLead');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await Lead.findByIdAndUpdate(new mongoose.Types.ObjectId(id), updateData, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      lead,
    });
  } catch (err) {
    logger.error(err, 'Error in updateLead');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByIdAndUpdate(new mongoose.Types.ObjectId(id), { isDeleted: true });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (err) {
    logger.error(err, 'Error in deleteLead');
    return res.status(500).json({ success: false, message: err.message });
  }
};
