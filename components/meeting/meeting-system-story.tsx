/* eslint-disable @next/next/no-img-element */

import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './meeting-system-story.module.css';

const copy = {
  en: [
    ['In-room chat', '/images/meeting/meeting-chat-1-app-poster.webp', 'Group and private messages stay close to the live conversation.'],
    ['Personal controls', '/images/meeting/meeting-beauty-app-poster.webp', 'Camera adjustments remain available without taking over the meeting.'],
    ['Room governance', '/images/meeting/meeting-safety-app-poster.webp', 'Member information and safety controls stay connected to the active room.'],
  ],
  zh: [
    ['会中聊天', '/images/meeting/meeting-chat-1-app-poster.webp', '群聊与私聊留在当前会议中，不需要离开现场。'],
    ['个人控制', '/images/meeting/meeting-beauty-app-poster.webp', '相机调节随时可用，但不会占据会议主界面。'],
    ['会议管理', '/images/meeting/meeting-safety-app-poster.webp', '成员信息和安全控制从当前会议进入。'],
  ],
} as const;

export function MeetingCapabilityAppendix({ locale }: { readonly locale: Locale }) {
  return (
    <div className={styles.appendixGrid}>
      {copy[locale].map(([title, src, description]) => (
        <figure key={title}>
          <div>
            <img src={withBasePath(src)} alt={title} loading="lazy" decoding="async" />
          </div>
          <figcaption>
            <h3>{title}</h3>
            <p>{description}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
