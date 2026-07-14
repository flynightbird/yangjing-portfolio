# Call Agent Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a recruiter-oriented Chinese Call Agent case-study website that is responsive, evidence-led, deployable to GitHub Pages, and exportable as a visually reviewed A4 PDF.

**Architecture:** Use a Vite-served static document with semantic HTML for the eight approved chapters, layered CSS files for foundations, layout, components, responsive behavior, and print, and a small native JavaScript module for chapter tracking, image lightbox behavior, and print controls. Process source screenshots through an explicit asset manifest so public images are copied or destructively redacted before they enter the repository; verify structure and browser behavior with Node tests and Playwright.

**Tech Stack:** HTML5, CSS custom properties, native ES modules, Vite, Sharp, Node test runner, Playwright, GitHub Pages Actions.

---

## File Map

- `index.html`: semantic case-study content and eight-chapter reading order.
- `src/main.js`: imports styles and initializes navigation, lightbox, and print behavior.
- `src/styles/tokens.css`: color, typography, spacing, radius, border, and motion tokens.
- `src/styles/base.css`: reset, type defaults, focus states, and global media behavior.
- `src/styles/layout.css`: page bands, editorial grid, chapter layouts, and breakpoints.
- `src/styles/components.css`: chapter index, metadata, journey, evidence, comparison, quote, image, and lightbox styles.
- `src/styles/print.css`: A4 print rules, page breaks, light-theme conversion, and web-only suppression.
- `src/ui/navigation.js`: current-chapter tracking and mobile chapter menu.
- `src/ui/lightbox.js`: accessible image enlargement and keyboard dismissal.
- `src/ui/print.js`: browser print command.
- `assets/manifest.json`: source-to-public image mapping, chapter purpose, alt text, and redaction rectangles.
- `public/images/`: only processed, public-safe portfolio images.
- `scripts/prepare-assets.mjs`: validates the manifest, copies safe images, and burns redaction rectangles into pixels with Sharp.
- `scripts/validate-content.mjs`: checks chapter IDs, evidence labels, sensitive literals, image references, and alt text.
- `tests/content.test.mjs`: unit tests for the content validator.
- `tests/case-study.spec.mjs`: Playwright desktop, mobile, interaction, and print checks.
- `playwright.config.mjs`: browser test configuration and Vite web server.
- `.github/workflows/deploy.yml`: build and deploy `dist/` to GitHub Pages.
- `README.md`: local development, asset processing, testing, deployment, and PDF export instructions.
- `portfolio/call-agent-case-study.pdf`: final visually verified PDF export.

## Implementation Preconditions

Before Task 4 is considered complete, obtain four matching pieces of evidence for the `AI 配置 + Preview` page:

1. The design specification or design screenshot.
2. The designer's AI-assisted coded prototype screenshot.
3. The engineering production screenshot.
4. An anonymized engineer feedback screenshot or an approved verbatim quotation.

Do not replace missing evidence with invented UI, invented quotes, or estimated efficiency numbers. The site may be developed locally without these four files, but it must not be marked publication-ready until they are processed and displayed.

### Task 1: Scaffold The Static Site And Verification Toolchain

**Files:**
- Create: `package.json`
- Create: `playwright.config.mjs`
- Create: `tests/case-study.spec.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: Write the initial browser test**

```js
// tests/case-study.spec.mjs
import { test, expect } from '@playwright/test';

