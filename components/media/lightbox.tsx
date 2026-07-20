'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import styles from './lightbox.module.css';

export interface LightboxMedia {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

export type LightboxVariant = 'default' | 'archive';

interface LightboxProps {
  readonly variant?: LightboxVariant;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly gallery?: readonly LightboxMedia[];
  readonly triggerLabel: string;
  readonly dialogLabel: string;
  readonly closeLabel: string;
  readonly previousLabel?: string;
  readonly nextLabel?: string;
  readonly positionLabel?: string;
  readonly errorLabel?: string;
  readonly expandLabel?: string;
}

const subscribeToHydration = () => () => {};
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const isVisibleFocusable = (element: HTMLElement) => {
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const { display, visibility } = window.getComputedStyle(current);
    if (display === 'none' || visibility === 'hidden' || visibility === 'collapse') {
      return false;
    }
  }

  return true;
};

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
    ),
  );
};

export function Lightbox({
  variant = 'default',
  src,
  width,
  height,
  alt,
  gallery,
  triggerLabel,
  dialogLabel,
  closeLabel,
  previousLabel,
  nextLabel,
  positionLabel,
  errorLabel,
  expandLabel,
}: LightboxProps) {
  const resolvedExpandLabel = expandLabel
    ?? (/[㐀-鿿]/u.test(triggerLabel) ? '放大' : 'Expand');
  const media = gallery?.length ? gallery : [{ src, width, height, alt }];
  const isGallery = media.length > 1;
  const resolvedPreviousLabel = previousLabel ?? 'Previous image';
  const resolvedNextLabel = nextLabel ?? 'Next image';
  const resolvedPositionLabel = positionLabel ?? 'Image position';
  const resolvedErrorLabel = errorLabel ?? 'Image unavailable';
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousMediaLength, setPreviousMediaLength] = useState(media.length);
  const [failedSources, setFailedSources] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const openingTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const closingTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const closingRef = useRef(false);
  const previousOverflowRef = useRef('');
  const previousScrollPositionRef = useRef({ left: 0, top: 0 });
  const activeIndexRef = useRef(0);
  const dialogTitleId = useId();

  if (previousMediaLength !== media.length) {
    const nextIndex = Math.min(activeIndex, media.length - 1);
    setPreviousMediaLength(media.length);
    setActiveIndex(nextIndex);
  }

  const clampedActiveIndex = Math.min(activeIndex, media.length - 1);
  const activeMedia = media[clampedActiveIndex];
  const position = `${String(clampedActiveIndex + 1).padStart(2, '0')} / ${String(media.length).padStart(2, '0')}`;

  const finishClosing = useCallback(() => {
    openingTimelineRef.current?.kill();
    closingTimelineRef.current?.kill();
    openingTimelineRef.current = null;
    closingTimelineRef.current = null;
    closingRef.current = false;
    activeIndexRef.current = 0;
    setActiveIndex(0);
    setOpen(false);
  }, []);

  const closeDialog = useCallback(() => {
    const reduceMotion =
      typeof window.matchMedia !== 'function'
      || window.matchMedia(reducedMotionQuery).matches;

    if (variant !== 'archive') {
      finishClosing();
      return;
    }

    if (reduceMotion) {
      finishClosing();
      return;
    }

    if (closingRef.current) return;
    closingRef.current = true;
    openingTimelineRef.current?.kill();

    const railChildren = railRef.current
      ? Array.from(railRef.current.children)
      : [];
    const timeline = gsap.timeline({ onComplete: finishClosing });
    closingTimelineRef.current = timeline;
    if (railChildren.length) {
      timeline.to(railChildren, {
        opacity: 0,
        y: 6,
        duration: 0.1,
        stagger: { each: 0.02, from: 'end' },
      }, 0);
    }
    timeline
      .to(surfaceRef.current, {
        opacity: 0,
        y: 12,
        scale: 0.99,
        duration: 0.18,
        ease: 'power2.in',
      }, 0)
      .to(dialogRef.current, {
        opacity: 0,
        duration: 0.18,
        ease: 'power1.in',
      }, 0);
  }, [finishClosing, variant]);

  const moveToIndex = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(index, media.length - 1));
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }, [media.length]);

  const markSourceAsFailed = (failedSource: string) => {
    setFailedSources((sources) => {
      if (sources.has(failedSource)) return sources;
      return new Set(sources).add(failedSource);
    });
  };

  useEffect(() => {
    activeIndexRef.current = clampedActiveIndex;
  }, [clampedActiveIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousOverflowRef.current = document.body.style.overflow;
    previousScrollPositionRef.current = {
      left: window.scrollX,
      top: window.scrollY,
    };
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const returnFocusTo = triggerRef.current;

    return () => {
      document.body.style.overflow = previousOverflowRef.current;
      returnFocusTo?.focus({ preventScroll: true });
      const { left, top } = previousScrollPositionRef.current;
      if (window.scrollX !== left || window.scrollY !== top) {
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(left, top);
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
        return;
      }

      const dialog = dialogRef.current;
      const canNavigateWithArrow =
        isGallery &&
        dialog?.contains(event.target as Node) &&
        !isEditableTarget(event.target) &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey;
      const currentIndex = Math.min(activeIndexRef.current, media.length - 1);

      if (canNavigateWithArrow && event.key === 'ArrowLeft' && currentIndex > 0) {
        event.preventDefault();
        moveToIndex(currentIndex - 1);
        return;
      }

      if (
        canNavigateWithArrow
        && event.key === 'ArrowRight'
        && currentIndex < media.length - 1
      ) {
        event.preventDefault();
        moveToIndex(currentIndex + 1);
        return;
      }

      if (event.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(focusableSelector),
        ).filter(
          (element) =>
            !element.hasAttribute('hidden') &&
            element.getAttribute('aria-hidden') !== 'true' &&
            isVisibleFocusable(element),
        );
        const first = focusable[0];
        const last = focusable.at(-1);
        const active = document.activeElement;

        if (!first || !last) {
          event.preventDefault();
          dialog.focus();
        } else if (
          focusable.length === 1 ||
          !dialog.contains(active) ||
          (event.shiftKey && active === first) ||
          (!event.shiftKey && active === last)
        ) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDialog, isGallery, media.length, moveToIndex, open]);

  useGSAP(
    () => {
      if (
        !open
        || variant !== 'archive'
        || typeof window.matchMedia !== 'function'
        || window.matchMedia(reducedMotionQuery).matches
      ) {
        return;
      }

      closingRef.current = false;
      const railChildren = railRef.current
        ? Array.from(railRef.current.children)
        : [];
      const timeline = gsap.timeline();
      openingTimelineRef.current = timeline;
      timeline
        .from(dialogRef.current, {
          opacity: 0,
          duration: 0.22,
          ease: 'power1.out',
        })
        .from(surfaceRef.current, {
          opacity: 0,
          y: 16,
          scale: 0.985,
          duration: 0.42,
          ease: 'power3.out',
        }, 0.04);
      if (railChildren.length) {
        timeline.from(railChildren, {
          opacity: 0,
          y: 8,
          stagger: 0.04,
          duration: 0.18,
        }, 0.24);
      }

      return () => {
        timeline.kill();
        closingTimelineRef.current?.kill();
        closingTimelineRef.current = null;
        closingRef.current = false;
        if (openingTimelineRef.current === timeline) {
          openingTimelineRef.current = null;
        }
      };
    },
    { dependencies: [open, variant], revertOnUpdate: true },
  );

  const closeButton = (
    <button
      ref={closeRef}
      className={styles.close}
      type="button"
      aria-label={closeLabel}
      onClick={closeDialog}
    >
      <X aria-hidden="true" size={24} />
    </button>
  );
  const galleryMeta = isGallery ? (
    <div className={styles.galleryMeta}>
      <span
        className={styles.galleryCounter}
        role="status"
        aria-label={`${resolvedPositionLabel}: ${position}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {position}
      </span>
      <div className={styles.galleryControls}>
        <button
          className={styles.galleryControl}
          type="button"
          aria-label={resolvedPreviousLabel}
          disabled={clampedActiveIndex === 0}
          onClick={() => moveToIndex(clampedActiveIndex - 1)}
        >
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <button
          className={styles.galleryControl}
          type="button"
          aria-label={resolvedNextLabel}
          disabled={clampedActiveIndex === media.length - 1}
          onClick={() => moveToIndex(clampedActiveIndex + 1)}
        >
          <ArrowRight aria-hidden="true" size={20} />
        </button>
      </div>
    </div>
  ) : null;
  const galleryContent = (
    <div className={styles.gallery} data-lightbox-gallery>
      <div className={styles.desktopGallery} data-gallery-desktop>
        {failedSources.has(activeMedia.src) ? (
          <p className={styles.mediaError} role="status">
            {resolvedErrorLabel}
          </p>
        ) : (
          // Preserve the verified evidence file and its intrinsic dimensions.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.desktopMedia}
            src={activeMedia.src}
            width={activeMedia.width}
            height={activeMedia.height}
            alt={activeMedia.alt}
            onError={() => markSourceAsFailed(activeMedia.src)}
          />
        )}
      </div>
      <div className={styles.mobileGallery} data-gallery-mobile>
        {media.map((item, index) =>
          failedSources.has(item.src) ? (
            <p className={styles.mediaError} role="status" key={item.src}>
              {resolvedErrorLabel}
            </p>
          ) : (
            // Preserve the verified evidence file and its intrinsic dimensions.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.mobileMedia}
              key={item.src}
              src={item.src}
              width={item.width}
              height={item.height}
              alt={item.alt}
              loading={index === 0 ? undefined : 'lazy'}
              onError={() => markSourceAsFailed(item.src)}
            />
          ),
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-label={triggerLabel}
        data-hydrated={hydrated ? 'true' : 'false'}
        onClick={() => {
          activeIndexRef.current = 0;
          setActiveIndex(0);
          setOpen(true);
        }}
      >
        {/* Preserve the verified evidence file and its intrinsic dimensions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={width} height={height} alt={alt} loading="lazy" />
        <span className={styles.expandCue} data-expand-cue aria-hidden="true">
          <Maximize2 size={15} strokeWidth={1.8} />
          <span>{resolvedExpandLabel}</span>
        </span>
      </button>
      {open
        ? createPortal(
            <div
              ref={dialogRef}
              className={`${styles.backdrop} ${
                variant === 'archive' ? styles.archiveBackdrop : ''
              }`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              data-lightbox-variant={variant}
              tabIndex={-1}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeDialog();
                }
              }}
            >
              <div
                ref={surfaceRef}
                className={`${styles.surface} ${
                  variant === 'archive' ? styles.archiveSurface : ''
                }`}
                data-gallery-stage={variant === 'archive' ? 'true' : undefined}
              >
                {variant === 'archive' ? (
                  <>
                    {galleryContent}
                    <aside
                      ref={railRef}
                      className={styles.archiveRail}
                      data-lightbox-rail
                      aria-label={dialogLabel}
                    >
                      {closeButton}
                      <h2 className={styles.galleryTitle} id={dialogTitleId}>
                        {dialogLabel}
                      </h2>
                      {galleryMeta}
                    </aside>
                  </>
                ) : (
                  <>
                    {closeButton}
                    <div className={styles.galleryHeader}>
                      <h2 className={styles.galleryTitle} id={dialogTitleId}>
                        {dialogLabel}
                      </h2>
                      {galleryMeta}
                    </div>
                    {galleryContent}
                  </>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
