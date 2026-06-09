import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg');

// עוטף PNG בודד למבנה ICO תקין
function pngToIco(pngBuf, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const dir = Buffer.alloc(16);
  dir.writeUInt8(size >= 256 ? 0 : size, 0);
  dir.writeUInt8(size >= 256 ? 0 : size, 1);
  dir.writeUInt16LE(1, 4); dir.writeUInt16LE(32, 6);
  dir.writeUInt32LE(pngBuf.length, 8); dir.writeUInt32LE(22, 12);
  return Buffer.concat([header, dir, pngBuf]);
}

// כל הגדלים הנדרשים
const sizes = [16, 32, 48, 96, 180, 192, 270, 512];
for (const s of sizes) {
  await sharp(svg, { density: 384 }).resize(s, s).png().toFile(`public/favicon-${s}.png`);
}
console.log('favicons:', sizes.join(', '));

// favicon.ico בשורש (PNG 48x48 עטוף ב-ICO)
const png48 = await sharp(svg, { density: 384 }).resize(48, 48).png().toBuffer();
writeFileSync('public/favicon.ico', pngToIco(png48, 48));
console.log('favicon.ico written');

// תצוגה מקדימה: איך זה נראה בגודל זעיר על רקע לבן (סימולציית גוגל)
const small16 = await sharp(svg, { density: 384 }).resize(16, 16).png().toBuffer();
const small32 = await sharp(svg, { density: 384 }).resize(32, 32).png().toBuffer();
// הגדלה ב-nearest כדי לראות את הפיקסלים בפועל
const up16 = await sharp(small16).resize(96, 96, { kernel: 'nearest' }).toBuffer();
const up32 = await sharp(small32).resize(96, 96, { kernel: 'nearest' }).toBuffer();
const real16 = await sharp(small16).resize(48, 48).toBuffer(); // איך זה באמת ייראה (16px)

await sharp({ create: { width: 460, height: 150, channels: 4, background: '#ffffff' } })
  .composite([
    { input: up16, left: 20, top: 27 },
    { input: up32, left: 150, top: 27 },
    { input: real16, left: 300, top: 51 },
  ])
  .png().toFile('_migration/shots/favicon-preview.png');
console.log('preview saved: 16px(zoomed) | 32px(zoomed) | 16px(actual)');
