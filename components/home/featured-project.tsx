import { ActionLink } from '@/components/ui/action-link';
import type { ProjectAvailability } from '@/content/home';

import styles from './home.module.css';

interface ProjectCopy {
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
  readonly id: 'bytedance' | 'call-agent';
  readonly copy: ProjectCopy;
  readonly href: string;
  readonly availability: ProjectAvailability;
  readonly media?: ProjectMedia;
  readonly order: string;
  readonly variant: 'flagship' | 'evidence';
}

export function FeaturedProject({
  id,
  copy,
  href,
  availability,
  media,
  order,
  variant,
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
          <p className={styles.projectKind}>{copy.kind}</p>
          <span className={styles.projectOrder} aria-hidden="true">
            {order}
          </span>
          <h2>{copy.title}</h2>
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
            variant={variant === 'flagship' ? 'primary' : 'secondary'}
            aria-label={`${copy.action} ${copy.title}`}
          >
            {copy.action}
          </ActionLink>
        </div>

        <div className={styles.projectMedia}>
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
