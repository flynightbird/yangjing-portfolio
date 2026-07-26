import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  type PathLike,
  type RmOptions,
} from 'node:fs';
import { createHash } from 'node:crypto';
import fsPromises from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import {
  findSensitiveText,
  validateSite,
  validateManifestEntry,
} from '@/scripts/validate-content.mjs';

interface ManifestAsset {
  readonly source: string;
  readonly output?: string;
  readonly chapter?: string;
  readonly purpose?: string;
  readonly alt?: string;
}

interface CallAgentManifest {
  readonly assets: readonly ManifestAsset[];
  readonly excluded: readonly ManifestAsset[];
}

const repositoryRoot = process.cwd();
const manifestPath = path.join(
  repositoryRoot,
  'evidence/call-agent/manifest.json',
);
const temporaryRoots: string[] = [];
const approvedFiles = (
  JSON.parse(readFileSync(path.join(repositoryRoot, 'evidence/call-agent/checksums.json'), 'utf8')) as {
    files: Array<{ path: string; sha256: string; kind: string }>;
  }
).files.map(({ path: file, sha256, kind }) => [file, sha256, kind] as const);

function createTemporaryRoot(prefix: string): string {
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), prefix));
  temporaryRoots.push(temporaryRoot);
  return temporaryRoot;
}

function createValidationFixture() {
  const fixtureRoot = createTemporaryRoot('call-agent-validation-');
  mkdirSync(path.join(fixtureRoot, 'evidence/call-agent'), { recursive: true });
  mkdirSync(path.join(fixtureRoot, 'public/files'), { recursive: true });
  mkdirSync(path.join(fixtureRoot, 'public/images/call-agent'), {
    recursive: true,
  });
  mkdirSync(path.join(fixtureRoot, 'public/videos/call-agent'), {
    recursive: true,
  });
  cpSync(
    path.join(repositoryRoot, 'evidence/call-agent/manifest.json'),
    path.join(fixtureRoot, 'evidence/call-agent/manifest.json'),
  );
  cpSync(
    path.join(repositoryRoot, 'evidence/call-agent/video-manifest.json'),
    path.join(fixtureRoot, 'evidence/call-agent/video-manifest.json'),
  );
  for (const [relativePath] of approvedFiles) {
    cpSync(
      path.join(repositoryRoot, relativePath),
      path.join(fixtureRoot, relativePath),
    );
  }
  writeFileSync(
    path.join(fixtureRoot, 'evidence/call-agent/checksums.json'),
    JSON.stringify({
      version: 1,
      files: approvedFiles.map(([file, sha256, kind]) => ({
        path: file,
        sha256,
        kind,
      })),
    }),
  );
  return fixtureRoot;
}

async function validateFixture(rootDir: string): Promise<string[]> {
  const validate = validateSite as unknown as (options: {
    rootDir: string;
    contentPaths?: readonly string[];
  }) => Promise<string[]> | string[];
  return await validate({ rootDir, contentPaths: [] });
}

function runPrepareAssets(options: {
  sourceRoot: string;
  manifestPath: string;
  outputDir: string;
}) {
  const scriptUrl = pathToFileURL(
    path.join(repositoryRoot, 'scripts/prepare-call-agent-assets.mjs'),
  ).href;
  const invocation = `
    import { prepareCallAgentAssets } from ${JSON.stringify(scriptUrl)};
    await prepareCallAgentAssets(${JSON.stringify(options)});
  `;
  return spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', invocation],
    {
      cwd: repositoryRoot,
      env: { ...process.env, CALL_AGENT_SOURCE_ROOT: options.sourceRoot },
      encoding: 'utf8',
    },
  );
}

