import type { ContentLayoutProps } from '@/components/case-study/case-layout';
import { CaseLayout } from '@/components/case-study/case-layout';

import styles from './convo-ai-layout.module.css';

export function ConvoAiLayout(props: ContentLayoutProps) {
  return (
    <div className={styles.root} data-convo-ai-case>
      <CaseLayout {...props} />
    </div>
  );
}
