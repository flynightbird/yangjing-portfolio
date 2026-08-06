import type { Locale } from '@/content/types';
import { getGrowthBaseFilms } from '@/content/growth-base';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './growth-base.module.css';

export function GrowthBaseVideoGrid({ locale }: { readonly locale: Locale }) {
  return (
    <div
      className={styles.videoGrid}
      data-growth-base-film-grid
      data-layout="editorial-3-2"
    >
      {getGrowthBaseFilms(locale).map((film) => {
        const descriptionId = `growth-base-film-${locale}-${film.id}-description`;
        return (
        <figure className={styles.film} data-testid="growth-base-film" key={film.id}>
          <video
            src={withBasePath(film.src)}
            poster={withBasePath(film.poster)}
            muted
            controls
            playsInline
            preload="metadata"
            aria-label={film.label}
            aria-describedby={descriptionId}
          />
          <p className={styles.srOnly} id={descriptionId}>{film.description}</p>
          <span className={styles.watermarkMask} data-watermark-mask="top-left" aria-hidden="true" />
          <figcaption data-film-caption="bottom">{film.label}</figcaption>
        </figure>
        );
      })}
    </div>
  );
}
