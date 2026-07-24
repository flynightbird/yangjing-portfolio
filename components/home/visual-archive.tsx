'use client';

import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import { Lightbox } from '@/components/media/lightbox';
import { ActionLink } from '@/components/ui/action-link';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import {
  archiveEntrySchema,
  archiveProjects,
  type ArchiveEntry,
} from '@/content/home';
import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './home.module.css';

interface VisualArchiveProps {
  readonly locale: Locale;
  readonly entries?: readonly ArchiveEntry[];
}

const cardClasses = [
  styles.archiveWide,
  styles.archivePortrait,
  styles.archiveStandard,
  styles.archiveWide,
  styles.archiveStandard,
  styles.archivePortrait,
  styles.archiveWide,
  styles.archiveStandard,
];

const draftPreviewMedia = [
  { src: '/images/xuelang/hero-panorama.webp', width: 3000, height: 1500 },
  { src: '/images/call-agent/ai-preview-live.png', width: 2934, height: 1466 },
  { src: '/images/xuelang/course-detail.webp', width: 1920, height: 1080 },
  { src: '/images/aidx/home-2026-07.png', width: 1440, height: 900 },
  { src: '/images/call-agent/outbound-task-creation.png', width: 2938, height: 1474 },
  { src: '/images/xuelang/learning-interaction.webp', width: 1920, height: 1080 },
  { src: '/images/call-agent/product-switcher.png', width: 560, height: 420 },
  { src: '/images/xuelang/detail-after.webp', width: 1920, height: 1080 },
] as const;

function formatIndex(index: number) {
  return String(index + 1).padStart(2, '0');
}

