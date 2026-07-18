import type { Locale } from '@/content/types';

import styles from './meeting-models.module.css';

const stageRows = {
  en: [
    ['Screen Share', 'Shared content', 'Content Focus'],
    ['Whiteboard Open', 'Canvas interaction', 'Workspace Mode'],
    ['Participant Count', 'Equal visibility or speaker priority', 'Gallery / Speaker'],
  ],
  zh: [
    ['屏幕共享', '共享内容', '内容聚焦'],
    ['白板开启', '画布交互', '协作工作区'],
    ['参会人数变化', '平等可见或发言优先', '宫格 / 演讲者'],
  ],
} as const;

const copy = {
  en: {
    contextFlow: ['Meeting context', 'Information priority', 'Interface state'],
    contextDetail: [
      'People · content · role · device',
      'What must remain primary now?',
      'Gallery · focus · workspace · information layer',
    ],
    matrixLabel: 'Meeting stage state rules',
    matrixHeaders: ['Trigger', 'Information priority', 'Stage result'],
    priorityTitle: 'Participant view priority',
    priorityIntro: 'When the portrait whiteboard preserves one participant view, the system resolves it in this order.',
    priorities: [
      'Active Speaker',
      'Self',
      'Camera + Microphone',
      'Camera',
      'Microphone',
    ],
    languageTitle: 'One information layer, two control scopes',
    individual: ['Individual control', 'Live Captions', 'Language and translation preference'],
    meeting: ['Meeting-level control', 'Host starts or stops', 'Participant can request'],
    languageSupport: 'Source language · translation · bilingual output · simultaneous interpretation',
    capabilities: [
      ['Breakout Rooms', 'Create groups, assign participants, and manage active-room transitions.'],
      ['In-meeting Chat', 'Keep group and private conversation available beside the live stage.'],
      ['Waiting Room', 'Make entry status and host admission decisions legible to both roles.'],
    ],
  },
  zh: {
    contextFlow: ['会议情境', '信息优先级', '界面状态'],
    contextDetail: [
      '人员 · 内容 · 角色 · 设备',
      '此刻什么必须保持主要？',
      '宫格 · 聚焦 · 工作区 · 信息层',
    ],
    matrixLabel: '会议舞台状态规则',
    matrixHeaders: ['触发条件', '信息优先级', '舞台结果'],
    priorityTitle: '参会者视窗优先级',
    priorityIntro: '竖屏白板保留一个参会者视窗时，系统按以下顺序决定显示对象。',
    priorities: [
      '当前发言人',
      '自己',
      '摄像头 + 麦克风',
      '摄像头',
      '麦克风',
    ],
    languageTitle: '同一信息层，两种控制范围',
    individual: ['个人控制', '实时字幕', '语言与翻译偏好'],
    meeting: ['会议级控制', '主持人开启或停止', '参会者可以申请开启'],
    languageSupport: '声源语言 · 翻译 · 双语输出 · 同声传译',
    capabilities: [
      ['分组讨论', '创建小组、分配参会者，并管理进行中的房间切换。'],
      ['会中聊天', '群聊和私聊与实时会议舞台并存。'],
      ['等候室', '让等待状态和主持人准入决定对双方都清晰可见。'],
    ],
  },
} as const;

export function ContextPriorityModel({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];
  return (
    <figure className={styles.model} aria-label={text.contextFlow.join(' to ')}>
      <div className={styles.contextFlow}>
        {text.contextFlow.map((item, index) => (
          <div key={item} className={styles.contextStep}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{item}</strong>
            <p>{text.contextDetail[index]}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function MeetingStateMatrix({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];
  return (
    <div className={styles.tableWrap}>
      <table className={styles.matrix} aria-label={text.matrixLabel}>
        <thead><tr>{text.matrixHeaders.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>
          {stageRows[locale].map((row) => (
            <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ParticipantPriorityStack({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];
  return (
    <figure className={styles.priority}>
      <figcaption><strong>{text.priorityTitle}</strong><span>{text.priorityIntro}</span></figcaption>
      <ol>{text.priorities.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol>
    </figure>
  );
}

export function LanguageControlModel({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];
  return (
    <figure className={styles.language}>
      <figcaption>{text.languageTitle}</figcaption>
      <div className={styles.languagePaths}>
        {[text.individual, text.meeting].map((path) => (
          <div key={path[0]}>{path.map((item, index) => index === 0 ? <strong key={item}>{item}</strong> : <span key={item}>{item}</span>)}</div>
        ))}
      </div>
      <p>{text.languageSupport}</p>
    </figure>
  );
}

export function CapabilitySystem({ locale }: { readonly locale: Locale }) {
  return (
    <div className={styles.capabilities}>
      {copy[locale].capabilities.map(([title, description], index) => (
        <article key={title}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </article>
      ))}
    </div>
  );
}
