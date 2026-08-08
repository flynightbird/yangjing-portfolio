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
    { period: '清晨', greeting: '“早上好，Maggie。', suggestion: '先喝杯水，让今天慢慢开始吧。”' },
    { period: '午后', greeting: '“下午好，Maggie。', suggestion: '你通常在 3 点后注意力下降，留 5 分钟放松一下吧。”' },
    { period: '晚间', greeting: '“晚上好，Maggie。', suggestion: '晚餐时间快到了，今天吃得轻松一点，也是在照顾恢复。”' },
    { period: '深夜', greeting: '“夜深了，Maggie。', suggestion: '今天先到这里，做一段轻柔拉伸，再安心休息吧。”' },
  ],
  en: [
    { period: 'Morning', greeting: '“Good morning, Maggie.', suggestion: 'Start slowly with a glass of water.”' },
    { period: 'Afternoon', greeting: '“Good afternoon, Maggie.', suggestion: 'Your focus often dips after 3 PM. Take five minutes to reset.”' },
    { period: 'Evening', greeting: '“Good evening, Maggie.', suggestion: 'Dinner is coming up. Choosing something light can support your recovery.”' },
    { period: 'Late night', greeting: '“It is getting late, Maggie.', suggestion: 'Let today end here, with a gentle stretch before you rest.”' },
  ],
} as const;

export const growthBaseCaseCopy = {
  zh: {
    comparisonTitle: '把健康打卡，从信息展示变成有回应的陪伴体验',
    comparisonIntro: '原方案以静态 2D 页面承载任务与功能。我保留核心健康场景，重新设计为可互动、会回应的连续体验；左侧呈现原方案，右侧运行改版后的高保真原型。',
    transition: '这次改版不只是替换视觉，而是围绕行动焦点、完成反馈、情感语言、场景连续性与私教预约，重构用户感知健康陪伴的方式。',
    taskTitle: '让下一步行动一眼可见',
    taskIntro: '原有纵向任务列表占据主要视野，也削弱了当前任务的优先级。我将任务重组为横向卡片轨道，把当下最重要的行动留在视觉中心。',
    rewardTitle: '让完成不再只是状态变化',
    rewardIntro: '任务结束后先用 Hi Five 视频给予即时回应，再让用户主动领取积分与道具，把系统奖励转化为有节奏、有参与感的成长反馈。',
    rewardSteps: ['完成任务', 'Hi Five', '领取积分 / 获得道具'],
    claimTent: '领取静心帐篷',
    tentReady: '静心帐篷',
    tentClaimed: '静心帐篷已放入营地',
    replayTent: '重新演示帐篷领取',
    languageTitle: '先理解此刻，再提出一个小行动',
    languageIntro: '我让教练结合时间、用户名称与日常节奏，先回应用户当下的状态，再给出一个低门槛、非命令式的建议，让健康提醒更像陪伴而不是指令。',
    voiceRole: '懂你节奏的温柔教练',
    languageRules: ['回应当下，再给建议', '一次只建议一个小行动', '邀请而非命令', '不评判，不制造焦虑'],
    clipsTitle: '用连续场景建立陪伴感',
    clipsIntro: '我让生成式 IP 不只出现在任务完成时，也贯穿欢迎、冥想、备餐与烹饪等关键时刻。角色由单次反馈升级为连接一天健康行动的体验线索。',
    trainerTitle: '把私教预约收束成清晰的决策路径',
    trainerIntro: '在原方案与改版方案的对照中，高保真原型自动演示日期选择、时段选择与预约确认。重点不是增加步骤，而是让教练信息、可选时间与最终确认始终处在同一条清晰路径上。',
  },
  en: {
    comparisonTitle: 'Turning health check-ins into a responsive companion',
    comparisonIntro: 'The original concept presented tasks and features through static 2D screens. I kept the core health scenarios, then redesigned them as a continuous experience that responds to action. The original sits on the left; the working high-fidelity prototype runs on the right.',
    transition: 'This was more than a visual refresh. I reworked how users experience support through five connected decisions: action focus, completion feedback, emotional language, continuity across daily scenes, and trainer booking.',
    taskTitle: 'Make the next action unmistakable',
    taskIntro: 'The stacked task list occupied the main view without making priority clear. I reorganized it as a horizontal rail that keeps the most relevant action at the visual center while preserving the rest of the day in context.',
    rewardTitle: 'Turn completion into a felt response',
    rewardIntro: 'A Hi Five film acknowledges the completed task immediately. Users then claim points and a tangible camp item themselves, turning an abstract system update into a paced moment of progress.',
    rewardSteps: ['Task complete', 'Hi Five', 'Claim points / receive a prop'],
    claimTent: 'Claim Mindfulness Tent',
    tentReady: 'Mindfulness Tent',
    tentClaimed: 'Mindfulness Tent added to camp',
    replayTent: 'Replay tent collection',
    languageTitle: 'Acknowledge the moment before offering advice',
    languageIntro: 'I used time, name, and daily rhythm to make each response feel situated. The coach first recognizes the user\'s current moment, then offers one low-effort action in language that invites rather than instructs.',
    voiceRole: 'A gentle coach who understands your rhythm',
    languageRules: ['Acknowledge before advising', 'Suggest one small action', 'Invite rather than command', 'Never judge or create anxiety'],
    clipsTitle: 'Build companionship through continuity',
    clipsIntro: 'I extended the generative character beyond task completion into arrival, meditation, meal preparation, and cooking. The character becomes a recurring thread across the day rather than a one-off reward.',
    trainerTitle: 'Reduce trainer booking to one clear decision path',
    trainerIntro: 'The high-fidelity prototype automatically demonstrates date selection, time selection, and confirmation alongside the original design. The goal was not to add more steps, but to keep trainer context, availability, and commitment clear from start to finish.',
  },
} as const;
