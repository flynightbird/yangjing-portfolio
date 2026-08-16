import type { Locale } from '@/content/types';
import { withBasePath } from '@/lib/i18n/locales';

export type ConvoAiMediaId =
  | 'app-login' | 'app-structure' | 'app-conversation-start' | 'app-caption-camera'
  | 'app-profile-settings' | 'app-voiceprint-lock' | 'app-hardware-device'
  | 'app-avatar-select' | 'app-avatar-interaction' | 'web-login' | 'web-preflight'
  | 'web-preflight-layout' | 'web-join-exit' | 'web-conversation' | 'web-interrupt'
  | 'web-realtime-data';

interface LocalizedCopy {
  readonly title: string;
  readonly description: string;
  readonly context: string;
  readonly problem: string;
  readonly decision: string;
  readonly impact: string;
}

export interface ConvoAiMediaItem {
  readonly id: ConvoAiMediaId;
  readonly platform: 'app' | 'web';
  readonly src: string;
  readonly poster: string;
  readonly duration: number;
  readonly width: number;
  readonly height: number;
  readonly audio: boolean;
  readonly soundControl?: boolean;
  readonly copy: Record<Locale, LocalizedCopy>;
}

export type ConvoAiMediaOrientation = 'portrait' | 'landscape';

export interface ConvoAiMediaSizing {
  readonly aspectRatio: string;
  readonly orientation: ConvoAiMediaOrientation;
  readonly ratio: number;
}

export function getConvoAiMediaSizing(
  media: Pick<ConvoAiMediaItem, 'width' | 'height'>,
): ConvoAiMediaSizing {
  return {
    aspectRatio: `${media.width} / ${media.height}`,
    orientation: media.width > media.height ? 'landscape' : 'portrait',
    ratio: media.width / media.height,
  };
}

type ItemInput = Omit<ConvoAiMediaItem, 'src' | 'poster'>;

function item(input: ItemInput): ConvoAiMediaItem {
  return {
    ...input,
    src: withBasePath(`/videos/convo-ai/${input.id}.mp4`),
    poster: withBasePath(`/images/convo-ai/posters/${input.id}.webp`),
  };
}

