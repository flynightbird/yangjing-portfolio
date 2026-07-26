# Agora Meeting Chinese Copy Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the Agora Meeting Chinese case-study copy into concise, strategy-led language without changing its structure, English content, interactions, media, or evidence boundaries.

**Architecture:** Keep localized prose in `content/work/meeting.zh.mdx`, localized model labels in `components/meeting/meeting-models.tsx`, and localized media captions in `components/meeting/meeting-showcase.tsx`. Add focused source and rendering assertions before changing copy, then verify the existing Chinese route at desktop and mobile sizes.

**Tech Stack:** Next.js 16, React 19, MDX, TypeScript, Vitest, Testing Library, Playwright.

---

### Task 1: Lock The Chinese Editorial Direction In Tests

**Files:**
- Modify: `tests/unit/meeting-content.test.ts`
- Modify: `tests/component/meeting-models.test.tsx`
- Modify: `tests/component/meeting-evidence.test.tsx`

- [ ] **Step 0: Record the existing English diff before implementation**

The English Meeting file already contains user work. Capture its current diff without modifying or staging it:

```bash
git diff -- content/work/meeting.en.mdx > /tmp/meeting-en-before-copy-rewrite.diff
```

- [ ] **Step 1: Add a failing source-level editorial test**

Add this test to `tests/unit/meeting-content.test.ts`:

```ts
it('uses concise strategy-led Chinese copy without internal writing language', () => {
  const chinese = readFileSync('content/work/meeting.zh.mdx', 'utf8');

  expect(chinese).toContain('先确定信息优先级，再生成对应的界面状态');
  expect(chinese).toContain('跨端规则应该早于组件分化');
  expect(chinese).not.toMatch(/招聘者需要看到|推到主位|活着的参会者通道|空间节奏|API 暴露/);
});
```

Update the existing disclosure assertion to expect the revised evidence statement:

```ts
expect(source.match(/因缺少验证数据，不作采用率、满意度或效率提升声明/g)).toHaveLength(1);
```

- [ ] **Step 2: Add failing Chinese component assertions**

Add these tests to the existing component suites:

```tsx
it('renders the strategy-led Chinese state model', () => {
  render(<ContextPriorityModel locale="zh" />);
  expect(screen.getByText('会议状态')).toBeVisible();
  expect(screen.getByText('信息重点')).toBeVisible();
  expect(screen.getByText('界面布局')).toBeVisible();
  expect(screen.getByText('此刻最重要的是什么？')).toBeVisible();
});
```

```tsx
it('uses concise Chinese showcase captions', () => {
  render(<MeetingLanguageShowcase locale="zh" />);
  expect(screen.getByText('三类能力，同一处完成')).toBeVisible();
  expect(screen.getByText('实时转写')).toBeVisible();
  expect(screen.getByText('开启同传')).toBeVisible();
  expect(screen.getByText('同声传译')).toBeVisible();
});
```

- [ ] **Step 3: Run the focused tests and verify they fail for the old copy**

Run:

```bash
npx vitest run tests/unit/meeting-content.test.ts tests/component/meeting-models.test.tsx tests/component/meeting-evidence.test.tsx
```

Expected: FAIL on the new Chinese phrases and revised disclosure; existing structural tests remain green.

### Task 2: Rewrite The Chinese Case Narrative

**Files:**
- Modify: `content/work/meeting.zh.mdx`
- Test: `tests/unit/meeting-content.test.ts`

- [ ] **Step 1: Replace the hero and chapter labels**

Use this metadata copy while preserving all non-copy fields:

```tsx
title: 'Agora Meeting：实时协作系统',
proposition: '为桌面、Web、平板和手机建立统一的会议规则，让界面随参会人数、共享内容和协作任务调整重点。',
disclosure: '本页展示已上线界面和真实录屏；因缺少验证数据，不作采用率、满意度或效率提升声明。',
```

Rename only these chapter labels:

```tsx
{ id: 'information-layer', label: '实时语言能力' },
{ id: 'capability-impact', label: '完整产品能力' },
```

- [ ] **Step 2: Replace all eight chapter text blocks**

Use the following exact headings and paragraphs, preserving the current section IDs and component order:

