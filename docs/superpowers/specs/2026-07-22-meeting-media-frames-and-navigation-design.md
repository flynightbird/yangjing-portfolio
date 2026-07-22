# Meeting Media Frames and Navigation Design

## Goal

Make the Meeting recordings read as polished product evidence rather than raw media embeds. Mobile recordings use a restrained device shell, Web recordings use the browser treatment established on the homepage, controls become quieter and easier to scan, and Meeting navigation returns to the shared project-detail standard.

## Chosen Direction

Use shared, component-level media frame variants instead of section-specific wrappers. The selected mobile treatment is the quiet shell: a thin graphite bezel, restrained corner radius, a small hardware cue, and no brand-specific device details. The shell must preserve each recording's native aspect ratio and must never rotate or crop the video.

Web recordings use a compact browser frame derived from the homepage browser treatment. It includes a shallow chrome bar, three window dots, and a muted address field. It must remain visually secondary to the recording.

## Component Behavior

### Mobile Orientation Media

- `OrientationMatchedCut` renders its active recording inside a device shell.
- Portrait and landscape shells derive their geometry from the existing orientation state.
- The stable stage dimensions remain unchanged so switching orientation does not move surrounding content.
- The video uses `object-fit: contain`, retains native orientation, keeps native controls, and starts muted.
- Meeting recordings do not expose subtitle tracks or CC controls. Design intent is expressed through the surrounding chapter copy and the caption beneath each film, not over the footage.
- Reduced-motion and failed-video states retain the existing static comparison behavior.

### Web Product Film Media

- `ProductFilmClip` accepts an explicit frame variant rather than inferring presentation from filenames.
- The Web workspace clips use the browser variant; the Meeting hero can use the same variant because it presents a desktop product surface.
- The browser chrome is decorative and hidden from assistive technology.
- Print output continues to suppress video and use the existing static fallback assets.

### Media Footer Controls

- Description text and replay control share one footer row.
- Description stays left aligned and moves up from its current separate row.
- Replay becomes a circular icon button with a stable 44 by 44 pixel target.
- The row uses vertical centering and does not change height when the replay action is unavailable.

### Orientation Tabs

- The group uses a solid medium-gray background with a fully rounded outer shape.
- Buttons have no visible border or divider.
- The selected orientation uses a lighter gray fill and high-contrast text.
- The group preserves 44 pixel minimum target sizes, visible focus treatment, `aria-pressed`, and localized accessible labels.

## Navigation

Meeting uses the shared project-detail navigation behavior:

- Preserve the global `SiteHeader` from the localized layout.
- Restore the standard numbered `ChapterNav` presentation instead of hiding chapter indices.
- Match the standard project-detail rail width, content gap, top offset, and compact breakpoint.
- Keep Meeting's full-width film bands while aligning their content start with the shared project-detail content column.
- Do not restore previous/next project navigation.

## Media Replacement

Replace the first Web workspace recording with:

`/Users/admin/Desktop/声网 作品集 整理/作品集配图/meeting/web-实施转写-页面利用.mov`

The source is a 2920 by 1476 H.264 landscape recording lasting 18.25 seconds. Remux it to MP4 without re-encoding, update its canonical source identifier from Web whiteboard to Web transcription, and provide localized timed text describing the silent interface sequence. The second Web clip remains the left/right panel layout recording.

## Testing And Verification

- Component tests cover device and browser frame variants, circular replay, the shared footer row, and pill orientation controls.
- Contract tests cover the renamed Web transcription media, manifest record, removal of rendered-film subtitle assets, and public output.
- Browser tests verify frame markers, source URLs, accessible controls, orientation switching, and standard navigation.
- Geometry checks run at 390x844, 430x932, 844x390, 1440x1000, and 1728x1117 with no horizontal overflow.
- Desktop and mobile screenshots confirm that media is not rotated or cropped and that browser/device chrome does not overlap controls.
- Publication preparation, focused Vitest, ESLint, and the framework production build must pass before completion.

## Out Of Scope

- No device-brand imitation, animated hardware controls, or decorative reflections.
- No editing of the supplied recording beyond lossless container remuxing.
- No accessibility subtitle tracks or text overlays inside Meeting recordings.
- No restructuring of the nine-chapter Meeting narrative.
- No use of the 45-second secondary Web whiteboard recording.
