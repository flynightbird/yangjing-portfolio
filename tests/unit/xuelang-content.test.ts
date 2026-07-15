import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const zh = readFileSync(path.join(root, 'content/work/xuelang.zh.mdx'), 'utf8');
const en = readFileSync(path.join(root, 'content/work/xuelang.en.mdx'), 'utf8');
const chapterIds = [
  'overview',
  'business',
  'problem',
  'strategy',
  'decision-standard',
  'decision-purchase',
  'decision-learning',
  'results',
] as const;

function count(source: string, value: string) {
  return source.split(value).length - 1;
}

function section(source: string, id: string) {
  const match = source.match(new RegExp(`<section id="${id}"[\\s\\S]*?<\\/section>`));
  if (!match) throw new Error(`Missing section ${id}`);
  return match[0];
}

describe('Xuelang bilingual case content', () => {
  it('keeps all eight chapters aligned and states lead ownership accurately', () => {
    for (const id of chapterIds) {
      expect(count(zh, `id="${id}"`), id).toBe(1);
      expect(count(en, `id="${id}"`), id).toBe(1);
    }
    expect(zh).toContain('担任项目主负责设计师，负责整体体验策略、核心链路与关键方案设计');
    expect(en).toContain('As the lead designer, I owned the overall experience strategy, core journeys, and key design solutions');
    expect(zh).not.toMatch(/唯一设计师|独立完成整个项目/);
    expect(en).not.toMatch(/sole designer|single-handedly/i);
  });

  it('frames the business, problem, and strategy with approved context', () => {
    expect(section(zh, 'business')).toMatch(/DAU\s*50w/);
    expect(section(zh, 'business')).toContain('年度 GMV 300 亿');
    expect(section(en, 'business')).toContain('500K DAU');
    expect(section(en, 'business')).toContain('RMB 30B annual GMV');
    for (const problem of ['识别低', '信任低', '难坚持']) {
      expect(section(zh, 'problem')).toContain(problem);
    }
    expect(section(zh, 'strategy')).toContain('一端建立课程质量标准，一端补全发现、决策、学习与沉淀的体验链路。');
    expect(section(zh, 'strategy')).toContain('卖“好”课 × 学习体验');
  });

  it('maps quality standards to traceable interface evidence', () => {
    const standardZh = section(zh, 'decision-standard');
    const standardEn = section(en, 'decision-standard');
    for (const phrase of ['质量标准', '信息模块', '多触点一致表达', '用户信任']) {
      expect(standardZh).toContain(phrase);
    }
    for (const phrase of ['teacher credibility', 'course structure', 'learner outcomes', 'reviews', 'platform guarantees']) {
      expect(standardEn).toContain(phrase);
    }
    for (const source of [
      'quality-standard.webp',
      'quality-credibility.webp',
      'quality-structure.webp',
      'quality-guarantee.webp',
      'discovery-touchpoint.webp',
      'selection-touchpoint.webp',
      'course-detail.webp',
    ]) {
      expect(standardZh).toContain(`/images/xuelang/${source}`);
      expect(standardEn).toContain(`/images/xuelang/${source}`);
    }
  });

  it('qualifies the purchase experiment and the continuous-learning decision', () => {
    const purchaseZh = section(zh, 'decision-purchase');
    expect(purchaseZh).toMatch(/A\/B\/C|A · B · C/);
    expect(purchaseZh).toContain('头图试听方案购买转化正向 6.5%');
    expect(purchaseZh).toMatch(/课程品类|不同品类/);
    expect(purchaseZh).not.toMatch(/转化率达到|购买转化率为/);

    const learningZh = section(zh, 'decision-learning');
    for (const phrase of ['课程入口', '沉浸观看', '碎片学习', '互动', '笔记与学习资产']) {
      expect(learningZh).toContain(phrase);
    }
    for (const source of ['detail-before.webp', 'detail-after.webp', 'learning-entry.webp', 'learning-focus.webp', 'learning-interaction.webp', 'learning-assets.webp']) {
      expect(learningZh).toContain(`/images/xuelang/${source}`);
    }
  });

  it('publishes only the approved results and their 14-day basis', () => {
    const resultsZh = section(zh, 'results');
    const resultsEn = section(en, 'results');
    for (const metric of ['11.75%', '1.36%', '6.5%', '43%', '55%', '39%']) {
      expect(resultsZh).toContain(metric);
      expect(resultsEn).toContain(metric);
    }
    expect(resultsZh).toContain('数据为实验周期内 14 天累计相对值。');
    expect(resultsEn).toContain('Data represents cumulative relative values over the 14-day experiment period.');
    expect(zh).not.toMatch(/灰度|长期增长|复购提升|留存提升/);
    expect(en).not.toMatch(/gray release|long-term growth|repurchase increased|retention increased/i);
  });
});
