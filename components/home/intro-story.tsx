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
      ['I design where product scale', 'meets system complexity.'],
      ['From consumer products', 'designed at scale.'],
      ['To B2B and AI systems', 'where every state matters.'],
      ['Now I turn design judgment', 'into working products with AI.'],
    ],
  },
  zh: {
    label: '杨静个人介绍',
    navigationLabel: '介绍段落进度',
    controlLabel: '前往介绍段落',
    scenes: [
      ['我在产品规模与', '系统复杂度的交界处设计'],
      ['从大规模 C 端产品', '到持续使用的真实体验'],
      ['再到 B2B 与 AI 系统', '让每个状态都清晰可控'],
      ['现在，我用设计判断与 AI', '把想法做成可运行产品'],
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
