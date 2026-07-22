'use client';

import { useEffect, useRef, useState } from 'react';

import { ActionLink } from '@/components/ui/action-link';

import { ProjectMeta } from './project-meta';
import styles from './home.module.css';

type FlagshipFocus = 'call-agent' | 'convo-ai';

interface FlagshipCopy {
  readonly company: string;
  readonly kind: string;
  readonly title: string;
  readonly proposition: string;
  readonly action: string;
}

interface ConvoAiCopy extends FlagshipCopy {
  readonly temporaryNotice: string;
}

interface FlagshipProjectsProps {
  readonly callAgent: {
    readonly copy: FlagshipCopy;
    readonly href: string;
  };
  readonly convoAi: {
    readonly copy: ConvoAiCopy;
    readonly href: string;
  };
}

const secureLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

export function FlagshipProjects({ callAgent, convoAi }: FlagshipProjectsProps) {
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
          <div className={styles.flagshipCopy}>
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
            <ActionLink
              className={`${styles.flagshipCta} ${styles.whiteCta}`}
              href={callAgent.href}
              aria-label={`${callAgent.copy.action} ${callAgent.copy.title}`}
              data-page-transition-tone="dark"
              data-cta-treatment="white"
              variant="primary"
            >
              {callAgent.copy.action}
            </ActionLink>
          </div>

          <a
            className={`${styles.flagshipMedia} ${styles.flagshipCallMedia}`}
            href={callAgent.href}
            aria-label="Open Call Agent project media"
            data-media-radius="20"
            data-page-transition-tone="dark"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.flagshipCallImage}
              src="/images/call-agent/ai-preview-live.png"
              width={2934}
              height={1466}
              alt="Call Agent configuration next to a live call preview with runtime feedback"
            />
          </a>
        </article>

        <article
          className={styles.flagshipProject}
          data-project-id="convo-ai"
          data-project-kind="live-launch"
          data-publication-state="temporary-media"
          onPointerEnter={() => selectProject('convo-ai')}
          onFocus={() => selectProject('convo-ai')}
        >
          <div className={styles.flagshipCopy}>
            <ProjectMeta
              companyId="agora"
              company={convoAi.copy.company}
              kind={convoAi.copy.kind}
            />
            <a
              className={styles.flagshipTitleLink}
              href={convoAi.href}
              aria-label={`View ${convoAi.copy.title} project`}
              {...secureLinkProps}
            >
              <h2>{convoAi.copy.title}</h2>
            </a>
            <p className={styles.flagshipSummary}>{convoAi.copy.proposition}</p>
            <ActionLink
              className={`${styles.flagshipCta} ${styles.whiteCta}`}
              href={convoAi.href}
              aria-label={`${convoAi.copy.action} ${convoAi.copy.title}`}
              data-cta-treatment="white"
              variant="primary"
              external
              externalLabel="(opens in a new tab)"
              {...secureLinkProps}
            >
              {convoAi.copy.action}
            </ActionLink>
          </div>

          <a
            className={`${styles.flagshipMedia} ${styles.flagshipConvoMedia}`}
            href={convoAi.href}
            aria-label="Open ConvoAI project media"
            data-media-radius="20"
            {...secureLinkProps}
          >
            {/* Temporary third-party placeholders; provenance is documented in evidence/convo-ai. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.flagshipConvoWeb}
              src="/images/convo-ai/temporary-web.webp"
              alt="Temporary ConvoAI web interface placeholder"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.flagshipConvoPhone}
              src="/images/convo-ai/temporary-app.webp"
              alt="Temporary ConvoAI app interface placeholder"
            />
          </a>
          <p className={styles.flagshipSource}>{convoAi.copy.temporaryNotice}</p>
        </article>
      </div>
    </div>
  );
}
