import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

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
  readonly eager?: boolean;
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
  eager = false,
}: EvidenceFigureProps) {
  const triggerLabel = locale === 'zh' ? `放大查看：${alt}` : `Enlarge: ${alt}`;
  const dialogLabel = locale === 'zh' ? '查看产品界面' : 'Product interface detail';
  const closeLabel = locale === 'zh' ? '关闭图片' : 'Close image';
  const expandLabel = locale === 'zh' ? '放大' : 'Expand';

  return (
    <figure
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-evidence
    >
      <p className={styles.label}>{label}</p>
      <Lightbox
        src={withBasePath(src)}
        width={width}
        height={height}
        alt={alt}
        triggerLabel={triggerLabel}
        dialogLabel={dialogLabel}
        closeLabel={closeLabel}
        expandLabel={expandLabel}
        triggerLoading={eager ? 'eager' : 'lazy'}
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
