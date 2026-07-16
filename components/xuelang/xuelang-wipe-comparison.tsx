'use client';

import { MoveHorizontal } from 'lucide-react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { useState } from 'react';

import styles from './xuelang-wipe-comparison.module.css';

export interface XuelangWipeImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly label: string;
  readonly caption: string;
}

interface XuelangWipeComparisonProps {
  readonly before: XuelangWipeImage;
  readonly after: XuelangWipeImage;
  readonly controlLabel: string;
}

const MIN_POSITION = 4;
const MAX_POSITION = 96;
const INITIAL_POSITION = 38;
const KEYBOARD_STEP = 3;

function clampPosition(value: number) {
  return Math.min(MAX_POSITION, Math.max(MIN_POSITION, value));
}

export function XuelangWipeComparison({
  before,
  after,
  controlLabel,
}: XuelangWipeComparisonProps) {
  const [position, setPosition] = useState(INITIAL_POSITION);
  const style = { '--wipe-position': `${position}%` } as CSSProperties;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    let nextPosition: number | undefined;

    if (event.key === 'ArrowLeft') nextPosition = position - KEYBOARD_STEP;
    if (event.key === 'ArrowRight') nextPosition = position + KEYBOARD_STEP;
    if (event.key === 'Home') nextPosition = MIN_POSITION;
    if (event.key === 'End') nextPosition = MAX_POSITION;
    if (nextPosition === undefined) return;

    event.preventDefault();
    setPosition(clampPosition(nextPosition));
  }

  return (
    <div className={styles.root} data-wipe-comparison>
      <div
        className={styles.interactive}
        data-wipe-interactive
        style={style}
      >
        <div className={styles.viewport}>
          <img
            className={styles.afterImage}
            src={after.src}
            width={after.width}
            height={after.height}
            alt={after.alt}
            draggable={false}
          />
          <img
            className={styles.beforeImage}
            src={before.src}
            width={before.width}
            height={before.height}
            alt={before.alt}
            draggable={false}
          />
          <span className={`${styles.label} ${styles.beforeLabel}`}>
            {before.label}
          </span>
          <span className={`${styles.label} ${styles.afterLabel}`}>
            {after.label}
          </span>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.handle} aria-hidden="true">
            <MoveHorizontal size={19} strokeWidth={1.8} />
          </span>
          <input
            className={styles.control}
            type="range"
            min={MIN_POSITION}
            max={MAX_POSITION}
            step={1}
            value={position}
            aria-label={controlLabel}
            aria-valuenow={position}
            onChange={(event) => setPosition(clampPosition(Number(event.target.value)))}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className={styles.captions}>
          <div>
            <strong>{before.label}</strong>
            <p>{before.caption}</p>
          </div>
          <div>
            <strong>{after.label}</strong>
            <p>{after.caption}</p>
          </div>
        </div>
      </div>

      <div className={styles.printPair} data-wipe-print-pair aria-hidden="true">
        {[before, after].map((image) => (
          <figure key={image.src}>
            <strong>{image.label}</strong>
            <img
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt}
            />
            <figcaption>{image.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
