// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// אתר סטטי במלואו -> ביצועים מושלמים + SEO. נשמר מבנה ה-URL המדויק של האתר הקיים.
export default defineConfig({
  site: 'https://plumbernow.co.il',
  trailingSlash: 'always',        // וורדפרס משתמש ב-/slug/ — נשמר 1:1
  build: { format: 'directory' }, // יוצר /slug/index.html
  integrations: [
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  image: {
    // אופטימיזציית תמונות מובנית (WebP/AVIF) דרך sharp
    responsiveStyles: true,
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport', // ניווט מיידי בין עמודים
  },
});
