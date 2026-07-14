import type { Locale } from '@/content/types';

import { Lightbox } from '../media/lightbox';
import styles from './evidence-figure.module.css';

interface EvidenceFigureProps {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly label: string;
  readonly caption: string;
  readonly locale: Locale;
  readonly className?: string;
}

export function EvidenceFigure({
  src,
  width,
  height,
  alt,
  label,
  caption,
  locale,
  className,
}: EvidenceFigureProps) {
  const triggerLabel = locale === 'zh' ? `放大查看：${alt}` : `Enlarge: ${alt}`;
  const dialogLabel = locale === 'zh' ? '查看产品界面' : 'Product interface detail';

  return (
    <figure
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-evidence
    >
      <p className={styles.label}>{label}</p>
      <Lightbox
        src={src}
        width={width}
        height={height}
        alt={alt}
        triggerLabel={triggerLabel}
        dialogLabel={dialogLabel}
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
