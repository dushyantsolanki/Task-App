import nodemailer from 'nodemailer';
import verificationTemplate from './verificationTemplate.js';
import resendOTPTemplate from './resendOTPTemplate.js';
import dotenv from 'dotenv';
import { forgotPassTemplate } from './forgotPassTemplate.js';
import logger from '../../configs/pino.config.js';
import portfolioQueryCopyTemplate from './portfolioQueryCopyTemplate.js';
import portfolioQueryTemplate from './portfolioQueryTemplate.js';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationMail = async (to, surname, OTP, expiredIn, purpose) => {
  let html;
  if (purpose === 'verify_account') {
    html = verificationTemplate(surname, OTP, expiredIn);
  }

  if (purpose === 'resend_otp') {
    html = resendOTPTemplate(surname, OTP, expiredIn);
  }

  if (purpose === 'forgot_password') {
    html = forgotPassTemplate(surname, OTP, expiredIn);
  }
  if (purpose === 'portfolio_query') {
    html = portfolioQueryTemplate(name, message);
  }

  const mailOptions = {
    from: '"Take Mate" <' + process.env.EMAIL_USER + '>',
    to,
    subject: 'Verify Your Task Mate Account',
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info({ func: 'sendVerificationMail', message: `${info.response}` });

    return info;
  } catch (err) {
    logger.error(err, 'Error in sendVerificationMail');
    throw err;
  }
};

const sendPortfolioQueryMail = async (name, to, message, purpose) => {
  let html;
  let mailOptions;

  if (purpose === 'portfolio_query_copy') {
    html = portfolioQueryCopyTemplate(name, message);
    mailOptions = {
      from: '"Dushyant Portfolio" <' + process.env.EMAIL_USER + '>',
      to,
      subject: 'Portfolio Contact',
      html,
    };
  }

  if (purpose === 'portfolio_query') {
    html = portfolioQueryTemplate(to, name, message);
    mailOptions = {
      from: '"Dushyant Portfolio" <' + process.env.EMAIL_USER + '>',
      to: 'dushyantsolanki.dev@gmail.com',
      subject: 'Portfolio Contact',
      html,
    };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info({ func: 'sendPortfolioQueryMail', message: `${info.response}` });

    return info;
  } catch (err) {
    logger.error(err, 'Error in sendPortfolioQueryMail');
    throw err;
  }
};

export { sendVerificationMail, sendPortfolioQueryMail };
