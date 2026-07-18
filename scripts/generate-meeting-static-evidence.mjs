import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'evidence/meeting/source');

const palette = {
  paper: '#f3f4f1',
  ink: '#17191c',
  muted: '#697078',
  line: '#cfd3d1',
  accent: '#e4583e',
  panel: '#ffffff',
};

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function svgDocument({ width = 1800, height = 1000, title, eyebrow, body }) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${palette.paper}" />
      <text x="72" y="76" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(eyebrow)}</text>
      <text x="72" y="142" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="48" font-weight="700">${escapeXml(title)}</text>
      ${body}
    </svg>
  `);
}

async function resizeBuffer(fileName, width, height) {
  return sharp(path.join(sourceDir, fileName))
    .resize(width, height, { fit: 'contain', background: '#17191c' })
    .png()
    .toBuffer();
}

function labelSvg(text, width, height = 52) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${palette.panel}" />
      <text x="20" y="34" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(text)}</text>
    </svg>
  `);
}

async function createComposite(fileName, width, height, items) {
  const composites = [];
  for (const item of items) {
    composites.push({
      input: await resizeBuffer(item.source, item.width, item.height),
      left: item.left,
      top: item.top,
    });
    if (item.label) {
      composites.push({
        input: labelSvg(item.label, item.width),
        left: item.left,
        top: item.top + item.height,
      });
    }
  }
  await sharp({
    create: { width, height, channels: 3, background: palette.paper },
  })
    .composite(composites)
    .png()
    .toFile(path.join(sourceDir, fileName));
}

async function writeSvgPng(fileName, svg) {
  await sharp(svg).png().toFile(path.join(sourceDir, fileName));
}

function matrixSvg() {
  const rows = [
    ['SCREEN SHARE', 'Shared content', 'Content focus'],
    ['WHITEBOARD', 'Canvas interaction', 'Workspace mode'],
    ['PARTICIPANTS', 'Visibility / speaker', 'Gallery / speaker'],
  ];
  const rowMarkup = rows.map((row, index) => {
    const y = 340 + index * 120;
    return `
      <line x1="72" y1="${y - 54}" x2="1728" y2="${y - 54}" stroke="${palette.line}" />
      <text x="96" y="${y}" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="25" font-weight="700">${row[0]}</text>
      <text x="620" y="${y}" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="25">${row[1]}</text>
      <text x="1190" y="${y}" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="25">${row[2]}</text>
    `;
  }).join('');
  return svgDocument({
    title: 'Meeting stage state rules',
    eyebrow: 'PORTFOLIO EXPLANATION / VERIFIED PRODUCT RULES',
    body: `
      <text x="96" y="245" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="18">TRIGGER</text>
      <text x="620" y="245" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="18">INFORMATION PRIORITY</text>
      <text x="1190" y="245" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="18">STAGE RESULT</text>
      ${rowMarkup}
      <line x1="72" y1="766" x2="1728" y2="766" stroke="${palette.line}" />
    `,
  });
}

function participantPrioritySvg() {
  const labels = [
    'Active Speaker', 'Self', 'Camera + Microphone', 'Camera', 'Microphone',
  ];
  const rows = labels.map((label, index) => {
    const y = 265 + index * 92;
    return `
      <line x1="72" y1="${y - 46}" x2="1728" y2="${y - 46}" stroke="${palette.line}" />
      <text x="96" y="${y}" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="20">${String(index + 1).padStart(2, '0')}</text>
      <text x="190" y="${y}" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="28" font-weight="700">${label}</text>
    `;
  }).join('');
  return svgDocument({
    title: 'Participant view priority',
    eyebrow: 'MOBILE PORTRAIT WHITEBOARD / VERIFIED DISPLAY ORDER',
    body: `${rows}<line x1="72" y1="679" x2="1728" y2="679" stroke="${palette.line}" />`,
  });
}

function languageControlSvg() {
  return svgDocument({
    title: 'Personal captions, meeting-level transcript',
    eyebrow: 'PORTFOLIO EXPLANATION / VERIFIED CONTROL BOUNDARY',
    body: `
      <rect x="72" y="230" width="800" height="560" rx="8" fill="${palette.panel}" stroke="${palette.line}" />
      <text x="120" y="300" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="18" font-weight="700">INDIVIDUAL CONTROL</text>
      <text x="120" y="400" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="42" font-weight="700">Live Captions</text>
      <text x="120" y="480" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="26">Language and translation preference</text>
      <rect x="928" y="230" width="800" height="560" rx="8" fill="${palette.panel}" stroke="${palette.line}" />
      <text x="976" y="300" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="18" font-weight="700">MEETING-LEVEL CONTROL</text>
      <text x="976" y="400" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="42" font-weight="700">Transcript Panel</text>
      <text x="976" y="480" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="26">Host starts or stops</text>
      <text x="976" y="535" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="26">Participant can request activation</text>
    `,
  });
}

