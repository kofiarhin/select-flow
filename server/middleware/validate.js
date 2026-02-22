const failValidation = (res, field, message) =>
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    errors: [{ field, message }]
  });

module.exports = { failValidation };