test('presents the approved eight-chapter structure', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main > section')).toHaveCount(8);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI 呼叫能力');
  await expect(page.locator('#decision-preview')).toContainText('发布前可见、可测、可控');
  await expect(page.locator('#system-delivery')).toContainText('工程交付');
});
```

- [ ] **Step 2: Add the package and Playwright configuration**

```json
{
  "name": "call-agent-portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "npm run validate && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "assets": "node scripts/prepare-assets.mjs",
    "validate": "node scripts/validate-content.mjs",
    "test": "node --test tests/content.test.mjs",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "sharp": "latest",
    "vite": "latest"
  }
}
```

```js
// playwright.config.mjs
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } }
  ]
});
```

- [ ] **Step 3: Ignore generated and local-only files**

```gitignore
.superpowers/
node_modules/
dist/
test-results/
playwright-report/
.DS_Store
```

- [ ] **Step 4: Install dependencies and verify the test fails for the expected reason**

Run: `npm install && npx playwright install chromium && npm run test:e2e -- --project=desktop`

Expected: FAIL because the current `preview/index.html` is not the new root application and the eight semantic sections do not exist.

- [ ] **Step 5: Commit the scaffold**

```bash
git add package.json package-lock.json playwright.config.mjs tests/case-study.spec.mjs .gitignore
git commit -m "chore: scaffold portfolio site toolchain"
```

### Task 2: Build A Destructive Asset-Safety Pipeline

**Files:**
- Create: `assets/manifest.json`
- Create: `scripts/prepare-assets.mjs`
- Create: `scripts/validate-content.mjs`
- Create: `tests/content.test.mjs`
- Create: `public/images/`

- [ ] **Step 1: Write validator tests for sensitive content and manifest integrity**

```js
// tests/content.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { findSensitiveText, validateManifestEntry } from '../scripts/validate-content.mjs';

test('flags authorization tokens and unmasked phone numbers', () => {
  assert.deepEqual(findSensitiveText('Authorization: Bearer abc.def.ghi'), ['authorization token']);
  assert.deepEqual(findSensitiveText('+86 138 1234 5678'), ['phone number']);
});

test('requires public alt text and a chapter purpose', () => {
  assert.deepEqual(validateManifestEntry({ output: 'preview.png' }), [
    'missing source',
    'missing chapter',
    'missing purpose',
    'missing alt'
  ]);
});
```

- [ ] **Step 2: Implement the content and manifest validator**

```js
// scripts/validate-content.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function findSensitiveText(value) {
  const findings = [];
  if (/authorization\s*[:=]|bearer\s+[a-z0-9._-]{12,}/i.test(value)) findings.push('authorization token');
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
  for (const entry of manifest.assets) errors.push(...validateManifestEntry(entry).map((error) => `${entry.output}: ${error}`));
  for (const id of ['overview', 'context-role', 'design-thesis', 'decision-path', 'decision-preview', 'decision-operate', 'system-delivery', 'outcome-learnings']) {
    if (!html.includes(`id="${id}"`)) errors.push(`missing chapter ${id}`);
  }
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
```

- [ ] **Step 3: Create the initial evidence manifest**

Use these source candidates and verify their visual meaning before assigning them to the named output. The token-bearing `5.17.38 PM` screenshot is explicitly excluded and must never be copied into `public/`.

```json
{
  "assets": [
    {
      "source": "/Users/admin/Desktop/声网 作品集 整理/studio 截图/Screenshot 2026-07-13 at 2.45.35 PM.png",
      "output": "hero-ai-config-preview.png",
      "chapter": "overview",
      "purpose": "首屏展示 AI 配置与 Preview 的产品形态",
      "alt": "智能呼叫中心中 AI 配置与实时预览并列的工作界面",
      "redactions": []
    },
    {
      "source": "/Users/admin/Desktop/Screenshot 2026-07-13 at 6.33.57 PM.png",
      "output": "product-switcher.png",
      "chapter": "decision-path",
      "purpose": "说明 AI Studio 与智能呼叫中心的产品切换关系",
      "alt": "左侧导航中的 AI Studio 与智能呼叫中心产品切换入口",
      "redactions": []
    },
    {
      "source": "/Users/admin/Desktop/声网 作品集 整理/studio 旧版/资源-我的已创建资源.jpg",
      "output": "before-resource-management.jpg",
      "chapter": "decision-path",
      "purpose": "展示旧版资源导向的信息架构",
      "alt": "旧版对话式引擎的资源管理页面",
      "redactions": []
    },
    {
      "source": "/Users/admin/Desktop/声网 作品集 整理/studio 旧版/呼叫历史.png",
      "output": "before-call-history.png",
      "chapter": "decision-operate",
      "purpose": "展示旧版呼叫历史的信息密度与诊断路径",
      "alt": "旧版呼叫历史列表页面",
      "redactions": []
    },
    {
      "source": "/Users/admin/Desktop/声网 作品集 整理/studio 截图/Screenshot 2026-07-13 at 5.23.45 PM.png",
      "output": "after-call-operations.png",
      "chapter": "decision-operate",
      "purpose": "展示新版呼叫任务或结果诊断能力",
      "alt": "新版智能呼叫中心的呼叫运营与结果诊断页面",
      "redactions": []
    }
  ],
  "excluded": [
    {
      "source": "/Users/admin/Desktop/声网 作品集 整理/studio 截图/Screenshot 2026-07-13 at 5.17.38 PM.png",
      "reason": "contains visible authorization token"
    }
  ]
}
```

During implementation, inspect every selected image at original resolution. If a phone number, IP, App ID, Pipeline ID, customer name, account, or token is visible, add a pixel rectangle `{ "left": 0, "top": 0, "width": 100, "height": 30, "color": "#111827" }` using measured pixel coordinates. An empty `redactions` array is acceptable only after original-resolution review.

- [ ] **Step 4: Implement destructive copy and redaction**

```js
// scripts/prepare-assets.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'assets/manifest.json'), 'utf8'));
const outputDir = path.join(root, 'public/images');
await fs.mkdir(outputDir, { recursive: true });

