const express = require('express');
const { serveAsset } = require('../controllers/assetController');

const router = express.Router();
router.get('/:type/:projectId/:filename', serveAsset);

module.exports = router;
