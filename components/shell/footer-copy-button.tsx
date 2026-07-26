'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FooterCopyButtonProps {
  readonly value: string;
  readonly channel: 'email' | 'wechat';
  readonly labels: {
    readonly copy: string;
    readonly copied: string;
    readonly failed: string;
  };
  readonly buttonClassName: string;
  readonly feedbackClassName: string;
}

const RESET_DELAY = 1800;

type CopyState = 'idle' | 'copied' | 'failed';

export function FooterCopyButton({
  value,
  channel,
  labels,
  buttonClassName,
  feedbackClassName,
}: FooterCopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const feedback = state === 'idle' ? '' : labels[state];

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copyValue() {
    if (timer.current) clearTimeout(timer.current);

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }

    timer.current = setTimeout(() => setState('idle'), RESET_DELAY);
  }

  return (
    <button
      className={buttonClassName}
      type="button"
      onClick={copyValue}
      aria-label={feedback || labels.copy}
      data-contact-copy={channel}
      data-copy-state={state}
    >
      {state === 'copied' ? (
        <Check
          aria-hidden="true"
          size={18}
          strokeWidth={1.7}
          data-copy-icon="check"
        />
      ) : (
        <Copy
          aria-hidden="true"
          size={18}
          strokeWidth={1.7}
          data-copy-icon="copy"
        />
      )}
      <span className={feedbackClassName} role="status" aria-live="polite">
        {feedback}
      </span>
    </button>
  );
}
