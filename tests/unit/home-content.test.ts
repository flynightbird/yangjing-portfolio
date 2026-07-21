import { describe, expect, it } from 'vitest';

import {
  archiveEntrySchema,
  archiveProjects,
  coreProjectOrder,
  homepageProjects,
} from '@/content/home';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';

describe('homepage project contract', () => {
  it('keeps the approved six-project presentation order', () => {
    expect(homepageProjects.map((project) => project.id)).toEqual([
      'xuelang',
      'call-agent',
      'convo-ai',
      'meeting',
      'aidx',
      'stt-demo',
    ]);
  });

  it('records the approved company ownership and core-work order', () => {
    expect(homepageProjects.map(({ id, companyId }) => [id, companyId])).toEqual([
      ['xuelang', 'bytedance'],
      ['call-agent', 'agora'],
      ['convo-ai', 'agora'],
      ['meeting', 'agora'],
      ['aidx', 'aidx'],
      ['stt-demo', 'agora'],
    ]);
    expect(coreProjectOrder).toEqual([
      'call-agent',
      'convo-ai',
      'meeting',
      'stt-demo',
      'aidx',
      'xuelang',
    ]);
  });

  it('keeps ConvoAI and AIDX external-only and STT as the sole Build Lab entry', () => {
    const convoAi = homepageProjects.find((project) => project.id === 'convo-ai');
    const aidx = homepageProjects.find((project) => project.id === 'aidx');
    const buildEntries = homepageProjects.filter(
      (project) => project.kind === 'build-lab',
    );

    expect(convoAi).toMatchObject({
      destination: 'external-live-site',
      availability: 'awaiting-assets',
      href: 'https://conversational-ai.shengwang.cn/',
    });
    expect(aidx).toMatchObject({
      destination: 'external-live-site',
      availability: 'complete',
      href: 'https://aidxtech.com/',
    });
    expect(buildEntries).toHaveLength(1);
    expect(buildEntries[0]).toMatchObject({
      id: 'stt-demo',
      destination: 'internal-case',
      href: '/demos/stt-demo/index.html',
    });
  });

  it('publishes Xuelang and Meeting as complete internal cases', () => {
    expect(homepageProjects.find((project) => project.id === 'xuelang')).toMatchObject({
      destination: 'internal-case',
      availability: 'complete',
      href: 'work/xuelang/',
    });
    expect(homepageProjects.find((project) => project.id === 'meeting')).toMatchObject({
      destination: 'internal-case',
      availability: 'complete',
      href: 'work/meeting/',
    });
  });
});

describe('Visual Archive contract', () => {
  it('publishes the approved ordered galleries for Doudou Fox and MR CHONG', () => {
    const doudou = archiveProjects.find(
      (project) => project.key === 'bytedance-doudou-fox',
    );
    const mrChong = archiveProjects.find(
      (project) => project.key === 'tongcheng-mr-chong',
    );

    expect(doudou?.gallery?.map((image) => image.src)).toEqual([
      '/images/archive/details/doudou-fox/01-goal.webp',
      '/images/archive/details/doudou-fox/02-framework.webp',
      '/images/archive/details/doudou-fox/03-task-system.webp',
      '/images/archive/details/doudou-fox/04-reward-spectrum.webp',
      '/images/archive/details/doudou-fox/05-world-progression.webp',
      '/images/archive/details/doudou-fox/06-entry-and-stop.webp',
      '/images/archive/details/doudou-fox/07-end-to-end.webp',
    ]);
    expect(mrChong?.gallery?.map((image) => image.src)).toEqual([
      '/images/archive/details/mr-chong/01-character-direction.webp',
      '/images/archive/details/mr-chong/02-posture-exploration.webp',
      '/images/archive/details/mr-chong/03-travel-scene.webp',
      '/images/archive/details/mr-chong/04-final-render.webp',
    ]);

    for (const project of [doudou, mrChong]) {
      expect(project?.gallery?.every((image) => image.alt.en && image.alt.zh)).toBe(true);
      expect(project?.gallery?.every((image) => image.src.startsWith('/images/archive/'))).toBe(true);
    }
  });

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

    expect(archiveProjects).toHaveLength(4);
    expect(archiveProjects.every(({ destination }) => destination === 'lightbox-only')).toBe(
      true,
    );
    expect(archiveProjects.some((project) => 'href' in project)).toBe(false);
    expect(archiveProjects[0]).toMatchObject({
      title: { primary: { en: 'Tangping', zh: '躺平' } },
    });

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
      destination: 'lightbox-only',
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
        destination: 'internal-case',
      }),
    ).toThrow();
    expect(() =>
      archiveEntrySchema.parse({
        ...valid,
        destination: 'lightbox-only',
        href: 'work/tangping/',
      }),
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
        'convoAi',
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
