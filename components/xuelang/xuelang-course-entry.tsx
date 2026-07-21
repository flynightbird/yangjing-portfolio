'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import type { Locale } from '@/content/types';

import styles from './xuelang-course-entry.module.css';

type CourseEntryState = {
  readonly id: 'discover' | 'start' | 'continue' | 'live';
  readonly index: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
};

const copy: Record<Locale, {
  readonly tablistLabel: string;
  readonly stageLabel: string;
  readonly states: readonly CourseEntryState[];
}> = {
  zh: {
    tablistLabel: '课程入口状态',
    stageLabel: '自适应课程入口',
    states: [
      {
        id: 'discover',
        index: '01',
        label: '还没有买课',
        title: '从发现开始',
        description: '用内容分类与课程推荐承接兴趣，让空状态直接成为选课入口。',
        src: '/images/xuelang/course-entry-discover.webp',
        width: 621,
        height: 1343,
        alt: '课程发现与选课入口',
      },
      {
        id: 'start',
        index: '02',
        label: '买了新课还没看',
        title: '把新课放到眼前',
        description: '优先呈现刚购买的课程，缩短从交易完成到第一次学习的路径。',
        src: '/images/xuelang/course-entry-start.webp',
        width: 621,
        height: 1345,
        alt: '新购课程的开始学习入口',
      },
      {
        id: 'continue',
        index: '03',
        label: '最近正在看课',
        title: '回到上次进度',
        description: '保留课程、章节与学习进度，让用户返回时可以立即继续。',
        src: '/images/xuelang/hero-learn.webp',
        width: 897,
        height: 1942,
        alt: '课程入口中的学习进度与继续学习状态',
      },
      {
        id: 'live',
        index: '04',
        label: '老师正在直播',
        title: '让直播成为此刻的首要行动',
        description: '当已购课程正在直播时，及时切换入口优先级，减少错过实时互动。',
        src: '/images/xuelang/course-entry-live.webp',
        width: 621,
        height: 1345,
        alt: '老师直播中的课程入口',
      },
    ],
  },
  en: {
    tablistLabel: 'Course entry states',
    stageLabel: 'Adaptive course entry',
    states: [
      {
        id: 'discover',
        index: '01',
        label: 'No course yet',
        title: 'Begin with discovery',
        description: 'Turn the empty state into a useful path through categories and course recommendations.',
        src: '/images/xuelang/course-entry-discover.webp',
        width: 621,
        height: 1343,
        alt: 'Course discovery and selection entry',
      },
      {
        id: 'start',
        index: '02',
        label: 'New course, not started',
        title: 'Bring the new course forward',
        description: 'Prioritize the latest purchase and shorten the path from transaction to first learning action.',
        src: '/images/xuelang/course-entry-start.webp',
        width: 621,
        height: 1345,
        alt: 'Start-learning entry for a newly purchased course',
      },
      {
        id: 'continue',
        index: '03',
        label: 'Recently learning',
        title: 'Return to the last position',
        description: 'Preserve the course, lesson, and progress so the next session can begin immediately.',
        src: '/images/xuelang/hero-learn.webp',
        width: 897,
        height: 1942,
        alt: 'Learning progress and continue-learning entry',
      },
      {
        id: 'live',
        index: '04',
        label: 'Teacher is live',
        title: 'Make the live class the immediate action',
        description: 'Raise an active class above routine progress so learners do not miss real-time interaction.',
        src: '/images/xuelang/course-entry-live.webp',
        width: 621,
        height: 1345,
        alt: 'Course entry while the teacher is live',
      },
    ],
  },
};

const DEFAULT_STATE_INDEX = 2;
const PANEL_ID = 'course-entry-panel';

export function XuelangCourseEntry({ locale }: { readonly locale: Locale }) {
  const text = copy[locale];
  const [activeIndex, setActiveIndex] = useState(DEFAULT_STATE_INDEX);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const activeState = text.states[activeIndex];

  useEffect(() => {
    const tablist = tablistRef.current;
    const tab = tabRefs.current[activeIndex];
    if (!tablist || !tab) return;

    function centerActiveTab() {
      if (!tablist || !tab || tablist.scrollWidth <= tablist.clientWidth) return;
      const centered = tab.offsetLeft - ((tablist.clientWidth - tab.offsetWidth) / 2);
      tablist.scrollLeft = Math.max(
        0,
        Math.min(centered, tablist.scrollWidth - tablist.clientWidth),
      );
    }

    centerActiveTab();
    window.addEventListener('resize', centerActiveTab);
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(centerActiveTab);
    resizeObserver?.observe(tablist);

    return () => {
      window.removeEventListener('resize', centerActiveTab);
      resizeObserver?.disconnect();
    };
  }, [activeIndex]);

  function selectAndFocus(index: number) {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % text.states.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + text.states.length) % text.states.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = text.states.length - 1;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    selectAndFocus(nextIndex);
  }

  return (
    <div className={styles.root} data-course-entry>
      <div className={styles.interactive} data-course-entry-interactive>
        <div className={styles.stage} aria-label={text.stageLabel}>
          <div
            key={activeState.id}
            id={PANEL_ID}
            className={styles.panel}
            role="tabpanel"
            aria-labelledby={`course-entry-tab-${activeState.id}`}
            tabIndex={0}
          >
            <div className={styles.stageCopy}>
              <span>{activeState.index} / ADAPTIVE ENTRY</span>
              <h4>{activeState.title}</h4>
              <p>{activeState.description}</p>
            </div>
            <div className={styles.phone}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeState.src}
                width={activeState.width}
                height={activeState.height}
                alt={activeState.alt}
                draggable="false"
              />
            </div>
          </div>
        </div>

        <div
          ref={tablistRef}
          className={styles.tabs}
          role="tablist"
          aria-label={text.tablistLabel}
        >
          {text.states.map((state, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={state.id}
                ref={(node) => { tabRefs.current[index] = node; }}
                id={`course-entry-tab-${state.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={PANEL_ID}
                tabIndex={selected ? 0 : -1}
                data-active={selected ? true : undefined}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span>{state.index}</span>
                <strong>{state.label}</strong>
                <small>{state.title}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.printGrid} data-course-entry-print>
        {text.states.map((state) => (
          <figure key={state.id}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.src}
                width={state.width}
                height={state.height}
                alt={`${state.label} - ${state.title}`}
              />
            </div>
            <figcaption>
              <span>{state.index}</span>
              <strong>{state.label}</strong>
              <p>{state.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
