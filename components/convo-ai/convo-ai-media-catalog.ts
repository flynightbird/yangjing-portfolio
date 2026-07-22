import type { Locale } from '@/content/types';

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
  readonly copy: Record<Locale, LocalizedCopy>;
}

type ItemInput = Omit<ConvoAiMediaItem, 'src' | 'poster'>;

function item(input: ItemInput): ConvoAiMediaItem {
  return {
    ...input,
    src: `/videos/convo-ai/${input.id}.mp4`,
    poster: `/images/convo-ai/posters/${input.id}.webp`,
  };
}

export const convoAiMedia: Record<ConvoAiMediaId, ConvoAiMediaItem> = {
  'app-login': item({ id: 'app-login', platform: 'app', duration: 3.2, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'App entry and sign in', description: 'Complete shipped App entry recording.', context: 'The user enters ConvoAI.', problem: 'The product and primary route must be recognizable immediately.', decision: 'Keep the short entry sequence intact as orientation evidence.', impact: 'The reviewer can locate the start of the mobile journey.' },
    zh: { title: 'App 登录与进入', description: '完整的已上线 App 入口录屏。', context: '用户进入 ConvoAI。', problem: '产品身份与主要入口需要被立即识别。', decision: '完整保留入口过程，交代移动端体验从哪里开始。', impact: '评审可以快速理解用户进入产品后的第一步。' },
  }}),
  'app-structure': item({ id: 'app-structure', platform: 'app', duration: 9.357, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'Product structure', description: 'Complete App navigation and product-map recording.', context: 'The user scans agents, profile, and device entry points.', problem: 'Several conversation resources need a clear hierarchy.', decision: 'Use the complete walkthrough to establish the product map.', impact: 'Later settings, device, and call evidence has a clear location.' },
    zh: { title: '产品页面结构', description: '完整的 App 导航与产品地图录屏。', context: '用户浏览代理、个人入口与设备入口。', problem: '多类对话资源需要形成清晰主次。', decision: '用完整导览呈现 Agent、个人设置与设备入口之间的层级。', impact: '后续设置、设备与通话流程都能回到清晰的产品位置。' },
  }}),
  'app-conversation-start': item({ id: 'app-conversation-start', platform: 'app', duration: 12.134, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'Start a conversation', description: 'Complete permission, connection, and readiness sequence.', context: 'The user initiates an AI call.', problem: 'Permission and connection can feel like unresponsive waiting.', decision: 'Show microphone permission, connection, and readiness as one continuous sequence.', impact: 'Intended effect: make the moment to begin speaking legible.' },
    zh: { title: '启动对话', description: '完整的权限、连接与就绪过程。', context: '用户发起一次 AI 对话。', problem: '权限与连接容易被视为无反馈等待。', decision: '连续显示麦克风权限、连接和对话就绪。', impact: '预期让用户理解何时可以开始说话。' },
  }}),
  'app-caption-camera': item({ id: 'app-caption-camera', platform: 'app', duration: 22.833, width: 220, height: 480, audio: true, copy: {
    en: { title: 'Captions and camera interaction', description: 'Complete 22.833-second multimodal conversation chain.', context: 'A live call moves from captions and orb feedback into camera understanding.', problem: 'Text, video, AI output, and call controls compete for attention.', decision: 'Preserve the complete causal sequence and explain state changes outside the recording.', impact: 'Intended effect: retain both real-time continuity and legibility.' },
    zh: { title: '字幕与摄像头互动', description: '完整呈现字幕、球体、摄像头与通话控件的同步变化。', context: '用户在持续对话中打开字幕与摄像头。', problem: '声音、文字、视频和 AI 状态同时变化，容易争夺注意力。', decision: '保持通话控制稳定，并让字幕、球体与摄像头反馈跟随同一话轮更新。', impact: '设计意图是让用户在信息增加后仍能理解 AI 当前的响应状态。' },
  }}),
  'app-profile-settings': item({ id: 'app-profile-settings', platform: 'app', duration: 27.834, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'Personal settings', description: 'Complete profile and preference update recording.', context: 'The user changes identity and personal preferences.', problem: 'Settings need continuous feedback so completion is not ambiguous.', decision: 'Keep entry, modification, confirmation, and return in one flow.', impact: 'Intended effect: make identity and saved state clearer.' },
    zh: { title: '个人设置', description: '完整的个人信息与偏好设置录屏。', context: '用户修改头像与个人偏好。', problem: '设置操作需要连续反馈，避免怀疑是否生效。', decision: '完整呈现进入、修改、确认和返回。', impact: '预期让设置结果与个人身份更清晰。' },
  }}),
  'app-voiceprint-lock': item({ id: 'app-voiceprint-lock', platform: 'app', duration: 23.834, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'Voiceprint lock', description: 'Complete voiceprint mode and enrollment recording.', context: 'The user wants the agent to respond to their voice amid surrounding speech.', problem: 'Voice identity adds enrollment cost and recovery expectations.', decision: 'Offer Off, Seamless, and Personalized modes with explicit recording and upload states.', impact: 'Intended effect: clarify who the agent is listening to and expose the convenience-control tradeoff.' },
    zh: { title: '声纹锁定', description: '完整的声纹模式与录入过程。', context: '用户希望 Agent 在周围有人说话时只响应本人。', problem: '声纹同时带来身份预期、录入成本与失败恢复。', decision: '提供 Off、Seamless、Personalized 三种模式，并明确录音与上传状态。', impact: '预期说明 Agent 正在听谁，并呈现便利性与控制感的取舍。' },
  }}),
  'app-hardware-device': item({ id: 'app-hardware-device', platform: 'app', duration: 14.167, width: 448, height: 960, audio: true, copy: {
    en: { title: 'Bind a hardware device', description: 'Complete environment preparation and device scan recording.', context: 'The user binds an external device for the conversation.', problem: 'Bluetooth, Wi-Fi, location, and scan states belong to different system layers.', decision: 'Arrange environment readiness and scanning as one continuous task.', impact: 'Intended effect: show whether the device has entered a connectable state.' },
    zh: { title: '绑定硬件设备', description: '完整的环境准备与设备扫描录屏。', context: '用户为对话绑定外部设备。', problem: '蓝牙、Wi-Fi、定位与扫描分属不同系统阶段。', decision: '把环境准备与扫描放在一条连续任务中。', impact: '预期让用户判断设备是否进入可连接流程。' },
  }}),
  'app-avatar-select': item({ id: 'app-avatar-select', platform: 'app', duration: 9.967, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'Choose a digital human', description: 'Complete avatar selection recording.', context: 'The user selects a digital human from a character library.', problem: 'Selection needs to establish an expectation for the next conversation.', decision: 'Connect character choice directly to agent configuration.', impact: 'Intended effect: make the choice more than an isolated visual skin.' },
    zh: { title: '选择数字人', description: '完整的数字人选择录屏。', context: '用户在角色库中选择数字人。', problem: '选择需要与后续对话建立预期。', decision: '选择角色后直接回到 Agent 配置，让选择进入下一步对话流程。', impact: '设计意图是让角色选择与后续互动建立连续关系。' },
  }}),
  'app-avatar-interaction': item({ id: 'app-avatar-interaction', platform: 'app', duration: 8.893, width: 592, height: 1280, audio: true, copy: {
    en: { title: 'Interact with a digital human', description: 'Complete avatar connection, call, and camera sequence.', context: 'The avatar connects, talks, and opens the camera.', problem: 'Social presence amplifies sync, latency, and picture-in-picture competition.', decision: 'Keep connection, turn state, camera, and picture-in-picture in one continuous transition.', impact: 'Intended effect: preserve state understanding within a stronger sense of presence.' },
    zh: { title: '数字人互动', description: '完整的数字人连接、对话与摄像头过程。', context: '数字人连接、对话并开启摄像头。', problem: '社会临场感会放大音画同步、延迟与画中画竞争。', decision: '在同一流程中呈现连接、话轮、摄像头与画中画变化。', impact: '设计意图是在临场感增强后，用户仍能看懂当前通话状态。' },
  }}),
  'web-login': item({ id: 'web-login', platform: 'web', duration: 5.3, width: 1291, height: 816, audio: false, copy: {
    en: { title: 'Web entry and sign in', description: 'Complete browser entry recording.', context: 'The user enters ConvoAI in a browser.', problem: 'The Web entry must preserve the same product identity as App.', decision: 'Use the Web login as an equivalent cross-platform starting task.', impact: 'The reviewer can compare both platform entry points.' },
    zh: { title: 'Web 登录与进入', description: '完整的浏览器入口录屏。', context: '用户从浏览器进入 ConvoAI。', problem: 'Web 入口需要保留与 App 一致的产品认知。', decision: '把 Web 登录作为等价的跨端起点。', impact: '评审可以对照两端入口。' },
  }}),
  'web-preflight': item({ id: 'web-preflight', platform: 'web', duration: 25.267, width: 1290, height: 816, audio: false, copy: {
    en: { title: 'Web preflight setup', description: 'Complete agent and phone-number setup recording.', context: 'The user selects an agent and phone number before launch.', problem: 'The larger canvas increases configuration density.', decision: 'Expand pre-call configuration while preserving a clear launch sequence.', impact: 'Intended effect: explain how the shared product model adapts to Web.' },
    zh: { title: 'Web 启动前设置', description: '完整的代理与电话号码设置录屏。', context: '用户选择代理与电话号码，准备启动。', problem: '大屏幕的配置密度更高。', decision: '在大屏中展开通话前配置，同时保留明确的启动顺序。', impact: '设计意图是让 Web 承载更多配置，但不增加启动路径的理解成本。' },
  }}),
  'web-preflight-layout': item({ id: 'web-preflight-layout', platform: 'web', duration: 17.928, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Agent selection layout', description: 'Complete preflight browsing and primary-action recording.', context: 'The user browses agents and confirms the main action.', problem: 'Fast comparison must coexist with a large agent set.', decision: 'Combine central overview, horizontal selection, and a stable call action.', impact: 'Intended effect: compare and launch without leaving the main view.' },
    zh: { title: '启动前 Agent 布局', description: '完整的启动前浏览与主操作录屏。', context: '用户浏览 Agent 并确认主操作。', problem: '较多 Agent 需要兼顾信息密度与快速选择。', decision: '结合中央概览、横向快速选择与稳定主操作。', impact: '预期在不离开主视图时完成比较与启动。' },
  }}),
  'web-join-exit': item({ id: 'web-join-exit', platform: 'web', duration: 22.598, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Join and exit a session', description: 'Complete session-boundary recording.', context: 'The user starts an agent, enters the call, then exits.', problem: 'Loading, service readiness, time limits, and exit are distinct system states.', decision: 'Use joined, limited-session, and exit feedback to mark the boundary.', impact: 'Intended effect: clarify when the session is usable and where exit leads.' },
    zh: { title: '加入与退出会话', description: '完整的会话边界录屏。', context: '用户启动 Agent，进入会话后主动退出。', problem: '加载、服务就绪、会话时限与退出是不同状态。', decision: '用 Joined、Session limited 与退出反馈建立边界。', impact: '预期说明会话何时可用以及退出后去向。' },
  }}),
  'web-conversation': item({ id: 'web-conversation', platform: 'web', duration: 35.135, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Continuous Web conversation', description: 'Complete transcript, orb, and call-control interaction.', context: 'The user holds a continuous real-time conversation.', problem: 'Transcript, orb, voice input, captions, and sidebar compete for attention.', decision: 'Layer transcript with the central orb while keeping controls stable and the agent rail collapsible.', impact: 'Intended effect: retain turn readability and agent context during a long exchange.' },
    zh: { title: 'Web 连续聊天', description: '完整的文本、球体与通话控制互动。', context: '用户与 AI 进行连续实时对话。', problem: '文本、球体、语音、字幕与侧栏竞争注意力。', decision: '叠合对话记录与中央球体，保持控件稳定、侧栏可收起。', impact: '预期在长对话中保持话轮和 Agent 上下文可读。' },
  }}),
  'web-interrupt': item({ id: 'web-interrupt', platform: 'web', duration: 11.482, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Interrupt by voice', description: 'Complete voice-interruption and recovery recording.', context: 'The AI is responding when the user changes direction by voice.', problem: 'Interruption must synchronize audio, transcript, orb, state, and new intent.', decision: 'Keep interrupted content visible, enter Thinking, then recover into the new response.', impact: 'Intended effect: return the turn without hiding conversational context.' },
    zh: { title: '语音打断', description: '完整的语音打断与恢复录屏。', context: 'AI 正在回答，用户通过语音更正方向。', problem: '打断要同步声音、文本、球体、状态与新意图。', decision: '保留 Interrupted 内容，进入 Thinking 后恢复新回答。', impact: '预期让用户夺回话轮且不隐藏上下文。' },
  }}),
  'web-realtime-data': item({ id: 'web-realtime-data', platform: 'web', duration: 26.457, width: 2486, height: 1598, audio: false, copy: {
    en: { title: 'Real-time observability', description: 'Complete layered latency and voiceprint-state recording.', context: 'A developer or presenter inspects live conversation performance.', problem: 'Perceived delay can originate in RTC, ASR, LLM, TTS, or the end-to-end path.', decision: 'Expose layered latency inside the conversation context with a Voiceprint status entry.', impact: 'Intended effect: turn a vague sense of slowness into discussable system evidence.' },
    zh: { title: '一次回答背后的实时数据', description: '完整呈现对话旁的 E2E、RTC、ASR、LLM、TTS 与 Voiceprint 数据。', context: '一次 AI 回答正在被识别、生成、合成并播放。', problem: '用户听到的是连续回答，演示现场需要同时看见它经过的处理阶段。', decision: '把各阶段数据保留在正在发生的对话旁，并按处理链路组织。', impact: '设计意图是让体验现场与实时处理过程可以被同时理解。' },
  }}),
};

export function getConvoAiMedia(id: ConvoAiMediaId) {
  return convoAiMedia[id];
}
