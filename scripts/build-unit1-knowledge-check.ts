import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createEmptyProject } from "../MY OWN BUILT QUIZ GENERATOR/brightspacequizexporter/src/core/model/createEmptyProject";
import { createQuestion } from "../MY OWN BUILT QUIZ GENERATOR/brightspacequizexporter/src/core/model/createQuestion";
import { exportBrightspaceCsv } from "../MY OWN BUILT QUIZ GENERATOR/brightspacequizexporter/src/export/brightspaceCsv/exportBrightspaceCsv";
import { createSourceDocument } from "../MY OWN BUILT QUIZ GENERATOR/brightspacequizexporter/src/ingest/shared/sourceDocument";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(scriptDir);
const outputDir = join(repoRoot, "projects", "genpsy-studio", "meta");
const timestamp = new Date().toISOString();

const studentAssessmentPdfOrigin = join(
  repoRoot,
  "projects",
  "resources",
  "genpsy-studio",
  "Copy of Personal Psychology 20 Unit 1.pdf"
);
const answerReferencePdfOrigin = join(
  repoRoot,
  "projects",
  "resources",
  "genpsy-studio",
  "PerPsy20AB01Key.pdf"
);
const lessonPdfOrigin = join(
  repoRoot,
  "projects",
  "resources",
  "genpsy-studio",
  "unit 1.pdf"
);

const sections = [
  {
    sectionId: "part-one-multiple-choice",
    title: "Part One: Multiple-Choice Items",
    description: "",
    instructions: "Read each item carefully and choose the best answer.",
    orderIndex: 0,
    metadataTags: ["unit-1", "multiple-choice"]
  },
  {
    sectionId: "part-two-true-false",
    title: "Part Two: True or False",
    description: "",
    instructions: "Decide whether each statement is true or false.",
    orderIndex: 1,
    metadataTags: ["unit-1", "true-false"]
  },
  {
    sectionId: "part-three-written-response",
    title: "Part Three: Written-Response Items",
    description: "",
    instructions: "Respond in complete thoughts using the lesson content.",
    orderIndex: 2,
    metadataTags: ["unit-1", "written-response"]
  }
] as const;

const caseStudies = {
  a: [
    "Billy, a galley cook on a Navy ship, was facing daily complaints from the crew about the lemon Jell-O he was serving. Because of an ordering error, lemon was the only flavour of Jell-O purchased for consumption during the four-month exercise. There was no cherry Jell-O and the crew was unhappy.",
    "Because the ship was not going to be in port for another two months, Billy had to act in a creative manner: he added red food colouring to the lemon Jell-O. When the red-coloured lemon Jell-O was served to the sailors, no one complained."
  ],
  b: [
    "One hundred forty male college students were asked to read a summary of a fictitious date between Brad and Barb. The students were divided into two groups of 70 people each. The only difference in the descriptions each group received was the amount of popcorn Brad ate during the movie.",
    "In one version Brad ate only a couple of handfuls. In the other version he ate almost all of his popcorn. Researchers then asked the two groups how much weight they thought Brad could bench press."
  ],
  c: [
    "A group of students starting university were treated to a movie and given popcorn as part of their orientation experience. Before the movie began, the students were also offered jelly beans. Half were presented jelly beans in a tray divided into six sections, with each flavour kept separate.",
    "The other half were offered the jelly beans in a mixed container. Researchers calculated the average number of jelly beans taken by individuals in the two groups. When the flavours were separated, students took an average of 12 jelly beans. When the assortment was mixed, students took an average of 23."
  ],
  d: [
    "The same researchers for Case Study C decided to try an experiment using M&M's candy. With M&M's, the taste of each piece of candy is the same regardless of colour. In this experiment, a group of students were given M&M's to snack on while watching a video.",
    "Half of the students were given bowls that had 7 colours of candy while the remaining students were given bowls that had 10 colours. Students who had 7 colours of M&M's ate an average of 56 pieces. Those who had 10 colours ate an average of 99 pieces."
  ],
  e: [
    "Surgeries occur every minute of every day. Some operations require patients to receive only local anaesthetic while others require patients to be under general anaesthetic. Anaesthesiologists must use patient data such as age, mass, and allergies in their calculations of how much general anaesthetic to use for a given patient.",
    "Researcher Daniel Sessler believes the gene that produces red pigment also produces a hormone that increases pain sensitivity. He hypothesizes that people with red hair feel pain more intensely than people with brown hair. To test this theory, Dr. Sessler enlisted ten women with dark brown hair and ten women with red hair, then adjusted anaesthetic gas exposure while monitoring reaction to a mild electric shock.",
    "Results showed that the subjects with red hair needed 20% more anaesthetic than subjects with brown hair."
  ]
} as const;

