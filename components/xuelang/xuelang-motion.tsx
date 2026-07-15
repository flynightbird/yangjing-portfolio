'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type ReactNode, useRef } from 'react';

import styles from './xuelang-layout.module.css';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function animateMetric(element: HTMLElement) {
  const original = element.textContent?.trim() ?? '';
  const match = original.match(/^([+-]?)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return;

  const [, prefix, number, suffix] = match;
  const target = Number(number);
  const decimals = number.includes('.') ? number.split('.')[1].length : 0;
  const proxy = { value: 0 };

  gsap.to(proxy, {
    value: target,
    duration: 1.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 88%',
      once: true,
    },
    onUpdate: () => {
      element.textContent = `${prefix}${proxy.value.toFixed(decimals)}${suffix}`;
    },
    onComplete: () => {
      element.textContent = original;
    },
  });
}

export function XuelangMotion({ children }: { readonly children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window.matchMedia !== 'function') return;

      const media = gsap.matchMedia();

      media.add(
        '(min-width: 768px) and (max-width: 1199px) and (prefers-reduced-motion: no-preference)',
        () => {
          gsap.utils.toArray<HTMLElement>(
            '[data-case-study] section',
            rootRef.current,
          ).forEach((section) => {
            const translatedChildren = Array.from(section.children).filter(
              (child): child is HTMLElement => (
                child instanceof HTMLElement && !child.matches('[data-learning-sequence]')
              ),
            );
            gsap.from(translatedChildren, {
              autoAlpha: 0,
              y: 28,
              clearProps: 'transform',
              duration: 0.65,
              ease: 'power2.out',
              stagger: 0.05,
              scrollTrigger: { trigger: section, start: 'top 84%', once: true },
            });
            const learningSequence = section.querySelector<HTMLElement>('[data-learning-sequence]');
            if (learningSequence) {
              gsap.from(learningSequence, {
                autoAlpha: 0,
                duration: 0.65,
                ease: 'power2.out',
                scrollTrigger: { trigger: section, start: 'top 84%', once: true },
              });
            }
          });
        },
      );

      media.add(
        '(min-width: 1200px) and (prefers-reduced-motion: no-preference)',
        () => {
          const hero = rootRef.current?.querySelector<HTMLElement>('[data-xuelang-hero]');
          const panorama = rootRef.current?.querySelector<HTMLElement>('[data-hero-panorama]');
          if (hero && panorama) {
            const copyElements = hero.querySelectorAll<HTMLElement>('p, h1, dl, a');
            const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
            timeline
              .from(copyElements, {
                autoAlpha: 0,
                y: 24,
                duration: 0.75,
                stagger: 0.055,
              })
              .from(
                panorama,
                { autoAlpha: 0, y: 30, scale: 1.035, duration: 0.85 },
                '-=0.48',
              );
          }

          gsap.utils.toArray<HTMLElement>(
            '[data-case-study] section',
            rootRef.current,
          ).forEach((section) => {
            const translatedChildren = Array.from(section.children).filter(
              (child): child is HTMLElement => (
                child instanceof HTMLElement && !child.matches('[data-learning-sequence]')
              ),
            );
            gsap.from(translatedChildren, {
              autoAlpha: 0,
              y: 34,
              clearProps: 'transform',
              duration: 0.72,
              ease: 'power2.out',
              stagger: 0.045,
              scrollTrigger: { trigger: section, start: 'top 82%', once: true },
            });
            const learningSequence = section.querySelector<HTMLElement>('[data-learning-sequence]');
            if (learningSequence) {
              gsap.from(learningSequence, {
                autoAlpha: 0,
                duration: 0.72,
                ease: 'power2.out',
                scrollTrigger: { trigger: section, start: 'top 82%', once: true },
              });
            }
          });

          const sequence = rootRef.current?.querySelector<HTMLElement>('[data-learning-sequence]');
          const thesis = sequence?.firstElementChild as HTMLElement | null;
          if (sequence && thesis) {
            ScrollTrigger.create({
              trigger: sequence,
              start: 'top 15%',
              end: '+=200%',
              pin: thesis,
              pinSpacing: false,
              anticipatePin: 1,
            });
          }

          rootRef.current
            ?.querySelectorAll<HTMLElement>('[data-result-metric] strong')
            .forEach(animateMetric);
        },
      );

      let cancelled = false;
      const images = Array.from(
        rootRef.current?.querySelectorAll<HTMLImageElement>('img') ?? [],
      );
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      const imagesReady = Promise.all(
        images.map((image) => (
          image.complete
            ? Promise.resolve()
            : image.decode().catch(() => undefined)
        )),
      );
      void Promise.all([fontsReady, imagesReady]).then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });

      return () => {
        cancelled = true;
        media.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={styles.motionRoot} data-xuelang-motion>
      {children}
    </div>
  );
}
