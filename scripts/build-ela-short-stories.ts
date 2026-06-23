import { execFile } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import JSZip from "jszip";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { decodeBrightspaceHtml } from "./lib/ela-modern-drama.js";
import { repoRoot } from "./lib/paths.js";

type SourceLink = {
  text: string;
  href: string;
  kind: "external" | "local";
  workspaceHref: string;
  zipPath?: string;
};

type SourceVideo = {
  id: string;
  title: string;
  embedSrc: string;
  originalSrc: string;
  origin: "iframe" | "link";
};

type Lesson = {
  id: string;
  sequence: number;
  title: string;
  sourceHref: string;
  sourceKind: "html" | "pdf" | "other";
  contentHtml: string;
  text: string;
  links: SourceLink[];
  videos: SourceVideo[];
};

type ResourceGroup = {
  id: string;
  title: string;
  items: SourceLink[];
};

type StoryBankItem = {
  id: string;
  title: string;
  sourcePath: string;
  workspaceHref: string;
};

type WritingWorksheetQuestion = {
  id: string;
  text: string;
  hint?: string;
};

type WritingWorksheetSection = {
  title: string;
  questions: WritingWorksheetQuestion[];
};

type WritingWorksheetStory = {
  id: string;
  title: string;
  author: string;
  diplomaTheme: string;
  sections: WritingWorksheetSection[];
};

type AnalysisExample = {
  evidence: string;
  context: string;
  analysis: string;
  studentTakeaway: string;
};

type AnalysisTerm = {
  id: string;
  label: string;
};

type AnalysisSeedItem = {
  evidence: string;
  context: string;
  analysis: string;
};

type AnalysisSeedStory = {
  id: string;
  title: string;
  author: string;
  terms: Record<string, AnalysisSeedItem[]>;
};

type AnalysisStory = {
  id: string;
  title: string;
  author: string;
  examples: Record<string, AnalysisExample[]>;
};

const DEFAULT_SLUG = "ela30-1-short-stories";
const COURSE_TITLE = "Short Stories";
const COURSE_CODE = "ELA 30-1";
const STORY_BANK_SOURCE_DIR = "/Users/deanguedo/Downloads/UNIT 1 Short Stories/Readings";
const WRITING_WORKSHEET_SOURCE_PATH = "/Users/deanguedo/Downloads/digital_story_worksheet.tsx";
const STORY_BANK_SOURCES = [
  { title: "By the Waters of Babylon", fileName: "BytheWatersofBabylon_Text.pdf" },
  { title: "Dulce et Decorum Est", fileName: "Dulce et Decorum Est Reading.pdf" },
  { title: "Good Country People", fileName: "Good Country People Essay.pdf" },
  { title: "The First Year of My Life", fileName: "The First Year of My Life Reading.pdf" },
  { title: "The Jilting of Granny Weatherall", fileName: "The Jilting of Granny Weatherall Readings.pdf" }
];
const PURDUE_OWL_LITERARY_TERMS_URL = "https://owl.purdue.edu/owl/subject_specific_writing/writing_in_literature/literary_terms/index.html";

const ANALYSIS_TERMS: AnalysisTerm[] = [
  { id: "characterization", label: "Characterization" },
  { id: "irony", label: "Irony" },
  { id: "point-of-view", label: "Point of View" },
  { id: "plot", label: "Plot" },
  { id: "setting", label: "Setting" },
  { id: "symbols-motifs", label: "Symbols and Motifs" },
  { id: "tone-mood", label: "Tone and Mood" },
  { id: "diction", label: "Diction" },
  { id: "theme", label: "Theme" }
];

const STUDENT_TAKEAWAYS: Record<string, string> = {
  characterization: "Use this to show how a character is built through choices, speech, conflict, or change.",
  irony: "Use this to explain how a reversal or contradiction reveals a deeper idea.",
  "point-of-view": "Use this to show how narration controls what readers understand and question.",
  plot: "Use this to connect a key event or structure choice to meaning.",
  setting: "Use this to show how place, time, and atmosphere shape interpretation.",
  "symbols-motifs": "Use this to connect a recurring object, image, or pattern to a larger idea.",
  "tone-mood": "Use this to explain how feeling and attitude guide the reader's response.",
  diction: "Use this to show how word choice creates voice, emphasis, or meaning.",
  theme: "Use this to build a theme statement supported by a specific moment in the text."
};

function analysisExamples(termId: string, items: AnalysisSeedItem[]): AnalysisExample[] {
  return items.map((item) => ({ ...item, studentTakeaway: STUDENT_TAKEAWAYS[termId] ?? "Use this example to support a clear literary analysis point." }));
}

function createAnalysisStory(seed: AnalysisSeedStory): AnalysisStory {
  return {
    id: seed.id,
    title: seed.title,
    author: seed.author,
    examples: Object.fromEntries(ANALYSIS_TERMS.map((term) => [term.id, analysisExamples(term.id, seed.terms[term.id] ?? [])]))
  };
}

const ANALYSIS_STORIES: AnalysisStory[] = [
  createAnalysisStory({
    id: "by-the-waters-of-babylon",
    title: "By the Waters of Babylon",
    author: "Stephen Vincent Benet",
    terms: {
      characterization: [
        { evidence: "John crosses toward the forbidden Place of the Gods despite the laws he has inherited.", context: "His journey begins because his curiosity is stronger than his fear of taboo.", analysis: "John is characterized as brave and intellectually hungry; he is willing to risk safety in order to understand truth." },
        { evidence: "John's father warns him but also recognizes that John may need to go farther than others.", context: "Before the journey, the father teaches tradition without completely closing the door on discovery.", analysis: "The father is cautious but not rigid, which helps frame John as the next stage in his people's growth." },
        { evidence: "After learning that the gods were human, John decides not to tell everyone everything at once.", context: "He returns with knowledge that could overturn his society's beliefs.", analysis: "John's restraint shows maturity; he has learned that truth requires responsibility, not just courage." }
      ],
      irony: [
        { evidence: "The sacred Place of the Gods is actually the ruin of a human city.", context: "John expects divine mystery, but readers recognize traces of modern civilization.", analysis: "The reversal exposes the tribe's misunderstanding and makes human achievement look both powerful and fragile." },
        { evidence: "The forbidden place becomes the source of John’s deepest knowledge.", context: "The laws are meant to protect people, but they also preserve ignorance.", analysis: "The irony complicates safety: avoiding danger also prevents growth." },
        { evidence: "The old people had great knowledge, yet their world was destroyed.", context: "The dead city contains evidence of brilliance and catastrophe together.", analysis: "The irony warns that progress without wisdom can become self-destruction." }
      ],
      "point-of-view": [
        { evidence: "John calls technology magic because he lacks modern vocabulary for what he sees.", context: "His first-person narration filters the city through priestly beliefs.", analysis: "The limited point of view lets readers understand more than John while still sharing his wonder." },
        { evidence: "Ordinary ruined objects become mysterious because John narrates them as sacred signs.", context: "The city is familiar to readers but strange to the narrator.", analysis: "Point of view defamiliarizes the modern world and makes readers re-evaluate civilization." },
        { evidence: "The ending is narrated by a John who has reflected on the journey.", context: "He looks back with more wisdom than he had at the start.", analysis: "The retrospective voice turns adventure into warning and gives the ending a thoughtful authority." }
      ],
      plot: [
        { evidence: "The story begins with a rule: the river and Dead Places must not be crossed.", context: "This taboo establishes the central conflict before John leaves home.", analysis: "The plot is driven by a boundary that the protagonist must test." },
        { evidence: "John explores the ruined city and pieces together clues about the past.", context: "Each discovery changes what he believes about the gods.", analysis: "The middle of the plot develops through revelation rather than external battle." },
        { evidence: "The climax is John’s realization that the gods were men.", context: "This recognition changes the meaning of everything he has seen.", analysis: "The plot's turning point is intellectual and spiritual, not merely physical." }
      ],
      setting: [
        { evidence: "The river separates John's village from the forbidden dead city.", context: "The geography creates a visible line between obedience and discovery.", analysis: "Setting becomes conflict because the physical boundary carries cultural and spiritual meaning." },
        { evidence: "The ruined towers and empty rooms suggest a destroyed modern city.", context: "John moves through a place readers can recognize beneath his sacred language.", analysis: "The post-apocalyptic setting creates awe while warning that civilizations can collapse." },
        { evidence: "John's village is shaped by law, ritual, and fear of the old places.", context: "The home setting contrasts sharply with the city.", analysis: "The contrast shows the tension between preservation and exploration." }
      ],
      "symbols-motifs": [
        { evidence: "The river marks the threshold into forbidden knowledge.", context: "John must cross it before he can discover the truth.", analysis: "The river symbolizes the risk involved in moving beyond inherited beliefs." },
        { evidence: "The Great Burning remains in tribal memory as a sacred catastrophe.", context: "The old disaster shapes laws and fears.", analysis: "Fire symbolizes both human power and human self-destruction." },
        { evidence: "Books, rooms, and preserved objects become clues to the truth about the gods.", context: "John reads the dead city through physical evidence.", analysis: "These objects symbolize knowledge that survives even when a society falls." }
      ],
      "tone-mood": [
        { evidence: "The opening rules create a solemn, ritual mood.", context: "John's world is governed by taboo before the journey begins.", analysis: "The mood makes the journey feel spiritually dangerous, not just physically risky." },
        { evidence: "The city scenes combine wonder with dread.", context: "John is amazed by the ruins but frightened by what he does not understand.", analysis: "The mixed mood supports the story's complicated view of knowledge." },
        { evidence: "The ending becomes reflective and cautionary.", context: "John returns home and thinks about how to share truth.", analysis: "The tone shifts from discovery to responsibility." }
      ],
      diction: [
        { evidence: "Words like gods, magic, priests, and spirits frame the ruins of technology.", context: "John's culture gives him sacred language for modern objects.", analysis: "The diction shows how language shapes what a person can understand." },
        { evidence: "The repeated language of laws and forbidden places gives the opening a formal sound.", context: "Rules are treated as inherited truths.", analysis: "The diction makes tradition feel powerful and difficult to question." },
        { evidence: "John's final language is calmer and more measured.", context: "After the revelation, he speaks with greater restraint.", analysis: "The shift in diction mirrors his growth from seeker to future leader." }
      ],
      theme: [
        { evidence: "John risks fear and taboo to seek truth.", context: "His journey shows that knowledge requires courage.", analysis: "The story suggests that growth depends on questioning inherited limits." },
        { evidence: "The old civilization destroyed itself despite its intelligence.", context: "The ruins reveal both achievement and failure.", analysis: "A central theme is that knowledge without wisdom can become dangerous." },
        { evidence: "John chooses to reveal truth gradually.", context: "He understands that his people are not ready for everything at once.", analysis: "The ending suggests that leadership means balancing truth with care." }
      ]
    }
  }),
  createAnalysisStory({
    id: "dulce-et-decorum-est",
    title: "Dulce et Decorum Est",
    author: "Wilfred Owen",
    terms: {
      characterization: [
        { evidence: "The soldiers appear exhausted, injured, and physically broken.", context: "The poem opens with men struggling away from battle.", analysis: "The soldiers are characterized as vulnerable human bodies rather than heroic icons." },
        { evidence: "The speaker cannot forget the man who fails to fit his gas mask in time.", context: "The memory returns after the attack.", analysis: "The speaker is characterized as a traumatized witness whose mind remains trapped in the event." },
        { evidence: "The dying soldier is shown through helpless bodily suffering.", context: "The speaker remembers him through the gas and afterward.", analysis: "The victim becomes an individual cost of war, not an abstract casualty." }
      ],
      irony: [
        { evidence: "The patriotic Latin saying is exposed as the old Lie.", context: "The title promises honour, but the poem shows horror.", analysis: "The central irony overturns a public slogan by placing it beside lived suffering." },
        { evidence: "A panic-filled gas attack is described with language of intensity and frenzy.", context: "The soldiers scramble to survive.", analysis: "The ironic diction makes terror replace any idea of glorious excitement." },
        { evidence: "Adults repeat noble war language to children who have not seen the battlefield.", context: "The final address accuses those who promote war from a distance.", analysis: "The irony reveals the gap between patriotic speech and actual experience." }
      ],
      "point-of-view": [
        { evidence: "The poem is told by a first-person speaker who saw the attack directly.", context: "The speaker reports from memory rather than from official history.", analysis: "First-person point of view gives the poem witness authority." },
        { evidence: "The speaker turns to you near the end.", context: "The poem shifts from memory to accusation.", analysis: "Direct address pulls the reader into moral responsibility." },
        { evidence: "The event returns in dreams.", context: "The speaker experiences the attack after it is over.", analysis: "The point of view is shaped by trauma, making the past feel present." }
      ],
      plot: [
        { evidence: "The poem begins with soldiers marching in exhaustion.", context: "The opening establishes weakness before crisis.", analysis: "The plot starts in depletion, which makes the attack feel even more brutal." },
        { evidence: "The gas attack abruptly interrupts the march.", context: "Slow fatigue becomes frantic survival.", analysis: "The sudden turn creates shock and mirrors battlefield chaos." },
        { evidence: "The ending moves from death to moral accusation.", context: "After the memory, the speaker condemns the patriotic lie.", analysis: "The plot becomes an argument, not just a sequence of events." }
      ],
      setting: [
        { evidence: "The battlefield is muddy, exhausting, and full of damaged bodies.", context: "The opening places readers in retreat from the front.", analysis: "The setting destroys a clean or noble image of war." },
        { evidence: "The gas turns the air itself into danger.", context: "The attack makes the battlefield surreal and poisonous.", analysis: "Setting becomes an active force that traps the soldiers." },
        { evidence: "The wagon scene places the body in the machinery of war.", context: "The aftermath is remembered with grim physical detail.", analysis: "The setting makes death feel processed by a larger system." }
      ],
      "symbols-motifs": [
        { evidence: "Gas becomes an invisible modern horror.", context: "The attack destroys from within and cannot be fought directly.", analysis: "Gas symbolizes impersonal technological violence." },
        { evidence: "Images of drowning recur around the dying soldier.", context: "The speaker imagines him as trapped in a green sea.", analysis: "The drowning motif emphasizes helplessness and unnatural death." },
        { evidence: "The Latin motto frames the poem.", context: "It appears in the title and is judged at the end.", analysis: "The motto symbolizes propaganda that the poem dismantles." }
      ],
      "tone-mood": [
        { evidence: "The opening mood is weary and grim.", context: "The soldiers are already physically depleted.", analysis: "The mood rejects heroic excitement before the attack even begins." },
        { evidence: "The gas attack creates panic and horror.", context: "The pace and images intensify suddenly.", analysis: "The tonal shift makes the violence feel immediate." },
        { evidence: "The final tone is bitter and accusatory.", context: "The speaker challenges those who repeat patriotic lies.", analysis: "The tone turns suffering into moral protest." }
      ],
      diction: [
        { evidence: "The opening uses words of weakness, age, and injury.", context: "The soldiers' bodies are described before the attack.", analysis: "The diction removes glamour from military service." },
        { evidence: "Harsh bodily language describes the dying soldier.", context: "The speaker forces readers to face the gas attack's effects.", analysis: "The diction makes suffering concrete and unavoidable." },
        { evidence: "Formal Latin contrasts with brutal battlefield language.", context: "The poem ends by rejecting the old saying.", analysis: "The contrast exposes the distance between public rhetoric and real war." }
      ],
      theme: [
        { evidence: "The poem presents soldiers as victims of war rather than symbols of glory.", context: "Every major image emphasizes suffering.", analysis: "A central theme is that war destroys romantic ideals." },
        { evidence: "The speaker remains haunted by what he saw.", context: "The memory returns in dreams.", analysis: "The poem suggests that trauma lasts beyond battle." },
        { evidence: "The speaker warns against teaching children that war death is noble.", context: "The ending confronts patriotic propaganda.", analysis: "The poem argues that language can become dangerous when it hides suffering." }
      ]
    }
  }),
  createAnalysisStory({
    id: "good-country-people",
    title: "Good Country People",
    author: "Flannery O'Connor",
    terms: {
      characterization: [
        { evidence: "Hulga uses education and sarcasm to separate herself from others.", context: "At home, she treats her mother and neighbours as intellectually inferior.", analysis: "Hulga is characterized as proud, defensive, and isolated." },
        { evidence: "Mrs. Hopewell repeats simple sayings about ordinary people.", context: "Her speech frames how she judges Manley Pointer.", analysis: "She is characterized through cliche, which reveals shallow confidence." },
        { evidence: "Manley performs innocence while hiding manipulation.", context: "His visit depends on seeming harmless.", analysis: "He is characterized through disguise and performance." }
      ],
      irony: [
        { evidence: "The supposed good country person is predatory.", context: "Mrs. Hopewell trusts Manley because he fits a comforting label.", analysis: "The irony attacks stereotypes based on class and region." },
        { evidence: "Hulga believes she controls the encounter, but Manley controls it.", context: "The barn loft reverses her expectations.", analysis: "The irony exposes Hulga's intellectual pride as vulnerability." },
        { evidence: "A Bible salesman uses respectability as a disguise.", context: "Manley's props encourage trust before revealing deception.", analysis: "The irony questions outward signs of morality." }
      ],
      "point-of-view": [
        { evidence: "The narration moves near Mrs. Hopewell's judgments and Hulga's inner life.", context: "Readers see multiple blind spots before the betrayal.", analysis: "The shifting third-person point of view creates layered irony." },
        { evidence: "Readers experience Hulga's confidence before Manley overturns it.", context: "The narration follows her expectations into the loft.", analysis: "Point of view prepares the reversal by placing readers inside Hulga's misreading." },
        { evidence: "The ending keeps emotional distance from Manley.", context: "His motives remain cold and unsettling.", analysis: "Narrative distance prevents a comforting explanation." }
      ],
      plot: [
        { evidence: "The plot begins with household routines and assumptions.", context: "The opening establishes how characters classify one another.", analysis: "The exposition prepares the beliefs that Manley will exploit." },
        { evidence: "Manley's arrival disrupts the household's normal categories.", context: "He appears as a harmless visitor.", analysis: "The plot uses the stranger's arrival to expose hidden weaknesses." },
        { evidence: "The loft scene strips Hulga of certainty.", context: "What she imagines as control becomes vulnerability.", analysis: "The climax works through reversal and humiliation." }
      ],
      setting: [
        { evidence: "The rural farm setting encourages assumptions about simplicity.", context: "Mrs. Hopewell relies on the category of good country people.", analysis: "Setting supports social satire by making stereotypes visible." },
        { evidence: "The ordinary home setting feels repetitive and safe.", context: "Early scenes unfold through domestic conversation.", analysis: "The safety makes the later danger more jarring." },
        { evidence: "The barn loft isolates Hulga from the house.", context: "Manley leads her away before revealing himself.", analysis: "The setting becomes a trap where public identity collapses." }
      ],
      "symbols-motifs": [
        { evidence: "Hulga's wooden leg becomes the object Manley takes.", context: "It is tied to her body, identity, and vulnerability.", analysis: "The leg symbolizes the private weakness Hulga tries to control." },
        { evidence: "Names such as Hulga, Hopewell, and Pointer carry exaggerated meanings.", context: "The story repeatedly draws attention to labels.", analysis: "Names symbolize the characters' self-images and illusions." },
        { evidence: "The Bible salesman's case conceals objects that contradict his image.", context: "The case creates trust before exposing deception.", analysis: "The case symbolizes false appearances." }
      ],
      "tone-mood": [
        { evidence: "The early tone is dry and satirical.", context: "The narration exposes repeated sayings and social assumptions.", analysis: "The tone encourages readers to question the characters' confidence." },
        { evidence: "The mood becomes uneasy as Hulga and Manley move to the loft.", context: "Flirtation shifts toward control.", analysis: "The mood signals that Hulga has misread the situation." },
        { evidence: "The ending feels cold and grotesque.", context: "Manley leaves Hulga exposed.", analysis: "The tone refuses sentimentality and sharpens the shock." }
      ],
      diction: [
        { evidence: "Mrs. Hopewell relies on repeated sayings and labels.", context: "Her speech reduces people into simple categories.", analysis: "The diction reveals shallow thinking disguised as common sense." },
        { evidence: "Hulga's educated language contrasts with the plain speech she disdains.", context: "She uses intellect as distance.", analysis: "Her diction performs superiority." },
        { evidence: "Manley adopts humble, religious-sounding language.", context: "He says what others want to hear.", analysis: "His diction is strategic and manipulative." }
      ],
      theme: [
        { evidence: "Hulga's pride makes her vulnerable to deception.", context: "She believes intelligence protects her.", analysis: "The story suggests that certainty can become blindness." },
        { evidence: "Mrs. Hopewell trusts Manley because he fits a label.", context: "Her assumptions replace judgment.", analysis: "The story warns against judging by appearances." },
        { evidence: "Respectable symbols are used as masks.", context: "Manley's performance manipulates cultural trust.", analysis: "The story suggests goodness must be judged by action, not image." }
      ]
    }
  }),
  createAnalysisStory({
    id: "the-first-year-of-my-life",
    title: "The First Year of My Life",
    author: "Muriel Spark",
    terms: {
      characterization: [
        { evidence: "The infant narrator observes adults with impossible clarity.", context: "A baby becomes the lens on a violent adult world.", analysis: "The narrator is characterized as innocent in age but sharp in perception." },
        { evidence: "Adults appear distracted, patriotic, and absurd.", context: "The narrator watches adult reactions to war and public events.", analysis: "Adults are characterized satirically through habits and social roles." },
        { evidence: "The narrator's special awareness is temporary.", context: "The first year is framed as a unique condition.", analysis: "Infancy becomes a strange form of insight rather than ignorance." }
      ],
      irony: [
        { evidence: "A baby sees adult society more clearly than adults do.", context: "The narrator notices absurdity others accept.", analysis: "The irony reverses expectations about innocence and knowledge." },
        { evidence: "Nursery language appears beside world violence.", context: "Childhood scenes coexist with wartime references.", analysis: "The juxtaposition creates irony by pairing comfort with catastrophe." },
        { evidence: "Adults treat their world as reasonable while the narrator makes it strange.", context: "The baby describes accepted behaviour with distance.", analysis: "The irony suggests maturity does not always equal wisdom." }
      ],
      "point-of-view": [
        { evidence: "The narrator speaks from the impossible point of view of an infant.", context: "The baby understands events beyond ordinary infancy.", analysis: "Point of view defamiliarizes the adult world." },
        { evidence: "The narration moves between nursery details and global events.", context: "Private childhood and public history appear together.", analysis: "The point of view controls scale, making the infant both tiny and strangely wide-seeing." },
        { evidence: "The voice is often detached rather than overwhelmed.", context: "Serious events are observed with cool precision.", analysis: "The detached viewpoint strengthens the satire." }
      ],
      plot: [
        { evidence: "The plot follows the narrator's first year rather than one adventure.", context: "The story is organized around episodes and observations.", analysis: "The plot builds through accumulation and pattern." },
        { evidence: "Historical events interrupt domestic life.", context: "The narrator's infancy unfolds during wartime consciousness.", analysis: "The plot connects private development to public crisis." },
        { evidence: "The special first-year perception cannot last.", context: "The title frames the insight as temporary.", analysis: "The plot implies that growing up may narrow perception." }
      ],
      setting: [
        { evidence: "The nursery exists beside the larger setting of wartime society.", context: "The story moves between childhood space and public events.", analysis: "The contrast makes the private world reflect the global one." },
        { evidence: "Home is filled with adult voices, songs, and news.", context: "The baby experiences the world through fragments.", analysis: "Setting is built from sound and language as much as place." },
        { evidence: "War shapes even ordinary family life.", context: "Public crisis enters the narrator's first year.", analysis: "The setting shows that history shapes identity early." }
      ],
      "symbols-motifs": [
        { evidence: "Nursery songs recur around adult concerns.", context: "Childhood language appears beside serious events.", analysis: "The nursery motif symbolizes innocence while exposing adult absurdity." },
        { evidence: "The first year symbolizes untrained perception.", context: "The narrator sees before fully joining adult society.", analysis: "Infancy becomes a symbol of clear, strange insight." },
        { evidence: "News and public language recur as background noise.", context: "The narrator absorbs war and society through words.", analysis: "The motif suggests identity is shaped by surrounding language." }
      ],
      "tone-mood": [
        { evidence: "The tone is witty and detached.", context: "The narrator describes adult life without adult reverence.", analysis: "The tone creates comedy while criticizing social behaviour." },
        { evidence: "The mood becomes uneasy when childhood scenes meet wartime references.", context: "Innocent spaces are not protected from history.", analysis: "The mood suggests danger beneath ordinary life." },
        { evidence: "The ending suggests lost perception.", context: "The first-year viewpoint cannot continue.", analysis: "The tone becomes reflective about what growing up may erase." }
      ],
      diction: [
        { evidence: "The narrator uses adult-sounding language from a baby's position.", context: "The mismatch drives the story's voice.", analysis: "The diction creates comic distance and intellectual surprise." },
        { evidence: "Adult behaviour is described as if it needs explanation.", context: "The narrator makes familiar actions seem strange.", analysis: "The diction defamiliarizes the ordinary." },
        { evidence: "Childhood words and historical language appear close together.", context: "Nursery and wartime registers blend.", analysis: "The contrast highlights the absurd coexistence of innocence and violence." }
      ],
      theme: [
        { evidence: "The infant sees adult violence as strange rather than normal.", context: "The narrator has not absorbed adult excuses.", analysis: "The story suggests innocence can reveal truths adults normalize." },
        { evidence: "War enters the narrator's earliest experience.", context: "The first year is not separate from history.", analysis: "The story suggests people are shaped by historical forces before they understand them." },
        { evidence: "The special viewpoint is temporary.", context: "The premise depends on the first year ending.", analysis: "The story suggests growing up can mean losing a questioning vision." }
      ]
    }
  }),
  createAnalysisStory({
    id: "the-jilting-of-granny-weatherall",
    title: "The Jilting of Granny Weatherall",
    author: "Katherine Anne Porter",
    terms: {
      characterization: [
        { evidence: "Granny tries to manage the room, her family, and her memories while dying.", context: "Her thoughts move between present illness and past duties.", analysis: "Granny is characterized as strong, practical, and deeply invested in control." },
        { evidence: "She insists she has moved past George, yet his memory keeps returning.", context: "The old jilting interrupts her final hours.", analysis: "The contradiction reveals a wounded self beneath her toughness." },
        { evidence: "Cornelia cares for Granny but is perceived as irritating and patronizing.", context: "Readers see Cornelia through Granny's frustration.", analysis: "Cornelia's characterization is filtered through Granny's limited perspective." }
      ],
      irony: [
        { evidence: "Granny's name suggests endurance, but death exposes unresolved pain.", context: "The story occurs in her final hours.", analysis: "The irony is that survival does not mean emotional completion." },
        { evidence: "Granny claims to have forgotten George while repeatedly remembering him.", context: "Her mind keeps circling the jilting.", analysis: "The irony reveals self-deception." },
        { evidence: "At death, Granny feels abandoned again.", context: "The final spiritual disappointment echoes the failed wedding.", analysis: "The ending repeats the pattern of jilting at a deeper level." }
      ],
      "point-of-view": [
        { evidence: "The story moves through Granny's stream of consciousness.", context: "Present events, memories, and sensations blend.", analysis: "Point of view places readers inside a dying mind where time is unstable." },
        { evidence: "Cornelia appears mostly through Granny's irritated thoughts.", context: "The narration is filtered through Granny's feelings.", analysis: "Limited point of view reveals Granny's emotions as much as Cornelia's actions." },
        { evidence: "Memories interrupt the present without clear transitions.", context: "Granny shifts between sickroom, family history, and George.", analysis: "The point of view shows unresolved memory alive in the present." }
      ],
      plot: [
        { evidence: "The external plot is simple: Granny lies ill while others attend her.", context: "Most of the action happens in her mind.", analysis: "The plot is psychological rather than event-heavy." },
        { evidence: "George's jilting resurfaces repeatedly.", context: "The old event interrupts the present illness.", analysis: "The plot is structured by return; the past remains unfinished." },
        { evidence: "The final moment repeats abandonment.", context: "Granny reaches death without the sign she hopes for.", analysis: "The climax is emotional and spiritual." }
      ],
      setting: [
        { evidence: "The sickroom frames the present action.", context: "Granny is physically confined while her mind travels.", analysis: "The setting creates tension between bodily limitation and mental movement." },
        { evidence: "Remembered spaces include family, work, marriage, and the failed wedding day.", context: "Granny's memories pull past settings into the present.", analysis: "The shifting setting shows a life reviewed in fragments." },
        { evidence: "The final setting becomes dim and inward.", context: "Sensory details fade as death approaches.", analysis: "The setting mirrors movement from life toward death." }
      ],
      "symbols-motifs": [
        { evidence: "The jilting motif returns from wedding memory to deathbed experience.", context: "Granny experiences abandonment as a repeated pattern.", analysis: "The motif organizes the story's emotional structure." },
        { evidence: "Light and darkness recur as Granny approaches death.", context: "The final moments focus on fading perception.", analysis: "Light symbolizes reassurance and presence; its absence makes the ending painful." },
        { evidence: "Letters and stored memories suggest the past has not been discarded.", context: "Granny mentally returns to what she tried to bury.", analysis: "These objects symbolize emotional evidence that survival has not erased pain." }
      ],
      "tone-mood": [
        { evidence: "The tone is often sharp, proud, and impatient.", context: "Granny resists being treated as weak.", analysis: "The tone reflects her lifelong habit of endurance and control." },
        { evidence: "The mood becomes fragmented and anxious.", context: "Memories and present sensations blend as death approaches.", analysis: "The mood places readers inside uncertainty." },
        { evidence: "The ending feels lonely and unresolved.", context: "Granny faces death without the reassurance she expects.", analysis: "The final mood is bleak because comfort does not arrive." }
      ],
      diction: [
        { evidence: "Domestic and practical language fills Granny's thoughts.", context: "She remembers work, family management, and responsibility.", analysis: "The diction shows a life built around duty and competence." },
        { evidence: "Religious language appears near the final moments.", context: "Granny waits for spiritual confirmation.", analysis: "The diction raises the stakes from memory to salvation and abandonment." },
        { evidence: "Fragments and quick shifts mirror failing consciousness.", context: "Sentences move rapidly between past and present.", analysis: "The style imitates a mind losing orderly control." }
      ],
      theme: [
        { evidence: "Granny has survived a long life, but the old jilting still hurts.", context: "The memory returns during her final hours.", analysis: "The story suggests unresolved wounds can shape identity across a lifetime." },
        { evidence: "Granny's need for control fails before illness and death.", context: "Her mind and body no longer obey her discipline.", analysis: "The story shows the limits of human control." },
        { evidence: "The final moment repeats abandonment rather than offering comfort.", context: "Granny expects a sign but experiences absence.", analysis: "The story explores the fear of facing death with unresolved longing." }
      ]
    }
  })
];

