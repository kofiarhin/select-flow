const ProjectModel = require('../models/Project');
const Image = require('../models/Image');
const { ok } = require('../utils/apiResponse');
const { failValidation } = require('../middleware/validate');
const { streamZip } = require('../services/zipService');

const { Project } = ProjectModel;

const getGallery = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      clientAccessToken: req.params.clientAccessToken
    });

    if (!project) {
      return next({
        status: 404,
        message: 'Gallery not found',
        code: 'NOT_FOUND'
      });
    }

    const phase = project.status === 'FINAL_DELIVERED' ? 'FINAL' : 'ORIGINAL';

    const selectFields =
      phase === 'FINAL'
        ? 'originalFilename previewPath storagePath isSelected phase createdAt'
        : 'originalFilename previewPath isSelected phase createdAt';

    const images = await Image.find({ projectId: project._id, phase })
      .select(selectFields)
      .sort({ createdAt: -1 });

    return ok(res, { project, images });
  } catch (error) {
    return next(error);
  }
};

const saveSelection = async (req, res, next) => {
  const { selectedImageIds } = req.body;

  if (!Array.isArray(selectedImageIds)) {
    return failValidation(res, 'selectedImageIds', 'selectedImageIds must be array');
  }

  try {
    const project = await Project.findOne({
      clientAccessToken: req.params.clientAccessToken
    });

    if (!project) {
      return next({
        status: 404,
        message: 'Gallery not found',
        code: 'NOT_FOUND'
      });
    }

    if (project.selectionLocked || project.status === 'FINAL_DELIVERED') {
      return next({
        status: 403,
        message: 'Selection is locked for this gallery',
        code: 'SELECTION_LOCKED'
      });
    }

    const originals = await Image.find({
      projectId: project._id,
      phase: 'ORIGINAL'
    }).select('_id');

    const ids = new Set(selectedImageIds.map(String));

    for (const image of originals) {
      await Image.updateOne(
        { _id: image._id },
        { isSelected: ids.has(String(image._id)) }
      );
    }

    return ok(res, { saved: true });
  } catch (error) {
    return next(error);
  }
};

const submitSelection = async (req, res, next) => {
  try {
    const project = await Project.findOne({ clientAccessToken: req.params.clientAccessToken });

    if (!project) {
      return next({
        status: 404,
        message: 'Gallery not found',
        code: 'NOT_FOUND'
      });
    }

    if (project.status === 'FINAL_DELIVERED' || project.selectionLocked) {
      return next({
        status: 400,
        message: 'Selection has already been submitted',
        code: 'SELECTION_ALREADY_SUBMITTED'
      });
    }

    const selectedCount = await Image.countDocuments({
      projectId: project._id,
      phase: 'ORIGINAL',
      isSelected: true
    });

    if (!selectedCount) {
      return next({
        status: 400,
        message: 'Select at least one image before submitting',
        code: 'NO_SELECTED_IMAGES'
      });
    }

    project.selectionLocked = true;
    project.selectionSubmittedAt = new Date();
    project.status = 'SELECTION_RECEIVED';
    await project.save();

    return ok(res, { submitted: true, selectionSubmittedAt: project.selectionSubmittedAt });
  } catch (error) {
    return next(error);
  }
};

const downloadFinals = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      clientAccessToken: req.params.clientAccessToken
    });

    if (!project) {
      return next({
        status: 404,
        message: 'Gallery not found',
        code: 'NOT_FOUND'
      });
    }

    if (project.status !== 'FINAL_DELIVERED') {
      return next({
        status: 403,
        message: 'Finals not delivered',
        code: 'FORBIDDEN'
      });
    }

    const finals = await Image.find({ projectId: project._id, phase: 'FINAL' });
    await streamZip(res, `${project.name}-finals.zip`, finals);
  } catch (error) {
    next(error);
  }
};

module.exports = { getGallery, saveSelection, submitSelection, downloadFinals };
