import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('renders one light case boundary, hero browser, facts, and actions', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const meta = getEntry('work', 'call-agent', 'zh').meta;
    const { container } = render(
      <CallAgentLayout
        meta={meta}
        locale="zh"
        actions={<button type="button">下载案例</button>}
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
    expect(container.querySelector('[data-project-previous], [data-project-next]')).toBeNull();
  });

  it('plays the detail Hero story in full, advancing only when each clip ends', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const meta = getEntry('work', 'call-agent', 'zh').meta;
    const { container } = render(
      <CallAgentLayout meta={meta} locale="zh">
        <section id="product-boundary"><h2>产品边界</h2></section>
      </CallAgentLayout>,
    );
    const sequence = container.querySelector('[data-call-agent-hero-sequence]');
    const layers = [...(sequence?.querySelectorAll('[data-hero-clip]') ?? [])];

    expect(layers.map((layer) => layer.getAttribute('data-hero-clip'))).toEqual([
      'create', 'preview', 'operate',
    ]);
    expect(layers[0]).toHaveAttribute('data-active', 'true');
    expect(layers[1]).toHaveAttribute('data-active', 'false');

    fireEvent.ended(layers[0].querySelector('video') as HTMLVideoElement);
    expect(layers[0]).toHaveAttribute('data-active', 'false');
    expect(layers[1]).toHaveAttribute('data-active', 'true');
  });
});

describe('Call Agent six-stage system', () => {
  it('renders six title-only tabs with one selected stage and summary', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const { container } = render(<CallAgentSystemStage locale="zh" />);
    const tabs = screen.getAllByRole('tab');
    const root = container.querySelector('[data-system-mode="tabs"]');

    expect(tabs.map((tab) => tab.textContent)).toEqual([
      '创建', '编排', '预览', '发布', '内呼连接', '外呼运营',
    ]);
    expect(root?.querySelector(':scope > [role="tablist"]')).toBeInTheDocument();
    expect(root?.querySelector(':scope > [data-call-agent-media-stage]')).toBeInTheDocument();
    expect(root?.querySelector(':scope > [data-stage-summary]')).toBeInTheDocument();
    expect(root?.querySelector(':scope > [data-static-sequence]')).toBeInTheDocument();
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).not.toHaveTextContent('从空白或客服模板开始');
    const panels = [...container.querySelectorAll('[role="tabpanel"]')];
    expect(panels).toHaveLength(6);
    expect(tabs.filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
    tabs.forEach((tab, index) => {
      const panel = panels[index];
      expect(tab).toHaveAttribute('aria-controls', panel.id);
      expect(panel).toHaveAttribute('aria-labelledby', tab.id);
      expect(panel).toHaveAttribute('tabindex', index === 0 ? '0' : '-1');
      if (index === 0) {
        expect(panel).toHaveAttribute('aria-hidden', 'false');
        expect(panel).not.toHaveAttribute('inert');
      } else {
        expect(panel).toHaveAttribute('aria-hidden', 'true');
        expect(panel).toHaveAttribute('inert');
      }
    });
    expect(container.querySelectorAll('[data-call-agent-media-stage]')).toHaveLength(1);
    expect(container.querySelector('[data-stage-summary]')).toHaveTextContent('从空白或客服模板开始，用有意义的默认值降低冷启动负担。');
  });

  it('selects the requested stage and updates its summary and active media', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const { container } = render(<CallAgentSystemStage locale="en" />);

    const create = screen.getByRole('tab', { name: 'Create' });
    const publish = screen.getByRole('tab', { name: 'Publish' });
    create.focus();
    fireEvent.click(publish);

    expect(publish).toHaveAttribute('aria-selected', 'true');
    expect(publish).toHaveFocus();
    expect(container.querySelector('[data-stage-summary]')).toHaveTextContent('Separate unpublished drafts from released versions and preserve recovery.');
    const activePanel = container.querySelector('[role="tabpanel"][data-active="true"]');
    expect(activePanel?.id).toMatch(/call-agent-panel-publish$/);
    expect(activePanel?.querySelector('video')).toHaveAttribute('src', '/videos/call-agent/agent-publish.mp4');
  });

  it('moves selection and focus with ArrowRight, End, and Home', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    render(<CallAgentSystemStage locale="en" />);
    const create = screen.getByRole('tab', { name: 'Create' });
    const orchestrate = screen.getByRole('tab', { name: 'Orchestrate' });
    const operate = screen.getByRole('tab', { name: 'Outbound operations' });

    create.focus();
    fireEvent.keyDown(create, { key: 'ArrowRight' });
    expect(orchestrate).toHaveAttribute('aria-selected', 'true');
    expect(orchestrate).toHaveFocus();

    fireEvent.keyDown(orchestrate, { key: 'End' });
    expect(operate).toHaveAttribute('aria-selected', 'true');
    expect(operate).toHaveFocus();

    fireEvent.keyDown(operate, { key: 'Home' });
    expect(create).toHaveAttribute('aria-selected', 'true');
    expect(create).toHaveFocus();

    fireEvent.keyDown(create, { key: 'ArrowLeft' });
    expect(operate).toHaveAttribute('aria-selected', 'true');
    expect(operate).toHaveFocus();

    fireEvent.keyDown(operate, { key: 'ArrowRight' });
    expect(create).toHaveAttribute('aria-selected', 'true');
    expect(create).toHaveFocus();
  });

  it('uses unique, locally associated ids for multiple instances', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const first = render(<CallAgentSystemStage locale="en" />);
    const second = render(<CallAgentSystemStage locale="zh" />);
    const allTabs = screen.getAllByRole('tab');

    expect(new Set(allTabs.map((tab) => tab.id)).size).toBe(12);
    for (const { container } of [first, second]) {
      const tabs = [...container.querySelectorAll<HTMLElement>('[role="tab"]')];
      for (const tab of tabs) {
        const panelId = tab.getAttribute('aria-controls');
        const panel = container.querySelector<HTMLElement>(`[id="${panelId}"]`);
        expect(panel).toBeInTheDocument();
        expect(panel).toHaveAttribute('aria-labelledby', tab.id);
      }
    }
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
