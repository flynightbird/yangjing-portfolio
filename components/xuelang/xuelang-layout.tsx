import { Download } from 'lucide-react';

import { ChapterNav } from '@/components/case-study/chapter-nav';
import type { ContentLayoutProps } from '@/components/case-study/case-layout';

import styles from './xuelang-layout.module.css';
import './xuelang-print.css';

const copy = {
  en: {
    eyebrow: '00 / BYTEDANCE · XUELANG',
    facts: 'Project facts',
    role: 'Role',
    duration: 'Duration',
    status: 'Status',
    download: 'Download PDF case study',
    panoramaAlt:
      'Xuelang product panorama showing course discovery, purchase decisions, and learning experiences',
  },
  zh: {
    eyebrow: '00 / 字节跳动 · 学浪',
    facts: '项目概况',
    role: '角色',
    duration: '周期',
    status: '状态',
    download: '下载 PDF 案例',
    panoramaAlt: '学浪产品体验全景，呈现课程发现、购买决策与持续学习体验',
  },
} as const;

export function XuelangLayout({
  meta,
  locale,
  children,
}: ContentLayoutProps) {
  const text = copy[locale];
  const pdfHref = `/files/xuelang-case-study-${locale}.pdf`;

  return (
    <div className={styles.root} data-xuelang-case>
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav chapters={meta.chapters ?? []} locale={locale} />
        </aside>

        <article className={styles.case} data-case-study>
          <header className={styles.hero} data-xuelang-hero>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>{text.eyebrow}</p>
              <h1>{meta.title}</h1>
              <p className={styles.proposition}>{meta.proposition}</p>
              <dl className={styles.facts} aria-label={text.facts}>
                <div>
                  <dt>{text.role}</dt>
                  <dd>{meta.role}</dd>
                </div>
                <div>
                  <dt>{text.duration}</dt>
                  <dd>{meta.duration}</dd>
                </div>
                <div>
                  <dt>{text.status}</dt>
                  <dd>{meta.status}</dd>
                </div>
              </dl>
              <a
                className={styles.pdfAction}
                href={pdfHref}
                download
                data-case-web-control
              >
                <Download aria-hidden="true" size={18} strokeWidth={1.7} />
                <span>{text.download}</span>
              </a>
            </div>

            <figure className={styles.panorama} data-hero-panorama>
              {/* Generated from traceable Xuelang source frames. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meta.heroMedia}
                width={3000}
                height={1500}
                alt={text.panoramaAlt}
              />
            </figure>
          </header>

          <div className={styles.content}>{children}</div>
        </article>
      </div>
    </div>
  );
}
