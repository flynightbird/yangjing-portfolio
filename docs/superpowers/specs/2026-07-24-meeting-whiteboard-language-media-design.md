# Meeting whiteboard and language media design

## Goal

Strengthen two decision-led sections of the Agora Meeting case study with shipped mobile recordings:

- add screen-share annotation as an extension of the whiteboard collaboration story;
- add live captions to complete the relationship among captions, transcription, and simultaneous interpretation;
- preserve interface legibility across desktop, tablet, and mobile portfolio viewports.

## Evidence role

The screen-share annotation recording shows drawing tools operating over shared system content, not inside the meeting whiteboard. It belongs in the whiteboard chapter because it demonstrates the same broader decision: collaboration tools should let discussion happen directly on the active content. Its caption must explicitly say “shared content” so it is not misrepresented as a whiteboard state.

The caption recording belongs first in the language group. Together, the four recordings communicate three language capabilities and their control scopes:

1. live captions: participant-level, enabled on demand;
2. real-time transcription: available inside the meeting flow;
3. simultaneous interpretation setup: meeting-level activation;
4. interpreter role: translated output remains attached to the active room.

The section heading remains `三类能力，同一处完成` because captions, transcription, and simultaneous interpretation are still three capability types; interpretation is shown in two consequential states.

## Whiteboard section

Keep the Web whiteboard recording as the large-surface overview. Below it, change the mobile evidence deck from two items to three:

1. portrait whiteboard state A;
2. portrait whiteboard state B;
3. screen-share annotation.

Final Chinese copy:

| Media | Eyebrow | Title | Description |
| --- | --- | --- | --- |
| Whiteboard A | `手机白板 A` | `白板优先，参会者、常用操作仍然清晰可见` | `白板上方保留一个参会者画面。` |
| Whiteboard B | `手机白板 B` | `退出/进入绘制白板功能前后，均合理利用有限空间` | `不同状态沿用同一套布局规则。` |
| Annotation | `屏幕共享标注` | `共享内容上直接标注` | `共享过程中调用标注工具，让讨论直接发生在内容上。` |

At viewport widths of `1121px` and above, the deck uses three columns. From `721px` through `1120px`, it uses two columns and leaves the third item on a second row. At `720px` and below, it becomes one column. Phone media keeps its source aspect ratio and is never cropped.

## Language section

Place the four recordings in this order:

1. live captions;
2. real-time transcription;
3. simultaneous interpretation setup;
4. interpreter role.

New caption recording copy:

- Eyebrow: `实时字幕`
- Title: `字幕由个人按需开启`
- Description: `参会者可在会中自行开启，不改变会议级设置。`

Existing Chinese labels remain:

- `实时转写`
- `同声传译·开启`
- `同声传译·翻译官角色`

At viewport widths of `1121px` and above, the language deck uses four equal columns and caps each phone at `14rem`. From `721px` through `1120px`, it uses two columns. At `720px` and below, it uses one column. The two- and one-column variants retain the existing `15.75rem` phone cap. Every variant preserves the exact media ratio and readable captions.

## Assets

Import both supplied `590 x 1280` MP4 files into the Meeting evidence source directory and publish them under `public/videos/meeting`:

- `app 竖屏-屏幕共享标注.mp4` (34.239 seconds)
- `app 竖屏-字幕.mp4` (25.243 seconds)

Generate one WebP poster for each recording from a frame that clearly shows the feature in use, rather than an initial loading or setup state. Register both videos and posters in the Meeting evidence manifest.

## Component changes

Extend the existing Meeting media catalog with one annotation entry and one caption entry. Reuse the existing phone shell and video loading behavior. Do not introduce a new carousel, tab system, or interaction mode.

Use the existing `phoneGrid` component contract with explicit four-column support. Responsive behavior is encoded by column count rather than by feature-specific duplicate layouts.

## Verification

Coverage must verify:

- both new manifest video IDs and poster IDs exist and point to non-empty repository files;
- the whiteboard showcase renders the annotation recording as its third mobile item;
- the language showcase renders four recordings in the approved order;
- all revised Chinese titles and descriptions appear exactly once;
- desktop uses the intended three- and four-column decks;
- compact desktop/tablet uses two columns;
- mobile uses one column;
- no horizontal overflow occurs and all phone media retains the `590 / 1280` viewport ratio.
