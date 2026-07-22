import type { ContentMeta } from './schema';

const meetingTitles = {
  en: 'Agora Meeting: A Real-time Collaboration System',
  zh: 'Agora Meeting：实时协作系统',
} as const;

export function resolveContentTitle(meta: ContentMeta) {
  return meta.slug === 'meeting' ? meetingTitles[meta.locale] : meta.title;
}