const LEXICON_TERMS = [
  {
    "id": "characterization",
    "category": "The Basics",
    "term": "Characterization",
    "definition": "The ways individual characters are represented by the narrator or author of a text. This includes descriptions of the characters’ physical appearances, personalities, actions, interactions, and dialogue.",
    "examples": {
      "Good Country People": [
        {
          "quote": "She was brilliant but she didn't have a grain of sense. It seemed to Mrs. Hopewell that every year she grew less like other people and more like herself—bloated, rude, and squint-eyed.",
          "analysis": "O'Connor uses direct characterization through the mother's perspective to establish Hulga's anti-social intellect. The physical description mirrors her internal spiritual deformity."
        },
        {
          "quote": "He was a tall gaunt hatless youth who had called yesterday to sell them a Bible.",
          "analysis": "Pointer's initial physical characterization as 'gaunt' and 'hatless' sets up his disguise as a harmless, simple, and vulnerable country boy."
        },
        {
          "quote": "Mrs. Hopewell had no bad qualities of her own but she was able to use other people's in such a constructive way that she never felt the lack.",
          "analysis": "Through narrator exposition, Mrs. Hopewell is characterized as superficially optimistic but deeply manipulative and oblivious to true human complexity."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "She had fenced in a hundred acres once, digging the post holes herself and clamping the wires with just a negro boy to help.",
          "analysis": "Porter characterizes Granny through her past actions, establishing her hyper-independence and desperate need for physical control to compensate for being emotionally jilted."
        },
        {
          "quote": "Get along and doctor your sick. I want you to go and take this medicine away.",
          "analysis": "Granny's sharp, combative dialogue with Doctor Harry characterizes her stubborn refusal to show weakness or accept her impending mortality."
        },
        {
          "quote": "She was strong, in three days she would be as well as ever. Tomorrow she would have Cornelia write a letter.",
          "analysis": "Her internal monologue characterizes her as a meticulous planner, desperately trying to organize the future to stave off the chaos of death."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "My knowledge and my lack of knowledge burned in me. I wished to know more.",
          "analysis": "Benét characterizes John primarily through his internal desires. His defining trait is an insatiable 'hunger' for truth that pushes him past tribal boundaries."
        },
        {
          "quote": "He is a priest and the son of a priest.",
          "analysis": "John's father is characterized entirely by his title and adherence to tradition, representing the rigid social structures John must navigate."
        },
        {
          "quote": "I saw the dead god. He was sitting in his chair, by the window, in a room I had not entered before.",
          "analysis": "The 'gods' (past humans) are characterized posthumously by their preserved posture, revealing they faced the apocalypse with calm dignity."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "Bent double, like old beggars under sacks, / Knock-kneed, coughing like hags...",
          "analysis": "Owen characterizes the soldiers not as heroic warriors, but as broken, prematurely aged pariahs, stripping away all romantic military illusions."
        },
        {
          "quote": "He plunges at me, guttering, choking, drowning.",
          "analysis": "The dying soldier is characterized entirely through visceral, horrific gerunds, reducing him to a state of pure, helpless physical agony."
        },
        {
          "quote": "Children ardent for some desperate glory.",
          "analysis": "The new recruits are characterized as naive and vulnerable 'children', emphasizing the tragedy of their exploitation by the state."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "I had been born on the first day of the second month of the last year of the First World War.",
          "analysis": "Spark characterizes the narrator as an omniscient infant, a paradoxical figure possessing ultimate knowledge precisely because she is untainted by adult society."
        },
        {
          "quote": "In London the well-fed politicians made speeches.",
          "analysis": "The political class is characterized simply by their physical comfort ('well-fed'), sharply contrasting with the starvation and death of the soldiers they command."
        },
        {
          "quote": "The black-dressed people.",
          "analysis": "Adults are characterized universally by their mourning attire, defining the entire adult world by its proximity to death and grief."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Move beyond physical descriptions. Analyze how an author constructs a character to represent a broader ideological stance, societal flaw, or psychological state.",
      "formula": "Through the direct characterization of [Character]'s [Trait/Action], the author highlights the broader human tendency to [Universal Concept]."
    }
  },
  {
    "id": "dialogue",
    "category": "The Basics",
    "term": "Dialogue",
    "definition": "Spoken exchanges between characters in a dramatic or literary work, usually between two or more speakers.",
    "examples": {
      "Good Country People": [
        {
          "quote": "“I think you're brave. I think you're real sweet,” The pointer said. “I’m as good as you any day in the week.”",
          "analysis": "The dialogue exposes the contrast between Pointer's performative country innocence and his underlying manipulation of Hulga."
        },
        {
          "quote": "“You ain't so smart. I been believing in nothing ever since I was born!”",
          "analysis": "Pointer's final line of dialogue violently shatters Hulga's worldview, proving his lived nihilism is far more dangerous than her textbook philosophy."
        },
        {
          "quote": "“Nothing is perfect. This was an imperfect world yesterday and will be today and tomorrow too.”",
          "analysis": "Mrs. Hopewell's dialogue consists entirely of hollow cliches, revealing her refusal to think critically or face reality."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "“I pay my own bills, and I don't throw my money away on nonsense!”",
          "analysis": "Granny's defensive, spoken dialogue reveals her desperate need to assert authority over her daughter Cornelia."
        },
        {
          "quote": "“Where are you, Cornelia?” “Here, mother.”",
          "analysis": "The brief, grounded dialogue between mother and daughter sharply contrasts with the chaotic, swirling internal monologue of Granny's fading mind."
        },
        {
          "quote": "“I want you to find George. Find him and be sure to tell him I forgot him.”",
          "analysis": "Granny's delirious, unspoken dialogue directed at her absent jilter reveals the lifelong trauma she has never truly overcome."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "“It is forbidden to travel east. It is forbidden to cross the river. It is forbidden to go to the Place of the Gods.”",
          "analysis": "The ritualistic, repetitive dialogue establishes the rigid, superstitious boundaries of the regressed society."
        },
        {
          "quote": "“Truth is a hard deer to hunt. If you eat too much truth at once, you may die of the truth.”",
          "analysis": "The father's dialogue relies on metaphors of hunting and eating, demonstrating his wisdom and the tribe's cautious approach to knowledge."
        },
        {
          "quote": "“They were men who were here before us. We must build again.”",
          "analysis": "John's final dialogue with his father represents a turning point for humanity, resolving the conflict through a commitment to cautious progress."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "“Gas! GAS! Quick, boys!”",
          "analysis": "The abrupt, panicked dialogue shatters the trudging rhythm of the poem, thrusting the reader instantly into the chaotic reality of an attack."
        },
        {
          "quote": "“My friend, you would not tell with such high zest...”",
          "analysis": "The speaker shifts to a direct conversational address (dialogue with the reader/propagandist), making the condemnation intimate and inescapable."
        },
        {
          "quote": "“Dulce et decorum est / Pro patria mori.”",
          "analysis": "The quotation of the Latin proverb serves as 'stolen dialogue' from the establishment, inserted only to be violently debunked by the preceding imagery."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "“Tout le monde à la bataille!”",
          "analysis": "The baby 'overhears' global political dialogue. This grand proclamation highlights the absurdity of politicians sending others to die."
        },
        {
          "quote": "“The grand old Duke of York / He had ten thousand men...”",
          "analysis": "The use of nursery rhymes as a form of dialogue demonstrates how society introduces children to the casual arithmetic of war."
        },
        {
          "quote": "“Smile, baby, smile.”",
          "analysis": "The adults' demanding dialogue reflects society's insistence that the youth perform happiness and ignore the horrifying reality around them."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Analyze the subtext. What is NOT being said? Look at power dynamics, interruptions, and the gap between a character's spoken words and their true intentions.",
      "formula": "The dialogue between [Character A] and [Character B] reveals an underlying power dynamic, demonstrating how [Theme]."
    }
  },
  {
    "id": "genre",
    "category": "The Basics",
    "term": "Genre",
    "definition": "A kind of literature. Texts frequently draw elements from multiple genres to create dynamic narratives based on organizational features, mood, style, and the author's reason for writing.",
    "examples": {
      "Good Country People": [
        {
          "quote": "The grotesque physical descriptions and the rural, farm setting.",
          "analysis": "The text operates within the Southern Gothic genre. It relies on grotesque characters, dark humor, and deeply flawed individuals."
        },
        {
          "quote": "The ironic twist where the intellectual is outsmarted by the simpleton.",
          "analysis": "O'Connor uses Dark Comedy genre elements to expose moral and spiritual decay in the American South, punishing intellectual arrogance."
        },
        {
          "quote": "Mrs. Hopewell's reliance on 'good country people' stereotypes.",
          "analysis": "The text functions as Social Satire, mocking the rigid class and moral structures of 1950s rural America."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "The ruined towers and the 'Great Burning' of the past.",
          "analysis": "The story operates perfectly within the Post-Apocalyptic Speculative Fiction genre, imagining the ruins of modern civilization."
        },
        {
          "quote": "John's journey into the forbidden zones to retrieve metal and knowledge.",
          "analysis": "It utilizes the Heroic Quest genre structure, where a young initiate must brave the unknown to bring salvation to his people."
        },
        {
          "quote": "The revelation that the 'gods' were just men of New York.",
          "analysis": "It functions as a Cautionary Tale or Warning Fable regarding the dangers of nuclear proliferation during the dawn of the Cold War."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "The rigid stanza structure contrasting with the horrific imagery.",
          "analysis": "The poem subverts the Heroic Epic genre. It uses formal structure to draw readers in before hitting them with gruesome realism."
        },
        {
          "quote": "The direct address: 'My friend, you would not tell with such high zest'",
          "analysis": "It functions as an Anti-Propaganda text, directly attacking the genre of patriotic poetry that recruited young men to die."
        },
        {
          "quote": "The haunting memory of the dying soldier.",
          "analysis": "It operates as a traumatic Elegy, mourning not just a single soldier, but the loss of innocence for an entire generation."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "The fragmented, non-linear flow of her memories.",
          "analysis": "The story utilizes the Modernist Psychological Realism genre, abandoning a traditional plot to map the chaotic interior of a dying mind."
        },
        {
          "quote": "The focus on the past trauma at the altar.",
          "analysis": "It incorporates elements of the Southern Gothic genre, where characters are haunted by past secrets and grotesque psychological burdens."
        },
        {
          "quote": "The intense focus on a single character's final hours.",
          "analysis": "It functions as a Deathbed Narrative, a genre focused on final realizations, regret, and the transition into the unknown."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "The baby finding humor in political ruin.",
          "analysis": "The text operates as biting Social Satire, using the absurd premise of an omniscient baby to mock the catastrophic failures of adult leadership."
        },
        {
          "quote": "The baby possessing all knowledge of the world.",
          "analysis": "It utilizes Magical Realism, injecting a supernatural element (the all-knowing infant) into the grim historical reality of WWI."
        },
        {
          "quote": "The blending of telegrams, poems, and news reports.",
          "analysis": "It functions as Anti-War Literature, compiling historical horrors to explicitly condemn the senseless loss of life."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Discuss how the author conforms to or subverts genre expectations to make a thematic point (e.g., using a comedy to expose a dark truth, or subverting a heroic epic).",
      "formula": "By subverting the traditional expectations of the [Genre] form, the author exposes the harsh reality of [Universal Concept]."
    }
  },
  {
    "id": "imagery",
    "category": "The Basics",
    "term": "Imagery",
    "definition": "An author’s use of vivid descriptions that evoke sense-impressions by literal or figurative reference to perceptible or 'concrete' objects, scenes, actions, or states.",
    "examples": {
      "Dulce et Decorum Est": [
        {
          "quote": "If you could hear, at every jolt, the blood / Come gargling from the froth-corrupted lungs.",
          "analysis": "Owen uses visceral, auditory imagery ('gargling') and grotesque visual imagery ('froth-corrupted') to assault the reader's senses."
        },
        {
          "quote": "Dim through the misty panes and thick green light, / As under a green sea, I saw him drowning.",
          "analysis": "The visual imagery of the 'green sea' effectively submerges the reader in the suffocating, inescapable terror of the chlorine gas."
        },
        {
          "quote": "Knock-kneed, coughing like hags, we cursed through sludge.",
          "analysis": "The tactile and auditory imagery immediately strips away the glory of war, portraying the soldiers as physically broken and aged."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "I saw the dead god. He was sitting in his chair, by the window.",
          "analysis": "The haunting, still visual imagery of the preserved man humanizes the 'gods', forcing John to realize this advanced civilization was human."
        },
        {
          "quote": "The towers are not all broken, here and there one still stands, like a great tree in a forest.",
          "analysis": "Benét uses majestic visual imagery to contrast the permanence of human architecture with the fragility of the humans who built them."
        },
        {
          "quote": "My knowledge and my lack of knowledge burned in me like a fire.",
          "analysis": "Tactile imagery of burning is used internally to represent the painful, consuming nature of intellectual curiosity."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "The blue light from Cornelia's silk lampshades drew into a tiny point in the center of her brain, it flickered and winked like an eye.",
          "analysis": "Porter uses visual imagery of a fading, flickering light to physically represent Granny's diminishing consciousness."
        },
        {
          "quote": "The pillow rose and floated under her, pleasant as a hammock in a light wind.",
          "analysis": "Tactile imagery of floating conveys the physical sensation of her body shutting down and drifting toward death."
        },
        {
          "quote": "A fog rose over the valley, she saw it marching across the creek swallowing the trees and moving up the hill.",
          "analysis": "The visual imagery of the advancing, swallowing fog acts as a physical manifestation of her impending, inescapable death."
        }
      ],
      "Good Country People": [
        {
          "quote": "She took care of it as someone else would his soul, in private.",
          "analysis": "The tactile and visual imagery of the wooden leg establishes it not just as a physical prosthesis, but as the literal manifestation of her wounded soul."
        },
        {
          "quote": "He was a tall gaunt hatless youth.",
          "analysis": "The stark visual imagery of Pointer emphasizes his lack of substance; his 'gaunt' nature hints at his profound moral emptiness."
        },
        {
          "quote": "The hollowed-out Bible containing whiskey and cards.",
          "analysis": "The visual imagery of the corrupted holy text serves as a perfect encapsulation of the story's theme regarding performative hypocrisy."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "In France the conscripted soldiers leapfrogged over the dead.",
          "analysis": "The dark, dynamic visual imagery of 'leapfrogging' corrupts a child's game with the grotesque reality of mass casualties."
        },
        {
          "quote": "Black-dressed people.",
          "analysis": "The repetitive visual imagery of black clothing underscores the inescapable, suffocating presence of mourning on the home front."
        },
        {
          "quote": "The well-fed politicians made speeches.",
          "analysis": "The contrasting visual imagery of the 'well-fed' highlights the obscene disparity between those who declare war and those who die in it."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Connect the sensory details to the psychological state of the character or the overarching mood of the scene. Avoid just saying 'it paints a picture in the reader's mind'.",
      "formula": "The visceral imagery of [Sensory Detail] mirrors [Character]'s internal psychological deterioration, suggesting that [Theme]."
    }
  },
  {
    "id": "plot",
    "category": "The Basics",
    "term": "Plot",
    "definition": "The sequence of events that occur through a work to produce a coherent narrative or story.",
    "examples": {
      "Good Country People": [
        {
          "quote": "The sequence of the date in the loft.",
          "analysis": "The plot is structured as a trap. The sequence of events leads Hulga to believe she is the predator orchestrating a seduction, only to realize she is the prey."
        },
        {
          "quote": "The exposition regarding Mrs. Hopewell and Mrs. Freeman.",
          "analysis": "The story spends immense plot time on mundane farm conversations to establish the suffocating 'normalcy' that Hulga tries to rebel against."
        },
        {
          "quote": "The denouement where Mrs. Hopewell watches Pointer leave.",
          "analysis": "The plot resolves with dramatic irony. Hulga is destroyed in the loft, but the plot returns to the mother, who remains entirely oblivious."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "John's journey East across the forbidden river.",
          "analysis": "The plot follows the classic 'Hero's Journey' structure: separation from the tribe, initiation in the forbidden city, and a return."
        },
        {
          "quote": "The vision of the Great Burning.",
          "analysis": "The climax of the plot occurs internally. Watching the vision of the past destroys John's illusions and reshapes his understanding of the world."
        },
        {
          "quote": "The return to the father.",
          "analysis": "The resolution of the plot involves a deliberate choice to slow down the sequence of progress to avoid repeating the apocalypse."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "The fragmented chronology of Granny's memories.",
          "analysis": "The plot is entirely non-linear. The sequence of events is dictated by the erratic firing of a dying brain, blending past traumas with present moments."
        },
        {
          "quote": "The memory of George leaving her at the altar.",
          "analysis": "This past plot point is the driving force of the narrative, serving as the inciting incident for sixty years of psychological overcompensation."
        },
        {
          "quote": "The blowing out of the light.",
          "analysis": "The climax and denouement of the plot happen simultaneously in the final sentence as Granny makes the definitive choice to surrender to death."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "The exhausting march away from the front.",
          "analysis": "The plot begins in media res, dropping the reader directly into the fatigue of war, establishing a baseline of misery before the attack."
        },
        {
          "quote": "The sudden gas attack and the fumble for masks.",
          "analysis": "The inciting incident of the plot is chaotic and abrupt, shattering the slow rhythm of the march and escalating the stakes to life or death."
        },
        {
          "quote": "The haunting aftermath in the dreams.",
          "analysis": "The plot refuses to resolve; the trauma continues infinitely in the speaker's nightmares, proving that the 'story' of war does not end on the battlefield."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "The infant's birth coinciding with the final year of WWI.",
          "analysis": "The plot intrinsically links the timeline of a human life's beginning with the timeline of mass global destruction."
        },
        {
          "quote": "The observation of global atrocities from the crib.",
          "analysis": "The rising action consists entirely of passive observation, highlighting the helplessness of the individual amidst global political machinery."
        },
        {
          "quote": "The baby's first smile at political ruin.",
          "analysis": "The climax is a darkly comic subversion of a typical developmental milestone, marking the infant's initiation into the cynical adult world."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Do not summarize. Analyze the causality. Why did the author sequence events this way? How does the plot force a thematic realization?",
      "formula": "The author deliberately sequences [Event A] immediately before [Event B] to emphasize the inevitable consequence of [Theme]."
    }
  },
  {
    "id": "point_of_view",
    "category": "The Basics",
    "term": "Point of View (POV)",
    "definition": "The perspective (visual, interpretive, bias, etc.) a text takes when presenting its plot. Can be First Person ('I'), Second Person ('You'), or Third Person ('He/She/It').",
    "examples": {
      "The First Year of My Life": [
        {
          "quote": "I had been born on the first day of the second month of the last year of the First World War.",
          "analysis": "Spark uses an omniscient First-Person baby narrator. This allows her to defamiliarize the horrors of WWI through a clinical lens."
        },
        {
          "quote": "I smiled to hear that Mr. Asquith was falling apart. It was my first smile.",
          "analysis": "The biased infant POV finds amusement not in toys, but in the political ruin of hypocritical adults, creating biting satire."
        },
        {
          "quote": "Omniscience is brainwashed out of us.",
          "analysis": "The narrator's specific POV asserts that infants know the truth of the universe, and 'growing up' is actually a process of becoming willfully ignorant."
        }
      ],
      "Good Country People": [
        {
          "quote": "Mrs. Hopewell had no bad qualities of her own but she was able to use other people's.",
          "analysis": "O'Connor uses Third-Person Limited Omniscient POV, hopping between the biased minds of the mother and daughter to expose their hypocrisy."
        },
        {
          "quote": "She decided that for the first time in her life she was face to face with real innocence.",
          "analysis": "By locking us into Hulga's POV in the loft, the author ensures the reader shares in her shocking realization when Pointer reveals his true nature."
        },
        {
          "quote": "Mrs. Freeman's expressions (forward and reverse).",
          "analysis": "The narrator's deadpan, slightly mocking POV regarding the side characters establishes the bleakly comedic tone of the Southern Gothic setting."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "Bent double, like old beggars under sacks, we cursed through sludge.",
          "analysis": "The poem begins in the First-Person Plural ('we'), immersing the reader in the collective, shared trauma and exhaustion of the platoon."
        },
        {
          "quote": "In all my dreams, before my helpless sight, He plunges at me.",
          "analysis": "The shift to First-Person Singular ('my') makes the trauma intimate and inescapable, transitioning from a historical event to a personal nightmare."
        },
        {
          "quote": "My friend, you would not tell with such high zest.",
          "analysis": "The shift to Second-Person ('you') is an aggressive accusation directed at the reader and propagandists, forcing accountability."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "I went north—I did not try to hide myself.",
          "analysis": "The First-Person Naive perspective restricts our knowledge to John's tribal understanding, making the revelation of NYC more impactful."
        },
        {
          "quote": "I saw the dead god.",
          "analysis": "Because we view the corpse through John's biased, spiritual POV, the reader experiences his paradigm shift alongside him."
        },
        {
          "quote": "My father is a priest.",
          "analysis": "The POV is heavily filtered through the rigid social and religious structures of his tribe, highlighting the danger of his transgressions."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "Her bones felt loose, and floated around in her skin.",
          "analysis": "The Third-Person Limited POV operates as a stream of consciousness, forcing the reader to experience the physical disorientation of dying."
        },
        {
          "quote": "Hapsy? George? No, John.",
          "analysis": "The fragmented POV blurs the lines between memory, hallucination, and reality, reflecting her deteriorating mental state."
        },
        {
          "quote": "She blew out the light.",
          "analysis": "By locking us entirely in her internal POV, the final moment of death is experienced as an isolating, deeply personal darkness."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Focus on reliability and limitation. How does the narrator's specific bias distort the truth, limit our understanding, or reveal their own psychological flaws?",
      "formula": "By employing a [Type of POV] perspective, the author limits the reader's understanding to [Character]'s biased lens, highlighting the dangers of [Universal Concept]."
    }
  },
  {
    "id": "style",
    "category": "The Basics",
    "term": "Style",
    "definition": "Comprising an author’s diction, syntax, tone, characters, and other narrative techniques, 'style' is used to describe the way an author uses language to convey their ideas.",
    "examples": {
      "The First Year of My Life": [
        {
          "quote": "In France the conscripted soldiers leapfrogged over the dead while in London the well-fed politicians made speeches.",
          "analysis": "Spark's style uses clinical detachment and sharp satirical juxtaposition, conveying horrific events with a shockingly calm syntax."
        },
        {
          "quote": "Tout le monde à la bataille! / The grand old Duke of York.",
          "analysis": "The style mixes grand political proclamations with childish nursery rhymes to highlight the sheer absurdity of adult warfare."
        },
        {
          "quote": "I smiled.",
          "analysis": "The terse, understated style used for the infant's reactions contrasts heavily with the bombastic reality of the global war happening around her."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "Lighting the lamps had been beautiful. The children huddled up to her and breathed like little calves.",
          "analysis": "Porter's style utilizes fluid, boundary-less sentences to mimic the drifting, stream-of-consciousness nature of a fading mind."
        },
        {
          "quote": "Hapsy? George? No, John. Where are the children? It was growing dark.",
          "analysis": "The fragmented, questioning syntax physically demonstrates the breakdown of Granny's mental faculties as she nears death."
        },
        {
          "quote": "She stretched herself with a deep breath and blew out the light.",
          "analysis": "The final sentence abandons the chaotic stream of consciousness for a definitive, active style, showing her taking final control."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "It is forbidden to travel east. It is forbidden to cross the river.",
          "analysis": "Benét's style relies on repetition and simple syntax to establish the primitive, reverent tone of a regressed society."
        },
        {
          "quote": "By the waters of Babylon.",
          "analysis": "The style uses almost biblical diction and cadence to elevate John's journey from a post-apocalyptic scouting trip to a mythic, spiritual quest."
        },
        {
          "quote": "Truth is a hard deer to hunt.",
          "analysis": "The consistent use of nature-based metaphors is a stylistic choice that grounds the narrative completely in the worldview of the tribal society."
        }
      ],
      "Good Country People": [
        {
          "quote": "Mrs. Hopewell had no bad qualities of her own but she was able to use other people's in such a constructive way.",
          "analysis": "O'Connor's deadpan, highly ironic style subtlety mocks the superficial 'goodness' of the farm owner."
        },
        {
          "quote": "“Nothing is perfect. This was an imperfect world yesterday and will be today and tomorrow too.”",
          "analysis": "The stylistic reliance on hollow cliches in dialogue exposes the intellectual laziness of the rural characters."
        },
        {
          "quote": "The grotesque description of the wooden leg.",
          "analysis": "O'Connor utilizes a Southern Gothic style, focusing on physical deformities to mirror profound spiritual and moral decay."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "Guttering, choking, drowning.",
          "analysis": "Owen's style relies heavily on active, visceral gerunds to thrust the reader directly into the ongoing agony of the dying man."
        },
        {
          "quote": "Sludge... trudge... blood-shod.",
          "analysis": "The stylistic use of heavy, blunt consonants mimics the exhausting, rhythmic footfalls of the weary soldiers."
        },
        {
          "quote": "My friend, you would not tell with such high zest.",
          "analysis": "The shift to a didactic, accusatory style transforms the poem from a simple description of trauma into a weapon against propaganda."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Connect the mechanics of writing (long vs. short sentences, chaotic vs. clinical tone, punctuation choices) to the thematic message being delivered.",
      "formula": "The author's [Adjective] style, characterized by [Syntax/Diction feature], actively mirrors the [Psychological State/Atmosphere] of the narrative."
    }
  },
  {
    "id": "symbolism",
    "category": "The Basics",
    "term": "Symbol(ism)",
    "definition": "An object or element incorporated into a narrative to represent another concept or concern. They typically recur and offer critical information about events and characters.",
    "examples": {
      "Good Country People": [
        {
          "quote": "She took care of it as someone else would his soul, in private.",
          "analysis": "Hulga's wooden leg is a profound symbol of her spiritual deformity and vulnerable soul. When Pointer steals it, he strips her of her foundation."
        },
        {
          "quote": "The hollowed-out Bible containing whiskey and cards.",
          "analysis": "Pointer's Bible symbolizes his deceptive nature; it appears holy on the outside but contains pure, unadulterated sin and emptiness on the inside."
        },
        {
          "quote": "Hulga's weak heart.",
          "analysis": "Her literal heart condition symbolizes her emotional unavailability and inability to truly connect with or love other human beings."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "She stretched herself with a deep breath and blew out the light.",
          "analysis": "The act of blowing out the light is a powerful symbol of Granny finally relinquishing her iron-clad control over her life and accepting death."
        },
        {
          "quote": "The forgotten letters in the attic.",
          "analysis": "The hidden letters from George symbolize the suppressed trauma of her jilting that she claimed to have moved past, but secretly held onto."
        },
        {
          "quote": "The absent bridegroom.",
          "analysis": "The bridegroom who fails to appear symbolizes ultimate abandonment. First George abandons her, and finally, God abandons her at death."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "The 'Place of the Gods' (New York City ruins).",
          "analysis": "The dead city symbolizes the height of human technological achievement and the ultimate hubris of mankind that leads to self-destruction."
        },
        {
          "quote": "The preserved dead god sitting in the chair.",
          "analysis": "The preserved corpse symbolizes the dignity and terror of humanity, proving to John that the 'gods' were just fallible men."
        },
        {
          "quote": "The River Ou-dis-sun (Hudson River).",
          "analysis": "The river symbolizes the boundary between safety/ignorance and danger/truth. Crossing it is the ultimate transgression."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "The 'green sea'.",
          "analysis": "The cloud of chlorine gas symbolizes the inescapable, suffocating nature of modern warfare, which drowns men on dry land."
        },
        {
          "quote": "The 'old beggars under sacks'.",
          "analysis": "The degraded physical appearance of the men symbolizes the complete destruction of the romanticized, heroic military ideal."
        },
        {
          "quote": "The 'white eyes writhing in his face'.",
          "analysis": "The specific focus on the agonizing eyes symbolizes the loss of humanity and the terrifying reality of a mechanized, impersonal death."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "The baby's first smile.",
          "analysis": "The smile symbolizes the loss of pure innocence and the tragic initiation into the cynical, destructive logic of the adult political world."
        },
        {
          "quote": "The nursery rhymes.",
          "analysis": "The innocent children's songs symbolize how society sanitizes and packages the horrors of war to brainwash the next generation."
        },
        {
          "quote": "The 'black-dressed people'.",
          "analysis": "The pervasive mourning attire symbolizes the all-encompassing shadow of death and grief cast by global conflict."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Move from the concrete to the abstract. What universal human struggle, ideology, or psychological fear does this physical object represent?",
      "formula": "The [Object] functions as a potent symbol of [Abstract Concept], illustrating how [Theme]."
    }
  },
  {
    "id": "theme",
    "category": "The Basics",
    "term": "Theme",
    "definition": "A salient abstract idea that emerges from a literary work’s treatment of its subject-matter; or a topic recurring in a number or literary works.",
    "examples": {
      "Dulce et Decorum Est": [
        {
          "quote": "The old Lie: Dulce et decorum est / Pro patria mori.",
          "analysis": "The central theme explores the devastating reality of modern warfare versus the romanticized illusions fed to the youth by patriotic propaganda."
        },
        {
          "quote": "In all my dreams, before my helpless sight.",
          "analysis": "The poem explores the theme of psychological trauma, demonstrating how the horrors of war permanently fracture the survivor's mind."
        },
        {
          "quote": "My friend, you would not tell with such high zest.",
          "analysis": "It addresses the theme of societal complicity, arguing that those who glorify war from afar share responsibility for the slaughter."
        }
      ],
      "Good Country People": [
        {
          "quote": "“You ain't so smart. I been believing in nothing ever since I was born!”",
          "analysis": "The story explores the theme of intellectual pride, suggesting that theoretical knowledge without genuine self-awareness leaves one vulnerable."
        },
        {
          "quote": "Mrs. Hopewell's constant use of cliches.",
          "analysis": "It addresses the theme of willful blindness, showing how people use platitudes to avoid confronting the uncomfortable depths of reality."
        },
        {
          "quote": "Pointer's disguise as a Bible salesman.",
          "analysis": "The text delves into the theme of hypocrisy, proving that societal labels of 'goodness' are often masks for profound malice."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "Truth is a hard deer to hunt. If you eat too much truth at once, you may die of the truth.",
          "analysis": "The central theme explores the dual nature of knowledge: it is essential for progress, but without moral wisdom, it becomes an instrument of destruction."
        },
        {
          "quote": "They were men who were here before us. We must build again.",
          "analysis": "It addresses the theme of cyclical human history, highlighting humanity's inherent drive to rebuild and progress despite past failures."
        },
        {
          "quote": "It is forbidden to travel east.",
          "analysis": "The story explores the theme of societal taboos, demonstrating how laws are often created to protect humanity from its own destructive curiosity."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "For the second time there was no sign.",
          "analysis": "The narrative explores the theme of ultimate abandonment, suggesting that humans inevitably face death and the void completely alone."
        },
        {
          "quote": "“I pay my own bills, and I don't throw my money away on nonsense!”",
          "analysis": "It addresses the theme of the illusion of control, demonstrating how individuals use rigid competence to mask deep-seated psychological trauma."
        },
        {
          "quote": "The forgotten letters from George.",
          "analysis": "The story delves into the theme of unresolved grief, proving that suppressed memories cannot be outrun and will resurface at the end of life."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "Omniscience is brainwashed out of us.",
          "analysis": "The central theme argues that human socialization and 'maturity' are actually processes of corruption, forcing us to accept lies and violence."
        },
        {
          "quote": "In London the well-fed politicians made speeches.",
          "analysis": "It addresses the theme of class exploitation in wartime, highlighting the vast disparity between those who orchestrate conflict and those who suffer its consequences."
        },
        {
          "quote": "I smiled to hear that Mr. Asquith was falling apart.",
          "analysis": "The story explores the theme of political absurdity, suggesting that the structures governing human life are fundamentally ridiculous and destructive."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Never state a theme as a single word (e.g., 'The theme is isolation'). State it as an arguable, universal truth (e.g., 'Isolation inevitably fractures the human psyche').",
      "formula": "Ultimately, the text explores the theme of [Concept], suggesting that when an individual [Action], they inevitably face [Consequence]."
    }
  },
  {
    "id": "tone",
    "category": "The Basics",
    "term": "Tone",
    "definition": "A way of communicating information that conveys an attitude. Authors convey tone through word-choice, imagery, perspective, style, and subject matter.",
    "examples": {
      "Dulce et Decorum Est": [
        {
          "quote": "My friend, you would not tell with such high zest to children ardent for some desperate glory.",
          "analysis": "The tone is bitterly sarcastic and righteously angry, directly accusing the reader of perpetuating the lies that murder young men."
        },
        {
          "quote": "Guttering, choking, drowning.",
          "analysis": "The tone in the middle stanza is horrific, panicked, and suffocating, mimicking the desperate chaos of the gas attack."
        },
        {
          "quote": "Bent double, like old beggars under sacks.",
          "analysis": "The opening tone is one of absolute physical and emotional exhaustion, stripping away any initial illusions of military pride."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "I smiled to hear that Mr. Asquith was falling apart. It was my first smile.",
          "analysis": "The tone is profoundly cynical and satirical. The infant finds amusement in political ruin, establishing a darkly comic atmosphere."
        },
        {
          "quote": "In France the conscripted soldiers leapfrogged over the dead.",
          "analysis": "The tone is shockingly detached and clinical, juxtaposing the horrific reality of the trenches with the narrator's emotionless reporting."
        },
        {
          "quote": "Omniscience is brainwashed out of us.",
          "analysis": "The tone is deeply pessimistic regarding human development, viewing 'growing up' as a tragic loss of clarity."
        }
      ],
      "Good Country People": [
        {
          "quote": "Mrs. Hopewell had no bad qualities of her own but she was able to use other people's in such a constructive way.",
          "analysis": "The tone is deadpan and highly ironic, subtly mocking the superficial 'goodness' of the farm owner."
        },
        {
          "quote": "She looked at him as if he were a badly fitting shoe.",
          "analysis": "The tone adopted when describing Hulga's perspective is arrogant and condescending, reflecting her intellectual hubris."
        },
        {
          "quote": "He was just a good country boy.",
          "analysis": "The narrator uses a deceptive, falsely innocent tone to describe Pointer, lulling the reader into the same trap that Hulga falls into."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "It is forbidden to travel east.",
          "analysis": "The opening tone is reverent, cautious, and highly superstitious, establishing the strict boundaries of the tribal society."
        },
        {
          "quote": "I was not afraid.",
          "analysis": "The tone during the journey shifts to one of determined, quiet heroism as John faces the unknown to fulfill his spiritual calling."
        },
        {
          "quote": "They were men.",
          "analysis": "The tone in the climax is one of profound awe mixed with tragic realization, as John comprehends the true nature of the 'gods'."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "Get along and doctor your sick.",
          "analysis": "The initial tone is combative, defensive, and fiercely independent, showcasing Granny's refusal to accept weakness."
        },
        {
          "quote": "It was growing dark.",
          "analysis": "The tone shifts to one of disorientation and quiet terror as the physical reality of death begins to overwhelm her."
        },
        {
          "quote": "She blew out the light.",
          "analysis": "The final tone is one of resigned, definitive finality; having been abandoned, she takes the ultimate agency in her own end."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Identify how the author's attitude positions the reader. Are we meant to pity the character, judge society, or laugh at human absurdity?",
      "formula": "The author's [Adjective] tone towards [Character/Event] forces the reader to critically evaluate the [Universal Concept]."
    }
  },
  {
    "id": "bildungsroman",
    "category": "Types of Prose Texts",
    "term": "Bildungsroman Elements",
    "definition": "Typically a type of novel that depicts an individual’s coming-of-age through self-discovery and personal knowledge, exploring moral development.",
    "examples": {
      "By the Waters of Babylon": [
        {
          "quote": "When I was a man at last, I came to my father and said, 'It is time for me to go on my journey.'",
          "analysis": "Though a short story, it functions as a mini-Bildungsroman. John leaves as an obedient boy and returns as a man bearing the burden of truth."
        },
        {
          "quote": "I saw the dead god... I thought that he was alive.",
          "analysis": "John's 'coming of age' is marked by the shattering of his childhood mythologies when he realizes the gods were merely human."
        },
        {
          "quote": "We must build again.",
          "analysis": "The resolution of his coming-of-age journey is not just gaining knowledge, but gaining the moral maturity to distribute that knowledge carefully."
        }
      ],
      "Good Country People": [
        {
          "quote": "She was brilliant but she didn't have a grain of sense.",
          "analysis": "A tragic subversion of the Bildungsroman. Hulga is 32 years old, believing she is fully developed, only to be forced into a brutal realization of her naivety."
        },
        {
          "quote": "She decided that for the first time in her life she was face to face with real innocence.",
          "analysis": "Her assumption of superiority in the loft marks the height of her arrested development before the trickster violently forces her to 'grow up'."
        },
        {
          "quote": "“You ain't so smart.”",
          "analysis": "The climax functions as a harsh initiation rite. Pointer strips away her intellectual defenses, forcing a dark, humiliating coming-of-age."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "Omniscience is brainwashed out of us; for it is demanded of us... that we grow to be of use.",
          "analysis": "An ironic inversion of the Bildungsroman. Instead of gaining knowledge as she grows up, the baby loses her profound understanding of the universe."
        },
        {
          "quote": "I smiled.",
          "analysis": "The traditional milestone of a baby's first smile is corrupted; rather than a sign of social development, it is a sign of cynical political awareness."
        },
        {
          "quote": "The grand old Duke of York.",
          "analysis": "The integration of nursery rhymes with war reports shows how society initiates the young into the violent, absurd logic of the adult world."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "Children ardent for some desperate glory.",
          "analysis": "The poem exposes the tragic flaw in the patriotic coming-of-age narrative, where young boys are lured to war under the false promise of achieving manhood."
        },
        {
          "quote": "An ecstasy of fumbling.",
          "analysis": "The gas attack serves as a violent, horrific initiation rite that strips away their youth and permanently scars them."
        },
        {
          "quote": "In all my dreams, before my helpless sight.",
          "analysis": "The 'maturity' gained is nothing but inescapable trauma, subverting the idea that suffering leads to wisdom or moral development."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "She had fenced in a hundred acres once.",
          "analysis": "The story reflects backward on her harsh coming-of-age; her maturation was forced upon her by abandonment, requiring her to adopt masculine independence."
        },
        {
          "quote": "The day she was left at the altar.",
          "analysis": "This singular traumatic event acted as the brutal catalyst for her psychological development, permanently altering her worldview."
        },
        {
          "quote": "For the second time there was no sign.",
          "analysis": "Her final moments represent a failed spiritual coming-of-age; despite a lifetime of preparation, she is entirely unready for the finality of death."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Focus on the 'cost' of coming-of-age. What illusions are permanently shattered, and what harsh truths are accepted in exchange for maturity?",
      "formula": "The narrative functions as a tragic coming-of-age, where [Character]'s loss of innocence reveals the harsh reality of [Theme]."
    }
  },
  {
    "id": "epistolary",
    "category": "Types of Prose Texts",
    "term": "Epistolary Artifacts",
    "definition": "A novel composed primarily of letters sent and received. In short fiction, letters are often used as vital narrative artifacts.",
    "examples": {
      "The Jilting of Granny Weatherall": [
        {
          "quote": "She had kept them. It was no treason to John. She had letters from John written days before they were married... but she had letters from George too.",
          "analysis": "The hidden letters serve as physical epistolary evidence of her lifelong internal conflict, bridging the past trauma with her present denial."
        },
        {
          "quote": "Tomorrow she would have Cornelia write a letter.",
          "analysis": "Granny's desire to dictate letters on her deathbed demonstrates her desperate need to maintain control and organize the affairs of the living."
        },
        {
          "quote": "The box in the attic.",
          "analysis": "The physical storage of the letters symbolizes how Granny compartmentalized her grief—hidden away, yet preserved and inescapable."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "Telegrams, letters, and news reports.",
          "analysis": "The omniscient baby 'reads' the global communications of the war, using epistolary and journalistic artifacts to expose the scale of adult madness."
        },
        {
          "quote": "The official dispatches from the front.",
          "analysis": "The formal, bureaucratic letters of war are juxtaposed against the visceral reality of the dead, highlighting the deceit of official communication."
        },
        {
          "quote": "The poetry of Wilfred Owen and Sassoon.",
          "analysis": "While not literal letters, the baby taps into the written dispatches of trench poets, treating them as truthful artifacts amidst the political lies."
        }
      ],
      "Good Country People": [
        {
          "quote": "Pointer's Bible.",
          "analysis": "Similar to a deceptive letter, Pointer's Bible is a text containing a hidden, hollowed-out reality (flask, cards), subverting the 'holy text'."
        },
        {
          "quote": "Hulga's philosophy books.",
          "analysis": "Hulga treats her academic texts as definitive letters of truth, blinding her to the practical, lived reality of the deceptive people around her."
        },
        {
          "quote": "Mrs. Hopewell's cliches.",
          "analysis": "While spoken, Mrs. Hopewell's cliches function like mass-produced greeting cards—empty, standardized messages meant to avoid genuine connection."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "I read the books and the writings.",
          "analysis": "The preserved books of the 'gods' function as epistolary artifacts from the past, conveying the lost knowledge of modern civilization."
        },
        {
          "quote": "The magic tools are broken.",
          "analysis": "The ruins of the city act as a structural 'letter' to the future, communicating the catastrophic consequences of unchecked power."
        },
        {
          "quote": "The dead god sitting in his chair.",
          "analysis": "The preserved corpse is the ultimate artifact, delivering a silent but profound message about the humanity and vulnerability of the past."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "My friend, you would not tell...",
          "analysis": "The poem structurally functions as an open letter or aggressive dispatch sent directly to the propagandist (Jessie Pope) who lied to the youth."
        },
        {
          "quote": "If you could hear, at every jolt...",
          "analysis": "Owen attempts to communicate the incommunicable trauma of the trenches, turning the poem into a desperate piece of correspondence."
        },
        {
          "quote": "The old Lie: Dulce et decorum est.",
          "analysis": "He directly attacks the revered 'letters' and texts of classical antiquity, exposing how historic writings are weaponized to cause modern slaughter."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Analyze the letters or texts as physical evidence of hidden truths, suppressed memories, or the unreliability of interpersonal communication.",
      "formula": "The inclusion of the letters serves as physical documentation of [Character]'s [Hidden Truth], exposing the gap between their public facade and private reality."
    }
  },
  {
    "id": "irony",
    "category": "Interpreting Authorial Voice",
    "term": "Irony",
    "definition": "Typically refers to saying one thing and meaning the opposite, or a situation contradicting expectations, often to shock audiences and emphasize truth.",
    "examples": {
      "Good Country People": [
        {
          "quote": "“You ain't so smart. I been believing in nothing ever since I was born!”",
          "analysis": "Ultimate situational irony: Hulga, with a PhD in philosophy, believes she is seducing a naive boy, only to be outsmarted by his true, lived nihilism."
        },
        {
          "quote": "Mrs. Hopewell's belief in 'Good Country People'.",
          "analysis": "Dramatic irony. The mother constantly praises the simple goodness of country folk, entirely unaware that the country boy has just assaulted her daughter."
        },
        {
          "quote": "Hulga changing her name from Joy.",
          "analysis": "Verbal and situational irony. She changes her name to something ugly to reject her mother's optimism, yet her intellectual pride makes her the most foolish character."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "The old Lie: Dulce et decorum est / Pro patria mori.",
          "analysis": "Deep verbal and situational irony. The title ('It is sweet and fitting to die for one's country') sets up a romantic ideal that the gruesome reality completely subverts."
        },
        {
          "quote": "Children ardent for some desperate glory.",
          "analysis": "Situational irony. The youth seek war for glory and masculinity, but the war reduces them to coughing hags and old beggars."
        },
        {
          "quote": "The safety of the helmets.",
          "analysis": "The frantic 'ecstasy of fumbling' for the gas masks is ironic; the very gear designed to save them turns into a suffocating, blinding green sea for those who fail."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "For the second time there was no sign. Again no bridegroom and the priest in the house.",
          "analysis": "The final, cosmic irony: Granny spent her life overcompensating for being jilted by a man, only to be jilted by God at the moment of her death."
        },
        {
          "quote": "“I pay my own bills, and I don't throw my money away on nonsense!”",
          "analysis": "Situational irony. Granny fiercely asserts her independence while lying helpless in a bed, entirely dependent on her daughter and the doctor."
        },
        {
          "quote": "The name 'Weatherall'.",
          "analysis": "Verbal irony. She believed she had 'weathered all' the storms of life, but she is completely unprepared to weather the finality of death."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "The 'Place of the Gods'.",
          "analysis": "Dramatic irony. The reader recognizes the 'Place of the Gods' as the ruined human city of New York, highlighting the tragic regression of society."
        },
        {
          "quote": "“They were men.”",
          "analysis": "Situational irony. The beings worshipped as divine and omnipotent by the tribe were actually the architects of their own apocalyptic destruction."
        },
        {
          "quote": "The 'Great Burning'.",
          "analysis": "Irony of progress. The pinnacle of human scientific advancement (the nuclear bomb) is what caused humanity to regress to a primitive, superstitious state."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "Omniscience is brainwashed out of us.",
          "analysis": "Situational irony. The process of education and 'growing up' is presented not as gaining knowledge, but as being forced to unlearn the truth."
        },
        {
          "quote": "I smiled to hear that Mr. Asquith was falling apart.",
          "analysis": "Irony of expectation. A baby's first smile is expected to be a moment of pure joy, but here it is a cynical reaction to a politician's ruin."
        },
        {
          "quote": "The grand old Duke of York.",
          "analysis": "Verbal irony. The cheerful, bouncing rhythm of the nursery rhyme ironically contrasts with the grim reality of sending thousands of men to meaningless deaths."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Use irony to expose hypocrisy. Highlight the devastating gap between what the character expects/believes and the harsh reality they actually receive.",
      "formula": "The profound situational irony of [Event] exposes the fundamental hypocrisy of [Character's Belief], proving that [Theme]."
    }
  },
  {
    "id": "satire",
    "category": "Interpreting Authorial Voice",
    "term": "Satire",
    "definition": "A style of writing that mocks, ridicules, or pokes fun at a person, belief, or group to challenge them using sarcasm, irony, or exaggeration.",
    "examples": {
      "The First Year of My Life": [
        {
          "quote": "I smiled to hear that Mr. Asquith was falling apart. It was my first smile.",
          "analysis": "The baby narrator's smile isn't at a mother's face, but at political ruin. This satirizes the absurdity of the adult world's manufactured priorities."
        },
        {
          "quote": "In London the well-fed politicians made speeches.",
          "analysis": "Spark uses biting satire to juxtapose the gruesome reality of the dying soldiers with the comfortable, ignorant lives of the politicians orchestrating the war."
        },
        {
          "quote": "Omniscience is brainwashed out of us.",
          "analysis": "The narrative satirizes the concept of 'maturity', arguing that human education is actually a process of learning to accept lies and violence as normal."
        }
      ],
      "Good Country People": [
        {
          "quote": "Mrs. Hopewell had no bad qualities of her own but she was able to use other people's...",
          "analysis": "O'Connor satirizes the superficial, cliché-ridden optimism of middle-class rural Americans whose identities are built on empty platitudes."
        },
        {
          "quote": "Hulga's PhD in Philosophy.",
          "analysis": "The text functions as a dark satire of secular academia. Hulga's extensive education makes her utterly blind to the practical reality of evil in the real world."
        },
        {
          "quote": "Pointer's Bible.",
          "analysis": "O'Connor satirizes performative religious piety. The Bible salesman is the most morally bankrupt character, using religion purely as a tool for predatory access."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "My friend, you would not tell with such high zest...",
          "analysis": "While more of a dark parody than traditional comedy, the poem aggressively satirizes the propaganda machine and the poets (like Jessie Pope) who fed boys lies."
        },
        {
          "quote": "Desperate glory.",
          "analysis": "Owen mocks the very concept of military glory, reducing the 'noble charge' to men coughing, drowning, and being flung into wagons."
        },
        {
          "quote": "The title.",
          "analysis": "The title itself is a satirical weapon, taking a revered Latin proverb and turning it into a symbol of betrayal."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "If you eat too much truth at once, you may die of the truth.",
          "analysis": "Benét satirizes modern humanity's unchecked technological consumption. We built weapons of mass destruction before we had the moral wisdom to control them."
        },
        {
          "quote": "The dead god sitting in his chair.",
          "analysis": "The image of the preserved human satirizes our own arrogance. We believed we were invincible 'gods', yet we died helpless in our own homes."
        },
        {
          "quote": "It is forbidden to cross the river.",
          "analysis": "The text satirizes how societies create rigid, superstitious taboos precisely to protect themselves from the catastrophic consequences of human curiosity."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "The name 'Weatherall'.",
          "analysis": "Porter satirizes the great American myth of the stoic, hyper-independent pioneer who can overcome any obstacle through sheer willpower."
        },
        {
          "quote": "Get along and doctor your sick.",
          "analysis": "The text lightly satirizes the medical profession; the doctor's interventions are completely futile against the inevitable reality of her dying body."
        },
        {
          "quote": "Her secret comfortable understanding with the saints.",
          "analysis": "Porter satirizes performative, transactional religion. Granny believes she has 'earned' a peaceful death through hard work, but is met with cosmic silence."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Identify the specific societal flaw being targeted. What is the author mocking, and what is their intended moral corrective for the audience?",
      "formula": "Through biting satire, the author mocks the [Societal Flaw] of [Group/Character], ultimately warning the reader about the dangers of [Theme]."
    }
  },
  {
    "id": "antagonist",
    "category": "Interpreting Characters",
    "term": "Antagonist",
    "definition": "A character in a text who the protagonist opposes. The antagonist is often (though not always) the villain of a story.",
    "examples": {
      "Good Country People": [
        {
          "quote": "Manley Pointer (The Bible Salesman)",
          "analysis": "Pointer acts as the primary antagonist. He weaponizes the cultural expectations of a 'good country boy' to dismantle Hulga's worldview and violate her."
        },
        {
          "quote": "Mrs. Hopewell",
          "analysis": "In a secondary sense, the mother is an antagonist to Hulga. Her relentless, clichéd optimism provides the suffocating environment Hulga rebels against."
        },
        {
          "quote": "The hollowed-out Bible.",
          "analysis": "The prop itself acts antagonistically, serving as the physical instrument of Hulga's deception and the shattering of her intellectual superiority."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "Death / Time",
          "analysis": "The true antagonist is not a person, but the inescapable forces of Time and Death, against which Granny wages a desperate, internal, losing battle."
        },
        {
          "quote": "George",
          "analysis": "The memory of George acts as a psychological antagonist. His past betrayal continues to terrorize her subconscious and dictate her defensive actions."
        },
        {
          "quote": "Doctor Harry",
          "analysis": "Doctor Harry serves as a minor physical antagonist. His medical interventions are perceived by Granny as condescending attacks on her independence."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "The 'Old Lie' / The propagandists",
          "analysis": "The antagonist of the poem is the ideological establishment (the 'You' addressed at the end) that continues to feed children the lie that war is glorious."
        },
        {
          "quote": "The Mustard Gas",
          "analysis": "The gas acts as an active, malicious, physical antagonist, represented as a 'green sea' that actively hunts and drowns the exhausted soldiers."
        },
        {
          "quote": "The nightmares.",
          "analysis": "The speaker's own mind acts as an antagonist after the war, relentlessly plunging the traumatic memory back into his 'helpless sight'."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "The Forbidden Zone / The River",
          "analysis": "The physical landscape acts as the initial antagonist, presenting life-threatening boundaries that John must cross to fulfill his quest."
        },
        {
          "quote": "The Forest People",
          "analysis": "The rival tribe serves as a traditional, physical antagonist, representing the immediate, savage danger of the post-apocalyptic world."
        },
        {
          "quote": "Human Hubris / Ignorance",
          "analysis": "The true, thematic antagonist is humanity's own arrogant drive for knowledge without wisdom, which caused the Great Burning in the first place."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "The adult world / Society",
          "analysis": "The collective structure of adult society is the primary antagonist, actively attempting to brainwash the omniscient infant and force her into conformity."
        },
        {
          "quote": "The politicians (Mr. Asquith)",
          "analysis": "The political leaders act as antagonists to humanity itself, orchestrating the mass slaughter of the war while remaining comfortable and well-fed."
        },
        {
          "quote": "The environment",
          "analysis": "The immediate environment is described as an antagonistic force that 'demands of us' that we lose our omniscience to become practically useful."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "The antagonist is not just a 'bad guy'; they are an ideological counterpoint. What specific societal force or terrifying truth do they represent?",
      "formula": "As the primary antagonist, [Character] embodies the destructive force of [Abstract Concept], serving as the catalyst for the protagonist's downfall."
    }
  },
  {
    "id": "archetype",
    "category": "Interpreting Characters",
    "term": "Archetype",
    "definition": "A resonant figure of mythic importance, whether a personality, place, or situation, found in diverse cultures. They reference broader 'stock' character types.",
    "examples": {
      "By the Waters of Babylon": [
        {
          "quote": "John (The Seeker / The Initiate)",
          "analysis": "John embodies the 'Seeker' archetype, undertaking a mythic 'Hero's Journey' into the underworld to retrieve forbidden knowledge for his people."
        },
        {
          "quote": "The Father (The Wise Sage)",
          "analysis": "The father represents the Wise Elder archetype, offering guidance, enforcing the law, and ultimately helping the hero contextualize his new knowledge."
        },
        {
          "quote": "The Dead City (The Underworld)",
          "analysis": "New York City functions as the archetypal Underworld or Forbidden Zone, a dangerous place of death where the hero must face his fears."
        }
      ],
      "Good Country People": [
        {
          "quote": "Manley Pointer (The Trickster / The Devil)",
          "analysis": "Pointer embodies the classic Trickster or Demonic archetype, arriving in disguise to expose hypocrisy, tempt the arrogant, and strip them of their pride."
        },
        {
          "quote": "Hulga (The Foolish Intellectual)",
          "analysis": "Hulga represents the archetype of the Arrogant Scholar—someone possessing immense theoretical knowledge but utterly lacking in practical wisdom."
        },
        {
          "quote": "Mrs. Hopewell (The Blind Matriarch)",
          "analysis": "She embodies the archetype of the willfully ignorant guardian, maintaining the status quo and remaining oblivious to the danger inside her own home."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "Granny (The Matriarch / The Pioneer)",
          "analysis": "Granny represents the fierce Pioneer Matriarch archetype, defined by her hyper-independence, hard work, and refusal to show weakness in a harsh world."
        },
        {
          "quote": "George (The Betrayer)",
          "analysis": "George functions as the archetypal Betrayer, the figure whose singular act of treachery irrevocably alters the trajectory of the protagonist's life."
        },
        {
          "quote": "Hapsy (The Lost Child)",
          "analysis": "Hapsy represents the archetype of the idealized, lost innocent—the singular beacon of pure love that the protagonist desperately seeks at the end."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "The 'old beggars' (The Destroyed Youth)",
          "analysis": "The soldiers subvert the Hero archetype, instead embodying the archetype of the Destroyed Youth, physically and mentally broken by the machinery of the state."
        },
        {
          "quote": "The dying man (The Sacrificial Lamb)",
          "analysis": "The soldier who fails to don his mask serves as the archetypal Sacrificial Lamb, slaughtered senselessly for the sins and political ambitions of others."
        },
        {
          "quote": "The 'friend' (The Corrupt Elder / Deceiver)",
          "analysis": "The propagandist addressed at the end embodies the Corrupt Elder archetype, feeding lies to the youth to maintain the power of the establishment."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "The baby (The Holy Fool / Prophet)",
          "analysis": "The infant embodies the 'Holy Fool' or Prophet archetype: the outsider who possesses ultimate divine knowledge but is ignored or misunderstood by society."
        },
        {
          "quote": "The politicians (The Corrupt King)",
          "analysis": "The well-fed politicians represent the classic Corrupt Ruler archetype, safe in their castles while sending their subjects to die in foreign lands."
        },
        {
          "quote": "The conscripted soldiers (The Pawns)",
          "analysis": "The dying men are reduced to the archetype of the Pawn, entirely stripped of agency and sacrificed in a game they do not control."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Elevate your analysis by connecting the specific character to a universal, timeless human pattern, emphasizing the inevitability of their fate.",
      "formula": "By casting [Character] in the archetype of the [Archetype Name], the narrative taps into the universal human experience of [Theme]."
    }
  },
  {
    "id": "diction",
    "category": "Interpreting Word Choice & Speech",
    "term": "Diction",
    "definition": "Word choice, or the specific language an author, narrator, or speaker uses to describe events and interact with other characters.",
    "examples": {
      "Dulce et Decorum Est": [
        {
          "quote": "Guttering, choking, drowning... writhing... gargling...",
          "analysis": "Owen's diction is hyper-focused on grotesque, visceral gerunds. He forces the reader to confront the active, ongoing physical agony of death."
        },
        {
          "quote": "Sludge, trudge, limped, blood-shod.",
          "analysis": "The heavy, blunt diction in the opening stanza strips away military glory, emphasizing the dehumanizing, halting physical reality of the march."
        },
        {
          "quote": "Incurable sores on innocent tongues.",
          "analysis": "The juxtaposition of 'incurable' and 'innocent' in his diction highlights the moral outrage of destroying youth for a political lie."
        }
      ],
      "Good Country People": [
        {
          "quote": "“Nothing is perfect. This was an imperfect world yesterday and will be today and tomorrow too.”",
          "analysis": "Mrs. Hopewell's diction relies entirely on hollow clichés. Her word choice reveals her refusal to think deeply or confront uncomfortable truths."
        },
        {
          "quote": "“You ain't so smart.”",
          "analysis": "Pointer's sudden shift to aggressive, colloquial diction shatters his 'innocent country boy' persona and reveals his cruel dominance."
        },
        {
          "quote": "“Malebranche was right: we are not our own light.”",
          "analysis": "Hulga's highly academic, philosophical diction is used as a weapon to alienate her mother and project a false sense of intellectual superiority."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "“I went into the Dead Places... I gathered the metal.”",
          "analysis": "Benét uses simple, almost archaic diction to reflect John's tribal, primitive worldview while describing a post-apocalyptic reality."
        },
        {
          "quote": "The 'Great Burning' and the 'Place of the Gods'.",
          "analysis": "The capitalized, mythic diction reveals how the tribe has elevated the destruction of modern humanity into religious folklore."
        },
        {
          "quote": "“My knowledge and my lack of knowledge burned in me.”",
          "analysis": "The repeated diction of 'burning' connects the protagonist's internal desire for truth with the external fire that destroyed the world."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "Swallowed... fog... marching...",
          "analysis": "Porter uses the diction of consumption and advancement to describe death, framing it as an active, terrifying force closing in on Granny."
        },
        {
          "quote": "Weatherall.",
          "analysis": "The specific diction of her name is a literal declaration of her life's strategy: she has weathered all storms, projecting stubborn endurance."
        },
        {
          "quote": "Hapsy.",
          "analysis": "The use of her lost child's name introduces a sudden, lyrical, and longing diction that cuts through Granny's typically defensive vocabulary."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "Conscripted... seditious... omniscience...",
          "analysis": "Spark uses highly formal, bureaucratic, and academic diction to highlight the infant's unnatural intellect and clinical detachment."
        },
        {
          "quote": "Brainwashed.",
          "analysis": "The specific, violent diction of 'brainwashing' reframes the normal process of socialization as a hostile, coercive act by the adult world."
        },
        {
          "quote": "Tout le monde.",
          "analysis": "The polyglot, worldly diction emphasizes the truly global, inescapable scale of the madness occurring during the war."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "Connect specific, isolated word choices to the character's social class, hidden psychological state, or true intentions.",
      "formula": "The author's deliberate use of [Adjective] diction, specifically words like '[Word 1]' and '[Word 2]', reveals the underlying [Emotion/State] of the scene."
    }
  },
  {
    "id": "climax",
    "category": "Interpreting Plot",
    "term": "Climax",
    "definition": "The height of conflict and intrigue in a narrative. This is when events are most unclear; often a decision the protagonist must make or a challenge to overcome.",
    "examples": {
      "Good Country People": [
        {
          "quote": "Pointer opening his Bible to reveal the flask and demanding Hulga's leg.",
          "analysis": "The climax occurs in the hayloft. The sudden shift in power dynamics completely shatters Hulga's worldview and exposes her utter vulnerability."
        },
        {
          "quote": "“Give me my leg!” she screamed.",
          "analysis": "The emotional climax forces Hulga, who claimed to believe in 'nothing', to desperately beg for the physical manifestation of her soul."
        },
        {
          "quote": "Pointer climbing down the ladder.",
          "analysis": "The climax resolves with the trickster escaping, leaving the protagonist stranded both physically and philosophically."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "The realization that there will be no sign from God.",
          "analysis": "The climax happens in Granny's final moments of consciousness when she realizes she is being abandoned for the ultimate, final time."
        },
        {
          "quote": "“For the second time there was no sign.”",
          "analysis": "The emotional climax bridges her past trauma with her present death, finalizing the devastating theme of ultimate isolation."
        },
        {
          "quote": "Blowing out the light.",
          "analysis": "The climax is resolved through a definitive, active choice; Granny stops fighting the inevitable and extinguishes her own life force."
        }
      ],
      "By the Waters of Babylon": [
        {
          "quote": "John's vision of the 'Great Burning' and the city's destruction.",
          "analysis": "The climax is John's spiritual realization. Looking out over the ruins, he finally understands the horrific history of the Dead Places."
        },
        {
          "quote": "“They were men.”",
          "analysis": "The psychological climax shatters the tribal mythology. Realizing the 'gods' were just humans is a paradigm-shifting moment for the protagonist."
        },
        {
          "quote": "The decision to return.",
          "analysis": "The climax demands action; armed with this dangerous truth, John must decide whether to flee or return to bear the burden for his people."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "“Gas! GAS! Quick, boys!”",
          "analysis": "The external, physical climax of the narrative interrupts the trudging rhythm, plunging the soldiers into an immediate, life-or-death panic."
        },
        {
          "quote": "“He plunges at me, guttering, choking, drowning.”",
          "analysis": "The internal, psychological climax occurs in the speaker's recurrent nightmare, demonstrating that the trauma of the event can never truly be resolved."
        },
        {
          "quote": "“The old Lie.”",
          "analysis": "The thematic or rhetorical climax of the poem arrives in the final lines, as Owen delivers his definitive, crushing verdict against the establishment."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "“I smiled.”",
          "analysis": "The climax of the baby's developmental journey is heavily ironic; rather than a moment of innocent joy, her first smile is a cynical reaction to political ruin."
        },
        {
          "quote": "Mr. Asquith falling apart.",
          "analysis": "The political climax of the adult world serves as the specific catalyst that triggers the infant's reaction, cementing the connection between the two spheres."
        },
        {
          "quote": "The loss of omniscience.",
          "analysis": "The tragic climax of the narrative occurs as the baby inevitably 'grows up', losing her profound clarity to become a 'useful' member of a corrupt society."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "The climax is the thematic breaking point. It's not just the most exciting part; it's the moment where illusions are permanently shattered.",
      "formula": "The climax of the narrative acts as the ultimate thematic crucible, where [Character]'s illusions are violently dismantled by the reality of [Theme]."
    }
  },
  {
    "id": "metaphor",
    "category": "Layers of Meaning",
    "term": "Metaphor / Simile",
    "definition": "Figures of speech that compare two things (similes use 'like' or 'as') to identify similarities, defining each in relation to one another to create profound meaning.",
    "examples": {
      "By the Waters of Babylon": [
        {
          "quote": "“Truth is a hard deer to hunt.”",
          "analysis": "This metaphor compares the pursuit of knowledge to a physical hunt, suggesting that truth requires patience, respect, effort, and can be dangerous."
        },
        {
          "quote": "“My knowledge... burned in me like a fire.”",
          "analysis": "This simile highlights the dual nature of John's desire. Like fire, knowledge provides warmth and light, but it can also consume and destroy."
        },
        {
          "quote": "“The towers... still stand, like a great tree in a forest.”",
          "analysis": "This simile compares the ruins of New York to the natural world, suggesting that nature is slowly reclaiming the hubris of mankind."
        }
      ],
      "Dulce et Decorum Est": [
        {
          "quote": "“Drunk with fatigue...”",
          "analysis": "Owen uses this metaphor to describe the soldiers' physical exhaustion, comparing their stumbling, uncoordinated movements to severe intoxication."
        },
        {
          "quote": "“Bent double, like old beggars under sacks...”",
          "analysis": "This simile strips the soldiers of their youth and heroism, establishing the profound physical degradation caused by trench warfare."
        },
        {
          "quote": "“As under a green sea, I saw him drowning.”",
          "analysis": "This metaphor transforms the chlorine gas into an inescapable ocean, emphasizing the suffocating, helpless reality of the attack."
        }
      ],
      "The Jilting of Granny Weatherall": [
        {
          "quote": "“Losing her soul in the deep pit of hell...”",
          "analysis": "Granny uses the metaphor of hell to describe the emotional devastation of being left at the altar, intertwining romantic rejection with spiritual damnation."
        },
        {
          "quote": "“The pillow rose and floated under her, pleasant as a hammock.”",
          "analysis": "This simile physically manifests her transition toward death, comparing her failing body to a drifting, weightless state."
        },
        {
          "quote": "“Her thoughts drifted... like watching the branches of a tree.”",
          "analysis": "This simile highlights her lack of mental control. Her memories happen *to* her, rather than being guided by her."
        }
      ],
      "Good Country People": [
        {
          "quote": "The wooden leg as her soul.",
          "analysis": "The wooden leg acts as a central, controlling metaphor for Hulga's spiritual and emotional deformity; it is the rigid, artificial foundation of her identity."
        },
        {
          "quote": "The hollow Bible.",
          "analysis": "The prop functions as a metaphor for Pointer's morality—appearing righteous on the surface, but entirely hollow and corrupt on the inside."
        },
        {
          "quote": "“Good country people.”",
          "analysis": "The phrase itself becomes a metaphor for a dangerous, naive stereotype that blinds the educated characters to genuine, predatory evil."
        }
      ],
      "The First Year of My Life": [
        {
          "quote": "“Brainwashed.”",
          "analysis": "Spark uses brainwashing as a metaphor for human socialization, arguing that society violently scrubs the innate truth from a child's mind."
        },
        {
          "quote": "“Leapfrogged over the dead.”",
          "analysis": "Comparing the soldiers' advance to a children's game is a dark metaphor that highlights the absurd, casual devaluation of human life in the trenches."
        },
        {
          "quote": "Nursery rhymes as political strategy.",
          "analysis": "The inclusion of songs like the Duke of York serves as a metaphor for how governments orchestrate war—treating soldiers like disposable toys in a meaningless game."
        }
      ]
    },
    "diplomaAdvice": {
      "focus": "What profound new understanding is created by comparing these two seemingly unrelated things? Focus on the darker nature revealed.",
      "formula": "The metaphor equating [Subject A] with [Subject B] reveals the fundamentally [Adjective] nature of [Theme]."
    }
  }
];

const LITERARY_TERMS_REFERENCE = 'The Basics\nCharacterization: The ways individual characters are represented by the narrator or author of a text. This includes descriptions of the characters’ physical appearances, personalities, actions, interactions, and dialogue.\nDialogue: Spoken exchanges between characters in a dramatic or literary work, usually between two or more speakers.\nGenre: A kind of literature. For instance, comedy, mystery, tragedy, satire, elegy, romance, and epic are all genres. Texts frequently draw elements from multiple genres to create dynamic narratives. Alastair Fowler uses the following elements to define genres: organizational features (chapters, acts, scenes, stanzas); length; mood (the Gothic novel tends to be moody and dark); style (a text can be high, low, or in-between depending on its audience); the reader’s role (readers of a mystery are expected to interpret evidence); and the author’s reason for writing (an epithalamion is a poem composed for marriage) (Mickics 132-3).\nImagery: A term used to describe an author’s use of vivid descriptions “that evoke sense-impressions by literal or figurative reference to perceptible or ‘concrete’ objects, scenes, actions, or states” (Baldick 121). Imagery can refer to the literal landscape or characters described in a narrative or the theoretical concepts an author employs.\nPlot: The sequence of events that occur through a work to produce a coherent narrative or story.\nPoint of View: The perspective (visual, interpretive, bias, etc.) a text takes when presenting its plot and narrative. For instance, an author might write a narrative from a specific character’s point of view, which means that that character is our narrative and readers experience events through his or her eyes.\nStyle: Comprising an author’s diction, syntax, tone, characters, and other narrative techniques, “style” is used to describe the way an author uses language to convey his or her ideas and purpose in writing. An author’s style can also be associated to the genre or mode of writing the author adopts, such as in the case of a satire or elegy with would adopt a satirical or elegiac style of writing.\nSymbol(ism): An object or element incorporated into a narrative to represent another concept or concern. Broadly, representing one thing with another. Symbols typically recur throughout a narrative and offer critical, though often overlooked, information about events, characters, and the author’s primary concerns in telling the story.\nTheme: According to Baldick, a theme may be defined as “a salient abstract idea that emerges from a literary work’s treatment of its subject-matter; or a topic recurring in a number or literary works” (Baldick 258). Themes in literature tend to differ depending on author, time period, genre, style, purpose, etc.\nTone: A way of communicating information (in writing, images, or sound) that conveys an attitude. Authors convey tone through a combination of word-choice, imagery, perspective, style, and subject matter. By adopting a specific tone, authors can help readers accurately interpret meaning in a text.\nTypes of narrative: The narrator is the voice telling the story or speaking to the audience. However, this voice can come from a variety of different perspectives, including:\nFirst person: A story told from the perspective of one or several characters, each of whom typically uses the word “I.” This means that readers “see” or experience events in the story through the narrator’s eyes.\nSecond person: A narrative perspective that typically addresses that audience using “you.” This mode can help authors address readers and invest them in the story.\nThird person: Describes a narrative told from the perspective of an outside figure who does not participate directly in the events of a story. This mode uses “he,” “she,” and “it” to describe events and characters.\nTypes of Prose Texts\nBildungsroman: This is typically a type of novel that depicts an individual’s coming-of-age through self-discovery and personal knowledge. Such stories often explore the protagonists’ psychological and moral development. Examples include Dickens’ Great Expectations and Joyce’s A Portrait of the Artist as a Young Man.\nEpistolary: A novel composed primarily of letters sent and received by its principal characters. This type of novel was particularly popular during the eighteenth century.\nEssay: According to Baldick, “a short written composition in prose that discusses a subject or proposes an argument without claiming to be a complete or thorough exposition” (Baldick 87). A notable example of the essay form is Jonathan Swift’s “A Modest Proposal,” which uses satire to discuss eighteenth-century economic and social concerns in Ireland.\nNovella: An intermediate-length (between a novel and a short story) fictional narrative.\nTerms for Interpreting Authorial Voice\nApology: Often at the beginning or conclusion of a text, the term “apology” refers to an instance in which the author or narrator justifies his or her goals in producing the text.\nIrony: Typically refers to saying one thing and meaning the opposite, often to shock audiences and emphasize the importance of the truth.\nSatire: A style of writing that mocks, ridicules, or pokes fun at a person, belief, or group of people in order to challenge them. Often, texts employing satire use sarcasm, irony, or exaggeration to assert their perspective.\nStream of consciousness: A mode of writing in which the author traces his or her thoughts verbatim into the text. Typically, this style offers a representation of the author’s exact thoughts throughout the writing process and can be used to convey a variety of different emotions or as a form of pre-writing.\nTerms for Interpreting Characters\nAntagonist: A character in a text who the protagonist opposes. The antagonist is often (though not always) the villain of a story.\nAnti-hero: A protagonist of a story who embodies none of the qualities typically assigned to traditional heroes and heroines. Not to be confused with the antagonist of a story, the anti-hero is a protagonist whose failings are typically used to humanize him or her and convey a message about the reality of human existence.\nArchetype: “a resonant figure of mythic importance, whether a personality, place, or situation, found in diverse cultures and different historical periods” (Mickics 24). Archetypes differ from allegories because they tend to reference broader or commonplace (often termed “stock”) character types, plot points, and literary conventions. Paying attention to archetypes can help readers identify what an author may posit as “universal truths” about life, society, human interaction, etc. based on what other authors or participants in a culture may have said about them.\nEpithet: According to Taafe, “An adjective, noun, or phase expressing some characteristic quality of a thing or person or a descriptive name applied to a person, as Richard the Lion-Hearted” (Taafe 58). An epithet usually indicates some notable quality about the individual with whom it addresses, but it can also be used ironically to emphasize qualities that individual might actually lack.\nPersonification: The artistic representation of a concept, quality, or idea in the form of a person. Personification can also refer to “a person who is considered a representative type of a particular quality or concept” (Taafe 120). Many classical deities are good examples of personifications. For instance, the Greek god Ares is a personification of war.\nProtagonist: The primary character in a text, often positioned as “good” or the character with whom readers are expected to identify. Protagonists usually oppose an antagonist.\nTerms for Interpreting Word Choice, Dialogue, and Speech\nAlliteration: According to Baldick, “The repetition of the same sounds—usually initial consonants of words or of stressed syllabus—in any sequence of neighboring words” (Baldick 6). Alliteration is typically used to convey a specific tone or message.\nApostrophe: This figure of speech refers to an address to “a dead or absent person, or an abstraction or inanimate object” and is “usually employed for emotional emphasis, can become ridiculous [or humorous] when misapplied” (Baldick 17).\nDiction: Word choice, or the specific language an author, narrator, or speaker uses to describe events and interact with other characters.\nTerms for Interpreting Plot\nClimax: The height of conflict and intrigue in a narrative. This is when events in the narrative and characters’ destinies are most unclear; the climax often appears as a decision the protagonist must make or a challenge he or she must overcome in order for the narrative to obtain resolution.\nDenouement: The “falling action” of a narrative, when the climax and central conflicts are resolved and a resolution is found. In a play, this is typically the last act and in a novel it might include the final chapters.\nDeus Ex Machina: According to Taafe, “Literally, in Latin, the ‘god from the machine’; a deity in Greek and Roman drama who was brought in by stage machinery to intervene in the action; hence, any character, event, or device suddenly introduced to resolve the conflict” (43).\nExposition: Usually located at the beginning of a text, this is a detailed discussion introducing characters, setting, background information, etc. readers might need to know in order to understand the text that follows. This section is particularly rich for analysis because it contains a lot of important information in a relatively small space.\nFrame Narrative: a story that an author encloses around the central narrative in order to provide background information and context. This is typically referred to as a “story within a story” or a “tale within a tale.” Frame stories are usually located in a distinct place and time from the narratives they surround. Examples of stories with frame narratives include Canterbury Tales, Frankenstein, and Wuthering Heights.\nIn media res: Beginning in “the middle of things,” or when an author begins a text in the midst of action. This often functions as a way to both incorporate the reader directly into the narrative and secure his or her interest in the narrative that follows.\nTerms for Interpreting Layers of Meaning\nAllegory: A literary mode that attempts to convert abstract concepts, values, beliefs, or historical events into characters or other tangible elements in a narrative. Examples include, Gulliver’s Travels, The Faerie Queene, Pilgrim’s Progress, and Paradise Lost.\nAllusion: When a text references, incorporates, or responds to an earlier piece (including literature, art, music, film, event, etc). T.S. Eliot’s The Waste Land (1922) offers an extensive example of allusion in literature. According to Baldick, “The technique of allusion is an economical means of calling upon the history or the literary tradition that author and reader are assumed to share” (7).\nHyperbole: exaggerated language, description, or speech that is not meant to be taken literally, but is used for emphasis. For instance, “I’ve been waiting here for ages” or “This bag weighs a ton.”\nMetaphor: a figure of speech that refers to one thing by another in order to identify similarities between the two (and therefore define each in relation to one another).\nMetonymy: a figure of speech that substitutes a quality, idea, or object associated with a certain thing for the thing itself. For instance, referring to a woman as “a skirt” or the sea as “the deep” are examples of metonymy. Using metonymy can not only evoke a specific tone (determined by the attribute being emphasized or the thing to which it refers), but also comments on the importance of the specific element that is doing the substituting.\nNote that metonymy differs subtly from synecdoche, which substitutes a part of something for the whole. For example, the phrase "all hands on deck" can substitute for the more awkward "all people on deck."\nParody: a narrative work or writing style that mocks or mimics another genre or work. Typically, parodies exaggerate and emphasize elements from the original work in order to ridicule, comment on, or criticize their message.\nSimile: a figure of speech that compares two people, objects, elements, or concepts using “like” or “as.”';
const execFileAsync = promisify(execFile);
const NEXT_STEP_LOGO_SOURCE_PATH = path.join(
  repoRoot,
  "docs",
  "design",
  "next-step",
  "assets",
  "nxt-ce-logo-white-with-ce.png"
);

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripBOM(value: string) {
  return value.replace(/^\uFEFF/, "");
}

function decodeHtmlEntities(value: string) {
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scriptJson(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function safeDecodeUri(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function withoutQuery(value: string) {
  const withoutSearch = value.split("?", 1)[0] ?? value;
  return withoutSearch.replace(/#(?!\d+;|x[0-9a-f]+;).*/i, "");
}

function normalizeZipPath(value: string) {
  return path.posix
    .normalize(value.replace(/\\/g, "/").replace(/^\/+/, ""))
    .replace(/^\.\//, "");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toSafeId(value: string, fallback = "item") {
  return slugify(value).slice(0, 80) || fallback;
}

function toSafeFileName(zipPath: string) {
  const parsed = path.posix.parse(zipPath);
  const base = parsed.name
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "asset"}${parsed.ext.toLowerCase()}`;
}

function toSafeImageFileName(zipPath: string, extensionOverride?: string) {
  const parsed = path.posix.parse(zipPath);
  const base = parsed.name
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "image"}${extensionOverride ?? parsed.ext.toLowerCase()}`;
}

function toLocalResourceFileName(zipPath: string) {
  const parsed = path.posix.parse(zipPath);
  const base = slugify(parsed.name).slice(0, 80);
  return `${base || "resource"}.html`;
}

function sourceKindForPath(zipPath: string): "html" | "pdf" | "other" {
  const extension = path.posix.extname(zipPath).toLowerCase();
  if (extension === ".html" || extension === ".htm") {
    return "html";
  }
  if (extension === ".pdf") {
    return "pdf";
  }
  return "other";
}

function firstExistingPath(candidates: string[], zipEntries: Set<string>) {
  for (const candidate of candidates) {
    const normalized = normalizeZipPath(candidate);
    if (zipEntries.has(normalized)) {
      return normalized;
    }
  }

  const lowerEntries = new Map([...zipEntries].map((entry) => [entry.toLowerCase(), entry]));
  for (const candidate of candidates) {
    const normalized = normalizeZipPath(candidate);
    const match = lowerEntries.get(normalized.toLowerCase());
    if (match) {
      return match;
    }
  }

  return null;
}

function resolveAssetPath(input: { lessonHref: string; rawSrc: string; zipEntries: Set<string> }) {
  const decoded = safeDecodeUri(decodeHtmlEntities(withoutQuery(input.rawSrc))).replace(/\\/g, "/");
  if (!decoded || /^(https?:|data:|mailto:)/i.test(decoded)) {
    return null;
  }

  const lessonDir = path.posix.dirname(normalizeZipPath(input.lessonHref));
  const candidates = [decoded, path.posix.join(lessonDir, decoded)].filter(Boolean);
  const directMatch = firstExistingPath(candidates, input.zipEntries);
  if (directMatch) {
    return directMatch;
  }

  const basename = path.posix.basename(decoded).toLowerCase();
  return [...input.zipEntries].find((entry) => path.posix.basename(entry).toLowerCase() === basename) ?? null;
}

function resolveLocalPath(input: { lessonHref: string; rawHref: string; zipEntries: Set<string> }) {
  const decoded = safeDecodeUri(decodeHtmlEntities(withoutQuery(input.rawHref))).replace(/\\/g, "/");
  if (!decoded || /^(https?:|data:|mailto:|#|javascript:)/i.test(decoded)) {
    return null;
  }
  const lessonDir = path.posix.dirname(normalizeZipPath(input.lessonHref));
  return firstExistingPath([decoded, path.posix.join(lessonDir, decoded)], input.zipEntries);
}


const YOUTUBE_VIDEO_TITLES: Record<string, string> = {
  "1KbDdiku75E": "Types of Characters",
  "vhxLbjYOmrg": "Characterization Review",
  "j1bfOBBl6pQ": "Irony: Three Types",
  "SKi56cPUSFk": "Point of View",
  "WH5jlkK4aUI": "Plot Elements",
  "30CPmgVQNks": "Setting in a Story",
  "FzpJnYIQv98": "Symbols and Motifs",
  "YcCrsVK5dWs": "Tone vs. Mood",
  "urEh4_fTtao": "Word Choice and Diction",
  "RecVd-6g-IY": "Theme Review"
};

function youtubeIdFromEmbed(embedSrc: string) {
  const match = embedSrc.match(/\/embed\/([^?&#/]+)/);
  return match?.[1] ?? "";
}

function videoTitleFromEmbed(embedSrc: string, fallback: string) {
  const videoId = youtubeIdFromEmbed(embedSrc);
  if (videoId && YOUTUBE_VIDEO_TITLES[videoId]) {
    return YOUTUBE_VIDEO_TITLES[videoId];
  }
  const cleaned = normalizeWhitespace(fallback);
  return cleaned && !/^embedded video$/i.test(cleaned) ? cleaned : "Short Story Video";
}

function normalizeYouTubeEmbedSrc(rawUrl: string) {
  const decoded = safeDecodeUri(decodeHtmlEntities(rawUrl));
  try {
    const url = new URL(decoded);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const embedMatch = url.pathname.match(/^\/embed\/([^/?#]+)/);
      if (embedMatch?.[1]) {
        return `https://www.youtube.com/embed/${embedMatch[1]}${url.search}`;
      }
    }
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function cleanXmlTitle(value: string) {
  return normalizeWhitespace(value.replace(/<[^>]+>/g, ""));
}

function directChildText($: cheerio.CheerioAPI, element: Element, childSelector: string) {
  return cleanXmlTitle($(element).children(childSelector).first().text());
}

function getResourceMap($: cheerio.CheerioAPI) {
  const resources = new Map<string, string>();
  $("resource").each((_, element) => {
    const identifier = $(element).attr("identifier");
    const href = $(element).attr("href");
    if (identifier && href) {
      resources.set(identifier, normalizeZipPath(href));
    }
  });
  return resources;
}

function findShortStoriesUnit($: cheerio.CheerioAPI) {
  let matched: Element | null = null;
  $("item").each((_, element) => {
    const title = directChildText($, element as Element, "title").toLowerCase();
    if (title === "short stories") {
      matched = element as Element;
      return false;
    }
    return undefined;
  });
  return matched;
}

function sourceLessonItems($: cheerio.CheerioAPI, parentItem: Element, resources: Map<string, string>) {
  const items: Element[] = [];
  const visit = (item: Element) => {
    $(item).children("item").each((_, child) => {
      const childElement = child as Element;
      const identifier = $(childElement).attr("identifierref") ?? "";
      if (resources.has(identifier)) {
        items.push(childElement);
      }
      visit(childElement);
    });
  };
  visit(parentItem);
  return items;
}

async function readZipText(zip: JSZip, zipPath: string) {
  const file = zip.file(zipPath);
  if (!file) {
    throw new Error(`Missing ZIP entry: ${zipPath}`);
  }
  return decodeBrightspaceHtml(await file.async("nodebuffer"));
}

async function readZipBuffer(zip: JSZip, zipPath: string) {
  const file = zip.file(zipPath);
  if (!file) {
    throw new Error(`Missing ZIP entry: ${zipPath}`);
  }
  return file.async("nodebuffer");
}

async function writeZipEntry(zip: JSZip, zipPath: string, targetPath: string) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, await readZipBuffer(zip, zipPath));
}

function isJpeg2000Buffer(buffer: Buffer) {
  return buffer.subarray(0, 12).equals(Buffer.from([0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20, 0x0d, 0x0a, 0x87, 0x0a]));
}

async function convertJpeg2000ToPng(buffer: Buffer, targetPath: string) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "canvas-helper-jp2-"));
  const tempSource = path.join(tempDir, "source.jp2");
  try {
    await writeFile(tempSource, buffer);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await execFileAsync("sips", ["-s", "format", "png", tempSource, "--out", targetPath]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function writeBrowserSafeImage(zip: JSZip, zipPath: string, workspaceDir: string) {
  const buffer = await readZipBuffer(zip, zipPath);
  const needsPngConversion = isJpeg2000Buffer(buffer);
  const workspaceSrc = `assets/source/${toSafeImageFileName(zipPath, needsPngConversion ? ".png" : undefined)}`;
  const targetPath = path.join(workspaceDir, workspaceSrc);
  if (needsPngConversion) {
    await convertJpeg2000ToPng(buffer, targetPath);
  } else {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, buffer);
  }
  return workspaceSrc;
}


function renderLiteraryTermsReference() {
  const rawLines = LITERARY_TERMS_REFERENCE.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const lines = rawLines.reduce<string[]>((acc, line) => {
    if (/^Note that metonymy differs subtly/i.test(line) && acc.length > 0) {
      const previous = acc[acc.length - 1];
      if (/^Metonymy:/i.test(previous)) {
        acc[acc.length - 1] = `${previous} ${line}`;
        return acc;
      }
    }
    acc.push(line);
    return acc;
  }, []);
  const chunks: string[] = [];
  let openList = false;
  const closeList = () => {
    if (openList) {
      chunks.push("</dl>");
      openList = false;
    }
  };

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      if (!openList) {
        chunks.push('<dl class="terms-list">');
        openList = true;
      }
      const term = line.slice(0, colonIndex).trim();
      const definition = line.slice(colonIndex + 1).trim();
      chunks.push(`<div class="term-row"><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(definition)}</dd></div>`);
      continue;
    }

    if (/^Note that/i.test(line) && openList) {
      chunks.push(`<div class="term-row term-note"><dt>Note</dt><dd>${escapeHtml(line)}</dd></div>`);
      continue;
    }

    closeList();
    chunks.push(`<h3>${escapeHtml(line)}</h3>`);
  }

  closeList();
  return `<section class="terms-reference"><h2>Literary Terms Reference</h2><p><a class="source-link" href="${PURDUE_OWL_LITERARY_TERMS_URL}" target="_blank" rel="noopener noreferrer">Purdue OWL Literary Terms</a></p>${chunks.join("\n")}</section>`;
}

function enhanceShortStoriesLessonContent(title: string, contentHtml: string) {
  if (/Literary Terms/i.test(title)) {
    return `${contentHtml}\n${renderLiteraryTermsReference()}`;
  }
  return contentHtml;
}

function removeDuplicateHeading($: cheerio.CheerioAPI, title: string) {
  const normalizedTitle = normalizeWhitespace(title).toLowerCase();
  $("h1, h2").first().each((_, element) => {
    const headingText = normalizeWhitespace($(element).text()).toLowerCase();
    if (headingText === normalizedTitle || headingText.replace(/^lesson\s+\d+:\s*/i, "") === normalizedTitle) {
      $(element).remove();
    }
  });
}

async function cleanHtmlLesson(input: {
  zip: JSZip;
  zipEntries: Set<string>;
  sourceHref: string;
  title: string;
  workspaceDir: string;
}) {
  const rawHtml = await readZipText(input.zip, input.sourceHref);
  const $ = cheerio.load(rawHtml);
  $("script, style, link, meta, title").remove();
  removeDuplicateHeading($, input.title);
  if (/elements of fiction|literary terms/i.test(input.title)) {
    $("p").each((_, element) => {
      const paragraph = $(element);
      const paragraphText = normalizeWhitespace(paragraph.text());
      const paragraphHtml = paragraph.html() ?? "";
      const hasOwlLink = paragraph.find("a").toArray().some((linkElement) => {
        const link = $(linkElement);
        return /purdue|owl|literary terms/i.test(`${link.text()} ${link.attr("href") ?? ""}`);
      });
      const hasOwlImage = paragraph.find("img").toArray().some((imageElement) => {
        const image = $(imageElement);
        return /purdue|owl|owl[_-]?header/i.test(`${image.attr("src") ?? ""} ${image.attr("alt") ?? ""} ${image.attr("title") ?? ""}`);
      });
      if (hasOwlLink || hasOwlImage || /Purdue Online Writing Lab/i.test(paragraphText + " " + paragraphHtml)) {
        paragraph.remove();
      }
    });
  }
  const brokenExternalUrlPatterns = [
    /learner\.org\/exhibits\/literature\/read\/pov1/i,
    /dowse\.com\/fiction\/Lawrence/i,
    /pch\.gc\.ca\/progs\/cpsc-ccsp\/sc-cs\/index_e\.cfm/i,
    /webster\.commnet\.edu\/writing\/symbols/i,
    /eldritchpress\.org\/nh\/dhe/i,
    /xroads\.virginia\.edu\/~hyper\/POE\/telltale/i,
    /www-usr\.rider\.edu\/~suler\/zenstory\/(workhard|emptycup)/i
  ];
  $("a[href]").each((_, element) => {
    const link = $(element);
    const href = link.attr("href") ?? "";
    if (brokenExternalUrlPatterns.some((pattern) => pattern.test(href))) {
      link.replaceWith(link.text());
      return;
    }
    if (/bibliomania\.com\/0\/0\/29\/63\/frameset/i.test(href)) {
      link.attr("href", "https://www.bibliomania.com/0/0/29/63/frameset.html");
    }
    if (/wilstar\.com\/xmas\/xmassymb/i.test(href)) {
      link.attr("href", "https://wilstar.com/christmas/symbols-and-their-history/");
    }
  });
  $("p").each((_, element) => {
    const paragraph = $(element);
    if (!normalizeWhitespace(paragraph.text()) && paragraph.find("img, video, audio, iframe, object, embed, source").length === 0) {
      paragraph.remove();
    }
  });

  $("span, font").each((_, element) => {
    const current = $(element);
    if (!current.attr("class") && !current.attr("id")) {
      current.replaceWith(current.html() ?? "");
    }
  });

  const videos: SourceVideo[] = [];
  $("iframe[src]").each((_, element) => {
    const frame = $(element);
    const frameContainer = frame.closest("p, div");
    const originalSrc = frame.attr("src") ?? "";
    const embedSrc = normalizeYouTubeEmbedSrc(originalSrc);
    if (!embedSrc) {
      return;
    }
    const removeBrokenCharacterizationVideo =
      /characters and characterization/i.test(input.title) && /\/embed\/vhxLbjYOmrg/i.test(embedSrc);
    if (removeBrokenCharacterizationVideo) {
      frame.remove();
      if (
        frameContainer.length > 0 &&
        !normalizeWhitespace(frameContainer.text()) &&
        frameContainer.find("img, video, audio, iframe, object, embed, source").length === 0
      ) {
        frameContainer.remove();
      }
      return;
    }
    frame.attr("src", embedSrc);
    frame.attr("class", "source-video-frame");
    frame.attr("loading", "lazy");
    frame.attr("title", frame.attr("title") ?? "Embedded video");
    frame.attr("allow", frame.attr("allow") ?? "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    frame.attr("allowfullscreen", "true");
    frame.removeAttr("width");
    frame.removeAttr("height");
    videos.push({
      id: toSafeId(`${input.title}-${embedSrc}`, "video"),
      title: videoTitleFromEmbed(embedSrc, frame.attr("title") ?? input.title),
      embedSrc,
      originalSrc,
      origin: "iframe"
    });
  });

  const links: SourceLink[] = [];
  const assetCopies: Promise<void>[] = [];
  $("img[src]").each((_, element) => {
    const image = $(element);
    const originalSrc = image.attr("src") ?? "";
    const imageAlt = normalizeWhitespace(image.attr("alt") ?? image.attr("title") ?? "");
    const titleContext = normalizeWhitespace(input.title).toLowerCase();
    if (/(elements of fiction|literary terms)/i.test(titleContext) && /purdue|owl/i.test(imageAlt + " " + originalSrc)) {
      image.closest("p").remove();
      return;
    }
    const resolvedPath = resolveAssetPath({ lessonHref: input.sourceHref, rawSrc: originalSrc, zipEntries: input.zipEntries });
    if (!resolvedPath) {
      return;
    }
    image.attr("alt", normalizeWhitespace(image.attr("alt") ?? image.attr("title") ?? path.posix.parse(resolvedPath).name));
    image.attr("loading", "lazy");
    image.attr("class", "source-image");
    assetCopies.push(
      writeBrowserSafeImage(input.zip, resolvedPath, input.workspaceDir).then((workspaceSrc) => {
        image.attr("src", workspaceSrc);
      })
    );
  });

  $("a[href]").each((_, element) => {
    const link = $(element);
    const href = link.attr("href") ?? "";
    const text = normalizeWhitespace(link.text()) || href;
    if (/owl\.english\.purdue\.edu|owl\.purdue\.edu.*literary_terms|literary[_-]terms/i.test(href) || /Purdue OWL Literary Terms/i.test(text)) {
      link.attr("href", PURDUE_OWL_LITERARY_TERMS_URL);
    }
    const embedSrc = normalizeYouTubeEmbedSrc(href);
    if (embedSrc) {
      videos.push({
        id: toSafeId(`${input.title}-${embedSrc}`, "video"),
        title: videoTitleFromEmbed(embedSrc, text || input.title),
        embedSrc,
        originalSrc: href,
        origin: "link"
      });
    }

    const localPath = resolveLocalPath({ lessonHref: input.sourceHref, rawHref: href, zipEntries: input.zipEntries });
    if (localPath) {
      const workspaceHref =
        sourceKindForPath(localPath) === "html"
          ? `resources/${toLocalResourceFileName(localPath)}`
          : `assets/source/${toSafeFileName(localPath)}`;
      link.attr("href", workspaceHref);
      link.attr("target", "_blank");
      link.attr("rel", "noopener noreferrer");
      links.push({ text, href, kind: "local", workspaceHref, zipPath: localPath });
      return;
    }

    if (/^https?:/i.test(href)) {
      link.attr("target", "_blank");
      link.attr("rel", "noopener noreferrer");
      links.push({ text, href, kind: "external", workspaceHref: href });
    }
  });

  await Promise.all(assetCopies);
  const body = $("body");
  const root = body.length ? body : $.root();
  const text = normalizeWhitespace(root.text());
  let contentHtml = (body.length ? body.html() : $.root().html()) ?? "";
  contentHtml = contentHtml
    .replace(/@2019 CBe-learn - Calgary Board of Education/g, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();

  return {
    contentHtml,
    text,
    links: uniqueBy(links, (link) => `${link.kind}:${link.workspaceHref}`),
    videos: uniqueBy(videos, (video) => video.embedSrc)
  };
}

async function buildDocumentLesson(input: {
  zip: JSZip;
  sourceHref: string;
  title: string;
  workspaceDir: string;
  sourceKind: "pdf" | "other";
}) {
  const workspaceHref = `assets/source/${toSafeFileName(input.sourceHref)}`;
  await writeZipEntry(input.zip, input.sourceHref, path.join(input.workspaceDir, workspaceHref));
  const label = input.sourceKind === "pdf" ? "PDF" : "source document";
  const frameMarkup =
    input.sourceKind === "pdf"
      ? `<iframe class="source-document-frame" src="${escapeHtml(workspaceHref)}" title="${escapeHtml(input.title)}"></iframe>`
      : "";
  const linkText = `Open ${input.title}`;
  return {
    contentHtml: `<p><a class="source-link" href="${escapeHtml(workspaceHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkText)}</a></p>${frameMarkup}`,
    text: `${input.title} ${label}`,
    links: [{ text: linkText, href: input.sourceHref, kind: "local" as const, workspaceHref, zipPath: input.sourceHref }],
    videos: [] as SourceVideo[]
  };
}

function uniqueBy<T>(items: T[], keyFor: (item: T) => string) {
  const seen = new Set<string>();
  const results: T[] = [];
  for (const item of items) {
    const key = keyFor(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    results.push(item);
  }
  return results;
}

function truncate(value: string, length = 180) {
  const clean = normalizeWhitespace(value);
  if (clean.length <= length) {
    return clean;
  }
  return `${clean.slice(0, length - 1).trim()}...`;
}

function isFictionElementLesson(lesson: Lesson) {
  return lesson.sequence >= 4 && lesson.sequence <= 11;
}

function isFictionElementsHub(lesson: Lesson) {
  return lesson.sequence === 3;
}

function topLevelLessons(lessons: Lesson[]) {
  return lessons
    .filter((lesson) => !isFictionElementLesson(lesson))
    .sort((first, second) => {
      const firstIsSuggestions = /Suggestions for Reading Short Stories/i.test(first.title);
      const secondIsSuggestions = /Suggestions for Reading Short Stories/i.test(second.title);
      const firstIsLiteraryTerms = /Literary Terms/i.test(first.title);
      const secondIsLiteraryTerms = /Literary Terms/i.test(second.title);
      if (firstIsLiteraryTerms && secondIsSuggestions) return -1;
      if (firstIsSuggestions && secondIsLiteraryTerms) return 1;
      return first.sequence - second.sequence;
    });
}

function topLevelLessonNumber(lesson: Lesson, lessons: Lesson[]) {
  return topLevelLessons(lessons).findIndex((candidate) => candidate.id === lesson.id) + 1;
}

function displayLessonTitle(lesson: Lesson, lessons: Lesson[]) {
  if (isFictionElementLesson(lesson)) {
    return lesson.title.replace(/^Lesson\s+\d+:\s*/i, "");
  }
  const topLevelNumber = topLevelLessonNumber(lesson, lessons);
  if (/^Lesson\s+\d+:/i.test(lesson.title)) {
    return lesson.title.replace(/^Lesson\s+\d+:/i, `Lesson ${topLevelNumber}:`);
  }
  return lesson.title;
}

function renderNavLinks(lessons: Lesson[]) {
  const visibleLessons = topLevelLessons(lessons);
  return visibleLessons
    .map(
      (lesson) =>
        `<a class="sublesson-link block rounded-lg px-3 py-2 font-caption text-caption text-surface-variant hover:bg-white/5 hover:text-white" href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}">${topLevelLessonNumber(lesson, lessons)}. ${escapeHtml(displayLessonTitle(lesson, lessons).replace(/^Lesson\s+\d+:\s*/i, ""))}</a>`
    )
    .join("\n");
}

function renderLessonsOverview(lessons: Lesson[]) {
  const visibleLessons = topLevelLessons(lessons);
  const groups = [
    {
      title: "Start Here",
      lessons: visibleLessons.filter((lesson) => lesson.sequence <= 3)
    },
    {
      title: "Reading And Writing",
      lessons: visibleLessons.filter((lesson) => lesson.sequence >= 12)
    }
  ].filter((group) => group.lessons.length > 0);

  return groups
    .map(
      (group, index) => `<details class="resource-lesson-group"${index === 0 ? " open" : ""}>
        <summary class="resource-lesson-summary">
          <span class="resource-lesson-label">
            <span class="resource-lesson-kicker">Lesson Group</span>
            ${escapeHtml(group.title)}
          </span>
        </summary>
        <div class="resource-lesson-items">
          ${group.lessons
            .map(
              (lesson) => `<a class="lesson-card block border border-surface-variant rounded-lg bg-white p-md transition-colors" href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}">
                <span class="font-caption text-caption text-primary">Lesson ${topLevelLessonNumber(lesson, lessons)}</span>
                <strong class="block font-label-md text-label-md text-on-surface mt-1">${escapeHtml(displayLessonTitle(lesson, lessons))}</strong>
                <span class="block font-caption text-caption text-on-surface-variant mt-2">${escapeHtml(truncate(lesson.text, 140))}</span>
              </a>`
            )
            .join("\n")}
        </div>
      </details>`
    )
    .join("\n");
}

function renderFictionElementsChecklist(lessons: Lesson[]) {
  const elementLessons = lessons.filter(isFictionElementLesson);
  if (elementLessons.length === 0) {
    return "";
  }
  return `<section class="elements-checklist" aria-labelledby="elements-checklist-title">
    <div class="elements-checklist-header">
      <h3 id="elements-checklist-title">Elements of Fiction Checklist</h3>
      <p data-elements-complete-summary>0/${elementLessons.length} elements complete</p>
    </div>
    <table class="elements-table">
      <thead>
        <tr>
          <th scope="col">Done</th>
          <th scope="col">Element</th>
          <th scope="col">What to review</th>
        </tr>
      </thead>
      <tbody>
        ${elementLessons
          .map(
            (elementLesson) => `<tr>
              <td><span class="element-check" data-element-complete-for="${escapeHtml(elementLesson.id)}" aria-label="Not complete">-</span></td>
              <td><button class="element-selector" type="button" data-element-target="${escapeHtml(elementLesson.id)}">${escapeHtml(elementLesson.title.replace(/^Lesson\s+\d+:\s*/i, ""))}</button></td>
              <td>${escapeHtml(truncate(elementLesson.text, 120))}</td>
            </tr>`
          )
          .join("\n")}
      </tbody>
    </table>
    <div class="element-panels">
      ${elementLessons
        .map(
          (elementLesson, index) => `<article class="element-panel" data-element-panel="${escapeHtml(elementLesson.id)}"${index === 0 ? "" : " hidden"}>
            <h3>${escapeHtml(elementLesson.title.replace(/^Lesson\s+\d+:\s*/i, ""))}</h3>
            <div class="source-content">${elementLesson.contentHtml}</div>
            ${renderSourceLinks(elementLesson.links)}
            <div class="flex flex-wrap gap-sm mt-lg pt-md border-t border-surface-muted lesson-bottom-bar">
              <button class="mark-complete bg-primary hover:bg-primary-container text-white font-label-md text-label-md px-4 py-3 rounded-lg transition-colors" data-complete-id="${escapeHtml(elementLesson.id)}">Mark Complete</button>
            </div>
          </article>`
        )
        .join("\n")}
    </div>
  </section>`;
}

function renderSourceLinks(links: SourceLink[]) {
  if (links.length === 0) {
    return "";
  }
  return `<section class="mt-lg p-md bg-white rounded-lg border border-surface-variant">
    <h3 class="font-headline-md text-headline-md text-on-surface mb-sm">Source Links</h3>
    <ul class="space-y-2">${links
      .map(
        (link) =>
          `<li><a class="source-link" href="${escapeHtml(link.workspaceHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.text)}</a></li>`
      )
      .join("")}</ul>
  </section>`;
}

function renderLessonPanel(lesson: Lesson, lessons: Lesson[]) {
  const visibleLessons = topLevelLessons(lessons);
  const visibleIndex = visibleLessons.findIndex((candidate) => candidate.id === lesson.id);
  const previous = visibleLessons[visibleIndex - 1];
  const next = visibleLessons[visibleIndex + 1];
  return `<section id="${escapeHtml(lesson.id)}" class="course-page" hidden>
    <article class="lesson-detail-panel bg-surface-container-low rounded-lg p-lg border-t-4 border-primary">
      <div class="flex flex-wrap items-start justify-between gap-md mt-sm mb-md">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">${escapeHtml(displayLessonTitle(lesson, lessons))}</h2>
        </div>
      </div>
      <div class="source-content">${lesson.contentHtml}${isFictionElementsHub(lesson) ? renderFictionElementsChecklist(lessons) : ""}</div>
      ${renderSourceLinks(lesson.links)}
      <div class="flex flex-wrap gap-sm mt-lg pt-md border-t border-surface-muted lesson-bottom-bar">
        ${previous ? `<a class="lesson-jump" href="#${escapeHtml(previous.id)}" data-page-target="${escapeHtml(previous.id)}">Previous</a>` : `<a class="lesson-jump" href="#lessons" data-page-target="lessons">Lesson Library</a>`}
        ${next ? `<a class="lesson-jump primary" href="#${escapeHtml(next.id)}" data-page-target="${escapeHtml(next.id)}">Next Lesson</a>` : `<a class="lesson-jump primary" href="#writing" data-page-target="writing">Writing Studio</a>`}
        <button class="mark-complete bg-primary hover:bg-primary-container text-white font-label-md text-label-md px-4 py-3 rounded-lg transition-colors" data-complete-id="${escapeHtml(lesson.id)}">Mark Complete</button>
      </div>
    </article>
  </section>`;
}

function renderResourceGroups(groups: ResourceGroup[], localResources: SourceLink[] = []) {
  const localBlock = localResources.length
    ? `<section class="resource-lesson-group">
        <div class="resource-group-heading">
          <h3>Recovered Unit Documents</h3>
          <p>Local files recovered from the Brightspace export.</p>
        </div>
        <div class="resource-lesson-items p-md">
          ${localResources
            .map(
              (item) => `<article class="external-resource-card">
                <span class="resource-kicker">Local Source</span>
                <h3>${escapeHtml(item.text)}</h3>
                <p>${escapeHtml(item.workspaceHref)}</p>
                <a class="external-resource-action" href="${escapeHtml(item.workspaceHref)}" target="_blank" rel="noopener noreferrer">Open Resource</a>
              </article>`
            )
            .join("\n")}
        </div>
      </section>`
    : "";
  if (groups.length === 0) {
    return localBlock || `<article class="empty-route-card"><h3>No extra source links yet</h3><p>This first pass only found lesson pages in the Brightspace unit. Add outside links or media later and they can be grouped here.</p></article>`;
  }
  return `${localBlock}
  <div class="scene-overview-control">
    <label class="film-room-label" for="resource-select">Choose a lesson group</label>
    <select id="resource-select" class="film-room-select" data-resource-select>
      ${groups.map((group, index) => `<option value="${escapeHtml(group.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(group.title)}</option>`).join("")}
    </select>
  </div>
  ${groups
    .map(
      (group, index) => `<section class="resource-lesson-group" data-resource-panel="${escapeHtml(group.id)}"${index === 0 ? "" : " hidden"}>
        <div class="resource-lesson-items p-md">
          ${group.items
            .map(
              (item) => `<article class="external-resource-card">
                <span class="resource-kicker">${item.kind === "external" ? "External Source" : "Local Source"}</span>
                <h3>${escapeHtml(item.text)}</h3>
                <p>${escapeHtml(item.workspaceHref)}</p>
                <a class="external-resource-action" href="${escapeHtml(item.workspaceHref)}" target="_blank" rel="noopener noreferrer">Open Resource</a>
              </article>`
            )
            .join("\n")}
        </div>
      </section>`
    )
    .join("\n")}`;
}

function renderLibrary(localResources: SourceLink[]) {
  if (localResources.length === 0) {
    return `<article class="empty-route-card"><h3>Library is ready for handouts</h3><p>No PDF or local document handouts were found in the Short Stories unit export. Rubrics, exemplars, and teacher files can be added here next.</p></article>`;
  }
  return `<div class="library-browser">
    <aside class="library-list-panel">
      <h3>Unit Documents</h3>
      <p>Local resources recovered from the Brightspace unit.</p>
      <div class="library-doc-list">
        ${localResources
          .map(
            (item, index) => `<button class="library-doc-tab${index === 0 ? " active" : ""}" type="button" data-library-doc-target="${escapeHtml(toSafeId(item.workspaceHref, "doc"))}" aria-pressed="${index === 0 ? "true" : "false"}">
              <span class="library-doc-index">${index + 1}</span>
              <span><strong>${escapeHtml(item.text)}</strong><small>${escapeHtml(item.workspaceHref)}</small></span>
            </button>`
          )
          .join("\n")}
      </div>
    </aside>
    <div class="library-reader-panel">
      ${localResources
        .map(
          (item, index) => `<section data-library-doc-panel="${escapeHtml(toSafeId(item.workspaceHref, "doc"))}"${index === 0 ? "" : " hidden"}>
            <div class="library-reader-header">
              <div><h3>${escapeHtml(item.text)}</h3><p>${escapeHtml(item.workspaceHref)}</p></div>
              <div class="library-actions"><a href="${escapeHtml(item.workspaceHref)}" target="_blank" rel="noopener noreferrer">Open</a></div>
            </div>
            ${item.workspaceHref.toLowerCase().endsWith(".pdf") ? `<iframe class="library-document-frame" src="${escapeHtml(item.workspaceHref)}" title="${escapeHtml(item.text)}"></iframe>` : `<div class="library-file-fallback"><p>Open this recovered source in a new tab.</p></div>`}
          </section>`
        )
        .join("\n")}
    </div>
  </div>`;
}

function renderFilmRoom(videos: SourceVideo[]) {
  if (videos.length === 0) {
    return `<article class="empty-route-card"><h3>Film Room is ready for media</h3><p>No video or audio media was included in this Brightspace export. Short-story explainers, author context, or reading-support videos can be added here later.</p></article>`;
  }
  return `<div class="film-room-shell">
    <div class="film-room-stage">
      ${videos
        .map(
          (video, index) => `<section class="film-panel" data-film-panel="${escapeHtml(video.id)}"${index === 0 ? "" : " hidden"}>
            <div class="film-room-header"><h3>${escapeHtml(video.title)}</h3></div>
            <iframe class="film-room-frame" src="${escapeHtml(video.embedSrc)}" title="${escapeHtml(video.title)}" allowfullscreen loading="lazy"></iframe>
          </section>`
        )
        .join("\n")}
    </div>
    <aside class="film-room-sidebar">
      <div class="film-room-control-panel">
        <h3>Media Playlist</h3>
        <label class="film-room-label" for="film-select">Choose a video</label>
        <select id="film-select" class="film-room-select" data-film-select>
          ${videos.map((video, index) => `<option value="${escapeHtml(video.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(video.title)}</option>`).join("")}
        </select>
      </div>
    </aside>
  </div>`;
}

function renderShortStoryBank(items: StoryBankItem[]) {
  if (items.length === 0) {
    return `<article class="empty-route-card">
      <h3>Short Story Bank</h3>
      <p>This section will hold the short stories, reading questions, and story-specific response work for the unit.</p>
    </article>`;
  }
  return `<div class="library-browser story-bank-browser">
    <aside class="library-list-panel">
      <h3>Stories</h3>
      <p>Select a text to read, download, or open in a full browser view.</p>
      <div class="library-doc-list">
        ${items
          .map(
            (item, index) => `<button class="library-doc-tab${index === 0 ? " active" : ""}" type="button" data-story-doc-target="${escapeHtml(item.id)}" aria-pressed="${index === 0 ? "true" : "false"}">
              <span class="library-doc-index">${index + 1}</span>
              <span><strong>${escapeHtml(item.title)}</strong><small>Short story reading</small></span>
            </button>`
          )
          .join("\n")}
      </div>
    </aside>
    <div class="library-reader-panel">
      ${items
        .map(
          (item, index) => `<section data-story-doc-panel="${escapeHtml(item.id)}"${index === 0 ? "" : " hidden"}>
            <div class="library-reader-header">
              <div><h3>${escapeHtml(item.title)}</h3><p>Short story reading</p></div>
              <div class="library-actions">
                <a href="${escapeHtml(item.workspaceHref)}" target="_blank" rel="noopener noreferrer">Open</a>
                <button type="button" data-story-fullscreen-src="${escapeHtml(item.workspaceHref)}" data-story-fullscreen-title="${escapeHtml(item.title)}">Full Screen</button>
                <a href="${escapeHtml(item.workspaceHref)}" download>Download</a>
              </div>
            </div>
            <iframe class="library-document-frame" src="${escapeHtml(item.workspaceHref)}" title="${escapeHtml(item.title)}"></iframe>
          </section>`
        )
        .join("\n")}
    </div>
  </div>`;
}

function renderWritingStudio(stories: WritingWorksheetStory[]) {
  const defaultAnalysisStory = ANALYSIS_STORIES[0]?.id ?? "";
  const defaultAnalysisTerm = ANALYSIS_TERMS[0]?.id ?? "";
  return `<div class="worksheet-studio" data-worksheet-studio>
    <section class="analysis-explorer" data-analysis-explorer>
      <div class="analysis-explorer-header">
        <div>
          <h3>Analysis Explorer</h3>
          <p>Use this as a model bank: choose a device, choose a story, then study examples, course annotations, and diploma-ready writing moves.</p>
        </div>
      </div>
      <div class="analysis-shell">
        <aside class="analysis-term-panel">
          <label class="analysis-search-label" for="analysis-term-search">Search terms
            <input id="analysis-term-search" type="search" placeholder="Search literary terms..." data-analysis-search>
          </label>
          <select class="analysis-mobile-term-select" data-analysis-term-select aria-label="Choose literary term">
            ${LEXICON_TERMS.map((term) => `<option value="${escapeHtml(term.id)}"${term.id === defaultAnalysisTerm ? " selected" : ""}>${escapeHtml(term.term)}</option>`).join("")}
          </select>
          <div class="analysis-term-list" data-analysis-term-list></div>
        </aside>
        <div class="analysis-detail-panel">
          <div class="analysis-term-definition" data-analysis-definition></div>
          <div class="analysis-controls">
            <label for="analysis-story-select">Story
              <select id="analysis-story-select" data-analysis-story-select></select>
            </label>
          </div>
          <div class="analysis-results" data-analysis-results></div>
          <div class="analysis-diploma" data-analysis-diploma></div>
        </div>
      </div>
    </section>
  </div>`;
}

function renderShortStoryQuestions(stories: WritingWorksheetStory[]) {
  const defaultStory = stories[0]?.id ?? "";
  return `<div class="worksheet-studio story-questions-studio" data-worksheet-studio data-default-worksheet-story="${escapeHtml(defaultStory)}">
    <section class="story-question-selector">
      <label for="story-question-select">Choose a story
        <select id="story-question-select" data-worksheet-select>
          ${stories
            .map((story, index) => `<option value="${escapeHtml(story.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(story.title)}</option>`)
            .join("\n")}
        </select>
      </label>
    </section>
    <section class="worksheet-panel" data-worksheet-panel>
      <div class="worksheet-toolbar">
        <div></div>
        <div class="worksheet-toolbar-actions">
          <span class="worksheet-save-status" data-worksheet-save-status></span>
          <button type="button" data-worksheet-toggle-hints><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>
          <button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
        </div>
      </div>
      <article class="worksheet-document">
        <header class="worksheet-document-header">
          <p>ELA 30-1 Critical Analysis</p>
          <h3 data-worksheet-title></h3>
          <span data-worksheet-author></span>
          <div class="worksheet-progress">
            <div><span>Formative Progress</span><strong data-worksheet-progress-label>0 of 0 answered</strong></div>
            <div class="worksheet-progress-track"><div data-worksheet-progress-fill></div></div>
          </div>
        </header>
        <div class="worksheet-questions" data-worksheet-questions></div>
        <section class="worksheet-synthesis">
          <h3>Diploma Exam Connection</h3>
          <p>Synthesize your understanding of the text to prepare for Part A of the ELA 30-1 Diploma Exam.</p>
          <label class="worksheet-answer-field">
            <span>Critical/Analytical Response Theme Statement</span>
            <small data-worksheet-theme-prompt></small>
            <textarea rows="5" data-worksheet-answer="thesis" placeholder="Draft your thematic thesis statement here..."></textarea>
          </label>
          <label class="worksheet-answer-field">
            <span>Personal Response to Texts</span>
            <small data-worksheet-prt-prompt></small>
            <textarea rows="7" data-worksheet-answer="prt" placeholder="Draft your personal response reflection here..."></textarea>
          </label>
        </section>
      </article>
    </section>
  </div>`;
}

async function extractHeadAssets() {
  const streetcarHtml = await readFile(path.join(repoRoot, "projects", "ela30-1-modern-drama", "workspace", "index.html"), "utf8");
  const config = streetcarHtml.match(/<script id="tailwind-config">[\s\S]*?<\/script>/)?.[0] ?? "";
  const style = streetcarHtml.match(/<style>[\s\S]*?<\/style>/)?.[0] ?? "";
  const fonts = [
    '<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>',
    '<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800&amp;family=IBM+Plex+Sans:wght@600&amp;family=Work+Sans:wght@400;600&amp;display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">'
  ].join("\n");
  return `${fonts}\n${config}\n${style}`;
}

function buildResourceGroups(lessons: Lesson[]) {
  return lessons
    .map((lesson) => ({
      id: `resources-${lesson.id}`,
      title: `Lesson ${lesson.sequence}: ${lesson.title.replace(/^Lesson\s+\d+:\s*/i, "")}`,
      items: lesson.links
    }))
    .filter((group) => group.items.length > 0);
}

async function copyStoryBankItems(workspaceDir: string) {
  const storyBankDir = path.join(workspaceDir, "assets", "story-bank");
  await mkdir(storyBankDir, { recursive: true });
  const items: StoryBankItem[] = [];
  for (const source of STORY_BANK_SOURCES) {
    const sourcePath = path.join(STORY_BANK_SOURCE_DIR, source.fileName);
    const fileName = toSafeFileName(`${source.title}.pdf`);
    const workspaceHref = `assets/story-bank/${fileName}`;
    await copyFile(sourcePath, path.join(workspaceDir, workspaceHref));
    items.push({
      id: toSafeId(source.title, "story"),
      title: source.title,
      sourcePath,
      workspaceHref
    });
  }
  return items;
}

async function loadWritingWorksheets() {
  const source = await readFile(WRITING_WORKSHEET_SOURCE_PATH, "utf8");
  const match = source.match(/const stories = (\[[\s\S]*?\n  \]);/);
  if (!match) {
    throw new Error(`Could not extract stories array from ${WRITING_WORKSHEET_SOURCE_PATH}`);
  }
  return Function(`"use strict"; return (${match[1]});`)() as WritingWorksheetStory[];
}

function buildHtml(input: {
  headAssets: string;
  lessons: Lesson[];
  resourceGroups: ResourceGroup[];
  localResources: SourceLink[];
  storyBankItems: StoryBankItem[];
  writingWorksheets: WritingWorksheetStory[];
  videos: SourceVideo[];
}) {
  const lessonIds = input.lessons.map((lesson) => lesson.id);
  const visibleLessonIds = topLevelLessons(input.lessons).map((lesson) => lesson.id);
  const elementIds = input.lessons.filter(isFictionElementLesson).map((lesson) => lesson.id);
  const elementHubId = input.lessons.find(isFictionElementsHub)?.id ?? "";
  const total = input.lessons.length;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>ELA 30-1 - Short Stories</title>
${input.headAssets}
<style>
.course-main { min-height: 100vh; }
.student-response-field { display: grid; gap: 8px; margin-top: 14px; }
.student-response-field span { font-family: "IBM Plex Sans"; font-size: 13px; color: #154212; }
.student-response-field textarea { width: 100%; border: 1px solid #c2c9bb; border-radius: 8px; background: #fff; padding: 12px; font-family: "Work Sans"; font-size: 15px; line-height: 1.55; }
.worksheet-studio { margin-top: 28px; }
.story-questions-studio { margin-top: 22px; }

.story-question-selector { margin-bottom: 18px; max-width: 520px; }
.story-question-selector label { display: grid; gap: 8px; color: #154212; font-weight: 800; }
.story-question-selector select { min-height: 48px; border: 1px solid #b9c5b1; border-radius: 8px; background: #fff; color: #171b17; font: inherit; font-weight: 700; padding: 10px 12px; }
.story-questions-studio .worksheet-panel { margin-top: 0; }

.analysis-explorer { margin-bottom: 26px; padding: 18px; background: #fff; border: 1px solid #d9dadb; border-radius: 10px; }
.analysis-explorer-header { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 16px; }
.analysis-explorer-header h3 { margin: 0; font-family: "Hanken Grotesk"; font-size: 28px; line-height: 1.15; font-weight: 800; }
.analysis-explorer-header p { margin: 6px 0 0; color: #5d6359; max-width: 780px; }
.analysis-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px; }
.analysis-controls label { display: grid; gap: 6px; color: #154212; font-family: "IBM Plex Sans"; font-size: 13px; font-weight: 700; }
.analysis-controls select { width: 100%; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; padding: 10px 12px; color: #191c1d; font-family: "Work Sans"; font-size: 15px; }
.analysis-controls select:focus { outline: 2px solid rgba(21, 66, 18, 0.18); border-color: #154212; }
.analysis-results { display: grid; gap: 12px; }
.analysis-example-card { border: 1px solid #e1e3e4; border-radius: 10px; background: #fdfdfb; padding: 16px; }
.analysis-example-card h4 { margin: 0 0 12px; font-family: "Hanken Grotesk"; font-size: 20px; line-height: 1.2; font-weight: 800; }
.analysis-example-row { margin-top: 10px; color: #42493e; line-height: 1.55; }
.analysis-example-row strong { display: block; margin-bottom: 2px; color: #154212; font-family: "IBM Plex Sans"; font-size: 13px; }
.analysis-takeaway { margin-top: 12px; border-left: 3px solid #154212; background: #f5f7f2; padding: 10px 12px; color: #31372f; line-height: 1.5; }
.analysis-empty { border: 1px solid #e1e3e4; border-radius: 10px; padding: 16px; background: #f8f9fa; color: #5d6359; }
.worksheet-picker { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
.worksheet-story-card { display: grid; gap: 8px; min-height: 190px; padding: 18px; text-align: left; background: #fff; border: 1px solid #d9dadb; border-radius: 10px; color: #191c1d; cursor: pointer; }
.worksheet-story-card:hover, .worksheet-story-card:focus-visible { border-color: #154212; outline: 2px solid rgba(21, 66, 18, 0.18); outline-offset: 2px; }
.worksheet-story-card .material-symbols-outlined { color: #154212; }
.worksheet-story-card strong { font-family: "Hanken Grotesk"; font-size: 22px; line-height: 1.15; font-weight: 800; }
.worksheet-story-card small { color: #5d6359; font-size: 14px; }
.worksheet-story-card em { align-self: end; color: #42493e; font-size: 14px; font-style: normal; }
.worksheet-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.worksheet-toolbar button, .worksheet-back { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; color: #154212; padding: 9px 12px; font-weight: 700; cursor: pointer; }
.worksheet-toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.worksheet-save-status { min-width: 92px; color: #5d6359; font-size: 14px; }
.worksheet-document { background: #fff; border: 1px solid #d9dadb; border-radius: 10px; overflow: hidden; }
.worksheet-document-header { background: #161a17; color: #fff; padding: 28px; }
.worksheet-document-header p { margin: 0 0 10px; color: #b9c3b2; font-family: "IBM Plex Sans"; font-size: 13px; font-weight: 700; }
.worksheet-document-header h3 { margin: 0; font-family: "Hanken Grotesk"; font-size: clamp(30px, 4vw, 48px); line-height: 1.05; font-weight: 800; }
.worksheet-document-header > span { display: block; margin-top: 8px; color: #d7ddd4; font-size: 18px; }
.worksheet-progress { margin-top: 22px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.16); }
.worksheet-progress > div:first-child { display: flex; justify-content: space-between; gap: 12px; color: #d7ddd4; font-size: 14px; }
.worksheet-progress-track { height: 8px; margin-top: 8px; background: #293029; border-radius: 999px; overflow: hidden; }
.worksheet-progress-track div { height: 100%; width: 0; background: #9fcf93; }
.worksheet-questions { padding: 26px 28px 0; }
.worksheet-section { margin-bottom: 34px; }
.worksheet-section h4 { margin: 0 0 18px; padding-bottom: 8px; border-bottom: 1px solid #e6e8e5; font-family: "Hanken Grotesk"; font-size: 24px; font-weight: 800; }
.worksheet-question { margin-bottom: 26px; }
.worksheet-question-prompt { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; margin-bottom: 10px; font-size: 17px; line-height: 1.55; }
.worksheet-question-prompt strong { color: #154212; }
.worksheet-hint { margin: 0 0 12px 44px; padding: 12px; border: 1px solid #d5d8cc; background: #fbfaf0; color: #514d33; border-radius: 8px; font-size: 14px; }
.worksheet-answer-field { display: grid; gap: 8px; margin-left: 44px; }
.worksheet-answer-field span { color: #154212; font-family: "IBM Plex Sans"; font-size: 14px; font-weight: 700; }
.worksheet-answer-field small { color: #5d6359; font-size: 14px; line-height: 1.45; }
.worksheet-answer-field textarea { width: 100%; min-height: 118px; border: 1px solid #c5c9c1; border-radius: 8px; background: #f8f9fa; padding: 12px; font-family: "Work Sans"; font-size: 15px; line-height: 1.55; resize: vertical; }
.worksheet-answer-field textarea:focus { outline: 2px solid rgba(21, 66, 18, 0.18); border-color: #154212; background: #fff; }
.worksheet-word-count { justify-self: end; color: #747a70; font-size: 12px; }
.worksheet-synthesis { margin: 28px; padding: 24px; background: #161a17; color: #fff; border-radius: 10px; }
.worksheet-synthesis h3 { margin: 0 0 8px; font-family: "Hanken Grotesk"; font-size: 26px; font-weight: 800; }
.worksheet-synthesis p { color: #d7ddd4; }
.worksheet-synthesis .worksheet-answer-field { margin-left: 0; margin-top: 18px; }
.worksheet-synthesis .worksheet-answer-field span { color: #cfe8c7; }
.worksheet-synthesis .worksheet-answer-field small { color: #d7ddd4; }
.worksheet-synthesis textarea { background: #222822; border-color: #3b4639; color: #fff; }
.unit-outcomes { margin-top: 24px; }
.unit-outcomes-lead { margin: 0 0 10px; font-family: "Hanken Grotesk"; font-size: 22px; line-height: 1.25; font-weight: 800; color: #191c1d; }
.unit-focus-list { display: grid; gap: 10px; margin-top: 24px; }
.unit-focus-list li { border-left: 3px solid #154212; background: #f8f9fa; padding: 10px 14px; }
.terms-reference { margin-top: 32px; border-top: 1px solid #d9dadb; padding-top: 24px; }
.terms-reference h2 { font-family: "Hanken Grotesk"; font-size: 26px; line-height: 1.2; font-weight: 800; margin: 0 0 12px; }
.terms-reference h3 { margin-top: 24px; }
.terms-list { display: grid; gap: 10px; margin: 14px 0 24px; }
.term-row { display: grid; grid-template-columns: minmax(140px, 220px) minmax(0, 1fr); gap: 16px; border-bottom: 1px solid #e1e3e4; padding: 10px 0; }
.term-row dt { font-family: "IBM Plex Sans"; font-weight: 700; color: #154212; }
.term-row dd { margin: 0; color: #42493e; }
.term-note { margin-top: -6px; border-bottom-color: #edf0eb; }
.term-note dt { color: #5d5e61; font-size: 13px; }
.term-note dd { font-size: 14px; line-height: 1.5; color: #5d5e61; }
.elements-checklist { margin-top: 28px; padding-top: 22px; border-top: 1px solid #d9dadb; }
.elements-checklist-header { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.elements-checklist-header h3 { margin: 0; font-family: "Hanken Grotesk"; font-size: 26px; line-height: 1.2; font-weight: 800; }
.elements-checklist-header p { margin: 0; color: #4d554a; font-size: 16px; }
.elements-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #d9dadb; }
.elements-table th, .elements-table td { padding: 12px 14px; border-bottom: 1px solid #e6e8e5; text-align: left; vertical-align: top; }
.elements-table th { color: #154212; font-family: "IBM Plex Sans"; font-size: 13px; font-weight: 700; }
.elements-table th:first-child, .elements-table td:first-child { width: 64px; text-align: center; }
.elements-table tbody tr:last-child td { border-bottom: 0; }
.element-selector { appearance: none; border: 0; background: transparent; color: #154212; padding: 0; text-align: left; text-decoration: underline; text-underline-offset: 3px; font: inherit; font-weight: 700; cursor: pointer; }
.element-selector.active { color: #191c1d; text-decoration-thickness: 2px; }
.element-check { display: inline-grid; place-items: center; width: 26px; height: 26px; border: 1px solid #b7c4b2; border-radius: 6px; color: #6b7167; font-weight: 800; line-height: 1; }
.element-check.is-complete { background: #154212; border-color: #154212; color: #fff; }
.element-panels { margin-top: 24px; }
.element-panel { border-top: 1px solid #d9dadb; padding-top: 24px; }
.element-panel h3 { margin: 0 0 16px; font-family: "Hanken Grotesk"; font-size: 30px; line-height: 1.2; font-weight: 800; }
.library-actions button { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 10px 16px; border-radius: 8px; border: 1px solid #154212; background: #154212; color: #fff; font-weight: 700; text-decoration: none; cursor: pointer; font: inherit; }
.story-reader-overlay { position: fixed; inset: 0; z-index: 80; background: rgba(15, 17, 18, 0.86); padding: 24px; }
.story-reader-dialog { display: grid; grid-template-rows: auto minmax(0, 1fr); height: 100%; max-width: 1180px; margin: 0 auto; background: #fff; border: 1px solid #d9dadb; }
.story-reader-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-bottom: 1px solid #d9dadb; }
.story-reader-title { margin: 0; font-family: "Hanken Grotesk"; font-size: 20px; line-height: 1.25; font-weight: 800; }
.story-reader-close { display: inline-grid; place-items: center; width: 38px; height: 38px; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; color: #191c1d; cursor: pointer; }
.story-reader-frame { width: 100%; height: 100%; border: 0; background: #f8f9fa; }

.analysis-shell { display: grid; grid-template-columns: minmax(210px, 260px) minmax(0, 1fr); gap: 18px; }
.analysis-term-panel { border: 1px solid #e1e3e4; border-radius: 10px; background: #f8f9fa; padding: 12px; align-self: start; }
.analysis-search-label { display: grid; gap: 6px; color: #154212; font-family: "IBM Plex Sans"; font-size: 13px; font-weight: 700; }
.analysis-search-label input { width: 100%; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; padding: 10px 12px; color: #191c1d; font-family: "Work Sans"; font-size: 15px; }
.analysis-mobile-term-select { display: none; width: 100%; margin-top: 10px; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; padding: 10px 12px; font-family: "Work Sans"; }
.analysis-term-list { display: grid; gap: 14px; margin-top: 14px; max-height: 540px; overflow: auto; padding-right: 4px; }
.analysis-category h4 { margin: 0 0 7px; color: #66705f; font-family: "IBM Plex Sans"; font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.analysis-term-button { display: block; width: 100%; border: 0; border-radius: 8px; background: transparent; color: #31372f; padding: 8px 10px; text-align: left; font-family: "Hanken Grotesk"; font-size: 16px; font-weight: 800; cursor: pointer; }
.analysis-term-button:hover, .analysis-term-button:focus-visible { background: #eef2ea; outline: 2px solid rgba(21, 66, 18, 0.14); }
.analysis-term-button.active { background: #154212; color: #fff; }
.analysis-detail-panel { min-width: 0; }
.analysis-term-definition { border: 1px solid #e1e3e4; border-radius: 10px; background: #fff; padding: 16px; margin-bottom: 12px; }
.analysis-term-definition h4 { margin: 0 0 8px; font-family: "Hanken Grotesk"; font-size: 26px; line-height: 1.15; font-weight: 800; }
.analysis-term-definition p { margin: 0; color: #42493e; line-height: 1.55; }
.analysis-category-label { margin: 0 0 6px !important; color: #154212 !important; font-family: "IBM Plex Sans"; font-size: 13px; font-weight: 700; }
.analysis-example-grid { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 16px; }
.analysis-quote strong { display: block; margin-bottom: 6px; color: #154212; font-family: "IBM Plex Sans"; font-size: 13px; }
.analysis-quote blockquote { margin: 0; border-left: 3px solid #c5c9c1; padding-left: 12px; color: #31372f; font-style: italic; line-height: 1.55; }
.analysis-course-annotation { margin-bottom: 14px; border-left: 3px solid #154212; background: #f5f7f2; padding: 10px 12px; }
.analysis-course-annotation strong { display: block; color: #154212; font-family: "IBM Plex Sans"; font-size: 13px; }
.analysis-course-annotation p { margin: 5px 0 0; color: #42493e; line-height: 1.5; }
.analysis-diploma { margin-top: 14px; border-radius: 10px; background: #161a17; color: #fff; padding: 18px; }
.analysis-diploma h4 { margin: 0 0 14px; font-family: "Hanken Grotesk"; font-size: 24px; font-weight: 800; }
.analysis-diploma-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.analysis-diploma-grid div { border: 1px solid #3b4639; border-radius: 8px; background: #222822; padding: 14px; }
.analysis-diploma-grid strong { display: block; margin-bottom: 6px; color: #cfe8c7; font-family: "IBM Plex Sans"; font-size: 13px; }
.analysis-diploma-grid p { margin: 0; color: #f4f7f2; line-height: 1.55; }


@media (max-width: 1100px) { .analysis-shell { grid-template-columns: 1fr; } .analysis-term-list { display: none; } .analysis-mobile-term-select { display: block; } .analysis-example-grid, .analysis-diploma-grid { grid-template-columns: 1fr; } }


@media (max-width: 720px) { .term-row { grid-template-columns: 1fr; gap: 4px; } .elements-checklist-header { align-items: start; flex-direction: column; } .elements-table th:nth-child(3), .elements-table td:nth-child(3) { display: none; } }








/* clean-mobile-menu-final */
@media (min-width: 1101px) {
  .course-sidebar { top: 64px !important; left: 0 !important; right: auto !important; bottom: 0 !important; width: 18rem !important; max-height: none !important; }
  .course-main { margin-left: 18rem !important; padding-top: 6rem !important; }
  body.sidebar-collapsed .course-sidebar { width: 76px !important; overflow-x: hidden !important; }
  body.sidebar-collapsed .course-main { margin-left: 76px !important; padding-top: 6rem !important; }
  body.sidebar-collapsed .sidebar-title,
  body.sidebar-collapsed .sidebar-course-label,
  body.sidebar-collapsed .sidebar-label,
  body.sidebar-collapsed .lesson-subnav,
  body.sidebar-collapsed .lessons-toggle-icon { display: none !important; }
  body.sidebar-collapsed .sidebar-header { padding: 12px 8px !important; display: flex !important; justify-content: center !important; }
  body.sidebar-collapsed .sidebar-toggle-button { position: static !important; display: inline-flex !important; }
  body.sidebar-collapsed .course-sidebar nav { display: flex !important; flex-direction: column !important; gap: 8px !important; padding: 8px !important; }
  body.sidebar-collapsed .course-nav-link { width: 52px !important; min-height: 52px !important; margin: 0 auto !important; padding: 0 !important; justify-content: center !important; gap: 0 !important; }
}
@media (max-width: 1100px) {
  body.sidebar-collapsed .course-sidebar { display: none !important; }
  body.sidebar-collapsed .course-main { margin-left: 0 !important; padding-top: 6rem !important; }
  body:not(.sidebar-collapsed) .course-sidebar {
    display: flex !important;
    position: fixed !important;
    top: 64px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: auto !important;
    width: 100% !important;
    max-height: 172px !important;
    overflow-y: auto !important;
    border-bottom: 1px solid rgba(255,255,255,0.12);
  }
  body:not(.sidebar-collapsed) .course-sidebar .sidebar-header { display: none !important; }
  body:not(.sidebar-collapsed) .course-sidebar nav {
    display: grid !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 6px !important;
    padding: 10px 12px !important;
  }
  body:not(.sidebar-collapsed) .course-nav-link {
    margin: 0 !important;
    min-height: 40px !important;
    padding: 8px 10px !important;
    border-radius: 8px !important;
  }
  body:not(.sidebar-collapsed) .course-nav-link .material-symbols-outlined { font-size: 22px !important; }
  body:not(.sidebar-collapsed) .lessons-nav { display: contents !important; }
  body:not(.sidebar-collapsed) .lesson-subnav { display: none !important; }
  body:not(.sidebar-collapsed) .lessons-nav.is-open .lesson-subnav {
    grid-column: 1 / -1 !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 6px !important;
    margin: 0 !important;
    padding-top: 6px !important;
  }
  body:not(.sidebar-collapsed) .course-main { margin-left: 0 !important; padding-top: 250px !important; }
}
@media (max-width: 640px) {
  body:not(.sidebar-collapsed) .course-sidebar { max-height: 220px !important; }
  body:not(.sidebar-collapsed) .course-sidebar nav { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  body:not(.sidebar-collapsed) .course-main { padding-top: 292px !important; }
}

</style>
</head>
<body class="bg-surface-container-lowest text-on-surface">
<header class="course-topbar bg-ink-dark text-white fixed top-0 left-0 right-0 z-50">
  <a class="topbar-logo-link" href="#overview" data-page-target="overview" aria-label="Next Step home"><img class="next-step-logo" src="assets/brand/nxt-ce-logo-white-with-ce.png" alt="Next Step Continuing Education"></a>
  <button id="topbar-menu-toggle" class="topbar-menu-toggle" type="button" aria-label="Toggle menu"><span class="material-symbols-outlined" aria-hidden="true">dock_to_left</span></button>
  <div class="top-progress-shell">
    <div class="top-progress-meta"><span>Course Progress</span><strong data-progress-count>0 / ${total} lessons</strong><strong data-progress-percent>0%</strong></div>
    <div class="top-progress-bar"><div class="top-progress-fill" data-progress-fill></div></div>
  </div>
</header>
<aside class="course-sidebar fixed left-0 top-16 bottom-0 z-40 hidden md:flex flex-col bg-ink-dark text-surface-variant w-72 overflow-y-auto">
  <div class="sidebar-header p-lg pb-md">
    <button id="sidebar-toggle" class="sidebar-toggle-button hidden md:inline-flex" type="button" aria-label="Toggle sidebar"><span class="material-symbols-outlined" aria-hidden="true">dock_to_left</span></button>
    <h1 class="sidebar-title font-headline-md text-headline-md font-bold text-white mb-1">Short Stories</h1>
    <p class="sidebar-course-label font-caption text-caption text-surface-variant">ELA 30-1</p>
  </div>
  <nav class="flex flex-col gap-1 pb-lg">
    <a class="course-nav-link active flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#overview" data-page-target="overview"><span class="material-symbols-outlined" aria-hidden="true">dashboard</span><span class="sidebar-label">Overview</span></a>
    <div class="lessons-nav">
      <a class="course-nav-link lessons-toggle flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#lessons" data-page-target="lessons" data-lessons-toggle aria-expanded="false" aria-controls="lesson-subnav"><span class="material-symbols-outlined" aria-hidden="true">menu_book</span><span class="sidebar-label">Lessons</span><span class="material-symbols-outlined lessons-toggle-icon ml-auto" aria-hidden="true">expand_more</span></a>
      <div id="lesson-subnav" class="lesson-subnav ml-12 mr-3 mt-1 space-y-1">${renderNavLinks(input.lessons)}</div>
    </div>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#story-bank" data-page-target="story-bank"><span class="material-symbols-outlined" aria-hidden="true">auto_stories</span><span class="sidebar-label">Short Story Bank</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#story-questions" data-page-target="story-questions"><span class="material-symbols-outlined" aria-hidden="true">quiz</span><span class="sidebar-label">Short Story Questions</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#writing" data-page-target="writing"><span class="material-symbols-outlined" aria-hidden="true">edit_note</span><span class="sidebar-label">Writing Studio</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#film-room" data-page-target="film-room"><span class="material-symbols-outlined" aria-hidden="true">live_tv</span><span class="sidebar-label">Film Room</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#resources" data-page-target="resources"><span class="material-symbols-outlined" aria-hidden="true">folder_open</span><span class="sidebar-label">Resources</span></a>
  </nav>
</aside>
<main class="course-main md:ml-72 px-md md:px-xl py-xl">
  <div class="max-w-6xl mx-auto">
    <section id="overview" class="course-page">
      <div>
          <h2 class="font-display-lg text-display-lg text-on-surface mt-xs mb-sm">Short Stories</h2>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">In this unit, you will review the core tools of short fiction: characterization, irony, point of view, plot, setting, symbol, motif, tone, mood, diction, and theme. You will use those tools to read short stories more closely and prepare for personal response writing.</p>
          <div class="unit-outcomes">
            <p class="unit-outcomes-lead">I can...</p>
            <ul class="unit-focus-list font-body-md text-body-md text-on-surface-variant">
              <li>read short fiction as a crafted text, not just a sequence of events.</li>
              <li>notice how fiction elements work together to shape meaning.</li>
              <li>collect evidence that supports interpretation and personal response.</li>
            </ul>
          </div>
          <div class="flex flex-wrap gap-sm mt-lg">
            <span class="completed-pill"><strong data-progress-count-inline>0/${total}</strong> lessons complete</span>
            <span class="completed-pill">${total} source lessons</span>
            <span class="completed-pill">Brightspace conversion</span>
          </div>
          <a class="external-resource-action mt-lg" href="#lessons" data-page-target="lessons">Open Lesson Frame</a>
        </div>
    </section>
    <section id="lessons" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Lessons</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Short Stories Lesson Sequence</h2>
      <div class="resource-stack mt-lg">${renderLessonsOverview(input.lessons)}</div>
    </section>
    ${input.lessons.filter((lesson) => !isFictionElementLesson(lesson)).map((lesson) => renderLessonPanel(lesson, input.lessons)).join("\n")}
    <section id="story-bank" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Short Story Bank</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Short Story Bank</h2>
      <div class="mt-lg">${renderShortStoryBank(input.storyBankItems)}</div>
    </section>
    <section id="story-questions" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Short Story Questions</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Short Story Questions</h2>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">Choose a story to open its guided response questions, evidence prompts, and diploma-writing practice.</p>
      ${renderShortStoryQuestions(input.writingWorksheets)}
    </section>
    <section id="writing" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Writing Studio</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Personal Response Workspace</h2>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">Use these tools to turn short-story reading into clear personal and analytical writing.</p>
      ${renderWritingStudio(input.writingWorksheets)}
    </section>
    <section id="film-room" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Film Room</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Media Room</h2>
      <div class="mt-lg">${renderFilmRoom(input.videos)}</div>
    </section>
    <section id="resources" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Resources</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Source Resources</h2>
      <div class="resource-stack mt-lg">${renderResourceGroups(input.resourceGroups, input.localResources)}</div>
    </section>
  </div>
</main>
<div class="story-reader-overlay" data-story-reader-overlay hidden>
  <div class="story-reader-dialog" role="dialog" aria-modal="true" aria-labelledby="story-reader-title">
    <div class="story-reader-bar">
      <h2 id="story-reader-title" class="story-reader-title" data-story-reader-title>Short Story</h2>
      <button class="story-reader-close" type="button" data-story-reader-close aria-label="Close full screen reader"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
    </div>
    <iframe class="story-reader-frame" data-story-reader-frame title="Short story full screen reader"></iframe>
  </div>
</div>
<script>
const lessonIds = ${scriptJson(lessonIds)};
const visibleLessonIds = ${scriptJson(visibleLessonIds)};
const elementIds = ${scriptJson(elementIds)};
const elementHubId = ${scriptJson(elementHubId)};
const writingWorksheets = ${scriptJson(input.writingWorksheets)};
const analysisTerms = ${scriptJson(ANALYSIS_TERMS)};
const analysisStories = ${scriptJson(ANALYSIS_STORIES)};
const lexiconTerms = ${scriptJson(LEXICON_TERMS)};
const STORAGE_KEY = "canvas-helper:ela30-1-short-stories:complete";
const RESPONSE_STORAGE_KEY = "canvas-helper:ela30-1-short-stories:responses";
const WORKSHEET_STORAGE_KEY = "canvas-helper:ela30-1-short-stories:worksheet-responses";
const lessonsNav = document.querySelector(".lessons-nav");
function readComplete(){ try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { return new Set(); } }
function writeComplete(values){ localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(values))); }
function readResponses(){ try { return JSON.parse(localStorage.getItem(RESPONSE_STORAGE_KEY) || "{}"); } catch { return {}; } }
function writeResponses(values){ localStorage.setItem(RESPONSE_STORAGE_KEY, JSON.stringify(values)); }
function readWorksheetAnswers(){ try { return JSON.parse(localStorage.getItem(WORKSHEET_STORAGE_KEY) || "{}"); } catch { return {}; } }
function writeWorksheetAnswers(values){ localStorage.setItem(WORKSHEET_STORAGE_KEY, JSON.stringify(values)); }
function escapeClientHtml(value){ return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
let activeAnalysisTermId = lexiconTerms[0]?.id || "";
function getCoreStoryAnnotation(storyTitle, termId, index){
  const coreStory = analysisStories.find((story) => story.title === storyTitle);
  return coreStory?.examples?.[termId]?.[index] || null;
}
function availableStoriesForTerm(term){
  return Object.keys(term?.examples || {}).filter((story) => Array.isArray(term.examples[story]) && term.examples[story].length > 0);
}
function renderAnalysisTermList(){
  const list = document.querySelector("[data-analysis-term-list]");
  const search = (document.querySelector("[data-analysis-search]")?.value || "").trim().toLowerCase();
  if(!list) return;
  const filtered = lexiconTerms.filter((term) => !search || term.term.toLowerCase().includes(search) || term.category.toLowerCase().includes(search) || term.definition.toLowerCase().includes(search));
  const grouped = filtered.reduce((groups, term) => {
    if(!groups[term.category]) groups[term.category] = [];
    groups[term.category].push(term);
    return groups;
  }, {});
  list.innerHTML = Object.entries(grouped).map(([category, terms]) => '<section class="analysis-category"><h4>' + escapeClientHtml(category) + '</h4>' + terms.map((term) => '<button type="button" class="analysis-term-button' + (term.id === activeAnalysisTermId ? ' active' : '') + '" data-analysis-term-id="' + escapeClientHtml(term.id) + '">' + escapeClientHtml(term.term) + '</button>').join("") + '</section>').join("") || '<p class="analysis-empty">No matching terms.</p>';
}
function renderAnalysisExplorer(){
  const termSelect = document.querySelector("[data-analysis-term-select]");
  const storySelect = document.querySelector("[data-analysis-story-select]");
  const definition = document.querySelector("[data-analysis-definition]");
  const results = document.querySelector("[data-analysis-results]");
  const diploma = document.querySelector("[data-analysis-diploma]");
  if(!storySelect || !definition || !results || !diploma) return;
  const term = lexiconTerms.find((item) => item.id === activeAnalysisTermId) || lexiconTerms[0];
  if(!term) return;
  activeAnalysisTermId = term.id;
  if(termSelect) termSelect.value = term.id;
  renderAnalysisTermList();
  const stories = availableStoriesForTerm(term);
  const currentStory = stories.includes(storySelect.value) ? storySelect.value : stories[0];
  storySelect.innerHTML = stories.map((story) => '<option value="' + escapeClientHtml(story) + '">' + escapeClientHtml(story) + '</option>').join("");
  storySelect.value = currentStory || "";
  definition.innerHTML = '<div><p class="analysis-category-label">' + escapeClientHtml(term.category) + '</p><h4>' + escapeClientHtml(term.term) + '</h4><p>' + escapeClientHtml(term.definition) + '</p></div>';
  const examples = currentStory ? (term.examples[currentStory] || []) : [];
  if(examples.length === 0) {
    results.innerHTML = '<article class="analysis-empty">Analysis coming soon for this story and term.</article>';
  } else {
    results.innerHTML = examples.map((example, index) => {
      const annotation = getCoreStoryAnnotation(currentStory, term.id, index);
      const annotationHtml = annotation ? '<div class="analysis-course-annotation"><strong>Course annotation</strong><p>' + escapeClientHtml(annotation.evidence) + '</p><p>' + escapeClientHtml(annotation.context) + '</p></div>' : '';
      return '<article class="analysis-example-card"><h4>Example ' + (index + 1) + '</h4>' + annotationHtml + '<div class="analysis-example-grid"><div class="analysis-quote"><strong>Textual evidence</strong><blockquote>' + escapeClientHtml(example.quote) + '</blockquote></div><div class="analysis-example-row"><strong>Analytical breakdown</strong>' + escapeClientHtml(example.analysis) + '</div></div></article>';
    }).join("");
  }
  diploma.innerHTML = '<h4>Diploma Application: ' + escapeClientHtml(term.term) + '</h4><div class="analysis-diploma-grid"><div><strong>Marker focus</strong><p>' + escapeClientHtml(term.diplomaAdvice?.focus || '') + '</p></div><div><strong>Formula for success</strong><p>' + escapeClientHtml(term.diplomaAdvice?.formula || '') + '</p></div></div>';
}
function worksheetAnswerKey(storyId, questionId){ return storyId + "-" + questionId; }
function worksheetWordCount(value){ return String(value || "").trim().split(/\\s+/).filter(Boolean).length; }
function setLessonsOpen(open){ lessonsNav?.classList.toggle("is-open", open); document.querySelector("[data-lessons-toggle]")?.setAttribute("aria-expanded", String(open)); }
function updateComplete(){
  const complete = readComplete();
  const count = lessonIds.filter((id) => complete.has(id)).length;
  const percent = lessonIds.length ? Math.round((count / lessonIds.length) * 100) : 0;
  document.querySelectorAll("[data-progress-count]").forEach((node) => node.textContent = count + " / " + lessonIds.length + " lessons");
  document.querySelectorAll("[data-progress-count-inline]").forEach((node) => node.textContent = count + "/" + lessonIds.length);
  document.querySelectorAll("[data-progress-percent]").forEach((node) => node.textContent = percent + "%");
  document.querySelectorAll("[data-progress-fill]").forEach((node) => node.style.width = percent + "%");
  document.querySelectorAll("[data-complete-id]").forEach((button) => {
    const id = button.getAttribute("data-complete-id");
    const done = complete.has(id);
    button.textContent = done ? "Completed" : "Mark Complete";
    button.classList.toggle("opacity-70", done);
  });
  const elementChecks = Array.from(document.querySelectorAll("[data-element-complete-for]"));
  let elementCount = 0;
  elementChecks.forEach((node) => {
    const id = node.getAttribute("data-element-complete-for");
    const done = complete.has(id);
    if (done) elementCount += 1;
    node.textContent = done ? "✓" : "-";
    node.classList.toggle("is-complete", done);
    node.setAttribute("aria-label", done ? "Complete" : "Not complete");
  });
  document.querySelectorAll("[data-elements-complete-summary]").forEach((node) => {
    node.textContent = elementCount + "/" + elementChecks.length + " elements complete";
  });
}
function showPage(id){
  const requestedElement = elementIds.includes(id) ? id : "";
  const fallback = requestedElement ? elementHubId : (document.getElementById(id) ? id : "overview");
  document.querySelectorAll(".course-page").forEach((page) => page.hidden = page.id !== fallback);
  document.querySelectorAll("[data-page-target]").forEach((link) => {
    const active = link.getAttribute("data-page-target") === fallback || (fallback !== "lessons" && visibleLessonIds.includes(fallback) && link.getAttribute("data-page-target") === "lessons");
    link.classList.toggle("active", active);
  });
  if (requestedElement) setActiveElement(requestedElement);
  if (fallback === elementHubId && !requestedElement) setActiveElement(document.querySelector("[data-element-target].active")?.getAttribute("data-element-target") || elementIds[0]);
}
function route(){ const id = (location.hash || "#overview").slice(1); showPage(id); if (id === "lessons" || visibleLessonIds.includes(id) || elementIds.includes(id)) setLessonsOpen(true); }
function setActiveResourcePanel(id){ if(!id) return; document.querySelectorAll("[data-resource-panel]").forEach((panel) => panel.hidden = panel.getAttribute("data-resource-panel") !== id); }
function setActiveLibraryDocument(id){
  if(!id) return;
  document.querySelectorAll("[data-library-doc-panel]").forEach((panel) => panel.hidden = panel.getAttribute("data-library-doc-panel") !== id);
  document.querySelectorAll("[data-library-doc-target]").forEach((button) => {
    const active = button.getAttribute("data-library-doc-target") === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
function setActiveStoryDocument(id){
  if(!id) return;
  document.querySelectorAll("[data-story-doc-panel]").forEach((panel) => panel.hidden = panel.getAttribute("data-story-doc-panel") !== id);
  document.querySelectorAll("[data-story-doc-target]").forEach((button) => {
    const active = button.getAttribute("data-story-doc-target") === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
let activeWorksheetStoryId = "";
let activeWorksheetRoot = null;
let worksheetHintsVisible = false;
let worksheetSaveTimer = null;
function worksheetTotalQuestions(story){
  return story.sections.reduce((total, section) => total + section.questions.length, 0) + 2;
}
function worksheetAnsweredCount(story, answers){
  let total = 0;
  story.sections.forEach((section) => {
    section.questions.forEach((question) => {
      if ((answers[worksheetAnswerKey(story.id, question.id)] || "").trim()) total += 1;
    });
  });
  if ((answers[worksheetAnswerKey(story.id, "thesis")] || "").trim()) total += 1;
  if ((answers[worksheetAnswerKey(story.id, "prt")] || "").trim()) total += 1;
  return total;
}
function getWorksheetRoot(source){
  const sourceRoot = source?.closest?.("[data-worksheet-studio]");
  if (sourceRoot && sourceRoot.querySelector("[data-worksheet-panel]")) return sourceRoot;
  if (activeWorksheetRoot && activeWorksheetRoot.isConnected) return activeWorksheetRoot;
  return document.querySelector(".story-questions-studio[data-worksheet-studio]") || document.querySelector("[data-worksheet-studio]");
}
function renderWorksheetStory(storyId, source){
  const story = writingWorksheets.find((item) => item.id === storyId);
  if(!story) return;
  const root = getWorksheetRoot(source);
  if(!root) return;
  activeWorksheetRoot = root;
  activeWorksheetStoryId = story.id;
  const answers = readWorksheetAnswers();
  root.querySelector("[data-worksheet-picker]")?.setAttribute("hidden", "");
  root.querySelector("[data-worksheet-panel]")?.removeAttribute("hidden");
  const worksheetSelect = root.querySelector("[data-worksheet-select]");
  if (worksheetSelect) worksheetSelect.value = story.id;
  root.querySelector("[data-worksheet-title]").textContent = '"' + story.title + '"';
  root.querySelector("[data-worksheet-author]").textContent = "by " + story.author;
  root.querySelector("[data-worksheet-theme-prompt]").textContent = "Write a 1-2 sentence thesis about " + story.diplomaTheme + ".";
  root.querySelector("[data-worksheet-prt-prompt]").textContent = "What does this text suggest to you about " + story.diplomaTheme + "?";
  const questionsNode = root.querySelector("[data-worksheet-questions]");
  questionsNode.innerHTML = story.sections.map((section) => '<section class="worksheet-section"><h4>' + escapeClientHtml(section.title) + '</h4>' + section.questions.map((question, index) => {
    const key = worksheetAnswerKey(story.id, question.id);
    const value = answers[key] || "";
    return '<div class="worksheet-question"><div class="worksheet-question-prompt"><strong>' + (index + 1) + '.</strong><span>' + escapeClientHtml(question.text) + '</span></div>' + (worksheetHintsVisible && question.hint ? '<div class="worksheet-hint"><strong>Teacher Hint:</strong> ' + escapeClientHtml(question.hint) + '</div>' : '') + '<label class="worksheet-answer-field"><textarea rows="5" data-worksheet-answer="' + escapeClientHtml(question.id) + '" placeholder="Type your analytical response here...">' + escapeClientHtml(value) + '</textarea><span class="worksheet-word-count">' + worksheetWordCount(value) + ' words</span></label></div>';
  }).join("") + '</section>').join("");
  root.querySelectorAll("[data-worksheet-answer='thesis']").forEach((field) => field.value = answers[worksheetAnswerKey(story.id, "thesis")] || "");
  root.querySelectorAll("[data-worksheet-answer='prt']").forEach((field) => field.value = answers[worksheetAnswerKey(story.id, "prt")] || "");
  updateWorksheetProgress();
}
function updateWorksheetProgress(){
  const story = writingWorksheets.find((item) => item.id === activeWorksheetStoryId);
  const root = getWorksheetRoot();
  if(!story || !root) return;
  const answers = readWorksheetAnswers();
  const answered = worksheetAnsweredCount(story, answers);
  const total = worksheetTotalQuestions(story);
  root.querySelector("[data-worksheet-progress-label]").textContent = answered + " of " + total + " answered";
  root.querySelector("[data-worksheet-progress-fill]").style.width = total ? Math.round((answered / total) * 100) + "%" : "0%";
}
function showWorksheetPicker(source){
  const root = getWorksheetRoot(source);
  activeWorksheetStoryId = "";
  root?.querySelector("[data-worksheet-picker]")?.removeAttribute("hidden");
  root?.querySelector("[data-worksheet-panel]")?.setAttribute("hidden", "");
}
function openStoryReader(src, title){
  const overlay = document.querySelector("[data-story-reader-overlay]");
  const frame = document.querySelector("[data-story-reader-frame]");
  const titleNode = document.querySelector("[data-story-reader-title]");
  if(!overlay || !frame) return;
  frame.setAttribute("src", src);
  frame.setAttribute("title", title || "Short story full screen reader");
  if(titleNode) titleNode.textContent = title || "Short Story";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector("[data-story-reader-close]")?.focus();
}
function closeStoryReader(){
  const overlay = document.querySelector("[data-story-reader-overlay]");
  const frame = document.querySelector("[data-story-reader-frame]");
  if(!overlay) return;
  overlay.hidden = true;
  if(frame) frame.removeAttribute("src");
  document.body.style.overflow = "";
}
function setActiveFilm(id){ if(!id) return; document.querySelectorAll("[data-film-panel]").forEach((panel) => panel.hidden = panel.getAttribute("data-film-panel") !== id); }
function setActiveElement(id){
  if(!id) return;
  document.querySelectorAll("[data-element-panel]").forEach((panel) => panel.hidden = panel.getAttribute("data-element-panel") !== id);
  document.querySelectorAll("[data-element-target]").forEach((button) => button.classList.toggle("active", button.getAttribute("data-element-target") === id));
}
function toggleCourseMenu(){
  document.body.classList.toggle("sidebar-collapsed");
  document.querySelectorAll("#sidebar-toggle .material-symbols-outlined, #topbar-menu-toggle .material-symbols-outlined").forEach((icon) => {
    icon.textContent = document.body.classList.contains("sidebar-collapsed") ? "dock_to_right" : "dock_to_left";
  });
}
document.addEventListener("click", (event) => {
  const analysisTermButton = event.target.closest("[data-analysis-term-id]");
  if (analysisTermButton) { activeAnalysisTermId = analysisTermButton.getAttribute("data-analysis-term-id"); renderAnalysisExplorer(); return; }
  const lessonToggle = event.target.closest("[data-lessons-toggle]");
  if (lessonToggle) { event.preventDefault(); const nextOpen = !lessonsNav?.classList.contains("is-open"); if(nextOpen){ history.pushState(null, "", "#lessons"); showPage("lessons"); } setLessonsOpen(nextOpen); return; }
  const elementTarget = event.target.closest("[data-element-target]");
  if (elementTarget) { event.preventDefault(); setActiveElement(elementTarget.getAttribute("data-element-target")); return; }
  const target = event.target.closest("[data-page-target]");
  if (target) { const pageTarget = target.getAttribute("data-page-target"); if (pageTarget) { showPage(pageTarget); if (pageTarget === "lessons" || visibleLessonIds.includes(pageTarget)) setLessonsOpen(true); } }
  const completeButton = event.target.closest("[data-complete-id]");
  if (completeButton) { const id = completeButton.getAttribute("data-complete-id"); const complete = readComplete(); complete.add(id); writeComplete(complete); updateComplete(); }
  const libraryTarget = event.target.closest("[data-library-doc-target]");
  if (libraryTarget) setActiveLibraryDocument(libraryTarget.getAttribute("data-library-doc-target"));
  const storyTarget = event.target.closest("[data-story-doc-target]");
  if (storyTarget) setActiveStoryDocument(storyTarget.getAttribute("data-story-doc-target"));
  const worksheetOpen = event.target.closest("[data-worksheet-open]");
  if (worksheetOpen) renderWorksheetStory(worksheetOpen.getAttribute("data-worksheet-open"), worksheetOpen);
  const worksheetBack = event.target.closest("[data-worksheet-back]");
  if (worksheetBack) showWorksheetPicker(worksheetBack);
  const worksheetHints = event.target.closest("[data-worksheet-toggle-hints]");
  if (worksheetHints && activeWorksheetStoryId) { worksheetHintsVisible = !worksheetHintsVisible; worksheetHints.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ' + (worksheetHintsVisible ? "Hide Hints" : "Show Hints"); renderWorksheetStory(activeWorksheetStoryId, worksheetHints); }
  const worksheetPrint = event.target.closest("[data-worksheet-print]");
  if (worksheetPrint) window.print();
  const storyFullscreen = event.target.closest("[data-story-fullscreen-src]");
  if (storyFullscreen) { event.preventDefault(); openStoryReader(storyFullscreen.getAttribute("data-story-fullscreen-src"), storyFullscreen.getAttribute("data-story-fullscreen-title")); }
  const storyReaderClose = event.target.closest("[data-story-reader-close]");
  if (storyReaderClose) { event.preventDefault(); closeStoryReader(); }
});
document.addEventListener("keydown", (event) => { if(event.key === "Escape") closeStoryReader(); });
document.addEventListener("change", (event) => {
  const analysisTermSelect = event.target.closest("[data-analysis-term-select]");
  if (analysisTermSelect) { activeAnalysisTermId = analysisTermSelect.value; renderAnalysisExplorer(); }
  const analysisStorySelect = event.target.closest("[data-analysis-story-select]");
  if (analysisStorySelect) renderAnalysisExplorer();
  const resourceSelect = event.target.closest("[data-resource-select]");
  if (resourceSelect) setActiveResourcePanel(resourceSelect.value);
  const filmSelect = event.target.closest("[data-film-select]");
  if (filmSelect) setActiveFilm(filmSelect.value);
  const worksheetSelect = event.target.closest("[data-worksheet-select]");
  if (worksheetSelect) renderWorksheetStory(worksheetSelect.value, worksheetSelect);
});
document.addEventListener("input", (event) => {
  const analysisSearch = event.target.closest("[data-analysis-search]");
  if (analysisSearch) { renderAnalysisTermList(); return; }
  const worksheetField = event.target.closest("[data-worksheet-answer]");
  if (worksheetField && activeWorksheetStoryId) {
    const answers = readWorksheetAnswers();
    answers[worksheetAnswerKey(activeWorksheetStoryId, worksheetField.getAttribute("data-worksheet-answer"))] = worksheetField.value;
    writeWorksheetAnswers(answers);
    const countNode = worksheetField.closest(".worksheet-answer-field")?.querySelector(".worksheet-word-count");
    if(countNode) countNode.textContent = worksheetWordCount(worksheetField.value) + " words";
    const root = getWorksheetRoot(worksheetField);
    root.querySelector("[data-worksheet-save-status]").textContent = "Saving...";
    clearTimeout(worksheetSaveTimer);
    worksheetSaveTimer = setTimeout(() => root.querySelector("[data-worksheet-save-status]").textContent = "Saved locally", 700);
    updateWorksheetProgress();
    return;
  }
  const field = event.target.closest("[data-response-id]");
  if (!field) return;
  const responses = readResponses();
  responses[field.getAttribute("data-response-id")] = field.value;
  writeResponses(responses);
});
function restoreResponses(){ const responses = readResponses(); document.querySelectorAll("[data-response-id]").forEach((field) => { field.value = responses[field.getAttribute("data-response-id")] || ""; }); }
const defaultWorksheetRoot = document.querySelector("[data-default-worksheet-story]");
const defaultWorksheetStory = defaultWorksheetRoot?.getAttribute("data-default-worksheet-story");
if (defaultWorksheetStory) renderWorksheetStory(defaultWorksheetStory, defaultWorksheetRoot);
document.getElementById("sidebar-toggle")?.addEventListener("click", toggleCourseMenu);
document.getElementById("topbar-menu-toggle")?.addEventListener("click", toggleCourseMenu);
window.addEventListener("hashchange", route);
restoreResponses();
renderAnalysisExplorer();
document.querySelectorAll("[data-resource-select]").forEach((select) => setActiveResourcePanel(select.value));
document.querySelectorAll("[data-story-doc-target].active").forEach((button) => setActiveStoryDocument(button.getAttribute("data-story-doc-target")));
route();
updateComplete();
</script>
</body>
</html>`;
}

async function buildShortStoriesProject(options: { zipPath: string; slug: string; force: boolean }) {
  const zipBuffer = await readFile(options.zipPath);
  const zip = await JSZip.loadAsync(zipBuffer);
  const zipEntries = new Set(
    Object.keys(zip.files)
      .filter((entry) => !zip.files[entry]?.dir)
      .map(normalizeZipPath)
  );

  const manifest = await readZipText(zip, "imsmanifest.xml");
  const $ = cheerio.load(manifest, { xmlMode: true });
  const resources = getResourceMap($);
  const sourceUnit = findShortStoriesUnit($);
  if (!sourceUnit) {
    throw new Error("Could not find Short Stories item in imsmanifest.xml.");
  }

  const projectDir = path.join(repoRoot, "projects", options.slug);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const rawDir = path.join(projectDir, "raw");
  if (options.force) {
    await rm(projectDir, { recursive: true, force: true });
  }
  await mkdir(path.join(workspaceDir, "assets", "source"), { recursive: true });
  await mkdir(path.join(workspaceDir, "assets", "brand"), { recursive: true });
  await mkdir(path.join(workspaceDir, "assets", "story-bank"), { recursive: true });
  await mkdir(path.join(workspaceDir, "resources"), { recursive: true });
  await mkdir(metaDir, { recursive: true });
  await mkdir(rawDir, { recursive: true });
  await copyFile(options.zipPath, path.join(rawDir, path.basename(options.zipPath)));
  await copyFile(NEXT_STEP_LOGO_SOURCE_PATH, path.join(workspaceDir, "assets", "brand", "nxt-ce-logo-white-with-ce.png"));

  const sourceItems = sourceLessonItems($, sourceUnit, resources);
  const usedIds = new Map<string, number>();
  const lessons: Lesson[] = [];
  for (const [index, element] of sourceItems.entries()) {
    const identifier = $(element).attr("identifierref") ?? "";
    const sourceHref = resources.get(identifier);
    if (!sourceHref) {
      continue;
    }
    const title = directChildText($, element, "title") || `Lesson ${index + 1}`;
    const sourceKind = sourceKindForPath(sourceHref);
    const baseId = toSafeId(title, `lesson-${index + 1}`);
    const idCount = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, idCount + 1);
    const id = idCount === 0 ? baseId : `${baseId}-${idCount + 1}`;
    const cleaned =
      sourceKind === "html"
        ? await cleanHtmlLesson({ zip, zipEntries, sourceHref, title, workspaceDir })
        : await buildDocumentLesson({ zip, sourceHref, title, workspaceDir, sourceKind });
    lessons.push({
      id,
      sequence: lessons.length + 1,
      title,
      sourceHref,
      sourceKind,
      contentHtml: enhanceShortStoriesLessonContent(title, cleaned.contentHtml),
      text: cleaned.text,
      links: cleaned.links,
      videos: cleaned.videos
    });
  }

  const localResourceCopies = new Set<string>();
  for (const lesson of lessons) {
    for (const link of lesson.links) {
      if (!link.zipPath || localResourceCopies.has(link.zipPath)) {
        continue;
      }
      localResourceCopies.add(link.zipPath);
      const targetPath = path.join(workspaceDir, link.workspaceHref);
      await mkdir(path.dirname(targetPath), { recursive: true });
      if (sourceKindForPath(link.zipPath) === "html") {
        await writeFile(targetPath, decodeBrightspaceHtml(await readZipBuffer(zip, link.zipPath)), "utf8");
      } else {
        await writeZipEntry(zip, link.zipPath, targetPath);
      }
    }
  }

  const headAssets = await extractHeadAssets();
  const allLinks = lessons.flatMap((lesson) => lesson.links);
  const resourceGroups = buildResourceGroups(lessons);
  const localResources = uniqueBy(
    allLinks.filter((link) => link.kind === "local"),
    (link) => link.workspaceHref
  );
  const storyBankItems = await copyStoryBankItems(workspaceDir);
  const writingWorksheets = await loadWritingWorksheets();
  const videos = uniqueBy(lessons.flatMap((lesson) => lesson.videos), (video) => video.embedSrc);
  await writeFile(path.join(workspaceDir, "index.html"), buildHtml({ headAssets, lessons, resourceGroups, localResources, storyBankItems, writingWorksheets, videos }), "utf8");

  const now = new Date().toISOString();
  const manifestJson = {
    id: options.slug,
    slug: options.slug,
    sourcePath: options.zipPath,
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["workspace"],
    workspaceEntrypoint: path.join(workspaceDir, "index.html"),
    rawEntrypoint: path.join(rawDir, path.basename(options.zipPath)),
    createdAt: now,
    updatedAt: now,
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: path.join(workspaceDir, "index.html"),
    canonicalSources: [path.join(workspaceDir, "index.html")],
    generatedOutputs: [],
    regenerateCommand: `npx tsx scripts/build-ela-short-stories.ts --zip "${options.zipPath}" --slug ${options.slug} --force`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: options.zipPath,
      importedAt: now,
      notes: "D2L/Brightspace Short Stories unit converted into the Streetcar-style ELA 30-1 course shell."
    },
    exportTargets: [
      {
        target: "scorm",
        enabled: true,
        notes: "Authoring frame intended for Brightspace SCORM upload after review."
      },
      {
        target: "html",
        enabled: true,
        notes: "Standalone HTML preview for shaping the replicated Short Stories unit."
      }
    ],
    authoringStatus: "active",
    referenceOnly: [path.join(rawDir, path.basename(options.zipPath))],
    sourceOfTruthNotes: "Edit workspace/index.html as the canonical Short Stories course shell. Regenerate SCORM after workspace edits."
  };
  await writeFile(path.join(metaDir, "project.json"), `${JSON.stringify(manifestJson, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(metaDir, "conversion-notes.md"),
    `# Short Stories Conversion Notes\n\n- Source ZIP: ${options.zipPath}\n- Lessons imported: ${lessons.length}\n- Local resources found: ${localResources.length}\n- Story bank readings: ${storyBankItems.length}\n- Writing worksheets: ${writingWorksheets.length}\n- Videos found: ${videos.length}\n- Canonical source: projects/${options.slug}/workspace/index.html\n\nThis is the first pass using the Streetcar-style replication workflow. Film Room and Writing Studio should be curated with unit-specific supplemental materials as they become available.\n`,
    "utf8"
  );

  return {
    slug: options.slug,
    lessonCount: lessons.length,
    localResourceCount: localResources.length,
    storyBankCount: storyBankItems.length,
    writingWorksheetCount: writingWorksheets.length,
    videoCount: videos.length,
    workspaceEntrypoint: path.join(workspaceDir, "index.html")
  };
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const zipPath = getStringFlag(parsedArgs, "zip") ?? parsedArgs.positionals[0];
  if (!zipPath) {
    throw new Error('Usage: npx tsx scripts/build-ela-short-stories.ts --zip "<path-to-d2l-export.zip>" [--slug ela30-1-short-stories] [--force]');
  }
  const result = await buildShortStoriesProject({
    zipPath,
    slug: getStringFlag(parsedArgs, "slug") ?? DEFAULT_SLUG,
    force: hasFlag(parsedArgs, "force")
  });
  console.log(`Built ${result.slug}`);
  console.log(`Lessons: ${result.lessonCount}`);
  console.log(`Local resources: ${result.localResourceCount}`);
  console.log(`Story bank readings: ${result.storyBankCount}`);
  console.log(`Writing worksheets: ${result.writingWorksheetCount}`);
  console.log(`Videos: ${result.videoCount}`);
  console.log(`Workspace: ${result.workspaceEntrypoint}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
