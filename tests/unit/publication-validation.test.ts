import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';
import sharp from 'sharp';

import {
  publicationInputs,
  runPublicationValidation,
} from '@/scripts/validate-publication.mjs';

const temporaryRoots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'publication-validation-'));
  temporaryRoots.push(root);
  return root;
}

function write(root: string, relativePath: string, value: string | Buffer) {
  const destination = path.join(root, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, value);
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe('publication validation CLI', () => {
  it('reports absent publication inputs deterministically in development mode', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/validate-publication.mjs', '--mode=development'],
      { cwd: process.cwd(), encoding: 'utf8' },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      'Missing publication input: public/images/profile/yang-jing-hero.avif',
    );
    expect(result.stdout).toContain(
      'Missing publication input: content/profile/contact.private.json',
    );
    const reported = result.stdout.trim().split('\n');
    expect(reported).toEqual(
      publicationInputs.map((value) => `Missing publication input: ${value}`),
    );
  });

  it('rejects an unknown mode', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/validate-publication.mjs', '--mode=surprise'],
      { cwd: process.cwd(), encoding: 'utf8' },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/unknown publication validation mode.*surprise/i);
  });

  it('prints structural source errors as actionable diagnostics', () => {
    const result = spawnSync(
      process.execPath,
      ['scripts/validate-publication.mjs', '--mode=source'],
      { cwd: process.cwd(), encoding: 'utf8' },
    );

    expect(result.status).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(
      /missing launch route.*work\/bytedance.*locale.*en/i,
    );
  });

  it('turns every missing publication input into a source error', async () => {
    const result = await runPublicationValidation({
      mode: 'source',
      rootDir: createRoot(),
    });

    expect(result.errors).toEqual(
      expect.arrayContaining(
        publicationInputs.map((value) => `Missing publication input: ${value}`),
      ),
    );
  });

  it('rejects malformed contact fields and phone numbers even in development', async () => {
    const root = createRoot();
    write(
      root,
      'content/profile/contact.private.json',
      JSON.stringify({
        email: 'person@example.com',
        linkedin: 'http://linkedin.com/in/person',
        wechatId: '+86 138 1234 5678',
        resumeRevision: '15-07-2026',
        extra: 'not approved',
      }),
    );

    const result = await runPublicationValidation({ mode: 'development', rootDir: root });
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/contact fields must be exactly/i),
        expect.stringMatching(/linkedin.*https/i),
        expect.stringMatching(/resumeRevision.*YYYY-MM-DD/i),
        expect.stringMatching(/phone number/i),
      ]),
    );
  });

  it('validates PDF signatures for files that are present', async () => {
    const root = createRoot();
    write(root, 'public/files/yang-jing-bytedance-case-study.pdf', 'not a pdf');

    const result = await runPublicationValidation({ mode: 'development', rootDir: root });
    expect(result.errors).toContain(
      'Invalid PDF signature: public/files/yang-jing-bytedance-case-study.pdf',
    );
  });

  it('requires locale pairs, unique translation keys, metadata, and evidence vocabulary', async () => {
    const root = createRoot();
    const metadata = (title: string, evidenceLevel = 'delivered') => `
export const metadata = {
  type: 'work', slug: 'sample', locale: 'en',
  translationKey: 'work.sample', title: '${title}', proposition: 'P',
  role: 'R', duration: 'D', status: 'S', disclosure: 'D',
  heroMedia: '/images/sample.avif', evidenceLevel: '${evidenceLevel}', featuredOrder: 1
}
`;
    write(root, 'content/work/sample.en.mdx', metadata('One'));
    write(root, 'content/work/duplicate.en.mdx', metadata('Two', 'claimed'));

    const result = await runPublicationValidation({ mode: 'development', rootDir: root });
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/duplicate translation key.*work\.sample.*en/i),
        expect.stringMatching(/translation key.*work\.sample.*missing locale.*zh/i),
        expect.stringMatching(/evidenceLevel.*claimed.*allowed/i),
      ]),
    );
  });

  it('requires a caption and poster beside a present publication video', async () => {
    const root = createRoot();
    write(root, 'public/videos/meeting/interaction-sequence.mp4', 'video');

    const result = await runPublicationValidation({ mode: 'development', rootDir: root });
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/interaction-sequence\.mp4.*requires.*\.vtt/i),
        expect.stringMatching(/interaction-sequence\.mp4.*requires.*poster/i),
      ]),
    );
  });

  it('finds broken internal output links and sensitive generated text', async () => {
    const root = createRoot();
    write(
      root,
      'out/en/index.html',
      '<!doctype html><a href="/files/missing.pdf">File</a><p>account_id=acc_82HF91KQ</p>',
    );

    const result = await runPublicationValidation({ mode: 'output', rootDir: root });
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/broken internal reference.*files\/missing\.pdf/i),
        expect.stringMatching(/account or internal identifier.*out\/en\/index\.html/i),
      ]),
    );
  });

  it('rejects malformed media manifests during development validation', async () => {
    const root = createRoot();
    write(
      root,
      'evidence/media/manifest.json',
      JSON.stringify({
        version: 1,
        sourceRoot: 'private-media',
        allowedWidths: [640, 960, 1440, 1920],
        assets: [{
          id: 'escape', source: '../secret.png',
          destination: 'public/images/escape', widths: [640], fallback: 'jpeg',
        }],
        generated: [],
      }),
    );

    const result = await runPublicationValidation({ mode: 'development', rootDir: root });
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/media manifest.*safe relative path/i)]),
    );
  });

  it('rejects malformed media that is present in output', async () => {
    const root = createRoot();
    write(root, 'out/files/yang-jing-resume-en.pdf', 'not pdf output');
    write(root, 'out/images/profile/yang-jing-hero.avif', 'not image output');

    const result = await runPublicationValidation({ mode: 'output', rootDir: root });
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Invalid output PDF signature: files/yang-jing-resume-en.pdf',
        'Output image decode or dimensions invalid: images/profile/yang-jing-hero.avif',
      ]),
    );
  });

  it('does not treat SVG path geometry in generated HTML as an IP address', async () => {
    const root = createRoot();
    write(root, 'out/index.html', '<!doctype html><html><body><svg><path d="M13 3.29.87.78"/></svg></body></html>');

    const result = await runPublicationValidation({ mode: 'output', rootDir: root });
    expect(result.errors).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/sensitive text.*IP address/i)]),
    );
  });

  it('composes the approved Call Agent and STT checksum validation', async () => {
    const root = createRoot();
    for (const relativePath of [
      'content',
      'evidence/call-agent',
      'evidence/stt-demo',
      'evidence/media',
      'public/demos/stt-demo',
      'public/images/call-agent',
    ]) {
      cpSync(path.join(process.cwd(), relativePath), path.join(root, relativePath), {
        recursive: true,
      });
    }
    mkdirSync(path.join(root, 'public/files'), { recursive: true });
    cpSync(
      path.join(process.cwd(), 'public/files/call-agent-case-study-zh.pdf'),
      path.join(root, 'public/files/call-agent-case-study-zh.pdf'),
    );
    write(root, 'public/images/call-agent/ai-preview-live.png', 'changed bytes');

    const result = await runPublicationValidation({ mode: 'development', rootDir: root });
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/checksum mismatch.*ai-preview-live\.png/i),
      ]),
    );
  });

  it('rejects required publication inputs supplied through symlinks', async () => {
    const root = createRoot();
    write(root, 'outside.pdf', '%PDF-1.7\n');
    const requiredPath = path.join(root, 'public/files/yang-jing-resume-en.pdf');
    mkdirSync(path.dirname(requiredPath), { recursive: true });
    symlinkSync(path.join(root, 'outside.pdf'), requiredPath);

    const result = await runPublicationValidation({ mode: 'development', rootDir: root });
    expect(result.errors).toContain(
      'Publication input must be a regular non-symlink file: public/files/yang-jing-resume-en.pdf',
    );
  });

  it('requires generated media records to match real output files', async () => {
    const root = createRoot();
    write(
      root,
      'evidence/media/manifest.json',
      JSON.stringify({
        version: 1,
        sourceRoot: 'private-media',
        allowedWidths: [640, 960, 1440, 1920],
        assets: [],
        generated: [{
          asset: 'missing', path: 'public/images/missing-640.avif',
          format: 'avif', width: 640, height: 320, bytes: 100,
        }],
      }),
    );

    const result = await runPublicationValidation({ mode: 'development', rootDir: root });
    expect(result.errors).toContain(
      'Generated media record file is missing: public/images/missing-640.avif',
    );
  });

  it('does not accept metadata fields found only in the MDX body', async () => {
    const root = createRoot();
    write(root, 'public/images/sample.avif', await sharp({
      create: { width: 1, height: 1, channels: 3, background: '#000000' },
    }).avif().toBuffer());
    write(root, 'content/work/sample.en.mdx', `
export const metadata = {
  type: 'work', slug: 'sample', locale: 'en', translationKey: 'work.sample',
  title: 'T', proposition: 'P', duration: 'D', status: 'S', disclosure: 'D',
  heroMedia: '/images/sample.avif', evidenceLevel: 'delivered', featuredOrder: 1
}
{/* role: 'body-only' */}
`);

    const result = await runPublicationValidation({ mode: 'development', rootDir: root });
    expect(result.errors).toContain('Missing metadata field role: content/work/sample.en.mdx');
  });

  it('rejects malformed generated HTML documents', async () => {
    const root = createRoot();
    write(root, 'out/index.html', '<p>fragment only</p>');

    const result = await runPublicationValidation({ mode: 'output', rootDir: root });
    expect(result.errors).toContain('Malformed generated HTML: out/index.html');
  });
});

