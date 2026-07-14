import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('static portfolio architecture', () => {
  it('uses Next static export and MDX', () => {
    const nextConfig = fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8');
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
    );

    expect(nextConfig).toContain("output: 'export'");
    expect(nextConfig).toContain("pageExtensions: ['ts', 'tsx', 'md', 'mdx']");
    expect(packageJson.scripts.build).toBe('next build');
  });

  it('wires deterministic export verification after a fresh framework build', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
    );
    const scripts = packageJson.scripts as Record<string, string>;

    expect(scripts['build:framework']).toBe('next build');
    expect(scripts['test:export']).toBe(
      'node --test tests/export/*.test.mjs',
    );
    expect(scripts['test:e2e:export']).toBe(
      'playwright test --config=playwright.export.config.mjs',
    );
    expect(scripts['verify:export']).toBe(
      'npm run build:framework && npm run test:export && npm run test:e2e:export',
    );
    expect(scripts['verify:publish']).toBe(
      'node scripts/validate-publication.mjs && npm run lint && npm test && npm run verify:export && npm run test:e2e',
    );
  });

  it('keeps the legacy browser suite explicitly deferred for migration', () => {
    const playwrightConfig = fs.readFileSync(
      path.join(root, 'playwright.config.mjs'),
      'utf8',
    );
    const exportPlaywrightConfig = fs.readFileSync(
      path.join(root, 'playwright.export.config.mjs'),
      'utf8',
    );

    expect(fs.existsSync(path.join(root, 'tests/case-study.spec.mjs'))).toBe(
      true,
    );
    expect(playwrightConfig).toContain(
      'Legacy Call Agent browser coverage remains tracked for Task 8 migration.',
    );
    expect(exportPlaywrightConfig).toContain('reuseExistingServer: false');
  });
});
