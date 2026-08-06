import type { Locale } from '@/content/types';

const taskSources = [
  { id: 'water-am', time: '08:00', icon: 'water' },
  { id: 'lunch', time: '12:00', icon: 'meal' },
  { id: 'meditation', time: '15:30', icon: 'meditation' },
  { id: 'dinner', time: '17:30', icon: 'meal' },
  { id: 'water-pm', time: '18:30', icon: 'water' },
  { id: 'strength', time: '19:00', icon: 'strength' },
  { id: 'stretch', time: '22:30', icon: 'stretch' },
] as const;

const taskLabels = {
  zh: ['补充水分', '营养午餐', '冥想', '健康晚餐', '补充水分', '力量训练', '睡前拉伸'],
  en: ['Hydrate', 'Nutritious lunch', 'Meditation', 'Healthy dinner', 'Hydrate', 'Strength training', 'Bedtime stretch'],
} as const;

export function getGrowthBaseTasks(locale: Locale) {
  return taskSources.map((task, index) => ({
    ...task,
    label: taskLabels[locale][index],
    isCurrent: task.id === 'meditation',
    visibility: index < 5 ? 'visible' : 'overflow',
  }));
}

const filmSources = [
  { id: 'greeting', group: 'presence' },
  { id: 'meditation', group: 'presence' },
  { id: 'meal-prep', group: 'meals' },
  { id: 'meal-cook', group: 'meals' },
] as const;

const filmCopy = {
  zh: ['欢迎与进入', '冥想过程', '饮食准备', '烹饪行动'],
  en: ['Welcome and arrival', 'Meditation', 'Meal preparation', 'Cooking action'],
} as const;

const filmDescriptions = {
  zh: [
    '生成式 IP 以欢迎动画进入成长基地。',
    '生成式 IP 陪伴用户完成一段冥想过程。',
    '生成式 IP 进入饮食准备场景。',
    '生成式 IP 展示烹饪行动场景。',
  ],
  en: [
    'The generative character welcomes the user into Growth Base.',
    'The generative character accompanies a meditation session.',
    'The generative character enters a meal preparation scene.',
    'The generative character performs a cooking action.',
  ],
} as const;

export function getGrowthBaseFilms(locale: Locale) {
  return filmSources.map((film, index) => ({
    ...film,
    src: `/videos/growth-base/${film.id}.mp4`,
    poster: `/images/growth-base/${film.id}-poster.webp`,
    label: `${String(index + 1).padStart(2, '0')} / ${filmCopy[locale][index]}`,
    description: filmDescriptions[locale][index],
  }));
}

export const growthBasePointRewards = {
  zh: [
    { id: 'vitality', label: '活力', image: '/images/growth-base/growth-vitality.png' },
    { id: 'focus', label: '专注', image: '/images/growth-base/growth-focus.png' },
    { id: 'stamina', label: '体力', image: '/images/growth-base/growth-stamina.png' },
  ],
  en: [
    { id: 'vitality', label: 'Vitality', image: '/images/growth-base/growth-vitality.png' },
    { id: 'focus', label: 'Focus', image: '/images/growth-base/growth-focus.png' },
    { id: 'stamina', label: 'Stamina', image: '/images/growth-base/growth-stamina.png' },
  ],
} as const;

export const growthBaseLanguageMoments = {
  zh: [
    { period: '清晨', quote: '“早上好，Maggie。先喝杯水，让今天慢慢开始吧。”' },
    { period: '午后', quote: '“下午好，Maggie。你通常在 3 点后注意力下降，留 5 分钟放松一下吧。”' },
    { period: '晚间', quote: '“晚上好，Maggie。晚餐时间快到了，今天吃得轻松一点，也是在照顾恢复。”' },
    { period: '深夜', quote: '“夜深了，Maggie。今天先到这里，做一段轻柔拉伸，再安心休息吧。”' },
  ],
  en: [
    { period: 'Morning', quote: '“Good morning, Maggie. Start slowly with a glass of water.”' },
    { period: 'Afternoon', quote: '“Good afternoon, Maggie. Your focus often dips after 3 PM. Take five minutes to reset.”' },
    { period: 'Evening', quote: '“Good evening, Maggie. Dinner is coming up. Choosing something light can support your recovery.”' },
    { period: 'Late night', quote: '“It is getting late, Maggie. Let today end here, with a gentle stretch before you rest.”' },
  ],
} as const;

