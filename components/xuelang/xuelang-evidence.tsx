import { EvidenceFigure } from '@/components/case-study/evidence-figure';
import type { Locale } from '@/content/types';

import styles from './xuelang-evidence.module.css';

interface XuelangFigureProps {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly label: string;
  readonly caption: string;
  readonly locale: Locale;
  readonly emphasis?: 'standard' | 'wide';
}

export function XuelangFigure({
  emphasis = 'standard',
  ...figure
}: XuelangFigureProps) {
  return (
    <EvidenceFigure
      {...figure}
      className={`${styles.figure} ${styles[emphasis]}`}
    />
  );
}
