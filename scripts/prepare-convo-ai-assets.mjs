import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'evidence/convo-ai/media-manifest.json');
const defaultSourceDir = '/Users/admin/Desktop/声网 作品集 整理/convo ai demo';

function run(command, args, { capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk) => { stdout += chunk; });
    child.stderr?.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('exit', (code) => code === 0
      ? resolve(stdout)
      : reject(new Error(`${command} exited with ${code}: ${stderr}`)));
  });
}

async function sha256(filePath) {
  const data = await fs.readFile(filePath);
  return createHash('sha256').update(data).digest('hex');
}

async function readDuration(filePath) {
  const script = [
    'import Foundation',
    'import AVFoundation',
    'let asset = AVURLAsset(url: URL(fileURLWithPath: CommandLine.arguments[1]))',
    'let group = DispatchGroup()',
    'group.enter()',
    'Task { let duration = try await asset.load(.duration); print(CMTimeGetSeconds(duration)); group.leave() }',
    'group.wait()',
  ].join('; ');
  const output = await run('swift', ['-e', script, filePath], { capture: true });
  return Number.parseFloat(output.trim());
}

async function extractPoster(source, posterTime, output) {
  const temporary = path.join(os.tmpdir(), `convo-ai-${path.basename(output, '.webp')}.jpg`);
  const script = [
    'import Foundation',
    'import AVFoundation',
    'import AppKit',
    'let source = URL(fileURLWithPath: CommandLine.arguments[1])',
    'let time = Double(CommandLine.arguments[2])!',
    'let output = URL(fileURLWithPath: CommandLine.arguments[3])',
    'let generator = AVAssetImageGenerator(asset: AVURLAsset(url: source))',
    'generator.appliesPreferredTrackTransform = true',
    'let image = try generator.copyCGImage(at: CMTime(seconds: time, preferredTimescale: 600), actualTime: nil)',
    'let rep = NSBitmapImageRep(cgImage: image)',
    'try rep.representation(using: .jpeg, properties: [.compressionFactor: 0.9])!.write(to: output)',
  ].join('; ');
  await run('swift', ['-e', script, source, String(posterTime), temporary]);
  await sharp(temporary).webp({ quality: 86, effort: 6 }).toFile(output);
  await fs.rm(temporary, { force: true });
}

export async function prepareConvoAiAssets({ sourceDir } = {}) {
  const resolvedSourceDir = sourceDir ?? process.env.CONVO_AI_SOURCE_DIR ?? defaultSourceDir;
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const outputs = [];

  for (const asset of manifest.assets) {
    const source = path.join(resolvedSourceDir, asset.sourceName);
    const videoOutput = path.join(root, asset.output);
    const posterOutput = path.join(root, asset.poster);
    await fs.access(source);
    if (await sha256(source) !== asset.sha256) throw new Error(`Hash mismatch: ${asset.sourceName}`);
    await fs.mkdir(path.dirname(videoOutput), { recursive: true });
    await fs.mkdir(path.dirname(posterOutput), { recursive: true });
    await fs.rm(videoOutput, { force: true });
    await fs.rm(posterOutput, { force: true });

    if (path.extname(source).toLowerCase() === '.mov') {
      await run('avconvert', [
        '--source', source,
        '--preset', 'PresetHighestQuality',
        '--output', videoOutput,
        '--replace',
      ]);
    } else {
      await fs.copyFile(source, videoOutput);
    }

    const duration = await readDuration(videoOutput);
    if (Math.abs(duration - asset.duration) > 0.05) {
      throw new Error(`Duration mismatch: ${asset.id} expected ${asset.duration}, got ${duration}`);
    }
    await extractPoster(videoOutput, asset.posterTime, posterOutput);
    outputs.push(asset.output, asset.poster);
  }
  return outputs;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareConvoAiAssets()
    .then((outputs) => console.log(`Prepared ${outputs.length} ConvoAI derivatives.`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
