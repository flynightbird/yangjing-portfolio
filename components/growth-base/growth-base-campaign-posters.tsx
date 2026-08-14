import Image from 'next/image';

import { growthBaseCampaignPosters } from '@/content/growth-base';
import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './growth-base.module.css';

export function GrowthBaseCampaignPosters({ locale }: { readonly locale: Locale }) {
  return (
    <div className={styles.campaignPosterGrid} data-growth-base-campaign-posters>
      {growthBaseCampaignPosters.map((poster) => (
        <figure className={styles.campaignPoster} data-campaign-poster={poster.id} key={poster.id}>
          <Image
            alt={poster.alt[locale]}
            height={poster.height}
            src={withBasePath(poster.src)}
            unoptimized
            width={poster.width}
          />
        </figure>
      ))}
    </div>
  );
}
