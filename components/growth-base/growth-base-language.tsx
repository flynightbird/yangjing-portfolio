import type { Locale } from '@/content/types';
import { growthBaseCaseCopy, growthBaseLanguageMoments } from '@/content/growth-base';

import styles from './growth-base.module.css';

export function GrowthBaseLanguage({ locale }: { readonly locale: Locale }) {
  const copy = growthBaseCaseCopy[locale];

  return (
    <div className={styles.languageComposition}>
      <div className={styles.languageField} data-language-field>
        {growthBaseLanguageMoments[locale].map((moment, index) => (
          <blockquote
            className={styles.languageMoment}
            data-language-moment={moment.period}
            key={moment.period}
            style={{ '--moment-index': index } as React.CSSProperties}
          >
            <span>{moment.period}</span>
            <p>
              <strong>{moment.greeting}</strong>
              <span>{moment.suggestion}</span>
            </p>
          </blockquote>
        ))}
      </div>
      <aside className={styles.languageRules}>
        <p>{copy.voiceRole}</p>
        <ul>
          {copy.languageRules.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
      </aside>
    </div>
  );
}
