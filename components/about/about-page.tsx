import type { ReactNode } from 'react';

import type { Locale } from '@/content/types';

import styles from './about-page.module.css';

interface AboutPageProps {
  readonly locale: Locale;
}

interface Capability {
  readonly tone: 'ux' | 'ui' | 'ai' | 'leadership';
  readonly label: string;
  readonly title: string;
  readonly description: string;
}

interface TimelineEntry {
  readonly tone: Capability['tone'];
  readonly date: string;
  readonly title: string;
  readonly company: string;
  readonly role: string;
}

const copy = {
  en: {
    eyebrow: 'Product Designer · AI & Real-Time Experiences',
    title: ['AI-native product designer.', 'Product judgment, made tangible.'],
    intro:
      'I use strong UI and UX craft to untangle complex product problems, then turn ideas into interactive, testable experiences.',
    stats: [
      ['Experience', '15+ years in product design'],
      ['Leadership', '5 years in design leadership'],
      ['Now', 'Agora · AI & real-time'],
    ],
    capabilityEyebrow: 'Four working modes',
    capabilityTitle: 'The design problems I solve',
    capabilityIntro:
      'From complex UX and visual craft to AI-native building and design leadership.',
    capabilities: [
      {
        tone: 'ux',
        label: 'UX / Complexity',
        title: 'Make complexity feel clear',
        description: 'Research, information architecture & complex flows.',
      },
      {
        tone: 'ui',
        label: 'UI / Systems',
        title: 'Expressive interfaces',
        description: 'Interface design, motion, systems & quality.',
      },
      {
        tone: 'ai',
        label: 'AI / Design + Build',
        title: 'Design and build, as one workflow.',
        description: 'Prompt, prototype and validate without leaving the flow.',
      },
      {
        tone: 'leadership',
        label: 'Design Leadership',
        title: 'Make design a team capability',
        description: 'Direction, systems, quality, collaboration & teams.',
      },
    ] satisfies Capability[],
    evidenceEyebrow: 'Impact, scoped honestly',
    evidenceTitle: 'Design value, beyond the screen',
    evidenceIntro:
      'Business outcomes, range and clear boundaries show how design moves into reality.',
    evidence: [
      ['Business outcomes', 'Alibaba app redesign: MAU +45%', 'Website upgrade: retention +35%'],
      ['Range', 'Consumer, B2B & SaaS', 'AI & real-time products'],
      [
        'Build boundary',
        'Independent experience validation',
        'Rapidly build interactive HTML with product logic using Codex and Claude.',
      ],
    ],
    careerEyebrow: 'Five chapters',
    careerTitle: 'Step by step, to where I am now',
    careerIntro:
      'From user research and complex UX to design leadership and AI-native experiences.',
    timeline: [
      {
        tone: 'ux',
        date: '2010–2016',
        title: 'Research & Interaction',
        company: 'ZTE · 99bill',
        role: 'User research & mobile UX',
      },
      {
        tone: 'ui',
        date: '2016–2019',
        title: 'Design Leadership',
        company: 'Tongcheng Travel · Finance',
        role: 'UED Design Lead',
      },
      {
        tone: 'ai',
        date: '2019–2021',
        title: 'Complex Products',
        company: 'Alibaba · TDesign',
        role: 'Experience Design',
      },
      {
        tone: 'leadership',
        date: '2021.07–2022.07',
        title: 'Team & Quality',
        company: 'ByteDance',
        role: 'Interaction Lead',
      },
      {
        tone: 'ux',
        date: '2022.07–Present',
        title: 'AI & Real-Time',
        company: 'Agora',
        role: 'Product Designer',
      },
    ] satisfies TimelineEntry[],
    educationLabel: 'Education',
    education: 'Shanghai Jiao Tong University · Master’s, Design & Art',
  },
  zh: {
    eyebrow: '产品设计师 · AI 与实时互动体验',
    title: ['AI 原生产品设计师，', '让产品判断成为可体验的现实。'],
    intro: '以扎实的 UI 与 UX 能力梳理复杂产品问题，再把想法转化为可交互、可验证的体验。',
    stats: [
      ['经验', '15+ 年产品设计经验'],
      ['领导力', '5 年设计领导经验'],
      ['现在', '声网 Agora · AI 与实时互动'],
    ],
    capabilityEyebrow: '四种工作方式',
    capabilityTitle: '我解决的设计问题',
    capabilityIntro: '覆盖复杂 UX、视觉表达、AI 原生构建与设计领导力。',
    capabilities: [
      {
        tone: 'ux',
        label: 'UX / 复杂度',
        title: '让复杂体验变得清晰',
        description: '研究、信息架构与复杂流程。',
      },
      {
        tone: 'ui',
        label: 'UI / 系统',
        title: '建立有表达力的界面',
        description: '界面、动效、系统与品质。',
      },
      {
        tone: 'ai',
        label: 'AI / 设计 + 构建',
        title: '把设计与构建连成一个工作流',
        description: '提示、原型与体验验证，始终保持设计闭环。',
      },
      {
        tone: 'leadership',
        label: '设计领导力',
        title: '让设计成为团队能力',
        description: '方向、机制、品质、协作与团队。',
      },
    ] satisfies Capability[],
    evidenceEyebrow: '真实价值与清晰边界',
    evidenceTitle: '设计价值，不止于屏幕',
    evidenceIntro: '业务结果、能力跨度与明确边界，说明设计如何进入真实世界。',
    evidence: [
      ['业务结果', '阿里 App 改版：MAU +45%', '官网升级：留存 +35%'],
      ['能力跨度', 'C 端、B 端与 SaaS', 'AI 与实时互动产品'],
      ['构建边界', '可独立完成体验验证', '通过 Codex、Claude 快速搭建涵盖产品逻辑的交互式 HTML'],
    ],
    careerEyebrow: '五段经历',
    careerTitle: '一步一步，走到现在',
    careerIntro: '从用户研究与复杂 UX，到设计领导力与 AI 原生体验。',
    timeline: [
      {
        tone: 'ux',
        date: '2010–2016',
        title: '研究与交互',
        company: '中兴 · 快钱',
        role: '用户研究与移动 UX',
      },
      {
        tone: 'ui',
        date: '2016–2019',
        title: '设计领导力',
        company: '同程旅行 · 金融',
        role: 'UED 设计负责人',
      },
      {
        tone: 'ai',
        date: '2019–2021',
        title: '复杂产品',
        company: '阿里巴巴·躺平设计家',
        role: '体验设计',
      },
      {
        tone: 'leadership',
        date: '2021.07–2022.07',
        title: '团队与品质',
        company: '字节跳动',
        role: '交互设计负责人',
      },
      {
        tone: 'ux',
        date: '2022.07–至今',
        title: 'AI 与实时互动',
        company: '声网 Agora',
        role: '产品设计师',
      },
    ] satisfies TimelineEntry[],
    educationLabel: '教育经历',
    education: '上海交通大学 · 设计艺术学硕士',
  },
} as const;

