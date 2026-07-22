export type MeetingFilmOrientation = 'portrait' | 'landscape';

export interface MeetingFilmClip {
  readonly id: string;
  readonly sourceFile: string;
  readonly src: string;
  readonly poster: string;
  readonly fallback: {
    readonly en: string;
    readonly zh: string;
  };
  readonly orientation: MeetingFilmOrientation;
}

export const meetingFilmSourceDirectory = 'evidence/meeting/source';

export const meetingFilmClips = [
  {
    id: 'meeting-stage-portrait',
    sourceFile: 'meeting-stage-portrait.mp4',
    src: '/videos/meeting/meeting-stage-portrait.mp4',
    poster: '/images/meeting/adaptive-layout-poster.webp',
    fallback: {
      en: 'Portrait meeting stage before the native orientation change',
      zh: '原生横竖屏切换前的手机竖屏会议舞台',
    },
    orientation: 'portrait',
  },
  {
    id: 'meeting-stage-landscape',
    sourceFile: 'meeting-stage-landscape.mp4',
    src: '/videos/meeting/meeting-stage-landscape.mp4',
    poster: '/images/meeting/adaptive-layout-poster.webp',
    fallback: {
      en: 'Landscape meeting stage after the native orientation change',
      zh: '原生横竖屏切换后的手机横屏会议舞台',
    },
    orientation: 'landscape',
  },
  {
    id: 'meeting-whiteboard-portrait',
    sourceFile: 'meeting-whiteboard-portrait.mp4',
    src: '/videos/meeting/meeting-whiteboard-portrait.mp4',
    poster: '/images/meeting/whiteboard-multidevice.webp',
    fallback: {
      en: 'Portrait whiteboard workspace with participant awareness above the canvas',
      zh: '竖屏白板工作区在画布上方保留参会者感知',
    },
    orientation: 'portrait',
  },
  {
    id: 'meeting-whiteboard-landscape',
    sourceFile: 'meeting-whiteboard-landscape.mp4',
    src: '/videos/meeting/meeting-whiteboard-landscape.mp4',
    poster: '/images/meeting/whiteboard-multidevice.webp',
    fallback: {
      en: 'Landscape whiteboard workspace keeps tools and participants beside the canvas',
      zh: '横屏白板工作区将工具与参会者放在画布两侧',
    },
    orientation: 'landscape',
  },
  {
    id: 'meeting-web-transcription',
    sourceFile: 'meeting-web-transcription.mp4',
    src: '/videos/meeting/meeting-web-transcription.mp4',
    poster: '/images/meeting/whiteboard-multidevice.webp',
    fallback: {
      en: 'Web transcription panel sharing the workspace with the primary meeting stage',
      zh: 'Web 实时转写面板与主要会议舞台并行使用页面空间',
    },
    orientation: 'landscape',
  },
  {
    id: 'meeting-web-layout',
    sourceFile: 'meeting-web-layout.mp4',
    src: '/videos/meeting/meeting-web-layout.mp4',
    poster: '/images/meeting/device-comparison.webp',
    fallback: {
      en: 'Web meeting workspace moving participant and chat panels around the stage',
      zh: 'Web 会议工作区在舞台两侧切换参会者与聊天面板',
    },
    orientation: 'landscape',
  },
] as const satisfies readonly MeetingFilmClip[];
