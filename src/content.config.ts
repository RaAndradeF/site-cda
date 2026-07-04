import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const episodios = defineCollection({
  loader: glob({ base: 'src/content/episodios', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    audioUrl: z.string().url(),
    duration: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    thumbnail: z.string().optional(),
    guest: z.string().optional()
  })
});

export const collections = { episodios };
