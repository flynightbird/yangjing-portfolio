'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';

import { ActionLink } from '@/components/ui/action-link';
import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

import { ConvoAiStudioWindow } from './convo-ai-studio-window';
import { ProjectMeta } from './project-meta';
import styles from './home.module.css';

type FlagshipFocus = 'call-agent' | 'convo-ai';

interface FlagshipCopy {
  readonly company: string;
  readonly kind: string;
  readonly title: string;
  readonly proposition: string;
  readonly role: string;
  readonly action: string;
}

interface FlagshipProjectsProps {
  readonly locale: Locale;
  readonly callAgent: {
    readonly copy: FlagshipCopy;
    readonly href: string;
  };
  readonly convoAi: {
    readonly copy: FlagshipCopy;
    readonly href: string;
  };
}

export function FlagshipProjects({ locale, callAgent, convoAi }: FlagshipProjectsProps) {
  const [focus, setFocus] = useState<FlagshipFocus>('call-agent');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelReset = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = null;
  };

  const selectProject = (project: FlagshipFocus) => {
    cancelReset();
    setFocus(project);
  };

  const scheduleReset = () => {
    cancelReset();
    resetTimer.current = setTimeout(() => setFocus('call-agent'), 220);
  };

  const updateStudioDrift = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    event.currentTarget.style.setProperty('--studio-drift-x', `${(x * 8).toFixed(2)}px`);
    event.currentTarget.style.setProperty('--studio-drift-y', `${(y * 6).toFixed(2)}px`);
  };

  const resetStudioDrift = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--studio-drift-x', '0px');
    event.currentTarget.style.setProperty('--studio-drift-y', '0px');
  };

  useEffect(() => cancelReset, []);

  return (
    <div
      className={styles.flagshipStage}
      data-flagship-focus={focus}
      data-project-chapter="ai-products"
      onPointerLeave={scheduleReset}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) scheduleReset();
      }}
    >
      <div className={styles.flagshipGrid}>
        <article
          className={styles.flagshipProject}
          data-project-id="call-agent"
          data-project-kind="deep-case"
          onPointerEnter={() => selectProject('call-agent')}
          onFocus={() => selectProject('call-agent')}
        >
          <div className={styles.flagshipCopy} data-scroll-reveal-group="text">
            <ProjectMeta
              companyId="agora"
              company={callAgent.copy.company}
              kind={callAgent.copy.kind}
            />
            <a
              className={styles.flagshipTitleLink}
              href={callAgent.href}
              aria-label={`View ${callAgent.copy.title} case study`}
              data-page-transition-tone="dark"
            >
              <h2>{callAgent.copy.title}</h2>
            </a>
            <p className={styles.flagshipSummary}>{callAgent.copy.proposition}</p>
            <p className={styles.flagshipRole}>{callAgent.copy.role}</p>
            <ActionLink
              className={`${styles.flagshipCta} ${styles.whiteCta} ${styles.homeProjectCta}`}
              href={callAgent.href}
              aria-label={`${callAgent.copy.action} ${callAgent.copy.title}`}
              data-page-transition-tone="dark"
              data-cta-treatment="white"
              data-home-project-cta
              variant="primary"
            >
              {callAgent.copy.action}
            </ActionLink>
          </div>

          <div
            className={`${styles.flagshipMedia} ${styles.flagshipCallMedia}`}
            data-media-radius="20"
            data-scroll-reveal-group="media"
            onPointerMove={updateStudioDrift}
            onPointerLeave={resetStudioDrift}
          >
            <ConvoAiStudioWindow locale={locale} />
            <a
              className={styles.flagshipMediaLink}
              href={callAgent.href}
              aria-label="Open Call Agent project media"
              data-page-transition-tone="dark"
            />
          </div>
        </article>

        <article
          className={styles.flagshipProject}
          data-project-id="convo-ai"
          data-project-kind="deep-case"
          onPointerEnter={() => selectProject('convo-ai')}
          onFocus={() => selectProject('convo-ai')}
        >
          <div className={styles.flagshipCopy} data-scroll-reveal-group="text">
            <ProjectMeta
              companyId="agora"
              company={convoAi.copy.company}
              kind={convoAi.copy.kind}
            />
            <a
              className={styles.flagshipTitleLink}
              href={convoAi.href}
              aria-label={`View ${convoAi.copy.title} project`}
              data-page-transition-tone="dark"
            >
              <h2>{convoAi.copy.title}</h2>
            </a>
            <p className={styles.flagshipSummary}>{convoAi.copy.proposition}</p>
            <p className={styles.flagshipRole}>{convoAi.copy.role}</p>
            <ActionLink
              className={`${styles.flagshipCta} ${styles.whiteCta} ${styles.homeProjectCta}`}
              href={convoAi.href}
              aria-label={`${convoAi.copy.action} ${convoAi.copy.title}`}
              data-cta-treatment="white"
              data-home-project-cta
              variant="primary"
              data-page-transition-tone="dark"
            >
              {convoAi.copy.action}
            </ActionLink>
          </div>

          <a
            className={`${styles.flagshipMedia} ${styles.flagshipConvoMedia}`}
            href={convoAi.href}
            aria-label="Open ConvoAI project media"
            data-media-radius="20"
            data-page-transition-tone="dark"
            data-scroll-reveal-group="media"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.flagshipConvoWeb}
              src={withBasePath('/images/convo-ai/figma/web-ready.png')}
              alt="ConvoAI web conversation ready state"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.flagshipConvoPhone}
              src={withBasePath('/images/convo-ai/figma/avatar-video.png')}
              alt="ConvoAI app avatar and live video state"
            />
          </a>
        </article>
      </div>
    </div>
  );
}
