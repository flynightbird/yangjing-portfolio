import { DraftCase } from '@/components/draft-case/draft-case';
import { contentMetaSchema } from '@/content/schema';

export const meetingDraftEnMetadata = contentMetaSchema.parse({
  type: 'work',
  slug: 'meeting',
  locale: 'en',
  translationKey: 'work.meeting',
  title: 'Meeting',
  proposition:
    'Make highly dynamic real-time collaboration visible and controllable.',
  role: 'Product Designer',
  duration: 'Approved case inputs pending',
  status: 'Draft',
  disclosure:
    'Shipped evidence and the 2026 retrospective remain separate. No audience or outcome claim is inferred.',
  heroMedia: '/images/meeting/shipped-room-overview.avif',
  evidenceLevel: 'draft',
  featuredOrder: 3,
  previousSlug: 'call-agent',
  nextSlug: 'stt-demo',
  caseLabel: 'MEETING / REAL-TIME COLLABORATION',
  chapters: [
    { id: 'overview', label: 'Overview' },
    { id: 'shipped-evidence', label: 'Shipped evidence' },
    { id: 'interaction-model', label: 'Interaction model' },
    { id: 'retrospective', label: '2026 retrospective' },
    { id: 'limitations', label: 'Limitations' },
  ],
});

export const meetingDraftZhMetadata = contentMetaSchema.parse({
  ...meetingDraftEnMetadata,
  locale: 'zh',
  proposition: '让高度动态的实时协作始终可见、可控。',
  duration: '等待已确认的案例输入',
  status: '草稿',
  disclosure: '已上线证据与 2026 回顾性设计分开呈现。不推断受众或结果声明。',
  chapters: [
    { id: 'overview', label: '概览' },
    { id: 'shipped-evidence', label: '已上线证据' },
    { id: 'interaction-model', label: '交互模型' },
    { id: 'retrospective', label: '2026 回顾性设计' },
    { id: 'limitations', label: '局限' },
  ],
});

export function MeetingDraftEn() {
  return <DraftCase locale="en" project="meeting" />;
}

export function MeetingDraftZh() {
  return <DraftCase locale="zh" project="meeting" />;
}
