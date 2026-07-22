import { ActionLink } from '@/components/ui/action-link';
import { AidxShowcase } from '@/components/home/aidx-showcase';

import { ProjectMeta } from './project-meta';
import styles from './home.module.css';

interface LiveWebsiteProjectProps {
  readonly copy: {
    readonly kind: string;
    readonly company: string;
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
          <ProjectMeta companyId="aidx" company={copy.company} kind={copy.kind} />
          <h2>{copy.title}</h2>
          <p className={styles.projectProposition}>{copy.proposition}</p>
          <ul className={styles.scopeList} aria-label={copy.role}>
            {copy.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={styles.liveStatus}>{copy.status}</p>
          <ActionLink
            className={styles.homeProjectCta}
            href={href}
            external
            externalLabel="(opens in a new tab)"
            variant="signal"
            aria-label={`${copy.action} ${copy.title} (opens in a new tab)`}
            data-home-project-cta
          >
            {copy.action}
          </ActionLink>
        </div>
        <div className={styles.liveMedia}>
          <AidxShowcase href={href} caption={copy.captureCaption} />
        </div>
      </div>
    </article>
  );
}
