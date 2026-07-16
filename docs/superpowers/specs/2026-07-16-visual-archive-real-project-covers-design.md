# Visual Archive Real Project Covers Design

## Objective

Replace the eight development-only Visual Archive slots with four real projects. Each card uses a clean project image as its cover and renders company, period, and project title as semantic HTML/CSS over the image. Project description and skills remain below the cover in the approved two-column metadata layout.

The result keeps the Johnyvino-inspired horizontal carousel mechanics while making every card truthful, readable, bilingual, and specific to its artwork.

## Project Set And Order

The carousel contains exactly four projects in this order. No draft slots remain on the homepage.

### 1. Alibaba

- Period: `2019-2020.12`
- Chinese title: `每平每屋设计家` / `APP & 官网主站`
- English title: `Mei Ping Mei Wu Design` / `App & Main Website`
- Chinese description: `阿里巴巴旗下的家居装修设计师工具和平台，我们统一 APP 与官网主站体验，并同步提升产品品牌表达。`
- English description: `A home-design tool and platform from Alibaba. We unified the app and main website experience while strengthening the product's brand expression.`
- Skills: `UX`, `UI`
- Source image: `/Users/admin/Desktop/声网 作品集 整理/作品集配图/躺平4-1.jpg`
- Public asset: `/images/archive/alibaba-meipingmeiwu.jpg`

### 2. ByteDance Open Language

- Period: `2021`
- Chinese title: `开言设计原则` / `新探索`
- English title: `Open Language Design Principles` / `New Exploration`
- Chinese description: `字节跳动旗下的语言学习 app，为它探索新的设计原则，提升产品视觉一致性与体验品质。`
- English description: `A language-learning app from ByteDance. We explored a new set of design principles to improve visual consistency and experience quality.`
- Skills: `UX`, `UI`
- Source image: `/Users/admin/Desktop/声网 作品集 整理/作品集配图/开言设计原则封面-1.jpg`
- Public asset: `/images/archive/bytedance-open-language.jpg`

### 3. ByteDance Doudou Fox

- Period: `2021.09-10`
- Chinese title: `豆豆狐` / `英语大闯关`
- English title: `Doudou Fox` / `English Adventure`
- Chinese description: `字节跳动旗下的儿童语言学习 app，设计英语闯关体验，让学习任务更直观、更具游戏感。`
- English description: `A children's language-learning app from ByteDance. We designed an English adventure experience that made learning tasks more intuitive and playful.`
- Skills: `UX`, `UI`
- Source image: `/Users/admin/Desktop/声网 作品集 整理/Frame 1312316590.jpg`
- Public asset: `/images/archive/bytedance-doudou-fox.jpg`

### 4. Tongcheng Travel Mr Chong

- Period: `2019`
- Chinese title: `Mr Chong` / `品牌 IP 形象与三维创作`
- English title: `Mr Chong` / `Brand IP and 3D Creation`
- Chinese description: `为同程旅游塑造可延展的品牌 IP 形象，并完成三维角色、动作与视觉表达。`
- English description: `Created an extensible brand IP for Tongcheng Travel, including the 3D character, motion, and visual expression.`
- Skills: `IP Design`, `3D`, `C4D`
- Source image: `/Users/admin/Desktop/声网 作品集 整理/作品集配图/虫虫15.png`
- Public asset: `/images/archive/tongcheng-mr-chong.png`

## Component Contract

`VisualArchive` continues to accept a locale and archive entries. Real entries gain the following explicit content:

- localized company name;
- structured period data whose `start` and optional `end` each contain a valid `dateTime` value and localized visible label;
- localized primary and secondary title lines;
- localized one-sentence description;
- required skills array;
- clean cover image and localized alternative text;
- a finite cover-presentation variant.

The cover-presentation variant selects a known CSS class rather than accepting arbitrary style values from content. The four variants are `alibaba`, `open-language`, `doudou-fox`, and `mr-chong`.

The existing draft-entry type can remain available for development tooling, but the default homepage data contains only the four real entries. The component must not render Draft labels or placeholder media for the default data.

## Cover Anatomy

Each cover contains:

1. A clean project image.
2. A company and period index rendered with the mono utility face.
3. A project title lockup rendered with the portfolio display face.
4. An optional small English product label where it belongs to the approved composition, such as `OPEN LANGUAGE`.

All overlay text is real DOM text. It must remain selectable, localizable, responsive, and readable by assistive technology. The decorative image uses meaningful localized alternative text through the existing lightbox control. Overlay elements use `pointer-events: none` so the entire cover remains an operable lightbox trigger.

## Per-Cover Art Direction

