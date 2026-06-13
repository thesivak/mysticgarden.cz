import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { hasMarkdownPosts } from './lib/blog';

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    seo: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()).default([]),
      ogImage: z.string().optional(),
    }),
    hero: z.object({
      titleLine1: z.string(),
      titleLine2: z.string(),
      subtitle: z.string(),
      cta: z.string(),
      backgroundImage: z.string(),
    }),
    about: z.object({
      titleLine1: z.string(),
      titleLine2: z.string(),
      titleLine3: z.string().optional(),
      description: z.string(),
    }),
    process: z.object({
      heading: z.string(),
    }),
    services: z.object({
      heading: z.string(),
    }),
    inquiry: z.object({
      heading: z.string(),
      image: z.string(),
      imageAlt: z.string(),
    }),
    contact: z.object({
      phone: z.string(),
      phoneHref: z.string(),
      email: z.string().optional(),
      addresses: z.array(z.string()),
      billingAddress: z.string(),
      companyId: z.string(),
      taxId: z.string(),
      facebook: z.string(),
      instagram: z.string(),
    }),
  }),
});

const specialties = defineCollection({
  loader: glob({ base: './src/content/specialties', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    sortOrder: z.number(),
    image: z.string(),
    imageAlt: z.string(),
    imagePosition: z.string().default('center'),
  }),
});

const process = defineCollection({
  loader: glob({ base: './src/content/process', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    stepNumber: z.number(),
    sortOrder: z.number(),
    image: z.string(),
    imageAlt: z.string(),
  }),
});

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    sortOrder: z.number(),
    image: z.string(),
    imageAlt: z.string(),
    active: z.boolean().default(true),
  }),
});

const blog = defineCollection({
  loader: hasMarkdownPosts()
    ? glob({ base: './src/content/blog', pattern: '**/*.md' })
    : async () => [],
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    seo: z.object({
      title: z.string(),
      description: z.string(),
    }),
  }),
});

export const collections = { pages, specialties, process, services, blog };
