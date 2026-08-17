import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

import { load, type CheerioAPI } from "cheerio";
import JSZip from "jszip";
import mammoth from "mammoth";

import { decodeBrightspaceHtml } from "./lib/ela-modern-drama.js";
import { parseNsoPodcastEntries, youtubeVideoIdFromHref, type NsoPodcastEntry } from "./lib/nso-podcasts.js";
import { renderNextStepCourseShell, type NextStepShellLesson, type NextStepShellNavItem } from "./lib/next-step-course-shell.js";
import { applyStoredCourseEdits } from "./lib/course-editing/overrides.js";

const ROOT = path.resolve(".");
const D2L_SOURCE_PATH =
  "/Users/deanguedo/Downloads/D2LCCExport_149634_25-26 _ S2 _ Social Studies 10-1 _ Per 1(A) _ Sec _202651213.ZIP";
const MODULE_SOURCE_PATH = "/Users/deanguedo/Downloads/Social Studies 10-1 UPDATED MODULES-20260707T151048Z-3-001.zip";
const PODCAST_LIST_PATH = "/Users/deanguedo/Downloads/NSO SOCIAL STUDIES PODCAST LIST.docx";
const SOCIAL30_SUPPORT_SOURCE_ROOT = path.join(ROOT, "projects", "social30-1-related-issue-1-option-2", "workspace");

type ZipBundle = {
  key: string;
  sourcePath: string;
  zip: JSZip;
};

type ResourceCategory = "textbook" | "unit" | "student" | "media";
type SupportKind = "inquiry" | "source-analysis" | "position";

type ImportedResource = {
  category: ResourceCategory;
  title: string;
  href: string;
  previewHref?: string;
  sourcePath: string;
  description: string;
  supportKinds?: SupportKind[];
};

type StaticSupportResourceDefinition = {
  kind: SupportKind;
  title: string;
  sourceHref: string;
  previewHref?: string;
};

type SocialPodcastConnection = {
  id: string;
  issueNumber: number;
  title: string;
  href: string;
  description: string;
  lessonId?: string;
  lessonTitle?: string;
  status: "placed" | "fallback-overview";
  score: number;
  sourceLine: number;
};

type SocialPodcastMappingRecord = {
  title: string;
  href: string;
  sourceLine: number;
  issueNumber?: number;
  status: "placed" | "fallback-overview" | "quarantined" | "duplicate-suppressed";
  lessonId?: string;
  lessonTitle?: string;
  score?: number;
  reason: string;
};

type SocialPodcastMappingReport = {
  slug: string;
  course: string;
  sourcePath: string;
  parsed: number;
  counts: {
    placed: number;
    fallbackOverview: number;
    quarantined: number;
    duplicateSuppressed: number;
  };
  records: SocialPodcastMappingRecord[];
};

type LibraryDocument = ImportedResource & {
  id: string;
  extension: string;
  categoryLabel: string;
};

type SupportPrompt = {
  label: string;
  placeholder: string;
};

type SocialMediaItem = {
  id: string;
  title: string;
  sourceLabel: string;
  groupLabel: string;
  description: string;
  watchFor: string;
  href: string;
  embedHref?: string;
  kind: "iframe" | "audio" | "video" | "link";
};

type StudyOption = {
  title: string;
  prompt: string;
  answer: string[];
  skipGenericEnrichment?: boolean;
};

type PracticeSource = {
  id: string;
  title: string;
  sourceLabel: string;
  excerpt: string;
  prompt: string;
  lessonTitle: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
};

type IssueConfig = {
  slug: string;
  issueNumber: number;
  title: string;
  d2lTitle: string;
  issueQuestion: string;
  overviewIntro: string;
  textbookChapters: number[];
  vocabulary: StudyOption[];
  events: StudyOption[];
  mainIdeas: StudyOption[];
};

type D2lResource = {
  id: string;
  title: string;
  files: string[];
};

type D2lItem = {
  title: string;
  identifierRef?: string;
  resource?: D2lResource;
  children: D2lItem[];
};

type D2lCourse = {
  manifestTitle: string;
  resourceMap: Map<string, D2lResource>;
  items: D2lItem[];
};

type ModuleDocument = {
  unit: number;
  title: string;
  zipPath: string;
  rawText: string;
  mediaCount: number;
  media: ModuleMedia[];
  lineCount: number;
};

type ModuleMedia = {
  fileName: string;
  zipPath: string;
  buffer: Buffer;
  byteLength: number;
};

type ModuleVisualMetadata = {
  title: string;
  caption: string;
  lessonHint?: RegExp;
  priority?: number;
};

type ModuleVisualAsset = {
  unit: number;
  title: string;
  caption: string;
  href: string;
  prompt: string;
  lessonTitle: string;
  excerpt: string;
  priority: number;
};

type PromptKind = "concept" | "source" | "position" | "evidence";

type ModulePrompt = {
  id: string;
  unit: number;
  prompt: string;
  kind: PromptKind;
  documentTitle: string;
  sourcePath: string;
  heading: string;
  context?: string;
  matchText: string;
  sourceIndex: number;
  priority?: number;
};

type MappingRecord = {
  promptId: string;
  unit: number;
  prompt: string;
  kind: PromptKind;
  documentTitle: string;
  heading: string;
  status: "placed" | "skipped" | "quarantined";
  lessonId?: string;
  lessonTitle?: string;
  score?: number;
  reason?: string;
};

type MissingAssetRecord = {
  issueNumber: number;
  lessonId: string;
  lessonTitle: string;
  entryPath: string;
  requestedPath: string;
  fileName: string;
  description: string;
  status: "missing-from-d2l-export";
};

type MissingAssetCollector = {
  issueNumber: number;
  lessonId: string;
  lessonTitle: string;
  records: MissingAssetRecord[];
};

type BuildReport = {
  slug: string;
  issueNumber: number;
  title: string;
  d2lManifestTitle: string;
  sourcePaths: string[];
  docxModulesParsed: Array<{
    title: string;
    zipPath: string;
    unit: number;
    lineCount: number;
    mediaCount: number;
  }>;
  promptCounts: {
    extracted: number;
    placed: number;
    skipped: number;
    quarantined: number;
  };
  missingAssetCounts: {
    total: number;
    withDescription: number;
    fallbackOnly: number;
  };
  missingAssets: MissingAssetRecord[];
  records: MappingRecord[];
};

