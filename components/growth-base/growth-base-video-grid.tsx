import type { Locale } from '@/content/types';
import { getGrowthBaseFilms } from '@/content/growth-base';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './growth-base.module.css';

export function GrowthBaseVideoGrid({ locale }: { readonly locale: Locale }) {
  const films = getGrowthBaseFilms(locale);
  const groups = [films.slice(0, 2), films.slice(2, 4)];

  return (
    <div className={styles.videoGrid} data-growth-base-film-grid data-layout="paired-editorial-shells">
      {groups.map((group, groupIndex) => (
        <div className={styles.filmShell} data-film-shell={groupIndex + 1} key={group[0].group}>
          <span className={styles.shellNumber}>{String(groupIndex + 1).padStart(2, '0')}</span>
          {group.map((film) => {
            const descriptionId = `growth-base-film-${locale}-${film.id}-description`;
            return (
              <figure className={styles.film} data-testid="growth-base-film" key={film.id}>
                <video
                  aria-describedby={descriptionId}
                  aria-label={film.label}
                  controls
                  muted
                  playsInline
                  poster={withBasePath(film.poster)}
                  preload="metadata"
                  src={withBasePath(film.src)}
                />
                <p className={styles.srOnly} id={descriptionId}>{film.description}</p>
                <span className={styles.watermarkMask} data-watermark-mask="top-left" aria-hidden="true" />
                <figcaption data-film-caption="bottom">{film.label}</figcaption>
              </figure>
            );
          })}
        </div>
      ))}
    </div>
  );
}