export const growthBaseCaseCopy = {
  zh: {
    comparisonTitle: '互动式、更立体、更亲近的陪伴，更贴近用户的心灵',
    comparisonIntro: '用‘互动式’的视频体验来替代扁平的 2D（左侧是原方案，右侧是设计师的改版方案）',
    comparisonNote: '对照保留旧方案，但让当前可交互体验成为视觉主角。',
    transition: '围绕任务聚焦、激励反馈、情感语言与场景陪伴，我进一步拆解了四个关键设计决策。',
    taskTitle: '聚焦当下最重要的任务',
    taskIntro: '将纵向堆叠的任务重组为横向卡片，减少页面占用，让当前主要场景成为行动焦点。',
    rewardTitle: '让每次完成，都得到及时回应',
    rewardIntro: '用 Hi Five 视频回应任务完成，再通过手动领取积分与道具动效，把抽象奖励转化为可参与、可感知的成长。',
    rewardSteps: ['完成任务', 'Hi Five', '领取积分 / 获得道具'],
    claimTent: '领取静心帐篷',
    tentReady: '静心帐篷',
    tentClaimed: '静心帐篷已放入营地',
    replayTent: '重新演示帐篷领取',
    languageTitle: '先回应此刻，再给出一步建议',
    languageIntro: '结合时间、用户名称与日常节奏，先用一句问候建立亲近感，再给出低门槛、非命令式的健康建议。',
    voiceRole: '懂你节奏的温柔教练',
    languageRules: ['回应当下，再给建议', '一次只建议一个小行动', '邀请而非命令', '不评判，不制造焦虑'],
    clipsTitle: '让陪伴进入一天中的不同场景',
    clipsIntro: '生成式 IP 不只回应任务完成，也出现在欢迎、冥想、备餐与烹饪中，让健康行动自然融入连续的生活情境。',
  },
  en: {
    comparisonTitle: 'One task, two experience states',
    comparisonIntro: 'The original direction remains on the left while the current interactive prototype runs on the right. Switching AI Coach or Personal Trainer updates the Before view in sync.',
    comparisonNote: 'The comparison retains the original direction while making the current interactive experience the visual focus.',
    transition: 'Four decisions shape the redesign: task focus, reward feedback, emotional language, and companionship across everyday scenes.',
    taskTitle: 'Focusing on the task that matters now',
    taskIntro: 'A horizontal task rail replaces the stacked list, reduces page occupation, and keeps the current moment at the center of attention.',
    rewardTitle: 'Make every completion feel acknowledged',
    rewardIntro: 'A Hi Five film responds to completion, while manual point collection and prop motion turn abstract rewards into perceptible growth.',
    rewardSteps: ['Task complete', 'Hi Five', 'Claim points / receive a prop'],
    claimTent: 'Claim Mindfulness Tent',
    tentReady: 'Mindfulness Tent',
    tentClaimed: 'Mindfulness Tent added to camp',
    replayTent: 'Replay tent collection',
    languageTitle: 'Respond to the moment, then suggest one small step',
    languageIntro: 'Time, name, and daily rhythm shape a warm response first, followed by one low-effort suggestion that never feels commanding.',
    voiceRole: 'A gentle coach who understands your rhythm',
    languageRules: ['Acknowledge before advising', 'Suggest one small action', 'Invite rather than command', 'Never judge or create anxiety'],
    clipsTitle: 'Bringing companionship into everyday moments',
    clipsIntro: 'The generative IP moves beyond task completion into welcoming, meditation, meal preparation, and cooking, making healthy actions part of a continuous daily rhythm.',
  },
} as const;
