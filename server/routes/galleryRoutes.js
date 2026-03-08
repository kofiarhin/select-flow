const express = require('express');
const { getGallery, saveSelection, submitSelection, downloadFinals } = require('../controllers/galleryController');

const router = express.Router();
router.get('/:clientAccessToken', getGallery);
router.post('/:clientAccessToken/selection', saveSelection);
router.post('/:clientAccessToken/submit', submitSelection);
router.get('/:clientAccessToken/download/finals', downloadFinals);

module.exports = router;
