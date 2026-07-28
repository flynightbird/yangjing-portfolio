import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const PUBLIC_ENGLISH_FILES = [
  'content/dictionaries/en.ts',
  'content/home.ts',
  'components/about/about-page.tsx',
  'components/shell/site-footer.tsx',
  'content/work/call-agent.en.mdx',
  'content/work/convo-ai.en.mdx',
  'content/work/meeting.en.mdx',
  'content/work/xuelang.en.mdx',
  'content/work/tangping.en.mdx',
  'content/tangping.ts',
  'content/build/stt-demo.en.mdx',
] as const;

function readPublicEnglish(
  relativePath: (typeof PUBLIC_ENGLISH_FILES)[number],
): string {
  let source = readFileSync(path.join(process.cwd(), relativePath), 'utf8');

  if (relativePath === 'content/dictionaries/en.ts') {
    source = source.replace(
      /\n  draftCase: \{[\s\S]*?\n  aboutPage:/,
      '\n  aboutPage:',
    );
  }

  if (relativePath === 'content/home.ts') {
    source = source
      .split('\n')
      .filter((line) => !/\balt\s*:/.test(line))
      .join('\n');
  }

  return source;
}

const publicEnglish = PUBLIC_ENGLISH_FILES.map((relativePath) => ({
  relativePath,
  source: readPublicEnglish(relativePath),
}));

describe('English portfolio editorial contract', () => {
  it('positions product design first and AI-native building as a supporting capability', () => {
    const approvedIdentity = 'Product Designer focused on AI and complex systems';

    for (const relativePath of [
      'content/dictionaries/en.ts',
      'components/about/about-page.tsx',
    ] as const) {
      const source = publicEnglish.find(
        (entry) => entry.relativePath === relativePath,
      )?.source;

      expect(source, relativePath).toContain(approvedIdentity);
    }
  });

  it('uses restrained, credible role labels', () => {
    const inflatedRolePattern =
      /Sole Product Designer|Sole product design ownership|Lead UX Designer|Lead Product Designer|product design owner/i;

    for (const { relativePath, source } of publicEnglish) {
      expect(source, relativePath).not.toMatch(inflatedRolePattern);
    }
  });

  it('removes public disclaimers and evidence-boundary narration', () => {
    const disclaimerPattern =
      /\bdisclosure\s*:|evidence boundary|does not claim|No quantitative .* metrics are claimed/i;

    for (const { relativePath, source } of publicEnglish) {
      expect(source, relativePath).not.toMatch(disclaimerPattern);
    }
  });

  it('removes temporary publication notices from completed work', () => {
    const publicationNoticePattern =
      /media replacement pending|Temporary third-party imagery|Publication inputs pending/i;

    for (const { relativePath, source } of publicEnglish) {
      expect(source, relativePath).not.toMatch(publicationNoticePattern);
    }
  });

  it('keeps reflections focused on reusable methods', () => {
    const futureReflectionPattern =
      /The next questions are|In a second iteration, I would|what I would do next/i;

    for (const { relativePath, source } of publicEnglish) {
      expect(source, relativePath).not.toMatch(futureReflectionPattern);
    }
  });
});
