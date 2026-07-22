import type { HomepageCompanyId } from '@/content/home';

import { CompanyMark } from './company-mark';
import styles from './home.module.css';

export function ProjectMeta({
  companyId,
  company,
  kind,
  variant = 'default',
}: {
  readonly companyId: HomepageCompanyId;
  readonly company: string;
  readonly kind: string;
  readonly variant?: 'default' | 'company-only';
}) {
  return (
    <div className={styles.projectMetadata} data-project-meta data-meta-variant={variant}>
      <CompanyMark companyId={companyId} label={company} />
      {variant === 'default' ? (
        <>
          <span
            className={styles.projectMetaSeparator}
            data-project-meta-separator
            aria-hidden="true"
          >
            /
          </span>
          <p className={styles.projectKind} data-project-kind-label>
            {kind}
          </p>
        </>
      ) : null}
    </div>
  );
}
