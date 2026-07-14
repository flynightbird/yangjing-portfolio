import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

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

function readManifest(): CallAgentManifest {
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as CallAgentManifest;
}

describe('Call Agent privacy controls', () => {
  it('flags authorization tokens and unmasked phone numbers', () => {
    expect(findSensitiveText('Authorization: Bearer abc.def.ghi')).toEqual([
      'authorization token',
    ]);
    expect(findSensitiveText('+86 138 1234 5678')).toEqual(['phone number']);
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

  it('validates the migrated bilingual case and processed evidence', () => {
    expect(validateSite()).toEqual([]);
  });
});
