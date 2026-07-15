'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface HeroMotionProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
}

export function HeroMotion({
  children,
  className,
  delay = 0,
}: HeroMotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { y: 18 }}
      animate={{ y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.7,
        delay: reduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