type CaseStudyId = keyof typeof caseStudies;

type MultipleChoiceQuestionSpec = {
  id: string;
  prompt: string;
  options: readonly string[];
  correctLabel: string;
  caseStudy?: CaseStudyId;
};

type TrueFalseQuestionSpec = {
  id: string;
  prompt: string;
  isTrue: boolean;
};

type WrittenResponseQuestionSpec = {
  id: string;
  prompt: string;
  caseStudy?: CaseStudyId;
};

const multipleChoiceQuestions: MultipleChoiceQuestionSpec[] = [
  {
    id: "u1_part1_q1",
    prompt: "Psychology is the study of",
    options: ["hypnosis", "the human soul", "human behaviour", "subconscious thoughts"],
    correctLabel: "C"
  },
  {
    id: "u1_part1_q2",
    prompt: "This group of helping professionals have medical degrees and can prescribe medication.",
    options: ["Counsellors", "Psychiatrists", "Psychologists", "Paraprofessionals"],
    correctLabel: "B"
  },
  {
    id: "u1_part1_q3",
    prompt: "Research in this branch of psychology may involve the effects of hormones on mood.",
    options: ["Social", "Behavioural", "Physiological", "Developmental"],
    correctLabel: "C"
  },
  {
    id: "u1_part1_q4",
    prompt: "Researchers in this field may study how infants learn to crawl.",
    options: ["Social", "Behavioural", "Physiological", "Developmental"],
    correctLabel: "D"
  },
  {
    id: "u1_part1_q5",
    prompt: "This branch of psychology may investigate the effects of overcrowding and its relationship to stress.",
    options: ["Social", "Behavioural", "Physiological", "Developmental"],
    correctLabel: "A"
  },
  {
    id: "u1_part1_q6",
    prompt: "Researchers training monkeys to use sign language would be considered _____ psychologists.",
    options: ["social", "behavioural", "physiological", "developmental"],
    correctLabel: "B"
  },
  {
    id: "u1_part1_q7",
    prompt: "Researchers in this branch of psychology may study the phenomena of remembering and forgetting.",
    options: ["Clinical", "Cognitive", "Abnormal", "Parapsychology"],
    correctLabel: "B"
  },
  {
    id: "u1_part1_q8",
    prompt: "These psychologists might conduct research into the causes of anxiety attacks and post-traumatic stress disorder (PTSD).",
    options: ["Clinical", "Cognitive", "Abnormal", "Parapsychology"],
    correctLabel: "C"
  },
  {
    id: "u1_part1_q9",
    prompt: "A person in this field may look for energy traces or patterns of ghosts and apparitions.",
    options: ["Clinical", "Cognitive", "Abnormal", "Parapsychology"],
    correctLabel: "D"
  },
  {
    id: "u1_part1_q10",
    prompt: "This type of psychologist might use group therapy to help people with addictions.",
    options: ["Clinical", "Cognitive", "Abnormal", "Parapsychology"],
    correctLabel: "A"
  },
  {
    id: "u1_part1_q11",
    prompt: "Generally speaking, children and intellectually disabled adults cannot be hypnotized because they",
    options: [
      "do not trust others sufficiently",
      "do not have any serious problems",
      "are not as intelligent as healthy adults",
      "are not able to focus and concentrate sufficiently"
    ],
    correctLabel: "D"
  },
  {
    id: "u1_part1_q12",
    prompt: "The independent (or manipulated) variable in Case Study A is",
    options: ["sailors at sea", "Jell-O colour", "time away from port", "satisfaction level of the sailors"],
    correctLabel: "B",
    caseStudy: "a"
  },
  {
    id: "u1_part1_q13",
    prompt: "The dependent (or responding) variable in Case Study A is",
    options: ["sailors at sea", "Jell-O colour", "time away from port", "satisfaction level of the sailors"],
    correctLabel: "D",
    caseStudy: "a"
  },
  {
    id: "u1_part1_q14",
    prompt: "The independent (or manipulated) variable in Case Study B is the",
    options: [
      "amount of popcorn Brad ate",
      "amount of weight Brad was thought to bench press",
      "level of hunger Brad was experiencing during the movie",
      "type of movie Brad was watching while eating the popcorn"
    ],
    correctLabel: "A",
    caseStudy: "b"
  },
  {
    id: "u1_part1_q15",
    prompt: "The dependent (or responding) variable in Case Study B is",
    options: [
      "amount of popcorn Brad ate",
      "amount of weight Brad was thought to bench press",
      "level of hunger Brad was experiencing during the movie",
      "type of movie Brad was watching while eating the popcorn"
    ],
    correctLabel: "B",
    caseStudy: "b"
  },
  {
    id: "u1_part1_q16",
    prompt: "The difference between a control group and an experimental group is that the _____ group is exposed to the _____ variable.",
    options: ["control; dependent", "control; independent", "experimental; dependent", "experimental; independent"],
    correctLabel: "D",
    caseStudy: "b"
  },
  {
    id: "u1_part1_q17",
    prompt: "Which of the following experiments would require a control group?",
    options: [
      "Determining which gender moves their hands more when giving a speech.",
      "Testing to see if mnemonics help people remember grocery lists.",
      "Investigating if healthy 5 year-old males have better balance than healthy 50 year-old males.",
      "Exploring who has better hand-eye coordination, left-handed women or right-handed women."
    ],
    correctLabel: "B",
    caseStudy: "b"
  },
  {
    id: "u1_part1_q18",
    prompt: "The formal term for a predicted outcome of an experiment is a(n)",
    options: ["theory", "hypothesis", "assumption", "supposition"],
    correctLabel: "B",
    caseStudy: "b"
  },
  {
    id: "u1_part1_q19",
    prompt: "The independent (manipulated) variable in Case Study C is the",
    options: [
      "flavours of jelly beans",
      "arrangement of jelly beans",
      "number of jelly beans consumed",
      "orientation of the university students"
    ],
    correctLabel: "B",
    caseStudy: "c"
  },
  {
    id: "u1_part1_q20",
    prompt: "The dependent (responding) variable in Case Study C is the",
    options: [
      "flavours of jelly beans",
      "arrangement of jelly beans",
      "number of jelly beans consumed",
      "orientation of the university students"
    ],
    correctLabel: "C",
    caseStudy: "c"
  }
] as const;

