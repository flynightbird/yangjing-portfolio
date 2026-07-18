import { ActionLink } from '@/components/ui/action-link';
import type { PageTransitionTone } from '@/components/shell/page-transition-layer';
import type { HomepageCompanyId, ProjectAvailability } from '@/content/home';

import { ProjectMeta } from './project-meta';
import styles from './home.module.css';

interface ProjectCopy {
  readonly company: string;
  readonly kind: string;
  readonly title: string;
  readonly proposition: string;
  readonly role: string;
  readonly status: string;
  readonly mediaLabel: string;
  readonly action: string;
}

interface ProjectMedia {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

interface FeaturedProjectProps {
  readonly id: 'xuelang' | 'call-agent';
  readonly copy: ProjectCopy;
  readonly href: string;
  readonly availability: ProjectAvailability;
  readonly media?: ProjectMedia;
  readonly order: string;
  readonly transitionTone: PageTransitionTone;
  readonly variant: 'flagship' | 'evidence';
  readonly companyId: HomepageCompanyId;
}

export function FeaturedProject({
  id,
  copy,
  href,
  availability,
  media,
  order,
  transitionTone,
  variant,
  companyId,
}: FeaturedProjectProps) {
  const isDraft = availability === 'draft';

  return (
    <article
      className={`${styles.projectBand} ${styles[variant]}`}
      data-project-id={id}
      data-project-kind="deep-case"
      data-publication-state={isDraft ? 'draft' : undefined}
    >
      <div className={styles.projectInner}>
        <div className={styles.projectCopy}>
          <ProjectMeta companyId={companyId} company={copy.company} kind={copy.kind} />
          <h2>{copy.title}</h2>
          <div className={styles.projectMeta}>
            <span className={styles.projectOrder} aria-hidden="true">
              {order}
            </span>
          </div>
          <p className={styles.projectProposition}>{copy.proposition}</p>
          <dl className={styles.projectFacts}>
            <div>
              <dt>Role</dt>
              <dd>{copy.role}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{copy.status}</dd>
            </div>
          </dl>
          <ActionLink
            href={href}
            data-page-transition-tone={transitionTone}
            variant={variant === 'flagship' ? 'primary' : 'secondary'}
            aria-label={`${copy.action} ${copy.title}`}
          >
            {copy.action}
          </ActionLink>
        </div>

        <div
          className={styles.projectMedia}
          data-project-media-frame
          data-media-radius="20"
        >
          {media ? (
            // The image is verified product evidence with preserved dimensions.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.src}
              width={media.width}
              height={media.height}
              alt={media.alt}
            />
          ) : (
            <div className={styles.draftMedia} role="status">
              <span>{copy.mediaLabel}</span>
              <b>Draft</b>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
