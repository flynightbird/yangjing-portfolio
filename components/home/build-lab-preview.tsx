import { ActionLink } from '@/components/ui/action-link';

import { BuildLabMedia } from './build-lab-media';
import { ProjectMeta } from './project-meta';
import styles from './home.module.css';

interface BuildLabPreviewProps {
  readonly copy: {
    readonly kind: string;
    readonly company: string;
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
        <div className={styles.buildCopy} data-stt-copy>
          <ProjectMeta companyId="agora" company={copy.company} kind={copy.kind} />
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
          <ActionLink href={href} target="_blank" variant="signal">
            {copy.action}
          </ActionLink>
        </div>
        <BuildLabMedia href={href} />
      </div>
    </article>
  );
}
