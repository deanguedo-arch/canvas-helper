import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";
import { lookup as mimeTypeForPath } from "mime-types";
import sharp from "sharp";

export const BIOLOGY30_MEDIA_PILOT_PROJECT = "biology30-unit-a-pilot" as const;

export const BIOLOGY30_MEDIA_DECKS = [
  {
    id: "chapter-11",
    chapter: 11,
    originalFilename: "Unit A Chapter 11 Notes.pptx",
    sha256: "74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1",
    slideCount: 66,
    mediaCount: 68,
    youtubeCount: 22,
    externalLinkCount: 2
  },
  {
    id: "chapter-12",
    chapter: 12,
    originalFilename: "Unit A Chapter 12 Notes.pptx",
    sha256: "4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea",
    slideCount: 29,
    mediaCount: 34,
    youtubeCount: 8,
    externalLinkCount: 1
  },
  {
    id: "chapter-13",
    chapter: 13,
    originalFilename: "Unit A Chapter 13 Notes.pptx",
    sha256: "05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482",
    slideCount: 43,
    mediaCount: 50,
    youtubeCount: 15,
    externalLinkCount: 0
  }
] as const;

type DeckId = (typeof BIOLOGY30_MEDIA_DECKS)[number]["id"];
type Treatment = "direct" | "crop" | "redraw" | "semantic-html" | "video" | "reference-only" | "excluded";

type VideoDefinition = {
  id: string;
  title: string;
  provider: string;
  lessonIds: string[];
  watchFor: string;
  localFallback: string;
};

const EXCLUDED_VIDEO_REASONS: Record<string, string> = {
  ecGEcj1tBBI: "The source video is unavailable through the provider.",
  jaWrMYChc5A: "The source video is not available for reliable embedded playback.",
  RNLceVI8jcc: "The source video is no longer available for reliable embedded playback.",
  "jEHwB1PG_-Q": "Medical self-help framing is not needed for this curriculum outcome.",
  FPH5CFSmYEU: "Medical self-help framing duplicates the local stress instruction.",
  HKHuQYVcxG4: "A lower-authority duplicate is replaced by the selected stress resource.",
  qEEEu1HEtU0: "The topic is outside the Unit A instructional focus.",
  "-w8n9UOiBxE": "The topic is outside the Unit A instructional focus.",
  cVf38y07cfk: "The study-skills topic is outside the Unit A instructional focus.",
  I9XG8EBwdSU: "The study-skills topic is outside the Unit A instructional focus."
};

export const BIOLOGY30_MEDIA_PRIMARY_LESSON_VIDEO_IDS = [
  "A44brRGG4Ys",
  "oa6rvUJlg7o",
  "YcJy28Nnrb8",
  "q8NtmDrb_qo",
  "4WcZR_k_a0I",
  "o0DYP-u1rNM",
  "Ie2j7GpC4JU",
  "eWHH9je2zG4",
  "BYaR-JgbjCs",
  "cDGmsR2ZILE",
  "y9Bdi4dnSlg",
  "v-t1Z5-oPtU"
] as const;

export const BIOLOGY30_MEDIA_REVIEW_VIDEO_IDS = [
  "qPix_X-9t7E",
  "SCV_m91mN-Q"
] as const;

export const BIOLOGY30_MEDIA_LEARNER_VIDEO_IDS = [
  "qPix_X-9t7E", "A44brRGG4Ys", "aaQWxko6qmk", "4WcZR_k_a0I", "ZAmUjvgoO0A",
  "oa6rvUJlg7o", "_0PFBI5K9s4", "vzA3pQB25Xk", "GvUrdCQv3JM", "YcJy28Nnrb8",
  "QY9NTVh-Awo", "DPWEhl7gbu4", "q8NtmDrb_qo", "0-8PvNOdByc", "jYlxv9gUYSs",
  "o0DYP-u1rNM", "nnCrnWOiKG4", "MJxxFwVu1OM", "Ie2j7GpC4JU", "T8lKKlnnC6M",
  "LkGOGzpbrCk", "98-6WfdumZY", "ryGMI3SpxCE", "eWHH9je2zG4", "cDGmsR2ZILE",
  "y9Bdi4dnSlg", "XfyGv-xwjlI", "8IUZjCSkbrc", "v-t1Z5-oPtU", "BYaR-JgbjCs",
  "QHkGG4TimvQ", "SCV_m91mN-Q", "lgqbs5a6Guw", "k_QhDbUd654", "GYQyWYHt_vk"
] as const;

