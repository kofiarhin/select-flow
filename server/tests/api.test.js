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

  test('project + selection status update', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'b@test.com', password: 'password123' });
    const token = register.body.data.token;
    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'Shoot' });
    expect(projectRes.status).toBe(200);
    const gallery = await request(app).get(`/api/gallery/${projectRes.body.data.clientAccessToken}`);
    expect(gallery.status).toBe(200);
    const save = await request(app).post(`/api/gallery/${projectRes.body.data.clientAccessToken}/selection`).send({ selectedImageIds: [] });
    expect(save.status).toBe(200);
    const updated = await request(app).get(`/api/projects/${projectRes.body.data._id}`).set('Authorization', `Bearer ${token}`);
    expect(updated.body.data.project.status).toBe('SELECTION_RECEIVED');
  });

  test('download endpoint header', async () => {
    const register = await request(app).post('/api/auth/register').send({ name: 'A', email: 'c@test.com', password: 'password123' });
    const token = register.body.data.token;
    const projectRes = await request(app).post('/api/projects').set('Authorization', `Bearer ${token}`).send({ name: 'Shoot' });
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
