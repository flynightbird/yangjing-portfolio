import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { contentEntries } from '@/content/registry';

const chapterIds = {
  en: [
    'challenge',
    'design-challenges',
    'adaptive-canvas',
    'visible-states',
    'different-roles',
    'chat-deep-dive',
    'logic-summary',
    'reflection',
  ],
  zh: [
    'challenge',
    'design-challenges',
    'adaptive-canvas',
    'visible-states',
    'different-roles',
    'chat-deep-dive',
    'logic-summary',
    'reflection',
  ],
} as const;

describe('Agora Meeting content', () => {
  it.each(['en', 'zh'] as const)('registers complete %s shipped metadata', (locale) => {
    const entry = contentEntries.find(
      ({ meta }) => meta.slug === 'meeting' && meta.locale === locale,
    );

    expect(entry?.meta.status).toBe(locale === 'zh' ? '已上线' : 'Shipped');
    expect(entry?.meta.duration).toBe(
      locale === 'zh' ? '2024-2026 · 1.5 年' : '2024-2026 · 1.5 years',
    );
    expect(entry?.meta.chapters?.map(({ id }) => id)).toEqual(chapterIds[locale]);
    expect(entry?.meta.evidenceLevel).toBe('delivered');
  });

  it('does not claim post-meeting ownership or unsupported metrics', () => {
    const source = ['en', 'zh']
      .map((locale) => readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8'))
      .join('\n');

    expect(source).not.toMatch(/Before the meeting|After the meeting|会议前|会议后/);
    expect(source).not.toMatch(/increased by\s*\d+%|提升了?\s*\d+%/i);
    expect(source).not.toMatch(/No quantitative adoption, satisfaction, or efficiency metrics are claimed/);
    expect(source).not.toMatch(/\bdisclosure\s*:/);
    expect(source).not.toMatch(/因缺少验证数据|不作采用率/);
    expect(source).not.toMatch(/Customer API/);
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

    expect(english).toContain("title: 'Agora Meeting: a real-time collaboration system'");
    expect(chinese).toContain("title: 'Agora Meeting：实时协作系统'");
  });

  it('uses concise strategy-led Chinese copy without internal writing language', () => {
    const chinese = readFileSync('content/work/meeting.zh.mdx', 'utf8');

    expect(chinese).toContain('会议状态随时都在变化');
    expect(chinese).toContain('一个会议空间，适应不同工作状态');
    expect(chinese).toContain('协作重点会变');
    expect(chinese).toContain('常规会议、白板、分组不是换三套界面，而是在同一会议框架中重新安排主舞台与辅助信息，使用同一个布局空间去适配不同信息载体。');
    expect(chinese).toContain('让会议状态始终可感知');
    expect(chinese).toContain('同一个会议，不同身份的体验并不相同');
    expect(chinese).toContain('让聊天更顺滑，而不是打断会议');
    expect(chinese).toContain('让复杂存在于系统里，而不是存在于用户的认知负担里');
    expect(chinese).not.toMatch(/招聘者需要看到|推到主位|活着的参会者通道|空间节奏|API 暴露/);
  });

  it('frames collaboration modes as layout changes within one meeting system', () => {
    const english = readFileSync('content/work/meeting.en.mdx', 'utf8');

    expect(english).toContain('Collaboration focus changes');
    expect(english).toContain('Regular meetings, whiteboards, and breakout rooms are not three separate interfaces.');
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

    expect(source).toMatch(/MeetingSystemAdaptiveStageShowcase/);
    expect(source).toMatch(/MeetingSystemStateShowcase/);
    expect(source).toMatch(/MeetingSystemParticipationShowcase/);
    expect(source).toMatch(/MeetingSystemChatShowcase/);
    expect(source).toMatch(/MeetingSystemLogicSummary/);
    expect(source).toMatch(/MeetingSystemCollaborationShowcase/);
    expect(source).not.toMatch(/字幕参数|\.vtt/i);
    expect(source).not.toMatch(/BreakoutDecisionEvidence|MeetingVideo/);
  });
});
