// ============================================================
//  רשימת ערים ראשית — מקור אמת אחד למיפוי עיר↔אזור
//  region: 'center' | 'north' | 'south'
//  slug: ה-slug המדויק של העמוד (כפי שנשמר מהאתר הקיים)
// ============================================================
export type Region = 'center' | 'north' | 'south';

export interface City { slug: string; label: string; region: Region; }

export const cities: City[] = [
  // --- מרכז ---
  { slug: 'אינסטלטור-בתל-אביב', label: 'תל אביב', region: 'center' },
  { slug: 'אינסטלטור-ברמת-גן', label: 'רמת גן', region: 'center' },
  { slug: 'אינסטלטור-בגבעתיים', label: 'גבעתיים', region: 'center' },
  { slug: 'אינסטלטור-בחולון', label: 'חולון', region: 'center' },
  { slug: 'אינסטלטור-בבת-ים-מידע-ומחירים', label: 'בת ים', region: 'center' },
  { slug: 'אינסטלטור-בראשון-לציון', label: 'ראשון לציון', region: 'center' },
  { slug: 'אינסטלטור-ברחובות', label: 'רחובות', region: 'center' },
  { slug: 'אינסטלטור-בנס-ציונה', label: 'נס ציונה', region: 'center' },
  { slug: 'אינסטלטור-ברעננה', label: 'רעננה', region: 'center' },
  { slug: 'אינסטלטור-בכפר-סבא', label: 'כפר סבא', region: 'center' },
  { slug: 'אינסטלטור-בהוד-השרון', label: 'הוד השרון', region: 'center' },
  { slug: 'אינסטלטור-בהרצליה', label: 'הרצליה', region: 'center' },
  { slug: 'אינסטלטור-בנתניה', label: 'נתניה', region: 'center' },
  { slug: 'אינסטלטור-בכפר-יונה', label: 'כפר יונה', region: 'center' },
  { slug: 'אינסטלטור-בתל-מונד', label: 'תל מונד', region: 'center' },
  { slug: 'אינסטלטור-באבן-יהודה', label: 'אבן יהודה', region: 'center' },
  { slug: 'אינסטלטור-בסביון', label: 'סביון', region: 'center' },
  { slug: 'אינסטלטור-בשוהם', label: 'שוהם', region: 'center' },
  { slug: 'אינסטלטור-ביהוד', label: 'יהוד', region: 'center' },
  { slug: 'אינסטלטור-בבאר-יעקב', label: 'באר יעקב', region: 'center' },
  { slug: 'אינסטלטור-בבית-דגן', label: 'בית דגן', region: 'center' },
  { slug: 'אינסטלטור-באזור', label: 'אזור', region: 'center' },
  { slug: 'אינסטלטור-בלוד', label: 'לוד', region: 'center' },
  { slug: 'אינסטלטור-ברמלה', label: 'רמלה', region: 'center' },
  { slug: 'אינסטלטור-במודיעין', label: 'מודיעין', region: 'center' },
  { slug: 'אינסטלטור-ביבנה', label: 'יבנה', region: 'center' },
  { slug: 'אינסטלטור-במזכרת-בתיה', label: 'מזכרת בתיה', region: 'center' },
  { slug: 'אינסטלטור-באריאל', label: 'אריאל', region: 'center' },
  { slug: 'אינסטלטור-בירושלים', label: 'ירושלים', region: 'center' },

  // --- צפון ---
  { slug: 'אינסטלטור-בחיפה', label: 'חיפה', region: 'north' },
  { slug: 'אינסטלטור-בחדרה', label: 'חדרה', region: 'north' },
  { slug: 'אינסטלטור-בקריות', label: 'הקריות', region: 'north' },
  { slug: 'אינסטלטור-בקרית-חיים', label: 'קרית חיים', region: 'north' },
  { slug: 'אינסטלטור-בטבריה', label: 'טבריה', region: 'north' },
  { slug: 'אינסטלטור-ברמת-ישי', label: 'רמת ישי', region: 'north' },

  // --- דרום ---
  { slug: 'אינסטלטור-בבאר-שבע', label: 'באר שבע', region: 'south' },
  { slug: 'אינסטלטור-באשדוד', label: 'אשדוד', region: 'south' },
  { slug: 'אינסטלטור-באשקלון', label: 'אשקלון', region: 'south' },
  { slug: 'אינסטלטור-ברמת-ישי-2', label: 'נתיבות', region: 'south' }, // slug מקורי משוכפל
  { slug: 'אינסטלטור-בגדרה', label: 'גדרה', region: 'south' },
  { slug: 'אינסטלטור-בגן-יבנה', label: 'גן יבנה', region: 'south' },
  { slug: 'אינסטלטור-בבני-עייש', label: 'בני עייש', region: 'south' },
  { slug: 'אינסטלטור-בכפר-אביב', label: 'כפר אביב', region: 'south' },
];

export const regionMeta: Record<Region, { label: string; href: string }> = {
  center: { label: 'מרכז', href: '/אינסטלטור-במרכז/' },
  north: { label: 'צפון', href: '/אינסטלטור-בצפון/' },
  south: { label: 'דרום', href: '/אינסטלטור-בדרום/' },
};

export const citiesByRegion = (r: Region) => cities.filter((c) => c.region === r);
export const findCity = (slug: string) => cities.find((c) => c.slug === slug);
export const cityHref = (c: City) => `/${c.slug}/`;
