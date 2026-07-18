import { ActionLink } from '@/components/ui/action-link';
import { CompanyMark } from '@/components/home/company-mark';

import styles from './home.module.css';

interface MeetingStage {
  readonly title: string;
  readonly description: string;
}

interface MeetingPreviewProps {
  readonly copy: {
    readonly kind: string;
    readonly company: string;
    readonly title: string;
    readonly proposition: string;
    readonly role: string;
    readonly status: string;
    readonly mediaLabel: string;
    readonly action: string;
    readonly stages: readonly MeetingStage[];
  };
  readonly href: string;
}

export function MeetingPreview({ copy, href }: MeetingPreviewProps) {
  return (
    <article
      className={styles.meetingBand}
      data-project-id="meeting"
      data-project-kind="deep-case"
      data-publication-state="draft"
    >
      <div className={styles.meetingInner}>
        <div className={styles.meetingHeading}>
          <CompanyMark companyId="agora" label={copy.company} />
          <p className={styles.projectKind}>{copy.kind}</p>
          <h2>{copy.title}</h2>
          <p className={styles.projectProposition}>{copy.proposition}</p>
          <p className={styles.meetingStatus}>{copy.status}</p>
        </div>

        <div className={styles.meetingStates} aria-label={copy.mediaLabel}>
          {copy.stages.map((stage, index) => (
            <section key={stage.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </section>
          ))}
        </div>

        <div className={styles.meetingAction}>
          <p>{copy.role}</p>
          <ActionLink
            href={href}
            data-page-transition-tone="dark"
            variant="secondary"
            aria-label={`${copy.action} ${copy.title}`}
          >
            {copy.action}
          </ActionLink>
        </div>
      </div>
    </article>
  );
}