function CapabilityOrbit() {
  return (
    <div
      className={styles.orbitFrame}
      aria-hidden="true"
      data-about-orbit-background="/images/about/about-hero-blue-bg.png"
      data-orbit-material="ice-glass"
    >
      <svg className={styles.orbit} viewBox="0 0 440 440" role="presentation">
        <circle className={styles.orbitRing} cx="220" cy="220" r="162" />
        <g className={styles.orbitMarker}>
          <circle cx="220" cy="58" r="5" />
        </g>
        <g className={styles.orbitLines}>
          <line x1="220" y1="220" x2="335" y2="105" />
          <line x1="220" y1="220" x2="335" y2="335" />
          <line x1="220" y1="220" x2="105" y2="335" />
          <line x1="220" y1="220" x2="105" y2="105" />
        </g>
        <circle className={styles.orbitHalo} cx="220" cy="220" r="86" />
        <circle className={styles.orbitHub} cx="220" cy="220" r="49" />
        <text className={styles.orbitMonogram} x="220" y="216">YJ</text>
        <text className={styles.orbitYears} x="220" y="236">15+ YEARS</text>
        <OrbitNode x={335} y={105} label="UX" caption="COMPLEXITY" tone="ux" />
        <OrbitNode x={335} y={335} label="UI" caption="SYSTEMS" tone="ui" />
        <OrbitNode x={105} y={335} label="AI" caption="PROTOTYPE" tone="ai" />
        <OrbitNode x={105} y={105} label="LEAD" caption="DIRECTION" tone="leadership" />
      </svg>
    </div>
  );
}

function OrbitNode({
  x,
  y,
  label,
  caption,
  tone,
}: {
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly caption: string;
  readonly tone: Capability['tone'];
}) {
  const captionY = y < 220 ? y + 50 : y + 51;
  return (
    <g className={styles[`orbitNode${tone}`]}>
      <circle cx={x} cy={y} r="32" />
      <text className={styles.orbitNodeLabel} x={x} y={y + 4}>{label}</text>
      <text className={styles.orbitCaption} x={x} y={captionY}>{caption}</text>
    </g>
  );
}

