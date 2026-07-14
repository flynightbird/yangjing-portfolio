/* =====================================================================
   声网 STT — Interactive Prototype Logic
   ===================================================================== */

(function () {
  "use strict";

  // ===================================================================
  // STATE
  // ===================================================================
  const state = {
    page: "landing",
    locale: "zh",
    sessionStarted: false,
    landingLoggedIn: false,
    panelVisible: true,
    sidePanelMode: "standard",
    sessionDrawerOpen: false,
    currentTab: "participants",
    prestartMode: "create",

    roomId: "A7Q3K9",
    joinRoomId: "",
    nickname: "刘泽远",
    avatarChar: "刘",
    sourceLanguage: "zh-CN",
    multiSourceLanguages: ["zh-CN", "en-US"],
    targetLanguage: "en-US",
    targetLanguages: ["en-US"],
    recognitionMode: "auto",
    singleLanguage: "zh-CN",

    micEnabled: false,
    camEnabled: false,
    micAuthorized: false,
    camAuthorized: true,
    cameraPreviewOpen: true,
    micSelection: "macbook",
    camSelection: "facetime",
    micError: false,
    camError: false,

    countdown: 600,
    countdownTimer: null,
    streamTimer: null,
    levelTimer: null,
    emptyRailAccentTimer: null,
    emptyRailIdleTimer: null,

    subtitleDisplay: "both",
    history: [],
    currentUtterance: null,
    currentDisplay: null,
    stageState: "idle", // idle | receiving | waiting | paired | timeout
    currentSpeakerId: null,
    activeUntil: {}, // {pid: timestamp}
    participantsExpanded: false,

    drawerKey: null
  };

  const MIN_STAGE_READABLE_WIDTH = 680;
  const SIDE_PANEL_TIERS = [
    { name: "spacious", minViewport: 1366, width: 360 },
    { name: "standard", minViewport: 1180, width: 320 },
    { name: "compact", minViewport: 1024, width: 280 },
    { name: "min", minViewport: 0, width: 240 }
  ];

  // ===================================================================
  // DATA
  // ===================================================================
  const languages = [
    { value: "zh-CN", label: "中文", full: "普通话 · zh-CN" },
    { value: "en-US", label: "English", full: "English · en-US" },
    { value: "ja-JP", label: "日本語", full: "日本語 · ja-JP" },
    { value: "de-DE", label: "Deutsch", full: "Deutsch · de-DE" }
  ];

  const micDevices = [
    { id: "off", name: "关闭麦克风" },
    { id: "macbook", name: "MacBook Pro 麦克风" },
    { id: "shure", name: "Shure MV7" },
    { id: "logi", name: "Logi Yeti GX" }
  ];
  const camDevices = [
    { id: "off", name: "关闭摄像头" },
    { id: "facetime", name: "FaceTime HD Camera" },
    { id: "sony", name: "Sony ZV-E10" },
    { id: "obs", name: "OBS Virtual Camera" }
  ];

  const avatarPalette = Array.from({ length: 8 }, (_, index) => `var(--stt-component-participant-avatar-palette-${index})`);

  const participants = [
    { id: "self",  name: "刘泽远",  short: "刘", role: "我 · 主持人",     camera: false, mic: false, self: true,  color: avatarPalette[0] },
    { id: "p2",    name: "王静",    short: "王", role: "产品经理",          camera: true,  mic: true,  self: false, color: avatarPalette[1], video: "assets/participants/video-1.jpg" },
    { id: "p3",    name: "陈远航",   short: "陈", role: "解决方案顾问",     camera: false, mic: true,  self: false, color: avatarPalette[2] },
    { id: "p4",    name: "林语舟",   short: "林", role: "设计负责人",       camera: false, mic: false, self: false, color: avatarPalette[3] },
    { id: "p5",    name: "苏若白",   short: "苏", role: "研发代表",          camera: true,  mic: false, self: false, color: avatarPalette[4], video: "assets/participants/video-3.jpg" },
    { id: "p6",    name: "乔以安",   short: "乔", role: "海外销售",          camera: false, mic: true,  self: false, color: avatarPalette[5] },
    { id: "p7",    name: "周岚",    short: "周", role: "客户成功",          camera: true,  mic: false, self: false, color: avatarPalette[6], video: "assets/participants/video-2.jpg" },
    { id: "p8",    name: "沈拓",    short: "沈", role: "实施经理",          camera: false, mic: false, self: false, color: avatarPalette[7] }
  ];

  const utteranceScript = [
    {
      speakerId: "p2",
      original: "我们先把房间级语言和术语配置确认一下，避免发布会现场出现关键名词误译。",
      translated: "Let's first confirm the room-level language and terminology settings so key terms won't be mistranslated during the launch.",
      receiveMs: 2400, translateMs: 1600
    },
    {
      speakerId: "p6",
      original: "海外销售会直接用这个页面做现场演示，所以开始前的准备区必须一屏看完。",
      translated: "The global sales team will demo directly from this page, so the before-start preparation area must fit on one screen.",
      receiveMs: 2200, translateMs: 1900
    },
    {
      speakerId: "p7",
      original: "扫码查看和悬浮插件都应该是轻量接入层，不要抢主舞台的注意力。",
      translated: "Both QR viewing and the floating plugin should stay lightweight access layers and never compete with the main stage.",
      receiveMs: 2100, translateMs: 1700
    },
    {
      speakerId: "self",
      original: "当前一句严格只承载一位发言人，多人连续切换由历史流和参会区来承接。",
      translated: "The current utterance stage holds only one speaker at a time; rapid handoffs are absorbed by history and participants.",
      receiveMs: 2200, translateMs: 1800
    },
    {
      speakerId: "p3",
      original: "翻译超时的兜底很重要，宁可只展示原文，也不要让舞台空着。",
      translated: "Translation timeout fallback matters — show the original text rather than leaving the stage empty.",
      receiveMs: 2000, translateMs: 5500, forceTimeout: true
    }
  ];

  const heroSnipUtterances = [
    {
      original: "现在发言、转录与翻译\n在同一块舞台同步呈现。",
      translation: "Speech, transcription, and translation now arrive together on the same stage."
    },
    {
      original: "扫码或悬浮插件\n作为轻量接入，不抢主舞台。",
      translation: "QR or the floating plugin sits as a lightweight access layer, never competing with the stage."
    },
    {
      original: "翻译晚于转录，配对提交\n让历史流保持稳定。",
      translation: "Translation arrives after transcription; paired commits keep the history stream stable."
    }
  ];

  const advancedConfigs = {
    context: {
      title: "通用上下文",
      desc: "领域、主题、角色等结构化数据",
      json: {
        domain: "企业软件",
        topic: "实时字幕产品发布准备",
        roles: ["主持人", "产品经理", "解决方案顾问"]
      }
    },
    reference: {
      title: "背景参考文本",
      desc: "传入背景资料，提升语义理解",
      json: {
        reference_text: "本次讨论聚焦 STT Web 产品的房间共享语言配置、参会者状态联动、字幕 paired final 渲染逻辑。"
      }
    },
    hotwords: {
      title: "自定义 ASR 热词",
      desc: "提升罕见词 / 品牌词 / 人名识别率",
      json: { hotwords: ["paired final", "room id", "Shure MV7", "悬浮字幕插件", "刘泽远"] }
    },
    terms: {
      title: "翻译术语",
      desc: "指定源词 → 目标词的翻译映射",
      json: {
        terms: [
          { source: "悬浮字幕插件", target: "floating subtitle plugin" },
          { source: "房间共享配置", target: "room-shared settings" }
        ]
      }
    }
  };

  // ===================================================================
  // SVG helpers (Lucide-style line; remix-style fill for dock)
  // ===================================================================
  const svgs = {
    micOn: (size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9998 1C14.7612 1 16.9998 3.23858 16.9998 6V10C16.9998 12.7614 14.7612 15 11.9998 15C9.23833 15 6.99976 12.7614 6.99976 10V6C6.99976 3.23858 9.23833 1 11.9998 1ZM3.05469 11H5.07065C5.55588 14.3923 8.47329 17 11.9998 17C15.5262 17 18.4436 14.3923 18.9289 11H20.9448C20.4837 15.1716 17.1714 18.4839 12.9998 18.9451V23H10.9998V18.9451C6.82814 18.4839 3.51584 15.1716 3.05469 11Z"/></svg>`,
    micOff: (size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4249 17.839C15.3929 18.4228 14.2341 18.8087 13.0002 18.9451V23H11.0002V18.9451C6.82854 18.4839 3.51623 15.1716 3.05509 11H5.07105C5.55627 14.3923 8.47368 17 12.0002 17C13.0503 17 14.0464 16.7688 14.9404 16.3544L13.3902 14.8042C12.9489 14.9317 12.4825 15 12.0002 15C9.23873 15 7.00016 12.7614 7.00016 10V8.41421L1.39355 2.80761L2.80777 1.3934L22.6068 21.1924L21.1925 22.6066L16.4249 17.839ZM19.3747 15.1604L17.9323 13.7179C18.4407 12.9084 18.788 11.9874 18.9293 11H20.9452C20.7754 12.5366 20.2187 13.9565 19.3747 15.1604ZM16.4658 12.2514L7.68575 3.47139C8.55427 1.99268 10.1613 1 12.0002 1C14.7616 1 17.0002 3.23858 17.0002 6V10C17.0002 10.8099 16.8076 11.5748 16.4658 12.2514Z"/></svg>`,
    camOn: (size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M17 9.2L22.2133 5.55071C22.4395 5.39235 22.7513 5.44737 22.9096 5.6736C22.9684 5.75764 23 5.85774 23 5.96033V18.0397C23 18.3158 22.7761 18.5397 22.5 18.5397C22.3974 18.5397 22.2973 18.5081 22.2133 18.4493L17 14.8V19C17 19.5523 16.5523 20 16 20H2C1.44772 20 1 19.5523 1 19V5C1 4.44772 1.44772 4 2 4H16C16.5523 4 17 4.44772 17 5V9.2ZM5 8V10H7V8H5Z"/></svg>`,
    camOff: (size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M17 18.4142L21.1925 22.6067L22.6067 21.1925L2.80769 1.39349L1.39348 2.80771L2.58579 4.00001H2C1.44772 4.00001 1 4.44773 1 5.00001V19C1 19.5523 1.44772 20 2 20H16C16.5523 20 17 19.5523 17 19V18.4142ZM16 4.00001H8.21402L22.7083 18.4943C22.8805 18.4153 23 18.2415 23 18.0397V5.96034C23 5.85776 22.9684 5.75765 22.9096 5.67361C22.7513 5.44739 22.4395 5.39237 22.2133 5.55073L17 9.20001V5.00001C17 4.44773 16.5523 4.00001 16 4.00001Z"/></svg>`,
    micWarn: (size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9998 1C14.7612 1 16.9998 3.23858 16.9998 6V10C16.9998 12.7614 14.7612 15 11.9998 15C9.23833 15 6.99976 12.7614 6.99976 10V6C6.99976 3.23858 9.23833 1 11.9998 1ZM3.05469 11H5.07065C5.55588 14.3923 8.47329 17 11.9998 17C15.5262 17 18.4436 14.3923 18.9289 11H20.9448C20.4837 15.1716 17.1714 18.4839 12.9998 18.9451V23H10.9998V18.9451C6.82814 18.4839 3.51584 15.1716 3.05469 11Z"/><circle cx="20" cy="5" r="3" fill="#f5a623"/></svg>`,
    chevDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12.5 10 17l9-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15.7279 4.51192L19.4881 8.27208L7.76016 20H4V16.2398L15.7279 4.51192ZM17.0812 3.15864L18.2227 2.01712C18.6132 1.6266 19.2464 1.6266 19.6369 2.01712L21.9829 4.36306C22.3734 4.75359 22.3734 5.38675 21.9829 5.77728L20.8414 6.9188L17.0812 3.15864Z" fill="currentColor"/></svg>',
    arrowRight: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    eyeFill: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12ZM12.0003 17C14.7617 17 17.0003 14.7614 17.0003 12C17.0003 9.23858 14.7617 7 12.0003 7C9.23884 7 7.00026 9.23858 7.00026 12C7.00026 14.7614 9.23884 17 12.0003 17ZM12.0003 15C10.3434 15 9.00026 13.6569 9.00026 12C9.00026 10.3431 10.3434 9 12.0003 9C13.6571 9 15.0003 10.3431 15.0003 12C15.0003 13.6569 13.6571 15 12.0003 15Z"/></svg>`,
    eyeOffFill: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.52047 5.93457L1.39366 2.80777L2.80788 1.39355L22.6069 21.1925L21.1927 22.6068L17.8827 19.2968C16.1814 20.3755 14.1638 21.0002 12.0003 21.0002C6.60812 21.0002 2.12215 17.1204 1.18164 12.0002C1.61832 9.62282 2.81932 7.5129 4.52047 5.93457ZM14.7577 16.1718L13.2937 14.7078C12.902 14.8952 12.4634 15.0002 12.0003 15.0002C10.3434 15.0002 9.00026 13.657 9.00026 12.0002C9.00026 11.537 9.10522 11.0984 9.29263 10.7067L7.82866 9.24277C7.30514 10.0332 7.00026 10.9811 7.00026 12.0002C7.00026 14.7616 9.23884 17.0002 12.0003 17.0002C13.0193 17.0002 13.9672 16.6953 14.7577 16.1718ZM7.97446 3.76015C9.22127 3.26959 10.5793 3.00016 12.0003 3.00016C17.3924 3.00016 21.8784 6.87992 22.8189 12.0002C22.5067 13.6998 21.8038 15.2628 20.8068 16.5925L16.947 12.7327C16.9821 12.4936 17.0003 12.249 17.0003 12.0002C17.0003 9.23873 14.7617 7.00016 12.0003 7.00016C11.7514 7.00016 11.5068 7.01833 11.2677 7.05343L7.97446 3.76015Z"/></svg>`,
    micSmall: (off, opacity = 1) => off ? svgs.micOff(14).replace("<svg ", `<svg style="opacity:${opacity}" `) : svgs.micOn(14).replace("<svg ", `<svg style="opacity:${opacity}" `),
    camSmall: (off, opacity = 1) => off ? svgs.camOff(14).replace("<svg ", `<svg style="opacity:${opacity}" `) : svgs.camOn(14).replace("<svg ", `<svg style="opacity:${opacity}" `)
  };

  // ===================================================================
  // ELEMENTS
  // ===================================================================
  const $ = id => document.getElementById(id);
  const ref = {
    pageLanding: $("pageLanding"),
    pageProduct: $("pageProduct"),

    landCtaBtn: $("landCtaBtn"),
    landLangBtn: $("landLangBtn"),
    landLangPopover: $("landLangPopover"),
    landLoginBtn: $("landLoginBtn"),
    landUserAvatar: $("landUserAvatar"),

    prestartBackBtn: $("prestartBackBtn"),
    topbarRoomLabel: $("topbarRoomLabel"),
    topbarRoomText: $("topbarRoomText"),
    copyRoomBtn: $("copyRoomBtn"),
    roomInfoBtn: $("roomInfoBtn"),
    roomInfoPopover: $("roomInfoPopover"),
    roomInfoRoom: $("roomInfoRoom"),
    roomInfoUid: $("roomInfoUid"),
    roomInfoAgent: $("roomInfoAgent"),
    statusPill: $("statusPill"),
    countdownText: $("countdownText"),
    accessAnchor: $("accessAnchor"),
    accessBtn: $("accessBtn"),
    accessMenu: $("accessMenu"),
    sideToggleBtn: $("sideToggleBtn"),
    sessionDrawerCloseBtn: $("sessionDrawerCloseBtn"),
    avatarBtn: $("avatarBtn"),
    avatarMenu: $("avatarMenu"),
    logoutBtn: $("logoutBtn"),

    layout: $("layout"),
    sideArea: $("sideArea"),

    emptyStage: $("emptyStage"),
    emptyRail: $("emptyRail"),
    prestartResponsiveStatus: $("prestartResponsiveStatus"),
    prestartResponsiveMode: $("prestartResponsiveMode"),
    prestartResponsiveRoom: $("prestartResponsiveRoom"),
    prestartResponsiveRecognition: $("prestartResponsiveRecognition"),
    prestartResponsiveTarget: $("prestartResponsiveTarget"),
    sessionStage: $("sessionStage"),

    stageSourceLabel: $("stageSourceLabel"),
    stageTargetLabel: $("stageTargetLabel"),
    stageSubtitleDisplayBtn: $("stageSubtitleDisplayBtn"),
    stageSubtitleDisplayLabel: $("stageSubtitleDisplayLabel"),
    stageSubtitleDisplayPopover: $("stageSubtitleDisplayPopover"),
    stageTargetLanguageBtn: $("stageTargetLanguageBtn"),
    stageTargetLanguageLabel: $("stageTargetLanguageLabel"),
    stageTargetLanguagePopover: $("stageTargetLanguagePopover"),

    subtitleFlow: $("subtitleFlow"),
    subtitleJumpBottom: $("subtitleJumpBottom"),
    historyTrack: $("historyTrack"),
    currentUtt: $("currentUtt"),
    uttAvatar: $("uttAvatar"),
    uttSpeakerName: $("uttSpeakerName"),
    uttSpeakerRole: $("uttSpeakerRole"),
    uttWave: $("uttWave"),
    preReceive: $("preReceive"),
    uttOriginal: $("uttOriginal"),
    uttTranslation: $("uttTranslation"),

    dock: $("dock"),
    dockMicBtn: $("dockMicBtn"),
    dockMicIcon: $("dockMicIcon"),
    dockMicChev: $("dockMicChev"),
    dockMicPop: $("dockMicPop"),
    dockCamBtn: $("dockCamBtn"),
    dockCamIcon: $("dockCamIcon"),
    dockCamChev: $("dockCamChev"),
    dockCamPop: $("dockCamPop"),
    hangupBtn: $("hangupBtn"),

    prestartPanel: $("prestartPanel"),
    sessionPanel: $("sessionPanel"),
    sessionDrawerBackdrop: $("sessionDrawerBackdrop"),
    segBody: $("segBody"),

    advOverlay: $("advOverlay"),
    advGrid: $("advGrid"),

    drawer: $("drawer"),
    drawerTitle: $("drawerTitle"),
    drawerDesc: $("drawerDesc"),
    jsonEditor: $("jsonEditor"),
    jsonValidity: $("jsonValidity"),
    formatJsonBtn: $("formatJsonBtn"),
    drawerCloseBtn: $("drawerCloseBtn"),
    drawerCancelBtn: $("drawerCancelBtn"),
    drawerSaveBtn: $("drawerSaveBtn"),

    confirmOverlay: $("confirmOverlay"),
    confirmText: $("confirmText"),
    confirmCancel: $("confirmCancel"),
    confirmApply: $("confirmApply"),

    qrRoomId: $("qrRoomId"),
    toastStack: $("toastStack")
  };
  const prefersFinePointer = window.matchMedia("(pointer: fine)");
  const roomDetail = {
    uid: "157720",
    agent: "A42AF77KN62NJ85VP42DD44PA97EJ47C"
  };

  let pendingConfirm = null;
  let roomInfoCloseTimer = null;

  // ===================================================================
  // UTILITIES
  // ===================================================================
  function toast(text) {
    const t = document.createElement("div");
    t.className = "toast stt-toast";
    t.textContent = text;
    ref.toastStack.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  function copyRoomId() {
    navigator.clipboard?.writeText(state.roomId);
    toast("房间号已复制");
  }

  function copyText(text, message) {
    navigator.clipboard?.writeText(text);
    toast(message);
  }

  function syncLandingAuth() {
    ref.landLoginBtn?.classList.toggle("hidden", state.landingLoggedIn);
    ref.landUserAvatar?.classList.toggle("hidden", !state.landingLoggedIn);
    if (ref.landUserAvatar) {
      ref.landUserAvatar.textContent = state.avatarChar;
      ref.landUserAvatar.style.setProperty("--av", avatarPalette[0]);
    }
  }

  function syncLandingLanguagePopover() {
    const isOpen = Boolean(ref.landLangPopover && !ref.landLangPopover.classList.contains("hidden"));
    ref.landLangBtn?.setAttribute("aria-expanded", String(isOpen));
    ref.landLangPopover?.querySelectorAll("[data-land-locale]").forEach(button => {
      const selected = button.dataset.landLocale === state.locale;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-selected", String(selected));
    });
  }

  function positionLandingLanguagePopover() {
    if (!ref.landLangPopover || !ref.landLangBtn) return;
    const rect = ref.landLangBtn.getBoundingClientRect();
    const width = 140;
    ref.landLangPopover.style.setProperty("--stt-root-popover-width", `${width}px`);
    ref.landLangPopover.style.left = `${Math.min(rect.left, window.innerWidth - width - 12)}px`;
    ref.landLangPopover.style.top = `${rect.bottom + 8}px`;
  }

  function closeLandingLanguagePopover() {
    ref.landLangPopover?.classList.add("hidden");
    syncLandingLanguagePopover();
  }

  function genRoomId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let r = ""; for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
    return r;
  }

  function validRoom(v) { return /^[A-Z0-9]{5,12}$/.test(v.trim().toUpperCase()); }

  function avatarInitial(name, fallback = "刘") {
    return (name || "").trim().charAt(0) || fallback;
  }

  function findParticipant(id) {
    if (id === "self") {
      const base = participants.find(p => p.id === "self");
      return { ...base, name: state.nickname, short: state.avatarChar, color: avatarPalette[0] };
    }
    return participants.find(p => p.id === id);
  }

  function langLabel(code) {
    const l = languages.find(x => x.value === code);
    return l ? l.label : code;
  }

  function stageTargetLanguageLabel(code = state.targetLanguage) {
    return ({
      "en-US": "英语",
      "zh-CN": "中文",
      "ja-JP": "日语",
      "de-DE": "德语"
    })[code] || langLabel(code);
  }

  function recognitionModeLabel(value = state.recognitionMode) {
    return ({
      auto: "自动识别",
      multi: "多语种识别",
      single: "指定单语种"
    })[value] || "自动识别";
  }

  function subtitleDisplayLabel(value = state.subtitleDisplay) {
    return ({
      original: "仅显示原文",
      translation: "仅显示译文",
      both: "同时显示原文和译文"
    })[value] || "同时显示原文和译文";
  }

  function getSidePanelTier(viewportWidth = window.innerWidth) {
    return SIDE_PANEL_TIERS.find(tier => viewportWidth >= tier.minViewport) || SIDE_PANEL_TIERS[SIDE_PANEL_TIERS.length - 1];
  }

  function shouldUseSessionDrawer(viewportWidth = window.innerWidth) {
    const tier = getSidePanelTier(viewportWidth);
    const layoutGap = viewportWidth <= 768 ? 10 : viewportWidth <= 1024 ? 12 : 16;
    const shellPadding = viewportWidth <= 768 ? 24 : viewportWidth <= 1024 ? 32 : 48;
    const estimatedStageWidth = viewportWidth - tier.width - layoutGap - shellPadding;
    return viewportWidth <= 1024 || estimatedStageWidth < MIN_STAGE_READABLE_WIDTH;
  }

  function setSessionDrawerOpen(open) {
    state.sessionDrawerOpen = Boolean(open);
    ref.layout?.classList.toggle("session-drawer-open", state.sessionDrawerOpen);
    ref.sessionDrawerBackdrop?.classList.toggle("hidden", !state.sessionDrawerOpen);
    ref.sessionPanel?.classList.toggle("is-drawer-open", state.sessionDrawerOpen);
    ref.sideToggleBtn?.setAttribute("aria-expanded", String(state.sessionDrawerOpen));
  }

  function syncResponsiveMode() {
    const viewportWidth = window.innerWidth;
    const tier = getSidePanelTier(viewportWidth);
    const drawer = state.sessionStarted && shouldUseSessionDrawer(viewportWidth);

    state.sidePanelMode = drawer ? "drawer" : tier.name;
    if (ref.layout) ref.layout.dataset.sidePanelMode = state.sidePanelMode;
    ref.layout?.style.setProperty("--session-side-panel-width", `var(--stt-session-side-width-${tier.name === "min" ? "min" : tier.name})`);
    ref.pageProduct?.setAttribute("data-responsive-state", state.sessionStarted ? "session" : "prestart");
    ref.prestartResponsiveStatus?.classList.toggle("hidden", state.sessionStarted);

    if (!drawer) setSessionDrawerOpen(false);
  }

  function syncPrestartResponsiveStatus() {
    if (!ref.prestartResponsiveStatus) return;

    const isJoin = state.prestartMode === "join";
    const room = isJoin ? state.joinRoomId : state.roomId;
    const target = state.targetLanguages?.length > 1
      ? state.targetLanguages.map(langLabel).join("、")
      : langLabel(state.targetLanguage);

    ref.prestartResponsiveMode.textContent = isJoin ? "加入房间" : "创建房间";
    ref.prestartResponsiveRoom.textContent = `房间号 ${room || "未填写"}`;
    ref.prestartResponsiveRecognition.textContent = recognitionModeLabel(state.recognitionMode);
    ref.prestartResponsiveTarget.textContent = "翻译" + `为 ${target}`;
  }

  function shortSubtitleDisplayLabel(value = state.subtitleDisplay) {
    return ({
      original: "仅原文",
      translation: "仅译文",
      both: "双语"
    })[value] || "双语";
  }

  function subtitleDisplayOptions() {
    return `
      <option value="original">仅显示原文</option>
      <option value="translation">仅显示译文</option>
      <option value="both">同时显示原文和译文</option>
    `;
  }

  function renderCameraPreview() {
    const broken = state.camSelection === "off" || state.camError;
    if (broken) {
      return `
        <div class="camera-preview-placeholder">
          <span>${svgs.camOn(28)}</span>
          <strong>摄像头不可用</strong>
        </div>
      `;
    }
    return `
      <div class="camera-preview-live" style="--preview-image:url('assets/participants/video-2.jpg')">
        <span class="camera-preview-badge">PREVIEW</span>
      </div>
    `;
  }

  function closeCustomSelects(exceptShell = null) {
    const exceptId = exceptShell?.dataset.selectId || "";
    document.querySelectorAll(".custom-select").forEach(shell => {
      const selectId = shell.dataset.selectId || "";
      if (selectId && selectId === exceptId) return;
      shell.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".custom-select-pop").forEach(pop => {
      if (pop.dataset.selectId && pop.dataset.selectId === exceptId) return;
      pop.classList.add("hidden");
    });
  }

  function popoverSizingForSelect(select) {
    if (select.dataset.popoverSizing) return select.dataset.popoverSizing;
    if (select.closest(".summary-value")) return "match-trigger";
    return "match-trigger";
  }

  function widestSelectOptionWidth(select) {
    const labels = Array.from(select.options).map(option => option.textContent || "");
    const longest = labels.reduce((current, label) => label.length > current.length ? label : current, "");
    const canvas = widestSelectOptionWidth.canvas || (widestSelectOptionWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    if (!context) return 180;
    context.font = getComputedStyle(document.body).font || "14px sans-serif";
    return Math.ceil(context.measureText(longest).width + 64);
  }

  function enhanceSelects(root = document) {
    root.querySelectorAll("select.select-input, select.small-select").forEach(select => {
      if (select.dataset.customSelectReady === "true") return;
      select.dataset.customSelectReady = "true";
      select.classList.add("native-select-hidden");
      if (!select.id) select.id = `select-${Math.random().toString(36).slice(2)}`;
      const sizing = popoverSizingForSelect(select);
      document.querySelectorAll(".custom-select-pop").forEach(existingPop => {
        if (existingPop.dataset.selectId === select.id) existingPop.remove();
      });

      const shell = document.createElement("div");
      shell.className = `custom-select stt-choice stt-choice--single custom-select--${sizing} ${select.classList.contains("small-select") ? "compact" : ""}`;
      shell.dataset.selectId = select.id;
      shell.dataset.popoverSizing = sizing;
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "custom-select-trigger stt-choice__trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.innerHTML = `<span class="custom-select-value stt-choice__value"></span><span class="custom-select-chevron stt-choice__chevrons">${svgs.chevDown}</span>`;
      const pop = document.createElement("div");
      pop.className = `custom-select-pop stt-root-popover stt-choice__popover stt-select__popover stt-choice__popover--${sizing} hidden`;
      pop.setAttribute("role", "listbox");
      pop.dataset.selectId = select.id;
      pop.dataset.popoverSizing = sizing;

      select.parentNode.insertBefore(shell, select);
      shell.append(select, trigger);
      document.body.appendChild(pop);

      const valueEl = trigger.querySelector(".custom-select-value");
      const syncTrigger = () => {
        valueEl.textContent = select.selectedOptions[0]?.textContent || "";
        const hidden = select.classList.contains("hidden");
        trigger.classList.toggle("hidden", hidden);
        shell.classList.toggle("hidden", hidden);
        if (hidden) close();
      };
      const close = () => {
        trigger.setAttribute("aria-expanded", "false");
        pop.classList.add("hidden");
      };
      const renderOptions = () => {
        pop.innerHTML = Array.from(select.options).map(option => `
          <button type="button" class="custom-select-option stt-choice__option stt-select__option ${option.value === select.value ? "selected is-selected" : ""}" role="option" aria-selected="${option.value === select.value}" data-value="${option.value}">
            <span>${option.textContent}</span>
            <span class="custom-select-check stt-choice__check">${svgs.check}</span>
          </button>
        `).join("");
        pop.querySelectorAll("[data-value]").forEach(optionBtn => {
          optionBtn.addEventListener("click", event => {
            event.stopPropagation();
            select.value = optionBtn.dataset.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            renderOptions();
            syncTrigger();
            close();
          });
        });
      };
      const position = () => {
        if (pop.parentElement !== document.body) document.body.appendChild(pop);
        const rect = trigger.getBoundingClientRect();
        const viewportMargin = 12;
        const offset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--stt-component-popover-offset")) || 4;
        const isContentAware = sizing === "content-aware";
        const minWidth = isContentAware ? Math.max(rect.width, 180) : rect.width;
        const maxWidth = Math.max(rect.width, Math.min(420, window.innerWidth - viewportMargin * 2));
        const width = isContentAware ? Math.min(maxWidth, Math.max(minWidth, widestSelectOptionWidth(select))) : rect.width;
        const availableBelow = Math.max(0, window.innerHeight - rect.bottom - offset - viewportMargin);
        const availableAbove = Math.max(0, rect.top - offset - viewportMargin);
        const naturalHeight = select.options.length * 38 + 16;
        const openUp = availableBelow < Math.min(naturalHeight, 180) && availableAbove > availableBelow;
        const availableHeight = Math.max(48, openUp ? availableAbove : availableBelow);
        const maxHeight = Math.min(320, availableHeight);
        const popoverHeight = Math.min(naturalHeight, maxHeight);
        const preferredTop = openUp ? rect.top - offset - popoverHeight : rect.bottom + offset;
        const top = Math.max(viewportMargin, Math.min(preferredTop, window.innerHeight - popoverHeight - viewportMargin));
        pop.style.position = "fixed";
        pop.style.top = `${top}px`;
        pop.style.left = `${Math.max(viewportMargin, Math.min(rect.left, window.innerWidth - width - viewportMargin))}px`;
        pop.style.setProperty("--stt-root-popover-width", `${width}px`);
        pop.style.maxHeight = `${maxHeight}px`;
        pop.dataset.placement = openUp ? "top" : "bottom";
      };

      trigger.addEventListener("click", event => {
        event.stopPropagation();
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        closeCustomSelects(shell);
        if (expanded) return;
        renderOptions();
        position();
        trigger.setAttribute("aria-expanded", "true");
        pop.classList.remove("hidden");
      });
      select.addEventListener("change", () => {
        renderOptions();
        syncTrigger();
      });
      syncTrigger();
      renderOptions();
    });
  }

  const stageSubtitleDisplayOptions = [
    { value: "both", label: "同时显示原文和译文" },
    { value: "original", label: "仅显示原文" },
    { value: "translation", label: "仅显示译文" }
  ];

  const stageTargetLanguageOptions = [
    { value: "en-US", label: "英语" },
    { value: "zh-CN", label: "中文" },
    { value: "ja-JP", label: "日语" },
    { value: "de-DE", label: "德语" }
  ];

  function closeStageDropdowns(exceptPopover = null) {
    [ref.stageSubtitleDisplayPopover, ref.stageTargetLanguagePopover].forEach(popover => {
      if (!popover || popover === exceptPopover) return;
      popover.classList.add("hidden");
    });
    [ref.stageSubtitleDisplayBtn, ref.stageTargetLanguageBtn].forEach(button => {
      const controls = button?.getAttribute("aria-controls");
      if (exceptPopover && controls === exceptPopover.id) return;
      button?.setAttribute("aria-expanded", "false");
    });
  }

  function positionStageDropdown(trigger, popover) {
    const rect = trigger.getBoundingClientRect();
    const viewportMargin = 12;
    const offset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--stt-component-popover-offset")) || 4;
    const width = Math.max(rect.width, 208);
    const naturalHeight = popover.scrollHeight || 160;
    const availableBelow = Math.max(0, window.innerHeight - rect.bottom - offset - viewportMargin);
    const availableAbove = Math.max(0, rect.top - offset - viewportMargin);
    const openUp = availableBelow < Math.min(naturalHeight, 160) && availableAbove > availableBelow;
    const maxHeight = Math.min(320, Math.max(56, openUp ? availableAbove : availableBelow));
    const popoverHeight = Math.min(naturalHeight, maxHeight);
    const preferredTop = openUp ? rect.top - offset - popoverHeight : rect.bottom + offset;
    popover.style.position = "fixed";
    popover.style.top = `${Math.max(viewportMargin, Math.min(preferredTop, window.innerHeight - popoverHeight - viewportMargin))}px`;
    popover.style.left = `${Math.max(viewportMargin, Math.min(rect.left, window.innerWidth - width - viewportMargin))}px`;
    popover.style.setProperty("--stt-root-popover-width", `${width}px`);
    popover.style.maxHeight = `${maxHeight}px`;
    popover.dataset.placement = openUp ? "top" : "bottom";
  }

  function resetStageDropdownPosition(popover) {
    popover.style.position = "fixed";
    popover.style.top = "0px";
    popover.style.left = "0px";
    popover.style.maxHeight = "";
    popover.style.removeProperty("--stt-root-popover-width");
    popover.dataset.placement = "";
  }

  function renderStageDropdownOptions(popover, options, currentValue, onSelect) {
    popover.innerHTML = options.map(option => `
      <button type="button" class="custom-select-option stt-choice__option stt-select__option ${option.value === currentValue ? "selected is-selected" : ""}" role="option" aria-selected="${option.value === currentValue}" data-value="${option.value}">
        <span>${option.label}</span>
        <span class="custom-select-check stt-choice__check">${svgs.check}</span>
      </button>
    `).join("");
    popover.querySelectorAll("[data-value]").forEach(optionButton => {
      optionButton.addEventListener("click", event => {
        event.stopPropagation();
        onSelect(optionButton.dataset.value);
        closeStageDropdowns();
      });
    });
  }

  function openStageDropdown(trigger, popover, options, currentValue, onSelect) {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    closeCustomSelects();
    closeStageDropdowns(popover);
    if (expanded) {
      trigger.setAttribute("aria-expanded", "false");
      popover.classList.add("hidden");
      return;
    }
    resetStageDropdownPosition(popover);
    renderStageDropdownOptions(popover, options, currentValue, onSelect);
    trigger.setAttribute("aria-controls", popover.id);
    trigger.setAttribute("aria-expanded", "true");
    popover.classList.remove("hidden");
    popover.getBoundingClientRect();
    positionStageDropdown(trigger, popover);
  }

  function populateSelect(select, options) {
    if (!select) return;
    select.innerHTML = options.map(option => `<option value="${option.value}">${option.label || option.full || option.name}</option>`).join("");
  }

  function fullLanguageOptions() {
    return languages.map(l => ({ value: l.value, label: l.full }));
  }

  function ensureSourceLanguageForMode() {
    if (state.recognitionMode === "single") {
      state.sourceLanguage = state.singleLanguage;
      return;
    }
    if (state.recognitionMode === "multi" && state.multiSourceLanguages.length > 0) {
      state.sourceLanguage = state.multiSourceLanguages[0];
    }
  }

  // Build an array of {char|br} from text — Chinese splits per char,
  // ASCII letters/digits group as one token.
  function tokenizeForStream(text) {
    const out = [];
    let buf = "";
    const flush = () => { if (buf) { out.push({ ch: buf }); buf = ""; } };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === "\n") { flush(); out.push({ br: true }); }
      else if (c === " ") { flush(); out.push({ space: true }); }
      else if (/[A-Za-z0-9'']/.test(c)) { buf += c; }
      else { flush(); out.push({ ch: c }); }
    }
    flush();
    return out;
  }

  function buildWordSpans(text) {
    // Split by space but keep punctuation attached
    const parts = text.split(/(\s+)/);
    const out = [];
    parts.forEach(part => {
      if (/^\s+$/.test(part)) {
        out.push(document.createTextNode(part));
      } else if (part) {
        const span = document.createElement("span");
        span.className = "w";
        span.textContent = part;
        out.push(span);
      }
    });
    return out;
  }

  // ===================================================================
  // LANDING — hero rotating utterances
  // ===================================================================
  let heroIndex = 0;
  function rotateHeroSnip() {
    const o = document.querySelector(".snip-original");
    const t = document.querySelector(".snip-translation");
    if (!o || !t) return;
    const item = heroSnipUtterances[heroIndex % heroSnipUtterances.length];
    heroIndex++;
    o.style.transition = "opacity 0.4s ease";
    t.style.transition = "opacity 0.4s ease";
    o.style.opacity = "0";
    t.style.opacity = "0";
    setTimeout(() => {
      o.innerHTML = item.original.replace(/\n/g, "<br/>");
      t.textContent = item.translation;
      o.style.opacity = "1";
      t.style.opacity = "1";
    }, 420);
  }

  // ===================================================================
  // PRESTART PANEL
  // ===================================================================
  function renderRoomInfoGroup() {
    const isJoin = state.prestartMode === "join";
    return `
        <div class="group stt-prestart-group" data-migrated-component="PrestartGroup">
          <div class="group-head stt-prestart-group__head">
            <strong class="stt-prestart-group__title">房间信息</strong>
          </div>
          <div class="field stt-field stt-field-composition stt-field-stack stt-prestart-room-field">
            <label class="stt-field__label stt-field-composition__label" for="roomInput">房间号</label>
            <div class="field-inline stt-field-composition__control stt-field-stack__control ${isJoin ? "field-inline--single" : ""}">
              <div class="room-input-shell ${isJoin ? "room-input-shell--plain" : ""}">
                <input class="text-input stt-input mono room-input-shell__input" id="roomInput" maxlength="12" value="${isJoin ? state.joinRoomId : state.roomId}" placeholder="${isJoin ? "请输入房间号" : ""}" />
                ${isJoin ? "" : `<button class="room-input-shell__copy" id="copyPrestartRoomBtn" aria-label="复制房间号"><span class="room-copy-btn__icon" aria-hidden="true">${svgs.copy}</span></button>`}
              </div>
              ${isJoin ? "" : `<button class="mini-btn stt-button stt-button--tertiary stt-button--sm" id="randomRoomBtn"><span class="stt-button__content">随机</span></button>`}
            </div>
          </div>
          <div class="field stt-field stt-field-composition stt-field-stack stt-prestart-nickname" data-migrated-component="PrestartNicknameField">
            <label class="stt-field__label stt-field-composition__label" for="nicknameInput">昵称</label>
            <div class="user-row stt-field-composition__control stt-field-stack__control stt-prestart-nickname__control">
              <div class="u-avatar stt-prestart-nickname__avatar" style="--av:${findParticipant('self').color}">${state.avatarChar}</div>
              <input class="text-input stt-input stt-prestart-nickname__input" id="nicknameInput" maxlength="18" value="${state.nickname}" placeholder="请输入昵称" />
            </div>
          </div>
        </div>
    `;
  }

  function renderLanguageSettingsGroup(langOpts) {
    return `
        <div class="group stt-prestart-group language-settings-group" data-migrated-component="PrestartGroup">
          <div class="group-head stt-prestart-group__head"><strong class="stt-prestart-group__title">语言设置</strong></div>
          <div class="prestart-language-card prestart-language-card--recognition">
            <div class="field stt-field stt-language-mode-pills" data-migrated-component="LanguageModePills" role="group" aria-label="识别模式">
              <span class="stt-field__label">识别模式</span>
              <div class="radio-row stt-language-mode-pills__items">
                <button class="radio-pill stt-language-mode-pills__button ${state.recognitionMode==='auto' ? 'active':''}" aria-pressed="${state.recognitionMode==='auto'}" data-mode="auto">自动识别</button>
                <button class="radio-pill stt-language-mode-pills__button ${state.recognitionMode==='multi' ? 'active':''}" aria-pressed="${state.recognitionMode==='multi'}" data-mode="multi">多语种识别</button>
                <button class="radio-pill stt-language-mode-pills__button ${state.recognitionMode==='single' ? 'active':''}" aria-pressed="${state.recognitionMode==='single'}" data-mode="single">指定单语种</button>
              </div>
            </div>
            <div class="field stt-field stt-field-composition stt-field-stack ${state.recognitionMode === "auto" ? "hidden" : ""}" id="sourceLangField">
              <label class="stt-field__label stt-field-composition__label" for="sourceLangSel">源语言</label>
              <div class="stt-field-composition__control stt-field-stack__control">
                <select class="select-input stt-select ${state.recognitionMode === "multi" ? "hidden" : ""}" id="sourceLangSel">${langOpts}</select>
                <div class="multi-language-shell stt-choice stt-choice--multi stt-multi-select stt-multi-language-picker ${state.recognitionMode === "multi" ? "" : "hidden"}" id="multiLangShell" role="group" aria-label="多语种源语言选择" data-popover-sizing="content-aware" data-max-selected="2">
                  <button class="multi-language-trigger-row" id="multiLangToggle" aria-haspopup="true" aria-expanded="false">
                    <div class="multi-language-selected" id="multiLangSelected"></div>
                    <span class="multi-language-trigger" aria-hidden="true">${svgs.chevDown}</span>
                  </button>
                  <div class="multi-language-popup hidden" id="multiLangPopup">
                    <div class="multi-language-search-wrap">
                      <input class="multi-language-search stt-input" id="multiLangSearch" type="search" placeholder="搜索源语言" aria-label="搜索源语言" />
                    </div>
                    <div class="multi-language-popup-inner" id="multiLangOptions"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="field stt-field stt-field-composition stt-field-stack single-language-row ${state.recognitionMode === "single" ? "" : "hidden"}" id="singleLangRow">
              <label class="stt-field__label stt-field-composition__label" for="singleLangSel">指定单语种</label>
              <div class="stt-field-composition__control stt-field-stack__control">
                <select class="select-input stt-select" id="singleLangSel" data-popover-sizing="content-aware">${langOpts}</select>
              </div>
            </div>
          </div>
          <div class="prestart-language-card prestart-language-card--display">
            <div class="field stt-field stt-field-composition stt-field-stack">
              <label class="stt-field__label stt-field-composition__label" for="targetLangSelected">翻译为</label>
              <div class="stt-field-composition__control stt-field-stack__control">
                <div class="multi-language-shell stt-choice stt-choice--multi stt-multi-select stt-multi-language-picker" id="targetLangShell" role="group" aria-label="翻译目标语言选择" data-popover-sizing="content-aware" data-max-selected="10">
                  <button class="multi-language-trigger-row" id="targetLangToggle" aria-haspopup="true" aria-expanded="false">
                    <div class="multi-language-selected" id="targetLangSelected"></div>
                    <span class="multi-language-trigger" aria-hidden="true">${svgs.chevDown}</span>
                  </button>
                  <div class="multi-language-popup hidden" id="targetLangPopup">
                    <div class="multi-language-search-wrap">
                      <input class="multi-language-search stt-input" id="targetLangSearch" type="search" placeholder="搜索翻译语言" aria-label="搜索翻译语言" />
                    </div>
                    <div class="multi-language-popup-inner" id="targetLangOptions"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="field stt-field stt-field-composition stt-field-stack subtitle-display-field">
              <label class="stt-field__label stt-field-composition__label" for="subtitleDisplaySel">字幕显示</label>
              <div class="stt-field-composition__control stt-field-stack__control">
                <select class="select-input stt-select" id="subtitleDisplaySel">${subtitleDisplayOptions()}</select>
              </div>
            </div>
          </div>
          <button class="adv-entry stt-advanced-settings-entry" id="openAdvBtn">
            <span>
              <strong>转录翻译高级设置</strong>
              <small>上下文 · 参考文本 · 热词 · 术语</small>
            </span>
            <span class="stt-advanced-settings-entry__meta">
              <span class="chip stt-advanced-settings-entry__chip">4 项</span>
              ${svgs.arrowRight.replace(/currentColor/g, 'var(--ink-3)')}
            </span>
          </button>
        </div>
    `;
  }

  function renderDeviceSettingsGroup(micOpts, camOpts) {
    return `
        <div class="group stt-prestart-group" data-migrated-component="PrestartGroup">
          <div class="group-head stt-prestart-group__head"><strong class="stt-prestart-group__title">设备设置</strong></div>
          <div class="device-grid">
            <div class="device-card stt-device-setup-card" id="micCard" role="group" aria-label="麦克风" data-migrated-component="DeviceSetupCard">
              <div class="device-card-top stt-device-setup-card__top">
                <div>
                  <strong>麦克风</strong>
                  <p class="sub" id="micSub">未授权 · 先显示授权引导</p>
                </div>
                <button class="mini-btn stt-button stt-button--tertiary stt-button--sm" id="micAuthBtn"><span class="stt-button__content">授权</span></button>
              </div>
              <div class="stt-device-setup-card__select">
                <select class="select-input stt-select" id="micSel" data-popover-sizing="content-aware">${micOpts}</select>
              </div>
              <div class="level-meter stt-device-setup-card__meter"><span class="level-fill" id="micLevel"></span></div>
            </div>
            <div class="device-card stt-device-setup-card" id="camCard" role="group" aria-label="摄像头" data-migrated-component="DeviceSetupCard">
              <div class="device-card-top stt-device-setup-card__top">
                <div>
                  <strong>摄像头</strong>
                  <p class="sub" id="camSub">已开启 · 本地预览</p>
                </div>
                <button class="mini-btn stt-button stt-button--tertiary stt-button--sm" id="camPrevBtn"><span class="stt-button__content">关闭预览</span></button>
              </div>
              <div class="stt-device-setup-card__select">
                <select class="select-input stt-select" id="camSel" data-popover-sizing="content-aware">${camOpts}</select>
              </div>
              <div class="camera-preview stt-device-setup-card__preview ${state.cameraPreviewOpen ? "" : "hidden"}" id="camPreview">${renderCameraPreview()}</div>
            </div>
          </div>
        </div>
    `;
  }

  function buildPrestartPanel() {
    const langOpts = languages.map(l => `<option value="${l.value}">${l.full}</option>`).join("");
    const micOpts = micDevices.filter(d => d.id !== "off").map(d => `<option value="${d.id}">${d.name}</option>`).join("");
    const camOpts = camDevices.filter(d => d.id !== "off").map(d => `<option value="${d.id}">${d.name}</option>`).join("");
    const prestartTabIndex = state.prestartMode === "join" ? 1 : 0;

    ref.prestartPanel.innerHTML = `
      <div class="prestart-tabs stt-tabs stt-tabs--fill" role="tablist" aria-label="开始方式" data-migrated-component="Tabs" style="--stt-tabs-count: 2; --stt-tabs-indicator-shift: calc(${prestartTabIndex * 100}% + (var(--stt-component-tabs-gap) * ${prestartTabIndex}));">
        <button type="button" class="${state.prestartMode === "create" ? "is-active" : ""}" role="tab" aria-selected="${state.prestartMode === "create"}" data-prestart-mode="create"><span>创建</span></button>
        <button type="button" class="${state.prestartMode === "join" ? "is-active" : ""}" role="tab" aria-selected="${state.prestartMode === "join"}" data-prestart-mode="join"><span>加入</span></button>
      </div>
      <div class="panel-scroll stt-prestart-panel__body">
        ${renderRoomInfoGroup()}
        ${state.prestartMode === "create" ? renderLanguageSettingsGroup(langOpts) : ""}
        ${renderDeviceSettingsGroup(micOpts, camOpts)}
      </div>

      <div class="prestart-foot stt-prestart-footer">
        <div class="quickset stt-prestart-footer__quickset">
          <button class="quick-btn stt-prestart-footer__icon-button" id="quickMicBtn" data-off="${state.micSelection === 'off' || !state.micAuthorized}" aria-label="麦克风">
            ${svgs.micSmall(state.micSelection === 'off')}
          </button>
          <button class="quick-btn stt-prestart-footer__icon-button" id="quickCamBtn" data-off="${state.camSelection === 'off'}" aria-label="摄像头">
            ${svgs.camSmall(state.camSelection === 'off')}
          </button>
        </div>
        <button class="start-btn stt-prestart-footer__start stt-button stt-button--primary" id="startBtn" disabled><span class="stt-button__content">${state.prestartMode === "join" ? "立即加入" : "开始"}</span></button>
      </div>
    `;

    // Wire fields
    function movePrestartTabIndicator(nextMode) {
      const prestartTabs = ref.prestartPanel.querySelector(".prestart-tabs");
      const nextIndex = nextMode === "join" ? 1 : 0;
      if (!prestartTabs) return;
      prestartTabs.style.setProperty("--stt-tabs-indicator-shift", `calc(${nextIndex * 100}% + (var(--stt-component-tabs-gap) * ${nextIndex}))`);
      prestartTabs.querySelectorAll("[data-prestart-mode]").forEach(item => {
        const isActive = item.dataset.prestartMode === nextMode;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });
    }
    document.querySelectorAll("[data-prestart-mode]").forEach(button => {
      button.addEventListener("click", () => {
        const nextMode = button.dataset.prestartMode;
        if (nextMode === state.prestartMode) return;
        state.prestartMode = nextMode;
        movePrestartTabIndicator(nextMode);
        syncPrestartResponsiveStatus();
        window.setTimeout(buildPrestartPanel, 220);
      });
    });
    if ($("sourceLangSel")) $("sourceLangSel").value = state.sourceLanguage;
    if ($("singleLangSel")) $("singleLangSel").value = state.singleLanguage;
    if ($("subtitleDisplaySel")) $("subtitleDisplaySel").value = state.subtitleDisplay;
    $("micSel").value = state.micSelection !== "off" ? state.micSelection : "macbook";
    $("camSel").value = state.camSelection !== "off" ? state.camSelection : "facetime";
    enhanceSelects(ref.prestartPanel);
    if (state.prestartMode === "create") {
      renderMultiLanguageControls();
      renderTargetLanguageControls();
    }
    $("camCard").setAttribute("data-ready", String(state.cameraPreviewOpen && state.camSelection !== "off"));

    $("roomInput").addEventListener("input", e => {
      const next = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (state.prestartMode === "join") state.joinRoomId = next;
      else state.roomId = next;
      e.target.value = next;
      syncPrestartResponsiveStatus();
      updateStartBtn();
    });
    $("nicknameInput")?.addEventListener("input", e => {
        state.nickname = e.target.value;
        state.avatarChar = avatarInitial(e.target.value);
        const avatar = ref.prestartPanel.querySelector(".user-row .u-avatar");
        if (avatar) avatar.textContent = state.avatarChar;
        updateStartBtn();
      });
    $("randomRoomBtn")?.addEventListener("click", () => {
      state.roomId = genRoomId();
      $("roomInput").value = state.roomId;
      syncPrestartResponsiveStatus();
      toast("房间号已重新生成");
      updateStartBtn();
    });
    $("copyPrestartRoomBtn")?.addEventListener("click", () => {
      copyRoomId();
    });
    document.querySelectorAll("[data-mode]").forEach(b => {
      b.addEventListener("click", () => {
        state.recognitionMode = b.dataset.mode;
        syncPrestartLanguageMode();
        syncPrestartResponsiveStatus();
        document.querySelectorAll("[data-mode]").forEach(item => {
          item.setAttribute("aria-pressed", String(item.dataset.mode === state.recognitionMode));
        });
      });
    });
    $("sourceLangSel")?.addEventListener("change", e => {
      state.sourceLanguage = e.target.value;
      if (state.recognitionMode === "single") state.singleLanguage = e.target.value;
      syncPrestartResponsiveStatus();
    });
    $("subtitleDisplaySel")?.addEventListener("change", e => {
      state.subtitleDisplay = e.target.value;
      syncSubtitleDisplay();
      toast(`原文显示已切换为 ${subtitleDisplayLabel()}`);
    });
    $("singleLangSel")?.addEventListener("change", e => {
      state.singleLanguage = e.target.value;
      state.sourceLanguage = e.target.value;
      if ($("sourceLangSel")) $("sourceLangSel").value = e.target.value;
      syncPrestartResponsiveStatus();
    });
    $("multiLangToggle")?.addEventListener("click", e => {
      e.stopPropagation();
      const expanded = $("multiLangToggle").getAttribute("aria-expanded") === "true";
      $("multiLangToggle").setAttribute("aria-expanded", String(!expanded));
      $("multiLangPopup").classList.toggle("hidden", expanded);
      if (expanded === false) requestAnimationFrame(() => $("multiLangSearch")?.focus());
    });
    $("targetLangToggle")?.addEventListener("click", e => {
      e.stopPropagation();
      const expanded = $("targetLangToggle").getAttribute("aria-expanded") === "true";
      $("targetLangToggle").setAttribute("aria-expanded", String(!expanded));
      $("targetLangPopup").classList.toggle("hidden", expanded);
      if (expanded === false) requestAnimationFrame(() => $("targetLangSearch")?.focus());
    });
    $("micSel").addEventListener("change", e => {
      state.micSelection = e.target.value;
      updateQuickButtons();
    });
    $("camSel").addEventListener("change", e => {
      state.camSelection = e.target.value;
      state.camError = e.target.value === "off";
      $("camPreview").innerHTML = renderCameraPreview();
      $("camCard").setAttribute("data-ready", String(state.cameraPreviewOpen && state.camSelection !== "off"));
      $("camSub").textContent = state.camSelection === "off" ? "摄像头不可用 · 使用占位图" : "已开启 · 本地预览";
      updateQuickButtons();
    });
    $("micAuthBtn").addEventListener("click", () => {
      state.micAuthorized = true;
      $("micCard").setAttribute("data-ready", "true");
      $("micSub").textContent = "已授权 · 实时音量反馈";
      $("micAuthBtn").textContent = "已授权";
      $("micAuthBtn").disabled = true;
      $("micAuthBtn").style.opacity = "0.55";
      toast("麦克风权限已授予");
      updateQuickButtons();
    });
    $("camPrevBtn").addEventListener("click", () => {
      state.cameraPreviewOpen = !state.cameraPreviewOpen;
      state.camAuthorized = state.cameraPreviewOpen || state.camAuthorized;
      const prev = $("camPreview");
      const card = $("camCard");
      const btn = $("camPrevBtn");
      if (state.cameraPreviewOpen) {
        prev.classList.remove("hidden");
        prev.innerHTML = renderCameraPreview();
        btn.textContent = "关闭预览";
        $("camSub").textContent = state.camSelection === "off" ? "摄像头不可用 · 使用占位图" : "已开启 · 本地预览";
        card.setAttribute("data-ready", "true");
      } else {
        prev.classList.add("hidden");
        prev.textContent = "预览未开启";
        btn.textContent = "打开预览";
        $("camSub").textContent = "预览已关闭";
        card.setAttribute("data-ready", "false");
      }
    });
    $("openAdvBtn")?.addEventListener("click", openAdvancedOverlay);
    $("startBtn").addEventListener("click", () => {
      if (state.prestartMode === "join") state.roomId = state.joinRoomId;
      startSession();
    });

    $("quickMicBtn").addEventListener("click", e => {
      e.stopPropagation();
      toggleDockPop(e.currentTarget, "mic", true);
    });
    $("quickCamBtn").addEventListener("click", e => {
      e.stopPropagation();
      toggleDockPop(e.currentTarget, "cam", true);
    });

    updateStartBtn();
    syncPrestartResponsiveStatus();
    syncResponsiveMode();
    updateQuickButtons();
    if (state.prestartMode === "create") syncPrestartLanguageMode();
  }

  function renderMultiLanguageControls() {
    renderLanguageMultiSelect({
      selectedId: "multiLangSelected",
      optionsId: "multiLangOptions",
      valuesKey: "multiSourceLanguages",
      placeholder: "选择源语言",
      limit: 2,
      searchInputId: "multiLangSearch",
      onAfterChange: () => {
        ensureSourceLanguageForMode();
        syncPrestartResponsiveStatus();
      }
    });
  }

  function renderTargetLanguageControls() {
    renderLanguageMultiSelect({
      selectedId: "targetLangSelected",
      optionsId: "targetLangOptions",
      valuesKey: "targetLanguages",
      placeholder: "选择翻译目标语言",
      limit: 10,
      searchInputId: "targetLangSearch",
      onAfterChange: () => {
        state.targetLanguage = state.targetLanguages[0] || state.targetLanguage;
        syncPrestartResponsiveStatus();
      }
    });
  }

  function renderLanguageMultiSelect({ selectedId, optionsId, valuesKey, placeholder, limit, onAfterChange, searchInputId }) {
    const selected = $(selectedId);
    const options = $(optionsId);
    if (!selected || !options) return;
    const values = state[valuesKey];
    const searchInput = searchInputId ? $(searchInputId) : null;
    const query = (searchInput?.value || "").trim().toLowerCase();
    const filteredLanguages = query
      ? languages.filter(option => [option.label, option.full, option.value]
        .filter(Boolean)
        .some(text => text.toLowerCase().includes(query)))
      : languages;
    if (searchInput) {
      searchInput.oninput = () => renderLanguageMultiSelect({ selectedId, optionsId, valuesKey, placeholder, limit, onAfterChange, searchInputId });
      searchInput.onclick = event => event.stopPropagation();
    }
    selected.innerHTML = "";
    if (values.length === 0) {
      selected.innerHTML = `<span class="multi-language-placeholder">${placeholder}</span>`;
    } else {
      values.forEach(value => {
        const option = languages.find(item => item.value === value);
        const label = option ? option.full : value;
        const tag = document.createElement("span");
        tag.className = "multi-language-tag";
        tag.innerHTML = `<span>${label}</span><button type="button" aria-label="移除 ${label}">×</button>`;
        tag.querySelector("button").addEventListener("click", event => {
          event.stopPropagation();
          state[valuesKey] = state[valuesKey].filter(item => item !== value);
          onAfterChange?.();
          renderLanguageMultiSelect({ selectedId, optionsId, valuesKey, placeholder, limit, onAfterChange, searchInputId });
        });
        selected.appendChild(tag);
      });
    }
    options.innerHTML = filteredLanguages.length ? filteredLanguages.map(option => `
      <button type="button" class="multi-language-option ${values.includes(option.value) ? "active" : ""}" data-multi-lang="${option.value}">
        <span>${option.full}</span>
        <span class="multi-language-check">${svgs.check}</span>
      </button>
    `).join("") : `<div class="multi-language-empty">没有匹配选项</div>`;
    options.querySelectorAll("[data-multi-lang]").forEach(button => {
      button.addEventListener("click", () => {
        const value = button.dataset.multiLang;
        if (state[valuesKey].includes(value)) {
          state[valuesKey] = state[valuesKey].filter(item => item !== value);
        } else if (state[valuesKey].length < limit) {
          state[valuesKey] = [...state[valuesKey], value];
        } else {
          toast(`${placeholder.replace(/^选择/, "")}最多选择 ${limit} 个`);
        }
        onAfterChange?.();
        renderLanguageMultiSelect({ selectedId, optionsId, valuesKey, placeholder, limit, onAfterChange, searchInputId });
      });
    });
  }

  function renderMultiLanguagePicker(selectedId, optionsId, popupId, toggleId, compact = false) {
    const selected = $(selectedId);
    const options = $(optionsId);
    if (!selected || !options) return;
    selected.innerHTML = "";
    if (state.multiSourceLanguages.length === 0) {
      selected.innerHTML = `<span class="multi-language-placeholder">选择源语言</span>`;
    } else {
      state.multiSourceLanguages.forEach(value => {
        const option = languages.find(item => item.value === value);
        const label = option ? option.full : value;
        const tag = document.createElement("span");
        tag.className = "multi-language-tag";
        tag.innerHTML = `<span>${label}</span><button type="button" aria-label="移除 ${label}">×</button>`;
        tag.querySelector("button").addEventListener("click", event => {
          event.stopPropagation();
          state.multiSourceLanguages = state.multiSourceLanguages.filter(item => item !== value);
          if (state.recognitionMode === "multi") {
            ensureSourceLanguageForMode();
            if (ref.stageSourceLabel) ref.stageSourceLabel.textContent = langLabel(state.sourceLanguage);
          }
          renderMultiLanguagePicker(selectedId, optionsId, popupId, toggleId, compact);
        });
        selected.appendChild(tag);
      });
    }
    options.innerHTML = languages.map(option => `
      <button type="button" class="multi-language-option ${state.multiSourceLanguages.includes(option.value) ? "active" : ""}" data-multi-lang="${option.value}">
        <span>${option.full}</span>
        <span class="multi-language-check">${svgs.check}</span>
      </button>
    `).join("");
    options.querySelectorAll("[data-multi-lang]").forEach(button => {
      button.addEventListener("click", () => {
        const value = button.dataset.multiLang;
        if (state.multiSourceLanguages.includes(value)) {
          state.multiSourceLanguages = state.multiSourceLanguages.filter(item => item !== value);
        } else {
          state.multiSourceLanguages.push(value);
        }
        if (state.recognitionMode === "multi") {
          ensureSourceLanguageForMode();
          if (ref.stageSourceLabel) ref.stageSourceLabel.textContent = langLabel(state.sourceLanguage);
        }
        renderMultiLanguagePicker(selectedId, optionsId, popupId, toggleId, compact);
      });
    });
    const toggle = $(toggleId);
    if (toggle) {
      toggle.onclick = e => {
        e.stopPropagation();
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        $(popupId)?.classList.toggle("hidden", expanded);
      };
    }
  }

  function syncPrestartLanguageMode() {
    const source = $("sourceLangSel");
    const multi = $("multiLangShell");
    const single = $("singleLangRow");
    const sourceField = $("sourceLangField");
    const sourceShell = source?.closest(".custom-select");
    document.querySelectorAll("[data-mode]").forEach(button => {
      button.classList.toggle("active", button.dataset.mode === state.recognitionMode);
    });
    sourceField?.classList.toggle("hidden", state.recognitionMode === "auto");
    source?.classList.toggle("hidden", state.recognitionMode === "multi");
    sourceShell?.classList.toggle("hidden", state.recognitionMode === "multi");
    multi?.classList.toggle("hidden", state.recognitionMode !== "multi");
    single?.classList.toggle("hidden", state.recognitionMode !== "single");
    $("multiLangToggle")?.setAttribute("aria-expanded", "false");
    $("multiLangPopup")?.classList.add("hidden");
  }

  function updateStartBtn() {
    const r = validRoom($("roomInput")?.value || "");
    const n = state.prestartMode === "join" || ($("nicknameInput")?.value || "").trim().length > 0;
    if ($("startBtn")) $("startBtn").disabled = !(r && n);
  }

  function updateQuickButtons() {
    const m = $("quickMicBtn"); const c = $("quickCamBtn");
    if (m) {
      m.innerHTML = svgs.micSmall(!state.micAuthorized || state.micSelection === "off");
      m.dataset.off = String(!state.micAuthorized || state.micSelection === "off");
    }
    if (c) {
      c.innerHTML = svgs.camSmall(state.camSelection === "off");
      c.dataset.off = String(state.camSelection === "off");
    }
  }

  // ===================================================================
  // SESSION — start, stop, render
  // ===================================================================
  function startSession() {
    ensureSourceLanguageForMode();
    state.sessionStarted = true;
    state.history = [];
    state.currentDisplay = null;
    state.stageState = "idle";
    state.micEnabled = true;
    state.camEnabled = true;
    state.micError = false;
    state.camError = false;

    ref.pageProduct.dataset.session = "true";
    ref.emptyStage.classList.add("hidden");
    ref.sessionStage.classList.remove("hidden");
    ref.prestartPanel.classList.add("hidden");
    ref.sessionPanel.classList.remove("hidden");

    ref.statusPill.classList.remove("hidden");
    ref.topbarRoomLabel.classList.remove("hidden");
    ref.topbarRoomText.textContent = state.roomId;
    syncRoomInfoPopover();
    ref.accessAnchor.classList.remove("hidden");
    ref.sideToggleBtn.classList.remove("hidden");
    ref.prestartBackBtn.classList.add("hidden");

    ref.stageSourceLabel.textContent = langLabel(state.sourceLanguage);
    ref.stageTargetLabel.textContent = langLabel(state.targetLanguage);

    startCountdown();
    renderSessionPanel();
    syncResponsiveMode();
    syncDock();
    syncSubtitleDisplay();
    startTranscriptLoop();
  }

  function stopSession() {
    state.sessionStarted = false;
    if (state.countdownTimer) clearInterval(state.countdownTimer);
    if (state.streamTimer) clearTimeout(state.streamTimer);
    state.countdownTimer = null;
    state.streamTimer = null;
    state.countdown = 600;
    state.currentSpeakerId = null;
    state.currentUtterance = null;
    state.currentDisplay = null;
    state.history = [];
    state.activeUntil = {};
    state.micEnabled = false;
    state.camEnabled = false;
    state.stageState = "idle";
    state.panelVisible = true;
    ref.layout.classList.remove("panel-hidden");
    setSessionDrawerOpen(false);
    syncResponsiveMode();

    ref.pageProduct.dataset.session = "false";
    ref.emptyStage.classList.remove("hidden");
    ref.sessionStage.classList.add("hidden");
    ref.prestartPanel.classList.remove("hidden");
    ref.sessionPanel.classList.add("hidden");
    ref.statusPill.classList.add("hidden");
    ref.topbarRoomLabel.classList.add("hidden");
    ref.accessAnchor.classList.add("hidden");
    ref.sideToggleBtn.classList.add("hidden");
    ref.prestartBackBtn.classList.remove("hidden");
    closeAllPops();

    buildPrestartPanel();
    syncDock();
  }

  function startCountdown() {
    if (state.countdownTimer) clearInterval(state.countdownTimer);
    state.countdown = 600;
    updateCountdown();
    state.countdownTimer = setInterval(() => {
      state.countdown = Math.max(0, state.countdown - 1);
      updateCountdown();
      if (state.countdown === 0) {
        clearInterval(state.countdownTimer);
        toast("当前会话已到达 10 分钟上限，服务已自动停止");
        stopSession();
      }
    }, 1000);
  }
  function updateCountdown() {
    const m = String(Math.floor(state.countdown / 60)).padStart(2, "0");
    const s = String(state.countdown % 60).padStart(2, "0");
    ref.countdownText.textContent = `${m}:${s}`;
  }

  // ---- Transcript loop ----
  function startTranscriptLoop() {
    let idx = 0;
    const next = () => {
      if (!state.sessionStarted) return;
      const utt = utteranceScript[idx % utteranceScript.length];
      idx++;
      runUtterance(utt, next);
    };
    next();
  }

  function runUtterance(utt, onDone) {
    const speaker = findParticipant(utt.speakerId);
    state.currentSpeakerId = speaker.id;
    state.activeUntil[speaker.id] = Date.now() + 6000;
    renderParticipants();

    const hadPrevious = !!state.currentDisplay;

    // Fade prior display briefly before commit
    if (hadPrevious) {
      ref.currentUtt.style.transition = "opacity 220ms ease, transform 220ms ease, filter 220ms ease";
      ref.currentUtt.style.opacity = "0";
      ref.currentUtt.style.transform = "translateY(16px)";
      ref.currentUtt.style.filter = "blur(5px)";
    }

    state.streamTimer = setTimeout(() => {
      // Commit previous to history
      if (state.currentDisplay) {
        const shouldStickToCurrent = isSubtitleNearBottom();
        state.history.unshift({
          ...state.currentDisplay,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
        });
        if (state.history.length > 8) state.history.pop();
        renderHistory();
        if (shouldStickToCurrent) scrollSubtitleToCurrent(false);
      }

      // Reset utterance container styles
      ref.currentUtt.style.transition = "opacity 320ms ease, transform 320ms ease, filter 320ms ease";
      ref.currentUtt.style.opacity = "1";
      ref.currentUtt.style.transform = "translateY(0)";
      ref.currentUtt.style.filter = "blur(0)";

      state.currentUtterance = utt;
      state.currentDisplay = null;

      // Update speaker identity
      ref.uttAvatar.textContent = speaker.short;
      ref.uttAvatar.style.setProperty("--av", speaker.color);
      ref.uttSpeakerName.textContent = speaker.name;
      ref.uttSpeakerRole.textContent = `CURRENT SPEAKER · ${langLabel(state.sourceLanguage)}`;

      // Clear text
      ref.currentUtt.dataset.final = "false";
      ref.uttOriginal.innerHTML = "";
      ref.uttTranslation.innerHTML = "";
      syncSubtitleDisplay();

      // Pre-receive briefly
      state.stageState = "receiving";
      ref.preReceive.style.display = "flex";
      setTimeout(() => { if (ref.preReceive) ref.preReceive.style.display = "none"; }, 320);

      // Add a trailing caret right away
      const caret = document.createElement("span");
      caret.className = "caret";
      ref.uttOriginal.appendChild(caret);

      // Stream the original char-by-char using setInterval
      const tokens = tokenizeForStream(utt.original);
      const perChar = Math.max(48, Math.floor(utt.receiveMs / Math.max(1, tokens.length)));
      let idx = 0;

      const streamIv = setInterval(() => {
        if (!state.sessionStarted) { clearInterval(streamIv); return; }
        if (idx >= tokens.length) {
          clearInterval(streamIv);
          // Remove caret, do a soft glow finalize
          if (caret.parentNode) caret.parentNode.removeChild(caret);
          ref.currentUtt.dataset.final = "true";
          ref.uttOriginal.classList.add("finalize");
          setTimeout(() => ref.uttOriginal.classList.remove("finalize"), 900);

          // Move to waiting state
          state.stageState = "waiting";
          ref.uttTranslation.innerHTML = `<span class="dots-pending"><span></span><span></span><span></span></span>`;
          syncSubtitleDisplay();

          const willTimeout = utt.forceTimeout === true;
          state.streamTimer = setTimeout(() => {
            if (willTimeout) {
              ref.uttTranslation.innerHTML = `<span class="translation-fallback">译文超时 · 仅展示原文</span>`;
              state.stageState = "timeout";
            } else {
              const words = buildWordSpans(utt.translated);
              ref.uttTranslation.innerHTML = "";
              words.forEach((node, i) => {
                ref.uttTranslation.appendChild(node);
              });
              // Stagger reveal
              const wordEls = ref.uttTranslation.querySelectorAll(".w");
              wordEls.forEach((el, i) => {
                setTimeout(() => el.classList.add("in"), i * 28);
              });
              state.stageState = "paired";
            }
            syncSubtitleDisplay();

            state.currentDisplay = {
              speakerId: speaker.id,
              speakerName: speaker.name,
              speakerShort: speaker.short,
              speakerColor: speaker.color,
              original: utt.original,
              translated: willTimeout ? null : utt.translated
            };

            state.streamTimer = setTimeout(onDone, 3200);
          }, utt.translateMs);
          return;
        }

        const tok = tokens[idx];
        idx++;
        let inserted = null;
        if (tok.br) {
          ref.uttOriginal.insertBefore(document.createElement("br"), caret);
        } else if (tok.space) {
          ref.uttOriginal.insertBefore(document.createTextNode(" "), caret);
        } else {
          const span = document.createElement("span");
          span.className = "ch";
          span.textContent = tok.ch;
          ref.uttOriginal.insertBefore(span, caret);
          inserted = span;
        }
        if (inserted) {
          // Trigger transition reliably after layout
          requestAnimationFrame(() => {
            requestAnimationFrame(() => inserted.classList.add("in"));
          });
        }
      }, perChar);
    }, hadPrevious ? 260 : 0);
  }

  // ===================================================================
  // HISTORY
  // ===================================================================
  function renderHistory() {
    ref.historyTrack.innerHTML = state.history.map(h => {
      return `
        <div class="history-item">
          <div class="h-head">
            <div class="h-avatar" style="--av:${h.speakerColor}">${h.speakerShort}</div>
            <span class="h-name">${h.speakerName}</span>
            <span class="h-ts mono">${h.timestamp}</span>
          </div>
          ${state.subtitleDisplay !== "translation" ? `<div class="h-original">${escapeHTML(h.original).replace(/\n/g, "<br/>")}</div>` : ""}
          ${state.subtitleDisplay !== "original" ? (h.translated ? `<div class="h-translation">${escapeHTML(h.translated)}</div>` : `<div class="h-translation" style="color:var(--warn);">译文缺失</div>`) : ""}
        </div>
      `;
    }).join("");
    requestAnimationFrame(updateSubtitleJumpState);
  }

  function scrollSubtitleToCurrent(smooth = true) {
    if (!ref.subtitleFlow) return;
    ref.subtitleFlow.scrollTo({
      top: ref.subtitleFlow.scrollHeight,
      behavior: smooth ? "smooth" : "auto"
    });
    requestAnimationFrame(updateSubtitleJumpState);
  }

  function isSubtitleNearBottom(threshold = 42) {
    if (!ref.subtitleFlow) return true;
    const distanceFromBottom = ref.subtitleFlow.scrollHeight - ref.subtitleFlow.clientHeight - ref.subtitleFlow.scrollTop;
    return distanceFromBottom < threshold;
  }

  function updateSubtitleJumpState() {
    if (!ref.subtitleFlow || !ref.subtitleJumpBottom) return;
    const distanceFromBottom = ref.subtitleFlow.scrollHeight - ref.subtitleFlow.clientHeight - ref.subtitleFlow.scrollTop;
    ref.subtitleJumpBottom.classList.toggle("hidden", distanceFromBottom < 24);
  }
  function escapeHTML(s) {
    return s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  // ===================================================================
  // SIDE PANEL (in-session)
  // ===================================================================
  function renderSessionPanel() {
    if (state.currentTab === "participants") renderParticipantsTab();
    else renderSettingsTab();

    // Bind tabs
    const sessionTabs = document.querySelector(".stt-participants-panel__tabs");
    const sessionTabIndex = state.currentTab === "settings" ? 1 : 0;
    if (sessionTabs) {
      sessionTabs.style.setProperty("--stt-tabs-count", "2");
      sessionTabs.style.setProperty("--stt-tabs-indicator-shift", `calc(${sessionTabIndex * 100}% + (var(--stt-component-tabs-gap) * ${sessionTabIndex}))`);
    }
    document.querySelectorAll(".seg-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === state.currentTab);
      b.classList.toggle("is-active", b.dataset.tab === state.currentTab);
      b.setAttribute("aria-selected", String(b.dataset.tab === state.currentTab));
      b.onclick = () => {
        state.currentTab = b.dataset.tab;
        renderSessionPanel();
      };
    });
  }

  function renderParticipantsTab() {
    const total = participants.length;
    ref.segBody.innerHTML = `
      <div class="participants-head stt-participants-panel__head">
        <strong>参会信息</strong>
        <span class="count mono">${total} ONLINE</span>
      </div>
      <div class="p-list stt-participants-panel__list" id="pList"></div>
      <button class="show-more hidden" id="toggleParticipantsBtn">
        <span>参会者 +0</span>
        <span id="toggleParticipantsCount">展开</span>
      </button>
    `;
    renderParticipants();
  }

  function renderParticipants() {
    const list = document.getElementById("pList");
    if (!list) return;

    const total = participants.length;
    const indexById = new Map(participants.map((item, index) => [item.id, index]));
    const participantRank = item => {
      if (item.id === "self") return 0;
      const camOn = item.camera;
      const micOn = item.mic;
      if (camOn) return 1;
      if (micOn) return 2;
      return 3;
    };
    const sorted = [...participants];
    sorted.sort((a, b) => {
      const byRank = participantRank(a) - participantRank(b);
      if (byRank !== 0) return byRank;
      return (indexById.get(a.id) || 0) - (indexById.get(b.id) || 0);
    });

    const maxCollapsed = 6;
    const visible = state.participantsExpanded ? sorted : sorted.slice(0, maxCollapsed);
    const hiddenCount = Math.max(0, sorted.length - visible.length);

    list.innerHTML = visible.map(item => {
      const isSelf = item.id === "self";
      const active = item.id === state.currentSpeakerId;
      const camOn = isSelf ? state.camEnabled : item.camera;
      const micOn = isSelf ? state.micEnabled : item.mic;
      const name = isSelf ? state.nickname : item.name;
      const short = isSelf ? state.avatarChar : item.short;
      const role = isSelf ? "我 · 主持人" : (item.role || "");
      const roleHtml = role ? `<div class="p-role">${role}</div>` : "";
      const hasRole = role ? "true" : "false";

      if (camOn || isSelf) {
        const videoStyle = item.video ? ` style="--video-image:url('${item.video}')"` : "";
        return `
          <div class="p-card video stt-participant-video-card ${isSelf ? "is-self" : ""} ${active ? "is-active" : ""}" data-self="${isSelf}" data-active="${active}" data-has-role="${hasRole}" data-video="${camOn ? "on" : "off"}">
            <div class="p-video stt-participant-video-card__image"${videoStyle}>
              <div class="p-video-avatar stt-participant-video-card__audio"><div class="p-avatar stt-participant-avatar" style="--av:${item.color}">${short}</div></div>
              <div class="p-video-meta stt-participant-video-card__bar">
                <div class="p-info">
                  <div class="p-name">${name}</div>
                  ${roleHtml}
                </div>
                ${isSelf ? selfActions("inline") : participantStatus(micOn, camOn)}
              </div>
            </div>
          </div>`;
      }
      return `
        <div class="p-card audio stt-participant-video-card stt-participant-video-card--audio ${active ? "is-active" : ""}" data-self="${isSelf}" data-active="${active}" data-has-role="${hasRole}">
          <div class="p-avatar stt-participant-avatar" style="--av:${item.color}">${short}</div>
          <div class="p-info">
            <div class="p-name">${name}</div>
            ${roleHtml}
          </div>
          ${isSelf ? selfActions("inline") : participantStatus(micOn, camOn)}
        </div>`;
    }).join("");

    // Bind self actions
    list.querySelectorAll("[data-self-action]").forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.selfAction === "mic") toggleMic();
        else toggleCam();
      };
    });

    const toggle = $("toggleParticipantsBtn");
    const toggleCount = $("toggleParticipantsCount");
    if (toggle) {
      toggle.classList.toggle("hidden", sorted.length <= maxCollapsed);
      toggle.querySelector("span:first-child").textContent = state.participantsExpanded ? `参会者 ${total}` : `参会者 +${hiddenCount}`;
      if (toggleCount) toggleCount.textContent = state.participantsExpanded ? "收起" : "展开";
      toggle.onclick = () => {
        state.participantsExpanded = !state.participantsExpanded;
        renderParticipants();
      };
    }
  }

  function participantStatus(micOn, camOn) {
    return `
      <div class="p-icons">
        ${micOn ? svgs.micSmall(false) : svgs.micSmall(true, 0.5)}
        ${camOn ? svgs.camSmall(false) : svgs.camSmall(true, 0.5)}
        <span class="p-wave-mini stt-participant-wave"><span></span><span></span><span></span><span></span><span></span></span>
      </div>
    `;
  }

  function selfActions(variant = "") {
    return `
      <div class="p-self-actions stt-participant-video-card__self-actions${variant ? ` ${variant}` : ""}">
        <button class="p-self-action ${state.micEnabled ? "is-on" : ""}" data-self-action="mic" data-on="${state.micEnabled}" aria-label="麦克风">${svgs.micSmall(!state.micEnabled, state.micEnabled ? 1 : 0.5)}</button>
        <button class="p-self-action ${state.camEnabled ? "is-on" : ""}" data-self-action="cam" data-on="${state.camEnabled}" aria-label="摄像头">${svgs.camSmall(!state.camEnabled, state.camEnabled ? 1 : 0.5)}</button>
      </div>
    `;
  }

  function renderSettingsTab() {
    const sourceLanguageValue = state.recognitionMode === "multi"
      ? state.multiSourceLanguages.map(langLabel).join("、")
      : langLabel(state.sourceLanguage);
    ref.segBody.innerHTML = `
      <div class="summary stt-settings-panel">
        <div class="summary-row">
          <span class="summary-key">房间号</span>
          <span class="summary-value">
            <button class="summary-copy-value" id="sumCopyRoomBtn" type="button" aria-label="复制房间号 ${state.roomId}">
              <span class="mono">${state.roomId}</span>
              <span class="summary-copy-value__icon" aria-hidden="true">${svgs.copy}</span>
            </button>
          </span>
        </div>
        <div class="summary-row">
          <span class="summary-key">当前用户</span>
          <span class="summary-value">
            <span class="inline-edit">
              <strong>${state.nickname}</strong>
            </span>
            <button class="icon-button" id="editSelfBtn" aria-label="编辑">${svgs.edit}</button>
          </span>
        </div>
        <div class="summary-edit hidden" id="selfEditForm">
          <div class="name-edit-combo">
            <input class="text-input stt-input" id="selfNameInput" maxlength="18" value="${state.nickname}" />
            <button class="name-save-btn" id="saveSelfEditBtn" aria-label="保存">${svgs.check}</button>
          </div>
          <button class="mini-btn name-cancel-btn" id="cancelSelfEditBtn">取消</button>
        </div>
        <div class="summary-row">
          <span class="summary-key">识别模式</span>
          <span class="summary-value">
            <span class="summary-readonly">${recognitionModeLabel(state.recognitionMode)}</span>
          </span>
        </div>
        <div class="summary-row ${state.recognitionMode === "auto" ? "hidden" : ""}" id="sumSourceRow">
          <span class="summary-key">源语言</span>
          <span class="summary-value">
            <span class="summary-readonly">${sourceLanguageValue}</span>
          </span>
        </div>
        <div class="summary-row">
          <span class="summary-key">翻译为</span>
          <span class="summary-value">
            <span class="summary-readonly">${langLabel(state.targetLanguage)}</span>
          </span>
        </div>
      </div>

      <button class="adv-entry stt-advanced-settings-entry" id="sumAdvBtn">
        <span>
          <strong>转录翻译高级设置</strong>
          <small>上下文 · 参考文本 · 热词 · 术语</small>
        </span>
        <span class="stt-advanced-settings-entry__meta">
          <span class="chip stt-advanced-settings-entry__chip">4 项</span>
          ${svgs.arrowRight.replace(/currentColor/g, 'var(--ink-3)')}
        </span>
      </button>
    `;
    $("editSelfBtn").addEventListener("click", () => {
      $("selfEditForm").classList.remove("hidden");
      $("selfNameInput").focus();
    });
    const saveSelfName = () => {
      const next = $("selfNameInput").value.trim();
      if (!next) return;
      state.nickname = next;
      state.avatarChar = avatarInitial(next);
      renderSettingsTab();
      renderParticipants();
      toast("用户信息已更新");
    };
    $("cancelSelfEditBtn").addEventListener("click", () => $("selfEditForm").classList.add("hidden"));
    $("saveSelfEditBtn").addEventListener("click", saveSelfName);
    $("selfNameInput").addEventListener("keydown", e => {
      if (e.key === "Enter") saveSelfName();
      if (e.key === "Escape") $("selfEditForm").classList.add("hidden");
    });
    $("sumAdvBtn").addEventListener("click", openAdvancedOverlay);
    $("sumCopyRoomBtn")?.addEventListener("click", copyRoomId);
  }

  // ===================================================================
  // DOCK & DEVICE POPOVERS
  // ===================================================================
  function syncDock() {
    ref.dockMicBtn.classList.toggle("active", state.micEnabled && !state.micError);
    ref.dockCamBtn.classList.toggle("active", state.camEnabled && !state.camError);
    ref.dockMicBtn.classList.toggle("warning", state.micError);
    ref.dockCamBtn.classList.toggle("warning", state.camError);
    ref.dockMicIcon.innerHTML = state.micError ? svgs.micWarn() : state.micEnabled ? svgs.micOn() : svgs.micOff();
    ref.dockCamIcon.innerHTML = state.camEnabled ? svgs.camOn() : svgs.camOff();
  }

  function syncSubtitleDisplay() {
    const showOriginal = state.subtitleDisplay !== "translation";
    const showTranslation = state.subtitleDisplay !== "original";
    if (ref.uttOriginal) ref.uttOriginal.classList.toggle("hidden", !showOriginal);
    if (ref.uttTranslation) ref.uttTranslation.classList.toggle("hidden", !showTranslation);
    if (ref.stageSubtitleDisplayLabel) {
      ref.stageSubtitleDisplayLabel.textContent = `原文显示：${shortSubtitleDisplayLabel()}`;
    }
    if (ref.stageSubtitleDisplayBtn) {
      ref.stageSubtitleDisplayBtn.setAttribute("aria-label", `原文显示，当前${subtitleDisplayLabel()}`);
    }
    if (ref.stageTargetLanguageLabel) {
      ref.stageTargetLanguageLabel.textContent = `翻译为:${stageTargetLanguageLabel()}`;
    }
    if (ref.stageTargetLanguageBtn) {
      ref.stageTargetLanguageBtn.setAttribute("aria-label", `翻译为，当前${stageTargetLanguageLabel()}`);
    }
    ref.pageProduct?.setAttribute("data-subtitle-display", state.subtitleDisplay);
  }

  function toggleMic() {
    if (!state.micAuthorized || state.micSelection === "off") {
      state.micError = true;
      state.micEnabled = false;
      syncDock();
      toast("麦克风不可用，请先授权或选择有效设备");
      setTimeout(() => { state.micError = false; syncDock(); }, 2400);
      return;
    }
    state.micError = false;
    state.micEnabled = !state.micEnabled;
    syncDock();
    renderParticipants();
  }
  function toggleCam() {
    if ((!state.camAuthorized && !state.cameraPreviewOpen) || state.camSelection === "off") {
      state.camError = true;
      state.camEnabled = false;
      syncDock();
      toast("摄像头不可用，请先打开预览或选择有效设备");
      setTimeout(() => { state.camError = false; syncDock(); }, 2400);
      return;
    }
    state.camError = false;
    state.camEnabled = !state.camEnabled;
    syncDock();
    renderParticipants();
  }

  function toggleDockPop(anchor, kind, isQuick) {
    closeAllPops();
    const popEl = isQuick ? document.createElement("div") : (kind === "mic" ? ref.dockMicPop : ref.dockCamPop);

    const devices = (kind === "mic" ? micDevices : camDevices).filter(device => isQuick || device.id !== "off");
    const selection = kind === "mic" ? state.micSelection : state.camSelection;
    const opts = devices;

    popEl.className = isQuick ? "dock-pop quick-pop" : "dock-pop";
    popEl.innerHTML = opts.map(o => `
      <button class="pop-item ${o.id === selection ? "selected" : ""}" data-device="${o.id}">
        <span class="pop-item-main"><span>${o.name}</span></span>
        <span class="check">${svgs.check}</span>
      </button>
    `).join("");

    const positionDevicePop = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const surfaceRect = (anchor.closest(".dock") || anchor.closest(".quickset") || anchor).getBoundingClientRect();
      const popRect = popEl.getBoundingClientRect();
      const gap = 10;
      popEl.style.top = `${Math.max(12, surfaceRect.top - popRect.height - gap)}px`;
      popEl.style.bottom = "auto";
      popEl.style.left = `${Math.min(anchorRect.left, window.innerWidth - popRect.width - 12)}px`;
      popEl.style.right = "auto";
      popEl.style.zIndex = 100;
    };

    if (isQuick) {
      document.body.appendChild(popEl);
      positionDevicePop();
    } else {
      if (popEl.parentElement !== document.body) document.body.appendChild(popEl);
      popEl.classList.remove("hidden");
      positionDevicePop();
    }

    popEl.querySelectorAll("[data-device]").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.dataset.device;
        if (kind === "mic") {
          state.micSelection = id;
          state.micError = false;
          if (id === "off") state.micEnabled = false;
        } else {
          state.camSelection = id;
          state.camError = id === "off";
          if (id === "off") state.camEnabled = false;
        }
        syncDock();
        renderParticipants();
        updateQuickButtons();
        closeAllPops();
        if (isQuick) popEl.remove();
      });
    });

    // Click outside to close
    setTimeout(() => {
      const close = e => {
        if (!popEl.contains(e.target) && e.target !== anchor) {
          if (isQuick) popEl.remove(); else popEl.classList.add("hidden");
          document.removeEventListener("click", close);
        }
      };
      document.addEventListener("click", close);
    }, 10);
  }

  function closeAllPops() {
    closeCustomSelects();
    ref.dockMicPop?.classList.add("hidden");
    ref.dockCamPop?.classList.add("hidden");
    ref.accessMenu?.classList.add("hidden");
    ref.avatarMenu?.classList.add("hidden");
    ref.roomInfoPopover?.classList.add("hidden");
    [ref.dockMicPop, ref.dockCamPop, ref.accessMenu, ref.avatarMenu, ref.roomInfoPopover].forEach(popEl => {
      if (!popEl) return;
      popEl.style.top = "";
      popEl.style.bottom = "";
      popEl.style.left = "";
      popEl.style.right = "";
      popEl.style.zIndex = "";
    });
    document.querySelectorAll(".pop[style*='position: fixed'], .quick-pop").forEach(p => p.remove());
  }

  function positionTopbarPop(popEl, anchor, alignRight = false) {
    const rect = anchor.getBoundingClientRect();
    if (popEl.parentElement !== document.body) document.body.appendChild(popEl);
    popEl.classList.remove("hidden");
    popEl.style.top = `${rect.bottom + 8}px`;
    popEl.style.bottom = "auto";
    popEl.style.left = alignRight ? "auto" : `${rect.left}px`;
    popEl.style.right = alignRight ? `${Math.max(12, window.innerWidth - rect.right)}px` : "auto";
    popEl.style.zIndex = 100;
  }

  function syncRoomInfoPopover() {
    if (!ref.roomInfoPopover) return;
    ref.roomInfoRoom.textContent = state.roomId;
    ref.roomInfoUid.textContent = roomDetail.uid;
    ref.roomInfoAgent.textContent = roomDetail.agent;
  }

  function openRoomInfoPopover() {
    if (!ref.roomInfoPopover || !ref.roomInfoBtn) return;
    window.clearTimeout(roomInfoCloseTimer);
    syncRoomInfoPopover();
    positionTopbarPop(ref.roomInfoPopover, ref.roomInfoBtn, false);
  }

  function scheduleRoomInfoClose() {
    window.clearTimeout(roomInfoCloseTimer);
    roomInfoCloseTimer = window.setTimeout(() => {
      ref.roomInfoPopover?.classList.add("hidden");
    }, 120);
  }

  // ===================================================================
  // OVERLAYS — plugin, qr, advanced
  // ===================================================================
  function openOverlay(id) {
    $(id).classList.remove("hidden");
    if (id === "qrOverlay") ref.qrRoomId.textContent = state.roomId;
  }
  function closeOverlay(id) {
    $(id).classList.add("hidden");
  }

  function openAdvancedOverlay() {
    renderAdvancedGrid();
    openOverlay("advOverlay");
  }
  function renderAdvancedGrid() {
    ref.advGrid.innerHTML = Object.keys(advancedConfigs).map(key => {
      const it = advancedConfigs[key];
      return `
        <button class="adv-card stt-surface-action-card" data-adv="${key}">
          <div class="adv-card-copy">
            <strong>${it.title}</strong>
            <p>${it.desc}</p>
          </div>
          <div class="adv-card-foot">
            <span class="json-tag">JSON</span>
            ${svgs.arrowRight}
          </div>
        </button>
      `;
    }).join("");
    ref.advGrid.querySelectorAll("[data-adv]").forEach(b => {
      b.addEventListener("click", () => {
        openDrawer(b.dataset.adv);
      });
    });
  }

  function openDrawer(key) {
    state.drawerKey = key;
    const cfg = advancedConfigs[key];
    ref.drawerTitle.textContent = cfg.title;
    ref.drawerDesc.textContent = cfg.desc;
    ref.jsonEditor.value = JSON.stringify(cfg.json, null, 2);
    ref.drawer.classList.remove("hidden");
    closeOverlay("advOverlay");
    validateJson();
  }
  function closeDrawer() {
    ref.drawer.classList.add("hidden");
    state.drawerKey = null;
  }
  function validateJson() {
    try {
      JSON.parse(ref.jsonEditor.value);
      ref.jsonValidity.textContent = "有效";
      ref.jsonValidity.classList.remove("invalid");
      return true;
    } catch (e) {
      ref.jsonValidity.textContent = "无效";
      ref.jsonValidity.classList.add("invalid");
      return false;
    }
  }

  // ===================================================================
  // CONFIRM (source language change)
  // ===================================================================
  function askConfirm(text, onApply, onCancel) {
    ref.confirmText.textContent = text;
    ref.confirmOverlay.classList.remove("hidden");
    pendingConfirm = { onApply, onCancel };
  }

  // ===================================================================
  // EVENTS
  // ===================================================================
  function bindLandingPointerGlow() {
    if (!prefersFinePointer.matches) return;

    let targetX = window.innerWidth * 0.72;
    let targetY = window.innerHeight * 0.36;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = null;

    const draw = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      document.documentElement.style.setProperty("--pointer-x", `${currentX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${currentY}px`);

      if (Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4) {
        rafId = requestAnimationFrame(draw);
      } else {
        rafId = null;
      }
    };

    const queueDraw = () => {
      if (!rafId) rafId = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", event => {
      if (document.body.dataset.page !== "landing") return;
      targetX = event.clientX;
      targetY = event.clientY;
      document.body.classList.add("pointer-active");
      queueDraw();
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      document.body.classList.remove("pointer-active");
    });
  }

  function bindEvents() {
    ref.landCtaBtn.addEventListener("click", () => {
      document.body.classList.remove("pointer-active");
      ref.pageLanding.classList.add("hidden");
      ref.pageProduct.classList.remove("hidden");
      state.page = "product";
      document.body.dataset.page = "product";
      ref.prestartBackBtn.classList.remove("hidden");
      buildPrestartPanel();
      syncDock();
    });

    ref.prestartBackBtn.addEventListener("click", () => {
      if (state.sessionStarted) return;
      closeAllPops();
      ref.pageProduct.classList.add("hidden");
      ref.pageLanding.classList.remove("hidden");
      state.page = "landing";
      document.body.dataset.page = "landing";
    });

    ref.landLangBtn.addEventListener("click", e => {
      e.stopPropagation();
      const open = ref.landLangPopover.classList.contains("hidden");
      closeAllPops();
      ref.landLangPopover.classList.toggle("hidden", !open);
      if (open) positionLandingLanguagePopover();
      syncLandingLanguagePopover();
    });

    ref.landLangPopover?.querySelectorAll("[data-land-locale]").forEach(button => {
      button.addEventListener("click", e => {
        e.stopPropagation();
        state.locale = button.dataset.landLocale;
        closeLandingLanguagePopover();
        toast(state.locale === "zh" ? "已切换为中文" : "Switched to English");
      });
    });

    ref.landLoginBtn?.addEventListener("click", () => {
      state.landingLoggedIn = true;
      syncLandingAuth();
      toast("已切换为登录后状态");
    });

    ref.copyRoomBtn.addEventListener("click", e => {
      e.stopPropagation();
      copyRoomId();
    });
    ref.roomInfoBtn?.addEventListener("mouseenter", openRoomInfoPopover);
    ref.roomInfoBtn?.addEventListener("focus", openRoomInfoPopover);
    ref.roomInfoBtn?.addEventListener("mouseleave", scheduleRoomInfoClose);
    ref.roomInfoBtn?.addEventListener("blur", scheduleRoomInfoClose);
    ref.roomInfoPopover?.addEventListener("mouseenter", () => {
      window.clearTimeout(roomInfoCloseTimer);
    });
    ref.roomInfoPopover?.addEventListener("mouseleave", scheduleRoomInfoClose);
    ref.roomInfoPopover?.querySelectorAll("[data-room-detail-copy]").forEach(button => {
      button.addEventListener("click", e => {
        e.stopPropagation();
        const key = button.dataset.roomDetailCopy;
        const value = key === "room" ? state.roomId : key === "uid" ? roomDetail.uid : roomDetail.agent;
        const label = key === "room" ? "Room" : key === "uid" ? "UID" : "Agent ID";
        copyText(value, `${label} 已复制`);
      });
    });

    // Topbar dropdowns
    ref.accessBtn.addEventListener("click", e => {
      e.stopPropagation();
      const open = !ref.accessMenu.classList.contains("hidden");
      closeAllPops();
      if (!open) positionTopbarPop(ref.accessMenu, ref.accessBtn, true);
    });
    ref.accessMenu.querySelectorAll("[data-access]").forEach(b => {
      b.addEventListener("click", () => {
        closeAllPops();
        if (b.dataset.access === "plugin") openOverlay("pluginOverlay");
        else openOverlay("qrOverlay");
      });
    });
    ref.avatarBtn.addEventListener("click", e => {
      e.stopPropagation();
      const open = !ref.avatarMenu.classList.contains("hidden");
      closeAllPops();
      if (!open) positionTopbarPop(ref.avatarMenu, ref.avatarBtn, true);
    });
    ref.logoutBtn.addEventListener("click", () => {
      closeAllPops();
      stopSession();
      ref.pageProduct.classList.add("hidden");
      ref.pageLanding.classList.remove("hidden");
      state.page = "landing";
      document.body.dataset.page = "landing";
      ref.prestartBackBtn.classList.remove("hidden");
    });

    // Side panel toggle
    ref.sideToggleBtn.addEventListener("click", () => {
      if (state.sidePanelMode === "drawer") {
        setSessionDrawerOpen(!state.sessionDrawerOpen);
        return;
      }

      state.panelVisible = !state.panelVisible;
      ref.layout.classList.toggle("panel-hidden", !state.panelVisible);
    });
    ref.sessionDrawerBackdrop?.addEventListener("click", () => {
      setSessionDrawerOpen(false);
    });
    ref.sessionDrawerCloseBtn?.addEventListener("click", () => {
      setSessionDrawerOpen(false);
    });
    window.addEventListener("resize", syncResponsiveMode, { passive: true });

    // Dock
    ref.dockMicBtn.addEventListener("click", toggleMic);
    ref.dockCamBtn.addEventListener("click", toggleCam);
    ref.dockMicChev.addEventListener("click", e => {
      e.stopPropagation();
      toggleDockPop(ref.dockMicBtn, "mic", false);
    });
    ref.dockCamChev.addEventListener("click", e => {
      e.stopPropagation();
      toggleDockPop(ref.dockCamBtn, "cam", false);
    });
    ref.hangupBtn.addEventListener("click", () => {
      stopSession();
      toast("会话已结束");
    });
    ref.subtitleFlow.addEventListener("scroll", updateSubtitleJumpState, { passive: true });
    ref.subtitleJumpBottom.addEventListener("click", () => scrollSubtitleToCurrent(true));

    // Overlay close
    document.querySelectorAll("[data-close]").forEach(b => {
      b.addEventListener("click", () => closeOverlay(b.dataset.close));
    });
    document.querySelectorAll(".overlay").forEach(o => {
      o.addEventListener("click", e => {
        if (e.target === o) closeOverlay(o.dataset.overlay || o.id);
      });
    });

    // Confirm
    ref.confirmCancel.addEventListener("click", () => {
      ref.confirmOverlay.classList.add("hidden");
      pendingConfirm?.onCancel?.();
      pendingConfirm = null;
    });
    ref.confirmApply.addEventListener("click", () => {
      ref.confirmOverlay.classList.add("hidden");
      pendingConfirm?.onApply?.();
      pendingConfirm = null;
    });

    // Drawer
    ref.drawerCloseBtn.addEventListener("click", () => { closeDrawer(); openAdvancedOverlay(); });
    ref.drawerCancelBtn.addEventListener("click", () => { closeDrawer(); openAdvancedOverlay(); });
    ref.drawerSaveBtn.addEventListener("click", () => {
      if (!validateJson()) {
        toast("JSON 无效，请先修正");
        return;
      }
      const key = state.drawerKey;
      const nextJson = JSON.parse(ref.jsonEditor.value);
      askConfirm("保存并应用后，将影响当前房间后续新产生的字幕结果。", () => {
        advancedConfigs[key].json = nextJson;
        closeDrawer();
        toast(`「${advancedConfigs[key].title}」已应用 · 影响后续字幕`);
      });
    });
    ref.formatJsonBtn.addEventListener("click", () => {
      if (!validateJson()) {
        toast("JSON 无效，无法格式化");
        return;
      }
      ref.jsonEditor.value = JSON.stringify(JSON.parse(ref.jsonEditor.value), null, 2);
    });
    ref.jsonEditor.addEventListener("input", validateJson);
    ref.stageSubtitleDisplayBtn?.addEventListener("click", event => {
      event.stopPropagation();
      openStageDropdown(ref.stageSubtitleDisplayBtn, ref.stageSubtitleDisplayPopover, stageSubtitleDisplayOptions, state.subtitleDisplay, value => {
        state.subtitleDisplay = value;
        syncSubtitleDisplay();
        renderHistory();
        toast(`原文显示已切换为 ${subtitleDisplayLabel()}`);
      });
    });
    ref.stageTargetLanguageBtn?.addEventListener("click", event => {
      event.stopPropagation();
      openStageDropdown(ref.stageTargetLanguageBtn, ref.stageTargetLanguagePopover, stageTargetLanguageOptions, state.targetLanguage, value => {
        state.targetLanguage = value;
        state.targetLanguages = [value];
        ref.stageTargetLabel.textContent = langLabel(state.targetLanguage);
        syncSubtitleDisplay();
        renderHistory();
        renderSessionPanel();
        toast(`翻译目标已切换为 ${stageTargetLanguageLabel()}`);
      });
    });

    // Close pops on outside click
    document.addEventListener("click", e => {
      // skip if inside known anchors
      if (e.target.closest(".custom-select") || e.target.closest(".custom-select-pop")) return;
      if (e.target.closest(".stage-dropdown")) return;
      closeStageDropdowns();
      closeCustomSelects();
      if (e.target.closest(".dropdown-shell") || e.target.closest(".pop-anchor")) return;
      document.querySelectorAll(".multi-language-shell").forEach(shell => {
        if (shell.contains(e.target)) return;
        shell.querySelector(".multi-language-trigger-row")?.setAttribute("aria-expanded", "false");
        shell.querySelector(".multi-language-popup")?.classList.add("hidden");
      });
      if (e.target.closest(".pop") || e.target.closest(".dock-pop")) return;
      closeAllPops();
      closeLandingLanguagePopover();
    });

    // Build empty rail ticks
    const ticks = 28;
    ref.emptyRail.innerHTML = Array.from({ length: ticks }).map((_, i) =>
      `<span style="--rail-i:${i}"></span>`
    ).join("");
    startEmptyRailMotion();
  }

  function startEmptyRailMotion() {
    if (!ref.emptyRail) return;
    window.clearTimeout(state.emptyRailAccentTimer);
    window.clearTimeout(state.emptyRailIdleTimer);

    const idleDuration = 2400;
    const accentDuration = 3000;
    const playCycle = () => {
      ref.emptyRail.classList.remove("is-rail-accent");
      state.emptyRailAccentTimer = window.setTimeout(() => {
        ref.emptyRail.classList.add("is-rail-accent");
        state.emptyRailIdleTimer = window.setTimeout(playCycle, accentDuration);
      }, idleDuration);
    };

    playCycle();
  }

  // Mic level meter (only when authorized & on prestart)
  function tickLevel() {
    const el = $("micLevel");
    if (!el) return;
    if (state.micAuthorized) {
      const v = 20 + Math.round(Math.random() * 60);
      el.style.width = `${v}%`;
    } else {
      el.style.width = "0%";
    }
  }

  // Periodically clean expired active speakers
  function tickActive() {
    let dirty = false;
    Object.keys(state.activeUntil).forEach(k => {
      if (state.activeUntil[k] <= Date.now()) {
        delete state.activeUntil[k];
        dirty = true;
      }
    });
    if (dirty && state.sessionStarted) renderParticipants();
  }

  // ===================================================================
  // INIT
  // ===================================================================
  function init() {
    bindEvents();
    bindLandingPointerGlow();
    buildPrestartPanel();
    syncDock();
    syncSubtitleDisplay();
    setInterval(tickLevel, 180);
    setInterval(tickActive, 800);
    setInterval(rotateHeroSnip, 5200);
    if (window.location.hash === "#toast-demo") {
      window.setTimeout(() => {
        toast("这是一条较长的 toast 文案，用于查看桌面与手机端自适应效果");
      }, 360);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
