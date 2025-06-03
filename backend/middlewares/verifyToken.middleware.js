import jwt from 'jsonwebtoken';
import logger from '../configs/pino.config.js';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token missing from authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error(err, 'Error in verifyToken');
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default verifyToken;