All primary titles use the same relative type size and line-height as the approved Alibaba cover. Production CSS uses stable rem sizes with responsive breakpoints or container queries, not viewport-width font scaling. Multi-line titles use approximately `1.09` line-height and zero letter spacing.

### Alibaba

- Image fit: 16:9 cover, centered.
- Index: dark text, left `4.5%`, top `29%`.
- Title: dark text, left `4.5%`, top `40%`, width about `41%`.
- Explicit title break: `每平每屋` / `设计家` in Chinese.
- Secondary title sits below the primary title.
- Reason: the image's upper-left area contains UI details; metadata moves into the clean white shape instead of competing with them.

### Open Language

- Image fit: 16:9 cover, centered.
- Index: white text, left `7%`, top `5%`.
- Product label and title: left `7%`, container top `35%`, width about `57%`.
- Product label uses the existing cyan signal from the artwork.
- Primary title begins at the same relative vertical level as Alibaba's primary title.
- Title uses white text against the black field.

### Doudou Fox

- Image fit: 16:9 cover, centered.
- Index: dark text, left `4.5%`, top `5%`.
- Title: white text, left `7%`, top `29%`, width about `43%`.
- The title remains above the lower-left Doudou Fox logo and left of the phone.

### Mr Chong

- Image fit: 16:9 cover with a tuned vertical object position that preserves the character.
- Index: dark text, left `4.5%`, top `5%`.
- Title: dark text, left `4.5%`, top `15%`, width about `43%`.
- The secondary title sits beneath `MR CHONG` with a smaller size and comfortable line-height.
- The lockup occupies the upper-left yellow field and stays clear of the character's head and body.

## Below-Cover Metadata

The approved B layout becomes a quiet two-column facts area beneath each cover:

- Left column: localized project description.
- Right column: `Skills` label and semantic list.

Company, period, and project title are not repeated below the cover. On narrow cards and mobile viewports, the metadata stacks into one column with description first and skills second. Skills use plain mono text separated by visible dividers, not pill badges.

The metadata area has a stable minimum height at desktop sizes so cards with different description lengths do not create distracting alignment shifts. It must not force the overall Archive section beyond the existing compactness target.

## Responsive Behavior

- The carousel keeps horizontal scroll snapping, explicit previous/next controls, progress, and adjacent-card reveal.
- The four project covers preserve a 16:9 stage. Card widths may vary only when the full cover composition remains visible; no portrait crop is allowed for these four landscape covers.
- Overlay positions are percentages relative to the cover, but font sizes use stable breakpoint or container-query values.
- On mobile, titles reduce one discrete size step. Company/period remains legible and does not wrap.
- Long English titles may use the approved explicit title-line split. No title may overlap the phone, character, logos, or major UI content.

## Accessibility

- Each project title is an `h3` within its article.
- Company is plain text. Period ranges render their start and end as separate semantic `time` values joined by a visible dash; single-year periods render one `time` value.
- Skills render as a list with a localized visible label.
- Lightbox controls retain localized accessible labels and keyboard behavior.
- Cover overlay text meets readable contrast against its project-specific background without relying on one global text color.
- Focus indicators remain visible around the cover control.
- Reduced-motion behavior remains unchanged.

## Validation And Failure Behavior

- Zod validates every localized string, title line, skill, image path, and cover variant.
- Homepage parsing fails early for incomplete project data rather than silently omitting required metadata.
- Archive image paths remain restricted to safe `/images/archive/` public paths.
- Four default entries must have unique keys, distinct cover-presentation variants, and matching cover assets.

## Testing

### Unit And Component

- The real-entry schema accepts all four approved projects and rejects missing descriptions, empty skills, unsafe images, and unknown cover variants.
- The default Visual Archive renders exactly four real cards and zero draft slots.
- Both locales render the correct company, title, description, period, and skills.
- Each card exposes its cover variant for stable layout testing.
- Overlay titles remain semantic headings and image controls retain localized labels.

### Browser

- Desktop, tablet, and mobile retain scroll snap, adjacent-card reveal, controls, progress, and no page-level horizontal overflow.
- Cover titles do not overlap major image content at representative widths.
- Two-column metadata stacks correctly on narrow cards.
- All four cover images load with non-zero natural dimensions.
- The Archive remains compact relative to the viewport.

### Visual QA

Use `agent-browser` screenshots at 1440x900, 768x1024, and 390x844. Inspect each of the four active-card positions, not only the initial card. Verify title placement, text contrast, image crop, metadata wrapping, control state, and the final-card disabled state.

## Out Of Scope

- New case-study routes for these four archive projects.
- Fabricated performance metrics or project outcomes.
- Baking text into image files.
- Replacing the existing selected-work projects.
- Adding more than the four confirmed archive projects.
