const fs = require('fs/promises');
const path = require('path');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');

const basePath = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'storage');
const driver = process.env.STORAGE_DRIVER || 'local';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
    : undefined,
  endpoint: process.env.AWS_ENDPOINT || undefined,
  forcePathStyle: Boolean(process.env.AWS_ENDPOINT)
});

const normalizeKey = (key) => {
  if (!key || typeof key !== 'string') return '';
  return key.replace(/^\/+/, '').replace(/\\/g, '/').trim();
};

const writeLocal = async (key, buffer) => {
  const absolute = path.join(basePath, key);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, buffer);
  return key;
};

const readLocal = async (key) => fs.readFile(path.join(basePath, key));

const deleteLocal = async (key) => {
  const absolute = path.join(basePath, key);
  try {
    await fs.unlink(absolute);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
};

const writeFile = async (key, buffer, contentType = 'application/octet-stream') => {
  const normalizedKey = normalizeKey(key);
  if (driver === 's3') {
    await s3.send(new PutObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: normalizedKey, Body: buffer, ContentType: contentType }));
    return normalizedKey;
  }
  return writeLocal(normalizedKey, buffer);
};

const readFile = async (key) => {
  const normalizedKey = normalizeKey(key);
  if (driver === 's3') {
    const response = await s3.send(new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: normalizedKey }));
    const chunks = [];
    for await (const chunk of response.Body) chunks.push(chunk);
    return Buffer.concat(chunks);
  }
  return readLocal(normalizedKey);
};

const deleteFile = async (key) => {
  const normalizedKey = normalizeKey(key);
  if (!normalizedKey) return;

  if (driver === 's3') {
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: normalizedKey }));
    return;
  }

  await deleteLocal(normalizedKey);
};

module.exports = { writeFile, readFile, deleteFile, driver, basePath };
