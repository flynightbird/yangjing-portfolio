import { Download } from 'lucide-react';

import { ChapterNav } from '@/components/case-study/chapter-nav';
import type { ContentLayoutProps } from '@/components/case-study/case-layout';

import styles from './xuelang-layout.module.css';
import { XuelangMotion } from './xuelang-motion';
import './xuelang-print.css';

const copy = {
  en: {
    eyebrow: '00 / BYTEDANCE · XUELANG',
    facts: 'Project facts',
    role: 'Role',
    duration: 'Duration',
    status: 'Status',
    download: 'Download PDF case study',
    downloadSize: 'PDF · 5.8 MB',
    proof: '14-day experiment · GMV per user +11.75%',
    panoramaAlt:
      'Xuelang product panorama showing course discovery, purchase decisions, and learning experiences',
    panoramaKicker: 'PRODUCT EXPERIENCE / 4 STATES',
    panoramaFlow: 'Discover · Decide · Learn · Retain',
    heroStates: [
      {
        src: '/images/xuelang/quality-detail-ui.webp',
        alt: 'Course quality evidence in the detail page',
        label: '01 / RECOGNIZE',
      },
      {
        src: '/images/xuelang/purchase-selected.webp',
        alt: 'Selected course-detail hero trial experience',
        label: '02 / VERIFY',
      },
      {
        src: '/images/xuelang/learning-entry-ui.webp',
        alt: 'Learning entry with progress and continue-learning state',
        label: '03 / CONTINUE',
      },
      {
        src: '/images/xuelang/learning-note-editor.webp',
        alt: 'In-player note editor preserving learning context',
        label: '04 / ACCUMULATE',
      },
    ],
  },
  zh: {
    eyebrow: '00 / 字节跳动 · 学浪',
    facts: '项目概况',
    role: '角色',
    duration: '周期',
    status: '状态',
    download: '下载 PDF 案例',
    downloadSize: 'PDF · 6.5 MB',
    proof: '14 天实验 · 人均 GMV +11.75%',
    panoramaAlt: '学浪产品体验全景，呈现课程发现、购买决策与持续学习体验',
    panoramaKicker: 'PRODUCT EXPERIENCE / 4 STATES',
    panoramaFlow: '发现 · 决策 · 学习 · 沉淀',
    heroStates: [
      {
        src: '/images/xuelang/quality-detail-ui.webp',
        alt: '课程详情中可识别的品质证据',
        label: '01 / RECOGNIZE',
      },
      {
        src: '/images/xuelang/purchase-selected.webp',
        alt: '被选中的课程详情头图试听方案',
        label: '02 / VERIFY',
      },
      {
        src: '/images/xuelang/learning-entry-ui.webp',
        alt: '展示进度与继续学习状态的课程入口',
        label: '03 / CONTINUE',
      },
      {
        src: '/images/xuelang/learning-note-editor.webp',
        alt: '保留学习上下文的播放器内笔记界面',
        label: '04 / ACCUMULATE',
      },
    ],
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
    <XuelangMotion>
      <div className={styles.root} data-xuelang-case>
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav chapters={meta.chapters ?? []} locale={locale} compactAt="wide" />
        </aside>

        <article className={styles.case} data-case-study>
          <header className={styles.hero} data-xuelang-hero>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>{text.eyebrow}</p>
              <div className={styles.heroThesis} data-hero-thesis>
                <h1>{meta.title}</h1>
              </div>
              <div className={styles.heroSupport} data-hero-support>
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
                    <dd className={styles.heroProof}>{text.proof}</dd>
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
                  <small aria-hidden="true">{text.downloadSize}</small>
                </a>
              </div>
            </div>

            <figure
              className={styles.panorama}
              data-hero-panorama
              aria-label={text.panoramaAlt}
            >
              <div className={styles.panoramaMeta} aria-hidden="true">
                <span>{text.panoramaKicker}</span>
                <span>{text.panoramaFlow}</span>
              </div>
              <span className={styles.panoramaWord} aria-hidden="true">XUELANG</span>
              <div className={styles.productStates}>
                {text.heroStates.map((state, index) => (
                  <div
                    key={state.src}
                    className={`${styles.productState} ${styles[`productState${index + 1}`]}`}
                    data-hero-product-state
                  >
                    <span aria-hidden="true">{state.label}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={state.src} alt={state.alt} />
                  </div>
                ))}
              </div>
            </figure>
          </header>

          <div className={styles.content}>{children}</div>
        </article>
      </div>
      </div>
    </XuelangMotion>
  );
}
