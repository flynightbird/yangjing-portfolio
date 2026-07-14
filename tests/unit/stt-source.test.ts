import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import { contentEntries, getEntry } from '@/content/registry';
import {
  dynamicParams as buildDynamicParams,
  generateStaticParams as generateBuildStaticParams,
} from '@/app/(localized)/[locale]/build/[slug]/page';

const projectRoot = process.cwd();
const pinnedSource = '/tmp/yangjing-stt-demo-inspect';
const fullCommit = 'e5e840af62622123380bb0ef9d016b8da71cfb1c';
const execFileAsync = promisify(execFile);
const temporaryDirectories: string[] = [];

async function makeTemporaryDirectory(prefix: string) {
  const directory = await mkdtemp(resolve(tmpdir(), prefix));
  temporaryDirectories.push(directory);
  return directory;
}

async function loadSynchronizer() {
  const scriptUrl = pathToFileURL(
    resolve(projectRoot, 'scripts/sync-stt-demo.mjs'),
  ).href;
  return import(/* @vite-ignore */ scriptUrl);
}

async function loadContentValidator() {
  const scriptUrl = pathToFileURL(
    resolve(projectRoot, 'scripts/validate-content.mjs'),
  ).href;
  return import(/* @vite-ignore */ scriptUrl);
}

async function clonePinnedSource() {
  const parent = await makeTemporaryDirectory('stt-source-');
  const sourceRoot = resolve(parent, 'source');
  await execFileAsync('git', ['clone', '--quiet', pinnedSource, sourceRoot]);
  return sourceRoot;
}

async function createSttPublicationFixture() {
  const rootDir = await makeTemporaryDirectory('stt-publication-');
  await mkdir(resolve(rootDir, 'evidence/stt-demo'), { recursive: true });
  await mkdir(resolve(rootDir, 'public/demos'), { recursive: true });
  await cp(
    resolve(projectRoot, 'evidence/stt-demo/source.json'),
    resolve(rootDir, 'evidence/stt-demo/source.json'),
  );
  await cp(
    resolve(projectRoot, 'public/demos/stt-demo'),
    resolve(rootDir, 'public/demos/stt-demo'),
    { recursive: true },
  );
  return rootDir;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  );
});

