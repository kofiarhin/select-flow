const path = require('path');
const ProjectModel = require('../models/Project');
const Image = require('../models/Image');
const { generateClientToken } = require('../utils/tokens');
const { ok } = require('../utils/apiResponse');
const { failValidation } = require('../middleware/validate');
const { PROJECT_STATUSES } = ProjectModel;
const { streamZip } = require('../services/zipService');
const { ALLOWED_ORIGINALS, ALLOWED_FINALS, RAW_EXTENSIONS, uniqueName, ext } = require('../utils/files');
const { writeFile } = require('../services/storageService');
const { generateJpegPreview } = require('../services/imageService');

const { Project } = ProjectModel;

const createProject = async (req, res, next) => {
  const { name } = req.body;
  if (!name) return failValidation(res, 'name', 'name is required');
  try {
    const project = await Project.create({ photographerId: req.user._id, name, clientAccessToken: generateClientToken() });
    return ok(res, project);
  } catch (error) { return next(error); }
};

const listProjects = async (req, res, next) => {
  try { const data = await Project.find({ photographerId: req.user._id }).sort({ createdAt: -1 }); return ok(res, data); }
  catch (error) { return next(error); }
};

const getProject = async (req, res, next) => {
  if (!req.params.id) return failValidation(res, 'id', 'id is required');
  try {
    const project = await Project.findOne({ _id: req.params.id, photographerId: req.user._id });
    if (!project) return next({ status: 404, message: 'Project not found', code: 'NOT_FOUND' });
    const images = await Image.find({ projectId: project._id }).sort({ createdAt: -1 });
    return ok(res, { project, images });
  } catch (error) { return next(error); }
};

const patchStatus = async (req, res, next) => {
  const { status } = req.body;
  if (!PROJECT_STATUSES.includes(status)) return failValidation(res, 'status', 'invalid status');
  try {
    const project = await Project.findOneAndUpdate({ _id: req.params.id, photographerId: req.user._id }, { status }, { new: true });
    if (!project) return next({ status: 404, message: 'Project not found', code: 'NOT_FOUND' });
    return ok(res, project);
  } catch (error) { return next(error); }
};

const processUploads = async (files, projectId, phase) => {
  const created = [];
  for (const file of files) {
    const extension = ext(file.originalname);
    const allowSet = phase === 'ORIGINAL' ? ALLOWED_ORIGINALS : ALLOWED_FINALS;
    if (!allowSet.has(extension)) throw { status: 400, message: `Disallowed file type: ${extension}`, code: 'BAD_FILE_TYPE' };
    const filename = uniqueName(file.originalname);
    const folder = phase === 'ORIGINAL' ? 'originals' : 'finals';
    const storagePath = path.posix.join(folder, String(projectId), filename);
    await writeFile(storagePath, file.buffer, file.mimetype);

    let previewPath = storagePath;
    if (phase === 'ORIGINAL' || RAW_EXTENSIONS.has(extension)) {
      const preview = await generateJpegPreview(file.buffer, extension);
      previewPath = path.posix.join('previews', String(projectId), `${filename}.jpg`);
      await writeFile(previewPath, preview, 'image/jpeg');
    }

    created.push({
      projectId,
      originalFilename: file.originalname,
      storagePath,
      previewPath,
      fileType: extension.replace('.', '').toUpperCase(),
      phase,
      isSelected: false
    });
  }
  return Image.insertMany(created);
};

const uploadOriginals = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, photographerId: req.user._id });
    if (!project) return next({ status: 404, message: 'Project not found', code: 'NOT_FOUND' });
    if (!req.files?.length) return failValidation(res, 'files', 'files are required');
    const images = await processUploads(req.files, project._id, 'ORIGINAL');
    return ok(res, images);
  } catch (error) { return next(error); }
};

const uploadFinals = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, photographerId: req.user._id });
    if (!project) return next({ status: 404, message: 'Project not found', code: 'NOT_FOUND' });
    if (!req.files?.length) return failValidation(res, 'files', 'files are required');
    const images = await processUploads(req.files, project._id, 'FINAL');
    project.status = 'FINAL_DELIVERED';
    await project.save();
    return ok(res, images);
  } catch (error) { return next(error); }
};

const downloadSelected = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, photographerId: req.user._id });
    if (!project) return next({ status: 404, message: 'Project not found', code: 'NOT_FOUND' });
    const selected = await Image.find({ projectId: project._id, phase: 'ORIGINAL', isSelected: true });
    await streamZip(res, `${project.name}-selected.zip`, selected);
  } catch (error) { next(error); }
};

module.exports = { createProject, listProjects, getProject, patchStatus, uploadOriginals, uploadFinals, downloadSelected };
