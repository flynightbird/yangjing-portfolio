export const featuredOrder = [
  'work/bytedance',
  'work/call-agent',
  'work/meeting',
  'build/stt-demo',
] as const;

export type FeaturedRoute = (typeof featuredOrder)[number];

export interface FeaturedNeighbors {
  readonly previous: FeaturedRoute | undefined;
  readonly next: FeaturedRoute | undefined;
}

export function getPreviousFeatured(
  route: FeaturedRoute,
): FeaturedRoute | undefined {
  const index = featuredOrder.indexOf(route);
  return index > 0 ? featuredOrder[index - 1] : undefined;
}

export function getNextFeatured(
  route: FeaturedRoute,
): FeaturedRoute | undefined {
  const index = featuredOrder.indexOf(route);
  return index < featuredOrder.length - 1
    ? featuredOrder[index + 1]
    : undefined;
}

export function getFeaturedNeighbors(route: FeaturedRoute): FeaturedNeighbors {
  return {
    previous: getPreviousFeatured(route),
    next: getNextFeatured(route),
  };
}
