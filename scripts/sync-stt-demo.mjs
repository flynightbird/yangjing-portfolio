import fs, { constants } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), '..');
const pinnedCommit = 'e5e840a';
export const STT_DEMO_FULL_COMMIT =
  'e5e840af62622123380bb0ef9d016b8da71cfb1c';
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
const approvedSourcePaths = [
  ...requiredFiles.map(([, output]) => output),
  'source-revision.json',
].sort();
const approvedPublicationPaths = [
  ...approvedSourcePaths,
  'stage-embed.css',
  'stage-embed.js',
].sort();
const defaultChecksumPath = path.join(
  root,
  'evidence/stt-demo/checksums.json',
);
const defaultPublicationChecksumPath = path.join(
  root,
  'evidence/stt-demo/publication-checksums.json',
);
const adapterFiles = ['stage-embed.css', 'stage-embed.js'];
const adapterTags =
  '  <link rel="stylesheet" href="stage-embed.css" />\n' +
  '  <script src="stage-embed.js"></script>\n';

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return (
    relative !== '' &&
    !relative.startsWith('..') &&
    !path.isAbsolute(relative)
  );
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function validateChecksumContract(contract, expectedPaths) {
  if (contract?.version !== 1 || !Array.isArray(contract.files)) {
    throw new Error('STT checksum contract must contain version 1 files.');
  }

  const seen = new Set();
  for (const [index, file] of contract.files.entries()) {
    if (
      !file ||
      typeof file.path !== 'string' ||
      !/^[a-f0-9]{64}$/.test(file.sha256)
    ) {
      throw new Error(`STT checksum contract entry ${index} is invalid.`);
    }
    if (seen.has(file.path)) {
      throw new Error(`STT checksum contract has duplicate path: ${file.path}`);
    }
    seen.add(file.path);
  }

  const paths = [...seen].sort();
  if (JSON.stringify(paths) !== JSON.stringify(expectedPaths)) {
    throw new Error(
      'STT checksum contract does not exactly cover the approved publication files.',
    );
  }

  return new Map(contract.files.map((file) => [file.path, file.sha256]));
}

export async function loadApprovedChecksums(
  checksumPath = defaultChecksumPath,
) {
  let contract;
  try {
    contract = JSON.parse(await fs.readFile(checksumPath, 'utf8'));
  } catch {
    throw new Error('STT checksum contract is missing or invalid JSON.');
  }
  validateChecksumContract(contract, approvedSourcePaths);
  return contract;
}

export async function loadPublicationChecksums(
  checksumPath = defaultPublicationChecksumPath,
) {
  let contract;
  try {
    contract = JSON.parse(await fs.readFile(checksumPath, 'utf8'));
  } catch {
    throw new Error(
      'STT publication checksum contract is missing or invalid JSON.',
    );
  }
  validateChecksumContract(contract, approvedPublicationPaths);
  return contract;
}

export async function installLocalSttAdaptation({
  demoRoot,
  integrationRoot = path.join(root, 'integrations/stt-demo'),
  fileSystem = fs,
}) {
  const transactionDirectory = await fileSystem.mkdtemp(
    path.join(
      path.dirname(demoRoot),
      `.${path.basename(demoRoot)}.adapter-`,
    ),
  );
  const stagedRoot = path.join(transactionDirectory, 'publication');
  const backupRoot = path.join(transactionDirectory, 'previous');
  let commitCompleted = false;
  let installationError;
  let preserveTransaction = false;

  try {
    await fileSystem.cp(demoRoot, stagedRoot, { recursive: true });
    await Promise.all(
      adapterFiles.map((file) =>
        fileSystem.copyFile(
          path.join(integrationRoot, file),
          path.join(stagedRoot, file),
        ),
      ),
    );
    const indexPath = path.join(stagedRoot, 'index.html');
    const html = await fileSystem.readFile(indexPath, 'utf8');
    const clean = html.replace(
      /^(?:[ \t]*\r?\n)?[ \t]*<link rel="stylesheet" href="stage-embed\.css" \/>\r?\n[ \t]*<script src="stage-embed\.js"><\/script>\r?\n/m,
      '',
    );
    await fileSystem.writeFile(
      indexPath,
      clean.replace('</head>', `${adapterTags}</head>`),
    );
    await commitSyncedDirectory({
      fileSystem,
      outputDir: demoRoot,
      temporaryDir: stagedRoot,
      backupDir: backupRoot,
    });
    commitCompleted = true;
  } catch (error) {
    installationError = error;
    preserveTransaction = error instanceof AggregateError;
    throw error;
  } finally {
    if (!preserveTransaction) {
      try {
        await fileSystem.rm(transactionDirectory, {
          force: true,
          recursive: true,
        });
      } catch (cleanupError) {
        if (commitCompleted) {
          console.warn(
            `Unable to remove STT adapter transaction ${transactionDirectory}: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`,
          );
        } else if (installationError) {
          throw new AggregateError(
            [installationError, cleanupError],
            'STT adapter installation failed and its transaction directory could not be removed.',
          );
        } else {
          throw cleanupError;
        }
      }
    }
  }
}

