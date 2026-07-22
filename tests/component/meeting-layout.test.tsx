import { readFileSync } from 'node:fs';

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { MeetingLayoutView } from '@/components/meeting/meeting-layout';
import type { ContentMeta } from '@/content/schema';

const meta: ContentMeta = {
  type: 'work',
  slug: 'meeting',
  locale: 'en',
  translationKey: 'work.meeting',
  title: 'Agora Meeting',
  proposition: 'Building a scalable meeting experience across Desktop, Web, Tablet, and Mobile with adaptive layouts, AI-powered transcription, and collaborative workflows.',
  role: 'Sole Product Designer',
  duration: '2024-2026 · 1.5 years',
  status: 'Shipped',
  disclosure: 'This case shows shipped product interfaces. Final product recordings remain pending source inspection. No quantitative adoption or satisfaction metrics are claimed.',
  heroMedia: '/images/meeting/meeting-hero.webp',
  evidenceLevel: 'delivered',
  featuredOrder: 3,
  previousSlug: 'call-agent',
  nextSlug: 'stt-demo',
  chapters: [{ id: 'product-overview', label: 'Product overview' }],
};

it('presents a clean static Product Film cold open with scope and chapter navigation', () => {
  render(
    <MeetingLayoutView meta={meta} locale="en" filmReady={false}>
      <section id="product-overview">Overview</section>
    </MeetingLayoutView>,
  );

  expect(screen.getByRole('heading', { level: 1, name: 'Agora Meeting' })).toBeVisible();
  expect(screen.getByRole('heading', { level: 1 }).querySelector('br')).toBeNull();
  expect(screen.getByTestId('meeting-scope-line')).toHaveTextContent(
    'Sole Product Designer · 2024-2026 · 1.5 years · Desktop · Web · Tablet · Mobile · Shipped',
  );
  const hero = screen.getByRole('img', { name: /Agora Meeting desktop stage/i });
  expect(hero).toBeVisible();
  expect(hero).toHaveAttribute('src', '/images/meeting/meeting-hero.webp');
  expect(document.querySelector('[data-meeting-cold-open]')).toHaveAttribute(
    'data-film-state',
    'static',
  );
  expect(document.querySelector('[data-meeting-film-ready]')).toHaveAttribute(
    'data-meeting-film-ready',
    'false',
  );
  expect(document.querySelector('[data-film-static-fallback]')).not.toBeNull();
  expect(document.querySelector('[data-meeting-cold-open] video')).toBeNull();
  expect(document.querySelector('[data-meeting-frame]')).not.toBeNull();
  expect(document.querySelector('[data-meeting-hero]')).not.toBeNull();
  expect(document.querySelector('[data-meeting-content]')).not.toBeNull();
  expect(document.querySelector('[data-meeting-disclosure]')).toBeNull();
  expect(document.body).not.toHaveTextContent(/pending source inspection|Evidence boundary/i);
  const chapterControl = document.querySelector('[data-case-web-control]');
  expect(chapterControl).toHaveAttribute('data-compact-at', 'default');
  expect(screen.getByRole('navigation', { name: 'Case study chapters' })).toBeVisible();
  expect(screen.getByText('01')).toBeVisible();
});

it.each(['en', 'zh'] as const)('omits disclosures and project neighbors in %s rendering', (locale) => {
  const { container } = render(
    <MeetingLayoutView
      meta={{ ...meta, locale }}
      locale={locale}
      filmReady={false}
      previous={{ href: `/${locale}/work/call-agent/`, title: 'Call Agent' }}
      next={{ href: `/${locale}/work/stt-demo/`, title: 'STT Demo' }}
    >
      <section>Overview</section>
    </MeetingLayoutView>,
  );

  expect(container.querySelector('[data-meeting-disclosure]')).toBeNull();
  expect(container.querySelector('[data-project-previous]')).toBeNull();
  expect(container.querySelector('[data-project-next]')).toBeNull();
  expect(container).not.toHaveTextContent(
    /Evidence boundary|证据边界|Previous project|Next project|上一个项目|下一个项目/i,
  );
});

