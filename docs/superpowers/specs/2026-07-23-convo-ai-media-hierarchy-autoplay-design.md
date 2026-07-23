# ConvoAI Media Hierarchy and Autoplay Design

## Goal

Clarify the relationship between media, explanatory copy, and scene navigation on the ConvoAI case study. Rework the Chinese "开始实时对话" chapter into a simultaneous App/Web comparison, identify the voiceprint modes, and make product recordings play as ambient product evidence without browser-native controls.

## Scope

This change affects ConvoAI media presentation and the Chinese case-study composition. It does not change the site shell, chapter navigation, footer, project routing, source media order outside the explicitly regrouped start-conversation chapter, or the existing desktop/mobile motion strategy.

## Chapter Ownership

App media remains distributed by user task:

- `App 产品结构`: login and entry, product structure, personal settings, hardware binding.
- `开始实时对话`: App permission, connection, and readiness; Web login, configuration, agent selection, and joining a session.
- `对话控制`: captions and camera, continuous conversation, voice interruption, and voiceprint modes.
- `数字人互动`: digital-human selection and live interaction.
- `实时链路`: RTC, ASR, LLM, TTS, and Voiceprint processing stages.

No App scenario is removed. The start-conversation chapter stays focused on the actions required to begin a session.

## Start-Conversation Composition

Use the approved A2 shared-stage composition.

- Web is the large background stage and carries the complete setup path.
- The App phone overlaps the lower-left foreground and carries the short permission-to-readiness path.
- Both platforms remain visible in the same composition so Web is not deferred to a later page section.
- App has one fixed recording: `app-conversation-start`.
- Web has four ordered steps: `web-login`, `web-preflight`, `web-preflight-layout`, and `web-join-exit`.
- The App and active Web videos play simultaneously because both are muted by default.

The visual relationship communicates different task density rather than presenting App and Web as interchangeable screens.

## Navigation and Description Hierarchy

The scene navigation must not appear as another row inside the active media description.

- End the media and description surface before scene navigation begins.
- Add clear vertical separation between the active description and the navigation.
- Place the Web scene navigation in its own unframed band labeled `Web 启动路径`.
- Keep the ordered steps visible as `登录`, `启动前设置`, `Agent 选择`, and `加入会话`.
- Use the scene navigation only to change the Web recording and its associated detail copy.
- Keep App path copy near the foreground phone instead of mixing it into the Web detail grid.
- When a general playlist is used elsewhere, its scene rail must also be visually independent from the media description surface.

The existing `场景 / 问题 / 设计 / 作用` fields remain, but they describe only the currently selected recording.

## Voiceprint Identification

Add the following heading immediately above the three voiceprint mode panels:

`声纹如何定义“听谁说话”`

Do not add supporting copy that restates the differences between Off, Seamless, and Personalized. The mode panels already contain those details.

## Video Playback

All ConvoAI product videos use the following behavior:

- Start automatically when at least 25% of the video enters the viewport.
- Pause when the video leaves the viewport.
- Resume from the current position when it re-enters.
- Play muted, inline, and in a loop.
- Do not render browser-native video controls.
- Do not pause when the user clicks the video surface.
- Show a compact sound button at the lower-right only when the media item contains audio.
- When sound is enabled for one video, mute every other ConvoAI video without pausing their playback.
- After a scene change, start the newly active video immediately when its stage is visible.

Autoplay failures must not leave a blank surface. Keep the poster visible and preserve the existing reload error state. Under `prefers-reduced-motion: reduce`, retain a static poster and do not autoplay.

## Responsive Behavior

Desktop uses the full shared-stage composition, with a large Web plane and an overlapping App phone. The Web navigation remains a separate horizontal band.

Tablet keeps a reduced App/Web overlap. Mobile places the App phone directly below the Web plane within the same shared-stage module, followed by the Web scene navigation. Web is never moved to a distant section. Scene controls must remain reachable without horizontal page overflow, and all touch targets must remain at least 44px.

## Accessibility

- Preserve descriptive `aria-label` and `aria-describedby` relationships for every video.
- Give the sound control a localized label that reflects its next action.
- Reflect the sound state with `aria-pressed`.
- Preserve keyboard access and visible focus for scene and sound controls.
- Keep media descriptions in the document regardless of autoplay support.
- Reduced-motion users receive static posters and fully readable descriptions.

## Component Boundaries

- Add a focused start-conversation composition component rather than embedding layout logic in MDX.
- Keep shared viewport playback and sound behavior inside the reusable ConvoAI video component.
- Keep playlist selection responsible only for active media state and scene navigation.
- Reuse the existing media catalog as the source for platform, duration, audio availability, poster, and localized copy.

## Verification

Component tests must cover:

- autoplay on intersection and pause outside the viewport;
- static behavior under reduced motion;
- muted looping playback without the `controls` attribute;
- conditional sound-button rendering and cross-video muting;
- automatic playback after changing the active Web step;
- start-conversation App/Web media assignment and Web step order;
- independent scene-navigation placement;
- the Chinese voiceprint heading.

Browser verification must cover desktop, tablet, and mobile layouts, horizontal overflow, media aspect ratios, touch targets, and the absence of browser-native controls. Production build, lint, focused component tests, and the ConvoAI end-to-end suite must pass before completion.
