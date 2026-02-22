const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE || 1073741824) } });

module.exports = { upload };
