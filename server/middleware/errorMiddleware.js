const { fail } = require('../utils/apiResponse');

const notFoundHandler = (req, res) => fail(res, 404, 'Route not found', 'NOT_FOUND');

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  fail(res, status, err.message || 'Internal server error', err.code || 'INTERNAL_ERROR', err.errors);
};

module.exports = { notFoundHandler, errorHandler };
