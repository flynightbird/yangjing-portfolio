import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@mdx-js/mdx';
import { parse } from 'acorn';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

import {
  SENSITIVE_TEXT_LABELS,
  findSensitiveText,
} from '../lib/content/privacy.ts';
import {
  RESPONSIVE_WIDTHS,
  assertSafeRelativePath,
  dimensionsAtWidth,
  resolveContainedPath,
  resolveRealContainedPath,
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

async function hasSymlinkInPath(root, filePath) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(filePath);
  const relation = path.relative(resolvedRoot, resolvedPath);
  if (relation === '..' || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
    return true;
  }
  let current = resolvedRoot;
  for (const segment of relation.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    try {
      if ((await fs.lstat(current)).isSymbolicLink()) return true;
    } catch (error) {
      if (error?.code === 'ENOENT') return false;
      throw error;
    }
  }
  return false;
}

async function validatePublicationRoots(rootDir, rootNames) {
  const errors = [];
  const realRepositoryRoot = await fs.realpath(rootDir);
  for (const rootName of rootNames) {
    const scanRoot = path.join(rootDir, rootName);
    let stat;
    try {
      stat = await fs.lstat(scanRoot);
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      errors.push(`Unable to inspect publication scan root: ${rootName}`);
      continue;
    }
    if (stat.isSymbolicLink()) {
      errors.push(`Publication scan root must not be a symlink: ${rootName}`);
      continue;
    }
    if (!stat.isDirectory()) {
      errors.push(`Publication scan root must be a directory: ${rootName}`);
      continue;
    }
    const realScanRoot = await fs.realpath(scanRoot);
    const relation = path.relative(realRepositoryRoot, realScanRoot);
    if (relation === '..' || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
      errors.push(`Publication scan root resolves outside repository: ${rootName}`);
    }
  }
  return errors;
}

async function walkFiles(directory, symlinks = []) {
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
    if (entry.isSymbolicLink()) symlinks.push(child);
    else if (entry.isDirectory()) files.push(...await walkFiles(child, symlinks));
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

function extractEmbeddedHtmlData(html) {
  const document = parseHtml(html);
  const values = [];
  for (const script of document.querySelectorAll('script[type]')) {
    if (script.getAttribute('type')?.toLowerCase().includes('json') && script.textContent) {
      values.push(script.textContent);
    }
  }
  for (const element of document.querySelectorAll('*')) {
    for (const attribute of element.attributes) {
      if (attribute.name.startsWith('data-') && attribute.value) {
        values.push(attribute.value);
      }
    }
  }
  return values.join('\n');
}

function findSensitiveHtml(html) {
  const findings = new Set(findSensitiveText(extractVisibleHtmlText(html)));
  for (const finding of findSensitiveText(extractEmbeddedHtmlData(html))) {
    findings.add(finding);
  }
  const rawHtmlFindings = findSensitiveText(html);
  for (const finding of rawHtmlFindings) {
    if (
      finding === SENSITIVE_TEXT_LABELS.authorization ||
      finding === SENSITIVE_TEXT_LABELS.identifier
    ) {
      findings.add(finding);
    }
  }
  return findings;
}

async function validatePrivacy(rootDir, roots) {
  const errors = [];
  const textExtensions = new Set([
    '.md', '.mdx', '.json', '.html', '.txt', '.vtt',
    '.js', '.mjs', '.cjs', '.css', '.svg',
  ]);
  const lowNoiseExtensions = new Set(['.js', '.mjs', '.cjs', '.css']);
  for (const rootName of roots) {
    const symlinks = [];
    const files = await walkFiles(path.join(rootDir, rootName), symlinks);
    for (const symlink of symlinks) {
      errors.push(`Symlink not allowed in publication tree: ${relative(rootDir, symlink)}`);
    }
    for (const filePath of files) {
      const extension = path.extname(filePath).toLowerCase();
      if (!textExtensions.has(extension)) continue;
      let text;
      try {
        text = await fs.readFile(filePath, 'utf8');
      } catch {
        errors.push(`Unable to read text file: ${relative(rootDir, filePath)}`);
        continue;
      }
      let findings;
      if (extension === '.html' || extension === '.svg') {
        findings = findSensitiveHtml(text);
      } else if (lowNoiseExtensions.has(extension)) {
        findings = findSensitiveText(text).filter((finding) => (
          finding === SENSITIVE_TEXT_LABELS.authorization ||
          finding === SENSITIVE_TEXT_LABELS.identifier
        ));
      } else {
        findings = findSensitiveText(text);
      }
      for (const finding of findings) {
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

async function parseMdxDocument(source) {
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
        return { metadata, program };
      }
    }
  }
  throw new Error('missing metadata export');
}

function objectProperty(object, name) {
  if (!object || object.type !== 'ObjectExpression') return undefined;
  return object.properties.find((property) => (
    property.type === 'Property' &&
    !property.computed &&
    (property.key.name === name || property.key.value === name)
  ))?.value;
}

function staticNonEmptyString(node) {
  return node?.type === 'Literal' && typeof node.value === 'string' && node.value.trim();
}

function mdxPropsAreDecorative(props) {
  const ariaHidden = objectProperty(props, 'aria-hidden');
  const role = objectProperty(props, 'role');
  return (
    ariaHidden?.type === 'Literal' && [true, 'true'].includes(ariaHidden.value) ||
    role?.type === 'Literal' && ['presentation', 'none'].includes(role.value)
  );
}

function walkAst(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'start' || key === 'end' || key === 'loc') continue;
    if (Array.isArray(value)) {
      for (const child of value) walkAst(child, visit);
    } else if (value && typeof value === 'object') {
      walkAst(value, visit);
    }
  }
}

