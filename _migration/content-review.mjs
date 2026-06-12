// ביקורת תוכן מעמיקה על עמודי אזורי השירות (cities + regions) מול CONTENT-GUIDE
// קריאה בלבד - לא משנה כלום באתר. פלט: _migration/content-review.json + סיכום למסך.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TARGET = ['cities', 'regions'];
const pages = [];

function parse(txt) {
  const m = txt.split(/^---$/m);
  const fm = m[1] || '', body = m.slice(2).join('---').trim();
  const get = (k) => { const r = new RegExp('^' + k + ':\\s*"?(.*?)"?\\s*$', 'm').exec(fm); return r ? r[1] : ''; };
  return { seoTitle: get('seoTitle'), description: get('description'), slug: get('slug'),
    faqCount: (fm.match(/^\s*-\s*q:/gm) || []).length, body };
}
function plain(b) {
  return b.replace(/^\|.*$/gm, ' ').replace(/^#{1,6}\s+/gm, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/[*_>`]/g, '').replace(/\s+/g, ' ').trim();
}
function words(s) { return plain(s).split(/\s+/).filter((w) => /[֐-׿]/.test(w)); }
function sentences(b) {
  return plain(b).split(/(?<=[.?!])\s+|\n+/).map((s) => s.replace(/[^֐-׿\s]/g, '').replace(/\s+/g, ' ').trim())
    .filter((s) => s.split(' ').length >= 6);
}

// סמני גוף ראשון רבים (קול המותג "אנחנו")
const FP = ['אנחנו', 'אנו', 'שלנו', 'אצלנו', 'אלינו', 'אותנו', 'עבורנו', 'מגיעים', 'נותנים', 'מטפלים', 'מבצעים', 'עובדים', 'ממליצים', 'מכירים', 'יודעים', 'נחזור', 'נשמח'];

for (const d of TARGET) {
  for (const f of readdirSync(join('content', d))) {
    if (!f.endsWith('.md')) continue;
    const p = parse(readFileSync(join('content', d, f), 'utf8'));
    const w = words(p.body), sents = sentences(p.body);
    const plainText = plain(p.body);
    const fpHits = FP.reduce((n, m) => n + (plainText.split(m).length - 1), 0);
    const h2 = [...p.body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
    // פתיח: פסקת הפרוזה הראשונה
    const opening = (p.body.split(/\n{2,}/).find((blk) => !blk.startsWith('#') && !blk.startsWith('|') && plain(blk).split(' ').length > 8) || '').trim();
    const callouts = [...p.body.matchAll(/^>\s*\*\*(.+?)\*\*/gm)].map((m) => m[1].trim());
    pages.push({
      type: d, slug: p.slug, wordCount: w.length, sentences: sents,
      fpHits, fpPerc: w.length ? +(fpHits / w.length * 100).toFixed(1) : 0,
      h2, h2sig: h2.join(' | '),
      seoTitleLen: p.seoTitle.length, descLen: p.description.length,
      faq: p.faqCount, internalLinks: (p.body.match(/\]\(\/[^)]+\)/g) || []).length,
      opening: opening.slice(0, 220), callouts,
    });
  }
}

// בוילרפלייט: משפטים החוזרים בין עמודים
const sentMap = {};
pages.forEach((p) => new Set(p.sentences).forEach((s) => (sentMap[s] ||= new Set()).add(p.slug)));
pages.forEach((p) => {
  const uniq = p.sentences.filter((s) => sentMap[s].size === 1).length;
  p.originality = p.sentences.length ? Math.round(uniq / p.sentences.length * 100) : 100;
  p.sharedSentences = p.sentences.length - uniq;
});
const repeated = Object.entries(sentMap).map(([s, v]) => ({ s, n: v.size, pages: [...v] })).filter((x) => x.n >= 3).sort((a, b) => b.n - a.n);

// callouts כפולים
const calloutMap = {};
pages.forEach((p) => p.callouts.forEach((c) => (calloutMap[c] ||= new Set()).add(p.slug)));
const dupCallouts = Object.entries(calloutMap).map(([c, v]) => ({ c, n: v.size })).filter((x) => x.n >= 2).sort((a, b) => b.n - a.n);

