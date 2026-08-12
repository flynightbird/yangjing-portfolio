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
      designerCredit: string;
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
      growthBase: ProjectCopy;
      meeting: ProjectCopy & {
        states: readonly string[];
        platforms: readonly string[];
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
      previousImage: string;
      nextImage: string;
      galleryPosition: string;
      imageUnavailable: string;
      visitProject: string;
      skillsLabel: string;
    };
    mediaSeries: {
      title: string;
      regionLabel: string;
      openMedia: string;
      mediaDialog: string;
      closeMedia: string;
      imageUnavailable: string;
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
    description: 'Product Designer focused on AI and complex systems.',
    hero: {
      name: 'Yang Jing',
      designerRole: 'Product Designer',
      builderRole: 'AI-native Builder',
      designerSummary:
        'Product Designer focused on AI and complex systems.',
      designerCredit: 'UI/UX Designer',
      builderSummary:
        'Using Vibe Coding to turn product judgment into testable, working prototypes.',
      portraitDraft: 'Portrait awaiting approved photography',
      portraitLabel: 'Yang Jing portrait frame',
    },
    projects: {
      xuelang: {
        company: 'ByteDance',
        kind: 'Deep case study',
        title: 'Xuelang learning experience',
        proposition:
          'Made course quality easier to recognize, evaluate, and experience across the learning journey.',
        role: 'Product Design Lead',
        status: 'Experiment validated',
        mediaLabel: 'Xuelang product panorama',
        action: 'View case study',
      },
      callAgent: {
        company: 'Agora',
        kind: 'Deep case study',
        title: 'Call Agent',
        proposition:
          'Turned conversational AI capabilities into a configurable workflow for testing, release, and call operations.',
        role: 'Independent Product Designer',
        status: 'Launched',
        mediaLabel: 'Call Agent product workflow',
        action: 'View case study',
      },
      convoAi: {
        company: 'Agora',
        kind: 'Consumer experience',
        title: 'ConvoAI',
        proposition:
          'Unified real-time AI conversation states, feedback, and controls across App and Web.',
        role: 'Independent Product Designer',
        status: 'Launched',
        mediaLabel: 'ConvoAI App and Web product experience',
        action: 'View case study',
        temporaryNotice:
          'ConvoAI App and Web product media.',
      },
      growthBase: {
        company: 'Personal concept',
        kind: 'WeChat Mini Program · Interactive prototype',
        title: 'AI Coach · Emotional IP Companionship',
        proposition:
          'Redesigned routine health check-ins as a responsive daily companion through generative character films, focused actions, and tangible feedback.',
        role: 'Independent product and visual design · AI-assisted prototyping',
        status: 'Personal concept',
        mediaLabel: 'Generative character film and interactive prototype',
        action: 'View case study',
      },
      meeting: {
        company: 'Agora',
        kind: 'Enterprise meeting aPaaS',
        title: 'Agora Meeting',
        proposition:
          'Created one meeting system that adapts its stage, workspace, and information hierarchy across four platforms.',
        role: 'Independent Product Designer',
        status: 'Shipped across four platforms',
        mediaLabel: 'Explore Agora Meeting across Web and mobile',
        action: 'View case study',
        states: ['Adaptive stage', 'Collaborative workspace', 'Real-time information'],
        platforms: ['Desktop', 'Web', 'Tablet', 'Mobile'],
      },
      aidx: {
        company: 'Singapore AI company',
        kind: 'Singapore AI company',
        title: 'AIDX',
        proposition:
          'A new website for AIDX, a Singapore AI safety company, shaped through interface, information structure, and motion.',
        role: 'UI/UX design, information architecture, and motion',
        status: 'Live website',
        mediaLabel: 'Public website capture',
        action: 'Visit live site',
        scope: ['UI/UX Design', 'Information Architecture', 'Motion'],
        captureCaption: 'Public website captured in July 2026.',
      },
      sttDemo: {
        company: 'Agora',
        kind: 'Build Lab',
        title: 'STT Demo',
        proposition:
          'Keep bilingual conversation clear through real-time transcription and translation.',
        role: 'Product design and AI-assisted prototyping',
        status: 'Pinned static prototype',
        mediaLabel: 'Interactive static prototype',
        action: 'Explore Build Lab',
      },
    },
    archive: {
      title: 'Selected consumer product work',
      description:
        'An image-led selection spanning product experience, visual systems, and character design.',
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
      previousImage: 'Previous gallery image',
      nextImage: 'Next gallery image',
      galleryPosition: 'Gallery position',
      imageUnavailable: 'Image unavailable',
      visitProject: 'Visit public project',
      skillsLabel: 'Skills',
    },
    mediaSeries: {
      title: 'IP & Creative',
      regionLabel: 'IP and creative media',
      openMedia: 'Open media',
      mediaDialog: 'Media preview',
      closeMedia: 'Close media',
      imageUnavailable: 'Image is currently unavailable',
    },
    about: {
      title: 'From product complexity to working experiences',
      career:
        'My path connects user research, consumer products at scale, complex systems, and AI product design.',
      opportunity:
        'I use AI-assisted prototyping to make product decisions tangible earlier.',
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
      'Product Designer focused on AI and complex systems.',
    career:
      'From user research and consumer products at scale to complex systems and AI product design.',
    opportunityTitle: 'Selected opportunities',
    opportunity:
      'Product design for AI, real-time interaction, and complex workflows.',
    awaitingTitle: 'Portfolio materials',
    portrait: 'Approved portrait photography',
    resumes: 'English and Chinese resumes',
    contact: 'Email, LinkedIn, and WeChat',
    contactDescription:
      'Direct contact details for product and design conversations.',
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