const ISSUE_CONFIGS: IssueConfig[] = [
  {
    slug: "social10-1-related-issue-1-option-2",
    issueNumber: 1,
    title: "Globalization and Identity",
    d2lTitle: "1. Globalization and Identity",
    issueQuestion: "To what extent should globalization shape identity?",
    overviewIntro:
      "Explore how globalization affects individual and collective identity, culture, language, technology, and opportunities for cultural exchange.",
    textbookChapters: [1, 2, 3, 4, 5],
    vocabulary: [
      {
        title: "Globalization",
        prompt: "What does globalization mean in this issue?",
        answer: [
          "Globalization is the growing connection among people, economies, cultures, technologies, and political decisions around the world. In this unit, it is not only trade or travel; it is the way ideas, products, media, languages, and values move across borders and shape how people understand themselves.",
          "A complete answer should explain both sides: globalization can connect people to new ideas and opportunities, but it can also pressure cultures and identities to become more alike."
        ]
      },
      {
        title: "Identity",
        prompt: "How is identity shaped by globalization?",
        answer: [
          "Identity is the way people understand who they are as individuals and as members of communities. Globalization can shape identity through media, language, consumer choices, migration, technology, and exposure to other cultures.",
          "A strong response should show that identity can be strengthened through exchange and choice, but also challenged when local languages, traditions, or cultural practices lose space."
        ]
      },
      {
        title: "Cultural homogenization",
        prompt: "What is cultural homogenization?",
        answer: [
          "Cultural homogenization happens when cultures become more similar because global products, media, values, and habits spread widely. The module connects this to global brands, fast food, entertainment, and shared consumer culture.",
          "Use the term when explaining the risk that globalization can reduce cultural distinctiveness or make one culture appear dominant."
        ]
      },
      {
        title: "Hybridization",
        prompt: "How is cultural hybridization different from homogenization?",
        answer: [
          "Hybridization happens when cultures mix and create something new. Unlike homogenization, it does not simply make cultures identical; it can blend local and global elements in creative ways.",
          "A strong example explains how people adapt global influences to local needs, languages, values, or traditions."
        ]
      },
      {
        title: "Cultural revitalization",
        prompt: "Why does cultural revitalization matter in a globalizing world?",
        answer: [
          "Cultural revitalization means renewing or strengthening cultural practices, languages, and identities. It matters because communities can respond to globalization by protecting and sharing what is important to them.",
          "Use this idea to show that people are not passive: they can make choices about preserving identity while still participating in global connections."
        ]
      }
    ],
    events: [
      {
        title: "Sesame Street and local adaptation",
        prompt: "What does a localized global media example show?",
        answer: [
          "A global media product can be adapted for local cultures, languages, and audiences. This shows hybridization because global formats can carry local messages rather than simply replacing local identity.",
          "The example helps answer the issue by showing that globalization can shape identity, but local communities can also shape globalization."
        ]
      },
      {
        title: "Global popular culture",
        prompt: "How can global popular culture influence identity?",
        answer: [
          "Global popular culture spreads through movies, music, social media, fashion, phones, and brands. It can create shared experiences across countries, but it can also make dominant cultural values seem normal or universal.",
          "A complete answer should explain opportunity and pressure: people may gain new ways to express themselves while also facing pressure to consume or imitate global trends."
        ]
      },
      {
        title: "Language and culture",
        prompt: "Why are language and culture connected?",
        answer: [
          "Language carries stories, values, relationships, and ways of understanding the world. When a language is promoted or revitalized, a culture can preserve identity and pass knowledge to the next generation.",
          "In this issue, language is useful evidence because globalization can either endanger languages or give communities tools to share and strengthen them."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Globalization creates choices and pressures",
        prompt: "What is the main tension in Related Issue 1?",
        answer: [
          "The main tension is whether globalization should be embraced because it expands connection and opportunity, or limited because it can weaken identity, language, and culture.",
          "A strong position does not simply say globalization is good or bad. It judges when globalization helps people shape identity and when it starts shaping identity for them."
        ]
      },
      {
        title: "Identity can be individual and collective",
        prompt: "How should identity be discussed in writing?",
        answer: [
          "Identity should be discussed at both individual and collective levels. Individuals make choices about media, language, work, and belonging, while groups protect traditions, languages, and cultural practices.",
          "This distinction helps build a more precise response to the issue question."
        ]
      }
    ]
  },
  {
    slug: "social10-1-related-issue-2-option-2",
    issueNumber: 2,
    title: "Historical Globalization",
    d2lTitle: "2. Historical Globalization",
    issueQuestion: "To what extent should contemporary society respond to the legacies of historical globalization?",
    overviewIntro:
      "Investigate how historical globalization, imperialism, Eurocentrism, and cultural contact affected societies and how people respond to those legacies today.",
    textbookChapters: [6, 7, 8],
    vocabulary: [
      {
        title: "Historical globalization",
        prompt: "What does historical globalization mean?",
        answer: [
          "Historical globalization refers to earlier periods of global contact, trade, migration, imperial expansion, and cultural exchange. In this issue, it often focuses on European expansion and imperialism.",
          "A complete answer should explain that historical globalization created long-term consequences, including economic change, cultural disruption, loss of land, and new forms of resistance."
        ]
      },
      {
        title: "Imperialism",
        prompt: "What is imperialism?",
        answer: [
          "Imperialism is the domination of one people or territory by another country or empire. Domination can involve political control, economic control, settlement, cultural pressure, and military power.",
          "Use this term when explaining why historical globalization created unequal relationships between imperial powers and colonized peoples."
        ]
      },
      {
        title: "Eurocentrism",
        prompt: "Why is Eurocentrism important in this issue?",
        answer: [
          "Eurocentrism is the belief or habit of seeing European ideas, values, and experiences as central or superior. It helped justify imperialism by treating European worldviews as the standard for judging others.",
          "A strong answer connects Eurocentrism to policies and attitudes that harmed Indigenous peoples and other colonized societies."
        ]
      },
      {
        title: "Ethnocentrism",
        prompt: "How does ethnocentrism affect contact between cultures?",
        answer: [
          "Ethnocentrism means judging other cultures by the standards of one's own culture. It can lead people to misunderstand, dismiss, or devalue other ways of life.",
          "In this issue, ethnocentrism helps explain how cultural contact could become domination instead of respectful exchange."
        ]
      },
      {
        title: "Residential schools",
        prompt: "Why are residential schools a legacy of historical globalization?",
        answer: [
          "Residential schools were part of colonial policies that tried to assimilate Indigenous children and weaken Indigenous languages, cultures, families, and identities.",
          "They are a legacy because their effects continued across generations and require contemporary responses such as truth-telling, reconciliation, and institutional change."
        ]
      }
    ],
    events: [
      {
        title: "Cultural contact",
        prompt: "Why does cultural contact matter?",
        answer: [
          "Cultural contact can lead to exchange, cooperation, conflict, and change. In historical globalization, contact often happened within unequal power relationships shaped by trade, settlement, disease, military force, and imperial goals.",
          "A complete answer identifies who benefited, who was harmed, and how the consequences lasted."
        ]
      },
      {
        title: "Industrial Revolution and imperialism",
        prompt: "How did industrialization connect to imperialism?",
        answer: [
          "Industrialization increased demand for raw materials, markets, labour, and investment opportunities. These needs encouraged imperial powers to expand their control over other regions.",
          "This connection matters because economic motives were often tied to political power and cultural beliefs about superiority."
        ]
      },
      {
        title: "Responses to imperialism",
        prompt: "How have people responded to imperialism?",
        answer: [
          "People responded to imperialism through resistance, adaptation, negotiation, cultural survival, political organization, and later movements for rights and self-determination.",
          "A strong response should avoid portraying affected peoples only as victims; it should also recognize agency and ongoing efforts to respond to legacies."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Legacies require judgment",
        prompt: "What is the main tension in Related Issue 2?",
        answer: [
          "The main tension is how far contemporary society should go in responding to historical wrongs. Responses may include education, reconciliation, apologies, compensation, policy change, and support for cultural revitalization.",
          "A strong position explains why legacies still matter today and what type of response is justified."
        ]
      },
      {
        title: "Historical causes and contemporary effects",
        prompt: "How should evidence be organized for this issue?",
        answer: [
          "Good evidence connects a historical cause to a present-day effect. For example, a colonial policy should be linked to a consequence for land, language, culture, economic opportunity, or political power.",
          "This cause-effect structure helps avoid shallow answers that only list facts."
        ]
      }
    ]
  },
  {
    slug: "social10-1-related-issue-3-option-2",
    issueNumber: 3,
    title: "Sustainable Prosperity",
    d2lTitle: "3.  Sustainable Prosperity",
    issueQuestion: "To what extent does globalization contribute to sustainable prosperity for all people?",
    overviewIntro:
      "Study economic globalization, sustainability, prosperity, global trade, consumer choices, economic sovereignty, and the tension between growth and responsibility.",
    textbookChapters: [9, 10, 11, 12, 13, 14, 18],
    vocabulary: [
      {
        title: "Sustainable prosperity",
        prompt: "What does sustainable prosperity mean?",
        answer: [
          "Sustainable prosperity means achieving well-being and economic opportunity in ways that can last over time without exhausting people, communities, or the environment.",
          "In this issue, the key question is whether globalization creates prosperity broadly or whether it creates benefits for some while creating environmental, social, or economic costs for others."
        ]
      },
      {
        title: "Economic globalization",
        prompt: "What is economic globalization?",
        answer: [
          "Economic globalization is the increasing integration of economies through trade, investment, production, finance, technology, and labour connections across borders.",
          "A complete answer should explain how it can create jobs, access to goods, and investment, while also raising concerns about inequality, working conditions, dependency, and environmental pressure."
        ]
      },
      {
        title: "Trade liberalization",
        prompt: "What is trade liberalization?",
        answer: [
          "Trade liberalization means reducing barriers to trade, such as tariffs, quotas, and restrictions. It is often used to encourage global trade and economic growth.",
          "Use it as evidence when discussing the benefits and risks of opening markets to global competition."
        ]
      },
      {
        title: "Transnational corporation",
        prompt: "Why are transnational corporations important to globalization?",
        answer: [
          "A transnational corporation operates in more than one country. These companies can bring investment, jobs, technology, and products, but they can also shift production to places with lower costs or weaker regulations.",
          "They matter because they show how economic power can cross borders and affect local communities."
        ]
      },
      {
        title: "Economic sovereignty",
        prompt: "What is economic sovereignty?",
        answer: [
          "Economic sovereignty is the ability of a government or community to make independent economic decisions. Globalization can challenge it when trade agreements, corporations, markets, or debt limit local control.",
          "A strong response should explain the trade-off between participating in global markets and protecting local priorities."
        ]
      }
    ],
    events: [
      {
        title: "Bretton Woods institutions",
        prompt: "Why do the World Bank and IMF matter?",
        answer: [
          "The World Bank and IMF are international financial institutions connected to the post-war global economic system. They can provide loans, advice, and development support, but they are also criticized when conditions attached to assistance limit local choices.",
          "They help explain how globalization can organize cooperation while also creating debates about power and fairness."
        ]
      },
      {
        title: "Free trade agreements",
        prompt: "How can free trade agreements affect prosperity?",
        answer: [
          "Free trade agreements can increase trade, lower costs, and create access to markets. They can also expose workers and businesses to stronger competition and can limit some government policy options.",
          "A complete answer weighs who gains, who faces costs, and whether prosperity is sustainable."
        ]
      },
      {
        title: "Consumerism",
        prompt: "How is consumerism connected to sustainability?",
        answer: [
          "Consumerism encourages people to buy more goods and services. It can support economic activity, but it can also increase waste, resource extraction, and environmental pressure.",
          "In this issue, consumer choices become evidence for the tension between prosperity and sustainability."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Prosperity is not only money",
        prompt: "How should prosperity be defined?",
        answer: [
          "Prosperity includes economic security, opportunity, health, education, community well-being, environmental quality, and quality of life. It is broader than income alone.",
          "This definition helps answer whether globalization creates prosperity for all people or only creates wealth in narrow ways."
        ]
      },
      {
        title: "Sustainability requires trade-offs",
        prompt: "What is the main tension in Related Issue 3?",
        answer: [
          "The main tension is whether economic growth through globalization can be balanced with environmental protection, social fairness, and long-term well-being.",
          "A strong position recognizes that prosperity can be real while still asking whether it is shared and sustainable."
        ]
      }
    ]
  },
  {
    slug: "social10-1-related-issue-4-option-2",
    issueNumber: 4,
    title: "Global Citizenship",
    d2lTitle: "4. Global Citizenship",
    issueQuestion: "To what extent should I, as a citizen, respond to globalization?",
    overviewIntro:
      "Consider quality of life, human rights, democracy, global awareness, participation, civic responsibility, activism, and personal responses to globalization.",
    textbookChapters: [13, 14, 15, 16, 17, 18, 19],
    vocabulary: [
      {
        title: "Global citizenship",
        prompt: "What does global citizenship mean?",
        answer: [
          "Global citizenship means seeing oneself as connected to people beyond local or national borders and accepting some responsibility for global issues.",
          "In this issue, it includes awareness, informed judgment, ethical consumer choices, participation, advocacy, and action."
        ]
      },
      {
        title: "Human rights",
        prompt: "Why are human rights central to this issue?",
        answer: [
          "Human rights are basic rights and freedoms that all people should have because they are human. Globalization connects people across borders, so human-rights issues in one place can become concerns for citizens elsewhere.",
          "A complete answer explains both the principle and the challenge: knowing about human-rights issues creates questions about responsibility."
        ]
      },
      {
        title: "Quality of life",
        prompt: "How is quality of life different from standard of living?",
        answer: [
          "Standard of living usually focuses on material and economic conditions such as income, goods, and services. Quality of life is broader and includes health, rights, safety, education, relationships, environment, and dignity.",
          "This distinction helps evaluate globalization because economic growth does not automatically improve every part of life."
        ]
      },
      {
        title: "Civic responsibility",
        prompt: "What is civic responsibility?",
        answer: [
          "Civic responsibility means the duties people accept as members of a community, such as staying informed, voting, obeying laws, protecting rights, and helping address public issues.",
          "Globalization expands the scale of responsibility by raising questions about what citizens owe to people affected by global systems."
        ]
      },
      {
        title: "Civil disobedience",
        prompt: "When might civil disobedience be used?",
        answer: [
          "Civil disobedience is the deliberate, public refusal to obey a law or rule judged to be unjust. It is usually connected to protest, conscience, and efforts to create change.",
          "A strong answer should explain that it can be powerful but also controversial because it challenges legal order in the name of justice."
        ]
      }
    ],
    events: [
      {
        title: "Universal Declaration of Human Rights",
        prompt: "Why is the Universal Declaration of Human Rights important?",
        answer: [
          "The Universal Declaration of Human Rights provides a global statement of rights that people and governments can use to judge treatment, dignity, and freedom.",
          "It matters because globalization makes human-rights issues visible across borders and gives citizens a language for response."
        ]
      },
      {
        title: "Internet activism",
        prompt: "How can the internet support global citizenship?",
        answer: [
          "The internet can spread information, organize campaigns, pressure governments or corporations, and connect people who care about the same issue.",
          "A complete answer also names limits: information can be incomplete, unequal access matters, and online awareness does not always become meaningful action."
        ]
      },
      {
        title: "Boycott and ethical consumer action",
        prompt: "How can consumer choices become citizenship actions?",
        answer: [
          "Consumers can use boycotts, buycotts, petitions, and public pressure to respond to labour, environmental, or human-rights concerns linked to global production.",
          "This example shows that citizenship can happen through everyday choices, but the impact depends on organization, evidence, and sustained pressure."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Awareness creates responsibility",
        prompt: "What is the main tension in Related Issue 4?",
        answer: [
          "The main tension is how much responsibility an individual citizen should take for global issues. Globalization makes distant issues visible and connected to daily life, but individuals also have limits on power, knowledge, and resources.",
          "A strong position explains what kind of response is reasonable, effective, and ethical."
        ]
      },
      {
        title: "Responses can happen at many scales",
        prompt: "How should global citizenship responses be organized?",
        answer: [
          "Responses can be individual, local, national, or global. They can include learning, voting, volunteering, donating, advocacy, protest, responsible consumption, or joining organizations.",
          "This helps build a balanced answer because not every issue requires the same kind of response."
        ]
      }
    ]
  }
];

const MODULE_VISUAL_METADATA: Record<number, Record<string, ModuleVisualMetadata>> = {
  3: {
    "image1.png": {
      title: "Trans Mountain Pipeline map",
      caption: "A pipeline route map used to examine resource development, prosperity, and sustainability.",
      lessonHint: /corporate|sovereignty|sustainability|prosperity|resource/i,
      priority: 1
    }
  },
  4: {
    "image8.png": {
      title: "The Story of Stuff",
      caption: "A consumerism source about waste, health, communities, and the environmental cost of buying more.",
      lessonHint: /affects individuals|communities|responsib|action|stuff/i,
      priority: 1
    },
    "image1.png": {
      title: "China Blue documentary source",
      caption: "A documentary source connected to global production, consumer choices, and working conditions.",
      lessonHint: /rights|quality|communities|consumer|responsib/i,
      priority: 2
    },
    "image4.png": {
      title: "Factory production",
      caption: "A visual source showing industrial production and questions about labour, prosperity, and responsibility.",
      lessonHint: /rights|quality|communities|consumer|responsib/i,
      priority: 3
    },
    "image3.png": {
      title: "Fact checking and social media",
      caption: "A visual source about judging information in connected digital spaces.",
      lessonHint: /participation|citizen|internet|media|global/i,
      priority: 4
    },
    "image7.png": {
      title: "Collective action",
      caption: "A visual source showing people working together as a response to shared issues.",
      lessonHint: /participation|responsib|acting|citizen|action/i,
      priority: 5
    },
    "image6.png": {
      title: "Migration and displacement",
      caption: "A visual source connected to movement, vulnerability, and the human effects of global change.",
      lessonHint: /rights|quality|life|global/i,
      priority: 6
    },
    "image5.png": {
      title: "Personal responsibility",
      caption: "A visual source that can represent individual choice, participation, or the decision to respond.",
      lessonHint: /responsib|acting|citizen|participation/i,
      priority: 7
    },
    "image2.png": {
      title: "Youth and global connection",
      caption: "A visual source connected to identity, diversity, and young people in a global community.",
      lessonHint: /citizen|participation|quality|life/i,
      priority: 8
    }
  }
};

const SOCIAL10_YOUTUBE_TITLE_OVERRIDES: Record<string, string> = {
  aKpgb2WrGo0: "Gogol Bordello",
  lPNrtjboISg: "How the World Map Looks Wildly Different Than You Think",
  c_PO2jOMGEU: "Expanding Western Worldview",
  "NI1k5EKi-74": "European Imperialism Review",
  fUDwPz9VmL0: "Industrialization and Imperialism",
  Bouw3MvmrYM: "Mercantilism",
  mVVD9yYCKiI: "Heritage Minutes: Naskumituwin (Treaty)",
  vdR9HcmiXLA: "Stolen Children: Residential School Survivors Speak Out",
  aTEUqFAjnz4: "Idle No More Round Dance",
  fShsLqN01A0: "Oka Crisis: How It Started",
  BwSB__Ugo1s: "Understanding the Gini Coefficient",
  "utKf-kA-xAQ": "Gini Map",
  "7Zqdqa4YNvI": "Gross National Happiness",
  fACkb2u1ULY: "Perspectives on Sustainability",
  uWSxzjyMNpU: "Global Wealth Inequality",
  nvgZcc43wfg: "Free Trade",
  GveZ7R_0qx4: "Blood Diamonds",
  Q3yUfZ2wTA4: "Muhammad Yunus - Banker to the Poor",
  "fUVVfyr6O-A": "Towards a Child Labour Free Zone",
  YAIM1qzO9_w: "The Charter of Rights and Freedoms",
  "TyDA-vWOHl4": "John Humphrey",
  "l2-v31yIJyU": "Martin Luther King Jr. on Civil Disobedience",
  "onD5UOP5z_c": "Made in Bangladesh - the fifth estate",
  vfAp_G735r0: "Cultural Appropriation vs. Appreciation",
  "6ZpnZ6s6NWM": "No Logo Documentary",
  kMyjX4VFi1s: "Language and Identity",
  xXGFCOp3FVI: "Graffiti, Signs, and Logos",
  LX1M7QFmMoE: "Language Rights and the Charter",
  Jm9E4YXvUlE: "Globalization of the Western Suit",
  "6am-D8gKcF0": "Impact on Identity",
  "2ydX2FY0dvY": "Globalization and Culture",
  S7BFEaroEO4: "Who are you podcast"
};

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "answer",
  "because",
  "before",
  "being",
  "between",
  "chapter",
  "could",
  "course",
  "define",
  "describe",
  "does",
  "each",
  "explain",
  "from",
  "globalization",
  "have",
  "into",
  "lesson",
  "module",
  "page",
  "pages",
  "question",
  "read",
  "should",
  "social",
  "studies",
  "their",
  "there",
  "these",
  "this",
  "those",
  "unit",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "your"
]);

const STUDY_VOCABULARY_DEFINITIONS: Record<string, string[]> = {
  accommodation: [
    "Accommodation is a response to contact where people adjust practices, rules, or expectations so different identities or cultures can continue to exist together.",
    "Use it when explaining a middle path between rejecting globalization completely and allowing one dominant culture to replace others."
  ],
  acculturation: [
    "Acculturation is cultural change that happens when groups come into sustained contact and borrow, adapt, or adopt parts of one another's ways of life.",
    "In Social 10-1, it helps explain how globalization can reshape identity without always erasing it."
  ],
  assimilation: [
    "Assimilation is the process or policy of absorbing one cultural group into another so that the distinct identity, language, or practices of the first group are weakened or lost.",
    "It is especially important when discussing colonial policies and residential schools, where assimilation was forced rather than freely chosen."
  ],
  "collective identity": [
    "Collective identity is the shared sense of who people are as members of a group, community, culture, language group, nation, or society.",
    "Use it to explain how globalization can affect not just individual choices but also the identity of whole communities."
  ],
  "cultural globalization": [
    "Cultural globalization is the movement of ideas, values, media, languages, symbols, and ways of life across borders.",
    "It can create exchange and hybrid cultures, but it can also create pressure toward cultural homogenization."
  ],
  "cultural revitalization": [
    "Cultural revitalization means renewing, protecting, and strengthening a culture, language, practice, or identity.",
    "It matters because communities can respond actively to globalization by preserving and sharing what is important to them."
  ],
  "digital divide": [
    "The digital divide is the gap between people who have reliable access to digital technology and people who do not.",
    "In a globalizing world, this affects who can participate in online learning, media, markets, political action, and cultural exchange."
  ],
  "economic globalization": [
    "Economic globalization is the growing integration of economies through trade, investment, finance, production, technology, and labour connections across borders.",
    "It can create opportunity and prosperity, but it can also create dependency, inequality, and pressure on local decision-making."
  ],
  "environmental globalization": [
    "Environmental globalization means environmental problems and decisions cross borders, so actions in one place can affect people and ecosystems elsewhere.",
    "Use it when connecting globalization to climate change, resource use, pollution, stewardship, and sustainability."
  ],
  globalization: [
    "Globalization is the growing connection among people, economies, cultures, technologies, and political decisions around the world.",
    "A strong Social 10-1 answer explains both the opportunities created by connection and the pressures it can place on identity, prosperity, citizenship, and historical legacies."
  ],
  homogenization: [
    "Homogenization means becoming more alike. Cultural homogenization happens when global products, media, language, or values make local cultures less distinct.",
    "Use it to explain one risk of globalization when powerful global influences crowd out local identities."
  ],
  hybridization: [
    "Hybridization happens when cultures mix and create something new rather than one culture simply replacing another.",
    "It is useful evidence when showing that people can adapt global influences to local languages, traditions, and values."
  ],
  "individual identity": [
    "Individual identity is a person's sense of who they are, shaped by experience, beliefs, language, culture, relationships, place, and choices.",
    "Globalization can expand the options people use to express identity, while also adding pressure from global media and consumer culture."
  ],
  marginalization: [
    "Marginalization happens when a person or group is pushed to the edge of society and has less power, voice, access, or recognition.",
    "It is important when judging whether globalization benefits everyone or leaves some identities and communities with fewer choices."
  ],
  "media convergence": [
    "Media convergence is the blending of media forms and technologies, such as news, entertainment, advertising, social media, phones, and streaming platforms.",
    "It matters because culture, information, and identity can spread very quickly through connected media systems."
  ],
  multiculturalism: [
    "Multiculturalism is the recognition and support of multiple cultural identities within a society.",
    "Use it when explaining how a society can respond to diversity by protecting difference rather than demanding assimilation."
  ],
  perspective: [
    "Perspective is a point of view shaped by identity, experience, values, beliefs, and position in society.",
    "In source analysis, perspective helps explain why a person, group, or source may interpret globalization differently."
  ],
  "political globalization": [
    "Political globalization is the way governments, laws, organizations, treaties, and political decisions become connected across borders.",
    "It helps explain why global issues often require cooperation beyond one local or national government."
  ],
  "social globalization": [
    "Social globalization is the growth of connections among people and communities through migration, communication, travel, education, social media, and shared experiences.",
    "It can build understanding across cultures, but it can also create tension when values or identities collide."
  ],
  "transnational corporation": [
    "A transnational corporation is a company that operates in more than one country.",
    "In Social 10-1, transnationals matter because they can create jobs, products, and investment while also influencing culture, labour conditions, resource use, and economic sovereignty."
  ],
  worldview: [
    "A worldview is the way a person or group understands the world, their place in it, and how people should relate to one another, the land, and the future.",
    "Use it when comparing cultural contact, especially Indigenous and European views during historical globalization."
  ],
  "world view": [
    "A world view is the way a person or group understands the world, their place in it, and how people should relate to one another, the land, and the future.",
    "Use it when comparing cultural contact, especially Indigenous and European views during historical globalization."
  ],
  universalization: [
    "Universalization is the spread of one idea, product, value, or cultural form so widely that it starts to seem normal or common everywhere.",
    "It can connect people through shared culture, but it can also raise concerns about cultural dominance."
  ],
  "anti globalization": [
    "Anti-globalization refers to criticism or opposition to parts of globalization, especially when it creates inequality, cultural loss, corporate power, or environmental harm.",
    "A strong answer explains what kind of globalization is being challenged and why."
  ],
  "historical globalization": [
    "Historical globalization refers to earlier periods of global contact, trade, migration, imperial expansion, and cultural exchange.",
    "In Related Issue 2, it often focuses on European expansion and the long-term legacies of imperialism."
  ],
  imperialism: [
    "Imperialism is the domination of one people, territory, or society by another country or empire.",
    "Control can be political, economic, military, cultural, or social, and it often creates unequal relationships and long-term legacies."
  ],
  mercantilism: [
    "Mercantilism is an economic system where an imperial power tries to increase wealth by controlling trade, colonies, and resources.",
    "It helps explain why European empires wanted colonies as sources of raw materials and markets."
  ],
  capitalism: [
    "Capitalism is an economic system based on private ownership, competition, profit, investment, and markets.",
    "In the course, it helps explain motives behind trade expansion, industrialization, and economic globalization."
  ],
  "grand exchange": [
    "The grand exchange refers to the large-scale movement of plants, animals, diseases, people, goods, and ideas between regions after global contact expanded.",
    "It shows that historical globalization created major change, but those changes affected peoples and societies unevenly."
  ],
  "industrial revolution": [
    "The Industrial Revolution was the shift to machine production, factories, and new energy systems that transformed economies and societies.",
    "It increased demand for raw materials and markets, which helped drive imperial expansion."
  ],
  eurocentrism: [
    "Eurocentrism is the belief or habit of treating European ideas, values, histories, or ways of life as central or superior.",
    "It helped justify imperialism by making European worldviews seem like the standard for judging other peoples."
  ],
  ethnocentrism: [
    "Ethnocentrism means judging other cultures by the standards of one's own culture.",
    "It matters because it can turn cultural contact into misunderstanding, disrespect, or domination."
  ],
  "residential school": [
    "A residential school was a government and church-run school system that separated Indigenous children from families, languages, cultures, and communities.",
    "Residential schools are a major legacy of historical globalization because their effects continue across generations."
  ],
  "residential schools": [
    "Residential schools were government and church-run school systems that separated Indigenous children from families, languages, cultures, and communities.",
    "They are a major legacy of historical globalization because their effects continue across generations."
  ],
  "indian act": [
    "The Indian Act is a Canadian law that has controlled many aspects of First Nations status, governance, reserves, and rights.",
    "In this issue, it is evidence of how colonial power became law and shaped the lives of Indigenous peoples."
  ],
  protectionism: [
    "Protectionism is the use of policies such as tariffs, quotas, or subsidies to protect domestic industries from foreign competition.",
    "It is useful when discussing how governments try to protect economic interests within globalization."
  ],
  tariffs: [
    "Tariffs are taxes on imported goods.",
    "They can protect local producers or raise government revenue, but they can also make trade more expensive and create conflict between trading partners."
  ],
  monopoly: [
    "A monopoly exists when one company, group, or power controls most or all of a market, resource, or trade route.",
    "In Social 10-1, it helps explain how economic power can become concentrated and limit choices for others."
  ],
  commodity: [
    "A commodity is a raw material or basic good that can be bought and sold, such as oil, wheat, coffee, minerals, or lumber.",
    "Commodities matter because global trade often depends on resource extraction and market prices."
  ],
  evolution: [
    "Evolution means change over time. In this course, the term can also appear when discussing how ideas about progress or Social Darwinism were misused to justify imperialism.",
    "Use it carefully by explaining the course context instead of treating it as a simple science definition."
  ],
  industrialization: [
    "Industrialization is the development of industry, machine production, factories, and large-scale manufacturing.",
    "It connects to globalization because industrial economies needed raw materials, workers, energy, transportation, and markets."
  ],
  urbanization: [
    "Urbanization is the growth of cities as people move from rural areas to urban centres.",
    "It often follows industrialization and can change work, family life, housing, poverty, and social organization."
  ],
  nationalism: [
    "Nationalism is a sense of loyalty, belonging, or commitment to a nation or national identity.",
    "In Social 10-1, it can help explain imperial competition, self-determination, resistance, and the desire to protect collective identity."
  ],
  satirical: [
    "Satirical means using humour, irony, exaggeration, or ridicule to criticize an idea, person, policy, or society.",
    "In source analysis, satire is a clue that the source may be making a critical argument rather than simply describing events."
  ],
  genocide: [
    "Genocide is the deliberate attempt to destroy, in whole or in part, a national, ethnic, racial, or religious group.",
    "It is one of the most severe legacies to consider when judging how contemporary society should respond to historical harm."
  ],
  consensus: [
    "Consensus is broad agreement reached by a group.",
    "Use it when discussing decision-making, diplomacy, community response, or attempts to build shared action after conflict."
  ],
  "social darwinism": [
    "Social Darwinism was the misuse of ideas about competition and survival to claim that some peoples or societies were naturally superior to others.",
    "In historical globalization, it helped justify imperialism, racism, and policies that treated domination as acceptable or inevitable."
  ],
  democracy: [
    "Democracy is a political system where citizens have a role in choosing leaders and shaping public decisions.",
    "In this issue, it can appear as both an ideal and a justification, because powerful societies sometimes claimed they were spreading freedom while also exercising control."
  ],
  protectionist: [
    "Protectionist describes policies that protect a country's own industries or interests from outside competition.",
    "Use it with tariffs, quotas, and mercantilism to explain how economic goals shaped historical globalization."
  ],
  treaties: [
    "Treaties are formal agreements between peoples, nations, or governments.",
    "In Canada, treaties are central to relationships between Indigenous peoples and the Crown and are important when discussing land, rights, responsibility, and reconciliation."
  ],
  reserves: [
    "Reserves are lands set aside under treaty or government policy for the use of First Nations.",
    "They matter in Social 10-1 because land, sovereignty, treaty relationships, and colonial policy are central to the legacies of historical globalization."
  ],
  colony: [
    "A colony is a territory controlled by another country or imperial power.",
    "Colonies often supplied raw materials, markets, land, and strategic power to the controlling empire."
  ],
  sovereign: [
    "Sovereign means having authority and self-government.",
    "The term matters when judging whether peoples, communities, or states have control over their own political, cultural, or economic decisions."
  ],
  "status indian": [
    "Status Indian is a legal category under the Indian Act for a First Nations person registered with the federal government.",
    "It matters because the term shows how colonial law defined identity, rights, and government control."
  ],
  "non-governmental organization ngo": [
    "A non-governmental organization, or NGO, is an organization created by private groups or individuals rather than by a government.",
    "NGOs can respond to global and historical issues by raising awareness, providing aid, documenting rights concerns, and advocating for change."
  ],
  "non governmental organization": [
    "A non-governmental organization, or NGO, is an organization created by private groups or individuals rather than by a government.",
    "NGOs can respond to global and historical issues by raising awareness, providing aid, documenting rights concerns, and advocating for change."
  ],
  "non governmental organization ngo": [
    "A non-governmental organization, or NGO, is an organization created by private groups or individuals rather than by a government.",
    "NGOs can respond to global and historical issues by raising awareness, providing aid, documenting rights concerns, and advocating for change."
  ],
  prosperity: [
    "Prosperity means well-being and success, but in Social 10-1 it is broader than money alone.",
    "A strong answer connects prosperity to quality of life, opportunity, health, education, environment, community, and long-term sustainability."
  ],
  "quality of life": [
    "Quality of life is the overall well-being of people and communities, including health, education, safety, rights, environment, relationships, and dignity.",
    "It is broader than income, so it helps judge whether globalization is improving life in a meaningful way."
  ],
  "standard of living": [
    "Standard of living focuses mainly on material and economic conditions such as income, goods, services, and access to necessities.",
    "Use it with quality of life to show that prosperity is not only about how much money or stuff people have."
  ],
  "gini index": [
    "The GINI index measures income inequality within a country or population.",
    "It is useful evidence when judging whether prosperity is widely shared or concentrated among fewer people."
  ],
  "economics of scale": [
    "Economies of scale happen when producing more of something lowers the cost per unit.",
    "In globalization, large-scale production can lower prices but may also favour large corporations over small local producers."
  ],
  "economies of scale": [
    "Economies of scale happen when producing more of something lowers the cost per unit.",
    "In globalization, large-scale production can lower prices but may also favour large corporations over small local producers."
  ],
  "bottom line": [
    "The bottom line is the final financial result, usually profit or loss.",
    "In this issue, it helps explain the tension between profit, workers, communities, and environmental responsibility."
  ],
  "resource depletion": [
    "Resource depletion is the using up or reduction of natural resources faster than they can be replaced.",
    "It connects prosperity to sustainability because short-term economic growth can create long-term environmental costs."
  ],
  stewardship: [
    "Stewardship means responsible care and management of resources, land, communities, or the environment.",
    "Use it when judging whether prosperity is sustainable and respectful of future generations."
  ],
  "sustainable development": [
    "Sustainable development is development that meets present needs while protecting the ability of future generations to meet their needs.",
    "It is a key way to evaluate whether globalization creates prosperity that can last."
  ],
  supply: [
    "Supply is the amount of a good or service producers are willing and able to offer.",
    "It works with demand to explain prices, trade, production, and market decisions."
  ],
  demand: [
    "Demand is the amount of a good or service consumers are willing and able to buy.",
    "In globalization, demand in one region can shape production, labour, resources, and environmental effects in another."
  ],
  "perfect competition": [
    "Perfect competition is a market model where many buyers and sellers trade similar products and no one participant controls the price.",
    "It is useful as a comparison point when judging real global markets, which often include powerful corporations and unequal access."
  ],
  meritocratic: [
    "Meritocratic describes a system where rewards are supposed to be based on ability, effort, or achievement.",
    "Use it critically by asking whether global economic systems actually give everyone fair opportunity."
  ],
  quotas: [
    "Quotas are limits on the amount of a product that can be imported, exported, produced, or accessed.",
    "They are one tool governments can use to manage trade and protect domestic interests."
  ],
  subsidies: [
    "Subsidies are financial supports from governments to businesses, industries, or producers.",
    "They can protect jobs or strategic industries, but they can also affect competition in global markets."
  ],
  "free trade": [
    "Free trade means reducing barriers such as tariffs and quotas so goods and services can move more easily between countries.",
    "It can increase access to markets and lower prices, but it can also create pressure on workers, local businesses, and economic sovereignty."
  ],
  communism: [
    "Communism is a political and economic ideology that seeks collective ownership and a classless society.",
    "In this course, it is useful for comparing different economic ideas and how societies debate equality, ownership, and prosperity."
  ],
  "factors of production": [
    "Factors of production are the resources needed to produce goods and services, commonly land, labour, capital, and entrepreneurship.",
    "They help explain why nations and corporations seek resources, workers, technology, investment, and markets."
  ],
  labour: [
    "Labour is the human work used to produce goods and services.",
    "In globalization, labour connects consumer choices and corporate decisions to workers, wages, rights, migration, and working conditions."
  ],
  capital: [
    "Capital is money, equipment, buildings, tools, and other resources used for investment and production.",
    "It helps explain why foreign investment and corporate decision-making can shape prosperity and economic control."
  ],
  infrastructure: [
    "Infrastructure is the basic physical and organizational systems a society needs, such as roads, ports, power, water, schools, internet, and institutions.",
    "It affects whether people can participate in economic globalization and share in prosperity."
  ],
  privatize: [
    "To privatize is to transfer ownership or control from government or public hands to private companies or individuals.",
    "It is important when evaluating how economic decisions affect public services, access, profit, and accountability."
  ],
  "foreign investment": [
    "Foreign investment is money, ownership, or business activity from outside a country used to develop industries, resources, or services.",
    "It can create jobs and infrastructure, but it can also shift control or profits away from local communities."
  ],
  "knowledge economy": [
    "A knowledge economy is an economy where ideas, skills, education, information, technology, and innovation are major sources of value.",
    "It shows that prosperity in globalization depends not only on resources but also on learning and access to technology."
  ],
  "per capita income": [
    "Per capita income is the average income per person in a country or population.",
    "It can help compare prosperity, but it can hide inequality because an average does not show how income is distributed."
  ],
  "gdp per capita": [
    "GDP per capita is Gross Domestic Product divided by population.",
    "It is one way to compare average economic output per person, but it does not show quality of life or how wealth is shared."
  ],
  "gross domestic product": [
    "Gross Domestic Product, or GDP, is the total value of goods and services produced within a country over a period of time.",
    "It is useful for measuring economic output, but it is not a complete measure of sustainable prosperity."
  ],
  trade: [
    "Trade is the exchange of goods and services between people, businesses, regions, or countries.",
    "In globalization, trade can create prosperity and access to goods, but it can also create dependence, competition, and unequal benefits."
  ],
  "supply chain": [
    "A supply chain is the network of people, companies, resources, transportation, and steps involved in making and delivering a product.",
    "It helps reveal how consumer choices in one place connect to workers, resources, and environments elsewhere."
  ],
  "supply chains": [
    "Supply chains are the networks of people, companies, resources, transportation, and steps involved in making and delivering products.",
    "They reveal how consumer choices in one place connect to workers, resources, and environments elsewhere."
  ],
  stakeholders: [
    "Stakeholders are people or groups affected by a decision or issue.",
    "In Social 10-1, naming stakeholders helps compare who benefits, who pays costs, and whose voices should count."
  ],
  "gross national product": [
    "Gross National Product, or GNP, measures the value of goods and services produced by a country's citizens and companies, including activity outside its borders.",
    "It helps compare economic power, but like GDP it does not fully show quality of life or sustainability."
  ],
  ideologies: [
    "Ideologies are sets of beliefs and values about how society, government, and the economy should work.",
    "They matter because debates about prosperity often depend on different beliefs about markets, equality, ownership, and responsibility."
  ],
  subsidy: [
    "A subsidy is financial support from a government to a business, industry, producer, or group.",
    "Subsidies can protect jobs or strategic industries, but they can also affect competition in global trade."
  ],
  "invisible hand": [
    "The invisible hand is Adam Smith's idea that individual choices in a market can unintentionally help organize production and exchange.",
    "Use it when discussing market-based arguments about prosperity, competition, and limited government involvement."
  ],
  conditionalities: [
    "Conditionalities are requirements attached to loans, aid, or agreements.",
    "They matter because international financial support can come with rules that shape a country's economic sovereignty and policy choices."
  ],
  dumping: [
    "Dumping means selling goods in another country for less than they cost to produce or for less than their normal price.",
    "It matters because it can undercut local producers and create trade conflicts."
  ],
  boycott: [
    "A boycott is a refusal to buy, use, or support a product, company, or institution in order to pressure change.",
    "It can be a citizenship action when people respond to labour, environmental, or human-rights concerns linked to globalization."
  ],
  shareholders: [
    "Shareholders are people or groups that own shares in a company.",
    "They matter because corporate decisions often try to satisfy shareholders, which can create tension with workers, consumers, communities, and the environment."
  ],
  pandemic: [
    "A pandemic is a disease outbreak that spreads across countries or the world.",
    "It shows interdependence because health, travel, supply chains, economies, and community responses are connected globally."
  ],
  entrepreneur: [
    "An entrepreneur is a person who starts or organizes a business and accepts risk to create goods or services.",
    "In globalization, entrepreneurs can create opportunity, but their success depends on access to capital, markets, technology, and fair rules."
  ],
  "active citizenship": [
    "Active citizenship means taking informed action in a community or society instead of only watching issues happen.",
    "In this issue, it can include voting, volunteering, advocacy, ethical choices, protest, learning, and helping others respond to globalization."
  ],
  "engaged citizenship": [
    "Engaged citizenship means being aware of issues and participating in public life in ways that try to improve a community or society.",
    "It matters because globalization raises questions about how citizens should respond to problems beyond their immediate surroundings."
  ],
  "global event": [
    "A global event is an event with effects, causes, or attention that reach across national borders.",
    "Global events matter because citizens can become aware of distant issues and may feel responsibility to respond."
  ],
  "informed citizenship": [
    "Informed citizenship means using reliable information and critical thinking before making decisions or taking action.",
    "It is important because global issues are complex, and responsible action depends on understanding evidence, perspectives, and consequences."
  ],
  "labour laws": [
    "Labour laws are rules that protect workers and regulate employment conditions.",
    "They matter because global production can create debates about wages, safety, rights, and corporate responsibility."
  ],
  "responsible citizenship": [
    "Responsible citizenship means recognizing duties to others and acting in ways that respect rights, laws, communities, and shared well-being.",
    "In this issue, it helps judge what kind of response to globalization is reasonable and ethical."
  ],
  constitution: [
    "A constitution is a set of basic laws and principles that describes how a state is governed and how rights are protected.",
    "It matters in global citizenship because constitutions can shape democratic participation, rights, and government accountability."
  ],
  "anti globalization movement": [
    "The anti-globalization movement criticizes forms of globalization linked to inequality, corporate power, cultural loss, labour exploitation, or environmental harm.",
    "It is useful evidence when discussing activism and citizen responses to globalization."
  ],
  "global citizenship": [
    "Global citizenship means seeing oneself as connected to people beyond local or national borders and accepting some responsibility for global issues.",
    "It includes awareness, informed judgment, ethical choices, participation, advocacy, and action."
  ],
  "global citizen": [
    "A global citizen is a person who recognizes connections and responsibilities beyond their local or national community.",
    "Use it when discussing how individuals can respond to globalization through informed and responsible action."
  ],
  "human development index": [
    "The Human Development Index, or HDI, compares quality of life using indicators such as health, education, and income.",
    "It helps evaluate prosperity and development more broadly than money alone."
  ],
  disparity: [
    "Disparity means an unequal difference or gap between people, groups, or places.",
    "It is useful when judging whether globalization reduces inequality or increases it."
  ],
  "human rights": [
    "Human rights are basic rights and freedoms that all people should have because they are human.",
    "Globalization makes rights issues more visible across borders and raises questions about citizen responsibility."
  ],
  intersectionality: [
    "Intersectionality is the idea that different parts of identity, such as race, gender, class, culture, ability, or citizenship, can overlap and shape people's experiences.",
    "It helps explain why global issues do not affect everyone in the same way."
  ],
  "good governance": [
    "Good governance means decision-making that is accountable, transparent, fair, lawful, responsive, and responsible.",
    "It matters because citizens and organizations often judge whether governments are protecting rights and quality of life."
  ],
  "corporate social responsibility": [
    "Corporate social responsibility is the idea that corporations should consider social, environmental, and ethical effects, not only profit.",
    "Use it when evaluating how businesses should respond to globalization."
  ],
  activism: [
    "Activism is action taken to create social, political, environmental, or economic change.",
    "It can include education, protest, petitions, boycotts, volunteering, organizing, and public pressure."
  ],
  "anti-globalization": [
    "Anti-globalization refers to criticism or opposition to parts of globalization, especially when it creates inequality, cultural loss, corporate power, or environmental harm.",
    "A strong answer explains what kind of globalization is being challenged and why."
  ],
  neocolonialism: [
    "Neocolonialism is a form of control where powerful countries or corporations influence less powerful societies economically or politically without direct colonial rule.",
    "It helps connect historical globalization to present-day global inequalities."
  ],
  "status quo": [
    "Status quo means the existing situation or current way things are.",
    "Use it when explaining whether citizens should accept existing global systems or work to change them."
  ],
  "civil disobedience": [
    "Civil disobedience is a deliberate, public refusal to obey a law or rule judged to be unjust.",
    "It is usually connected to conscience and protest, and it is powerful but controversial because it challenges legal order."
  ],
  allyship: [
    "Allyship means using one's voice, choices, and position to support people or groups facing injustice, while listening to those most affected.",
    "It matters in global citizenship because responding responsibly often means acting with, not over, affected communities."
  ],
  interdependence: [
    "Interdependence means people, nations, economies, environments, and communities depend on and affect one another.",
    "It is a core idea in globalization because choices in one place can create consequences somewhere else."
  ]
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value: string) {
  return value.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function cleanLearnerText(value: string) {
  return value
    .replace(/\u00ad|\u2010|\u2011|\u2012/g, "-")
    .replace(/([a-z0-9][.!?])(?=[A-Z])/g, "$1 ")
    .replace(/\bwelearn\b/gi, "we learn")
    .replace(/\bIncluding\b/g, "including")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+([?.!,;:])/g, "$1");
}

function isStudyExtractionHeading(value: string) {
  const text = normalizeWhitespace(value);
  if (!text || text.length > 90 || /[.!?]/.test(text)) return false;
  if (/\b(?:http|www|click|open|download|read|watch|listen)\b/i.test(text)) return false;
  return text.split(/\s+/).length <= 12;
}

function removeStudyExtractionNoise($: CheerioAPI) {
  $("script, style, textarea, h1, h2, h3, h4, h5, h6, .social-lesson-embedded-activities, .social-lesson-evidence-note, .social-podcast-card").remove();
  $("p, div").each((_, element) => {
    const node = $(element);
    if (node.children("p, ul, ol, table, section, article, div").length) return;
    if (isStudyExtractionHeading(node.text())) node.remove();
  });
}

function studyExtractionText(lesson: NextStepShellLesson) {
  const $ = load(lesson.html);
  removeStudyExtractionNoise($);
  return normalizeWhitespace(
    cleanLearnerText($.root().text()).replace(new RegExp(`^${escapeRegExp(lesson.title)}\\s+`, "i"), "")
  );
}

function cleanStudyEvidenceSentence(sentence: string, lessonTitle: string) {
  const cleaned = normalizeWhitespace(sentence);
  return cleaned.replace(
    new RegExp(`^${escapeRegExp(lessonTitle)}\\s+(is|are|means|describes|refers to)\\b`, "i"),
    (_, verb: string) => `This concept ${verb.toLowerCase()}`
  );
}

function normalizeForMatch(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function shortHash(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 8);
}

function titleCase(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/\b[a-z]/g, (match) => match.toUpperCase())
    .replace(/\bAnd\b/g, "and")
    .replace(/\bOf\b/g, "of")
    .replace(/\bOn\b/g, "on")
    .replace(/\bThe\b/g, "the");
}

function toPosix(value: string) {
  return value.replace(/\\/g, "/");
}

function normalizeZipPath(value: string) {
  return toPosix(value).replace(/^\/+/, "").split("/").filter(Boolean).join("/");
}

function isExternalUrl(value: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|mailto:|tel:)/i.test(value.trim());
}

function withoutQuery(value: string) {
  return value.split("?", 1)[0]?.split("#", 1)[0] ?? value;
}

function safeDecodePath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolveZipRelativePath(entryPath: string, relativeValue: string) {
  if (isExternalUrl(relativeValue)) return relativeValue;
  const cleanValue = relativeValue.split("#")[0]?.split("?")[0] ?? relativeValue;
  const suffix = relativeValue.slice(cleanValue.length);
  const baseDir = path.posix.dirname(normalizeZipPath(entryPath));
  return `${normalizeZipPath(path.posix.normalize(path.posix.join(baseDir, safeDecodePath(cleanValue))))}${suffix}`;
}

function workspaceAssetPath(zipKey: string, filePath: string) {
  return `assets/imported/${zipKey}/${normalizeZipPath(filePath)}`;
}

function workspaceAssetHref(zipKey: string, filePath: string) {
  return workspaceAssetPath(zipKey, filePath);
}

function fileExtension(value: string) {
  const clean = value.split("#")[0]?.split("?")[0] ?? value;
  return path.posix.extname(clean).toLowerCase();
}

