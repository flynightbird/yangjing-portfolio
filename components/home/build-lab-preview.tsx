import { ActionLink } from '@/components/ui/action-link';
import type { Locale } from '@/content/types';

import { BuildLabMedia } from './build-lab-media';
import { ProjectMeta } from './project-meta';
import styles from './home.module.css';

interface BuildLabPreviewProps {
  readonly locale: Locale;
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

export function BuildLabPreview({ locale, copy, href }: BuildLabPreviewProps) {
  return (
    <article
      className={styles.buildBand}
      data-project-id="stt-demo"
      data-project-kind="build-lab"
    >
      <div className={styles.buildInner}>
        <div className={styles.buildCopy} data-stt-copy data-scroll-reveal-group="text">
          <ProjectMeta companyId="agora" company={copy.company} kind={copy.kind} />
          <h2 className={styles.coreProjectTitle} data-core-project-title>
            {copy.title}
          </h2>
          <p className={styles.projectProposition}>{copy.proposition}</p>
          <dl className={styles.buildFacts}>
            <div>
              <dt>{locale === 'zh' ? '角色' : 'Role'}</dt>
              <dd>{copy.role}</dd>
            </div>
            <div>
              <dt>{locale === 'zh' ? '状态' : 'Status'}</dt>
              <dd>{copy.status}</dd>
            </div>
          </dl>
          <ActionLink
            className={styles.homeProjectCta}
            href={href}
            target="_blank"
            variant="signal"
            data-home-project-cta
          >
            {copy.action}
          </ActionLink>
        </div>
        <BuildLabMedia href={href} />
      </div>
    </article>
  );
}
