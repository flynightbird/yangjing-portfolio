import type { HomepageCompanyId } from '@/content/home';

import { CompanyMark } from './company-mark';
import styles from './home.module.css';

export function ProjectMeta({
  companyId,
  company,
  kind,
}: {
  readonly companyId: HomepageCompanyId;
  readonly company: string;
  readonly kind: string;
}) {
  return (
    <div className={styles.projectMetadata} data-project-meta>
      <CompanyMark companyId={companyId} label={company} />
      <span className={styles.projectMetaSeparator} aria-hidden="true">
        /
      </span>
      <p className={styles.projectKind}>{kind}</p>
    </div>
  );
}
