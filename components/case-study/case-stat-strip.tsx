import styles from './case-stat-strip.module.css';

export type CaseStatDensity = 'short' | 'medium' | 'long';

export interface CaseStatItem {
  readonly label: string;
  readonly value: string;
}

export interface CaseStatStripProps {
  readonly label: string;
  readonly items: readonly CaseStatItem[];
  readonly className?: string;
}

export function getCaseStatDensity(value: string): CaseStatDensity {
  const length = Array.from(value.trim()).length;

  if (length <= 10) return 'short';
  if (length <= 20) return 'medium';
  return 'long';
}

export function CaseStatStrip({ label, items, className }: CaseStatStripProps) {
  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')} data-case-stat-strip>
      <dl className={styles.list} aria-label={label}>
        {items.map((item) => {
          const density = getCaseStatDensity(item.value);

          return (
            <div
              key={`${item.label}:${item.value}`}
              className={styles.item}
              data-stat-density={density}
            >
              <dt className={styles.label}>{item.label}</dt>
              <dd className={styles.value}>{item.value}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
