import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { contentEntries } from '@/content/registry';

const chapterIds = [
  'cold-open',
  'challenge',
  'stage-adapts',
  'content-takes-stage',
  'information-follows',
  'the-turn',
  'system-reveal',
  'shipped-evidence',
  'reflection',
];

const legacyAnchorIds = [
  'product-overview',
  'business-context',
  'design-challenge',
  'adaptive-stage',
  'whiteboard-workspace',
  'information-layer',
  'system-strategy',
  'system-delivery',
  'capability-impact',
];

const chapterLabels = {
  en: [
    'Product',
    'Challenge',
    'Stage',
    'Content',
    'Web',
    'System',
    'Rules',
    'Evidence',
    'Reflection',
  ],
  zh: ['产品', '挑战', '舞台', '内容', 'Web', '系统转场', '规则', '证据', '反思'],
} as const;

const filmActIds = ['stage-adapts', 'content-takes-stage', 'information-follows'];

const internalPlanningLanguage =
  /3-minute|10-minute|hiring evaluation|QA contract|3\s*分钟|10\s*分钟|招聘评估|招聘者评估|雇佣评估|测试合同|质量保证合同/i;

const propositions = {
  en: 'One meeting system, designed to keep the right content primary across four device classes.',
  zh: '一套会议系统，让四类终端始终把此刻最重要的内容放在主位。',
} as const;

const filmCopy = {
  en: [
    ['One meeting system. Four device classes.', 'Agora Meeting keeps the right content primary as people present, create, and communicate.'],
    ['A meeting changes faster than a fixed interface.', 'People, content, and device context can change within seconds.'],
    ['The stage adapts.', 'The interface changes priority before it changes layout.'],
    ['Content takes the stage.', 'The canvas becomes primary; participant awareness moves to support.'],
    ['The Web workspace keeps the stage continuous.', 'Chat and participant panels can change sides without interrupting the meeting content.'],
  ],
  zh: [
    ['一套会议系统，覆盖四类终端。', 'Agora Meeting 在演示、创作与沟通状态中，让此刻最重要的内容始终处在主位。'],
    ['会议变化快于固定界面。', '参会者、当前内容与设备环境会在数秒内改变。'],
    ['舞台随情境重组。', '界面先改变信息优先级，再改变布局。'],
    ['内容进入主舞台。', '画布成为主位，参会者感知移动到支持层。'],
    ['Web 工作区保持舞台连续。', '聊天与参会者面板可以换边，当前会议内容不被打断。'],
  ],
} as const;

const evidenceCopy = {
  en: [
    ['Context sets priority. Priority shapes interface.', 'One rule connects people, content, roles, and device conditions.'],
    ['Shipped across four device classes.', 'One product system, delivered across Desktop, Web, tablet, and mobile.'],
    ['Govern the system earlier.', 'Shared state definitions and component ownership should precede cross-device scale.'],
  ],
  zh: [
    ['情境决定优先级，优先级塑造界面。', '一条规则连接参会者、内容、角色与设备环境。'],
    ['完成四类终端的生产交付。', '同一套产品系统，覆盖桌面客户端、Web、平板与手机。'],
    ['更早治理跨端系统。', '共享状态定义与组件所有权应早于跨端扩张。'],
  ],
} as const;

