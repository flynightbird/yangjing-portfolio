import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  path.join(process.cwd(), 'components/case-study/case-stat-strip.module.css'),
  'utf8',
);

describe('case stat strip styles', () => {
  it('uses a named inline-size container with three layout tiers', () => {
    expect(css).toContain('container: case-stat-strip / inline-size');
    expect(css).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(css).toMatch(
      /@container case-stat-strip \(min-width: 56rem\) and \(max-width: 69\.999rem\)/,
    );
    expect(css).toMatch(/@container case-stat-strip \(max-width: 55\.999rem\)/);
    expect(css).toMatch(/@container case-stat-strip \(max-width: 26rem\)/);
  });

  it('keeps readable values single-line until the narrow tier', () => {
    expect(css).toMatch(/\.value\s*\{[^}]*white-space:\s*nowrap/s);
    expect(css).toMatch(
      /@container case-stat-strip \(max-width: 26rem\)[\s\S]*\.value\s*\{[^}]*white-space:\s*normal/,
    );
    expect(css).toMatch(
      /\.item\[data-stat-density='long'\] \.value\s*\{[^}]*white-space:\s*normal/s,
    );
    expect(css).toContain('text-wrap: balance');
    expect(css).not.toContain('text-overflow: ellipsis');
    expect(css).not.toContain('overflow-x: auto');
  });

  it('defines the approved density ranges without negative tracking', () => {
    expect(css).toContain('clamp(1.75rem, 2.5cqi, 2.5rem)');
    expect(css).toContain('clamp(1.625rem, 2.125cqi, 2.125rem)');
    expect(css).toContain('clamp(1.5rem, 1.875cqi, 1.875rem)');
    expect(css).toContain('letter-spacing: 0');
  });
});