function apiBoundarySvg() {
  const steps = [
    ['01', 'Live speech'],
    ['02', 'In-meeting processing'],
    ['03', 'Agora Meeting UI'],
    ['04', 'Customer API'],
  ];
  const body = steps.map(([number, label], index) => {
    const x = 72 + index * 424;
    const arrow = index < steps.length - 1
      ? `<path d="M ${x + 344} 500 H ${x + 406}" stroke="${palette.accent}" stroke-width="4" /><path d="M ${x + 394} 488 L ${x + 406} 500 L ${x + 394} 512" fill="none" stroke="${palette.accent}" stroke-width="4" />`
      : '';
    return `
      <rect x="${x}" y="330" width="344" height="340" rx="8" fill="${palette.panel}" stroke="${palette.line}" />
      <text x="${x + 32}" y="390" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="18" font-weight="700">${number}</text>
      <text x="${x + 32}" y="490" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="28" font-weight="700">${label}</text>
      ${arrow}
    `;
  }).join('');
  return svgDocument({
    title: 'The product boundary ends at the customer API',
    eyebrow: 'PORTFOLIO EXPLANATION / NOT A TECHNICAL ARCHITECTURE',
    body,
  });
}

function launchCoverageSvg() {
  const platforms = ['Desktop', 'Web', 'Tablet', 'Mobile'];
  const body = platforms.map((label, index) => {
    const x = 72 + index * 424;
    return `
      <rect x="${x}" y="300" width="344" height="400" rx="8" fill="${palette.panel}" stroke="${palette.line}" />
      <text x="${x + 32}" y="370" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="18" font-weight="700">0${index + 1}</text>
      <text x="${x + 32}" y="500" fill="${palette.ink}" font-family="Arial, sans-serif" font-size="38" font-weight="700">${label}</text>
      <text x="${x + 32}" y="620" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="22">Shipped</text>
    `;
  }).join('');
  return svgDocument({
    title: 'Production coverage across four platform categories',
    eyebrow: 'VERIFIED DELIVERY / NO QUANTITATIVE USAGE CLAIM',
    body,
  });
}

export async function generateMeetingStaticEvidence() {
  await fs.mkdir(sourceDir, { recursive: true });

  await createComposite('adaptive-layout-poster.png', 1800, 1000, [
    { source: 'meeting-hero.png', left: 60, top: 100, width: 810, height: 760, label: 'GALLERY STAGE' },
    { source: 'whiteboard-desktop.png', left: 930, top: 100, width: 810, height: 760, label: 'WHITEBOARD WORKSPACE' },
  ]);

  await createComposite('device-comparison.png', 1800, 1000, [
    { source: 'meeting-hero.png', left: 60, top: 100, width: 1080, height: 760, label: 'DESKTOP / WEB' },
    { source: 'whiteboard-mobile.png', left: 1200, top: 100, width: 540, height: 760, label: 'MOBILE ORIENTATION' },
  ]);

  await createComposite('whiteboard-multidevice.png', 1800, 1100, [
    { source: 'whiteboard-desktop.png', left: 60, top: 100, width: 1120, height: 860, label: 'DESKTOP WHITEBOARD' },
    { source: 'whiteboard-mobile.png', left: 1240, top: 100, width: 500, height: 860, label: 'MOBILE WHITEBOARD' },
  ]);

  await sharp(path.join(sourceDir, 'breakout-room.png'))
    .png()
    .toFile(path.join(sourceDir, 'capability-system.png'));

  await Promise.all([
    writeSvgPng('meeting-state-matrix.png', matrixSvg()),
    writeSvgPng('participant-priority.png', participantPrioritySvg()),
    writeSvgPng('caption-vs-transcript.png', languageControlSvg()),
    writeSvgPng('speech-to-api.png', apiBoundarySvg()),
    writeSvgPng('launch-coverage.png', launchCoverageSvg()),
  ]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateMeetingStaticEvidence()
    .then(() => process.stdout.write('Generated Meeting static evidence.\n'))
    .catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
