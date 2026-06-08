// ============================================================
//  ממיר את 65 עמודי וורדפרס/Elementor -> Markdown נקי + frontmatter
//  לקולקציות תוכן של Astro. שומר slugs, מטא־דאטה (Rank Math),
//  קישוריות פנימית, ומחלץ FAQ למבנה נתונים (לאקורדיון + Schema).
// ============================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

// ---- תמונות תוכן: רישום + הורדה מקומית ----
const imgDownloads = new Map(); // url -> filename
function registerImage(src, altAttr) {
  let p = src;
  try { p = new URL(src).pathname; } catch {}
  const base = decodeURIComponent(p.split('/').pop());
  imgDownloads.set(src, base);
  const local = '/images/content/' + base;
  const alt = altAttr && altAttr.trim() ? altAttr.trim() : base.replace(/\.[a-z]+$/i, '').replace(/[-_]/g, ' ');
  return { local, alt };
}
function preprocessImages(html) {
  return html.replace(/<img\b[^>]*?>/gi, (m) => {
    const src = (/src="([^"]+)"/i.exec(m) || [])[1] || '';
    if (!src || src.startsWith('data:') || !/wp-content\/uploads/.test(src)) return '';
    if (/logo|favicon|לוגו|פאביקון/i.test(src)) return '';
    const altAttr = (/alt="([^"]*)"/i.exec(m) || [])[1] || '';
    const { local, alt } = registerImage(src, altAttr);
    return `\n<p>§IMG§${local}§${alt}§</p>\n`;
  });
}

const pages = JSON.parse(readFileSync('_migration/raw/pages-rest.json', 'utf8'));
const inv = JSON.parse(readFileSync('_migration/inventory.json', 'utf8'));
const invById = new Map(inv.map((x) => [x.id, x]));

