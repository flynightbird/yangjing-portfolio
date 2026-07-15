import { HeroMotion } from '@/components/home/hero-motion';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';

interface DualIdentityHeroProps {
  readonly locale: Locale;
}

export function DualIdentityHero({ locale }: DualIdentityHeroProps) {
  const copy = locale === 'zh' ? zhDictionary.home.hero : enDictionary.home.hero;
  const designerRole = locale === 'zh'
    ? (['产品', '设计师'] as const)
    : (['Product', 'Designer'] as const);
  const builderRole = locale === 'zh'
    ? (['AI 原生', '构建者'] as const)
    : (['AI-native', 'Builder'] as const);

  return (
    <HeroMotion
      name={copy.name}
      designerRole={designerRole}
      builderRole={builderRole}
      designerRoleLabel={copy.designerRole}
      builderRoleLabel={copy.builderRole}
      designerSummary={copy.designerSummary}
      builderSummary={copy.builderSummary}
      portraitLabel={copy.portraitLabel}
    />
  );
}
