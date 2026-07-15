import { ActionLink } from '@/components/ui/action-link';

import styles from './home.module.css';

interface BuildLabPreviewProps {
  readonly copy: {
    readonly kind: string;
    readonly title: string;
    readonly proposition: string;
    readonly role: string;
    readonly status: string;
    readonly action: string;
  };
  readonly href: string;
}

export function BuildLabPreview({ copy, href }: BuildLabPreviewProps) {
  return (
    <article
      className={styles.buildBand}
      data-project-id="stt-demo"
      data-project-kind="build-lab"
    >
      <div className={styles.buildInner}>
        <div className={styles.buildMedia}>
          {/* This poster belongs to the pinned and checksummed STT artifact. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/demos/stt-demo/poster.png"
            width={1440}
            height={900}
            alt="STT Demo interface showing a bilingual meeting subtitle experience"
          />
        </div>
        <div className={styles.buildCopy}>
          <p className={styles.projectKind}>{copy.kind}</p>
          <h2>{copy.title}</h2>
          <p className={styles.projectProposition}>{copy.proposition}</p>
          <dl className={styles.buildFacts}>
            <div>
              <dt>Role</dt>
              <dd>{copy.role}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{copy.status}</dd>
            </div>
          </dl>
          <ActionLink href={href} variant="primary">
            {copy.action}
          </ActionLink>
        </div>
      </div>
    </article>
  );
}
