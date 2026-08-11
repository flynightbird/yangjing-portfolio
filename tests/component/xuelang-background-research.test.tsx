import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { XuelangBackgroundResearch } from '@/components/xuelang/xuelang-background-research';

afterEach(cleanup);

describe('XuelangBackgroundResearch', () => {
  it('renders the Chinese business shift and research evidence', () => {
    const { container } = render(<XuelangBackgroundResearch locale="zh" />);

    expect(screen.getByText('交易发生在抖音，长期关系要留在学浪')).toBeInTheDocument();
    expect(screen.getByText('To B 卖课工具')).toBeInTheDocument();
    expect(screen.getByText('To C 学习平台')).toBeInTheDocument();
    expect(screen.getByText('女性用户在四项课程消费指标中均更突出')).toBeInTheDocument();
    expect(screen.getByText('会生活、享受生活、追求趣味的“三高”女性群体')).toBeInTheDocument();
    expect(screen.getByText('趣享生活 · 自信向上 · 良师益友')).toBeInTheDocument();
    expect(screen.getByText('然而，当前体验仍有三个核心问题')).toBeInTheDocument();
    expect(screen.queryByText(/^(01|02)\s*\//)).not.toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(9);
  });

  it('renders dedicated English copy without leaking Chinese headings', () => {
    render(<XuelangBackgroundResearch locale="en" />);

    expect(screen.getByText('Transactions began on Douyin; the learning relationship had to live in Xuelang')).toBeInTheDocument();
    expect(screen.getByText('To B selling tool')).toBeInTheDocument();
    expect(screen.getByText('To C learning platform')).toBeInTheDocument();
    expect(screen.getByText('Women who enjoy life, pursue interests, and expect quality')).toBeInTheDocument();
    expect(screen.getByText('Enjoy life · Grow with confidence · Learn from trusted mentors')).toBeInTheDocument();
    expect(screen.getByText('Three core problems still shaped the experience')).toBeInTheDocument();
    expect(screen.queryByText('女性用户在四项课程消费指标中均更突出')).not.toBeInTheDocument();
  });

  it('preserves the four research-stage comparison values', () => {
    render(<XuelangBackgroundResearch locale="zh" />);

    for (const value of ['56% vs 30%', '38% vs 35%', '59% vs 29%', '42% vs 36%']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
  });
});