for (const asset of manifest.assets) {
  const image = sharp(asset.source, { failOn: 'error' });
  const composites = (asset.redactions || []).map((rect) => ({
    input: Buffer.from(`<svg width="${rect.width}" height="${rect.height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${rect.color || '#111827'}"/></svg>`),
    left: rect.left,
    top: rect.top
  }));
  if (composites.length) image.composite(composites);
  await image.toFile(path.join(outputDir, asset.output));
}

console.log(`Prepared ${manifest.assets.length} public-safe images`);
```

- [ ] **Step 5: Run unit tests and process images**

Run: `npm test && npm run assets`

Expected: all validator tests PASS and the command prints `Prepared 5 public-safe images` before the four System & Delivery evidence assets are added.

- [ ] **Step 6: Commit the pipeline and reviewed assets**

```bash
git add assets/manifest.json scripts/prepare-assets.mjs scripts/validate-content.mjs tests/content.test.mjs public/images
git commit -m "feat: add privacy-safe evidence pipeline"
```

### Task 3: Implement The Eight-Chapter Semantic Narrative

**Files:**
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/components.css`
- Create: `src/styles/print.css`
- Remove: `preview/index.html`

- [ ] **Step 1: Extend the browser test with factual boundaries**

```js
test('states role and evidence boundaries without claiming scaled results', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('唯一产品设计师')).toBeVisible();
  await expect(page.getByText('9 个月')).toBeVisible();
  await expect(page.getByText('约 8 次迭代')).toBeVisible();
  await expect(page.getByText(/少量企业客户.*有限灰度/)).toBeVisible();
  await expect(page.getByText(/尚未规模化推广/)).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/增长了|提升了\s*\d+%|转化率达到/);
});
```

- [ ] **Step 2: Create the semantic document shell and all eight sections**

`index.html` must contain one `main`, exactly eight direct child `section` elements, and these stable IDs in order:

```html
<main id="main-content">
  <section id="overview" class="band band--hero" data-chapter="01"></section>
  <section id="context-role" class="band" data-chapter="02"></section>
  <section id="design-thesis" class="band band--signal" data-chapter="03"></section>
  <section id="decision-path" class="band" data-chapter="04"></section>
  <section id="decision-preview" class="band band--dark" data-chapter="05"></section>
  <section id="decision-operate" class="band" data-chapter="06"></section>
  <section id="system-delivery" class="band band--system" data-chapter="07"></section>
  <section id="outcome-learnings" class="band" data-chapter="08"></section>
</main>
```

