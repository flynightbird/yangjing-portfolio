import fs, { constants } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), '..');

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return (
    relative !== '' &&
    !relative.startsWith('..') &&
    !path.isAbsolute(relative)
  );
}

async function readableDirectory(directory) {
  const stat = await fs.stat(directory);
  await fs.access(directory, constants.R_OK);
  return stat.isDirectory();
}

export async function prepareCallAgentAssets(options = {}) {
  const sourceRootValue =
    options.sourceRoot ?? process.env.CALL_AGENT_SOURCE_ROOT;
  if (!sourceRootValue) {
    throw new Error(
      'CALL_AGENT_SOURCE_ROOT must point to an existing readable directory.',
    );
  }

  const sourceRoot = path.resolve(sourceRootValue);
  try {
    if (!(await readableDirectory(sourceRoot))) throw new Error('not a directory');
  } catch {
    throw new Error(
      'CALL_AGENT_SOURCE_ROOT must point to an existing readable directory.',
    );
  }
  const realSourceRoot = await fs.realpath(sourceRoot);
  const manifestPath = path.resolve(
    options.manifestPath ??
      path.join(root, 'evidence/call-agent/manifest.json'),
  );
  const outputDir = path.resolve(
    options.outputDir ?? path.join(root, 'public/images/call-agent'),
  );
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.assets)) {
    throw new Error('Manifest assets must be an array.');
  }

  const outputs = new Set();
  const preparedAssets = [];
  for (const [index, asset] of manifest.assets.entries()) {
    if (!asset || typeof asset.source !== 'string' || !asset.source) {
      throw new Error(`Manifest asset ${index} must have a source.`);
    }
    if (!asset.output || path.basename(asset.output) !== asset.output) {
      throw new Error(
        `Manifest output must be a file name: ${asset.output ?? ''}`,
      );
    }
    if (outputs.has(asset.output)) {
      throw new Error(`Duplicate manifest output: ${asset.output}`);
    }
    outputs.add(asset.output);
    if (path.isAbsolute(asset.source)) {
      throw new Error(`Manifest source must be relative: ${asset.source}`);
    }

    const sourcePath = path.resolve(sourceRoot, asset.source);
    if (!isInside(sourceRoot, sourcePath)) {
      throw new Error(
        `Manifest source escapes CALL_AGENT_SOURCE_ROOT: ${asset.source}`,
      );
    }
    let realSourcePath;
    try {
      realSourcePath = await fs.realpath(sourcePath);
      await fs.access(realSourcePath, constants.R_OK);
      const sourceStat = await fs.stat(realSourcePath);
      if (!sourceStat.isFile()) throw new Error('not a file');
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Manifest source is missing: ${asset.source}`);
      }
      throw error;
    }
    if (!isInside(realSourceRoot, realSourcePath)) {
      throw new Error(
        `Manifest source symlink resolves outside source root: ${asset.source}`,
      );
    }
    preparedAssets.push({ asset, sourcePath: realSourcePath });
  }

  const outputParent = path.dirname(outputDir);
  const outputName = path.basename(outputDir);
  await fs.mkdir(outputParent, { recursive: true });
  try {
    const outputStat = await fs.lstat(outputDir);
    if (outputStat.isSymbolicLink()) {
      throw new Error('Output directory must not be a symbolic link.');
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const temporaryDir = await fs.mkdtemp(
    path.join(outputParent, `${outputName}.tmp-`),
  );
  const backupDir = path.join(
    outputParent,
    `${outputName}.backup-${process.pid}-${Date.now()}`,
  );
  let hasBackup = false;

  try {
    for (const { asset, sourcePath } of preparedAssets) {
      let pipeline = sharp(sourcePath, { failOn: 'error' });
      if (asset.extract) pipeline = pipeline.extract(asset.extract);
      const composites = (asset.redactions || []).map((rect) => ({
        input: Buffer.from(
          `<svg width="${rect.width}" height="${rect.height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${rect.color || '#111827'}"/></svg>`,
        ),
        left: rect.left,
        top: rect.top,
      }));
      if (composites.length) pipeline = pipeline.composite(composites);
      await pipeline.toFile(path.join(temporaryDir, asset.output));
    }

    try {
      await fs.rename(outputDir, backupDir);
      hasBackup = true;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
    try {
      await fs.rename(temporaryDir, outputDir);
    } catch (error) {
      if (hasBackup) await fs.rename(backupDir, outputDir);
      throw error;
    }
    if (hasBackup) await fs.rm(backupDir, { recursive: true, force: true });
  } catch (error) {
    await fs.rm(temporaryDir, { recursive: true, force: true });
    if (hasBackup) {
      try {
        await fs.access(outputDir);
      } catch {
        await fs.rename(backupDir, outputDir);
      }
    }
    throw error;
  }

  return preparedAssets.length;
}

if (process.argv[1] === scriptPath) {
  try {
    const count = await prepareCallAgentAssets();
    console.log(`Prepared ${count} public-safe images`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
