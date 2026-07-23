export const featuredOrder = [
  'work/xuelang',
  'work/call-agent',
  'work/convo-ai',
  'work/meeting',
  'work/tangping',
  'build/stt-demo',
] as const;

export type FeaturedRoute = (typeof featuredOrder)[number];
