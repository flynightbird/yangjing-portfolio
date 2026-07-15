import { HeroMotion } from '@/components/home/hero-motion';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';

import styles from './home.module.css';

interface DualIdentityHeroProps {
  readonly locale: Locale;
}

export function DualIdentityHero({ locale }: DualIdentityHeroProps) {
  const copy = locale === 'zh' ? zhDictionary.home.hero : enDictionary.home.hero;

  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroGrid}>
        <HeroMotion className={styles.heroName}>
          <h1 id="home-title">{copy.name}</h1>
        </HeroMotion>

        <HeroMotion className={styles.designerIdentity} delay={0.08}>
          <h2>{copy.designerRole}</h2>
          <p>{copy.designerSummary}</p>
        </HeroMotion>

        <HeroMotion className={styles.portraitColumn} delay={0.16}>
          <div
            className={styles.portraitDraft}
            data-publication-state="draft"
            data-media="portrait"
            role="img"
            aria-label={copy.portraitLabel}
          >
            <span className={styles.portraitInitials} aria-hidden="true">
              YJ
            </span>
            <span className={styles.draftLabel}>Draft</span>
            <p>{copy.portraitDraft}</p>
          </div>
        </HeroMotion>

        <HeroMotion className={styles.builderIdentity} delay={0.24}>
          <h2>{copy.builderRole}</h2>
          <p>{copy.builderSummary}</p>
        </HeroMotion>
      </div>
    </section>
  );
}
