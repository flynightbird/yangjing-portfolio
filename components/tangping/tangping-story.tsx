import type { Locale } from '@/content/types';
import {
  tangpingFrames,
  type TangpingCopyGroup,
  type TangpingFrame,
} from '@/content/tangping';

import { TangpingFrameReveal } from './tangping-frame-reveal';
import styles from './tangping-story.module.css';

interface TangpingStoryProps {
  readonly locale: Locale;
}

function CopyGroup({ group, className }: { readonly group: TangpingCopyGroup; readonly className?: string }) {
  return (
    <section className={className} data-copy-group>
      <h3>{group.label}</h3>
      <ul>
        {group.items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function StandardCopy({ frame, locale }: { readonly frame: TangpingFrame; readonly locale: Locale }) {
  const copy = frame.copy[locale];
  const bodyCount = frame.layout === 'background' ? 2 : frame.layout === 'personas' ? 1 : copy.groups.length;

  return (
    <div className={styles.copy}>
      <h2 className={styles.title} data-reveal-layer="title">{copy.title}</h2>
      <div className={styles.body} data-reveal-layer="body">
        {copy.groups.slice(0, bodyCount).map((group) => (
          <CopyGroup key={group.label} group={group} />
        ))}
      </div>
      <div
        className={styles.labels}
        data-reveal-layer="labels"
        data-persona-grid={frame.layout === 'personas' ? 'true' : undefined}
      >
        {copy.groups.slice(bodyCount).map((group) => (
          <CopyGroup key={group.label} group={group} />
        ))}
      </div>
    </div>
  );
}

function LegendGroup({ group }: { readonly group: TangpingCopyGroup }) {
  return (
    <section className={styles.legend} data-copy-group>
      <h3>{group.label}</h3>
      <ul>
        {group.items.map((item, index) => (
          <li key={`${index}-${item}`}>
            <span data-legend-swatch aria-hidden="true">{index === 1 ? '字' : ''}</span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function NeedsMatrixCopy({ frame, locale }: { readonly frame: TangpingFrame; readonly locale: Locale }) {
  const copy = frame.copy[locale];
  const [model, legend, roles, ...rows] = copy.groups;

  return (
    <div className={styles.copy}>
      <h2 className={styles.title} data-reveal-layer="title">{copy.title}</h2>
      <div className={styles.body} data-reveal-layer="body">
        <CopyGroup group={model} />
      </div>
      <div className={styles.labels} data-reveal-layer="labels">
        <LegendGroup group={legend} />
        <CopyGroup group={roles} className={styles.roles} />
        <div className={styles.matrix}>
          {rows.map((group) => (
            <CopyGroup key={group.label} group={group} className={styles.matrixRow} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TangpingStory({ locale }: TangpingStoryProps) {
  return (
    <div className={styles.story} data-tangping-story data-locale={locale}>
      {tangpingFrames.map((frame) => (
        <TangpingFrameReveal
          key={frame.id}
          className={styles.frame}
          frameId={frame.id}
          layout={frame.layout}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.artwork}
            src={frame.image.src}
            width={frame.image.width}
            height={frame.image.height}
            alt={`${frame.copy[locale].title} ${locale === 'zh' ? '视觉画面' : 'visual artwork'}`}
          />
          {frame.layout === 'needs-matrix' ? (
            <NeedsMatrixCopy frame={frame} locale={locale} />
          ) : (
            <StandardCopy frame={frame} locale={locale} />
          )}
        </TangpingFrameReveal>
      ))}
    </div>
  );
}