// דמיון מבני: אילו רצפי H2 חוזרים
const h2sigMap = {};
pages.filter((p) => p.type === 'cities').forEach((p) => (h2sigMap[p.h2sig] ||= []).push(p.slug));
const sharedStructures = Object.entries(h2sigMap).filter(([k, v]) => v.length > 1).map(([k, v]) => ({ count: v.length, h2: k, pages: v })).sort((a, b) => b.count - a.count);
// שכיחות כל כותרת H2 בערים
const h2freq = {};
pages.filter((p) => p.type === 'cities').forEach((p) => new Set(p.h2).forEach((h) => h2freq[h] = (h2freq[h] || 0) + 1));
const commonH2 = Object.entries(h2freq).filter(([k, v]) => v >= 5).sort((a, b) => b[1] - a[1]);

// דמיון זוגי בין ערים (Jaccard על משפטים) - כל הטווח
function jac(a, b) { const A = new Set(a), B = new Set(b); let i = 0; A.forEach((x) => B.has(x) && i++); const u = A.size + B.size - i; return u ? i / u : 0; }
const cityPages = pages.filter((p) => p.type === 'cities' && p.sentences.length >= 3);
const pairs = [];
for (let i = 0; i < cityPages.length; i++) for (let j = i + 1; j < cityPages.length; j++) {
  const s = jac(cityPages[i].sentences, cityPages[j].sentences);
  if (s >= 0.2) pairs.push({ a: cityPages[i].slug, b: cityPages[j].slug, sim: Math.round(s * 100) });
}
pairs.sort((a, b) => b.sim - a.sim);

writeFileSync('_migration/content-review.json', JSON.stringify({ pages, repeated, dupCallouts, sharedStructures, commonH2, pairs }, null, 1), 'utf8');

const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
const cities = pages.filter((p) => p.type === 'cities');
console.log('=== SCOPE: cities=' + cities.length + ' regions=' + pages.filter(p=>p.type==='regions').length + ' ===');
console.log('avg words (cities):', avg(cities.map((p) => p.wordCount)));
console.log('cities <600w (below guide target):', cities.filter((p) => p.wordCount < 600).length + '/' + cities.length);
console.log('cities <300w (thin):', cities.filter((p) => p.wordCount < 300).length);
console.log('avg originality:', avg(cities.map((p) => p.originality)) + '%');
console.log('avg first-person hits/page:', avg(cities.map((p) => p.fpHits)));
console.log('pages with WEAK first-person (<3 hits):', cities.filter((p) => p.fpHits < 3).length);
console.log('cities with 0 in-body links:', cities.filter((p) => p.internalLinks === 0).length);
console.log('cities with <4 FAQ:', cities.filter((p) => p.faq < 4).length);
console.log('repeated boilerplate sentences (>=3 pages):', repeated.length);
console.log('duplicate callout boxes (>=2 pages):', dupCallouts.length);
console.log('shared H2 structures (>1 city identical):', sharedStructures.length);
console.log('city pairs sim>=40%:', pairs.filter((p) => p.sim >= 40).length, '| >=25%:', pairs.filter((p) => p.sim >= 25).length);

console.log('\n--- COMMON H2 (templated structure, count of cities) ---');
commonH2.slice(0, 12).forEach(([h, n]) => console.log(`  ${n}x  ${h}`));
console.log('\n--- WEAK FIRST-PERSON PAGES (<3 hits) ---');
cities.filter((p) => p.fpHits < 3).sort((a,b)=>a.fpHits-b.fpHits).forEach((p) => console.log(`  ${p.fpHits} hits  ${p.slug} (${p.wordCount}w)`));
console.log('\n--- LOWEST ORIGINALITY (cities) ---');
cities.sort((a,b)=>a.originality-b.originality).slice(0,8).forEach((p) => console.log(`  ${p.originality}%  ${p.slug} (${p.sharedSentences} shared sents)`));
console.log('\n--- TOP CITY PAIRS BY SIMILARITY ---');
pairs.slice(0, 10).forEach((p) => console.log(`  ${p.sim}%  ${p.a} <-> ${p.b}`));
console.log('\n--- DUPLICATE CALLOUT BOXES ---');
dupCallouts.slice(0, 8).forEach((x) => console.log(`  ${x.n}x  ${x.c.slice(0, 60)}`));
console.log('\n--- TOP BOILERPLATE SENTENCES (n pages) ---');
repeated.slice(0, 10).forEach((x) => console.log(`  ${x.n}x  ${x.s.slice(0, 65)}...`));