it('prevents forced word breaks and gives chapter links explicit light-theme ink', () => {
  const layoutStyles = readFileSync(
    'components/meeting/meeting-layout.module.css',
    'utf8',
  );
  const chapterStyles = readFileSync(
    'components/case-study/chapter-nav.module.css',
    'utf8',
  );

  expect(layoutStyles).toMatch(/word-break:\s*normal/);
  expect(layoutStyles).toMatch(/overflow-wrap:\s*break-word/);
  expect(layoutStyles).toMatch(/text-wrap:\s*balance/);
  expect(chapterStyles).toMatch(/--chapter-link-color:\s*#[0-9a-f]{6}/i);
  expect(chapterStyles).toMatch(/color:\s*var\(--chapter-link-color\)/);
});

it('resets Meeting chapter controls to dark ink on the compact light surface', () => {
  const layoutStyles = readFileSync(
    'components/meeting/meeting-layout.module.css',
    'utf8',
  );

  expect(layoutStyles).toMatch(
    /@media\s*\(max-width:\s*900px\)[^{]*{[\s\S]*?\.rail\s+:global\(\[data-case-web-control\]\)\s*{[^}]*--chapter-link-color:\s*var\(--meeting-paper-ink\)[^}]*color:\s*var\(--meeting-paper-ink\)/s,
  );
  expect(layoutStyles).toMatch(
    /@media\s*\(max-width:\s*900px\)[^{]*{[\s\S]*?\.rail\s+:global\(\[data-case-web-control\]\s+(?:button|\.\w+)\)[^{]*,[\s\S]*?color:\s*var\(--meeting-paper-ink\)/s,
  );
});

it('inherits the standard numbered chapter-link grid without Meeting-only overrides', () => {
  const layoutStyles = readFileSync(
    'components/meeting/meeting-layout.module.css',
    'utf8',
  );

  expect(layoutStyles).not.toMatch(
    /\.rail\s+:global\(\[data-case-web-control\]\s+nav\s+a\s+span\)\s*{[^}]*display:\s*none/s,
  );
  expect(layoutStyles).not.toMatch(
    /\.rail\s+:global\(\[data-case-web-control\]\s+nav\s+a\)\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
  );
  expect(layoutStyles).toMatch(
    /\.frame\s*{[^}]*--meeting-frame-gap:\s*var\(--space-6\)[^}]*grid-template-columns:\s*minmax\(9rem,\s*2fr\)\s+minmax\(0,\s*10fr\)/s,
  );
});

it('defines the dark film field, coral turn, and light evidence field without gradients', () => {
  const layoutStyles = readFileSync(
    'components/meeting/meeting-layout.module.css',
    'utf8',
  );

  expect(layoutStyles).toMatch(/--meeting-accent:\s*#e4583e/i);
  expect(layoutStyles).toMatch(/--meeting-film-field:\s*#080a0c/i);
  expect(layoutStyles).toMatch(/--meeting-film-ink:\s*#[0-9a-f]{6}/i);
  expect(layoutStyles).toMatch(/--meeting-paper:\s*#[0-9a-f]{6}/i);
  expect(layoutStyles).toMatch(
    /\[data-showcase-band\]\[id='the-turn'\]\s*{[^}]*background:\s*var\(--meeting-accent\)/s,
  );
  expect(layoutStyles).toMatch(
    /\[data-showcase-band\]\[id='system-reveal'\][^{]*,[\s\S]*?\[data-showcase-band\]\[id='reflection'\]\s*{[^}]*background:\s*var\(--meeting-paper\)/s,
  );
  expect(layoutStyles).not.toMatch(/gradient\s*\(/i);
});

it('breaks showcase fields to the viewport while keeping their content on the case grid', () => {
  const layoutStyles = readFileSync(
    'components/meeting/meeting-layout.module.css',
    'utf8',
  );

  expect(layoutStyles).toMatch(
    /\.frame\s*{[^}]*--meeting-frame-width:\s*min\(calc\(100vw\s*-\s*3rem\),\s*112rem\)/s,
  );
  expect(layoutStyles).toMatch(
    /\.frame\s*{[^}]*--meeting-case-offset:[^;]*var\(--meeting-frame-gutter\)[^;]*var\(--meeting-rail-track\)[^;]*var\(--meeting-frame-gap\)/s,
  );
  expect(layoutStyles).toMatch(
    /\.content\s*>\s*\[data-showcase-band\]\s*{[^}]*box-sizing:\s*border-box[^}]*width:\s*100vw[^}]*margin-inline-start:\s*calc\(-1\s*\*\s*var\(--meeting-case-offset\)\)[^}]*padding-inline:\s*var\(--meeting-case-offset\)\s+var\(--meeting-frame-gutter\)/s,
  );
  expect(layoutStyles).toMatch(
    /@media\s*\(max-width:\s*900px\)[^{]*{[\s\S]*?\.frame\s*{[^}]*--meeting-case-offset:\s*var\(--meeting-frame-gutter\)/s,
  );
  expect(layoutStyles).toMatch(
    /@media\s*\(max-width:\s*720px\)[^{]*{[\s\S]*?\.frame\s*{[^}]*--meeting-frame-width:\s*min\(calc\(100vw\s*-\s*2rem\),\s*48rem\)/s,
  );
  expect(layoutStyles).toMatch(/\.rail\s*{[^}]*position:\s*relative[^}]*z-index:\s*1/s);
});

it('uses the approved localized title and hero caption for ready-state opening media', () => {
  const layoutSource = readFileSync(
    'components/meeting/meeting-layout.tsx',
    'utf8',
  );

  expect(layoutSource).toContain("clipTitle: 'Agora Meeting product film opening'");
  expect(layoutSource).toContain("clipTitle: 'Agora Meeting 产品片开场'");
  expect(layoutSource).toContain('description={text.heroCaption}');
  expect(layoutSource).not.toContain('clipDescription:');
});

it('frames ready hero film as a muted browser recording without subtitle tracks', () => {
  const { container } = render(
    <MeetingLayoutView meta={meta} locale="en" filmReady>
      <section>Overview</section>
    </MeetingLayoutView>,
  );

  const frame = container.querySelector('[data-meeting-cold-open] [data-film-frame="browser"]');
  expect(frame).toBeInTheDocument();
  expect(frame?.querySelectorAll('[data-browser-dot]')).toHaveLength(3);
  expect(frame?.querySelector('video')).toHaveProperty('muted', true);
  expect(frame?.querySelector('track')).not.toBeInTheDocument();
});

it('bounds the hero and film acts while resetting short and mobile viewports', () => {
  const layoutStyles = readFileSync(
    'components/meeting/meeting-layout.module.css',
    'utf8',
  );

  expect(layoutStyles).toMatch(/--meeting-hero-target:\s*min\(82svh,\s*58rem\)/);
  expect(layoutStyles).toMatch(
    /\.hero\s*{[^}]*(?:height|max-height):\s*var\(--meeting-hero-target\)[^}]*}/s,
  );
  expect(layoutStyles).toMatch(
    /\.hero\s*{[^}]*grid-template-rows:[^}]*minmax\(0,\s*1fr\)[^}]*}/s,
  );
  expect(layoutStyles).toMatch(
    /\[data-showcase-band\]\[data-film-act\]\s*{[^}]*min-height:\s*min\(92svh,\s*60rem\)/s,
  );
  expect(layoutStyles).toMatch(
    /@media\s*\(max-height:\s*42rem\)\s*and\s*\(min-width:\s*721px\)[^{]*{[\s\S]*?\[data-showcase-band\]\[data-film-act\]\s*{[^}]*min-height:\s*auto/s,
  );
  expect(layoutStyles).toMatch(
    /@media\s*\(max-width:\s*720px\)[^{]*{[\s\S]*?\[data-showcase-band\]\[data-film-act\]\s*{[^}]*min-height:\s*auto/s,
  );
});

it('resets constrained geometry for print and short landscape viewports', () => {
  const layoutStyles = readFileSync(
    'components/meeting/meeting-layout.module.css',
    'utf8',
  );
  const printStyles = readFileSync(
    'components/meeting/meeting-print.css',
    'utf8',
  );

  expect(layoutStyles).toMatch(
    /@media\s*\(max-height:\s*42rem\)\s*and\s*\(min-width:\s*721px\)[^{]*{[\s\S]*?\.hero\s*{[^}]*height:\s*auto[^}]*grid-template-rows:\s*none/s,
  );
  expect(layoutStyles).toMatch(/@media\s*\(max-width:\s*900px\)/);
  expect(printStyles).toMatch(
    /\[data-meeting-frame\]\s*{[^}]*display:\s*block\s*!important[^}]*width:\s*100%\s*!important[^}]*padding:\s*0\s*!important/s,
  );
  expect(printStyles).toMatch(
    /\[data-meeting-hero\]\s*{[^}]*height:\s*auto\s*!important[^}]*grid-template-rows:\s*none\s*!important/s,
  );
  expect(printStyles).not.toContain('[data-meeting-deep-dive]');
  expect(printStyles).toMatch(
    /\[data-meeting-case\]\s+video[^}]*,[\s\S]*?\[data-meeting-case\]\s+button\s*{[^}]*display:\s*none\s*!important/s,
  );
  expect(printStyles).toMatch(
    /\[data-product-film-clip\]\s+img\[hidden\]\s*{[^}]*display:\s*block\s*!important/s,
  );
  expect(printStyles).toMatch(
    /\[data-product-film-chapter\]\s*{[^}]*min-height:\s*auto\s*!important[^}]*color:\s*#171717\s*!important[^}]*background:\s*#fff\s*!important/s,
  );
  expect(printStyles).toMatch(
    /\[data-product-film-chapter\]\s+:where\([^)]*a,[^)]*figcaption,[^)]*label,[^)]*summary,[^)]*dt,[^)]*dd,[^)]*\)\s*{[^}]*color:\s*#171717\s*!important/s,
  );
});