function CapabilityGraphic({ tone }: { readonly tone: Capability['tone'] }) {
  if (tone === 'ux') {
    return (
      <svg viewBox="0 0 300 110" role="presentation">
        <line className={styles.graphGuide} x1="14" y1="55" x2="286" y2="55" />
        <path className={styles.graphMuted} d="M24 55H84" />
        <path className={styles.graphMuted} d="M101 55C131 55 131 26 161 26" />
        <path className={styles.graphMuted} d="M101 55C131 55 131 84 161 84" />
        <path className={styles.graphMuted} d="M177 26C207 26 207 55 233 55" />
        <path className={styles.graphMuted} d="M177 84C207 84 207 55 233 55" />
        <line className={styles.graphMutedSoft} x1="26" y1="49" x2="26" y2="61" />
        <circle className={styles.graphSolid} cx="16" cy="55" r="5.5" />
        <circle className={styles.graphSurface} cx="93" cy="55" r="8.5" />
        <circle className={styles.graphSurfaceSoft} cx="169" cy="26" r="6" />
        <circle className={styles.graphSurfaceSoft} cx="169" cy="84" r="6" />
        <circle className={styles.graphPulse} cx="248" cy="55" r="19" />
        <circle className={styles.graphSolid} cx="248" cy="55" r="10" />
      </svg>
    );
  }

  if (tone === 'ui') {
    return (
      <svg viewBox="0 0 260 110" role="presentation">
        <rect className={styles.graphMutedSoft} x="10" y="8" width="240" height="94" rx="6" />
        <line className={styles.graphMutedSoft} x1="10" y1="28" x2="250" y2="28" />
        <circle className={styles.graphSolidSoft} cx="22" cy="18" r="2.4" />
        <circle className={styles.graphSolidSoft} cx="32" cy="18" r="2.4" />
        <circle className={styles.graphSolidSoft} cx="42" cy="18" r="2.4" />
        <rect className={styles.graphFillSoft} x="20" y="40" width="52" height="52" rx="4" />
        <rect className={styles.graphFillStrong} x="84" y="40" width="150" height="22" rx="4" />
        <rect className={styles.graphFillMuted} x="84" y="68" width="100" height="10" rx="3" />
        <rect className={styles.graphFillMuted} x="84" y="82" width="130" height="10" rx="3" />
        <line className={styles.graphGuideStrong} x1="84" y1="8" x2="84" y2="102" />
        <line className={styles.graphGuideStrong} x1="20" y1="40" x2="250" y2="40" />
      </svg>
    );
  }

  if (tone === 'ai') {
    return (
      <svg viewBox="0 0 260 110" role="presentation" data-ai-workflow="continuous-signal">
        <g className={styles.workflowSystem} data-workflow-system="judgment">
          <rect className={styles.workflowSystemFrame} x="6" y="21" width="60" height="68" rx="9" />
          <path className={styles.workflowSystemGrid} d="M6 39h60M26 21v68" />
          <rect className={styles.workflowModuleSoft} x="34" y="49" width="22" height="6" rx="3" />
          <rect className={styles.workflowModule} x="34" y="61" width="14" height="6" rx="3" />
          <circle className={styles.workflowModule} cx="55" cy="64" r="3" />
        </g>

        <path
          className={styles.workflowReturn}
          d="M194 77C171 101 89 101 66 77"
        />
        <path
          className={styles.workflowTrack}
          d="M66 55C83 55 87 31 104 31S128 79 146 79 170 55 194 55"
        />
        <path
          className={styles.workflowSignal}
          d="M66 55C83 55 87 31 104 31S128 79 146 79 170 55 194 55"
          data-workflow-path
        />

        {[
          [66, 55],
          [104, 31],
          [146, 79],
          [194, 55],
        ].map(([x, y], index) => (
          <g className={styles.workflowNode} key={`${x}-${y}`} style={{ animationDelay: `${index * 0.34}s` }}>
            <circle cx={x} cy={y} r="5.5" />
            <circle className={styles.workflowNodeCore} cx={x} cy={y} r="1.8" />
          </g>
        ))}

        <g className={styles.workflowSystem} data-workflow-system="resolved">
          <rect className={styles.workflowSystemFrame} x="194" y="21" width="60" height="68" rx="9" />
          <path className={styles.workflowSystemGrid} d="M194 39h60M214 21v68" />
          <rect className={styles.workflowModule} x="222" y="49" width="22" height="6" rx="3" />
          <rect className={styles.workflowModuleSoft} x="222" y="61" width="14" height="6" rx="3" />
          <circle className={styles.workflowModuleSoft} cx="243" cy="64" r="3" />
          <rect className={styles.workflowModule} x="222" y="73" width="10" height="6" rx="3" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 260 120" role="presentation">
      <path className={styles.graphMutedSoft} d="m130 60 37-37m-37 37 37 37m-37-37-37 37m37-37-37-37" />
      {[
        [167, 23, 'DIR'],
        [167, 97, 'SYS'],
        [93, 97, 'QLT'],
        [93, 23, 'COL'],
      ].map(([x, y, label]) => (
        <g key={label}>
          <circle className={styles.graphSurfaceSoft} cx={x} cy={y} r="19" />
          <text x={x} y={Number(y) + 3}>{label}</text>
        </g>
      ))}
      <circle className={styles.graphSolid} cx="130" cy="60" r="22" />
      <circle className={styles.graphPulse} cx="130" cy="60" r="27" />
      <text className={styles.graphInverse} x="130" y="63">LEAD</text>
    </svg>
  );
}

function SectionHeading({
  eyebrow,
  title,
  intro,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
}) {
  return (
    <header className={styles.sectionHeading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      <p className={styles.sectionIntro}>{intro}</p>
    </header>
  );
}

function SectionBand({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <section className={[styles.band, className].filter(Boolean).join(' ')}>
      <div className={styles.inner}>{children}</div>
    </section>
  );
}

export function AboutPage({ locale }: AboutPageProps) {
  const content = copy[locale];
  const title = content.title.join(locale === 'zh' ? '' : ' ');

  return (
    <article className={styles.root} data-about-page data-locale={locale}>
      <SectionBand className={styles.heroBand}>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h1 aria-label={title}>
              {content.title.map((line) => <span key={line}>{line}</span>)}
            </h1>
            <p className={styles.heroIntro}>{content.intro}</p>
            <dl className={styles.stats}>
              {content.stats.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <CapabilityOrbit />
        </div>
      </SectionBand>

      <SectionBand>
        <div data-about-capabilities>
          <SectionHeading
            eyebrow={content.capabilityEyebrow}
            title={content.capabilityTitle}
            intro={content.capabilityIntro}
          />
          <div className={styles.capabilityGrid}>
            {content.capabilities.map((capability) => (
              <article
                key={capability.tone}
                className={styles.capabilityCard}
                data-tone={capability.tone}
                data-card-visual="reference-b"
              >
                <span
                  className={`${styles.cardCorner} ${styles.cardCornerTopLeft}`}
                  data-card-corner="top-left"
                  aria-hidden="true"
                />
                <span
                  className={`${styles.cardCorner} ${styles.cardCornerBottomRight}`}
                  data-card-corner="bottom-right"
                  aria-hidden="true"
                />
                <div className={styles.cardHeader}>
                  <p className={styles.cardLabel}>{capability.label}</p>
                  <h3>{capability.title}</h3>
                </div>
                <div className={styles.cardGraphic} aria-hidden="true">
                  <CapabilityGraphic tone={capability.tone} />
                </div>
                <p className={styles.cardDescription}>{capability.description}</p>
              </article>
            ))}
          </div>
        </div>
      </SectionBand>

      <SectionBand className={styles.evidenceBand}>
        <SectionHeading
          eyebrow={content.evidenceEyebrow}
          title={content.evidenceTitle}
          intro={content.evidenceIntro}
        />
        <div className={styles.evidenceGrid}>
          {content.evidence.map(([label, primary, secondary], index) => (
            <article key={label} data-index={index}>
              <span aria-hidden="true" />
              <p>{label}</p>
              <h3>{primary}</h3>
              <p>{secondary}</p>
            </article>
          ))}
        </div>
      </SectionBand>

      <SectionBand className={styles.careerBand}>
        <SectionHeading
          eyebrow={content.careerEyebrow}
          title={content.careerTitle}
          intro={content.careerIntro}
        />
        <ol className={styles.timeline} data-about-timeline>
          {content.timeline.map((entry) => (
            <li key={entry.date} data-tone={entry.tone}>
              <span className={styles.timelineDot} aria-hidden="true" />
              <time>{entry.date}</time>
              <h3>{entry.title}</h3>
              <p>{entry.company}</p>
              <p>{entry.role}</p>
            </li>
          ))}
        </ol>
        <div className={styles.education}>
          <p>{content.educationLabel}</p>
          <p>{content.education}</p>
        </div>
      </SectionBand>
    </article>
  );
}
