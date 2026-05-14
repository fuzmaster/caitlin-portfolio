import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'assets', 'images', 'avatar.png');
const outputPath = path.join(root, 'assets', 'images', 'social-preview.png');

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f8f4ee"/>
  <rect x="42" y="42" width="1116" height="546" rx="28" fill="#ffffff" stroke="#d8c9b6" stroke-width="2"/>
  <circle cx="918" cy="315" r="170" fill="#e9ddd0"/>
  <text x="90" y="176" font-family="Arial, sans-serif" font-size="33" font-weight="700" fill="#9d4f32">Remote Admin + Customer Support</text>
  <text x="90" y="284" font-family="Georgia, serif" font-size="70" font-weight="700" fill="#17262f">Caitlin Britten</text>
  <text x="92" y="358" font-family="Arial, sans-serif" font-size="30" fill="#314754">Scheduling coordination, client communication,</text>
  <text x="92" y="400" font-family="Arial, sans-serif" font-size="30" fill="#314754">payment processing, and campaign support</text>
  <text x="92" y="508" font-family="Arial, sans-serif" font-size="27" font-weight="700" fill="#9d4f32">Peabody, MA | Remote-ready home office</text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([
    {
      input: await sharp(inputPath)
        .resize(290, 290, { fit: 'cover' })
        .png()
        .toBuffer(),
      top: 170,
      left: 774
    }
  ])
  .png()
  .toFile(outputPath);

console.log(`Wrote ${outputPath}`);
