import type { Locale } from '@/content/types';

const filmSources = [
  'greeting',
  'meditation',
  'meditation-complete',
  'meal-prep',
  'meal-cook',
] as const;

const filmCopy = {
  zh: ['欢迎与进入', '冥想过程', '完成反馈', '饮食准备', '烹饪行动'],
  en: ['Welcome', 'Meditation', 'Completion feedback', 'Meal preparation', 'Cooking action'],
} as const;

const filmDescriptions = {
  zh: [
    '生成式 IP 以欢迎动画进入成长基地。',
    '生成式 IP 陪伴用户完成一段冥想过程。',
    '冥想结束后，生成式 IP 提供完成反馈。',
    '生成式 IP 进入饮食准备场景。',
    '生成式 IP 展示烹饪行动场景。',
  ],
  en: [
    'The generative character welcomes the user into Growth Base.',
    'The generative character accompanies a meditation session.',
    'The generative character responds when meditation is complete.',
    'The generative character enters a meal preparation scene.',
    'The generative character performs a cooking action.',
  ],
} as const;

export function getGrowthBaseFilms(locale: Locale) {
  return filmSources.map((id, index) => ({
    id,
    src: `/videos/growth-base/${id}.mp4`,
    poster: `/images/growth-base/${id}-poster.webp`,
    label: `${String(index + 1).padStart(2, '0')} / ${filmCopy[locale][index]}`,
    description: filmDescriptions[locale][index],
  }));
}

export const growthBaseCaseCopy = {
  zh: {
    comparisonTitle: '同一任务，两个体验版本',
    comparisonIntro: '左侧保留原方案，右侧运行当前可交互原型。切换 AI 教练或预约私教时，Before 会同步变化。',
    clipsTitle: '体验片段',
    clipsIntro: '五段生成式 IP 视频覆盖欢迎、冥想、完成反馈与饮食行动。',
    disclosureTitle: '个人概念 · 可交互原型',
    disclosure: '产品结构、交互判断与视觉方向由设计师完成；生成式 AI 辅助视频制作与原型开发。当前展示设计目标与预期影响，不代表已验证的用户结果。',
    validation: '下一步验证：反馈是否容易理解、视频是否干扰任务，以及陪伴感能否支持持续行动。',
    comparisonNote: '对照保留旧方案，但让当前可交互体验成为视觉主角。',
    clipsNote: '五段生成式视频把欢迎、冥想、反馈与饮食行动连接成持续陪伴。',
  },
  en: {
    comparisonTitle: 'One task, two experience states',
    comparisonIntro: 'The original direction remains on the left while the current interactive prototype runs on the right. Switching AI Coach or Personal Trainer updates the Before view in sync.',
    clipsTitle: 'Experience clips',
    clipsIntro: 'Five generative character films cover welcome, meditation, completion feedback, and meal actions.',
    disclosureTitle: 'Personal concept · Interactive prototype',
    disclosure: 'The designer shaped the product structure, interaction, and visual direction; generative AI assisted film production and prototype development. The case communicates intended effects rather than validated user outcomes.',
    validation: 'Next validation: feedback comprehension, video distraction, and whether the sense of companionship supports continued action.',
    comparisonNote: 'The comparison retains the original direction while making the current interactive experience the visual focus.',
    clipsNote: 'Five generative films connect welcome, meditation, feedback, and meal actions into continuous companionship.',
  },
} as const;