async function removeBackup(fileSystem, backupDir) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await fileSystem.rm(backupDir, { force: true, recursive: true });
      return;
    } catch (error) {
      if (attempt === 1) {
        console.warn(
          `Unable to remove STT demo backup ${backupDir}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}

export async function commitSyncedDirectory({
  fileSystem = fs,
  outputDir,
  temporaryDir,
  backupDir,
}) {
  let hasBackup = false;
  try {
    await fileSystem.rename(outputDir, backupDir);
    hasBackup = true;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  try {
    await fileSystem.rename(temporaryDir, outputDir);
  } catch (installError) {
    if (hasBackup) {
      try {
        await fileSystem.rm(outputDir, { force: true, recursive: true });
        await fileSystem.rename(backupDir, outputDir);
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

  if (hasBackup) await removeBackup(fileSystem, backupDir);
}

export async function validateApprovedSourceFiles(sourceRootValue, contract) {
  const sourceRoot = path.resolve(sourceRootValue);
  const realSourceRoot = await fs.realpath(sourceRoot);
  const checksums = validateChecksumContract(contract, approvedSourcePaths);
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
    const actual = sha256(await fs.readFile(realSourcePath));
    if (actual !== checksums.get(output)) {
      throw new Error(`STT source checksum mismatch for ${source}.`);
    }
    files.push({ output, sourcePath: realSourcePath });
  }

  return files;
}

async function listPublishedFiles(directory, relative = '') {
  const entries = await fs.readdir(path.join(directory, relative), {
    withFileTypes: true,
  });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listPublishedFiles(directory, entryPath));
    } else {
      files.push({ path: entryPath, isFile: entry.isFile() });
    }
  }
  return files;
}

export async function validatePublishedSttDirectory(demoRoot, contract) {
  let checksums;
  try {
    checksums = validateChecksumContract(
      contract,
      approvedPublicationPaths,
    );
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }

  let publishedFiles;
  try {
    publishedFiles = await listPublishedFiles(demoRoot);
  } catch (error) {
    return [
      error?.code === 'ENOENT'
        ? 'missing STT demo publication directory'
        : 'unable to inspect STT demo publication directory',
    ];
  }

  const errors = [];
  const actualPaths = new Set(publishedFiles.map((file) => file.path));
  for (const expectedPath of approvedPublicationPaths) {
    if (!actualPaths.has(expectedPath)) {
      errors.push(`missing STT demo file: ${expectedPath}`);
    }
  }
  for (const file of publishedFiles) {
    if (!checksums.has(file.path)) {
      errors.push(`unexpected STT demo file: ${file.path}`);
      continue;
    }
    if (!file.isFile) {
      errors.push(`STT demo file is not regular: ${file.path}`);
      continue;
    }
    const actual = sha256(await fs.readFile(path.join(demoRoot, file.path)));
    if (actual !== checksums.get(file.path)) {
      errors.push(`STT demo checksum mismatch: ${file.path}`);
    }
  }
  return errors;
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
  if (commit !== STT_DEMO_FULL_COMMIT) {
    throw new Error(
      `STT demo source commit must equal ${STT_DEMO_FULL_COMMIT}; received ${commit}.`,
    );
  }

  const contract = await loadApprovedChecksums();
  const files = await validateApprovedSourceFiles(realSourceRoot, contract);

  return { commit, contract, files };
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
  const publicationContract = await loadPublicationChecksums(
    options.publicationChecksumPath,
  );

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
    await installLocalSttAdaptation({
      demoRoot: temporaryDir,
      integrationRoot: options.integrationRoot,
    });
    const stagedErrors = await validatePublishedSttDirectory(
      temporaryDir,
      publicationContract,
    );
    if (stagedErrors.length > 0) {
      throw new Error(`Staged STT demo failed validation: ${stagedErrors.join('; ')}`);
    }
    await commitSyncedDirectory({ outputDir, temporaryDir, backupDir });
  } catch (error) {
    await fs.rm(temporaryDir, { force: true, recursive: true });
    throw error;
  }

  return files.length + 1 + adapterFiles.length;
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