const VIDEO_DEFINITIONS: VideoDefinition[] = [
  { id: "qPix_X-9t7E", title: "The Nervous System, Part 1", provider: "CrashCourse", lessonIds: ["lesson-06", "lesson-17"], watchFor: "Separate sensory input, central processing, and motor output, then connect that pathway to the unit's neuron and sensory evidence.", localFallback: "The nervous system detects change, integrates information in the CNS, and coordinates responses through peripheral pathways. For unit review, connect that route to neuron signalling, synapses, reflexes, and sensory receptors." },
  { id: "A44brRGG4Ys", title: "Structure of a Neuron", provider: "Shukin Science", lessonIds: ["lesson-03"], watchFor: "Connect each neuron structure to the direction of information flow.", localFallback: "Dendrites receive input, the cell body integrates it, the axon carries an action potential, and terminals communicate with the next cell." },
  { id: "aaQWxko6qmk", title: "Reflex Arc", provider: "Miss Angler", lessonIds: ["lesson-07"], watchFor: "Track the route from receptor to spinal integration and motor response.", localFallback: "A withdrawal reflex can use a receptor, sensory neuron, spinal interneuron, motor neuron, and effector before conscious pain is processed." },
  { id: "4WcZR_k_a0I", title: "Types of Neurons: Reflex Arcs", provider: "Shukin Science", lessonIds: ["lesson-07"], watchFor: "Distinguish sensory, interneuron, and motor roles in one complete pathway.", localFallback: "Sensory neurons carry input toward the CNS, interneurons integrate within the CNS, and motor neurons carry output to effectors." },
  { id: "ZAmUjvgoO0A", title: "Action Potential Explained", provider: "Bittersweet Biology", lessonIds: ["lesson-04"], watchFor: "Match channel state and ion direction to each voltage phase.", localFallback: "Threshold opens voltage-gated sodium channels, sodium entry depolarizes the membrane, sodium-channel inactivation and potassium efflux repolarize it, and channel recovery creates the refractory period." },
  { id: "oa6rvUJlg7o", title: "Action Potential in the Neuron", provider: "Harvard Extension School", lessonIds: ["lesson-04"], watchFor: "Pause at each graph phase and name the open channel, moving ion, and voltage direction.", localFallback: "An action potential is an all-or-none, regenerated voltage event. Sodium entry drives depolarization; sodium-channel inactivation and potassium exit drive repolarization; delayed potassium-channel closing contributes to the undershoot." },
  { id: "_0PFBI5K9s4", title: "Action Potential, Part 1", provider: "Shukin Science", lessonIds: ["lesson-04"], watchFor: "Notice what threshold changes about voltage-gated sodium channels.", localFallback: "A subthreshold change fades, but threshold recruits enough voltage-gated sodium channels to start regenerative depolarization." },
  { id: "vzA3pQB25Xk", title: "Action Potential, Part 2", provider: "Shukin Science", lessonIds: ["lesson-04"], watchFor: "Connect sodium-channel inactivation and potassium-channel timing to recovery.", localFallback: "The falling phase is produced by sodium-channel inactivation and delayed potassium efflux, not by a sudden reversal of the sodium-potassium pump." },
  { id: "GvUrdCQv3JM", title: "Excitatory vs. Inhibitory Neurotransmitters", provider: "Shukin Science", lessonIds: ["lesson-05"], watchFor: "Compare how synaptic input moves membrane potential toward or away from threshold.", localFallback: "Excitatory input usually moves the postsynaptic membrane toward threshold; inhibitory input moves it away. A neuron integrates many inputs rather than obeying one transmitter in isolation." },
  { id: "ecGEcj1tBBI", title: "Synaptic Transmission", provider: "Source link unavailable", lessonIds: ["lesson-05"], watchFor: "Not learner-delivered.", localFallback: "The local lesson fully sequences neurotransmitter release, receptor binding, signal ending, and common sites of disruption." },
  { id: "YcJy28Nnrb8", title: "Synaptic Transmission", provider: "Shukin Science", lessonIds: ["lesson-05"], watchFor: "Follow the sequence from arriving action potential to postsynaptic response.", localFallback: "An arriving action potential opens calcium channels, vesicles release transmitter, transmitter binds receptors, the postsynaptic cell changes, and clearance mechanisms end the signal." },
  { id: "QY9NTVh-Awo", title: "Peripheral Nervous System", provider: "CrashCourse", lessonIds: ["lesson-06"], watchFor: "Organize somatic and autonomic pathways beneath the PNS.", localFallback: "The PNS links receptors and effectors to the CNS. Somatic pathways serve skeletal muscle; autonomic pathways regulate smooth muscle, cardiac muscle, and glands." },
  { id: "jaWrMYChc5A", title: "Peripheral Nervous System", provider: "Source link restricted", lessonIds: ["lesson-06"], watchFor: "Not learner-delivered.", localFallback: "The local nervous-system hierarchy provides the complete required explanation." },
  { id: "DPWEhl7gbu4", title: "The Autonomic Nervous System", provider: "Professor Dave Explains", lessonIds: ["lesson-06"], watchFor: "Compare sympathetic and parasympathetic effects organ by organ rather than as universal on/off states.", localFallback: "Autonomic branches often have opposing effects, but their actions are tissue-specific and coordinated with the body situation." },
  { id: "jEHwB1PG_-Q", title: "The Fight, Flight, Freeze Response", provider: "Braive", lessonIds: ["lesson-16"], watchFor: "Not learner-delivered.", localFallback: "The local lesson distinguishes rapid sympathetic-adrenal responses from slower endocrine support without self-diagnosis." },
  { id: "FPH5CFSmYEU", title: "Turn Off Anxiety in Your Nervous System", provider: "Therapy in a Nutshell", lessonIds: ["lesson-16"], watchFor: "Not learner-delivered.", localFallback: "The course teaches stress physiology but does not provide individual medical or mental-health treatment advice." },
  { id: "q8NtmDrb_qo", title: "Central Nervous System", provider: "CrashCourse", lessonIds: ["lesson-06"], watchFor: "Connect each major brain or spinal structure to evidence, not personality labels.", localFallback: "The brain and spinal cord integrate information through distributed networks; symptoms can suggest a location but do not establish a diagnosis." },
  { id: "0-8PvNOdByc", title: "The Human Brain: Major Structures and Functions", provider: "NIDA / NIH", lessonIds: ["lesson-06"], watchFor: "Identify how named regions work as connected networks.", localFallback: "Major regions have characteristic functions, but complex behaviour emerges from interacting brain networks rather than one isolated centre." },
  { id: "jYlxv9gUYSs", title: "Anatomy of the Brain", provider: "Shukin Science", lessonIds: ["lesson-06"], watchFor: "Use location and connections to distinguish cerebrum, cerebellum, brainstem, and diencephalon.", localFallback: "The brain model in Lesson 6 connects major regions to coordination, sensation, movement, language, memory, and homeostatic regulation." },
  { id: "qEEEu1HEtU0", title: "Harlow's Monkey Experiments", provider: "SciShow Psych", lessonIds: ["lesson-06"], watchFor: "Not learner-delivered.", localFallback: "This topic is outside the Unit A outcome sequence." },
  { id: "-w8n9UOiBxE", title: "Understanding Addiction as a Disease", provider: "Wait 21", lessonIds: ["lesson-05"], watchFor: "Not learner-delivered.", localFallback: "Lesson 5 addresses synaptic drug effects without extending into an unrelated addiction unit." },
  { id: "RNLceVI8jcc", title: "Nervous System", provider: "Amoeba Sisters", lessonIds: ["lesson-17"], watchFor: "Use the review to rebuild the path from receptor to CNS integration to response.", localFallback: "For nervous-system review, connect neuron signalling, synapses, CNS/PNS organization, reflexes, and sensory pathways as one information-control system." },
  { id: "o0DYP-u1rNM", title: "Vision", provider: "CrashCourse", lessonIds: ["lesson-09"], watchFor: "Separate optical focusing, retinal transduction, and brain processing.", localFallback: "Cornea and lens focus light; photoreceptors change signalling in response to light; retinal circuits process the pattern; ganglion-cell axons carry output through the optic nerve to central visual pathways." },
  { id: "nnCrnWOiKG4", title: "What Is Night Blindness?", provider: "SciShow", lessonIds: ["lesson-09"], watchFor: "Connect rod function and vitamin A to evidence while avoiding self-diagnosis.", localFallback: "Rods support dim-light vision and use retinal derived from vitamin A, but difficulty seeing at night has multiple possible causes that require clinical assessment." },
  { id: "MJxxFwVu1OM", title: "Anatomy of the Eye", provider: "Handwritten Tutorials", lessonIds: ["lesson-09"], watchFor: "Trace light through transparent structures to the retina.", localFallback: "Light passes through cornea, aqueous humour, pupil, lens, and vitreous humour before reaching the retina; optic-nerve output is already neural information." },
  { id: "Ie2j7GpC4JU", title: "Hearing and Balance", provider: "CrashCourse", lessonIds: ["lesson-10"], watchFor: "Track the change from pressure wave to mechanical vibration to hair-cell signalling.", localFallback: "The outer and middle ear transmit vibration; cochlear fluid movement bends hair cells; the vestibular apparatus uses related mechanoreceptors to detect head motion and position." },
  { id: "T8lKKlnnC6M", title: "How Hearing Works", provider: "AniMed", lessonIds: ["lesson-10"], watchFor: "Name the energy form at each step of the hearing pathway.", localFallback: "Sound pressure moves the eardrum and ossicles, creates fluid waves in the cochlea, bends hair cells, and produces neural signals." },
  { id: "LkGOGzpbrCk", title: "The Science of Hearing", provider: "TED-Ed", lessonIds: ["lesson-10"], watchFor: "Notice how the cochlea separates frequency information.", localFallback: "Different cochlear regions respond most strongly to different frequencies, creating an organized neural representation of sound." },
  { id: "98-6WfdumZY", title: "Human Ear: Structure and Working", provider: "Khan Academy India", lessonIds: ["lesson-10"], watchFor: "Trace the pathway without treating an online tone as a hearing test.", localFallback: "The lesson provides a labelled ear pathway and a synthetic audiogram; no high-volume or diagnostic audio activity is required." },
  { id: "ryGMI3SpxCE", title: "The Vestibular System", provider: "Alila Medical Media", lessonIds: ["lesson-10"], watchFor: "Distinguish rotational from linear acceleration and head orientation.", localFallback: "Semicircular canals detect rotation; the utricle and saccule respond to linear acceleration and head orientation relative to gravity." },
  { id: "eWHH9je2zG4", title: "Endocrine System, Part 1", provider: "CrashCourse", lessonIds: ["lesson-12"], watchFor: "Compare hormone transport and target-cell response with neural signalling.", localFallback: "Endocrine glands release hormones into blood; only cells with compatible receptors and response machinery react." },
  { id: "cVf38y07cfk", title: "Spaced Repetition in Learning Theory", provider: "Osmosis", lessonIds: ["lesson-17"], watchFor: "Not learner-delivered.", localFallback: "Study strategy is outside the course media collection." },
  { id: "I9XG8EBwdSU", title: "Memorization Methods and Why They Work", provider: "LearnFree", lessonIds: ["lesson-17"], watchFor: "Not learner-delivered.", localFallback: "Study strategy is outside the course media collection." },
  { id: "cDGmsR2ZILE", title: "Thyroid Gland and Thyroid Problems", provider: "Alila Medical Media", lessonIds: ["lesson-14"], watchFor: "Trace TRH, TSH, thyroid hormone, targets, and feedback separately.", localFallback: "Thyroid hormone changes metabolism and development; hypothalamic and pituitary signals regulate release through negative feedback." },
  { id: "y9Bdi4dnSlg", title: "Insulin and Glucagon", provider: "FuseSchool", lessonIds: ["lesson-15"], watchFor: "Compare the high-glucose and low-glucose branches, then identify which target is tissue-specific.", localFallback: "After glucose rises, beta cells increase insulin release and target tissues change uptake, storage, and production. When glucose falls, alpha cells increase glucagon and the liver increases glucose output. Not every tissue responds to insulin in the same way." },
  { id: "XfyGv-xwjlI", title: "Type 1 and Type 2 Diabetes", provider: "Alila Medical Media", lessonIds: ["lesson-15"], watchFor: "Separate beta-cell loss from reduced insulin responsiveness and avoid single-cause claims.", localFallback: "Type 1 diabetes involves autoimmune beta-cell destruction. Type 2 diabetes is multifactorial and can involve reduced insulin responsiveness and impaired secretion; treatment is individualized." },
  { id: "HKHuQYVcxG4", title: "Adrenal Stress: Short Term and Long Term", provider: "NutritionChiroDoc", lessonIds: ["lesson-16"], watchFor: "Not learner-delivered.", localFallback: "A higher-authority, curriculum-focused stress resource is used instead." },
  { id: "8IUZjCSkbrc", title: "What Does Stress Do to Your Body?", provider: "Seeker", lessonIds: ["lesson-16"], watchFor: "Distinguish immediate signalling from longer-term physiological effects.", localFallback: "Rapid sympathetic and adrenal-medulla responses mobilize resources; longer endocrine responses can alter metabolism, circulation, immune activity, sleep, and cognition." },
  { id: "v-t1Z5-oPtU", title: "How Stress Affects Your Body", provider: "TED-Ed", lessonIds: ["lesson-16"], watchFor: "Compare short-term adaptive responses with evidence from prolonged stress.", localFallback: "A short stress response can support immediate action. Persistent activation can affect metabolism, pressure, sleep, immune activity, and cognition; individual health advice belongs with qualified care." },
  { id: "BYaR-JgbjCs", title: "The Pituitary Gland", provider: "Hippomedics", lessonIds: ["lesson-13"], watchFor: "Separate hypothalamic control, anterior-pituitary secretion, and posterior-pituitary release.", localFallback: "The hypothalamus regulates the anterior pituitary and produces ADH and oxytocin released by the posterior pituitary; the pituitary works within feedback axes rather than acting alone." },
  { id: "QHkGG4TimvQ", title: "The Anterior Pituitary", provider: "Hippomedics", lessonIds: ["lesson-13"], watchFor: "Trace one releasing hormone, pituitary hormone, target gland, and feedback signal.", localFallback: "Anterior-pituitary axes connect hypothalamic signals to downstream glands and are regulated by feedback from target-gland hormones." },
  { id: "SCV_m91mN-Q", title: "Endocrine System, Part 2", provider: "CrashCourse", lessonIds: ["lesson-17"], watchFor: "Rebuild one complete hormone cascade and identify where feedback returns.", localFallback: "For endocrine review, trace stimulus, control centre, gland, hormone, receptor-bearing target, response, and feedback evidence as separate steps." },
  { id: "lgqbs5a6Guw", title: "Endocrine System: Stress Hormones", provider: "Shukin Science", lessonIds: ["lesson-16", "lesson-17"], watchFor: "Compare adrenal-medulla and adrenal-cortex signals by timing and effect.", localFallback: "Epinephrine supports rapid responses; cortisol and aldosterone have different slower targets and regulatory pathways." },
  { id: "k_QhDbUd654", title: "Endocrine System: Blood Glucose Hormones", provider: "Shukin Science", lessonIds: ["lesson-15", "lesson-17"], watchFor: "Identify the initiating change and the response that opposes it.", localFallback: "Insulin-linked and glucagon-linked pathways form two feedback branches that oppose rises and falls in blood glucose." },
  { id: "GYQyWYHt_vk", title: "Endocrine System: Growth and Metabolism Hormones", provider: "Shukin Science", lessonIds: ["lesson-13", "lesson-14", "lesson-17"], watchFor: "Keep growth-hormone and thyroid-hormone axes distinct.", localFallback: "Growth-hormone and thyroid axes both affect growth or metabolism but use different pituitary signals, targets, and feedback evidence." }
];

