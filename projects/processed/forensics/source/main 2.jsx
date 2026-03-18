import __CanvasHelperReactDomClient from "https://esm.sh/react-dom@19.1.1/client";
import React, { useMemo, useState } from "https://esm.sh/react@19.1.1";
import {
  Home,
  BookOpen,
  BarChart3,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  FileText,
  ClipboardCheck,
  Library,
  Search,
  PlayCircle,
  ShieldCheck,
  FileImage,
  FileQuestion,
  FileBadge,
  Bookmark,
} from "https://esm.sh/lucide-react@0.542.0?deps=react@19.1.1";

const actualHtmlSamples = {
  citeSources: `
    <div class="lesson-html">
      <h1>When asked to provide your sources use the following link to help you cite using APA or MLA formats:</h1>
      <div class="image-banner">Exported image banner preserved here in the real build</div>
      <p><strong>External citation helper:</strong> EasyBib / Chegg citation guidance link</p>
    </div>
  `,
  assignmentSubmission: `
    <div class="lesson-html">
      <h1>Submission Instructions</h1>
      <p>When submitting your assignments go to the corresponding drop box and follow the instructions below for the format you are using.</p>
      <h3>For Digital (Online) Assignments - Submit from Google Drive</h3>
      <ol>
        <li>Authorize Google Apps in Brightspace if needed.</li>
        <li>Select <strong>Choose Existing</strong>.</li>
        <li>Select <strong>Google Drive</strong>.</li>
        <li>Search for the file and click <strong>Add</strong>.</li>
        <li>Click <strong>Submit</strong>.</li>
      </ol>
      <h3>For Print Assignments - Scan using Adobe Scan</h3>
      <ol>
        <li>Scan using the Adobe Scan instructions.</li>
        <li>Select <strong>Upload</strong>.</li>
        <li>Locate the file and click <strong>Add</strong>.</li>
        <li>Click <strong>Submit</strong>.</li>
      </ol>
    </div>
  `,
  evidenceOverview: `
    <div class="lesson-html">
      <h3>Module Overview</h3>
      <h2>Types of Evidence &amp; Fingerprint Analysis</h2>
      <p>A person cannot be convicted of a crime simply because the police believe that he or she is guilty. The only way to convict a person successfully of a criminal act is by obtaining evidence that proves the individual committed the crime. This is known as the burden of proof.</p>
      <p>Fingerprint collection and fingerprint pattern analysis have been used to apprehend and convict criminals for over 100 years. Because individual fingerprint patterns are unique, fingerprints distinguish one person from another.</p>
      <ul>
        <li>introduce two categories of physical evidence with examples of each type</li>
        <li>explain the cause of and types of fingerprint patterns</li>
        <li>explain techniques used to enhance hidden fingerprints</li>
        <li>examine historical and fictional criminal investigations</li>
      </ul>
    </div>
  `,
  evidenceTypes: `
    <div class="lesson-html">
      <h2>Identified Evidence and Individualized Evidence</h2>
      <p>Physical evidence from a crime scene comes in many different forms, such as fingerprints, hair, blood, saliva, semen, skin, bone, bullet casings, paint fragments, and fibers.</p>
      <p>Finding and interpreting physical evidence is crucial because it can prove that a crime has been committed, establish the identity of suspects, exonerate the innocent, corroborate testimony, and be more reliable than eyewitness evidence.</p>
      <table>
        <thead>
          <tr><th>Individualized Physical Evidence</th><th>Identified Physical Evidence</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Unique and directly linked to a specific person or source. Examples: fingerprints, DNA, bullet casings, dental impressions.</td>
            <td>Shares a common source or class. Examples: clothing, shoe prints, blood type, paint chips.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
};

const course = {
  title: "Forensic Studies 25",
  subtitle: "Manifest-based course player preview built from the uploaded Brightspace export",
  stats: { topLevelSections: 12, totalNodes: 172 },
  modules: [
    {
      id: "course-info",
      title: "Course Information",
      lessonCount: 6,
      lessons: [
        {
          id: "outline",
          title: "Course outline (MUST READ)",
          type: "pdf",
          sourceFile: "сontent/idd074817-3b63-4e7f-b095-637a00ea461e/FS25 outline (summer school).pdf",
          pdfMeta: { pages: 14, size: "652 KB" },
          learn: {
            heading: "Course outline (MUST READ)",
            excerpt: "This source exports as a PDF. In the real player this opens inside an in-app PDF viewer instead of throwing students into a detached file download.",
            bullets: [
              "Preserve PDF inside the lesson shell",
              "Show page navigation and zoom",
              "Keep previous/next navigation around the PDF",
              "Avoid breaking the course flow",
            ],
            callout: "Static source files should stay integrated into the course experience instead of becoming detached downloads.",
          },
          resources: ["Original PDF source", "Course shell metadata"],
        },
        {
          id: "cite",
          title: "How to Properly Cite Sources",
          type: "html-reading",
          sourceFile: "сontent/i0d0b4605-e0e8-481c-84d0-9813d78b146d/How to Properly Cite Sources.html",
          htmlSample: actualHtmlSamples.citeSources,
          learn: {
            heading: "How to Properly Cite Sources",
            excerpt: "The exported file is a simple HTML page with supporting images and an external citation resource.",
            bullets: [
              "Simple HTML reading page",
              "Uses supporting images",
              "Includes an external citation help link",
              "Needs modern spacing and image treatment",
            ],
            callout: "This is the kind of page builders oversimplify when they should just render it cleanly.",
          },
          resources: ["Original HTML page", "External citation help link"],
        },
        {
          id: "submission",
          title: "Assignment Submission",
          type: "html-reading",
          sourceFile: "сontent/i1b9d5df3-0b57-4109-9a00-d3f42192d5e2/Assignment Submission.html",
          htmlSample: actualHtmlSamples.assignmentSubmission,
          learn: {
            heading: "Assignment Submission",
            excerpt: "The real exported page includes step-by-step directions for digital submissions through Brightspace and Google Drive.",
            bullets: [
              "Step-by-step instructions",
              "Digital submission workflow",
              "Course operations support page",
              "Should be easy to find, not buried",
            ],
            callout: "Operational pages matter because if the site hides them you answer the same dumb questions all term.",
          },
          resources: ["Original HTML instructions", "Drive/Brightspace workflow"],
        },
      ],
    },
    {
      id: "m2-evidence-fingerprints",
      title: "2 Types of Evidence and Fingerprint Analysis",
      lessonCount: 22,
      lessons: [
        {
          id: "overview",
          title: "Types of Evidence and Fingerprint Analysis",
          type: "html-reading",
          sourceFile: "сontent/i2fbe29e6-e968-4c68-8cd5-dde0abd398b1/Content/book_1412/chapter_11952.html",
          htmlSample: actualHtmlSamples.evidenceOverview,
          learn: {
            heading: "Types of Evidence & Fingerprint Analysis",
            excerpt: "This is a text-rich lesson, not just a slide. The player needs to preserve the reading and make it easier to navigate.",
            bullets: [
              "Burden of proof",
              "Physical evidence matters",
              "Fingerprinting has long investigative value",
              "Text-rich lesson that should stay intact",
            ],
            callout: "This is exactly the kind of lesson AI builders butcher when they start summarizing.",
          },
          resources: ["Original HTML reading", "Fingerprint analysis sequence"],
        },
        {
          id: "evidence-types",
          title: "Evidence Types",
          type: "html-reading",
          sourceFile: "сontent/i01a08fc7-ba72-40e7-83cd-07fe01d50d49/Content/book_1412/chapter_11953.html",
          htmlSample: actualHtmlSamples.evidenceTypes,
          learn: {
            heading: "Identified Evidence and Individualized Evidence",
            excerpt: "The lesson lists examples such as fingerprints, hair, blood, saliva, semen, skin, bone, bullet casings, paint fragments, and fibres, and explains why interpreting evidence matters.",
            bullets: [
              "Evidence categories",
              "Examples of physical evidence",
              "Interpretation matters",
              "Strong candidate for glossary support",
            ],
            callout: "This should become easier to compare, not shorter.",
          },
          resources: ["Original HTML page", "Evidence sorting practice"],
        },
        {
          id: "assignment",
          title: "Types of Evidence and Fingerprint Analysis Assignment",
          type: "assignment",
          sourceFile: "assignment/i0073cf68-ef89-4190-b368-d429ee0816f0/assignment_80f86dff-581e-4e9f-abe9-d5407d926f3f.xml",
          assignmentMeta: { points: 20, submissionType: "file upload" },
          assignmentXml: {
            intro: "After a crime has occurred, criminal investigators use scientific techniques and/or forensic science experts to help identify and interpret physical evidence from the crime scene.",
            individualized: "Individualized Physical Evidence is unique and can be directly linked to a specific person and/or source. Examples: fingerprints, DNA, bullets, dental impressions.",
            identified: "Identified Physical Evidence shares a common source and can be grouped into a class of items having similar properties. Examples: clothing, shoe prints, blood type.",
            task: "Complete the assignment, make your own copy of the linked document, add your name, and submit the file below.",
            reminder: "If you need a refresher on submissions, use the Course Information section.",
          },
          resources: ["Assignment XML", "Submission workflow"],
        },
        {
          id: "assessment",
          title: "M2 Types of Evidence and Fingerprint Analysis Assessment",
          type: "quiz",
          sourceFile: "quiz/i0649d126-890d-4d3e-b83f-c563065521db/qti_c38fc56d-87c6-481d-958a-c13ba81b9304.xml",
          quizMeta: { attempts: 1, timeLimitMinutes: 120, profile: "Examination" },
          quizSample: {
            question: "Which of the following is an identified piece of physical evidence?",
            choices: ["Blood type", "Bullet casings", "Nuclear DNA", "Fingerprint impression"],
            answerIndex: 0,
          },
          resources: ["QTI XML", "Assessment settings"],
        },
        {
          id: "slide",
          title: "Brief History of Fingerprinting",
          type: "image-slide",
          sourceFile: "сontent/ided21828-5e62-49a3-aae1-6cf000ed83f6/Content/book_1412/chapter_11957.html",
          learn: {
            heading: "Brief History of Fingerprinting",
            excerpt: "This lesson appears in the fingerprint sequence and should flow into pattern types, matching logic, and case studies.",
            bullets: [
              "Belongs in fingerprint learning arc",
              "Would benefit from a timeline treatment",
              "Should connect to later case studies",
              "Media-first presentation",
            ],
            callout: "History content gets lost when builders flatten modules.",
          },
          resources: ["Original source file", "Fingerprint sequence map"],
        },
        {
          id: "video",
          title: "Real Life CSI - Crime Scene Cleaners",
          type: "embedded-video",
          sourceFile: "сontent/i145c4276-895a-4176-b79e-d1ff5e43abab/Content/book_1408/chapter_11883.html",
          learn: {
            heading: "Real Life CSI - Crime Scene Cleaners",
            excerpt: "Video nodes should keep transcript links, surrounding lesson notes, and next-step navigation visible.",
            bullets: [
              "Responsive embed",
              "Keep video in shell",
              "Keep transcript and notes nearby",
              "Do not detach media from module flow",
            ],
            callout: "Video pages should not become awkward dead-end wrappers.",
          },
          resources: ["Embedded media page", "Related lesson notes"],
        },
      ],
    },
  ],
};

const flatLessons = course.modules.flatMap((module) =>
  module.lessons.map((lesson) => ({
    ...lesson,
    moduleId: module.id,
    moduleTitle: module.title,
    moduleLessonCount: module.lessonCount,
  }))
);

function Badge({ children }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

function typeLabel(type) {
  const map = {
    assignment: "ASSIGNMENT",
    quiz: "QUIZ",
    pdf: "PDF",
    "embedded-video": "VIDEO",
    "image-slide": "SLIDE",
    "html-reading": "READING",
  };
  return map[type] || "RESOURCE";
}

function typeIcon(type) {
  const map = {
    assignment: ClipboardCheck,
    quiz: FileQuestion,
    pdf: FileBadge,
    "embedded-video": PlayCircle,
    "image-slide": FileImage,
    "html-reading": FileText,
  };
  return map[type] || FileText;
}

function SidebarItem({ active, completed, lesson, onClick }) {
  const Icon = typeIcon(lesson.type);
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-sky-200 bg-sky-50 text-slate-900 shadow-sm"
          : "border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {completed ? <CheckCircle2 className="h-4 w-4 text-sky-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          <div className="truncate text-sm font-medium">{lesson.title}</div>
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">{typeLabel(lesson.type)}</div>
      </div>
    </button>
  );
}

function HtmlRenderer({ html }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">HTML renderer</div>
      <div
        className="max-w-none text-slate-700 [&_.image-banner]:my-4 [&_.image-banner]:rounded-2xl [&_.image-banner]:border [&_.image-banner]:border-slate-200 [&_.image-banner]:bg-slate-50 [&_.image-banner]:p-8 [&_.image-banner]:text-center [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-3 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-50 [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function PdfRenderer({ meta, title }) {
  const pages = meta?.pages || 1;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">PDF renderer</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-900">{title}</h4>
        </div>
        <div className="flex gap-2">
          <Badge>{meta?.size || "PDF"}</Badge>
          <Badge>{pages} pages</Badge>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Pages</div>
          <div className="space-y-2">
            {Array.from({ length: Math.min(pages, 6) }).map((_, i) => (
              <div
                key={i}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  i === 0 ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                Page {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
            <span>Page 1 of {pages}</span>
            <div className="flex gap-2">
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5">Fit</button>
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5">−</button>
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5">+</button>
            </div>
          </div>
          <div className="mx-auto flex min-h-[520px] max-w-[760px] items-center justify-center rounded-xl border border-slate-300 bg-white p-8 text-center text-sm leading-7 text-slate-500 shadow-inner">
            PDF page canvas would render here with real pagination, zoom, and outline support.
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideRenderer({ title }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Image / slide renderer</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-900">{title}</h4>
        </div>
        <div className="flex gap-2">
          <Badge>responsive media</Badge>
          <Badge>zoom ready</Badge>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/95">
        <div className="flex min-h-[460px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_35%),linear-gradient(180deg,_#1e293b,_#020617)] p-10 text-center">
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/10">
              <FileImage className="h-7 w-7 text-sky-300" />
            </div>
            <h4 className="text-2xl font-semibold text-white">{title}</h4>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Original exported slide/image asset would render here with preserved visuals, zoom support, and optional caption treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignmentRenderer({ data, meta, title }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Assignment XML renderer</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-900">{title}</h4>
        </div>
        <div className="flex gap-2">
          <Badge>{meta?.points || 0} pts</Badge>
          <Badge>{meta?.submissionType || "submission"}</Badge>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          <p>{data?.intro}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">Individualized evidence</div>
              <p className="mt-2 text-emerald-950">{data?.individualized}</p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-800">Identified evidence</div>
              <p className="mt-2 text-sky-950">{data?.identified}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Task</div>
            <p className="mt-2 text-sm leading-7 text-slate-700">{data?.task}</p>
            <p className="mt-3 text-sm text-slate-500">{data?.reminder}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Submission flow</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>1. Open linked document</li>
              <li>2. Create your own copy</li>
              <li>3. Add your name</li>
              <li>4. Submit to the dropbox</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizRenderer({ quiz, meta, selected, setSelected, showFeedback, setShowFeedback }) {
  const correct = selected === quiz?.answerIndex;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">QTI quiz renderer</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-900">Assessment preview</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{meta?.profile || "Assessment"}</Badge>
          <Badge>{meta?.attempts || 1} attempt</Badge>
          <Badge>{meta?.timeLimitMinutes || 0} min</Badge>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm leading-7 text-slate-700">{quiz?.question}</p>
          <div className="mt-5 space-y-3">
            {quiz?.choices?.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelected(idx);
                  setShowFeedback(false);
                }}
                className={`w-full rounded-2xl border p-4 text-left text-sm transition ${
                  selected === idx ? "border-sky-300 bg-sky-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setShowFeedback(true)} className="rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white">
              Check answer
            </button>
            <button
              onClick={() => {
                setSelected(undefined);
                setShowFeedback(false);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              Reset
            </button>
          </div>
          {showFeedback && selected !== undefined && (
            <div className={`mt-5 rounded-2xl border p-4 ${correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              <div className={`text-sm font-semibold ${correct ? "text-emerald-800" : "text-rose-800"}`}>{correct ? "Correct" : "Wrong"}</div>
              <p className={`mt-2 text-sm leading-7 ${correct ? "text-emerald-950" : "text-rose-950"}`}>
                In the exported quiz, the correct identified evidence example is <strong>{quiz?.choices?.[quiz?.answerIndex]}</strong>.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Assessment panel</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Question count would be parsed from QTI</li>
              <li>Attempt rules live here</li>
              <li>Timing and settings stay visible</li>
              <li>Review mode can be separated from attempt mode</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
            QTI should not remain opaque package junk. The player should surface enough structure that assessments feel connected to the lesson sequence.
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoRenderer({ title }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Embedded video renderer</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-900">{title}</h4>
        </div>
        <Badge>responsive embed</Badge>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,_#0f172a,_#111827)]">
          <div className="text-center">
            <PlayCircle className="mx-auto h-14 w-14 text-sky-300" />
            <div className="mt-3 text-lg font-semibold text-white">{title}</div>
            <p className="mt-2 max-w-lg text-sm text-slate-300">The real build would embed the exported video page cleanly here instead of leaving it as an awkward detached Brightspace wrapper.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderNodePreview(activeLesson, quizState) {
  if (activeLesson.type === "html-reading" && activeLesson.htmlSample) return <HtmlRenderer html={activeLesson.htmlSample} />;
  if (activeLesson.type === "pdf") return <PdfRenderer meta={activeLesson.pdfMeta} title={activeLesson.title} />;
  if (activeLesson.type === "image-slide") return <SlideRenderer title={activeLesson.title} />;
  if (activeLesson.type === "assignment") return <AssignmentRenderer data={activeLesson.assignmentXml} meta={activeLesson.assignmentMeta} title={activeLesson.title} />;
  if (activeLesson.type === "quiz") return <QuizRenderer quiz={activeLesson.quizSample} meta={activeLesson.quizMeta} {...quizState} />;
  if (activeLesson.type === "embedded-video") return <VideoRenderer title={activeLesson.title} />;
  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600">No renderer preview available for this node yet.</div>;
}

export default function ForensicCoursePlayerPreviewRestored() {
  const [expanded, setExpanded] = useState({ "course-info": true, "m2-evidence-fingerprints": true });
  const [activeLessonId, setActiveLessonId] = useState("overview");
  const [activeTab, setActiveTab] = useState("learn");
  const [completed, setCompleted] = useState({ outline: true, cite: true, overview: false });
  const [saved, setSaved] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [query, setQuery] = useState("");

  const activeLesson = useMemo(() => flatLessons.find((l) => l.id === activeLessonId) || flatLessons[0], [activeLessonId]);
  const activeModule = useMemo(() => course.modules.find((m) => m.id === activeLesson.moduleId), [activeLesson]);
  const lessonIndex = flatLessons.findIndex((l) => l.id === activeLessonId);
  const progress = Math.round((Object.values(completed).filter(Boolean).length / flatLessons.length) * 100);
  const moduleCompleted = activeModule ? activeModule.lessons.filter((l) => completed[l.id]).length : 0;
  const moduleProgress = activeModule ? Math.round((moduleCompleted / activeModule.lessons.length) * 100) : 0;

  const filteredModules = course.modules
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => lesson.title.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((module) => module.lessons.length > 0 || query.length === 0);

  const goToLesson = (id) => {
    setActiveLessonId(id);
    setActiveTab("learn");
    setShowFeedback(false);
  };

  const goPrev = () => {
    if (lessonIndex > 0) goToLesson(flatLessons[lessonIndex - 1].id);
  };

  const goNext = () => {
    if (lessonIndex < flatLessons.length - 1) goToLesson(flatLessons[lessonIndex + 1].id);
  };

  const markComplete = () => setCompleted((prev) => ({ ...prev, [activeLessonId]: true }));
  const toggleSaved = () => setSaved((prev) => ({ ...prev, [activeLessonId]: !prev[activeLessonId] }));

  const quizState = {
    selected: selectedAnswers[activeLessonId],
    setSelected: (value) => setSelectedAnswers((prev) => ({ ...prev, [activeLessonId]: value })),
    showFeedback,
    setShowFeedback,
  };

  const hasLearn = !!activeLesson.learn;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-20 shrink-0 border-r border-slate-200 bg-slate-950 text-white md:flex md:flex-col md:items-center md:gap-3 md:px-3 md:py-5">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 ring-1 ring-white/10">
            <ShieldCheck className="h-5 w-5 text-sky-300" />
          </div>
          {[
            { icon: Home, label: "Home" },
            { icon: BookOpen, label: "Modules" },
            { icon: ClipboardCheck, label: "Progress" },
            { icon: FolderOpen, label: "Resources" },
            { icon: BarChart3, label: "Grades" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className={`flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-3 text-xs ${
                label === "Modules" ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <aside className="w-[340px] shrink-0 border-r border-slate-200 bg-slate-50">
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="mb-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Course</div>
              <h1 className="mt-1 text-xl font-semibold">{course.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{course.subtitle}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Preview progress</span>
                <span className="font-semibold text-slate-900">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div className="rounded-xl bg-slate-50 p-2">{course.stats.topLevelSections} sections</div>
                <div className="rounded-xl bg-slate-50 p-2">{course.stats.totalNodes} nodes</div>
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search real lesson titles"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-300"
              />
            </div>
          </div>

          <div className="h-[calc(100vh-245px)] overflow-y-auto px-3 py-3">
            {filteredModules.map((module) => (
              <div key={module.id} className="mb-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [module.id]: !prev[module.id] }))}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-semibold">{module.title}</div>
                    <div className="text-xs text-slate-500">{module.lessonCount} items in export</div>
                  </div>
                  {expanded[module.id] ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </button>
                {expanded[module.id] && (
                  <div className="mt-1 space-y-1 px-1 pb-1">
                    {module.lessons.map((lesson) => (
                      <SidebarItem
                        key={lesson.id}
                        active={lesson.id === activeLessonId}
                        completed={!!completed[lesson.id]}
                        lesson={lesson}
                        onClick={() => goToLesson(lesson.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="px-8 py-5">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>Home</span>
                <span>›</span>
                <span>{activeLesson.moduleTitle}</span>
                <span>›</span>
                <span>{typeLabel(activeLesson.type)}</span>
                <Badge>real export node</Badge>
                {saved[activeLessonId] && <Badge>saved</Badge>}
              </div>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">{activeLesson.title}</h2>
                  <p className="mt-2 max-w-4xl text-sm text-slate-500">
                    This preview uses the real uploaded export structure and real node types. The shell and renderer strategy are no longer fictional.
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    onClick={toggleSaved}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    {saved[activeLessonId] ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={markComplete}
                    className="rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-600"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Module progress</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{moduleProgress}%</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Node type</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{typeLabel(activeLesson.type)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Source path</div>
                  <div className="mt-1 truncate text-sm font-semibold text-slate-900">{activeLesson.sourceFile}</div>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${((lessonIndex + 1) / flatLessons.length) * 100}%` }} />
              </div>
            </div>
            <div className="flex gap-1 border-t border-slate-200 px-8">
              {[
                { key: "learn", label: "Learn", icon: FileText },
                { key: "practice", label: "Practice", icon: PlayCircle },
                { key: "assignment", label: "Assignments", icon: ClipboardCheck },
                { key: "resources", label: "Resources", icon: Library },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
                    activeTab === key ? "border-sky-500 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-8 py-8">
            {activeTab === "learn" && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="space-y-6">
                  <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center gap-2">
                      <Badge>source-preserving model</Badge>
                      <Badge>{activeLesson.moduleLessonCount} items in module</Badge>
                      <Badge>{typeLabel(activeLesson.type)}</Badge>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight">{hasLearn ? activeLesson.learn.heading : activeLesson.title}</h3>
                    <p className="mt-5 text-[15px] leading-7 text-slate-700">
                      {hasLearn
                        ? activeLesson.learn.excerpt
                        : "This node is present in the real export and would be rendered directly from its underlying file in the next build stage."}
                    </p>
                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Source file</div>
                        <div className="mt-4 break-all rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs leading-6 text-slate-600">
                          {activeLesson.sourceFile}
                        </div>
                        {hasLearn && (
                          <ul className="mt-4 space-y-3">
                            {activeLesson.learn.bullets.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                                <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <div className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-800">Design note</div>
                        <p className="mt-4 text-sm leading-7 text-amber-900">
                          {hasLearn
                            ? activeLesson.learn.callout
                            : "Some nodes only need correct routing, clear navigation, and proper file rendering inside the shell."}
                        </p>
                      </div>
                    </div>
                  </section>

                  {renderNodePreview(activeLesson, quizState)}

                  <section className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">What Phase 2 proves</div>
                      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                        <p>HTML lessons can be normalized and rendered as readable in-app pages.</p>
                        <p>PDF nodes can live in a dedicated viewer shell instead of being dumped as detached files.</p>
                        <p>Assignment XML can be transformed into a clean instruction card without losing the original task.</p>
                        <p>QTI quiz XML can be surfaced as usable assessment content instead of opaque package junk.</p>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">What Phase 3 proves</div>
                      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                        <p>The lesson header gives users sequence, module, and context.</p>
                        <p>The sidebar uses the real module hierarchy and real lesson names.</p>
                        <p>The shell now behaves like an LMS instead of a dressed-up file viewer.</p>
                        <p>Progress, save state, and in-context tools belong in the shell, not scattered across pages.</p>
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lesson tools</div>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <Bookmark className="h-4 w-4" /> Bookmark / save this node
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Jump to module assessment</div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">View linked resources</div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Node summary</div>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                      <p><strong>Module:</strong> {activeLesson.moduleTitle}</p>
                      <p><strong>Type:</strong> {typeLabel(activeLesson.type)}</p>
                      <p><strong>Rendered from:</strong> export asset path</p>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {activeTab === "practice" && (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Prototype practice layer</div>
                  <h3 className="text-2xl font-semibold tracking-tight">What should this node’s enhancement layer do?</h3>
                  <div className="mt-6 space-y-3">
                    {[
                      "Rewrite the lesson into a shorter AI summary and remove the source content.",
                      "Preserve the source node and add retrieval, comparison, or sequencing practice around it.",
                      "Flatten the whole module into a single scrolling page so students stop seeing lesson boundaries.",
                      "Hide assignments and quizzes until the end of the unit.",
                    ].map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedAnswers((prev) => ({ ...prev, [activeLessonId]: idx }));
                          setShowFeedback(false);
                        }}
                        className={`w-full rounded-2xl border p-4 text-left text-sm transition ${
                          selectedAnswers[activeLessonId] === idx ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setShowFeedback(true)} className="rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600">
                      Check answer
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAnswers((prev) => ({ ...prev, [activeLessonId]: undefined }));
                        setShowFeedback(false);
                      }}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Reset
                    </button>
                  </div>
                  {showFeedback && selectedAnswers[activeLessonId] !== undefined && (
                    <div
                      className={`mt-6 rounded-2xl border p-5 ${
                        selectedAnswers[activeLessonId] === 1 ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                      }`}
                    >
                      <div
                        className={`text-sm font-semibold ${
                          selectedAnswers[activeLessonId] === 1 ? "text-emerald-800" : "text-rose-800"
                        }`}
                      >
                        {selectedAnswers[activeLessonId] === 1 ? "Correct" : "Wrong"}
                      </div>
                      <p
                        className={`mt-2 text-sm leading-7 ${
                          selectedAnswers[activeLessonId] === 1 ? "text-emerald-950" : "text-rose-950"
                        }`}
                      >
                        The source lesson stays. The practice layer sits around it. That is the whole point of this project.
                      </p>
                    </div>
                  )}
                </section>
                <section className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Good enhancement types</div>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                      <li>Retrieval questions</li>
                      <li>Evidence classification tasks</li>
                      <li>Case-study comparisons</li>
                      <li>Vocabulary and glossary support</li>
                      <li>Sequencing procedural steps</li>
                    </ul>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "assignment" && (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Assignment / task treatment</div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">Node handling strategy</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    Assignments, quizzes, and resources should not sit as detached ugly files. They should be surfaced as structured cards tied back to the lesson sequence and source content.
                  </p>
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-sm font-semibold text-slate-800">Success checklist</div>
                    <ul className="mt-4 space-y-3">
                      {["Map source file", "Render instructions cleanly", "Keep related resources visible"].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-sky-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
                <section className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Why this tab exists</div>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                      <p>Students need the task connected to the concept they just learned.</p>
                      <p>The exported package already has assignment XML and QTI quiz nodes. The player should expose them cleanly.</p>
                      <p>That is more useful than a prettier mock with fake content.</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "resources" && (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Resources</div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {(activeLesson.resources || []).map((resource, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
                            <FileText className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{resource}</div>
                            <div className="text-xs text-slate-500">Tied to the selected export node</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Reality check</div>
                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    The old mock proved the layout. This version proves the layout can hold the actual course structure and mixed file types.
                  </p>
                </section>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <button
                onClick={goPrev}
                disabled={lessonIndex === 0}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              <div className="text-sm text-slate-500">Node {lessonIndex + 1} of {flatLessons.length} shown in this canvas subset</div>
              <button
                onClick={goNext}
                disabled={lessonIndex === flatLessons.length - 1}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const __canvasHelperRootElement = document.getElementById("root");
if (__canvasHelperRootElement) {
  __CanvasHelperReactDomClient.createRoot(__canvasHelperRootElement).render(<ForensicCoursePlayerPreviewRestored />);
}
