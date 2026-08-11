import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { XuelangCourseExploration } from '@/components/xuelang/xuelang-course-exploration';

afterEach(cleanup);

describe('XuelangCourseExploration', () => {
  it('renders the Chinese demo exploration and three shared standards', () => {
    const { container } = render(<XuelangCourseExploration locale="zh" />);

    expect(screen.getByText('与产品、运营组队，为不同核心品类探索 Demo 方案')).toBeInTheDocument();
    expect(screen.getByText('从品类差异里，抽出课程信息的共性标准')).toBeInTheDocument();
    expect(screen.getByText('把适配信息变成可比较的标准')).toBeInTheDocument();
    expect(screen.getByText('建立对课程内容的信任')).toBeInTheDocument();
    expect(screen.getByText('降低对无法完成课程的担心')).toBeInTheDocument();
    expect(screen.getByText('从不同品类的探索中，抽象出可复用的课程模块')).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(8);
  });

  it('renders dedicated English copy without leaking Chinese decisions', () => {
    render(<XuelangCourseExploration locale="en" />);

    expect(screen.getByText('Partner with Product and Operations to explore demos for core course categories')).toBeInTheDocument();
    expect(screen.getByText('Extract a shared course standard from category differences')).toBeInTheDocument();
    expect(screen.getByText('Make fit visible and comparable')).toBeInTheDocument();
    expect(screen.getByText('Turn category explorations into reusable course modules')).toBeInTheDocument();
    expect(screen.queryByText('建立对课程内容的信任')).not.toBeInTheDocument();
  });
});
