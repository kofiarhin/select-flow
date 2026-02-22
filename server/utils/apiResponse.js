const ok = (res, data, message = 'OK') => res.json({ success: true, data, message });

const fail = (res, status, message, code = 'ERROR', errors) =>
  res.status(status).json({ success: false, message, code, ...(errors ? { errors } : {}) });

module.exports = { ok, fail };
