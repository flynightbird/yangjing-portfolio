import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { XuelangCourseEntry } from '@/components/xuelang/xuelang-course-entry';

afterEach(cleanup);

describe('XuelangCourseEntry', () => {
  it('defaults to the continue-learning state and preserves all states for print', () => {
    const { container } = render(<XuelangCourseEntry locale="zh" />);
    const tabs = screen.getAllByRole('tab');

    expect(tabs).toHaveLength(4);
    for (const tab of tabs) {
      expect(document.getElementById(tab.getAttribute('aria-controls') ?? '')).not.toBeNull();
    }
    expect(screen.getByRole('tablist', { name: '课程入口状态' })).toBeVisible();
    expect(screen.getByRole('tab', { name: /最近正在看课/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel')).toContainElement(
      screen.getByRole('img', { name: /学习进度与继续学习/ }),
    );

    const printGrid = container.querySelector('[data-course-entry-print]');
    expect(printGrid).toBeInTheDocument();
    expect(within(printGrid as HTMLElement).getAllByRole('img')).toHaveLength(4);
    for (const label of ['还没有买课', '买了新课还没看', '最近正在看课', '老师正在直播']) {
      expect(within(printGrid as HTMLElement).getByText(label)).toBeInTheDocument();
    }
  });

  it('switches the focused product screen by click', async () => {
    const user = userEvent.setup();
    render(<XuelangCourseEntry locale="zh" />);

    await user.click(screen.getByRole('tab', { name: /还没有买课/ }));

    expect(screen.getByRole('tab', { name: /还没有买课/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel')).toContainElement(
      screen.getByRole('img', { name: /课程发现与选课入口/ }),
    );
  });

  it('moves selection and focus with ArrowRight, Home, and End', async () => {
    const user = userEvent.setup();
    render(<XuelangCourseEntry locale="zh" />);

    const continueTab = screen.getByRole('tab', { name: /最近正在看课/ });
    continueTab.focus();
    await user.keyboard('{ArrowRight}');

    const liveTab = screen.getByRole('tab', { name: /老师正在直播/ });
    expect(liveTab).toHaveFocus();
    expect(liveTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toContainElement(
      screen.getByRole('img', { name: /老师直播中的课程入口/ }),
    );

    await user.keyboard('{Home}');
    const discoverTab = screen.getByRole('tab', { name: /还没有买课/ });
    expect(discoverTab).toHaveFocus();
    expect(discoverTab).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{End}');
    expect(liveTab).toHaveFocus();
    expect(liveTab).toHaveAttribute('aria-selected', 'true');
  });

  it('provides equivalent English labels and state descriptions', () => {
    render(<XuelangCourseEntry locale="en" />);

    expect(screen.getByRole('tablist', { name: 'Course entry states' })).toBeVisible();
    expect(screen.getByRole('tab', { name: /Recently learning/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel')).toContainElement(
      screen.getByRole('img', { name: /Learning progress and continue-learning entry/ }),
    );
  });

  it('keeps the selected tab visible inside an overflowing mobile tab row', async () => {
    const user = userEvent.setup();
    render(<XuelangCourseEntry locale="zh" />);

    const tablist = screen.getByRole('tablist', { name: '课程入口状态' });
    const liveTab = screen.getByRole('tab', { name: /老师正在直播/ });
    Object.defineProperties(tablist, {
      clientWidth: { configurable: true, value: 360 },
      scrollWidth: { configurable: true, value: 960 },
    });
    Object.defineProperties(liveTab, {
      offsetLeft: { configurable: true, value: 720 },
      offsetWidth: { configurable: true, value: 240 },
    });

    await user.click(liveTab);

    expect(tablist.scrollLeft).toBe(600);
  });

  it('recenters the default state when the tab row becomes scrollable', async () => {
    render(<XuelangCourseEntry locale="zh" />);

    const tablist = screen.getByRole('tablist', { name: '课程入口状态' });
    const continueTab = screen.getByRole('tab', { name: /最近正在看课/ });
    Object.defineProperties(tablist, {
      clientWidth: { configurable: true, value: 360 },
      scrollWidth: { configurable: true, value: 960 },
    });
    Object.defineProperties(continueTab, {
      offsetLeft: { configurable: true, value: 480 },
      offsetWidth: { configurable: true, value: 240 },
    });

    window.dispatchEvent(new Event('resize'));

    await waitFor(() => expect(tablist.scrollLeft).toBe(420));
  });
});