function basenameWithoutExtension(filePath: string) {
  return path.posix.basename(filePath, fileExtension(filePath));
}

function humanizeTitleFromPath(filePath: string) {
  const base = basenameWithoutExtension(filePath);
  return titleCase(
    base
      .replace(/[_-]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\bSS\s*10\s*1\b/gi, "")
      .replace(/\bU\d+P\d+[a-z]?\b/gi, "")
      .replace(/\bChap(\d+)\b/gi, "Chapter $1")
  );
}

function safeAssetFileName(filePath: string) {
  const extension = fileExtension(filePath) || ".png";
  const base = basenameWithoutExtension(filePath)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${base || "source-image"}${extension.toLowerCase()}`;
}

function cleanTitle(value: string, fallback: string) {
  const cleaned = normalizeWhitespace(value)
    .replace(/^Social Studies 10-1\s*:?\s*/i, "")
    .replace(/^SS\s*10\s*[- ]?1\s*:?\s*/i, "")
    .replace(/\s*\|\s*.*$/, "")
    .replace(/\s*\(cont\.\)\s*/gi, " ")
    .trim();
  return cleaned || fallback;
}

function cleanLessonDisplayTitle(value: string, config?: IssueConfig) {
  let cleaned = cleanTitle(value, "");
  if (!cleaned) return "";
  if (/^SS\s*10\s*[- ]?1\s+U\d+\b/i.test(cleaned)) return "Issue Summary";
  if (/^Unit\s+\d+\s+Conclusion$/i.test(cleaned)) return "Unit Wrap-Up";
  cleaned = cleaned.replace(/^\d+\s*[\.)]?\s+/, "").trim();
  if (/^Affects on Individuals and Communities$/i.test(cleaned)) {
    return "How Globalization Affects Individuals and Communities";
  }
  if (/^Impacts of Imperialism on Indigenous people in Canada$/i.test(cleaned)) {
    return "Impacts of Imperialism on Indigenous Peoples in Canada";
  }
  if (/^Indigenous Peoples Responses to Imperialism Today$/i.test(cleaned)) {
    return "Indigenous Peoples' Responses to Imperialism Today";
  }
  return cleaned;
}

function cleanLessonTitle($: ReturnType<typeof load>, itemTitle: string, filePath?: string, config?: IssueConfig) {
  const candidates = [
    itemTitle,
    $("h1").first().text(),
    $("h2").first().text(),
    $("h3").first().text(),
    $("title").first().text(),
    filePath ? humanizeTitleFromPath(filePath) : ""
  ];
  for (const candidate of candidates) {
    const title = cleanLessonDisplayTitle(candidate, config);
    if (title && !/^(?:required reading|activity|assignment|summary|conclusion)$/i.test(title)) return title;
  }
  return cleanLessonDisplayTitle(filePath ? humanizeTitleFromPath(filePath) : itemTitle, config) || itemTitle;
}

function summarizeText(value: string, lessonTitle?: string) {
  let text = normalizeWhitespace(cleanLearnerText(value))
    .replace(/^Social Studies 10-1\s*:?\s*/i, "")
    .replace(/^Course Page\s*/i, "")
    .replace(/^SS\s*10\s*[- ]?1\s+(?:U\d+\s+)?(?:(?:Lesson\s+\d+)|Summary|Conclusion|Course Summary)?\s*/i, "")
    .trim();

  if (lessonTitle) {
    text = text.replace(new RegExp(`^${escapeRegExp(lessonTitle)}\\b\\s*`, "i"), "").trim();
  }
  text = text.replace(/^(?:Watch:\s*)?Reading\s+/i, "").trim();

  if (!text) return "Recovered lesson content from the Social Studies 10-1 D2L source.";
  return text.length > 170 ? `${text.slice(0, 167).trim()}...` : text;
}

function tokenize(value: string) {
  const tokens = new Set<string>();
  normalizeForMatch(value)
    .split(/\s+/)
    .filter((token) => token.length > 3 && !STOP_WORDS.has(token))
    .forEach((token) => tokens.add(token));
  return tokens;
}

function zipFile(bundle: ZipBundle, filePath: string) {
  const normalized = normalizeZipPath(filePath);
  const exact = bundle.zip.file(normalized);
  if (exact) return exact;
  const lower = normalized.toLowerCase();
  return Object.values(bundle.zip.files).find((file) => !file.dir && normalizeZipPath(file.name).toLowerCase() === lower);
}

async function readZipText(bundle: ZipBundle, filePath: string) {
  const file = zipFile(bundle, filePath);
  if (!file) return "";
  return decodeBrightspaceHtml(await file.async("nodebuffer"));
}

async function loadZipBundle(key: string, sourcePath: string): Promise<ZipBundle> {
  return {
    key,
    sourcePath,
    zip: await JSZip.loadAsync(await fs.readFile(sourcePath))
  };
}

async function extractZipToWorkspace(bundle: ZipBundle, workspaceDir: string) {
  const outputRoot = path.join(workspaceDir, "assets", "imported", bundle.key);
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });

  for (const file of Object.values(bundle.zip.files)) {
    if (file.dir) continue;
    const outputPath = path.join(outputRoot, ...normalizeZipPath(file.name).split("/"));
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, await file.async("nodebuffer"));
  }
}

async function copyBrandAssets(workspaceDir: string) {
  const source = path.join(ROOT, "projects", "social30-1-related-issue-1-option-2", "workspace", "assets", "brand");
  const target = path.join(workspaceDir, "assets", "brand");
  await fs.rm(target, { recursive: true, force: true });
  try {
    await fs.cp(source, target, { recursive: true });
  } catch {
    await fs.mkdir(target, { recursive: true });
  }
}

async function resetGeneratedWorkspace(workspaceDir: string) {
  try {
    await fs.mkdir(path.dirname(workspaceDir), { recursive: true });
    const replacementPath = path.join(path.dirname(workspaceDir), `workspace.previous-${Date.now()}-${shortHash(workspaceDir)}`);
    await fs.rename(workspaceDir, replacementPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  await fs.mkdir(workspaceDir, { recursive: true });
}

async function parseD2lCourse(bundle: ZipBundle): Promise<D2lCourse> {
  const manifestFile = zipFile(bundle, "imsmanifest.xml");
  if (!manifestFile) throw new Error("D2L preflight failed: imsmanifest.xml is missing.");
  const manifestText = await manifestFile.async("text");
  if (!/Social Studies 10-1/i.test(manifestText)) {
    throw new Error("D2L preflight failed: manifest is not Social Studies 10-1.");
  }
  if (/Social Studies 20-1/i.test(manifestText)) {
    throw new Error("D2L preflight failed: Social Studies 20-1 export was supplied for a 10-1 build.");
  }

  const $ = load(manifestText, { xmlMode: true });
  const resourceMap = new Map<string, D2lResource>();
  $("resources > resource").each((_, element) => {
    const resource = $(element);
    const id = resource.attr("identifier") ?? "";
    if (!id) return;
    const title =
      normalizeWhitespace(resource.find("lomr\\:title lomr\\:string").first().text()) ||
      normalizeWhitespace(resource.find("title string").first().text()) ||
      id;
    const files = resource
      .children("file")
      .map((__, fileElement) => normalizeZipPath($(fileElement).attr("href") ?? ""))
      .get()
      .filter(Boolean);
    resourceMap.set(id, { id, title, files });
  });

  const parseItem = (element: Parameters<typeof $>[0]): D2lItem => {
    const item = $(element);
    const title = normalizeWhitespace(item.children("title").first().text());
    const identifierRef = item.attr("identifierref") ?? undefined;
    const resource = identifierRef ? resourceMap.get(identifierRef) : undefined;
    const children = item
      .children("item")
      .map((__, child) => parseItem(child))
      .get();
    return { title, identifierRef, resource, children };
  };

  const manifestTitle =
    normalizeWhitespace($("manifest > metadata lom general title string").first().text()) ||
    normalizeWhitespace($("organization title").first().text()) ||
    "Social Studies 10-1";
  const items = $("organization")
    .first()
    .children("item")
    .map((_, element) => parseItem(element))
    .get();
  return { manifestTitle, resourceMap, items };
}

function flattenItems(items: D2lItem[]): D2lItem[] {
  return items.flatMap((item) => [item, ...flattenItems(item.children)]);
}

function findD2lItemByTitle(course: D2lCourse, title: string) {
  const target = normalizeForMatch(title);
  return flattenItems(course.items).find((item) => normalizeForMatch(item.title) === target);
}

function primaryResourceFile(item: D2lItem) {
  return item.resource?.files.find((filePath) => /\.(html?|pdf|docx?|pptx?|txt|rtf)$/i.test(filePath)) ?? item.resource?.files[0];
}

function lessonChildrenForIssue(issueRoot: D2lItem) {
  const lessons: D2lItem[] = [];
  for (const child of issueRoot.children) {
    if (/assessment/i.test(child.title)) continue;
    if (primaryResourceFile(child)) {
      lessons.push(child);
    }
    for (const grandchild of child.children) {
      if (/assessment/i.test(child.title) || /assessment/i.test(grandchild.title)) continue;
      if (primaryResourceFile(grandchild)) lessons.push(grandchild);
    }
  }
  return lessons;
}

function d2lTextFromHtml(html: string) {
  const $ = load(html);
  $("script, style, meta, link, title").remove();
  return $.root().text();
}

function d2lSummaryTextFromHtml(html: string) {
  const $ = load(html);
  $("script, style, meta, link, title, #header, header, nav, #footer, footer").remove();
  let contentScope = $("#content").first();
  if (!contentScope.length) contentScope = $("main").first();
  if (!contentScope.length) contentScope = $("body").first();
  if (!contentScope.length) contentScope = $("html").first();
  contentScope.find("h1,h2,h3,h4,h5,h6").remove();
  return contentScope.text();
}

function resolveWorkspaceAssetHref(bundle: ZipBundle, entryPath: string, rawValue: string) {
  if (!rawValue || isExternalUrl(rawValue)) return rawValue;
  const resolvedPath = resolveZipRelativePath(entryPath, rawValue);
  if (zipFile(bundle, resolvedPath)) {
    return workspaceAssetHref(bundle.key, resolvedPath);
  }
  const wantedName = path.posix.basename(resolvedPath).toLowerCase();
  const basenameMatch = Object.values(bundle.zip.files).find(
    (file) => !file.dir && path.posix.basename(normalizeZipPath(file.name)).toLowerCase() === wantedName
  );
  return basenameMatch ? workspaceAssetHref(bundle.key, basenameMatch.name) : "";
}

function cleanAssetFileName(rawValue: string) {
  const cleanValue = rawValue.split("#")[0]?.split("?")[0] ?? rawValue;
  return normalizeWhitespace(safeDecodePath(path.posix.basename(cleanValue) || cleanValue).replace(/\+/g, " "));
}

function humanizeMissingAssetLabel(fileName: string) {
  const withoutExtension = fileName.replace(/\.[a-z0-9]+$/i, "");
  if (/^(?:screen\s*shot|screenshot|pastedimage|editimage|\d+px-|m\d+[_-]|u\d+p\d+)/i.test(withoutExtension)) {
    return "the original course visual";
  }
  const cleaned = normalizeWhitespace(
    withoutExtension
      .replace(/[_-]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/\b([a-z])([A-Z])([a-z])/g, "$1 $2$3")
  );
  return cleaned ? titleCase(cleaned) : "the original course visual";
}

function usefulAssetDescription(value: string, fallbackLabel: string) {
  const cleaned = normalizeWhitespace(value);
  if (!cleaned) return "";
  const normalized = normalizeForMatch(cleaned);
  const fallback = normalizeForMatch(fallbackLabel);
  const compactNormalized = normalized.replace(/\s+/g, "");
  const compactFallback = fallback.replace(/\s+/g, "");
  if (
    normalized.length < 16 &&
    (compactNormalized === compactFallback ||
      compactNormalized.includes(compactFallback) ||
      compactFallback.includes(compactNormalized))
  ) {
    return "";
  }
  if (/^(?:image|photo|picture|screenshot|graphic|map|cartoon|chart)$/i.test(cleaned)) return "";
  return cleaned;
}

function missingAssetDescription(rawValue: string, altText: string, titleText: string) {
  const fileName = cleanAssetFileName(rawValue);
  const label = humanizeMissingAssetLabel(fileName);
  const description = usefulAssetDescription(altText, label) || usefulAssetDescription(titleText, label);
  if (description) {
    if (description.length < 42 && !/[.!?]$/.test(description)) {
      return `The original visual source was labeled "${description}". Use the surrounding lesson text as the source context.`;
    }
    return description;
  }
  if (label === "the original course visual") {
    return "This lesson originally included a visual source. Use the surrounding lesson text as the source context.";
  }
  return `This lesson originally included a visual source for ${label}. Use the surrounding lesson text as the source context.`;
}

function recordMissingAsset(
  collector: MissingAssetCollector | undefined,
  entryPath: string,
  requestedPath: string,
  description: string
) {
  if (!collector) return;
  const fileName = cleanAssetFileName(requestedPath);
  const key = `${collector.lessonId}:${entryPath}:${fileName}:${description}`;
  const exists = collector.records.some(
    (record) => `${record.lessonId}:${record.entryPath}:${record.fileName}:${record.description}` === key
  );
  if (exists) return;
  collector.records.push({
    issueNumber: collector.issueNumber,
    lessonId: collector.lessonId,
    lessonTitle: collector.lessonTitle,
    entryPath,
    requestedPath,
    fileName,
    description,
    status: "missing-from-d2l-export"
  });
}

function renderMissingAssetLink(relatedHref = "") {
  if (!relatedHref || !isExternalUrl(relatedHref)) return "";
  return `<a class="social-recovered-source-link" href="${escapeHtml(relatedHref)}" target="_blank" rel="noreferrer">Open related source</a>`;
}

function hasMeaningfulContentBefore(contentScope: ReturnType<CheerioAPI>, element: Parameters<CheerioAPI>[0], $: CheerioAPI) {
  const targetElement = element as never;
  const meaningfulElements = contentScope.find("h1,h2,h3,h4,h5,h6,p,li,blockquote,figure,img,table,iframe,video,audio").toArray();
  for (const candidate of meaningfulElements) {
    if (candidate === element) return false;
    if ($(candidate).find(targetElement).length) return false;
    if ($(targetElement).find(candidate).length) continue;
    if ($(candidate).is("img,iframe,video,audio") && ($(candidate).attr("src") || $(candidate).attr("href"))) return true;
    if ($(candidate).is("figure,table")) return true;
    const text = normalizeWhitespace($(candidate).text());
    if (text) return true;
  }
  return false;
}

function removeDuplicateImportedLessonHeading(contentScope: ReturnType<CheerioAPI>, lessonTitle: string | undefined, $: CheerioAPI) {
  const target = normalizeForMatch(lessonTitle ?? "");
  if (!target) return;
  const duplicateHeading = contentScope
    .find("h1,h2,h3")
    .filter((_, element) => normalizeForMatch($(element).text()) === target)
    .first();
  if (!duplicateHeading.length) return;
  if (hasMeaningfulContentBefore(contentScope, duplicateHeading[0], $)) return;

  const parent = duplicateHeading.parent();
  duplicateHeading.remove();
  if (
    parent.length &&
    !parent.is("body,main,html,#content") &&
    !normalizeWhitespace(parent.text()) &&
    !parent.find("img,iframe,video,audio,object,embed,table").length
  ) {
    parent.remove();
  }
}

function sanitizeHtml(html: string, entryPath: string, bundle: ZipBundle, missingAssetCollector?: MissingAssetCollector) {
  const $ = load(html);
  $("script, style, meta, title, link").remove();
  $("comment").remove();
  $("*[style]").removeAttr("style");
  $("#header, #footer, #navbar, #navigation, .header, .footer, .navbar, .navigation").remove();
  $("font").each((_, element) => {
    $(element).replaceWith($(element).html() ?? "");
  });

  let contentScope = $("#content").first();
  if (!contentScope.length) contentScope = $("main").first();
  if (!contentScope.length) contentScope = $("body").first();
  if (!contentScope.length) contentScope = $("html").first();

  contentScope.find("br").each((_, element) => {
    $(element).after("\n");
  });
  contentScope.find("*").contents().each((_, element) => {
    if (element.type === "text") {
      const cleaned = cleanLearnerText($(element).text());
      if (cleaned !== $(element).text()) {
        (element as typeof element & { data?: string }).data = cleaned;
      }
    }
  });

  contentScope.find("[src]").each((_, element) => {
    const current = $(element).attr("src") ?? "";
    if (!current || isExternalUrl(current)) return;
    const resolvedHref = resolveWorkspaceAssetHref(bundle, entryPath, current);
    if (resolvedHref) {
      $(element).attr("src", resolvedHref);
      return;
    }
    if ($(element).is("img")) {
      const altText = $(element).attr("alt") ?? "";
      const titleText = $(element).attr("title") ?? "";
      const parent = $(element).parent();
      const parentHtml = parent.html() ?? "";
      const parentText = normalizeWhitespace(parent.clone().children().remove().end().text());
      const replaceParent =
        parent.is("a,strong,em,b,i,p,h1,h2,h3,h4,h5,h6") &&
        parent.children().length === 1 &&
        !parentText &&
        parentHtml.includes(current);
      const relatedHref = parent.is("a") ? parent.attr("href") ?? "" : "";
      const description = missingAssetDescription(current, altText, titleText);
      const replacement = renderMissingAssetLink(relatedHref);
      recordMissingAsset(missingAssetCollector, entryPath, current, description);
      if (replaceParent) {
        if (replacement) {
          parent.replaceWith(replacement);
        } else {
          parent.remove();
        }
      } else {
        $(element).replaceWith(replacement);
        if (
          parent.is("p") &&
          !normalizeWhitespace(parent.text()) &&
          !parent.find("img,iframe,video,audio,object,embed").length
        ) {
          parent.remove();
        }
      }
    } else {
      $(element).removeAttr("src");
    }
  });

  contentScope.find("[href]").each((_, element) => {
    const current = $(element).attr("href") ?? "";
    if (!current || isExternalUrl(current)) return;
    const resolvedHref = resolveWorkspaceAssetHref(bundle, entryPath, current);
    if (resolvedHref) {
      $(element).attr("href", resolvedHref);
    }
  });

  contentScope.find("table").addClass("social-imported-table");
  contentScope.find("img").each((_, element) => {
    const alt = $(element).attr("alt");
    const title = $(element).attr("title");
    if (typeof alt === "string") $(element).attr("alt", cleanPracticeImageTitle(alt));
    if (typeof title === "string") $(element).attr("title", cleanPracticeImageTitle(title));
    if (!$(element).attr("alt")) $(element).attr("alt", "");
  });
  let mediaTitleIndex = 0;
  contentScope.find("iframe").each((_, element) => {
    const src = $(element).attr("src") ?? "";
    if (!youtubeVideoId(src)) return;
    mediaTitleIndex += 1;
    const title = mediaTitleForLessonElement($(element).attr("title"), src, missingAssetCollector?.lessonTitle ?? "Course media", mediaTitleIndex);
    if (title) $(element).attr("title", title);
  });
  removeDuplicateImportedLessonHeading(contentScope, missingAssetCollector?.lessonTitle, $);
  const content = contentScope.html() || $.root().html() || "";
  return `<div class="social-imported-lesson">${content}</div>`;
}

function renderLinkedLessonFile(item: D2lItem, filePath: string) {
  return `<div class="social-imported-lesson social-file-lesson">
    <p>This lesson uses a recovered course file.</p>
    <a class="external-resource-action" href="${escapeHtml(workspaceAssetHref("course", filePath))}" target="_blank" rel="noreferrer">Open Lesson File</a>
  </div>`;
}

function inferLessonGroup(config: IssueConfig, lessonTitle: string, index: number) {
  const value = normalizeForMatch(lessonTitle);
  if (index === 0 || /overview/.test(value)) return "Issue overview";
  if (/summary|conclusion|wrap up/.test(value)) return "Issue wrap-up";
  if (config.issueNumber === 1) {
    if (/technology|media|promotion/.test(value)) return "Technology, media, and culture";
    if (/language|culture|identity/.test(value)) return "Identity, language, and culture";
    if (/challenge|opportunit/.test(value)) return "Challenges and opportunities";
    return "Understandings of globalization";
  }
  if (config.issueNumber === 2) {
    if (/world|foundation|superiority|darwinism|perspectives on historical globalization and imperialism/.test(value)) {
      return "Foundations and worldviews";
    }
    if (/response|contact|indigenous|ngo|legacy|impact|perspectives on historical globalization/.test(value)) {
      return "Responses and legacies";
    }
    return "Historical globalization";
  }
  if (config.issueNumber === 3) {
    if (/growth|multiple perspective|striking|balance/.test(value)) return "Balancing prosperity";
    if (/expansion|shopping|corporate|sovereignty/.test(value)) return "Economic globalization";
    if (/prosperity|sustainability|affluence|idea|ideolog/.test(value)) return "Prosperity and sustainability";
    return "Globalization and sustainability";
  }
  if (/rights|quality/.test(value)) return "Quality of life and human rights";
  if (/participation|affects|communities/.test(value)) return "Global participation";
  if (/acting|responsibilities|disobedience|activism|now/.test(value)) return "Civic response";
  return "Global citizenship";
}

async function buildBaseLessons(course: D2lCourse, bundle: ZipBundle, config: IssueConfig, missingAssets: MissingAssetRecord[]) {
  const issueRoot = findD2lItemByTitle(course, config.d2lTitle);
  if (!issueRoot) throw new Error(`Could not find D2L issue section: ${config.d2lTitle}`);
  const lessonItems = lessonChildrenForIssue(issueRoot);
  const lessons: NextStepShellLesson[] = [];

  for (const [index, item] of lessonItems.entries()) {
    const filePath = primaryResourceFile(item);
    if (!filePath) continue;
    const extension = fileExtension(filePath);
    const lessonId = `lesson-${String(lessons.length + 1).padStart(2, "0")}`;
    if (/\.html?$/i.test(extension)) {
      const html = await readZipText(bundle, filePath);
      if (!html.trim()) continue;
      const $ = load(html);
      const title = cleanLessonTitle($, item.title, filePath, config);
      const text = d2lTextFromHtml(html);
      const summaryText = d2lSummaryTextFromHtml(html) || text;
      lessons.push({
        id: lessonId,
        title,
        summary: summarizeText(summaryText, title),
        group: inferLessonGroup(config, title, index),
        unitGroup: config.title,
        entry: filePath,
        html: sanitizeHtml(html, filePath, bundle, {
          issueNumber: config.issueNumber,
          lessonId,
          lessonTitle: title,
          records: missingAssets
        })
      });
    } else {
      const title = cleanLessonDisplayTitle(item.title, config) || cleanLessonDisplayTitle(humanizeTitleFromPath(filePath), config);
      lessons.push({
        id: lessonId,
        title,
        summary: `Open the recovered ${extension.replace(".", "").toUpperCase() || "course"} file connected to this lesson.`,
        group: inferLessonGroup(config, title, index),
        unitGroup: config.title,
        entry: filePath,
        html: renderLinkedLessonFile(item, filePath)
      });
    }
  }

  return lessons;
}

async function loadModuleDocuments(bundle: ZipBundle): Promise<ModuleDocument[]> {
  const docs: ModuleDocument[] = [];
  const docxPaths = Object.keys(bundle.zip.files)
    .filter((filePath) => /\.docx$/i.test(filePath))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));
  for (const zipPath of docxPaths) {
    const file = zipFile(bundle, zipPath);
    if (!file) continue;
    const buffer = await file.async("nodebuffer");
    const rawText = cleanModuleRawText((await mammoth.extractRawText({ buffer })).value)
      .replace(/\r/g, "\n")
      .replace(/([?.!])\s+(?=(?:What|How|Why|When|Where|Describe|Explain|Analyze|Read|Create|List|Take|In sentence format|Fill|Use)\b)/g, "$1\n");
    const rawLines = rawText.split(/\n+/).map(cleanModuleLine).filter(Boolean);
    const nameMatch = zipPath.match(/Unit\s+(\d)/i);
    const textMatch = rawText.match(/\bUnit\s+(\d)\b/i);
    const unit = Number(nameMatch?.[1] ?? textMatch?.[1] ?? 0);
    let media: ModuleMedia[] = [];
    try {
      const docxZip = await JSZip.loadAsync(buffer);
      const mediaPaths = Object.keys(docxZip.files)
        .filter((candidate) => candidate.startsWith("word/media/") && /\.(?:png|jpe?g|gif|webp)$/i.test(candidate))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));
      media = await Promise.all(
        mediaPaths.map(async (mediaPath): Promise<ModuleMedia> => {
          const mediaBuffer = await docxZip.file(mediaPath)!.async("nodebuffer");
          return {
            fileName: path.posix.basename(mediaPath),
            zipPath: mediaPath,
            buffer: mediaBuffer,
            byteLength: mediaBuffer.byteLength
          };
        })
      );
    } catch {
      media = [];
    }
    docs.push({
      unit,
      title: cleanTitle(humanizeTitleFromPath(zipPath), `Unit ${unit} Module`),
      zipPath,
      rawText: rawLines.join("\n"),
      mediaCount: media.length,
      media,
      lineCount: rawLines.length
    });
  }
  return docs;
}

function cleanModuleRawText(value: string) {
  return cleanLearnerText(value)
    .replace(/(Making Your Own Land Acknowledgment)(Acknowledging territory)/g, "$1\n$2")
    .replace(/(Here are some links that might help you complete your land acknowledgment:)(Metis Settlement Maps)/g, "$1\n$2")
    .replace(/(Metis Settlement Maps)(https?:\/\/)/g, "$1\n$2")
    .replace(/(https:\/\/www\.settlementinvestcorp\.com\/)(Role of an Elder)/g, "$1\n$2")
    .replace(/(Role of an Elder)(https?:\/\/)/g, "$1\n$2");
}

function cleanModuleLine(value: string) {
  return normalizeWhitespace(cleanLearnerText(value));
}

function cleanPrompt(value: string) {
  return cleanModuleLine(value)
    .replace(/^\s*(?:[-*]|\d+[\.)]|[a-z][\.)])\s*/i, "")
    .replace(/\s+([?.!,;:])/g, "$1")
    .trim();
}

function isHeadingLine(line: string) {
  if (line.length > 96) return false;
  return /^(?:Part|Topic|Chapter|Assignment|Foundations|Key Terms|Social Studies|Historical Globalization|Globalization and|Impacts of|First, read|Watch:|Read Chapter|\d+\.\s*[A-Z])/i.test(line);
}

function isVocabSection(heading: string) {
  return /\b(?:vocabulary|key terms|terms)\b/i.test(heading);
}

function isUsefulPrompt(line: string) {
  const prompt = cleanPrompt(line);
  if (prompt.length < 12 || prompt.length > 520) return false;
  if (/^(?:assignment|key terms|social studies 10-1|unit \d module|then complete the following assignment|complete the following questions)$/i.test(prompt)) return false;
  if (/^(?:chapter \d+|topic \d+(?:\.\d+)?|watch:|first, read)\b/i.test(prompt)) return false;
  if (/^[A-Z][A-Za-z\s/&$-]{2,45}:?$/.test(prompt) && !/\?$/.test(prompt)) return false;
  return (
    /\?$/.test(prompt) ||
    /^(?:analyze|choose|compare|complete|create|define|describe|discuss|examine|explain|fill|identify|in sentence format|list|make|provide|read|research|take|to what extent|use|watch|write)\b/i.test(prompt)
  );
}

function promptKind(prompt: string): PromptKind {
  if (/\b(?:source|quotation|quote|figure|cartoon|image|photo|map|chart|data|perspective|point of view)\b/i.test(prompt)) return "source";
  if (/\b(?:to what extent|position|respond|argue|agree|citizen|responsibility)\b/i.test(prompt)) return "position";
  if (/\b(?:evidence|example|support|effect|impact|consequence|significant|why)\b/i.test(prompt)) return "evidence";
  return "concept";
}

function promptNeedsVisibleSource(prompt: string) {
  return /\b(?:source|quotation|quote|figure|cartoon|image|photo|photograph|map|graph|chart|data|poster|three quotations|mind-map showing how these four items|political cartoon)\b/i.test(prompt);
}

function hasUsableSourceContext(context: string) {
  const cleaned = cleanPrompt(context);
  return cleaned.length > 90 && !/\b(?:page|figure|quotation|source)\s+\d+\b/i.test(cleaned);
}

function cleanLandAcknowledgmentTemplate(value: string) {
  return cleanModuleLine(value)
    .replace(/\(answer here\)\s*\(treaty number\)/gi, "___")
    .replace(/\(answer here\)\s*\(names of language groups\)/gi, "___")
    .replace(/\(answer here\)\s*\(list communities\)/gi, "___")
    .replace(/\(answer here\)\s*\(list special contributions and role of Elders\)/gi, "___")
    .replace(/\s+/g, " ");
}

function extractLandAcknowledgmentPrompt(doc: ModuleDocument, lines: string[]): ModulePrompt[] {
  if (doc.unit !== 2) return [];
  const startIndex = lines.findIndex((line) => /^Making Your Own Land Acknowledgment/i.test(line));
  const activityIndex = lines.findIndex((line) => /^Activity:\s*Create your own acknowledgment/i.test(line));
  const template = lines.find((line) => /I wish to acknowledge that the land on which we gather/i.test(line));
  if (startIndex < 0 || activityIndex < 0 || !template) return [];
  const context = [
    "Making your own land acknowledgment",
    "Acknowledging territory is a way of showing respect for Indigenous people and recognizing Indigenous presence in the past and present.",
    "Create your own acknowledgment for the treaty area where you live. Use the links below and the conversation guide to make it specific and respectful.",
    `Template: ${cleanLandAcknowledgmentTemplate(template)}`,
    "Helpful resources:",
    "Alberta Treaties 6, 7 & 8 Conversation Guide: http://empoweringthespirit.ca/wp-content/uploads/2017/05/Alberta-Treaties-678-1.pdf",
    "Métis Settlement Maps: https://metisarchitect.com/2015/07/27/introduction-the-alberta-metis-settlements/",
    "Settlement Investment Corporation: https://www.settlementinvestcorp.com/",
    "Role of an Elder: https://www.ictinc.ca/blog/aboriginal-elder-definition"
  ].join("\n");
  const prompt = "Create your own land acknowledgment for the treaty area where you live. Use the treaty conversation guide, Métis settlement maps, and Elder resource links to make it specific and respectful.";
  return [
    {
      id: `2-land-acknowledgment-${shortHash(`${doc.zipPath}:${prompt}`)}`,
      unit: doc.unit,
      prompt,
      kind: "evidence",
      documentTitle: `Unit ${doc.unit} module`,
      sourcePath: doc.zipPath,
      heading: "Making Your Own Land Acknowledgment",
      context,
      matchText: `${context} ${prompt} Treaty Indigenous Peoples Métis Elders reconciliation`,
      sourceIndex: startIndex + 1,
      priority: 50
    }
  ];
}

function isModuleScaffoldLine(line: string) {
  return (
    /^Here are some links that might help/i.test(line) ||
    /^Helpful resources:?$/i.test(line) ||
    /^Metis Settlement Maps/i.test(line) ||
    /^Métis Settlement Maps/i.test(line) ||
    /^Role of an Elder/i.test(line) ||
    /^https?:\/\//i.test(line) ||
    /I wish to acknowledge that the land on which we gather/i.test(line)
  );
}

function extractModulePrompts(doc: ModuleDocument) {
  const lines = doc.rawText.split(/\n+/).map(cleanModuleLine).filter(Boolean);
  const prompts: ModulePrompt[] = extractLandAcknowledgmentPrompt(doc, lines);
  const seen = new Set(prompts.map((prompt) => normalizeForMatch(`${prompt.unit}:${prompt.prompt}`)));
  let heading = doc.title;
  let contextWindow: string[] = [];
  let sourceIndex = prompts.length;

  for (const line of lines) {
    if (isHeadingLine(line)) {
      heading = cleanPrompt(line);
      contextWindow = [];
      continue;
    }

    if (isModuleScaffoldLine(line)) {
      contextWindow = [];
      continue;
    }

    const vocabMatch = isVocabSection(heading) ? line.match(/^\d+\.\s*([^:]{3,80}):?\s*$/) : undefined;
    const linePrompt = vocabMatch ? `Define ${cleanPrompt(vocabMatch[1] ?? "")}.` : line;

    if (!isUsefulPrompt(linePrompt)) {
      if (line.length > 50) contextWindow = [...contextWindow.slice(-2), line];
      continue;
    }

    const prompt = cleanPrompt(linePrompt);
    const key = normalizeForMatch(`${doc.unit}:${prompt}`);
    if (seen.has(key)) continue;
    seen.add(key);
    sourceIndex += 1;
    const context = contextWindow.join(" ");
    prompts.push({
      id: `${doc.unit}-${sourceIndex}-${shortHash(`${doc.zipPath}:${prompt}`)}`,
      unit: doc.unit,
      prompt,
      kind: promptKind(prompt),
      documentTitle: `Unit ${doc.unit} module`,
      sourcePath: doc.zipPath,
      heading,
      context: hasUsableSourceContext(context) ? context : undefined,
      matchText: `${heading} ${prompt}`,
      sourceIndex
    });
    contextWindow = [...contextWindow.slice(-1), prompt];
  }

  return prompts;
}

function chapterNumbers(value: string) {
  return Array.from(value.matchAll(/\bchapter\s+(\d{1,2})\b/gi)).map((match) => Number(match[1]));
}

function textbookPages(value: string) {
  return Array.from(value.matchAll(/\bpages?\s+(\d{1,3})(?:\s*[-]\s*(\d{1,3}))?/gi)).flatMap((match) => {
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    const pages: number[] = [];
    for (let page = start; page <= Math.min(end, start + 10); page += 1) pages.push(page);
    return pages;
  });
}

function scorePromptForLesson(prompt: ModulePrompt, lesson: NextStepShellLesson, config: IssueConfig) {
  if (prompt.unit !== config.issueNumber) return Number.NEGATIVE_INFINITY;
  const promptText = `${prompt.heading} ${prompt.prompt} ${prompt.context ?? ""}`;
  const lessonText = `${lesson.title} ${lesson.group ?? ""} ${lesson.summary} ${load(lesson.html).root().text().slice(0, 5000)}`;
  const promptTokens = tokenize(promptText);
  const lessonTokens = tokenize(lessonText);
  let score = 0;

  for (const token of promptTokens) {
    if (lessonTokens.has(token)) score += 4;
  }

  const chapters = chapterNumbers(promptText);
  if (chapters.length > 0) {
    for (const chapter of chapters) {
      if (lessonText.match(new RegExp(`\\b(?:chapter\\s*)?${chapter}\\b`, "i"))) score += 18;
      if (config.issueNumber === 1 && chapter === 1 && /aspect|overview|understanding/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 1 && chapter === 2 && /identity/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 1 && chapter === 3 && /technology|media/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 1 && chapter === 4 && /challenge/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 1 && chapter === 5 && /opportunit/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 2 && chapter === 6 && /world|contact|cultural/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 2 && chapter === 7 && /imperialism|foundation|superiority/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 2 && chapter === 8 && /response|indigenous|ngo|imperialism/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 3 && chapter === 9 && /prosperity|historical|defining/.test(normalizeForMatch(lesson.title))) score += 20;
      if (config.issueNumber === 3 && chapter === 10 && /sustain|growth/.test(normalizeForMatch(lesson.title))) score += 20;
      if (config.issueNumber === 3 && chapter === 11 && /expansion|shopping|corporate/.test(normalizeForMatch(lesson.title))) score += 20;
      if (config.issueNumber === 3 && chapter === 12 && /economic|sovereignty|balance/.test(normalizeForMatch(lesson.title))) score += 20;
      if (config.issueNumber === 4 && chapter === 13 && /rights|quality/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 4 && chapter === 14 && /quality|affects|communities/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 4 && chapter === 15 && /participation|global/.test(normalizeForMatch(lesson.title))) score += 22;
      if (config.issueNumber === 4 && chapter === 16 && /acting|civic|responsib|disobedience|activism/.test(normalizeForMatch(lesson.title))) score += 22;
    }
  }

  const promptPages = textbookPages(promptText);
  const lessonPages = textbookPages(lessonText);
  if (promptPages.length && lessonPages.length && promptPages.some((page) => lessonPages.includes(page))) score += 16;
  if (
    config.issueNumber === 2 &&
    /land acknowledgment|treaty area|métis settlement|elder resource/i.test(promptText) &&
    /impacts of imperialism on indigenous peoples in canada/i.test(lesson.title)
  ) {
    score += 80;
  }
  if (/overview|summary|conclusion/i.test(lesson.title)) score -= 6;
  return score;
}

function buildPromptMapping(config: IssueConfig, lessons: NextStepShellLesson[], prompts: ModulePrompt[]) {
  const records: MappingRecord[] = [];
  const byLesson = new Map<string, ModulePrompt[]>();
  const capacity = new Map<string, number>();
  const issuePrompts = prompts
    .filter((prompt) => prompt.unit === config.issueNumber)
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0) || left.sourceIndex - right.sourceIndex);
  for (const prompt of issuePrompts) {
    if (promptNeedsVisibleSource(prompt.prompt) && !prompt.context) {
      records.push({
        promptId: prompt.id,
        unit: prompt.unit,
        prompt: prompt.prompt,
        kind: prompt.kind,
        documentTitle: prompt.documentTitle,
        heading: prompt.heading,
        status: "quarantined",
        reason: "Source-dependent prompt without visible source/context."
      });
      continue;
    }

    const ranked = lessons
      .map((lesson) => ({ lesson, score: scorePromptForLesson(prompt, lesson, config) }))
      .filter((entry) => Number.isFinite(entry.score))
      .sort((left, right) => right.score - left.score);
    const best = ranked[0];
    if (!best || best.score < 8) {
      records.push({
        promptId: prompt.id,
        unit: prompt.unit,
        prompt: prompt.prompt,
        kind: prompt.kind,
        documentTitle: prompt.documentTitle,
        heading: prompt.heading,
        status: "quarantined",
        score: best?.score ?? 0,
        reason: "No confident lesson match."
      });
      continue;
    }
    const currentCount = capacity.get(best.lesson.id) ?? 0;
    if (currentCount >= 8) {
      records.push({
        promptId: prompt.id,
        unit: prompt.unit,
        prompt: prompt.prompt,
        kind: prompt.kind,
        documentTitle: prompt.documentTitle,
        heading: prompt.heading,
        status: "skipped",
        lessonId: best.lesson.id,
        lessonTitle: best.lesson.title,
        score: best.score,
        reason: "Lesson already has the maximum number of layered module questions."
      });
      continue;
    }
    capacity.set(best.lesson.id, currentCount + 1);
    byLesson.set(best.lesson.id, [...(byLesson.get(best.lesson.id) ?? []), prompt]);
    records.push({
      promptId: prompt.id,
      unit: prompt.unit,
      prompt: prompt.prompt,
      kind: prompt.kind,
      documentTitle: prompt.documentTitle,
      heading: prompt.heading,
      status: "placed",
      lessonId: best.lesson.id,
      lessonTitle: best.lesson.title,
      score: best.score
    });
  }
  return { records, byLesson };
}

function activityPlaceholder(kind: PromptKind) {
  if (kind === "source") return "Interpret the source/context, then explain what detail supports your reading.";
  if (kind === "position") return "State a position and support it with a course detail.";
  if (kind === "evidence") return "Record the evidence and explain why it matters.";
  return "Answer in your own words, using lesson vocabulary where it helps.";
}

function renderInlineLinks(value: string) {
  return escapeHtml(value).replace(/https?:\/\/[^\s<]+/g, (href) => {
    const cleanHref = href.replace(/[.,;:!?]+$/, "");
    const trailing = href.slice(cleanHref.length);
    return `<a href="${cleanHref}" target="_blank" rel="noreferrer">${cleanHref}</a>${trailing}`;
  });
}

function renderActivityContext(context: string) {
  const lines = context.split(/\n+/).map(cleanModuleLine).filter(Boolean);
  if (lines.length === 0) return "";
  return `<div class="social-embedded-context">
          <strong>Context</strong>
          ${lines.map((line) => `<p>${renderInlineLinks(line)}</p>`).join("\n")}
        </div>`;
}

function renderLessonActivities(config: IssueConfig, lesson: NextStepShellLesson, activities: ModulePrompt[]) {
  if (activities.length === 0) return "";
  const cards = activities
    .map(
      (activity, index) => `<article class="social-embedded-activity social-embedded-activity--${escapeHtml(activity.kind)}">
        ${activity.context ? renderActivityContext(activity.context) : ""}
        <div class="social-embedded-question-row">
          <span class="social-embedded-question-number" aria-hidden="true">${index + 1}</span>
          <div>
            <p class="social-embedded-activity-question">${escapeHtml(activity.prompt)}</p>
          </div>
        </div>
        <label>
          Response
          <textarea data-response-id="${escapeHtml(`${config.slug}:${lesson.id}:module-question:${activity.id}`)}" placeholder="${escapeHtml(activityPlaceholder(activity.kind))}"></textarea>
        </label>
      </article>`
    )
    .join("\n");
  return `<section class="social-lesson-embedded-activities" data-writing-activity-panel aria-labelledby="${escapeHtml(`${lesson.id}-module-questions`)}">
    <div class="social-embedded-activity-lede">
      <span>Practice</span>
      <h2 id="${escapeHtml(`${lesson.id}-module-questions`)}">Lesson questions</h2>
      <p>Use these questions to check your understanding while the lesson is fresh. Your responses save with the rest of your course notes.</p>
    </div>
    <div class="social-embedded-activity-list">
      ${cards}
    </div>
    <div class="social-save-status-line">
      <span class="save-status" data-save-status>Saved locally</span>
    </div>
  </section>`;
}

function renderLessonEvidenceNote(config: IssueConfig, lesson: NextStepShellLesson, index: number) {
  return `<section class="social-lesson-evidence-note">
    <h3>Evidence note</h3>
    <p>Capture one detail from this lesson that could help answer the issue question.</p>
    <label class="social-workbook-response">
      <span>Lesson evidence</span>
      <textarea data-evidence-note="lesson" data-evidence-lesson-title="${escapeHtml(lesson.title)}" data-evidence-lesson-group="${escapeHtml(config.title)}" data-evidence-lesson-number="${index + 1}" data-response-id="${escapeHtml(config.slug)}:lesson-${index + 1}:evidence" placeholder="Name the source, example, or detail and explain why it matters."></textarea>
    </label>
  </section>`;
}

function injectLessonActivities(config: IssueConfig, lessons: NextStepShellLesson[], byLesson: Map<string, ModulePrompt[]>) {
  return lessons.map((lesson, index) => {
    const activities = byLesson.get(lesson.id) ?? [];
    return {
      ...lesson,
      html: `${lesson.html}
        ${renderLessonActivities(config, lesson, activities)}
        ${renderLessonEvidenceNote(config, lesson, index)}`
    };
  });
}

function canPreview(extension: string) {
  return [".pdf", ".html", ".htm", ".txt"].includes(extension);
}

function wrapPreviewHtml(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 28px; font: 16px/1.55 system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; color: #1d241b; background: #fff; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; max-width: 100%; }
    td, th { border: 1px solid #dfe5dd; padding: 8px; vertical-align: top; }
    a { color: #155600; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

async function createHtmlPreview(bundle: ZipBundle, workspaceDir: string, filePath: string, title: string) {
  const raw = await readZipText(bundle, filePath);
  if (!raw.trim()) return workspaceAssetHref(bundle.key, filePath);
  const body = sanitizeHtml(raw, filePath, bundle);
  const previewPath = path.join("assets", "previews", bundle.key, `${normalizeZipPath(filePath).replace(/[^a-z0-9]+/gi, "-")}.html`);
  const fullPath = path.join(workspaceDir, previewPath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, wrapPreviewHtml(title, body), "utf8");
  return previewPath;
}

function libraryCategoryLabel(category: ResourceCategory) {
  if (category === "textbook") return "Textbook";
  if (category === "student") return "Student support";
  if (category === "media") return "Media";
  return "Unit file";
}

function resourceSourceLabel(resource: ImportedResource) {
  const extension = fileExtension(resource.href).replace(/^\./, "").toUpperCase() || "File";
  return `${libraryCategoryLabel(resource.category)} | ${extension}`;
}

function resourceDescription(resource: ImportedResource) {
  if (resource.description) return cleanResourceDescription(resource.description);
  if (resource.category === "textbook") return "Use this textbook chapter as a core evidence source for the issue.";
  if (resource.category === "student") return "Use this support file for planning, source analysis, writing, or review.";
  if (resource.category === "media") return "Use this media item to connect course ideas to evidence.";
  return "Course file connected to this issue.";
}

function polishResourceTitle(value: string) {
  return normalizeWhitespace(value)
    .replace(/^SS\s*10\s*[- ]?1\s*:?\s*/i, "")
    .replace(/\bSS\s*10\s*[- ]?1\b/gi, "Social Studies 10-1")
    .replace(/\bGuide To\b/g, "Guide to")
    .replace(/\bHow To\b/g, "How to")
    .replace(/\bTips For\b/g, "Tips for")
    .replace(/\bRead A Picture\b/g, "Read a Picture")
    .replace(/\bPowerpoint\b/g, "PowerPoint");
}

function cleanResourceTitle(title: string, fallbackPath: string) {
  const cleaned = cleanTitle(title, "");
  if (cleaned && !/^webcontent$/i.test(cleaned)) return polishResourceTitle(cleaned);
  return polishResourceTitle(humanizeTitleFromPath(fallbackPath));
}

function cleanResourceDescription(value: string) {
  const cleaned = normalizeWhitespace(value)
    .replace(/\bRecovered\s+D2L\s+file\s+connected\s+to\s+this\s+related\s+issue\./gi, "Course file connected to this related issue.")
    .replace(/\bD2L\b/g, "course")
    .replace(/\bBrightspace\b/g, "course")
    .trim();
  return cleaned;
}

const SOCIAL30_INQUIRY_SUPPORTS: StaticSupportResourceDefinition[] = [
  {
    kind: "inquiry",
    title: "Fact vs Opinion and Journalism",
    sourceHref: "assets/resources/student/Fact-vs-Opinion-and-Journalism-5dd0a33d.pptx",
    previewHref: "assets/resources/previews/Fact-vs-Opinion-and-Journalism-5dd0a33d-preview.pdf"
  },
  {
    kind: "inquiry",
    title: "Finding Premises and Conclusions",
    sourceHref: "assets/resources/student/student-handout-finding-premises-conclusions-7ec99ff2.pdf"
  },
  {
    kind: "inquiry",
    title: "Reading Strategies",
    sourceHref: "assets/resources/student/reading-strategies-84ea1bb6.pdf"
  },
  {
    kind: "inquiry",
    title: "Ways to Support an Argument",
    sourceHref: "assets/resources/student/waystosupportanargument-70b77825.pdf"
  }
];

const SOCIAL30_POSITION_SUPPORTS: StaticSupportResourceDefinition[] = [
  {
    kind: "position",
    title: "Economic Position Paper How-To",
    sourceHref: "assets/resources/student/PositionPaperHowToEconomic-e8260065.pdf"
  },
  {
    kind: "position",
    title: "Finding Premises and Conclusions",
    sourceHref: "assets/resources/student/student-handout-finding-premises-conclusions-7ec99ff2.pdf"
  },
  {
    kind: "position",
    title: "Position Paper How-To",
    sourceHref: "assets/resources/student/PositionPaperHowTo-062690b0.pdf"
  },
  {
    kind: "position",
    title: "Position Paper Notes",
    sourceHref: "assets/resources/student/PositionPaperNotes-8d07baf7.docx",
    previewHref: "assets/resources/previews/PositionPaperNotes-8d07baf7-preview.html"
  },
  {
    kind: "position",
    title: "Position Paper Outline",
    sourceHref: "assets/resources/student/PositionPaperOutline-6bf53b22.docx",
    previewHref: "assets/resources/previews/PositionPaperOutline-6bf53b22-preview.html"
  },
  {
    kind: "position",
    title: "Social Studies 30 Position Paper Checklist",
    sourceHref: "assets/resources/student/S30-Position-Paper-Checklist-2018-ebbf5796.pdf"
  },
  {
    kind: "position",
    title: "Social Studies 30-1 Student Writing Sample",
    sourceHref: "assets/resources/student/08-ss30-1-sosw-jan2014-04162014-cbf83cf5.pdf"
  },
  {
    kind: "position",
    title: "Ways to Support an Argument",
    sourceHref: "assets/resources/student/waystosupportanargument-70b77825.pdf"
  },
  {
    kind: "position",
    title: "Writing Essays Thesis Statement",
    sourceHref: "assets/resources/student/WritingEssays-Thesis-Statement-ef59245d.pptx",
    previewHref: "assets/resources/previews/WritingEssays-Thesis-Statement-ef59245d-preview.pdf"
  }
];

const SOCIAL30_STATIC_SUPPORTS = [...SOCIAL30_INQUIRY_SUPPORTS, ...SOCIAL30_POSITION_SUPPORTS];

function staticSupportHref(sourceHref: string) {
  return path.posix.join("assets", "social30-supports", path.posix.basename(sourceHref));
}

async function copySocial30SupportResources(workspaceDir: string) {
  const copied = new Set<string>();
  const outputRoot = path.join(workspaceDir, "assets", "social30-supports");
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });
  for (const support of SOCIAL30_STATIC_SUPPORTS) {
    for (const href of [support.sourceHref, support.previewHref].filter((value): value is string => Boolean(value))) {
      if (copied.has(href)) continue;
      const sourcePath = path.join(SOCIAL30_SUPPORT_SOURCE_ROOT, ...href.split("/"));
      const outputPath = path.join(workspaceDir, staticSupportHref(href));
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.copyFile(sourcePath, outputPath);
      copied.add(href);
    }
  }
}

function social30StaticSupportResources(): ImportedResource[] {
  return SOCIAL30_STATIC_SUPPORTS.map((support) => ({
    category: "student",
    title: support.title,
    href: staticSupportHref(support.sourceHref),
    previewHref: support.previewHref ? staticSupportHref(support.previewHref) : undefined,
    sourcePath: `social30:${support.sourceHref}`,
    description: "Student support resource from the Social Studies 30-1 course package.",
    supportKinds: [support.kind]
  }));
}

function supportKindsForResource(title: string, filePath: string) {
  const searchable = `${title} ${filePath}`;
  const kinds = new Set<SupportKind>();
  if (/guide to analyzing sources/i.test(searchable)) {
    kinds.add("source-analysis");
  }
  if (/source analysis|cartoon|readingimages|read a picture|image analysis|political cartoons?/i.test(searchable)) {
    kinds.add("source-analysis");
  }
  if (/position|thesis|essay|argument|counterargument|writing skills|supporting evidence/i.test(searchable) && !/tips for success/i.test(searchable)) {
    kinds.add("position");
  }
  return Array.from(kinds);
}

async function resourceTitleFromFile(bundle: ZipBundle, filePath: string, fallbackTitle: string) {
  if (!/\.html?$/i.test(filePath)) return cleanResourceTitle(fallbackTitle, filePath);
  const html = await readZipText(bundle, filePath);
  if (!html.trim()) return cleanResourceTitle(fallbackTitle, filePath);
  return cleanLessonTitle(load(html), fallbackTitle, filePath);
}

async function makeResource(
  bundle: ZipBundle,
  workspaceDir: string,
  filePath: string,
  category: ResourceCategory,
  fallbackTitle: string,
  description: string
): Promise<ImportedResource | undefined> {
  const file = zipFile(bundle, filePath);
  if (!file) return undefined;
  const href = workspaceAssetHref(bundle.key, filePath);
  const extension = fileExtension(filePath);
  const title = await resourceTitleFromFile(bundle, filePath, fallbackTitle);
  const previewHref = /\.html?$/i.test(filePath) ? await createHtmlPreview(bundle, workspaceDir, filePath, title) : canPreview(extension) ? href : undefined;
  return { category, title, href, previewHref, sourcePath: filePath, description };
}

function textbookChapterNumber(title: string, filePath: string) {
  return Number((`${title} ${filePath}`.match(/\bChap(?:ter)?\s*[_-]?(\d{1,2})(?=\b|[_-])/i) ?? [])[1] ?? 0);
}

function courseSupportResourcePaths(bundle: ZipBundle) {
  const patterns = [
    /Student Resources\/Cartoon analysis\/Political Cartoons\.html$/i,
    /Student Resources\/Cartoon analysis\/ReadingImages\.htm$/i,
    /Student Resources\/Cartoon analysis\/assets\/Guide to Analyzing Sources\.pdf$/i,
    /Student Resources\/Cartoon analysis\/assets\/Understanding_Political_Cartoons\.pptx$/i,
    /Student Resources\/Cartoon analysis\/Political Cartoon Skills Powerpoint\.ppt$/i
  ];
  return Object.values(bundle.zip.files)
    .filter((file) => !file.dir)
    .map((file) => normalizeZipPath(file.name))
    .filter((filePath) => patterns.some((pattern) => pattern.test(filePath)))
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
}

async function collectResources(
  course: D2lCourse,
  d2lBundle: ZipBundle,
  moduleBundle: ZipBundle,
  docs: ModuleDocument[],
  config: IssueConfig,
  workspaceDir: string
) {
  const resources: ImportedResource[] = [];
  const seen = new Set<string>();
  const add = async (
    bundle: ZipBundle,
    filePath: string,
    category: ResourceCategory,
    fallbackTitle: string,
    description: string,
    supportKinds: SupportKind[] = []
  ) => {
    const key = `${bundle.key}:${normalizeZipPath(filePath).toLowerCase()}`;
    if (seen.has(key) || !/\.(html?|pdf|docx?|pptx?|rtf|txt)$/i.test(filePath)) return;
    const resource = await makeResource(bundle, workspaceDir, filePath, category, fallbackTitle, description);
    if (!resource) return;
    const detectedSupportKinds = supportKindsForResource(resource.title, filePath);
    const mergedSupportKinds = Array.from(new Set([...supportKinds, ...detectedSupportKinds]));
    if (mergedSupportKinds.length > 0) resource.supportKinds = mergedSupportKinds;
    seen.add(key);
    resources.push(resource);
  };

  const textbookRoot = findD2lItemByTitle(course, "Textbook - Perspectives on Globalization");
  for (const item of textbookRoot ? flattenItems(textbookRoot.children) : []) {
    const filePath = primaryResourceFile(item);
    if (!filePath) continue;
    const chapter = textbookChapterNumber(item.title, filePath);
    if (config.textbookChapters.includes(chapter)) {
      await add(d2lBundle, filePath, "textbook", `Chapter ${chapter}`, "Perspectives on Globalization textbook chapter.");
    }
  }

  const issueRoot = findD2lItemByTitle(course, config.d2lTitle);
  if (issueRoot) {
    for (const item of flattenItems(issueRoot.children)) {
      const filePath = primaryResourceFile(item);
      if (!filePath) continue;
      if (/\.(pdf|docx?|pptx?|rtf|txt)$/i.test(filePath) || /study guide|written response|assessment/i.test(item.title)) {
        await add(d2lBundle, filePath, "unit", item.title, "Recovered D2L file connected to this related issue.");
      }
    }
  }

  for (const filePath of courseSupportResourcePaths(d2lBundle)) {
    await add(d2lBundle, filePath, "student", humanizeTitleFromPath(filePath), "Student support resource from the course package.");
  }

  await copySocial30SupportResources(workspaceDir);
  resources.push(...social30StaticSupportResources());

  for (const doc of docs.filter((candidate) => candidate.unit === config.issueNumber)) {
    await add(
      moduleBundle,
      doc.zipPath,
      "student",
      `Unit ${doc.unit} updated module`,
      "Updated module source used to layer lesson questions into this course."
    );
  }

  return resources;
}

function issueNumberForPodcast(entry: NsoPodcastEntry) {
  const title = entry.title.toLowerCase();
  if (/\b(?:global apathy|civic responsibility|global citizen)\b/i.test(title)) return 4;
  if (/\b(?:residential schools|unfinished history|trade-off|unbroken chain|invisible lens|colonization|colonisation)\b/i.test(title)) return 2;
  if (/\b(?:equilibrium|prosperity|sustainability|coffee|rulemakers|referees|architecture of globalization)\b/i.test(title)) return 3;
  if (/\b(?:globalization|human footprint|human face|who are you|local cultures|economics, culture and politics)\b/i.test(title)) return 1;
  return undefined;
}

function podcastDescription(config: IssueConfig, entry: NsoPodcastEntry) {
  return `Podcast companion for ${entry.title.replace(/\s+Podcast$/i, "")}. Use it to connect media evidence back to ${config.issueQuestion}`;
}

function podcastLessonHints(entry: NsoPodcastEntry) {
  const title = entry.title.toLowerCase();
  const hints: string[] = [];
  const add = (...values: string[]) => hints.push(...values.map((value) => value.toLowerCase()));
  if (/global apathy/.test(title)) add("global citizenship overview", "quality of life", "acting now");
  if (/civic responsibility/.test(title)) add("civic responsibilities", "acting big");
  if (/global citizen/.test(title)) add("global participation", "global citizenship overview");
  if (/human footprint/.test(title)) add("aspects of globalization", "challenges of globalization");
  if (/human face/.test(title)) add("identity and globalization", "opportunities of globalization");
  if (/who are you/.test(title)) add("identity and globalization");
  if (/what is globalization/.test(title)) add("aspects of globalization");
  if (/local cultures|globalization paradox/.test(title)) add("technology and promotion of culture", "media, technology and cultural exchange", "promoting language");
  if (/residential schools|reconciliation|unfinished history/.test(title)) {
    add("impacts of imperialism on indigenous people", "indigenous peoples responses", "cultural contact in canada");
  }
  if (/brutal trade|unbroken chain/.test(title)) add("foundations of imperialism", "perspectives on historical globalization");
  if (/invisible lens|colonization/.test(title)) add("foundations of imperialism", "ethnic superiority", "responses to imperialism");
  if (/equilibrium|prosperity|sustainability/.test(title)) add("defining prosperity", "perspectives on sustainability", "striking a balance");
  if (/coffee/.test(title)) add("cross-border shopping", "corporate challenges", "sustainable growth");
  if (/rulemakers|referees/.test(title)) add("economic sovereignty", "multiple perspectives");
  if (/architecture of globalization/.test(title)) add("expansion of globalization", "economic sovereignty");
  return hints;
}

function scorePodcastForLesson(entry: NsoPodcastEntry, lesson: NextStepShellLesson) {
  const lessonTitle = normalizeWhitespace(lesson.title).toLowerCase();
  const lessonText = normalizeWhitespace(`${lesson.title} ${lesson.summary} ${load(lesson.html).root().text().slice(0, 4200)}`).toLowerCase();
  let score = 0;
  for (const hint of podcastLessonHints(entry)) {
    if (lessonTitle.includes(hint)) score += 80;
    else if (lessonText.includes(hint)) score += 22;
  }
  const titleTokens = Array.from(tokenize(entry.title.replace(/\bpodcast\b/gi, "")));
  for (const token of titleTokens) {
    if (lessonTitle.includes(token)) score += 10;
    else if (lessonText.includes(token)) score += 2;
  }
  if (/\b(?:overview|conclusion|summary)\b/i.test(lesson.title)) score -= 12;
  return score;
}

function fallbackPodcastLesson(lessons: NextStepShellLesson[]) {
  return lessons.find((lesson) => !/\b(?:conclusion|summary)\b/i.test(lesson.title)) ?? lessons[0];
}

function buildPodcastConnections(
  config: IssueConfig,
  lessons: NextStepShellLesson[],
  entries: NsoPodcastEntry[]
): { connections: SocialPodcastConnection[]; report: SocialPodcastMappingReport } {
  const records: SocialPodcastMappingRecord[] = [];
  const connections: SocialPodcastConnection[] = [];
  const seenVideos = new Set<string>();
  const relevantEntries = entries.filter((entry) => {
    const matchedIssue = issueNumberForPodcast(entry);
    return matchedIssue === config.issueNumber || matchedIssue === undefined;
  });

  for (const entry of relevantEntries) {
    const videoKey = youtubeVideoIdFromHref(entry.href) ?? entry.href;
    if (seenVideos.has(videoKey)) {
      records.push({
        title: entry.title,
        href: entry.href,
        sourceLine: entry.sourceLine,
        status: "duplicate-suppressed",
        reason: "A podcast with the same YouTube video ID was already mapped."
      });
      continue;
    }
    seenVideos.add(videoKey);

    const matchedIssue = issueNumberForPodcast(entry);
    if (!matchedIssue) {
      records.push({
        title: entry.title,
        href: entry.href,
        sourceLine: entry.sourceLine,
        issueNumber: config.issueNumber,
        status: "quarantined",
        reason: "No confident Social 10-1 issue match."
      });
      continue;
    }

    const ranked = lessons
      .map((lesson) => ({ lesson, score: scorePodcastForLesson(entry, lesson) }))
      .sort((left, right) => right.score - left.score);
    const best = ranked[0];
    const fallback = fallbackPodcastLesson(lessons);
    const useBest = best && best.score >= 16 && !/\b(?:overview|conclusion|summary)\b/i.test(best.lesson.title);
    const lesson = useBest ? best.lesson : fallback;
    if (!lesson) {
      records.push({
        title: entry.title,
        href: entry.href,
        sourceLine: entry.sourceLine,
        issueNumber: config.issueNumber,
        status: "quarantined",
        reason: "No lesson was available for this related issue."
      });
      continue;
    }

    const connection: SocialPodcastConnection = {
      id: `podcast-${videoKey.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
      issueNumber: config.issueNumber,
      title: entry.title,
      href: entry.href,
      description: podcastDescription(config, entry),
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      status: useBest ? "placed" : "fallback-overview",
      score: best?.score ?? 0,
      sourceLine: entry.sourceLine
    };
    connections.push(connection);
    records.push({
      title: entry.title,
      href: entry.href,
      sourceLine: entry.sourceLine,
      issueNumber: config.issueNumber,
      status: connection.status,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      score: connection.score,
      reason: useBest ? "Matched to lesson title/content." : "Placed in the issue overview because no exact lesson match cleared the threshold."
    });
  }

  const report: SocialPodcastMappingReport = {
    slug: config.slug,
    course: "Social Studies 10-1",
    sourcePath: PODCAST_LIST_PATH,
    parsed: relevantEntries.length,
    counts: {
      placed: records.filter((record) => record.status === "placed").length,
      fallbackOverview: records.filter((record) => record.status === "fallback-overview").length,
      quarantined: records.filter((record) => record.status === "quarantined").length,
      duplicateSuppressed: records.filter((record) => record.status === "duplicate-suppressed").length
    },
    records
  };
  return { connections, report };
}

