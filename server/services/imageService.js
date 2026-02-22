const sharp = require('sharp');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

const generateJpegPreview = async (buffer, extension) => {
  if (['.jpg', '.jpeg', '.png'].includes(extension)) {
    return sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'selectflow-raw-'));
  const rawPath = path.join(tempDir, `input${extension}`);
  await fs.writeFile(rawPath, buffer);
  const { stdout } = await execFileAsync('dcraw', ['-e', '-c', rawPath], { maxBuffer: 30 * 1024 * 1024 });
  await fs.rm(tempDir, { recursive: true, force: true });
  return sharp(stdout).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
};

module.exports = { generateJpegPreview };
