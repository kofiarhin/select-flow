const archiver = require('archiver');
const { readFile } = require('./storageService');

const streamZip = async (res, filename, items) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (error) => {
    throw error;
  });
  archive.pipe(res);

  for (const item of items) {
    const buffer = await readFile(item.storagePath);
    archive.append(buffer, { name: item.originalFilename });
  }

  await archive.finalize();
};

module.exports = { streamZip };