const trueFalseQuestions: TrueFalseQuestionSpec[] = [
  { id: "u1_part2_q1", prompt: "To be hypnotized, a person must have a disorder such as an addiction or chronic pain.", isTrue: false },
  { id: "u1_part2_q2", prompt: "You cannot easily observe covert behaviour.", isTrue: true },
  { id: "u1_part2_q3", prompt: "Data collected in an experiment is called empirical evidence.", isTrue: true },
  { id: "u1_part2_q4", prompt: "The unqualified use of hypnosis may disguise serious problems and delay proper treatment.", isTrue: true },
  { id: "u1_part2_q5", prompt: "The Canadian Council on Animal Care monitors all animal research that occurs in Canada.", isTrue: false },
  { id: "u1_part2_q6", prompt: "The Canadian Council on Animal Care can influence the research funding a university receives from the government.", isTrue: true },
  { id: "u1_part2_q7", prompt: "Developmental psychology is concerned with how humans evolved from the apes.", isTrue: false },
  { id: "u1_part2_q8", prompt: "Brushing your teeth after lunch is an abnormal behaviour.", isTrue: false },
  { id: "u1_part2_q9", prompt: "Social psychology involves the influences people have on each other.", isTrue: true },
  { id: "u1_part2_q10", prompt: "Extraneous factors add scientific merit to an experiment.", isTrue: false }
] as const;

