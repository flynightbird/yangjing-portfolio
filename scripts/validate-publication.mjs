import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@mdx-js/mdx';
import { parse } from 'acorn';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

import { findSensitiveText } from '../lib/content/privacy.ts';
import {
  RESPONSIVE_WIDTHS,
  assertSafeRelativePath,
  dimensionsAtWidth,
  resolveContainedPath,
  responsiveVariantPath,
  selectResponsiveWidths,
} from '../lib/media/assets.ts';
import { validateSite } from './validate-content.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), '..');

export const publicationInputs = [
  'public/images/profile/yang-jing-hero.avif',
  'public/images/profile/yang-jing-about.avif',
  'public/images/bytedance/cover.avif',
  'public/files/yang-jing-bytedance-case-study.pdf',
  'public/images/meeting/shipped-room-overview.avif',
  'public/images/meeting/shipped-control-states.avif',
  'public/images/meeting/retrospective-state-model.avif',
  'public/videos/meeting/interaction-sequence.mp4',
  'public/videos/meeting/interaction-sequence.vtt',
  'public/images/meeting/interaction-sequence-poster.avif',
  'public/files/yang-jing-resume-en.pdf',
  'public/files/yang-jing-resume-zh.pdf',
  'public/images/contact/wechat-qr.avif',
  'content/profile/contact.private.json',
];

export function parseMode(argv = process.argv.slice(2)) {
  const argument = argv.find((value) => value.startsWith('--mode='));
  const mode = argument?.slice('--mode='.length);
  if (!['development', 'source', 'output'].includes(mode ?? '')) {
    throw new Error(`Unknown publication validation mode: ${mode ?? '(missing)'}`);
  }
  return mode;
}

function assertMode(mode) {
  if (!['development', 'source', 'output'].includes(mode)) {
    throw new Error(`Unknown publication validation mode: ${mode ?? '(missing)'}`);
  }
}

export async function findMissingPublicationInputs(rootDir = repositoryRoot) {
  const missing = [];
  for (const relativePath of publicationInputs) {
    try {
      const stat = await fs.stat(path.join(rootDir, relativePath));
      if (!stat.isFile()) missing.push(relativePath);
    } catch {
      missing.push(relativePath);
    }
  }
  return missing;
}

const evidenceLevels = new Set([
  'delivered',
  'observed',
  'retrospective',
  'prototype',
]);
const requiredMetadata = [
  'type',
  'slug',
  'locale',
  'translationKey',
  'title',
  'proposition',
  'role',
  'duration',
  'status',
  'disclosure',
  'heroMedia',
  'evidenceLevel',
  'featuredOrder',
];
const launchRoutes = [
  'work/bytedance',
  'work/call-agent',
  'work/meeting',
  'build/stt-demo',
];
const outputPublicationPaths = publicationInputs
  .filter((value) => value.startsWith('public/'))
  .map((value) => value.slice('public/'.length));

async function isRegularFile(filePath) {
  try {
    const stat = await fs.lstat(filePath);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

async function walkFiles(directory) {
  const files = [];
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return files;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(child));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

function relative(rootDir, filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function parseHtml(html) {
  return new JSDOM(html).window.document;
}

function extractVisibleHtmlText(html) {
  const document = parseHtml(html);
  for (const element of document.querySelectorAll('script, style, template')) {
    element.remove();
  }
  const values = [];
  const walker = document.createTreeWalker(document, 4);
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue) values.push(walker.currentNode.nodeValue);
  }
  for (const element of document.querySelectorAll('[value], [alt], [title], [aria-label]')) {
    for (const attribute of ['value', 'alt', 'title', 'aria-label']) {
      const value = element.getAttribute(attribute);
      if (value) values.push(value);
    }
  }
  return values.join('\n');
}

async function validatePrivacy(rootDir, roots) {
  const errors = [];
  const textExtensions = new Set(['.md', '.mdx', '.json', '.html', '.txt', '.vtt']);
  for (const rootName of roots) {
    for (const filePath of await walkFiles(path.join(rootDir, rootName))) {
      if (!textExtensions.has(path.extname(filePath).toLowerCase())) continue;
      let text;
      try {
        text = await fs.readFile(filePath, 'utf8');
      } catch {
        errors.push(`Unable to read text file: ${relative(rootDir, filePath)}`);
        continue;
      }
      const scannedText = filePath.endsWith('.html')
        ? extractVisibleHtmlText(text)
        : text;
      for (const finding of findSensitiveText(scannedText)) {
        errors.push(`Sensitive text (${finding}): ${relative(rootDir, filePath)}`);
      }
    }
  }
  return errors;
}

function readStaticValue(node) {
  if (node.type === 'Literal') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked;
  }
  if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'Literal') {
    return -node.argument.value;
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.map((element) => {
      if (!element) throw new Error('metadata arrays must not contain holes');
      return readStaticValue(element);
    });
  }
  if (node.type === 'ObjectExpression') {
    const result = {};
    for (const property of node.properties) {
      if (
        property.type !== 'Property' ||
        property.kind !== 'init' ||
        property.computed ||
        property.method
      ) {
        throw new Error('metadata must contain only static properties');
      }
      const key = property.key.type === 'Identifier'
        ? property.key.name
        : property.key.value;
      if (typeof key !== 'string') throw new Error('metadata property keys must be strings');
      result[key] = readStaticValue(property.value);
    }
    return result;
  }
  throw new Error(`metadata value must be static, received ${node.type}`);
}

