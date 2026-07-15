import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { XuelangLayout } from '@/components/xuelang/xuelang-layout';
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
    pdfHref,
    panoramaAlt,
    chapterNav,
    projectNav,
  }) => {
    const { meta, Layout } = getEntry('work', 'xuelang', locale);
    expect(Layout).toBe(XuelangLayout);

    render(
      <XuelangLayout
        meta={meta}
        locale={locale}
        next={{ href: `/${locale}/work/call-agent/`, title: 'Call Agent' }}
      >
        <section id="overview">Overview evidence</section>
      </XuelangLayout>,
    );

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible();
    expect(screen.getByText(proposition)).toBeVisible();
    expect(screen.getByText(role)).toBeVisible();
    expect(screen.getByText(duration)).toBeVisible();
    expect(screen.getByRole('img', { name: new RegExp(panoramaAlt, 'i') })).toHaveAttribute(
      'src',
      '/images/xuelang/hero-panorama.webp',
    );
    expect(screen.getByRole('link', { name: pdfLabel })).toHaveAttribute('href', pdfHref);
    expect(screen.getByRole('link', { name: pdfLabel })).toHaveAttribute('download');
    expect(screen.getByRole('navigation', { name: chapterNav })).toBeVisible();
    expect(screen.getByRole('link', { name: /00 (项目概览|Overview)/ })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(screen.queryByRole('navigation', { name: projectNav })).not.toBeInTheDocument();
  });
});
