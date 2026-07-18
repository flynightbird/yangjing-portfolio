import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrowRight } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ActionLink } from '@/components/ui/action-link';
import styles from '@/components/ui/action-link.module.css';

afterEach(cleanup);

describe('ActionLink', () => {
  it.each(['primary', 'signal', 'secondary', 'text'] as const)(
    'applies the %s treatment',
    (variant) => {
      render(
        <ActionLink href="/en/work/" variant={variant}>
          View work
        </ActionLink>,
      );

      const link = screen.getByRole('link', { name: 'View work' });
      expect(link).toHaveClass(
        styles.root,
        styles[variant],
      );
      expect(link).toHaveAttribute('data-action-variant', variant);
    },
  );

  it('renders a stable decorative Lucide icon', () => {
    const { container } = render(
      <ActionLink href="/en/about/" icon={ArrowRight}>
        Read about Yang Jing
      </ActionLink>,
    );

    const icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('height', '18');
  });

  it('opens external links safely with a localized readable notice', () => {
    const { container } = render(
      <ActionLink
        href="https://www.linkedin.com/"
        external
        externalLabel="Opens in a new tab"
      >
        LinkedIn
      </ActionLink>,
    );

    const link = screen.getByRole('link', {
      name: 'LinkedIn Opens in a new tab',
    });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    expect(container.querySelector('[data-remix-icon="arrow-right-up-line"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('secures explicit blank targets for internal links', () => {
    render(
      <ActionLink href="/en/work/xuelang/" target="_blank">
        View Xuelang
      </ActionLink>,
    );

    const link = screen.getByRole('link', { name: 'View Xuelang' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it('removes disabled links from navigation and does not call onClick', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ActionLink href="/en/work/" disabled onClick={onClick}>
        Unavailable work
      </ActionLink>,
    );

    const link = screen.getByText('Unavailable work').closest('a');
    if (!link) {
      throw new Error('Expected disabled ActionLink to render an anchor');
    }
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('tabindex', '-1');

    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('requires href for enabled links while allowing disabled placeholders', () => {
    const disabledLink = <ActionLink disabled>Unavailable work</ActionLink>;

    // @ts-expect-error Enabled ActionLink instances must provide href.
    const enabledWithoutHref = <ActionLink>View work</ActionLink>;

    expect(disabledLink.props.disabled).toBe(true);
    expect(enabledWithoutHref).toBeTruthy();
  });
});
