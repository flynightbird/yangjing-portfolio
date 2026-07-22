import { readFileSync } from 'node:fs';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  BreakoutDecisionEvidence,
  MeetingVideo,
  RoleBoundary,
} from '@/components/meeting/meeting-evidence';

afterEach(cleanup);

const evidenceStyles = readFileSync(
  'components/meeting/meeting-evidence.module.css',
  'utf8',
);

describe('MeetingVideo', () => {
  it('renders poster, localized captions, description, and a static fallback', () => {
    const { container } = render(
      <MeetingVideo
        src="/videos/meeting/adaptive-layout-demo.mp4"
        poster="/images/meeting/adaptive-layout-poster.webp"
        captions="/captions/meeting/adaptive-layout-demo.en.vtt"
        title="Adaptive stage transition"
        description="Gallery changes to focus and content share."
        fallback={{
          src: '/images/meeting/adaptive-layout-poster.webp',
          alt: 'Four shipped meeting-stage states',
        }}
        locale="en"
      />,
    );

    const video = container.querySelector('video');
    expect(video).toHaveAttribute('poster', '/images/meeting/adaptive-layout-poster.webp');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveProperty('muted', true);
    expect(video).toHaveAttribute('aria-describedby');
    expect(container.querySelector('track[kind="captions"]')).toHaveAttribute(
      'src',
      '/captions/meeting/adaptive-layout-demo.en.vtt',
    );
    expect(screen.getByRole('img', { name: 'Four shipped meeting-stage states' }))
      .toBeInTheDocument();
  });
});

describe('BreakoutDecisionEvidence', () => {
  it('presents implementable rules and links to the source artifact', () => {
    render(<BreakoutDecisionEvidence locale="en" />);

    expect(screen.getByRole('heading', { name: 'Breakout Room decision evidence' }))
      .toBeVisible();
    expect(screen.getByText(/50 groups/i)).toBeVisible();
    expect(screen.getByText(/24 characters/i)).toBeVisible();
    expect(screen.getByText(/disabled states/i)).toBeVisible();
    expect(screen.getByText(/empty group/i)).toBeVisible();
    expect(screen.getByText(/occupied group/i)).toBeVisible();
    expect(screen.queryByText(/designer-reported/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open decision artifact in Figma' }))
      .toHaveAttribute('href', expect.stringContaining('node-id=1-15037'));
  });
});

describe('RoleBoundary', () => {
  it('separates design ownership from cross-functional delivery', () => {
    const { container } = render(<RoleBoundary locale="en" />);

    expect(screen.getByText('Owned')).toBeVisible();
    expect(
      screen.getByText(/product design across Desktop, Web, tablet, and mobile/i),
    ).toBeVisible();
    expect(screen.getByText('Co-created')).toBeVisible();
    expect(
      screen.getByText(/product, engineering, QA, and customer teams/i),
    ).toBeVisible();
    expect(screen.getByText('Out of scope')).toBeVisible();
    expect(screen.getByText(/customer-built post-meeting interfaces/i)).toBeVisible();
    expect(container.querySelectorAll('dl > div')).toHaveLength(3);
  });
});

describe('Meeting evidence layout', () => {
  it('preserves widescreen media and canonical Meeting tokens', () => {
    expect(evidenceStyles).toMatch(
      /\.frame\s*{[^}]*aspect-ratio:\s*16\s*\/\s*9/s,
    );
    expect(evidenceStyles).toContain('var(--meeting-line,');
    expect(evidenceStyles).toContain('var(--meeting-muted,');
    expect(evidenceStyles).not.toMatch(/var\(--line(?:,|\))/);
    expect(evidenceStyles).not.toMatch(/var\(--text-muted(?:,|\))/);
  });

  it('collapses evidence grids to one column at 720px', () => {
    expect(evidenceStyles).toMatch(
      /@media\s*\(max-width:\s*720px\)[^{]*{[\s\S]*?\.decisionHeader,[\s\S]*?\.decisionRules\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    expect(evidenceStyles).toMatch(
      /@media\s*\(max-width:\s*720px\)[^{]*{[\s\S]*?\.roleBoundary\s*{[^}]*grid-template-columns:\s*1fr/,
    );
  });

  it('uses a compact role boundary without gradients', () => {
    expect(evidenceStyles).toMatch(
      /\.roleBoundary\s*{[^}]*border-block:\s*1px solid var\(--meeting-line/s,
    );
    expect(evidenceStyles).not.toMatch(/gradient\s*\(/i);
  });
});
