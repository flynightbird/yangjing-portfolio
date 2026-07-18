import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  BreakoutDecisionEvidence,
  MeetingVideo,
} from '@/components/meeting/meeting-evidence';

afterEach(cleanup);

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
    expect(screen.getByText(/designer-reported/i)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open decision artifact in Figma' }))
      .toHaveAttribute('href', expect.stringContaining('node-id=1-15037'));
  });
});
