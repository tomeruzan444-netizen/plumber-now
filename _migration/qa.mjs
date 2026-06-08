// סורק QA על קבצי התוכן שעברו מיגרציה
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = ['cities', 'services', 'regions', 'static'];
const files = [];
const slugs = new Set(['']); // homepage
for (const d of dirs) {
  for (const f of readdirSync(`content/${d}`)) {
    if (f.endsWith('.md')) {
      const full = join('content', d, f);
      const txt = readFileSync(full, 'utf8');
      const slug = (/^slug:\s*"([^"]+)"/m.exec(txt) || [])[1];
      files.push({ d, f, full, txt, slug });
      if (slug) slugs.add(slug);
    }
  }
}

const issues = [];
const add = (file, type, detail) => issues.push({ file, type, detail });

for (const { f, txt, slug } of files) {
  const body = txt.split(/^---$/m).slice(2).join('---');
  // leftover HTML tags (allow our img markdown)
  const tags = [...body.matchAll(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi)].map((m) => m[0]);
  if (tags.length) add(f, 'HTML_LEFTOVER', tags.slice(0, 3).join(' '));
  // leftover entities
  const ents = [...body.matchAll(/&#?\w+;/g)].map((m) => m[0]);
  if (ents.length) add(f, 'ENTITY', [...new Set(ents)].slice(0, 5).join(' '));
  // stray markers
  if (/§/.test(body)) add(f, 'MARKER', 'leftover § marker');
  // empty headings
  if (/^#{1,4}\s*$/m.test(body)) add(f, 'EMPTY_HEADING', '');
  // object/undefined
  if (/\[object|undefined|null/.test(body)) add(f, 'BAD_VALUE', '');
  // missing body
  if (body.trim().length < 200) add(f, 'SHORT_BODY', body.trim().length + ' chars');
  // broken markdown image (empty path)
  if (/!\[[^\]]*\]\(\s*\)/.test(body)) add(f, 'EMPTY_IMG', '');
  // internal links resolve?
  for (const m of body.matchAll(/\]\((\/[^)\s]+)\)/g)) {
    const target = decodeURIComponent(m[1]).replace(/^\/|\/$/g, '');
    if (m[1].startsWith('/images/')) continue;
    if (!slugs.has(target)) add(f, 'DEAD_LINK', m[1]);
  }
}

// סיכום
const byType = {};
issues.forEach((i) => { byType[i.type] = (byType[i.type] || 0) + 1; });
console.log('FILES:', files.length, ' SLUGS:', slugs.size);
console.log('ISSUES BY TYPE:', JSON.stringify(byType, null, 0));
console.log('---- DETAILS (first 40) ----');
issues.slice(0, 40).forEach((i) => console.log(`[${i.type}] ${i.file}  ${i.detail}`));
console.log('TOTAL ISSUES:', issues.length);
