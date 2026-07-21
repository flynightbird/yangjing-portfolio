export type CallAgentMotionMode = 'cinematic' | 'reveal' | 'static';

export function resolveCallAgentMotionMode({
  width,
  reducedMotion,
}: {
  readonly width: number;
  readonly reducedMotion: boolean;
}): CallAgentMotionMode {
  if (reducedMotion || width < 768) return 'static';
  return width >= 1200 ? 'cinematic' : 'reveal';
}
