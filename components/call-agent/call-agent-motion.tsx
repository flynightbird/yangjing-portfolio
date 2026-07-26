'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type ReactNode, useRef } from 'react';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function CallAgentMotion({ children }: { readonly children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = gsap.matchMedia();
    media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const hero = rootRef.current?.querySelector('[data-call-agent-hero]');
      if (hero) {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from(hero.querySelectorAll('[data-hero-copy] > *'), { autoAlpha: 0, y: 22, duration: .68, stagger: .06 })
          .from(hero.querySelector('[data-call-agent-browser]'), { autoAlpha: 0, y: 28, scale: .96, duration: .8 }, '-=.42');
      }
      gsap.utils.toArray<HTMLElement>('[data-case-study] > section', rootRef.current).forEach((section) => {
        gsap.from(section.querySelectorAll(':scope > *'), { autoAlpha: 0, y: 26, duration: .66, stagger: .04, scrollTrigger: { trigger: section, start: 'top 84%', once: true } });
      });
      const words = rootRef.current?.querySelectorAll<HTMLElement>('[data-productization-word]');
      if (words?.length) gsap.fromTo(words, { opacity: .2 }, { opacity: 1, stagger: .08, scrollTrigger: { trigger: words[0].parentElement, start: 'top 80%', end: 'bottom 50%', scrub: true } });
    });
    return () => media.revert();
  }, { scope: rootRef });
  return <div ref={rootRef} data-call-agent-motion>{children}</div>;
}