describe('STT demo source provenance', () => {
  it('pins the published prototype to the audited repository revision', async () => {
    const source = JSON.parse(
      await readFile(
        resolve(projectRoot, 'evidence/stt-demo/source.json'),
        'utf8',
      ),
    );

    expect(source).toEqual({
      repository: 'https://github.com/flynightbird/stt-demo',
      commit: 'e5e840a',
      demoPath: '/demos/stt-demo/index.html',
      kind: 'interactive-static-prototype',
    });
  });

  it('provides a testable pinned-source synchronizer', async () => {
    await expect(loadSynchronizer()).resolves.toMatchObject({
      syncSttDemo: expect.any(Function),
    });
  });

  it('provides a composable STT publication validator', async () => {
    await expect(loadContentValidator()).resolves.toMatchObject({
      validateSttDemoPublication: expect.any(Function),
    });
  });

  it('accepts the complete pinned STT publication', async () => {
    const rootDir = await createSttPublicationFixture();
    const { validateSttDemoPublication } = await loadContentValidator();

    await expect(validateSttDemoPublication(rootDir)).resolves.toEqual([]);
  });

  it('rejects a published revision that no longer matches the pin', async () => {
    const rootDir = await createSttPublicationFixture();
    const revisionPath = resolve(
      rootDir,
      'public/demos/stt-demo/source-revision.json',
    );
    const revision = JSON.parse(await readFile(revisionPath, 'utf8'));
    const { validateSttDemoPublication } = await loadContentValidator();
    revision.commit = 'b9a73a6';
    await writeFile(revisionPath, JSON.stringify(revision));

    await expect(validateSttDemoPublication(rootDir)).resolves.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/published.*commit.*e5e840a/i),
      ]),
    );
  });

  it('rejects a published demo with a required asset missing', async () => {
    const rootDir = await createSttPublicationFixture();
    const { validateSttDemoPublication } = await loadContentValidator();
    await rm(
      resolve(rootDir, 'public/demos/stt-demo/assets/participants/video-2.jpg'),
    );

    await expect(validateSttDemoPublication(rootDir)).resolves.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/missing.*participants\/video-2\.jpg/i),
      ]),
    );
  });

  it('composes STT checks into the default content validation command', async () => {
    const validatorSource = await readFile(
      resolve(projectRoot, 'scripts/validate-content.mjs'),
      'utf8',
    );

    expect(validatorSource).toContain("'content/build/stt-demo.en.mdx'");
    expect(validatorSource).toContain("'content/build/stt-demo.zh.mdx'");
    expect(validatorSource).toContain(
      'errors.push(...await validateSttDemoPublication(rootDir))',
    );
  });

  it('copies the complete local prototype and records the full revision', async () => {
    const destinationRoot = await makeTemporaryDirectory('stt-output-');
    const outputDir = resolve(destinationRoot, 'stt-demo');
    const transactionRoot = resolve(destinationRoot, 'transactions');
    const { syncSttDemo } = await loadSynchronizer();

    await syncSttDemo({ sourceRoot: pinnedSource, outputDir, transactionRoot });

    const requiredFiles = [
      'index.html',
      'styles.css',
      'app.js',
      'assets/agora-logo.svg',
      'assets/participants/video-1.jpg',
      'assets/participants/video-2.jpg',
      'assets/participants/video-3.jpg',
      'stt-ui-component-library/packages/stt-ui/src/tokens/tokens.css',
      'stt-ui-component-library/packages/stt-ui/src/styles/components.css',
      'poster.png',
      'source-revision.json',
    ];

    await expect(
      Promise.all(requiredFiles.map((file) => readFile(resolve(outputDir, file)))),
    ).resolves.toHaveLength(requiredFiles.length);
    await expect(
      readFile(resolve(outputDir, 'index.html'), 'utf8'),
    ).resolves.toBe(await readFile(resolve(pinnedSource, 'index.html'), 'utf8'));
    await expect(
      readFile(resolve(outputDir, 'source-revision.json'), 'utf8').then(JSON.parse),
    ).resolves.toEqual({
      repository: 'https://github.com/flynightbird/stt-demo',
      commit: fullCommit,
      pinnedCommit: 'e5e840a',
      kind: 'interactive-static-prototype',
    });
  });

  it('copies every local file referenced by the root document', async () => {
    const destinationRoot = await makeTemporaryDirectory('stt-output-');
    const outputDir = resolve(destinationRoot, 'stt-demo');
    const { syncSttDemo } = await loadSynchronizer();

    await syncSttDemo({
      sourceRoot: pinnedSource,
      outputDir,
      transactionRoot: resolve(destinationRoot, 'transactions'),
    });

    const document = await readFile(resolve(outputDir, 'index.html'), 'utf8');
    const localReferences = [...document.matchAll(/(?:href|src)="([^"#]+)"/g)]
      .map(([, reference]) => reference.split('?')[0])
      .filter((reference) => !/^(?:https?:)?\/\//.test(reference));

    await expect(
      Promise.all(
        localReferences.map((reference) =>
          readFile(resolve(outputDir, reference)),
        ),
      ),
    ).resolves.toHaveLength(localReferences.length);
  });

  it('refuses a source checked out at another commit', async () => {
    const sourceRoot = await clonePinnedSource();
    const destinationRoot = await makeTemporaryDirectory('stt-output-');
    const { syncSttDemo } = await loadSynchronizer();
    await execFileAsync('git', ['-C', sourceRoot, 'checkout', '--quiet', 'HEAD^']);

    await expect(
      syncSttDemo({
        sourceRoot,
        outputDir: resolve(destinationRoot, 'stt-demo'),
        transactionRoot: resolve(destinationRoot, 'transactions'),
      }),
    ).rejects.toThrow(/must begin e5e840a/i);
  });

  it('refuses a required source file that escapes through a symbolic link', async () => {
    const sourceRoot = await clonePinnedSource();
    const destinationRoot = await makeTemporaryDirectory('stt-output-');
    const logoPath = resolve(sourceRoot, 'assets/agora-logo.svg');
    const { syncSttDemo } = await loadSynchronizer();
    await rm(logoPath);
    await symlink('/etc/hosts', logoPath);

    await expect(
      syncSttDemo({
        sourceRoot,
        outputDir: resolve(destinationRoot, 'stt-demo'),
        transactionRoot: resolve(destinationRoot, 'transactions'),
      }),
    ).rejects.toThrow(/escapes source root/i);
  });

  it('keeps the previous published demo intact when validation fails', async () => {
    const sourceRoot = await clonePinnedSource();
    const destinationRoot = await makeTemporaryDirectory('stt-output-');
    const outputDir = resolve(destinationRoot, 'stt-demo');
    const transactionRoot = resolve(destinationRoot, 'transactions');
    const { syncSttDemo } = await loadSynchronizer();
    await mkdir(outputDir, { recursive: true });
    await writeFile(resolve(outputDir, 'keep.txt'), 'previous publication');
    await rm(resolve(sourceRoot, 'assets/participants/video-3.jpg'));

    await expect(
      syncSttDemo({ sourceRoot, outputDir, transactionRoot }),
    ).rejects.toThrow(/required source is missing/i);
    await expect(readFile(resolve(outputDir, 'keep.txt'), 'utf8')).resolves.toBe(
      'previous publication',
    );
    await expect(readdir(outputDir)).resolves.toEqual(['keep.txt']);
  });

  it('registers exactly one bilingual Build Lab project', () => {
    const buildEntries = contentEntries.filter(
      ({ meta }) => meta.type === 'build',
    );

    expect(buildEntries.map(({ meta }) => `${meta.slug}:${meta.locale}`)).toEqual(
      ['stt-demo:en', 'stt-demo:zh'],
    );
    expect(
      new Set(buildEntries.map(({ meta }) => meta.translationKey)),
    ).toEqual(new Set(['build.stt-demo']));

    for (const locale of ['en', 'zh'] as const) {
      expect(getEntry('build', 'stt-demo', locale).meta).toMatchObject({
        type: 'build',
        slug: 'stt-demo',
        locale,
        translationKey: 'build.stt-demo',
        heroMedia: '/demos/stt-demo/poster.png',
        evidenceLevel: 'prototype',
        status: locale === 'en' ? 'Pinned static prototype' : '固定版本静态原型',
      });
    }
  });

  it('provides the Build Lab component boundary', async () => {
    await expect(
      Promise.all(
        [
          'components/build-lab/demo-frame.tsx',
          'components/build-lab/evidence-ledger.tsx',
          'components/build-lab/build-lab.module.css',
        ].map((file) => readFile(resolve(projectRoot, file), 'utf8')),
      ),
    ).resolves.toHaveLength(3);
  });

  it('provides a localized Build Lab route', async () => {
    await expect(
      readFile(
        resolve(projectRoot, 'app/(localized)/[locale]/build/[slug]/page.tsx'),
        'utf8',
      ),
    ).resolves.toContain('generateStaticParams');
  });

  it('generates only the registered bilingual STT build routes', () => {
    expect(buildDynamicParams).toBe(false);
    expect(generateBuildStaticParams()).toEqual([
      { locale: 'en', slug: 'stt-demo' },
      { locale: 'zh', slug: 'stt-demo' },
    ]);
  });

  it.each(['en', 'zh'] as const)(
    'states the full %s prototype boundary without outcome claims',
    async (locale) => {
      const story = await readFile(
        resolve(projectRoot, `content/build/stt-demo.${locale}.mdx`),
        'utf8',
      );
      const normalized = story.toLowerCase();

      const requiredBoundaries =
        locale === 'en'
          ? [
              'no true backend integration',
              'no real sso jump',
              'no actual rtc join',
              'no actual stt stream',
              'no full plugin inner workflow',
              'no mobile subtitle page full detail flow',
            ]
          : [
              '不包含真实后端集成',
              '不包含真实 sso 跳转',
              '不包含实际 rtc 入会',
              '不包含实际 stt 流',
              '不包含完整插件内部流程',
              '不包含移动端字幕页完整详情流程',
            ];

      for (const boundary of requiredBoundaries) {
        expect(normalized).toContain(boundary);
      }
      expect(normalized).not.toMatch(
        /production-ready|shipped product|live demo|currently live|已上线|已交付|生产就绪/,
      );
      expect(normalized).not.toMatch(/\b\d+(?:\.\d+)?%\b/);
    },
  );
});
