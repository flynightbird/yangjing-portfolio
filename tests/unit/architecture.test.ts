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
    expect(packageJson.scripts.build).toBe(
      'node scripts/validate-publication.mjs --mode=source && next build && node scripts/validate-publication.mjs --mode=output',
    );
  });

  it('builds GitHub Pages with the repository base path', () => {
    const nextConfig = fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8');
    const deployment = fs.readFileSync(
      path.join(root, '.github/workflows/deploy.yml'),
      'utf8',
    );

    expect(nextConfig).toContain('NEXT_PUBLIC_BASE_PATH');
    expect(nextConfig).toContain('basePath,');
    expect(deployment).toContain('NEXT_PUBLIC_BASE_PATH: /yangjing-portfolio');
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
      'npm run lint && npm test && npm run build && npm run test:e2e',
    );
    expect(scripts['validate:content']).toBe(
      'node scripts/validate-content.mjs',
    );
  });

  it('runs Call Agent coverage from the native Next route suite', () => {
    const playwrightConfig = fs.readFileSync(
      path.join(root, 'playwright.config.mjs'),
      'utf8',
    );
    const exportPlaywrightConfig = fs.readFileSync(
      path.join(root, 'playwright.export.config.mjs'),
      'utf8',
    );

    expect(fs.existsSync(path.join(root, 'tests/case-study.spec.mjs'))).toBe(false);
    expect(
      fs.existsSync(path.join(root, 'tests/e2e/call-agent.spec.ts')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(root, 'tests/e2e/tangping.spec.ts')),
    ).toBe(true);
    expect(playwrightConfig).toContain("testDir: './tests/e2e'");
    expect(exportPlaywrightConfig).toContain('reuseExistingServer: false');
  });

  it('declares the document smooth-scroll contract for Next route changes', () => {
    for (const layout of [
      'app/(root)/layout.tsx',
      'app/(localized)/[locale]/layout.tsx',
    ]) {
      const source = fs.readFileSync(path.join(root, layout), 'utf8');
      expect(source, layout).toContain('data-scroll-behavior="smooth"');
    }
  });

  it('documents only working portfolio commands and the current dev server', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
    );
    const scripts = packageJson.scripts as Record<string, string>;
    const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
    const documentedScripts = [...readme.matchAll(/npm run ([\w:-]+)/g)].map(
      ([, script]) => script,
    );

    for (const script of documentedScripts) {
      expect(scripts, `README command npm run ${script}`).toHaveProperty(script);
    }
    expect(readme).toContain('CALL_AGENT_SOURCE_ROOT');
    expect(readme).toContain('npm run prepare:assets');
    expect(readme).toContain('npm run dev');
    expect(readme).toContain('http://localhost:3000');
    expect(readme).toContain('npm run validate:content');
    expect(readme).toContain('npm run verify:publish');
    expect(readme).not.toContain('127.0.0.1:5173');
    expect(readme).not.toContain('导出 PDF');
  });

  it('does not use thick or coral side stripes in the case-study CSS', () => {
    const caseCss = fs.readFileSync(
      path.join(root, 'components/case-study/case-layout.module.css'),
      'utf8',
    );
    const inlineStartBorders = [
      ...caseCss.matchAll(/border-inline-start:\s*([^;]+);/g),
    ].map(([, value]) => value);

    for (const border of inlineStartBorders) {
      expect(border).not.toMatch(/(?:[2-9]|\d{2,})px|coral/i);
    }
  });

  it('keeps public CSS resources inside the deployed site base path', () => {
    for (const directory of ['app', 'components']) {
      const files = fs.readdirSync(path.join(root, directory), {
        recursive: true,
        withFileTypes: true,
      });

      for (const file of files) {
        if (!file.isFile() || !file.name.endsWith('.css')) continue;
        const source = fs.readFileSync(path.join(file.parentPath, file.name), 'utf8');
        expect(source, path.relative(root, path.join(file.parentPath, file.name))).not.toMatch(
          /url\(\s*['"]?\//,
        );
      }
    }
  });
});
