const express = require('express');
const { getGallery, saveSelection, downloadFinals } = require('../controllers/galleryController');

const router = express.Router();
router.get('/:clientAccessToken', getGallery);
router.post('/:clientAccessToken/selection', saveSelection);
router.get('/:clientAccessToken/download/finals', downloadFinals);

module.exports = router;
