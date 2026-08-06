import type { Locale } from '@/content/types';
import { growthBaseCaseCopy } from '@/content/growth-base';

import { GrowthBaseComparison } from './growth-base-comparison';
import { GrowthBaseVideoGrid } from './growth-base-video-grid';
import styles from './growth-base.module.css';

function DesignNote({ children }: { readonly children: string }) {
  return (
    <p className={styles.designNote} data-growth-base-note>
      {children}
    </p>
  );
}

export function GrowthBaseCase({ locale }: { readonly locale: Locale }) {
  const copy = growthBaseCaseCopy[locale];

  return (
    <>
      <section id="showcase" className={styles.showcase}>
        <header className={styles.sectionHeader}>
          <p>01 / BEFORE + AFTER</p>
          <h2>{copy.comparisonTitle}</h2>
          <span>{copy.comparisonIntro}</span>
        </header>
        <GrowthBaseComparison locale={locale} />
        <DesignNote>{copy.comparisonNote}</DesignNote>
      </section>

      <section id="experience-clips" className={styles.clips}>
        <header className={styles.sectionHeader}>
          <p>02 / GENERATIVE FILMS</p>
          <h2>{copy.clipsTitle}</h2>
          <span>{copy.clipsIntro}</span>
        </header>
        <GrowthBaseVideoGrid locale={locale} />
        <DesignNote>{copy.clipsNote}</DesignNote>
      </section>

      <section id="disclosure" className={styles.disclosure}>
        <p>03 / DISCLOSURE</p>
        <h2>{copy.disclosureTitle}</h2>
        <div>
          <p>{copy.disclosure}</p>
          <p>{copy.validation}</p>
        </div>
      </section>
    </>
  );
}
