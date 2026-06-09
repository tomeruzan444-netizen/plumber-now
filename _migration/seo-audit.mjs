// ביקורת SEO + רמת תוכן + כפילויות על כל עמודי האתר
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = ['cities', 'services', 'regions', 'static'];
const pages = [];

function parse(txt) {
  const m = txt.split(/^---$/m);
  const fm = m[1] || '';
  const body = m.slice(2).join('---').trim();
  const get = (k) => { const r = new RegExp('^' + k + ':\\s*"?(.*?)"?\\s*$', 'm').exec(fm); return r ? r[1] : ''; };
  const faqCount = (fm.match(/^\s*-\s*q:/gm) || []).length;
  return { seoTitle: get('seoTitle'), description: get('description'), title: get('title'), slug: get('slug'), canonical: get('canonical'), faqCount, body };
}

// טקסט נקי ממרקדאון
function plain(body) {
  return body
    .replace(/^\|.*$/gm, ' ')          // טבלאות
    .replace(/^#{1,6}\s+/gm, '')       // כותרות
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // קישורים -> טקסט
    .replace(/[*_>`]/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function words(s) { return plain(s).split(/\s+/).filter((w) => /[֐-׿]/.test(w)); }
function sentences(body) {
  return plain(body).split(/(?<=[.?!])\s+|[\n]+/)
    .map((s) => s.replace(/[^֐-׿\s]/g, '').replace(/\s+/g, ' ').trim())
    .filter((s) => s.split(' ').length >= 6); // רק משפטי פרוזה
}

for (const d of dirs) {
  for (const f of readdirSync(join('content', d))) {
    if (!f.endsWith('.md')) continue;
    const txt = readFileSync(join('content', d, f), 'utf8');
    const p = parse(txt);
    const w = words(p.body);
    const sents = sentences(p.body);
    pages.push({
      type: d, file: f, slug: p.slug,
      seoTitle: p.seoTitle, seoTitleLen: p.seoTitle.length,
      description: p.description, descLen: p.description.length,
      wordCount: w.length,
      h2: (p.body.match(/^##\s/gm) || []).length,
      h3: (p.body.match(/^###\s/gm) || []).length,
      internalLinks: (p.body.match(/\]\(\/[^)]+\)/g) || []).length,
      images: (p.body.match(/!\[[^\]]*\]\(/g) || []).length,
      tables: (p.body.match(/^\|\s*---/gm) || []).length,
      faq: p.faqCount,
      hasCanonical: !!p.canonical,
      sentences: sents,
    });
  }
}

// --- כפילויות כותרת/תיאור ---
const byTitle = {}, byDesc = {};
pages.forEach((p) => {
  (byTitle[p.seoTitle] ||= []).push(p.slug);
  (byDesc[p.description] ||= []).push(p.slug);
});
const dupTitles = Object.entries(byTitle).filter(([k, v]) => v.length > 1 && k);
const dupDescs = Object.entries(byDesc).filter(([k, v]) => v.length > 1 && k);

// --- בוילרפלייט: משפטים שחוזרים על פני עמודים ---
const sentMap = {};
pages.forEach((p) => { new Set(p.sentences).forEach((s) => { (sentMap[s] ||= new Set()).add(p.slug); }); });
const repeated = Object.entries(sentMap).map(([s, set]) => ({ s, n: set.size })).filter((x) => x.n >= 3).sort((a, b) => b.n - a.n);

// --- ציון מקוריות לכל עמוד (% משפטים ייחודיים) ---
pages.forEach((p) => {
  const uniq = p.sentences.filter((s) => sentMap[s].size === 1).length;
  p.originality = p.sentences.length ? Math.round((uniq / p.sentences.length) * 100) : 100;
  p.sharedSentences = p.sentences.length - uniq;
});

// --- דמיון זוגי (Jaccard) בין עמודים מאותו סוג ---
function jaccard(a, b) {
  const A = new Set(a), B = new Set(b); let inter = 0;
  A.forEach((x) => { if (B.has(x)) inter++; });
  const uni = A.size + B.size - inter; return uni ? inter / uni : 0;
}
const nearDup = [];
for (const t of dirs) {
  const sub = pages.filter((p) => p.type === t && p.sentences.length >= 4);
  for (let i = 0; i < sub.length; i++) for (let j = i + 1; j < sub.length; j++) {
    const sim = jaccard(sub[i].sentences, sub[j].sentences);
    if (sim >= 0.35) nearDup.push({ a: sub[i].slug, b: sub[j].slug, sim: Math.round(sim * 100), type: t });
  }
}
nearDup.sort((a, b) => b.sim - a.sim);

const report = { generated: 'audit', pages, dupTitles, dupDescs, repeated, nearDup };
writeFileSync('_migration/seo-report.json', JSON.stringify(report, null, 1), 'utf8');

// --- סיכום למסך ---
const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
console.log('=== AGGREGATE ===');
console.log('pages:', pages.length);
console.log('avg words:', avg(pages.map((p) => p.wordCount)));
console.log('thin (<300w):', pages.filter((p) => p.wordCount < 300).length);
console.log('rich (>=800w):', pages.filter((p) => p.wordCount >= 800).length);
console.log('avg seoTitle len:', avg(pages.map((p) => p.seoTitleLen)));
console.log('titles >60:', pages.filter((p) => p.seoTitleLen > 60).length, '| <30:', pages.filter((p) => p.seoTitleLen < 30).length);
console.log('avg desc len:', avg(pages.map((p) => p.descLen)));
console.log('desc missing:', pages.filter((p) => !p.descLen).length, '| >160:', pages.filter((p) => p.descLen > 160).length, '| <70:', pages.filter((p) => p.descLen < 70 && p.descLen).length);
console.log('dup titles groups:', dupTitles.length, '| dup desc groups:', dupDescs.length);
console.log('avg internal links:', avg(pages.map((p) => p.internalLinks)), '| pages w/0 links:', pages.filter((p) => p.internalLinks === 0).length);
console.log('pages w/0 FAQ:', pages.filter((p) => !p.faq).length);
console.log('avg originality %:', avg(pages.map((p) => p.originality)));
console.log('repeated-sentence clusters (>=3 pages):', repeated.length);
console.log('near-dup pairs (>=35%):', nearDup.length);
console.log('\n=== LOW ORIGINALITY (<50%) ===');
pages.filter((p) => p.originality < 50).sort((a, b) => a.originality - b.originality).forEach((p) => console.log(`  ${p.originality}%  ${p.slug} (${p.wordCount}w, ${p.sharedSentences} shared)`));
console.log('\n=== TOP NEAR-DUP PAIRS ===');
nearDup.slice(0, 12).forEach((x) => console.log(`  ${x.sim}%  ${x.a}  <->  ${x.b}`));
console.log('\n=== TOP BOILERPLATE SENTENCES ===');
repeated.slice(0, 12).forEach((x) => console.log(`  ${x.n} pages: ${x.s.slice(0, 70)}...`));
console.log('\n=== THIN PAGES ===');
pages.filter((p) => p.wordCount < 300).sort((a, b) => a.wordCount - b.wordCount).forEach((p) => console.log(`  ${p.wordCount}w  ${p.slug} (${p.type})`));
console.log('\n=== DUP TITLES ===');
dupTitles.forEach(([k, v]) => console.log(`  "${k}" -> ${v.join(', ')}`));
console.log('\n=== DUP DESCRIPTIONS ===');
dupDescs.forEach(([k, v]) => console.log(`  "${k.slice(0,50)}..." -> ${v.length} pages`));
