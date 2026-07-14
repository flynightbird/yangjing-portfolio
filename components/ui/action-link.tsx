'use client';

import {
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type MouseEvent,
} from 'react';

import styles from './action-link.module.css';

type ActionLinkVariant = 'primary' | 'secondary' | 'text';

interface ActionLinkBaseProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'aria-disabled' | 'href'
  > {
  readonly variant?: ActionLinkVariant;
  readonly icon?: LucideIcon;
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
      target,
      variant = 'primary',
      ...anchorProps
    },
    ref,
  ) {
    const DisplayIcon = Icon ?? (external ? ExternalLink : undefined);
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
        href={disabled ? undefined : href}
        target={disabled ? undefined : external ? '_blank' : target}
        rel={disabled ? undefined : external ? secureExternalRel(rel) : rel}
        aria-disabled={disabled ? 'true' : undefined}
        tabIndex={disabled ? -1 : anchorProps.tabIndex}
        onClick={handleClick}
      >
        <span>{children}</span>
        {DisplayIcon ? (
          <DisplayIcon
            className={styles.icon}
            aria-hidden="true"
            size={18}
            strokeWidth={1.75}
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
