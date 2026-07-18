export interface Dictionary {
  site: {
    name: string;
    homeLabel: string;
    skipToContent: string;
  };
  navigation: {
    work: string;
    archive: string;
    about: string;
  };
  languages: {
    en: string;
    zh: string;
  };
  localeSwitcher: {
    label: string;
    fallbackNotice: string;
    fallbackAction: string;
  };
  menu: {
    label: string;
    open: string;
    close: string;
  };
  resume: {
    englishPdf: string;
    chinesePdf: string;
  };
  home: {
    title: string;
    description: string;
    hero: {
      name: string;
      designerRole: string;
      builderRole: string;
      designerSummary: string;
      builderSummary: string;
      portraitDraft: string;
      portraitLabel: string;
    };
    projects: {
      xuelang: ProjectCopy;
      callAgent: ProjectCopy;
      convoAi: ProjectCopy & {
        temporaryNotice: string;
      };
      meeting: ProjectCopy & {
        stages: readonly ProjectStageCopy[];
      };
      aidx: ProjectCopy & {
        scope: readonly string[];
        captureCaption: string;
      };
      sttDemo: ProjectCopy;
    };
    archive: {
      title: string;
      description: string;
      draftSlot: string;
      placeholderLabel: string;
      carouselLabel: string;
      previousProject: string;
      nextProject: string;
      positionLabel: string;
      projectCount: string;
      openImage: string;
      imageDialog: string;
      closeImage: string;
      visitProject: string;
      skillsLabel: string;
    };
    about: {
      title: string;
      career: string;
      opportunity: string;
      action: string;
    };
  };
  draftCase: {
    draft: string;
    mediaUnavailable: string;
    evidenceBoundary: string;
    approvedEvidence: string;
    plannedEvidence: string;
    meeting: {
      title: string;
      proposition: string;
      summary: string;
      shipped: string;
      retrospective: string;
      limitations: string;
    };
  };
  aboutPage: {
    title: string;
    intro: string;
    career: string;
    opportunityTitle: string;
    opportunity: string;
    awaitingTitle: string;
    portrait: string;
    resumes: string;
    contact: string;
    contactDescription: string;
  };
  footer: {
    privacy: string;
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

interface ProjectStageCopy {
  title: string;
  description: string;
}

interface ProjectCopy {
  company: string;
  kind: string;
  title: string;
  proposition: string;
  role: string;
  status: string;
  mediaLabel: string;
  action: string;
}

export const enDictionary = {
  site: {
    name: 'Yang Jing',
    homeLabel: 'Yang Jing home',
    skipToContent: 'Skip to main content',
  },
  navigation: {
    work: 'Work',
    archive: 'Archive',
    about: 'About',
  },
  languages: {
    en: 'English',
    zh: 'Simplified Chinese',
  },
  localeSwitcher: {
    label: 'Select language',
    fallbackNotice: 'This page is not available in {language}.',
    fallbackAction: 'Open the {language} homepage',
  },
  menu: {
    label: 'Menu',
    open: 'Open menu',
    close: 'Close menu',
  },
  resume: {
    englishPdf: 'English PDF',
    chinesePdf: 'Chinese PDF',
  },
  home: {
    title: 'Yang Jing',
    description: 'Product Designer and AI-native Builder.',
    hero: {
      name: 'Yang Jing',
      designerRole: 'Product Designer',
      builderRole: 'AI-native Builder',
      designerSummary:
        'Designing at consumer scale and across complex AI and B2B systems.',
      builderSummary:
        'Using Vibe Coding to prototype, test, and ship working experiences.',
      portraitDraft: 'Portrait awaiting approved photography',
      portraitLabel: 'Yang Jing portrait frame',
    },
    projects: {
      xuelang: {
        company: 'ByteDance / 字节跳动',
        kind: 'Deep case study',
        title: 'Xuelang Commercial Experience Upgrade',
        proposition:
          'From a course-selling tool to a high-quality learning platform',
        role: 'Lead UX Designer',
        status: 'Experiment validated',
        mediaLabel: 'Xuelang product panorama',
        action: 'View case study',
      },
      callAgent: {
        company: 'Agora / 声网',
        kind: 'Deep case study',
        title: 'Call Agent',
        proposition:
          'Make AI visible, testable, and controllable before release.',
        role: 'Lead Product Designer',
        status: 'Limited beta',
        mediaLabel: 'Real product evidence',
        action: 'View case study',
      },
      convoAi: {
        company: 'Agora / 声网',
        kind: 'Consumer experience',
        title: 'ConvoAI',
        proposition:
          'AI conversation designed for the people directly experiencing it.',
        role: 'Product Designer',
        status: 'Public product, media replacement pending',
        mediaLabel: 'Temporary web and app media',
        action: 'View live product',
        temporaryNotice:
          'Temporary third-party imagery. Replace with owned project assets before publishing.',
      },
      meeting: {
        company: 'Agora / 声网',
        kind: 'Interaction deep dive',
        title: 'Meeting',
        proposition:
          'Make highly dynamic real-time collaboration visible and controllable.',
        role: 'Product Designer',
        status: 'Shipped interface and 2026 retrospective',
        mediaLabel: 'Approved interaction media pending',
        action: 'Open draft case',
        stages: [
          {
            title: 'Before the meeting',
            description:
              'Clarify identity, devices, permissions, and readiness before entry.',
          },
          {
            title: 'During the meeting',
            description:
              'Keep speaking, collaboration, and control states visible as they change.',
          },
          {
            title: 'After the meeting',
            description:
              'Preserve an understandable record of what happened and what follows.',
          },
        ],
      },
      aidx: {
        company: 'Singapore AIDX',
        kind: 'Singapore AI company',
        title: 'AIDX',
        proposition:
          'A live website for AIDX, a Singapore AI safety company, shaped through interface, information structure, and motion.',
        role: 'UI/UX design, information architecture, and motion',
        status: 'Live website',
        mediaLabel: 'Public website capture',
        action: 'Visit live site',
        scope: ['UI/UX Design', 'Information Architecture', 'Motion'],
        captureCaption: 'Public website captured in July 2026.',
      },
      sttDemo: {
        company: 'Agora / 声网',
        kind: 'Build Lab',
        title: 'STT Demo',
        proposition:
          'Make bilingual conversation legible while it is happening.',
        role: 'Product design and AI-assisted prototyping',
        status: 'Pinned static prototype',
        mediaLabel: 'Interactive static prototype',
        action: 'Explore Build Lab',
      },
    },
    archive: {
      title: 'More Consumer Product Work',
      description:
        'A lighter image-led view of selected product, brand, and character work.',
      draftSlot: 'Draft media slot',
      placeholderLabel: 'Visual placeholder',
      carouselLabel: 'Visual Archive projects',
      previousProject: 'Previous archive project',
      nextProject: 'Next archive project',
      positionLabel: 'Archive position',
      projectCount: 'projects',
      openImage: 'Open project image',
      imageDialog: 'Project image detail',
      closeImage: 'Close image',
      visitProject: 'Visit public project',
      skillsLabel: 'Skills',
    },
    about: {
      title: 'Across scale, systems, and working prototypes',
      career:
        'From large-scale consumer product design, into complex B2B and AI systems, then into AI-assisted product building.',
      opportunity:
        'Product design + AI prototyping, from complex idea to working experience.',
      action: 'About and contact',
    },
  },
  draftCase: {
    draft: 'Draft',
    mediaUnavailable: 'Approved media is not available yet.',
    evidenceBoundary:
      'This local framework contains only public-safe structure. It is blocked from publication until approved evidence replaces every Draft state.',
    approvedEvidence: 'Approved framing',
    plannedEvidence: 'Required evidence before publication',
    meeting: {
      title: 'Meeting',
      proposition:
        'Make highly dynamic real-time collaboration visible and controllable.',
      summary:
        'This route separates shipped interaction evidence from a clearly labeled 2026 retrospective layer.',
      shipped: 'Shipped evidence',
      retrospective: '2026 retrospective',
      limitations:
        'No customer audience, outcome metric, or retrospective launch claim is included.',
    },
  },
  aboutPage: {
    title: 'About Yang Jing',
    intro:
      'Product Designer and AI-native Builder working across consumer scale, complex systems, and working prototypes.',
    career:
      'From large-scale consumer product design, into complex B2B and AI systems, then into AI-assisted product building.',
    opportunityTitle: 'Selected opportunities',
    opportunity:
      'Product design + AI prototyping, from complex idea to working experience.',
    awaitingTitle: 'Publication inputs pending',
    portrait: 'Approved portrait photography',
    resumes: 'English and Chinese resumes',
    contact: 'Email, LinkedIn, and WeChat',
    contactDescription:
      'Verified direct contact details will appear here when the private contact file is supplied.',
  },
  footer: {
    privacy:
      'This static site uses Cloudflare Web Analytics and has no contact form.',
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
