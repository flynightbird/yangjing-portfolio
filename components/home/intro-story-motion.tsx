'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import styles from '@/components/home/home.module.css';
import type { Locale } from '@/content/types';

interface IntroScrollTrigger {
  readonly start: number;
  readonly end: number;
  kill: () => void;
}

interface IntroSupportFragment {
  readonly text: string;
  readonly emphasis?: boolean;
}

interface IntroStoryMotionProps {
  readonly locale: Locale;
  readonly label: string;
  readonly navigationLabel: string;
  readonly controlLabel: string;
  readonly scenes: readonly {
    readonly lead: string;
    readonly emphasis: string;
    readonly trail: string;
    readonly support?: readonly IntroSupportFragment[];
  }[];
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const subscribeToReducedMotion = (onStoreChange: () => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }

  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
};

const getReducedMotionSnapshot = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

const getReducedMotionServerSnapshot = () => false;

export function IntroStoryMotion({
  locale,
  label,
  navigationLabel,
  controlLabel,
  scenes,
}: IntroStoryMotionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<IntroScrollTrigger | null>(null);
  const currentSceneRef = useRef(0);
  const reverseJumpRef = useRef(false);
  const [currentScene, setCurrentScene] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;

    if (!section || !pin || typeof window.matchMedia !== 'function') return;

    if (reducedMotion) return;

    let cancelled = false;
    let trigger: IntroScrollTrigger | null = null;
    let removeTweens: (() => void) | null = null;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);
        const sceneNodes = Array.from(
          section.querySelectorAll<HTMLElement>('[data-intro-scene]'),
        );

        const revealScene = (nextScene: number, immediate = false) => {
          const boundedScene = Math.min(scenes.length - 1, Math.max(0, nextScene));
          if (boundedScene === currentSceneRef.current && !immediate) return;

          currentSceneRef.current = boundedScene;
          setCurrentScene(boundedScene);
          gsap.killTweensOf(sceneNodes);

          sceneNodes.forEach((node, index) => {
            const isCurrent = index === boundedScene;
            gsap.to(node, {
              autoAlpha: isCurrent ? 1 : 0,
              y: isCurrent ? 0 : index < boundedScene ? -26 : 26,
              duration: immediate ? 0 : 0.56,
              ease: 'power3.out',
              overwrite: true,
            });
          });
        };

        gsap.set(sceneNodes.slice(1), { autoAlpha: 0, y: 26 });
        removeTweens = () => gsap.killTweensOf(sceneNodes);

        trigger = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2.4}`,
          pin,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (reverseJumpRef.current) return;
            const nextScene = Math.min(
              scenes.length - 1,
              Math.floor(self.progress * scenes.length),
            );
            revealScene(nextScene);
          },
          onEnterBack: (self) => {
            if (reverseJumpRef.current) return;

            reverseJumpRef.current = true;
            revealScene(0, true);

            const root = document.documentElement;
            const previousBehavior = root.style.scrollBehavior;
            root.style.scrollBehavior = 'auto';
            window.scrollTo(0, self.start + 1);

            requestAnimationFrame(() => {
              root.style.scrollBehavior = previousBehavior;
              reverseJumpRef.current = false;
              ScrollTrigger.update();
            });
          },
        });

        triggerRef.current = trigger;
      },
    );

    return () => {
      cancelled = true;
      trigger?.kill();
      triggerRef.current = null;
      removeTweens?.();
    };
  }, [reducedMotion, scenes]);

  const navigateToScene = (sceneIndex: number) => {
    const trigger = triggerRef.current;

    currentSceneRef.current = sceneIndex;
    setCurrentScene(sceneIndex);

    if (!trigger) return;

    const scenePosition = (sceneIndex + 0.5) / scenes.length;
    window.scrollTo({
      top: trigger.start + (trigger.end - trigger.start) * scenePosition,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={sectionRef}
      className={styles.introStory}
      aria-label={label}
      lang={locale === 'zh' ? 'zh-CN' : 'en'}
      data-reduced-motion={reducedMotion ? 'true' : undefined}
      data-intro-story
    >
      <div ref={pinRef} className={styles.introPin}>
        <div className={styles.introFrame}>
          <div className={styles.introScenes} aria-live="polite">
            {scenes.map((scene, index) => (
              <div
                key={`${scene.lead}${scene.emphasis}${scene.trail}`}
                className={`${styles.introScene} ${
                  index === currentScene ? styles.introStatementCurrent : ''
                }`}
                aria-hidden={reducedMotion || index === currentScene ? undefined : true}
                data-intro-scene={index + 1}
              >
                <p
                  className={styles.introStatement}
                  aria-label={`${scene.lead}${scene.emphasis}${scene.trail}`}
                >
                  {scene.lead}
                  <strong data-intro-emphasis>{scene.emphasis}</strong>
                  {scene.trail}
                </p>
                {scene.support ? (
                  <p className={styles.introSupport} data-intro-support>
                    {scene.support.map((fragment, fragmentIndex) =>
                      fragment.emphasis ? (
                        <strong
                          key={`${fragmentIndex}-${fragment.text}`}
                          data-intro-support-emphasis
                        >
                          {fragment.text}
                        </strong>
                      ) : (
                        <span key={`${fragmentIndex}-${fragment.text}`}>
                          {fragment.text}
                        </span>
                      ),
                    )}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <span className={styles.introCounter} aria-hidden="true">
            {String(currentScene + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}
          </span>

          <nav className={styles.introRail} aria-label={navigationLabel}>
            {scenes.map((scene, index) => (
              <button
                key={`${scene.lead}${scene.emphasis}${scene.trail}`}
                type="button"
                className={styles.introRailButton}
                aria-label={`${controlLabel} ${index + 1}`}
                aria-current={index === currentScene ? 'step' : undefined}
                onClick={() => navigateToScene(index)}
              >
                <span className={styles.introRailIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.introRailMark} aria-hidden="true" />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
