require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { logger } = require('./utils/logger');

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/selectflow';

const start = async () => {
  await mongoose.connect(MONGO_URI);
  logger.info({ message: 'Mongo connected' });
  app.listen(PORT, () => logger.info({ message: `Server listening on ${PORT}` }));
};

start().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
