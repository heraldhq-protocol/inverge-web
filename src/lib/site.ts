import { env } from './env';

/**
 * Single source of truth for brand identity used across metadata and OpenGraph.
 * Change the tagline or description once here and every social card follows.
 */
export const SITE = {
  name: 'Inverge',
  tagline: 'Backing ideas. Built on accountability.',
  description:
    'Inverge helps early-stage builders across Africa validate ideas and raise in milestones, with funds released against verified milestones so you can back with confidence.',
  url: env.siteUrl,
  domain: env.siteUrl.replace(/^https?:\/\//, ''),
  locale: 'en_US',
  twitter: '@inverge',
  keywords: [
    'Inverge',
    'crowdfunding',
    'milestone escrow',
    'idea validation',
    'African startups',
    'back builders',
    'Nigeria',
    'fundraising',
  ],
} as const;
