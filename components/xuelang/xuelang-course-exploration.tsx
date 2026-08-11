import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './xuelang-course-exploration.module.css';

const backgroundImages = [
  '/images/xuelang/exploration-detail-fitness.png',
  '/images/xuelang/exploration-student-work.png',
  '/images/xuelang/exploration-detail-relationship.png',
  '/images/xuelang/exploration-detail-slimming.png',
  '/images/xuelang/exploration-detail-parenting.png',
  '/images/xuelang/exploration-detail-illustration.png',
] as const;

const copy = {
  zh: {
    title: '课程 · 设计探索',
    demoTitle: '与产品、运营组队，为不同核心品类探索 Demo 方案',
    demoDescription: '健身、插画、亲子、情感等课程的决策依据并不相同。我们先保留品类差异，分别探索内容组织与课程表达，再从方案中寻找可以复用的共性。',
    demoAlt: '健身、插画、情感、塑形、亲子与兴趣课程的详情页 Demo 方案',
    convergenceTitle: '从品类差异里，抽出课程信息的共性标准',
    convergenceDescription: '方案收敛后，课程改造目标聚焦在三个判断：能否快速识别是否适合、能否建立对课程的信任、能否相信自己可以完成。',
    backdropAlt: '不同课程品类的详情页探索素材',
    modulesTitle: '从不同品类的探索中，抽象出可复用的课程模块',
    modulesDescription: '课程表达可以随品类变化，但用户反复需要判断的信息是共通的。老师风格、课程服务、学习成果、动态内容、评价与进度、老师价值和平台认证，被收敛为一组可以复用的内容模块。',
    modulesAlt: '从多品类课程方案中抽象出的老师风格、课程服务、学习成果、评价、课程体系、老师价值与平台认证模块',
    principles: [
      {
        symptom: '识别低',
        question: '这个课程适不适合我？我为什么选择它？',
        decision: '把适配信息变成可比较的标准',
        signals: [
          { title: '课程直观喜好度', description: '先让用户快速判断老师风格与内容方向。' },
          { title: '课程服务标准化', description: '统一关键服务信息，支持不同课程横向比较。' },
          { title: '整体教学效果', description: '用作品与结果呈现课程可以带来的变化。' },
        ],
      },
      {
        symptom: '信任低',
        question: '怎么让人觉得这门课程靠谱？',
        decision: '建立对课程内容的信任',
        signals: [
          { title: '老师价值', description: '专业背景、教学经验与个人影响力。' },
          { title: '课程价值', description: '学习内容、方法与他人学习效果。' },
          { title: '平台价值', description: '由平台提供认证、服务与履约保障。' },
        ],
      },
      {
        symptom: '难坚持',
        question: '这门课程适合我吗？我能不能学会？',
        decision: '降低对无法完成课程的担心',
        signals: [
          { title: '水平基础匹配度', description: '明确难度、门槛与适合的学习基础。' },
          { title: '观察他人', description: '通过作品和评价感知真实学习效果。' },
          { title: '课程体系完整度', description: '用清晰路径说明如何一步步完成学习。' },
        ],
      },
    ],
  },
  en: {
    title: 'Course · Design exploration',
    demoTitle: 'Partner with Product and Operations to explore demos for core course categories',
    demoDescription: 'Fitness, illustration, parenting, and relationship courses require different evidence. We first explored category-specific content and course narratives, then looked for patterns that could become a shared system.',
    demoAlt: 'Course-detail demos across fitness, illustration, relationships, body shaping, parenting, and interest learning',
    convergenceTitle: 'Extract a shared course standard from category differences',
    convergenceDescription: 'The explorations converged on three judgments: help learners recognize fit, trust the course, and believe they can complete it.',
    backdropAlt: 'Course-detail exploration material from different learning categories',
    modulesTitle: 'Turn category explorations into reusable course modules',
    modulesDescription: 'The expression could change by category, but the evidence learners repeatedly needed was shared. Instructor style, course services, outcomes, dynamic content, reviews and progress, instructor value, and platform verification became a reusable module set.',
    modulesAlt: 'Reusable modules for instructor style, course services, outcomes, reviews, course structure, instructor value, and platform verification',
    principles: [
      {
        symptom: 'Low recognition',
        question: 'Is this course right for me, and why should I choose it?',
        decision: 'Make fit visible and comparable',
        signals: [
          { title: 'Immediate preference', description: 'Reveal instructor style and content direction at a glance.' },
          { title: 'Comparable service', description: 'Standardize key services across different courses.' },
          { title: 'Teaching outcomes', description: 'Show the change a course can produce through real work.' },
        ],
      },
      {
        symptom: 'Low trust',
        question: 'What makes this course feel credible?',
        decision: 'Build trust in the course content',
        signals: [
          { title: 'Instructor value', description: 'Professional background, teaching experience, and influence.' },
          { title: 'Course value', description: 'Content, method, and evidence from other learners.' },
          { title: 'Platform value', description: 'Verification, service, and fulfillment guarantees.' },
        ],
      },
      {
        symptom: 'Hard to persist',
        question: 'Does it match my level, and can I finish it?',
        decision: 'Reduce anxiety about completing the course',
        signals: [
          { title: 'Level fit', description: 'Clarify difficulty, prerequisites, and expected foundations.' },
          { title: 'Learn from others', description: 'Use work samples and reviews to make outcomes tangible.' },
          { title: 'Complete structure', description: 'Show a clear path for progressing through the course.' },
        ],
      },
    ],
  },
} as const;

export function XuelangCourseExploration({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];

  return (
    <div className={styles.root} data-xuelang-course-exploration>
      <section className={styles.demoStage}>
        <header className={styles.stageHeader}>
          <p>{text.title}</p>
          <div>
            <h3>{text.demoTitle}</h3>
            <p>{text.demoDescription}</p>
          </div>
        </header>
        <figure className={styles.demoWall}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath('/images/xuelang/course-demo-wall.png')}
            width="1920"
            height="1080"
            loading="lazy"
            alt={text.demoAlt}
          />
        </figure>
      </section>

      <section className={styles.convergenceStage}>
        <div className={styles.pageBackdrop} aria-hidden="true">
          {backgroundImages.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image} src={withBasePath(image)} alt="" loading="lazy" />
          ))}
        </div>
        <header className={styles.convergenceHeader}>
          <p>{text.title}</p>
          <h3>{text.convergenceTitle}</h3>
          <span>{text.convergenceDescription}</span>
        </header>
        <ol className={styles.principleGrid}>
          {text.principles.map((principle) => (
            <li key={principle.symptom}>
              <div className={styles.lens}><strong>{principle.symptom}</strong></div>
              <p className={styles.question}>{principle.question}</p>
              <h4>{principle.decision}</h4>
              <ul className={styles.signalList}>
                {principle.signals.map((signal) => (
                  <li key={signal.title}>
                    <strong>{signal.title}</strong>
                    <p>{signal.description}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <span className={styles.srOnly}>{text.backdropAlt}</span>
      </section>

      <section className={styles.moduleStage}>
        <header className={styles.moduleHeader}>
          <p>{text.title}</p>
          <div>
            <h3>{text.modulesTitle}</h3>
            <p>{text.modulesDescription}</p>
          </div>
        </header>
        <figure className={styles.moduleFigure}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath('/images/xuelang/course-shared-modules.png')}
            width="1409"
            height="771"
            loading="lazy"
            alt={text.modulesAlt}
          />
        </figure>
      </section>
    </div>
  );
}
