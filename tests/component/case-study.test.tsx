import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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

const expandedGallery = [
  ...gallery,
  {
    src: '/images/archive/details/test/03.webp',
    width: 1600,
    height: 900,
    alt: 'Third gallery image',
  },
  {
    src: '/images/archive/details/test/04.webp',
    width: 1600,
    height: 900,
    alt: 'Fourth gallery image',
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

    expect(screen.getByText('Archive gallery')).toBeVisible();
    const firstPosition = screen.getByText('01 / 02');
    expect(firstPosition).toHaveAccessibleName('Gallery position: 01 / 02');
    expect(firstPosition).toHaveAttribute('role', 'status');
    expect(firstPosition).toHaveAttribute('aria-live', 'polite');
    expect(firstPosition).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByRole('button', { name: 'Previous image' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next image' }));
    expect(screen.getByText('02 / 02')).toHaveAccessibleName('Gallery position: 02 / 02');
    expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled();

    screen.getByRole('dialog', { name: 'Archive gallery' }).focus();
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

  it('keeps focus inside a gallery dialog when its pager controls are visually hidden', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Background action</button>
        <Lightbox
          src={gallery[0].src}
          width={gallery[0].width}
          height={gallery[0].height}
          alt={gallery[0].alt}
          gallery={gallery}
          triggerLabel="Open focus gallery"
          dialogLabel="Focus gallery"
          closeLabel="Close gallery"
          previousLabel="Previous image"
          nextLabel="Next image"
        />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Open focus gallery' }));
    const next = screen.getByRole('button', { name: 'Next image' });
    next.parentElement!.style.display = 'none';

    const close = screen.getByRole('button', { name: 'Close gallery' });
    expect(close).toHaveFocus();

    await user.tab();
    expect(close).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Background action' })).not.toHaveFocus();
  });

  it('only handles unmodified gallery arrows from non-editable dialog targets', async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={gallery[0].src}
        width={gallery[0].width}
        height={gallery[0].height}
        alt={gallery[0].alt}
        gallery={gallery}
        triggerLabel="Open keyboard gallery"
        dialogLabel="Keyboard gallery"
        closeLabel="Close gallery"
        previousLabel="Previous image"
        nextLabel="Next image"
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Open keyboard gallery' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Keyboard gallery' });
    const dispatchArrow = (
      target: EventTarget,
      modifiers: KeyboardEventInit = {},
    ) => {
      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'ArrowRight',
        ...modifiers,
      });
      fireEvent(target, event);
      return event;
    };

    for (const modifiers of [
      { altKey: true },
      { altKey: true, ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
    ]) {
      expect(dispatchArrow(dialog, modifiers).defaultPrevented).toBe(false);
      expect(screen.getByText('01 / 02')).toBeVisible();
    }

    expect(dispatchArrow(trigger).defaultPrevented).toBe(false);
    expect(screen.getByText('01 / 02')).toBeVisible();

    const input = document.createElement('input');
    dialog.append(input);
    expect(dispatchArrow(input).defaultPrevented).toBe(false);

    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    const editableChild = document.createElement('span');
    editable.append(editableChild);
    dialog.append(editable);
    expect(dispatchArrow(editableChild).defaultPrevented).toBe(false);
    expect(screen.getByText('01 / 02')).toBeVisible();

    expect(dispatchArrow(dialog).defaultPrevented).toBe(true);
    expect(screen.getByText('02 / 02')).toBeVisible();
  });

  it('clamps the active gallery item when its media list shrinks', async () => {
    const user = userEvent.setup();
    const props = {
      src: expandedGallery[0].src,
      width: expandedGallery[0].width,
      height: expandedGallery[0].height,
      alt: expandedGallery[0].alt,
      triggerLabel: 'Open changing gallery',
      dialogLabel: 'Changing gallery',
      closeLabel: 'Close gallery',
      previousLabel: 'Previous image',
      nextLabel: 'Next image',
      positionLabel: 'Gallery position',
    };
    const { rerender } = render(<Lightbox {...props} gallery={expandedGallery} />);

    await user.click(screen.getByRole('button', { name: 'Open changing gallery' }));
    const next = screen.getByRole('button', { name: 'Next image' });
    await user.click(next);
    await user.click(next);
    await user.click(next);
    expect(screen.getByText('04 / 04')).toBeVisible();

    rerender(<Lightbox {...props} gallery={gallery} />);

    expect(screen.getByText('02 / 02')).toBeVisible();
    const desktopGallery = document.querySelector('[data-gallery-desktop]');
    expect(within(desktopGallery!).getByRole('img', { name: 'Second gallery image' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous image' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled();
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