function walkMdxJsx(node, decorativeAncestor, visit) {
  if (!node || typeof node !== 'object') return;
  const name = jsxCallName(node);
  const props = name ? node.arguments[1] : undefined;
  const decorative = decorativeAncestor || Boolean(name && mdxPropsAreDecorative(props));
  if (name) visit(node, name, decorative);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'start' || key === 'end' || key === 'loc') continue;
    if (Array.isArray(value)) {
      for (const child of value) walkMdxJsx(child, decorative, visit);
    } else if (value && typeof value === 'object') {
      walkMdxJsx(value, decorative, visit);
    }
  }
}

function jsxCallName(node) {
  if (
    node?.type !== 'CallExpression' ||
    node.callee?.type !== 'Identifier' ||
    !['_jsx', '_jsxs'].includes(node.callee.name) ||
    node.arguments[0]?.type !== 'Literal'
  ) return undefined;
  return node.arguments[0].value;
}

function astHasNonEmptyText(node) {
  let hasText = false;
  walkAst(node, (child) => {
    if (child.type === 'Literal' && typeof child.value === 'string' && child.value.trim()) {
      hasText = true;
    }
  });
  return hasText;
}

function validateMdxMedia(program, sourceName) {
  const errors = [];
  const describedText = new Set();
  const videos = [];
  walkAst(program, (node) => {
    if (!jsxCallName(node)) return;
    const props = node.arguments[1];
    const id = objectProperty(props, 'id');
    if (
      id?.type === 'Literal' &&
      typeof id.value === 'string' &&
      astHasNonEmptyText(objectProperty(props, 'children'))
    ) {
      describedText.add(id.value);
    }
  });
  walkMdxJsx(program, false, (node, name, decorative) => {
    if (name === 'img') {
      const props = node.arguments[1];
      const alt = objectProperty(props, 'alt');
      const hasDecorativeAlt = (
        alt?.type === 'Literal' && alt.value === '' && decorative
      );
      if (!staticNonEmptyString(alt) && !hasDecorativeAlt) {
        errors.push(`MDX img requires non-empty alt: ${sourceName}`);
      }
    }
    if (name === 'video') {
      const props = node.arguments[1];
      if (!staticNonEmptyString(objectProperty(props, 'poster'))) {
        errors.push(`MDX video requires poster: ${sourceName}`);
      }
      let hasCaptions = false;
      walkAst(objectProperty(props, 'children'), (child) => {
        if (jsxCallName(child) !== 'track') return;
        const trackProps = child.arguments[1];
        const kind = objectProperty(trackProps, 'kind');
        if (
          kind?.type === 'Literal' &&
          ['captions', 'subtitles'].includes(String(kind.value).toLowerCase()) &&
          staticNonEmptyString(objectProperty(trackProps, 'src'))
        ) {
          hasCaptions = true;
        }
      });
      const describedBy = objectProperty(props, 'aria-describedby');
      const hasDescribedTranscript = (
        describedBy?.type === 'Literal' &&
        typeof describedBy.value === 'string' &&
        describedBy.value.split(/\s+/).some((id) => describedText.has(id))
      );
      videos.push({
        hasCaptions,
        hasDescribedTranscript,
      });
    }
  });
  for (const video of videos) {
    if (!video.hasCaptions && !video.hasDescribedTranscript) {
      errors.push(`MDX video requires captions/subtitles track or transcript access: ${sourceName}`);
    }
  }
  return errors;
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
    let program;
    try {
      ({ metadata, program } = await parseMdxDocument(source));
    } catch (error) {
      errors.push(`Metadata parse failed: ${sourceName}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    errors.push(...validateMdxMedia(program, sourceName));
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

function isApprovedLinkedInUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      ['linkedin.com', 'www.linkedin.com'].includes(url.hostname) &&
      /^\/(?:in|pub)\/[^/]+\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function isCalendarDate(value) {
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
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
  if (!isApprovedLinkedInUrl(contactRecord.linkedin)) {
    errors.push('Contact linkedin must be an HTTPS linkedin.com profile URL');
  }
  if (typeof contactRecord.wechatId !== 'string' || !contactRecord.wechatId.trim()) {
    errors.push('Contact wechatId must be a non-empty string');
  }
  if (!isCalendarDate(contactRecord.resumeRevision)) {
    errors.push('Contact resumeRevision must be a real YYYY-MM-DD calendar date');
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
    const inputPath = path.join(rootDir, relativePath);
    if (await hasSymlinkInPath(rootDir, path.dirname(inputPath))) {
      errors.push(`Publication input has symlink ancestor: ${relativePath}`);
      continue;
    }
    try {
      const stat = await fs.lstat(inputPath);
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
    let sourceRoot;
    let realSourceRoot;
    if (mode !== 'output' && manifest.assets.length > 0) {
      sourceRoot = resolveContainedPath(rootDir, manifest.sourceRoot);
      try {
        await fs.lstat(sourceRoot);
        realSourceRoot = await resolveRealContainedPath(
          rootDir,
          manifest.sourceRoot,
          'sourceRoot',
        );
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    }
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
        const sourcePath = realSourceRoot
          ? await resolveRealContainedPath(
              realSourceRoot,
              asset.source,
              `assets[${index}].source`,
            )
          : resolveContainedPath(sourceRoot, asset.source);
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

const unsafeOutputReference = Symbol('unsafe output reference');

function outputTargetForReference(outputRoot, htmlPath, reference) {
  if (!reference || /^(?:[a-z]+:|\/\/|#)/i.test(reference)) return undefined;
  if (reference.includes('\\')) return unsafeOutputReference;
  let decodedPath;
  try {
    const htmlRelative = `/${relative(outputRoot, htmlPath)}`;
    const base = new URL(htmlRelative, 'https://publication.local/');
    const parsed = new URL(reference, base);
    if (parsed.origin !== base.origin) return undefined;
    decodedPath = parsed.pathname;
    for (let index = 0; index < 10; index += 1) {
      const next = decodeURIComponent(decodedPath);
      if (next === decodedPath) break;
      decodedPath = next;
      if (decodedPath.includes('\\')) return unsafeOutputReference;
      if (index === 9) return unsafeOutputReference;
    }
    const escapedPath = decodedPath
      .replaceAll('%', '%25')
      .replaceAll('#', '%23')
      .replaceAll('?', '%3F');
    decodedPath = decodeURIComponent(new URL(
      escapedPath,
      'https://publication.local/',
    ).pathname);
  } catch {
    return unsafeOutputReference;
  }
  const target = path.resolve(outputRoot, `.${decodedPath}`);
  const relativeTarget = path.relative(outputRoot, target);
  if (
    relativeTarget === '..' ||
    relativeTarget.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeTarget)
  ) return unsafeOutputReference;
  return target;
}

async function targetExists(target) {
  if (!target) return false;
  if (await isRegularFile(target)) return true;
  return isRegularFile(path.join(target, 'index.html'));
}

function validateHtmlMedia(document, sourceName) {
  const errors = [];
  for (const image of document.querySelectorAll('img')) {
    const alt = image.getAttribute('alt');
    const isDecorative = Boolean(image.closest(
      '[aria-hidden="true" i], [role="presentation" i], [role="none" i]',
    ));
    if (alt === null || (!alt.trim() && !isDecorative)) {
      errors.push(`Generated img requires non-empty alt: ${sourceName}`);
    }
  }
  for (const video of document.querySelectorAll('video')) {
    if (!video.getAttribute('poster')?.trim()) {
      errors.push(`Generated video requires poster: ${sourceName}`);
    }
    const hasCaptions = [...video.querySelectorAll('track')].some((track) => (
      ['captions', 'subtitles'].includes(track.getAttribute('kind')?.toLowerCase()) &&
      track.getAttribute('src')?.trim()
    ));
    const describedBy = video.getAttribute('aria-describedby')?.trim();
    const hasDescribedTranscript = Boolean(describedBy?.split(/\s+/).some((id) => (
      document.getElementById(id)?.textContent?.trim()
    )));
    if (!hasCaptions && !hasDescribedTranscript) {
      errors.push(
        `Generated video requires captions/subtitles track or transcript access: ${sourceName}`,
      );
    }
  }
  return errors;
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
    errors.push(...validateHtmlMedia(document, relative(rootDir, htmlPath)));
    const references = [];
    for (const element of document.querySelectorAll(
      '[href], [src], [poster], [srcset], [data-transcript-href]',
    )) {
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
      const transcriptHref = element.getAttribute('data-transcript-href');
      if (transcriptHref) references.push(transcriptHref);
    }
    for (const reference of references) {
      const target = outputTargetForReference(outputRoot, htmlPath, reference);
      if (target === undefined) continue;
      if (target === unsafeOutputReference) {
        errors.push(`Unsafe internal reference "${reference}" in ${relative(rootDir, htmlPath)}`);
      } else if (await hasSymlinkInPath(outputRoot, target)) {
        errors.push(`Unsafe internal reference "${reference}" in ${relative(rootDir, htmlPath)}`);
      } else if (!(await targetExists(target))) {
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
  const publicationRoots = mode === 'output'
    ? ['out']
    : ['content', 'evidence', 'public'];
  const rootErrors = await validatePublicationRoots(rootDir, publicationRoots);
  if (rootErrors.length) return { errors: rootErrors, messages: [] };
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
