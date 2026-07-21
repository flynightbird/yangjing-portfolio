import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CallAgentLayout } from '@/components/call-agent/call-agent-layout';
import { CallAgentSystemStage } from '@/components/call-agent/call-agent-system-stage';
import { MeetingLayout } from '@/components/meeting/meeting-layout';
import { TangpingLayout } from '@/components/tangping/tangping-layout';
import { XuelangLayout } from '@/components/xuelang/xuelang-layout';
import { getEntry } from '@/content/registry';

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Call Agent dedicated layout', () => {
  it('is registered only for both Call Agent locales', () => {
    const callAgentEn = getEntry('work', 'call-agent', 'en');
    const callAgentZh = getEntry('work', 'call-agent', 'zh');

    expect(callAgentEn.Layout).toBe(CallAgentLayout);
    expect(callAgentZh.Layout).toBe(CallAgentLayout);
    expect(callAgentEn.Actions).toBeUndefined();
    expect(callAgentZh.Actions).toBeUndefined();
    expect(getEntry('work', 'meeting', 'en').Layout).toBe(MeetingLayout);
    expect(getEntry('work', 'xuelang', 'en').Layout).toBe(XuelangLayout);
    expect(getEntry('work', 'tangping', 'en').Layout).toBe(TangpingLayout);
  });

  it('renders one light case boundary, hero browser, facts, actions, and neighbors', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const meta = getEntry('work', 'call-agent', 'zh').meta;
    const { container } = render(
      <CallAgentLayout
        meta={meta}
        locale="zh"
        actions={<button type="button">下载案例</button>}
        previous={{ href: '/zh/work/xuelang/', title: '学浪' }}
        next={{ href: '/zh/work/meeting/', title: 'Meeting' }}
      >
        <section id="product-boundary"><h2>产品边界</h2></section>
      </CallAgentLayout>,
    );

    expect(container.querySelector('[data-call-agent-case]')).toBeInTheDocument();
    expect(container.querySelector('article[data-case-study]')).toBeInTheDocument();
    expect(container.querySelector('[data-call-agent-hero] [data-call-agent-browser]')).toBeInTheDocument();
    expect(screen.getByText(meta.role)).toBeVisible();
    expect(screen.getByText(meta.status)).toBeVisible();
    expect(screen.getByRole('button', { name: '下载案例' })).toBeVisible();
    expect(screen.getByRole('link', { name: /学浪/ })).toHaveAttribute('href', '/zh/work/xuelang/');
    expect(screen.getByRole('link', { name: /Meeting/ })).toHaveAttribute('href', '/zh/work/meeting/');
  });
});

describe('Call Agent six-stage system', () => {
  it('keeps the approved sequence and one stable media stage', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const { container } = render(<CallAgentSystemStage locale="en" />);
    expect([...container.querySelectorAll('ol [data-stage-id]')].map((node) => node.getAttribute('data-stage-id'))).toEqual([
      'create', 'orchestrate', 'preview', 'publish', 'connect', 'operate',
    ]);
    expect(container.querySelectorAll('[data-call-agent-media-stage]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-static-stage]')).toHaveLength(6);
  });

  it('uses inbound connection and outbound operations videos in both locales', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const zh = render(<CallAgentSystemStage locale="zh" />);
    expect(screen.getAllByText('内呼连接').length).toBeGreaterThan(0);
    expect(screen.getAllByText('外呼运营').length).toBeGreaterThan(0);
    expect(zh.container.querySelector('video[src="/videos/call-agent/agent-connect.mp4"]')).toBeInTheDocument();
    expect(zh.container.querySelector('video[src="/videos/call-agent/agent-operate.mp4"]')).toBeInTheDocument();
    zh.unmount();

    const en = render(<CallAgentSystemStage locale="en" />);
    expect(screen.getAllByText('Inbound connection').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Outbound operations').length).toBeGreaterThan(0);
    expect(en.container.querySelector('video[src="/videos/call-agent/agent-connect.mp4"]')).toBeInTheDocument();
    expect(en.container.querySelector('video[src="/videos/call-agent/agent-operate.mp4"]')).toBeInTheDocument();
  });
});