Populate those sections with the approved Chinese headlines and statements from `docs/superpowers/specs/2026-07-14-call-agent-portfolio-design.md`. Use `Delivered / Observed / Next` labels in the final chapter and use `Before / Decision / After` inside Decisions 01 and 03. Keep approximately eight iterations as metadata and embedded comparison context, not as a separate chapter.

- [ ] **Step 3: Add stable design tokens**

```css
/* src/styles/tokens.css */
:root {
  --ink-950: #101417;
  --ink-900: #171d21;
  --ink-700: #374047;
  --ink-500: #667078;
  --paper: #f7f8f5;
  --surface: #ffffff;
  --line: #d9dedb;
  --signal: #20c997;
  --signal-dark: #08785c;
  --warning: #c77d16;
  --danger: #c44545;
  --info: #3377cc;
  --font-sans: Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  --font-mono: "SFMono-Regular", Consolas, monospace;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --content: 1120px;
  --reading: 760px;
  --ease: 180ms ease;
}
```

- [ ] **Step 4: Implement editorial layout and responsive constraints**

```css
/* src/styles/layout.css */
.band { padding: var(--space-24) max(24px, calc((100vw - var(--content)) / 2)); }
.band__grid { display: grid; grid-template-columns: minmax(180px, 0.7fr) minmax(0, 2fr); gap: clamp(32px, 6vw, 96px); }
.reading { width: min(100%, var(--reading)); }
.evidence-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); }
.evidence-grid--three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
img { display: block; max-width: 100%; height: auto; }
@media (max-width: 800px) {
  .band { padding: var(--space-16) 20px; }
  .band__grid, .evidence-grid, .evidence-grid--three { grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: Import styles and initialize the application**

```js
// src/main.js
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/print.css';
import { initNavigation } from './ui/navigation.js';
import { initLightbox } from './ui/lightbox.js';
import { initPrint } from './ui/print.js';

initNavigation();
initLightbox();
initPrint();
```

Create `src/styles/print.css` with `@media print {}` at this stage so the import resolves; Task 6 replaces it with the complete A4 rules.

- [ ] **Step 6: Run validation and desktop browser tests**

Run: `npm run validate && npm run test:e2e -- --project=desktop`

Expected: content validation and the two desktop tests PASS.

- [ ] **Step 7: Commit the narrative foundation**

```bash
git add index.html src preview/index.html tests/case-study.spec.mjs
git commit -m "feat: build decision-led case study narrative"
```

### Task 4: Build Evidence Components And The System Delivery Proof

**Files:**
- Modify: `index.html`
- Modify: `assets/manifest.json`
- Modify: `src/styles/components.css`
- Modify: `tests/case-study.spec.mjs`
- Create: four processed evidence images under `public/images/`

- [ ] **Step 1: Add tests for evidence semantics**

```js
test('labels comparisons and implementation ownership precisely', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#decision-path [data-evidence="before"]')).toBeVisible();
  await expect(page.locator('#decision-path [data-evidence="decision"]')).toBeVisible();
  await expect(page.locator('#decision-path [data-evidence="after"]')).toBeVisible();
  await expect(page.locator('#system-delivery')).toContainText('未合入生产环境');
  await expect(page.locator('#system-delivery')).toContainText('正式生产代码由前端工程师完成');
  await expect(page.locator('#system-delivery .delivery-proof > figure')).toHaveCount(3);
  await expect(page.locator('#system-delivery blockquote')).toHaveAttribute('data-evidence', 'anonymized-engineer-feedback');
});
```

- [ ] **Step 2: Process the four required System & Delivery inputs**

Add the user-provided files to `assets/manifest.json` with outputs:

```text
system-design-spec.png
system-ai-prototype.png
system-production-page.png
system-engineer-feedback.png
```

Each entry must use chapter `system-delivery`, include accurate alt text, and contain measured destructive redaction rectangles where names, accounts, tokens, identifiers, or private chat context appear. Run `npm run assets` and inspect every output at original resolution.

- [ ] **Step 3: Add the three-stage delivery proof**

```html
<div class="delivery-proof evidence-grid evidence-grid--three" aria-label="设计到工程页面的交付对比">
  <figure><img src="./images/system-design-spec.png" alt="AI 配置与 Preview 的设计规格"><figcaption><b>01 设计规格</b><span>定义布局、状态、响应式与组件规则</span></figcaption></figure>
  <figure><img src="./images/system-ai-prototype.png" alt="基于产品仓库实现的 AI 辅助编码原型"><figcaption><b>02 AI 辅助原型</b><span>复用仓库 Design System 验证可实现性</span></figcaption></figure>
  <figure><img src="./images/system-production-page.png" alt="前端工程师完成的生产页面"><figcaption><b>03 工程生产页面</b><span>正式代码由前端工程师实现</span></figcaption></figure>
