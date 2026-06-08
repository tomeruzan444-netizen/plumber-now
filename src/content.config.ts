import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const schema = z.object({
  title: z.string(),
  slug: z.string(),
  seoTitle: z.string(),
  description: z.string(),
  canonical: z.string().optional(),
  ogImage: z.string().optional(),
  wpId: z.number().optional(),
  modified: z.string().optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
});

const make = (dir: string) =>
  defineCollection({ loader: glob({ pattern: '**/*.md', base: `./content/${dir}` }), schema });

export const collections = {
  cities: make('cities'),
  services: make('services'),
  regions: make('regions'),
  static: make('static'),
};
