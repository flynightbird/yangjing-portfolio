import { Brain, Dumbbell, Salad, StretchHorizontal, Waves } from 'lucide-react';

import type { Locale } from '@/content/types';
import { getGrowthBaseTasks } from '@/content/growth-base';

import styles from './growth-base.module.css';

const taskIcons = {
  water: Waves,
  meal: Salad,
  meditation: Brain,
  strength: Dumbbell,
  stretch: StretchHorizontal,
} as const;

export function GrowthBaseTaskFocus({ locale }: { readonly locale: Locale }) {
  return (
    <div className={styles.taskViewport} data-task-viewport>
      <span className={styles.taskViewportLabel}>{locale === 'zh' ? '手机屏幕宽度' : 'PHONE VIEWPORT'}</span>
      <div className={styles.taskTrack}>
        {getGrowthBaseTasks(locale).map((task) => {
          const Icon = taskIcons[task.icon];
          return (
            <article
              className={styles.taskCard}
              data-task-current={task.isCurrent ? 'true' : 'false'}
              data-task-visibility={task.visibility}
              data-testid="growth-base-task"
              key={task.id}
            >
              <Icon aria-hidden="true" size={20} strokeWidth={1.7} />
              <time>{task.time}</time>
              <strong>{task.label}</strong>
              <span>{task.isCurrent ? (locale === 'zh' ? '当前场景' : 'Now') : (locale === 'zh' ? '今日安排' : 'Today')}</span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