export function VisualArchive({
  locale,
  entries = archiveProjects,
}: VisualArchiveProps) {
  const copy = locale === 'zh' ? zhDictionary.home.archive : enDictionary.home.archive;
  const parsedEntries = entries.map((entry) => archiveEntrySchema.parse(entry));
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const programmaticIndexRef = useRef<number | null>(null);
  const total = parsedEntries.length;

  const getTrackInset = (card: HTMLElement) => {
    const track = card.parentElement;
    if (!track) return 0;
    return Number.parseFloat(getComputedStyle(track).paddingInlineStart) || 0;
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frame = 0;
    let pendingHorizontalDelta = 0;
    let pendingVerticalDelta = 0;
    const flushWheel = () => {
      const left = pendingHorizontalDelta;
      const top = pendingVerticalDelta;
      pendingHorizontalDelta = 0;
      pendingVerticalDelta = 0;
      frame = 0;

      if (left !== 0) {
        const cards = cardRefs.current.filter((card): card is HTMLElement => card !== null);
        const inset = cards[0] ? getTrackInset(cards[0]) : 0;
        const currentIndex = cards.reduce((closestIndex, card, index) => {
          const closestDistance = Math.abs(cards[closestIndex].offsetLeft - inset - scroller.scrollLeft);
          const distance = Math.abs(card.offsetLeft - inset - scroller.scrollLeft);
          return distance < closestDistance ? index : closestIndex;
        }, 0);
        const nextIndex = Math.max(0, Math.min(cards.length - 1, currentIndex + Math.sign(left)));
        const targetCard = cards[nextIndex];
        if (targetCard) {
          const previousScrollBehavior = scroller.style.scrollBehavior;
          scroller.style.scrollBehavior = 'auto';
          programmaticIndexRef.current = nextIndex;
          scroller.scrollLeft = targetCard.offsetLeft - inset;
          scroller.style.scrollBehavior = previousScrollBehavior;
        }
      }
      if (top === 0) return;

      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      try {
        window.scrollBy({ top, behavior: 'auto' });
      } finally {
        root.style.scrollBehavior = previousScrollBehavior;
      }
    };
    const forwardWheel = (event: globalThis.WheelEvent) => {
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY) && event.deltaX !== 0) {
        event.preventDefault();
        pendingHorizontalDelta += event.deltaX;
      } else {
        event.preventDefault();
        pendingVerticalDelta += event.deltaY;
      }
      if (frame === 0) frame = window.requestAnimationFrame(flushWheel);
    };

    scroller.addEventListener('wheel', forwardWheel, { passive: false });
    return () => {
      scroller.removeEventListener('wheel', forwardWheel);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToIndex = (nextIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(nextIndex, total - 1));
    const scroller = scrollerRef.current;
    const card = cardRefs.current[clampedIndex];
    if (!scroller || !card) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    programmaticIndexRef.current = clampedIndex;
    scroller.scrollTo({
      left: card.offsetLeft - getTrackInset(card),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
    setActiveIndex(clampedIndex);
  };

  const updateActiveIndex = () => {
    const scroller = scrollerRef.current;
    const firstCard = cardRefs.current[0];
    if (!scroller || !firstCard) return;

    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    const programmaticIndex = programmaticIndexRef.current;
    if (programmaticIndex !== null) {
      const targetCard = cardRefs.current[programmaticIndex];
      if (!targetCard) return;

      const inset = getTrackInset(firstCard);
      const targetLeft = Math.min(targetCard.offsetLeft - inset, maxScrollLeft);
      if (Math.abs(targetLeft - scroller.scrollLeft) <= 2) {
        programmaticIndexRef.current = null;
        setActiveIndex(programmaticIndex);
      }
      return;
    }

    if (maxScrollLeft > 0 && maxScrollLeft - scroller.scrollLeft <= 2) {
      setActiveIndex(total - 1);
      return;
    }

    const inset = getTrackInset(firstCard);
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const distance = Math.abs(card.offsetLeft - inset - scroller.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveIndex(closestIndex);
  };

  const progressStyle = {
    '--archive-progress': (activeIndex + 1) / total,
  } as CSSProperties;

  return (
    <section
      className={styles.archive}
      aria-labelledby="archive-title"
      data-archive-carousel
      style={progressStyle}
    >
      <div
        className={styles.archiveHeader}
        data-archive-header
        data-scroll-reveal-group="text"
      >
        <div className={styles.archiveIntro}>
          <h2 id="archive-title">{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
        <div className={styles.archiveNavigation}>
          <span className={styles.archiveCount}>
            {formatIndex(total - 1)} {copy.projectCount}
          </span>
          <div className={styles.archiveControls}>
            <button
              type="button"
              aria-label={copy.previousProject}
              disabled={activeIndex === 0}
              onClick={() =>
                scrollToIndex((programmaticIndexRef.current ?? activeIndex) - 1)
              }
            >
              <ArrowLeft aria-hidden="true" size={18} />
            </button>
            <div className={styles.archiveProgress} aria-hidden="true">
              <span />
            </div>
            <button
              type="button"
              aria-label={copy.nextProject}
              disabled={activeIndex === total - 1}
              onClick={() =>
                scrollToIndex((programmaticIndexRef.current ?? activeIndex) + 1)
              }
            >
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
          <output
            className={styles.archivePosition}
            aria-live="polite"
            aria-label={copy.positionLabel}
            data-archive-position
          >
            {formatIndex(activeIndex)} / {formatIndex(total - 1)}
          </output>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className={styles.archiveViewport}
        role="region"
        aria-label={copy.carouselLabel}
        data-archive-scroller
        data-scroll-reveal-group="media"
        onScroll={updateActiveIndex}
      >
        <div className={styles.archiveTrack}>
          {parsedEntries.map((entry, index) => {
            if (entry.kind === 'draft-slot') {
              const cardClass = cardClasses[entry.layoutIndex];
              const media = draftPreviewMedia[entry.layoutIndex];
              return (
                <article
                  key={entry.key}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className={`${styles.archiveItem} ${cardClass}`}
                  data-publication-state="draft"
                  data-archive-slot={entry.layoutIndex + 1}
                  data-archive-card
                  data-active={activeIndex === index ? 'true' : 'false'}
                >
                  <figure className={styles.archiveDraft}>
                    <div className={styles.archiveStage}>
                      {/* Development-only composition reference, blocked by publication validation. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={withBasePath(media.src)}
                        width={media.width}
                        height={media.height}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        data-placeholder-media
                      />
                      <span className={styles.archivePlaceholderLabel}>
                        {copy.placeholderLabel}
                      </span>
                    </div>
                    <figcaption>
                      <strong>{formatIndex(entry.layoutIndex)}</strong>
                      <p>{copy.draftSlot}</p>
                    </figcaption>
                  </figure>
                </article>
              );
            }

            const company = entry.company[locale];
            const primaryTitle = entry.title.primary[locale];
            const secondaryTitle = entry.title.secondary?.[locale];
            const eyebrow = entry.title.eyebrow?.[locale];
            const supporting = entry.title.supporting?.[locale];
            const description = entry.description[locale];
            const start = entry.period.start;
            const end = entry.period.end;
            const alt = entry.image.alt[locale];
            const gallery = entry.gallery?.map((image) => ({
              src: withBasePath(image.src),
              width: image.width,
              height: image.height,
              alt: image.alt[locale],
            }));
            return (
              <article
                key={entry.key}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className={`${styles.archiveItem} ${styles.archiveReal}`}
                data-archive-card
                data-cover-variant={entry.coverVariant}
                data-active={activeIndex === index ? 'true' : 'false'}
              >
                <div className={styles.archiveStage}>
                  <Lightbox
                    variant="archive"
                    src={withBasePath(entry.image.src)}
                    width={entry.image.width}
                    height={entry.image.height}
                    alt={alt}
                    triggerLabel={`${copy.openImage}: ${primaryTitle}`}
                    dialogLabel={`${copy.imageDialog}: ${primaryTitle}`}
                    closeLabel={copy.closeImage}
                    gallery={gallery}
                    previousLabel={copy.previousImage}
                    nextLabel={copy.nextImage}
                    positionLabel={copy.galleryPosition}
                    errorLabel={copy.imageUnavailable}
                  />
                  <div className={styles.archiveCoverIndex}>
                    <span>{company}</span>
                    <span aria-hidden="true"> / </span>
                    <span className={styles.archivePeriod} data-archive-period>
                      <time dateTime={start.dateTime}>{start.label[locale]}</time>
                      {end ? (
                        <>
                          <span aria-hidden="true">–</span>
                          <time dateTime={end.dateTime}>{end.label[locale]}</time>
                        </>
                      ) : null}
                    </span>
                  </div>
                  <div className={styles.archiveCoverTitle}>
                    {eyebrow ? <span className={styles.archiveEyebrow}>{eyebrow}</span> : null}
                    <h3>
                      <span>{primaryTitle}</span>
                      {secondaryTitle ? <span>{secondaryTitle}</span> : null}
                    </h3>
                    {supporting ? (
                      <p className={styles.archiveSupporting}>{supporting}</p>
                    ) : null}
                  </div>
                </div>
                <div className={styles.archiveFacts}>
                  <p className={styles.archiveDescription}>{description}</p>
                  <div className={styles.archiveSkills} data-archive-skills>
                    <span>{copy.skillsLabel}</span>
                    <ul>
                      {entry.skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
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
      </div>
    </section>
  );
}