function addPodcastResources(resources: ImportedResource[], connections: SocialPodcastConnection[]) {
  const seen = new Set(resources.map((resource) => youtubeVideoIdFromHref(resource.href) ?? resource.href));
  for (const podcast of connections) {
    const key = youtubeVideoIdFromHref(podcast.href) ?? podcast.href;
    if (seen.has(key)) continue;
    seen.add(key);
    resources.push({
      category: "media",
      title: podcast.title,
      href: podcast.href,
      sourcePath: "NSO Social Studies podcast list",
      description: podcast.description
    });
  }
}

function renderLessonPodcastConnection(podcast: SocialPodcastConnection) {
  const embedHref = youtubeEmbedUrl(podcast.href);
  if (embedHref) {
    return `<article class="social-podcast-item social-podcast-item--embed">
      <div class="social-podcast-item-copy">
        <strong>${escapeHtml(podcast.title)}</strong>
        <p>${escapeHtml(podcast.description)}</p>
        <a class="social-podcast-source-link" href="${escapeHtml(podcast.href)}" target="_blank" rel="noopener noreferrer">Open on YouTube</a>
      </div>
      <iframe class="social-podcast-embed" src="${escapeHtml(embedHref)}" title="${escapeHtml(podcast.title)}" loading="lazy" allowfullscreen></iframe>
    </article>`;
  }

  return `<a class="social-podcast-link" href="${escapeHtml(podcast.href)}" target="_blank" rel="noopener noreferrer">
    <strong>${escapeHtml(podcast.title)}</strong>
    <span>Open resource</span>
  </a>`;
}

