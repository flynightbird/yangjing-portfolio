import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SecurityMeta } from '@/components/security/security-meta';

describe('SecurityMeta', () => {
  it('restricts active content and media to approved sources', () => {
    render(<SecurityMeta />);
    const policy = document.head
      .querySelector('meta[http-equiv="Content-Security-Policy"]')
      ?.getAttribute('content');

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("img-src 'self' data: blob:");
    expect(policy).toContain("media-src 'self' blob:");
    expect(policy).toContain("frame-src 'self' https://flynightbird.github.io");
    expect(policy).not.toContain('frame-src https:');
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it('does not disclose full portfolio paths to cross-origin destinations', () => {
    render(<SecurityMeta />);
    expect(document.head.querySelector('meta[name="referrer"]')).toHaveAttribute(
      'content',
      'strict-origin-when-cross-origin',
    );
  });
});
