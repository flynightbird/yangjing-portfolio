import { ExternalLink } from 'lucide-react';

import { Lightbox } from '@/components/media/lightbox';
import { ActionLink } from '@/components/ui/action-link';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import {
  archiveEntrySchema,
  developmentArchiveSlots,
  type ArchiveEntry,
} from '@/content/home';
import type { Locale } from '@/content/types';

import styles from './home.module.css';

interface VisualArchiveProps {
  readonly locale: Locale;
  readonly entries?: readonly ArchiveEntry[];
}

const spanClasses = [
  styles.archiveSpan7,
  styles.archiveSpan5,
  styles.archiveSpan4,
  styles.archiveSpan8,
  styles.archiveSpan8,
  styles.archiveSpan4,
  styles.archiveSpan5,
  styles.archiveSpan7,
];

export function VisualArchive({
  locale,
  entries = developmentArchiveSlots,
}: VisualArchiveProps) {
  const copy = locale === 'zh' ? zhDictionary.home.archive : enDictionary.home.archive;
  const parsedEntries = entries.map((entry) => archiveEntrySchema.parse(entry));

  return (
    <section className={styles.archive} aria-labelledby="archive-title">
      <div className={styles.archiveIntro}>
        <h2 id="archive-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      <div className={styles.archiveGrid}>
        {parsedEntries.map((entry) => {
          const spanClass = spanClasses[entry.layoutIndex];
          if (entry.kind === 'draft-slot') {
            return (
              <div
                key={entry.key}
                className={`${styles.archiveItem} ${spanClass}`}
                data-publication-state="draft"
                data-archive-slot={entry.layoutIndex + 1}
              >
                <div className={styles.archiveDraft} role="status">
                  <span aria-hidden="true">
                    {String(entry.layoutIndex + 1).padStart(2, '0')}
                  </span>
                  <p>{copy.draftSlot}</p>
                </div>
              </div>
            );
          }

          const name = entry.name[locale];
          const category = entry.category[locale];
          const role = entry.role[locale];
          const alt = entry.image.alt[locale];
          return (
            <article
              key={entry.key}
              className={`${styles.archiveItem} ${spanClass}`}
            >
              <Lightbox
                src={entry.image.src}
                width={entry.image.width}
                height={entry.image.height}
                alt={alt}
                triggerLabel={`${copy.openImage}: ${name}`}
                dialogLabel={`${copy.imageDialog}: ${name}`}
                closeLabel={copy.closeImage}
              />
              <div className={styles.archiveMeta}>
                <h3>{name}</h3>
                <p>{category}</p>
                <p>{role}</p>
                {entry.year ? <time>{entry.year}</time> : null}
                {entry.externalUrl ? (
                  <ActionLink
                    href={entry.externalUrl}
                    external
                    externalLabel="(opens in a new tab)"
                    variant="text"
                    icon={ExternalLink}
                  >
                    {copy.visitProject}
                  </ActionLink>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
