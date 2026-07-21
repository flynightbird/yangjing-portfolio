export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const workSlugs = ['xuelang', 'call-agent', 'convo-ai', 'meeting', 'tangping'] as const;
export type WorkSlug = (typeof workSlugs)[number];

export const buildSlugs = ['stt-demo'] as const;
export type BuildSlug = (typeof buildSlugs)[number];

export const contentKinds = ['work', 'build'] as const;
export type ContentKind = (typeof contentKinds)[number];
export type ContentSlug = WorkSlug | BuildSlug;

export const evidenceLevels = [
  'draft',
  'delivered',
  'observed',
  'retrospective',
  'prototype',
] as const;
export type EvidenceLevel = (typeof evidenceLevels)[number];

export type SlugForKind<Kind extends ContentKind> = Kind extends 'work'
  ? WorkSlug
  : BuildSlug;
