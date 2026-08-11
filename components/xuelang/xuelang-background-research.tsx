import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './xuelang-background-research.module.css';

const avatars = [
  '/images/xuelang/research-user-01.jpg',
  '/images/xuelang/research-user-02.jpg',
  '/images/xuelang/research-user-03.jpg',
  '/images/xuelang/research-user-04.jpg',
  '/images/xuelang/research-user-05.jpg',
  '/images/xuelang/research-user-06.jpg',
] as const;

const audienceImages = [
  '/images/xuelang/audience-life.jpg',
  '/images/xuelang/audience-growth.jpg',
  '/images/xuelang/audience-quality.jpg',
] as const;

const copy = {
  zh: {
    whyLabel: '学浪，为何要变？',
    whyTitle: '交易发生在抖音，长期关系要留在学浪',
    reasons: [
      {
        title: '营收受到外部流量约束',
        description: '首次购买行为多发生在抖音，复购仍需要回到外部内容场景完成。',
      },
      {
        title: '用户缺少回到学浪的理由',
        description: '只有把课程发现与持续学习留在端内，才可能形成稳定的复访与复购。',
      },
    ],
    acquisition: '抖音\n完成首次购买',
    retention: '学浪\n承接学习与复购',
    shiftLabel: '重新定义学浪原有的工具属性',
    shiftContext: '面对 App 端内商业化增长',
    shiftTitle: '从用户视角，重新定义学浪的产品感知',
    shiftFrom: 'To B 卖课工具',
    shiftTo: 'To C 学习平台',
    formulaLabel: '产品孵化期，先验证这条路径',
    formula: ['卖“好”课', '学习体验'],
    shiftNote: '与 PM 共同参与项目前置讨论，从 To C 用户价值出发，继续探索课程供给、用户需求与可能的产品路径。',
    researchLabel: 'XUELANG / 设计研究',
    researchTitle: '用数据和用户调研，寻找能验证 To C 价值的人群',
    priorLabel: '预判',
    priorTitle: '先从数据里缩小范围',
    priorAge: '24 至 50 岁',
    priorDescription: '人群规模与课程消费能力重合度更高',
    learnLabel: '建立认知',
    learnTitle: '再用电话访谈理解动机',
    learnMethod: '高生命周期价值用户',
    learnMethodLabel: '电话调研',
    quoteLabel: '匿名用户反馈',
    quoteDisclosure: '头像使用宠物与风景免费素材，仅用于匿名反馈的视觉示意。',
    avatarAlt: '匿名用户反馈示意图',
    quotes: [
      '喜欢沉浸式的学习氛围',
      '老师专业、声音好，直播也很有感染力',
      '喜欢动态短视频和直播内容',
      '老师讲得细，服务好，也愿意陪伴学习',
      '不会在学浪里刷直播',
      '会把喜欢的老师作品剪成合集反复看',
    ],
    metricTitle: '女性用户在四项课程消费指标中均更突出',
    metricContext: '调研阶段对照比例',
    metrics: [
      { value: '56% vs 30%', label: '抖音内购课占比' },
      { value: '38% vs 35%', label: '线上购课占比' },
      { value: '59% vs 29%', label: '抖音内购课 GMV 占比' },
      { value: '42% vs 36%', label: '线上购课 GMV 占比' },
    ],
    audienceTitle: '会生活、享受生活、追求趣味的“三高”女性群体',
    audienceProfiles: [
      { title: '热爱生活', alt: '阳光下享受生活的女性' },
      { title: '学要有模样', alt: '专注使用电脑学习的女性' },
      { title: '追求品质', alt: '与朋友享受品质生活的女性' },
    ],
    audienceSummary: '24 至 50 岁的中青年女性，尤其集中在一二线城市、家庭收入较高或本科及以上学历的人群。',
    needTitle: '满足泛兴趣学习需求，丰富生活，充盈内心',
    needValue: '趣享生活 · 自信向上 · 良师益友',
    problemTitle: '然而，当前体验仍有三个核心问题',
    userViewLabel: '用户感受到',
    platformViewLabel: '平台现状',
    userProblems: ['课程与服务质量参差', '学习效果缺少保障', '难以识别优质课程', '难以坚持完成学习'],
    platformProblems: ['课程数量多但组织杂乱', '缺少平台感与优质品牌认知', '重营销，轻视完整上课体验'],
    coreProblems: ['识别低', '信任低', '难坚持'],
    recognitionSignals: ['课程', '品牌', '平台'],
  },
  en: {
    whyLabel: 'WHY XUELANG HAD TO CHANGE',
    whyTitle: 'Transactions began on Douyin; the learning relationship had to live in Xuelang',
    reasons: [
      {
        title: 'Revenue depended on external traffic',
        description: 'Most first purchases happened on Douyin, and repeat purchases still relied on returning to that content ecosystem.',
      },
      {
        title: 'Learners lacked a reason to return',
        description: 'Xuelang needed to retain course discovery and ongoing learning before repeat visits and purchases could emerge.',
      },
    ],
    acquisition: 'Douyin\nFirst purchase',
    retention: 'Xuelang\nLearning and retention',
    shiftLabel: 'REDEFINE THE PRODUCT BEYOND ITS TOOL IDENTITY',
    shiftContext: 'Growing in-app commercialization',
    shiftTitle: 'Reframe how learners understand Xuelang',
    shiftFrom: 'To B selling tool',
    shiftTo: 'To C learning platform',
    formulaLabel: 'Validate the product direction during incubation',
    formula: ['Sell quality courses', 'Learning experience'],
    shiftNote: 'I joined early product discussions with PM, starting from learner value and exploring course supply, unmet needs, and viable platform directions.',
    researchLabel: 'XUELANG / DESIGN RESEARCH',
    researchTitle: 'Combine behavioral data and interviews to find users who could validate To C value',
    priorLabel: 'HYPOTHESIS',
    priorTitle: 'Use data to narrow the audience',
    priorAge: 'Ages 24 to 50',
    priorDescription: 'The strongest overlap between audience scale and paid-course spending',
    learnLabel: 'BUILD UNDERSTANDING',
    learnTitle: 'Use phone interviews to understand motivation',
    learnMethod: 'High-lifetime-value learners',
    learnMethodLabel: 'Phone interviews',
    quoteLabel: 'Anonymous learner feedback',
    quoteDisclosure: 'Free pet and landscape images are used to preserve participant anonymity.',
    avatarAlt: 'Illustrative image for anonymous learner feedback',
    quotes: [
      'I like an immersive learning atmosphere.',
      'The instructor is professional, has a great voice, and makes live sessions engaging.',
      'I enjoy short-form video and livestream content.',
      'The instructor explains clearly and provides patient support.',
      'I would not browse livestreams inside Xuelang.',
      'I save and remix clips from instructors whose work I like.',
    ],
    metricTitle: 'Women over-indexed across all four course-spending indicators',
    metricContext: 'Research-stage comparison',
    metrics: [
      { value: '56% vs 30%', label: 'Douyin in-app course buyers' },
      { value: '38% vs 35%', label: 'Online course buyers' },
      { value: '59% vs 29%', label: 'Douyin in-app course GMV' },
      { value: '42% vs 36%', label: 'Online course GMV' },
    ],
    audienceTitle: 'Women who enjoy life, pursue interests, and expect quality',
    audienceProfiles: [
      { title: 'Love life', alt: 'A woman enjoying a quiet moment in sunlight' },
      { title: 'Learn with intention', alt: 'A woman focused on learning with a computer' },
      { title: 'Pursue quality', alt: 'Women enjoying time together in a considered setting' },
    ],
    audienceSummary: 'Women aged 24 to 50, especially those in Tier 1 or Tier 2 cities, with higher household income or a bachelor’s degree and above.',
    needTitle: 'Meet broad interest-learning needs and enrich everyday life',
    needValue: 'Enjoy life · Grow with confidence · Learn from trusted mentors',
    problemTitle: 'Three core problems still shaped the experience',
    userViewLabel: 'Learners experienced',
    platformViewLabel: 'Platform conditions',
    userProblems: ['Uneven course and service quality', 'Learning outcomes felt uncertain', 'Quality courses were hard to recognize', 'Finishing a course was difficult'],
    platformProblems: ['A large but poorly organized course supply', 'Weak platform and quality-brand perception', 'Marketing outweighed the learning experience'],
    coreProblems: ['Low recognition', 'Low trust', 'Hard to persist'],
    recognitionSignals: ['Course', 'Brand', 'Platform'],
  },
} as const;