const VIDEO_BY_ID = new Map(VIDEO_DEFINITIONS.map((video) => [video.id, video]));

const REDRAW_REFERENCES = [
  {
    deckId: "chapter-11" as const,
    slideNumber: 23,
    sourcePath: "ppt/media/image8.png",
    outputPath: "chapter-11/slide-23-image8.png",
    destination: "lesson-04:resting-membrane",
    note: "Ion-distribution source visual informed the existing course-native resting-membrane model; raster text and unresolved third-party rights prevent direct learner use."
  },
  {
    deckId: "chapter-12" as const,
    slideNumber: 13,
    sourcePath: "ppt/media/image3.png",
    outputPath: "chapter-12/slide-13-image3.png",
    destination: "lesson-09:figure-eye-anatomy",
    note: "Detailed eye anatomy informed an accessible course-native redraw; unresolved embedded-image rights prevent direct learner use."
  },
  {
    deckId: "chapter-13" as const,
    slideNumber: 35,
    sourcePath: "ppt/media/image29.png",
    outputPath: "chapter-13/slide-35-image29.png",
    destination: "lesson-15:blood-glucose-loop",
    note: "The source feedback layout informed the corrected course-native model; the redraw removes tissue-generalization errors and the unsupported numeric range."
  }
] as const;

