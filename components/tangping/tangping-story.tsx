import type { Locale } from '@/content/types';

interface TangpingStoryProps {
  readonly locale: Locale;
}

export function TangpingStory({ locale }: TangpingStoryProps) {
  return <div data-tangping-story data-locale={locale} />;
}
