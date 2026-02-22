const path = require('path');
const crypto = require('crypto');
const sanitizeFilename = require('sanitize-filename');

const ALLOWED_ORIGINALS = new Set(['.jpg', '.jpeg', '.png', '.cr2', '.nef', '.arw', '.dng']);
const ALLOWED_FINALS = new Set(['.jpg', '.jpeg', '.png']);
const RAW_EXTENSIONS = new Set(['.cr2', '.nef', '.arw', '.dng']);

const sanitizeName = (filename) => sanitizeFilename(path.basename(filename)).replace(/\s+/g, '_');
const uniqueName = (filename) => `${Date.now()}-${crypto.randomUUID()}-${sanitizeName(filename)}`;
const ext = (filename) => path.extname(filename).toLowerCase();

module.exports = { ALLOWED_ORIGINALS, ALLOWED_FINALS, RAW_EXTENSIONS, sanitizeName, uniqueName, ext };
