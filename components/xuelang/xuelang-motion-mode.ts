export type XuelangMotionMode = 'static' | 'reveal' | 'cinematic';

export function resolveXuelangMotionMode({
  width,
  reducedMotion,
}: {
  readonly width: number;
  readonly reducedMotion: boolean;
}): XuelangMotionMode {
  if (reducedMotion) return 'static';
  if (width < 768) return 'static';
  if (width < 1200) return 'reveal';
  return 'cinematic';
}
