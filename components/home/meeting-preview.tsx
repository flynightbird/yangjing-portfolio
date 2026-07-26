import { ActionLink } from '@/components/ui/action-link';

import { ProjectMeta } from './project-meta';

import styles from './home.module.css';

interface MeetingDecision {
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
    readonly stages: readonly MeetingDecision[];
  };
  readonly href: string;
}

export function MeetingPreview({ copy, href }: MeetingPreviewProps) {
  return (
    <article
      className={styles.meetingBand}
      data-project-id="meeting"
      data-project-kind="deep-case"
      data-publication-state="complete"
    >
      <div className={styles.meetingInner}>
        <div className={styles.meetingHeading} data-scroll-reveal-group="text">
          <ProjectMeta companyId="agora" company={copy.company} kind={copy.kind} />
          <h2 className={styles.coreProjectTitle} data-core-project-title>
            {copy.title}
          </h2>
          <p className={styles.projectProposition}>{copy.proposition}</p>
          <p className={styles.meetingStatus}>{copy.status}</p>
        </div>

        <div
          className={styles.meetingStates}
          aria-label={copy.mediaLabel}
          data-scroll-reveal-group="media"
        >
          {copy.stages.map((stage, index) => (
            <section key={stage.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </section>
          ))}
        </div>

        <div className={styles.meetingAction} data-scroll-reveal-group="text">
          <p>{copy.role}</p>
          <ActionLink
            href={href}
            data-page-transition-tone="dark"
            variant="primary"
            className={`${styles.whiteCta} ${styles.homeProjectCta}`}
            aria-label={`${copy.action} ${copy.title}`}
            data-cta-treatment="white"
            data-home-project-cta
          >
            {copy.action}
          </ActionLink>
        </div>
      </div>
    </article>
  );
}
