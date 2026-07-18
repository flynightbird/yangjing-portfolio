import { ActionLink } from '@/components/ui/action-link';

import { ProjectMeta } from './project-meta';

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
          <ProjectMeta companyId="agora" company={copy.company} kind={copy.kind} />
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
            className={styles.whiteCta}
            aria-label={`${copy.action} ${copy.title}`}
            data-cta-treatment="white"
          >
            {copy.action}
          </ActionLink>
        </div>
      </div>
    </article>
  );
}