```mdx
## 把会议能力嵌入客户业务，而不是再做一款独立 App
客户需要的不是单一会议工具，而是一套可集成、可配置的 Zoom 替代方案。
我作为唯一产品设计师，负责桌面客户端、Web、平板和手机端，将分散需求收束为一套覆盖四端的已上线产品。

## 核心挑战不是适配屏幕，而是管理不断变化的会议状态
参会人数、共享内容、白板、权限和语言能力会在会中持续变化，界面重点也必须随之调整。
四端共享同一套交互规则，但不追求相同布局；空间、密度、导航和控制方式按平台重新组织。

## 先确定信息优先级，再生成对应的界面状态
每次状态变化都先回答一个问题：此刻最重要的是人、共享内容，还是协作工具？
这套规则统一了四端的判断逻辑，也减少了为单个平台补写例外的成本。

## 让会议舞台围绕任务切换，而不是等比例缩放
对话时突出参会者，共享时突出内容，协作时则把白板变成主要工作区。
布局由屏幕共享、白板开启和参会人数等状态触发，在不同终端上保留相同的信息优先级。

## 白板占据主要空间，会议状态仍然可见
桌面端让画布充分展开；手机竖屏则在画布上方保留必要的参会者画面。
统一的显示优先级决定保留谁的画面，避免为每种设备和状态单独编写规则。

## 把字幕、转写和同传纳入同一套会中语言能力
三类能力都服务于实时理解，但控制权限不同：字幕由个人设置，转写和同传由会议统一管理。
转写结果通过客户 API 提供；客户自建的会后存储不属于本项目范围。

## 系统完整性，体现在高频细节的一致性
美颜、成员管理和安全控制补齐个人设置与会议管理；分组讨论、聊天和等候室覆盖常见协作流程。
这些能力沿用相同的角色、权限和状态规则，避免功能扩展后形成彼此割裂的体验。

## 跨端规则应该早于组件分化
四端已经上线，但组件和状态规则建立得偏晚，增加了后期对齐成本。
下一轮会更早统一状态定义、组件所有权和平台例外，让交互规则有单一来源。
```

- [ ] **Step 3: Run the content test**

Run:

```bash
npx vitest run tests/unit/meeting-content.test.ts
```

Expected: PASS.

### Task 3: Rewrite Model Labels And Media Captions

**Files:**
- Modify: `components/meeting/meeting-models.tsx`
- Modify: `components/meeting/meeting-showcase.tsx`
- Test: `tests/component/meeting-models.test.tsx`
- Test: `tests/component/meeting-evidence.test.tsx`

- [ ] **Step 1: Rewrite the Chinese system-model labels**

Keep English values and component markup unchanged. Replace the Chinese model copy with:

```ts
contextFlow: ['会议状态', '信息重点', '界面布局'],
contextDetail: [
  '参会者 · 内容 · 角色 · 设备',
  '此刻最重要的是什么？',
  '宫格 · 聚焦 · 工作区 · 信息面板',
],
matrixHeaders: ['状态变化', '优先内容', '布局结果'],
priorityTitle: '竖屏白板的参会者显示顺序',
priorityIntro: '竖屏仅保留一个参会者画面时，按以下顺序选择显示对象。',
priorities: ['正在发言者', '自己', '同时开启摄像头和麦克风', '已开启摄像头', '已开启麦克风'],
languageTitle: '同一套语言能力，两级控制权限',
individual: ['个人设置', '实时字幕', '语言与翻译偏好'],
meeting: ['会议控制', '主持人开启或关闭', '参会者可申请开启'],
```

Use these matrix rows and capability descriptions:

```ts
['屏幕共享', '共享内容', '内容优先'],
['白板开启', '白板操作', '白板工作区'],
['参会人数变化', '平等展示或发言者优先', '宫格或演讲者模式'],

['分组讨论', '创建小组、分配成员，并管理各讨论组的进行状态。'],
['会中聊天', '在会议主界面内支持群聊与私聊。'],
['等候室', '分别向参会者和主持人说明等待与准入状态。'],
```

- [ ] **Step 2: Rewrite the Chinese showcase captions**

Keep media IDs, files, dimensions, English copy, markup, and interaction unchanged. Apply concise Chinese titles and descriptions:

