const express = require('express');
const {
  createProject,
  listProjects,
  getProject,
  patchStatus,
  reopenSelection,
  uploadOriginals,
  uploadFinals,
  deleteProject,
  downloadSelected
} = require('../controllers/projectController');
const { requireAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();
router.use(requireAuth);
router.post('/', createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.patch('/:id/status', patchStatus);
router.patch('/:id/reopen-selection', reopenSelection);
router.delete('/:id', deleteProject);
router.post('/:id/upload/originals', uploadLimiter, upload.array('files', 500), uploadOriginals);
router.post('/:id/upload/finals', uploadLimiter, upload.array('files', 500), uploadFinals);
router.get('/:id/download/selected', downloadSelected);

module.exports = router;
