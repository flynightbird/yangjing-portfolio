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
});
