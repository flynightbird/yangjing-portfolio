# Growth Base Showcase Redesign

## Status

Approved in conversation on 2026-08-06.

## Positioning And Evidence

- **Fact:** The supplied project is a personal WeChat mini-program concept with an interactive prototype.
- **Fact:** The supplied prototype and media demonstrate AI Coach, Personal Trainer, task, reward, meditation, and meal scenes.
- **Gap:** No launch, adoption, retention, conversion, or validated behavior-change evidence was supplied.
- **Recommendation:** Present intended design effects as design decisions, not measured outcomes.

Position the work as an exploration of how an AI coach can replace dry check-ins with warmer, more interactive companionship. Label it `个人概念 · 可交互原型` / `Personal concept · Interactive prototype`.

## Narrative Structure

The desktop case study uses one overview followed by four decisions:

1. `01 / BEFORE + AFTER` is the redesign overview. Keep the current synchronized Before / After comparison unchanged.
2. `02 / TASK FOCUS` explains the task-card reorganization.
3. `03 / REWARD LOOP` explains emotional acknowledgment, manual collection, and perceptible rewards.
4. `04 / EMOTIONAL LANGUAGE` explains the voice rules and contextual greeting system.
5. `05 / SCENE FILMS` closes with scene-based generated films.

After 01, add a short transition that frames 02-05 as four design decisions. This makes the first chapter an overview rather than a competing fifth decision.

## 02 Task Focus

Title: `聚焦当下最重要的任务`

Intro: `将纵向堆叠的任务重组为横向卡片，减少页面占用，让当前主要场景成为行动焦点。`

Use a large rounded outline to represent the phone viewport. Show five task cards inside it, with two more continuing outside the clipped viewport. Center and emphasize `15:30 冥想`; keep two visible cards on each side.

The seven tasks are:

1. 08:00 补充水分
2. 12:00 营养午餐
3. 15:30 冥想
4. 17:30 健康晚餐
5. 18:30 补充水分
6. 19:00 力量训练
7. 22:30 睡前拉伸

## 03 Reward Loop

Title: `让每次完成，都得到及时回应`

Intro: `用 Hi Five 视频回应任务完成，再通过手动领取积分与道具动效，把抽象奖励转化为可参与、可感知的成长。`

Show the sequence `完成任务 -> Hi Five -> 领取积分 / 获得道具`. The Hi Five film is the completion response. The three point assets play once in sequence: vitality, focus, stamina. Each asset rises, lands into a translucent green square, briefly brightens the base, reveals `+10`, then rests.

The current prop example is only `静心帐篷`. Before collection, keep the tent artwork and its bubble fully opaque so the reward remains clearly legible; distinguish the unclaimed state through position and the active `领取` button rather than faded opacity. After collection, confetti plays and the tent drops into a simple camp area. A Lucide replay icon resets the demonstration. Do not invent more props or draw a custom icon.

## 04 Emotional Language

Title: `先回应此刻，再给出一步建议`

Intro: `结合时间、用户名称与日常节奏，先用一句问候建立亲近感，再给出低门槛、非命令式的健康建议。`

Voice role: `懂你节奏的温柔教练`.

Rules:

- Use time, tasks, and known rhythm as context.
- Respond to the present state before suggesting one small action.
- Invite rather than command.
- Never judge or create anxiety.
- Stay warm without implying false intimacy.

Render the four time-based examples as one large typographic field, not four cards. Rotate automatically with clear time labels and respect reduced motion.

## 05 Scene Films

Title: `让陪伴进入一天中的不同场景`

Intro: `生成式 IP 不只回应任务完成，也出现在欢迎、冥想、备餐与烹饪中，让健康行动自然融入连续的生活情境。`

Use two warm-white horizontal editorial shells. Shell one contains `欢迎与进入` and `冥想过程`; shell two contains `饮食准备` and `烹饪行动`. Videos remain independently controllable. Keep only clear numbering and titles; do not add decorative microcopy. Retain the top-left watermark blur mask without covering captions. The third film, `饮食准备`, moves its watermark between corners during playback; give only this film a taller top-left mask so the watermark remains covered when it appears there. Keep the other films' mask dimensions unchanged, and let the existing bottom caption fade cover the lower-right watermark state.

## Visual System

- 01 warm gray: overview and comparison.
- 02 warm white: structural clarity.
- 03 pale green: reward and growth.
- 04 deep ink green: a calm typographic pause.
- 05 warm gray with warm-white shells: editorial film close.
- Keep all section headings aligned to the same desktop content grid.
- Use readable body type and restrained borders. Do not create nested cards.
- Use Lucide or Remix icons only.

## Responsive Behavior

The portfolio chapters are desktop-only. At `max-width: 767px`, hide the desktop project header, the portfolio-wide site navigation, and all portfolio framing, including 02-05, on the Growth Base route. Preserve the existing full-viewport interactive prototype without placing it under the portfolio navigation. The prototype must not be compressed or placed inside another mobile mockup. Keep the site navigation unchanged on desktop and on every other portfolio route.

## Localization

Author concise English copy for every new section. English should preserve the decision narrative without literal Chinese phrasing.

## Verification

Automated tests must cover section order, bilingual copy, task count and centered focus, reward assets and manual tent interaction, the fully opaque ready-state tent, language examples, two film shells with four videos, the third film's taller watermark mask, Lucide replay usage, desktop-only portfolio sections, and route-specific mobile site-navigation visibility. Browser verification must cover desktop layout, video shells and watermark coverage, reward interaction, no horizontal overflow, a hidden mobile site header, and unchanged mobile prototype behavior.
