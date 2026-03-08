const request = require('supertest');
const app = require('../app');
const Image = require('../models/Image');
const storageService = require('../services/storageService');
require('./setup');

describe('API integration', () => {
  test('auth register/login/me flow', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'a@test.com', password: 'password123' });
    expect(register.status).toBe(200);
    const token = register.body.data.token;
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
  });

  test('save selection keeps project editable', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'b@test.com', password: 'password123' });
    const token = register.body.data.token;
    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'Shoot' });

    await Image.insertMany([
      {
        projectId: projectRes.body.data._id,
        originalFilename: 'one.jpg',
        storagePath: 'originals/proj/one.jpg',
        previewPath: 'previews/proj/one.jpg',
        fileType: 'JPG',
        phase: 'ORIGINAL',
        isSelected: false
      },
      {
        projectId: projectRes.body.data._id,
        originalFilename: 'two.jpg',
        storagePath: 'originals/proj/two.jpg',
        previewPath: 'previews/proj/two.jpg',
        fileType: 'JPG',
        phase: 'ORIGINAL',
        isSelected: false
      }
    ]);

    const save = await request(app)
      .post(`/api/gallery/${projectRes.body.data.clientAccessToken}/selection`)
      .send({ selectedImageIds: [] });

    expect(save.status).toBe(200);

    const updated = await request(app)
      .get(`/api/projects/${projectRes.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(updated.body.data.project.status).toBe('AWAITING_SELECTION');
    expect(updated.body.data.project.selectionLocked).toBe(false);
  });

  test('submit final selection locks selection and sets received status', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'submit@test.com', password: 'password123' });
    const token = register.body.data.token;
    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'Submit Shoot' });

    const image = await Image.create({
      projectId: projectRes.body.data._id,
      originalFilename: 'one.jpg',
      storagePath: 'originals/proj/one.jpg',
      previewPath: 'previews/proj/one.jpg',
      fileType: 'JPG',
      phase: 'ORIGINAL',
      isSelected: false
    });

    await request(app)
      .post(`/api/gallery/${projectRes.body.data.clientAccessToken}/selection`)
      .send({ selectedImageIds: [String(image._id)] });

    const submit = await request(app)
      .post(`/api/gallery/${projectRes.body.data.clientAccessToken}/submit`)
      .send({});

    expect(submit.status).toBe(200);
    expect(submit.body.data.submitted).toBe(true);

    const updated = await request(app)
      .get(`/api/projects/${projectRes.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(updated.body.data.project.status).toBe('SELECTION_RECEIVED');
    expect(updated.body.data.project.selectionLocked).toBe(true);
    expect(updated.body.data.project.selectionSubmittedAt).toBeTruthy();
  });

  test('submit with no selected images fails clearly', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'nosel@test.com', password: 'password123' });
    const token = register.body.data.token;
    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'No Selected Shoot' });

    await Image.create({
      projectId: projectRes.body.data._id,
      originalFilename: 'one.jpg',
      storagePath: 'originals/proj/one.jpg',
      previewPath: 'previews/proj/one.jpg',
      fileType: 'JPG',
      phase: 'ORIGINAL',
      isSelected: false
    });

    const submit = await request(app)
      .post(`/api/gallery/${projectRes.body.data.clientAccessToken}/submit`)
      .send({});

    expect(submit.status).toBe(400);
    expect(submit.body.code).toBe('NO_SELECTED_IMAGES');
  });

  test('reopen selection unlocks gallery and resets awaiting status', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'reopen@test.com', password: 'password123' });
    const token = register.body.data.token;
    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'Reopen Shoot' });

    const projectId = projectRes.body.data._id;

    await request(app)
      .patch(`/api/projects/${projectId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'SELECTION_RECEIVED' });

    const selectedImage = await Image.create({
      projectId,
      originalFilename: 'selected.jpg',
      storagePath: 'originals/proj/selected.jpg',
      previewPath: 'previews/proj/selected.jpg',
      fileType: 'JPG',
      phase: 'ORIGINAL',
      isSelected: false
    });

    await request(app)
      .post(`/api/gallery/${projectRes.body.data.clientAccessToken}/selection`)
      .send({ selectedImageIds: [String(selectedImage._id)] });

    await request(app)
      .post(`/api/gallery/${projectRes.body.data.clientAccessToken}/submit`)
      .send({});

    const reopen = await request(app)
      .patch(`/api/projects/${projectId}/reopen-selection`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(reopen.status).toBe(200);
    expect(reopen.body.data.selectionLocked).toBe(false);
    expect(reopen.body.data.selectionSubmittedAt).toBeNull();
    expect(reopen.body.data.status).toBe('AWAITING_SELECTION');
  });

  test('unauthorized reopen fails', async () => {
    const registerA = await request(app).post('/api/auth/register').send({ name: 'A', email: 'owner-reopen@test.com', password: 'password123' });
    const tokenA = registerA.body.data.token;
    const registerB = await request(app).post('/api/auth/register').send({ name: 'B', email: 'other-reopen@test.com', password: 'password123' });
    const tokenB = registerB.body.data.token;

    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Owner Project' });

    const response = await request(app)
      .patch(`/api/projects/${projectRes.body.data._id}/reopen-selection`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({});

    expect(response.status).toBe(404);
  });

  test('download endpoint header', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'c@test.com', password: 'password123' });
    const token = register.body.data.token;
    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'Shoot' });

    await Image.create({
      projectId: projectRes.body.data._id,
      originalFilename: 'one.jpg',
      storagePath: 'originals/proj/one.jpg',
      previewPath: 'previews/proj/one.jpg',
      fileType: 'JPG',
      phase: 'ORIGINAL',
      isSelected: true
    });

    const zip = await request(app).get(`/api/projects/${projectRes.body.data._id}/download/selected`).set('Authorization', `Bearer ${token}`);
    expect(zip.status).toBe(200);
    expect(zip.headers['content-type']).toContain('application/zip');
  });

  test('hard delete removes project and related images', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'delete@test.com', password: 'password123' });
    const token = register.body.data.token;
    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'Delete Shoot' });

    await Image.insertMany([
      {
        projectId: projectRes.body.data._id,
        originalFilename: 'one.jpg',
        storagePath: 'originals/proj/one.jpg',
        previewPath: 'previews/proj/one.jpg',
        fileType: 'JPG',
        phase: 'ORIGINAL',
        isSelected: true
      },
      {
        projectId: projectRes.body.data._id,
        originalFilename: 'two.jpg',
        storagePath: 'originals/proj/one.jpg',
        previewPath: '',
        fileType: 'JPG',
        phase: 'FINAL',
        isSelected: false
      }
    ]);

    const removeSpy = jest.spyOn(storageService, 'deleteFile');

    const response = await request(app)
      .delete(`/api/projects/${projectRes.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(projectRes.body.data._id);

    const getDeletedProject = await request(app)
      .get(`/api/projects/${projectRes.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getDeletedProject.status).toBe(404);

    const images = await Image.find({ projectId: projectRes.body.data._id });
    expect(images.length).toBe(0);
    expect(removeSpy).toHaveBeenCalledTimes(2);
    removeSpy.mockRestore();
  });

  test('delete non-existent project returns 404', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'notfound@test.com', password: 'password123' });
    const token = register.body.data.token;

    const response = await request(app)
      .delete('/api/projects/66f1f77bcf86cd7994390111')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  test('unauthorized delete fails', async () => {
    const registerA = await request(app).post('/api/auth/register').send({ name: 'A', email: 'owner@test.com', password: 'password123' });
    const tokenA = registerA.body.data.token;
    const registerB = await request(app).post('/api/auth/register').send({ name: 'B', email: 'other@test.com', password: 'password123' });
    const tokenB = registerB.body.data.token;

    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Owner Project' });

    const response = await request(app)
      .delete(`/api/projects/${projectRes.body.data._id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(response.status).toBe(404);

    const ownerView = await request(app)
      .get(`/api/projects/${projectRes.body.data._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(ownerView.status).toBe(200);
  });

  test('file cleanup failure prevents DB deletion', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'failcleanup@test.com', password: 'password123' });
    const token = register.body.data.token;
    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'Cleanup Fail' });

    await Image.create({
      projectId: projectRes.body.data._id,
      originalFilename: 'one.jpg',
      storagePath: 'originals/proj/fail.jpg',
      previewPath: 'previews/proj/fail.jpg',
      fileType: 'JPG',
      phase: 'ORIGINAL',
      isSelected: false
    });

    const removeSpy = jest.spyOn(storageService, 'deleteFile').mockRejectedValueOnce(new Error('boom'));

    const response = await request(app)
      .delete(`/api/projects/${projectRes.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.code).toBe('FILE_DELETE_FAILED');

    const stillThere = await request(app)
      .get(`/api/projects/${projectRes.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(stillThere.status).toBe(200);
    const images = await Image.find({ projectId: projectRes.body.data._id });
    expect(images.length).toBe(1);

    removeSpy.mockRestore();
  });
});
