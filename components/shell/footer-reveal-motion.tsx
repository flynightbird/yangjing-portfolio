'use client';

import { useEffect } from 'react';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const surfaceOverlap = 32;

export function FooterRevealMotion() {
  useEffect(() => {
    const homepage = document.querySelector<HTMLElement>('[data-homepage]');
    if (!homepage) return;

    const footer = document.querySelector<HTMLElement>('[data-site-footer]');
    if (!footer) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const footerBounds = footer.getBoundingClientRect();
      const homepageBounds = homepage.getBoundingClientRect();
      const distance = Math.min(
        window.innerHeight,
        Math.max(1, footerBounds.height - surfaceOverlap),
      );
      const progress = distance > 0
        ? clamp((window.innerHeight - homepageBounds.bottom) / distance)
        : 1;
      const maximumOffset = window.innerWidth <= 767 ? 4 : 8;

      footer.style.setProperty('--footer-reveal-progress', String(progress));
      footer.style.setProperty(
        '--footer-reveal-offset',
        `${(1 - progress) * maximumOffset}%`,
      );
    };

    const queueUpdate = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate);

    return () => {
      window.removeEventListener('scroll', queueUpdate);
      window.removeEventListener('resize', queueUpdate);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      footer.style.removeProperty('--footer-reveal-progress');
      footer.style.removeProperty('--footer-reveal-offset');
    };
  }, []);

  return null;
}
