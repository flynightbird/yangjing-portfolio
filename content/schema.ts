import { z } from 'zod';

import {
  buildSlugs,
  contentKinds,
  evidenceLevels,
  locales,
  workSlugs,
} from '@/content/types';

const nonEmptyString = z.string().trim().min(1);
function isSafePublicAssetPath(assetPath: string): boolean {
  if (!assetPath.startsWith('/') || assetPath.startsWith('//')) {
    return false;
  }

  let decodedPath = assetPath;
  for (let depth = 0; depth < 10; depth += 1) {
    let nextPath: string;
    try {
      nextPath = decodeURIComponent(decodedPath);
    } catch {
      return false;
    }

    if (nextPath === decodedPath) {
      break;
    }
    decodedPath = nextPath;

    if (depth === 9) {
      return false;
    }
  }

  return [assetPath, decodedPath].every((path) => {
    const segments = path.split('/');
    return (
      path.startsWith('/') &&
      !path.startsWith('//') &&
      !path.includes('//') &&
      !/[\\?#]/.test(path) &&
      !segments.some((segment) => segment === '.' || segment === '..')
    );
  });
}

export const chapterMetaSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
});

export const caseFactSchema = z.object({
  label: nonEmptyString,
  value: nonEmptyString,
});

const sharedContentMetaSchema = z.object({
  locale: z.enum(locales),
  translationKey: nonEmptyString,
  title: nonEmptyString,
  proposition: nonEmptyString,
  role: nonEmptyString,
  duration: nonEmptyString,
  status: nonEmptyString,
  disclosure: nonEmptyString.optional(),
  heroMedia: nonEmptyString.refine(isSafePublicAssetPath, {
    message: 'Must be a safe root-relative public asset path',
  }),
  evidenceLevel: z.enum(evidenceLevels),
  featuredOrder: z.number().int().positive(),
  chapters: z.array(chapterMetaSchema).optional(),
  caseLabel: nonEmptyString.optional(),
  facts: z.array(caseFactSchema).optional(),
});

export const contentMetaSchema = z.discriminatedUnion('type', [
  sharedContentMetaSchema.extend({
    type: z.enum([contentKinds[0]]),
    slug: z.enum(workSlugs),
  }),
  sharedContentMetaSchema.extend({
    type: z.enum([contentKinds[1]]),
    slug: z.enum(buildSlugs),
  }),
]);

export type ChapterMeta = z.infer<typeof chapterMetaSchema>;
export type CaseFact = z.infer<typeof caseFactSchema>;
export type ContentMeta = z.infer<typeof contentMetaSchema>;
