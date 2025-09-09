import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import geoip from 'geoip-country';
import logger from '../configs/pino.config.js';
import { Lead } from '../models/index.js';
import { sendLeadUpdate } from '../sockets/events/lead.event.js';
import { AILeadScrapper } from '../playwright/aiLead.playwright.js';

export const getLeads = async (req, res) => {
  try {
    const { userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    const query = { isDeleted: false, createdBy: new mongoose.Types.ObjectId(userId) };

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
      leadStatus,
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
      emails: emails || [],
      phones: phones || [],
      createdBy: req.user?.userId,
      leadStatus,
    });

    sendLeadUpdate({ type: 'refresh' });
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

    sendLeadUpdate({ type: 'refresh' });
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

export const getLeadStatusCounts = async (req, res) => {
  try {
    const counts = await Lead.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$leadStatus',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          leadStatus: '$_id',
          count: 1,
        },
      },
    ]);
    const allStatuses = ['new', 'contacted', 'interested', 'lost', 'follow-up later'];
    const result = allStatuses.map((status) => {
      const found = counts.find((c) => c.leadStatus === status);
      return { leadStatus: status, count: found ? found.count : 0 };
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    logger.error(err, 'Error in getLeadStatusCounts');
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const generateAILead = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name } = req.body;
    const ip = req.clientIp;
    let geo = geoip.lookup(ip);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required for AI lead generation',
      });
    }
    console.log(name);

    await AILeadScrapper(`${name} ${geo?.name || 'India'}`, userId, req, res, geo);
  } catch (err) {
    logger.error(err, 'Error in generateAILead');
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

export const exportLeadsToExcel = async (req, res) => {
  try {
    const { userId } = req.user;

    const leads = await Lead.find({ createdBy: userId, isDeleted: false }).populate(
      'createdBy',
      'name email',
    );

    if (!leads?.length) {
      return res.status(404).json({ success: false, message: 'Data Not Found' });
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads', {
      properties: { tabColor: { argb: 'FF4CAF50' } }, // Green tab color
      views: [{ state: 'frozen', ySplit: 1 }], // Freeze header row
    });

    worksheet.columns = [
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Postal Code', key: 'postalCode', width: 12 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'Country Code', key: 'countryCode', width: 10 },
      { header: 'Website', key: 'website', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Categories', key: 'categories', width: 35 },
      { header: 'Emails', key: 'emails', width: 30 },
      { header: 'Phones', key: 'phones', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Lead Status', key: 'leadStatus', width: 20 },
      { header: 'User Name', key: 'name', width: 20 },
      { header: 'User Email', key: 'email', width: 25 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E88E5' }, // Blue background
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = 30;

    // Add filters to the header row
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columns.length },
    };

    leads.forEach((lead, index) => {
      const row = worksheet.addRow({
        title: lead.title || 'N/A',
        address: lead.address || 'N/A',
        city: lead.city || 'N/A',
        postalCode: lead.postalCode || 'N/A',
        state: lead.state || 'N/A',
        countryCode: lead.countryCode || 'N/A',
        website: lead.website || 'N/A',
        phone: lead.phone || 'N/A',
        categories: lead.categories?.join(', ') || 'N/A',
        emails: lead.emails?.join(', ') || 'N/A',
        phones: lead.phones?.join(', ') || 'N/A',
        status: lead.status || 'N/A',
        leadStatus: lead.leadStatus || 'N/A',
        name: lead.createdBy?.name || 'N/A',
        email: lead.createdBy?.email || 'N/A',
        createdAt: lead.createdAt
          ? lead.createdAt.toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A',
        updatedAt: lead.updatedAt
          ? lead.updatedAt.toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A',
      });

      // Apply alternating row colors
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: index % 2 === 0 ? 'FFF5F5F5' : 'FFFFFFFF' }, // Light gray for even rows, white for odd
      };
      row.font = { name: 'Calibri', size: 11 };
      row.alignment = { vertical: 'middle', wrapText: true };
      row.height = 25;
    });

    // Apply conditional formatting for Status column
    worksheet.addConditionalFormatting({
      ref: `M2:M${leads.length + 1}`, // Status column
      rules: [
        {
          type: 'expression',
          formulae: ['M2="Active"'],
          style: {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } }, // Green for Active
            font: { color: { argb: 'FFFFFFFF' } },
          },
        },
        {
          type: 'expression',
          formulae: ['M2="Inactive"'],
          style: {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF44336' } }, // Red for Inactive
            font: { color: { argb: 'FFFFFFFF' } },
          },
        },
      ],
    });

    // Add summary section at the top of the sheet
    const totalLeads = leads.length;
    const activeLeads = leads.filter((lead) => lead.status === 'Active').length;
    const summaryWorksheet = workbook.addWorksheet('Summary', {
      properties: { tabColor: { argb: 'FFFFC107' } }, // Yellow tab color
    });

    summaryWorksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 },
    ];

    summaryWorksheet.addRow({ metric: 'Total Leads', value: totalLeads });
    summaryWorksheet.addRow({ metric: 'Active Leads', value: activeLeads });
    summaryWorksheet.addRow({ metric: 'Inactive Leads', value: totalLeads - activeLeads });

    // Style the summary sheet header
    const summaryHeader = summaryWorksheet.getRow(1);
    summaryHeader.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0288D1' }, // Darker blue
    };
    summaryHeader.alignment = { vertical: 'middle', horizontal: 'center' };

    // Style summary data rows
    summaryWorksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowNumber % 2 === 0 ? 'FFF5F5F5' : 'FFFFFFFF' },
        };
        row.font = { name: 'Calibri', size: 11 };
        row.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });

    // Optimize column widths based on content
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      column.width = Math.min(Math.max(maxLength + 2, column.width || 10), 50); // Min 10, max 50
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=leads_export_${new Date().toISOString().split('T')[0]}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ success: false, message: 'Failed to export leads to Excel' });
  }
};
