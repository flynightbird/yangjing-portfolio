'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type ReactNode, useRef } from 'react';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function ConvoAiMotion({ children }: { readonly children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = gsap.matchMedia();

    media.add('(min-width: 1100px) and (prefers-reduced-motion: no-preference)', () => {
      const hero = rootRef.current?.querySelector<HTMLElement>('[data-convo-ai-stage][data-hero="true"]');
      const web = hero?.querySelector<HTMLElement>('[data-convo-web-plane]');
      const phone = hero?.querySelector<HTMLElement>('[data-convo-app-device]');
      if (hero && web && phone) {
        gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: 'top top+=64',
            end: '+=65%',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
          },
        })
          .to(web, { yPercent: -5, scale: 1.025, rotateZ: 0, ease: 'none' }, 0)
          .to(phone, { yPercent: -14, rotateZ: -1, ease: 'none' }, 0);
      }

      const realtime = rootRef.current?.querySelector<HTMLElement>('[data-convo-realtime]');
      const realtimeMedia = realtime?.querySelector<HTMLElement>('[data-realtime-media]');
      const stages = realtime?.querySelectorAll<HTMLElement>('[data-realtime-stage]');
      if (realtime && realtimeMedia && stages?.length) {
        ScrollTrigger.create({
          trigger: realtime,
          start: 'top top+=96',
          end: 'bottom bottom-=80',
          pin: realtimeMedia,
          pinSpacing: false,
          anticipatePin: 1,
        });
        stages.forEach((stage) => {
          gsap.fromTo(stage, { autoAlpha: 0.22, x: 24 }, {
            autoAlpha: 1,
            x: 0,
            ease: 'none',
            scrollTrigger: { trigger: stage, start: 'top 72%', end: 'top 38%', scrub: true },
          });
        });
      }

      rootRef.current?.querySelectorAll<HTMLElement>('.reading .lead').forEach((lead) => {
        gsap.fromTo(lead, { autoAlpha: 0.24, y: 24 }, {
          autoAlpha: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: lead, start: 'top 88%', end: 'top 56%', scrub: true },
        });
      });
    });

    media.add('(max-width: 1099px) and (prefers-reduced-motion: no-preference)', () => {
      rootRef.current?.querySelectorAll<HTMLElement>('[data-case-study] section').forEach((section) => {
        gsap.from(section.children, {
          autoAlpha: 0,
          y: 20,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.04,
          scrollTrigger: { trigger: section, start: 'top 88%', once: true },
        });
      });
    });

    let cancelled = false;
    const ready = document.fonts?.ready ?? Promise.resolve();
    void ready.then(() => { if (!cancelled) ScrollTrigger.refresh(); });
    return () => { cancelled = true; media.revert(); };
  }, { scope: rootRef });

  return <div ref={rootRef} data-convo-ai-motion>{children}</div>;
}
