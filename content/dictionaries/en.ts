export interface Dictionary {
  navigation: {
    work: string;
    about: string;
    resume: string;
    contact: string;
  };
  languages: {
    en: string;
    zh: string;
  };
  menu: {
    open: string;
    close: string;
  };
  actions: {
    viewWork: string;
    viewCaseStudy: string;
    exploreBuild: string;
    launchDemo: string;
    backToWork: string;
    viewResume: string;
    downloadResume: string;
    viewPdf: string;
    downloadPdf: string;
    previous: string;
    next: string;
  };
  notFound: {
    title: string;
    description: string;
    home: string;
  };
  directContact: {
    email: string;
    linkedin: string;
  };
}

export const enDictionary = {
  navigation: {
    work: 'Work',
    about: 'About',
    resume: 'Resume',
    contact: 'Contact',
  },
  languages: {
    en: 'English',
    zh: 'Simplified Chinese',
  },
  menu: {
    open: 'Open menu',
    close: 'Close menu',
  },
  actions: {
    viewWork: 'View work',
    viewCaseStudy: 'View case study',
    exploreBuild: 'Explore Build Lab',
    launchDemo: 'Launch demo',
    backToWork: 'Back to work',
    viewResume: 'View resume',
    downloadResume: 'Download resume',
    viewPdf: 'View PDF',
    downloadPdf: 'Download PDF',
    previous: 'Previous project',
    next: 'Next project',
  },
  notFound: {
    title: 'Page not found',
    description: 'The requested page does not exist.',
    home: 'Back to home',
  },
  directContact: {
    email: 'Email',
    linkedin: 'LinkedIn',
  },
} as const satisfies Dictionary;

export default enDictionary;
