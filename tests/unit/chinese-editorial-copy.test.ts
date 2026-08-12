import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const PUBLIC_PROSE_FILES = [
  'content/dictionaries/zh.ts',
  'content/home.ts',
  'components/about/about-page.tsx',
  'components/shell/site-footer.tsx',
  'components/shell/footer-contacts.tsx',
  'content/work/call-agent.zh.mdx',
  'content/work/convo-ai.zh.mdx',
  'content/work/meeting.zh.mdx',
  'content/work/xuelang.zh.mdx',
  'content/work/tangping.zh.mdx',
  'content/tangping.ts',
  'content/build/stt-demo.zh.mdx',
] as const;

function readPublicProse(relativePath: (typeof PUBLIC_PROSE_FILES)[number]): string {
  const source = readFileSync(path.join(process.cwd(), relativePath), 'utf8');

  if (relativePath === 'content/dictionaries/zh.ts') {
    return source.replace(
      /\n  draftCase: \{[\s\S]*?\n  aboutPage:/,
      '\n  aboutPage:',
    );
  }

  if (relativePath === 'content/home.ts') {
    return source
      .split('\n')
      .filter((line) => !/\balt\s*:/.test(line))
      .join('\n');
  }

  return source;
}

const publicProse = PUBLIC_PROSE_FILES.map((relativePath) => ({
  relativePath,
  source: readPublicProse(relativePath),
}));

describe('Chinese portfolio editorial contract', () => {
  it('uses the approved product designer identity in the dictionary and About page', () => {
    const approvedIdentity = '产品设计师（UI/UX），专注 AI 与复杂系统';

    for (const relativePath of [
      'content/dictionaries/zh.ts',
      'components/about/about-page.tsx',
    ] as const) {
      const source = publicProse.find(
        (entry) => entry.relativePath === relativePath,
      )?.source;

      expect(source, relativePath).toContain(approvedIdentity);
    }
  });

  it('removes inflated role labels from public Chinese prose', () => {
    const oldRolePattern = /唯一产品设计师|项目主设计师|项目主负责设计师/;

    for (const { relativePath, source } of publicProse) {
      expect(source, relativePath).not.toMatch(oldRolePattern);
    }
  });

  it('removes visible evidence disclaimers and disclosure metadata', () => {
    const disclaimerPattern =
      /不作.*声明|不对未验证|证据边界|结果数据来自个人履历中的自述|\bdisclosure\s*:/;

    for (const { relativePath, source } of publicProse) {
      expect(source, relativePath).not.toMatch(disclaimerPattern);
    }
  });

  it('removes generic filler language from public Chinese prose', () => {
    const fillerPattern =
      /赋能|打造|闭环|抓手|全链路|体验升级|能力建设|价值落地/;

    for (const { relativePath, source } of publicProse) {
      expect(source, relativePath).not.toMatch(fillerPattern);
    }
  });
});
