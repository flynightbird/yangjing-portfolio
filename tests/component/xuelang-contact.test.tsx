import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { XuelangContact } from '@/components/xuelang/xuelang-contact';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('XuelangContact', () => {
  it('shows the Chinese email and copies the visible WeChat ID', async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    render(<XuelangContact locale="zh" />);

    expect(screen.getByRole('link', { name: 'yangux@qq.com' })).toHaveAttribute(
      'href',
      'mailto:yangux@qq.com',
    );
    expect(screen.getByText('flydesigner_yangj')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '复制微信号' }));
    expect(writeText).toHaveBeenCalledWith('flydesigner_yangj');
    expect(screen.getByText('已复制微信号')).toBeVisible();
  });

  it('uses the English email and omits WeChat and LinkedIn', () => {
    render(<XuelangContact locale="en" />);

    expect(screen.getByRole('link', { name: 'amanda.yangj@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:amanda.yangj@gmail.com',
    );
    expect(screen.queryByText('flydesigner_yangj')).not.toBeInTheDocument();
    expect(screen.queryByText(/LinkedIn/i)).not.toBeInTheDocument();
  });
});
