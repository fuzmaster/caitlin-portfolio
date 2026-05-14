import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import sharp from 'sharp';

const root = process.cwd();
const sourceDir = path.join(root, 'assets');
const outRoot = path.join(sourceDir, 'optimized');

const files = await fg('assets/**/*.{png,jpg,jpeg}', {
  cwd: root,
  ignore: ['assets/optimized/**']
});

const widths = [640, 1280];
let optimizedCount = 0;
let skippedCount = 0;

const isFresh = async (srcPath, outFile) => {
  try {
    const [srcStat, outStat] = await Promise.all([
      fs.promises.stat(srcPath),
      fs.promises.stat(outFile)
    ]);
    return outStat.mtimeMs >= srcStat.mtimeMs;
  } catch {
    return false;
  }
};

for (const relativeFile of files) {
  const srcPath = path.join(root, relativeFile);
  const relativeWithoutAssets = relativeFile.replace(/^assets\//, '');
  const parsed = path.parse(relativeWithoutAssets);
  const targetDir = path.join(outRoot, parsed.dir);

  await fs.promises.mkdir(targetDir, { recursive: true });

  for (const width of widths) {
    const outFile = path.join(targetDir, `${parsed.name}-${width}.webp`);
    if (await isFresh(srcPath, outFile)) {
      skippedCount += 1;
      continue;
    }

    await sharp(srcPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(outFile);
    optimizedCount += 1;
  }
}

console.log(`Optimized ${optimizedCount} images into ${outRoot}; skipped ${skippedCount} fresh outputs.`);