function renderLessonPodcastConnections(config: IssueConfig, lesson: NextStepShellLesson, podcasts: SocialPodcastConnection[]) {
  if (podcasts.length === 0) return "";
  const headingId = `${lesson.id}-podcast-connections-title`;
  return `<section class="social-podcast-card" aria-labelledby="${escapeHtml(headingId)}">
    <div class="social-podcast-card-heading">
      <span>Watch / Listen</span>
      <h2 id="${escapeHtml(headingId)}">Podcast connection</h2>
    </div>
    <div class="social-podcast-card-body">
      <p>Use ${podcasts.length === 1 ? "this podcast" : "these podcasts"} before the lesson questions. Listen for details that help answer the related issue question: <strong>${escapeHtml(config.issueQuestion)}</strong></p>
      <div class="social-podcast-list">
        ${podcasts.map(renderLessonPodcastConnection).join("\n")}
      </div>
    </div>
  </section>`;
}

function injectLessonPodcastConnections(config: IssueConfig, lessons: NextStepShellLesson[], connections: SocialPodcastConnection[]) {
  if (connections.length === 0) return lessons;
  const byLesson = new Map<string, SocialPodcastConnection[]>();
  for (const podcast of connections) {
    if (!podcast.lessonId) continue;
    byLesson.set(podcast.lessonId, [...(byLesson.get(podcast.lessonId) ?? []), podcast]);
  }

  return lessons.map((lesson) => {
    const podcasts = byLesson.get(lesson.id) ?? [];
    if (podcasts.length === 0) return lesson;
    const podcastHtml = renderLessonPodcastConnections(config, lesson, podcasts);
    const html = lesson.html.includes('<section class="social-lesson-embedded-activities"')
      ? lesson.html.replace('<section class="social-lesson-embedded-activities"', `${podcastHtml}\n        <section class="social-lesson-embedded-activities"`)
      : lesson.html.includes('<section class="social-lesson-evidence-note"')
      ? lesson.html.replace('<section class="social-lesson-evidence-note"', `${podcastHtml}\n        <section class="social-lesson-evidence-note"`)
      : `${lesson.html}\n${podcastHtml}`;
    return { ...lesson, html };
  });
}

async function writePodcastMappingReport(projectDir: string, report: SocialPodcastMappingReport) {
  const metaDir = path.join(projectDir, "meta");
  await fs.mkdir(metaDir, { recursive: true });
  await fs.writeFile(path.join(metaDir, "social10-podcast-mapping.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const lines = [
    `# ${report.course} Podcast Mapping`,
    "",
    `- Source: ${report.sourcePath}`,
    `- Parsed podcast entries: ${report.parsed}`,
    `- Placed: ${report.counts.placed}`,
    `- Fallback overview placements: ${report.counts.fallbackOverview}`,
    `- Quarantined: ${report.counts.quarantined}`,
    `- Duplicate suppressed: ${report.counts.duplicateSuppressed}`,
    "",
    "## Records",
    "",
    ...report.records.map((record) => {
      const target = record.lessonTitle ? ` -> ${record.lessonTitle}` : "";
      return `- ${record.status.toUpperCase()}: ${record.title}${target} (${record.reason})`;
    })
  ];
  await fs.writeFile(path.join(metaDir, "social10-podcast-mapping.md"), `${lines.join("\n")}\n`, "utf8");
}

function getLibraryDocuments(resources: ImportedResource[]): LibraryDocument[] {
  return resources
    .filter((resource) => canPreview(fileExtension(resource.href)))
    .map((resource, index) => ({
      ...resource,
      id: `library-doc-${index + 1}`,
      extension: fileExtension(resource.href),
      categoryLabel: libraryCategoryLabel(resource.category)
    }));
}

function renderLibraryDocumentPreview(document: LibraryDocument) {
  const extension = fileExtension(document.href);
  const previewHref = document.previewHref ?? (canPreview(extension) ? document.href : "");
  if (!previewHref) {
    return `<div class="social-library-file-placeholder">
      <strong>Preview opens in a separate file.</strong>
      <p>This support document is a ${escapeHtml(extension.replace(/^\./, "").toUpperCase() || "file")} file. Use Open or Download when you are ready to view it.</p>
    </div>`;
  }
  return `<iframe class="social-library-document-frame" src="${escapeHtml(previewHref)}" title="${escapeHtml(cleanResourceTitle(document.title, document.sourcePath))}"></iframe>`;
}

function renderLibrary(config: IssueConfig, resources: ImportedResource[]) {
  const docs = getLibraryDocuments(resources);
  const firstDocument = docs[0];
  const categoryChips = Array.from(new Set(docs.map((document) => document.categoryLabel)));
  if (!firstDocument) {
    return `<section id="library" class="course-page" hidden>
      <p class="course-kicker">Course library</p>
      <h2>Library</h2>
      <p class="page-intro">No previewable local documents were recovered for ${escapeHtml(config.title)}.</p>
    </section>`;
  }
  return `<section id="library" class="course-page" hidden>
    <p class="course-kicker">Course library</p>
    <h2>Library</h2>
    <p class="page-intro">Open local documents while building evidence for ${escapeHtml(config.issueQuestion)}</p>
    <div class="social-library-browser">
      <aside class="social-library-list-panel" aria-label="Library documents">
        <span class="social-resource-label">Course Library</span>
        <h3>${docs.length} issue documents</h3>
        <p>Choose a document connected to this related issue.</p>
        <div class="social-library-chip-row">
          ${categoryChips.map((label) => `<span>${escapeHtml(label)}</span>`).join("\n")}
        </div>
        <div class="social-library-doc-list">
          ${docs
            .map(
              (document, index) => `<button class="social-library-doc-tab${document.id === firstDocument.id ? " active" : ""}" type="button" data-library-doc-target="${escapeHtml(document.id)}" aria-pressed="${document.id === firstDocument.id ? "true" : "false"}">
                <span class="social-library-doc-index">${String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>${escapeHtml(cleanResourceTitle(document.title, document.sourcePath))}</strong>
                  <small>${escapeHtml(resourceSourceLabel(document))}</small>
                </span>
              </button>`
            )
            .join("\n")}
        </div>
      </aside>
      <div class="social-library-reader-stack">
        ${docs
          .map(
            (document) => `<article class="social-library-reader-panel" data-library-doc-panel="${escapeHtml(document.id)}"${document.id === firstDocument.id ? "" : " hidden"}>
              <div class="social-library-reader-header">
                <div>
                  <span class="social-resource-label">${escapeHtml(document.categoryLabel)}</span>
                  <h3>${escapeHtml(cleanResourceTitle(document.title, document.sourcePath))}</h3>
                  <p>${escapeHtml(resourceDescription(document))}</p>
                  <p class="source-path">${escapeHtml(resourceSourceLabel(document))}</p>
                </div>
                <div class="social-library-actions">
                  <a href="${escapeHtml(document.previewHref ?? document.href)}" target="_blank" rel="noreferrer">Open</a>
                  <a href="${escapeHtml(document.href)}" download>Download</a>
                </div>
              </div>
              ${renderLibraryDocumentPreview(document)}
            </article>`
          )
          .join("\n")}
      </div>
    </div>
  </section>`;
}

function youtubeVideoId(href: string) {
  try {
    const url = new URL(decodeEntities(href).replace(/&amp;/g, "&"));
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0];
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com") {
      return url.pathname.match(/\/embed\/([^/?#]+)/)?.[1] ?? url.searchParams.get("v") ?? undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function youtubeEmbedUrl(href: string) {
  const id = youtubeVideoId(href);
  if (!id) return undefined;
  try {
    const url = new URL(decodeEntities(href).replace(/&amp;/g, "&"));
    const start = url.searchParams.get("start");
    const startQuery = start ? `&start=${encodeURIComponent(start)}` : "";
    return `https://www.youtube.com/embed/${id}?rel=0${startQuery}`;
  } catch {
    return `https://www.youtube.com/embed/${id}?rel=0`;
  }
}

function mediaKindForHref(href: string, tagName?: string): SocialMediaItem["kind"] {
  const extension = fileExtension(href);
  if ([".mp3", ".m4a", ".wav", ".ogg"].includes(extension)) return "audio";
  if ([".mp4", ".m4v", ".mov", ".webm"].includes(extension)) return "video";
  if (tagName === "iframe" || youtubeEmbedUrl(href)) return "iframe";
  return "link";
}

function isMediaHref(href: string) {
  return Boolean(youtubeEmbedUrl(href) || [".mp3", ".m4a", ".wav", ".ogg", ".mp4", ".m4v", ".mov", ".webm"].includes(fileExtension(href)));
}

function mediaIdentityForHref(href: string) {
  return youtubeEmbedUrl(href) ?? withoutQuery(decodeEntities(href).replace(/&amp;/g, "&"));
}

function mediaSourceHref(href: string) {
  try {
    const url = new URL(decodeEntities(href).replace(/&amp;/g, "&"));
    const host = url.hostname.replace(/^www\./, "");
    const youtubeEmbedMatch = url.pathname.match(/^\/embed\/([^/?#]+)/);
    if ((host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com") && youtubeEmbedMatch?.[1]) {
      return `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeEmbedMatch[1])}`;
    }
  } catch {
    // Local media paths and malformed external links should continue to use the original href.
  }
  return href;
}

function looksLikeMediaIdentifier(value: string) {
  return /^[A-Za-z0-9_-]{8,16}$/.test(value.replace(/\s+/g, ""));
}

function mediaTitleOverrideFromHref(href: string) {
  const youtubeId = youtubeVideoId(href);
  if (youtubeId && SOCIAL10_YOUTUBE_TITLE_OVERRIDES[youtubeId]) {
    return SOCIAL10_YOUTUBE_TITLE_OVERRIDES[youtubeId];
  }
  return undefined;
}

function titleFallbackFromHref(href: string, fallback: string) {
  const cleanedHref = withoutQuery(decodeEntities(href).replace(/&amp;/g, "&"));
  try {
    const url = new URL(cleanedHref);
    const slug = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() ?? "");
    if (slug && !/^\d+$/.test(slug) && !looksLikeMediaIdentifier(slug)) {
      return cleanTitle(slug.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "), fallback);
    }
    return fallback;
  } catch {
    const basename = path.posix.basename(cleanedHref, fileExtension(cleanedHref));
    const cleaned = cleanTitle(basename.replace(/-[a-f0-9]{8}$/i, "").replace(/[-_]+/g, " "), "");
    return cleaned && !looksLikeMediaIdentifier(cleaned) ? cleaned : fallback;
  }
}

function isGenericMediaTitle(value: string, lessonTitle = "") {
  const normalized = normalizeForMatch(value);
  const lessonKey = normalizeForMatch(lessonTitle);
  return (
    !normalized ||
    normalized === lessonKey ||
    normalized === "course media" ||
    normalized === "youtube video player" ||
    normalized === "video player" ||
    normalized === "watch" ||
    normalized === "here" ||
    normalized === "click here" ||
    normalized.startsWith("click here ") ||
    normalized === "or click here" ||
    normalized.endsWith(" media")
  );
}

function cleanMediaTitle(value: string, fallback: string) {
  const cleaned = cleanTitle(decodeEntities(value), fallback)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/-[a-f0-9]{8}$/i, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

function mediaTitleForLessonElement(rawTitle: string | undefined, href: string, lessonTitle: string, index: number) {
  const override = mediaTitleOverrideFromHref(href);
  if (override) return cleanMediaTitle(override, override);
  const fallback = `${lessonTitle} video ${index}`;
  const title = cleanMediaTitle(rawTitle ?? "", "");
  if (title && !isGenericMediaTitle(title, lessonTitle) && !looksLikeMediaIdentifier(title)) return title;
  const fromHref = titleFallbackFromHref(href, fallback);
  if (fromHref && !isGenericMediaTitle(fromHref, lessonTitle) && !looksLikeMediaIdentifier(fromHref)) return cleanMediaTitle(fromHref, fallback);
  return cleanMediaTitle(fallback, fallback);
}

function mediaTitleForResource(resource: ImportedResource) {
  const override = mediaTitleOverrideFromHref(resource.href);
  if (override) return cleanMediaTitle(override, override);
  const title = cleanMediaTitle(resource.title, "");
  if (title && !isGenericMediaTitle(title) && !looksLikeMediaIdentifier(title)) return title;
  return titleFallbackFromHref(resource.href || resource.sourcePath, "Course media");
}

function collectMediaItems(lessons: NextStepShellLesson[], resources: ImportedResource[], config: IssueConfig) {
  const items: SocialMediaItem[] = [];
  const seen = new Set<string>();
  const add = (href: string, title: string, sourceLabel: string, groupLabel: string, description: string, tagName?: string) => {
    if (!href || !isMediaHref(href)) return;
    const displayTitle = cleanMediaTitle(title || humanizeTitleFromPath(href), humanizeTitleFromPath(href));
    const mediaIdentity = mediaIdentityForHref(href);
    const titleIdentity = `title:${normalizeForMatch(sourceLabel)}:${normalizeForMatch(displayTitle)}`;
    const titleOnlyIdentity = `title:${normalizeForMatch(displayTitle)}`;
    if (seen.has(mediaIdentity) || seen.has(titleIdentity) || seen.has(titleOnlyIdentity)) return;
    seen.add(mediaIdentity);
    seen.add(titleIdentity);
    seen.add(titleOnlyIdentity);
    const kind = mediaKindForHref(href, tagName);
    items.push({
      id: `media-${items.length + 1}`,
      title: displayTitle,
      sourceLabel,
      groupLabel,
      description,
      watchFor: `Watch for one detail that helps answer: ${config.issueQuestion}`,
      href,
      embedHref: kind === "iframe" ? youtubeEmbedUrl(href) : undefined,
      kind
    });
  };
  for (const lesson of lessons) {
    const $ = load(lesson.html);
    let lessonMediaCount = 0;
    $("iframe, audio, video, source").each((_, element) => {
      const tagName = element.tagName.toLowerCase();
      const href = $(element).attr("src") ?? $(element).find("source").first().attr("src") ?? "";
      if (!href || !isMediaHref(href)) return;
      lessonMediaCount += 1;
      add(
        href,
        mediaTitleForLessonElement($(element).attr("title"), href, lesson.title, lessonMediaCount),
        lesson.title,
        "Lesson media",
        `Connected to ${lesson.title}.`,
        tagName
      );
    });
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href") ?? "";
      if (!href || !isMediaHref(href)) return;
      lessonMediaCount += 1;
      add(
        href,
        mediaTitleForLessonElement(normalizeWhitespace($(element).text()), href, lesson.title, lessonMediaCount),
        lesson.title,
        "Lesson links",
        `Linked from ${lesson.title}.`
      );
    });
  }
  for (const resource of resources) {
    add(resource.href, mediaTitleForResource(resource), libraryCategoryLabel(resource.category), "Course files", resource.description);
  }
  return items;
}

function renderMediaFrame(item: SocialMediaItem) {
  if (item.kind === "iframe" && item.embedHref) {
    return `<iframe class="social-film-room-frame" src="${escapeHtml(item.embedHref)}" title="${escapeHtml(item.title)}" loading="lazy" allowfullscreen></iframe>`;
  }
  if (item.kind === "audio") {
    return `<audio class="social-film-room-frame social-film-room-frame--audio" controls preload="metadata" src="${escapeHtml(item.href)}"></audio>`;
  }
  if (item.kind === "video") {
    return `<video class="social-film-room-frame" controls preload="metadata" src="${escapeHtml(item.href)}"></video>`;
  }
  return `<div class="social-film-room-placeholder">
    <h3>Open this media source</h3>
    <p>This item opens best in its original source.</p>
    <a class="external-resource-action" href="${escapeHtml(mediaSourceHref(item.href))}" target="_blank" rel="noreferrer">Open Source</a>
  </div>`;
}

function renderFilmRoom(config: IssueConfig, lessons: NextStepShellLesson[], resources: ImportedResource[]) {
  const mediaItems = collectMediaItems(lessons, resources, config);
  const firstItem = mediaItems[0];
  if (!firstItem) {
    return `<section id="film-room" class="course-page" hidden>
      <p class="course-kicker">Film room</p>
      <h2>Film Room</h2>
      <p class="page-intro">No dedicated media items were recovered for ${escapeHtml(config.title)}. Use Source Analysis and Library for visual/source work.</p>
      ${renderField(`${config.slug}:film:note`, "Media evidence note", "What visual or source detail from the course would help answer the issue?")}
    </section>`;
  }
  const groups = Array.from(new Map(mediaItems.map((item) => [item.groupLabel, mediaItems.filter((candidate) => candidate.groupLabel === item.groupLabel)])).entries());
  return `<section id="film-room" class="course-page" hidden>
    <p class="course-kicker">Film room</p>
    <h2>Film Room</h2>
    <p class="page-intro">Review media from the issue lessons in one curated playlist. Use the prompts to connect what you watch or hear back to the related issue question.</p>
    <div class="social-film-room-shell">
      <div class="social-film-room-stage">
        ${mediaItems
          .map(
            (item) => `<article class="social-film-panel" data-film-panel="${escapeHtml(item.id)}"${item.id === firstItem.id ? "" : " hidden"}>
              <div class="social-film-room-header">
                <div>
                  <span class="social-resource-label">${escapeHtml(item.sourceLabel)}</span>
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.description)}</p>
                  <p class="social-watch-for"><strong>Watch for:</strong> ${escapeHtml(item.watchFor)}</p>
                </div>
                <a class="external-resource-action" href="${escapeHtml(mediaSourceHref(item.href))}" target="_blank" rel="noreferrer">Open Source</a>
              </div>
              ${renderMediaFrame(item)}
            </article>`
          )
          .join("\n")}
      </div>
      <aside class="social-film-room-sidebar">
        <section class="social-film-room-control">
          <span class="social-resource-label">Media playlist</span>
          <h3>${mediaItems.length} media item${mediaItems.length === 1 ? "" : "s"}</h3>
          <p>Choose a video or audio item to load it in the main player.</p>
          <label class="social-film-room-label">Choose media
            <select class="social-film-room-select" data-film-select>
              ${mediaItems.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join("\n")}
            </select>
          </label>
        </section>
        <section class="social-film-room-playlist" aria-label="Film room playlist order">
          <h3>Playlist order</h3>
          ${groups
            .map(
              ([label, items]) => `<section class="social-film-room-playlist-group">
                <h4>${escapeHtml(label)}</h4>
                <ol>
                  ${items
                    .map(
                      (item) => `<li>
                        <strong>${escapeHtml(item.title)}</strong>
                        <span>${escapeHtml(item.sourceLabel)}</span>
                        <small>${escapeHtml(item.watchFor)}</small>
                      </li>`
                    )
                    .join("\n")}
                </ol>
              </section>`
            )
            .join("\n")}
        </section>
      </aside>
    </div>
  </section>`;
}

function bestLessonEvidence(option: StudyOption, lessons: NextStepShellLesson[]) {
  const optionTokens = tokenize(`${option.title} ${option.prompt} ${option.answer.join(" ")}`);
  const ranked = lessons
    .filter(isStudyLessonCandidate)
    .map((lesson) => {
      const cleanText = studyExtractionText(lesson);
      const text = `${lesson.title} ${lesson.summary} ${cleanText.slice(0, 3000)}`;
      const score = Array.from(tokenize(text)).filter((token) => optionTokens.has(token)).length;
      return { lesson, score, text: cleanText };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);
  const best = ranked[0];
  if (!best) return "";
  const sentence =
    best.text
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map(normalizeWhitespace)
      .find((candidate) => candidate.length >= 55 && candidate.length <= 260 && Array.from(tokenize(candidate)).some((token) => optionTokens.has(token))) ??
    best.lesson.summary;
  return `From the lesson "${best.lesson.title}", connect this idea to: ${cleanStudyEvidenceSentence(sentence, best.lesson.title)}`;
}

function normalizeStudyKey(value: string) {
  return normalizeForMatch(value.replace(/\([^)]*\)/g, " ").replace(/\bNGO\b/i, " ngo "));
}

function studyOptionKey(value: string) {
  const key = normalizeStudyKey(value);
  const synonyms: Record<string, string> = {
    "residential school": "residential schools",
    tariff: "tariffs",
    quota: "quotas",
    reserve: "reserves",
    subsidy: "subsidies",
    shareholder: "shareholders",
    "supply chains": "supply chain",
    "non governmental organization": "non governmental organization ngo"
  };
  return synonyms[key] ?? key;
}

function decodeHtmlText(value: string) {
  return normalizeWhitespace(load(`<div>${value}</div>`).text());
}

function splitHtmlTerms(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|li|td|div|tr)>/gi, "\n")
    .split(/\n+/)
    .map((part) => decodeHtmlText(part))
    .filter(Boolean);
}

function cleanVocabularyTerm(value: string) {
  const cleaned = normalizeWhitespace(cleanLearnerText(value))
    .replace(/^[a-z]\)\s*/i, "")
    .replace(/^\d+[\.)]\s*/, "")
    .replace(/^[-*•]\s*/, "")
    .replace(/\s+$/, "")
    .replace(/\s*[;:,.]$/, "")
    .trim();
  const definitionMatch = cleaned.match(/^([^:]{2,54}):\s+\S/);
  return definitionMatch ? normalizeWhitespace(definitionMatch[1] ?? cleaned) : cleaned;
}

function isVocabularyNoise(value: string) {
  return (
    !value ||
    value.length < 2 ||
    value.length > 86 ||
    /[?]/.test(value) ||
    /\b(?:below are|key vocabulary|key terms|vocabulary|back to top|photo credits|click here|source:|http|www\.)\b/i.test(value)
  );
}

function vocabularyDisplayTitle(term: string) {
  const key = normalizeStudyKey(term);
  const labels: Record<string, string> = {
    "gini index": "GINI index",
    "gdp per capita": "GDP per capita",
    "gross domestic product": "Gross Domestic Product",
    "gross national product": "Gross National Product",
    "human development index": "Human Development Index",
    "non governmental organization": "Non-governmental organization (NGO)",
    "non governmental organization ngo": "Non-governmental organization (NGO)"
  };
  if (labels[key]) return labels[key];
  if (/\bNGO\b/.test(term)) return term.replace(/\bngo\b/gi, "NGO");
  return titleCase(term);
}

function addVocabularyTerm(target: string[], seen: Set<string>, rawTerm: string) {
  const term = cleanVocabularyTerm(rawTerm);
  if (isVocabularyNoise(term)) return;
  const key = studyOptionKey(term);
  if (!key || seen.has(key)) return;
  seen.add(key);
  target.push(vocabularyDisplayTitle(term));
}

function extractVocabularyTermsFromLesson(lesson: NextStepShellLesson) {
  const $ = load(lesson.html);
  const terms: string[] = [];
  const seen = new Set<string>();
  const sections = new Set<ReturnType<typeof $>>();

  $("[id]").each((_, element) => {
    const id = $(element).attr("id") ?? "";
    if (/\bvocab|vocabulary|key-?terms/i.test(id)) sections.add($(element));
  });

  $("h1,h2,h3,h4").each((_, element) => {
    if (/\b(?:vocabulary|key terms)\b/i.test($(element).text())) {
      const parent = $(element).parent();
      if (parent.length) sections.add(parent);
    }
  });

  $("p").each((_, element) => {
    if (/below are the key vocabulary terms/i.test($(element).text())) {
      const parent = $(element).parent();
      if (parent.length) sections.add(parent);
    }
  });

  for (const section of sections) {
    section.find("li").each((_, element) => addVocabularyTerm(terms, seen, $(element).text()));
    section.find("td").each((_, element) => {
      for (const fragment of splitHtmlTerms($(element).html() ?? $(element).text())) {
        addVocabularyTerm(terms, seen, fragment);
      }
    });
    section.find("p").each((_, element) => {
      const html = $(element).html() ?? "";
      for (const fragment of splitHtmlTerms(html)) {
        addVocabularyTerm(terms, seen, fragment);
      }
    });
  }

  return terms;
}

function extractVocabularyTermsFromLessons(lessons: NextStepShellLesson[]) {
  const terms: string[] = [];
  const seen = new Set<string>();
  for (const lesson of lessons) {
    for (const term of extractVocabularyTermsFromLesson(lesson)) {
      const key = studyOptionKey(term);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      terms.push(term);
    }
  }
  return terms;
}

function termSearchVariants(term: string) {
  const clean = normalizeWhitespace(term.replace(/\([^)]*\)/g, " "));
  const variants = new Set([clean, clean.toLowerCase()]);
  if (/world\s*view/i.test(clean)) variants.add("worldview");
  if (/worldview/i.test(clean)) variants.add("world view");
  if (/non[-\s]?governmental organization/i.test(clean) || /\bNGO\b/i.test(term)) {
    variants.add("non-governmental organization");
    variants.add("non governmental organization");
    variants.add("NGO");
  }
  if (/human development index/i.test(clean)) variants.add("HDI");
  if (/gini/i.test(clean)) variants.add("GINI");
  return Array.from(variants).filter((variant) => normalizeWhitespace(variant).length > 1);
}

function findLessonSentenceForTerm(term: string, lessons: NextStepShellLesson[]) {
  const variants = termSearchVariants(term).map((variant) => variant.toLowerCase());
  for (const lesson of lessons.filter(isStudyLessonCandidate)) {
    const text = studyExtractionText(lesson);
    const sentences = text
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
      .map(normalizeWhitespace)
      .filter((sentence) => sentence.length >= 60 && sentence.length <= 320);
    const sentence = sentences.find((candidate) => {
      const lower = candidate.toLowerCase();
      return variants.some((variant) => lower.includes(variant));
    });
    if (sentence) return `From "${lesson.title}": ${cleanStudyEvidenceSentence(sentence, lesson.title)}`;
  }
  return "";
}

function lessonStudyContext(lesson: NextStepShellLesson) {
  const text = studyExtractionText(lesson);
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => cleanStudyEvidenceSentence(sentence, lesson.title))
    .filter(
      (sentence) =>
        sentence.length >= 55 &&
        sentence.length <= 280 &&
        !/\b(?:back to top|saved locally|answer in your own words|lesson evidence|photo credits)\b/i.test(sentence)
    );
  const context = sentences.slice(0, 2).join(" ");
  return context || lesson.summary.replace(/\.\.\.$/, ".");
}