describe('responsive publication media', () => {
  it('selects declared standard widths without upscaling and rejects traversal', async () => {
    const modulePath = pathToFileURL(path.join(process.cwd(), 'lib/media/assets.ts')).href;
    const assets = await import(modulePath);

    expect(assets.selectResponsiveWidths([1440, 640, 960], 1000)).toEqual([640, 960]);
    expect(() => assets.resolveContainedPath('/tmp/media', '../secret.png')).toThrow(
      /safe relative path|escapes/i,
    );
  });

  it('emits deterministic AVIF, WebP, and fallback records without upscaling', async () => {
    const root = createRoot();
    const source = path.join(root, 'private-media/source.png');
    mkdirSync(path.dirname(source), { recursive: true });
    await sharp({
      create: {
        width: 1000,
        height: 500,
        channels: 3,
        background: '#336699',
      },
    }).png().toFile(source);
    write(
      root,
      'evidence/media/manifest.json',
      JSON.stringify({
        version: 1,
        sourceRoot: 'private-media',
        allowedWidths: [640, 960, 1440, 1920],
        assets: [{
          id: 'fixture',
          source: 'source.png',
          destination: 'public/images/fixture/photo',
          widths: [640, 960, 1440],
          fallback: 'jpeg',
        }],
        generated: [],
      }),
    );
    const modulePath = pathToFileURL(path.join(process.cwd(), 'scripts/generate-responsive-media.mjs')).href;
    const { generateResponsiveMedia } = await import(modulePath);

    const records = await generateResponsiveMedia({ rootDir: root });

    expect(records).toHaveLength(6);
    expect(records.map(({ width }: { width: number }) => width)).toEqual([
      640, 640, 640, 960, 960, 960,
    ]);
    expect(records.map(({ format }: { format: string }) => format)).toEqual([
      'avif', 'webp', 'jpeg', 'avif', 'webp', 'jpeg',
    ]);
    expect(records.every(({ height, bytes }: { height: number; bytes: number }) =>
      height > 0 && bytes > 0)).toBe(true);
    expect(records.some(({ path: output }: { path: string }) => output.includes('1440'))).toBe(false);
  });

  it('rejects escaping and explicitly excluded sources before writing output', async () => {
    const root = createRoot();
    write(root, 'private-media/secret.png', 'not needed');
    write(
      root,
      'evidence/call-agent/manifest.json',
      JSON.stringify({ assets: [], excluded: [{ source: 'secret.png', reason: 'contains a visible authorization token' }] }),
    );
    const baseManifest = {
      version: 1,
      sourceRoot: 'private-media',
      allowedWidths: [640, 960, 1440, 1920],
      assets: [{
        id: 'secret',
        source: 'secret.png',
        destination: 'public/images/fixture/secret',
        widths: [640],
        fallback: 'jpeg',
      }],
      generated: [],
    };
    write(root, 'evidence/media/manifest.json', JSON.stringify(baseManifest));
    const modulePath = pathToFileURL(path.join(process.cwd(), 'scripts/generate-responsive-media.mjs')).href;
    const { generateResponsiveMedia } = await import(modulePath);

    await expect(generateResponsiveMedia({ rootDir: root })).rejects.toThrow(
      /excluded.*authorization-token|excluded source/i,
    );
    baseManifest.assets[0].source = '../secret.png';
    write(root, 'evidence/media/manifest.json', JSON.stringify(baseManifest));
    await expect(generateResponsiveMedia({ rootDir: root })).rejects.toThrow(
      /safe relative path|escapes/i,
    );
  });
});
