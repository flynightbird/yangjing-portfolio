import { ActionLink } from '@/components/ui/action-link';

import { MeetingHomeMedia } from './meeting-home-media';
import { ProjectMeta } from './project-meta';

import styles from './home.module.css';

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
    readonly states: readonly string[];
    readonly platforms: readonly string[];
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
            <a href={href} data-page-transition-tone="dark">
              {copy.title}
            </a>
          </h2>
          <p className={styles.projectProposition}>{copy.proposition}</p>
        </div>

        <a
          href={href}
          className={styles.meetingStates}
          aria-label={copy.mediaLabel}
          data-page-transition-tone="dark"
          data-scroll-reveal-group="media"
        >
          <MeetingHomeMedia />
          <ol>
            {copy.states.map((state, index) => (
              <li key={state}>
              <span aria-hidden="true">0{index + 1}</span>
                <span>{state}</span>
              </li>
            ))}
          </ol>
          <p>
            {copy.platforms.map((platform) => <span key={platform}>{platform}</span>)}
          </p>
        </a>

        <div className={styles.meetingAction} data-scroll-reveal-group="text">
          <p>{copy.role} · {copy.status}</p>
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
