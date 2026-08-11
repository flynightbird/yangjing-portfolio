import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { XuelangPositioningBridge } from '@/components/xuelang/xuelang-positioning-bridge';

afterEach(cleanup);

describe('XuelangPositioningBridge', () => {
  it('renders the Chinese positioning and three-stage path', () => {
    render(<XuelangPositioningBridge locale="zh" />);

    expect(screen.getByText('高品质')).toBeInTheDocument();
    expect(screen.getByText('泛兴趣类').parentElement).toContainElement(screen.getByText('用户价值'));
    expect(screen.getByText('提升转化')).toBeInTheDocument();
    expect(screen.getByText('用户粘性')).toBeInTheDocument();
    expect(screen.getByText('品质调性')).toBeInTheDocument();
  });

  it('renders dedicated English positioning copy', () => {
    render(<XuelangPositioningBridge locale="en" />);

    expect(screen.getByText('high-quality')).toBeInTheDocument();
    expect(screen.getByText('interest-led')).toBeInTheDocument();
    expect(screen.getByText('Build retention')).toBeInTheDocument();
    expect(screen.queryByText('用户粘性')).not.toBeInTheDocument();
  });
});