describe('Agora Meeting content', () => {
  it.each(['en', 'zh'] as const)('registers complete %s shipped metadata', (locale) => {
    const entry = contentEntries.find(
      ({ meta }) => meta.slug === 'meeting' && meta.locale === locale,
    );

    expect(entry?.meta.title).toBe('Agora Meeting');
    expect(entry?.meta.status).toBe(locale === 'zh' ? '已上线' : 'Shipped');
    expect(entry?.meta.duration).toBe(
      locale === 'zh' ? '2024-2026 · 1.5 年' : '2024-2026 · 1.5 years',
    );
    expect(entry?.meta.chapters?.map(({ id }) => id)).toEqual(chapterIds);
    expect(entry?.meta.chapters?.map(({ label }) => label)).toEqual(chapterLabels[locale]);
    expect(entry?.meta.proposition).toBe(propositions[locale]);
    expect(entry?.meta.evidenceLevel).toBe('delivered');
  });

  it.each(['en', 'zh'] as const)(
    'composes the %s narrative as a nine-chapter product film',
    (locale) => {
      const source = readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8');
      const entry = contentEntries.find(
        ({ meta }) => meta.slug === 'meeting' && meta.locale === locale,
      );

      expect(source).toContain('ChallengeTriggers');
      expect(source).toContain('FilmTitle');
      expect(source).toContain('FilmTurn');
      expect(source).toContain('StageOrientationMedia');
      expect(source).toContain('WhiteboardOrientationMedia');
      expect(source).toContain('WebWorkspaceMedia');
      expect(source).not.toContain('MeetingOrientationEvidence');
      expect(source).not.toMatch(/<OrientationEvidence\s/);
      expect(
        Array.from(
          source.matchAll(/<section id="([^"]+)"[^>]*data-product-film-chapter/g),
          ([, id]) => id,
        ),
      ).toEqual(chapterIds);
      expect(source.match(/data-product-film-chapter/g)).toHaveLength(9);
      expect(source.match(/data-showcase-band/g) ?? []).toHaveLength(9);
      expect(source.match(/data-film-act/g)).toHaveLength(3);
      expect(source.match(/data-signature-experience/g) ?? []).toHaveLength(3);
      expect(source.match(/<CapabilitySystem locale=/g)).toHaveLength(1);
      expect(source.match(/<ShowcaseProof locale=/g)).toHaveLength(1);
      expect(source.match(/<ContextPriorityModel locale=/g)).toHaveLength(1);
      expect(source.match(/<MeetingStateMatrix locale=/g)).toHaveLength(1);
      expect(source.match(/<ParticipantPriorityStack locale=/g)).toHaveLength(1);
      expect(source.match(/<LanguageControlModel locale=/g)).toHaveLength(1);
      expect(source.match(/<FilmTitle\s/g)).toHaveLength(8);
      expect(source.match(/<FilmActMedia\s/g) ?? []).toHaveLength(0);
      expect(source.match(/<StageOrientationMedia\s/g)).toHaveLength(1);
      expect(source.match(/<WhiteboardOrientationMedia\s/g)).toHaveLength(1);
      expect(source.match(/<WebWorkspaceMedia\s/g)).toHaveLength(1);
      expect(source.match(/<ChallengeTriggers\s/g)).toHaveLength(1);
      expect(source.match(/<FilmTurn\s/g)).toHaveLength(1);

      for (const id of filmActIds) {
        expect(source).toMatch(new RegExp(`<section id="${id}"[^>]*data-film-act`));
      }

      expect(source).not.toContain('DeepDive');
      expect(entry).toBeDefined();
      const { container } = render(createElement(entry!.Component));
      const chapters = Array.from(
        container.querySelectorAll<HTMLElement>('section[data-product-film-chapter]'),
      );
      expect(chapters).toHaveLength(9);
      expect(chapters.map(({ id }) => id)).toEqual(chapterIds);
      expect(chapters.every((chapter) => chapter.hasAttribute('data-showcase-band'))).toBe(true);
      const filmActs = chapters.filter((chapter) => chapter.hasAttribute('data-film-act'));
      expect(filmActs).toHaveLength(3);
      expect(
        filmActs.every((chapter) => chapter.hasAttribute('data-signature-experience')),
      ).toBe(true);
      expect(container.querySelectorAll('[data-meeting-deep-dive]')).toHaveLength(0);
      expect(container.querySelector('[data-orientation-evidence]')).toBeNull();
      expect(container.querySelector('.evidenceBoundary')).toBeNull();
      expect(container.querySelectorAll('[data-evidence-chapter]')).toHaveLength(3);
      expect(container.querySelectorAll('[data-film-static-fallback]')).toHaveLength(0);
      expect(container.querySelectorAll('video')).toHaveLength(4);
      expect(source).not.toMatch(internalPlanningLanguage);
      expect(source).not.toMatch(/section-index|\d{2}\s*\//);
      expect(source).not.toMatch(/[–—]/);
      expect(source).not.toMatch(/MeetingVideo|adaptive-layout-demo\.mp4|transcript-demo\.mp4/);
      expect(source).not.toMatch(/Host Focus|Personal Pin|主持人聚焦|个人 Pin/i);

      for (const [title, supportingLine] of filmCopy[locale]) {
        expect(source).toContain(`title="${title}"`);
        expect(source).toContain(`supportingLine="${supportingLine}"`);
        expect(container).toHaveTextContent(title);
        expect(container).toHaveTextContent(supportingLine);
      }

      for (const [title, supportingLine] of evidenceCopy[locale]) {
        expect(source).toContain(`title="${title}"`);
        expect(source).toContain(`supportingLine="${supportingLine}"`);
        expect(container).toHaveTextContent(title);
        expect(container).toHaveTextContent(supportingLine);
      }

      expect(source).not.toMatch(/<FilmTitle[^>]*\bindex=/);

      expect(entry!.meta.disclosure).not.toMatch(
        /pending source inspection|待源文件检查|evidence boundary|证据边界/i,
      );

      const systemRevealStart = source.indexOf('<section id="system-reveal"');
      const shippedEvidenceStart = source.indexOf('<section id="shipped-evidence"');
      const reflectionStart = source.indexOf('<section id="reflection"');
      for (const component of [
        'ContextPriorityModel',
        'MeetingStateMatrix',
        'ParticipantPriorityStack',
        'LanguageControlModel',
      ]) {
        const componentIndex = source.indexOf(`<${component} locale=`);
        expect(componentIndex).toBeGreaterThan(systemRevealStart);
        expect(componentIndex).toBeLessThan(shippedEvidenceStart);
      }

      for (const component of [
        'ShowcaseProof',
        'CapabilitySystem',
        'BreakoutDecisionEvidence',
        'RoleBoundary',
      ]) {
        const componentIndex = source.indexOf(`<${component} locale=`);
        expect(componentIndex).toBeGreaterThan(shippedEvidenceStart);
        expect(componentIndex).toBeLessThan(reflectionStart);
      }

      for (const id of legacyAnchorIds) {
        expect(source).toContain(`<span id="${id}" data-anchor-alias />`);
      }

      expect(source).not.toMatch(
        /Design rationale|设计深读|Verified here|Not claimed|本页可验证|不作声明/,
      );
    },
  );

  it.each(['en', 'zh'] as const)(
    'keeps legacy anchors and concise system reasoning in the %s narrative',
    (locale) => {
      const source = readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8');

      for (const id of legacyAnchorIds) {
        expect(source).toContain(`id="${id}"`);
      }

      expect(source).toContain(locale === 'en'
        ? 'Context sets priority. Priority shapes interface.'
        : '情境决定优先级，优先级塑造界面。');
      expect(source).toContain(locale === 'en'
        ? 'Shared state definitions and component ownership should precede cross-device scale.'
        : '共享状态定义与组件所有权应早于跨端扩张。');
    },
  );

  it('does not claim post-meeting ownership or unsupported metrics', () => {
    const source = ['en', 'zh']
      .map((locale) => readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8'))
      .join('\n');

    expect(source).not.toMatch(/Before the meeting|After the meeting|会议前|会议后/);
    expect(source).not.toMatch(/increased by\s*\d+%|提升了?\s*\d+%/i);
    expect(source).not.toMatch(
      /No quantitative adoption|不声明缺少证据|pending source inspection|待源文件检查/i,
    );
    expect(source).not.toMatch(/real product recordings|真实产品录屏/i);
  });

  it('does not expose host focus, personal pin, or internal planning language', () => {
    const source = ['en', 'zh']
      .map((locale) => readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8'))
      .join('\n');

    expect(source).not.toMatch(
      /Host Focus|Personal Pin|主持人聚焦|个人 Pin|FocusPinComparison|focus-vs-pin/i,
    );
    expect(source).not.toMatch(internalPlanningLanguage);
  });
});
