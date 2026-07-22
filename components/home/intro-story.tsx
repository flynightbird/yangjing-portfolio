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
        support: [
          { text: 'Welcome to a portfolio I designed and built through ' },
          { text: 'Vibe Coding', emphasis: true },
          { text: '.' },
        ],
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
        support: [
          { text: 'I work fluently with ' },
          { text: 'Codex', emphasis: true },
          { text: ', ' },
          { text: 'Claude Design', emphasis: true },
          { text: ', and ' },
          { text: 'Figma Make', emphasis: true },
          {
            text: ' to explore ideas and turn designs into working products. With AIGC tools such as ',
          },
          { text: 'Midjourney', emphasis: true },
          { text: ' and ' },
          { text: 'Jimeng AI', emphasis: true },
          {
            text: ', I expand the visual language and bring greater coherence and polish to the product.',
          },
        ],
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
        trail: '，也长期从事用户研究。',
        support: [
          { text: '这是一个由我设计，并通过 ' },
          { text: 'Vibe Coding', emphasis: true },
          { text: ' 构建的作品集。' },
        ],
      },
      {
        lead: '我的工作覆盖大规模 C 端产品、复杂 B2B 产品与 AI 系统，结合 UX/UI 设计与用户研究，将复杂状态梳理为',
        emphasis: '清晰、可控且具有一致视觉表达的产品体验',
        trail: '。',
      },
      {
        lead: '现在，我也借助 AI 将设计判断转化为',
        emphasis: '可运行的产品',
        trail: '，从概念探索、原型验证走向真实体验。',
        support: [
          { text: '我使用 ' },
          { text: 'Codex', emphasis: true },
          { text: '、' },
          { text: 'Claude Design', emphasis: true },
          { text: ' 与 ' },
          { text: 'Figma Make', emphasis: true },
          { text: ' 进行设计探索与产品构建，并结合 ' },
          { text: 'Midjourney', emphasis: true },
          { text: '、' },
          { text: '即梦', emphasis: true },
          { text: '等 AIGC 工具拓展视觉表达，提升产品的完整度与质感。' },
        ],
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
