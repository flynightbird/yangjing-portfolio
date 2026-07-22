import { withBasePath } from '@/lib/i18n/locales';

import styles from './home.module.css';

const INERT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

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
          <picture className={styles.convoWebPicture}>
            <source
              media="(min-width: 768px)"
              srcSet={withBasePath('/images/convo-ai/figma/web-ready.png')}
            />
            <img
              className={styles.convoWebImage}
              src={INERT_IMAGE}
              alt="ConvoAI web conversation ready state"
            />
          </picture>
        </div>
      </div>

      <div className={styles.convoPhone} data-convo-phone aria-hidden="true">
        <picture className={styles.convoPhonePicture}>
          <source
            media="(min-width: 768px)"
            srcSet={withBasePath('/images/convo-ai/figma/avatar-video.png')}
          />
          <img className={styles.convoPhoneImage} src={INERT_IMAGE} alt="" />
        </picture>
      </div>

      <picture className={styles.convoMobileLoop} data-convo-mobile-loop>
        <source
          media="(max-width: 767px) and (prefers-reduced-motion: no-preference)"
          srcSet={withBasePath('/images/convo-ai/home-mobile-loop.gif')}
        />
        <img
          className={styles.convoMobileImage}
          src={INERT_IMAGE}
          alt="ConvoAI conversation across web and mobile"
        />
      </picture>
      <picture className={styles.convoMobilePoster} data-convo-mobile-poster>
        <source
          media="(max-width: 767px) and (prefers-reduced-motion: reduce)"
          srcSet={withBasePath('/images/convo-ai/home-mobile-loop-poster.webp')}
        />
        <img
          className={styles.convoMobileImage}
          src={INERT_IMAGE}
          alt="ConvoAI conversation across web and mobile"
        />
      </picture>
    </div>
  );
}
