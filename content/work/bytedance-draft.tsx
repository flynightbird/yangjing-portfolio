import { DraftCase } from '@/components/draft-case/draft-case';
import { contentMetaSchema } from '@/content/schema';

export const bytedanceDraftEnMetadata = contentMetaSchema.parse({
  type: 'work',
  slug: 'bytedance',
  locale: 'en',
  translationKey: 'work.bytedance',
  title: 'ByteDance',
  proposition: 'Designing for products used at consumer scale.',
  role: 'Product Designer',
  duration: 'Approved case inputs pending',
  status: 'Draft',
  disclosure:
    'Public-safe structure only. No private project detail has been reconstructed or inferred.',
  heroMedia: '/images/bytedance/cover.avif',
  evidenceLevel: 'draft',
  featuredOrder: 1,
  nextSlug: 'call-agent',
  caseLabel: 'BYTEDANCE / CONSUMER SCALE',
  chapters: [
    { id: 'overview', label: 'Overview' },
    { id: 'evidence-boundary', label: 'Evidence boundary' },
  ],
});

export const bytedanceDraftZhMetadata = contentMetaSchema.parse({
  ...bytedanceDraftEnMetadata,
  locale: 'zh',
  title: '字节跳动',
  proposition: '为大规模 C 端产品设计体验。',
  duration: '等待已确认的案例输入',
  status: '草稿',
  disclosure: '仅包含可公开结构。没有重构或推断任何私密项目细节。',
  chapters: [
    { id: 'overview', label: '概览' },
    { id: 'evidence-boundary', label: '证据边界' },
  ],
});

export function BytedanceDraftEn() {
  return <DraftCase locale="en" project="bytedance" />;
}

export function BytedanceDraftZh() {
  return <DraftCase locale="zh" project="bytedance" />;
}
