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
    proof: '14-day experiment · GMV per user +11.75%',
    panoramaAlt:
      'Xuelang product panorama showing course discovery, purchase decisions, and learning experiences',
    panoramaKicker: 'PRODUCT EXPERIENCE / 4 STATES',
    panoramaFlow: 'Discover · Decide · Learn · Retain',
    heroStates: [
      {
        src: '/images/xuelang/hero-discover.webp',
        alt: 'Course discovery with categories, recommendations, and selection entry points',
        label: '01 / DISCOVER',
      },
      {
        src: '/images/xuelang/hero-decide.webp',
        alt: 'Course details supporting evaluation, trial content, and the purchase decision',
        label: '02 / DECIDE',
      },
      {
        src: '/images/xuelang/hero-learn.webp',
        alt: 'Learning entry with organized content, progress, and a continue-learning state',
        label: '03 / LEARN',
      },
      {
        src: '/images/xuelang/hero-retain.webp',
        alt: 'In-player note capture that preserves the active learning context',
        label: '04 / RETAIN',
      },
    ],
  },
  zh: {
    eyebrow: '00 / 字节跳动 · 学浪',
    facts: '项目概况',
    role: '角色',
    duration: '周期',
    status: '状态',
    proof: '14 天实验 · 人均 GMV +11.75%',
    panoramaAlt: '学浪产品体验全景，呈现课程发现、购买决策与持续学习体验',
    panoramaKicker: 'PRODUCT EXPERIENCE / 4 STATES',
    panoramaFlow: '发现 · 决策 · 学习 · 沉淀',
    heroStates: [
      {
        src: '/images/xuelang/hero-discover.webp',
        alt: '课程发现页中的课程分类、内容推荐与选课入口',
        label: '01 / DISCOVER',
      },
      {
        src: '/images/xuelang/hero-decide.webp',
        alt: '课程详情页中的课程信息、试听内容与购买决策入口',
        label: '02 / DECIDE',
      },
      {
        src: '/images/xuelang/hero-learn.webp',
        alt: '课程学习入口中的内容组织、学习进度与继续学习状态',
        label: '03 / LEARN',
      },
      {
        src: '/images/xuelang/hero-retain.webp',
        alt: '播放器内记录笔记并保留学习上下文的编辑状态',
        label: '04 / RETAIN',
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

  return (
    <XuelangMotion>
      <div className={styles.root} data-xuelang-case>
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav
            chapters={meta.chapters ?? []}
            locale={locale}
            compactAt="wide"
            indexStart={0}
            variant="xuelang"
          />
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