export function XuelangBackgroundResearch({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];

  return (
    <div className={styles.root} data-xuelang-background-research>
      <div className={styles.whyStage} data-research-stage="why">
        <header className={styles.stageHeader}>
          <span>{text.whyLabel}</span>
          <h3>{text.whyTitle}</h3>
        </header>
        <div className={styles.whyGrid}>
          <ol className={styles.reasonList}>
            {text.reasons.map((reason) => (
              <li key={reason.title}>
                <div>
                  <strong>{reason.title}</strong>
                  <p>{reason.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.orbitMap} aria-label={`${text.acquisition}; ${text.retention}`}>
            <div className={styles.outerOrbit} aria-hidden="true" />
            <div className={styles.douyinCircle}><span>{text.acquisition}</span></div>
            <span className={styles.flowArrow} aria-hidden="true" />
            <div className={styles.xuelangNode}><span>{text.retention}</span></div>
          </div>
        </div>
      </div>

      <div className={styles.shiftStage} data-research-stage="shift">
        <header className={styles.stageHeader}>
          <span>{text.shiftLabel}</span>
        </header>
        <div className={styles.shiftFrame}>
          <p>{text.shiftContext}</p>
          <h3>{text.shiftTitle}</h3>
          <div className={styles.shiftPath} aria-label={`${text.shiftFrom} to ${text.shiftTo}`}>
            <strong>{text.shiftFrom}</strong>
            <span aria-hidden="true">→</span>
            <strong>{text.shiftTo}</strong>
          </div>
        </div>
        <div className={styles.formulaBlock}>
          <span>{text.formulaLabel}</span>
          <p>{text.formula[0]} <i>×</i> {text.formula[1]}</p>
        </div>
        <p className={styles.shiftNote}>{text.shiftNote}</p>
      </div>

      <div className={styles.researchStage} data-research-stage="research">
        <header className={styles.stageHeader}>
          <span>{text.researchLabel}</span>
          <h3>{text.researchTitle}</h3>
        </header>
        <div className={styles.researchMethods}>
          <article className={styles.priorMethod}>
            <span>{text.priorLabel}</span>
            <h4>{text.priorTitle}</h4>
            <div className={styles.audienceChart} aria-hidden="true" />
            <strong>{text.priorAge}</strong>
            <p>{text.priorDescription}</p>
          </article>
          <article className={styles.interviewMethod}>
            <span>{text.learnLabel}</span>
            <h4>{text.learnTitle}</h4>
            <div className={styles.interviewRing}>
              <strong>{text.learnMethodLabel}</strong>
              <p>{text.learnMethod}</p>
            </div>
          </article>
          <div className={styles.quoteBoard}>
            <div className={styles.quoteBoardHeader}>
              <strong>{text.quoteLabel}</strong>
              <span>{text.quoteDisclosure}</span>
            </div>
            <ul>
              {text.quotes.map((quote, index) => (
                <li key={quote}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={withBasePath(avatars[index])}
                    alt={`${text.avatarAlt} ${index + 1}`}
                  />
                  <p>{quote}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.metricBoard}>
          <div className={styles.metricIntro}>
            <span>{text.metricContext}</span>
            <h4>{text.metricTitle}</h4>
          </div>
          <dl>
            {text.metrics.map((metric) => (
              <div key={metric.label}>
                <dd>{metric.value}</dd>
                <dt>{metric.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className={styles.audienceStage} data-research-stage="audience">
        <header className={styles.stageHeader}>
          <h3>{text.audienceTitle}</h3>
        </header>
        <div className={styles.personaGrid}>
          {text.audienceProfiles.map((profile, index) => (
            <figure key={profile.title}>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBasePath(audienceImages[index])} alt={profile.alt} />
                <strong>{profile.title}</strong>
              </div>
            </figure>
          ))}
        </div>
        <p className={styles.audienceSummary}>{text.audienceSummary}</p>
      </div>

      <div className={styles.needStage} data-research-stage="need">
        <h3>{text.needTitle}</h3>
        <span className={styles.needArrow} aria-hidden="true" />
        <p>{text.needValue}</p>
      </div>

      <div className={styles.problemStage} data-research-stage="problems">
        <header className={styles.stageHeader}>
          <h3>{text.problemTitle}</h3>
        </header>
        <div className={styles.problemMap}>
          <div className={styles.problemList}>
            <span>{text.userViewLabel}</span>
            <ul>{text.userProblems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
          </div>
          <div className={styles.coreCluster} aria-label={text.coreProblems.join('、')}>
            {text.coreProblems.map((problem, index) => (
              <div className={styles.coreCircle} key={problem}>
                {index === 0 ? (
                  <div className={styles.signalBadges} aria-hidden="true">
                    {text.recognitionSignals.map((signal) => <span key={signal}>{signal}</span>)}
                  </div>
                ) : null}
                <strong>{problem}</strong>
              </div>
            ))}
          </div>
          <div className={styles.problemList}>
            <span>{text.platformViewLabel}</span>
            <ul>{text.platformProblems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}