const writtenResponseQuestions: WrittenResponseQuestionSpec[] = [
  {
    id: "u1_part3_q1",
    prompt: "What is an overt behaviour? Provide an original example."
  },
  {
    id: "u1_part3_q2",
    prompt: "What is a covert behaviour? Provide an original example."
  },
  {
    id: "u1_part3_q3",
    prompt: "Explain why the researchers would need to use participants that liked chocolate and who were not colour-blind.",
    caseStudy: "d"
  },
  {
    id: "u1_part3_q4",
    prompt: "The M&M's Case Study implies that increased variety can increase food consumption. Provide one reason why a person might want to encourage increased food consumption.",
    caseStudy: "d"
  },
  {
    id: "u1_part3_q5",
    prompt: "What is the independent (manipulated) variable?",
    caseStudy: "e"
  },
  {
    id: "u1_part3_q6",
    prompt: "What is the dependent (responding) variable?",
    caseStudy: "e"
  },
  {
    id: "u1_part3_q7",
    prompt:
      "The women in this study were aware they were going to be shocked. If dogs were used instead of people, they would not understand they would not be severely or permanently hurt. In your opinion, would it be acceptable to conduct a similar test on dogs? Would it matter if the knowledge gained from the experiment would help veterinarians perform surgery on dogs in the future? Explain.",
    caseStudy: "e"
  }
] as const;

function buildCaseStudyPrompt(label: CaseStudyId, prompt: string) {
  return [`Case Study ${label.toUpperCase()}:`, ...caseStudies[label], "", prompt].join("\n\n");
}

function commonQuestionFields(sectionId: string, prompt: string, tags: string[]) {
  return {
    sectionId,
    prompt,
    sourceReference: "Copy of Personal Psychology 20 Unit 1.pdf",
    originText: prompt,
    confidenceScore: 1,
    reviewStatus: "approved" as const,
    metadataTags: ["genpsy-studio", "unit-1", ...tags]
  };
}

function createMultipleChoiceQuestion(
  questionId: string,
  prompt: string,
  options: readonly string[],
  correctLabel: string,
  tags: string[]
) {
  const question = createQuestion({
    questionId,
    type: "multiple_choice",
    points: 1,
    answerStatus: "verified",
    ...commonQuestionFields("part-one-multiple-choice", prompt, tags)
  });

  if (question.type !== "multiple_choice") {
    throw new Error(`Expected multiple_choice question for ${questionId}`);
  }

  const choices = question.choices.map((choice, index) => ({
    ...choice,
    text: options[index] ?? choice.text,
    isCorrect: choice.label === correctLabel
  }));
  const correctChoice = choices.find((choice) => choice.label === correctLabel);

  if (!correctChoice) {
    throw new Error(`Missing correct answer ${correctLabel} for ${questionId}`);
  }

  return {
    ...question,
    choices,
    correctAnswers: [correctChoice.choiceId]
  };
}

