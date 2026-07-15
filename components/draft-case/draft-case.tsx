import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';

import styles from './draft-case.module.css';

interface DraftCaseProps {
  readonly locale: Locale;
  readonly project: 'meeting';
}

function ReservedMedia({ label }: { readonly label: string }) {
  return (
    <div className={styles.reservedMedia} role="status">
      <span aria-hidden="true">YJ</span>
      <p>{label}</p>
    </div>
  );
}

export function DraftCase({ locale, project }: DraftCaseProps) {
  const text = locale === 'zh' ? zhDictionary.draftCase : enDictionary.draftCase;
  const projectCopy = text[project];

  return (
    <div className={styles.root} data-publication-state="draft">
      <div className={styles.draftNotice} role="status">
        <strong>{text.draft}</strong>
        <p>{text.evidenceBoundary}</p>
      </div>

      <section id="overview" className={styles.section}>
        <header>
          <p>{text.approvedEvidence}</p>
          <h2>{projectCopy.proposition}</h2>
        </header>
        <p className={styles.summary}>{projectCopy.summary}</p>
        <ReservedMedia label={text.mediaUnavailable} />
      </section>

      <>
          <section id="shipped-evidence" className={styles.section}>
            <header>
              <p>{text.approvedEvidence}</p>
              <h2>{text.meeting.shipped}</h2>
            </header>
            <div className={styles.mediaSequence}>
              <ReservedMedia label={text.mediaUnavailable} />
              <ReservedMedia label={text.mediaUnavailable} />
            </div>
          </section>

          <section id="interaction-model" className={styles.section}>
            <header>
              <p>{text.plannedEvidence}</p>
              <h2>{projectCopy.proposition}</h2>
            </header>
            <div className={styles.stateSequence}>
              {(locale === 'zh'
                ? ['会前准备', '实时协作', '会后记录']
                : ['Prepare', 'Collaborate', 'Review']
              ).map((state, index) => (
                <div key={state}>
                  <span>0{index + 1}</span>
                  <b>{state}</b>
                </div>
              ))}
            </div>
          </section>

          <section id="retrospective" className={styles.retrospectiveSection}>
            <header>
              <p>{text.draft}</p>
              <h2>{text.meeting.retrospective}</h2>
            </header>
            <ReservedMedia label={text.mediaUnavailable} />
          </section>

          <section id="limitations" className={styles.section}>
            <header>
              <p>{text.evidenceBoundary}</p>
              <h2>{text.meeting.limitations}</h2>
            </header>
          </section>
      </>
    </div>
  );
}
