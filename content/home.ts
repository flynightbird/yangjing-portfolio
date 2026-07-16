import { z } from 'zod';

export type ProjectDestination =
  | 'internal-case'
  | 'external-live-site'
  | 'lightbox-only'
  | 'interactive-demo';
export type ProjectAvailability =
  | 'complete'
  | 'draft'
  | 'awaiting-assets';
export type HomepageProjectKind =
  | 'deep-case'
  | 'live-launch'
  | 'build-lab';

export type HomepageProjectId =
  | 'call-agent'
  | 'convo-ai'
  | 'aidx'
  | 'meeting'
  | 'xuelang'
  | 'stt-demo';

export interface HomepageProject {
  readonly id: HomepageProjectId;
  readonly kind: HomepageProjectKind;
  readonly destination: ProjectDestination;
  readonly availability: ProjectAvailability;
  readonly href: string;
}

export const homepageProjects = [
  {
    id: 'call-agent',
    kind: 'deep-case',
    destination: 'internal-case',
    availability: 'complete',
    href: 'work/call-agent/',
  },
  {
    id: 'convo-ai',
    kind: 'live-launch',
    destination: 'external-live-site',
    availability: 'awaiting-assets',
    href: 'https://conversational-ai.shengwang.cn/',
  },
  {
    id: 'aidx',
    kind: 'live-launch',
    destination: 'external-live-site',
    availability: 'complete',
    href: 'https://aidxtech.com/',
  },
  {
    id: 'meeting',
    kind: 'deep-case',
    destination: 'internal-case',
    availability: 'draft',
    href: 'work/meeting/',
  },
  {
    id: 'xuelang',
    kind: 'deep-case',
    destination: 'internal-case',
    availability: 'complete',
    href: 'work/xuelang/',
  },
  {
    id: 'stt-demo',
    kind: 'build-lab',
    destination: 'interactive-demo',
    availability: 'complete',
    href: '/demos/stt-demo/index.html',
  },
] as const satisfies readonly HomepageProject[];

const nonEmptyString = z.string().trim().min(1);
const localizedStringSchema = z.object({
  en: nonEmptyString,
  zh: nonEmptyString,
});

function isSafePublicImagePath(value: string): boolean {
  if (!value.startsWith('/') || value.startsWith('//')) return false;

  let decoded = value;
  for (let depth = 0; depth < 10; depth += 1) {
    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      return false;
    }
    if (next === decoded) break;
    decoded = next;
    if (depth === 9) return false;
  }

  return [value, decoded].every((candidate) => {
    const segments = candidate.split('/');
    return (
      candidate.startsWith('/images/archive/') &&
      !candidate.includes('//') &&
      !/[\\?#]/.test(candidate) &&
      !segments.some((segment) => segment === '.' || segment === '..')
    );
  });
}

const archiveImageSchema = z.object({
  src: nonEmptyString.refine(isSafePublicImagePath, {
    message: 'Archive media must use a safe /images/archive/ public path',
  }),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: localizedStringSchema,
});

export const realArchiveEntrySchema = z.object({
  key: nonEmptyString,
  kind: z.literal('real-entry'),
  name: localizedStringSchema,
  category: localizedStringSchema,
  role: localizedStringSchema,
  year: z.number().int().min(1900).max(2100).optional(),
  image: archiveImageSchema,
  externalUrl: z.string().url().startsWith('https://').optional(),
  layoutIndex: z.number().int().min(0).max(7),
});

export const draftArchiveSlotSchema = z.object({
  key: nonEmptyString,
  kind: z.literal('draft-slot'),
  layoutIndex: z.number().int().min(0).max(7),
});

export const archiveEntrySchema = z.discriminatedUnion('kind', [
  realArchiveEntrySchema,
  draftArchiveSlotSchema,
]);

export type ArchiveEntry = z.infer<typeof archiveEntrySchema>;
export type RealArchiveEntry = z.infer<typeof realArchiveEntrySchema>;
export type DraftArchiveSlot = z.infer<typeof draftArchiveSlotSchema>;

export const archiveLayoutSpans = [7, 5, 4, 8, 8, 4, 5, 7] as const;

export const developmentArchiveSlots: readonly DraftArchiveSlot[] =
  Array.from({ length: 8 }, (_, layoutIndex) => ({
    key: `archive-slot-${layoutIndex + 1}`,
    kind: 'draft-slot' as const,
    layoutIndex,
  }));