export const convoAiMedia: Record<ConvoAiMediaId, ConvoAiMediaItem> = {
  'app-login': item({ id: 'app-login', platform: 'app', duration: 3.2, width: 592, height: 1280, audio: true, soundControl: false, copy: {
    en: { title: 'App entry and sign in', description: 'A short path from product entry to sign in.', context: 'The user enters ConvoAI.', problem: 'The product and primary route must be recognizable immediately.', decision: 'Keep sign-in and entry short, with the primary destination visible immediately.', impact: 'The mobile journey starts from a clear product identity and destination.' },
    zh: { title: 'App 登录与进入', description: '登录后直接进入 Agent 浏览。', context: '用户首次进入 ConvoAI。', problem: '过多中间页会延后核心任务。', decision: '登录只承担身份验证。', impact: '下一屏直接选择 Agent 并开始对话。' },
  }}),
  'app-structure': item({ id: 'app-structure', platform: 'app', duration: 9.357, width: 592, height: 1280, audio: true, soundControl: false, copy: {
    en: { title: 'Product structure', description: 'App navigation organized around the conversation journey.', context: 'The user scans agents, profile, and device entry points.', problem: 'Several conversation resources need a clear hierarchy.', decision: 'Organize agents, profile settings, and devices around the conversation journey.', impact: 'Settings, devices, and calls each have a predictable place in the product.' },
    zh: { title: '围绕对话组织产品', description: '以 Agent 为主入口，设置与设备退到辅助层。', context: 'App 同时承载对话、设置与设备。', problem: '入口同级会模糊主任务。', decision: '以开始对话组织信息层级。', impact: '辅助任务完成后仍回到对话中心。' },
  }}),
  'app-conversation-start': item({ id: 'app-conversation-start', platform: 'app', duration: 12.134, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'Start a conversation', description: 'Permission, connection, and readiness as one sequence.', context: 'The user initiates an AI call.', problem: 'Permission and connection can feel like unresponsive waiting.', decision: 'Show microphone permission, connection, and readiness as one continuous sequence.', impact: 'The user can tell when it is time to begin speaking.' },
    zh: { title: '从点击到可以开口', description: '权限、连接与就绪连续反馈。', context: '点击开始后，系统仍需建立连接。', problem: '过程不可见，用户容易提前开口。', decision: '依次显示权限、Connecting 与 Ready。', impact: '用户知道何时可以说话。' },
  }}),
  'app-caption-camera': item({ id: 'app-caption-camera', platform: 'app', duration: 22.833, width: 220, height: 480, audio: true, copy: {
    en: { title: 'Captions and camera interaction', description: 'A multimodal turn across captions, feedback, and camera input.', context: 'A live call moves from captions and orb feedback into camera understanding.', problem: 'Text, video, AI output, and call controls compete for attention.', decision: 'Preserve the causal sequence and explain state changes outside the recording.', impact: 'The interaction remains continuous and legible as information increases.' },
    zh: { title: '多种反馈，共用一个话轮', description: '字幕、球体与摄像头同步变化。', context: '对话中开启字幕与摄像头。', problem: '多种反馈会争夺注意力。', decision: '字幕与球体同步，控制区保持原位。', impact: '信息增加，操作方式不变。' },
  }}),
  'app-profile-settings': item({ id: 'app-profile-settings', platform: 'app', duration: 27.834, width: 592, height: 1280, audio: true, soundControl: false, copy: {
    en: { title: 'Personal settings', description: 'Profile and preference updates with visible confirmation.', context: 'The user changes identity and personal preferences.', problem: 'Settings need continuous feedback so completion is not ambiguous.', decision: 'Keep entry, modification, confirmation, and return in one flow.', impact: 'Identity and saved state are confirmed within the same path.' },
    zh: { title: '个人设置', description: '修改、确认与返回保持连续。', context: '用户调整头像与偏好。', problem: '离开后难以确认是否保存。', decision: '返回前展示修改结果。', impact: '无需重复进入设置确认。' },
  }}),
  'app-voiceprint-lock': item({ id: 'app-voiceprint-lock', platform: 'app', duration: 23.834, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'Voiceprint lock', description: 'Voiceprint modes and enrollment states.', context: 'The user wants the agent to respond to their voice amid surrounding speech.', problem: 'Voice identity adds enrollment cost and recovery expectations.', decision: 'Offer Off, Seamless, and Personalized modes with explicit recording and upload states.', impact: 'The user can understand who the agent is listening to and choose the appropriate balance of convenience and control.' },
    zh: { title: '声纹录入', description: '录音、上传与生效状态连续反馈。', context: '用户选择 Personalized 并录入声纹。', problem: '跨越多个阶段，容易中断或失去进度。', decision: '逐步显示录音、上传与生效状态。', impact: '用户知道录入是否完成。' },
  }}),
  'app-hardware-device': item({ id: 'app-hardware-device', platform: 'app', duration: 14.167, width: 448, height: 960, audio: true, soundControl: false, copy: {
    en: { title: 'Bind a hardware device', description: 'Environment preparation and device discovery in one task.', context: 'The user binds an external device for the conversation.', problem: 'Bluetooth, Wi-Fi, location, and scan states belong to different system layers.', decision: 'Arrange environment readiness and scanning as one continuous task.', impact: 'The user can tell whether the device is ready to connect.' },
    zh: { title: '把系统权限变成连接进度', description: '蓝牙、Wi-Fi、定位与扫描串成一条任务。', context: '外部设备需要多项系统条件。', problem: '失败时难以判断卡在哪一步。', decision: '按依赖顺序检查环境并扫描设备。', impact: '用户能看到缺少的条件。' },
  }}),
  'app-avatar-select': item({ id: 'app-avatar-select', platform: 'app', duration: 9.967, width: 592, height: 1280, audio: true, soundControl: false, copy: {
    en: { title: 'Choose a digital human', description: 'Character selection connected to agent setup.', context: 'The user selects a digital human from a character library.', problem: 'Selection needs to establish an expectation for the next conversation.', decision: 'Connect character choice directly to agent configuration.', impact: 'Character selection leads directly into the next conversation.' },
    zh: { title: '选择数字人', description: '角色选择直接接回 Agent 配置。', context: '用户为 Agent 选择数字人。', problem: '孤立的角色选择与对话脱节。', decision: '选择后直接回到 Agent 配置。', impact: '角色自然进入下一场对话。' },
  }}),
  'app-avatar-interaction': item({ id: 'app-avatar-interaction', platform: 'app', duration: 8.893, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'Interact with a digital human', description: 'Avatar connection, conversation, and camera states.', context: 'The avatar connects, talks, and opens the camera.', problem: 'Social presence amplifies sync, latency, and picture-in-picture competition.', decision: 'Keep connection, turn state, camera, and picture-in-picture in one continuous transition.', impact: 'The current call state remains clear as the sense of presence increases.' },
    zh: { title: '与数字人实时互动', description: '数字人为主画面，用户镜头进入画中画。', context: '数字人连接后进入实时对话。', problem: '临场感会放大延迟与画面竞争。', decision: '固定主次层级与控制位置。', impact: '互动变化，操作逻辑不变。' },
  }}),
  'web-login': item({ id: 'web-login', platform: 'web', duration: 5.3, width: 1291, height: 816, audio: false, copy: {
    en: { title: 'Web entry and sign in', description: 'A browser entry that preserves the App’s product identity.', context: 'The user enters ConvoAI in a browser.', problem: 'The Web entry must preserve the same product identity as App.', decision: 'Use Web sign-in as an equivalent cross-platform starting task.', impact: 'Both platforms begin with the same product identity and destination.' },
    zh: { title: 'Web 登录与进入', description: '沿用 App 的产品身份与任务起点。', context: '用户从浏览器进入 ConvoAI。', problem: '入口差异会割裂跨端认知。', decision: '统一产品识别和任务去向。', impact: '换端后仍从熟悉的路径开始。' },
  }}),
  'web-preflight': item({ id: 'web-preflight', platform: 'web', duration: 25.267, width: 1290, height: 816, audio: false, copy: {
    en: { title: 'Web preflight setup', description: 'Agent and phone-number choices before launch.', context: 'The user selects an agent and phone number before launch.', problem: 'The larger canvas increases configuration density.', decision: 'Expand pre-call configuration while preserving a clear launch sequence.', impact: 'Web carries more configuration while preserving a clear launch path.' },
    zh: { title: 'Web 启动前设置', description: '展开配置，同时固定启动操作。', context: '启动前选择 Agent 与电话号码。', problem: '配置项会与开始操作竞争。', decision: '按任务顺序组织配置。', impact: '准备过程中无需重新寻找入口。' },
  }}),
  'web-preflight-layout': item({ id: 'web-preflight-layout', platform: 'web', duration: 17.928, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Agent selection layout', description: 'Agent comparison with a stable primary action.', context: 'The user browses agents and confirms the main action.', problem: 'Fast comparison must coexist with a large agent set.', decision: 'Combine central overview, horizontal selection, and a stable call action.', impact: 'The user can compare agents and launch without leaving the main view.' },
    zh: { title: '在比较中保留启动入口', description: '概览、切换与主操作分层呈现。', context: '用户比较多个 Agent。', problem: '候选列表会挤占详情与操作。', decision: '中央展示详情，横向切换角色。', impact: '比较与启动留在同一视图。' },
  }}),
  'web-join-exit': item({ id: 'web-join-exit', platform: 'web', duration: 22.598, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Join and exit a session', description: 'Clear feedback at each session boundary.', context: 'The user starts an agent, enters the call, then exits.', problem: 'Loading, service readiness, time limits, and exit are distinct system states.', decision: 'Use joined, limited-session, and exit feedback to mark the boundary.', impact: 'The user can tell when the session is usable and where exit leads.' },
    zh: { title: '标清会话的开始与结束', description: '加入、时限与退出共同划出会话边界。', context: '用户进入并退出一次会话。', problem: '加载、可用与结束容易混淆。', decision: '在边界处显示明确状态。', impact: '用户知道何时可用、退出后去哪里。' },
  }}),
  'web-conversation': item({ id: 'web-conversation', platform: 'web', duration: 35.135, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Continuous Web conversation', description: 'Transcript, orb, and call controls in one conversation view.', context: 'The user holds a continuous real-time conversation.', problem: 'Transcript, orb, voice input, captions, and sidebar compete for attention.', decision: 'Layer transcript with the central orb while keeping controls stable and the agent rail collapsible.', impact: 'Turn state and agent context remain readable during a long exchange.' },
    zh: { title: '让长对话仍有清楚的焦点', description: '当前话轮占据主舞台，Agent 侧栏可收起。', context: '文本、状态与 Agent 信息同时存在。', problem: '信息全展开会挤压当前话轮。', decision: '固定高频控制，收起低频信息。', impact: '长对话仍聚焦当前轮次。' },
  }}),
  'web-interrupt': item({ id: 'web-interrupt', platform: 'web', duration: 11.482, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Interrupt by voice', description: 'Voice interruption and recovery across synchronized states.', context: 'The AI is responding when the user changes direction by voice.', problem: 'Interruption must synchronize audio, transcript, orb, state, and new intent.', decision: 'Keep interrupted content visible, enter Thinking, then recover into the new response.', impact: 'The user regains the turn without losing conversational context.' },
    zh: { title: '打断后，接住新的意图', description: '停止旧回答，转入思考，再回应新意图。', context: '用户在 AI 回答中途插话。', problem: '反馈不同步，会让打断结果不明确。', decision: '停止声音、保留文本并进入 Thinking。', impact: '用户确认已拿回话轮。' },
  }}),
  'web-realtime-data': item({ id: 'web-realtime-data', platform: 'web', duration: 26.457, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Real-time observability', description: 'Latency and voiceprint states beside the active conversation.', context: 'A developer or presenter inspects a live conversation.', problem: 'A continuous answer passes through RTC, ASR, LLM, TTS, and the end-to-end path.', decision: 'Expose each processing stage beside the active conversation with a Voiceprint status entry.', impact: 'The experience and its real-time processing chain can be read together.' },
    zh: { title: '一次回答背后的实时数据', description: '处理阶段按顺序出现在对话旁。', context: '演示者边对话，边查看实时数据。', problem: '只看结果，无法判断等待来源。', decision: '按链路排列各阶段数据。', impact: '回答与后台过程直接对应。' },
  }}),
};

export function getConvoAiMedia(id: ConvoAiMediaId) {
  return convoAiMedia[id];
}
