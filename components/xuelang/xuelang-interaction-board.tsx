import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './xuelang-interaction-board.module.css';

const copy = {
  zh: {
    alt: '多种学习界面展示沉浸播放、倍速控制与课时切换',
    label: '学习控制证据',
    caption: '产品画面保持完整，设计判断与行为信号由网页文字独立呈现。',
    items: [
      {
        title: '沉浸与顺滑',
        description: '深色观看状态与亮度、倍速控制保持同一学习语境，减少操作切换带来的打断。',
      },
      {
        title: '碎片学习效率',
        description: '观察到进度条渗透 52.62%、全屏渗透 42.21%、倍速渗透 7.49%，高频控制需要更容易触达。',
      },
      {
        title: '课时切换',
        description: '用户平均每天学习约 5 个课时、36.5 min，高频课时入口帮助更快定位下一段内容。',
      },
    ],
  },
  en: {
    alt: 'Learning interfaces showing immersive playback, speed controls, and lesson switching',
    label: 'Learning-control evidence',
    caption: 'The product canvas stays intact while design rationale and observed signals remain editable HTML.',
    items: [
      {
        title: 'Immersion and smooth control',
        description: 'Dark viewing states keep brightness and playback-speed controls in one learning context, reducing disruptive mode changes.',
      },
      {
        title: 'Efficient fragmented learning',
        description: 'Observed penetration reached 52.62% for progress, 42.21% for fullscreen, and 7.49% for speed control, supporting easier access to frequent actions.',
      },
      {
        title: 'Faster lesson switching',
        description: 'Learners averaged about five lessons and 36.5 min per day, making high-frequency lesson navigation important for locating the next segment.',
      },
    ],
  },
} as const;

export function XuelangInteractionBoard({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];

  return (
    <figure className={styles.board} data-interaction-board>
      <div className={styles.canvas}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.productImage}
          src={withBasePath('/images/xuelang/learning-interaction.webp')}
          alt={text.alt}
        />
        <ol className={styles.rail} aria-label={text.label}>
          {text.items.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <figcaption>{text.caption}</figcaption>
    </figure>
  );
}
