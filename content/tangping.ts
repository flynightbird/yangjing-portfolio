import type { Locale } from '@/content/types';

export type TangpingFrameLayout =
  | 'background'
  | 'research'
  | 'personas'
  | 'needs-matrix';

export interface TangpingCopyGroup {
  readonly label: string;
  readonly items: readonly string[];
}

export interface TangpingFrameCopy {
  readonly title: string;
  readonly groups: readonly TangpingCopyGroup[];
}

export interface TangpingFrame {
  readonly id: number;
  readonly layout: TangpingFrameLayout;
  readonly image: {
    readonly src: string;
    readonly width: number;
    readonly height: number;
  };
  readonly copy: Record<Locale, TangpingFrameCopy>;
}

const frameDefinitions = [
  {
    id: 6,
    layout: 'background',
    image: { src: '/images/tangping/frame-06.png', width: 2880, height: 1620 },
    copy: {
      zh: {
        title: '躺平设计家 · 设计背景',
        groups: [
          {
            label: '平台规模',
            items: ['整个室内设计人群 1700 万+', '躺平总用户 100 万+，设计师用户约 70 万+'],
          },
          {
            label: '项目背景',
            items: [
              '躺平设计家作为淘宝 iHome 的一员，根植于家居家装行业，通过官网和 APP 赋能设计师，为设计师在手淘上变现创造前置的学习成长空间和打造优秀作品的能力。',
            ],
          },
          { label: '业务关系', items: ['拉新', '留存促活', '赋能设计师'] },
        ],
      },
      en: {
        title: 'Tangping Designer · Design context',
        groups: [
          {
            label: 'Platform scale',
            items: ['17M+ people work in interior design', '1M+ Tangping users, including about 700K designers'],
          },
          {
            label: 'Project context',
            items: [
              'Tangping Designer was part of Taobao iHome. It served the home-decoration industry through a website and app, helping designers learn, grow, create strong work, and build opportunities to earn through Taobao.',
            ],
          },
          { label: 'Business relationship', items: ['Acquire', 'Retain and activate', 'Empower designers'] },
        ],
      },
    },
  },
  {
    id: 10,
    layout: 'research',
    image: { src: '/images/tangping/frame-10.png', width: 2880, height: 1620 },
    copy: {
      zh: {
        title: '躺平设计家 · 用户调研',
        groups: [
          {
            label: '调研背景',
            items: [
              '为了在紧张的项目周期压力下，帮助项目成员统一对目标用户的认知，进行了一次调研来了解用户，针对目标用户进行分层，梳理各类需求和获取痛点。',
            ],
          },
          {
            label: '研究方法',
            items: [
              '问卷调研（200 份+）',
              '二手资料分析：酷家乐2019《青年室内设计师生存现状报告》、《家居设计生态大数据报告》、2018《酷家乐用户画像报告》、新浪家居《2019年中国室内设计师生存状况调查报告》',
              '用户定性访谈',
              '竞品分析',
              '现有网站数据报表分析与网站用户行为数据分析',
            ],
          },
        ],
      },
      en: {
        title: 'Tangping Designer · User research',
        groups: [
          {
            label: 'Research context',
            items: [
              'Under a compressed project schedule, the team needed a shared understanding of target users. We researched and segmented the audience to organize their needs and identify pain points.',
            ],
          },
          {
            label: 'Methods',
            items: [
              'Questionnaire research (200+ responses)',
              'Secondary research: industry and user-profile reports from Kujiale and Sina Home',
              'Qualitative user interviews',
              'Competitive analysis',
              'Existing website reporting and behavioral-data analysis',
            ],
          },
        ],
      },
    },
  },
  {
    id: 11,
    layout: 'personas',
    image: { src: '/images/tangping/frame-11.png', width: 2880, height: 1620 },
    copy: {
      zh: {
        title: '躺平设计家 · 用户调研',
        groups: [
          {
            label: '分析维度',
            items: ['需求、动机', '工作流', '设计触媒渠道', '产品相关行为和态度', '分享 / 连接行为', '选择躺平 / 竞品的原因'],
          },
          {
            label: '用户类型',
            items: ['家装入门型', '家装助理型设计师', '软装商家运营设计师', '家装业务驱动型设计师', '家装设计驱动型设计师', '软装商家外包设计师'],
          },
        ],
      },
      en: {
        title: 'Tangping Designer · User research',
        groups: [
          {
            label: 'Analysis dimensions',
            items: ['Needs and motivations', 'Workflow', 'Design media and channels', 'Product-related behavior and attitudes', 'Sharing and connection behavior', 'Reasons for choosing Tangping or competitors'],
          },
          {
            label: 'User types',
            items: ['Entry-level home designer', 'Assistant home designer', 'Soft-furnishing merchant operator', 'Business-driven home designer', 'Design-driven home designer', 'Outsourced soft-furnishing designer'],
          },
        ],
      },
    },
  },
  {
    id: 20,
    layout: 'needs-matrix',
    image: { src: '/images/tangping/frame-20.png', width: 2880, height: 1620 },
    copy: {
      zh: {
        title: '躺平设计家 · 需求因角色不同而异',
        groups: [
          { label: '分析模型', items: ['人物角色诉求（需求细分）和产品机会画布'] },
          { label: '图例', items: ['机会点 / 竞品未匹配', '较匹配', '待改进', '不匹配 / 竞品占优'] },
          { label: '角色', items: ['家装入门型', '家装助理型设计师', '家装业务驱动型设计师', '家装设计驱动型设计师', '软装商家运营设计师', '软装商家外包设计师'] },
          { label: '成长需求', items: ['软硬装设计知识技能、工具技能、设计风格美学', '施工工艺、材料安装知识；软装配色、设计风格；晋升、跳槽设计工作室', '签单技巧、方案推销能力、管理能力；软装配色、设计风格知识；晋升、创业、做独立', '客户运营能力', '—', '—'] },
          { label: '利益需求', items: ['设计导购分佣、接设计私单', '获取客户流量线索、线上 / 线下设计导购分佣、设计私单', '获取客户流量线索、设计私单', '获取客户流量线索、设计接单、商家设计委托', '获取客户流量线索、商品模型所见即所得', '稳定的商家客源、商品模型所见即所得'] },
          { label: '影响力', items: ['专业信贷背书：在设计比赛获奖给自己履历添彩', '成就感：作品被喜欢', '专业信度背书：平台认证；成就感：作品被喜欢', '树立个人 / 机构品牌；成就感：作品被喜欢', '—', '成就感：作品被喜欢'] },
          { label: '工作需求', items: ['工具简单易学、设计输出高效智能、素材丰富时尚美观', '设计输出高效智能、工具简单易学、素材丰富时尚美观、渲染效果良好', '设计输出高效智能、素材丰富时尚美观、支持模型个性化 / 复式、商品模型所见即所得、方案展示直观漂亮、渲染效果良好', '支持个性化 / 复式、支持多领域设计、渲染效果好、素材丰富时尚美观、商品模型所见即所得、设计输出高效智能', '工具简单易学、设计输出高效智能', '工具简单易学、设计输出高效智能、渲染品质良好、素材丰富时尚美观'] },
        ],
      },
      en: {
        title: 'Tangping Designer · Needs differ by role',
        groups: [
          { label: 'Analysis model', items: ['Persona needs segmentation and product opportunity canvas'] },
          { label: 'Legend', items: ['Opportunity / unmet by competitors', 'Strong match', 'Needs improvement', 'Mismatch / competitor advantage'] },
          { label: 'Roles', items: ['Entry-level home designer', 'Assistant home designer', 'Business-driven home designer', 'Design-driven home designer', 'Soft-furnishing merchant operator', 'Outsourced soft-furnishing designer'] },
          { label: 'Growth needs', items: ['Hard- and soft-furnishing knowledge, tool skills, and visual style', 'Construction and installation knowledge, styling, and career progression', 'Sales, proposal, management, styling, and independent-practice skills', 'Customer operations', 'None identified', 'None identified'] },
          { label: 'Commercial needs', items: ['Shopping-guide commission and private design work', 'Customer leads, online and offline commission, and private work', 'Customer leads and private work', 'Customer leads, design orders, and merchant commissions', 'Customer leads and product models that match final results', 'Stable merchant clients and product models that match final results'] },
          { label: 'Influence', items: ['Professional credibility through design awards', 'Recognition when work is liked', 'Platform certification and recognition', 'Build a personal or studio brand and gain recognition', 'None identified', 'Recognition when work is liked'] },
          { label: 'Workflow needs', items: ['Easy tools, efficient output, and rich visual assets', 'Efficient output, easy tools, rich assets, and strong rendering', 'Efficient output, rich assets, custom modeling, commerce-ready models, clear presentation, and rendering', 'Custom modeling, multi-domain design, rendering, rich assets, commerce-ready models, and efficient output', 'Easy tools and efficient output', 'Easy tools, efficient output, high-quality rendering, and rich assets'] },
        ],
      },
    },
  },
] as const satisfies readonly TangpingFrame[];

export const tangpingFrames: readonly TangpingFrame[] = [...frameDefinitions].sort(
  (left, right) => left.id - right.id,
);
