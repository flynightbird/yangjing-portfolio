import type { HomepageCompanyId } from '@/content/home';

import styles from './company-mark.module.css';

export function CompanyMark({
  companyId,
  label,
}: {
  readonly companyId: HomepageCompanyId;
  readonly label: string;
}) {
  return (
    <p className={styles.root} data-company-mark={companyId}>
      <span className={styles.logo} data-company-logo={companyId} aria-hidden="true" />
      <span>{label}</span>
    </p>
  );
}
