import { withBasePath } from '@/lib/i18n/locales';

import styles from './home.module.css';

export function ConvoAiMedia() {
  return (
    <div className={styles.convoHomeMedia} data-convo-home-media>
      <div className={styles.convoWebBrowser} data-convo-web-browser>
        <div className={styles.convoBrowserBar}>
          <span className={styles.convoTrafficLights}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.convoAddress}>convoai.agora.io / conversation</span>
          <span className={styles.convoBrowserAction}>•••</span>
        </div>
        <div className={styles.convoWebViewport} data-convo-web-viewport>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.convoWebImage}
            src={withBasePath('/images/convo-ai/figma/web-ready.png')}
            alt="ConvoAI web conversation ready state"
          />
        </div>
      </div>

      <div className={styles.convoPhone} data-convo-phone aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.convoPhoneImage}
          src={withBasePath('/images/convo-ai/figma/avatar-video.png')}
          alt=""
        />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.convoMobileLoop}
        src={withBasePath('/images/convo-ai/home-mobile-loop.gif')}
        alt="ConvoAI conversation across web and mobile"
        data-convo-mobile-loop
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.convoMobilePoster}
        src={withBasePath('/images/convo-ai/home-mobile-loop-poster.webp')}
        alt="ConvoAI conversation across web and mobile"
        data-convo-mobile-poster
      />
    </div>
  );
}
