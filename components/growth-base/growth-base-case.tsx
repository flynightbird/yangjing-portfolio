import type { Locale } from '@/content/types';
import { growthBaseCaseCopy } from '@/content/growth-base';

import { GrowthBaseComparison } from './growth-base-comparison';
import { GrowthBaseCampaignPosters } from './growth-base-campaign-posters';
import { GrowthBaseLanguage } from './growth-base-language';
import { GrowthBaseRewardLoop } from './growth-base-reward-loop';
import { GrowthBaseTaskFocus } from './growth-base-task-focus';
import { GrowthBaseTrainerDemo } from './growth-base-trainer-demo';
import { GrowthBaseVideoGrid } from './growth-base-video-grid';
import styles from './growth-base.module.css';

function SectionHeader({
  index,
  label,
  title,
  intro,
}: {
  readonly index: string;
  readonly label: string;
  readonly title: string;
  readonly intro: string;
}) {
  return (
    <header className={styles.sectionHeader}>
      <p>{index} / {label}</p>
      <h2>{title}</h2>
      <span>{intro}</span>
    </header>
  );
}

export function GrowthBaseCase({ locale }: { readonly locale: Locale }) {
  const copy = growthBaseCaseCopy[locale];

  return (
    <>
      <section id="showcase" className={styles.showcase}>
        <div className={styles.overviewCopy}>
          <SectionHeader
            index="01"
            intro={copy.comparisonIntro}
            label="BEFORE + AFTER"
            title={copy.comparisonTitle}
          />
        </div>
        <GrowthBaseComparison locale={locale} />
        <p className={styles.decisionTransition}>{copy.transition}</p>
      </section>

      <section id="task-focus" className={`${styles.taskFocus} ${styles.desktopDecision}`}>
        <SectionHeader index="02" intro={copy.taskIntro} label="TASK FOCUS" title={copy.taskTitle} />
        <GrowthBaseTaskFocus locale={locale} />
      </section>

      <section id="reward-loop" className={`${styles.rewardLoop} ${styles.desktopDecision}`}>
        <SectionHeader index="03" intro={copy.rewardIntro} label="REWARD LOOP" title={copy.rewardTitle} />
        <GrowthBaseRewardLoop locale={locale} />
      </section>

      <section id="emotional-language" className={`${styles.emotionalLanguage} ${styles.desktopDecision}`}>
        <SectionHeader index="04" intro={copy.languageIntro} label="EMOTIONAL LANGUAGE" title={copy.languageTitle} />
        <GrowthBaseLanguage locale={locale} />
      </section>

      <section id="scene-films" className={`${styles.clips} ${styles.desktopDecision}`}>
        <SectionHeader index="05" intro={copy.clipsIntro} label="SCENE FILMS" title={copy.clipsTitle} />
        <GrowthBaseVideoGrid locale={locale} />
      </section>

      <section id="personal-trainer" className={`${styles.personalTrainer} ${styles.desktopDecision}`}>
        <SectionHeader index="06" intro={copy.trainerIntro} label="PERSONAL TRAINER" title={copy.trainerTitle} />
        <GrowthBaseTrainerDemo locale={locale} />
      </section>

      <section id="campaign-posters" className={`${styles.campaignPosters} ${styles.desktopDecision}`}>
        <SectionHeader index="07" intro={copy.campaignIntro} label="CAMPAIGN POSTERS" title={copy.campaignTitle} />
        <GrowthBaseCampaignPosters locale={locale} />
      </section>
    </>
  );
}
