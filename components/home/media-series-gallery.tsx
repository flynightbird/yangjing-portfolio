'use client';

import { X } from 'lucide-react';
import { type MouseEvent, useEffect, useRef, useState } from 'react';

import { Lightbox } from '@/components/media/lightbox';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import {
  mediaSeries,
  mediaSeriesSchema,
  type MediaSeries,
} from '@/content/home';
import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';
import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

import styles from './media-series-gallery.module.css';

interface MediaSeriesGalleryProps {
  readonly locale: Locale;
  readonly series?: readonly MediaSeries[];
}

interface VideoLightboxProps {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly label: string;
  readonly closeLabel: string;
  readonly blurWatermarks?: boolean;
  readonly cropBlockPercent?: number;
  readonly clone?: boolean;
  readonly active: boolean;
}

function WatermarkBlur() {
  return (
    <>
      <span className={`${styles.watermarkBlur} ${styles.watermarkTopLeft}`} />
      <span className={`${styles.watermarkBlur} ${styles.watermarkBottomRight}`} />
    </>
  );
}

function VideoLightbox({
  src,
  width,
  height,
  label,
  closeLabel,
  blurWatermarks = false,
  cropBlockPercent = 0,
  clone = false,
  active,
}: VideoLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerVideoRef = useRef<HTMLVideoElement>(null);
  const dialogVideoRef = useRef<HTMLVideoElement>(null);
  const previousOverflowRef = useRef('');
  const reduceMotion = useReducedMotionPreference();
  const visibleHeight = height * (1 - cropBlockPercent / 50);
  const videoStyle = cropBlockPercent
    ? {
        height: `${100 / (1 - cropBlockPercent / 50)}%`,
        transform: `translateY(-${cropBlockPercent}%)`,
      }
    : undefined;

  useEffect(() => {
    const video = triggerVideoRef.current;
    if (!video) return;

    if (!active || reduceMotion) {
      video.pause();
      return;
    }

    void video.play().catch(() => undefined);
  }, [active, reduceMotion]);

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    void dialogVideoRef.current?.play();
  };

  const closeDialog = () => {
    dialogVideoRef.current?.pause();
    dialogRef.current?.close();
  };

  const restorePage = () => {
    document.body.style.overflow = previousOverflowRef.current;
  };

  const closeFromBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeDialog();
  };

  return (
    <>
      <button
        className={styles.mediaTrigger}
        type="button"
        aria-label={label}
        aria-hidden={clone ? 'true' : undefined}
        tabIndex={clone ? -1 : undefined}
        onClick={openDialog}
      >
        <video
          ref={triggerVideoRef}
          src={src}
          width={width}
          height={height}
          autoPlay={active && !reduceMotion}
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          style={videoStyle}
          onLoadedData={(event) => {
            if (active && !reduceMotion) {
              void event.currentTarget.play().catch(() => undefined);
            }
          }}
        />
        {blurWatermarks ? <WatermarkBlur /> : null}
      </button>
      <dialog
        ref={dialogRef}
        className={styles.videoDialog}
        aria-label={label}
        onClick={closeFromBackdrop}
        onClose={restorePage}
      >
        <div className={styles.videoDialogSurface}>
          <button
            className={styles.videoClose}
            type="button"
            aria-label={closeLabel}
            onClick={closeDialog}
          >
            <X aria-hidden="true" size={22} />
          </button>
          <div
            className={styles.videoStage}
            style={{ aspectRatio: `${width} / ${visibleHeight}` }}
          >
            <video
              ref={dialogVideoRef}
              src={src}
              width={width}
              height={height}
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="metadata"
              style={videoStyle}
            />
            {blurWatermarks ? <WatermarkBlur /> : null}
          </div>
        </div>
      </dialog>
    </>
  );
}

function CreativeSeriesRow({
  entry,
  locale,
}: {
  readonly entry: MediaSeries;
  readonly locale: Locale;
}) {
  const copy = locale === 'zh'
    ? zhDictionary.home.mediaSeries
    : enDictionary.home.mediaSeries;
  const rowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entryState]) => setActive(entryState?.isIntersecting ?? false),
      { threshold: 0.15 },
    );
    observer.observe(row);

    return () => observer.disconnect();
  }, []);

  const renderSequence = (clone: boolean) => (
    <div
      className={styles.sequence}
      data-marquee-copy={clone ? 'clone' : 'primary'}
      aria-hidden={clone ? 'true' : undefined}
    >
      {entry.items.map((item) => {
        const src = withBasePath(item.src);
        const openLabel = `${copy.openMedia}: ${item.alt[locale]}`;

        return (
          <figure
            className={styles.item}
            key={`${item.key}-${clone ? 'clone' : 'primary'}`}
            data-series-item
            data-series-row={entry.row}
            data-series-slot={item.slot}
            data-slot-id={item.key}
          >
            <div className={styles.frame}>
              {item.kind === 'video' ? (
                <VideoLightbox
                  src={src}
                  width={item.width}
                  height={item.height}
                  label={openLabel}
                  closeLabel={copy.closeMedia}
                  blurWatermarks={item.blurWatermarks}
                  cropBlockPercent={item.cropBlockPercent}
                  clone={clone}
                  active={active}
                />
              ) : (
                <Lightbox
                  variant="creative"
                  src={src}
                  width={item.width}
                  height={item.height}
                  alt={item.alt[locale]}
                  triggerLabel={openLabel}
                  dialogLabel={`${copy.mediaDialog}: ${item.alt[locale]}`}
                  closeLabel={copy.closeMedia}
                  errorLabel={copy.imageUnavailable}
                  triggerTabIndex={clone ? -1 : undefined}
                  triggerAriaHidden={clone}
                />
              )}
            </div>
          </figure>
        );
      })}
    </div>
  );

  return (
    <div
      ref={rowRef}
      className={styles.series}
      role="region"
      aria-label={`${copy.regionLabel} ${entry.row}`}
      data-media-series={entry.key}
      data-row={entry.row}
      data-direction={entry.row % 2 === 1 ? 'left' : 'right'}
      data-in-view={active ? 'true' : 'false'}
    >
      <div className={styles.track}>
        {renderSequence(false)}
        {renderSequence(true)}
      </div>
    </div>
  );
}

export function MediaSeriesGallery({
  locale,
  series = mediaSeries,
}: MediaSeriesGalleryProps) {
  const parsedSeries = series.map((entry) => mediaSeriesSchema.parse(entry));
  const copy = locale === 'zh'
    ? zhDictionary.home.mediaSeries
    : enDictionary.home.mediaSeries;

  return (
    <section
      className={styles.gallery}
      aria-labelledby="media-series-title"
      data-media-series-gallery
    >
      <header className={styles.heading} data-scroll-reveal-group="text">
        <h2 id="media-series-title">{copy.title}</h2>
      </header>

      <div className={styles.seriesList} data-scroll-reveal-group="media">
        {parsedSeries.map((entry) => (
          <CreativeSeriesRow key={entry.key} entry={entry} locale={locale} />
        ))}
      </div>
    </section>
  );
}
