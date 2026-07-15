import { ActionLink } from '@/components/ui/action-link';

import styles from './home.module.css';

interface LiveWebsiteProjectProps {
  readonly copy: {
    readonly kind: string;
    readonly title: string;
    readonly proposition: string;
    readonly role: string;
    readonly status: string;
    readonly action: string;
    readonly scope: readonly string[];
    readonly captureCaption: string;
  };
  readonly href: string;
}

export function LiveWebsiteProject({ copy, href }: LiveWebsiteProjectProps) {
  return (
    <article
      className={styles.liveBand}
      data-project-id="aidx"
      data-project-kind="live-launch"
    >
      <div className={styles.liveInner}>
        <div className={styles.liveCopy}>
          <p className={styles.projectKind}>{copy.kind}</p>
          <h2>{copy.title}</h2>
          <p className={styles.projectProposition}>{copy.proposition}</p>
          <ul className={styles.scopeList} aria-label={copy.role}>
            {copy.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ActionLink
            href={href}
            external
            externalLabel="(opens in a new tab)"
            variant="primary"
            aria-label={`${copy.action} ${copy.title} (opens in a new tab)`}
          >
            {copy.action}
          </ActionLink>
        </div>
        <figure className={styles.liveMedia}>
          {/* Captured from the public AIDX homepage in July 2026. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/aidx/home-2026-07.png"
            width={1440}
            height={900}
            alt="AIDX public website homepage with Tested AI, Trusted AI positioning"
          />
          <figcaption>{copy.captureCaption}</figcaption>
        </figure>
      </div>
    </article>
  );
}
