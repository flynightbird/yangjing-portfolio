import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { XuelangLayout } from '@/components/xuelang/xuelang-layout';
import styles from '@/components/xuelang/xuelang-layout.module.css';
import { getEntry } from '@/content/registry';

afterEach(cleanup);

describe('XuelangLayout', () => {
  it.each([
    {
      locale: 'zh' as const,
      title: '学浪商业化体验升级',
      proposition: '从卖课工具，到高品质学习平台',
      role: '项目主负责设计师',
      duration: '2022.03–05 · 2 个月',
      pdfLabel: '下载 PDF 案例',
      pdfSizeLabel: 'PDF · 6.5 MB',
      proof: '14 天实验 · 人均 GMV +11.75%',
      pdfHref: '/files/xuelang-case-study-zh.pdf',
      panoramaAlt: '学浪产品体验全景',
      chapterNav: '案例章节',
      projectNav: '项目导航',
    },
    {
      locale: 'en' as const,
      title: 'Xuelang Commercial Experience Upgrade',
      proposition: 'From a course-selling tool to a high-quality learning platform',
      role: 'Lead UX Designer',
      duration: 'Mar–May 2022 · 2 months',
      pdfLabel: 'Download PDF case study',
      pdfSizeLabel: 'PDF · 5.8 MB',
      proof: '14-day experiment · GMV per user +11.75%',
      pdfHref: '/files/xuelang-case-study-en.pdf',
      panoramaAlt: 'Xuelang product panorama',
      chapterNav: 'Case study chapters',
      projectNav: 'Project navigation',
    },
  ])('renders the $locale cinematic case shell', ({
    locale,
    title,
    proposition,
    role,
    duration,
    pdfLabel,
    pdfSizeLabel,
    proof,
    pdfHref,
    panoramaAlt,
    chapterNav,
    projectNav,
  }) => {
    const { meta, Layout } = getEntry('work', 'xuelang', locale);
    expect(Layout).toBe(XuelangLayout);

    const { container } = render(
      <XuelangLayout
        meta={meta}
        locale={locale}
      >
        <section id="overview">Overview evidence</section>
      </XuelangLayout>,
    );

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible();
    expect(screen.getByText(proposition)).toBeVisible();
    expect(screen.getByText(role)).toBeVisible();
    expect(screen.getByText(duration)).toBeVisible();
    const panorama = container.querySelector('[data-hero-panorama]');
    expect(panorama).toHaveAttribute('aria-label', expect.stringMatching(panoramaAlt));
    expect(panorama?.querySelectorAll('img')).toHaveLength(4);
    expect(
      Array.from(panorama?.querySelectorAll('img') ?? [], (image) => image.getAttribute('src')),
    ).toEqual([
      '/images/xuelang/hero-discover.webp',
      '/images/xuelang/hero-decide.webp',
      '/images/xuelang/hero-learn.webp',
      '/images/xuelang/hero-retain.webp',
    ]);
    expect(panorama?.querySelectorAll('[data-hero-product-state]')).toHaveLength(4);
    expect(screen.getByRole('link', { name: pdfLabel })).toHaveAttribute('href', pdfHref);
    expect(screen.getByRole('link', { name: pdfLabel })).toHaveAttribute('download');
    expect(screen.getByRole('link', { name: pdfLabel })).toHaveTextContent(pdfSizeLabel);
    expect(container.querySelector('[data-xuelang-opening]')).not.toBeInTheDocument();
    expect(screen.getByText(proof, { exact: true })).toBeVisible();
    const noise = container.querySelector('[data-xuelang-noise]');
    expect(noise).toHaveAttribute('aria-hidden', 'true');
    expect(noise).toHaveClass(styles.noise);
    expect(noise?.parentElement).toHaveAttribute('data-xuelang-case');
    expect(container.querySelector('[data-hero-thesis]')).toContainElement(
      screen.getByRole('heading', { level: 1, name: title }),
    );
    expect(container.querySelector('[data-hero-support]')).toContainElement(
      screen.getByText(proposition),
    );
    expect(screen.getByRole('navigation', { name: chapterNav })).toBeVisible();
    expect(screen.getByRole('navigation', { name: chapterNav }).parentElement).toHaveAttribute(
      'data-compact-at',
      'wide',
    );
    expect(screen.getByRole('link', { name: /^(项目概览|Overview)$/ })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(container.querySelector('[data-chapter-variant="xuelang"]')).toBeInTheDocument();
    expect(container.querySelector('[data-chapter-index="00"]')).toHaveTextContent('00');
    expect(container.querySelectorAll('[data-chapter-index]')).toHaveLength(8);
    expect(screen.queryByRole('navigation', { name: projectNav })).not.toBeInTheDocument();
  });

  it('renders the complete evidence sequence without a project promotion close', () => {
    const { Component, Layout, meta } = getEntry('work', 'xuelang', 'zh');
    if (!Layout) throw new Error('Xuelang layout is required');

    const { container } = render(
      <Layout meta={meta} locale="zh">
        <Component />
      </Layout>,
    );

    expect(
      container.querySelectorAll(
        '[data-evidence] img, [data-wipe-interactive] img, [data-course-entry-interactive] img, [data-interaction-board] img',
      ).length,
    ).toBeGreaterThanOrEqual(12);
    expect(container.querySelector('[data-interaction-board]')).toBeInTheDocument();
    expect(screen.getAllByTestId('learning-state')).toHaveLength(5);
    expect(container.querySelectorAll('[data-learning-compact]')).toHaveLength(3);
    expect(screen.getByRole('tablist', { name: '课程入口状态' })).toBeVisible();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: /最近正在看课/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      within(screen.getByRole('tabpanel')).getByRole('img', {
        name: /学习进度与继续学习/,
      }),
    ).toBeVisible();
    expect(container.querySelector('[data-course-entry-print]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-course-entry-print] img')).toHaveLength(4);
    expect(container.querySelector('img[src="/images/xuelang/learning-focus.webp"]'))
      .not.toBeInTheDocument();
    expect(screen.getAllByTestId('xuelang-dark-stage')).toHaveLength(1);
    const comparisonStage = screen.getByTestId('xuelang-dark-stage');
    expect(
      within(comparisonStage).getByRole('slider', { name: '拖动比较旧版与新版' }),
    ).toHaveAttribute('aria-valuenow', '38');
    expect(
      comparisonStage.querySelector('[data-wipe-interactive] img:first-of-type'),
    ).toHaveAttribute('src', '/images/xuelang/learning-after-board.webp');
    expect(
      comparisonStage.querySelector('[data-wipe-interactive] img:nth-of-type(2)'),
    ).toHaveAttribute('src', '/images/xuelang/learning-before-board.webp');
    expect(
      comparisonStage.querySelectorAll('[data-wipe-print-pair] img'),
    ).toHaveLength(2);
    expect(container.querySelectorAll('[data-result-summary]')).toHaveLength(1);
    expect(container.querySelector('[data-result-summary]')).toHaveTextContent(
      '+43% / +55% / +39%',
    );
    expect(screen.queryByRole('navigation', { name: '项目导航' })).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-evidence-story]').length).toBeGreaterThanOrEqual(4);
    expect(container.querySelectorAll('[data-expand-cue]').length).toBe(
      container.querySelectorAll('[data-evidence]').length,
    );
    expect(container.querySelector('img[src="/images/xuelang/quality-detail-ui.webp"]'))
      .toBeInTheDocument();
    expect(container.querySelector('img[src="/images/xuelang/purchase-selected.webp"]'))
      .toBeInTheDocument();
    expect(container.querySelector('img[src="/images/xuelang/learning-entry-ui.webp"]'))
      .not.toBeInTheDocument();
  });
});