function createTrueFalseQuestion(questionId: string, prompt: string, isTrue: boolean) {
  const question = createQuestion({
    questionId,
    type: "true_false",
    points: 1,
    answerStatus: "verified",
    ...commonQuestionFields("part-two-true-false", prompt, ["part-two", "true-false"])
  });

  if (question.type !== "true_false") {
    throw new Error(`Expected true_false question for ${questionId}`);
  }

  const correctChoiceId = `${questionId}_${isTrue ? "choice_true" : "choice_false"}`;

  return {
    ...question,
    choices: question.choices.map((choice) => ({
      ...choice,
      isCorrect: choice.choiceId === correctChoiceId
    })),
    correctAnswers: [correctChoiceId]
  };
}

function createWrittenResponseQuestion(questionId: string, prompt: string, tags: string[]) {
  return createQuestion({
    questionId,
    type: "written_response",
    points: 1,
    answerStatus: "missing",
    ...commonQuestionFields("part-three-written-response", prompt, tags)
  });
}

function buildQuestions() {
  const partOne = multipleChoiceQuestions.map((question) =>
    createMultipleChoiceQuestion(
      question.id,
      question.caseStudy ? buildCaseStudyPrompt(question.caseStudy, question.prompt) : question.prompt,
      question.options,
      question.correctLabel,
      ["part-one", "multiple-choice", ...(question.caseStudy ? [`case-study-${question.caseStudy}`] : [])]
    )
  );

  const partTwo = trueFalseQuestions.map((question) =>
    createTrueFalseQuestion(question.id, question.prompt, question.isTrue)
  );

  const partThree = writtenResponseQuestions.map((question) =>
    createWrittenResponseQuestion(
      question.id,
      question.caseStudy ? buildCaseStudyPrompt(question.caseStudy, question.prompt) : question.prompt,
      ["part-three", "written-response", ...(question.caseStudy ? [`case-study-${question.caseStudy}`] : [])]
    )
  );

  return [...partOne, ...partTwo, ...partThree];
}

async function main() {
  const project = createEmptyProject({
    projectId: "genpsy-studio-unit-1-knowledge-check",
    title: "Personal Psychology 20 Unit 1 Knowledge Check",
    description:
      "Canonical Unit 1 knowledge check built from the real student assessment PDF, with answer support taken from the lesson text and the Unit 1 key reference.",
    courseName: "Personal Psychology 20",
    subjectTags: ["genpsy-studio", "unit-1", "knowledge-check"],
    sourceDocuments: [
      createSourceDocument({
        name: "Unit 1 Student Knowledge Check",
        type: "pdf",
        origin: studentAssessmentPdfOrigin,
        importedAt: timestamp
      }),
      createSourceDocument({
        name: "Unit 1 Answer Reference",
        type: "pdf",
        origin: answerReferencePdfOrigin,
        importedAt: timestamp
      }),
      createSourceDocument({
        name: "Unit 1 Lesson Textbook Source",
        type: "pdf",
        origin: lessonPdfOrigin,
        importedAt: timestamp
      })
    ],
    sections: sections.map((section) => ({
      ...section,
      metadataTags: [...section.metadataTags]
    })),
    questions: buildQuestions(),
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const exportResult = exportBrightspaceCsv(project);
  if (exportResult.status !== "success" || exportResult.content === null) {
    throw new Error(
      `Failed to export Unit 1 knowledge check CSV: ${exportResult.diagnostics
        .map((diagnostic) => diagnostic.message)
        .join("; ")}`
    );
  }

  await mkdir(outputDir, { recursive: true });

  await writeFile(
    join(outputDir, "unit-1-knowledge-check.project.json"),
    `${JSON.stringify(project, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    join(outputDir, "unit-1-knowledge-check-brightspace.csv"),
    exportResult.content,
    "utf8"
  );

  console.log(
    JSON.stringify(
      {
        projectPath: join(outputDir, "unit-1-knowledge-check.project.json"),
        csvPath: join(outputDir, "unit-1-knowledge-check-brightspace.csv"),
        questionCount: project.questions.length
      },
      null,
      2
    )
  );
}

await main();
