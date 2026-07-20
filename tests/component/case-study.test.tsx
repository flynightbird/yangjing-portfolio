import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ChapterNav } from '@/components/case-study/chapter-nav';
import { CaseLayout } from '@/components/case-study/case-layout';
import { EvidenceFigure } from '@/components/case-study/evidence-figure';
import { Lightbox } from '@/components/media/lightbox';
import type { ContentMeta } from '@/content/schema';

const chapters = [
  { id: 'overview', label: 'Overview' },
  { id: 'decision-preview', label: 'Preview decision' },
];

const gallery = [
  {
    src: '/images/archive/details/test/01.webp',
    width: 1600,
    height: 900,
    alt: 'First gallery image',
  },
  {
    src: '/images/archive/details/test/02.webp',
    width: 1600,
    height: 900,
    alt: 'Second gallery image',
  },
] as const;

afterEach(() => {
  cleanup();
  document.body.removeAttribute('style');
});

describe('ChapterNav', () => {
  it('supports an explicit zero-based Xuelang sequence without changing link names', () => {
    const { container } = render(
      <ChapterNav
        chapters={chapters}
        locale="en"
        indexStart={0}
        variant="xuelang"
      />,
    );

    expect(container.querySelector('[data-chapter-variant="xuelang"]')).toBeInTheDocument();
    expect(container.querySelector('[data-chapter-index="00"]')).toHaveTextContent('00');
    expect(container.querySelector('[data-chapter-index="01"]')).toHaveTextContent('01');
    expect(screen.getByRole('link', { name: 'Overview' })).toBeVisible();
  });

  it('keeps shared case navigation on its existing one-based sequence', () => {
    const { container } = render(<ChapterNav chapters={chapters} locale="en" />);

    expect(container.querySelector('[data-chapter-index="01"]')).toHaveTextContent('01');
    expect(container.querySelector('[data-chapter-index="02"]')).toHaveTextContent('02');
  });

  it('exposes a keyboard-operable compact chapter menu', async () => {
    const user = userEvent.setup();
    render(<ChapterNav chapters={chapters} locale="en" />);

    const toggle = screen.getByRole('button', { name: 'Open chapter index' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'location',
    );

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Close chapter index');
    expect(screen.getByRole('navigation', { name: 'Case study chapters' })).toBeVisible();

    await user.click(screen.getByRole('link', { name: 'Preview decision' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the shared navigation on the default compact breakpoint', () => {
    render(<ChapterNav chapters={chapters} locale="en" />);

    expect(
      screen.getByRole('navigation', { name: 'Case study chapters' }).parentElement,
    ).toHaveAttribute('data-compact-at', 'default');
  });
});

describe('CaseLayout', () => {
  it('does not leak Call Agent copy, facts, actions, or neighbors into another case', () => {
    const meetingMeta = {
      type: 'work',
      slug: 'meeting',
      locale: 'en',
      translationKey: 'work.meeting',
      title: 'Meeting collaboration',
      proposition: 'Keep real-time collaboration visible and controllable.',
      role: 'Product designer',
      duration: '6 months',
      status: 'Shipped',
      disclosure: 'Public retrospective.',
      heroMedia: '/images/meeting/hero.png',
      evidenceLevel: 'retrospective',
      featuredOrder: 3,
      previousSlug: 'call-agent',
      caseLabel: 'MEETING / REAL-TIME COLLABORATION',
      facts: [{ label: 'Complexity', value: 'Real-time state' }],
    } as ContentMeta & {
      caseLabel: string;
      facts: readonly { label: string; value: string }[];
    };

    render(
      <CaseLayout meta={meetingMeta} locale="en">
        <section id="overview">Meeting evidence</section>
      </CaseLayout>,
    );

    expect(screen.getByText('MEETING / REAL-TIME COLLABORATION')).toBeVisible();
    expect(screen.getByText('Real-time state')).toBeVisible();
    expect(screen.queryByText(/CALL AGENT/)).not.toBeInTheDocument();
    expect(screen.queryByText('Approximately 8 iterations')).not.toBeInTheDocument();
    expect(screen.queryByText(/case-study PDF/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Project navigation' })).not.toBeInTheDocument();
  });
});

describe('EvidenceFigure', () => {
  it('preserves intrinsic media dimensions and evidence semantics', () => {
    render(
      <EvidenceFigure
        src="/images/call-agent/ai-preview-live.png"
        width={2934}
        height={1466}
        alt="Agent configuration next to a live call preview"
        label="OBSERVED / Product evidence"
        caption="Configuration and runtime feedback share one view."
        locale="en"
      />,
    );

    expect(
      screen.getByRole('img', {
        name: 'Agent configuration next to a live call preview',
      }),
    ).toHaveAttribute('width', '2934');
    expect(screen.getByText('OBSERVED / Product evidence')).toBeVisible();
    expect(
      screen.getByText('Configuration and runtime feedback share one view.'),
    ).toBeVisible();
  });
});

describe('Lightbox', () => {
  it('supports ordered gallery navigation with a localized position label', async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={gallery[0].src}
        width={gallery[0].width}
        height={gallery[0].height}
        alt={gallery[0].alt}
        gallery={gallery}
        triggerLabel="Open gallery"
        dialogLabel="Archive gallery"
        closeLabel="Close gallery"
        previousLabel="Previous image"
        nextLabel="Next image"
        positionLabel="Gallery position"
        errorLabel="Image unavailable"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open gallery' }));

    expect(screen.getByText('01 / 02')).toHaveAccessibleName('Gallery position');
    expect(screen.getByRole('button', { name: 'Previous image' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next image' }));
    expect(screen.getByText('02 / 02')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('01 / 02')).toBeVisible();
  });

  it('keeps gallery controls available when the active desktop image fails', async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={gallery[0].src}
        width={gallery[0].width}
        height={gallery[0].height}
        alt={gallery[0].alt}
        gallery={gallery}
        triggerLabel="Open failing gallery"
        dialogLabel="Archive gallery"
        closeLabel="Close gallery"
        previousLabel="Previous image"
        nextLabel="Next image"
        positionLabel="Gallery position"
        errorLabel="Image unavailable"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open failing gallery' }));
    const desktopGallery = document.querySelector('[data-gallery-desktop]');
    expect(desktopGallery).not.toBeNull();
    fireEvent.error(desktopGallery!.querySelector('img')!);

    expect(desktopGallery).toHaveTextContent('Image unavailable');
    expect(screen.getByRole('button', { name: 'Close gallery' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next image' })).toBeVisible();
  });

  it('closes on Escape, returns focus, and restores the exact body overflow', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'clip';

    render(
      <Lightbox
        src="/images/call-agent/ai-preview-live.png"
        width={2934}
        height={1466}
        alt="Agent configuration next to a live call preview"
        triggerLabel="Enlarge live preview evidence"
        dialogLabel="Product interface detail"
        closeLabel="Close image"
      />,
    );

    const trigger = screen.getByRole('button', {
      name: 'Enlarge live preview evidence',
    });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('dialog', { name: 'Product interface detail' })).toBeVisible();
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('clip');
  });

  it('traps forward and backward keyboard focus inside the open modal', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Lightbox
          src="/images/call-agent/ai-preview-live.png"
          width={2934}
          height={1466}
          alt="First product interface"
          triggerLabel="Enlarge first evidence"
          dialogLabel="First interface detail"
          closeLabel="Close image"
        />
        <Lightbox
          src="/images/call-agent/product-switcher.png"
          width={560}
          height={420}
          alt="Second product interface"
          triggerLabel="Enlarge second evidence"
          dialogLabel="Second interface detail"
          closeLabel="Close image"
        />
      </>,
    );

    await user.click(
      screen.getByRole('button', { name: 'Enlarge first evidence' }),
    );

    const close = screen.getByRole('button', { name: 'Close image' });
    const backgroundTrigger = screen.getByRole('button', {
      name: 'Enlarge second evidence',
    });
    expect(close).toHaveFocus();

    await user.tab();
    expect(close).toHaveFocus();
    expect(backgroundTrigger).not.toHaveFocus();

    await user.tab({ shift: true });
    expect(close).toHaveFocus();
    expect(backgroundTrigger).not.toHaveFocus();
    expect(
      screen.queryByRole('dialog', { name: 'Second interface detail' }),
    ).not.toBeInTheDocument();
  });

  it('uses the explicit localized close label without inferring from dialog copy', async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src="/images/call-agent/ai-preview-live.png"
        width={2934}
        height={1466}
        alt="Localized interface"
        triggerLabel="Open localized evidence"
        dialogLabel="Product interface detail"
        closeLabel="关闭图片"
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Open localized evidence' }),
    );
    expect(screen.getByRole('button', { name: '关闭图片' })).toHaveFocus();
  });

  it('restores the exact body overflow when unmounted while open', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'auto';
    const { unmount } = render(
      <Lightbox
        src="/images/call-agent/ai-preview-live.png"
        width={2934}
        height={1466}
        alt="Agent configuration next to a live call preview"
        triggerLabel="Enlarge evidence before unmount"
        dialogLabel="Unmount interface detail"
        closeLabel="Close image"
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Enlarge evidence before unmount' }),
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('auto');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
