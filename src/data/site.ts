// ============================================================
//  נתוני אתר מרכזיים — מקור אמת אחד ל-Header/Footer/Sidebar
// ============================================================

export const site = {
  name: 'אינסטלטור עכשיו',
  tagline: 'מובילים בשירותי אינסטלציה',
  url: 'https://plumbernow.co.il',
  phone: '03-3769229',
  phoneRaw: '033769229',
  email: 'support@plumbernow.co.il',
  serviceArea: 'שירות בכל הארץ',
};

// ניווט ראשי — דרופדאונים חושפים עוד עמודים (חוויית גלישה + SEO)
export const nav = [
  { label: 'ראשי', href: '/' },
  {
    label: 'פתיחת סתימות',
    href: '/פתיחת-סתימות/',
    children: [
      { label: 'פתיחת סתימה בכיור', href: '/פתיחת-סתימה-בכיור/' },
      { label: 'פתיחת סתימה באמבטיה', href: '/פתיחת-סתימה-באמבטיה/' },
      { label: 'פתיחת סתימה במקלחת', href: '/פתיחת-סתימה-במקלחת/' },
      { label: 'פתיחת סתימה בשירותים', href: '/פתיחת-סתימה-בשירותים/' },
      { label: 'פתיחת סתימה בביוב', href: '/פתיחת-סתימה-בביוב/' },
    ],
  },
  {
    label: 'שירותי אינסטלציה',
    href: '/#services',
    children: [
      { label: 'איתור נזילות', href: '/איתור-נזילות/' },
      { label: 'החלפת ברזים', href: '/החלפת-ברזים/' },
      { label: 'הגברת לחץ מים', href: '/הגברת-לחץ-מים/' },
      { label: 'בדיקת לחץ מים', href: '/בדיקת-לחץ-מים/' },
      { label: 'הוספת נקודת מים', href: '/הוספת-נקודת-מים/' },
      { label: 'החלפת צנרת ביוב', href: '/החלפת-צנרת-ביוב/' },
      { label: 'החלפת צינור מים ראשי', href: '/החלפת-צינור-מים-ראשי/' },
      { label: 'תיקון נזילות', href: '/תיקון-נזילות/' },
      { label: 'תיקון ניאגרה', href: '/תיקון-ניאגרה/' },
      { label: 'תיקון דוד שמש', href: '/תיקון-דוד-שמש/' },
    ],
  },
  {
    label: 'מדריכים',
    href: '/כמה-עולה-אינסטלטור/',
    children: [
      { label: 'כמה עולה אינסטלטור?', href: '/כמה-עולה-אינסטלטור/' },
      { label: 'סימנים לנזילה נסתרת', href: '/סימנים-לנזילה-נסתרת/' },
    ],
  },
  {
    label: 'אזורי שירות',
    href: '/אזורי-שירות/',
    children: [
      { label: 'אינסטלטור במרכז', href: '/אינסטלטור-במרכז/' },
      { label: 'אינסטלטור בצפון', href: '/אינסטלטור-בצפון/' },
      { label: 'אינסטלטור בדרום', href: '/אינסטלטור-בדרום/' },
      { label: 'אינסטלטור בתל אביב', href: '/אינסטלטור-בתל-אביב/' },
      { label: 'אינסטלטור בחיפה', href: '/אינסטלטור-בחיפה/' },
      { label: 'אינסטלטור בירושלים', href: '/אינסטלטור-בירושלים/' },
      { label: 'אינסטלטור בבאר שבע', href: '/אינסטלטור-בבאר-שבע/' },
    ],
  },
  { label: 'אודות', href: '/אודות/' },
  { label: 'צרו קשר', href: '/צרו-קשר/' },
];

// שירותי אינסטלציה מרכזיים (לעמוד הבית ולסיידבר)
export const services = [
  { label: 'פתיחת סתימות', href: '/פתיחת-סתימות/', icon: 'droplet', desc: 'סתימות בכיור, אמבטיה, מקלחת, שירותים וביוב' },
  { label: 'איתור נזילות', href: '/איתור-נזילות/', icon: 'search', desc: 'איתור מדויק ללא הרס מיותר' },
  { label: 'החלפת ברזים', href: '/החלפת-ברזים/', icon: 'wrench', desc: 'התקנה והחלפה של ברזים בכל הבית' },
  { label: 'הגברת לחץ מים', href: '/הגברת-לחץ-מים/', icon: 'gauge', desc: 'פתרון ללחץ מים נמוך' },
  { label: 'בדיקת לחץ מים', href: '/בדיקת-לחץ-מים/', icon: 'gauge', desc: 'אבחון מקצועי של מערכת המים' },
  { label: 'הוספת נקודת מים', href: '/הוספת-נקודת-מים/', icon: 'droplet', desc: 'תוספת נקודות מים במטבח ובחדרי רחצה' },
  { label: 'החלפת צנרת ביוב', href: '/החלפת-צנרת-ביוב/', icon: 'tools', desc: 'שדרוג והחלפה של צנרת ביוב' },
  { label: 'החלפת צינור מים ראשי', href: '/החלפת-צינור-מים-ראשי/', icon: 'tools', desc: 'החלפת קו המים הראשי' },
  { label: 'תיקון נזילות', href: '/תיקון-נזילות/', icon: 'droplet', desc: 'תיקון נזילות בצנרת, בברזים ובחיבורים' },
  { label: 'תיקון ניאגרה', href: '/תיקון-ניאגרה/', icon: 'wrench', desc: 'תיקון מנגנוני הדחה גלויים וסמויים' },
  { label: 'תיקון דוד שמש', href: '/תיקון-דוד-שמש/', icon: 'gauge', desc: 'טיפול בתקלות דוד שמש וצנרת הדוד' },
];

// ערים לפי אזור — נגזר מהמיפוי הראשי המדויק (src/data/cities.ts)
import { citiesByRegion, regionMeta, cityHref } from './cities';

const toLinks = (r: 'center' | 'north' | 'south') =>
  citiesByRegion(r).map((c) => ({ label: c.label, href: cityHref(c) }));

export const regions = {
  center: { label: regionMeta.center.label, href: regionMeta.center.href, cities: toLinks('center') },
  north: { label: regionMeta.north.label, href: regionMeta.north.href, cities: toLinks('north') },
  south: { label: regionMeta.south.label, href: regionMeta.south.href, cities: toLinks('south') },
};

// יתרונות / אותות אמון
export const trustPoints = [
  { icon: 'clock', title: 'זמינות מהירה', desc: 'הגעה מהירה בכל שעות היום' },
  { icon: 'shield-check', title: 'שירות אמין', desc: 'אינסטלטורים מקצועיים ומנוסים' },
  { icon: 'banknote', title: 'מחירים שקופים', desc: 'מחירונים מפורטים מראש' },
  { icon: 'thumbs-up', title: 'שביעות רצון', desc: 'אלפי לקוחות מרוצים בכל הארץ' },
];
