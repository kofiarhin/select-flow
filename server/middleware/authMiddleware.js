const jwt = require('jsonwebtoken');
const Photographer = require('../models/Photographer');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return next({ status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await Photographer.findById(payload.id);
    if (!user) return next({ status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' });
    req.user = user;
    return next();
  } catch (error) {
    return next({ status: 401, message: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};

module.exports = { requireAuth };
