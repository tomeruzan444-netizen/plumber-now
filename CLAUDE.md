# CLAUDE.md — הקשר פרויקט לאינסטלטור עכשיו

## ⭐ כתיבת תוכן — חובה
**לפני כתיבה או עריכה של כל תוכן באתר (קבצי `content/**/*.md`), חובה לקרוא ולפעול לפי [`CONTENT-GUIDE.md`](./CONTENT-GUIDE.md).**
זהו מקור האמת לטון, מבנה, אורך, כללי SEO ואיסור כפילויות. אין לכתוב תוכן בלי לעמוד בצ'קליסט שבסוף המדריך.

## ⭐ יומן משימות — חובה
**בסיום כל משימה/בקשה (גם אם לא הניבה שינוי קוד - ביקורת, בדיקת קניבליזציה, אבחון תקלה וכו'), מוסיפים רשומה חדשה בסוף [`TASK-LOG.md`](./TASK-LOG.md).** זה יומן נרטיבי-כרונולוגי של כל הבקשות בפרויקט, לשימור הקשר בין שיחות - בנוסף ל-`git log` שמתעד רק שינויי קוד בפועל. לא מוחקים רשומות קיימות.

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
- `git push origin main` → **GitHub Actions** בונה (`npm run build`) ומעלה אוטומטית להוסטינגר ב-**SSH/rsync** (`.github/workflows/deploy.yml`, action `easingthemes/ssh-deploy`). זו **הדרך היחידה** לעדכן את האתר.
- אימות סטטוס ריצה דרך GitHub API: `actions/runs?per_page=1`.
- **⚠️ סכנה חוזרת: אינטגרציית ה-Git הנייטיבית של הוסטינגר (hPanel → Advanced → Git) חייבת להישאר מנותקת (disconnected), לא רק עם auto-deploy כבוי.** אם היא מתחברת מחדש, כל push ל-main יגרום לה לבצע checkout גולמי של הריפו (בלי build!) ישירות ל-`public_html`, שדורס את האתר הבנוי ומפיל אותו (403 בדף הבית, 404 בכל השאר - תקלה שחזרה פעמיים: 2026-08-29 ו-2026-10-02, ראו `TASK-LOG.md`). **אבחון מהיר:** אם האתר קורס, לבדוק אם `https://plumbernow.co.il/package.json` מחזיר 200 - אם כן, זה בדיוק הסימן הזה, והפתרון הוא לנתק מחדש ב-hPanel (לא רק לכבות auto-deploy).

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
