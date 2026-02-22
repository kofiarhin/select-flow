const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const pinoHttp = require('pino-http');
const { logger } = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const assetRoutes = require('./routes/assetRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json({ limit: '2mb' }));
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { ok: true }, message: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/assets', assetRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
