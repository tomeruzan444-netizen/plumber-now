# אינסטלטור עכשיו — plumbernow.co.il

אתר סטטי מהיר (Astro) שעבר מיגרציה מוורדפרס, עם שמירה מלאה על מבנה ה-URL, התוכן, המטא־דאטה (Rank Math) וה-SEO.

## טכנולוגיה
- **Astro 5** — פלט HTML סטטי, ביצועים מעולים (≈1KB JS), SEO מלא
- **פונט Assistant** (self-hosted), RTL מלא, מערכת עיצוב + אייקונים SVG
- **תוכן** ב-Markdown תחת `content/` (קולקציות: cities / services / regions / static)

## פיתוח מקומי
```bash
npm install      # התקנת תלויות
npm run dev      # שרת פיתוח -> http://localhost:4321
npm run build    # בנייה לתיקיית dist/
npm run preview  # תצוגת תוצר הבנייה
```

## מבנה
```
content/              # תוכן העמודים (Markdown + frontmatter)
  cities/             # 43 עמודי ערים
  services/           # 13 עמודי שירות
  regions/            # 4 עמודי אזור (hub)
  static/             # אודות / צרו קשר / נגישות / תנאי שימוש
src/
  components/         # Header, Footer, Sidebar, Faq, HubLinks, LeadForm, Icon...
  layouts/            # BaseLayout (SEO head), ContentLayout
  pages/              # index.astro (בית), [...slug].astro (router)
  data/               # site.ts, cities.ts (מקור אמת לערים↔אזורים)
  styles/             # global.css (tokens), prose.css (עיצוב תוכן)
public/               # תמונות, לוגו, favicon, robots.txt
_migration/           # כלי מיגרציה + מלאי תוכן (reference, לא נדרס)
```

## Deploy אוטומטי (GitHub Actions → Hostinger)
כל `push` לענף `main` בונה את האתר ומעלה אותו אוטומטית להוסטינגר ב-FTP.

נדרשים 4 **Secrets** ב-GitHub (Settings → Secrets and variables → Actions):

| Secret | תיאור | דוגמה |
|--------|-------|-------|
| `FTP_SERVER` | כתובת שרת ה-FTP מהוסטינגר | `ftp.plumbernow.co.il` |
| `FTP_USERNAME` | שם משתמש FTP | `u123456789` |
| `FTP_PASSWORD` | סיסמת FTP | `••••••••` |
| `FTP_REMOTE_DIR` | תיקיית היעד בשרת | `/public_html/` |

לאחר הגדרת ה-Secrets, כל עריכה שתידחף ל-main תעלה לאוויר תוך ~2 דקות.
