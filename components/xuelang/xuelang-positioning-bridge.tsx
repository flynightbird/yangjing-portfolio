import type { Locale } from '@/content/types';

import styles from './xuelang-positioning-bridge.module.css';

const copy = {
  zh: {
    audience: '为“三高”女性',
    prefix: '打造',
    quality: '高品质',
    connector: '的',
    interest: '泛兴趣类',
    suffix: '线上学习平台',
    value: '用户价值',
    stages: [
      {
        layer: '产品层',
        title: '提升转化',
        description: '调整产品方向，升级课程信息框架',
        note: 'Frame structure upgrade',
      },
      {
        layer: '用户层',
        title: '用户粘性',
        description: '优化交互，提升产品体验',
        note: 'Improve product experience',
      },
      {
        layer: '视觉层',
        title: '品质调性',
        description: '升级视觉语言，营造产品氛围',
        note: 'Visual language upgrade',
      },
    ],
  },
  en: {
    audience: 'For women who value life, growth, and quality',
    prefix: 'Build a',
    quality: 'high-quality',
    connector: '',
    interest: 'interest-led',
    suffix: 'online learning platform',
    value: 'Learner value',
    stages: [
      {
        layer: 'Product layer',
        title: 'Improve conversion',
        description: 'Refocus the product and upgrade the course-information framework',
        note: 'Frame structure upgrade',
      },
      {
        layer: 'Experience layer',
        title: 'Build retention',
        description: 'Refine interactions and improve the product experience',
        note: 'Improve product experience',
      },
      {
        layer: 'Visual layer',
        title: 'Express quality',
        description: 'Upgrade the visual language and create a stronger product atmosphere',
        note: 'Visual language upgrade',
      },
    ],
  },
} as const;

function Phase({
  stage,
  index,
}: {
  readonly stage: (typeof copy)[Locale]['stages'][number];
  readonly index: number;
}) {
  return (
    <article className={styles.phase}>
      <div className={styles.phaseIndex}>
        <strong>{String(index + 1).padStart(2, '0')}</strong>
        <span>({stage.layer})</span>
      </div>
      <div className={styles.phaseCopy}>
        <h4>{stage.title}</h4>
        <p>{stage.description}</p>
        <span>{stage.note}</span>
      </div>
    </article>
  );
}

export function XuelangPositioningBridge({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];

  return (
    <section className={styles.root} data-xuelang-positioning-bridge>
      <div className={styles.vision}>
        <p>{text.audience}</p>
        <h3>
          <span>{text.prefix}</span>
          <span><mark>{text.quality}</mark>{text.connector}</span>
          <span className={styles.interestGroup}>
            <mark>{text.interest}</mark>
            <span className={styles.valueLabel}>{text.value}</span>
          </span>
          <span>{text.suffix}</span>
        </h3>
      </div>

      <div className={styles.pathway} aria-label={text.stages.map((stage) => stage.layer).join(' → ')}>
        <div className={styles.pairedStages}>
          <Phase stage={text.stages[0]} index={0} />
          <Phase stage={text.stages[1]} index={1} />
        </div>
        <span className={styles.arrow} aria-hidden="true" />
        <div className={styles.finalStage}>
          <Phase stage={text.stages[2]} index={2} />
        </div>
      </div>
    </section>
  );
}
