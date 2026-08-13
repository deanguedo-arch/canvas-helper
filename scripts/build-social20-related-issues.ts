import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

import { load } from "cheerio";
import JSZip from "jszip";
import mammoth from "mammoth";

import { decodeBrightspaceHtml } from "./lib/ela-modern-drama.js";
import { parseNsoPodcastEntries, youtubeVideoIdFromHref, type NsoPodcastEntry } from "./lib/nso-podcasts.js";
import { renderNextStepCourseShell, type NextStepShellLesson, type NextStepShellNavItem } from "./lib/next-step-course-shell.js";
import { applyStoredCourseEdits } from "./lib/course-editing/overrides.js";

type ZipBundle = {
  key: string;
  sourcePath: string;
  zip: JSZip;
};

type SourceChoice = {
  title: string;
  kind: string;
  zipKey: string;
  filePath: string;
  prompt: string;
  caption: string;
};

type SupportDoc = {
  title: string;
  type: string;
  zipKey: string;
  filePath: string;
  useItHere: string;
};

type ImportedResource = {
  category: "textbook" | "unit" | "student" | "media";
  title: string;
  href: string;
  previewHref?: string;
  sourcePath: string;
  description: string;
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
};

type LessonWorkbookActivityKind = "concept" | "source" | "position" | "evidence";

type LessonWorkbookPromptCandidate = {
  id: string;
  prompt: string;
  documentTitle: string;
  sourcePath: string;
  kind: LessonWorkbookActivityKind;
  sourceIndex: number;
  issueNumber?: number;
  context?: string;
  matchContext?: string;
};

type IssueConfig = {
  slug: string;
  title: string;
  unitPrefix: string;
  unitZipKey: string;
  issueQuestion: string;
  overviewIntro: string;
  textbookFiles: string[];
  sourceChoices: SourceChoice[];
  vocabulary: StudyOption[];
  events: StudyOption[];
  mainIdeas: StudyOption[];
};

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DOWNLOADS = "/Users/deanguedo/Downloads";
const PODCAST_LIST_PATH = path.join(DOWNLOADS, "NSO SOCIAL STUDIES PODCAST LIST.docx");

const DEFAULT_ZIPS = {
  intro: path.join(DOWNLOADS, "CBE System Social Studies 20-1 (Winter 2020) - 762026 - 1246 PM.zip"),
  unit1: path.join(DOWNLOADS, "CBE System Social Studies 20-1 (Winter 2020) - 762026 - 1247 PM.zip"),
  unit2: path.join(DOWNLOADS, "CBE System Social Studies 20-1 (Winter 2020) - 762026 - 1248 PM.zip"),
  unit3: path.join(DOWNLOADS, "CBE System Social Studies 20-1 (Winter 2020) - 762026 - 1249 PM.zip"),
  unit4: path.join(DOWNLOADS, "CBE System Social Studies 20-1 (Winter 2020) - 762026 - 1250 PM.zip"),
  writing: path.join(DOWNLOADS, "CBE System Social Studies 20-1 (Winter 2020) - 762026 - 1250 PM (1).zip"),
  skills: path.join(DOWNLOADS, "CBE System Social Studies 20-1 (Winter 2020) - 762026 - 1251 PM.zip"),
  textbook: path.join(DOWNLOADS, "CBE System Social Studies 20-1 (Winter 2020) - 762026 - 1252 PM.zip"),
  d2l: path.join(DOWNLOADS, "D2LExport_151229_25-26 _ S1 _ Social Studies 20-1 _ Per 1(A) _ Sec _20267642.zip"),
  questionBooklets: path.join(DOWNLOADS, "drive-download-20260706T205412Z-3-001.zip")
};

