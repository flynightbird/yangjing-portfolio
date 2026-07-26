# Meeting orientation comparison design

## Goal

Use the shipped portrait and landscape viewport recordings to prove that Agora Meeting preserves information priority while reorganizing the interface for a new orientation. At the same time, remove the slight clipping caused by the current phone mockup.

## Placement and narrative

The comparison belongs inside the existing **Adaptive stage** chapter, immediately after the Web adaptive-stage recording and before the meeting-state matrix. The Web recording introduces the rule; the orientation pair demonstrates that the same rule survives a device rotation.

The supporting copy stays short and strategic:

- Heading: `方向改变，信息优先级不变`
- Summary: `横屏扩展舞台，竖屏重排信息；两种视窗沿用同一套参会者、共享内容与控制层级。`
- Landscape caption: `横屏释放主舞台` / `更宽的视窗优先承载内容与参会者画面。`
- Portrait caption: `竖屏重排信息层级` / `有限宽度下保留主舞台、会议信息与核心控制。`

English receives equivalent concise copy so both locales keep the same component contract.

## Visual treatment

The recordings appear as a two-column comparison on desktop. The landscape recording uses a light landscape device frame; the portrait recording uses the existing phone frame. Their visual heights are balanced without forcing equal media dimensions. On narrow screens, the two views stack and remain centered.

Both frames treat the video as the source of truth:

- the media viewport owns the exact source aspect ratio;
- decorative padding and borders sit outside that viewport;
- video and poster use `object-fit: contain` so no application UI is cropped;
- the frame may scale responsively, but its internal ratio may not change.

## Assets and evidence

Import the two supplied MP4 files into the Meeting evidence source directory, publish copies under `public/videos/meeting`, and generate WebP poster frames from the videos. Add four manifest records: two videos and two posters.

## Verification

Component coverage checks that the adaptive-stage showcase includes both orientation labels and both video sources. Asset coverage checks manifest traceability and non-empty outputs. Browser verification covers desktop and mobile layouts and confirms that each media element has the same rendered aspect ratio as its source viewport.
