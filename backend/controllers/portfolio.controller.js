import logger from '../configs/pino.config.js';
import { PortfolioQuery, PortfolioVisitor } from '../models/index.js';
import { sendPortfolioQueryMail } from '../templates/email/mailer.js';

export const createQuery = async (req, res) => {
  try {
    const { fullname: fullName, email, message } = req.body;

    await PortfolioQuery.create({
      fullName,
      email,
      message,
    });

    const emailResponse = await sendPortfolioQueryMail(fullName, email, message, 'portfolio_query'); // Send email
    if (!emailResponse?.messageId) {
      return res.status(500).json({ success: false, message: 'Failed to send email' });
    }
    return res.status(201).json({ success: true, message: 'Query submitted successfully' });
  } catch (err) {
    logger.error(err, 'Error in createQuery');
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getVisitor = async (req, res) => {
  try {
    let visit = await PortfolioVisitor.findOne({});
    if (!visit) {
      visit = new PortfolioVisitor({ count: 1 });
    } else {
      visit.count += 1;
    }

    await visit.save();

    return res.status(200).json({ success: true, visit: visit.count });
  } catch (error) {
    logger.error(err, 'Error in getVisitor');
    return res.status(400).json({ success: false, message: err.message });
  }
};
