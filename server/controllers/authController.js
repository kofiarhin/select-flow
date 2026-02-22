const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Photographer = require('../models/Photographer');
const { ok } = require('../utils/apiResponse');
const { failValidation } = require('../middleware/validate');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name) return failValidation(res, 'name', 'name is required');
  if (!email) return failValidation(res, 'email', 'email is required');
  if (!password || password.length < 8) return failValidation(res, 'password', 'password must be at least 8 characters');
  try {
    const exists = await Photographer.findOne({ email: email.toLowerCase() });
    if (exists) return next({ status: 409, message: 'Email already exists', code: 'EMAIL_EXISTS' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Photographer.create({ name, email: email.toLowerCase(), passwordHash });
    return ok(res, { token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { return next(error); }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) return failValidation(res, 'email', 'email is required');
  if (!password) return failValidation(res, 'password', 'password is required');
  try {
    const user = await Photographer.findOne({ email: email.toLowerCase() });
    if (!user) return next({ status: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return next({ status: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    return ok(res, { token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { return next(error); }
};

const me = async (req, res) => ok(res, { id: req.user._id, name: req.user.name, email: req.user.email });

module.exports = { register, login, me };