```ts
'hero-web': ['Web 工作区', '转写与会议内容并行', '参会者、实时转写和内容处理集中在同一界面。'],
'hero-app': ['手机竖屏', '小屏仍保留会议信息重点', '压缩布局，不压缩参会者和当前会议状态。'],
'stage-web': ['自适应舞台', '任务变化，布局随之切换', '对话、共享和协作分别对应不同的信息重点。'],
'whiteboard-web': ['Web 白板', '大屏优先释放画布空间', '白板占据主要区域，会议控制保持可用。'],
'whiteboard-app-1': ['手机白板 A', '画布优先，参会者仍然可见', '画布上方保留一个参会者画面。'],
'whiteboard-app-2': ['手机白板 B', '状态变化，规则保持一致', '不同白板状态沿用同一套布局判断。'],
'transcript-app': ['实时转写', '转写直接进入会中流程', '用户无需离开会议即可查看实时内容。'],
'interpretation-on-app': ['开启同传', '同传由会议统一开启', '它属于会议级能力，而不是个人偏好。'],
'interpretation-live-app': ['同声传译', '翻译结果与会议同步呈现', '用户在当前会议中直接获取翻译内容。'],
'beauty-app': ['美颜设置', '个人设置沿用统一交互', '相机调节保持与会议主流程一致的控制方式。'],
'safety-app': ['成员与安全', '会议管理不脱离现场', '成员信息和安全控制都从当前会议进入。'],
```

Replace showcase summaries with:

```ts
whiteboardTitle: '一套白板规则，适配桌面与手机竖屏',
whiteboardSummary: '桌面端释放画布空间；手机端保留必要的参会者画面。',
languageTitle: '三类能力，同一处完成',
languageSummary: '字幕、转写和同传都发生在会中，再按个人与会议两级权限控制。',
polishTitle: '高频细节决定系统是否完整',
polishSummary: '美颜、成员管理和安全控制沿用统一的角色、状态与交互规则。',
```

- [ ] **Step 3: Run all focused tests**

Run:

```bash
npx vitest run tests/unit/meeting-content.test.ts tests/component/meeting-models.test.tsx tests/component/meeting-evidence.test.tsx tests/component/meeting-layout.test.tsx
```

Expected: PASS.

### Task 4: Verify The Published Page

**Files:**
- Verify: `content/work/meeting.zh.mdx`
- Verify: `components/meeting/meeting-models.tsx`
- Verify: `components/meeting/meeting-showcase.tsx`

- [ ] **Step 1: Run content validation and lint for touched files**

Run:

```bash
npm run validate:content
npx eslint content/work/meeting.zh.mdx components/meeting/meeting-models.tsx components/meeting/meeting-showcase.tsx tests/unit/meeting-content.test.ts tests/component/meeting-models.test.tsx tests/component/meeting-evidence.test.tsx
```

Expected: both commands exit zero.

- [ ] **Step 2: Check for banned wording and accidental English edits**

Run:

```bash
rg -n '招聘者需要看到|推到主位|活着的参会者通道|空间节奏|API 暴露|会议感知|理解支持' content/work/meeting.zh.mdx components/meeting/meeting-models.tsx components/meeting/meeting-showcase.tsx
git diff -- content/work/meeting.en.mdx > /tmp/meeting-en-after-copy-rewrite.diff
cmp /tmp/meeting-en-before-copy-rewrite.diff /tmp/meeting-en-after-copy-rewrite.diff
```

Expected: the wording scan has no matches; `cmp` exits zero, proving this rewrite did not alter the user's existing English diff.

- [ ] **Step 3: Verify desktop and mobile layout**

Open `http://127.0.0.1:4418/zh/work/meeting/` at 1440x1000 and 390x844. Confirm headings and captions do not overflow, no text overlaps media or controls, all eight chapter anchors remain available, and the page has no horizontal overflow.

- [ ] **Step 4: Review the final scoped diff without staging user work**

```bash
git diff --check
git diff -- content/work/meeting.zh.mdx components/meeting/meeting-models.tsx components/meeting/meeting-showcase.tsx tests/unit/meeting-content.test.ts tests/component/meeting-models.test.tsx tests/component/meeting-evidence.test.tsx
```

Expected: no whitespace errors; the reviewed diff contains only the requested Chinese copy and focused test updates. Leave implementation files unstaged because they already contain user work and the user did not request a commit.
