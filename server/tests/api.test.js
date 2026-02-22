const request = require('supertest');
const app = require('../app');
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
});
