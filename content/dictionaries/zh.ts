import type { Dictionary } from '@/content/dictionaries/en';

export const zhDictionary = {
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
  menu: {
    open: '打开菜单',
    close: '关闭菜单',
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
