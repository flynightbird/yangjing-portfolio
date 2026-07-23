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
        'avatar', 'realtime-system', 'delivery',
      ],
      zh: [
        'context-challenge', 'app-product-structure', 'start-conversation',
        'conversation-control', 'digital-human', 'realtime-chain', 'delivery',
      ],
    } as const;

    for (const locale of ['en', 'zh'] as const) {
      const meta = getEntry('work', 'convo-ai', locale).meta;
      expect(meta).toMatchObject({
        type: 'work',
        slug: 'convo-ai',
        locale,
        translationKey: 'work.convo-ai',
        heroMedia: '/images/convo-ai/figma/web-ready.png',
        role: locale === 'zh' ? '独立负责产品设计' : 'Sole product design ownership',
        status: locale === 'zh' ? '已上线' : 'Formally launched',
      });
      expect(meta).not.toHaveProperty('disclosure');
      expect(meta.chapters?.map(({ id }) => id)).toEqual(chapterIds[locale]);
    }
  });

  it('publishes the approved Chinese decision-led narrative without retired claims', () => {
    const source = readFileSync(path.join(process.cwd(), 'content/work/convo-ai.zh.mdx'), 'utf8');

    expect(source).toContain('<ConvoAiAppShowcase locale="zh"');
    expect(source).toContain('<ConvoAiAvatarPair locale="zh"');
    expect(source).toContain('<ConvoAiConversationStart locale="zh"');
    expect(source).not.toContain("ids={['app-conversation-start', 'web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit']}");
    expect(source).toContain('对话中的控制权');
    expect(source).toContain('一次回答背后的实时链路');
    expect(source).toContain('让用户始终知道对话正在哪个阶段');
    expect(source).toContain('把产品能力组织成连续的用户路径');
    expect(source.match(/声纹如何定义“听谁说话”/g)).toHaveLength(1);
    expect(source).not.toContain('Off、Seamless 与 Personalized 对应不同的身份控制和录入成本');
    expect(source).not.toMatch(/确认谁在参与|建立会话信心|定位实时问题|交付与反思/);
    expect(source).not.toContain('这个项目让我更确定');
    expect(source).not.toMatch(/(?:<h[1-6][^>]*>\s*|^\s*#{1,6}\s+)(?:Gap|缺口)/im);
  });

  it('removes attribution and evidence-disclaimer language from public copy and the internal blueprint', () => {
    const sources = [
      'content/work/convo-ai.zh.mdx',
      'content/work/convo-ai.en.mdx',
      'evidence/convo-ai/case-study-blueprint.zh.md',
    ].map((file) => readFileSync(path.join(process.cwd(), file), 'utf8'));

    for (const source of sources) {
      expect(source).not.toMatch(/designer-reported/i);
      expect(source).not.toMatch(/现有证据|未经验证的业务指标|证据支持|unverified (?:business|performance|conversion|satisfaction)/i);
    }
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
    const chineseImplementationSource = `${chineseSource}\n${readFileSync(path.join(process.cwd(), 'components/convo-ai/convo-ai-media.tsx'), 'utf8')}`;

    for (const id of englishIds) expect(englishSource).toContain(`'${id}'`);
    expect(englishSource.match(/className="convo-phone-evidence"/g)).toHaveLength(2);

    for (const id of chineseIds) expect(chineseImplementationSource).toContain(`'${id}'`);
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
