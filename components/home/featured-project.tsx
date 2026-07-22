import { ActionLink } from '@/components/ui/action-link';
import type { PageTransitionTone } from '@/components/shell/page-transition-layer';
import type { HomepageCompanyId, ProjectAvailability } from '@/content/home';
import { withBasePath } from '@/lib/i18n/locales';
import type { ReactNode } from 'react';

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

interface FeaturedProjectBaseProps {
  readonly id: 'xuelang' | 'call-agent';
  readonly copy: ProjectCopy;
  readonly href: string;
  readonly availability: ProjectAvailability;
  readonly order: string;
  readonly transitionTone: PageTransitionTone;
  readonly variant: 'flagship' | 'evidence';
  readonly companyId: HomepageCompanyId;
}

type FeaturedProjectMediaProps =
  | { readonly media: ProjectMedia; readonly mediaContent?: never }
  | { readonly media?: never; readonly mediaContent: NonNullable<ReactNode> }
  | { readonly media?: undefined; readonly mediaContent?: undefined };

type FeaturedProjectProps = FeaturedProjectBaseProps & FeaturedProjectMediaProps;

export function FeaturedProject({
  id,
  copy,
  href,
  availability,
  media,
  mediaContent,
  order,
  transitionTone,
  variant,
  companyId,
}: FeaturedProjectProps) {
  const isDraft = availability === 'draft';
  const hasCustomMedia = mediaContent != null;

  return (
    <article
      className={`${styles.projectBand} ${styles[variant]}`}
      data-project-id={id}
      data-project-kind="deep-case"
      data-publication-state={isDraft ? 'draft' : undefined}
      data-pointer-suppress={id === 'xuelang' ? '' : undefined}
    >
      <div className={styles.projectInner}>
        <div className={styles.projectCopy} data-scroll-reveal-group="text">
          <ProjectMeta companyId={companyId} company={copy.company} kind={copy.kind} />
          <h2 className={styles.coreProjectTitle} data-core-project-title>
            {copy.title}
          </h2>
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
            className={styles.homeProjectCta}
            href={href}
            data-page-transition-tone={transitionTone}
            variant="primary"
            aria-label={`${copy.action} ${copy.title}`}
            data-home-project-cta
          >
            {copy.action}
          </ActionLink>
        </div>

        <div
          className={styles.projectMedia}
          data-project-media-frame
          data-media-radius="20"
          data-scroll-reveal-group="media"
          data-custom-media={hasCustomMedia ? '' : undefined}
        >
          {hasCustomMedia ? (
            mediaContent
          ) : media ? (
              // The image is verified product evidence with preserved dimensions.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={withBasePath(media.src)}
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