function isStudyLessonCandidate(lesson: NextStepShellLesson) {
  return !/\b(?:unit wrap-up|course summary|issue summary|glossary)\b/i.test(lesson.title);
}

function vocabularyDefinition(term: string) {
  const normalized = normalizeStudyKey(term);
  const optionKey = studyOptionKey(term);
  const raw = normalizeWhitespace(term).toLowerCase();
  return STUDY_VOCABULARY_DEFINITIONS[normalized] ?? STUDY_VOCABULARY_DEFINITIONS[optionKey] ?? STUDY_VOCABULARY_DEFINITIONS[raw];
}

function buildVocabularyStudyOptions(config: IssueConfig, lessons: NextStepShellLesson[]) {
  return extractVocabularyTermsFromLessons(lessons).map((term): StudyOption => {
    const definition = vocabularyDefinition(term);
    const lessonEvidence = findLessonSentenceForTerm(term, lessons);
    return {
      title: term,
      prompt: `What does ${term} mean in ${config.title}?`,
      answer: definition ?? [
        `${term} is one of the recovered unit vocabulary terms for ${config.title}. Use it to explain a specific part of the issue rather than memorizing it as an isolated word.`,
        lessonEvidence || `Connect ${term} to the related issue question: ${config.issueQuestion}`
      ]
    };
  });
}

function buildEventConceptStudyOptions(config: IssueConfig, lessons: NextStepShellLesson[]) {
  return lessons.filter(isStudyLessonCandidate).map((lesson): StudyOption => {
    const context = lessonStudyContext(lesson);
    return {
      title: lesson.title,
      prompt: `What should you remember from ${lesson.title}?`,
      answer: [
        `${lesson.title} is a lesson concept for ${config.title}.`,
        context,
        `Use this lesson as evidence when it helps answer: ${config.issueQuestion}`
      ],
      skipGenericEnrichment: true
    };
  });
}

function buildMainIdeaStudyOptions(config: IssueConfig, lessons: NextStepShellLesson[]) {
  const groups = new Map<string, NextStepShellLesson[]>();
  for (const lesson of lessons.filter(isStudyLessonCandidate)) {
    const group = normalizeWhitespace(lesson.group ?? config.title);
    if (!group || /\b(?:issue overview|issue wrap-up)\b/i.test(group)) continue;
    groups.set(group, [...(groups.get(group) ?? []), lesson]);
  }
  return Array.from(groups.entries()).map(([group, groupLessons]): StudyOption => {
    const lessonTitles = groupLessons.map((lesson) => lesson.title).join(", ");
    const context = groupLessons.map(lessonStudyContext).filter(Boolean).slice(0, 2).join(" ");
    return {
      title: group,
      prompt: `What is the big idea behind ${group}?`,
      answer: [
        `${group} connects these lessons: ${lessonTitles}.`,
        context,
        `Use this main idea to judge the issue question: ${config.issueQuestion}`
      ],
      skipGenericEnrichment: true
    };
  });
}

