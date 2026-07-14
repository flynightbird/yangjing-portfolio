import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function findSensitiveText(value) {
  const findings = [];
  if (/authorization\s*[:=]|bearer\s+[a-z0-9._-]{8,}/i.test(value)) findings.push('authorization token');
  if (/(?:\+?86[-\s]?)?1[3-9]\d[-\s]?\d{4}[-\s]?\d{4}/.test(value)) findings.push('phone number');
  if (/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(value)) findings.push('IP address');
  return findings;
}

export function validateManifestEntry(entry) {
  return ['source', 'chapter', 'purpose', 'alt']
    .filter((key) => !entry[key])
    .map((key) => `missing ${key}`);
}

export function validateSite() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/manifest.json'), 'utf8'));
  const errors = [...findSensitiveText(html)];
  for (const entry of manifest.assets) {
    errors.push(...validateManifestEntry(entry).map((error) => `${entry.output}: ${error}`));
    if (!fs.existsSync(path.join(root, 'public/images', entry.output))) {
      errors.push(`missing processed image ${entry.output}`);
    }
  }
  const ids = ['overview', 'context-role', 'design-thesis', 'decision-path', 'decision-preview', 'decision-operate', 'system-delivery', 'outcome-learnings'];
  for (const id of ids) if (!html.includes(`id="${id}"`)) errors.push(`missing chapter ${id}`);
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateSite();
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('Content validation passed');
}
