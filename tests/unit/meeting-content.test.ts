import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { contentEntries } from '@/content/registry';

const chapterIds = [
  'business-context',
  'design-challenge',
  'system-strategy',
  'adaptive-stage',
  'whiteboard-workspace',
  'information-layer',
  'capability-impact',
  'reflection',
];

describe('Agora Meeting content', () => {
  it.each(['en', 'zh'] as const)('registers complete %s shipped metadata', (locale) => {
    const entry = contentEntries.find(
      ({ meta }) => meta.slug === 'meeting' && meta.locale === locale,
    );

    expect(entry?.meta.status).toBe(locale === 'zh' ? '已上线' : 'Shipped');
    expect(entry?.meta.duration).toBe(
      locale === 'zh' ? '2024-2026 · 1.5 年' : '2024-2026 · 1.5 years',
    );
    expect(entry?.meta.chapters?.map(({ id }) => id)).toEqual(chapterIds);
    expect(entry?.meta.evidenceLevel).toBe('delivered');
  });

  it('does not claim post-meeting ownership or unsupported metrics', () => {
    const source = ['en', 'zh']
      .map((locale) => readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8'))
      .join('\n');

    expect(source).not.toMatch(/Before the meeting|After the meeting|会议前|会议后/);
    expect(source).not.toMatch(/increased by\s*\d+%|提升了?\s*\d+%/i);
    expect(source.match(/No quantitative adoption, satisfaction, or efficiency metrics are claimed/g))
      .toHaveLength(1);
    expect(source.match(/因缺少验证数据，不作采用率、满意度或效率提升声明/g))
      .toHaveLength(1);
    expect(source).toMatch(/Customer API/);
    expect(source).toMatch(/客户 API/);
  });

  it('removes host focus and personal pin from both published narratives', () => {
    const source = ['en', 'zh']
      .map((locale) => readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8'))
      .join('\n');

    expect(source).not.toMatch(
      /Host Focus|Personal Pin|主持人聚焦|个人 Pin|FocusPinComparison|focus-vs-pin/i,
    );
  });

  it('uses compact localized hero titles', () => {
    const english = readFileSync('content/work/meeting.en.mdx', 'utf8');
    const chinese = readFileSync('content/work/meeting.zh.mdx', 'utf8');

    expect(english).toContain("title: 'Agora Meeting: A Real-time Collaboration System'");
    expect(chinese).toContain("title: 'Agora Meeting：实时协作系统'");
  });

  it('uses concise strategy-led Chinese copy without internal writing language', () => {
    const chinese = readFileSync('content/work/meeting.zh.mdx', 'utf8');

    expect(chinese).toContain('先确定信息优先级，再生成对应的界面状态');
    expect(chinese).toContain('跨端规则应该早于组件分化');
    expect(chinese).not.toMatch(/招聘者需要看到|推到主位|活着的参会者通道|空间节奏|API 暴露/);
  });

  it('removes redundant Chinese modules and standardizes whiteboard terminology', () => {
    const chinese = readFileSync('content/work/meeting.zh.mdx', 'utf8');

    expect(chinese).not.toMatch(/ParticipantPriorityStack|CapabilitySystem/);
    expect(chinese).not.toContain('画布');
  });

  it('uses repository-hosted meeting videos instead of captioned overlays or unavailable drafts', () => {
    const source = ['en', 'zh']
      .map((locale) => readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8'))
      .join('\n');

    expect(source).toMatch(/MeetingAdaptiveStageShowcase/);
    expect(source).toMatch(/MeetingLanguageShowcase/);
    expect(source).not.toMatch(/字幕参数|\.vtt/i);
    expect(source).not.toMatch(/BreakoutDecisionEvidence|MeetingVideo/);
  });
});