async function parseMdxMetadata(source) {
  const compiled = String(await compile(source, { outputFormat: 'program' }));
  const program = parse(compiled, { ecmaVersion: 'latest', sourceType: 'module' });
  for (const statement of program.body) {
    if (statement.type !== 'ExportNamedDeclaration') continue;
    const declaration = statement.declaration;
    if (!declaration || declaration.type !== 'VariableDeclaration') continue;
    for (const variable of declaration.declarations) {
      if (variable.id.type === 'Identifier' && variable.id.name === 'metadata' && variable.init) {
        const metadata = readStaticValue(variable.init);
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
          throw new Error('metadata export must be an object');
        }
        return metadata;
      }
    }
  }
  throw new Error('missing metadata export');
}

async function validateContentMetadata(rootDir, mode) {
  const errors = [];
  const contentRoot = path.join(rootDir, 'content');
  const files = (await walkFiles(contentRoot)).filter((filePath) => filePath.endsWith('.mdx'));
  const records = [];
  for (const filePath of files) {
    const source = await fs.readFile(filePath, 'utf8');
    const sourceName = relative(rootDir, filePath);
    let metadata;
    try {
      metadata = await parseMdxMetadata(source);
    } catch (error) {
      errors.push(`Metadata parse failed: ${sourceName}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    for (const field of requiredMetadata) {
      if (!Object.hasOwn(metadata, field)) errors.push(`Missing metadata field ${field}: ${sourceName}`);
    }
    const record = {
      file: sourceName,
      type: metadata.type,
      slug: metadata.slug,
      locale: metadata.locale,
      translationKey: metadata.translationKey,
      heroMedia: metadata.heroMedia,
      evidenceLevel: metadata.evidenceLevel,
    };
    records.push(record);
    if (!['en', 'zh'].includes(record.locale)) {
      errors.push(`Invalid locale ${record.locale ?? '(missing)'}: ${sourceName}`);
    }
    if (!evidenceLevels.has(record.evidenceLevel)) {
      errors.push(
        `metadata evidenceLevel "${record.evidenceLevel ?? '(missing)'}" is not in the allowed evidence vocabulary: ${sourceName}`,
      );
    }
    if (record.heroMedia?.startsWith('/')) {
      const assetPath = path.join(rootDir, 'public', record.heroMedia.slice(1));
      if (!(await isRegularFile(assetPath))) {
        errors.push(`Referenced heroMedia does not exist: ${record.heroMedia} (${sourceName})`);
      }
    }
  }

  const seen = new Set();
  const localesByKey = new Map();
  const presentRoutes = new Set();
  for (const record of records) {
    if (record.type && record.slug && record.locale) {
      const canonicalFile = `content/${record.type}/${record.slug}.${record.locale}.mdx`;
      const route = `${record.type}/${record.slug}`;
      const canonicalTranslationKey = `${record.type}.${record.slug}`;
      if (record.file !== canonicalFile) {
        errors.push(`Metadata route identity does not match canonical file: ${record.file}`);
      } else if (
        launchRoutes.includes(route) &&
        record.translationKey !== canonicalTranslationKey
      ) {
        errors.push(
          `Canonical launch translation key must be "${canonicalTranslationKey}": ${record.file}`,
        );
      } else {
        presentRoutes.add(`${record.type}/${record.slug}:${record.locale}`);
      }
    }
    if (!record.translationKey || !record.locale) continue;
    const identity = `${record.translationKey}:${record.locale}`;
    if (seen.has(identity)) {
      errors.push(`Duplicate translation key "${record.translationKey}" for locale "${record.locale}"`);
    }
    seen.add(identity);
    const locales = localesByKey.get(record.translationKey) ?? new Set();
    locales.add(record.locale);
    localesByKey.set(record.translationKey, locales);
  }
  for (const [translationKey, locales] of localesByKey) {
    for (const locale of ['en', 'zh']) {
      if (!locales.has(locale)) {
        errors.push(`Translation key "${translationKey}" is missing locale "${locale}"`);
      }
    }
  }
  if (mode === 'source') {
    for (const route of launchRoutes) {
      for (const locale of ['en', 'zh']) {
        if (!presentRoutes.has(`${route}:${locale}`)) {
          errors.push(`Missing launch route "${route}" for locale "${locale}"`);
        }
      }
    }
  }
  return errors;
}

async function validateContact(rootDir) {
  const contactPath = path.join(rootDir, 'content/profile/contact.private.json');
  if (!(await isRegularFile(contactPath))) return [];
  const errors = [];
  let text;
  let contact;
  try {
    text = await fs.readFile(contactPath, 'utf8');
    contact = JSON.parse(text);
  } catch {
    return ['Invalid contact JSON: content/profile/contact.private.json'];
  }
  const approvedKeys = ['email', 'linkedin', 'wechatId', 'resumeRevision'];
  const contactRecord = contact && typeof contact === 'object' && !Array.isArray(contact)
    ? contact
    : {};
  const actualKeys = Object.keys(contactRecord).sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify([...approvedKeys].sort())) {
    errors.push('Contact fields must be exactly: email, linkedin, wechatId, resumeRevision');
  }
  if (typeof contactRecord.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactRecord.email)) {
    errors.push('Contact email must be a valid public email address');
  }
  if (typeof contactRecord.linkedin !== 'string' || !/^https:\/\//.test(contactRecord.linkedin)) {
    errors.push('Contact linkedin must be an HTTPS URL');
  }
  if (typeof contactRecord.wechatId !== 'string' || !contactRecord.wechatId.trim()) {
    errors.push('Contact wechatId must be a non-empty string');
  }
  if (typeof contactRecord.resumeRevision !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(contactRecord.resumeRevision)) {
    errors.push('Contact resumeRevision must use YYYY-MM-DD');
  }
  for (const finding of findSensitiveText(text)) {
    errors.push(`Sensitive contact text (${finding}): content/profile/contact.private.json`);
  }
  return errors;
}

async function validateExistingMedia(rootDir) {
  const errors = [];
  for (const relativePath of publicationInputs) {
    if (!relativePath.startsWith('public/') || !(await isRegularFile(path.join(rootDir, relativePath)))) continue;
    const bytes = await fs.readFile(path.join(rootDir, relativePath));
    if (relativePath.endsWith('.pdf') && !bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
      errors.push(`Invalid PDF signature: ${relativePath}`);
    }
    if (/\.(?:avif|webp|png|jpe?g)$/i.test(relativePath)) {
      try {
        const metadata = await sharp(bytes, { failOn: 'error' }).metadata();
        if (!metadata.width || !metadata.height) throw new Error('missing dimensions');
      } catch {
        errors.push(`Image decode or dimensions invalid: ${relativePath}`);
      }
    }
    if (relativePath.endsWith('.vtt') && !bytes.toString('utf8').startsWith('WEBVTT')) {
      errors.push(`Invalid VTT caption header: ${relativePath}`);
    }
    if (relativePath.endsWith('.mp4') && !bytes.subarray(0, 32).includes(Buffer.from('ftyp'))) {
      errors.push(`Invalid MP4 signature: ${relativePath}`);
    }
  }
  const video = 'public/videos/meeting/interaction-sequence.mp4';
  if (await isRegularFile(path.join(rootDir, video))) {
    const relationships = [
      ['public/videos/meeting/interaction-sequence.vtt', '.vtt caption'],
      ['public/images/meeting/interaction-sequence-poster.avif', 'poster'],
    ];
    for (const [requiredPath, label] of relationships) {
      if (!(await isRegularFile(path.join(rootDir, requiredPath)))) {
        errors.push(`${video} requires ${label}: ${requiredPath}`);
      }
    }
  }
  return errors;
}

async function validatePublicationInputKinds(rootDir) {
  const errors = [];
  for (const relativePath of publicationInputs) {
    try {
      const stat = await fs.lstat(path.join(rootDir, relativePath));
      if (stat.isSymbolicLink() || !stat.isFile()) {
        errors.push(`Publication input must be a regular non-symlink file: ${relativePath}`);
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') errors.push(`Unable to inspect publication input: ${relativePath}`);
    }
  }
  return errors;
}

async function validateApprovedContent(rootDir) {
  const requiredContractPaths = [
    'evidence/call-agent/manifest.json',
    'evidence/call-agent/checksums.json',
    'evidence/stt-demo/source.json',
    'evidence/stt-demo/checksums.json',
    'content/work/call-agent.en.mdx',
    'content/work/call-agent.zh.mdx',
    'content/build/stt-demo.en.mdx',
    'content/build/stt-demo.zh.mdx',
  ];
  const present = await Promise.all(
    requiredContractPaths.map((value) => isRegularFile(path.join(rootDir, value))),
  );
  if (!present.some(Boolean)) return [];
  if (!present.every(Boolean)) {
    return requiredContractPaths
      .filter((_, index) => !present[index])
      .map((value) => `Incomplete approved content validation input: ${value}`);
  }
  try {
    return await validateSite({ rootDir });
  } catch (error) {
    return [`Approved content validation failed: ${error instanceof Error ? error.message : String(error)}`];
  }
}

async function validateMediaManifest(rootDir, mode) {
  const manifestPath = path.join(rootDir, 'evidence/media/manifest.json');
  if (!(await isRegularFile(manifestPath))) {
    return mode === 'source' ? ['Missing media manifest: evidence/media/manifest.json'] : [];
  }
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch {
    return ['Media manifest is invalid JSON'];
  }
  const errors = [];
  try {
    if (manifest.version !== 1) throw new Error('version must be 1');
    if (JSON.stringify(manifest.allowedWidths) !== JSON.stringify(RESPONSIVE_WIDTHS)) {
      throw new Error(`allowedWidths must equal ${RESPONSIVE_WIDTHS.join(', ')}`);
    }
    if (mode !== 'output') {
      assertSafeRelativePath(manifest.sourceRoot, 'sourceRoot');
      if (manifest.sourceRoot === 'public' || manifest.sourceRoot.startsWith('public/')) {
        throw new Error('sourceRoot must not be inside public/');
      }
    }
    if (!Array.isArray(manifest.assets)) throw new Error('assets must be an array');
    if (!Array.isArray(manifest.generated)) throw new Error('generated must be an array');
    const destinations = new Set();
    const assetIds = new Set();
    const expectedRecords = new Map();
    for (const [index, asset] of manifest.assets.entries()) {
      if (!asset || typeof asset.id !== 'string' || !asset.id.trim()) {
        throw new Error(`assets[${index}].id must be non-empty`);
      }
      if (assetIds.has(asset.id)) throw new Error(`duplicate asset id ${asset.id}`);
      assetIds.add(asset.id);
      if (mode !== 'output') {
        assertSafeRelativePath(asset.source, `assets[${index}].source`);
      }
      assertSafeRelativePath(asset.destination, `assets[${index}].destination`);
      if (!asset.destination.startsWith('public/') || path.extname(asset.destination)) {
        throw new Error(`assets[${index}].destination must be extensionless under public/`);
      }
      if (destinations.has(asset.destination)) throw new Error(`duplicate destination ${asset.destination}`);
      destinations.add(asset.destination);
      if (!Array.isArray(asset.widths) || asset.widths.length === 0) {
        throw new Error(`assets[${index}].widths must be non-empty`);
      }
      selectResponsiveWidths(asset.widths, Number.MAX_SAFE_INTEGER);
      if (!['jpeg', 'png'].includes(asset.fallback)) {
        throw new Error(`assets[${index}].fallback must be jpeg or png`);
      }
      let intrinsicWidth = asset.intrinsicWidth;
      let intrinsicHeight = asset.intrinsicHeight;
      if (mode === 'source') {
        const sourceRoot = resolveContainedPath(rootDir, manifest.sourceRoot);
        const sourcePath = resolveContainedPath(sourceRoot, asset.source);
        if (!(await isRegularFile(sourcePath))) {
          errors.push(`Media manifest source is missing: ${asset.source}`);
        } else {
          try {
            const metadata = await sharp(sourcePath, { failOn: 'error' }).metadata();
            if (!metadata.width || !metadata.height) throw new Error('missing dimensions');
            if (
              (intrinsicWidth !== undefined && intrinsicWidth !== metadata.width) ||
              (intrinsicHeight !== undefined && intrinsicHeight !== metadata.height)
            ) {
              errors.push(`Media manifest intrinsic dimensions mismatch: ${asset.source}`);
            }
            intrinsicWidth = metadata.width;
            intrinsicHeight = metadata.height;
          } catch {
            errors.push(`Media manifest source image is invalid: ${asset.source}`);
          }
        }
      }
      if (
        !Number.isInteger(intrinsicWidth) || intrinsicWidth <= 0 ||
        !Number.isInteger(intrinsicHeight) || intrinsicHeight <= 0
      ) {
        errors.push(`Media manifest asset ${asset.id} requires intrinsic dimensions`);
        continue;
      }
      for (const width of selectResponsiveWidths(asset.widths, intrinsicWidth)) {
        const dimensions = dimensionsAtWidth(intrinsicWidth, intrinsicHeight, width);
        for (const format of ['avif', 'webp', asset.fallback]) {
          const expectedPath = responsiveVariantPath(asset.destination, width, format);
          expectedRecords.set(expectedPath, {
            asset: asset.id,
            path: expectedPath,
            format,
            ...dimensions,
          });
        }
      }
    }
    const generatedPaths = new Set();
    for (const [index, record] of manifest.generated.entries()) {
      assertSafeRelativePath(record?.path, `generated[${index}].path`);
      if (!record.path.startsWith('public/')) throw new Error(`generated[${index}].path must be under public/`);
      if (generatedPaths.has(record.path)) throw new Error(`duplicate generated path ${record.path}`);
      generatedPaths.add(record.path);
      if (!['avif', 'webp', 'jpeg', 'png'].includes(record.format)) {
        throw new Error(`generated[${index}] has invalid format`);
      }
      if (!RESPONSIVE_WIDTHS.includes(record.width) || !Number.isInteger(record.height) || record.height <= 0) {
        throw new Error(`generated[${index}] has invalid dimensions`);
      }
      if (!Number.isInteger(record.bytes) || record.bytes <= 0) {
        throw new Error(`generated[${index}] has invalid byte size`);
      }
      const expected = expectedRecords.get(record.path);
      if (
        !expected ||
        expected.asset !== record.asset ||
        expected.format !== record.format ||
        expected.width !== record.width ||
        expected.height !== record.height
      ) {
        errors.push(`Orphan generated media record: ${record.path}`);
      } else {
        expectedRecords.delete(record.path);
      }
      const physicalRelativePath = mode === 'output'
        ? `out/${record.path.slice('public/'.length)}`
        : record.path;
      const generatedPath = resolveContainedPath(rootDir, physicalRelativePath);
      if (!(await isRegularFile(generatedPath))) {
        errors.push(`Generated media record file is missing: ${physicalRelativePath}`);
        continue;
      }
      const stat = await fs.stat(generatedPath);
      if (stat.size !== record.bytes) {
        errors.push(`Generated media byte size mismatch: ${record.path}`);
      }
      try {
        const metadata = await sharp(generatedPath, { failOn: 'error' }).metadata();
        if (metadata.width !== record.width || metadata.height !== record.height) {
          errors.push(`Generated media dimension mismatch: ${record.path}`);
        }
      } catch {
        errors.push(`Generated media decode failed: ${record.path}`);
      }
    }
    for (const expectedPath of expectedRecords.keys()) {
      errors.push(`Missing generated media record: ${expectedPath}`);
    }
  } catch (error) {
    errors.unshift(`Media manifest: ${error instanceof Error ? error.message : String(error)}`);
  }
  return errors;
}

function outputTargetForReference(outputRoot, htmlPath, reference) {
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean || /^(?:[a-z]+:|\/\/|#)/i.test(clean)) return undefined;
  let decoded;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    return null;
  }
  const target = decoded.startsWith('/')
    ? path.resolve(outputRoot, `.${decoded}`)
    : path.resolve(path.dirname(htmlPath), decoded);
  const relativeTarget = path.relative(outputRoot, target);
  if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) return null;
  return target;
}

async function targetExists(target) {
  if (!target) return false;
  if (await isRegularFile(target)) return true;
  return isRegularFile(path.join(target, 'index.html'));
}

async function validateOutput(rootDir) {
  const errors = [];
  const outputRoot = path.join(rootDir, 'out');
  for (const relativePath of outputPublicationPaths) {
    const outputPath = path.join(outputRoot, relativePath);
    if (!(await isRegularFile(outputPath))) {
      errors.push(`Missing required output asset: ${relativePath}`);
      continue;
    }
    const bytes = await fs.readFile(outputPath);
    if (relativePath.endsWith('.pdf') && !bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
      errors.push(`Invalid output PDF signature: ${relativePath}`);
    }
    if (/\.(?:avif|webp|png|jpe?g)$/i.test(relativePath)) {
      try {
        const metadata = await sharp(bytes, { failOn: 'error' }).metadata();
        if (!metadata.width || !metadata.height) throw new Error('missing dimensions');
      } catch {
        errors.push(`Output image decode or dimensions invalid: ${relativePath}`);
      }
    }
    if (relativePath.endsWith('.vtt') && !bytes.toString('utf8').startsWith('WEBVTT')) {
      errors.push(`Invalid output VTT caption header: ${relativePath}`);
    }
    if (relativePath.endsWith('.mp4') && !bytes.subarray(0, 32).includes(Buffer.from('ftyp'))) {
      errors.push(`Invalid output MP4 signature: ${relativePath}`);
    }
  }
  const files = await walkFiles(outputRoot);
  for (const htmlPath of files.filter((filePath) => filePath.endsWith('.html'))) {
    const html = await fs.readFile(htmlPath, 'utf8');
    if (!/^\s*<!doctype\s+html>/i.test(html) || !/<html\b/i.test(html) || !/<\/html>\s*$/i.test(html)) {
      errors.push(`Malformed generated HTML: ${relative(rootDir, htmlPath)}`);
    }
    const document = parseHtml(html);
    const references = [];
    for (const element of document.querySelectorAll('[href], [src], [poster], [srcset]')) {
      for (const attribute of ['href', 'src', 'poster']) {
        const value = element.getAttribute(attribute);
        if (value) references.push(value);
      }
      const srcset = element.getAttribute('srcset');
      if (srcset) {
        references.push(
          ...srcset.split(',')
            .map((candidate) => candidate.trim().split(/\s+/, 1)[0])
            .filter(Boolean),
        );
      }
    }
    for (const reference of references) {
      const target = outputTargetForReference(outputRoot, htmlPath, reference);
      if (target === undefined) continue;
      if (target === null || !(await targetExists(target))) {
        errors.push(`Broken internal reference "${reference}" in ${relative(rootDir, htmlPath)}`);
      }
    }
  }
  for (const route of launchRoutes) {
    for (const locale of ['en', 'zh']) {
      const routePath = path.join(outputRoot, locale, route, 'index.html');
      if (!(await isRegularFile(routePath))) {
        errors.push(`Missing output locale route: ${locale}/${route}/`);
      }
    }
  }
  return errors;
}

export async function runPublicationValidation({
  mode,
  rootDir = repositoryRoot,
}) {
  assertMode(mode);
  const missing = mode === 'output' ? [] : await findMissingPublicationInputs(rootDir);
  const structuralErrors = mode === 'output'
    ? [
        ...await validatePrivacy(rootDir, ['out']),
        ...await validateMediaManifest(rootDir, mode),
        ...await validateOutput(rootDir),
      ]
    : [
        ...await validatePrivacy(rootDir, ['content', 'evidence', 'public']),
        ...await validateContact(rootDir),
        ...await validatePublicationInputKinds(rootDir),
        ...await validateExistingMedia(rootDir),
        ...await validateApprovedContent(rootDir),
        ...await validateMediaManifest(rootDir, mode),
        ...await validateContentMetadata(rootDir, mode),
      ];
  return {
    errors: [...new Set([
      ...structuralErrors,
      ...(mode === 'development'
        ? []
        : mode === 'source'
          ? missing.map((value) => `Missing publication input: ${value}`)
          : []),
    ])],
    messages: missing.map((value) => `Missing publication input: ${value}`),
  };
}

if (process.argv[1] === scriptPath) {
  try {
    const mode = parseMode();
    const result = await runPublicationValidation({ mode });
    if (mode === 'development' && result.messages.length) {
      console.log(result.messages.join('\n'));
    }
    if (result.errors.length) {
      console.error(result.errors.join('\n'));
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
