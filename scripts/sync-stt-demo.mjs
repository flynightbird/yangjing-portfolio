import fs, { constants } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), '..');
const pinnedCommit = 'e5e840a';
const repository = 'https://github.com/flynightbird/stt-demo';
const kind = 'interactive-static-prototype';

const requiredFiles = [
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
];

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return (
    relative !== '' &&
    !relative.startsWith('..') &&
    !path.isAbsolute(relative)
  );
}

async function removeBackup(backupDir) {
  try {
    await fs.rm(backupDir, { force: true, recursive: true });
  } catch (error) {
    console.warn(
      `Unable to remove STT demo backup ${backupDir}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function commitSyncedDirectory({
  outputDir,
  temporaryDir,
  backupDir,
}) {
  let hasBackup = false;
  try {
    await fs.rename(outputDir, backupDir);
    hasBackup = true;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  try {
    await fs.rename(temporaryDir, outputDir);
  } catch (installError) {
    if (hasBackup) {
      try {
        await fs.rm(outputDir, { force: true, recursive: true });
        await fs.rename(backupDir, outputDir);
        hasBackup = false;
      } catch (rollbackError) {
        throw new AggregateError(
          [installError, rollbackError],
          'STT demo installation failed and the previous output could not be restored.',
        );
      }
    }
    throw installError;
  }

  if (hasBackup) await removeBackup(backupDir);
}

async function validateSource(sourceRootValue) {
  if (!sourceRootValue) {
    throw new Error(
      'STT_DEMO_SOURCE must point to the pinned STT demo repository.',
    );
  }

  const sourceRoot = path.resolve(sourceRootValue);
  let realSourceRoot;
  try {
    realSourceRoot = await fs.realpath(sourceRoot);
    const sourceStat = await fs.stat(realSourceRoot);
    await fs.access(realSourceRoot, constants.R_OK);
    if (!sourceStat.isDirectory()) throw new Error('not a directory');
  } catch {
    throw new Error(
      'STT_DEMO_SOURCE must point to a readable directory.',
    );
  }

  let gitRoot;
  let commit;
  try {
    const rootResult = await execFileAsync('git', [
      '-C',
      realSourceRoot,
      'rev-parse',
      '--show-toplevel',
    ]);
    const commitResult = await execFileAsync('git', [
      '-C',
      realSourceRoot,
      'rev-parse',
      'HEAD',
    ]);
    gitRoot = await fs.realpath(rootResult.stdout.trim());
    commit = commitResult.stdout.trim();
  } catch {
    throw new Error('STT_DEMO_SOURCE must be a readable Git checkout.');
  }

  if (gitRoot !== realSourceRoot) {
    throw new Error('STT_DEMO_SOURCE must be the repository root.');
  }
  if (!commit.startsWith(pinnedCommit)) {
    throw new Error(
      `STT demo source commit must begin ${pinnedCommit}; received ${commit}.`,
    );
  }

  const files = [];
  for (const [source, output] of requiredFiles) {
    const sourcePath = path.resolve(realSourceRoot, source);
    let realSourcePath;
    try {
      realSourcePath = await fs.realpath(sourcePath);
      await fs.access(realSourcePath, constants.R_OK);
      const sourceStat = await fs.stat(realSourcePath);
      if (!sourceStat.isFile()) throw new Error('not a file');
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Required source is missing: ${source}`);
      }
      throw error;
    }
    if (!isInside(realSourceRoot, realSourcePath)) {
      throw new Error(`Required source escapes source root: ${source}`);
    }
    files.push({ output, sourcePath: realSourcePath });
  }

  return { commit, files };
}

export async function syncSttDemo(options = {}) {
  const sourceRootValue = options.sourceRoot ?? process.env.STT_DEMO_SOURCE;
  const outputDir = path.resolve(
    options.outputDir ?? path.join(root, 'public/demos/stt-demo'),
  );
  const transactionRoot = path.resolve(
    options.transactionRoot ?? path.join(root, '.asset-transactions'),
  );
  const { commit, files } = await validateSource(sourceRootValue);

  try {
    const outputStat = await fs.lstat(outputDir);
    if (outputStat.isSymbolicLink()) {
      throw new Error('STT demo output directory must not be a symbolic link.');
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  await fs.mkdir(path.dirname(outputDir), { recursive: true });
  await fs.mkdir(transactionRoot, { recursive: true });
  const temporaryDir = await fs.mkdtemp(
    path.join(transactionRoot, `${path.basename(outputDir)}.tmp-`),
  );
  const backupDir = path.join(
    transactionRoot,
    `${path.basename(outputDir)}.backup-${process.pid}-${Date.now()}`,
  );

  try {
    for (const { output, sourcePath } of files) {
      const destination = path.resolve(temporaryDir, output);
      if (!isInside(temporaryDir, destination)) {
        throw new Error(`STT demo output escapes staging directory: ${output}`);
      }
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(sourcePath, destination);
    }
    await fs.writeFile(
      path.join(temporaryDir, 'source-revision.json'),
      `${JSON.stringify(
        { repository, commit, pinnedCommit, kind },
        null,
        2,
      )}\n`,
    );
    await commitSyncedDirectory({ outputDir, temporaryDir, backupDir });
  } catch (error) {
    await fs.rm(temporaryDir, { force: true, recursive: true });
    throw error;
  }

  return files.length + 1;
}

if (process.argv[1] === scriptPath) {
  try {
    const count = await syncSttDemo();
    console.log(`Synchronized ${count} pinned STT demo files`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
