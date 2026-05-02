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

for (const relativeFile of files) {
  const srcPath = path.join(root, relativeFile);
  const relativeWithoutAssets = relativeFile.replace(/^assets\//, '');
  const parsed = path.parse(relativeWithoutAssets);
  const targetDir = path.join(outRoot, parsed.dir);

  await fs.promises.mkdir(targetDir, { recursive: true });

  const image = sharp(srcPath);
  const metadata = await image.metadata();

  for (const width of widths) {
    const outFile = path.join(targetDir, `${parsed.name}-${width}.webp`);
    await sharp(srcPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(outFile);
  }
}

console.log(`Optimized ${files.length} images into ${outRoot}`);