const ISSUE_CONFIGS: IssueConfig[] = [
  {
    slug: "social20-1-related-issue-1-option-2",
    title: "Nationalism and Identity",
    unitPrefix: "U1/",
    unitZipKey: "unit1",
    issueQuestion: "To what extent should nation be the foundation of identity?",
    overviewIntro:
      "Build a defensible answer about nation, identity, nationalism, and contending loyalties using the Social 20-1 lessons and course sources.",
    textbookFiles: ["Textbook/ch01.pdf", "Textbook/ch02.pdf", "Chapters.html", "Table of Contents.html"],
    sourceChoices: [
      {
        title: "Related Issue 1 Source I",
        kind: "Course source image",
        zipKey: "d2l",
        filePath: "20-1 RI 1 i.jpg",
        prompt: "What message does this source suggest about nation, identity, and belonging?",
        caption: "Social Studies 20-1 Related Issue 1 source image from the Brightspace package."
      },
      {
        title: "Related Issue 1 Source II",
        kind: "Course source image",
        zipKey: "d2l",
        filePath: "20-1 RI 1 ii.jpg",
        prompt: "How does this source complicate the relationship between personal identity and national identity?",
        caption: "Social Studies 20-1 Related Issue 1 source image from the Brightspace package."
      },
      {
        title: "Related Issue 1 Source III A",
        kind: "Course source image",
        zipKey: "d2l",
        filePath: "20-1 RI 1 iii (a).jpg",
        prompt: "What point of view about nationalism or collective identity is being pushed?",
        caption: "Social Studies 20-1 Related Issue 1 source image from the Brightspace package."
      },
      {
        title: "French Revolution Symbols",
        kind: "Course image",
        zipKey: "unit1",
        filePath: "U1/images/phrygian_cap.jpg",
        prompt: "How can symbols turn a political movement into a shared national identity?",
        caption: "Unit 1 course image connected to nationalism, revolution, and identity."
      }
    ],
    vocabulary: [
      {
        title: "Nation",
        prompt: "Define nation in a way that fits Social 20-1.",
        answer: [
          "A nation is a group of people who feel connected by shared identity, history, culture, language, religion, geography, politics, or collective memory.",
          "For diploma-style writing, the important move is to explain whether that shared identity should guide personal choices, political action, or loyalty to a state."
        ]
      },
      {
        title: "Nationalism",
        prompt: "Explain what nationalism means in this issue.",
        answer: [
          "Nationalism is loyalty to, identification with, or support for a nation. It can unite people through shared purpose, but it can also create tension when national loyalties compete.",
          "A strong position paper judges the extent: nationalism may strengthen identity and belonging, but it can become harmful when it ignores pluralism, minority rights, or non-nationalist loyalties."
        ]
      },
      {
        title: "Contending Loyalties",
        prompt: "Explain why loyalties can contend.",
        answer: [
          "Contending loyalties happen when a person's national loyalty competes with other commitments such as family, religion, language, region, class, ideology, or citizenship.",
          "This is useful evidence because it lets a student argue that nation can shape identity, but it rarely explains the whole person."
        ]
      }
    ],
    events: [
      {
        title: "French Revolution",
        prompt: "Explain why the French Revolution matters to nationalism.",
        answer: [
          "The French Revolution showed how people could replace loyalty to monarchy with loyalty to citizens, symbols, rights, and the nation.",
          "In writing, it can support the idea that nationalism can mobilize people toward political change, but it can also produce conflict when one vision of the nation dominates others."
        ]
      },
      {
        title: "Napoleon",
        prompt: "Explain what Napoleon shows about nationalism.",
        answer: [
          "Napoleon spread revolutionary ideas and French power across Europe, showing how nationalism can be tied to pride, military expansion, and state ambition.",
          "The diploma connection is judgment: nationalism can inspire unity and reform, but it can also become aggressive when national greatness is pursued at others' expense."
        ]
      },
      {
        title: "Tibet",
        prompt: "Explain how Tibet connects to contending national loyalties.",
        answer: [
          "The Tibet case study raises questions about culture, self-determination, sovereignty, and the pressure placed on minority national identities.",
          "It helps students discuss whether national identity should be protected even when it conflicts with a powerful state's political interests."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Nation can shape identity",
        prompt: "Explain how nation can become part of identity.",
        answer: [
          "The unit materials show that nation can be rooted in civic, ethnic, cultural, linguistic, religious, geographic, and historical bonds.",
          "A strong response does not just list these factors; it judges which factors matter most in a given source, example, or position."
        ]
      },
      {
        title: "Nationalism can unite or divide",
        prompt: "Explain why nationalism has both strengths and risks.",
        answer: [
          "Nationalism can create belonging, shared memory, and collective action. It can also exclude people, intensify conflict, or pressure citizens to rank one loyalty above all others.",
          "This gives students room to build a qualified position rather than a simple yes-or-no answer."
        ]
      }
    ]
  },
  {
    slug: "social20-1-related-issue-2-option-2",
    title: "National Interest and Ultranationalism",
    unitPrefix: "U2/",
    unitZipKey: "unit2",
    issueQuestion: "To what extent should national interest be pursued?",
    overviewIntro:
      "Use the national interest, foreign policy, war, genocide, and ultranationalism lessons to judge when pursuing national goals is justified and when it becomes dangerous.",
    textbookFiles: ["Textbook/ch03.pdf", "Textbook/ch04.pdf", "Chapters.html", "Table of Contents.html"],
    sourceChoices: [
      {
        title: "National Interest Dilemma",
        kind: "Political cartoon",
        zipKey: "unit2",
        filePath: "U2/images/dilemna_cartoon.png",
        prompt: "What tension does this source show between national interest and another priority?",
        caption: "Unit 2 course cartoon connected to national interest and decision making."
      },
      {
        title: "Competing Interests",
        kind: "Political cartoon",
        zipKey: "unit2",
        filePath: "U2/images/two_guys_cartoon.png",
        prompt: "How does this source show that national interest can be interpreted from more than one perspective?",
        caption: "Unit 2 course cartoon connected to contending perspectives."
      },
      {
        title: "Appeasement Cartoon",
        kind: "Political cartoon",
        zipKey: "unit2",
        filePath: "U2/images/seuss_cartoon_appeasement.png",
        prompt: "What criticism of appeasement or foreign policy does this cartoon make visible?",
        caption: "Unit 2 course cartoon connected to responses to ultranationalism."
      },
      {
        title: "Nazi Eugenics Poster",
        kind: "Propaganda source",
        zipKey: "unit2",
        filePath: "U2/images/nazi_eugenics_poster.png",
        prompt: "How does propaganda connect ultranationalism to dehumanization and exclusion?",
        caption: "Unit 2 course image connected to ultranationalist propaganda."
      }
    ],
    vocabulary: [
      {
        title: "National Interest",
        prompt: "Define national interest.",
        answer: [
          "National interest means the goals a country pursues to protect or advance its security, economic well-being, values, territory, power, or identity.",
          "The key writing move is to judge extent: national interest may be legitimate, but it needs limits when it threatens human rights, peace, or other nations."
        ]
      },
      {
        title: "Ultranationalism",
        prompt: "Explain ultranationalism.",
        answer: [
          "Ultranationalism is an extreme form of nationalism that places the nation above other groups, rights, or moral limits.",
          "It is powerful evidence against unlimited pursuit of national interest because it shows how national pride can become aggression, scapegoating, or genocide."
        ]
      },
      {
        title: "Foreign Policy",
        prompt: "Explain foreign policy in this issue.",
        answer: [
          "Foreign policy is the set of decisions and actions a state uses in its relationships with other states and international actors.",
          "In Social 20-1, foreign policy is a practical way national interest becomes action: alliance, appeasement, isolationism, interventionism, diplomacy, or war."
        ]
      }
    ],
    events: [
      {
        title: "First World War",
        prompt: "Explain how the First World War connects to national interest.",
        answer: [
          "The First World War shows how imperialism, militarism, alliances, and nationalism can combine into large-scale conflict.",
          "It is useful evidence for arguing that national interest must be weighed against human cost, alliance obligations, and long-term peace."
        ]
      },
      {
        title: "Treaty of Versailles",
        prompt: "Explain why Versailles matters.",
        answer: [
          "The Treaty of Versailles attempted to punish Germany and create peace after the First World War, but it also produced resentment and instability.",
          "Students can use it to show that pursuing one state's national interest or revenge too aggressively can create future conflict."
        ]
      },
      {
        title: "Holocaust",
        prompt: "Explain what the Holocaust reveals about ultranationalism.",
        answer: [
          "The Holocaust reveals the extreme danger of ultranationalism, racism, propaganda, and state power used against targeted groups.",
          "In diploma writing, it supports a clear limit: national interest can never justify dehumanization or genocide."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "National interest needs judgment",
        prompt: "Explain why national interest cannot be automatic.",
        answer: [
          "The unit materials show that countries often pursue security, prosperity, autonomy, and values, but these goals can conflict with peace or human rights.",
          "A defensible position explains when national interest is legitimate and what conditions should limit it."
        ]
      },
      {
        title: "Ultranationalism is a warning",
        prompt: "Explain how ultranationalism functions as a warning.",
        answer: [
          "Ultranationalism warns that national loyalty can become destructive when it treats the nation as superior and removes moral limits.",
          "This makes it strong source-analysis evidence: identify the message, then explain what the source warns about nationalism taken too far."
        ]
      }
    ]
  },
  {
    slug: "social20-1-related-issue-3-option-2",
    title: "Internationalism and Global Responsibility",
    unitPrefix: "U3/",
    unitZipKey: "unit3",
    issueQuestion: "To what extent should internationalism be pursued?",
    overviewIntro:
      "Examine motives, methods, foreign policy, international organizations, and global issues to judge when countries should cooperate beyond their borders.",
    textbookFiles: ["Textbook/ch05.pdf", "Textbook/ch06.pdf", "Chapters.html", "Table of Contents.html"],
    sourceChoices: [
      {
        title: "Related Issue 3 Course Source",
        kind: "Course source image",
        zipKey: "d2l",
        filePath: "20-1 RI 3.jpg",
        prompt: "What message does this source suggest about internationalism or global responsibility?",
        caption: "Social Studies 20-1 Related Issue 3 source image from the Brightspace package."
      },
      {
        title: "Humanitarian Response After Tsunami",
        kind: "Photograph",
        zipKey: "unit3",
        filePath: "U3/images/HM-15_delivers_aid_to_Sumatra_following_the_2004_Tsunami.jpg",
        prompt: "How does this source connect humanitarianism to international responsibility?",
        caption: "Unit 3 course photograph connected to disaster response and humanitarian motives."
      },
      {
        title: "United Nations",
        kind: "Symbol/source image",
        zipKey: "unit3",
        filePath: "U3/images/un.png",
        prompt: "What role does this source suggest international organizations can play?",
        caption: "Unit 3 course image connected to collective security and multilateralism."
      },
      {
        title: "Global Warming",
        kind: "Issue graphic",
        zipKey: "unit3",
        filePath: "U3/images/ms_global_warming.png",
        prompt: "How does this source show a problem that may require international cooperation?",
        caption: "Unit 3 course image connected to global environmental issues."
      }
    ],
    vocabulary: [
      {
        title: "Internationalism",
        prompt: "Define internationalism.",
        answer: [
          "Internationalism is the belief that nations should cooperate to address common needs, security, human rights, economic stability, and global problems.",
          "The issue is not whether cooperation is good in general; it is the extent to which states should commit resources, sovereignty, or policy choices to international action."
        ]
      },
      {
        title: "Multilateralism",
        prompt: "Explain multilateralism.",
        answer: [
          "Multilateralism means several countries working together through agreements, coalitions, or organizations.",
          "It is useful evidence when arguing that global problems often exceed the capacity of one state, but it can be limited by competing national interests."
        ]
      },
      {
        title: "Sovereignty",
        prompt: "Explain sovereignty in internationalism debates.",
        answer: [
          "Sovereignty is the authority of a state to govern itself and make its own decisions.",
          "Internationalism can challenge sovereignty when international agreements or interventions pressure states to act beyond narrow national interest."
        ]
      }
    ],
    events: [
      {
        title: "2004 Indian Ocean Tsunami",
        prompt: "Explain what the tsunami response shows.",
        answer: [
          "The tsunami response shows humanitarian internationalism: states, organizations, and citizens can respond to suffering beyond their borders.",
          "In writing, it supports the argument that internationalism should be pursued when global cooperation can reduce human suffering."
        ]
      },
      {
        title: "Peacekeeping",
        prompt: "Explain peacekeeping as internationalism.",
        answer: [
          "Peacekeeping involves international efforts to monitor conflict, protect civilians, or support stability, often through organizations such as the United Nations.",
          "It helps students judge both promise and limits: peacekeeping can protect people, but it depends on mandates, resources, consent, and political will."
        ]
      },
      {
        title: "Global Environmental Issues",
        prompt: "Explain why environmental issues connect to internationalism.",
        answer: [
          "Environmental issues such as climate change, water access, and pollution cross borders, so one country's actions can affect many others.",
          "This provides strong evidence for international cooperation, while still allowing students to discuss economic cost, sovereignty, and national interest."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Internationalism has motives",
        prompt: "Explain why states pursue internationalism.",
        answer: [
          "The unit materials show humanitarian, economic, security, environmental, and self-determination motives for international action.",
          "A strong answer names the motive and judges whether that motive is strong enough to justify action."
        ]
      },
      {
        title: "Internationalism has methods",
        prompt: "Explain different methods of internationalism.",
        answer: [
          "Internationalism can happen through bilateralism, multilateralism, supranationalism, foreign aid, peacekeeping, treaties, and international organizations.",
          "Source analysis should identify which method is visible and what the source implies about its strengths or limits."
        ]
      }
    ]
  },
  {
    slug: "social20-1-related-issue-4-option-2",
    title: "Canadian National Identity",
    unitPrefix: "U4/",
    unitZipKey: "unit4",
    issueQuestion: "To what extent should individuals and groups in Canada embrace a national identity?",
    overviewIntro:
      "Use Canadian case studies, nationalism, internationalism, pluralism, federalism, multiculturalism, Quebec, and First Nations, Metis, and Inuit perspectives to judge national identity in Canada.",
    textbookFiles: ["Textbook/ch06.pdf", "Chapters.html", "Table of Contents.html"],
    sourceChoices: [
      {
        title: "Multicultural People",
        kind: "Course image",
        zipKey: "unit4",
        filePath: "U4/images/multicultural_people.jpg",
        prompt: "How does this source connect diversity to Canadian national identity?",
        caption: "Unit 4 course image connected to pluralism and Canadian identity."
      },
      {
        title: "Factors of Nation",
        kind: "Course graphic",
        zipKey: "unit4",
        filePath: "U4/images/nationfactors.png",
        prompt: "What factors does this graphic suggest can shape national identity?",
        caption: "Unit 4 course graphic connected to nation-building."
      },
      {
        title: "Visible Minority Growth",
        kind: "Data graphic",
        zipKey: "unit4",
        filePath: "U4/images/statcan_visible_minority_growth_chart.gif",
        prompt: "How does this data complicate a single national identity?",
        caption: "Unit 4 course data graphic connected to demographic change."
      },
      {
        title: "Nunavut",
        kind: "Course image",
        zipKey: "unit4",
        filePath: "U4/images/nunavut.png",
        prompt: "How does this source connect self-determination, identity, and Canada?",
        caption: "Unit 4 course image connected to Indigenous identity and Canadian federalism."
      }
    ],
    vocabulary: [
      {
        title: "Pluralism",
        prompt: "Explain pluralism in Canada.",
        answer: [
          "Pluralism means that different peoples, cultures, identities, and perspectives can coexist within the same political community.",
          "For this issue, pluralism helps students argue that Canadian national identity may need to be flexible rather than uniform."
        ]
      },
      {
        title: "Federalism",
        prompt: "Explain federalism.",
        answer: [
          "Federalism divides powers between national and regional governments, allowing different regions or groups to have some political recognition.",
          "In Canadian identity debates, federalism can help manage diversity, but it can also reveal tensions over Quebec, Indigenous peoples, regionalism, and national unity."
        ]
      },
      {
        title: "Multiculturalism",
        prompt: "Explain multiculturalism.",
        answer: [
          "Multiculturalism recognizes cultural diversity as part of public life rather than treating one culture as the only national model.",
          "A strong answer judges whether multiculturalism strengthens Canadian identity by making it inclusive, or whether it creates tensions over shared values and unity."
        ]
      }
    ],
    events: [
      {
        title: "Confederation",
        prompt: "Explain why Confederation matters.",
        answer: [
          "Confederation created Canada as a political union, shaped by compromise, regional interests, and competing visions of identity.",
          "It is useful evidence because Canadian national identity began as a negotiated project rather than a single simple identity."
        ]
      },
      {
        title: "Official Multiculturalism",
        prompt: "Explain what multiculturalism policy shows.",
        answer: [
          "Official multiculturalism shows that Canada has tried to define national identity partly through recognition of diversity.",
          "In writing, it can support the view that embracing national identity does not require abandoning cultural, linguistic, religious, or regional identities."
        ]
      },
      {
        title: "Nunavut",
        prompt: "Explain how Nunavut connects to identity.",
        answer: [
          "Nunavut reflects Inuit identity, self-determination, land, language, and governance within Canada.",
          "It helps students discuss how groups can embrace Canada while also maintaining distinct national or collective identities."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Canadian identity is contested",
        prompt: "Explain why Canadian identity is not simple.",
        answer: [
          "The unit materials show Canada as multilingual, multicultural, regional, Indigenous, federal, and historically shaped by conflict and compromise.",
          "A strong position should avoid one-size-fits-all claims and explain what kind of national identity is worth embracing."
        ]
      },
      {
        title: "Embracing identity can be conditional",
        prompt: "Explain what a qualified answer might say.",
        answer: [
          "A qualified answer can argue that Canadian national identity should be embraced when it respects pluralism, rights, treaty relationships, and regional difference.",
          "The key diploma move is to state the condition clearly: embrace national identity to the extent that it includes, rather than erases, diverse identities."
        ]
      }
    ]
  }
];

const SUPPORT_DOCS = {
  inquiry: [
    {
      title: "Planning Overview",
      type: "HTML",
      zipKey: "skills",
      filePath: "skillsandstrategies/1planning/1planningoverview.htm",
      useItHere: "Use this to decide what the issue is asking before collecting proof."
    },
    {
      title: "Asking Questions",
      type: "HTML",
      zipKey: "skills",
      filePath: "skillsandstrategies/2retrieving/askingquestions.htm",
      useItHere: "Turn the issue question into smaller research questions."
    },
    {
      title: "Critical Thinking",
      type: "HTML",
      zipKey: "unit1",
      filePath: "U1/U1P03criticalthinking.htm",
      useItHere: "Use this when testing assumptions before choosing a position."
    }
  ],
  source: [
    {
      title: "Supported Opinions",
      type: "HTML",
      zipKey: "writing",
      filePath: "Student Resources/Supported Opinions/supported opinions.htm",
      useItHere: "Use one precise detail from the source to support your interpretation."
    },
    {
      title: "Fact vs Opinion",
      type: "PPTX",
      zipKey: "writing",
      filePath: "Student Resources/Supported Opinions/Fact-vs-Opinion-and-Journalism.pptx",
      useItHere: "Separate what the source shows from the judgment you are making about it."
    }
  ],
  position: [
    {
      title: "Position Paper How-To",
      type: "PDF",
      zipKey: "writing",
      filePath: "Student Resources/Samples of Student Writing/assets/PositionPaperHowTo.pdf",
      useItHere: "Use this to build topic, evidence, commentary, and closing moves."
    },
    {
      title: "Economic Position Paper How-To",
      type: "PDF",
      zipKey: "writing",
      filePath: "Student Resources/Samples of Student Writing/assets/PositionPaperHowToEconomic.pdf",
      useItHere: "Use this to see how a position paper attaches evidence to a clear stance."
    },
    {
      title: "Position Paper Checklist",
      type: "PDF",
      zipKey: "writing",
      filePath: "Student Resources/Samples of Student Writing/assets/S30 Position Paper Checklist 2018.pdf",
      useItHere: "Use this to check thesis, evidence, explanation, and counterargument."
    },
    {
      title: "Ways to Support an Argument",
      type: "PDF",
      zipKey: "writing",
      filePath: "Student Resources/Supported Opinions/waystosupportanargument.pdf",
      useItHere: "Use this to choose proof that does more than repeat your opinion."
    }
  ]
} satisfies Record<string, SupportDoc[]>;

const STUDY_GUIDE_EXTENSIONS = {
  "social20-1-related-issue-1-option-2": {
    vocabulary: [
      {
        title: "Nation",
        prompt: "Explain how a nation is different from a country.",
        answer: [
          "A nation is a group of people who see themselves as connected by shared identity, history, language, culture, ethnicity, religion, territory, or political goals.",
          "A country is a political state with borders and government, while a nation can exist inside a country or across borders."
        ]
      },
      {
        title: "Collective identity",
        prompt: "Explain why collective identity matters to nationalism.",
        answer: [
          "Collective identity is the shared sense of belonging that connects people to a group.",
          "It matters because nationalism often grows when people believe that shared identity should be protected, celebrated, or given political expression."
        ]
      },
      {
        title: "Patriotism",
        prompt: "Explain how patriotism can support or limit nationalism.",
        answer: [
          "Patriotism is love, loyalty, or pride in a country or community.",
          "It can support civic responsibility and unity, but it can become dangerous when pride turns into superiority or rejection of other identities."
        ]
      },
      {
        title: "Civic nationalism",
        prompt: "Explain how civic nationalism defines belonging.",
        answer: [
          "Civic nationalism defines membership through shared citizenship, rights, laws, and political values rather than ancestry alone.",
          "It is useful for judging whether national identity can include people from different cultural, linguistic, religious, and ethnic backgrounds."
        ]
      }
    ],
    events: [
      {
        title: "French Revolution",
        prompt: "Explain why the French Revolution is useful evidence.",
        answer: [
          "The French Revolution shows nationalism linked to popular sovereignty, citizenship, and the belief that political authority should reflect the nation.",
          "It also shows how national ideals can become violent when one version of the nation is enforced against others."
        ]
      },
      {
        title: "Oka Crisis",
        prompt: "Explain what the Oka Crisis shows about identity.",
        answer: [
          "The Oka Crisis shows how land, sovereignty, Indigenous identity, and government authority can collide inside one country.",
          "It is useful evidence because it shows that embracing one national identity cannot erase the rights and identities of other peoples."
        ]
      },
      {
        title: "Quiet Revolution",
        prompt: "Explain why the Quiet Revolution matters to nationalism.",
        answer: [
          "The Quiet Revolution shows how political, social, and cultural change can strengthen a group's sense of national identity.",
          "It is useful evidence because it connects language, culture, state power, and demands for recognition inside Canada."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Nationalism can unite and divide",
        prompt: "Explain the two-sided nature of nationalism.",
        answer: [
          "Nationalism can create solidarity, pride, and a sense of common purpose.",
          "It can also divide people when one national story excludes minorities, Indigenous peoples, regional identities, or political opponents."
        ]
      },
      {
        title: "Identity should be judged by consequences",
        prompt: "Explain how to judge national identity.",
        answer: [
          "A strong response does not simply praise or reject national identity.",
          "It judges whether that identity protects rights, respects pluralism, and allows people to belong without giving up important parts of who they are."
        ]
      }
    ]
  },
  "social20-1-related-issue-2-option-2": {
    vocabulary: [
      {
        title: "Imperialism",
        prompt: "Explain how imperialism connects to national interest.",
        answer: [
          "Imperialism is the extension of power over other peoples or territories for political, economic, military, or cultural gain.",
          "It connects to national interest because states may claim colonies, resources, markets, or prestige as benefits while ignoring the costs imposed on others."
        ]
      },
      {
        title: "Militarism",
        prompt: "Explain why militarism can intensify national interest.",
        answer: [
          "Militarism is the belief that military strength and readiness are central to national power and security.",
          "It can intensify national interest when leaders treat arms, alliances, and military planning as proof of strength instead of asking whether conflict is justified."
        ]
      },
      {
        title: "Self-determination",
        prompt: "Explain why self-determination matters after conflict.",
        answer: [
          "Self-determination is the idea that peoples should have a meaningful say in their own political future.",
          "It matters because peace settlements can fail when they redraw borders or punish enemies without respecting the identities and interests of affected peoples."
        ]
      }
    ],
    events: [
      {
        title: "First World War",
        prompt: "Explain what the First World War shows about national interest.",
        answer: [
          "The First World War shows how alliance commitments, imperial competition, militarism, and nationalism can turn national interests into a wider conflict.",
          "It is strong evidence for arguing that national interest must be limited when it makes war more likely or ignores human costs."
        ]
      },
      {
        title: "Hiroshima and Nagasaki",
        prompt: "Explain why the atomic bombings are important evidence.",
        answer: [
          "The bombings of Hiroshima and Nagasaki show how leaders may justify extreme actions by appealing to military victory, security, or ending a war quickly.",
          "They also force students to judge whether national interest can ever justify massive civilian suffering."
        ]
      },
      {
        title: "League of Nations",
        prompt: "Explain why the League of Nations matters after the First World War.",
        answer: [
          "The League of Nations was created after the First World War to encourage collective security and prevent future wars.",
          "It is useful evidence because its weaknesses show that national interest can undermine international cooperation when states refuse to share risk or authority."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "National interest needs limits",
        prompt: "Explain why national interest should not be automatic.",
        answer: [
          "National interest can protect security, prosperity, and independence, but it can also be used to justify aggression, oppression, or civilian harm.",
          "A defensible answer must explain when national interest is legitimate and when it should be restricted by rights, law, or international responsibility."
        ]
      },
      {
        title: "Ultranationalism dehumanizes",
        prompt: "Explain why ultranationalism is dangerous.",
        answer: [
          "Ultranationalism treats one nation as superior and often portrays outsiders or minorities as threats.",
          "That makes it dangerous because it can normalize propaganda, discrimination, violence, and genocide in the name of national survival or greatness."
        ]
      }
    ]
  },
  "social20-1-related-issue-3-option-2": {
    vocabulary: [
      {
        title: "Unilateralism",
        prompt: "Explain what unilateralism means in foreign policy.",
        answer: [
          "Unilateralism is acting alone or mainly according to one state's own priorities.",
          "It may protect national sovereignty or speed up decisions, but it can weaken cooperation when problems cross borders."
        ]
      },
      {
        title: "Bilateralism",
        prompt: "Explain why bilateralism is useful evidence.",
        answer: [
          "Bilateralism is cooperation between two states or groups.",
          "It is useful because it shows how national interest and internationalism can overlap when two sides negotiate trade, security, migration, or environmental agreements."
        ]
      },
      {
        title: "Multilateralism",
        prompt: "Explain why multilateralism connects to internationalism.",
        answer: [
          "Multilateralism is cooperation among several states or organizations.",
          "It connects to internationalism because global issues such as conflict, climate, health, poverty, and refugees often require shared rules and shared action."
        ]
      },
      {
        title: "Foreign aid",
        prompt: "Explain how foreign aid connects to internationalism.",
        answer: [
          "Foreign aid is assistance provided to another country or population, often through money, food, expertise, medical help, or development support.",
          "It connects to internationalism because it asks whether states should use resources beyond their borders to reduce suffering or support stability."
        ]
      }
    ],
    events: [
      {
        title: "United Nations",
        prompt: "Explain what the United Nations shows about internationalism.",
        answer: [
          "The United Nations shows institutional internationalism: countries create shared forums, rules, and missions to address conflict and human need.",
          "It also shows limits because member states still protect their own interests and may disagree about intervention, funding, or sovereignty."
        ]
      },
      {
        title: "Peacekeeping",
        prompt: "Explain why peacekeeping matters to the issue.",
        answer: [
          "Peacekeeping shows one way states can pursue internationalism by helping monitor conflict, protect civilians, or support stability.",
          "It matters because students can judge whether countries should accept costs and risks for international peace and security."
        ]
      },
      {
        title: "Kyoto Protocol",
        prompt: "Explain why the Kyoto Protocol is useful evidence.",
        answer: [
          "The Kyoto Protocol is useful evidence because climate change requires countries to cooperate beyond national borders.",
          "It also shows the tension between international environmental responsibility and national economic or political interests."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Internationalism balances motives",
        prompt: "Explain why motives matter when pursuing internationalism.",
        answer: [
          "Countries may pursue internationalism for humanitarian, economic, strategic, environmental, or reputational reasons.",
          "A strong answer recognizes that mixed motives do not automatically make cooperation wrong, but they do affect how the action should be judged."
        ]
      },
      {
        title: "Global issues cross borders",
        prompt: "Explain why cross-border issues support internationalism.",
        answer: [
          "Problems such as war, poverty, climate change, disease, refugees, and trade do not stop at national borders.",
          "This supports the argument that internationalism should be pursued when cooperation can solve problems that single states cannot manage alone."
        ]
      }
    ]
  },
  "social20-1-related-issue-4-option-2": {
    vocabulary: [
      {
        title: "Pluralism",
        prompt: "Explain how pluralism connects to Canadian identity.",
        answer: [
          "Pluralism means accepting and supporting the coexistence of different cultures, languages, religions, regions, and perspectives.",
          "It connects to Canadian identity because embracing Canada often means negotiating shared citizenship without erasing distinct identities."
        ]
      },
      {
        title: "Federalism",
        prompt: "Explain why federalism matters to unity.",
        answer: [
          "Federalism divides power between national and provincial or territorial governments.",
          "It matters because Canadian unity often depends on balancing local, regional, Indigenous, provincial, and national priorities."
        ]
      },
      {
        title: "Sovereignty",
        prompt: "Explain why sovereignty is an important term in this issue.",
        answer: [
          "Sovereignty means having authority or self-governing power over political decisions and territory.",
          "It is important because debates about Quebec, Indigenous peoples, and Canada often involve who has authority and how that authority should be recognized."
        ]
      },
      {
        title: "Bilingualism",
        prompt: "Explain how bilingualism connects to Canadian identity.",
        answer: [
          "Bilingualism recognizes English and French as official languages in Canada.",
          "It is useful evidence because it shows how language rights and government policy can be used to include more than one national or cultural identity."
        ]
      }
    ],
    events: [
      {
        title: "Quebec sovereignty movement",
        prompt: "Explain what Quebec sovereignty shows about identity.",
        answer: [
          "The Quebec sovereignty movement shows how language, culture, history, and political power can shape a distinct national identity within Canada.",
          "It is useful evidence because it asks whether Canadian identity should be embraced fully, conditionally, or alongside another national identity."
        ]
      },
      {
        title: "Nunavut",
        prompt: "Explain why Nunavut is useful evidence.",
        answer: [
          "Nunavut shows a political response to Inuit identity, land, culture, and self-determination within Canada.",
          "It supports a nuanced answer because it shows that national identity can be strengthened when distinct peoples gain recognition and governing space."
        ]
      },
      {
        title: "Constitution Act, 1982",
        prompt: "Explain why the Constitution Act, 1982 matters to identity.",
        answer: [
          "The Constitution Act, 1982 patriated Canada's constitution and entrenched the Canadian Charter of Rights and Freedoms.",
          "It matters because constitutional rights and debates about consent, federalism, and recognition shape how people understand Canadian identity."
        ]
      },
      {
        title: "Official Languages Act",
        prompt: "Explain why the Official Languages Act is useful evidence.",
        answer: [
          "The Official Languages Act supports the use and recognition of English and French in federal institutions.",
          "It is useful evidence because it shows Canada trying to build national identity through legal recognition of linguistic duality."
        ]
      }
    ],
    mainIdeas: [
      {
        title: "Canadian identity is plural",
        prompt: "Explain why Canadian identity has many parts.",
        answer: [
          "Canadian identity includes civic, regional, linguistic, cultural, Indigenous, immigrant, and political dimensions.",
          "A strong response explains how these parts can coexist and where they can come into tension."
        ]
      },
      {
        title: "Unity requires recognition",
        prompt: "Explain why recognition matters for embracing identity.",
        answer: [
          "People are more likely to embrace a national identity when it recognizes their history, rights, language, culture, and political voice.",
          "This means unity is stronger when it is built through inclusion and negotiation rather than pressure to assimilate."
        ]
      }
    ]
  }
} satisfies Record<string, Pick<IssueConfig, "vocabulary" | "events" | "mainIdeas">>;

const WORKBOOK_SOURCE_FILES = [
  {
    zipKey: "d2l",
    filePath: "_attachment_dropbox/86/SS 20-1 Unit 1 Written Response.docx",
    title: "Unit 1 Written Response",
    issueNumber: 1
  },
  {
    zipKey: "d2l",
    filePath: "French Revolution Questions.html",
    title: "French Revolution Questions",
    issueNumber: 1
  },
  {
    zipKey: "d2l",
    filePath: "20-1 Unit 1 Vocabulary.html",
    title: "Unit 1 Vocabulary",
    issueNumber: 1
  },
  {
    zipKey: "questionBooklets",
    filePath: "Social Studies 20-1 Assignment Booklet 1A.docx",
    title: "Assignment Booklet 1A",
    issueNumber: 1
  },
  {
    zipKey: "questionBooklets",
    filePath: "Social Studies 20-1 Assignment Booklet 1B.docx",
    title: "Assignment Booklet 1B",
    issueNumber: 1
  },
  {
    zipKey: "d2l",
    filePath: "_attachment_dropbox/87/SS 20-1 Unit 2 Written Response.docx",
    title: "Unit 2 Written Response",
    issueNumber: 2
  },
  {
    zipKey: "d2l",
    filePath: "Content/Genocide Global Issues for Students - Assignment.docx",
    title: "Genocide Global Issues Assignment",
    issueNumber: 2
  },
  {
    zipKey: "d2l",
    filePath: "Related Issue 2 Vocabulary.html",
    title: "Related Issue 2 Vocabulary",
    issueNumber: 2
  },
  {
    zipKey: "questionBooklets",
    filePath: "Social Studies 20-1 Assignment Booklet 2A.docx",
    title: "Assignment Booklet 2A",
    issueNumber: 2
  },
  {
    zipKey: "questionBooklets",
    filePath: "Social Studies 20-1 Assignment Booklet 2B.docx",
    title: "Assignment Booklet 2B",
    issueNumber: 2
  },
  {
    zipKey: "d2l",
    filePath: "_attachment_dropbox/88/SS 20-1 Unit 3 Written Response.docx",
    title: "Unit 3 Written Response",
    issueNumber: 3
  },
  {
    zipKey: "d2l",
    filePath: "Unit 3 Review Worksheet.html",
    title: "Unit 3 Review Worksheet",
    issueNumber: 3
  },
  {
    zipKey: "d2l",
    filePath: "Related Issue 3 Vocabulary.html",
    title: "Related Issue 3 Vocabulary",
    issueNumber: 3
  },
  {
    zipKey: "questionBooklets",
    filePath: "Social Studies 20-1 Assignment Booklet 3A.docx",
    title: "Assignment Booklet 3A",
    issueNumber: 3
  },
  {
    zipKey: "questionBooklets",
    filePath: "Social Studies 20-1 Assignment Booklet 3Bdocx.docx",
    title: "Assignment Booklet 3B",
    issueNumber: 3
  },
  {
    zipKey: "d2l",
    filePath: "SS 20-1 Review Booklet - Copy.html",
    title: "Unit 4 Review Booklet",
    issueNumber: 4
  },
  {
    zipKey: "d2l",
    filePath: "Unit 4 Vocabulary.html",
    title: "Unit 4 Vocabulary",
    issueNumber: 4
  },
  {
    zipKey: "questionBooklets",
    filePath: "Social Studies 20-1 Assignment Booklet 4A.docx",
    title: "Assignment Booklet 4A",
    issueNumber: 4
  },
  {
    zipKey: "questionBooklets",
    filePath: "Social Studies 20-1 Assignment Booklet 4B.docx",
    title: "Assignment Booklet 4B",
    issueNumber: 4
  }
] satisfies Array<{ zipKey: string; filePath: string; title: string; issueNumber: number }>;

const WORKBOOK_ACTIVITY_STOP_WORDS = new Set([
  "about",
  "above",
  "after",
  "again",
  "also",
  "before",
  "between",
  "course",
  "does",
  "from",
  "have",
  "into",
  "issue",
  "lesson",
  "nation",
  "national",
  "pages",
  "related",
  "should",
  "social",
  "source",
  "studies",
  "that",
  "their",
  "there",
  "these",
  "they",
  "this",
  "unit",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
  "your"
]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeWhitespace(value: string) {
  return value.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function shortHash(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 8);
}

function toPosix(value: string) {
  return value.replace(/\\/g, "/");
}

function isExternalUrl(value: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|mailto:|tel:)/i.test(value.trim());
}

function normalizeZipPath(value: string) {
  return toPosix(value).replace(/^\/+/, "").split("/").filter(Boolean).join("/");
}

function safeDecodePath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolveZipRelativePath(entryPath: string, relativeValue: string) {
  if (isExternalUrl(relativeValue)) {
    return relativeValue;
  }

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

function fileBaseTitle(filePath: string) {
  const base = path.posix.basename(filePath).replace(/\.[^.]+$/, "");
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\bU\d+P\d+[a-z]?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(value: string, fallback: string) {
  const title = value
    .replace(/\s+/g, " ")
    .replace(/\|.*$/, "")
    .replace(/^Social Studies 20-1\s*/i, "")
    .trim();
  return title || fallback;
}

function summarizeText(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return "Recovered course reading from the Social 20-1 Brightspace source.";
  return text.length > 170 ? `${text.slice(0, 167).trim()}...` : text;
}

async function loadZipBundle(key: string, sourcePath: string): Promise<ZipBundle> {
  const data = await fs.readFile(sourcePath);
  return {
    key,
    sourcePath,
    zip: await JSZip.loadAsync(data)
  };
}

function zipFile(bundle: ZipBundle, filePath: string) {
  const normalized = normalizeZipPath(filePath);
  return bundle.zip.file(normalized) ?? bundle.zip.file(new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"))[0];
}

async function readZipText(bundle: ZipBundle, filePath: string) {
  const file = zipFile(bundle, filePath);
  if (!file) return "";
  return decodeBrightspaceHtml(await file.async("nodebuffer"));
}

function fileExtension(value: string) {
  const clean = value.split("#")[0]?.split("?")[0] ?? value;
  return path.posix.extname(clean).toLowerCase();
}

function titleCase(value: string) {
  const minor = new Set(["a", "an", "and", "as", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);
  return normalizeWhitespace(value)
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && minor.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

const RESOURCE_TITLE_OVERRIDES: Record<string, string> = {
  "chapters": "Textbook Chapters",
  "table of contents": "Table of Contents",
  "ch01": "Chapter 1",
  "ch02": "Chapter 2",
  "ch03": "Chapter 3",
  "ch04": "Chapter 4",
  "ch05": "Chapter 5",
  "ch06": "Chapter 6",
  "u1p01 intro": "Unit 1 Overview",
  "u2p01 intro": "Unit 2 Overview",
  "u3p01 unit title": "Unit 3 Overview",
  "u4p01a intro": "Unit 4 Overview",
  "positionpaperhowto": "Position Paper How-To",
  "positionpaperhowtoeconomic": "Economic Position Paper How-To",
  "s30 position paper checklist 2018": "Position Paper Checklist",
  "waystosupportanargument": "Ways to Support an Argument",
  "sourceanalysishints 1": "Source Analysis Hints",
  "source analysis template": "Source Analysis Template",
  "diploma exam prep source analysis hints": "Diploma Exam Prep Source Analysis Hints",
  "guide to analyzing sources": "Guide to Analyzing Sources",
  "political cartoons": "Political Cartoons",
  "supported opinions": "Supported Opinions",
  "fact vs opinion and journalism": "Fact vs Opinion and Journalism",
  "student handout finding premises conclusions": "Finding Premises and Conclusions"
};

function humanizeTitleFromPath(filePath: string) {
  const base = path.posix.basename(filePath, fileExtension(filePath));
  const spaced = normalizeWhitespace(
    base
      .replace(/[_-]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\bU\d+P\d+[a-z]?\b/gi, "")
      .replace(/\bss\s*20\s*1\b/gi, "")
      .replace(/\bS30\b/gi, "")
  );
  const key = spaced.toLowerCase();
  return RESOURCE_TITLE_OVERRIDES[key] ?? RESOURCE_TITLE_OVERRIDES[base.toLowerCase()] ?? titleCase(spaced || base);
}

function isGenericHeading(value: string) {
  const normalized = normalizeWhitespace(value).toLowerCase();
  return (
    !normalized ||
    normalized === "social studies 20-1" ||
    normalized === "social studies 20-1 unit 1" ||
    normalized === "social studies 20-1 unit 2" ||
    normalized === "social studies 20-1 unit 3" ||
    normalized === "social studies 20-1 unit 4" ||
    normalized === "required reading" ||
    /^essential questions?:?$/i.test(normalized) ||
    normalized === "journal" ||
    normalized === "enrichment" ||
    normalized.startsWith("multimedia") ||
    normalized === "activity" ||
    normalized === "assignment"
  );
}

function cleanLessonTitle($: ReturnType<typeof load>, filePath: string) {
  const candidates = [
    $("h2").first().text(),
    $("h3").first().text(),
    $("h1").first().text(),
    $("title").first().text(),
    humanizeTitleFromPath(filePath)
  ];
  const title = candidates.map((candidate) => normalizeWhitespace(candidate)).find((candidate) => !isGenericHeading(candidate));
  return normalizeWhitespace(title ?? humanizeTitleFromPath(filePath));
}

function cleanResourceTitle(title: string, fallbackPath: string) {
  const cleaned = normalizeWhitespace(title)
    .replace(/^Social Studies 20-1\s*/i, "")
    .replace(/\s*\|\s*.*$/, "")
    .trim();
  if (/^CBE System Social Studies 20-1\b.*Textbook$/i.test(cleaned)) {
    return humanizeTitleFromPath(fallbackPath);
  }
  if (cleaned && !isGenericHeading(cleaned)) return cleaned;
  return humanizeTitleFromPath(fallbackPath);
}

function supplementalLessonTitle($: ReturnType<typeof load>, filePath: string, baseTitle: string) {
  const weak = /\b(?:big idea|required reading|journal|multimedia|enrichment|essential questions?)\b/i;
  const h3 = normalizeWhitespace($("h3").first().text());
  if (h3 && !isGenericHeading(h3) && !weak.test(h3) && !baseTitle.toLowerCase().includes(h3.toLowerCase())) {
    return h3;
  }
  const fallback = humanizeTitleFromPath(filePath);
  if (fallback && !baseTitle.toLowerCase().includes(fallback.toLowerCase())) {
    return fallback;
  }
  return "";
}

function inferredDuplicateLessonSupplement(baseTitle: string, lessonText: string) {
  if (
    /^Motives for International Involvement$/i.test(baseTitle) &&
    /\bwhat motivates you\?|\bwhat goals do you have\b|\binternational motives\b/i.test(lessonText)
  ) {
    return "Motives and Goals";
  }
  return "";
}

function inferLessonGroup(config: IssueConfig, title: string, filePath: string, index: number) {
  const value = `${title} ${filePath}`.toLowerCase();
  const lessonNumber = index + 1;

  if (config.slug.includes("related-issue-1")) {
    if (lessonNumber <= 2) return "Unit overview";
    if (/(identity|who am i|what is a nation|what is nationalism|nation\?)/i.test(value)) {
      return "Section 1: Nation, nationalism, and identity";
    }
    if (/(ethnicity|language|cultural|religion|geography|patriotic|collective|civic|political)/i.test(value)) {
      return "Section 2: Factors shaping identity";
    }
    if (/(origins|revolution|symbols of france|napoleon)/i.test(value)) {
      return "Section 3: Origins of nationalism";
    }
    return "Section 4: Expressions and loyalties";
  }

  if (config.slug.includes("related-issue-2")) {
    if (lessonNumber <= 8) return "Unit overview and national interest";
    if (/(causes of world war i|imperialism|militarism|alliances|nationalist spark)/i.test(value)) {
      return "Section 1: Causes of the First World War";
    }
    if (/(world war i|world war one|war of attrition|recruitment|conscription|victory and defeat|world war one ends)/i.test(value)) {
      return "Section 2: Nationalism and the First World War";
    }
    if (/(interwar|peace negotiations|peace treaties|league of nations|great depression|german national interests)/i.test(value)) {
      return "Section 3: National interests in the interwar years";
    }
    if (/(ultranationalism|fascism|nazi|appeasement|isolationism|interventionism|neutrality|world war ii summary)/i.test(value)) {
      return "Section 4: Ultranationalism and the Second World War";
    }
    if (/(genocide|holocaust)/i.test(value)) {
      return "Section 5: Ultranationalism and genocide";
    }
    return "Section 6: National self-determination";
  }

  if (config.slug.includes("related-issue-3")) {
    if (lessonNumber <= 5) return "Unit overview and internationalism";
    if (/motives|humanitarian|economic stablity|economic stability|self determination|peace security/i.test(value)) {
      return "Section 1: Motives for international involvement";
    }
    if (/foreign policy|bilateralism|multilateralism|supranationalism|policy goals|policy decisions|foreign policy issues|water/i.test(value)) {
      return "Section 2: Foreign policy choices";
    }
    if (/organization|organisation|united nations|transnational|humanitarian organizations|economic organizations|political organizations|cultural organizations/i.test(value)) {
      return "Section 3: International organizations";
    }
    return "Section 4: Global issues and international efforts";
  }

  if (config.slug.includes("related-issue-4")) {
    if (lessonNumber <= 3) return "Unit overview";
    if (/historical visions|mac donald|sifton|federalism|trudeau|quebec|first nations|metis|historical figure/i.test(value)) {
      return "Section 1: Historical visions of Canadian identity";
    }
    if (/challenges and opportunities/i.test(value)) {
      return "Section 2: Challenges and opportunities for unity";
    }
    return "Section 3: Comparing visions of Canada";
  }

  return config.title;
}

function libraryCategoryLabel(category: ImportedResource["category"]) {
  if (category === "textbook") return "Textbook";
  if (category === "student") return "Student support";
  if (category === "media") return "Media";
  return "Unit file";
}

function resourceDescription(resource: ImportedResource) {
  if (resource.description) return resource.description;
  if (resource.category === "textbook") return "Use this textbook chapter as a core evidence source for the issue.";
  if (resource.category === "student") return "Use this support file for planning, source analysis, writing, or review.";
  if (resource.category === "media") return "Use this media item to connect course ideas to evidence.";
  return "Recovered Social 20-1 unit document connected to this issue.";
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
  const body = sanitizeHtml(raw, filePath, bundle.key, { forPreview: true });
  const previewPath = path.join("assets", "previews", bundle.key, `${normalizeZipPath(filePath).replace(/[^a-z0-9]+/gi, "-")}.html`);
  const fullPath = path.join(workspaceDir, previewPath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, wrapPreviewHtml(title, body), "utf8");
  return previewPath;
}

async function extractZipToWorkspace(bundle: ZipBundle, workspaceDir: string) {
  const outputRoot = path.join(workspaceDir, "assets", "imported", bundle.key);
  await fs.rm(outputRoot, { recursive: true, force: true });

  const files = Object.values(bundle.zip.files).filter((file) => !file.dir);
  for (const file of files) {
    const normalizedPath = normalizeZipPath(file.name);
    const outputPath = path.join(outputRoot, ...normalizedPath.split("/"));
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const content = await file.async("nodebuffer");
    await fs.writeFile(outputPath, content);
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

function hasMeaningfulContentBeforeImportedHeading(contentScope: any, element: any, $: any) {
  const meaningfulElements = contentScope.find("h1,h2,h3,h4,h5,h6,p,li,blockquote,figure,img,table,iframe,video,audio").toArray();
  for (const candidate of meaningfulElements) {
    if (candidate === element) return false;
    if ($(candidate).find(element).length) return false;
    if ($(element).find(candidate).length) continue;
    if ($(candidate).is("img,iframe,video,audio") && ($(candidate).attr("src") || $(candidate).attr("href"))) return true;
    if ($(candidate).is("figure,table")) return true;
    if (normalizeWhitespace($(candidate).text())) return true;
  }
  return false;
}

function removeDuplicateImportedLessonHeading(contentScope: any, lessonTitle: string | undefined, $: any) {
  const target = lessonMergeKey(lessonTitle ?? "");
  if (!target) return;
  const duplicateHeading = contentScope
    .find("h1,h2,h3")
    .filter((_: number, element: any) => lessonMergeKey($(element).text()) === target)
    .first();
  if (!duplicateHeading.length) return;
  if (hasMeaningfulContentBeforeImportedHeading(contentScope, duplicateHeading[0], $)) return;

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

function sanitizeHtml(html: string, entryPath: string, zipKey: string, options: { forPreview?: boolean; lessonTitle?: string } = {}) {
  const $ = load(html);
  $("script, style, meta, title, link").remove();
  $("comment").remove();
  $("*[style]").removeAttr("style");
  $("#header, #footer, #navbar, #navigation, .header, .footer, .navbar, .navigation").remove();
  $("font").each((_, element) => {
    $(element).replaceWith($(element).html() ?? "");
  });

  $("[src]").each((_, element) => {
    const current = $(element).attr("src") ?? "";
    if (!current || isExternalUrl(current)) return;
    $(element).attr("src", workspaceAssetHref(zipKey, resolveZipRelativePath(entryPath, current)));
  });

  $("[href]").each((_, element) => {
    const current = $(element).attr("href") ?? "";
    if (!current || isExternalUrl(current)) return;
    $(element).attr("href", workspaceAssetHref(zipKey, resolveZipRelativePath(entryPath, current)));
  });

  $("table").addClass("social-imported-table");
  $("img").each((_, element) => {
    const alt = $(element).attr("alt")?.trim();
    if (!alt) $(element).attr("alt", "");
  });

  const contentRoot = $("#content").first();
  const body = $("body").first();
  const selectedContentRoot = contentRoot.length ? contentRoot : body.length ? body : $.root();
  removeDuplicateImportedLessonHeading(selectedContentRoot, options.lessonTitle, $);
  const content = contentRoot.length ? contentRoot.html() : body.length ? body.html() : $.root().html();
  const wrapped = `<div class="social-imported-lesson">${content ?? ""}</div>`;
  if (!options.forPreview) {
    return wrapped;
  }
  return wrapped;
}

function issueNumberForConfig(config: IssueConfig) {
  return Number(config.slug.match(/related-issue-(\d+)/)?.[1] ?? 0);
}

function cleanWorkbookPrompt(value: string) {
  return normalizeWhitespace(value)
    .replace(/\b(?:the\s+)?full statement is attached at the back of this module assignment booklet\.?/gi, "")
    .replace(/^\s*(?:[-*•]|\d+[\.)]|[a-z][\.)])\s*/i, "")
    .replace(/^Assignment\s+/i, "")
    .replace(/^Focus Questions?\s*/i, "")
    .replace(/^Understanding the vocabulary:\s*/i, "")
    .replace(/^Step\s+\w+\s*/i, "")
    .replace(/\s+([?.!,;:])/g, "$1");
}

function isUsefulWorkbookPrompt(value: string) {
  const prompt = cleanWorkbookPrompt(value);
  if (prompt.length < 16 || prompt.length > 520) return false;
  if (/^(?:explain your response|explain the following|write out the definitions of the following key terms|define the following key terms|support the breadbasket of europe|the national interests of the afghan people|quebec government)\.?\??$/i.test(prompt)) return false;
  if (/^(?:[a-z]\)|[ivx]+\)|\d+[\.)])?\s*(?:how much do you like pizza|how important to you is it to keep your bedroom|to what extent should teenagers have curfews|what are 10 things you really don.?t want to do|what about you|how it was done|how it is done today|school, clubs|or country|were scores similar|needs)\b/i.test(prompt)) {
    return false;
  }
  if (/click here|senior high school|fort saskatchewan|sherwood park|vegreville|score sheet|criteria score|reminders for writing|evaluated on how effectively|\b\d+(?:\.\d+)?\s*marks?\b/i.test(prompt)) {
    return false;
  }
  if (
    /:$/.test(prompt) ||
    /\b(?:among|how|must|and|or|to|one|the)$/i.test(prompt) ||
    /^(?:describe the evidence|examine each source|examine all three sources|examine the following source|write a response in paragraph form in which you must|write an essay in which you|write an introduction|write a conclusion|plan your essay|organize your essay|proofread)/i.test(prompt)
  ) {
    return false;
  }
  if (/^(?:source|source i+|source \d+|communication|excellent|proficient|satisfactory|limited|poor|insufficient|key terms|define the following key terms)\.?$/i.test(prompt)) {
    return false;
  }
  if (/^[a-z]/.test(prompt) && !/^(?:what|why|how|when|where|who|which)\b/i.test(prompt)) return false;
  if (/^(?:ultranationalism lead to crimes|what happened in \d{4}|whose point of view do you agree with the most|explain what exactly you agree with|what do you feel when you look at the photograph|what might be written on (?:their placards|the lanterns)|what were american leaders preparing to do in 1945|what is the relationship between the three images)/i.test(prompt)) {
    return false;
  }
  return (
    /\?$/.test(prompt) ||
    /^(?:define|describe|discuss|establish|examine|explain|how|identify|interpret|list|plan|research|summarize|support|to what extent|what|when|where|who|why|write)\b/i.test(
      prompt
    )
  );
}

function promptNeedsVisibleSource(prompt: string) {
  return /\b(?:source\s*(?:\d+|[ivx]+)|following source|each of the 3 sources|3 sources|political cartoon|cartoon|photograph|photo|image|poster|map|graph|chart|figure\s*\d|painting|monument|placards?|lanterns?)\b/i.test(prompt) ||
    /\b(?:author|method or strategy)\b.{0,80}\bprove\b/i.test(prompt) ||
    /\bperspective(?:\(s\))?\s+(?:presented|reflected)\s+in\s+the\s+source\b/i.test(prompt) ||
    /\bidentify the perspective of the source\b/i.test(prompt);
}

function hasUsableSourceContext(context: string) {
  const cleaned = cleanWorkbookPrompt(context);
  if (cleaned.length < 80) return false;
  if (/\b(?:photograph|photo|image|poster|map|graph|chart|figure|painting|cartoon)\b/i.test(cleaned)) return false;
  return true;
}

function issue2BookletTopicMatchesLesson(promptLower: string, lessonLower: string) {
  if (/\b(?:self-determination|successor state|determine for yourself|national determination)\b/i.test(promptLower)) {
    return /\b(?:self-determination|successor state|decolonization)\b/i.test(lessonLower);
  }
  if (/\b(?:atomic bombs?|hiroshima|nagasaki|japanese commanders|bombings|dropping the atomic)\b/i.test(promptLower)) {
    return /\b(?:world war ii summary|american interventionism|hiroshima|nagasaki|atomic)\b/i.test(lessonLower);
  }
  if (/\b(?:holocaust|adolf hitler|josef pitel|gerhart reigner|jew|persecuted and killed|nazi)\b/i.test(promptLower)) {
    return /\b(?:holocaust|nazi germany|setting the stage for the holocaust|ultranationalism and genocide)\b/i.test(lessonLower);
  }
  if (/\b(?:genocide|crimes against humanity|war crimes|tutsi|hutu|rwanda|holodomor|famine|memorial|raphael lemkin|armenian|ethnic cleansing|icc|international criminal court)\b/i.test(promptLower)) {
    return /\b(?:ultranationalism and genocide|genocide|holocaust|crimes against humanity)\b/i.test(lessonLower);
  }
  return true;
}

function workbookActivityKindForPrompt(prompt: string): LessonWorkbookActivityKind {
  if (/\b(source|quote|quotation|cartoon|image|perspective|interpret|message|bias|point of view)\b/i.test(prompt)) {
    return "source";
  }
  if (/\b(to what extent|position|argue|essay|embrace|agree|defensible|perspective)\b/i.test(prompt)) {
    return "position";
  }
  if (/\b(evidence|proof|example|detail|support|relationship|significant|significance)\b/i.test(prompt)) {
    return "evidence";
  }
  return "concept";
}

function tokenizeForWorkbookMatch(value: string) {
  const tokens = new Set<string>();
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 3 && !WORKBOOK_ACTIVITY_STOP_WORDS.has(token))
    .forEach((token) => tokens.add(token));
  return tokens;
}

function sourceIssueNumberFromPath(filePath: string) {
  const match =
    filePath.match(/related issue\s*(\d)/i) ??
    filePath.match(/\bri\s*(\d)\b/i) ??
    filePath.match(/\bunit\s*(\d)\b/i) ??
    filePath.match(/Unit\s+(\d)/i);
  return match ? Number(match[1]) : undefined;
}

function workbookPageNumbers(value: string) {
  return Array.from(value.matchAll(/\bpages?\s+(\d+)(?:\s*[-–]\s*(\d+))?/gi)).flatMap((match) => {
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
    const maxEnd = Math.min(end, start + 12);
    const pages: number[] = [];
    for (let page = start; page <= maxEnd; page += 1) pages.push(page);
    return pages;
  });
}

async function readWorkbookSourceText(bundle: ZipBundle, filePath: string) {
  const file = zipFile(bundle, filePath);
  if (!file) return "";
  const extension = fileExtension(filePath);
  if (extension === ".docx") {
    const buffer = await file.async("nodebuffer");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (extension === ".html" || extension === ".htm") {
    const html = await readZipText(bundle, filePath);
    const $ = load(html);
    return $.root().text();
  }
  return decodeBrightspaceHtml(await file.async("nodebuffer"));
}

function splitWorkbookTextIntoPromptLines(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/([?.!])\s+(?=(?:What|Who|Why|How|Describe|Explain|Identify|Interpret|Discuss|Define|To what extent)\b)/g, "$1\n")
    .split(/\n+/)
    .map(cleanWorkbookPrompt)
    .filter(Boolean);
}

function extractWorkbookCandidatesFromText({
  text,
  documentTitle,
  sourcePath,
  issueNumber
}: {
  text: string;
  documentTitle: string;
  sourcePath: string;
  issueNumber?: number;
}) {
  const candidates: LessonWorkbookPromptCandidate[] = [];
  const seen = new Set<string>();
  const lines = splitWorkbookTextIntoPromptLines(text);
  let sourceContext = "";
  let matchContext = "";

  for (const line of lines) {
    if (/\b(?:chapter|page|pages)\s+\d+/i.test(line)) {
      matchContext = line;
    }
    if (/^(?:Source|Source [IVX\d]+)\b/i.test(line) && line.length > 35) {
      sourceContext = line;
      continue;
    }
    if (!isUsefulWorkbookPrompt(line)) {
      continue;
    }
    const prompt = cleanWorkbookPrompt(line);
    const usableSourceContext = hasUsableSourceContext(sourceContext) ? sourceContext : "";
    if (promptNeedsVisibleSource(prompt) && !usableSourceContext) {
      continue;
    }
    const key = prompt.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    candidates.push({
      id: `${shortHash(`${sourcePath}:${prompt}`)}`,
      prompt,
      documentTitle,
      sourcePath,
      issueNumber,
      kind: workbookActivityKindForPrompt(prompt),
      sourceIndex: candidates.length + 1,
      ...(usableSourceContext && /\bsource|quote|perspective|interpret|author|point of view/i.test(prompt) ? { context: usableSourceContext } : {}),
      ...(matchContext && matchContext !== prompt ? { matchContext } : {})
    });
  }

  return candidates.slice(0, 48);
}

function buildStudyActivityCandidates(config: IssueConfig) {
  const issueNumber = issueNumberForConfig(config);
  const options = [
    ...config.vocabulary.map((option) => ({ group: "Vocabulary", option })),
    ...config.events.map((option) => ({ group: "Historical events and concepts", option })),
    ...config.mainIdeas.map((option) => ({ group: "Main ideas", option }))
  ];
  return options.map(
    ({ group, option }, index): LessonWorkbookPromptCandidate => ({
      id: `study-${issueNumber}-${index + 1}-${shortHash(`${group}:${option.title}`)}`,
      prompt: `${option.prompt} Use one course detail to make the answer useful for source analysis or position writing.`,
      documentTitle: `${config.title} Study Guide`,
      sourcePath: "config:study-guide",
      issueNumber,
      kind: group === "Main ideas" ? "position" : "concept",
      sourceIndex: index + 1
    })
  );
}

async function collectLessonWorkbookCandidates(bundles: Map<string, ZipBundle>, config: IssueConfig) {
  const candidates: LessonWorkbookPromptCandidate[] = [];
  const issueNumber = issueNumberForConfig(config);

  for (const source of WORKBOOK_SOURCE_FILES) {
    if (source.issueNumber !== issueNumber) {
      continue;
    }
    const bundle = bundles.get(source.zipKey);
    if (!bundle) {
      continue;
    }
    const text = await readWorkbookSourceText(bundle, source.filePath);
    if (!text.trim()) {
      continue;
    }
    candidates.push(
      ...extractWorkbookCandidatesFromText({
        text,
        documentTitle: source.title,
        sourcePath: source.filePath,
        issueNumber: source.issueNumber ?? sourceIssueNumberFromPath(source.filePath)
      })
    );
  }

  candidates.push(...buildStudyActivityCandidates(config));
  return candidates;
}

function workbookEligibleLessons(lessons: NextStepShellLesson[]) {
  return lessons.filter((lesson) => {
    const title = lesson.title.toLowerCase();
    return !/\b(?:glossary|unit \d+:|overview|title page|table of contents)\b/i.test(title);
  });
}

function scoreWorkbookPromptForLesson(candidate: LessonWorkbookPromptCandidate, lesson: NextStepShellLesson, config: IssueConfig) {
  const configIssue = issueNumberForConfig(config);
  if (candidate.issueNumber && candidate.issueNumber !== configIssue) {
    return Number.NEGATIVE_INFINITY;
  }

  const lessonText = `${lesson.title} ${lesson.summary} ${lesson.group} ${load(lesson.html).root().text().slice(0, 5000)}`;
  const promptText = `${candidate.prompt} ${candidate.documentTitle} ${candidate.context ?? ""} ${candidate.matchContext ?? ""}`;
  const lessonTokens = tokenizeForWorkbookMatch(lessonText);
  const promptTokens = tokenizeForWorkbookMatch(promptText);
  let score = candidate.issueNumber === configIssue ? 8 : 0;
  const promptLower = promptText.toLowerCase();
  const lessonLower = lessonText.toLowerCase();
  const lessonTopicLower = `${lesson.title} ${lesson.group}`.toLowerCase();
  const candidatePages = workbookPageNumbers(promptText);
  const lessonPages = workbookPageNumbers(lessonText);
  if (candidatePages.length > 0 && lessonPages.length > 0) {
    const hasPageOverlap = candidatePages.some((page) => lessonPages.includes(page));
    if (hasPageOverlap) score += 36;
    else score -= 18;
  }
  const isAssignmentBooklet = /\bAssignment Booklet\b/i.test(candidate.documentTitle);

  if (configIssue === 1 && /\b(?:napoleon|french revolution)\b/i.test(promptLower) && !/\b(?:napoleon|french revolution|revolution|origins of nationalism|symbols of france)\b/i.test(lessonLower)) {
    return Number.NEGATIVE_INFINITY;
  }
  if (
    configIssue === 2 &&
    /\bAssignment Booklet 2B\b/i.test(candidate.documentTitle) &&
    /\b(?:atomic bombs?|hiroshima|nagasaki|japanese commanders|bombings|dropping the atomic)\b/i.test(promptLower) &&
    !/\b(?:american interventionism|world war ii summary)\b/i.test(lesson.title)
  ) {
    return Number.NEGATIVE_INFINITY;
  }
  if (
    configIssue === 2 &&
    /\bAssignment Booklet 2B\b/i.test(candidate.documentTitle) &&
    !issue2BookletTopicMatchesLesson(promptLower, lessonTopicLower)
  ) {
    return Number.NEGATIVE_INFINITY;
  }
  if (configIssue === 2 && /\b(?:genocide|hutu|tutsi|pol pot|cambodian|khmer rouge|milosevic|ethnic cleansing|holocaust|nazi germany|armenian|raphael lemkin|crimes against humanity)\b/i.test(promptLower) && !/\b(?:genocide|holocaust|dehumanization|ultranationalism and genocide)\b/i.test(lessonLower)) {
    return Number.NEGATIVE_INFINITY;
  }

  for (const token of promptTokens) {
    if (lessonTokens.has(token)) {
      score += 4;
    }
  }

  const combined = `${promptText} ${lessonText}`.toLowerCase();
  const lessonIdText = `${lesson.id} ${lesson.title} ${lesson.group}`.toLowerCase();
  if (configIssue === 1 && /\b(identity|nationalism|loyalt|french revolution|napoleon|ethnic|language|religion|oka|tibet)\b/i.test(combined)) score += 8;
  if (configIssue === 2 && /\b(national interest|ultranationalism|hitler|versailles|propaganda|genocide|holocaust|appeasement|war)\b/i.test(combined)) score += 8;
  if (configIssue === 3 && /\b(internationalism|foreign policy|united nations|humanitarian|kofi|global|allegiance|peacekeeping)\b/i.test(combined)) score += 8;
  if (configIssue === 4 && /\b(canadian identity|canada|unity|quebec|first nations|m[eé]tis|federalism|trudeau|macdonald|sifton)\b/i.test(combined)) score += 8;
  if (/\b(?:glossary|unit \d+:|overview)\b/i.test(lessonIdText)) score -= 10;
  if (candidate.kind === "position" && /\b(?:issue|extent|position|interest|identity|internationalism)\b/i.test(lessonIdText)) score += 3;
  if (isAssignmentBooklet && candidatePages.length === 0 && /\b(?:what happened|whose point of view|explain your response|what might be written|when and where|what percentage|who is|what did they want)\b/i.test(candidate.prompt)) {
    score -= 12;
  }

  return score;
}

function selectLessonForWorkbookCandidate(
  candidate: LessonWorkbookPromptCandidate,
  lessons: NextStepShellLesson[],
  config: IssueConfig,
  activityMap: Map<string, LessonWorkbookPromptCandidate[]>
) {
  const eligibleLessons = workbookEligibleLessons(lessons);
  const bestMatch = eligibleLessons
    .map((lesson) => ({
      lesson,
      score: scoreWorkbookPromptForLesson(candidate, lesson, config) - (activityMap.get(lesson.id)?.length ?? 0) * 5
    }))
    .sort((a, b) => b.score - a.score)[0];

  const threshold = /\bAssignment Booklet\b/i.test(candidate.documentTitle) ? 22 : 12;
  return bestMatch && bestMatch.score >= threshold ? bestMatch.lesson : undefined;
}

function buildLessonWorkbookActivityMap(
  config: IssueConfig,
  lessons: NextStepShellLesson[],
  candidates: LessonWorkbookPromptCandidate[]
) {
  const activityMap = new Map<string, LessonWorkbookPromptCandidate[]>();
  const sortedCandidates = [...candidates].sort((a, b) => {
    const sourceWeight = (value: LessonWorkbookPromptCandidate) => (value.sourcePath.startsWith("config:") ? 1 : 0);
    return sourceWeight(a) - sourceWeight(b) || a.documentTitle.localeCompare(b.documentTitle) || a.sourceIndex - b.sourceIndex;
  });

  for (const candidate of sortedCandidates) {
    const lesson = selectLessonForWorkbookCandidate(candidate, lessons, config, activityMap);
    if (!lesson) {
      continue;
    }
    const activities = activityMap.get(lesson.id) ?? [];
    if (activities.length >= 4) {
      continue;
    }
    activities.push(candidate);
    activityMap.set(lesson.id, activities);
  }

  return activityMap;
}

function workbookActivityPlaceholder(kind: LessonWorkbookActivityKind) {
  switch (kind) {
    case "source":
      return "Interpret the source or perspective, then explain the detail that supports your reading.";
    case "position":
      return "Take a position, then support it with a course detail or example.";
    case "evidence":
      return "Record the evidence and explain how it could support later writing.";
    default:
      return "Answer in your own words, using the lesson vocabulary where it helps.";
  }
}

function renderLessonWorkbookActivities(config: IssueConfig, lesson: NextStepShellLesson, activities: LessonWorkbookPromptCandidate[]) {
  const activityCards = activities
    .map(
      (activity, index) => `<article class="social-embedded-activity social-embedded-activity--${escapeHtml(activity.kind)}" data-source-document="${escapeHtml(activity.documentTitle)}">
        ${
          activity.context
            ? `<div class="social-embedded-context">
                <strong>Context</strong>
                <p>${escapeHtml(activity.context)}</p>
              </div>`
            : ""
        }
        <div class="social-embedded-question-row">
          <span class="social-embedded-question-number" aria-hidden="true">${index + 1}</span>
          <div>
            <p class="social-embedded-activity-question">${escapeHtml(activity.prompt)}</p>
          </div>
        </div>
        <label>
          Response
          <textarea data-response-id="${escapeHtml(`${config.slug}:${lesson.id}:course-activity:${activity.id}`)}" placeholder="${escapeHtml(workbookActivityPlaceholder(activity.kind))}"></textarea>
        </label>
      </article>`
    )
    .join("\n");

  return `<section class="social-lesson-embedded-activities" data-writing-activity-panel aria-labelledby="${escapeHtml(`${lesson.id}-embedded-activities-title`)}">
    <div class="social-embedded-activity-lede">
      <span>Practice</span>
      <h2 id="${escapeHtml(`${lesson.id}-embedded-activities-title`)}">Lesson questions</h2>
      <p>Use these questions to check your understanding of this lesson. Your responses save with your course notes.</p>
    </div>
    <div class="social-embedded-activity-list">
      ${activityCards}
    </div>
    <div class="social-save-status-line">
      <span class="save-status" data-save-status>Saved locally</span>
    </div>
  </section>`;
}

function injectLessonWorkbookActivities(
  config: IssueConfig,
  lessons: NextStepShellLesson[],
  candidates: LessonWorkbookPromptCandidate[]
) {
  const activityMap = buildLessonWorkbookActivityMap(config, lessons, candidates);
  if (activityMap.size === 0) {
    return lessons;
  }

  return lessons.map((lesson) => {
    const activities = activityMap.get(lesson.id) ?? [];
    if (activities.length === 0) {
      return lesson;
    }
    const activityHtml = renderLessonWorkbookActivities(config, lesson, activities);
    const html = lesson.html.includes('<section class="social-lesson-evidence-note"')
      ? lesson.html.replace('<section class="social-lesson-evidence-note"', `${activityHtml}\n        <section class="social-lesson-evidence-note"`)
      : `${lesson.html}\n${activityHtml}`;
    return {
      ...lesson,
      html
    };
  });
}

function lessonMergeKey(title: string) {
  return normalizeWhitespace(
    title
      .toLowerCase()
      .replace(/\((?:cont\.?|continued)\)/gi, "")
      .replace(/\b(?:cont\.?|continued)\b/gi, "")
      .replace(/[^a-z0-9]+/g, " ")
  );
}

function hasContinuationMarker(title: string) {
  return /\bcont\.?\b|\bcontinued\b|\((?:cont\.?|continued)\)/i.test(title);
}

function removeContinuationMarker(value: string) {
  return normalizeWhitespace(
    value
      .replace(/\s*\((?:cont\.?|continued)\)/gi, "")
      .replace(/\s*[-:]\s*(?:cont\.?|continued)\b/gi, "")
      .replace(/\bcont\.?\b/gi, "")
  );
}

function cleanContinuationMarkersFromHtml(html: string) {
  if (!hasContinuationMarker(html)) return html;
  const $ = load(html);
  $("h1, h2, h3, h4, title").each((_, element) => {
    const text = $(element).text();
    if (hasContinuationMarker(text)) {
      $(element).text(removeContinuationMarker(text));
    }
  });
  return $.root().html() ?? html;
}

function relatedMiniLessonCluster(title: string) {
  const key = lessonMergeKey(title);
  if (key === "what is a nation") return "what-is-a-nation";
  if (key === "what is nationalism" || key === "what is nationalism shared experiences") return "what-is-nationalism";
  if (key === "napoleon and nationalism" || key === "what are the origins of nationalism napoleon") return "napoleon-and-nationalism";
  return "";
}

function mergedMiniLessonTitle(cluster: string, fallback: string) {
  if (cluster === "what-is-a-nation") return "What is a Nation?";
  if (cluster === "what-is-nationalism") return "What is Nationalism?";
  if (cluster === "napoleon-and-nationalism") return "Napoleon and Nationalism";
  return fallback;
}

function stripMergedLessonDuplicateHeading(html: string, currentTitle: string) {
  const $ = load(html);
  const currentKey = lessonMergeKey(currentTitle);
  const firstHeading = $(".social-imported-lesson h1, .social-imported-lesson h2, .social-imported-lesson h3, h1, h2, h3").first();
  if (firstHeading.length > 0 && lessonMergeKey(firstHeading.text()) === currentKey) {
    firstHeading.remove();
  }
  return $.root().html() ?? html;
}

function shouldMergeContinuationLesson(previous: NextStepShellLesson | undefined, current: NextStepShellLesson) {
  if (!previous || !hasContinuationMarker(current.title) || previous.group !== current.group) return false;
  const previousKey = lessonMergeKey(previous.title);
  const currentKey = lessonMergeKey(current.title);
  return currentKey === previousKey || currentKey.startsWith(`${previousKey} `);
}

function shouldMergeRelatedMiniLesson(previous: NextStepShellLesson | undefined, current: NextStepShellLesson) {
  if (!previous || previous.group !== current.group) return false;
  const previousKey = lessonMergeKey(previous.title);
  const currentKey = lessonMergeKey(current.title);
  if (previousKey && previousKey === currentKey) return true;
  const previousCluster = relatedMiniLessonCluster(previous.title);
  const currentCluster = relatedMiniLessonCluster(current.title);
  return Boolean(previousCluster && previousCluster === currentCluster);
}

function mergeContinuationLessons(lessons: NextStepShellLesson[]) {
  const merged: NextStepShellLesson[] = [];
  for (const lesson of lessons) {
    const previous = merged[merged.length - 1];
    if (shouldMergeContinuationLesson(previous, lesson)) {
      previous.html = cleanContinuationMarkersFromHtml(`${previous.html}\n${lesson.html}`);
      previous.summary = removeContinuationMarker(`${previous.summary} ${lesson.summary}`);
      previous.entry = `${previous.entry} | ${lesson.entry}`;
      continue;
    }
    merged.push({ ...lesson, title: removeContinuationMarker(lesson.title), html: cleanContinuationMarkersFromHtml(lesson.html) });
  }
  return merged;
}

function mergeRelatedMiniLessons(lessons: NextStepShellLesson[]) {
  const merged: NextStepShellLesson[] = [];
  for (const lesson of lessons) {
    const previous = merged[merged.length - 1];
    if (shouldMergeRelatedMiniLesson(previous, lesson)) {
      const cluster = relatedMiniLessonCluster(lesson.title);
      previous.title = mergedMiniLessonTitle(cluster, previous.title);
      previous.html = `${previous.html}\n<div class="social-merged-lesson-part">${stripMergedLessonDuplicateHeading(lesson.html, lesson.title)}</div>`;
      previous.summary = summarizeText(`${previous.summary} ${lesson.summary}`);
      previous.entry = `${previous.entry} | ${lesson.entry}`;
      continue;
    }
    const cluster = relatedMiniLessonCluster(lesson.title);
    merged.push({
      ...lesson,
      title: cluster ? mergedMiniLessonTitle(cluster, lesson.title) : lesson.title
    });
  }
  return merged;
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

async function buildLessons(bundle: ZipBundle, config: IssueConfig): Promise<NextStepShellLesson[]> {
  const htmlFiles = Object.keys(bundle.zip.files)
    .map((filePath) => normalizeZipPath(filePath))
    .filter((filePath) => filePath.startsWith(config.unitPrefix) && /\.html?$/i.test(filePath))
    .filter((filePath) => !/assets\//i.test(filePath) && !/\/mm\//i.test(filePath))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));

  const lessons: NextStepShellLesson[] = [];
  const titleCounts = new Map<string, number>();
  for (const [index, filePath] of htmlFiles.entries()) {
    const html = await readZipText(bundle, filePath);
    if (!html.trim()) continue;
    const $ = load(html);
    const fallbackTitle = fileBaseTitle(filePath) || `Lesson ${index + 1}`;
    const baseTitle = cleanLessonTitle($, filePath) || cleanTitle($("h1, h2, h3, title").first().text(), fallbackTitle);
    const titleKey = baseTitle.toLowerCase();
    const duplicateIndex = titleCounts.get(titleKey) ?? 0;
    titleCounts.set(titleKey, duplicateIndex + 1);
    const textRoot = $("#content").first().text() || $("body").text() || $.root().text();
    const supplement =
      duplicateIndex > 0
        ? supplementalLessonTitle($, filePath, baseTitle) || inferredDuplicateLessonSupplement(baseTitle, textRoot)
        : "";
    const title = supplement ? `${baseTitle} - ${supplement}` : baseTitle;
    const summary = removeContinuationMarker(summarizeText(textRoot.replace(/^Social Studies 20-1(?:\s+Unit\s+\d+)?\s*/i, "")));
    const lessonId = `lesson-${String(index + 1).padStart(2, "0")}`;
    const group = inferLessonGroup(config, title, filePath, index);
    lessons.push({
      id: lessonId,
      title,
      summary,
      group,
      unitGroup: config.title,
      entry: filePath,
      html: sanitizeHtml(html, filePath, bundle.key, { lessonTitle: title })
    });
  }

  return mergeRelatedMiniLessons(mergeContinuationLessons(lessons)).map((lesson, index) => ({
    ...lesson,
    id: `lesson-${String(index + 1).padStart(2, "0")}`,
    html: `${lesson.html}
        ${renderLessonEvidenceNote(config, lesson, index)}`
  }));
}

const RESOURCE_EXTENSIONS = new Set([".html", ".htm", ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".pps", ".ppsx", ".rtf", ".txt"]);

function issueNumberFromConfig(config: IssueConfig) {
  return Number(config.slug.match(/related-issue-(\d+)/)?.[1] ?? "0");
}

function currentIssueLibraryPaths(config: IssueConfig) {
  const issueNumber = issueNumberFromConfig(config);
  const workbookPaths = WORKBOOK_SOURCE_FILES.filter((source) => source.issueNumber === issueNumber).map((source) => source.filePath);
  const issuePaths = [
    ...workbookPaths,
    `Content/Exploring Nationalism Related Issue ${issueNumber}.pdf`,
    `Social 20-1 RI ${issueNumber} Exam Review.pdf`,
    `Unit ${issueNumber} Vocabulary.html`
  ];
  return new Set(issuePaths.map((filePath) => normalizeZipPath(filePath).toLowerCase()));
}

function issueWrittenResponseSupport(config: IssueConfig): SupportDoc | undefined {
  const issueNumber = issueNumberFromConfig(config);
  const source = WORKBOOK_SOURCE_FILES.find(
    (candidate) => candidate.issueNumber === issueNumber && /written response/i.test(candidate.title)
  );
  if (!source) return undefined;
  return {
    title: `Unit ${issueNumber} Written Response`,
    type: "DOCX",
    zipKey: source.zipKey,
    filePath: source.filePath,
    useItHere: "Use this unit-specific written-response file to check how source interpretation, proof, and explanation are expected for this issue."
  };
}

function supportDocsFor(config: IssueConfig, section: keyof typeof SUPPORT_DOCS) {
  if (section !== "source") {
    return SUPPORT_DOCS[section];
  }
  const writtenResponse = issueWrittenResponseSupport(config);
  return writtenResponse ? [writtenResponse, ...SUPPORT_DOCS.source] : SUPPORT_DOCS.source;
}

function mergeStudyOptionGroups(base: StudyOption[], additions: StudyOption[]) {
  const seen = new Set<string>();
  const merged: StudyOption[] = [];
  for (const option of [...base, ...additions]) {
    const key = normalizeWhitespace(option.title).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(option);
  }
  return merged;
}

function expandStudyOptions(config: IssueConfig): IssueConfig {
  const additions = STUDY_GUIDE_EXTENSIONS[config.slug];
  if (!additions) return config;
  return {
    ...config,
    vocabulary: mergeStudyOptionGroups(config.vocabulary, additions.vocabulary),
    events: mergeStudyOptionGroups(config.events, additions.events),
    mainIdeas: mergeStudyOptionGroups(config.mainIdeas, additions.mainIdeas)
  };
}

function collectResourceSupportDocs(config: IssueConfig) {
  const docs = [
    ...supportDocsFor(config, "inquiry"),
    ...supportDocsFor(config, "source"),
    ...supportDocsFor(config, "position")
  ];
  const seen = new Set<string>();
  return docs.filter((doc) => {
    const key = `${doc.zipKey}:${normalizeZipPath(doc.filePath).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function resourceTitleFromFile(bundle: ZipBundle, filePath: string) {
  if (!/\.html?$/i.test(filePath)) {
    return humanizeTitleFromPath(filePath);
  }
  const html = await readZipText(bundle, filePath);
  if (!html.trim()) return humanizeTitleFromPath(filePath);
  const $ = load(html);
  return cleanResourceTitle(cleanLessonTitle($, filePath), filePath);
}

async function makeResource(
  bundle: ZipBundle,
  workspaceDir: string,
  filePath: string,
  category: ImportedResource["category"],
  description?: string
): Promise<ImportedResource | undefined> {
  const file = zipFile(bundle, filePath);
  if (!file) return undefined;
  const href = workspaceAssetHref(bundle.key, filePath);
  const extension = fileExtension(filePath);
  const title = await resourceTitleFromFile(bundle, filePath);
  const previewHref = /\.html?$/i.test(filePath) ? await createHtmlPreview(bundle, workspaceDir, filePath, title) : canPreview(extension) ? href : undefined;
  return {
    category,
    title,
    href,
    previewHref,
    sourcePath: filePath,
    description: description ?? ""
  };
}

async function collectResources(bundles: Map<string, ZipBundle>, config: IssueConfig, workspaceDir: string) {
  const resources: ImportedResource[] = [];
  const seen = new Set<string>();
  const add = async (
    bundle: ZipBundle | undefined,
    filePath: string,
    category: ImportedResource["category"],
    description?: string
  ) => {
    if (!bundle) return;
    const key = `${bundle.key}:${normalizeZipPath(filePath).toLowerCase()}`;
    if (seen.has(key) || !RESOURCE_EXTENSIONS.has(fileExtension(filePath))) return;
    const resource = await makeResource(bundle, workspaceDir, filePath, category, description);
    if (!resource) return;
    seen.add(key);
    resources.push(resource);
  };

  const textbook = bundles.get("textbook");
  for (const filePath of config.textbookFiles) {
    if (!/\.pdf$/i.test(filePath)) continue;
    await add(textbook, filePath, "textbook", "Perspectives on Nationalism textbook file.");
  }

  const d2l = bundles.get("d2l");
  if (d2l) {
    const currentIssuePaths = currentIssueLibraryPaths(config);
    const d2lFiles = Object.keys(d2l.zip.files)
      .map((filePath) => normalizeZipPath(filePath))
      .filter((filePath) => RESOURCE_EXTENSIONS.has(fileExtension(filePath)))
      .filter((filePath) => currentIssuePaths.has(filePath.toLowerCase()));
    for (const filePath of d2lFiles) {
      await add(d2l, filePath, "unit", "Recovered Brightspace file connected to this issue.");
    }
  }

  for (const doc of collectResourceSupportDocs(config)) {
    await add(bundles.get(doc.zipKey), doc.filePath, "student", doc.useItHere);
  }

  return resources;
}

function issueNumberForPodcast(entry: NsoPodcastEntry) {
  const title = entry.title.toLowerCase();
  if (/\b(?:sovereignty|egalitarianism)\b/i.test(title)) return 4;
  if (/\b(?:internationalism|foreign policy|cuban missile|mccarthyism|global issues)\b/i.test(title)) return 3;
  if (
    /\b(?:ww1|ww2|world war|interwar|self-determination|self determination|quebecois|aboriginal|national interests?|peace built|ultranationalism|supernationalism|hitler|lenin)\b/i.test(
      title
    )
  ) {
    return 2;
  }
  if (/\b(?:nationalism|nation|french revolution|napoleon|unification|collective consciousness|contending loyalties|revolution)\b/i.test(title)) {
    return 1;
  }
  return undefined;
}

function podcastDescription(config: IssueConfig, entry: NsoPodcastEntry) {
  return `Podcast companion for ${entry.title.replace(/\s+Podcast$/i, "")}. Use it to connect media evidence back to ${config.issueQuestion}`;
}

function podcastLessonHints(entry: NsoPodcastEntry) {
  const title = entry.title.toLowerCase();
  const hints: string[] = [];
  const add = (...values: string[]) => hints.push(...values.map((value) => value.toLowerCase()));
  if (/^nationalism podcast$/i.test(entry.title)) add("what is nationalism");
  if (/expressions/.test(title)) add("expressions of nationalism");
  if (/french revolution|revolution forges/.test(title)) add("key events of the revolution", "origins of nationalism", "national symbols of france");
  if (/napoleon/.test(title)) add("napoleon");
  if (/unification|italy|germany/.test(title)) add("origins of nationalism");
  if (/collective consciousness/.test(title)) add("collective");
  if (/contending loyalties/.test(title)) add("contending nationalist loyalties", "non-nationalist loyalties");
  if (/causes of ww1|ww1 oversimplified/.test(title)) add("causes of world war i", "national interests and wwi", "world war i and nationalism");
  if (/outcomes of ww1/.test(title)) add("world war one ends", "nation building in victory and defeat");
  if (/interwar|peace built/.test(title)) add("interwar", "peace treat", "peace negotiation");
  if (/self-determination|self determination|aboriginal|quebecois/.test(title)) add("national self-determination", "decolonization", "successor states");
  if (/ww2|world war ii/.test(title)) add("world war ii summary");
  if (/hitler|nazi/.test(title)) add("nazi", "rise to power");
  if (/ultranationalism|supernationalism/.test(title)) add("what is ultranationalism", "ultranationalism");
  if (/national interests?/.test(title)) add("what is national interest", "national interests and wwi", "how do nations pursue");
  if (/internationalism/.test(title)) add("what is internationalism", "unit 3: internationalism");
  if (/foreign policy/.test(title)) add("foreign policy", "canada's foreign policy goals");
  if (/global issues/.test(title)) add("international efforts to address global issues", "global issues");
  if (/cuban missile|mccarthyism/.test(title)) add("foreign policy", "international efforts to address global issues");
  if (/states.*nations.*countries|sovereignty/.test(title)) add("unit 4", "historical visions", "challenges and opportunities");
  if (/egalitarianism/.test(title)) add("trudeau", "historical visions");
  if (/lenin/.test(title)) add("interwar", "ultranationalism", "nazi party rise");
  return hints;
}

function scorePodcastForLesson(entry: NsoPodcastEntry, lesson: NextStepShellLesson) {
  const lessonTitle = normalizeWhitespace(lesson.title).toLowerCase();
  const lessonText = normalizeWhitespace(`${lesson.title} ${lesson.summary} ${load(lesson.html).root().text().slice(0, 4500)}`).toLowerCase();
  let score = 0;
  for (const hint of podcastLessonHints(entry)) {
    if (lessonTitle.includes(hint)) score += 80;
    else if (lessonText.includes(hint)) score += 20;
  }
  const titleTokens = Array.from(tokenizeForWorkbookMatch(entry.title.replace(/\bpodcast\b/gi, "")));
  for (const token of titleTokens) {
    if (lessonTitle.includes(token)) score += 10;
    else if (lessonText.includes(token)) score += 2;
  }
  if (/\bglossary\b/i.test(lesson.title)) score -= 50;
  if (/^unit\s+\d|overview|summary/i.test(lesson.title)) score -= 14;
  return score;
}

function fallbackPodcastLesson(lessons: NextStepShellLesson[]) {
  return lessons.find((lesson) => !/\bglossary\b/i.test(lesson.title)) ?? lessons[0];
}

function buildPodcastConnections(
  config: IssueConfig,
  lessons: NextStepShellLesson[],
  entries: NsoPodcastEntry[]
): { connections: SocialPodcastConnection[]; report: SocialPodcastMappingReport } {
  const issueNumber = issueNumberForConfig(config);
  const records: SocialPodcastMappingRecord[] = [];
  const connections: SocialPodcastConnection[] = [];
  const seenVideos = new Set<string>();
  const relevantEntries = entries.filter((entry) => {
    const matchedIssue = issueNumberForPodcast(entry);
    return matchedIssue === issueNumber || matchedIssue === undefined;
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
        issueNumber,
        status: "quarantined",
        reason: "No confident Social 20-1 issue match."
      });
      continue;
    }

    const ranked = lessons
      .map((lesson) => ({ lesson, score: scorePodcastForLesson(entry, lesson) }))
      .sort((left, right) => right.score - left.score);
    const best = ranked[0];
    const fallback = fallbackPodcastLesson(lessons);
    const useBest = best && best.score >= 16 && !/\bglossary\b/i.test(best.lesson.title) && !/^unit\s+\d|overview/i.test(best.lesson.title);
    const lesson = useBest ? best.lesson : fallback;
    if (!lesson) {
      records.push({
        title: entry.title,
        href: entry.href,
        sourceLine: entry.sourceLine,
        issueNumber,
        status: "quarantined",
        reason: "No lesson was available for this related issue."
      });
      continue;
    }

    const connection: SocialPodcastConnection = {
      id: `podcast-${videoKey.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
      issueNumber,
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
      issueNumber,
      status: connection.status,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      score: connection.score,
      reason: useBest ? "Matched to lesson title/content." : "Placed in the issue overview because no exact lesson match cleared the threshold."
    });
  }

  const report: SocialPodcastMappingReport = {
    slug: config.slug,
    course: "Social Studies 20-1",
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
  await fs.writeFile(path.join(metaDir, "social20-podcast-mapping.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
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
  await fs.writeFile(path.join(metaDir, "social20-podcast-mapping.md"), `${lines.join("\n")}\n`, "utf8");
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

function renderSupportViewer(slug: string, section: string, title: string, intro: string, docs: SupportDoc[], teachingPoints: string[]) {
  const options = docs
    .map((doc, index) => `<option value="${section}-${index + 1}">${escapeHtml(doc.title)}</option>`)
    .join("");
  const panels = docs
    .map((doc, index) => {
      const id = `${section}-${index + 1}`;
      const href = workspaceAssetHref(doc.zipKey, doc.filePath);
      const isPdf = /\.pdf$/i.test(doc.filePath);
      const isHtml = /\.html?$/i.test(doc.filePath);
      const viewer = isPdf
        ? `<iframe class="social-support-frame" src="${href}" title="${escapeHtml(doc.title)}"></iframe>`
        : isHtml
          ? `<iframe class="social-support-frame" src="${href}" title="${escapeHtml(doc.title)}"></iframe>`
          : `<div class="social-support-file-card">
              <p>This support opens as a file from the course package.</p>
              <a class="external-resource-action" href="${href}" target="_blank" rel="noopener">Open support</a>
            </div>`;
      return `<article class="social-support-panel" data-library-doc-panel="${escapeHtml(id)}"${index === 0 ? "" : " hidden"}>
        <header class="social-support-panel-header">
          <p>${escapeHtml(doc.type)}</p>
          <h4>${escapeHtml(doc.title)}</h4>
          <span>${escapeHtml(doc.useItHere)}</span>
        </header>
        ${viewer}
      </article>`;
    })
    .join("\n");

  return `<section class="social-support-reader" data-library-doc-scope>
    <div class="social-section-heading-row">
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(intro)}</p>
      </div>
      <label class="social-select-label">
        <span>Choose a support</span>
        <select data-library-doc-select>${options}</select>
      </label>
    </div>
    <ol class="social-teaching-list">
      ${teachingPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
    </ol>
    ${panels}
    <div class="social-apply-grid">
      ${renderField(`${slug}:${section}:apply-one`, "What move can I use?", "Name one move from the support that improves your thinking.")}
      ${renderField(`${slug}:${section}:apply-now`, "Apply it here", "Use that move on the current issue or source.")}
    </div>
  </section>`;
}

function renderIssueInquiry(config: IssueConfig) {
  return `<section id="issue-inquiry" class="course-page social-page" hidden>
    <p class="course-kicker">Issue investigation</p>
    <h2>Issue Inquiry</h2>
    <p class="page-intro">${escapeHtml(config.issueQuestion)}</p>
    <article class="social-document" data-writing-activity-panel>
      <header class="social-document-header">
        <p>Diploma issue inquiry</p>
        <h3>Start with a position</h3>
        <span>Use this page to record your first thinking before you gather evidence across the unit lessons.</span>
      </header>
      <div class="social-document-body">
        <section class="social-diploma-panel">
          <div>
            <h4>Turn the issue into a diploma investigation</h4>
            <p>Before taking a side, define what the issue is asking and what kind of evidence would make an answer defensible.</p>
          </div>
          <div class="social-diploma-steps social-diploma-steps-four">
            <article class="social-diploma-step"><strong>1. Unpack the task</strong><span>Turn the related issue into a yes, no, or to-what-extent question before choosing evidence.</span></article>
            <article class="social-diploma-step"><strong>2. Define the terms</strong><span>Clarify the concepts, groups, events, policies, or identities the question depends on.</span></article>
            <article class="social-diploma-step"><strong>3. Name the tension</strong><span>Show what is in conflict: identity, interest, sovereignty, security, rights, or responsibility.</span></article>
            <article class="social-diploma-step"><strong>4. Plan the proof</strong><span>Decide what source, historical case, current issue, policy, or thinker would help.</span></article>
          </div>
        </section>
        <section class="social-inquiry-field-stack">
          ${renderField(`${config.slug}:inquiry:first-position`, "What do I think right now?", "Write your first position on the related issue.")}
          ${renderField(`${config.slug}:inquiry:terms`, "Terms I need to define", "List important concepts, people, events, policies, or vocabulary.")}
          ${renderField(`${config.slug}:inquiry:evidence`, "What evidence would strengthen or challenge my view?", "Name the types of sources, examples, or perspectives you need.")}
          ${renderField(`${config.slug}:inquiry:course-connection`, "How this connects to the course issue", "Connect this issue to nationalism, internationalism, identity, or national interest.")}
        </section>
        <section class="social-diploma-panel social-diploma-panel-accent">
          <div>
            <h4>Map the possible positions</h4>
            <p>A diploma answer is stronger when students can see more than one defensible side before deciding where they stand.</p>
          </div>
          <section class="social-inquiry-field-stack">
            ${renderField(`${config.slug}:inquiry:position-a`, "Position A", "What would a strong yes or embrace position argue?")}
            ${renderField(`${config.slug}:inquiry:position-b`, "Position B", "What would a partly, depends, or balanced position argue?")}
            ${renderField(`${config.slug}:inquiry:position-c`, "Position C", "What would a no, limit, or reject position argue?")}
          </section>
        </section>
        <section class="social-diploma-panel">
          <div>
            <h4>Set up an evidence hunt</h4>
            <p>Use the lessons, source analysis practice, and evidence bank to find proof that can survive a counterargument.</p>
          </div>
          <section class="social-inquiry-field-stack">
            ${renderField(`${config.slug}:inquiry:proof-example`, "Course example to look for", "A case, law, policy, event, person, or source that could support a position.")}
            ${renderField(`${config.slug}:inquiry:proof-detail`, "Detail that would count as proof", "A quote, statistic, image detail, decision, consequence, or specific fact.")}
            ${renderField(`${config.slug}:inquiry:opposing-perspective`, "Opposing view to watch for", "What would someone with a different priority or identity say?")}
          </section>
        </section>
        ${renderSupportViewer(config.slug, "inquiry-support", "Issue inquiry supports", "Use these supports to turn the course issue into a stronger investigation.", supportDocsFor(config, "inquiry"), [
          "A defensible answer starts by defining the issue, not by listing examples.",
          "Strong inquiry work names the tension before choosing evidence.",
          "The best evidence is useful because it helps test more than one possible position."
        ])}
        ${renderField(`${config.slug}:inquiry:next-question`, "Question I still need the course to answer", "Write the question that would help you move from first reaction to defensible judgment.")}
        ${renderActivityActions()}
      </div>
    </article>
  </section>`;
}

function renderSourceAnalysis(config: IssueConfig) {
  const options = config.sourceChoices
    .map((source, index) => `<option value="source-${index + 1}">${escapeHtml(source.title)}</option>`)
    .join("");
  const panels = config.sourceChoices
    .map((source, index) => {
      const id = `source-${index + 1}`;
      return `<article class="social-practice-selected-source" data-practice-source-panel="${escapeHtml(id)}"${index === 0 ? "" : " hidden"}>
        <div class="social-selected-source-copy">
          <p>Practice Source ${String.fromCharCode(65 + index)} | ${escapeHtml(source.kind)}</p>
          <h3>${escapeHtml(source.title)}</h3>
          <span>${escapeHtml(source.prompt)}</span>
        </div>
        <figure class="social-selected-source-figure">
          <img src="${workspaceAssetHref(source.zipKey, source.filePath)}" alt="">
          <figcaption>${escapeHtml(source.caption)}</figcaption>
        </figure>
      </article>`;
    })
    .join("\n");

  return `<section id="source-analysis" class="course-page social-page" hidden>
    <p class="course-kicker">Source response practice</p>
    <h2>Source Analysis</h2>
    <p class="page-intro">Use this routine for cartoons, images, charts, excerpts, quotations, and case studies from the Social 20-1 lessons.</p>
    <article class="social-document" data-writing-activity-panel data-evidence-notebook-panel>
      <header class="social-document-header">
        <p>Diploma source response</p>
        <h3>Source Response Routine</h3>
        <span>${escapeHtml(config.issueQuestion)}</span>
      </header>
      <div class="social-document-body">
        <section class="social-source-coach">
          <div>
            <h4>Read the source in five moves</h4>
            <p>Strong source responses do more than describe what is shown. Move from observation to interpretation, then connect that interpretation to the related issue.</p>
          </div>
          <div class="social-source-coach-steps">
            <article class="social-source-step"><strong>1. Notice</strong><span>Name what is literally shown, stated, emphasized, or repeated before interpreting it.</span></article>
            <article class="social-source-step"><strong>2. Decode</strong><span>Turn the source into a message: what idea, warning, criticism, or defence is being pushed?</span></article>
            <article class="social-source-step"><strong>3. Connect</strong><span>Link the message to nationalism, internationalism, identity, national interest, or the related issue tension.</span></article>
            <article class="social-source-step"><strong>4. Judge</strong><span>Check limits: bias, missing context, point of view, purpose, or what the source leaves out.</span></article>
            <article class="social-source-step"><strong>5. Respond</strong><span>Write a clear interpretation, prove it with one detail, and connect it back to the issue question.</span></article>
          </div>
        </section>
        <section class="social-practice-gallery" data-practice-source-region>
          <div class="social-section-heading-row">
            <div>
              <h3>Practice with real source material</h3>
              <p>Choose one course source. Read the message first, then prove it with a visible detail.</p>
            </div>
            <label class="social-select-label">
              <span>Choose a practice source</span>
              <select data-practice-source-select data-response-id="${escapeHtml(config.slug)}:source-analysis:selected-source" data-evidence-draft="source">${options}</select>
            </label>
          </div>
          ${panels}
          ${renderField(`${config.slug}:source-analysis:first-interpretation`, "First interpretation", "What is the source saying, and what detail helps you know?", 'data-evidence-draft="detail"')}
        </section>
        <section class="social-source-routine">
          <div>
            <h4>Now analyze your course source</h4>
            <p>Answer these in order so your final response has message, proof, connection, and judgment.</p>
          </div>
          ${renderField(`${config.slug}:source-analysis:message`, "Message", "What idea, warning, criticism, or defence is the source communicating?", 'data-evidence-draft="concept"')}
          ${renderField(`${config.slug}:source-analysis:detail`, "Visible proof", "Name one precise detail, symbol, word choice, statistic, or image choice.")}
          ${renderField(`${config.slug}:source-analysis:connection`, "Connection to the issue", `Explain how the source helps answer: ${config.issueQuestion}`, 'data-evidence-draft="connection"')}
          ${renderField(`${config.slug}:source-analysis:limit`, "Limit or context", "What bias, missing context, point of view, or purpose should be considered?", 'data-evidence-draft="counterpoint"')}
        </section>
        <section class="social-source-builder">
          <div>
            <h4>Build a diploma-style response</h4>
            <p>Use the sentence starts to move from interpretation to evidence to related-issue connection.</p>
          </div>
          ${renderField(`${config.slug}:source-analysis:paragraph-interpretation`, "Interpretation", "The source suggests...")}
          ${renderField(`${config.slug}:source-analysis:paragraph-proof`, "Proof", "This is shown by...")}
          ${renderField(`${config.slug}:source-analysis:paragraph-connection`, "Connection", "This connects to the issue because...")}
          ${renderField(`${config.slug}:source-analysis:paragraph-judgment`, "Judgment", "Therefore, the source reveals...")}
        </section>
        <section class="social-source-format">
          <div>
            <h4>Shape the final paragraph</h4>
            <p>A strong diploma source response usually works as one clear paragraph: interpret the message, prove it with source evidence, connect it to the issue, then add judgment.</p>
          </div>
          <div class="social-source-format-grid">
            <article class="social-source-format-step"><strong>1. Opening interpretation</strong><span>State the source's message in your own words. Do not start by only listing what you see.</span></article>
            <article class="social-source-format-step"><strong>2. Proof from the source</strong><span>Use one exact phrase, image detail, statistic, label, or visual choice and explain how it proves your interpretation.</span></article>
            <article class="social-source-format-step"><strong>3. Course connection</strong><span>Link the message to nationalism, internationalism, identity, national interest, or a case from this issue.</span></article>
            <article class="social-source-format-step"><strong>4. Judgment</strong><span>Add a limit, bias, missing context, or consequence so the response sounds analytical instead of descriptive.</span></article>
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
        ${renderSupportViewer(config.slug, "source-support", "Source analysis supports", "Use these supports when you need hints, templates, or a fuller guide while writing a source response.", supportDocsFor(config, "source"), [
          "A source response starts with the message, not a description of everything visible.",
          "The proof must come from one precise source detail.",
          "The final connection should explain what the source reveals about the issue."
        ])}
        ${renderActivityActions({ saveToEvidence: true })}
      </div>
    </article>
  </section>`;
}

function renderPositionBuilder(config: IssueConfig) {
  const rows = [
    ["Paragraph 1: Introduction and thesis", "Set the issue context, name the debate, and finish with a clear position that answers the extent question.", "Context: ... Issue tension: ... Thesis: ..."],
    ["Paragraph 2: First proof paragraph", "Use the How-To pattern: topic sentence, evidence, commentary, and a closing sentence that returns to the thesis.", "T: First reason... E: Specific evidence... C: This proves the thesis because..."],
    ["Paragraph 3: Second proof paragraph", "Add a second reason with a different example, then explain how it strengthens or qualifies the position.", "T: Second reason... E: Specific evidence... C: This matters because..."],
    ["Paragraph 4: Third proof or counterargument paragraph", "Add another proof, address the best opposing view, or show a limit to your position.", "T: A further reason or counterargument is... E: Evidence... C: My position still holds because..."],
    ["Paragraph 5: Conclusion and judgment", "Restate the thesis without copying it, connect back to the related issue, and judge why the position matters.", "In conclusion... This position matters because... The strongest judgment is..."]
  ];
  return `<section id="position-builder" class="course-page social-page" hidden>
    <p class="course-kicker">Position paper planning</p>
    <h2>Position Builder</h2>
    <p class="page-intro">Move from evidence to a defensible position. Keep the claim specific, arguable, and connected to the issue.</p>
    <article class="social-document" data-writing-activity-panel>
      <header class="social-document-header">
        <p>Diploma position paper</p>
        <h3>Build a Position Paper Path</h3>
        <span>${escapeHtml(config.issueQuestion)}</span>
      </header>
      <div class="social-document-body social-sequence">
        <section class="social-diploma-panel">
          <div>
            <h4>Build the position in five moves</h4>
            <p>Use this routine to move from a simple opinion to a diploma-style argument with qualification, proof, and judgment.</p>
          </div>
          <div class="social-diploma-steps">
            <article class="social-diploma-step"><strong>1. Answer the extent</strong><span>Say how far you agree, not just whether you agree.</span></article>
            <article class="social-diploma-step"><strong>2. Qualify the claim</strong><span>Use conditions such as when, if, unless, because, or however to make the position precise.</span></article>
            <article class="social-diploma-step"><strong>3. Select proof</strong><span>Choose examples that show a pattern, not three disconnected facts.</span></article>
            <article class="social-diploma-step"><strong>4. Handle the other side</strong><span>Acknowledge a real counterargument and explain why your position still holds.</span></article>
            <article class="social-diploma-step"><strong>5. Judge significance</strong><span>End with why the issue matters for nationalism, identity, national interest, or international responsibility.</span></article>
          </div>
        </section>
        ${renderField(`${config.slug}:position:claim`, "Working position", "To what extent? Start with a clear, defensible answer.")}
        ${renderField(`${config.slug}:position:why`, "Why this position is defensible", "Explain the reasoning behind the position before adding examples.")}
        <section class="social-diploma-panel social-diploma-panel-accent">
          <div>
            <h4>Choose proof that can carry paragraphs</h4>
            <p>Each body paragraph needs a point, a specific example, and an explanation of how that example proves the position.</p>
          </div>
          <section class="social-three-column">
            ${renderField(`${config.slug}:position:evidence-1`, "Evidence 1", "Source, lesson, person, event, policy, or historical example.")}
            ${renderField(`${config.slug}:position:evidence-2`, "Evidence 2", "A second piece of evidence that supports or complicates the position.")}
            ${renderField(`${config.slug}:position:evidence-3`, "Evidence 3", "A final example or counterpoint to address.")}
          </section>
        </section>
        <section class="social-diploma-panel">
          <div>
            <h4>Test the position against another view</h4>
            <p>Diploma writing rewards judgment. A strong position shows that the writer understands the best opposing argument.</p>
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
            <p>Use the same structure as the Position Paper How-To support: thesis, three body paragraphs with topic-evidence-commentary-closing moves, then a conclusion.</p>
          </div>
          <section class="social-essay-builder-stack">
            ${rows
              .map(([title, cue, placeholder], index) =>
                renderEssayBuilderField(`${config.slug}:position:paragraph-${index + 1}`, title, cue, placeholder)
              )
              .join("\n")}
          </section>
        </section>
        ${renderSupportViewer(config.slug, "position-support", "Position paper supports", "Use these course documents while building a thesis, selecting proof, checking structure, and comparing against student samples.", supportDocsFor(config, "position"), [
          "A position paper answers the extent of agreement before it starts listing examples.",
          "A strong thesis is qualified: it names the condition, limit, or priority that makes the position defensible.",
          "Each body paragraph needs a reason, specific proof, explanation, and a return to the issue question."
        ])}
        ${renderField(`${config.slug}:position:thesis`, "Refined thesis", "Turn the position into a polished thesis statement.")}
        ${renderActivityActions()}
      </div>
    </article>
  </section>`;
}

function renderEvidenceBank(config: IssueConfig) {
  return `<section id="evidence-bank" class="course-page" hidden>
    <p class="course-kicker">Evidence bank</p>
    <h2>Evidence Bank</h2>
    <p class="page-intro">Save reusable proof notes from lessons, source analysis, and your own examples.</p>
    <section class="social-evidence-layout">
      <article class="social-evidence-panel">
        <h3>Lesson evidence</h3>
        <div data-lesson-evidence-list></div>
      </article>
      <article class="social-evidence-panel">
        <h3>Saved proof notes</h3>
        <div data-manual-evidence-list></div>
      </article>
    </section>
    <section class="social-evidence-notebook" data-evidence-notebook-panel>
      <h3>Save a proof note</h3>
      ${renderField(`${config.slug}:evidence:source`, "Source or example", "Where did the proof come from?", 'data-evidence-draft="source"')}
      ${renderField(`${config.slug}:evidence:concept`, "Concept", "What concept does it prove?", 'data-evidence-draft="concept"')}
      ${renderField(`${config.slug}:evidence:detail`, "Evidence", "Name the exact detail, statistic, event, or source feature.", 'data-evidence-draft="detail"')}
      ${renderField(`${config.slug}:evidence:connection`, "Why it matters", "Explain how it helps answer the issue question.", 'data-evidence-draft="connection"')}
      ${renderField(`${config.slug}:evidence:counterpoint`, "Counterpoint or limit", "What could someone challenge or qualify?", 'data-evidence-draft="counterpoint"')}
      <button class="external-resource-action" type="button" data-save-evidence-note>Save to Evidence Bank</button>
      <span class="social-save-status" data-save-status></span>
    </section>
  </section>`;
}

function getLibraryDocuments(resources: ImportedResource[]) {
  return resources
    .filter((resource) => canPreview(fileExtension(resource.previewHref ?? resource.href)))
    .map((resource, index): LibraryDocument => ({
      ...resource,
      id: `library-doc-${index + 1}`,
      extension: fileExtension(resource.href),
      categoryLabel: libraryCategoryLabel(resource.category)
    }));
}

function resourceSourceLabel(resource: ImportedResource) {
  const extension = fileExtension(resource.href).replace(/^\./, "").toUpperCase() || "File";
  return `${libraryCategoryLabel(resource.category)} | ${extension}`;
}

function renderLibraryDocumentPreview(document: LibraryDocument) {
  const readerHref = document.previewHref ?? document.href;
  return `<iframe class="social-library-document-frame" src="${escapeHtml(readerHref)}" title="${escapeHtml(document.title)}"></iframe>`;
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
                  <strong>${escapeHtml(document.title)}</strong>
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
                  <h3>${escapeHtml(document.title)}</h3>
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
    const url = new URL(href.replace(/&amp;/g, "&"));
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
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : undefined;
}

function mediaKindForHref(href: string): SocialMediaItem["kind"] {
  const extension = fileExtension(href);
  if ([".mp3", ".m4a", ".wav", ".ogg"].includes(extension)) return "audio";
  if ([".mp4", ".m4v", ".mov", ".webm"].includes(extension)) return "video";
  if (youtubeEmbedUrl(href)) return "iframe";
  return "link";
}

function isMediaHref(href: string) {
  return Boolean(youtubeEmbedUrl(href) || [".mp3", ".m4a", ".wav", ".ogg", ".mp4", ".m4v", ".mov", ".webm"].includes(fileExtension(href)));
}

function mediaTitleFromHref(href: string) {
  const base = path.posix.basename(href.split("?")[0] ?? href, fileExtension(href));
  return humanizeTitleFromPath(base || href);
}

function collectMediaItems(lessons: NextStepShellLesson[], resources: ImportedResource[], config: IssueConfig) {
  const items: SocialMediaItem[] = [];
  const seen = new Set<string>();
  const add = (href: string, title: string, sourceLabel: string, groupLabel: string, description: string) => {
    if (!href || !isMediaHref(href)) return;
    const key = youtubeEmbedUrl(href) ?? href;
    if (seen.has(key)) return;
    seen.add(key);
    const kind = mediaKindForHref(href);
    items.push({
      id: `media-${items.length + 1}`,
      title: cleanResourceTitle(title, href),
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
    $("iframe, audio, video, source").each((_, element) => {
      const href = $(element).attr("src") ?? "";
      add(href, $(element).attr("title") ?? lesson.title, lesson.title, "Lesson media", `Connected to ${lesson.title}.`);
    });
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href") ?? "";
      add(href, normalizeWhitespace($(element).text()) || mediaTitleFromHref(href), lesson.title, "Lesson links", `Linked from ${lesson.title}.`);
    });
  }

  for (const resource of resources) {
    add(resource.href, resource.title, libraryCategoryLabel(resource.category), "Course files", resource.description);
  }

  return items;
}

function cleanStudyGuideText(value: string) {
  return normalizeWhitespace(value)
    .replace(/^Social Studies 20-1(?:\s+Unit\s+\d+)?\s*/i, "")
    .replace(/\bRequired Reading\b/gi, "")
    .replace(/\bPlease read pages?\s+\d+(?:\s*[-–]\s*\d+)?(?:\s+in the Exploring Nationalism textbook)?\.?/gi, "")
    .replace(/\bBig Ideas:\s*/gi, "")
    .replace(/\bClick here to\b.*$/i, "")
    .trim();
}

function splitStudyGuideSentences(value: string) {
  return cleanStudyGuideText(value)
    .split(/(?<=[.!?])\s+(?=[A-Z"“])/)
    .map((sentence) => cleanStudyGuideText(sentence))
    .filter((sentence) => sentence.length >= 45 && sentence.length <= 260)
    .filter((sentence) => !/^(?:previous|next|home|menu|journal|assignment|activity|required reading)\b/i.test(sentence))
    .filter((sentence) => !/\b(?:please read pages?|click here|my response|source note)\b/i.test(sentence));
}

function optionMatchText(option: StudyOption) {
  return `${option.title} ${option.prompt} ${option.answer.join(" ")}`;
}

function scoreStudyOptionForLesson(option: StudyOption, lesson: NextStepShellLesson) {
  const optionTokens = tokenizeForWorkbookMatch(optionMatchText(option));
  const optionTitle = option.title.toLowerCase();
  const lessonTitle = lesson.title.toLowerCase();
  const lessonText = `${lesson.title} ${lesson.summary} ${load(lesson.html).root().text().slice(0, 5000)}`;
  const lessonTokens = tokenizeForWorkbookMatch(lessonText);
  let score = 0;
  for (const token of optionTokens) {
    if (lessonTokens.has(token)) {
      score += 4;
    }
  }
  if (lessonTitle.includes(optionTitle)) {
    score += 18;
  }
  if (optionTitle === "national interest" && /\b(?:what is national interest|how do nations pursue their national interests|national interests and wwi)\b/i.test(lesson.title)) {
    score += 26;
  }
  if (optionTitle === "foreign policy" && /\bforeign policy\b/i.test(lesson.title)) {
    score += 24;
  }
  if (optionTitle === "first world war" && /\b(?:world war i|world war one|national interests and wwi|causes of world war)\b/i.test(lesson.title)) {
    score += 24;
  }
  if (optionTitle === "treaty of versailles" && /(?:peace treat|peace negotiation|treaty of versailles)/i.test(lesson.title)) {
    score += 40;
  }
  if (optionTitle === "holocaust" && /\bholocaust\b/i.test(lesson.title)) {
    score += 28;
  }
  if (optionTitle === "holocaust" && /\bthe holocaust\b/i.test(lesson.title)) {
    score += 32;
  }
  if (optionTitle === "holocaust" && /\bsetting the stage\b/i.test(lesson.title)) {
    score -= 10;
  }
  if (optionTitle === "ultranationalism" && /\bultranationalism\b/i.test(lesson.title)) {
    score += 24;
  }
  if (/peacekeeping/i.test(lesson.title) && !/peacekeeping/i.test(optionTitle)) {
    score -= 12;
  }
  if (/\b(?:glossary|overview|summary)\b/i.test(lesson.title)) {
    score -= 8;
  }
  return score;
}

function bestStudyGuideEvidence(option: StudyOption, lessons: NextStepShellLesson[]) {
  const rankedLessons = lessons
    .map((lesson) => ({ lesson, score: scoreStudyOptionForLesson(option, lesson) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const evidence: Array<{ title: string; sentence: string }> = [];
  const optionTokens = tokenizeForWorkbookMatch(optionMatchText(option));

  for (const { lesson } of rankedLessons) {
    const lessonBody = load(lesson.html).root().text();
    const text = cleanStudyGuideText(lessonBody).length > 60 ? lessonBody : lesson.summary;
    const sentences = splitStudyGuideSentences(text);
    const bestSentence =
      sentences
        .map((sentence) => ({
          sentence,
          score: Array.from(tokenizeForWorkbookMatch(sentence)).filter((token) => optionTokens.has(token)).length
        }))
        .sort((left, right) => right.score - left.score)[0]?.sentence ?? lesson.summary;
    const cleanedSentence = cleanStudyGuideText(bestSentence);
    const titlePrefix = cleanStudyGuideText(lesson.title);
    const sentenceWithoutTitle = cleanedSentence.toLowerCase().startsWith(titlePrefix.toLowerCase())
      ? cleanStudyGuideText(cleanedSentence.slice(titlePrefix.length))
      : cleanedSentence;
    if (sentenceWithoutTitle && !evidence.some((item) => item.sentence === sentenceWithoutTitle)) {
      evidence.push({
        title: lesson.title,
        sentence: sentenceWithoutTitle
      });
    }
  }

  return evidence.slice(0, 2);
}

function enrichStudyOptionAnswer(option: StudyOption, lessons: NextStepShellLesson[], config: IssueConfig) {
  const evidence = bestStudyGuideEvidence(option, lessons);
  const baseAnswer = option.answer.filter((paragraph) => normalizeWhitespace(paragraph).length > 0);
  const contentParagraph =
    evidence.length > 0
      ? `From the unit content, connect this answer to ${evidence
          .map((item) => `"${item.title}"`)
          .join(" and ")}. ${evidence.map((item) => item.sentence).join(" ")}`
      : `From the unit content, connect this answer back to the lesson pathway for ${config.title} and use a named course example instead of a memorized definition.`;
  const issueParagraph = `For this issue, the full answer should explain how the idea helps judge: ${config.issueQuestion} A strong response names the concept, gives the course example, and explains the consequence or tension that makes the example matter.`;
  const writingParagraph = `For source analysis or position writing, use this as evidence by stating the idea in your own words, attaching it to one specific lesson detail, and then explaining whether it supports, limits, or complicates a position on the issue.`;

  return {
    ...option,
    answer: [...baseAnswer, contentParagraph, issueParagraph, writingParagraph]
  };
}

function enrichStudyOptions(config: IssueConfig, lessons: NextStepShellLesson[]): IssueConfig {
  const expandedConfig = expandStudyOptions(config);
  return {
    ...expandedConfig,
    vocabulary: expandedConfig.vocabulary.map((option) => enrichStudyOptionAnswer(option, lessons, expandedConfig)),
    events: expandedConfig.events.map((option) => enrichStudyOptionAnswer(option, lessons, expandedConfig)),
    mainIdeas: expandedConfig.mainIdeas.map((option) => enrichStudyOptionAnswer(option, lessons, expandedConfig))
  };
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
    <a class="external-resource-action" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">Open Source</a>
  </div>`;
}

function groupMediaItems(items: SocialMediaItem[]) {
  const groups = new Map<string, SocialMediaItem[]>();
  for (const item of items) {
    const group = item.groupLabel || "Course media";
    groups.set(group, [...(groups.get(group) ?? []), item]);
  }
  return Array.from(groups.entries()).map(([label, groupItems]) => ({ label, items: groupItems }));
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
  const mediaGroups = groupMediaItems(mediaItems);
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
                <a class="external-resource-action" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">Open Source</a>
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
          <label class="social-film-room-label" for="${escapeHtml(config.slug)}-film-room-select">Choose media</label>
          <select id="${escapeHtml(config.slug)}-film-room-select" class="social-film-room-select" data-film-select>
            ${mediaItems.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join("\n")}
          </select>
        </section>
        <section class="social-film-room-playlist" aria-label="Film room playlist order">
          <h3>Playlist order</h3>
          ${mediaGroups
            .map(
              (group) => `<section class="social-film-room-playlist-group">
                <h4>${escapeHtml(group.label)}</h4>
                <ol>
                  ${group.items
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
  const checks = [
    "the issue question in my own words",
    "the most important vocabulary terms",
    "one historical example that supports a position",
    "one source detail that could appear in source analysis",
    "one counterargument or limit",
    "one piece of evidence worth saving"
  ];
  return `<section id="study-guide" class="course-page social-page" hidden data-writing-activity-panel>
    <p class="course-kicker">Study guide</p>
    <h2>Study Guide</h2>
    <p class="page-intro">Review the issue through active recall before shaping a final position.</p>
    <section class="social-study-guide-prep">
      <section class="social-study-guide-panel">
        <h3>Use the study guide in three passes</h3>
        <ol class="social-study-guide-routine">
          <li><strong>1. Mark what is unfamiliar</strong><span>Skim the guide once and list terms, examples, people, or policies you could not explain yet.</span></li>
          <li><strong>2. Explain the issue out loud</strong><span>Use the guide to answer the related issue in your own words before copying any notes.</span></li>
          <li><strong>3. Pull proof into writing</strong><span>Choose details that could support source analysis, position writing, or a counterargument.</span></li>
        </ol>
      </section>
      <section class="social-study-guide-panel social-study-guide-panel-accent">
        <h3>What to review for ${escapeHtml(config.title)}</h3>
        <div class="social-study-guide-checklist">
          ${checks
            .map(
              (check, index) => `<label class="social-study-guide-check">
                <input type="checkbox" data-response-id="${escapeHtml(config.slug)}:study-check:${index + 1}">
                <span>${escapeHtml(check)}</span>
              </label>`
            )
            .join("\n")}
        </div>
      </section>
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
      ${renderStudySelect(config.slug, "events", "Historical events and concepts", "Pick an example, explain what it shows, then reveal the unit answer to compare.", config.events)}
      ${renderStudySelect(config.slug, "main-ideas", "Main ideas", "Choose a main idea from the guide and connect it to diploma writing.", config.mainIdeas)}
    </section>
    ${renderActivityActions()}
  </section>`;
}

function groupResources(resources: ImportedResource[]) {
  const categories: Array<{ id: ImportedResource["category"]; label: string }> = [
    { id: "textbook", label: "Perspectives Textbook" },
    { id: "unit", label: "Issue Documents" },
    { id: "student", label: "Student Support Resources" },
    { id: "media", label: "Media Files" }
  ];
  return categories
    .map((category) => ({
      ...category,
      resources: resources.filter((resource) => resource.category === category.id)
    }))
    .filter((category) => category.resources.length > 0);
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
          ${grouped
            .map((group) => `<option value="${escapeHtml(group.id)}"${group.id === firstGroup ? " selected" : ""}>${escapeHtml(group.label)}</option>`)
            .join("\n")}
        </select>
      </label>
    </section>
    ${grouped
      .map(
        (group) => `<section class="social-resource-panel" data-resource-panel="${escapeHtml(group.id)}"${group.id === firstGroup ? "" : " hidden"}>
          <h3>${escapeHtml(group.label)}</h3>
          <div class="social-resource-grid">
            ${group.resources
              .map((resource) => `<article class="resource-card">
                <p class="social-resource-label">${escapeHtml(resource.category === "media" ? "Media Source" : "Course Source")}</p>
                <h3>${escapeHtml(resource.title)}</h3>
                <p>${escapeHtml(resource.description || resourceDescription(resource))}</p>
                <p class="source-path">${escapeHtml(resourceSourceLabel(resource))}</p>
                <a class="external-resource-action" href="${escapeHtml(resource.previewHref ?? resource.href)}" target="_blank" rel="noreferrer">Open Resource</a>
              </article>`)
              .join("\n")}
          </div>
        </section>`
      )
      .join("\n")}
  </section>`;
}

function renderNavItems(config: IssueConfig, lessons: NextStepShellLesson[], resources: ImportedResource[]): NextStepShellNavItem[] {
  return [
    { id: "issue-inquiry", label: "Issue Inquiry", icon: "explore", html: renderIssueInquiry(config) },
    { id: "source-analysis", label: "Source Analysis", icon: "fact_check", html: renderSourceAnalysis(config) },
    { id: "position-builder", label: "Position Builder", icon: "format_list_bulleted_add", html: renderPositionBuilder(config) },
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
  --ink-dark: #155608;
  --primary: #155608;
  --primary-strong: #1E6D0D;
  --surface: #FFFFFF;
  --surface-low: #F9F9F8;
  --surface-soft: #EAF7E6;
  --surface-muted: #DDE2DD;
  --surface-variant: #DDE2DD;
  --text-muted: #40493B;
}
body {
  background: #F9F9F8;
  color: #191C1C;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.course-topbar {
  background: #155608;
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
.top-progress-bar {
  border-color: #59A844;
  background: #EAF7E6;
}
.top-progress-fill {
  background: #FDBF3F;
}
.course-sidebar {
  background: #155608;
  color: #fff;
}
.sidebar-header {
  border-bottom: 1px solid #59A844;
}
.sublesson-unit {
  border-top-color: #59A844;
}
.sublesson-heading {
  color: #EAF7E6;
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
.resource-panel {
  max-width: 520px;
  margin: 24px 0 16px;
  padding: 18px 20px;
  border: 1px solid #DDE2DD;
  border-radius: 8px;
  background: #FFFFFF;
}
.resource-panel label {
  display: grid;
  gap: 10px;
  color: var(--primary);
  font-weight: 800;
}
.resource-panel select {
  min-height: 48px;
  border: 1px solid #CFD8CC;
  border-radius: 8px;
  padding: 0 14px;
  background: #FFFFFF;
  color: var(--ink);
  font-weight: 800;
}
.social-resource-panel {
  margin-top: 18px;
}
.social-resource-panel[hidden] {
  display: none !important;
}
.social-resource-panel > h3 {
  margin: 0 0 12px;
  color: var(--ink);
  font-size: 28px;
  line-height: 1.18;
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
  background: #FFFFFF;
  color: #191C1C;
  text-decoration: none;
}
.resource-card:hover,
.resource-card:focus-visible {
  border-color: #155608;
  background: #EAF7E6;
}
.resource-card h3 {
  margin: 0;
  color: var(--ink);
  font-size: 24px;
  line-height: 1.18;
}
.resource-card p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.45;
}
.social-document,
.social-diploma-panel,
.social-practice-gallery,
.social-support-reader,
.social-study-topic,
.social-study-checklist,
.social-evidence-notebook,
.social-evidence-panel {
  border: 1px solid #dfe5dd;
  border-radius: 8px;
  background: #fff;
  padding: 24px;
  margin: 0 0 24px;
}
.social-document-header {
  border-top: 6px solid var(--primary);
  padding: 28px 32px;
  background: #fff;
  border-radius: 8px 8px 0 0;
}
.social-document-header p,
.social-support-panel-header p {
  margin: 0 0 6px;
  color: var(--primary);
  font-weight: 800;
  font-size: .82rem;
}
.social-document-header h3,
.social-document h3,
.social-practice-gallery h3,
.social-study-topic h3 {
  margin: 0 0 8px;
}
.social-document-body {
  display: grid;
  gap: 22px;
  padding: 24px 32px 32px;
}
.social-diploma-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}
.social-diploma-steps-four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.social-diploma-steps-three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.social-diploma-steps article {
  border-left: 4px solid var(--primary);
  background: #f7f8f5;
  padding: 16px;
}
.social-source-coach,
.social-source-format,
.social-source-builder,
.social-source-routine {
  display: grid;
  gap: 18px;
}
.social-source-coach,
.social-source-format,
.social-source-builder {
  padding: 22px;
  border: 1px solid #DDE2DD;
  border-radius: 10px;
  background: #fff;
}
.social-source-builder,
.social-diploma-panel-accent {
  border-left: 6px solid #FDBF3F;
  background: #FFF0CF;
}
.social-source-coach h4,
.social-source-format h4,
.social-source-builder h4,
.social-source-routine h4,
.social-diploma-panel h4 {
  margin: 0;
  color: #191C1C;
  font-size: 28px;
  line-height: 1.1;
}
.social-source-coach p,
.social-source-format p,
.social-source-builder p,
.social-source-routine p,
.social-diploma-panel p {
  margin: 0;
  color: #40493B;
}
.social-source-coach-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}
.social-source-step,
.social-diploma-step,
.social-source-format-step {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-left: 4px solid #155608;
  background: #F9F9F8;
}
.social-source-format-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.social-source-format-step {
  border: 1px solid #DDE2DD;
}
.social-source-step strong,
.social-diploma-step strong,
.social-source-format-step strong,
.social-source-format-template strong,
.social-source-format-template span {
  color: #155608;
}
.social-source-step span,
.social-diploma-step span,
.social-source-format-step span {
  color: #40493B;
  line-height: 1.45;
}
.social-source-format-template {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-left: 5px solid #FDBF3F;
  background: #FFF0CF;
}
.social-source-format-template p {
  margin: 0;
  color: #191C1C;
}
.social-source-format-draft {
  display: grid;
  gap: 8px;
  color: #155608;
  font-weight: 800;
}
.social-source-format-draft textarea {
  min-height: 150px;
}
.social-stacked-fields,
.social-essay-builder-stack,
.social-position-map,
.social-counterargument-panel {
  display: grid;
  gap: 16px;
  margin: 0 0 24px;
}
.social-workbook-response {
  display: grid;
  gap: 8px;
  font-weight: 800;
  color: var(--primary);
}
.social-workbook-response textarea {
  width: 100%;
  min-height: 132px;
  resize: vertical;
  border: 1px solid #d7ded4;
  border-radius: 8px;
  padding: 16px;
  color: var(--ink);
  background: #fff;
}
.social-inquiry-field-stack {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.social-inquiry-field-stack > label {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border: 1px solid #DDE2DD;
  border-left: 5px solid #155608;
  border-radius: 10px;
  background: #fff;
}
.social-inquiry-field-stack textarea {
  min-height: 124px;
}
.social-three-column {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.social-section-heading-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 420px);
  gap: 24px;
  align-items: end;
  margin: 0 0 20px;
}
.social-select-label {
  display: grid;
  gap: 8px;
  color: var(--primary);
  font-weight: 800;
}
.social-select-label select {
  width: 100%;
  min-height: 52px;
  border: 1px solid #cfd8cc;
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  padding: 0 14px;
  font-weight: 700;
}
.social-practice-selected-source {
  display: grid;
  grid-template-columns: minmax(240px, .75fr) minmax(420px, 1.25fr);
  gap: 24px;
  border: 1px solid #dfe5dd;
  padding: 16px;
  margin: 0 0 20px;
}
.social-selected-source-copy p {
  margin: 0 0 6px;
  color: var(--primary);
  font-weight: 800;
}
.social-selected-source-figure {
  margin: 0;
  border: 1px solid #dfe5dd;
  padding: 12px;
}
.social-selected-source-figure img {
  display: block;
  width: 100%;
  max-height: 520px;
  object-fit: contain;
  background: #f8f9fa;
}
.social-selected-source-figure figcaption {
  margin: 10px 0 0;
  color: var(--text-muted);
}
.social-support-frame {
  width: 100%;
  min-height: 620px;
  border: 1px solid #dfe5dd;
  border-radius: 8px;
  background: #fff;
}
.social-support-panel[hidden],
.social-practice-selected-source[hidden],
.social-study-topic-panel[hidden] {
  display: none !important;
}
.social-support-file-card {
  border: 1px solid #dfe5dd;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
}
.social-library-browser {
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.social-library-list-panel {
  border: 1px solid #dfe5dd;
  border-radius: 8px;
  background: #fff;
  padding: 20px;
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 120px);
  overflow: auto;
}
.social-resource-label {
  display: block;
  color: var(--primary);
  font-weight: 800;
  font-size: .8rem;
  margin-bottom: 6px;
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
.social-library-doc-index {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
}
.social-library-doc-tab strong,
.social-library-doc-tab small {
  display: block;
}
.social-library-doc-tab small {
  color: var(--text-muted);
  margin-top: 3px;
}
.social-library-reader-stack {
  min-width: 0;
}
.social-library-reader-panel {
  border: 1px solid #dfe5dd;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}
.social-library-reader-panel[hidden] {
  display: none !important;
}
.social-library-reader-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  padding: 22px 24px;
  border-bottom: 1px solid #dfe5dd;
}
.social-library-reader-header h3 {
  margin: 0 0 6px;
}
.source-path {
  color: var(--text-muted);
  margin: 6px 0 0;
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
.social-film-room-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
  gap: 24px;
  align-items: start;
}
.social-film-room-stage,
.social-film-room-sidebar {
  min-width: 0;
}
.social-film-panel,
.social-film-room-control,
.social-film-room-playlist {
  border: 1px solid #dfe5dd;
  border-radius: 8px;
  background: #fff;
  padding: 20px;
}
.social-film-panel[hidden] {
  display: none !important;
}
.social-film-room-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.social-film-room-header > div {
  min-width: 0;
}
.social-film-room-header .external-resource-action {
  flex: 0 0 auto;
  align-self: flex-start;
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
.social-film-room-placeholder {
  border: 1px dashed #cfd8cc;
  border-radius: 8px;
  padding: 24px;
  background: #f8f9fa;
}
.social-film-room-sidebar {
  display: grid;
  gap: 16px;
}
.social-film-room-label {
  display: grid;
  gap: 8px;
  color: var(--primary);
  font-weight: 800;
}
.social-film-room-select {
  min-height: 52px;
  border: 1px solid #cfd8cc;
  border-radius: 8px;
  padding: 0 14px;
  font-weight: 700;
  background: #fff;
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
.social-film-room-playlist-group:first-of-type {
  margin-top: 0;
}
.social-film-room-playlist-group h4 {
  margin: 0;
  color: var(--primary);
  font-size: 16px;
}
.social-film-room-playlist li {
  margin-bottom: 14px;
}
.social-film-room-playlist strong,
.social-film-room-playlist span,
.social-film-room-playlist small {
  display: block;
}
.social-film-room-playlist small {
  color: var(--text-muted);
}
.social-teaching-list {
  display: grid;
  gap: 10px;
  margin: 0 0 20px;
}
.social-apply-grid,
.social-evidence-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}
.social-essay-builder-row {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid #DDE2DD;
  border-left: 5px solid #155608;
  border-radius: 10px;
  background: #fff;
  color: #155608;
  font-weight: 800;
}
.social-essay-builder-title,
.social-essay-builder-cue {
  display: block;
}
.social-essay-builder-title {
  color: #155608;
  font-size: 16px;
  line-height: 1.25;
}
.social-essay-builder-cue {
  color: #40493B;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
}
.social-essay-builder-row textarea {
  min-height: 150px;
}
.social-print-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  padding-top: 6px;
}
.social-check-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #e6ece3;
  font-weight: 700;
}
.social-check-row input {
  margin-top: 5px;
}
.social-reveal-answer {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #ecdba8;
  border-radius: 8px;
  background: #fff7df;
}
.social-reveal-answer summary {
  cursor: pointer;
  color: var(--primary);
  font-weight: 800;
}
.social-study-guide-prep,
.social-study-guide-practice {
  display: grid;
  gap: 18px;
  margin-top: 24px;
}
.social-study-guide-panel {
  display: grid;
  gap: 16px;
  padding: 22px;
  border: 1px solid #DDE2DD;
  border-radius: 10px;
  background: #fff;
}
.social-study-guide-panel-accent {
  border-left: 6px solid #FDBF3F;
  background: #FFF0CF;
}
.social-study-guide-panel h3 {
  margin: 0 0 6px;
  color: #191C1C;
  font-size: 28px;
  line-height: 1.1;
}
.social-study-guide-panel p {
  margin: 0;
  color: #40493B;
}
.social-study-guide-routine {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.social-study-guide-routine li,
.social-study-topic-panel {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid #DDE2DD;
  border-left: 5px solid #155608;
  background: #fff;
  color: #40493B;
  line-height: 1.45;
}
.social-study-guide-routine strong {
  color: #155608;
}
.social-study-guide-checklist {
  display: grid;
  gap: 10px;
}
.social-study-guide-check {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #E0D5B6;
  background: #fff;
  color: #40493B;
  line-height: 1.45;
}
.social-study-guide-check input {
  width: 20px;
  height: 20px;
  margin: 1px 0 0;
  accent-color: #155608;
}
.social-study-guide-selector-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 360px);
  gap: 18px;
  align-items: end;
}
.social-study-guide-select-label {
  display: grid;
  gap: 8px;
  margin: 0;
  color: #155608;
  font-weight: 800;
}
.social-study-guide-select {
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  border: 1px solid #B9C3B4;
  border-radius: 8px;
  background: #fff;
  color: #191C1C;
  font: inherit;
}
.social-study-topic-panel[hidden] {
  display: none;
}
.social-study-topic-panel h4 {
  margin: 0 0 4px;
  color: #191C1C;
  font-size: 22px;
  line-height: 1.15;
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
.social-merged-lesson-part {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #DDE2DD;
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
.social-embedded-context strong {
  color: #155608;
}
.social-embedded-context p {
  margin: 0;
  color: #191C1C;
  line-height: 1.5;
}
.social-embedded-question-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.social-embedded-question-number {
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
.social-embedded-activity label {
  display: grid;
  gap: 8px;
  color: #155608;
  font-weight: 800;
}
.social-embedded-activity textarea {
  min-height: 128px;
  resize: vertical;
  border: 1px solid #d7ded4;
  border-radius: 8px;
  padding: 16px;
  color: var(--ink);
  background: #fff;
}
@media (max-width: 900px) {
  .social-diploma-steps,
  .social-source-coach-steps,
  .social-source-format-grid,
  .social-diploma-steps-four,
  .social-diploma-steps-three,
  .social-section-heading-row,
  .social-study-guide-selector-header,
  .social-three-column,
  .social-practice-selected-source,
  .social-apply-grid,
  .social-evidence-layout,
  .social-library-browser,
  .social-library-reader-header,
  .social-film-room-shell,
  .social-film-room-header {
    grid-template-columns: 1fr;
  }
  .social-resource-grid {
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

async function writeMetadata(config: IssueConfig, sourcePaths: string[], lessonCount: number, podcastReport: SocialPodcastMappingReport) {
  const projectDir = path.join(ROOT, "projects", config.slug);
  const now = new Date().toISOString();
  const metadata = {
    id: config.slug,
    slug: config.slug,
    sourcePath: sourcePaths[0],
    supportSourcePath: sourcePaths.slice(1).join(" | "),
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
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
      path.join(ROOT, "scripts", "build-social20-related-issues.ts"),
      path.join(ROOT, "scripts", "lib", "nso-podcasts.ts"),
      path.join(ROOT, "scripts", "lib", "next-step-course-shell.ts")
    ],
    generatedOutputs: [],
    regenerateCommand: `npx tsx scripts/build-social20-related-issues.ts --only ${config.slug}`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: sourcePaths[0],
      importedAt: now,
      notes: `${config.title} generated from Social Studies 20-1 Brightspace and CBE resource ZIPs.`
    },
    exportTargets: [
      {
        target: "scorm",
        enabled: true,
        notes: "SCORM 2004 package for Brightspace upload."
      },
      {
        target: "html",
        enabled: true,
        notes: "Standalone workspace preview."
      }
    ],
    authoringStatus: "active",
    referenceOnly: [...sourcePaths, path.join(projectDir, "raw", "README.md")],
    sourceOfTruthNotes:
      "Regenerate this Social 20-1 workspace through scripts/build-social20-related-issues.ts and the shared Next Step shell.",
    conversionSummary: {
      relatedIssue: config.title,
      issueQuestion: config.issueQuestion,
      units: [config.unitPrefix.replace("/", "")],
      lessonsRecovered: lessonCount,
      podcastsPlaced: podcastReport.counts.placed + podcastReport.counts.fallbackOverview,
      podcastFallbackOverview: podcastReport.counts.fallbackOverview,
      styleVariant: "social-20-final-social-30-pattern"
    }
  };

  await fs.mkdir(path.join(projectDir, "meta"), { recursive: true });
  await fs.writeFile(path.join(projectDir, "meta", "project.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  await fs.writeFile(
    path.join(projectDir, "meta", "conversion-notes.md"),
    `# ${config.title} Conversion Notes\n\n- Issue question: ${config.issueQuestion}\n- Lessons recovered: ${lessonCount}\n- Podcasts placed: ${podcastReport.counts.placed + podcastReport.counts.fallbackOverview}\n- Builder: scripts/build-social20-related-issues.ts\n- Pattern source: docs/workflows/social-20-1-from-social-30-final-product.md\n- Podcast source: ${PODCAST_LIST_PATH}\n\nThis workspace is generated from local Social Studies 20-1 Brightspace and CBE resource ZIPs, with NSO podcast links layered into matching lessons and Film Room media.\n`
  );
}

async function buildIssue(config: IssueConfig, bundles: Map<string, ZipBundle>, podcastEntries: NsoPodcastEntry[]) {
  const projectDir = path.join(ROOT, "projects", config.slug);
  const workspaceDir = path.join(projectDir, "workspace");
  const rawDir = path.join(projectDir, "raw");
  const studioEditRebuild = process.argv.includes("--studio-edit");
  await resetGeneratedWorkspace(workspaceDir);
  if (!studioEditRebuild) await fs.mkdir(rawDir, { recursive: true });

  for (const bundle of bundles.values()) {
    await extractZipToWorkspace(bundle, workspaceDir);
  }
  await copyBrandAssets(workspaceDir);

  const unitBundle = bundles.get(config.unitZipKey);
  if (!unitBundle) {
    throw new Error(`Missing unit bundle ${config.unitZipKey}`);
  }

  const baseLessons = await buildLessons(unitBundle, config);
  const enrichedConfig = enrichStudyOptions(config, baseLessons);
  const podcastMapping = buildPodcastConnections(enrichedConfig, baseLessons, podcastEntries);
  const lessons = injectLessonPodcastConnections(
    enrichedConfig,
    injectLessonWorkbookActivities(
      enrichedConfig,
      baseLessons,
      await collectLessonWorkbookCandidates(bundles, enrichedConfig)
    ),
    podcastMapping.connections
  );
  const resources = await collectResources(bundles, enrichedConfig, workspaceDir);
  addPodcastResources(resources, podcastMapping.connections);
  const renderedHtml = renderNextStepCourseShell({
    slug: enrichedConfig.slug,
    courseTitle: enrichedConfig.title,
    courseCode: "Social Studies 20-1",
    overviewIntro: enrichedConfig.overviewIntro,
    outcomes: [
      `I can explain how these lessons connect to ${enrichedConfig.issueQuestion}`,
      "I can analyze sources for perspective, evidence, bias, and nationalist assumptions.",
      "I can collect evidence from lessons and resources to support a defensible position.",
      "I can refine my thinking into a clear Social Studies 20-1 position response."
    ],
    lessons,
    navItems: renderNavItems(enrichedConfig, lessons, resources),
    lessonGroupTitle: enrichedConfig.title,
    lessonSequenceTitle: "Lesson pathway",
    sourceLessonLabel: "imported lessons",
    nextAfterLastLesson: { id: "issue-inquiry", label: "Start Issue Inquiry" },
    extraCss: extraCss()
  });

  const html = await applyStoredCourseEdits({ repoRoot: path.resolve("."), projectSlug: config.slug, html: renderedHtml, workspaceDir });
  await fs.writeFile(path.join(workspaceDir, "index.html"), html);
  if (!studioEditRebuild) {
    await fs.mkdir(rawDir, { recursive: true });
    await fs.writeFile(
      path.join(rawDir, "README.md"),
      `# ${config.title}\n\nGenerated from the Social Studies 20-1 Brightspace/CBE ZIP set. Use the workspace HTML as the editable preview source.\n`
    );
  }
  await writeMetadata(
    config,
    [...Array.from(bundles.values()).map((bundle) => bundle.sourcePath), PODCAST_LIST_PATH],
    lessons.length,
    podcastMapping.report
  );
  await writePodcastMappingReport(projectDir, podcastMapping.report);

  return { slug: config.slug, lessons: lessons.length };
}

function parseArgs(argv: string[]) {
  const flags = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : "true";
    flags.set(key, value);
  }
  return flags;
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const only = flags.get("only");
  const bundles = new Map<string, ZipBundle>();
  for (const [key, sourcePath] of Object.entries(DEFAULT_ZIPS)) {
    bundles.set(key, await loadZipBundle(key, sourcePath));
  }
  const podcastEntries = await parseNsoPodcastEntries(PODCAST_LIST_PATH, "Social Studies 20");

  const targets = only ? ISSUE_CONFIGS.filter((config) => config.slug === only) : ISSUE_CONFIGS;
  if (targets.length === 0) {
    throw new Error(`No Social 20-1 issue matched --only ${only}`);
  }

  for (const config of targets) {
    const result = await buildIssue(config, bundles, podcastEntries);
    console.log(`${result.slug}: ${result.lessons} lessons generated`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