const EXCLUDED_SLIDES = new Map<string, string>([
  ["chapter-11:58", "Excluded left-brain/right-brain personality framing."],
  ["chapter-11:63", "Excluded trauma-association extension outside the Unit A instructional focus."],
  ["chapter-11:65", "Excluded addiction extension outside the Unit A instructional focus."],
  ["chapter-13:12", "Excluded teacher-facing memorization directions; gland instruction remains local and outcome-led."]
]);

function sha256(bytes: Buffer | string) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function exists(target: string) {
  try {
    await lstat(target);
    return true;
  } catch {
    return false;
  }
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseAttributes(source: string) {
  return Object.fromEntries(
    [...source.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], decodeXml(match[2])])
  );
}

function slideNumberFromPath(value: string) {
  return Number(value.match(/slide(\d+)\.xml$/)?.[1] ?? Number.NaN);
}

function youtubeIdFromUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (url.hostname.endsWith("youtube.com")) {
      const embedded = url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      return embedded ?? url.searchParams.get("v");
    }
  } catch {}
  return null;
}

function posixMediaPath(target: string) {
  return path.posix.normalize(path.posix.join("ppt/slides", target));
}

async function imageMetadata(bytes: Buffer) {
  try {
    const metadata = await sharp(bytes).metadata();
    return { width: metadata.width ?? null, height: metadata.height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

async function parseDeck(deck: (typeof BIOLOGY30_MEDIA_DECKS)[number], bytes: Buffer) {
  const zip = await JSZip.loadAsync(bytes);
  const slidePaths = Object.keys(zip.files)
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry))
    .sort((left, right) => slideNumberFromPath(left) - slideNumberFromPath(right));
  const mediaPaths = Object.keys(zip.files).filter((entry) => /^ppt\/media\/[^/]+$/.test(entry)).sort();
  if (slidePaths.length !== deck.slideCount) {
    throw new Error(`${deck.originalFilename} slide-count drift: expected ${deck.slideCount}, received ${slidePaths.length}.`);
  }
  if (mediaPaths.length !== deck.mediaCount) {
    throw new Error(`${deck.originalFilename} media-count drift: expected ${deck.mediaCount}, received ${mediaPaths.length}.`);
  }

  const mediaToSlides = new Map<string, Array<{ slideNumber: number; relationshipId: string }>>();
  const links: Array<Record<string, unknown>> = [];
  const slides: Array<Record<string, unknown>> = [];
  for (const slidePath of slidePaths) {
    const slideNumber = slideNumberFromPath(slidePath);
    const xml = await zip.file(slidePath)!.async("string");
    const text = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
      .map((match) => decodeXml(match[1]))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const title = text.split(/(?<=[.!?])\s|\s{2,}/)[0]?.slice(0, 180) || `Slide ${slideNumber}`;
    const relationshipPath = `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
    const relationshipFile = zip.file(relationshipPath);
    const relationships = relationshipFile
      ? [...(await relationshipFile.async("string")).matchAll(/<Relationship\b([^>]+?)\/?\s*>/g)].map((match) => parseAttributes(match[1]))
      : [];
    const mediaRelationships = relationships
      .filter((relationship) => relationship.Type?.endsWith("/image"))
      .map((relationship) => ({ relationshipId: relationship.Id, sourcePath: posixMediaPath(relationship.Target) }));
    for (const relationship of mediaRelationships) {
      const entries = mediaToSlides.get(relationship.sourcePath) ?? [];
      entries.push({ slideNumber, relationshipId: relationship.relationshipId });
      mediaToSlides.set(relationship.sourcePath, entries);
    }
    const externalRelationships = relationships.filter((relationship) => relationship.TargetMode === "External");
    for (const relationship of externalRelationships) {
      const youtubeId = youtubeIdFromUrl(relationship.Target);
      links.push({
        id: `${deck.id}:slide-${String(slideNumber).padStart(2, "0")}:${relationship.Id}`,
        deckId: deck.id,
        slideNumber,
        relationshipId: relationship.Id,
        url: relationship.Target,
        kind: youtubeId ? "youtube" : "external",
        youtubeId,
        treatment: youtubeId ? "video" : "reference-only",
        disposition: youtubeId
          ? (EXCLUDED_VIDEO_REASONS[youtubeId] ? "excluded" : "candidate")
          : "not-learner-delivered"
      });
    }
    const slideKey = `${deck.id}:${slideNumber}`;
    const redraw = REDRAW_REFERENCES.find((reference) => reference.deckId === deck.id && reference.slideNumber === slideNumber);
    const treatment: Treatment = EXCLUDED_SLIDES.has(slideKey)
      ? "excluded"
      : redraw
        ? "redraw"
        : externalRelationships.some((relationship) => youtubeIdFromUrl(relationship.Target))
          ? "video"
          : "reference-only";
    slides.push({
      id: slideKey,
      deckId: deck.id,
      slideNumber,
      title,
      textSha256: sha256(text),
      relationshipPath,
      mediaRelationships,
      externalRelationshipIds: externalRelationships.map((relationship) => relationship.Id),
      treatment,
      dispositionReason: EXCLUDED_SLIDES.get(slideKey) ?? redraw?.note ?? "Authoring reference; a full slide is never used as learner instruction."
    });
  }

  const media: Array<Record<string, unknown>> = [];
  for (const mediaPath of mediaPaths) {
    const mediaBytes = await zip.file(mediaPath)!.async("nodebuffer");
    const redraw = REDRAW_REFERENCES.find((reference) => reference.deckId === deck.id && reference.sourcePath === mediaPath);
    media.push({
      id: `${deck.id}:${mediaPath}`,
      deckId: deck.id,
      sourcePath: mediaPath,
      originalFilename: path.posix.basename(mediaPath),
      sha256: sha256(mediaBytes),
      byteLength: mediaBytes.length,
      mimeType: mimeTypeForPath(mediaPath) || "application/octet-stream",
      dimensions: await imageMetadata(mediaBytes),
      slideRelationships: mediaToSlides.get(mediaPath) ?? [],
      treatment: redraw ? "redraw" : "reference-only",
      lessonDestination: redraw?.destination ?? null,
      rightsStatus: redraw
        ? "unresolved-third-party-origin; extracted-authoring-reference-only; learner-delivery-is-an-original-redraw"
        : "unresolved-third-party-origin; reference-only; not-learner-delivered",
      extractedOutputPath: redraw
        ? `projects/resources/biology30-unit-a-pilot/_extracted/powerpoint-media/${redraw.outputPath}`
        : null,
      accessibilityStatus: redraw ? "learner-redraw-requires-title-description-text-equivalent-and-zoom" : "not-learner-delivered"
    });
  }
  return { zip, slides, media, links };
}

function videoRecords(links: Array<Record<string, unknown>>) {
  const youtubeLinks = links.filter((link) => link.kind === "youtube");
  const observedIds = youtubeLinks.map((link) => String(link.youtubeId));
  const expectedIds = VIDEO_DEFINITIONS.map((video) => video.id);
  if (observedIds.length !== 45 || new Set(observedIds).size !== 45) {
    throw new Error(`PowerPoint video inventory drift: expected 45 unique YouTube references, received ${observedIds.length} references and ${new Set(observedIds).size} unique IDs.`);
  }
  const missing = expectedIds.filter((id) => !observedIds.includes(id));
  const unexpected = observedIds.filter((id) => !VIDEO_BY_ID.has(id));
  if (missing.length || unexpected.length) {
    throw new Error(`PowerPoint video ID drift. Missing: ${missing.join(", ") || "none"}. Unexpected: ${unexpected.join(", ") || "none"}.`);
  }
  return youtubeLinks.map((link) => {
    const id = String(link.youtubeId);
    const definition = VIDEO_BY_ID.get(id)!;
    const learnerVisible = (BIOLOGY30_MEDIA_LEARNER_VIDEO_IDS as readonly string[]).includes(id);
    const primaryLesson = (BIOLOGY30_MEDIA_PRIMARY_LESSON_VIDEO_IDS as readonly string[]).includes(id);
    const reviewVideo = (BIOLOGY30_MEDIA_REVIEW_VIDEO_IDS as readonly string[]).includes(id);
    const excludedReason = EXCLUDED_VIDEO_REASONS[id];
    return {
      ...link,
      title: definition.title,
      provider: definition.provider,
      youtubeId: id,
      canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      privacyEnhancedEmbedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      lessonConnections: definition.lessonIds,
      watchFor: definition.watchFor,
      localFallback: definition.localFallback,
      finalDisposition: excludedReason
        ? "excluded"
        : primaryLesson
          ? "approved-for-lesson-and-video-library"
          : reviewVideo
            ? "approved-for-video-library-review"
            : "approved-for-video-library",
      learnerVisibility: learnerVisible ? (primaryLesson ? "lesson-and-video-library" : "video-library") : "hidden",
      availabilityStatus: ["ecGEcj1tBBI", "jaWrMYChc5A", "RNLceVI8jcc"].includes(id) ? "unavailable" : "available-as-of-2026-09-02",
      captionsStatus: learnerVisible
        ? "english-caption-track-verified"
        : excludedReason
          ? "not-required"
          : "pending-full-review",
      factualReviewStatus: learnerVisible ? "approved-as-optional-with-local-correction-and-fallback" : excludedReason ? "excluded" : "pending-full-review",
      exclusionReason: excludedReason ?? null,
      optional: true,
      affectsCompletion: false,
      affectsScore: false
    };
  });
}

async function verifyVideoLinks(videos: Array<Record<string, unknown>>) {
  const visible = videos.filter((video) => video.learnerVisibility !== "hidden");
  for (const video of videos) {
    if (video.availabilityStatus === "unavailable") continue;
    const id = String(video.youtubeId);
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(id)}&format=json`, {
      headers: { "user-agent": "Canvas Helper Biology 30 media intake" },
      signal: AbortSignal.timeout(12_000)
    });
    if (!response.ok) throw new Error(`Video availability check failed for ${id}: YouTube oEmbed returned ${response.status}.`);
  }
  for (const video of visible) {
    const id = String(video.youtubeId);
    const response = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}&hl=en`, {
      headers: { "user-agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(12_000)
    });
    if (!response.ok) throw new Error(`Caption check failed for ${id}: watch page returned ${response.status}.`);
    const html = await response.text();
    if (!html.includes('"captionTracks":[') || !html.includes('"languageCode":"en"')) {
      throw new Error(`Caption check failed for ${id}: no English caption track was found.`);
    }
  }
}

async function compareFile(target: string, expected: Buffer) {
  if (!(await exists(target))) return false;
  return (await readFile(target)).equals(expected);
}

async function filesUnder(root: string, prefix = ""): Promise<string[]> {
  if (!(await exists(root))) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await filesUnder(path.join(root, entry.name), relative));
    else result.push(relative);
  }
  return result.sort();
}

async function compareDirectory(target: string, expected: Map<string, Buffer>) {
  if (!(await exists(target))) return false;
  const actualPaths = await filesUnder(target);
  const expectedPaths = [...expected.keys()].sort();
  if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) return false;
  const matches = await Promise.all(expectedPaths.map((relative) => compareFile(path.join(target, relative), expected.get(relative)!)));
  return matches.every(Boolean);
}

async function writeStagedTree(root: string, files: Map<string, Buffer>) {
  for (const [relative, bytes] of files) {
    const destination = path.join(root, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  }
}

export async function prepareBiology30UnitAPilotMedia(input: {
  repoRoot: string;
  project?: string;
  chapter11Pptx: string;
  chapter12Pptx: string;
  chapter13Pptx: string;
  checkVideoLinks?: boolean;
  failAfterPromotion?: number;
}) {
  const project = input.project ?? BIOLOGY30_MEDIA_PILOT_PROJECT;
  if (project !== BIOLOGY30_MEDIA_PILOT_PROJECT) {
    throw new Error(`This media command is scoped only to ${BIOLOGY30_MEDIA_PILOT_PROJECT}.`);
  }
  const projectDir = path.join(input.repoRoot, "projects", project);
  const workspacePath = path.join(projectDir, "workspace", "index.html");
  const manifestPath = path.join(projectDir, "meta", "project.json");
  if (!(await exists(workspacePath)) || !(await exists(manifestPath))) {
    throw new Error(`Pilot project ${project} is missing its direct workspace or metadata.`);
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    authoringStatus?: string;
    authoring?: { driverId?: string; studioEditing?: { enabled?: boolean } };
  };
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "direct-workspace-v1" || manifest.authoring?.studioEditing?.enabled !== false) {
    throw new Error("Pilot ownership drift: expected blocked direct-workspace-v1 with Studio editing disabled.");
  }
  const workspaceBefore = await readFile(workspacePath);

  const sourcePaths: Record<DeckId, string> = {
    "chapter-11": input.chapter11Pptx,
    "chapter-12": input.chapter12Pptx,
    "chapter-13": input.chapter13Pptx
  };
  const sourceBytes = new Map<DeckId, Buffer>();
  for (const deck of BIOLOGY30_MEDIA_DECKS) {
    const bytes = await readFile(sourcePaths[deck.id]);
    const actual = sha256(bytes);
    if (actual !== deck.sha256) {
      throw new Error(`PowerPoint hash mismatch for ${deck.originalFilename}: expected ${deck.sha256}, received ${actual}.`);
    }
    sourceBytes.set(deck.id, bytes);
  }

  const parsedDecks = [];
  for (const deck of BIOLOGY30_MEDIA_DECKS) parsedDecks.push({ deck, parsed: await parseDeck(deck, sourceBytes.get(deck.id)!) });
  const slides = parsedDecks.flatMap(({ parsed }) => parsed.slides);
  const media = parsedDecks.flatMap(({ parsed }) => parsed.media);
  const links = parsedDecks.flatMap(({ parsed }) => parsed.links);
  const videos = videoRecords(links);
  const externalLinks = links.filter((link) => link.kind === "external").map((link) => ({
    ...link,
    finalDisposition: "reference-only-not-learner-delivered",
    reason: "The learner course provides a local explanation; this source-era external link is not required."
  }));
  if (slides.length !== 138 || media.length !== 152 || videos.length !== 45 || externalLinks.length !== 3) {
    throw new Error(`Media inventory totals drifted: slides=${slides.length}, media=${media.length}, videos=${videos.length}, otherLinks=${externalLinks.length}.`);
  }
  if (input.checkVideoLinks) await verifyVideoLinks(videos);

  const extractedFiles = new Map<string, Buffer>();
  for (const reference of REDRAW_REFERENCES) {
    const parsed = parsedDecks.find((entry) => entry.deck.id === reference.deckId)?.parsed;
    const bytes = await parsed?.zip.file(reference.sourcePath)?.async("nodebuffer");
    if (!bytes) throw new Error(`Redraw reference is missing: ${reference.deckId}/${reference.sourcePath}.`);
    extractedFiles.set(reference.outputPath, bytes);
  }

  const sourceRecords = BIOLOGY30_MEDIA_DECKS.map((deck) => ({
    id: deck.id,
    chapter: deck.chapter,
    originalFilename: deck.originalFilename,
    storedPath: `projects/resources/biology30-unit-a-pilot/_sources/${deck.sha256}.pptx`,
    sha256: deck.sha256,
    role: "authorized-supplied-instructional-notes",
    learnerDelivery: false,
    slideCount: deck.slideCount,
    mediaCount: deck.mediaCount
  }));
  const contract = {
    schemaVersion: 2,
    profileId: "biology30-unit-a-pilot-media-v2",
    project,
    status: "blocked-preview-only",
    workspaceOwnership: "direct-workspace-v1",
    sourceDecks: sourceRecords,
    inventory: { slideCount: slides.length, mediaCount: media.length, youtubeCount: videos.length, externalLinkCount: externalLinks.length },
    slides,
    media,
    videos,
    externalLinks,
    redrawReferences: REDRAW_REFERENCES.map((reference) => ({
      ...reference,
      extractedOutputPath: `projects/resources/biology30-unit-a-pilot/_extracted/powerpoint-media/${reference.outputPath}`,
      learnerTreatment: "original-redraw",
      sourceRasterLearnerVisible: false
    })),
    learnerPolicy: {
      videoRouteId: "video-library",
      videosOptional: true,
      videosAffectCompletion: false,
      videosAffectScore: false,
      videoPreviewLoadsWhenVisible: true,
      hiddenVideoPreviewsLoad: false,
      videoAutoplay: false,
      requiredConceptsHaveLocalFallbacks: true,
      slideScreenshotsAllowed: false,
      sourceRasterWithUnresolvedRightsAllowed: false,
      primaryLessonVideoIds: BIOLOGY30_MEDIA_PRIMARY_LESSON_VIDEO_IDS,
      reviewVideoIds: BIOLOGY30_MEDIA_REVIEW_VIDEO_IDS,
      learnerVideoIds: BIOLOGY30_MEDIA_LEARNER_VIDEO_IDS
    },
    validation: {
      sourceHashesVerified: true,
      inventoryCountsVerified: true,
      allSlidesDisposed: slides.every((slide) => Boolean(slide.treatment)),
      allMediaDisposed: media.every((asset) => Boolean(asset.treatment)),
      allLinksDisposed: [...videos, ...externalLinks].every((link) => Boolean(link.finalDisposition)),
      learnerRasterRightsResolved: true,
      networkChecksRun: Boolean(input.checkVideoLinks)
    }
  };
  const report = {
    schemaVersion: 2,
    profileId: "biology30-unit-a-pilot-media-resource-report-v2",
    project,
    sourceDecks: sourceRecords,
    counts: contract.inventory,
    candidateVideos: videos.filter((video) => video.finalDisposition !== "excluded").length,
    excludedVideos: videos.filter((video) => video.finalDisposition === "excluded").length,
    learnerVisibleVideos: videos.filter((video) => video.learnerVisibility !== "hidden").length,
    primaryLessonVideos: videos.filter((video) => video.learnerVisibility === "lesson-and-video-library").length,
    extractedAuthoringReferences: REDRAW_REFERENCES.map((reference) => `projects/resources/biology30-unit-a-pilot/_extracted/powerpoint-media/${reference.outputPath}`),
    canonicalWorkspaceRewritten: false,
    validation: contract.validation
  };
  const contractBytes = Buffer.from(`${JSON.stringify(contract, null, 2)}\n`, "utf8");
  const reportBytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`, "utf8");

  const sourceRoot = path.join(input.repoRoot, "projects", "resources", "biology30-unit-a-pilot", "_sources");
  const extractedRoot = path.join(input.repoRoot, "projects", "resources", "biology30-unit-a-pilot", "_extracted", "powerpoint-media");
  const contractPath = path.join(projectDir, "meta", "media-integration.json");
  const reportPath = path.join(projectDir, "meta", "media-resource-report.json");
  const targetSources = BIOLOGY30_MEDIA_DECKS.map((deck) => ({ target: path.join(sourceRoot, `${deck.sha256}.pptx`), bytes: sourceBytes.get(deck.id)! }));
  const exactSources = await Promise.all(targetSources.map(({ target, bytes }) => compareFile(target, bytes)));
  const exactExtracted = await compareDirectory(extractedRoot, extractedFiles);
  const exactContract = await compareFile(contractPath, contractBytes);
  const exactReport = await compareFile(reportPath, reportBytes);
  const canUpgradeV1 = async (target: string, profileId: string) => {
    if (!(await exists(target))) return false;
    try {
      const current = JSON.parse(await readFile(target, "utf8")) as {
        schemaVersion?: number;
        profileId?: string;
        project?: string;
        sourceDecks?: Array<{ sha256?: string }>;
      };
      return current.schemaVersion === 1
        && current.profileId === profileId
        && current.project === project
        && JSON.stringify(current.sourceDecks?.map((source) => source.sha256)) === JSON.stringify(BIOLOGY30_MEDIA_DECKS.map((deck) => deck.sha256));
    } catch {
      return false;
    }
  };
  const contractUpgrade = !exactContract && await canUpgradeV1(contractPath, "biology30-unit-a-pilot-media-v1");
  const reportUpgrade = !exactReport && await canUpgradeV1(reportPath, "biology30-unit-a-pilot-media-resource-report-v1");
  if (exactSources.every(Boolean) && exactExtracted && exactContract && exactReport) {
    if (!(await readFile(workspacePath)).equals(workspaceBefore)) throw new Error("Canonical workspace changed during read-only media verification.");
    return { project, changed: false, contract, report };
  }

  for (let index = 0; index < targetSources.length; index += 1) {
    if (await exists(targetSources[index].target) && !exactSources[index]) {
      throw new Error(`Owned content-addressed source drift detected at ${path.relative(input.repoRoot, targetSources[index].target)}; refusing to overwrite it.`);
    }
  }
  if (await exists(extractedRoot) && !exactExtracted) {
    throw new Error(`Owned extracted-media drift detected at ${path.relative(input.repoRoot, extractedRoot)}; refusing to overwrite it.`);
  }
  if (await exists(contractPath) && !exactContract && !contractUpgrade) {
    throw new Error(`Owned media contract drift detected at ${path.relative(input.repoRoot, contractPath)}; refusing to overwrite it.`);
  }
  if (await exists(reportPath) && !exactReport && !reportUpgrade) {
    throw new Error(`Owned media report drift detected at ${path.relative(input.repoRoot, reportPath)}; refusing to overwrite it.`);
  }

  const stageRoot = await mkdtemp(path.join(projectDir, ".media-resource-stage-"));
  const stageSourceRoot = path.join(stageRoot, "sources");
  const stageExtractedRoot = path.join(stageRoot, "powerpoint-media");
  const stageContractPath = path.join(stageRoot, "media-integration.json");
  const stageReportPath = path.join(stageRoot, "media-resource-report.json");
  const promoted: Array<{ target: string; backup: string | null }> = [];
  try {
    await Promise.all([mkdir(stageSourceRoot), mkdir(stageExtractedRoot)]);
    for (const deck of BIOLOGY30_MEDIA_DECKS) await writeFile(path.join(stageSourceRoot, `${deck.sha256}.pptx`), sourceBytes.get(deck.id)!);
    await writeStagedTree(stageExtractedRoot, extractedFiles);
    await writeFile(stageContractPath, contractBytes);
    await writeFile(stageReportPath, reportBytes);
    for (const deck of BIOLOGY30_MEDIA_DECKS) {
      const staged = path.join(stageSourceRoot, `${deck.sha256}.pptx`);
      if (sha256(await readFile(staged)) !== deck.sha256) throw new Error(`Staged PowerPoint hash drift for ${deck.id}.`);
    }
    if (!(await compareDirectory(stageExtractedRoot, extractedFiles))) throw new Error("Staged extracted-media validation failed.");

    await Promise.all([mkdir(sourceRoot, { recursive: true }), mkdir(path.dirname(extractedRoot), { recursive: true }), mkdir(path.dirname(contractPath), { recursive: true })]);
    const promotions = [
      ...BIOLOGY30_MEDIA_DECKS.map((deck, index) => ({ stage: path.join(stageSourceRoot, `${deck.sha256}.pptx`), target: targetSources[index].target, skip: exactSources[index], replace: false })),
      { stage: stageExtractedRoot, target: extractedRoot, skip: exactExtracted, replace: false },
      { stage: stageContractPath, target: contractPath, skip: exactContract, replace: contractUpgrade },
      { stage: stageReportPath, target: reportPath, skip: exactReport, replace: reportUpgrade }
    ];
    let promotionIndex = 0;
    for (const promotion of promotions) {
      if (promotion.skip) continue;
      if (input.failAfterPromotion === promotionIndex) throw new Error(`Simulated media promotion failure at step ${promotionIndex}.`);
      const backup = promotion.replace ? path.join(stageRoot, `backup-${path.basename(promotion.target)}`) : null;
      if (backup) await rename(promotion.target, backup);
      await rename(promotion.stage, promotion.target);
      promoted.push({ target: promotion.target, backup });
      promotionIndex += 1;
    }
    if (!(await readFile(workspacePath)).equals(workspaceBefore)) throw new Error("Media intake rewrote canonical workspace HTML.");
    return { project, changed: true, contract, report };
  } catch (error) {
    for (const promotion of promoted.reverse()) {
      await rm(promotion.target, { recursive: true, force: true });
      if (promotion.backup) await rename(promotion.backup, promotion.target);
    }
    throw error;
  } finally {
    await rm(stageRoot, { recursive: true, force: true });
  }
}
