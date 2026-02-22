const path = require('path');
const ProjectModel = require('../models/Project');
const Image = require('../models/Image');
const { readFile } = require('../services/storageService');

const { Project } = ProjectModel;

const serveAsset = async (req, res, next) => {
  const { type, projectId, filename } = req.params;
  if (!['previews', 'finals'].includes(type)) return next({ status: 400, message: 'Invalid asset type', code: 'BAD_REQUEST' });
  try {
    if (type === 'previews') {
      const token = req.query.token;
      const project = await Project.findOne({ _id: projectId, clientAccessToken: token });
      if (!project) return next({ status: 403, message: 'Forbidden', code: 'FORBIDDEN' });
    }
    if (type === 'finals') {
      const token = req.query.token;
      const project = await Project.findOne({ _id: projectId, clientAccessToken: token, status: 'FINAL_DELIVERED' });
      if (!project) return next({ status: 403, message: 'Forbidden', code: 'FORBIDDEN' });
    }

    const image = await Image.findOne({ projectId, previewPath: path.posix.join('previews', projectId, filename) }) ||
      await Image.findOne({ projectId, storagePath: path.posix.join('finals', projectId, filename) });
    if (!image) return next({ status: 404, message: 'Asset not found', code: 'NOT_FOUND' });
    const key = type === 'previews' ? image.previewPath : image.storagePath;
    const file = await readFile(key);
    res.setHeader('Content-Type', filename.endsWith('.png') ? 'image/png' : 'image/jpeg');
    res.send(file);
  } catch (error) { return next(error); }
};

module.exports = { serveAsset };