// ---- עזרי ניקוי ----
const entities = {
  '&#8211;': '-', '&#8212;': '-', '&#8217;': '’', '&#8216;': '‘',
  '&#8220;': '"', '&#8221;': '"', '&#8230;': '…', '&#038;': '&', '&amp;': '&',
  '&quot;': '"', '&nbsp;': ' ', '&#39;': "'", '&lt;': '<', '&gt;': '>',
};
function decode(s = '') {
  return s.replace(/&#?\w+;/g, (m) => entities[m] ?? m).replace(/ /g, ' ');
}
function clean(s = '') { return decode(s).replace(/[–—]/g, '-').replace(/[ \t]+/g, ' ').trim(); }

// ---- המרת HTML פנימי של תא/פסקה ל-Markdown inline ----
function inline(html = '') {
  return clean(
    html
      .replace(/<a\b[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, txt) => {
        // המרת קישורים פנימיים ל-path יחסי עם slug עברי קריא
        let h = href;
        try {
          const u = new URL(href);
          if (u.hostname.includes('plumbernow.co.il')) {
            h = decodeURIComponent(u.pathname);
          }
        } catch {}
        return `[${inline(txt)}](${h})`;
      })
      .replace(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<em\b[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
  );
}

// ---- ממיר גוף עמוד ל-Markdown ----
function toMarkdown(rawHtml) {
  let h = rawHtml
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // שמירת קישורים שעוטפים כותרת: <a href><h2>X</h2></a> -> <h2><a href>X</a></h2>
  h = h.replace(/<a\b[^>]*href="([^"]*)"[^>]*>\s*<(h[1-6])[^>]*>([\s\S]*?)<\/\2>\s*<\/a>/gi,
    (m, href, tag, txt) => `<${tag}><a href="${href}">${txt}</a></${tag}>`);

  const out = [];
  // טוקניזציה לפי בלוקים סמנטיים לפי הסדר
  const blockRe = /<(h[1-6]|p|ul|ol|table)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = blockRe.exec(h)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[2];
    if (/^h[1-6]$/.test(tag)) {
      const lvl = Number(tag[1]);
      const txt = inline(inner);
      if (txt) out.push('#'.repeat(Math.min(lvl, 4)) + ' ' + txt);
    } else if (tag === 'p') {
      const txt = inline(inner);
      if (txt) out.push(txt);
    } else if (tag === 'ul' || tag === 'ol') {
      // רשימה כבלוק אחד — שורות מופרדות ב-\n יחיד (רשימה "צמודה")
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((x) => inline(x[1])).filter(Boolean);
      const prefix = tag === 'ol' ? (i) => `${i + 1}. ` : () => '- ';
      if (items.length) out.push(items.map((it, i) => prefix(i) + it).join('\n'));
    } else if (tag === 'table') {
      // טבלה כבלוק אחד — שורות מופרדות ב-\n יחיד (שורה ריקה שוברת טבלת GFM)
      const rows = [...inner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
        [...r[1].matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((c) => inline(c[2]) || ' ')
      ).filter((r) => r.length);
      if (rows.length) {
        const cols = Math.max(...rows.map((r) => r.length));
        const norm = (r) => { const x = r.slice(); while (x.length < cols) x.push(' '); return x; };
        const lines = [
          '| ' + norm(rows[0]).join(' | ') + ' |',
          '| ' + Array(cols).fill('---').join(' | ') + ' |',
          ...rows.slice(1).map((r) => '| ' + norm(r).join(' | ') + ' |'),
        ];
        out.push(lines.join('\n'));
      }
    }
  }
  return out.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ---- חילוץ FAQ מ-Elementor toggle: שאלה ב-toggle-title, תשובה ב-tab-content ----
function extractFaqRaw(raw) {
  const hRe = /<h[1-4][^>]*>\s*שאלות\s+(?:ותשובות|נפוצות)[\s\S]*?<\/h[1-4]>/i;
  const m = hRe.exec(raw);
  let bodyRaw = raw;
  let faqZone = raw;
  if (m) { bodyRaw = raw.slice(0, m.index); faqZone = raw.slice(m.index); }

  const titles = [...faqZone.matchAll(/<(?:a|div)[^>]*class="[^"]*elementor-toggle-title[^"]*"[^>]*>([\s\S]*?)<\/(?:a|div)>/gi)].map((x) => inline(x[1]));
  const contents = [...faqZone.matchAll(/<div[^>]*class="[^"]*elementor-tab-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)].map((x) => inline(x[1]));
  const faq = [];
  for (let i = 0; i < Math.min(titles.length, contents.length); i++) {
    if (titles[i] && contents[i]) faq.push({ q: titles[i], a: contents[i] });
  }
  // אם אין כותרת אבל יש toggle — נסיר את אזור ה-toggle מהגוף כדי שלא ידלוף
  if (faq.length && !m) {
    bodyRaw = raw.replace(/<div[^>]*class="[^"]*elementor-toggle[^"]*"[\s\S]*$/i, '');
  }
  return { bodyRaw, faq };
}

// ---- זיהוי תיבות "שימו לב"/"המלצה מקצועית" -> blockquote ----
function markCallouts(md) {
  return md.replace(/^####\s*(שימו לב[^\n]*)\n+([^\n#]+)/gm, '> **$1**\n>\n> $2');
}

// ---- סיווג סוג עמוד ----
const REGION_SLUGS = ['אינסטלטור-במרכז', 'אינסטלטור-בצפון', 'אינסטלטור-בדרום', 'אזורי-שירות'];
const SERVICE_SLUGS = [
  'פתיחת-סתימות', 'פתיחת-סתימה-בכיור', 'פתיחת-סתימה-בביוב', 'פתיחת-סתימה-באמבטיה',
  'פתיחת-סתימה-במקלחת', 'פתיחת-סתימה-בשירותים', 'איתור-נזילות', 'החלפת-ברזים',
  'הגברת-לחץ-מים', 'בדיקת-לחץ-מים', 'הוספת-נקודת-מים', 'החלפת-צנרת-ביוב', 'החלפת-צינור-מים-ראשי',
];
const STATIC_SLUGS = ['אודות', 'צרו-קשר', 'תנאי-שימוש', 'הצהרת-נגישות'];
const SKIP_IDS = [1691, 120]; // 1691=דף הבית (נפרד); 120=צרו קשר (נערך ידנית, לא לדרוס)

function classify(slugHe) {
  if (REGION_SLUGS.includes(slugHe)) return 'regions';
  if (SERVICE_SLUGS.includes(slugHe)) return 'services';
  if (STATIC_SLUGS.includes(slugHe)) return 'static';
  if (slugHe.startsWith('אינסטלטור-ב')) return 'cities';
  return 'static';
}

function yamlEscape(s = '') { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }

// ---- הרצה ----
const dirs = ['cities', 'services', 'regions', 'static'];
dirs.forEach((d) => mkdirSync(`content/${d}`, { recursive: true }));

const summary = [];
for (const pg of pages) {
  if (SKIP_IDS.includes(pg.id)) continue;
  if (pg.slug === 'hello-world') continue;
  const meta = invById.get(pg.id) || {};
  const slugHe = decodeURIComponent(pg.slug);
  const type = classify(slugHe);

  const rawWithImgs = preprocessImages(pg.content.rendered);
  const { bodyRaw, faq } = extractFaqRaw(rawWithImgs);
  let md = markCallouts(toMarkdown(bodyRaw));
  md = md.replace(/§IMG§([^§]+)§([^§]*)§/g, (m, p, a) => `![${a}](${p})`);

  const fm = [
    '---',
    `title: ${yamlEscape(clean(pg.title.rendered))}`,
    `slug: ${yamlEscape(slugHe)}`,
    `seoTitle: ${yamlEscape((meta.seo_title || clean(pg.title.rendered)).replace(/[–—]/g, '-'))}`,
    `description: ${yamlEscape((meta.description || '').replace(/[–—]/g, '-'))}`,
    `canonical: ${yamlEscape(meta.canonical || '')}`,
    `ogImage: ${yamlEscape(meta.og_image || '')}`,
    `wpId: ${pg.id}`,
    `modified: ${yamlEscape(pg.modified)}`,
  ];
  if (faq.length) {
    fm.push('faq:');
    faq.forEach((f) => { fm.push(`  - q: ${yamlEscape(f.q)}`); fm.push(`    a: ${yamlEscape(f.a)}`); });
  }
  fm.push('---', '');

  const file = `content/${type}/${slugHe}.md`;
  writeFileSync(file, fm.join('\n') + md + '\n', 'utf8');
  summary.push({ type, slug: slugHe, faq: faq.length, bodyLen: md.length });
}

// סיכום
const byType = {};
summary.forEach((s) => { byType[s.type] = (byType[s.type] || 0) + 1; });
console.log('CONVERTED:', summary.length, 'pages');
console.log('BY TYPE:', JSON.stringify(byType));
console.log('with FAQ:', summary.filter((s) => s.faq > 0).length);
console.log('avg body length:', Math.round(summary.reduce((a, s) => a + s.bodyLen, 0) / summary.length));

// ---- הורדת תמונות תוכן מקומית ----
mkdirSync('public/images/content', { recursive: true });
let ok = 0, fail = 0;
for (const [url, base] of imgDownloads) {
  const dest = `public/images/content/${base}`;
  if (existsSync(dest)) { ok++; continue; }
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    ok++;
  } catch (e) { fail++; console.log('  img FAIL', base, e.message); }
}
console.log(`images: ${ok} ok, ${fail} failed (of ${imgDownloads.size} unique)`);