</div>
```

Add the approved anonymized engineer feedback as a short blockquote and place the original redacted feedback image behind an explicit “查看原始反馈” evidence link. Do not rewrite the quote into a stronger claim.

- [ ] **Step 4: Style evidence for scanning rather than decoration**

```css
/* additions to src/styles/components.css */
.evidence-label { font: 600 12px/1.4 var(--font-mono); color: var(--signal-dark); text-transform: uppercase; }
.evidence figure { margin: 0; }
.evidence figcaption { display: grid; gap: var(--space-2); padding-top: var(--space-3); color: var(--ink-500); }
.delivery-proof img { aspect-ratio: 16 / 10; object-fit: contain; background: var(--ink-900); border: 1px solid var(--line); }
blockquote { margin: var(--space-8) 0 0; padding: var(--space-6) 0 var(--space-6) var(--space-6); border-left: 3px solid var(--signal); font-size: 1.25rem; }
```

- [ ] **Step 5: Run evidence tests and inspect generated assets**

Run: `npm run assets && npm run validate && npm run test:e2e -- --project=desktop`

Expected: all tests PASS, all nine selected public images open successfully, and no source path points to the excluded token screenshot.

- [ ] **Step 6: Commit the evidence chapter**

```bash
git add index.html assets/manifest.json public/images src/styles/components.css tests/case-study.spec.mjs
git commit -m "feat: add design delivery evidence chain"
```

### Task 5: Add Accessible Navigation, Lightbox, And Print Control

**Files:**
- Create: `src/ui/navigation.js`
- Create: `src/ui/lightbox.js`
- Create: `src/ui/print.js`
- Modify: `index.html`
- Modify: `src/styles/components.css`
- Modify: `tests/case-study.spec.mjs`

- [ ] **Step 1: Write interaction tests**

```js
test('supports chapter navigation, image inspection, and keyboard dismissal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /05.*发布前/ }).click();
  await expect(page.locator('#decision-preview')).toBeInViewport();
  await page.locator('[data-lightbox]').first().click();
  await expect(page.getByRole('dialog', { name: '查看产品界面' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '查看产品界面' })).toBeHidden();
});
```

- [ ] **Step 2: Implement chapter tracking**

```js
// src/ui/navigation.js
export function initNavigation() {
  const links = [...document.querySelectorAll('[data-chapter-link]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.toggleAttribute('aria-current', link.hash === `#${visible.target.id}`));
  }, { rootMargin: '-20% 0px -65%', threshold: [0, 0.2, 0.6] });
  sections.forEach((section) => observer.observe(section));
}
```

- [ ] **Step 3: Implement the accessible lightbox**

```js
// src/ui/lightbox.js
export function initLightbox() {
  const dialog = document.querySelector('#image-dialog');
  const output = dialog?.querySelector('img');
  if (!dialog || !output) return;
  document.querySelectorAll('[data-lightbox]').forEach((button) => button.addEventListener('click', () => {
    const source = button.querySelector('img');
    output.src = source.currentSrc || source.src;
    output.alt = source.alt;
    dialog.showModal();
  }));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
}
```

- [ ] **Step 4: Implement browser print**

```js
// src/ui/print.js
export function initPrint() {
  document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
}
```

- [ ] **Step 5: Run interaction tests**

Run: `npm run test:e2e -- --project=desktop`

Expected: chapter navigation scrolls to Decision 02, the dialog opens, and Escape closes it.

- [ ] **Step 6: Commit interactions**

```bash
git add index.html src/ui src/styles/components.css tests/case-study.spec.mjs
git commit -m "feat: add portfolio reading interactions"
```

### Task 6: Complete Responsive And A4 Print Behavior

**Files:**
- Create: `src/styles/print.css`
- Modify: `src/styles/layout.css`
- Modify: `src/styles/components.css`
- Modify: `tests/case-study.spec.mjs`

- [ ] **Step 1: Add overflow and print tests**

```js
test('has no horizontal overflow on mobile', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('exposes all evidence and hides web controls in print', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-print]')).toBeHidden();
  await expect(page.locator('.delivery-proof')).toBeVisible();
  await expect(page.locator('#chapter-nav')).toBeHidden();
});
```

- [ ] **Step 2: Add A4 print rules**

```css
/* src/styles/print.css */
@page { size: A4 portrait; margin: 14mm 13mm 16mm; }
@media print {
  :root { --paper: #fff; --surface: #fff; --ink-950: #111; --ink-900: #222; }
  html { font-size: 10pt; }
  body { background: #fff; color: #111; }
  .web-only, #chapter-nav, [data-print], dialog { display: none !important; }
  .band { padding: 12mm 0; background: #fff !important; color: #111 !important; }
  .band--hero { min-height: auto; page-break-after: always; }
  #decision-path, #decision-preview, #decision-operate, #system-delivery { break-before: page; }
  h1, h2, h3, figure, blockquote, .journey, .comparison { break-inside: avoid; }
  .evidence-grid, .evidence-grid--three { grid-template-columns: 1fr 1fr; gap: 6mm; }
  a { color: inherit; text-decoration: none; }
  img { max-height: 115mm; object-fit: contain; }
}
```

- [ ] **Step 3: Verify desktop, mobile, and print tests**

Run: `npm run test:e2e`

Expected: desktop and mobile projects PASS with no horizontal overflow; print-only assertions PASS.

- [ ] **Step 4: Commit responsive and print behavior**

```bash
git add src/styles tests/case-study.spec.mjs
git commit -m "feat: add responsive and print layouts"
```

### Task 7: Add Deployment And Project Documentation

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`
- Create: `vite.config.mjs`
- Modify: `package.json`

- [ ] **Step 1: Configure Vite for repository-path deployment**

Add to `package.json`:

```json
"homepage": "https://yangjing0006.github.io/call-agent-portfolio/"
```

Create `vite.config.mjs`:

```js
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/call-agent-portfolio/' : '/',
  build: { sourcemap: false }
}));
```

- [ ] **Step 2: Add the GitHub Pages workflow**

```yaml
name: Deploy portfolio
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm test
      - run: npm run test:e2e
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Document exact operating commands**

`README.md` must include:

````markdown
# Call Agent Portfolio

Responsive Chinese case study for Agora Call Agent V1.0.

## Local review

```bash
npm install
npm run assets
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Verification

```bash
npm test
npm run validate
npm run test:e2e
npm run build
```

## PDF export

Open the production preview, select “导出 PDF”, choose A4 portrait, enable background graphics, use 100% scale, and save to `portfolio/call-agent-case-study.pdf`.

## Privacy

Only processed files from `public/images/` may be deployed. Never place source screenshots directly in `public/`.
````

- [ ] **Step 4: Build the production site**

Run: `npm run build`

Expected: Vite exits 0 and produces `dist/index.html` plus hashed CSS/JS assets and processed images.

- [ ] **Step 5: Commit deployment support**

```bash
git add package.json vite.config.mjs .github/workflows/deploy.yml README.md
git commit -m "chore: add GitHub Pages deployment"
```

### Task 8: Visual QA, PDF Export, And Publication Gate

**Files:**
- Create: `portfolio/call-agent-case-study.pdf`
- Create: `artifacts/qa/desktop.png`
- Create: `artifacts/qa/mobile.png`
- Modify: source files only when verification exposes an issue

- [ ] **Step 1: Start the production preview**

Run: `npm run build && npm run preview -- --port 4173`

Expected: server reports `http://127.0.0.1:4173/` and remains running for visual checks.

- [ ] **Step 2: Capture desktop and mobile visual evidence with agent-browser**

```bash
agent-browser open http://127.0.0.1:4173/
agent-browser set viewport 1440 1000
agent-browser screenshot --full artifacts/qa/desktop.png
agent-browser set viewport 390 844
agent-browser screenshot --full artifacts/qa/mobile.png
```

Inspect both screenshots for overlapping text, unreadable product UI, clipped comparison labels, broken image ratios, one-note color, and empty or decorative sections. Fix source CSS or HTML and repeat until both are clean.

- [ ] **Step 3: Verify canvas and image pixels are nonblank**

Run a browser evaluation that checks every public evidence image has loaded and has nonzero natural dimensions:

```bash
agent-browser eval "JSON.stringify([...document.images].map(i => ({src:i.currentSrc,ok:i.complete&&i.naturalWidth>0,w:i.naturalWidth,h:i.naturalHeight})))"
```

Expected: every entry has `ok: true` and positive width and height.

- [ ] **Step 4: Export and render the PDF**

Run:

```bash
mkdir -p portfolio artifacts/qa/pdf-pages
agent-browser pdf portfolio/call-agent-case-study.pdf
pdftoppm -png -r 120 portfolio/call-agent-case-study.pdf artifacts/qa/pdf-pages/page
```

Expected: PDF generation exits 0 and produces approximately 16-20 rendered page images.

- [ ] **Step 5: Review every rendered PDF page**

Check that no chapter heading is orphaned, no screenshot is clipped, dark backgrounds have converted to print-friendly surfaces, captions stay with images, and all critical evidence is visible without interaction. Fix print CSS and repeat export when any page fails.

- [ ] **Step 6: Run the full publication gate**

Run:

```bash
npm test
npm run validate
npm run test:e2e
npm run build
git diff --check
git status --short
```

Expected: all tests and build PASS, `git diff --check` prints nothing, and only intentional QA/PDF files remain uncommitted.

- [ ] **Step 7: Commit the verified deliverables**

```bash
git add portfolio/call-agent-case-study.pdf artifacts/qa index.html src public assets scripts tests README.md
git commit -m "docs: publish verified Call Agent case study"
git push origin main
```

- [ ] **Step 8: Verify the deployed URL**

Open `https://yangjing0006.github.io/call-agent-portfolio/` with agent-browser, repeat the desktop smoke test, and verify the GitHub Pages build serves images from `/call-agent-portfolio/images/` without 404 responses.

## Final Review Checklist

- The first viewport states product value, role, duration, iteration count, and limited-beta status.
- Exactly eight chapters appear in the approved order.
- Three design decisions lead the core narrative.
- AI configuration and Preview are the strongest visual chapter.
- Old/new evidence sits inside the decisions it supports.
- Design System and AI-assisted coding are presented as a major delivery contribution.
- The prototype is explicitly described as not merged into production.
- Engineer feedback is anonymized and remains faithful to the original meaning.
- No sensitive source screenshot or visible identifier is present in `public/`.
- No scaled business impact is claimed.
- Mobile, desktop, print, and deployed GitHub Pages versions are visually verified.
