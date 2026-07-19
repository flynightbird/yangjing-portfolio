import fsPromises, {
  cp,
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import type { PathLike, RmOptions } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { contentEntries, getEntry } from '@/content/registry';
import {
  dynamicParams as buildDynamicParams,
  default as BuildLabPage,
  generateStaticParams as generateBuildStaticParams,
} from '@/app/(localized)/[locale]/build/[slug]/page';

const projectRoot = process.cwd();
const fullCommit = 'e5e840af62622123380bb0ef9d016b8da71cfb1c';
const execFileAsync = promisify(execFile);
const temporaryDirectories: string[] = [];
const sourceMappings = [
  ['index.html', 'index.html'],
  ['styles.css', 'styles.css'],
  ['app.js', 'app.js'],
  ['assets/agora-logo.svg', 'assets/agora-logo.svg'],
  ['assets/participants/video-1.jpg', 'assets/participants/video-1.jpg'],
  ['assets/participants/video-2.jpg', 'assets/participants/video-2.jpg'],
  ['assets/participants/video-3.jpg', 'assets/participants/video-3.jpg'],
  [
    'stt-ui-component-library/packages/stt-ui/src/tokens/tokens.css',
    'stt-ui-component-library/packages/stt-ui/src/tokens/tokens.css',
  ],
  [
    'stt-ui-component-library/packages/stt-ui/src/styles/components.css',
    'stt-ui-component-library/packages/stt-ui/src/styles/components.css',
  ],
  [
    'stt-ui-component-library/visual-baselines/demo-demo-session-desktop.png',
    'poster.png',
  ],
] as const;

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

async function loadPublicationChecksumWriter() {
  const scriptUrl = pathToFileURL(
    resolve(projectRoot, 'scripts/write-stt-publication-checksums.mjs'),
  ).href;
  return import(/* @vite-ignore */ scriptUrl);
}

async function createSourceFixture() {
  const parent = await makeTemporaryDirectory('stt-source-');
  const sourceRoot = resolve(parent, 'source');
  await mkdir(sourceRoot);
  for (const [source, published] of sourceMappings) {
    const sourcePath = resolve(sourceRoot, source);
    await mkdir(resolve(sourcePath, '..'), { recursive: true });
    const publishedPath = resolve(
      projectRoot,
      'public/demos/stt-demo',
      published,
    );
    if (published === 'index.html') {
      const upstreamHtml = (await readFile(publishedPath, 'utf8'))
        .replace(
          /^\s*<link rel="stylesheet" href="stage-embed\.css" \/>\n/m,
          '',
        )
        .replace(/^\s*<script src="stage-embed\.js"><\/script>\n/m, '');
      await writeFile(sourcePath, upstreamHtml);
    } else {
      await copyFile(publishedPath, sourcePath);
    }
  }
  await execFileAsync('git', ['init', '--quiet', sourceRoot]);
  await execFileAsync('git', ['-C', sourceRoot, 'add', '.']);
  await execFileAsync(
    'git',
    [
      '-C',
      sourceRoot,
      '-c',
      'user.name=STT Fixture',
      '-c',
      'user.email=stt-fixture@example.invalid',
      'commit',
      '--quiet',
      '-m',
      'fixture',
    ],
    {
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: '2026-07-09T00:00:00Z',
        GIT_COMMITTER_DATE: '2026-07-09T00:00:00Z',
      },
    },
  );
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
    resolve(projectRoot, 'evidence/stt-demo/checksums.json'),
    resolve(rootDir, 'evidence/stt-demo/checksums.json'),
  );
  await cp(
    resolve(projectRoot, 'evidence/stt-demo/publication-checksums.json'),
    resolve(rootDir, 'evidence/stt-demo/publication-checksums.json'),
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
      commitSyncedDirectory: expect.any(Function),
      installLocalSttAdaptation: expect.any(Function),
      syncSttDemo: expect.any(Function),
      validateApprovedSourceFiles: expect.any(Function),
    });
  });

  it('separates the upstream snapshot from the adapted publication', async () => {
    const upstream = JSON.parse(
      await readFile(
        resolve(projectRoot, 'evidence/stt-demo/checksums.json'),
        'utf8',
      ),
    );
    const publication = JSON.parse(
      await readFile(
        resolve(projectRoot, 'evidence/stt-demo/publication-checksums.json'),
        'utf8',
      ),
    );

    expect(upstream.files).toHaveLength(11);
    expect(
      upstream.files.map((file: { path: string }) => file.path),
    ).not.toContain('stage-embed.js');
    expect(
      publication.files.map((file: { path: string }) => file.path),
    ).toEqual(
      expect.arrayContaining([
        'index.html',
        'stage-embed.css',
        'stage-embed.js',
      ]),
    );
    expect(publication.files).toHaveLength(13);
  });

  it('installs the local adapter idempotently without changing application bytes', async () => {
    const rootDir = await makeTemporaryDirectory('stt-adapter-');
    const demoRoot = resolve(rootDir, 'stt-demo');
    await cp(resolve(projectRoot, 'public/demos/stt-demo'), demoRoot, {
      recursive: true,
    });
    const indexPath = resolve(demoRoot, 'index.html');
    const upstreamHtml = (await readFile(indexPath, 'utf8'))
      .replace(
        /^\s*<link rel="stylesheet" href="stage-embed\.css" \/>\n/m,
        '',
      )
      .replace(/^\s*<script src="stage-embed\.js"><\/script>\n/m, '');
    await writeFile(indexPath, upstreamHtml);
    const originalApp = await readFile(resolve(demoRoot, 'app.js'));
    const originalStyles = await readFile(resolve(demoRoot, 'styles.css'));
    const { installLocalSttAdaptation } = await loadSynchronizer();

    await installLocalSttAdaptation({
      demoRoot,
      integrationRoot: resolve(projectRoot, 'integrations/stt-demo'),
    });
    const firstInstalledHtml = await readFile(
      indexPath,
      'utf8',
    );
    await installLocalSttAdaptation({
      demoRoot,
      integrationRoot: resolve(projectRoot, 'integrations/stt-demo'),
    });

    const html = await readFile(indexPath, 'utf8');
    expect(html).toBe(firstInstalledHtml);
    expect(html.match(/stage-embed\.css/g)).toHaveLength(1);
    expect(html.match(/stage-embed\.js/g)).toHaveLength(1);
    expect(await readFile(resolve(demoRoot, 'app.js'))).toEqual(originalApp);
    expect(await readFile(resolve(demoRoot, 'styles.css'))).toEqual(
      originalStyles,
    );
    await expect(
      readFile(resolve(demoRoot, 'stage-embed.css')),
    ).resolves.toEqual(
      await readFile(
        resolve(projectRoot, 'integrations/stt-demo/stage-embed.css'),
      ),
    );
    await expect(
      readFile(resolve(demoRoot, 'stage-embed.js')),
    ).resolves.toEqual(
      await readFile(
        resolve(projectRoot, 'integrations/stt-demo/stage-embed.js'),
      ),
    );
  });

  it('rolls back a failed standalone adapter replacement', async () => {
    const rootDir = await makeTemporaryDirectory('stt-adapter-rollback-');
    const demoRoot = resolve(rootDir, 'stt-demo');
    const integrationRoot = resolve(rootDir, 'integration');
    await mkdir(demoRoot);
    await mkdir(integrationRoot);
    await writeFile(resolve(demoRoot, 'index.html'), '<head>\n</head>\n');
    await writeFile(resolve(demoRoot, 'stage-embed.css'), 'old css');
    await writeFile(resolve(demoRoot, 'stage-embed.js'), 'old js');
    await writeFile(resolve(integrationRoot, 'stage-embed.css'), 'new css');
    await writeFile(resolve(integrationRoot, 'stage-embed.js'), 'new js');
    const original = await Promise.all(
      ['index.html', 'stage-embed.css', 'stage-embed.js'].map((file) =>
        readFile(resolve(demoRoot, file)),
      ),
    );
    const { installLocalSttAdaptation } = await loadSynchronizer();
    let injected = false;
    const fileSystem = {
      ...fsPromises,
      rename: async (source: PathLike, destination: PathLike) => {
        if (!injected && destination === demoRoot) {
          injected = true;
          throw new Error('injected adapter replacement failure');
        }
        return fsPromises.rename(source, destination);
      },
    };

    await expect(
      installLocalSttAdaptation({
        demoRoot,
        integrationRoot,
        fileSystem,
      }),
    ).rejects.toThrow(/injected adapter replacement failure/i);
    await expect(
      Promise.all(
        ['index.html', 'stage-embed.css', 'stage-embed.js'].map((file) =>
          readFile(resolve(demoRoot, file)),
        ),
      ),
    ).resolves.toEqual(original);
    expect((await readdir(rootDir)).sort()).toEqual([
      'integration',
      'stt-demo',
    ]);
  });

  it('keeps a committed adapter when transaction cleanup fails', async () => {
    const rootDir = await makeTemporaryDirectory('stt-adapter-cleanup-');
    const demoRoot = resolve(rootDir, 'stt-demo');
    const integrationRoot = resolve(rootDir, 'integration');
    await mkdir(demoRoot);
    await mkdir(integrationRoot);
    await writeFile(resolve(demoRoot, 'index.html'), '<head>\n</head>\n');
    await writeFile(resolve(integrationRoot, 'stage-embed.css'), 'new css');
    await writeFile(resolve(integrationRoot, 'stage-embed.js'), 'new js');
    const { installLocalSttAdaptation } = await loadSynchronizer();
    let transactionDirectory: string | undefined;
    const cleanupError = new Error('injected transaction cleanup failure');
    const fileSystem = {
      ...fsPromises,
      mkdtemp: async (prefix: string) => {
        transactionDirectory = await fsPromises.mkdtemp(prefix);
        return transactionDirectory;
      },
      rm: async (target: PathLike, options?: RmOptions) => {
        if (target === transactionDirectory) throw cleanupError;
        return fsPromises.rm(target, options);
      },
    };

    await expect(
      installLocalSttAdaptation({
        demoRoot,
        integrationRoot,
        fileSystem,
      }),
    ).resolves.toBeUndefined();
    await expect(readFile(resolve(demoRoot, 'stage-embed.css'), 'utf8')).resolves
      .toBe('new css');
    await expect(readFile(resolve(demoRoot, 'stage-embed.js'), 'utf8')).resolves
      .toBe('new js');
    await expect(readFile(resolve(demoRoot, 'index.html'), 'utf8')).resolves
      .toContain('stage-embed.js');
  });

  it('preserves a staging error when transaction cleanup also fails', async () => {
    const rootDir = await makeTemporaryDirectory(
      'stt-adapter-staging-cleanup-',
    );
    const demoRoot = resolve(rootDir, 'stt-demo');
    const integrationRoot = resolve(rootDir, 'integration');
    await mkdir(demoRoot);
    await mkdir(integrationRoot);
    await writeFile(resolve(demoRoot, 'index.html'), '<head>\n</head>\n');
    await writeFile(resolve(integrationRoot, 'stage-embed.css'), 'new css');
    await writeFile(resolve(integrationRoot, 'stage-embed.js'), 'new js');
    const { installLocalSttAdaptation } = await loadSynchronizer();
    let transactionDirectory: string | undefined;
    const stagingError = new Error('injected adapter staging failure');
    const cleanupError = new Error('injected transaction cleanup failure');
    const fileSystem = {
      ...fsPromises,
      mkdtemp: async (prefix: string) => {
        transactionDirectory = await fsPromises.mkdtemp(prefix);
        return transactionDirectory;
      },
      copyFile: async () => {
        throw stagingError;
      },
      rm: async (target: PathLike, options?: RmOptions) => {
        if (target === transactionDirectory) throw cleanupError;
        return fsPromises.rm(target, options);
      },
    };

    let rejection: unknown;
    try {
      await installLocalSttAdaptation({
        demoRoot,
        integrationRoot,
        fileSystem,
      });
    } catch (error) {
      rejection = error;
    }

    expect(rejection).toBeDefined();
    if (rejection instanceof AggregateError) {
      expect(rejection.errors[0]).toBe(stagingError);
    } else {
      expect(rejection).toBe(stagingError);
    }
  });

  it('atomically replaces the STT publication checksum contract', async () => {
    const rootDir = await makeTemporaryDirectory('stt-checksum-write-');
    const demoRoot = resolve(rootDir, 'demo');
    const outputPath = resolve(rootDir, 'publication-checksums.json');
    await mkdir(demoRoot);
    await writeFile(resolve(demoRoot, 'z-last.txt'), 'last');
    await writeFile(resolve(demoRoot, 'a-first.txt'), 'first');
    await writeFile(outputPath, 'old contract');
    const { writeSttPublicationChecksums } =
      await loadPublicationChecksumWriter();

    await writeSttPublicationChecksums({ demoRoot, outputPath });

    const output = await readFile(outputPath, 'utf8');
    const contract = JSON.parse(output);
    expect(output.endsWith('\n')).toBe(true);
    expect(contract.files.map((file: { path: string }) => file.path)).toEqual([
      'a-first.txt',
      'z-last.txt',
    ]);
    expect((await readdir(rootDir)).sort()).toEqual([
      'demo',
      'publication-checksums.json',
    ]);
  });

  it('preserves the checksum contract when atomic replacement fails', async () => {
    const rootDir = await makeTemporaryDirectory('stt-checksum-rollback-');
    const demoRoot = resolve(rootDir, 'demo');
    const outputPath = resolve(rootDir, 'publication-checksums.json');
    await mkdir(demoRoot);
    await writeFile(resolve(demoRoot, 'index.html'), 'demo');
    await writeFile(outputPath, 'old contract');
    const { writeSttPublicationChecksums } =
      await loadPublicationChecksumWriter();
    const fileSystem = {
      ...fsPromises,
      rename: async () => {
        throw new Error('injected checksum replacement failure');
      },
    };

    await expect(
      writeSttPublicationChecksums({ demoRoot, outputPath, fileSystem }),
    ).rejects.toThrow(/injected checksum replacement failure/i);
    await expect(readFile(outputPath, 'utf8')).resolves.toBe('old contract');
    expect((await readdir(rootDir)).sort()).toEqual([
      'demo',
      'publication-checksums.json',
    ]);
  });

  it('commits an exact checksum contract for every published file', async () => {
    const contract = JSON.parse(
      await readFile(
        resolve(projectRoot, 'evidence/stt-demo/checksums.json'),
        'utf8',
      ),
    );
    const paths = contract.files.map((file: { path: string }) => file.path);

    expect(contract.version).toBe(1);
    expect(paths).toHaveLength(11);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(
      expect.arrayContaining([
        'index.html',
        'poster.png',
        'source-revision.json',
      ]),
    );
    for (const file of contract.files) {
      expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
    }
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

  it('rejects a same-prefix revision even when its approved checksum matches', async () => {
    const rootDir = await createSttPublicationFixture();
    const revisionPath = resolve(
      rootDir,
      'public/demos/stt-demo/source-revision.json',
    );
    const contractPath = resolve(rootDir, 'evidence/stt-demo/checksums.json');
    const revision = JSON.parse(await readFile(revisionPath, 'utf8'));
    revision.commit = 'e5e840a-not-a-full-git-sha';
    const revisionBytes = Buffer.from(`${JSON.stringify(revision, null, 2)}\n`);
    await writeFile(revisionPath, revisionBytes);

    const contract = JSON.parse(await readFile(contractPath, 'utf8'));
    const approvedRevision = contract.files.find(
      (file: { path: string }) => file.path === 'source-revision.json',
    );
    approvedRevision.sha256 = createHash('sha256')
      .update(revisionBytes)
      .digest('hex');
    await writeFile(contractPath, JSON.stringify(contract));

    const { validateSttDemoPublication } = await loadContentValidator();
    await expect(validateSttDemoPublication(rootDir)).resolves.toEqual(
      expect.arrayContaining([
        expect.stringMatching(new RegExp(`published.*commit.*${fullCommit}`, 'i')),
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

  it('rejects published byte tampering', async () => {
    const rootDir = await createSttPublicationFixture();
    const { validateSttDemoPublication } = await loadContentValidator();
    await writeFile(
      resolve(rootDir, 'public/demos/stt-demo/app.js'),
      'tampered bytes',
    );

    await expect(validateSttDemoPublication(rootDir)).resolves.toEqual(
      expect.arrayContaining([expect.stringMatching(/checksum.*app\.js/i)]),
    );
  });

  it('rejects unexpected published files', async () => {
    const rootDir = await createSttPublicationFixture();
    const { validateSttDemoPublication } = await loadContentValidator();
    await writeFile(
      resolve(rootDir, 'public/demos/stt-demo/unapproved.txt'),
      'not approved',
    );

    await expect(validateSttDemoPublication(rootDir)).resolves.toEqual(
      expect.arrayContaining([expect.stringMatching(/unexpected.*unapproved\.txt/i)]),
    );
  });

  it.each([
    ['missing', (files: unknown[]) => files.slice(1)],
    ['duplicate', (files: unknown[]) => [...files, files[0]]],
    [
      'unexpected',
      (files: unknown[]) => [
        ...files,
        { path: 'unapproved.txt', sha256: '0'.repeat(64) },
      ],
    ],
  ])('rejects %s checksum coverage', async (_, mutate) => {
    const rootDir = await createSttPublicationFixture();
    const contractPath = resolve(
      rootDir,
      'evidence/stt-demo/publication-checksums.json',
    );
    const contract = JSON.parse(await readFile(contractPath, 'utf8'));
    const { validateSttDemoPublication } = await loadContentValidator();
    contract.files = mutate(contract.files);
    await writeFile(contractPath, JSON.stringify(contract));

    await expect(validateSttDemoPublication(rootDir)).resolves.toEqual(
      expect.arrayContaining([expect.stringMatching(/checksum contract/i)]),
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

  it('uses only repository-controlled bytes for portable source fixtures', async () => {
    const sourceRoot = await createSourceFixture();
    const { loadApprovedChecksums, validateApprovedSourceFiles } =
      await loadSynchronizer();
    const contract = await loadApprovedChecksums();

    await expect(
      validateApprovedSourceFiles(sourceRoot, contract),
    ).resolves.toHaveLength(10);
    const document = await readFile(resolve(sourceRoot, 'index.html'), 'utf8');
    const localReferences = [...document.matchAll(/(?:href|src)="([^"#]+)"/g)]
      .map(([, reference]) => reference.split('?')[0])
      .filter((reference) => !/^(?:https?:)?\/\//.test(reference));
    await expect(
      Promise.all(
        localReferences.map((reference) =>
          readFile(resolve(sourceRoot, reference)),
        ),
      ),
    ).resolves.toHaveLength(localReferences.length);
  });

  it('refuses a source checked out at another commit', async () => {
    const sourceRoot = await createSourceFixture();
    const destinationRoot = await makeTemporaryDirectory('stt-output-');
    const { syncSttDemo } = await loadSynchronizer();

    await expect(
      syncSttDemo({
        sourceRoot,
        outputDir: resolve(destinationRoot, 'stt-demo'),
        transactionRoot: resolve(destinationRoot, 'transactions'),
      }),
    ).rejects.toThrow(new RegExp(fullCommit, 'i'));
  });

  it('refuses a required source file that escapes through a symbolic link', async () => {
    const sourceRoot = await createSourceFixture();
    const logoPath = resolve(sourceRoot, 'assets/agora-logo.svg');
    const { loadApprovedChecksums, validateApprovedSourceFiles } =
      await loadSynchronizer();
    await rm(logoPath);
    await symlink('/etc/hosts', logoPath);

    await expect(
      validateApprovedSourceFiles(sourceRoot, await loadApprovedChecksums()),
    ).rejects.toThrow(/escapes source root/i);
  });

  it('rejects dirty required source bytes even when they are committed bytes originally', async () => {
    const sourceRoot = await createSourceFixture();
    const appPath = resolve(sourceRoot, 'app.js');
    const { loadApprovedChecksums, validateApprovedSourceFiles } =
      await loadSynchronizer();
    await writeFile(appPath, `${await readFile(appPath, 'utf8')}\n// dirty`);
    const status = await execFileAsync('git', [
      '-C',
      sourceRoot,
      'status',
      '--porcelain',
    ]);
    expect(status.stdout).not.toBe('');

    await expect(
      validateApprovedSourceFiles(sourceRoot, await loadApprovedChecksums()),
    ).rejects.toThrow(/checksum.*app\.js/i);
  });

  it('rolls back the previous publication when installation fails', async () => {
    const rootDir = await makeTemporaryDirectory('stt-install-rollback-');
    const outputDir = resolve(rootDir, 'output');
    const temporaryDir = resolve(rootDir, 'staged');
    const backupDir = resolve(rootDir, 'backup');
    await mkdir(outputDir);
    await mkdir(temporaryDir);
    await writeFile(resolve(outputDir, 'index.html'), 'old publication');
    await writeFile(resolve(temporaryDir, 'index.html'), 'new publication');
    const { commitSyncedDirectory } = await loadSynchronizer();
    const fileSystem = {
      ...fsPromises,
      rename: async (source: PathLike, destination: PathLike) => {
        if (source === temporaryDir && destination === outputDir) {
          throw new Error('injected install failure');
        }
        return fsPromises.rename(source, destination);
      },
    };

    await expect(
      commitSyncedDirectory({
        fileSystem,
        outputDir,
        temporaryDir,
        backupDir,
      }),
    ).rejects.toThrow(/injected install failure/i);
    await expect(readFile(resolve(outputDir, 'index.html'), 'utf8')).resolves.toBe(
      'old publication',
    );
    await expect(readFile(backupDir)).rejects.toThrow();
  });

  it('retries backup cleanup after a committed installation', async () => {
    const rootDir = await makeTemporaryDirectory('stt-cleanup-retry-');
    const outputDir = resolve(rootDir, 'output');
    const temporaryDir = resolve(rootDir, 'staged');
    const backupDir = resolve(rootDir, 'backup');
    await mkdir(outputDir);
    await mkdir(temporaryDir);
    await writeFile(resolve(outputDir, 'index.html'), 'old publication');
    await writeFile(resolve(temporaryDir, 'index.html'), 'new publication');
    const { commitSyncedDirectory } = await loadSynchronizer();
    let attempts = 0;
    const fileSystem = {
      ...fsPromises,
      rm: async (target: PathLike, options?: RmOptions) => {
        if (target === backupDir && ++attempts === 1) {
          throw new Error('injected cleanup failure');
        }
        return fsPromises.rm(target, options);
      },
    };

    await commitSyncedDirectory({
      fileSystem,
      outputDir,
      temporaryDir,
      backupDir,
    });

    expect(attempts).toBe(2);
    await expect(readFile(resolve(outputDir, 'index.html'), 'utf8')).resolves.toBe(
      'new publication',
    );
    await expect(readFile(backupDir)).rejects.toThrow();
  });

  it('keeps a recoverable backup when post-commit cleanup repeatedly fails', async () => {
    const rootDir = await makeTemporaryDirectory('stt-cleanup-backup-');
    const outputDir = resolve(rootDir, 'output');
    const temporaryDir = resolve(rootDir, 'staged');
    const backupDir = resolve(rootDir, 'backup');
    await mkdir(outputDir);
    await mkdir(temporaryDir);
    await writeFile(resolve(outputDir, 'index.html'), 'old publication');
    await writeFile(resolve(temporaryDir, 'index.html'), 'new publication');
    const { commitSyncedDirectory } = await loadSynchronizer();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fileSystem = {
      ...fsPromises,
      rm: async (target: PathLike, options?: RmOptions) => {
        if (target === backupDir) throw new Error('persistent cleanup failure');
        return fsPromises.rm(target, options);
      },
    };

    await commitSyncedDirectory({
      fileSystem,
      outputDir,
      temporaryDir,
      backupDir,
    });

    expect(warning).toHaveBeenCalledOnce();
    await expect(readFile(resolve(outputDir, 'index.html'), 'utf8')).resolves.toBe(
      'new publication',
    );
    await expect(readFile(resolve(backupDir, 'index.html'), 'utf8')).resolves.toBe(
      'old publication',
    );
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
        featuredOrder: 5,
        previousSlug: 'tangping',
        status: locale === 'en' ? 'Pinned static prototype' : '固定版本静态原型',
      });
      expect(getEntry('build', 'stt-demo', locale).meta.nextSlug).toBeUndefined();
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
    'links the %s Build Lab route back to the registered Tangping case',
    async (locale) => {
      const page = await BuildLabPage({
        params: Promise.resolve({ locale, slug: 'stt-demo' }),
      });

      expect(page.props).toHaveProperty('previous', {
        href: `/${locale}/work/tangping/`,
        title: locale === 'en'
          ? 'Tangping Designer'
          : '躺平设计家',
      });
      expect(page.props).toHaveProperty('next', undefined);
    },
  );

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
