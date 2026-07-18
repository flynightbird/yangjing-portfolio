import { IntroStoryMotion } from '@/components/home/intro-story-motion';
import type { Locale } from '@/content/types';

interface IntroStoryProps {
  readonly locale: Locale;
}

const introCopy = {
  en: {
    label: 'Yang Jing introduction',
    navigationLabel: 'Introduction progress',
    controlLabel: 'Go to introduction statement',
    scenes: [
      {
        lead: "Hi, I'm Yang Jing, a ",
        emphasis: 'UX/UI designer',
        trail: ' with more than a decade of experience.',
        support: {
          lead: 'Welcome to a portfolio I designed and built through ',
          emphasis: 'Vibe Coding',
          trail: '.',
        },
      },
      {
        lead: 'I work across large-scale consumer products and complex B2B and AI systems, turning complexity into ',
        emphasis: 'clear, controllable product experiences',
        trail: '.',
      },
      {
        lead: 'Now I also use AI to turn design judgment into ',
        emphasis: 'working products',
        trail: ', moving from concept and prototype to real experience.',
      },
    ],
  },
  zh: {
    label: '杨静个人介绍',
    navigationLabel: '介绍段落进度',
    controlLabel: '前往介绍段落',
    scenes: [
      {
        lead: '嗨，我是杨静，一名拥有十多年经验的 ',
        emphasis: 'UX/UI 设计师',
        trail: '。',
        support: {
          lead: '欢迎来到这个由我亲手设计，并通过 ',
          emphasis: 'Vibe Coding',
          trail: ' 构建的作品集。',
        },
      },
      {
        lead: '我的工作横跨大规模 C 端产品、复杂 B2B 与 AI 系统，将复杂状态转化为',
        emphasis: '清晰、可控的产品体验',
        trail: '。',
      },
      {
        lead: '现在，我也使用 AI 将设计判断转化为',
        emphasis: '可运行的产品',
        trail: '，从概念、原型走向真实体验。',
      },
    ],
  },
} as const;

export function IntroStory({ locale }: IntroStoryProps) {
  const copy = introCopy[locale];

  return (
    <IntroStoryMotion
      locale={locale}
      label={copy.label}
      navigationLabel={copy.navigationLabel}
      controlLabel={copy.controlLabel}
      scenes={copy.scenes}
    />
  );
}
