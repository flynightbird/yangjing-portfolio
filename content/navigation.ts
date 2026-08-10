export const featuredOrder = [
  'work/xuelang',
  'work/call-agent',
  'work/convo-ai',
  'work/growth-base',
  'work/meeting',
  'work/tangping',
  'build/stt-demo',
  'work/meeting-system',
] as const;

export type FeaturedRoute = (typeof featuredOrder)[number];
