import { describe, expect, it } from 'vitest';

import {
  archiveEntrySchema,
  archiveProjects,
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
  it('publishes the four approved archive projects in order', () => {
    expect(archiveProjects.map((project) => project.key)).toEqual([
      'alibaba-meipingmeiwu',
      'bytedance-open-language',
      'bytedance-doudou-fox',
      'tongcheng-mr-chong',
    ]);
    expect(archiveProjects.map((project) => project.coverVariant)).toEqual([
      'alibaba',
      'open-language',
      'doudou-fox',
      'mr-chong',
    ]);

    for (const project of archiveProjects) {
      expect(project.kind).toBe('real-entry');
      expect(project.description.en).toBeTruthy();
      expect(project.description.zh).toBeTruthy();
      expect(project.skills.length).toBeGreaterThan(0);
      expect(project.image.src).toMatch(/^\/images\/archive\//);
    }
  });

  it('requires complete project metadata and a known cover variant for real entries', () => {
    const valid = {
      key: 'real-project',
      kind: 'real-entry',
      company: { en: 'Company', zh: '公司' },
      period: {
        start: {
          dateTime: '2021-09',
          label: { en: '2021.09', zh: '2021.09' },
        },
        end: {
          dateTime: '2021-10',
          label: { en: '10', zh: '10' },
        },
      },
      title: {
        primary: { en: 'Project', zh: '项目' },
        secondary: { en: 'Experience', zh: '体验' },
        eyebrow: { en: 'PRODUCT', zh: 'PRODUCT' },
        supporting: { en: 'App and website', zh: 'APP 与官网' },
      },
      description: { en: 'Project description.', zh: '项目描述。' },
      skills: ['UX', 'UI'],
      coverVariant: 'doudou-fox',
      image: {
        src: '/images/archive/real-project.jpg',
        width: 1600,
        height: 900,
        alt: {
          en: 'Project cover',
          zh: '项目封面',
        },
      },
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
    expect(() =>
      archiveEntrySchema.parse({ ...valid, description: { en: '', zh: '' } }),
    ).toThrow();
    expect(() => archiveEntrySchema.parse({ ...valid, skills: [] })).toThrow();
    expect(() =>
      archiveEntrySchema.parse({ ...valid, coverVariant: 'unknown' }),
    ).toThrow();
    expect(() =>
      archiveEntrySchema.parse({
        ...valid,
        period: {
          ...valid.period,
          start: { ...valid.period.start, dateTime: 'September 2021' },
        },
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
