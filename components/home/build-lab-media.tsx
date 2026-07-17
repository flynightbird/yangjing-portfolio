'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import type { PointerEvent } from 'react';

import styles from './home.module.css';

interface BuildLabMediaProps {
  readonly href: string;
}

export function BuildLabMedia({ href }: BuildLabMediaProps) {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 150, damping: 22, mass: 0.7 });
  const y = useSpring(rawY, { stiffness: 150, damping: 22, mass: 0.7 });

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion || event.pointerType === 'touch') return;

    const rect = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - rect.left) / rect.width - 0.5) * 20);
    rawY.set(((event.clientY - rect.top) / rect.height - 0.5) * 12);
  };

  const resetPosition = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <a
      className={styles.buildMedia}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the interactive STT Demo in a new tab"
      data-stt-media-stage
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      onBlur={resetPosition}
    >
      <motion.div
        className={styles.buildBrowserWindow}
        data-stt-browser-window
        style={{ x, y }}
      >
        <span className={styles.buildBrowserChrome} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {/* This image is rendered from the pinned local STT Demo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/stt-demo/stt-product-stage@2x.png"
          width={1266}
          height={1120}
          alt="STT Demo product stage showing a speaker, bilingual transcript, translation, and participants"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      </motion.div>
    </a>
  );
}
