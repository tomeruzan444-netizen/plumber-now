# CLAUDE.md — הקשר פרויקט לאינסטלטור עכשיו

## ⭐ כתיבת תוכן — חובה
**לפני כתיבה או עריכה של כל תוכן באתר (קבצי `content/**/*.md`), חובה לקרוא ולפעול לפי [`CONTENT-GUIDE.md`](./CONTENT-GUIDE.md).**
זהו מקור האמת לטון, מבנה, אורך, כללי SEO ואיסור כפילויות. אין לכתוב תוכן בלי לעמוד בצ'קליסט שבסוף המדריך.

## מה זה הפרויקט
אתר סטטי מהיר (**Astro 5**) שעבר מיגרציה מוורדפרס, עם שמירה מלאה על מבנה ה-URL, התוכן והמטא־דאטה (SEO).
דומיין: **plumbernow.co.il** · עסק: שירותי אינסטלציה ארציים · טלפון יחיד: **03-3769229**.

## מבנה
- `content/` — תוכן העמודים (Markdown + frontmatter). קולקציות: `cities` (43), `services` (13), `regions` (4), `static` (4).
- `src/components/` — Header, Footer, Sidebar, Faq, HubLinks, LeadForm, Logo, Icon.
- `src/layouts/` — BaseLayout (SEO head + Schema), ContentLayout (תבנית עמוד תוכן + סיידבר).
- `src/pages/` — `index.astro` (בית), `[...slug].astro` (router לכל עמודי התוכן), `404.astro`.
- `src/data/` — `site.ts` (פרטי קשר/ניווט/שירותים), `cities.ts` (מיפוי עיר↔אזור — מקור אמת).
- `src/styles/` — `global.css` (tokens), `prose.css` (עיצוב תוכן).
- `public/` — לוגו, favicon, תמונות, robots.txt, .htaccess.
- `_migration/` — כלי מיגרציה/ביקורת (reference; לא חלק מהאתר).

## פקודות
- `npm run dev` — שרת פיתוח (localhost:4321)
- `npm run build` — בנייה ל-`dist/` (לנקות `.astro` ו-`node_modules/.vite` אם יש שגיאת cache/lock)
- `npm run preview` — תצוגת תוצר הבנייה

## פריסה (Deploy)
- `git push origin main` → **GitHub Actions** בונה ומעלה אוטומטית להוסטינגר ב-FTP (`.github/workflows/deploy.yml`).
- ה-FTP של הוסטינגר עלול לחסום זמנית אחרי הרבה העלאות רצופות (ETIMEDOUT/Timeout) — להמתין ~30–60 דק' ולנסות שוב, לא להציף.
- אימות סטטוס ריצה דרך GitHub API: `actions/runs?per_page=1`.

## כללים חשובים
- **לא לשנות `slug` של עמוד קיים** — זה שובר SEO (כל ה-URLs נשמרו 1:1 מהאתר הישן).
- **מקפים:** רק `-` (אסור `–`/`—`) בכל מקום — גם בתוכן וגם ב-UI.
- כל פרטי הקשר מגיעים מ-`src/data/site.ts` (מקור אמת אחד).
- מיפוי ערים↔אזורים ב-`src/data/cities.ts`.
- בנייה חייבת לעבור (`npm run build`) לפני push.

## מצב נוכחי / משימות פתוחות
- ✅ אתר חי, מהיר, ממותג; sitemap הוגש ל-Search Console.
- ⏳ לחבר את טופס הליד (`LeadForm.astro`) ליעד אמיתי (כרגע מציג רק הודעת תודה).
- ⏳ להרחיב תוכן דליל (ראו ביקורת ב-`_migration/seo-report.json`) ולהוסיף אינפוגרפיקות.
