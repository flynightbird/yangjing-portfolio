import type { ReactNode } from 'react';

import { EvidenceFigure } from '@/components/case-study/evidence-figure';
import type { Locale } from '@/content/types';

import styles from './xuelang-evidence.module.css';
import { XuelangCourseEntry } from './xuelang-course-entry';
import { XuelangInteractionBoard } from './xuelang-interaction-board';
import { XuelangWipeComparison } from './xuelang-wipe-comparison';

interface XuelangFigureProps {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly label: string;
  readonly caption: string;
  readonly locale: Locale;
  readonly emphasis?: 'standard' | 'wide';
}

export function XuelangFigure({
  emphasis = 'standard',
  ...figure
}: XuelangFigureProps) {
  return (
    <EvidenceFigure
      {...figure}
      className={`${styles.figure} ${styles[emphasis]}`}
    />
  );
}

interface EvidenceGroupProps {
  readonly children: ReactNode;
  readonly variant?: 'primary-pair' | 'sequence' | 'experiment';
}

export function XuelangEvidenceGroup({
  children,
  variant = 'primary-pair',
}: EvidenceGroupProps) {
  return <div className={`${styles.group} ${styles[variant]}`}>{children}</div>;
}

interface StandardStep {
  readonly title: string;
  readonly description: string;
}

export function XuelangStandardMap({
  label,
  steps,
}: {
  readonly label: string;
  readonly steps: readonly StandardStep[];
}) {
  return (
    <ol className={styles.standardMap} aria-label={label}>
      {steps.map((step, index) => (
        <li key={step.title}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{step.title}</strong>
          <p>{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

export function XuelangDecisionResult({
  label,
  value,
  description,
}: {
  readonly label: string;
  readonly value: string;
  readonly description: string;
}) {
  return (
    <aside className={styles.decisionResult} aria-label={label}>
      <span>EXPERIMENT SIGNAL</span>
      <strong>{value}</strong>
      <p>{description}</p>
    </aside>
  );
}

interface ComparisonImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly label: string;
  readonly caption: string;
}

interface EvidenceAnnotation {
  readonly title: string;
  readonly description: string;
}

export function XuelangEvidenceStory({
  locale,
  label,
  title,
  description,
  annotations,
  primary,
  supporting = [],
  variant = 'standard',
}: {
  readonly locale: Locale;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly annotations: readonly EvidenceAnnotation[];
  readonly primary: ComparisonImage;
  readonly supporting?: readonly ComparisonImage[];
  readonly variant?: 'standard' | 'experiment' | 'learning' | 'result';
}) {
  return (
    <div
      className={`${styles.evidenceStory} ${styles[`story-${variant}`]}`}
      data-evidence-story
      data-story-variant={variant}
    >
      <div className={styles.storyCopy}>
        <span>{label}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <ol>
          {annotations.map((annotation, index) => (
            <li key={annotation.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{annotation.title}</strong>
                <p>{annotation.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.storyMedia}>
        <div className={styles.storyPrimary}>
          <XuelangFigure {...primary} locale={locale} />
        </div>
        {supporting.length ? (
          <div className={styles.storySupporting}>
            {supporting.map((image) => (
              <XuelangFigure key={image.src} {...image} locale={locale} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function XuelangDarkComparison({
  locale,
  title,
  before,
  after,
}: {
  readonly locale: Locale;
  readonly title: string;
  readonly before: ComparisonImage;
  readonly after: ComparisonImage;
}) {
  const controlLabel = locale === 'zh'
    ? '拖动比较旧版与新版'
    : 'Drag to compare before and after';

  return (
    <div
      className={styles.darkComparison}
      data-xuelang-dark-stage
      data-testid="xuelang-dark-stage"
    >
      <p>{title}</p>
      <XuelangWipeComparison
        before={before}
        after={after}
        controlLabel={controlLabel}
      />
    </div>
  );
}

interface LearningState {
  readonly index: string;
  readonly title: string;
  readonly description: string;
  readonly image?: ComparisonImage;
  readonly courseEntry?: boolean;
  readonly interactionBoard?: boolean;
}

export function XuelangLearningSequence({
  locale,
  thesis,
  states,
}: {
  readonly locale: Locale;
  readonly thesis: string;
  readonly states: readonly LearningState[];
}) {
  return (
    <div className={styles.learningSequence} data-learning-sequence>
      <div className={styles.learningThesis} data-learning-thesis>
        <span>CONTINUOUS LEARNING</span>
        <p>{thesis}</p>
      </div>
      <div className={styles.learningStates}>
        {states.map((state) => (
          <article
            key={state.index}
            data-learning-state
            data-learning-compact={
              state.image || state.courseEntry || state.interactionBoard ? undefined : true
            }
            data-testid="learning-state"
          >
            <span>{state.index}</span>
            <h3>{state.title}</h3>
            <p>{state.description}</p>
            {state.courseEntry ? (
              <XuelangCourseEntry locale={locale} />
            ) : state.interactionBoard ? (
              <XuelangInteractionBoard locale={locale} />
            ) : state.image ? (
              <XuelangFigure {...state.image} locale={locale} />
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

interface ResultMetric {
  readonly value: string;
  readonly label: string;
}

export function XuelangResults({
  label,
  metrics,
  note,
}: {
  readonly label: string;
  readonly metrics: readonly ResultMetric[];
  readonly note: string;
}) {
  return (
    <div className={styles.results} aria-label={label}>
      <div className={styles.metricList} data-result-list>
        {metrics.map((metric, index) => (
          <div
            key={`${metric.value}:${metric.label}`}
            data-result-metric
            data-result-summary={
              metrics.length === 4 && index === metrics.length - 1
                ? true
                : undefined
            }
          >
            <strong>{metric.value}</strong>
            <p>{metric.label}</p>
          </div>
        ))}
      </div>
      <p className={styles.resultNote}>{note}</p>
    </div>
  );
}
