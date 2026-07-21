'use client';

import { type LucideIcon } from 'lucide-react';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type MouseEvent,
} from 'react';

import styles from './action-link.module.css';

type ActionLinkVariant = 'primary' | 'signal' | 'secondary' | 'text';

interface ActionLinkBaseProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'aria-disabled' | 'href'
  > {
  readonly variant?: ActionLinkVariant;
  readonly icon?: LucideIcon;
  readonly showExternalIcon?: boolean;
}

type ActionLinkProps = ActionLinkBaseProps &
  (
    | {
        readonly disabled: true;
        readonly href?: string;
      }
    | {
        readonly disabled?: false;
        readonly href: string;
      }
  ) &
  (
    | {
        readonly external: true;
        readonly externalLabel: string;
      }
    | {
        readonly external?: false;
        readonly externalLabel?: never;
      }
  );

function secureExternalRel(rel: string | undefined): string {
  const values = new Set(rel?.split(/\s+/).filter(Boolean));
  values.add('noopener');
  values.add('noreferrer');
  return [...values].join(' ');
}

export const ActionLink = forwardRef<HTMLAnchorElement, ActionLinkProps>(
  function ActionLink(
    {
      children,
      className,
      disabled = false,
      external = false,
      externalLabel,
      href,
      icon: Icon,
      onClick,
      rel,
      showExternalIcon = true,
      target,
      variant = 'primary',
      ...anchorProps
    },
    ref,
  ) {
    const opensNewTab = !disabled && (external || target === '_blank');
    const showRemixExternalIcon = showExternalIcon && !Icon && opensNewTab;
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    return (
      <a
        {...anchorProps}
        ref={ref}
        className={[styles.root, styles[variant], className]
          .filter(Boolean)
          .join(' ')}
        data-action-variant={variant}
        href={disabled ? undefined : href}
        target={disabled ? undefined : opensNewTab ? '_blank' : target}
        rel={disabled ? undefined : opensNewTab ? secureExternalRel(rel) : rel}
        aria-disabled={disabled ? 'true' : undefined}
        tabIndex={disabled ? -1 : anchorProps.tabIndex}
        onClick={handleClick}
      >
        <span className={styles.label}>{children}</span>
        {Icon ? (
          <Icon
            className={styles.icon}
            aria-hidden="true"
            size={18}
            strokeWidth={1.75}
          />
        ) : null}
        {showRemixExternalIcon ? (
          <span
            className={`${styles.icon} ${styles.remixIcon}`}
            data-remix-icon="arrow-right-up-line"
            aria-hidden="true"
          />
        ) : null}
        {external && externalLabel ? (
          <>
            {' '}
            <span className={styles.srOnly}>{externalLabel}</span>
          </>
        ) : null}
      </a>
    );
  },
);
