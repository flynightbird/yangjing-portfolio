import type { Locale } from '@/content/types';

import styles from './meeting-models.module.css';

const stageRows = {
  en: [
    ['Screen Share', 'Shared content', 'Content Focus'],
    ['Whiteboard Open', 'Canvas interaction', 'Workspace Mode'],
    ['Participant Count', 'Equal visibility or speaker priority', 'Gallery / Speaker'],
  ],
  zh: [
    ['屏幕共享', '共享内容', '内容优先'],
    ['白板开启', '白板操作', '白板工作区'],
    ['参会人数变化', '平等展示或发言者优先', '宫格或演讲者模式'],
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
    contextFlow: ['会议状态', '信息重点', '界面布局'],
    contextDetail: [
      '参会者 · 内容 · 角色 · 设备',
      '此刻最重要的是什么？',
      '宫格 · 聚焦 · 工作区 · 信息面板',
    ],
    matrixLabel: '会议舞台状态规则',
    matrixHeaders: ['状态变化', '优先内容', '布局结果'],
    priorityTitle: '竖屏白板的参会者显示顺序',
    priorityIntro: '竖屏仅保留一个参会者画面时，按以下顺序选择显示对象。',
    priorities: [
      '正在发言者',
      '自己',
      '同时开启摄像头和麦克风',
      '已开启摄像头',
      '已开启麦克风',
    ],
    languageTitle: '同一套语言能力，两级控制权限',
    individual: ['个人设置', '实时字幕', '语言与翻译偏好'],
    meeting: ['会议控制', '主持人开启或关闭', '参会者可申请开启'],
    languageSupport: '声源语言 · 翻译 · 双语输出 · 同声传译',
    capabilities: [
      ['分组讨论', '创建小组、分配成员，并管理各讨论组的进行状态。'],
      ['会中聊天', '在会议主界面内支持群聊与私聊。'],
      ['等候室', '分别向参会者和主持人说明等待与准入状态。'],
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
