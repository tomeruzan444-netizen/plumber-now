// מנקה את content.rendered של עמוד וורדפרס/Elementor לתוכן סמנטי קריא.
// שימוש: node _migration/clean.mjs <pageId>
import { readFileSync, writeFileSync } from 'node:fs';

const id = Number(process.argv[2] || 3311);
const pages = JSON.parse(readFileSync('_migration/raw/pages-rest.json', 'utf8'));
const pg = pages.find((p) => p.id === id);
if (!pg) { console.error('page not found:', id); process.exit(1); }

let html = pg.content.rendered;

// 1. הסרת style/script/svg
html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
html = html.replace(/<svg[\s\S]*?<\/svg>/gi, '');
html = html.replace(/<!--[\s\S]*?-->/g, '');

// 2. נשמור href של קישורים ו-src/alt של תמונות לפני ניקוי אטריביוטים
html = html.replace(/<a\b[^>]*?href="([^"]*)"[^>]*>/gi, '<a href="$1">');
html = html.replace(/<img\b[^>]*?src="([^"]*)"[^>]*?(?:alt="([^"]*)")?[^>]*>/gi, (m, src, alt) => `\n[IMG src="${src}" alt="${alt||''}"]\n`);

// 3. תיוג סוף בלוקים סמנטיים לקריאוּת
const keep = ['h1','h2','h3','h4','h5','h6','p','ul','ol','li','table','thead','tbody','tr','td','th','strong','b','a','br'];
// הסרת כל תג שאינו ברשימה
html = html.replace(/<\/?([a-z0-9]+)\b[^>]*>/gi, (m, tag) => {
  tag = tag.toLowerCase();
  if (keep.includes(tag)) {
    if (tag === 'a') return m; // כבר נוקה
    return m.startsWith('</') ? `</${tag}>` : `<${tag}>`;
  }
  return ''; // השמטת התג, השארת התוכן
});

// 4. ניקוי רווחים מיותרים
html = html.replace(/&nbsp;/g, ' ');
html = html.replace(/[ \t]+/g, ' ');
html = html.replace(/\n\s*\n\s*\n+/g, '\n\n');
html = html.replace(/(<\/(h[1-6]|p|li|tr|table|ul|ol)>)/gi, '$1\n');
html = html.replace(/(<(h[1-6]|table|ul|ol|tr)>)/gi, '\n$1');

// 5. גרסת טקסט בלבד (outline) — להבנת המבנה
const text = html
  .replace(/<h1>/gi,'\n# ').replace(/<h2>/gi,'\n## ').replace(/<h3>/gi,'\n### ').replace(/<h4>/gi,'\n#### ')
  .replace(/<li>/gi,'\n  • ')
  .replace(/<tr>/gi,'\n  | ').replace(/<\/td>|<\/th>/gi,' | ')
  .replace(/<[^>]+>/g,'')
  .replace(/\n{3,}/g,'\n\n').trim();

writeFileSync(`_migration/clean-${id}.html`, html, 'utf8');
writeFileSync(`_migration/clean-${id}.txt`, text, 'utf8');
console.log(`id=${id}  title=${pg.title.rendered}`);
console.log(`outline length: ${text.length} chars`);
console.log('---- OUTLINE (first 4000 chars) ----');
console.log(text.slice(0, 4000));
