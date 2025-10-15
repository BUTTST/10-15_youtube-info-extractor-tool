import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SIZES = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

const INPUT_SVG = path.resolve(process.cwd(), 'icon.svg');
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons...');
  try {
    for (const { size, name } of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, name);
      await sharp(INPUT_SVG)
        .resize(size, size)
        .toFile(outputPath);
      console.log(`Generated ${name}`);
    }
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
