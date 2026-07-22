import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { contentEntries, getEntry } from '@/content/registry';
import { homepageProjects } from '@/content/home';

describe('ConvoAI publication contract', () => {
  it('publishes a complete bilingual internal case', () => {
    const entries = contentEntries.filter(({ meta }) => meta.slug === 'convo-ai');

    expect(entries.map(({ meta }) => meta.locale)).toEqual(['en', 'zh']);
    const chapterIds = {
      en: [
        'context-thesis', 'ready', 'interrupt', 'trusted-participant',
        'avatar', 'realtime-system', 'delivery-reflection',
      ],
      zh: [
        'context-challenge', 'app-product-structure', 'start-conversation',
        'conversation-control', 'digital-human', 'realtime-chain', 'delivery',
      ],
    } as const;

    for (const locale of ['en', 'zh'] as const) {
      expect(getEntry('work', 'convo-ai', locale).meta).toMatchObject({
        type: 'work',
        slug: 'convo-ai',
        locale,
        translationKey: 'work.convo-ai',
        heroMedia: '/images/convo-ai/figma/web-ready.png',
        previousSlug: 'call-agent',
        nextSlug: 'meeting',
      });
      expect(getEntry('work', 'convo-ai', locale).meta.chapters?.map(({ id }) => id)).toEqual(chapterIds[locale]);
    }
  });

  it('publishes the approved Chinese decision-led narrative without retired claims', () => {
    const source = readFileSync(path.join(process.cwd(), 'content/work/convo-ai.zh.mdx'), 'utf8');

    expect(source).toContain('<ConvoAiAppShowcase locale="zh"');
    expect(source).toContain('<ConvoAiAvatarPair locale="zh"');
    expect(source).toContain('对话中的控制权');
    expect(source).toContain('一次回答背后的实时链路');
    expect(source).not.toMatch(/确认谁在参与|建立会话信心|定位实时问题|交付与反思/);
    expect(source).not.toContain('这个项目让我更确定');
    expect(source).not.toMatch(/(?:<h[1-6][^>]*>\s*|^\s*#{1,6}\s+)(?:Gap|缺口)/im);
  });

  it('publishes all sixteen complete recordings without a Gap chapter or metrics', () => {
    const englishIds = [
      'app-login', 'app-structure', 'app-conversation-start', 'app-caption-camera',
      'app-profile-settings', 'app-voiceprint-lock', 'app-hardware-device',
      'app-avatar-select', 'app-avatar-interaction', 'web-login', 'web-preflight',
      'web-preflight-layout', 'web-join-exit', 'web-conversation', 'web-interrupt',
      'web-realtime-data',
    ];
    const chineseIds = [
      'app-conversation-start', 'app-caption-camera', 'app-voiceprint-lock', 'web-login',
      'web-preflight', 'web-preflight-layout', 'web-join-exit', 'web-conversation',
      'web-interrupt', 'web-realtime-data',
    ];
    const englishSource = readFileSync(path.join(process.cwd(), 'content/work/convo-ai.en.mdx'), 'utf8');
    const chineseSource = readFileSync(path.join(process.cwd(), 'content/work/convo-ai.zh.mdx'), 'utf8');

    for (const id of englishIds) expect(englishSource).toContain(`'${id}'`);
    expect(englishSource.match(/className="convo-phone-evidence"/g)).toHaveLength(2);

    for (const id of chineseIds) expect(chineseSource).toContain(`'${id}'`);
    expect(chineseSource).toContain('<ConvoAiAppShowcase locale="zh"');
    expect(chineseSource).toContain('<ConvoAiAvatarPair locale="zh"');
    expect((chineseSource.match(/className="convo-phone-evidence"/g) ?? [])).toHaveLength(0);

    for (const source of [englishSource, chineseSource]) {
      expect(source).not.toMatch(/(?:<h[1-6][^>]*>\s*|^\s*#{1,6}\s+)(?:Gap|缺口)/im);
      expect(source).not.toMatch(/\d+(?:\.\d+)?%/);
    }
  });

  it('routes the homepage card to the internal case without placeholder state', () => {
    expect(homepageProjects.find(({ id }) => id === 'convo-ai')).toMatchObject({
      destination: 'internal-case',
      availability: 'complete',
      href: 'work/convo-ai/',
    });
  });
});