afterEach(() => {
  for (const temporaryRoot of temporaryRoots.splice(0)) {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

function readManifest(): CallAgentManifest {
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as CallAgentManifest;
}

describe('Call Agent privacy controls', () => {
  it('validates the chapter IDs declared by each MDX document', async () => {
    const rootDir = createValidationFixture();
    const contentPath = path.join(rootDir, 'xuelang.mdx');
    writeFileSync(
      contentPath,
      `export const metadata = {
        chapters: [
          { id: 'overview', label: 'Overview' },
          { id: 'business', label: 'Business' },
        ],
      }

      <section id="overview" />
      <section id="business" />`,
    );

    const validate = validateSite as unknown as (options: {
      rootDir: string;
      contentPaths: readonly string[];
    }) => Promise<string[]>;
    const errors = await validate({ rootDir, contentPaths: [contentPath] });

    expect(errors.filter((error) => error.startsWith('missing chapter'))).toEqual([]);
  });

  it('flags authorization tokens and unmasked phone numbers', () => {
    expect(findSensitiveText('Authorization: Bearer abc.def.ghi')).toEqual([
      'authorization token',
    ]);
    expect(findSensitiveText('+86 138 1234 5678')).toEqual(['phone number']);
  });

  it('flags account and internal identifiers while allowing public email', () => {
    expect(findSensitiveText('account_id=acc_82HF91KQ')).toEqual([
      'account or internal identifier',
    ]);
    expect(findSensitiveText('hello@example.com')).toEqual([]);
    expect(findSensitiveText('<article data-project-id="call-agent">')).toEqual([]);
  });

  it('flags international phone formats and literal internal identifiers', () => {
    expect(findSensitiveText('+1 (415) 555-2671')).toContain('phone number');
    expect(findSensitiveText('+1 4155552671')).toContain('phone number');
    expect(findSensitiveText('010-1234-5678')).toContain('phone number');
    expect(findSensitiveText('internal_id: int_82HF91KQ')).toContain(
      'account or internal identifier',
    );
  });

  it('requires evidence provenance and accessible descriptions', () => {
    expect(validateManifestEntry({ output: 'preview.png' })).toEqual([
      'missing source',
      'missing chapter',
      'missing purpose',
      'missing alt',
    ]);
  });

  it('keeps every source portable under CALL_AGENT_SOURCE_ROOT', () => {
    const manifest = readManifest();
    const sources = [...manifest.assets, ...manifest.excluded].map(
      ({ source }) => source,
    );

    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      expect(path.isAbsolute(source), source).toBe(false);
      expect(source.split(/[\\/]/)).not.toContain('..');
    }
  });

  it('never promotes an excluded authorization-token capture to an output', () => {
    const manifest = readManifest();
    const outputs = new Set(manifest.assets.map(({ output }) => output));

    expect(manifest.excluded).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reason: 'contains a visible authorization token' }),
      ]),
    );
    for (const excluded of manifest.excluded) {
      expect(outputs.has(excluded.output)).toBe(false);
    }
  });

  it('fails clearly when CALL_AGENT_SOURCE_ROOT is unavailable', () => {
    const env = { ...process.env };
    delete env.CALL_AGENT_SOURCE_ROOT;

    const result = spawnSync(
      process.execPath,
      ['scripts/prepare-call-agent-assets.mjs'],
      { cwd: repositoryRoot, env, encoding: 'utf8' },
    );

    expect(result.status).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(
      /CALL_AGENT_SOURCE_ROOT.*readable directory/i,
    );
  });

  it('rejects a same-name public asset whose approved bytes changed', async () => {
    const fixtureRoot = createValidationFixture();
    writeFileSync(
      path.join(
        fixtureRoot,
        'public/images/call-agent/ai-preview-live.png',
      ),
      'unapproved replacement',
    );

    expect(await validateFixture(fixtureRoot)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/checksum mismatch.*ai-preview-live\.png/i),
      ]),
    );
  });

  it('allows unrelated project files in the shared public files directory', async () => {
    const fixtureRoot = createValidationFixture();
    writeFileSync(
      path.join(fixtureRoot, 'public/files/other-project.pdf'),
      '%PDF-1.7\nunrelated approved project',
    );

    expect(await validateFixture(fixtureRoot)).toEqual([]);
  });

  it('rejects an expected image path that is a directory', async () => {
    const fixtureRoot = createValidationFixture();
    const imagePath = path.join(
      fixtureRoot,
      'public/images/call-agent/ai-preview-live.png',
    );
    rmSync(imagePath);
    mkdirSync(imagePath);

    expect(await validateFixture(fixtureRoot)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/not a regular file.*ai-preview-live\.png/i),
      ]),
    );
  });

  it('rejects an expected image symlink that resolves outside the root', async () => {
    const fixtureRoot = createValidationFixture();
    const outsideRoot = createTemporaryRoot('call-agent-public-symlink-');
    const outsideImage = path.join(outsideRoot, 'ai-preview-live.png');
    cpSync(
      path.join(
        repositoryRoot,
        'public/images/call-agent/ai-preview-live.png',
      ),
      outsideImage,
    );
    const imagePath = path.join(
      fixtureRoot,
      'public/images/call-agent/ai-preview-live.png',
    );
    rmSync(imagePath);
    symlinkSync(outsideImage, imagePath);

    expect(await validateFixture(fixtureRoot)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/resolves outside.*ai-preview-live\.png/i),
      ]),
    );
  });

  it('rejects duplicate manifest outputs before publication', async () => {
    const fixtureRoot = createValidationFixture();
    const fixtureManifestPath = path.join(
      fixtureRoot,
      'evidence/call-agent/manifest.json',
    );
    const manifest = JSON.parse(readFileSync(fixtureManifestPath, 'utf8'));
    manifest.assets.push({ ...manifest.assets[0] });
    writeFileSync(fixtureManifestPath, JSON.stringify(manifest));

    expect(await validateFixture(fixtureRoot)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/duplicate output.*ai-preview-live\.png/i),
      ]),
    );
  });

  it('rejects source symlinks that resolve outside the source root', () => {
    const fixtureRoot = createTemporaryRoot('call-agent-symlink-');
    const sourceRoot = path.join(fixtureRoot, 'source');
    const outsideRoot = path.join(fixtureRoot, 'outside');
    const outputDir = path.join(fixtureRoot, 'output');
    mkdirSync(sourceRoot);
    mkdirSync(outsideRoot);
    cpSync(
      path.join(
        repositoryRoot,
        'public/images/call-agent/product-switcher.png',
      ),
      path.join(outsideRoot, 'outside.png'),
    );
    symlinkSync(
      path.join(outsideRoot, 'outside.png'),
      path.join(sourceRoot, 'linked.png'),
    );
    const fixtureManifestPath = path.join(fixtureRoot, 'manifest.json');
    writeFileSync(
      fixtureManifestPath,
      JSON.stringify({
        assets: [{ source: 'linked.png', output: 'linked.png' }],
      }),
    );

    const result = runPrepareAssets({
      sourceRoot,
      manifestPath: fixtureManifestPath,
      outputDir,
    });
    expect(result.status).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(
      /source.*symlink|resolves outside|escapes.*source root/i,
    );
  });

  it('rejects duplicate outputs before processing any asset', () => {
    const fixtureRoot = createTemporaryRoot('call-agent-collision-');
    const sourceRoot = path.join(fixtureRoot, 'source');
    const outputDir = path.join(fixtureRoot, 'output');
    mkdirSync(sourceRoot);
    mkdirSync(outputDir);
    cpSync(
      path.join(
        repositoryRoot,
        'public/images/call-agent/product-switcher.png',
      ),
      path.join(sourceRoot, 'source.png'),
    );
    writeFileSync(path.join(outputDir, 'approved.png'), 'approved bytes');
    const fixtureManifestPath = path.join(fixtureRoot, 'manifest.json');
    writeFileSync(
      fixtureManifestPath,
      JSON.stringify({
        assets: [
          { source: 'source.png', output: 'collision.png' },
          { source: 'source.png', output: 'collision.png' },
        ],
      }),
    );

    const result = runPrepareAssets({
      sourceRoot,
      manifestPath: fixtureManifestPath,
      outputDir,
    });
    expect(result.status).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(
      /duplicate manifest output.*collision\.png/i,
    );
    expect(readFileSync(path.join(outputDir, 'approved.png'), 'utf8')).toBe(
      'approved bytes',
    );
  });

  it('preserves approved outputs when any source fails preflight', () => {
    const fixtureRoot = createTemporaryRoot('call-agent-transaction-');
    const sourceRoot = path.join(fixtureRoot, 'source');
    const outputDir = path.join(fixtureRoot, 'output');
    mkdirSync(sourceRoot);
    mkdirSync(outputDir);
    cpSync(
      path.join(
        repositoryRoot,
        'public/images/call-agent/product-switcher.png',
      ),
      path.join(sourceRoot, 'source.png'),
    );
    writeFileSync(path.join(outputDir, 'existing.png'), 'approved original');
    const fixtureManifestPath = path.join(fixtureRoot, 'manifest.json');
    writeFileSync(
      fixtureManifestPath,
      JSON.stringify({
        assets: [
          { source: 'source.png', output: 'existing.png' },
          { source: 'missing.png', output: 'missing.png' },
        ],
      }),
    );

    const result = runPrepareAssets({
      sourceRoot,
      manifestPath: fixtureManifestPath,
      outputDir,
    });
    expect(result.status).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toContain('missing.png');
    expect(readFileSync(path.join(outputDir, 'existing.png'), 'utf8')).toBe(
      'approved original',
    );
    expect(
      readdirSync(fixtureRoot).some((name) => name.includes('.tmp-')),
    ).toBe(false);
  });

  it('rolls back the old output when installing the prepared directory fails', async () => {
    const fixtureRoot = createTemporaryRoot('call-agent-install-rollback-');
    const outputDir = path.join(fixtureRoot, 'output');
    const temporaryDir = path.join(fixtureRoot, 'prepared');
    const backupDir = path.join(fixtureRoot, 'private-backup');
    mkdirSync(outputDir);
    mkdirSync(temporaryDir);
    writeFileSync(path.join(outputDir, 'asset.png'), 'old approved');
    writeFileSync(path.join(temporaryDir, 'asset.png'), 'new prepared');
    const assetModule = await import('@/scripts/prepare-call-agent-assets.mjs');
    expect(assetModule).toHaveProperty('commitPreparedDirectory');
    if (typeof assetModule.commitPreparedDirectory !== 'function') return;

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
      assetModule.commitPreparedDirectory({
        fileSystem,
        outputDir,
        temporaryDir,
        backupDir,
      }),
    ).rejects.toThrow(/injected install failure/i);
    expect(readFileSync(path.join(outputDir, 'asset.png'), 'utf8')).toBe(
      'old approved',
    );
    expect(() => readFileSync(backupDir)).toThrow();
  });

  it('retries private backup cleanup without failing after commit', async () => {
    const fixtureRoot = createTemporaryRoot('call-agent-cleanup-retry-');
    const outputDir = path.join(fixtureRoot, 'output');
    const temporaryDir = path.join(fixtureRoot, 'prepared');
    const backupDir = path.join(fixtureRoot, 'private-backup');
    mkdirSync(outputDir);
    mkdirSync(temporaryDir);
    writeFileSync(path.join(outputDir, 'asset.png'), 'old approved');
    writeFileSync(path.join(temporaryDir, 'asset.png'), 'new prepared');
    const assetModule = await import('@/scripts/prepare-call-agent-assets.mjs');
    expect(assetModule).toHaveProperty('commitPreparedDirectory');
    if (typeof assetModule.commitPreparedDirectory !== 'function') return;

    let backupRemovalAttempts = 0;
    const fileSystem = {
      ...fsPromises,
      rm: async (target: PathLike, options?: RmOptions) => {
        if (target === backupDir) {
          backupRemovalAttempts += 1;
          if (backupRemovalAttempts === 1) {
            throw new Error('injected cleanup failure');
          }
        }
        return fsPromises.rm(target, options);
      },
    };
    await expect(
      assetModule.commitPreparedDirectory({
        fileSystem,
        outputDir,
        temporaryDir,
        backupDir,
      }),
    ).resolves.toBeUndefined();
    expect(backupRemovalAttempts).toBe(2);
    expect(readFileSync(path.join(outputDir, 'asset.png'), 'utf8')).toBe(
      'new prepared',
    );
    expect(() => readFileSync(backupDir)).toThrow();
  });

  it('validates the migrated bilingual case and processed evidence', async () => {
    expect(await validateSite()).toEqual([]);
  });
});