function mergeStudyOptions(baseOptions: StudyOption[], recoveredOptions: StudyOption[]) {
  const merged: StudyOption[] = [];
  const seen = new Set<string>();
  for (const option of [...baseOptions, ...recoveredOptions]) {
    const key = studyOptionKey(option.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(option);
  }
  return merged;
}

function enrichStudyOptions(config: IssueConfig, lessons: NextStepShellLesson[]) {
  const vocabulary = mergeStudyOptions(config.vocabulary, buildVocabularyStudyOptions(config, lessons));
  const events = mergeStudyOptions(config.events, buildEventConceptStudyOptions(config, lessons));
  const mainIdeas = mergeStudyOptions(config.mainIdeas, buildMainIdeaStudyOptions(config, lessons));
  const enrich = (option: StudyOption): StudyOption => {
    if (option.skipGenericEnrichment) return option;
    const evidence = bestLessonEvidence(option, lessons);
    return {
      ...option,
      answer: [
        ...option.answer,
        evidence || `From ${config.title}, connect this answer to a named lesson detail rather than leaving it as a memorized definition.`,
        `For the related issue, use this idea to judge: ${config.issueQuestion}`,
        "For writing, name the concept, attach it to a specific example, and explain why it strengthens or complicates your position."
      ]
    };
  };
  return {
    ...config,
    vocabulary: vocabulary.map(enrich),
    events: events.map(enrich),
    mainIdeas: mainIdeas.map(enrich)
  };
}

function renderField(id: string, label: string, placeholder: string, extraAttrs = "") {
  return `<label class="social-workbook-response">
    <span>${escapeHtml(label)}</span>
    <textarea data-response-id="${escapeHtml(id)}" ${extraAttrs} placeholder="${escapeHtml(placeholder)}"></textarea>
  </label>`;
}

function renderEssayBuilderField(id: string, title: string, cue: string, placeholder: string) {
  return `<label class="social-essay-builder-row">
    <span class="social-essay-builder-title">${escapeHtml(title)}</span>
    <span class="social-essay-builder-cue">${escapeHtml(cue)}</span>
    <textarea data-response-id="${escapeHtml(id)}" placeholder="${escapeHtml(placeholder)}"></textarea>
  </label>`;
}

function renderActivityActions({ saveToEvidence = false }: { saveToEvidence?: boolean } = {}) {
  return `<div class="social-print-actions">
    ${saveToEvidence ? `<button class="external-resource-action" type="button" data-save-evidence-note>Save to Evidence Bank</button>` : ""}
    <button class="external-resource-action" type="button" data-print-writing>Print / PDF</button>
    <span class="save-status" data-save-status>Saved locally</span>
  </div>`;
}

function supportConfig(kind: SupportKind, config: IssueConfig) {
  if (kind === "source-analysis") {
    return {
      title: "Source analysis supports",
      copy: "Use these course documents when reading images, political cartoons, excerpts, and source-response tasks.",
      learnTitle: "What this support helps with",
      learn: [
        "Separate observation from interpretation before writing.",
        "Use one exact image detail, caption, phrase, statistic, or symbol as proof.",
        `Connect the source message back to the issue question: ${config.issueQuestion}`
      ],
      activityTitle: "Apply the support to your source response",
      activityCopy: "Choose one source-analysis support, borrow one useful move, and use it to improve your response.",
      prompts: [
        {
          label: "Source-reading move",
          placeholder: "What checklist item, image-reading move, or cartoon-analysis strategy will you use?"
        },
        {
          label: "Source detail",
          placeholder: "Which visible detail, phrase, statistic, or symbol will become your proof?"
        },
        {
          label: "Revision to try",
          placeholder: "Write one improved source-analysis sentence."
        }
      ] satisfies SupportPrompt[]
    };
  }
  if (kind === "position") {
    return {
      title: "Position writing supports",
      copy: "Use these course documents while shaping a defensible position, choosing proof, and writing with enough detail.",
      learnTitle: "What this support helps with",
      learn: [
        "Turn a first opinion into a qualified claim.",
        "Use precise examples and supporting evidence instead of broad statements.",
        "Return each paragraph to the issue question so the argument does not drift."
      ],
      activityTitle: "Apply the support to your position",
      activityCopy: "Choose one writing support, borrow one useful move, and use it to strengthen your plan.",
      prompts: [
        {
          label: "Writing move",
          placeholder: "What advice about evidence, stamina, revision, or explanation will you use?"
        },
        {
          label: "Paragraph to improve",
          placeholder: "Which claim, proof paragraph, counterargument, or conclusion needs that move?"
        },
        {
          label: "Revision to try",
          placeholder: "Write one improved thesis, topic sentence, or explanation sentence."
        }
      ] satisfies SupportPrompt[]
    };
  }
  return {
    title: "Inquiry and evidence supports",
    copy: "Use these course documents while unpacking the issue and deciding what kind of proof would make an answer defensible.",
    learnTitle: "What this support helps with",
    learn: [
      "Move from first reaction to an evidence-ready question.",
      "Name the kinds of details that could prove or challenge your early position.",
      `Connect each support move back to the issue question: ${config.issueQuestion}`
    ],
    activityTitle: "Apply the support to your inquiry",
    activityCopy: "Choose one inquiry support, take one useful move from it, and use that move to sharpen the investigation you are building.",
    prompts: [
      {
        label: "Inquiry move",
        placeholder: "What source-reading or evidence-planning move will help you investigate the issue?"
      },
      {
        label: "Evidence clue",
        placeholder: "What detail should you look for next in a lesson, source, or example?"
      },
      {
        label: "Better inquiry question",
        placeholder: "Rewrite your inquiry question so it is more focused and evidence-ready."
      }
    ] satisfies SupportPrompt[]
  };
}

function getSupportDocuments(config: IssueConfig, resources: ImportedResource[], kind: SupportKind) {
  const seenTitles = new Set<string>();
  return resources
    .filter((resource) => {
      return resource.supportKinds?.includes(kind) ?? false;
    })
    .filter((resource) => {
      const key = normalizeForMatch(cleanResourceTitle(resource.title, resource.sourcePath));
      if (!key || seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    })
    .map(
      (resource, index): LibraryDocument => ({
        ...resource,
        id: `${config.slug}-${kind}-support-${index + 1}-${shortHash(resource.href)}`,
        extension: fileExtension(resource.href),
        categoryLabel: libraryCategoryLabel(resource.category)
      })
    );
}

function supportUseCopy(kind: SupportKind) {
  if (kind === "source-analysis") return "Find one move that improves the source response you are building on this page.";
  if (kind === "position") return "Find one move that improves the position plan you are building on this page.";
  return "Find one move that improves the inquiry question you are building on this page.";
}

function renderSupportResources(config: IssueConfig, resources: ImportedResource[], kind: SupportKind) {
  const support = supportConfig(kind, config);
  const matches = getSupportDocuments(config, resources, kind);
  const firstDocument = matches[0];
  if (!firstDocument) return "";
  const supportSelectId = `${config.slug}-${kind}-support-select`;
  return `<section class="social-diploma-panel social-support-doc-panel social-support-reader-panel" aria-labelledby="${escapeHtml(`${config.slug}:${kind}:support-docs`)}">
    <div class="social-support-teaching">
      <div>
        <h4 id="${escapeHtml(`${config.slug}:${kind}:support-docs`)}">${escapeHtml(support.title)}</h4>
        <p>${escapeHtml(support.copy)}</p>
      </div>
      <div>
        <strong>${escapeHtml(support.learnTitle)}</strong>
        <ol>
          ${support.learn.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}
        </ol>
      </div>
    </div>
    <div class="social-library-browser social-support-library-browser" data-library-doc-scope>
      <div class="social-source-field social-support-document-picker">
        <label for="${escapeHtml(supportSelectId)}">Choose a support document</label>
        <select id="${escapeHtml(supportSelectId)}" class="social-support-document-select" data-library-doc-select aria-label="${escapeHtml(`Choose ${support.title} document`)}">
          ${matches
            .map((document, index) => {
              const documentTitle = cleanResourceTitle(document.title, document.sourcePath);
              return `<option value="${escapeHtml(document.id)}"${document.id === firstDocument.id ? " selected" : ""}>${escapeHtml(`${String(index + 1).padStart(2, "0")} | ${documentTitle} | ${resourceSourceLabel(document)}`)}</option>`;
            })
            .join("\n")}
        </select>
        <p>${escapeHtml(`${matches.length} support documents. Choose one, read the relevant page, then apply one move below.`)}</p>
      </div>
      <div class="social-library-reader-stack">
        ${matches
          .map((document) => {
            const documentTitle = cleanResourceTitle(document.title, document.sourcePath);
            return `<article class="social-library-reader-panel" data-library-doc-panel="${escapeHtml(document.id)}"${document.id === firstDocument.id ? "" : " hidden"}>
              <div class="social-library-reader-header">
                <div>
                  <span class="social-resource-label">${escapeHtml(document.categoryLabel)}</span>
                  <h3>${escapeHtml(documentTitle)}</h3>
                  <p>${escapeHtml(resourceDescription(document))}</p>
                  <p class="social-watch-for"><strong>Use it here:</strong> ${escapeHtml(supportUseCopy(kind))}</p>
                </div>
                <div class="social-library-actions">
                  <a href="${escapeHtml(document.previewHref ?? document.href)}" target="_blank" rel="noreferrer">Open</a>
                  <a href="${escapeHtml(document.href)}" download>Download</a>
                </div>
              </div>
              ${renderLibraryDocumentPreview(document)}
            </article>`;
          })
          .join("\n")}
      </div>
    </div>
    <section class="social-support-apply" aria-label="${escapeHtml(`Apply ${support.title}`)}">
      <div>
        <h4>${escapeHtml(support.activityTitle)}</h4>
        <p>${escapeHtml(support.activityCopy)}</p>
      </div>
      <section class="social-three-column">
        ${support.prompts
          .map((prompt, index) =>
            renderField(`${config.slug}:inquiry:support:${index + 1}`, prompt.label, prompt.placeholder)
          )
          .join("\n")}
      </section>
    </section>
  </section>`;
}

function renderIssueInquiry(config: IssueConfig, resources: ImportedResource[]) {
  const inquiryMoves = [
    {
      title: "Unpack the task",
      copy: "Turn the related issue into a yes, no, or to-what-extent question before choosing evidence."
    },
    {
      title: "Define the terms",
      copy: "Clarify the key concept, group, event, policy, or vocabulary that the question depends on."
    },
    {
      title: "Name the tension",
      copy: "Show what is in conflict: identity, culture, prosperity, sustainability, citizenship, power, or responsibility."
    },
    {
      title: "Plan the proof",
      copy: "Decide what kind of example would help: source detail, historical case, current issue, image, law, or policy."
    }
  ];
  return `<section id="issue-inquiry" class="course-page social-page" hidden>
    <p class="course-kicker">Issue investigation</p>
    <h2>Issue Inquiry</h2>
    <p class="page-intro">${escapeHtml(config.issueQuestion)}</p>
    <article class="social-document" data-writing-activity-panel>
      <header class="social-document-header">
        <p>Issue inquiry</p>
        <h3>Start with a position</h3>
        <span>Use this page to record your first thinking before you gather evidence across the unit lessons.</span>
      </header>
      <div class="social-document-body">
        <section class="social-diploma-panel" aria-labelledby="${escapeHtml(config.slug)}-inquiry-routine-title">
          <div>
            <h4 id="${escapeHtml(config.slug)}-inquiry-routine-title">Turn the issue into a course investigation</h4>
            <p>Before taking a side, define what the issue is asking and what kind of evidence would make an answer defensible.</p>
          </div>
          <div class="social-diploma-steps social-diploma-steps-four">
            ${inquiryMoves
              .map(
                (move, index) => `<article class="social-diploma-step">
                  <strong>${index + 1}. ${escapeHtml(move.title)}</strong>
                  <span>${escapeHtml(move.copy)}</span>
                </article>`
              )
              .join("\n")}
          </div>
        </section>
        <section class="social-inquiry-field-stack">
          ${renderField(`${config.slug}:inquiry:initial-position`, "What do I think right now?", "Write your first position on the related issue.")}
          ${renderField(`${config.slug}:inquiry:key-terms`, "Terms I need to define", "List important concepts, people, events, places, policies, or vocabulary.")}
          ${renderField(`${config.slug}:inquiry:evidence-needed`, "What evidence would strengthen or challenge my view?", "Name the types of sources, examples, or perspectives you need.")}
          ${renderField(`${config.slug}:inquiry:course-question`, "How this connects to the course issue", `Connect your first thinking to: ${config.issueQuestion}`)}
        </section>
        <section class="social-diploma-panel social-diploma-panel-accent" aria-labelledby="${escapeHtml(config.slug)}-inquiry-positions-title">
          <div>
            <h4 id="${escapeHtml(config.slug)}-inquiry-positions-title">Map the possible positions</h4>
            <p>A stronger answer considers more than one defensible side before deciding where it stands.</p>
          </div>
          <section class="social-inquiry-field-stack">
            ${renderField(`${config.slug}:inquiry:position-embrace`, "Position A", "What would a strong yes or embrace position argue?")}
            ${renderField(`${config.slug}:inquiry:position-qualified`, "Position B", "What would a partly, depends, or balanced position argue?")}
            ${renderField(`${config.slug}:inquiry:position-limit`, "Position C", "What would a no, limit, or reject position argue?")}
          </section>
        </section>
        <section class="social-diploma-panel" aria-labelledby="${escapeHtml(config.slug)}-inquiry-proof-title">
          <div>
            <h4 id="${escapeHtml(config.slug)}-inquiry-proof-title">Set up an evidence hunt</h4>
            <p>Use the lessons, source analysis practice, and evidence bank to find proof that can survive a counterargument.</p>
          </div>
          <section class="social-inquiry-field-stack">
            ${renderField(`${config.slug}:inquiry:proof-example`, "Course example to look for", "A case, source, event, policy, person, or image that could support a position.")}
            ${renderField(`${config.slug}:inquiry:proof-detail`, "Detail that would count as proof", "A quotation, statistic, image detail, decision, consequence, or specific fact.")}
            ${renderField(`${config.slug}:inquiry:opposing-perspective`, "Opposing view to watch for", "What would someone with a different priority or perspective say?")}
          </section>
        </section>
        ${renderSupportResources(config, resources, "inquiry")}
        ${renderField(`${config.slug}:inquiry:next-question`, "Question I still need the course to answer", "Write the question that would help you move from first reaction to defensible judgment.")}
        ${renderActivityActions()}
      </div>
    </article>
  </section>`;
}

function sourcePracticeExcerpt(lesson: NextStepShellLesson) {
  const $ = load(lesson.html);
  $("script, style, textarea, .social-lesson-embedded-activities, .social-lesson-evidence-note, .social-podcast-card").remove();
  const candidates = $("p, li")
    .map((_, element) => normalizeWhitespace(cleanLearnerText($(element).text())))
    .get()
    .filter(
      (text) =>
        text.length >= 90 &&
        text.length <= 640 &&
        !/\b(?:back to top|saved locally|answer in your own words|lesson evidence|photo credits)\b/i.test(text)
    );
  const excerpt = candidates[0] ?? lesson.summary;
  return excerpt.length > 520 ? `${excerpt.slice(0, 517).trim()}...` : excerpt;
}

function imageDimension(value?: string) {
  return Number.parseInt(value ?? "", 10) || 0;
}

function cleanPracticeImageTitle(value: string) {
  return normalizeWhitespace(value)
    .replace(/^\d+px\s+/i, "")
    .replace(/\breanaissance\b/gi, "Renaissance")
    .replace(/\bcamoflauge\b/gi, "camouflage")
    .replace(/\bmcdonalds\b/gi, "McDonald's")
    .replace(/\bJpg\b/g, "")
    .replace(/\bPng\b/g, "")
    .replace(/\bGif\b/g, "");
}

function isUnhelpfulPracticeImageTitle(value: string) {
  const compact = value.replace(/[^a-z0-9]/gi, "");
  if (!compact) return true;
  if (/^(?:image|photo|picture|source|visual|jpg|png|gif)$/i.test(compact)) return true;
  if (/^[a-f0-9]{8,}$/i.test(compact)) return true;
  const letterCount = (compact.match(/[a-z]/gi) ?? []).length;
  const digitCount = (compact.match(/\d/g) ?? []).length;
  return letterCount < 4 || (digitCount >= 6 && digitCount > letterCount * 2);
}

function practiceImageTitle(src: string, alt: string, title: string, lessonTitle: string) {
  const direct = normalizeWhitespace(title || alt);
  if (direct && direct.length <= 64 && !/\b(?:image of|an image of|this image|photo of)\b/i.test(direct)) {
    return cleanPracticeImageTitle(direct);
  }
  const fallback = cleanPracticeImageTitle(humanizeTitleFromPath(src));
  if (isUnhelpfulPracticeImageTitle(fallback)) return `${lessonTitle} visual source`;
  return fallback;
}

function practiceImageCaption(src: string, alt: string, title: string, lessonTitle: string) {
  const caption = normalizeWhitespace(alt || title);
  if (caption) return cleanPracticeImageTitle(caption);
  const fallback = cleanPracticeImageTitle(humanizeTitleFromPath(src));
  if (isUnhelpfulPracticeImageTitle(fallback)) return `Visual source from ${lessonTitle}.`;
  return `${fallback}, from ${lessonTitle}.`;
}

function moduleVisualMetadata(unit: number, fileName: string): ModuleVisualMetadata {
  const metadata = MODULE_VISUAL_METADATA[unit]?.[fileName];
  if (metadata) return metadata;
  return {
    title: `Course visual source ${fileName.replace(/\D+/g, "") || ""}`.trim(),
    caption: "A visual source from the updated course module.",
    priority: 50
  };
}

function findModuleVisualContext(config: IssueConfig, lessons: NextStepShellLesson[], metadata: ModuleVisualMetadata) {
  const lesson = lessons.find((candidate) => metadata.lessonHint?.test(candidate.title)) ?? lessons[0];
  return {
    lessonTitle: lesson?.title ?? config.title,
    excerpt: lesson ? sourcePracticeExcerpt(lesson) : config.overviewIntro
  };
}

async function writeModuleVisualAssets(
  config: IssueConfig,
  docs: ModuleDocument[],
  workspaceDir: string,
  lessons: NextStepShellLesson[]
): Promise<ModuleVisualAsset[]> {
  const assets: ModuleVisualAsset[] = [];
  const issueDocs = docs.filter((doc) => doc.unit === config.issueNumber);
  for (const doc of issueDocs) {
    for (const media of doc.media) {
      const metadata = moduleVisualMetadata(doc.unit, media.fileName);
      const fileName = safeAssetFileName(media.fileName);
      const href = path.posix.join("assets", "module-visuals", `unit-${doc.unit}`, fileName);
      const outputPath = path.join(workspaceDir, href);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, media.buffer);
      const context = findModuleVisualContext(config, lessons, metadata);
      assets.push({
        unit: doc.unit,
        title: metadata.title,
        caption: metadata.caption,
        href,
        prompt: `What does this visual source suggest about ${config.title.toLowerCase()}?`,
        lessonTitle: context.lessonTitle,
        excerpt: context.excerpt,
        priority: metadata.priority ?? 50
      });
    }
  }
  return assets.sort((left, right) => left.priority - right.priority || left.title.localeCompare(right.title));
}

function sourcePracticeVisuals(config: IssueConfig, lessons: NextStepShellLesson[]) {
  const visuals: PracticeSource[] = [];
  for (const lesson of lessons.filter((item) => !/\b(?:glossary|wrap-up|conclusion)\b/i.test(item.title))) {
    const $ = load(lesson.html);
    $("script, style, textarea, .social-lesson-embedded-activities, .social-lesson-evidence-note, .social-podcast-card").remove();
    $("img").each((_, image) => {
      const node = $(image);
      const src = node.attr("src") ?? "";
      if (!src || /\b(?:logo|icon|button|spacer|studyhistory)\b/i.test(src)) return;
      const width = imageDimension(node.attr("width"));
      const height = imageDimension(node.attr("height"));
      if (width && height && Math.max(width, height) < 180) return;
      const alt = normalizeWhitespace(node.attr("alt") ?? "");
      const title = normalizeWhitespace(node.attr("title") ?? "");
      const sourceTitle = practiceImageTitle(src, alt, title, lesson.title);
      visuals.push({
        id: `source-${visuals.length + 1}`,
        title: sourceTitle,
        sourceLabel: "Course image",
        excerpt: sourcePracticeExcerpt(lesson),
        prompt: `What does this image suggest about ${config.title.toLowerCase()}?`,
        lessonTitle: lesson.title,
        imageSrc: src,
        imageAlt: alt || title || sourceTitle,
        imageCaption: practiceImageCaption(src, alt, title, lesson.title)
      });
    });
  }
  return visuals;
}

function modulePracticeVisuals(moduleVisuals: ModuleVisualAsset[]): PracticeSource[] {
  return moduleVisuals.map((visual, index) => ({
    id: `source-module-${index + 1}`,
    title: visual.title,
    sourceLabel: "Course image",
    excerpt: visual.excerpt,
    prompt: visual.prompt,
    lessonTitle: visual.lessonTitle,
    imageSrc: visual.href,
    imageAlt: visual.title,
    imageCaption: visual.caption
  }));
}

function sourcePracticeTextSources(config: IssueConfig, lessons: NextStepShellLesson[]) {
  return lessons
    .filter((lesson) => !/\b(?:glossary|wrap-up|conclusion)\b/i.test(lesson.title))
    .map((lesson, index): PracticeSource => {
      const excerpt = sourcePracticeExcerpt(lesson);
      return {
        id: `source-${index + 1}`,
        title: lesson.title,
        sourceLabel: "Course excerpt",
        excerpt,
        prompt: `What does this excerpt reveal about ${config.title.toLowerCase()}?`,
        lessonTitle: lesson.title
      };
    })
    .filter((source) => source.excerpt.length >= 70);
}

function buildPracticeSources(config: IssueConfig, lessons: NextStepShellLesson[], moduleVisuals: ModuleVisualAsset[] = []) {
  const visualSources = sourcePracticeVisuals(config, lessons);
  const moduleSources = modulePracticeVisuals(moduleVisuals).slice(0, Math.max(0, 6 - visualSources.length));
  const visualLessonTitles = new Set([...visualSources, ...moduleSources].map((source) => source.lessonTitle));
  const textSources = sourcePracticeTextSources(config, lessons).filter((source) => !visualLessonTitles.has(source.lessonTitle));
  const candidates = [...visualSources, ...moduleSources, ...textSources]
    .slice(0, 6)
    .map((source, index) => ({ ...source, id: `source-${index + 1}` }));

  if (candidates.length > 0) return candidates;

  return config.mainIdeas.slice(0, 3).map((idea, index) => ({
    id: `source-${index + 1}`,
    title: idea.title,
    sourceLabel: "Study guide idea",
    excerpt: idea.answer.join(" "),
    prompt: idea.prompt,
    lessonTitle: config.title
  }));
}

function renderPracticeSourceVisual(source: PracticeSource) {
  if (!source.imageSrc) return "";
  return `<figure class="social-selected-source-figure">
    <img src="${escapeHtml(source.imageSrc)}" alt="${escapeHtml(source.imageAlt ?? "")}" loading="lazy">
    <figcaption>${escapeHtml(source.imageCaption ?? source.lessonTitle)}</figcaption>
  </figure>`;
}

function renderSourceAnalysis(
  config: IssueConfig,
  lessons: NextStepShellLesson[],
  moduleVisuals: ModuleVisualAsset[] = [],
  resources: ImportedResource[] = []
) {
  const sources = buildPracticeSources(config, lessons, moduleVisuals);
  const options = sources.map((source) => `<option value="${escapeHtml(source.id)}">${escapeHtml(source.title)}</option>`).join("");
  const panels = sources
    .map(
      (source, index) => `<article class="social-practice-selected-source" data-practice-source-panel="${escapeHtml(source.id)}"${index === 0 ? "" : " hidden"}>
        <div class="social-selected-source-copy">
          <p>Practice Source ${String.fromCharCode(65 + index)} | ${escapeHtml(source.sourceLabel)}</p>
          <h3>${escapeHtml(source.title)}</h3>
          <span>${escapeHtml(source.prompt)}</span>
        </div>
        ${renderPracticeSourceVisual(source)}
        <blockquote class="social-selected-source-excerpt">${escapeHtml(source.excerpt)}</blockquote>
        <p class="social-selected-source-context">Source context: ${escapeHtml(source.lessonTitle)}</p>
      </article>`
    )
    .join("\n");

  return `<section id="source-analysis" class="course-page social-page" hidden>
    <p class="course-kicker">Source response practice</p>
    <h2>Source Analysis</h2>
    <p class="page-intro">Use this routine for excerpts, images, charts, quotations, maps, and case studies from the Social 10-1 lessons.</p>
    <article class="social-document" data-writing-activity-panel data-evidence-notebook-panel>
      <header class="social-document-header">
        <p>Source response</p>
        <h3>Source Response Routine</h3>
        <span>${escapeHtml(config.issueQuestion)}</span>
      </header>
      <div class="social-document-body">
        <section class="social-source-coach">
          <div>
            <h4>Read the source in five moves</h4>
            <p>Strong responses move from observation to interpretation, then connect that interpretation to the related issue.</p>
          </div>
          <div class="social-source-coach-steps">
            <article class="social-source-step"><strong>1. Notice</strong><span>Name what is literally shown, stated, repeated, or emphasized.</span></article>
            <article class="social-source-step"><strong>2. Decode</strong><span>Turn the source into a message, warning, criticism, defence, or perspective.</span></article>
            <article class="social-source-step"><strong>3. Connect</strong><span>Link the message to globalization, identity, prosperity, historical legacies, or citizenship.</span></article>
            <article class="social-source-step"><strong>4. Judge</strong><span>Check limits: missing context, bias, point of view, purpose, or what the source leaves out.</span></article>
            <article class="social-source-step"><strong>5. Respond</strong><span>Write a clear interpretation, prove it with detail, and return to the issue question.</span></article>
          </div>
        </section>
        <section class="social-practice-gallery" data-practice-source-region>
          <div class="social-section-heading-row">
            <div>
              <h3>Practice with course source material</h3>
              <p>Choose one recovered lesson source. Read for message first, then prove your interpretation with a precise detail.</p>
            </div>
            <label class="social-select-label">
              <span>Choose a practice source</span>
              <select data-practice-source-select data-response-id="${escapeHtml(config.slug)}:source-analysis:selected-source" data-evidence-draft="source">${options}</select>
            </label>
          </div>
          ${panels}
          ${renderField(`${config.slug}:source-analysis:first-interpretation`, "First interpretation", "What is this source saying, and which detail helps you know?", 'data-evidence-draft="detail"')}
        </section>
        <section class="social-source-routine">
          <div>
            <h4>Now analyze your source</h4>
            <p>Answer in order so the final response has message, proof, connection, and judgment.</p>
          </div>
          ${renderField(`${config.slug}:source-analysis:message`, "Message", "What idea, warning, criticism, or defence is the source communicating?", 'data-evidence-draft="concept"')}
          ${renderField(`${config.slug}:source-analysis:detail`, "Visible proof", "Name one precise phrase, image detail, statistic, label, or source feature.")}
          ${renderField(`${config.slug}:source-analysis:connection`, "Connection to the issue", `Explain how the source helps answer: ${config.issueQuestion}`, 'data-evidence-draft="connection"')}
          ${renderField(`${config.slug}:source-analysis:limit`, "Limit or context", "What bias, missing context, point of view, or purpose should be considered?", 'data-evidence-draft="counterpoint"')}
        </section>
        <section class="social-source-format">
          <div>
            <h4>Shape the final paragraph</h4>
            <p>A strong source response interprets the message, proves it with source evidence, connects it to the issue, then adds judgment.</p>
          </div>
          <div class="social-source-format-grid">
            <article class="social-source-format-step"><strong>1. Opening interpretation</strong><span>State the source's message in your own words.</span></article>
            <article class="social-source-format-step"><strong>2. Proof from the source</strong><span>Use one exact phrase, image detail, statistic, label, or choice.</span></article>
            <article class="social-source-format-step"><strong>3. Course connection</strong><span>Link the message to a lesson case, concept, or issue tension.</span></article>
            <article class="social-source-format-step"><strong>4. Judgment</strong><span>Add a limit, bias, consequence, or missing context.</span></article>
          </div>
          <div class="social-source-format-template">
            <strong>Answer pattern</strong>
            <p><span>Interpret:</span> The source suggests that...</p>
            <p><span>Prove:</span> This is shown through...</p>
            <p><span>Connect:</span> This connects to the issue because...</p>
            <p><span>Judge:</span> However, the source may be limited by...</p>
          </div>
          <label class="social-source-format-draft">
            Final formatted response
            <textarea data-response-id="${escapeHtml(`${config.slug}:source-analysis:final-paragraph`)}" placeholder="Write one polished paragraph using the format above."></textarea>
          </label>
        </section>
        ${renderSupportResources(config, resources, "source-analysis")}
        ${renderActivityActions({ saveToEvidence: true })}
      </div>
    </article>
  </section>`;
}

function renderPositionBuilder(config: IssueConfig, resources: ImportedResource[] = []) {
  const rows = [
    ["Paragraph 1: Introduction and thesis", "Set the issue context, name the debate, and finish with a clear position that answers the extent question.", "Context: ... Issue tension: ... Thesis: ..."],
    ["Paragraph 2: First proof paragraph", "Use a point, specific evidence, explanation, and a closing link back to the thesis.", "Point: ... Evidence: ... Explain: ... Link: ..."],
    ["Paragraph 3: Second proof paragraph", "Use a different lesson, source, person, policy, or concept to strengthen or qualify the position.", "Point: ... Evidence: ... Explain: ... Link: ..."],
    ["Paragraph 4: Third proof or counterargument", "Add a further example, address the strongest opposing view, or show a limit to your claim.", "Counterargument or proof: ... Response: ..."],
    ["Paragraph 5: Conclusion and judgment", "Restate the thesis without copying it, return to the issue, and judge why the position matters.", "In conclusion... This matters because..."]
  ];
  return `<section id="position-builder" class="course-page social-page" hidden>
    <p class="course-kicker">Position paper planning</p>
    <h2>Position Builder</h2>
    <p class="page-intro">Move from evidence to a defensible position. Keep the claim specific, arguable, and connected to the issue.</p>
    <article class="social-document" data-writing-activity-panel data-evidence-notebook-panel>
      <header class="social-document-header">
        <p>Position paper</p>
        <h3>Build a Position Paper Path</h3>
        <span>${escapeHtml(config.issueQuestion)}</span>
      </header>
      <div class="social-document-body social-sequence">
        <section class="social-diploma-panel">
          <div>
            <h4>Build the position in five moves</h4>
            <p>Use this routine to move from a simple opinion to a Social Studies argument with qualification, proof, and judgment.</p>
          </div>
          <div class="social-diploma-steps">
            <article class="social-diploma-step"><strong>1. Answer the extent</strong><span>Say how far you agree, not just whether you agree.</span></article>
            <article class="social-diploma-step"><strong>2. Qualify the claim</strong><span>Use when, if, unless, because, or however to make the position precise.</span></article>
            <article class="social-diploma-step"><strong>3. Select proof</strong><span>Choose examples that show a pattern, not disconnected facts.</span></article>
            <article class="social-diploma-step"><strong>4. Handle the other side</strong><span>Acknowledge a real counterargument and explain why your position still holds.</span></article>
            <article class="social-diploma-step"><strong>5. Judge significance</strong><span>End with why the issue matters for identity, legacies, prosperity, or citizenship.</span></article>
          </div>
        </section>
        ${renderField(`${config.slug}:position:claim`, "Working position", "To what extent? Start with a clear, defensible answer.", 'data-evidence-draft="concept"')}
        ${renderField(`${config.slug}:position:why`, "Why this position is defensible", "Explain the reasoning behind the position before adding examples.", 'data-evidence-draft="connection"')}
        <section class="social-diploma-panel social-diploma-panel-accent">
          <div>
            <h4>Choose proof that can carry paragraphs</h4>
            <p>Each body paragraph needs a point, a specific example, and an explanation of how that example proves the position.</p>
          </div>
          <section class="social-three-column">
            ${renderField(`${config.slug}:position:evidence-1`, "Evidence 1", "Source, lesson, person, event, policy, or historical example.", 'data-evidence-draft="source"')}
            ${renderField(`${config.slug}:position:evidence-2`, "Evidence 2", "A second piece of evidence that supports or complicates the position.", 'data-evidence-draft="detail"')}
            ${renderField(`${config.slug}:position:evidence-3`, "Evidence 3", "A final example or counterpoint to address.", 'data-evidence-draft="counterpoint"')}
          </section>
        </section>
        <section class="social-diploma-panel">
          <div>
            <h4>Test the position against another view</h4>
            <p>Strong writing shows that the writer understands the best opposing argument.</p>
          </div>
          <section class="social-three-column">
            ${renderField(`${config.slug}:position:counterargument`, "Best counterargument", "What would a thoughtful person on the other side argue?")}
            ${renderField(`${config.slug}:position:response`, "Response to the counterargument", "Why is your position still stronger, more practical, or better supported?")}
            ${renderField(`${config.slug}:position:limit`, "Limit or condition", "When might your position need to be limited, qualified, or adjusted?")}
          </section>
        </section>
        <section class="social-diploma-panel">
          <div>
            <h4>Plan the five-paragraph position paper</h4>
            <p>Use the structure as a planning scaffold, then revise so each paragraph connects directly to the related issue.</p>
          </div>
          <section class="social-essay-builder-stack">
            ${rows
              .map(([title, cue, placeholder], index) =>
                renderEssayBuilderField(`${config.slug}:position:paragraph-${index + 1}`, title, cue, placeholder)
              )
              .join("\n")}
          </section>
        </section>
        ${renderSupportResources(config, resources, "position")}
        ${renderField(`${config.slug}:position:thesis`, "Refined thesis", "Turn the position into a polished thesis statement.")}
        ${renderActivityActions({ saveToEvidence: true })}
      </div>
    </article>
  </section>`;
}

function renderEvidenceBank(config: IssueConfig) {
  return `<section id="evidence-bank" class="course-page social-page" hidden>
    <p class="course-kicker">Evidence bank</p>
    <h2>Evidence Bank</h2>
    <p class="page-intro">Save reusable proof notes from lessons, source analysis, podcasts, and your own examples.</p>
    <section class="social-evidence-layout">
      <article class="social-evidence-panel">
        <h3>Lesson evidence</h3>
        <p>Evidence notes saved at the bottom of lessons appear here automatically.</p>
        <div data-lesson-evidence-list></div>
      </article>
      <article class="social-evidence-panel">
        <h3>Saved proof notes</h3>
        <p>Manual notes and source-analysis saves appear here for later writing.</p>
        <div data-manual-evidence-list></div>
      </article>
    </section>
    <article class="social-document" data-writing-activity-panel data-evidence-notebook-panel>
      <header class="social-document-header">
        <p>Evidence notebook</p>
        <h3>Save a Proof Note</h3>
        <span>${escapeHtml(config.issueQuestion)}</span>
      </header>
      <div class="social-document-body">
        <section class="social-evidence-row">
          ${renderField(`${config.slug}:evidence:source`, "Source or example", "Where did the proof come from?", 'data-evidence-draft="source"')}
          ${renderField(`${config.slug}:evidence:concept`, "Concept", "What concept does it prove?", 'data-evidence-draft="concept"')}
        </section>
        ${renderField(`${config.slug}:evidence:detail`, "Evidence", "Name the exact detail, statistic, event, quotation, source feature, or lesson example.", 'data-evidence-draft="detail"')}
        ${renderField(`${config.slug}:evidence:connection`, "Why it matters", "Explain how it helps answer the issue question.", 'data-evidence-draft="connection"')}
        ${renderField(`${config.slug}:evidence:counterpoint`, "Counterpoint or limit", "What could someone challenge or qualify?", 'data-evidence-draft="counterpoint"')}
        ${renderActivityActions({ saveToEvidence: true })}
      </div>
    </article>
  </section>`;
}

function renderStudySelect(slug: string, group: string, title: string, intro: string, options: StudyOption[]) {
  const optionRows = options.map((option, index) => `<option value="${group}-${index + 1}">${escapeHtml(option.title)}</option>`).join("");
  const panels = options
    .map(
      (option, index) => `<article class="social-study-topic-panel" data-study-topic-panel="${escapeHtml(group)}" data-study-topic-id="${group}-${index + 1}"${index === 0 ? "" : " hidden"}>
        <h4>${escapeHtml(option.title)}</h4>
        <p>${escapeHtml(option.prompt)}</p>
        ${renderField(`${slug}:study:${group}:${index + 1}`, "Answer from memory", "Answer from memory before you reveal the unit answer.")}
        <details class="social-study-guide-reveal">
          <summary>Reveal unit answer</summary>
          ${option.answer.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </details>
      </article>`
    )
    .join("\n");
  return `<section class="social-study-guide-panel social-study-guide-selector" data-study-topic-scope>
    <div class="social-study-guide-selector-header">
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(intro)}</p>
      </div>
      <label class="social-study-guide-select-label">
        <span>Choose one</span>
        <select class="social-study-guide-select" data-study-topic-select="${escapeHtml(group)}">${optionRows}</select>
      </label>
    </div>
    ${panels}
  </section>`;
}

function renderStudyGuide(config: IssueConfig) {
  return `<section id="study-guide" class="course-page social-page" hidden data-writing-activity-panel>
    <p class="course-kicker">Study guide</p>
    <h2>Study Guide</h2>
    <p class="page-intro">Review the issue through active recall before shaping a final position.</p>
    <section class="social-study-guide-prep">
      <section class="social-study-guide-panel">
        <h3>Check yourself before opening the guide</h3>
        <p>Answer from memory first, then use the unit answers below to correct or strengthen your response.</p>
        <section class="social-inquiry-field-stack social-study-guide-recall">
          ${renderField(`${config.slug}:study-guide:define`, "Define the issue in plain language", "What is this issue really asking you to judge?")}
          ${renderField(`${config.slug}:study-guide:tension`, "Name the main tension", "What two values, principles, or priorities are pushing against each other?")}
          ${renderField(`${config.slug}:study-guide:proof`, "Choose one detail worth remembering", "What example, source detail, law, policy, person, or event could become useful evidence?")}
        </section>
      </section>
    </section>
    <section class="social-study-guide-practice">
      ${renderStudySelect(config.slug, "vocabulary", "Vocabulary", "Pick a term, answer from memory, then reveal the unit answer to compare.", config.vocabulary)}
      ${renderStudySelect(config.slug, "events", "Events and concepts", "Pick an example, explain what it shows, then reveal the unit answer to compare.", config.events)}
      ${renderStudySelect(config.slug, "main-ideas", "Main ideas", "Choose a main idea from the guide and connect it to writing.", config.mainIdeas)}
    </section>
    ${renderActivityActions()}
  </section>`;
}

function groupResources(resources: ImportedResource[]) {
  const categories: Array<{ id: string; label: string; resources: ImportedResource[] }> = [
    { id: "textbook", label: "Perspectives Textbook", resources: resources.filter((resource) => resource.category === "textbook") },
    { id: "unit", label: "Issue Documents", resources: resources.filter((resource) => resource.category === "unit") },
    { id: "inquiry-supports", label: "Inquiry Supports", resources: resources.filter((resource) => resource.supportKinds?.includes("inquiry")) },
    {
      id: "source-analysis-supports",
      label: "Source Analysis Supports",
      resources: resources.filter((resource) => resource.supportKinds?.includes("source-analysis"))
    },
    {
      id: "position-writing-supports",
      label: "Position Writing Supports",
      resources: resources.filter((resource) => resource.supportKinds?.includes("position"))
    },
    {
      id: "module-sources",
      label: "Module Sources",
      resources: resources.filter((resource) => resource.category === "student" && !(resource.supportKinds?.length ?? 0))
    },
    { id: "media", label: "Media Files", resources: resources.filter((resource) => resource.category === "media") }
  ];
  return categories.filter((category) => category.resources.length > 0);
}

function renderResources(config: IssueConfig, resources: ImportedResource[]) {
  const grouped = groupResources(resources);
  const firstGroup = grouped[0]?.id ?? "textbook";
  return `<section id="resources" class="course-page social-page" hidden>
    <p class="course-kicker">Course resources</p>
    <h2>Resources</h2>
    <p class="page-intro">Textbook chapters, course files, and source links connected to ${escapeHtml(config.title)}.</p>
    <section class="resource-panel">
      <label>Choose a resource group
        <select data-resource-select>
          ${grouped.map((group) => `<option value="${escapeHtml(group.id)}"${group.id === firstGroup ? " selected" : ""}>${escapeHtml(group.label)}</option>`).join("\n")}
        </select>
      </label>
    </section>
    ${grouped
      .map(
        (group) => `<section class="social-resource-panel" data-resource-panel="${escapeHtml(group.id)}"${group.id === firstGroup ? "" : " hidden"}>
          <h3>${escapeHtml(group.label)}</h3>
          <div class="social-resource-grid">
            ${group.resources
              .map(
                (resource) => `<article class="resource-card">
                <p class="social-resource-label">${escapeHtml(resource.category === "media" ? "Media Source" : "Course Source")}</p>
                <h3>${escapeHtml(cleanResourceTitle(resource.title, resource.sourcePath))}</h3>
                <p>${escapeHtml(resourceDescription(resource))}</p>
                <p class="source-path">${escapeHtml(resourceSourceLabel(resource))}</p>
                <a class="external-resource-action" href="${escapeHtml(resource.previewHref ?? resource.href)}" target="_blank" rel="noreferrer">Open Resource</a>
              </article>`
              )
              .join("\n")}
          </div>
        </section>`
      )
      .join("\n")}
  </section>`;
}

function renderNavItems(
  config: IssueConfig,
  lessons: NextStepShellLesson[],
  resources: ImportedResource[],
  moduleVisuals: ModuleVisualAsset[] = []
): NextStepShellNavItem[] {
  return [
    { id: "issue-inquiry", label: "Issue Inquiry", icon: "explore", html: renderIssueInquiry(config, resources) },
    { id: "source-analysis", label: "Source Analysis", icon: "fact_check", html: renderSourceAnalysis(config, lessons, moduleVisuals, resources) },
    { id: "position-builder", label: "Position Builder", icon: "format_list_bulleted_add", html: renderPositionBuilder(config, resources) },
    { id: "evidence-bank", label: "Evidence Bank", icon: "library_books", html: renderEvidenceBank(config) },
    { id: "library", label: "Library", icon: "local_library", html: renderLibrary(config, resources) },
    { id: "film-room", label: "Film Room", icon: "movie", html: renderFilmRoom(config, lessons, resources) },
    { id: "study-guide", label: "Study Guide", icon: "menu_book", html: renderStudyGuide(config) },
    { id: "resources", label: "Resources", icon: "folder", html: renderResources(config, resources) }
  ];
}

function extraCss() {
  return `
:root {
  --ink: #191C1C;
  --primary: #155608;
  --primary-strong: #1E6D0D;
  --surface: #FFFFFF;
  --surface-low: #F9F9F8;
  --surface-soft: #EAF7E6;
  --surface-muted: #DDE2DD;
  --text-muted: #40493B;
}
body {
  background: #F9F9F8;
  color: #191C1C;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.course-topbar,
.course-sidebar {
  background: #155608;
}
.course-topbar {
  border-bottom: 4px solid #59A844;
}
.topbar-menu-toggle,
.sidebar-toggle-button {
  background: #1E6D0D;
  color: #fff;
}
.top-progress-meta,
.top-progress-meta strong,
.sidebar-title,
.sidebar-course-label,
.course-nav-link,
.sublesson-link,
.sublesson-unit-heading {
  color: #fff;
}
.top-progress-fill {
  background: #FDBF3F;
}
.course-nav-link:hover,
.course-nav-link.active {
  background: #EAF7E6;
  color: #155608;
}
.course-nav-link:hover .material-symbols-outlined,
.course-nav-link.active .material-symbols-outlined {
  color: #155608;
}
.sublesson-link:hover,
.sublesson-link.active {
  color: #FDBF3F;
}
.course-main {
  background: #F9F9F8;
}
.course-frame {
  width: min(1540px, calc(100vw - 300px));
}
body.sidebar-collapsed .course-frame {
  width: min(1540px, calc(100vw - 128px));
}
.resource-panel,
.social-document,
.social-source-format,
.social-evidence-notebook,
.social-study-guide-panel,
.social-library-list-panel,
.social-library-reader-panel,
.social-film-panel,
.social-film-room-control,
.social-film-room-playlist {
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #fff;
}
.resource-panel {
  max-width: 520px;
  margin: 24px 0 16px;
  padding: 18px 20px;
}
.resource-panel label,
.social-film-room-label,
.social-study-guide-select-label,
.social-workbook-response {
  display: grid;
  gap: 10px;
  color: var(--primary);
  font-weight: 800;
}
.resource-panel select,
.social-film-room-select,
.social-study-guide-select {
  min-height: 48px;
  border: 1px solid #CFD8CC;
  border-radius: 8px;
  padding: 0 14px;
  background: #fff;
  color: var(--ink);
  font-weight: 800;
}
.social-resource-panel[hidden],
.social-film-panel[hidden],
.social-library-reader-panel[hidden],
.social-study-topic-panel[hidden] {
  display: none !important;
}
.social-resource-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.resource-card {
  display: grid;
  gap: 10px;
  align-content: start;
  min-height: 176px;
  padding: 20px;
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #fff;
  color: #191C1C;
  text-decoration: none;
}
.resource-card h3,
.social-study-guide-panel h3,
.social-document h3,
.social-source-format h3 {
  margin: 0;
  color: var(--ink);
}
.resource-card p,
.social-document p,
.social-source-format p,
.social-study-guide-panel p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.45;
}
.social-resource-label {
  display: block;
  color: var(--primary);
  font-weight: 800;
  font-size: .8rem;
  margin-bottom: 6px;
}
.source-path {
  color: var(--text-muted);
  margin: 6px 0 0;
}
.social-document,
.social-source-format,
.social-evidence-notebook,
.social-study-guide-panel {
  display: grid;
  gap: 18px;
  padding: 24px;
  margin: 0 0 24px;
}
.social-inquiry-field-stack {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.social-inquiry-field-stack > label,
.social-study-topic-panel {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border: 1px solid #DDE2DD;
  border-left: 5px solid #155608;
  border-radius: 8px;
  background: #fff;
}
.social-workbook-response textarea,
.social-embedded-activity textarea {
  width: 100%;
  min-height: 128px;
  resize: vertical;
  border: 1px solid #d7ded4;
  border-radius: 8px;
  padding: 16px;
  color: var(--ink);
  background: #fff;
}
.social-source-format-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.social-source-format-grid article {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid #DDE2DD;
  border-left: 4px solid #155608;
  background: #F9F9F8;
}
.social-source-format-grid strong {
  color: #155608;
}
.social-source-format-grid span {
  color: #40493B;
  line-height: 1.45;
}
.social-print-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  padding-top: 6px;
}
.social-imported-lesson img {
  max-width: 100%;
  height: auto;
}
.social-imported-table {
  max-width: 100%;
  border-collapse: collapse;
}
.social-imported-table td,
.social-imported-table th {
  border: 1px solid #dfe5dd;
  padding: 8px;
}
.social-recovered-source-link {
  display: inline-block;
  margin: 6px 10px 6px 0;
  color: #155608;
  font-weight: 800;
}
.social-podcast-card {
  display: grid;
  gap: 18px;
  margin-top: 28px;
  padding: 24px;
  border: 1px solid #DDE2DD;
  border-left: 7px solid #1E6D0D;
  border-radius: 8px;
  background: #fff;
}
.social-podcast-card-heading {
  display: grid;
  gap: 6px;
}
.social-podcast-card-heading span {
  color: #155608;
  font-size: .82rem;
  font-weight: 800;
}
.social-podcast-card-heading h2 {
  margin: 0;
  color: #191C1C;
  font-size: 28px;
  line-height: 1.1;
}
.social-podcast-card-body {
  display: grid;
  gap: 14px;
}
.social-podcast-card-body p {
  margin: 0;
  color: #40493B;
}
.social-podcast-list {
  display: grid;
  gap: 16px;
}
.social-podcast-item {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #FFFFFF;
}
.social-podcast-item-copy {
  display: grid;
  gap: 8px;
}
.social-podcast-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 16px;
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #FFFFFF;
  color: #155608;
  text-decoration: none;
}
.social-podcast-item strong,
.social-podcast-link strong {
  color: #155608;
  font-weight: 900;
}
.social-podcast-item p {
  margin: 0;
  color: #40493B;
}
.social-podcast-link span {
  color: #40493B;
  font-weight: 800;
  white-space: nowrap;
}
.social-podcast-source-link {
  width: fit-content;
  color: #155608;
  font-weight: 900;
}
.social-podcast-link:hover,
.social-podcast-link:focus-visible {
  border-color: #1E6D0D;
  background: #EAF7E6;
}
.social-podcast-source-link:hover,
.social-podcast-source-link:focus-visible {
  color: #1E6D0D;
  text-decoration-thickness: 2px;
}
.social-podcast-embed {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: clamp(260px, 34vw, 520px);
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #191C1C;
}
.social-lesson-evidence-note {
  margin-top: 28px;
  padding: 18px;
  border-left: 5px solid var(--primary);
  background: #f8f9fa;
}
.social-lesson-embedded-activities {
  display: grid;
  gap: 18px;
  margin-top: 28px;
  padding: 24px;
  border: 1px solid #DDE2DD;
  border-left: 7px solid #1E6D0D;
  border-radius: 8px;
  background: #fff;
}
.social-embedded-activity-lede {
  max-width: 860px;
}
.social-embedded-activity-lede span {
  margin: 0 0 6px;
  color: #155608;
  font-size: .82rem;
  font-weight: 800;
}
.social-embedded-activity-lede h2 {
  margin: 0 0 8px;
  color: #191C1C;
  font-size: 28px;
  line-height: 1.1;
}
.social-embedded-activity-lede p {
  margin: 0;
  color: #40493B;
}
.social-embedded-activity-list {
  display: grid;
  gap: 14px;
}
.social-embedded-activity {
  display: grid;
  gap: 14px;
  padding: 16px 0 0 16px;
  border-top: 1px solid #DDE2DD;
  border-left: 4px solid #155608;
}
.social-embedded-activity:first-child {
  padding-top: 0;
  border-top: 0;
}
.social-embedded-activity--source {
  border-left-color: #1E6D0D;
}
.social-embedded-activity--position {
  border-left-color: #FDBF3F;
}
.social-embedded-context {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid #DDE2DD;
  border-left: 5px solid #FDBF3F;
  border-radius: 8px;
  background: #FFF0CF;
}
.social-embedded-context p {
  margin: 0;
  color: #191C1C;
  line-height: 1.5;
}
.social-embedded-context a {
  color: #155608;
  font-weight: 800;
  overflow-wrap: anywhere;
}
.social-embedded-question-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.social-embedded-question-number,
.social-library-doc-index {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #EAF7E6;
  color: #155608;
  font-weight: 900;
}
.social-embedded-activity-question {
  margin: 0;
  color: #191C1C;
  font-size: 18px;
  line-height: 1.5;
}
.social-library-browser {
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.social-library-list-panel {
  padding: 20px;
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 120px);
  overflow: auto;
}
.social-library-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 16px;
}
.social-library-chip-row span {
  border: 1px solid #cfe0c9;
  border-radius: 8px;
  background: #eef7e9;
  color: var(--primary);
  padding: 5px 10px;
  font-size: .82rem;
  font-weight: 800;
}
.social-library-doc-list {
  display: grid;
  gap: 10px;
}
.social-library-doc-tab {
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 12px;
  width: 100%;
  border: 1px solid #dfe5dd;
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  padding: 12px;
  text-align: left;
  cursor: pointer;
}
.social-library-doc-tab.active,
.social-library-doc-tab:focus-visible {
  border-color: var(--primary);
  background: #eef7e9;
  outline: 2px solid transparent;
}
.social-library-reader-panel {
  overflow: hidden;
}
.social-library-reader-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  padding: 22px 24px;
  border-bottom: 1px solid #dfe5dd;
}
.social-library-actions {
  display: flex;
  gap: 10px;
  align-items: start;
}
.social-library-actions a {
  background: var(--primary);
  color: #fff;
  text-decoration: none;
  font-weight: 800;
  border-radius: 8px;
  padding: 10px 14px;
}
.social-library-document-frame {
  width: 100%;
  min-height: 760px;
  border: 0;
  background: #fff;
}
.social-library-file-placeholder {
  display: grid;
  gap: 8px;
  min-height: 220px;
  align-content: center;
  padding: 24px;
  border-top: 1px solid #DDE2DD;
  background: #F9F9F8;
  color: #40493B;
}
.social-library-file-placeholder strong {
  color: #191C1C;
  font-size: 20px;
}
.social-library-file-placeholder p {
  max-width: 640px;
  margin: 0;
  line-height: 1.5;
}
.social-film-room-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
  gap: 24px;
  align-items: start;
}
.social-film-panel,
.social-film-room-control,
.social-film-room-playlist {
  padding: 20px;
}
.social-film-room-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.social-film-room-header .external-resource-action {
  flex: 0 0 auto;
  white-space: nowrap;
}
.social-watch-for {
  border-left: 4px solid #f3bd32;
  background: #fff7df;
  padding: 12px 14px;
}
.social-film-room-frame {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1px solid #dfe5dd;
  border-radius: 8px;
  background: #111;
}
.social-film-room-frame--audio {
  aspect-ratio: auto;
  min-height: 54px;
  background: #fff;
}
.social-film-room-sidebar {
  display: grid;
  gap: 16px;
}
.social-film-room-playlist ol {
  margin: 0;
  padding-left: 22px;
}
.social-film-room-playlist-group {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}
.social-film-room-playlist strong,
.social-film-room-playlist span,
.social-film-room-playlist small {
  display: block;
}
.social-study-guide-prep,
.social-study-guide-practice {
  display: grid;
  gap: 18px;
  margin-top: 24px;
}
.social-study-guide-selector-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 360px);
  gap: 18px;
  align-items: end;
}
.social-study-guide-reveal {
  border: 1px solid #E0D5B6;
  border-radius: 8px;
  background: #FFF8E8;
}
.social-study-guide-reveal summary {
  cursor: pointer;
  padding: 12px 14px;
  color: #155608;
  font-weight: 800;
}
.social-study-guide-reveal p {
  margin: 0;
  padding: 0 14px 12px;
}
.social-document-header {
  display: grid;
  gap: 6px;
  padding-bottom: 18px;
  border-bottom: 1px solid #DDE2DD;
}
.social-document-header p {
  margin: 0;
  color: #155608;
  font-size: .82rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.social-document-header h3 {
  margin: 0;
  color: #191C1C;
  font-size: 28px;
  line-height: 1.1;
}
.social-document-header span {
  color: #40493B;
  line-height: 1.5;
}
.social-document-body,
.social-sequence,
.social-source-coach,
.social-source-format,
.social-diploma-panel,
.social-practice-gallery,
.social-source-routine,
.social-essay-builder-stack {
  display: grid;
  gap: 18px;
}
.social-source-coach,
.social-source-format,
.social-diploma-panel,
.social-practice-gallery,
.social-source-routine {
  padding: 22px;
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #fff;
}
.social-source-routine,
.social-diploma-panel-accent {
  border-left: 6px solid #FDBF3F;
  background: #FFF8E8;
}
.social-source-coach h4,
.social-source-format h4,
.social-diploma-panel h4,
.social-practice-gallery h3,
.social-source-routine h4 {
  margin: 0;
  color: #191C1C;
  font-size: 24px;
  line-height: 1.15;
}
.social-source-coach p,
.social-diploma-panel p,
.social-practice-gallery p,
.social-source-routine p,
.social-source-format-template p,
.social-selected-source-context {
  margin: 0;
  color: #40493B;
  line-height: 1.5;
}
.social-section-heading-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 360px);
  gap: 18px;
  align-items: end;
}
.social-select-label {
  display: grid;
  gap: 10px;
  color: #155608;
  font-weight: 900;
}
.social-select-label select {
  min-height: 48px;
  border: 1px solid #CFD8CC;
  border-radius: 8px;
  padding: 0 14px;
  background: #fff;
  color: #191C1C;
  font-weight: 800;
}
.social-source-coach-steps,
.social-diploma-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}
.social-diploma-steps-four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.social-source-step,
.social-diploma-step,
.social-source-format-step {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid #DDE2DD;
  border-left: 4px solid #155608;
  border-radius: 8px;
  background: #F9F9F8;
}
.social-source-step strong,
.social-diploma-step strong,
.social-source-format-step strong {
  color: #155608;
}
.social-source-step span,
.social-diploma-step span,
.social-source-format-step span {
  color: #40493B;
  line-height: 1.45;
}
.social-support-reader-panel {
  gap: 22px;
}
.social-support-teaching {
  display: grid;
  grid-template-columns: minmax(220px, .9fr) minmax(0, 1.1fr);
  gap: 18px;
  align-items: start;
}
.social-support-teaching strong {
  display: block;
  margin-bottom: 8px;
  color: #155608;
  font-size: 15px;
}
.social-support-teaching ol {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 22px;
  color: #40493B;
}
.social-support-teaching li {
  line-height: 1.45;
}
.social-library-browser.social-support-library-browser {
  grid-template-columns: 1fr;
  gap: 18px;
  margin-top: 0;
}
.social-support-library-browser .social-library-reader-stack,
.social-support-library-browser .social-library-reader-panel {
  width: 100%;
  min-width: 0;
}
.social-support-document-picker {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #F9F9F8;
}
.social-support-document-picker label {
  color: #155608;
  font-weight: 900;
}
.social-support-document-picker p {
  margin: 0;
  color: #40493B;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}
.social-support-document-select {
  min-height: 48px;
  width: 100%;
  border: 1px solid #CFD8CC;
  border-radius: 8px;
  padding: 0 14px;
  background: #fff;
  color: #191C1C;
  font-weight: 800;
}
.social-support-library-browser .social-library-document-frame {
  min-height: 680px;
  height: min(76vh, 900px);
}
.social-support-apply {
  display: grid;
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid #DDE2DD;
}
.social-support-apply h4 {
  font-size: 24px;
}
.social-practice-selected-source {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #F9F9F8;
}
.social-practice-selected-source[hidden] {
  display: none !important;
}
.social-selected-source-copy {
  display: grid;
  gap: 6px;
}
.social-selected-source-copy p {
  color: #155608;
  font-size: .82rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.social-selected-source-copy h3 {
  margin: 0;
  color: #191C1C;
  font-size: 24px;
  line-height: 1.15;
}
.social-selected-source-copy span {
  color: #40493B;
  line-height: 1.5;
}
.social-selected-source-figure {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 12px;
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #fff;
}
.social-selected-source-figure img {
  display: block;
  width: 100%;
  max-height: 380px;
  object-fit: contain;
}
.social-selected-source-figure figcaption {
  color: #40493B;
  font-size: .92rem;
  line-height: 1.4;
}
.social-selected-source-excerpt {
  margin: 0;
  padding: 18px 20px;
  border-left: 5px solid #155608;
  background: #fff;
  color: #191C1C;
  line-height: 1.55;
}
.social-source-format-template {
  display: grid;
  gap: 8px;
  padding: 16px;
  border: 1px solid #E0D5B6;
  border-radius: 8px;
  background: #FFF8E8;
}
.social-source-format-template strong,
.social-source-format-template span {
  color: #155608;
  font-weight: 900;
}
.social-source-format-draft {
  display: grid;
  gap: 10px;
  color: #155608;
  font-weight: 900;
}
.social-source-format-draft textarea,
.social-essay-builder-row textarea {
  width: 100%;
  min-height: 140px;
  resize: vertical;
  border: 1px solid #d7ded4;
  border-radius: 8px;
  padding: 16px;
  color: #191C1C;
  background: #fff;
}
.social-three-column,
.social-evidence-row {
  display: grid;
  gap: 14px;
}
.social-three-column {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.social-evidence-row {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.social-essay-builder-row {
  display: grid;
  gap: 8px;
  padding: 16px;
  border: 1px solid #DDE2DD;
  border-left: 5px solid #155608;
  border-radius: 8px;
  background: #fff;
}
.social-essay-builder-title {
  color: #191C1C;
  font-weight: 900;
}
.social-essay-builder-cue {
  color: #40493B;
  line-height: 1.45;
}
.social-evidence-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}
.social-evidence-panel {
  display: grid;
  gap: 14px;
  min-height: 220px;
  padding: 22px;
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #fff;
}
.social-evidence-panel h3 {
  margin: 0;
  color: #191C1C;
}
.social-evidence-panel p {
  margin: 0;
  color: #40493B;
}
.social-lesson-evidence-list,
.social-manual-evidence-list,
.social-evidence-panel [data-lesson-evidence-list],
.social-evidence-panel [data-manual-evidence-list] {
  display: grid;
  gap: 12px;
}
@media (max-width: 900px) {
  .social-source-format-grid,
  .social-section-heading-row,
  .social-source-coach-steps,
  .social-diploma-steps,
  .social-three-column,
  .social-support-teaching,
  .social-evidence-row,
  .social-evidence-layout,
  .social-study-guide-selector-header,
  .social-resource-grid,
  .social-library-browser,
  .social-library-reader-header,
  .social-film-room-shell,
  .social-film-room-header {
    grid-template-columns: 1fr;
  }
  .social-film-room-header {
    flex-direction: column;
  }
  .social-film-room-header .external-resource-action {
    align-self: stretch;
  }
  .social-library-list-panel {
    position: static;
    max-height: none;
  }
}
`;
}

async function writeMappingReport(projectDir: string, report: BuildReport) {
  const metaDir = path.join(projectDir, "meta");
  await fs.mkdir(metaDir, { recursive: true });
  await fs.writeFile(path.join(metaDir, "social10-module-mapping.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const lines = [
    `# ${report.title} Module Mapping`,
    "",
    `- D2L manifest: ${report.d2lManifestTitle}`,
    `- Extracted prompts: ${report.promptCounts.extracted}`,
    `- Placed prompts: ${report.promptCounts.placed}`,
    `- Skipped prompts: ${report.promptCounts.skipped}`,
    `- Quarantined prompts: ${report.promptCounts.quarantined}`,
    `- Missing original visual sources omitted from learner pages: ${report.missingAssetCounts.total}`,
    `- Missing visual sources with recovered descriptions: ${report.missingAssetCounts.withDescription}`,
    "",
    "## DOCX modules parsed",
    "",
    ...report.docxModulesParsed.map((doc) => `- Unit ${doc.unit}: ${doc.title} (${doc.lineCount} text lines, ${doc.mediaCount} embedded media files)`),
    "",
    "## Missing visual sources",
    "",
    ...(report.missingAssets.length
      ? report.missingAssets.map(
          (asset) => `- ${asset.lessonId} ${asset.lessonTitle}: ${asset.fileName} — ${asset.description}`
        )
      : ["- None"]),
    "",
    "## Quarantined or skipped prompts",
    "",
    ...report.records
      .filter((record) => record.status !== "placed")
      .map((record) => `- ${record.status.toUpperCase()}: ${record.prompt} (${record.reason ?? "No reason recorded."})`)
  ];
  await fs.writeFile(path.join(metaDir, "social10-module-mapping.md"), `${lines.join("\n")}\n`, "utf8");
}

async function writeMetadata(
  projectDir: string,
  config: IssueConfig,
  lessonCount: number,
  resources: ImportedResource[],
  report: BuildReport,
  podcastReport: SocialPodcastMappingReport
) {
  const now = new Date().toISOString();
  const metadata = {
    id: config.slug,
    slug: config.slug,
    sourcePath: D2L_SOURCE_PATH,
    supportSourcePath: `${MODULE_SOURCE_PATH} | ${PODCAST_LIST_PATH}`,
    inputKind: "brightspace-zip",
    brightspaceTarget: "workspace",
    previewModes: ["workspace"],
    workspaceEntrypoint: path.join(projectDir, "workspace", "index.html"),
    rawEntrypoint: path.join(projectDir, "raw", "README.md"),
    createdAt: now,
    updatedAt: now,
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: path.join(projectDir, "workspace", "index.html"),
    canonicalSources: [
      path.join(projectDir, "workspace", "index.html"),
      path.join(ROOT, "scripts", "build-social10-related-issues.ts"),
      path.join(ROOT, "scripts", "lib", "nso-podcasts.ts"),
      path.join(ROOT, "scripts", "lib", "next-step-course-shell.ts")
    ],
    generatedOutputs: [],
    regenerateCommand: `npx tsx scripts/build-social10-related-issues.ts --only ${config.slug}`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace+d2l-docx-overlay",
      sourcePath: D2L_SOURCE_PATH,
      importedAt: now,
      notes: `${config.title} generated from the Social Studies 10-1 D2L course export with updated DOCX modules and NSO podcast media layered into lessons.`
    },
    exportTargets: [
      {
        target: "html",
        enabled: true,
        notes: "Standalone workspace preview. SCORM is intentionally out of scope until course workspace approval."
      },
      {
        target: "scorm",
        enabled: false,
        notes: "Deferred until the course workspace is approved."
      }
    ],
    authoringStatus: "active",
    referenceOnly: [D2L_SOURCE_PATH, MODULE_SOURCE_PATH, PODCAST_LIST_PATH, path.join(projectDir, "raw", "README.md")],
    sourceOfTruthNotes:
      "Regenerate this Social Studies 10-1 workspace through scripts/build-social10-related-issues.ts and the shared Next Step shell. Do not hand-patch generated lesson HTML.",
    conversionSummary: {
      relatedIssue: config.title,
      issueQuestion: config.issueQuestion,
      lessonsRecovered: lessonCount,
      resourcesRecovered: resources.length,
      docxPromptsPlaced: report.promptCounts.placed,
      docxPromptsQuarantined: report.promptCounts.quarantined,
      missingOriginalVisualSourcesOmitted: report.missingAssetCounts.total,
      missingVisualSourcesWithRecoveredDescriptions: report.missingAssetCounts.withDescription,
      podcastsPlaced: podcastReport.counts.placed + podcastReport.counts.fallbackOverview,
      podcastFallbackOverview: podcastReport.counts.fallbackOverview,
      styleVariant: "social-10-final-social-30-pattern"
    }
  };
  await fs.mkdir(path.join(projectDir, "meta"), { recursive: true });
  await fs.writeFile(path.join(projectDir, "meta", "project.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  await fs.writeFile(
    path.join(projectDir, "meta", "conversion-notes.md"),
    `# ${config.title} Conversion Notes\n\n- Issue question: ${config.issueQuestion}\n- Lessons recovered: ${lessonCount}\n- Resources recovered: ${resources.length}\n- Podcasts placed: ${podcastReport.counts.placed + podcastReport.counts.fallbackOverview}\n- Missing original visual sources omitted from learner pages: ${report.missingAssetCounts.total}\n- Missing visual sources with recovered descriptions: ${report.missingAssetCounts.withDescription}\n- Builder: scripts/build-social10-related-issues.ts\n- Base source: ${D2L_SOURCE_PATH}\n- Module overlay: ${MODULE_SOURCE_PATH}\n- Podcast source: ${PODCAST_LIST_PATH}\n- SCORM/export package: deferred until workspace approval.\n\nThis workspace is generated from the Social Studies 10-1 D2L course export, with updated module questions and NSO podcast media layered into matching lessons. Source-dependent orphan prompts remain quarantined. Image references absent from the D2L package are omitted from learner pages, with unresolved originals listed in social10-module-mapping.md for source recovery.\n`,
    "utf8"
  );
}

async function buildIssue(
  config: IssueConfig,
  course: D2lCourse,
  d2lBundle: ZipBundle,
  moduleBundle: ZipBundle,
  docs: ModuleDocument[],
  prompts: ModulePrompt[],
  podcastEntries: NsoPodcastEntry[]
) {
  const projectDir = path.join(ROOT, "projects", config.slug);
  const workspaceDir = path.join(projectDir, "workspace");
  const rawDir = path.join(projectDir, "raw");
  const studioEditRebuild = process.argv.includes("--studio-edit");
  await resetGeneratedWorkspace(workspaceDir);
  if (!studioEditRebuild) await fs.mkdir(rawDir, { recursive: true });
  await extractZipToWorkspace(d2lBundle, workspaceDir);
  await extractZipToWorkspace(moduleBundle, workspaceDir);
  await copyBrandAssets(workspaceDir);

  const missingAssets: MissingAssetRecord[] = [];
  const baseLessons = await buildBaseLessons(course, d2lBundle, config, missingAssets);
  const moduleVisuals = await writeModuleVisualAssets(config, docs, workspaceDir, baseLessons);
  const { records, byLesson } = buildPromptMapping(config, baseLessons, prompts);
  const podcastMapping = buildPodcastConnections(config, baseLessons, podcastEntries);
  const lessonsWithActivities = injectLessonPodcastConnections(config, injectLessonActivities(config, baseLessons, byLesson), podcastMapping.connections);
  const enrichedConfig = enrichStudyOptions(config, baseLessons);
  const resources = await collectResources(course, d2lBundle, moduleBundle, docs, config, workspaceDir);
  addPodcastResources(resources, podcastMapping.connections);
  const report: BuildReport = {
    slug: config.slug,
    issueNumber: config.issueNumber,
    title: config.title,
    d2lManifestTitle: course.manifestTitle,
    sourcePaths: [D2L_SOURCE_PATH, MODULE_SOURCE_PATH, PODCAST_LIST_PATH, SOCIAL30_SUPPORT_SOURCE_ROOT],
    docxModulesParsed: docs.map((doc) => ({
      title: doc.title,
      zipPath: doc.zipPath,
      unit: doc.unit,
      lineCount: doc.lineCount,
      mediaCount: doc.mediaCount
    })),
    promptCounts: {
      extracted: prompts.filter((prompt) => prompt.unit === config.issueNumber).length,
      placed: records.filter((record) => record.status === "placed").length,
      skipped: records.filter((record) => record.status === "skipped").length,
      quarantined: records.filter((record) => record.status === "quarantined").length
    },
    missingAssetCounts: {
      total: missingAssets.length,
      withDescription: missingAssets.filter((asset) => !/^This lesson originally included a visual source/i.test(asset.description)).length,
      fallbackOnly: missingAssets.filter((asset) => /^This lesson originally included a visual source/i.test(asset.description)).length
    },
    missingAssets,
    records
  };

  const renderedHtml = renderNextStepCourseShell({
    slug: config.slug,
    courseTitle: config.title,
    courseCode: "Social Studies 10-1",
    overviewIntro: config.overviewIntro,
    outcomes: [
      `I can explain how these lessons connect to ${config.issueQuestion}`,
      "I can analyze sources for perspective, evidence, bias, and assumptions about globalization.",
      "I can collect evidence from lessons and resources to support a defensible position.",
      "I can refine my thinking into a clear Social Studies 10-1 position response."
    ],
    lessons: lessonsWithActivities,
    navItems: renderNavItems(enrichedConfig, lessonsWithActivities, resources, moduleVisuals),
    lessonGroupTitle: config.title,
    lessonSequenceTitle: "Lesson pathway",
    sourceLessonLabel: "course lessons",
    nextAfterLastLesson: { id: "issue-inquiry", label: "Start Issue Inquiry" },
    showLessonCardSummary: false,
    showLessonHeaderSummary: false,
    extraCss: extraCss()
  });

  const html = await applyStoredCourseEdits({ repoRoot: ROOT, projectSlug: config.slug, html: renderedHtml, workspaceDir });
  await fs.writeFile(path.join(workspaceDir, "index.html"), html, "utf8");
  if (!studioEditRebuild) {
    await fs.writeFile(
      path.join(rawDir, "README.md"),
      `# ${config.title}\n\nGenerated from the Social Studies 10-1 D2L export and updated module overlay. Use the workspace HTML as the editable preview source.\n`,
      "utf8"
    );
  }
  await writeMappingReport(projectDir, report);
  await writePodcastMappingReport(projectDir, podcastMapping.report);
  await writeMetadata(projectDir, config, lessonsWithActivities.length, resources, report, podcastMapping.report);
  return report;
}

function selectConfigs() {
  const onlyIndex = process.argv.indexOf("--only");
  const onlyValue = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : "";
  if (!onlyValue) return ISSUE_CONFIGS;
  const selected = ISSUE_CONFIGS.filter((config) => config.slug === onlyValue || String(config.issueNumber) === onlyValue);
  if (selected.length === 0) throw new Error(`No Social 10-1 issue config matched --only ${onlyValue}`);
  return selected;
}

async function main() {
  const d2lBundle = await loadZipBundle("course", D2L_SOURCE_PATH);
  const moduleBundle = await loadZipBundle("modules", MODULE_SOURCE_PATH);
  const course = await parseD2lCourse(d2lBundle);
  const docs = await loadModuleDocuments(moduleBundle);
  if (docs.length !== 4) {
    throw new Error(`Expected 4 updated DOCX modules; parsed ${docs.length}.`);
  }
  const prompts = docs.flatMap((doc) => extractModulePrompts(doc));
  const podcastEntries = await parseNsoPodcastEntries(PODCAST_LIST_PATH, "Social Studies 10");
  const reports: BuildReport[] = [];
  for (const config of selectConfigs()) {
    reports.push(await buildIssue(config, course, d2lBundle, moduleBundle, docs, prompts, podcastEntries));
  }
  const summary = reports
    .map(
      (report) =>
        `${report.slug}: ${report.promptCounts.placed} placed, ${report.promptCounts.skipped} skipped, ${report.promptCounts.quarantined} quarantined from ${report.promptCounts.extracted} extracted`
    )
    .join("\n");
  console.log(`Built Social Studies 10-1 workspaces:\n${summary}`);
}

await main();
