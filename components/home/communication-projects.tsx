import type { Locale } from '@/content/types';

import { BuildLabPreview } from './build-lab-preview';
import { MeetingPreview } from './meeting-preview';
import styles from './home.module.css';

type MeetingProps = Parameters<typeof MeetingPreview>[0];
type SttProps = Parameters<typeof BuildLabPreview>[0];

export function CommunicationProjects({
  locale,
  meeting,
  stt,
}: {
  readonly locale: Locale;
  readonly meeting: MeetingProps;
  readonly stt: SttProps;
}) {
  return (
    <section
      className={styles.communicationChapter}
      data-project-chapter="communication-systems"
      aria-label={locale === 'zh' ? '通信系统' : 'Communication systems'}
    >
      <MeetingPreview {...meeting} />
      <BuildLabPreview {...stt} />
    </section>
  );
}
