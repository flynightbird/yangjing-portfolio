export const SENSITIVE_TEXT_LABELS = {
  authorization: 'authorization token',
  phone: 'phone number',
  ip: 'IP address',
  identifier: 'account or internal identifier',
} as const;

export function findSensitiveText(value: string): string[] {
  const findings: string[] = [];
  if (/authorization\s*[:=]|bearer\s+[a-z0-9._-]{8,}/i.test(value)) {
    findings.push(SENSITIVE_TEXT_LABELS.authorization);
  }
  if (
    /(?:\+?86[-\s]?)?1[3-9]\d[-\s]?\d{4}[-\s]?\d{4}/.test(value) ||
    /\+1[\s.-]*\d{10}\b/.test(value) ||
    /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?|\d{2,4}[\s.-])\d{3,4}[\s.-]\d{4}/.test(value)
  ) {
    findings.push(SENSITIVE_TEXT_LABELS.phone);
  }
  if (/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(value)) {
    findings.push(SENSITIVE_TEXT_LABELS.ip);
  }
  if (/(?<!data-)\b(?:account|internal|user|tenant|organization|org|workspace|project)[_-]?id\s*[:=]\s*["']?[a-z0-9][a-z0-9_-]{5,}\b/i.test(value)) {
    findings.push(SENSITIVE_TEXT_LABELS.identifier);
  }
  return findings;
}
