import { describe, expect, it } from 'vitest';

import {
  archiveEntrySchema,
  archiveLayoutSpans,
  developmentArchiveSlots,
  homepageProjects,
} from '@/content/home';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';

describe('homepage project contract', () => {
  it('keeps the approved five-project presentation order', () => {
    expect(homepageProjects.map((project) => project.id)).toEqual([
      'xuelang',
      'call-agent',
      'meeting',
      'aidx',
      'stt-demo',
    ]);
  });

  it('keeps AIDX external-only and the STT Demo as the sole Build Lab entry', () => {
    const aidx = homepageProjects.find((project) => project.id === 'aidx');
    const buildEntries = homepageProjects.filter(
      (project) => project.kind === 'build-lab',
    );

    expect(aidx).toMatchObject({
      destination: 'external-live-site',
      availability: 'complete',
      href: 'https://aidxtech.com/',
    });
    expect(buildEntries).toHaveLength(1);
    expect(buildEntries[0]).toMatchObject({
      id: 'stt-demo',
      destination: 'internal-case',
    });
  });

  it('publishes Xuelang while keeping Meeting explicitly draft', () => {
    expect(homepageProjects.find((project) => project.id === 'xuelang')).toMatchObject({
      destination: 'internal-case',
      availability: 'complete',
      href: 'work/xuelang/',
    });
    expect(homepageProjects.find((project) => project.id === 'meeting')).toMatchObject({
      destination: 'internal-case',
      availability: 'draft',
    });
  });
});

describe('Visual Archive contract', () => {
  it('reserves eight neutral slots with a gapless twelve-column rhythm', () => {
    expect(developmentArchiveSlots).toHaveLength(8);
    expect(archiveLayoutSpans).toEqual([7, 5, 4, 8, 8, 4, 5, 7]);

    for (const [index, slot] of developmentArchiveSlots.entries()) {
      expect(slot).toEqual({
        key: `archive-slot-${index + 1}`,
        kind: 'draft-slot',
        layoutIndex: index,
      });
      expect(slot).not.toHaveProperty('name');
      expect(slot).not.toHaveProperty('role');
      expect(slot).not.toHaveProperty('url');
      expect(slot).not.toHaveProperty('image');
    }
  });

  it('requires intrinsic media and meaningful text for real entries', () => {
    const valid = {
      key: 'real-project',
      kind: 'real-entry',
      name: { en: 'Project name', zh: '项目名称' },
      category: { en: 'Product design', zh: '产品设计' },
      role: { en: 'Product Designer', zh: '产品设计师' },
      image: {
        src: '/images/archive/real-project.avif',
        width: 1600,
        height: 1200,
        alt: {
          en: 'A real product interface showing the approved project state',
          zh: '展示已确认项目状态的真实产品界面',
        },
      },
      layoutIndex: 0,
    } as const;

    expect(archiveEntrySchema.parse(valid)).toEqual(valid);
    expect(() =>
      archiveEntrySchema.parse({
        ...valid,
        image: { ...valid.image, width: 0 },
      }),
    ).toThrow();
    expect(() =>
      archiveEntrySchema.parse({
        ...valid,
        image: { ...valid.image, alt: { en: ' ', zh: ' ' } },
      }),
    ).toThrow();
    expect(() =>
      archiveEntrySchema.parse({
        ...valid,
        image: { ...valid.image, src: 'https://example.com/fake.png' },
      }),
    ).toThrow();
  });
});

describe('homepage localization', () => {
  it('defines equivalent dual-identity, project, archive, and about copy', () => {
    for (const dictionary of [enDictionary, zhDictionary]) {
      expect(dictionary.home.hero).toMatchObject({
        name: 'Yang Jing',
        designerRole: expect.any(String),
        builderRole: expect.any(String),
        designerSummary: expect.any(String),
        builderSummary: expect.any(String),
        portraitDraft: expect.any(String),
      });
      expect(Object.keys(dictionary.home.projects)).toEqual([
        'xuelang',
        'callAgent',
        'meeting',
        'aidx',
        'sttDemo',
      ]);
      expect(dictionary.home.archive).toMatchObject({
        title: expect.any(String),
        description: expect.any(String),
        draftSlot: expect.any(String),
      });
      expect(dictionary.home.about).toMatchObject({
        title: expect.any(String),
        career: expect.any(String),
        opportunity: expect.any(String),
      });
      expect(dictionary.draftCase).toMatchObject({
        draft: expect.any(String),
        mediaUnavailable: expect.any(String),
        evidenceBoundary: expect.any(String),
      });
    }
  });
});
