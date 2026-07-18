import type { ContentLayoutProps } from '@/components/case-study/case-layout';

export function TangpingLayout({ children }: ContentLayoutProps) {
  return <main data-tangping-case>{children}</main>;
}
