'use client';

import Image from 'next/image';
import { ArrowRight, LoaderCircle, PackageCheck, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { Locale } from '@/content/types';
import { growthBaseCaseCopy, growthBasePointRewards } from '@/content/growth-base';
import { withBasePath } from '@/lib/i18n/locales';

import styles from './growth-base.module.css';

export function GrowthBaseRewardLoop({ locale }: { readonly locale: Locale }) {
  const copy = growthBaseCaseCopy[locale];
  const [claimState, setClaimState] = useState<'ready' | 'claiming' | 'claimed'>('ready');
  const claimed = claimState === 'claimed';

  useEffect(() => {
    if (claimState !== 'claiming') return;
    const timer = window.setTimeout(() => setClaimState('claimed'), 650);
    return () => window.clearTimeout(timer);
  }, [claimState]);

  return (
    <div className={styles.rewardComposition}>
      <ol className={styles.rewardSteps} aria-label={locale === 'zh' ? '激励反馈流程' : 'Reward feedback sequence'}>
        {copy.rewardSteps.map((step, index) => (
          <li key={step}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{step}</strong>
            {index < copy.rewardSteps.length - 1 ? <ArrowRight aria-hidden="true" size={18} /> : null}
          </li>
        ))}
      </ol>

      <div className={styles.rewardEvidence}>
        <figure className={styles.highFiveFilm}>
          <video
            aria-label={locale === 'zh' ? '任务完成后的 Hi Five 视频' : 'Hi Five film after task completion'}
            aria-describedby={`growth-base-hi-five-${locale}-description`}
            controls
            muted
            playsInline
            poster={withBasePath('/images/growth-base/meditation-complete-poster.webp')}
            preload="metadata"
            src={withBasePath('/videos/growth-base/meditation-complete.mp4')}
          />
          <p className={styles.srOnly} id={`growth-base-hi-five-${locale}-description`}>
            {locale === 'zh'
              ? '任务完成后，生成式 IP 用一段 Hi Five 动画回应用户。'
              : 'After task completion, the generative character responds with a Hi Five animation.'}
          </p>
          <figcaption>Hi Five / {locale === 'zh' ? '情感回应' : 'Emotional acknowledgment'}</figcaption>
        </figure>

        <div className={styles.pointRewards}>
          {growthBasePointRewards[locale].map((reward, index) => (
            <figure
              className={styles.pointReward}
              data-point-reward={reward.id}
              key={reward.id}
              style={{ '--reward-index': index } as React.CSSProperties}
            >
              <div className={styles.pointAsset}>
                <Image
                  alt={locale === 'zh' ? `${reward.label}积分素材` : `${reward.label} point asset`}
                  height={180}
                  src={withBasePath(reward.image)}
                  width={180}
                />
                <span>+10</span>
              </div>
              <figcaption>{reward.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className={styles.tentDemo} data-state={claimState} data-tent-demo>
        <div className={styles.tentCopy}>
          <span>{locale === 'zh' ? '道具获取' : 'PROP COLLECTION'}</span>
          <h3>{copy.tentReady}</h3>
          <p>{claimed
            ? copy.tentClaimed
            : claimState === 'claiming'
              ? (locale === 'zh' ? '正在将静心帐篷放入你的营地…' : 'Adding the Mindfulness Tent to your camp...')
              : (locale === 'zh' ? '完成任务后主动领取，让奖励和刚才的行动产生清晰联系。' : 'Claim after completing the task to connect the reward with the action.')}</p>
          {claimed ? (
            <button aria-label={copy.replayTent} className={styles.replayButton} onClick={() => setClaimState('ready')} type="button">
              <RotateCcw aria-hidden="true" size={18} />
            </button>
          ) : (
            <button
              aria-label={copy.claimTent}
              className={styles.claimButton}
              disabled={claimState === 'claiming'}
              onClick={() => setClaimState('claiming')}
              type="button"
            >
              {claimState === 'claiming' ? <LoaderCircle aria-hidden="true" className={styles.claimSpinner} size={17} /> : null}
              {claimState === 'claiming'
                ? (locale === 'zh' ? '领取中' : 'Collecting')
                : (locale === 'zh' ? '领取道具' : 'Claim prop')}
            </button>
          )}
        </div>
        <div className={styles.campStage}>
          <span className={styles.campGround} aria-hidden="true" />
          <div className={styles.tentOrb}>
            <span className={styles.orbHighlight} aria-hidden="true" />
            <Image alt={copy.tentReady} className={styles.tentAsset} height={245} src={withBasePath('/images/growth-base/reward-bed.png')} width={255} />
          </div>
          <div className={styles.confetti} aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
          </div>
          {claimed ? (
            <span className={styles.claimConfirmation} role="status">
              <PackageCheck aria-hidden="true" size={18} />
              {locale === 'zh' ? '已获得' : 'Collected'}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
