import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const outDir = path.join(projectRoot, 'src', 'assets', 'build');
const manifestPath = path.join(projectRoot, 'src', '_data', 'asset-manifest.json');

await fs.promises.mkdir(outDir, { recursive: true });

const result = await build({
  entryPoints: [
    'src/css/styles.css',
    'src/js/main.js',
    'src/js/gallery-page.js'
  ],
  outdir: outDir,
  outbase: 'src',
  bundle: true,
  minify: true,
  sourcemap: false,
  metafile: true,
  entryNames: '[dir]/[name]-[hash]'
});

const manifest = {};
for (const [outputFile, outputMeta] of Object.entries(result.metafile.outputs)) {
  if (!outputMeta.entryPoint) {
    continue;
  }

  const logicalPath = outputMeta.entryPoint.replace(/^src\//, '');
  const finalPath = outputFile.replace(/^src\//, '');
  manifest[logicalPath] = finalPath.replace(/\\/g, '/');
}

await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
console.log('Asset manifest updated:', manifestPath);
