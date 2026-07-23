'use client';

import { useEffect } from 'react';

export function ConvoAiToneController() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-convo-nav-tone]'),
    );
    if (!sections.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter(({ isIntersecting }) => isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const tone = active?.target.getAttribute('data-convo-nav-tone');
        if (tone === 'light' || tone === 'dark') {
          window.dispatchEvent(new CustomEvent('portfolio-nav-tone', { detail: tone }));
        }
      },
      { rootMargin: '-18% 0px -70% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return null;
}
