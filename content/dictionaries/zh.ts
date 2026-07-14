import type { Dictionary } from '@/content/dictionaries/en';

export const zhDictionary = {
  site: {
    name: 'Yang Jing',
    homeLabel: 'Yang Jing 首页',
    skipToContent: '跳到主要内容',
  },
  navigation: {
    work: '作品',
    about: '关于',
    resume: '简历',
    contact: '联系',
  },
  languages: {
    en: '英语',
    zh: '简体中文',
  },
  localeSwitcher: {
    label: '选择语言',
    fallbackNotice: '此页面暂无{language}版本。',
    fallbackAction: '打开{language}首页',
  },
  menu: {
    label: '导航',
    open: '打开菜单',
    close: '关闭菜单',
  },
  resume: {
    englishPdf: '英文 PDF',
    chinesePdf: '中文 PDF',
  },
  home: {
    title: 'Yang Jing',
    description: '产品设计师 × AI 原生构建者。',
  },
  footer: {
    privacy:
      '本静态网站使用 Cloudflare Web Analytics，不设联系表单。',
  },
  actions: {
    viewWork: '查看作品',
    viewCaseStudy: '查看案例',
    exploreBuild: '查看实验项目',
    launchDemo: '打开演示',
    backToWork: '返回作品',
    viewResume: '查看简历',
    downloadResume: '下载简历',
    viewPdf: '查看 PDF',
    downloadPdf: '下载 PDF',
    previous: '上一个项目',
    next: '下一个项目',
  },
  notFound: {
    title: '页面未找到',
    description: '请求的页面不存在。',
    home: '返回首页',
  },
  directContact: {
    email: '邮箱',
    linkedin: '领英',
  },
} as const satisfies Dictionary;

export default zhDictionary;
