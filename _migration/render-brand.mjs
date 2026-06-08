// מרנדר favicon + og-image מתוך brand-render.html ושומר ל-public/
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

let browser;
for (const opt of [{ channel: 'msedge' }, {}]) { try { browser = await chromium.launch(opt); break; } catch {} }
const page = await browser.newPage({ viewport: { width: 1280, height: 700 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL('_migration/brand-render.html').href, { waitUntil: 'networkidle' });
await page.waitForTimeout(600); // לטעינת הפונט

// אייקון (badge) ברקע שקוף בגודל 512
const badge = await page.$('#badge');
await badge.screenshot({ path: '_migration/shots/badge-512.png', omitBackground: true });

// og card 1200x630
const og = await page.$('#og');
await og.screenshot({ path: 'public/images/og-image.png' });

await browser.close();

// יצירת favicon בגדלים שונים מתוך ה-badge עם sharp
const src = readFileSync('_migration/shots/badge-512.png');
for (const size of [32, 180, 192, 270]) {
  await sharp(src).resize(size, size).png().toFile(`public/favicon-${size}.png`);
}
// apple-touch + 192 לשמות הקיימים
await sharp(src).resize(180, 180).png().toFile('public/favicon-180.png');
console.log('brand assets rendered: og-image.png, favicon-32/180/192/270.png');
