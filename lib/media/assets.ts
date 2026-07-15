import fs from 'node:fs/promises';
import path from 'node:path';

export const RESPONSIVE_WIDTHS = [640, 960, 1440, 1920] as const;
export type ResponsiveWidth = (typeof RESPONSIVE_WIDTHS)[number];
export type ResponsiveFormat = 'avif' | 'webp' | 'jpeg' | 'png';

export function assertSafeRelativePath(value: string, label = 'path'): string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    path.isAbsolute(value) ||
    value.includes('\\') ||
    value.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new Error(`${label} must be a safe relative path: ${value}`);
  }
  return value;
}

export function resolveContainedPath(root: string, relativePath: string): string {
  assertSafeRelativePath(relativePath);
  const resolvedRoot = path.resolve(root);
  const candidate = path.resolve(resolvedRoot, relativePath);
  const relation = path.relative(resolvedRoot, candidate);
  if (!relation || relation.startsWith('..') || path.isAbsolute(relation)) {
    throw new Error(`Path escapes root: ${relativePath}`);
  }
  return candidate;
}

export async function resolveRealContainedPath(
  root: string,
  relativePath: string,
  label = 'path',
): Promise<string> {
  const candidate = resolveContainedPath(root, relativePath);
  let realRoot: string;
  let realCandidate: string;
  try {
    [realRoot, realCandidate] = await Promise.all([
      fs.realpath(path.resolve(root)),
      fs.realpath(candidate),
    ]);
  } catch {
    throw new Error(`${label} is unreadable: ${relativePath}`);
  }
  const relation = path.relative(realRoot, realCandidate);
  if (relation === '..' || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
    throw new Error(`${label} resolves outside repository: ${relativePath}`);
  }
  return realCandidate;
}

export function selectResponsiveWidths(
  declaredWidths: readonly number[],
  intrinsicWidth: number,
): ResponsiveWidth[] {
  if (!Number.isInteger(intrinsicWidth) || intrinsicWidth <= 0) {
    throw new Error('Intrinsic width must be a positive integer');
  }
  const unique = new Set<number>();
  for (const width of declaredWidths) {
    if (!RESPONSIVE_WIDTHS.includes(width as ResponsiveWidth)) {
      throw new Error(`Responsive width must be one of ${RESPONSIVE_WIDTHS.join(', ')}: ${width}`);
    }
    unique.add(width);
  }
  return [...unique]
    .filter((width): width is ResponsiveWidth => width <= intrinsicWidth)
    .sort((a, b) => a - b);
}

export function dimensionsAtWidth(
  intrinsicWidth: number,
  intrinsicHeight: number,
  width: number,
): { width: number; height: number } {
  if ([intrinsicWidth, intrinsicHeight, width].some((value) => !Number.isInteger(value) || value <= 0)) {
    throw new Error('Image dimensions must be positive integers');
  }
  if (width > intrinsicWidth) throw new Error('Responsive dimensions must not upscale');
  return { width, height: Math.max(1, Math.round(intrinsicHeight * width / intrinsicWidth)) };
}

export function responsiveVariantPath(
  destination: string,
  width: ResponsiveWidth,
  format: ResponsiveFormat,
): string {
  assertSafeRelativePath(destination, 'destination');
  if (!destination.startsWith('public/') || path.extname(destination)) {
    throw new Error('Destination must be an extensionless path under public/');
  }
  const extension = format === 'jpeg' ? 'jpg' : format;
  return `${destination}-${width}.${extension}`;
}

export async function ensureSafeOutputPath(
  publicRoot: string,
  outputPath: string,
): Promise<void> {
  const resolvedPublicRoot = path.resolve(publicRoot);
  const resolvedOutput = path.resolve(outputPath);
  const parent = path.dirname(resolvedOutput);
  const relation = path.relative(resolvedPublicRoot, parent);
  if (relation.startsWith('..') || path.isAbsolute(relation)) {
    throw new Error(`Output path escapes public: ${outputPath}`);
  }

  await fs.mkdir(resolvedPublicRoot, { recursive: true });
  const rootStat = await fs.lstat(resolvedPublicRoot);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error('Public output root must be a real directory, not a symlink');
  }

  let current = resolvedPublicRoot;
  for (const segment of relation.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    try {
      const stat = await fs.lstat(current);
      if (stat.isSymbolicLink()) {
        throw new Error(`Output ancestor must not be a symlink: ${current}`);
      }
      if (!stat.isDirectory()) {
        throw new Error(`Output ancestor must be a directory: ${current}`);
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        await fs.mkdir(current);
      } else {
        throw error;
      }
    }
  }

  const [realRoot, realParent] = await Promise.all([
    fs.realpath(resolvedPublicRoot),
    fs.realpath(parent),
  ]);
  const realRelation = path.relative(realRoot, realParent);
  if (realRelation.startsWith('..') || path.isAbsolute(realRelation)) {
    throw new Error(`Output path resolves outside public: ${outputPath}`);
  }
}
