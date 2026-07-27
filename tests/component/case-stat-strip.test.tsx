import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  CaseStatStrip,
  getCaseStatDensity,
} from '@/components/case-study/case-stat-strip';

afterEach(cleanup);

describe('getCaseStatDensity', () => {
  it.each([
    ['500K DAU', 'short'],
    ['DAU 50w（约 50万）', 'medium'],
    ['Transaction → Learning relationship', 'long'],
  ] as const)('returns %s for %s values', (value, density) => {
    expect(getCaseStatDensity(value)).toBe(density);
  });
});

describe('CaseStatStrip', () => {
  it('renders one labelled semantic definition list without responsive duplicates', () => {
    const { container } = render(
      <CaseStatStrip
        label="Business context"
        className="case-theme"
        items={[
          { label: 'Daily active users', value: '500K DAU' },
          { label: 'Daily active users', value: 'DAU 50w（约 50万）' },
          { label: 'Relationship', value: 'Transaction → Learning relationship' },
        ]}
      />,
    );

    const list = screen.getByLabelText('Business context');

    expect(list.tagName).toBe('DL');
    expect(container.querySelectorAll('dl[aria-label="Business context"]')).toHaveLength(1);
    expect(container.querySelectorAll('dt')).toHaveLength(3);
    expect(container.querySelectorAll('dd')).toHaveLength(3);
    expect(container.querySelectorAll('[data-stat-density]')).toHaveLength(3);
    expect(
      Array.from(container.querySelectorAll('[data-stat-density]'), (item) =>
        item.getAttribute('data-stat-density'),
      ),
    ).toEqual(['short', 'medium', 'long']);
    expect(container.querySelector('[data-case-stat-strip]')).toHaveClass('case-theme');
  });
});
