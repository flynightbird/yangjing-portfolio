import { z } from 'zod';

export type ProjectDestination =
  | 'internal-case'
  | 'external-live-site'
  | 'lightbox-only';
export type ProjectAvailability =
  | 'complete'
  | 'draft'
  | 'awaiting-assets';
export type HomepageProjectKind =
  | 'deep-case'
  | 'live-launch'
  | 'build-lab';

export type HomepageProjectId =
  | 'xuelang'
  | 'call-agent'
  | 'convo-ai'
  | 'meeting'
  | 'aidx'
  | 'stt-demo';

export type HomepageCompanyId = 'agora' | 'bytedance' | 'aidx';

export const coreProjectOrder = [
  'call-agent',
  'convo-ai',
  'meeting',
  'stt-demo',
  'aidx',
  'xuelang',
] as const satisfies readonly HomepageProjectId[];

export interface HomepageProject {
  readonly id: HomepageProjectId;
  readonly companyId: HomepageCompanyId;
  readonly kind: HomepageProjectKind;
  readonly destination: ProjectDestination;
  readonly availability: ProjectAvailability;
  readonly href: string;
}

export const homepageProjects = [
  {
    id: 'xuelang',
    companyId: 'bytedance',
    kind: 'deep-case',
    destination: 'internal-case',
    availability: 'complete',
    href: 'work/xuelang/',
  },
  {
    id: 'call-agent',
    companyId: 'agora',
    kind: 'deep-case',
    destination: 'internal-case',
    availability: 'complete',
    href: 'work/call-agent/',
  },
  {
    id: 'convo-ai',
    companyId: 'agora',
    kind: 'live-launch',
    destination: 'external-live-site',
    availability: 'awaiting-assets',
    href: 'https://conversational-ai.shengwang.cn/',
  },
  {
    id: 'meeting',
    companyId: 'agora',
    kind: 'deep-case',
    destination: 'internal-case',
    availability: 'complete',
    href: 'work/meeting/',
  },
  {
    id: 'aidx',
    companyId: 'aidx',
    kind: 'live-launch',
    destination: 'external-live-site',
    availability: 'complete',
    href: 'https://aidxtech.com/',
  },
  {
    id: 'stt-demo',
    companyId: 'agora',
    kind: 'build-lab',
    destination: 'internal-case',
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

const archivePeriodValueSchema = z
  .string()
  .regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/);

const archivePeriodPartSchema = z.object({
  dateTime: archivePeriodValueSchema,
  label: localizedStringSchema,
});

const archivePeriodSchema = z.object({
  start: archivePeriodPartSchema,
  end: archivePeriodPartSchema.optional(),
});

const archiveTitleSchema = z.object({
  primary: localizedStringSchema,
  secondary: localizedStringSchema.optional(),
  eyebrow: localizedStringSchema.optional(),
  supporting: localizedStringSchema.optional(),
});

const archiveCoverVariantSchema = z.enum([
  'alibaba',
  'open-language',
  'doudou-fox',
  'mr-chong',
]);

const realArchiveEntryBaseSchema = z.object({
  key: nonEmptyString,
  kind: z.literal('real-entry'),
  company: localizedStringSchema,
  period: archivePeriodSchema,
  title: archiveTitleSchema,
  description: localizedStringSchema,
  skills: z.array(nonEmptyString).min(1),
  coverVariant: archiveCoverVariantSchema,
  image: archiveImageSchema,
  gallery: z.array(archiveImageSchema).min(2).optional(),
  externalUrl: z.string().url().startsWith('https://').optional(),
});

export const realArchiveEntrySchema = realArchiveEntryBaseSchema.extend({
  destination: z.literal('lightbox-only'),
  href: z.never().optional(),
});

export const draftArchiveSlotSchema = z.object({
  key: nonEmptyString,
  kind: z.literal('draft-slot'),
  layoutIndex: z.number().int().min(0).max(7),
});

export const archiveEntrySchema = z.union([
  realArchiveEntrySchema,
  draftArchiveSlotSchema,
]);

export type ArchiveEntry = z.infer<typeof archiveEntrySchema>;
export type RealArchiveEntry = z.infer<typeof realArchiveEntrySchema>;
export type DraftArchiveSlot = z.infer<typeof draftArchiveSlotSchema>;

export const archiveProjects = [
  {
    key: 'alibaba-meipingmeiwu',
    kind: 'real-entry',
    destination: 'lightbox-only',
    company: { en: 'Alibaba', zh: '阿里巴巴' },
    period: {
      start: { dateTime: '2019', label: { en: '2019', zh: '2019' } },
      end: {
        dateTime: '2020-12',
        label: { en: '2020.12', zh: '2020.12' },
      },
    },
    title: {
      primary: { en: 'Tangping', zh: '躺平' },
      secondary: { en: 'Designer', zh: '设计家' },
      supporting: {
        en: 'App & Main Website',
        zh: 'APP & 官网主站',
      },
    },
    description: {
      en: "A home-design tool and platform from Alibaba. We unified the app and main website experience while strengthening the product's brand expression.",
      zh: '面向家居装修设计师的工具与平台。升级 App 与官网主站体验，并强化产品的品牌表达。',
    },
    skills: ['UX', 'UI'],
    coverVariant: 'alibaba',
    image: {
      src: '/images/archive/alibaba-meipingmeiwu.jpg',
      width: 2880,
      height: 1620,
      alt: {
        en: 'Tangping Designer app and website interface system',
        zh: '躺平设计家 APP 与官网界面系统',
      },
    },
  },
  {
    key: 'bytedance-open-language',
    kind: 'real-entry',
    destination: 'lightbox-only',
    company: { en: 'ByteDance', zh: '字节跳动' },
    period: {
      start: { dateTime: '2021', label: { en: '2021', zh: '2021' } },
    },
    title: {
      primary: { en: 'Design Principles', zh: '开言设计原则' },
      secondary: { en: 'New Exploration', zh: '新探索' },
      eyebrow: { en: 'OPEN LANGUAGE', zh: 'OPEN LANGUAGE' },
    },
    description: {
      en: 'A language-learning app from ByteDance. We explored a new set of design principles to improve visual consistency and experience quality.',
      zh: '字节跳动旗下的语言学习 App。探索新的设计原则，提升视觉一致性与体验品质。',
    },
    skills: ['UX', 'UI'],
    coverVariant: 'open-language',
    image: {
      src: '/images/archive/bytedance-open-language.jpg',
      width: 2880,
      height: 1620,
      alt: {
        en: 'Abstract Open Language design-principles cover artwork',
        zh: '开言设计原则抽象封面视觉',
      },
    },
  },
  {
    key: 'bytedance-doudou-fox',
    kind: 'real-entry',
    destination: 'lightbox-only',
    company: { en: 'ByteDance', zh: '字节跳动' },
    period: {
      start: {
        dateTime: '2021-09',
        label: { en: '2021.09', zh: '2021.09' },
      },
      end: { dateTime: '2021-10', label: { en: '10', zh: '10' } },
    },
    title: {
      primary: { en: 'Doudou Fox', zh: '豆豆狐' },
      secondary: { en: 'English Adventure', zh: '英语大闯关' },
    },
    description: {
      en: "A children's language-learning app from ByteDance. We designed an English adventure experience that made learning tasks more intuitive and playful.",
      zh: '字节跳动旗下的儿童语言学习 App。设计英语闯关体验，让学习任务更直观，也更具游戏感。',
    },
    skills: ['UX', 'UI'],
    coverVariant: 'doudou-fox',
    image: {
      src: '/images/archive/bytedance-doudou-fox.jpg',
      width: 2880,
      height: 1620,
      alt: {
        en: 'Doudou Fox English adventure shown on a phone',
        zh: '手机上的豆豆狐英语大闯关体验',
      },
    },
    gallery: [
      {
        src: '/images/archive/details/doudou-fox/01-goal.webp',
        width: 2880,
        height: 1620,
        alt: {
          en: 'Doudou Fox learning goal and motivation diagram',
          zh: '豆豆狐学习目标与动力机制示意',
        },
      },
      {
        src: '/images/archive/details/doudou-fox/02-framework.webp',
        width: 2880,
        height: 1620,
        alt: {
          en: 'Doudou Fox task and reward framework',
          zh: '豆豆狐任务与激励框架',
        },
      },
      {
        src: '/images/archive/details/doudou-fox/03-task-system.webp',
        width: 2880,
        height: 1620,
        alt: {
          en: 'Doudou Fox task system across mobile screens and game world',
          zh: '豆豆狐任务系统与手机界面、游戏地图',
        },
      },
      {
        src: '/images/archive/details/doudou-fox/04-reward-spectrum.webp',
        width: 2880,
        height: 1620,
        alt: {
          en: 'Doudou Fox reward spectrum with character and treasure chest',
          zh: '豆豆狐奖励层级、角色与宝箱',
        },
      },
      {
        src: '/images/archive/details/doudou-fox/05-world-progression.webp',
        width: 2880,
        height: 1620,
        alt: {
          en: 'Doudou Fox world progression across themed game scenes',
          zh: '豆豆狐主题游戏场景中的世界进程',
        },
      },
      {
        src: '/images/archive/details/doudou-fox/06-entry-and-stop.webp',
        width: 2880,
        height: 1620,
        alt: {
          en: 'Doudou Fox task entry and challenge-ended stop state',
          zh: '豆豆狐任务入口与挑战结束状态',
        },
      },
      {
        src: '/images/archive/details/doudou-fox/07-end-to-end.webp',
        width: 2880,
        height: 1620,
        alt: {
          en: 'Doudou Fox end-to-end learning adventure flow',
          zh: '豆豆狐完整学习闯关流程',
        },
      },
    ],
  },
  {
    key: 'tongcheng-mr-chong',
    kind: 'real-entry',
    destination: 'lightbox-only',
    company: { en: 'Tongcheng Travel', zh: '同程旅游' },
    period: {
      start: { dateTime: '2019', label: { en: '2019', zh: '2019' } },
    },
    title: {
      primary: { en: 'MR CHONG', zh: 'MR CHONG' },
      supporting: {
        en: 'Brand IP & 3D Creation',
        zh: '品牌 IP 形象与三维创作',
      },
    },
    description: {
      en: 'Created an extensible brand IP for Tongcheng Travel, including the 3D character, motion, and visual expression.',
      zh: '为同程旅游某业务线打造可延展的品牌 IP，并完成三维角色、动作与视觉表达。',
    },
    skills: ['IP Design', '3D', 'C4D'],
    coverVariant: 'mr-chong',
    image: {
      src: '/images/archive/tongcheng-mr-chong.png',
      width: 1249,
      height: 970,
      alt: {
        en: 'Mr Chong 3D brand character in a yellow environment',
        zh: '黄色场景中的 Mr Chong 三维品牌角色',
      },
    },
    gallery: [
      {
        src: '/images/archive/details/mr-chong/01-character-direction.webp',
        width: 2880,
        height: 1967,
        alt: {
          en: 'Mr Chong character direction with illustrated poses',
          zh: 'Mr Chong 角色方向与插画姿态',
        },
      },
      {
        src: '/images/archive/details/mr-chong/02-posture-exploration.webp',
        width: 2070,
        height: 1523,
        alt: {
          en: 'Mr Chong 3D posture exploration',
          zh: 'Mr Chong 三维姿态探索',
        },
      },
      {
        src: '/images/archive/details/mr-chong/03-travel-scene.webp',
        width: 2069,
        height: 1455,
        alt: {
          en: 'Mr Chong 3D character pulling a suitcase',
          zh: 'Mr Chong 三维角色拉着行李箱',
        },
      },
      {
        src: '/images/archive/details/mr-chong/04-final-render.webp',
        width: 1874,
        height: 1455,
        alt: {
          en: 'Mr Chong final 3D render in a yellow scene',
          zh: '黄色场景中的 Mr Chong 最终三维渲染',
        },
      },
    ],
  },
] as const satisfies readonly RealArchiveEntry[];

export const archiveLayoutSpans = [7, 5, 4, 8, 8, 4, 5, 7] as const;

export const developmentArchiveSlots: readonly DraftArchiveSlot[] =
  Array.from({ length: 8 }, (_, layoutIndex) => ({
    key: `archive-slot-${layoutIndex + 1}`,
    kind: 'draft-slot' as const,
    layoutIndex,
  }));
