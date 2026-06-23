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
  origin: "iframe" | "link" | "local";
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
  kind: "pdf" | "external";
  description: string;
  downloadable: boolean;
};

type ParallelReadingBeat = {
  speaker: string;
  original: string;
  modern: string;
  note: string;
};

type ParallelReadingTranslationSection = {
  heading: string;
  paragraphs: string[];
};

type ParallelReadingPairRow = {
  label?: string;
  originalLines: string[];
  modernLines: string[];
};

type ParallelReadingScene = {
  id: string;
  label: string;
  title: string;
  mitHref: string;
  summary: string;
  focus: string;
  parallelRows?: ParallelReadingPairRow[];
  translationSections: ParallelReadingTranslationSection[];
  beats: ParallelReadingBeat[];
};

type TranscriptBlock =
  | {
      kind: "speech";
      speaker: string;
      lines: string[];
    }
  | {
      kind: "stage";
      lines: string[];
    };

type HydratedParallelReadingScene = ParallelReadingScene & {
  alignedSceneHtml: string;
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

const DEFAULT_SLUG = "ela30-1-shakespeare-othello";
const COURSE_TITLE = "Shakespeare: Othello";
const COURSE_CODE = "ELA 30-1";
const STORY_BANK_SOURCE_DIR = "/Users/deanguedo/Downloads/UNIT 3 Shakespeare";
const LOCAL_FILM_SOURCES = [
  {
    id: "othello-dramatic-reading-full-audiobook",
    title: "Othello Dramatic Reading - Full Audiobook",
    sourcePath: "/Users/deanguedo/Downloads/OTHELLO by William Shakespeare - Dramatic Reading - FULL AudioBook.mp4",
    fileName: "othello-dramatic-reading-full-audiobook.mp4",
  },
  {
    id: "othello-movie",
    title: "Othello Movie",
    sourcePath: "/Users/deanguedo/Downloads/Othello Movie playback-safe.mp4",
    fileName: "othello-movie.mp4",
  },
];

const STORY_BANK_SOURCES = [
  { title: "MIT Shakespeare: Othello", href: "https://shakespeare.mit.edu/othello/index.html", kind: "external", description: "Original text of the play from MIT Shakespeare." },
  { title: "Othello Act Questions", fileName: "OTHELLO Act Questions.pdf", kind: "pdf", description: "Guided act-by-act question set for reading and review." },
  { title: "Othello Notes", fileName: "OTHELLO Notes.pdf", kind: "pdf", description: "Class notes and core reference material for the unit." },
  { title: "Othello Resources", fileName: "OTHELLO Resources.pdf", kind: "pdf", description: "Support resources, context notes, and study material." }
] as const;
const PARALLEL_READING_SCENES: ParallelReadingScene[] = [
  {
    id: "act-1-scene-1",
    label: "Act 1, Scene 1",
    title: "Iago opens the conflict in Venice",
    mitHref: "https://shakespeare.mit.edu/othello/othello.1.1.html",
    summary: "Iago explains why he resents Othello, pulls Roderigo into the scheme, and weaponizes racist fear to spread the conflict.",
    focus: "Watch how Iago sounds injured and reasonable on the surface while quietly turning jealousy and prejudice into strategy.",
    parallelRows: [
      {
        label: "Roderigo",
        originalLines: [
          "Tush! never tell me; I take it much unkindly",
          "That thou, Iago, who hast had my purse",
          "As if the strings were thine, shouldst know of this."
        ],
        modernLines: [
          "Roderigo is furious that Iago kept Desdemona's marriage secret.",
          "He reminds Iago that he has spent money trusting him to help win her."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "Three great ones of the city,",
          "In personal suit to make me his lieutenant,",
          "Off-capp'd to him... I know my price, I am worth no worse a place:",
          "'I have already chose my officer.'"
        ],
        modernLines: [
          "Iago says influential Venetians urged Othello to promote him.",
          "Instead, Othello ignored them and chose someone else, which Iago takes as a personal insult."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "Forsooth, a great arithmetician,",
          "One Michael Cassio, a Florentine,",
          "That never set a squadron in the field...",
          "mere prattle, without practise,",
          "Is all his soldiership."
        ],
        modernLines: [
          "He mocks Cassio as a polished theory man who knows military ideas better than real combat.",
          "This is where professional jealousy starts hardening into revenge."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "Why, there's no remedy; 'tis the curse of service,",
          "Preferment goes by letter and affection,",
          "And not by old gradation...",
          "Whether I in any just term am affined",
          "To love the Moor."
        ],
        modernLines: [
          "Iago claims promotions are decided by favoritism, not merit.",
          "He uses that complaint to make his hatred of Othello sound justified."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "I follow him to serve my turn upon him:",
          "Were I the Moor, I would not be Iago:",
          "In following him, I follow but myself;",
          "I am not what I am."
        ],
        modernLines: [
          "Iago admits that his service is a disguise.",
          "He plans to look loyal on the outside while secretly working for himself."
        ]
      },
      {
        label: "Iago / Roderigo",
        originalLines: [
          "Call up her father,",
          "Rouse him: make after him, poison his delight...",
          "Here is her father's house; I'll call aloud."
        ],
        modernLines: [
          "Iago decides to attack the marriage through Brabantio instead of confronting Othello directly.",
          "Roderigo agrees to help wake the house and turn the marriage into a public scandal."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "Awake! what, ho, Brabantio! thieves! thieves! thieves!",
          "Look to your house, your daughter and your bags!",
          "Even now, now, very now, an old black ram",
          "Is topping your white ewe."
        ],
        modernLines: [
          "Iago uses alarm, racist imagery, and crude sexual language to shock Brabantio into anger.",
          "He wants Brabantio to react emotionally before he has time to think."
        ]
      },
      {
        label: "Brabantio / Roderigo",
        originalLines: [
          "The worser welcome:",
          "My daughter is not for thee...",
          "Most grave Brabantio,",
          "In simple and pure soul I come to you."
        ],
        modernLines: [
          "Brabantio first assumes this is just Roderigo causing trouble again because he still wants Desdemona.",
          "Roderigo has to slow the moment down and insist that the warning is real."
        ]
      },
      {
        label: "Roderigo",
        originalLines: [
          "Your daughter, if you have not given her leave,",
          "I say again, hath made a gross revolt;",
          "Tying her duty, beauty, wit and fortunes",
          "In an extravagant and wheeling stranger.",
          "Straight satisfy yourself:"
        ],
        modernLines: [
          "Roderigo tells Brabantio that Desdemona has gone with Othello and urges him to check the house for himself.",
          "The language is still biased, but it finally pushes Brabantio to test the truth."
        ]
      },
      {
        label: "Iago / Brabantio",
        originalLines: [
          "Farewell; for I must leave you:",
          "Though I do hate him as I do hell-pains.",
          "It is too true an evil: gone she is;",
          "Get weapons, ho!",
          "On, good Roderigo: I'll deserve your pains."
        ],
        modernLines: [
          "Iago slips away so he can keep his public image clean and still seem loyal to Othello.",
          "Once Brabantio realizes Desdemona is gone, disbelief turns into panic and he arms his household to hunt Othello down."
        ]
      }
    ],
    translationSections: [
      {
        heading: "Roderigo feels cheated",
        paragraphs: [
          "The scene opens at night in Venice with Roderigo furious at Iago. He has been paying Iago to help him win Desdemona, but Iago never warned him that she had secretly married Othello. Roderigo feels used and humiliated.",
          "Iago answers by pretending that he is just as angry as Roderigo is. He claims he hates serving Othello and says that if he had known the marriage would happen so quickly, he would have acted sooner."
        ]
      },
      {
        heading: "Iago explains his resentment",
        paragraphs: [
          "Iago says he expected Othello to promote him, but Othello instead chose Cassio as lieutenant. Iago dismisses Cassio as an inexperienced theorist who knows book-learning better than real battle.",
          "In Iago's eyes, the decision is a personal insult. He believes his years of service should have mattered more than Cassio's polished reputation."
        ]
      },
      {
        heading: "Iago reveals his double life",
        paragraphs: [
          "Iago admits that he only appears loyal because open rebellion would not help him. He plans to keep his job, look obedient, and strike from inside Othello's circle.",
          "He makes it clear that his public face is a disguise. When he says he is not what he seems, Shakespeare lets the audience know immediately that Iago will live by deception."
        ]
      },
      {
        heading: "They wake Brabantio with panic and racism",
        paragraphs: [
          "Iago and Roderigo go to Brabantio's house and shout until he wakes. Instead of calmly reporting the marriage, Iago uses crude sexual images and racist language to make Othello sound monstrous and threatening.",
          "At first Brabantio assumes this is another one of Roderigo's foolish attempts to pursue Desdemona. He insults him and refuses to believe the news."
        ]
      },
      {
        heading: "Brabantio discovers Desdemona is gone",
        paragraphs: [
          "Roderigo finally forces Brabantio to check the house. Once Brabantio realizes Desdemona is truly missing, fear and anger replace disbelief. He concludes that Othello must have tricked, enchanted, or stolen her away.",
          "He calls for weapons and servants so he can go after Othello at once. The scene ends with Venice in motion and with Iago slipping away before he can be seen openly stirring the trouble."
        ]
      }
    ],
    beats: [
      {
        speaker: "Iago",
        original: "I know my price, I am worth no worse a place.",
        modern: "Iago says he deserved the promotion. He treats Cassio's appointment as a direct insult to his value and experience.",
        note: "His revenge starts with wounded pride, not sudden rage, which makes his plotting feel cold and deliberate."
      },
      {
        speaker: "Iago",
        original: "I am not what I am.",
        modern: "Iago openly admits that his public image is fake. He plans to look loyal while secretly working against Othello.",
        note: "This line becomes the play's clearest warning that appearances in Othello cannot be trusted."
      },
      {
        speaker: "Iago",
        original: "Even now, now, very now, an old black ram / Is tupping your white ewe.",
        modern: "To provoke Brabantio, Iago uses racist and animal imagery to make Othello seem threatening and shameful.",
        note: "The insult shows how racism becomes one of Iago's most effective tools for controlling other people."
      }
    ]
  },
  {
    id: "act-1-scene-2",
    label: "Act 1, Scene 2",
    title: "Othello faces accusation without panic",
    mitHref: "https://shakespeare.mit.edu/othello/othello.1.2.html",
    summary: "Brabantio confronts Othello before the senate hearing, but Othello's calm self-command changes the scene from panic toward judgment.",
    focus: "Watch how Othello refuses to match Brabantio's alarm. His steadiness makes public honour and self-control the real center of the scene.",
    translationSections: [
      {
        heading: "The private plot becomes a public accusation",
        paragraphs: [
          "After the uproar at Brabantio's house, Iago warns Othello that Brabantio is coming in anger. Even here, Iago tries to protect himself first, sounding useful while keeping his real motives hidden.",
          "What began as secret manipulation now turns into an open confrontation about marriage, power, race, and public image."
        ]
      },
      {
        heading: "Othello stays controlled under pressure",
        paragraphs: [
          "When armed men approach, Othello does not panic or answer anger with more anger. He lowers the temperature of the scene by insisting that swords are unnecessary and that his service will defend him better than noise.",
          "This first sustained view of Othello matters because it shows authority built on restraint rather than bluster."
        ]
      },
      {
        heading: "Brabantio frames the marriage as unnatural",
        paragraphs: [
          "Brabantio cannot accept that Desdemona chose Othello freely, so he speaks as if the marriage must be the result of theft, trickery, or unnatural force.",
          "The accusation is full of prejudice as well as grief. Brabantio's wounded pride becomes a public charge against Othello's character."
        ]
      },
      {
        heading: "State duty interrupts family conflict",
        paragraphs: [
          "Before the matter can be settled by force, messengers arrive from the Duke. Othello is needed immediately for state business because Cyprus is under threat.",
          "That interruption is important because it pushes the conflict into the political world at once. Othello has to move from personal accusation into public service without any breathing room."
        ]
      }
    ],
    beats: [
      {
        speaker: "Othello",
        original: "Keep up your bright swords, for the dew will rust them.",
        modern: "Othello tells the men to lower their weapons because the situation does not need reckless violence.",
        note: "The line establishes his composure immediately and contrasts him with Brabantio's outrage."
      },
      {
        speaker: "Othello",
        original: "My services which I have done the signiory / Shall out-tongue his complaints.",
        modern: "Othello trusts that his public record and honour will answer Brabantio better than fear or defensiveness could.",
        note: "He leans on earned reputation rather than panic, which strengthens his authority."
      },
      {
        speaker: "Othello",
        original: "Were it my cue to fight, I should have known it / Without a prompter.",
        modern: "Othello makes clear that if battle were truly needed, he would not need anyone else to tell him how to act.",
        note: "The line shows confidence without swagger and reinforces his disciplined self-command."
      }
    ]
  },
  {
    id: "act-1-scene-3",
    label: "Act 1, Scene 3",
    title: "Othello and Desdemona defend their marriage",
    mitHref: "https://shakespeare.mit.edu/othello/othello.1.3.html",
    summary: "Othello explains how the marriage began, and Desdemona publicly chooses her loyalty to him in front of the Venetian court.",
    focus: "This scene matters because the marriage is built on trust, admiration, and mutual choice before Iago starts poisoning it.",
    parallelRows: [
      {
        label: "Duke / Senators",
        originalLines: [
          "There is no composition in these news",
          "'Tis oft with difference--yet do they all confirm",
          "A Turkish fleet, and bearing up to Cyprus.",
          "Valiant Othello, we must straight employ you"
        ],
        modernLines: [
          "The scene opens in the middle of a military emergency, not a private family hearing.",
          "The Venetian court needs Othello immediately because Cyprus may be attacked, so public duty and private accusation collide at once."
        ]
      },
      {
        label: "Brabantio",
        originalLines: [
          "My daughter! O, my daughter!",
          "She is abused, stol'n from me, and corrupted",
          "By spells and medicines bought of mountebanks;",
          "Sans witchcraft could not."
        ],
        modernLines: [
          "Brabantio insists Desdemona could only have married Othello through magic or trickery.",
          "He cannot imagine that she chose the marriage for herself, so he turns prejudice into a legal accusation."
        ]
      },
      {
        label: "Othello",
        originalLines: [
          "That I have ta'en away this old man's daughter,",
          "It is most true; true, I have married her:",
          "The very head and front of my offending",
          "Hath this extent, no more.",
          "Rude am I in my speech,"
        ],
        modernLines: [
          "Othello does not deny the marriage or hide behind excuses.",
          "He calmly admits what happened and strips the issue down to one fact: he married Desdemona, and he is willing to be judged openly."
        ]
      },
      {
        label: "Othello",
        originalLines: [
          "Send for the lady to the Sagittary,",
          "And let her speak of me before her father:",
          "If you do find me foul in her report,",
          "The trust, the office I do hold of you,",
          "Not only take away, but let your sentence",
          "Even fall upon my life."
        ],
        modernLines: [
          "He asks the court to hear Desdemona herself rather than trust rumor or anger.",
          "That request matters because Othello is staking both his public rank and his life on the truth of her testimony."
        ]
      },
      {
        label: "Othello",
        originalLines: [
          "Of moving accidents by flood and field,",
          "Of hair-breadth scapes i' the imminent deadly breach,",
          "She loved me for the dangers I had pass'd,",
          "And I loved her that she did pity them."
        ],
        modernLines: [
          "Othello explains that their relationship grew through storytelling, admiration, and emotional honesty.",
          "Desdemona was moved by the life he had survived, and he fell in love because she listened with real compassion."
        ]
      },
      {
        label: "Desdemona",
        originalLines: [
          "That I did love the Moor to live with him,",
          "My downright violence and storm of fortunes",
          "May trumpet to the world:",
          "I saw Othello's visage in his mind,",
          "And to his honour and his valiant parts",
          "Did I my soul and fortunes consecrate."
        ],
        modernLines: [
          "Desdemona confirms the marriage without hesitation and claims the choice publicly as her own.",
          "She says she loved Othello for his inner worth and his character, not for the surface judgments other people make about him."
        ]
      },
      {
        label: "Desdemona",
        originalLines: [
          "So that, dear lords, if I be left behind,",
          "A moth of peace, and he go to the war,",
          "The rites for which I love him are bereft me,",
          "Let me go with him."
        ],
        modernLines: [
          "She refuses to be treated like a passive prize left behind while Othello sails to Cyprus.",
          "Desdemona wants the marriage to be lived out in full, not reduced to a ceremony while her husband departs alone."
        ]
      },
      {
        label: "Othello / Duke",
        originalLines: [
          "Let her have your voices.",
          "I therefore beg it not,",
          "To please the palate of my appetite,",
          "But to be free and bounteous to her mind:"
        ],
        modernLines: [
          "Othello supports Desdemona's request and presents the marriage as partnership rather than possession.",
          "The Duke accepts that view, so the state formally recognizes both the marriage and Desdemona's choice."
        ]
      },
      {
        label: "Brabantio",
        originalLines: [
          "Look to her, Moor, if thou hast eyes to see:",
          "She has deceived her father, and may thee."
        ],
        modernLines: [
          "Brabantio leaves Othello with a poisonous warning instead of a blessing.",
          "That line matters because it gives Iago a ready-made fear to exploit later: the idea that Desdemona's loyalty cannot be trusted."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "Thus do I ever make my fool my purse:",
          "But I, for mere suspicion in that kind,",
          "Will do as if for surety.",
          "The Moor is of a free and open nature,",
          "That thinks men honest that but seem to be so,"
        ],
        modernLines: [
          "After the court scene ends, Iago immediately turns back to manipulation.",
          "He uses Roderigo for money, begins imagining ways to poison Othello's trust, and decides that Othello's openness will make him easier to deceive."
        ]
      }
    ],
    translationSections: [
      {
        heading: "The state is already under pressure",
        paragraphs: [
          "The Venetian senate is busy with urgent military news about the Turkish threat against Cyprus. The political crisis matters because it forces private conflict and public duty into the same room.",
          "In the middle of this tension, Brabantio arrives with Othello and accuses him of stealing Desdemona through witchcraft and tricks."
        ]
      },
      {
        heading: "Othello answers calmly",
        paragraphs: [
          "Othello does not panic or lash out. He speaks with self-control and asks to be judged after the full truth is heard. He insists that if he is guilty, he deserves punishment, but if he tells the story honestly, the senate will see what really happened.",
          "His composure sharply contrasts with Brabantio's outrage. From the beginning of the scene, Othello's strength is moral as much as military."
        ]
      },
      {
        heading: "Othello tells how the love began",
        paragraphs: [
          "Othello explains that he often visited Brabantio and told stories about his life: battles, slavery, travel, danger, suffering, and survival. Desdemona listened closely and was deeply moved by what he had endured.",
          "He says she loved him for the hardships he had passed through, and he loved her because she responded with compassion and wonder. Their marriage began through conversation, imagination, and mutual respect, not coercion."
        ]
      },
      {
        heading: "Desdemona chooses publicly",
        paragraphs: [
          "When Desdemona is called in, she confirms Othello's account. She respectfully honors her father, but she says that her deepest duty now belongs to her husband, just as her mother once transferred her loyalty through marriage.",
          "She also asks to go with Othello to Cyprus instead of being left behind. She does not want to be treated like a passive prize while the man she chose goes to war."
        ]
      },
      {
        heading: "The senate approves the marriage",
        paragraphs: [
          "The Duke accepts the marriage as lawful and turns back to the war. Othello is ordered to sail for Cyprus immediately, and arrangements are made for Desdemona to follow.",
          "Before the scene breaks, Brabantio warns Othello that if Desdemona deceived her father, she may one day deceive her husband. The warning plants an idea that Iago will later exploit."
        ]
      },
      {
        heading: "Iago turns to the next stage of the plot",
        paragraphs: [
          "After the court leaves, Roderigo despairs because Desdemona is married. Iago refuses to let him give up. He tells Roderigo to keep spending money and keep following them to Cyprus because desire and opportunity can still be manipulated.",
          "When Roderigo goes, Iago delivers a soliloquy. He suspects Othello may have slept with Emilia, resents Cassio, and decides to use Cassio and Desdemona's kindness to poison Othello's trust. The tragedy's main engine is now fully running."
        ]
      }
    ],
    beats: [
      {
        speaker: "Othello",
        original: "Rude am I in my speech, / And little bless'd with the soft phrase of peace.",
        modern: "Othello says he is not a polished court speaker. He asks to be judged by the truth of his story, not by fancy rhetoric.",
        note: "The claim also highlights his honesty: he wins people by directness rather than manipulation."
      },
      {
        speaker: "Othello",
        original: "She loved me for the dangers I had pass'd, / And I loved her that she did pity them.",
        modern: "Othello explains that Desdemona fell in love through listening to his life story, and he loved her because she understood what he had endured.",
        note: "Their relationship begins in empathy and storytelling, which makes the later collapse especially tragic."
      },
      {
        speaker: "Desdemona",
        original: "I saw Othello's visage in his mind.",
        modern: "Desdemona says she loved Othello for his character and inner worth, not for the way other people judged his appearance.",
        note: "Her line directly rejects the prejudice surrounding the marriage."
      }
    ]
  },
  {
    id: "act-2-scene-1",
    label: "Act 2, Scene 1",
    title: "Cyprus brings reunion and opportunity",
    mitHref: "https://shakespeare.mit.edu/othello/othello.2.1.html",
    summary: "The storm destroys the Turkish threat, but Iago immediately turns the island's relief into the perfect setting for private manipulation.",
    focus: "The public danger disappears here, which is exactly why Iago's private danger becomes the real plot.",
    translationSections: [
      {
        heading: "The war threat breaks before the lovers arrive",
        paragraphs: [
          "Cyprus learns that the violent storm has shattered the Turkish fleet. Public danger seems to have vanished before Othello even lands, which creates a sudden mood of relief.",
          "That relief matters because the play no longer needs an external enemy. From this point on, the real threat is the one Iago builds inside the group."
        ]
      },
      {
        heading: "Desdemona arrives safely and Othello follows",
        paragraphs: [
          "Cassio greets Desdemona warmly when she reaches Cyprus, and Othello soon arrives to an emotional reunion. The marriage looks joyful, legitimate, and publicly blessed.",
          "For a brief moment, the play offers a vision of harmony: the military crisis is over, the lovers are together, and the future still appears secure."
        ]
      },
      {
        heading: "Iago studies every ordinary interaction",
        paragraphs: [
          "Iago watches the way Cassio speaks to Desdemona and how easily people trust one another. He does not need scandalous behaviour; he only needs gestures that can later be misread.",
          "His genius as a villain is interpretive. He converts normal friendliness into material for suspicion."
        ]
      },
      {
        heading: "Roderigo is pulled back into the scheme",
        paragraphs: [
          "Roderigo is discouraged because Desdemona is now openly with Othello, but Iago refuses to let him quit. He tells Roderigo that Desdemona will tire of Othello and turn toward Cassio instead.",
          "The claim is false, but it keeps Roderigo useful. Iago needs money, access, and someone willing to do reckless things on his behalf."
        ]
      },
      {
        heading: "Iago names the next target",
        paragraphs: [
          "By the end of the scene, Iago has settled on Cassio as the easiest way into Othello's trust. If Cassio can be made to look improper, Desdemona's kindness will do the rest of the work.",
          "The shift is crucial: the play moves from marriage defended in public to marriage quietly sabotaged through appearances."
        ]
      }
    ],
    beats: [
      {
        speaker: "Third Gentleman",
        original: "News, lads! our wars are done. The desperate tempest hath so bang'd the Turks, that their designment halts.",
        modern: "The storm has broken the Turkish threat before battle can even happen.",
        note: "Shakespeare clears away the external conflict so the audience will focus on the private one Iago is about to build."
      },
      {
        speaker: "Iago",
        original: "With as little a web as this will I ensnare as great a fly as Cassio.",
        modern: "Iago says the smallest pattern of appearances will be enough to trap Cassio.",
        note: "The line captures his whole method: he works through interpretation, not brute force."
      },
      {
        speaker: "Iago",
        original: "The Moor is of a constant, loving, noble nature.",
        modern: "Iago recognizes that Othello's decency and openness can be turned against him.",
        note: "This matters because the tragedy feeds on strengths that become vulnerabilities in the wrong hands."
      }
    ]
  },
  {
    id: "act-2-scene-2",
    label: "Act 2, Scene 2",
    title: "The island celebrates before the break",
    mitHref: "https://shakespeare.mit.edu/othello/othello.2.2.html",
    summary: "A public proclamation turns the victory and marriage into a night of celebration, creating a brief, fragile pause before Iago's trap springs.",
    focus: "This scene is tiny, but it matters because Shakespeare places public order and joy immediately before disorder.",
    translationSections: [
      {
        heading: "The state announces official joy",
        paragraphs: [
          "A herald announces Othello's order that Cyprus celebrate both the defeat of the Turkish threat and his marriage to Desdemona.",
          "The scene is brief, but it frames the island as orderly, festive, and publicly unified."
        ]
      },
      {
        heading: "The timing creates dramatic irony",
        paragraphs: [
          "Because the audience already knows Iago is plotting, the celebration feels unstable even while it sounds official and controlled.",
          "Shakespeare uses the public holiday to sharpen the contrast between what the community believes is happening and what is about to happen behind the scenes."
        ]
      },
      {
        heading: "Joy becomes the setting for the trap",
        paragraphs: [
          "The proclamation does more than add atmosphere. It creates the exact social setting Iago needs for Act 2, Scene 3: drinking, loosened discipline, and a sense that everyone can relax.",
          "What looks like civic order becomes the opening through which private chaos enters."
        ]
      }
    ],
    beats: [
      {
        speaker: "Herald",
        original: "It is Othello's pleasure, our noble and valiant general, that upon certain tidings now arrived, importing the mere perdition of the Turkish fleet, every man put himself into triumph.",
        modern: "The official order is for the whole island to celebrate because the Turkish fleet has been destroyed.",
        note: "The announcement makes victory sound complete and secure, which heightens the irony of what follows."
      },
      {
        speaker: "Herald",
        original: "To commemorate a full and prosperous achievement of this bounteous fortune.",
        modern: "The state wants the moment remembered as public blessing and success.",
        note: "Shakespeare is deliberately letting the island feel safe just before Iago proves it is not."
      },
      {
        speaker: "Herald",
        original: "From this present hour of five till the bell have told eleven.",
        modern: "The celebration is given a clear time window, which quietly sets the clock for Cassio's fall.",
        note: "The line matters because the party is not background; it is the schedule that makes the next scene possible."
      }
    ]
  },
  {
    id: "act-2-scene-3",
    label: "Act 2, Scene 3",
    title: "Cassio loses his position after the drunken fight",
    mitHref: "https://shakespeare.mit.edu/othello/othello.2.3.html",
    summary: "Iago pushes Cassio toward a mistake, the celebration turns violent, and Othello removes Cassio from office.",
    focus: "This is the scene where Iago proves he does not need force. He just needs one weakness, one moment, and the right timing.",
    parallelRows: [
      {
        label: "Othello / Cassio",
        originalLines: [
          "Good Michael, look you to the guard to-night:",
          "Iago is most honest.",
          "Come, my dear love,",
          "The purchase made, the fruits are to ensue;"
        ],
        modernLines: [
          "Othello leaves Cassio in charge for the evening and repeats his trust in Iago without hesitation.",
          "That trust matters because Othello walks offstage believing the island is secure just as Iago begins arranging the damage."
        ]
      },
      {
        label: "Iago / Cassio",
        originalLines: [
          "Well, happiness to their sheets! Come, lieutenant, I",
          "have a stoup of wine;",
          "Not to-night, good Iago: I have very poor and",
          "unhappy brains for drinking:"
        ],
        modernLines: [
          "Iago keeps the mood playful and social while steering Cassio toward the one weakness he already understands.",
          "Cassio even admits that alcohol affects him badly, which means the trap works because Iago studies people accurately."
        ]
      },
      {
        label: "Cassio / Iago",
        originalLines: [
          "I have drunk but one cup to-night,",
          "and dare not task my weakness with any more.",
          "What, man! 'tis a night of revels:"
        ],
        modernLines: [
          "Cassio tries to set a limit, but Iago keeps framing more drinking as harmless celebration and friendship.",
          "The pressure is small on purpose: Iago only needs Cassio slightly impaired, not completely destroyed."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "If I can fasten but one cup upon him,",
          "With that which he hath drunk to-night already,",
          "He'll be as full of quarrel and offence",
          "As my young mistress' dog."
        ],
        modernLines: [
          "Here Iago explains the plan openly to the audience.",
          "He does not need to invent a scandal from nothing; he only needs to nudge Cassio's own weakness until the public consequences take over."
        ]
      },
      {
        label: "Cassio",
        originalLines: [
          "'Fore God, they have given me a rouse already.",
          "Do not think, gentlemen. I am drunk:",
          "I am not drunk now; I can stand well enough, and",
          "speak well enough."
        ],
        modernLines: [
          "Cassio reaches the dangerous point where he insists he is fine while proving that he is not.",
          "His self-control is already slipping, and that makes the next insult enough to push him into violence."
        ]
      },
      {
        label: "Othello",
        originalLines: [
          "For Christian shame, put by this barbarous brawl:",
          "He that stirs next to carve for his own rage",
          "Holds his soul light;",
          "Silence that dreadful bell: it frights the isle"
        ],
        modernLines: [
          "When Othello arrives, the celebration has become a public security crisis.",
          "He judges the fight as a threat to order itself, not just as a private lapse between friends."
        ]
      },
      {
        label: "Cassio / Othello",
        originalLines: [
          "I pray you, pardon me; I cannot speak.",
          "I know, Iago,",
          "Thy honesty and love doth mince this matter,",
          "Cassio, I love thee",
          "But never more be officer of mine."
        ],
        modernLines: [
          "Cassio is too shaken and ashamed to defend himself clearly, while Iago's staged reluctance makes him sound trustworthy.",
          "Othello still cares about Cassio, but he removes him from office because discipline has collapsed under his watch."
        ]
      },
      {
        label: "Cassio",
        originalLines: [
          "Reputation, reputation, reputation! O, I have lost",
          "my reputation! I have lost the immortal part of",
          "myself, and what remains is bestial."
        ],
        modernLines: [
          "Cassio feels the deepest wound is not physical but social and moral.",
          "He believes one drunken night has destroyed the version of himself that the world respected."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "Confess yourself freely to her;",
          "importune her help to put you in your place again:",
          "Our general's wife is now the general:"
        ],
        modernLines: [
          "Iago sounds like a practical friend and tells Cassio to seek Desdemona's help.",
          "That advice seems harmless because Desdemona is compassionate, but Iago is really creating the appearances he will later weaponize."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "Divinity of hell!",
          "When devils will the blackest sins put on,",
          "They do suggest at first with heavenly shows,",
          "As I do now:"
        ],
        modernLines: [
          "The soliloquy makes the strategy plain: Iago uses helpful advice and innocent appearances to build a larger lie.",
          "By the end of the scene, Cassio's attempt to repair the damage has already been turned into the next stage of the trap."
        ]
      }
    ],
    translationSections: [
      {
        heading: "A celebration becomes an opening",
        paragraphs: [
          "Cyprus is celebrating because the Turkish threat has collapsed and because Othello has safely arrived with Desdemona. Othello leaves Cassio in charge while he spends time with his new wife.",
          "Iago immediately studies the moment for weakness. He knows Cassio has authority tonight, but he also knows Cassio cannot handle much alcohol."
        ]
      },
      {
        heading: "Cassio is pushed into drinking",
        paragraphs: [
          "Cassio tries to refuse more wine, admitting that even a small amount affects him. Iago pretends to be friendly and keeps the mood festive, calling for music, company, and another round.",
          "What looks like harmless celebration is actually the first step in a trap. Iago wants Cassio slightly off balance, not wildly unconscious."
        ]
      },
      {
        heading: "Iago triggers the fight",
        paragraphs: [
          "Once Cassio is compromised, Iago sends Roderigo to insult and provoke him. Cassio gives chase, tempers rise, and Montano gets involved trying to restore order.",
          "The scene erupts into violence. Alarms ring out, and the island that was supposed to feel secure and triumphant suddenly looks unstable."
        ]
      },
      {
        heading: "Othello judges by appearances",
        paragraphs: [
          "Othello arrives and demands to know what happened. Iago acts reluctant to speak badly of Cassio, which makes his version sound more trustworthy. He carefully tells the story in a way that harms Cassio while preserving his own image.",
          "Othello is angry that discipline has collapsed under Cassio's watch. Even though he still loves Cassio, he strips him of his office on the spot."
        ]
      },
      {
        heading: "Cassio mourns his reputation",
        paragraphs: [
          "After Othello leaves, Cassio is horrified less by the wounds than by the public shame. He believes his name, honour, and future have been destroyed in a single night.",
          "Iago again sounds helpful rather than predatory. He tells Cassio to ask Desdemona to speak on his behalf because her kindness and influence with Othello may restore him."
        ]
      },
      {
        heading: "Iago turns repair into evidence",
        paragraphs: [
          "Cassio accepts the advice, believing Iago is his ally. Once Cassio is gone, Iago explains the next phase: if Desdemona pleads for Cassio often enough, he can make those innocent meetings look suspicious to Othello.",
          "By the end of the scene, Iago has damaged Cassio, drawn Desdemona into the plan, and positioned himself as everyone's trusted helper. The plot deepens because every decent response now becomes new material for manipulation."
        ]
      }
    ],
    beats: [
      {
        speaker: "Iago",
        original: "If I can fasten but one cup upon him, / With that which he hath drunk to-night already, / He'll be as full of quarrel and offence / As my young mistress' dog.",
        modern: "Iago knows Cassio cannot handle much alcohol. His plan is simple: push him slightly past control and let the damage happen naturally.",
        note: "Iago succeeds by studying weaknesses instead of inventing chaos out of nowhere."
      },
      {
        speaker: "Cassio",
        original: "Reputation, reputation, reputation! O, I have lost my reputation!",
        modern: "After the fight, Cassio is devastated because he believes his public honour and career have been ruined in one night.",
        note: "Cassio's panic shows how much identity in this play depends on what other people think they have seen."
      },
      {
        speaker: "Othello",
        original: "Cassio, I love thee; / But never more be officer of mine.",
        modern: "Othello still cares about Cassio, but he chooses discipline over friendship and removes him from his post.",
        note: "The decision feels fair in the moment, which is why Iago's manipulation becomes so dangerous."
      }
    ]
  },
  {
    id: "act-3-scene-1",
    label: "Act 3, Scene 1",
    title: "Cassio tries to regain access",
    mitHref: "https://shakespeare.mit.edu/othello/othello.3.1.html",
    summary: "Cassio works through music, Emilia, and Desdemona to reach Othello again, not realizing that every innocent step can be turned against him.",
    focus: "Notice how indirect access becomes dangerous here. Cassio cannot simply repair things face to face, so he moves through the very social channels Iago can poison.",
    translationSections: [
      {
        heading: "Cassio returns carefully, not confidently",
        paragraphs: [
          "Cassio comes early and tries to soften the moment with musicians and courtesy rather than demand an audience. The opening has a lighter surface, but the purpose is serious: he needs a path back to Othello.",
          "That careful approach shows how much ground he has already lost. He is no longer speaking from position or authority."
        ]
      },
      {
        heading: "Emilia becomes the first point of access",
        paragraphs: [
          "Cassio turns to Emilia because she can get him near Desdemona. She is sympathetic and practical, and she understands that Othello's anger may cool if the right people are allowed to speak.",
          "This matters because honest mediation is now the only route available to Cassio, but mediation is exactly what Iago later frames as suspicious."
        ]
      },
      {
        heading: "Desdemona promises help without hesitation",
        paragraphs: [
          "When Desdemona hears Cassio's case, she responds with warmth and confidence. She believes the friendship between Othello and Cassio can be repaired through persistence and honest pleading.",
          "Her help is completely innocent. The danger comes from how that kindness will be interpreted by a jealous imagination."
        ]
      }
    ],
    beats: [
      {
        speaker: "Cassio",
        original: "Bounteous madam, / Whatever shall become of Michael Cassio, / He's never any thing but your true servant.",
        modern: "Cassio approaches Desdemona with humility and gratitude rather than entitlement.",
        note: "His respectful tone makes the later suspicion against him feel especially cruel and distorted."
      },
      {
        speaker: "Emilia",
        original: "I will bestow you where you shall have time / To speak your bosom freely.",
        modern: "Emilia offers Cassio the private access he needs in order to explain himself honestly.",
        note: "A reasonable act of help becomes dangerous only because Iago is waiting to reinterpret it."
      },
      {
        speaker: "Desdemona",
        original: "Assure thee, if I do vow a friendship, I'll perform it / To the last article.",
        modern: "Desdemona commits herself fully to helping Cassio regain Othello's favour.",
        note: "Her constancy is admirable, but it also creates the repeated advocacy that Iago needs."
      }
    ]
  },
  {
    id: "act-3-scene-2",
    label: "Act 3, Scene 2",
    title: "Public duty masks private danger",
    mitHref: "https://shakespeare.mit.edu/othello/othello.3.2.html",
    summary: "Othello handles military business and trusts Iago with routine work just before the temptation scene begins.",
    focus: "This transition matters because it shows how ordinary Othello's trust in Iago still feels right before the emotional collapse.",
    translationSections: [
      {
        heading: "The scene is brief but revealing",
        paragraphs: [
          "Othello gives Iago letters to deliver and continues acting as a disciplined commander with public obligations to manage.",
          "Nothing dramatic seems to happen, which is exactly why the scene matters. Trust in Iago still looks procedural, normal, and deserved."
        ]
      },
      {
        heading: "Private danger hides inside ordinary command",
        paragraphs: [
          "Othello depends on Iago as an officer who can handle details, messages, and movement between people. That kind of trust is practical rather than emotional on the surface.",
          "But the same habit of dependence makes it easier for Iago to stand near every important exchange and shape what Othello sees next."
        ]
      },
      {
        heading: "The pause sharpens the next collapse",
        paragraphs: [
          "Because Act 3, Scene 2 is so short and orderly, it creates a calm ledge before Act 3, Scene 3 opens the play's central emotional wound.",
          "Shakespeare uses the transition to remind us that Othello is still functioning publicly even as his private world is about to be invaded."
        ]
      }
    ],
    beats: [
      {
        speaker: "Othello",
        original: "These letters give, Iago, to the pilot.",
        modern: "Othello casually hands Iago another task that depends on trust and competence.",
        note: "The line shows how ordinary Iago's authority still appears within Othello's world."
      },
      {
        speaker: "Othello",
        original: "And by him do my duties to the senate.",
        modern: "Othello is still oriented toward public service, law, and command.",
        note: "That civic steadiness makes the private unraveling of the next scene feel even sharper."
      },
      {
        speaker: "Othello",
        original: "Come, my dear Desdemona, let's meet at the citadel.",
        modern: "Othello still speaks with warmth and normal affection before Iago's temptation scene begins.",
        note: "The line reminds us how much emotional ground will be lost in the next scene."
      }
    ]
  },
  {
    id: "act-3-scene-3",
    label: "Act 3, Scene 3",
    title: "Iago turns suspicion into jealousy",
    mitHref: "https://shakespeare.mit.edu/othello/othello.3.3.html",
    summary: "This is the hinge of the tragedy: Iago never proves anything, but he convinces Othello to start reading every detail as evidence.",
    focus: "Pay attention to how Iago pretends reluctance. He gains power by making Othello feel that the suspicion came from Othello's own mind.",
    parallelRows: [
      {
        label: "Desdemona",
        originalLines: [
          "If I do vow a friendship, I'll perform it",
          "To the last article: my lord shall never rest;",
          "I'll watch him tame and talk him out of patience;",
          "I'll intermingle every thing he does",
          "With Cassio's suit:"
        ],
        modernLines: [
          "Desdemona promises Cassio wholehearted help because she thinks she is defending an honorable friend.",
          "Her persistence comes from loyalty and kindness, but it also creates the visible pattern Iago needs."
        ]
      },
      {
        label: "Cassio / Iago",
        originalLines: [
          "Madam, I'll take my leave.",
          "Ha! I like not that.",
          "Cassio, my lord! No, sure, I cannot think it,",
          "That he would steal away so guilty-like,"
        ],
        modernLines: [
          "Cassio leaves quickly to avoid awkwardness, but Iago instantly turns the timing into suspicion.",
          "He still does not accuse anyone outright; he only makes Cassio's exit look like something Othello should remember."
        ]
      },
      {
        label: "Desdemona / Othello",
        originalLines: [
          "His present reconciliation take;",
          "I prithee, call him back.",
          "Prithee, no more: let him come when he will;",
          "I will deny thee nothing.",
          "To leave me but a little to myself."
        ],
        modernLines: [
          "Desdemona pushes for Cassio because she believes mercy is the fair response to one mistake.",
          "Othello gives in politely, but he also asks for space, which shows that Iago's first suggestion has already started working."
        ]
      },
      {
        label: "Othello",
        originalLines: [
          "Excellent wretch! Perdition catch my soul,",
          "But I do love thee! and when I love thee not,",
          "Chaos is come again."
        ],
        modernLines: [
          "Othello still loves Desdemona intensely at this point.",
          "That matters because the tragedy grows out of love under pressure, not from indifference or coldness."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "O, beware, my lord, of jealousy;",
          "It is the green-eyed monster which doth mock",
          "The meat it feeds on;"
        ],
        modernLines: [
          "Iago pretends to protect Othello by warning him about jealousy.",
          "The warning is powerful because it sounds wise and reluctant while it quietly deepens the very suspicion it names."
        ]
      },
      {
        label: "Othello",
        originalLines: [
          "Why did I marry? This honest creature doubtless",
          "Sees and knows more, much more, than he unfolds."
        ],
        modernLines: [
          "Once Othello is alone with the idea, he starts treating Iago's hesitation as hidden knowledge.",
          "He no longer trusts his own earlier confidence and begins to imagine that something damaging is already visible to others."
        ]
      },
      {
        label: "Emilia / Iago",
        originalLines: [
          "I am glad I have found this napkin:",
          "This was her first remembrance from the Moor:",
          "I will in Cassio's lodging lose this napkin,"
        ],
        modernLines: [
          "The handkerchief enters the plot through accident, not guilt.",
          "Emilia picks it up without understanding the plan, and Iago immediately sees how a private love-token can become fake proof."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "Trifles light as air",
          "Are to the jealous confirmations strong",
          "As proofs of holy writ:"
        ],
        modernLines: [
          "Iago knows jealousy changes how evidence feels.",
          "Once the emotion is active, tiny details start to carry the weight of absolute proof even when they prove nothing."
        ]
      },
      {
        label: "Iago",
        originalLines: [
          "In sleep I heard him say 'Sweet Desdemona,",
          "Let us be wary, let us hide our loves;'",
          "And then, sir, would he gripe and wring my hand,"
        ],
        modernLines: [
          "When Othello demands something firmer, Iago invents a vivid story about Cassio talking in his sleep.",
          "The lie works because it sounds specific, intimate, and impossible to verify."
        ]
      },
      {
        label: "Othello",
        originalLines: [
          "Farewell the tranquil mind! farewell content!",
          "Her name, that was as fresh",
          "As Dian's visage, is now begrimed and black",
          "As mine own face."
        ],
        modernLines: [
          "Othello's language turns from uncertainty to emotional collapse.",
          "He now connects imagined betrayal to his own deepest fears about race, worth, and public shame."
        ]
      },
      {
        label: "Othello / Iago",
        originalLines: [
          "Now do I see 'tis true.",
          "All my fond love thus do I blow to heaven.",
          "For the fair devil. Now art thou my lieutenant."
        ],
        modernLines: [
          "Suspicion hardens into certainty, and Othello commits himself to revenge before the truth is tested.",
          "The cruelest twist is that he rewards Iago with Cassio's place, trusting the man who engineered the fall."
        ]
      }
    ],
    translationSections: [
      {
        heading: "Cassio leaves too quickly",
        paragraphs: [
          "The scene begins with Desdemona promising to help Cassio recover his position. Cassio has just been speaking with her when Othello arrives, and Cassio leaves quickly rather than face an awkward explanation.",
          "Iago quietly notices that departure and turns it into his first seed of suspicion. He does not accuse anyone directly; he only makes Othello aware that something looked worth noticing."
        ]
      },
      {
        heading: "Desdemona pleads in complete innocence",
        paragraphs: [
          "Desdemona warmly urges Othello to forgive Cassio and restore him soon. She presses the request again and again because she believes she is helping an honorable man who was treated harshly after one mistake.",
          "Othello does not refuse her, but he delays and says he will decide in his own time. Her persistence, which comes from kindness, becomes the very thing Iago later twists into evidence."
        ]
      },
      {
        heading: "Iago plants the first real suspicion",
        paragraphs: [
          "Once Desdemona leaves, Iago begins pretending that he does not want to speak badly of anyone. He asks small questions, pauses, and acts as though his conscience is holding him back.",
          "This is the heart of his strategy. Because he seems reluctant, Othello begins pushing him for more instead of defending Desdemona with confidence."
        ]
      },
      {
        heading: "Othello starts doubting what once felt secure",
        paragraphs: [
          "Iago brings up the fact that Cassio knew about Othello's courtship and hints that Venetian women can hide their behavior better than husbands realize. He never gives proof, but he gives Othello a lens through which innocent actions start to look suspicious.",
          "Alone, Othello begins to fear that his age, race, and outsider status may make him unworthy of Desdemona. Jealousy works here not because Othello suddenly stops loving her, but because that love now feels exposed and vulnerable."
        ]
      },
      {
        heading: "The handkerchief enters the plot",
        paragraphs: [
          "While Othello's mind is shifting, Desdemona accidentally drops the handkerchief Othello gave her. Emilia finds it and gives it to Iago, even though she does not yet understand what he plans to do with it.",
          "Iago has wanted that token for some time. Because it is emotionally important to Othello, it can serve as fake proof with far more force than gossip alone."
        ]
      },
      {
        heading: "Iago invents proof",
        paragraphs: [
          "Othello soon demands something firmer than hints. Iago responds with a fabricated story about Cassio talking in his sleep and supposedly revealing desire for Desdemona.",
          "Then he claims to have seen Cassio with Desdemona's handkerchief. These details are either invented or manipulated, but they are specific enough to overwhelm Othello's shrinking resistance."
        ]
      },
      {
        heading: "Jealousy becomes a vow",
        paragraphs: [
          "Othello's language changes from troubled uncertainty to violent certainty. He kneels and swears revenge, believing he has finally seen the truth.",
          "Iago kneels beside him and seals the false bond. Othello even appoints him lieutenant, rewarding the very man who is destroying him."
        ]
      },
      {
        heading: "The scene ends with trust reversed",
        paragraphs: [
          "By the end of Act 3, Scene 3, Othello trusts Iago more than Desdemona. The marriage that was defended so powerfully in Act 1 has been invaded from within.",
          "Nothing visible has actually proved Desdemona's guilt, yet Othello now interprets the world as though guilt has already been confirmed. That shift is what makes the rest of the tragedy possible."
        ]
      }
    ],
    beats: [
      {
        speaker: "Iago",
        original: "O, beware, my lord, of jealousy; / It is the green-eyed monster which doth mock / The meat it feeds on.",
        modern: "Iago warns Othello about jealousy while secretly creating it. He describes jealousy as something that consumes the person who gives in to it.",
        note: "The warning sounds protective, which makes the manipulation harder for Othello to detect."
      },
      {
        speaker: "Iago",
        original: "Trifles light as air / Are to the jealous confirmations strong / As proofs of holy writ.",
        modern: "Once jealousy takes hold, tiny details can start to feel like absolute proof, even when they prove nothing.",
        note: "This is the logic of the whole tragedy: weak evidence becomes powerful because Othello is emotionally prepared to believe it."
      },
      {
        speaker: "Othello",
        original: "Now do I see 'tis true.",
        modern: "Othello reaches the point where suspicion begins to feel like certainty. He stops testing the accusation and starts acting on it.",
        note: "The tragedy accelerates here because doubt hardens into judgment before truth is checked."
      }
    ]
  },
  {
    id: "act-3-scene-4",
    label: "Act 3, Scene 4",
    title: "The handkerchief starts doing the damage",
    mitHref: "https://shakespeare.mit.edu/othello/othello.3.4.html",
    summary: "Othello's jealousy shifts from hints to object-based obsession as the handkerchief becomes a charged sign that everyone reads differently.",
    focus: "Track how direct conversation keeps failing here. The more Othello demands one object, the less anyone is actually talking about what he fears.",
    translationSections: [
      {
        heading: "Desdemona still thinks this is about Cassio",
        paragraphs: [
          "Desdemona keeps trying to reopen the subject of Cassio because she still believes the problem can be solved through mercy and honest conversation.",
          "She does not yet understand that Othello's emotional center has shifted away from Cassio and toward suspicion itself."
        ]
      },
      {
        heading: "The handkerchief becomes an obsession",
        paragraphs: [
          "When Othello demands the handkerchief, the conversation changes immediately. He turns the gift into a sacred object with a story, a history, and a warning attached to it.",
          "For Othello, losing the handkerchief begins to feel like losing proof of love. For Desdemona, it is still only one missed object inside a larger emotional confusion."
        ]
      },
      {
        heading: "Emilia sees jealousy before Desdemona does",
        paragraphs: [
          "After Othello exits, Emilia understands that jealousy is the real force now driving him. Desdemona still reaches for practical explanations, but Emilia reads the emotional danger more clearly.",
          "This split matters because it shows how tragedy often becomes visible to observers before it becomes visible to the people trapped inside it."
        ]
      },
      {
        heading: "The token moves again",
        paragraphs: [
          "Cassio later finds the handkerchief and gives it to Bianca to copy, not realizing what it means to Othello. Bianca reads it through intimacy and suspicion of her own.",
          "The object gains power not because it speaks for itself, but because every character keeps attaching a different story to it."
        ]
      }
    ],
    beats: [
      {
        speaker: "Othello",
        original: "Fetch me the handkerchief: my mind misgives.",
        modern: "Othello fixates on the missing handkerchief because he is already prepared to see it as a sign of betrayal.",
        note: "The line shows how jealousy narrows his attention and makes one object feel larger than the marriage itself."
      },
      {
        speaker: "Othello",
        original: "There's magic in the web of it.",
        modern: "Othello gives the handkerchief a mythic history, which raises the emotional stakes far beyond its material value.",
        note: "He is not really talking about cloth anymore; he is talking about trust, memory, and control."
      },
      {
        speaker: "Bianca",
        original: "This is some token from a newer friend: / To the felt absence now I feel a cause.",
        modern: "Bianca assumes the handkerchief points to another woman because she reads it through her own insecurity.",
        note: "The same object keeps generating new suspicions in different people, which is why it becomes so dangerous."
      }
    ]
  },
  {
    id: "act-4-scene-1",
    label: "Act 4, Scene 1",
    title: "Jealousy becomes public collapse",
    mitHref: "https://shakespeare.mit.edu/othello/othello.4.1.html",
    summary: "Iago drives Othello into a seizure, stages a conversation that Othello misreads, and leaves witnesses to see how far the general has fallen.",
    focus: "This scene shows jealousy moving from private suspicion into visible public breakdown.",
    translationSections: [
      {
        heading: "Iago pushes thought into physical collapse",
        paragraphs: [
          "Othello's language becomes fractured and obsessive as Iago keeps feeding him sexual suggestions and half-formed images. Eventually the pressure overwhelms him and he falls into a fit.",
          "The collapse matters because jealousy is no longer only an idea. It has become something visible in Othello's body and speech."
        ]
      },
      {
        heading: "Iago stages what Othello sees",
        paragraphs: [
          "After Othello recovers, Iago tells him to hide and listen while he speaks with Cassio. Othello thinks the conversation will be about Desdemona, but Iago deliberately steers it toward Bianca instead.",
          "Because Othello is already primed to misread everything, Cassio's laughter sounds like proof. Iago does not need to force the interpretation once the emotional frame is in place."
        ]
      },
      {
        heading: "Appearance replaces truth completely",
        paragraphs: [
          "Bianca then arrives and throws the handkerchief back at Cassio, which seems to confirm Othello's fears even though the scene proves nothing about Desdemona.",
          "This is one of the play's clearest examples of false evidence working because Othello is now reading the world through jealousy instead of through truth."
        ]
      },
      {
        heading: "The damage becomes public",
        paragraphs: [
          "Lodovico arrives with news from Venice and witnesses Othello strike Desdemona. By this point, the private poison has become visible to outsiders.",
          "The noble, controlled leader admired earlier in the play now appears unstable and harsh in public, which shows how far Iago's work has spread."
        ]
      }
    ],
    beats: [
      {
        speaker: "Othello",
        original: "Lie with her? lie on her? We say lie on her, when they belie her.",
        modern: "Othello's thoughts splinter into obsessive wordplay and repetition.",
        note: "The broken language reveals a mind that can no longer hold steady judgment."
      },
      {
        speaker: "Iago",
        original: "Work on, / My medicine, work!",
        modern: "Iago treats jealousy like a substance he has successfully administered.",
        note: "The line makes the manipulation feel clinical, deliberate, and almost scientific."
      },
      {
        speaker: "Lodovico",
        original: "Is this the noble Moor whom our full senate / Call all in all sufficient?",
        modern: "Lodovico cannot reconcile the man in front of him with Othello's former reputation.",
        note: "That outside reaction proves the collapse is no longer hidden inside the marriage."
      }
    ]
  },
  {
    id: "act-4-scene-2",
    label: "Act 4, Scene 2",
    title: "False certainty turns on Desdemona",
    mitHref: "https://shakespeare.mit.edu/othello/othello.4.2.html",
    summary: "Othello accuses Desdemona directly, Emilia recognizes the slander, and Iago pushes Roderigo toward one more desperate act.",
    focus: "Notice how innocence offers no protection once Othello has already decided the story in advance.",
    translationSections: [
      {
        heading: "Othello questions before he listens",
        paragraphs: [
          "Othello first questions Emilia and then turns on Desdemona herself, but he is no longer asking in order to learn. He is asking in order to confirm what he already believes.",
          "That is why the scene feels so painful: truth is present, but Othello has stopped using questions as a path toward it."
        ]
      },
      {
        heading: "Desdemona cannot understand the accusation",
        paragraphs: [
          "Desdemona hears rage and insult, but she still cannot see the inner structure of the lie surrounding her. She answers from innocence while Othello listens from certainty.",
          "The emotional force of the scene comes from that gap. They are speaking to each other, but not from the same reality."
        ]
      },
      {
        heading: "Emilia sees slander clearly",
        paragraphs: [
          "After Othello leaves, Emilia recognizes that some villain has poisoned his mind. She understands the shape of the falsehood even if she does not yet know exactly how it was built.",
          "Her instinct is morally clear in a way Othello's judgment is not, which prepares her role in the final exposure."
        ]
      },
      {
        heading: "Iago redirects another crisis",
        paragraphs: [
          "The scene does not end with Desdemona. Roderigo confronts Iago about lost money and failed promises, and Iago responds by pushing him toward violence against Cassio.",
          "Iago's skill lies in never allowing one collapsing lie to stop the next move. He turns every complaint into another instrument."
        ]
      }
    ],
    beats: [
      {
        speaker: "Desdemona",
        original: "I understand a fury in your words, / But not the words.",
        modern: "Desdemona can feel Othello's rage even though she cannot make sense of the charge behind it.",
        note: "The line captures the collapse of communication between husband and wife."
      },
      {
        speaker: "Emilia",
        original: "Some eternal villain, / Some busy and insinuating rogue, / Some cogging, cozening slave, to get some office, / Have not devised this slander.",
        modern: "Emilia correctly senses that a manipulative villain has planted the accusation for personal gain.",
        note: "She sees the ethical truth long before the full evidence becomes visible."
      },
      {
        speaker: "Iago",
        original: "If thou the next night following enjoy not Desdemona, take me from this world with treachery and devise engines for my life.",
        modern: "Iago keeps Roderigo moving by renewing false promises and tying them to fresh violence.",
        note: "Even when one lie frays, he immediately spins another one strong enough to keep the plot moving."
      }
    ]
  },
  {
    id: "act-4-scene-3",
    label: "Act 4, Scene 3",
    title: "The willow scene slows the tragedy down",
    mitHref: "https://shakespeare.mit.edu/othello/othello.4.3.html",
    summary: "Desdemona and Emilia speak quietly before the final act, revealing different ideas about marriage, betrayal, and what women are expected to endure.",
    focus: "Pay attention to tone here. Shakespeare slows the plot down so the audience feels the emotional cost before the final violence begins.",
    translationSections: [
      {
        heading: "Desdemona feels the sadness before the end",
        paragraphs: [
          "As she prepares for bed, Desdemona remembers the willow song and the story of a woman abandoned in sorrow. The scene is calm on the surface, but it is filled with emotional foreboding.",
          "She does not yet know exactly what will happen, but the mood of loss is already in the room."
        ]
      },
      {
        heading: "Emilia and Desdemona speak from different worlds",
        paragraphs: [
          "Desdemona still thinks in terms of loyalty, patience, and ideal love. Emilia is more worldly and blunt; she understands desire, imbalance, and the ways men often excuse themselves.",
          "Their contrast matters because it gives the audience two ways of thinking about marriage just before the tragedy closes."
        ]
      },
      {
        heading: "The quiet makes the final act heavier",
        paragraphs: [
          "Nothing violent happens here, but the scene deepens the tragedy by giving Desdemona one last intimate space before the bedroom murder.",
          "It also lets Emilia speak some of the play's clearest thoughts about gender double standards, which broadens the tragedy beyond one marriage alone."
        ]
      }
    ],
    beats: [
      {
        speaker: "Desdemona",
        original: "The poor soul sat sighing by a sycamore tree, / Sing all a green willow.",
        modern: "The willow song surrounds the scene with sorrow, abandonment, and foreshadowing.",
        note: "The music prepares the audience emotionally for tragedy before the action arrives."
      },
      {
        speaker: "Desdemona",
        original: "His unkindness may defeat my life, / But never taint my love.",
        modern: "Desdemona imagines suffering herself before she imagines loving Othello less.",
        note: "Her loyalty remains intense even when the marriage has already turned dangerous."
      },
      {
        speaker: "Emilia",
        original: "Let husbands know / Their wives have sense like them.",
        modern: "Emilia argues that women feel, think, and desire just as men do.",
        note: "Her realism sharply counters the idealism that has left Desdemona so exposed."
      }
    ]
  },
  {
    id: "act-5-scene-1",
    label: "Act 5, Scene 1",
    title: "Iago tries to finish the plot in darkness",
    mitHref: "https://shakespeare.mit.edu/othello/othello.5.1.html",
    summary: "The night attack on Cassio and Roderigo begins as Iago's cleanup move, but confusion, survival, and witnesses start pulling the plan out of his control.",
    focus: "Darkness matters here because nobody sees clearly, which lets Iago improvise while the truth begins slipping loose anyway.",
    translationSections: [
      {
        heading: "Roderigo is pushed into the attack",
        paragraphs: [
          "Iago needs Cassio removed and Roderigo still useful, so he drives Roderigo into one last violent task. Roderigo is frightened and uncertain, but he moves because he has already invested too much to pull back cleanly.",
          "The scene begins with desperation rather than confidence, which shows the plot is entering its final unstable stage."
        ]
      },
      {
        heading: "The strike does not go cleanly",
        paragraphs: [
          "Cassio fights back, Roderigo is wounded, and the darkness creates confusion instead of tidy success. Iago has to adapt in motion because the event no longer fits the plan exactly.",
          "This matters because the tragedy is finally starting to resist the script Iago wrote for it."
        ]
      },
      {
        heading: "Iago erases what he can",
        paragraphs: [
          "To protect himself, Iago wounds Cassio from behind and kills Roderigo before he can speak too clearly. He still tries to sound helpful and shocked, but the violence is now openly messy.",
          "The more Iago cleans up, the more attention he has to draw to the scene, which makes exposure more likely."
        ]
      },
      {
        heading: "The plot starts to unravel in public",
        paragraphs: [
          "With Lodovico, Gratiano, and Bianca entering the aftermath, the attack produces witnesses instead of closure. Cassio survives long enough for questions to remain active.",
          "That survival is crucial because it keeps the chain of false proof from sealing completely before the final bedroom scene."
        ]
      }
    ],
    beats: [
      {
        speaker: "Iago",
        original: "This is the night / That either makes me, or fordoes me quite.",
        modern: "Iago knows the plot has reached a point where it must either secure his victory or destroy him.",
        note: "The line gives the scene a high-stakes, almost desperate energy from the start."
      },
      {
        speaker: "Cassio",
        original: "I am maim'd for ever. Help, ho! murder! murder!",
        modern: "Cassio survives the attack but knows the wound may permanently damage his life and career.",
        note: "His survival keeps the scene from becoming the neat silence Iago wanted."
      },
      {
        speaker: "Iago",
        original: "O murderous slave! O villain!",
        modern: "Iago loudly performs outrage in order to hide the fact that he has been guiding the violence from inside it.",
        note: "He continues using performance as protection even when the plot is starting to break apart."
      }
    ]
  },
  {
    id: "act-5-scene-2",
    label: "Act 5, Scene 2",
    title: "The tragedy reaches Desdemona's bedroom",
    mitHref: "https://shakespeare.mit.edu/othello/othello.5.2.html",
    summary: "Othello confronts Desdemona, murders her under the influence of false certainty, and finally learns how completely he has been deceived.",
    focus: "This scene combines tenderness, violence, innocence, and self-deception. The language keeps showing how Othello tries to make a terrible act seem justified.",
    parallelRows: [
      {
        label: "Othello",
        originalLines: [
          "It is the cause, it is the cause, my soul,",
          "Yet she must die, else she'll betray more men.",
          "Put out the light, and then put out the light:"
        ],
        modernLines: [
          "Othello enters the room already resolved to kill Desdemona and frames the act as if it were moral necessity.",
          "That self-justifying language is part of the tragedy: he is trying to turn murder into duty."
        ]
      },
      {
        label: "Othello",
        originalLines: [
          "Ah balmy breath, that dost almost persuade",
          "Justice to break her sword! One more, one more.",
          "Be thus when thou art dead, and I will kill thee,",
          "And love thee after."
        ],
        modernLines: [
          "He is still moved by Desdemona's beauty and tenderness even while preparing to destroy her.",
          "The contradiction is brutal: Othello thinks love can survive alongside violence and judgment."
        ]
      },
      {
        label: "Othello / Desdemona",
        originalLines: [
          "Have you pray'd to-night, Desdemona?",
          "If you bethink yourself of any crime",
          "Unreconciled as yet to heaven and grace,",
          "Solicit for it straight."
        ],
        modernLines: [
          "Othello forces the scene into the language of final judgment before Desdemona even understands the accusation.",
          "He wants her spiritually prepared because he still imagines himself as a righteous executioner rather than a deceived husband."
        ]
      },
      {
        label: "Othello / Desdemona",
        originalLines: [
          "That handkerchief which I so loved and gave thee",
          "Thou gavest to Cassio.",
          "As I might love: I never gave him token."
        ],
        modernLines: [
          "The handkerchief remains the emotional center of Othello's false certainty.",
          "Desdemona answers honestly, but he hears her through the story Iago has built rather than through her actual words."
        ]
      },
      {
        label: "Othello / Desdemona",
        originalLines: [
          "O perjured woman! thou dost stone my heart,",
          "And makest me call what I intend to do",
          "A murder, which I thought a sacrifice:",
          "Kill me to-morrow: let me live to-night!"
        ],
        modernLines: [
          "Othello briefly feels the moral truth of what he is doing, but he pushes past it by blaming Desdemona for forcing the act to look like murder.",
          "Desdemona begs for time, which shows how absolute his false certainty has become."
        ]
      },
      {
        label: "Desdemona",
        originalLines: [
          "Nobody; I myself. Farewell",
          "Commend me to my kind lord: O, farewell!"
        ],
        modernLines: [
          "Even while dying, Desdemona tries to protect Othello from blame.",
          "Her last words make the scene even more devastating because they confirm her innocence and her loyalty at the same time."
        ]
      },
      {
        label: "Othello / Emilia",
        originalLines: [
          "An honourable murderer, if you will;",
          "For nought I did in hate, but all in honour.",
          "O, the more angel she,",
          "And you the blacker devil!"
        ],
        modernLines: [
          "Othello still clings to the idea that his motive was honorable, but Emilia destroys that illusion instantly.",
          "She names the moral truth without hesitation: Desdemona was innocent, and Othello has become monstrous through his act."
        ]
      },
      {
        label: "Emilia",
        originalLines: [
          "My friend, thy husband, honest, honest Iago.",
          "I found by fortune and did give my husband;",
          "For often, with a solemn earnestness,",
          "He begg'd of me to steal it."
        ],
        modernLines: [
          "The handkerchief lie finally breaks apart in public.",
          "Emilia reveals that she gave the token to Iago by chance, not because Desdemona handed it to Cassio."
        ]
      },
      {
        label: "Emilia / Iago",
        originalLines: [
          "I will not charm my tongue; I am bound to speak:",
          "My mistress here lies murder'd in her bed,",
          "Demand me nothing: what you know, you know:",
          "From this time forth I never will speak word."
        ],
        modernLines: [
          "Emilia refuses silence even when it puts her in direct danger, while Iago finally drops all performance and chooses blunt refusal.",
          "Truth is now out in the open, but it arrives too late to save Desdemona or Emilia."
        ]
      },
      {
        label: "Othello",
        originalLines: [
          "Soft you; a word or two before you go.",
          "Speak of me as I am; nothing extenuate,",
          "I took by the throat the circumcised dog,",
          "And smote him, thus."
        ],
        modernLines: [
          "Othello's last speech is an attempt to face the truth without pretending he is either purely heroic or purely simple.",
          "He kills himself beside Desdemona, ending the play in recognition and loss rather than repair."
        ]
      }
    ],
    translationSections: [
      {
        heading: "Othello enters already resolved",
        paragraphs: [
          "The final bedroom scene begins with Othello alone beside the sleeping Desdemona. He looks at her beauty and feels tenderness, but he has already decided that she must die.",
          "He speaks as though he is carrying out a necessary duty rather than committing murder. That self-justifying tone is part of the horror of the scene."
        ]
      },
      {
        heading: "Desdemona wakes into accusation",
        paragraphs: [
          "When Desdemona wakes, she has no idea how final Othello's decision has become. He questions her about her soul and then accuses her of betraying him with Cassio.",
          "She denies the charge honestly and repeatedly. The more truthful she is, the more Othello reads her words through the false story Iago has built."
        ]
      },
      {
        heading: "Mercy is refused",
        paragraphs: [
          "Desdemona begs for time: one more night, half an hour, even long enough to pray. Othello will not allow delay because delay might let doubt or truth interrupt the violent certainty he is clinging to.",
          "He kills her while still insisting that he loves her and that the act is somehow just. Shakespeare makes the contradiction unbearable on purpose."
        ]
      },
      {
        heading: "Emilia brings the world back in",
        paragraphs: [
          "Emilia calls from outside with news that Cassio is alive and that violence has broken out elsewhere. Othello first tries to hold his version of events together, but the facts no longer fit the story he believed.",
          "When Emilia enters and discovers Desdemona dying, she immediately refuses silence. Desdemona still tries to protect Othello even as she dies, but Emilia begins forcing the truth into the room."
        ]
      },
      {
        heading: "Iago is exposed",
        paragraphs: [
          "Emilia reveals that she gave Iago the handkerchief and had no idea he would use it to frame Desdemona. Step by step, Othello sees that the evidence he trusted was manufactured.",
          "Iago responds the only way he can: with violence and silence. He kills Emilia to stop her testimony, but by then the damage to his story is irreversible."
        ]
      },
      {
        heading: "Othello sees himself clearly at last",
        paragraphs: [
          "Once the truth is fully exposed, Othello understands that he murdered an innocent woman and placed his trust in a liar. His self-image as a just avenger collapses, and he sees the scale of what he has done.",
          "He wounds Iago but wants him left alive to suffer and to answer for his crimes. Othello no longer wants revenge; he wants the truth to stay visible."
        ]
      },
      {
        heading: "The tragedy closes on judgment and loss",
        paragraphs: [
          "Othello asks to be remembered honestly, not as a monster without complexity and not as a hero without fault. He then kills himself beside Desdemona.",
          "The survivors are left to carry out justice and restore order, but nothing can repair what jealousy, manipulation, and misplaced trust have destroyed. The play ends in recognition, not rescue."
        ]
      }
    ],
    beats: [
      {
        speaker: "Othello",
        original: "Put out the light, and then put out the light.",
        modern: "Othello compares extinguishing a candle to ending Desdemona's life, as if the act can be neat, controlled, and reversible.",
        note: "The image reveals how badly he is distorting reality in order to continue."
      },
      {
        speaker: "Desdemona",
        original: "Kill me to-morrow: let me live to-night!",
        modern: "Desdemona begs for even a little more time. She does not understand why Othello has become this final, merciless version of himself.",
        note: "Her pleading exposes the terrible gap between Othello's certainty and the truth of her innocence."
      },
      {
        speaker: "Emilia",
        original: "O, the more angel she, and you the blacker devil!",
        modern: "When Emilia learns what happened, she names the moral truth directly: Desdemona was innocent, and Othello has become monstrous through his choice.",
        note: "Emilia breaks the lie at last, but only after the damage can no longer be undone."
      }
    ]
  }
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

const MODERN_PASSAGE_PHRASES: Array<[RegExp, string]> = [
  [/'Sblood/gi, "Damn"],
  [/\bZounds\b/gi, "Damn"],
  [/\bTush\b/gi, "Come on"],
  [/\bBy heaven\b/gi, "Honestly"],
  [/\bBy Janus\b/gi, "Honestly"],
  [/\bI take it much unkindly\b/gi, "I take that as a real insult"],
  [/\bhold him in thy hate\b/gi, "hated him"],
  [/\bhold him in your hate\b/gi, "hated him"],
  [/\bI know my price\b/gi, "I know what I am worth"],
  [/\bno worse a place\b/gi, "nothing less than that position"],
  [/\bserve my turn upon him\b/gi, "use him for my own advantage"],
  [/\bI am not what I am\b/gi, "I am not what I seem"],
  [/\bput money in thy purse\b/gi, "keep raising money"],
  [/\bput money in your purse\b/gi, "keep raising money"],
  [/\bKeep up your bright swords\b/gi, "Put away your bright swords"],
  [/\bfor the dew will rust them\b/gi, "or the dew will rust them"],
  [/\bLet it not gall your patience\b/gi, "Do not let it bother you"],
  [/\b'tis my breeding\b/gi, "that is how I was raised"],
  [/\bWhat from the cape can you discern at sea\b/gi, "What can you see from the cape"],
  [/\bmy services which I have done the signiory\b/gi, "the service I have done for the state"],
  [/\bshall out-tongue his complaints\b/gi, "will speak louder than his accusations"],
  [/\bWere it my cue to fight\b/gi, "If it were time for me to fight"],
  [/\bI should have known it\b/gi, "I would have known it"],
  [/\bWithout a prompter\b/gi, "without anyone prompting me"],
  [/\bMost potent, grave, and reverend signiors\b/gi, "Powerful, serious, and respected senators"],
  [/\bRude am I in my speech\b/gi, "I am not polished when I speak"],
  [/\bShe loved me for the dangers I had passed\b/gi, "She loved me for the hardships I had survived"],
  [/\bI loved her that she did pity them\b/gi, "I loved her because she felt those hardships so deeply"],
  [/\bExcellent wretch\b/gi, "wonderful woman"],
  [/\bPerdition catch my soul\b/gi, "May I be damned"],
  [/\bif I do not love thee\b/gi, "if I do not love you"],
  [/\bChaos is come again\b/gi, "everything will fall into chaos again"],
  [/\bVillain, be sure thou prove my love a whore\b/gi, "Villain, you had better prove that my wife is unfaithful"],
  [/\bGive me the ocular proof\b/gi, "Give me visible proof"],
  [/\bO, beware, my lord, of jealousy\b/gi, "My lord, beware of jealousy"],
  [/\bIt is the green-eyed monster\b/gi, "It is the green-eyed monster"],
  [/\bPut out the light, and then put out the light\b/gi, "I will put out the candle, and then take her life"],
  [/\bNobody, I myself\b/gi, "Nobody did this to me; I did it myself"],
  [/\bSpeak of me as I am\b/gi, "Tell the truth about me"],
  [/\bone that loved not wisely but too well\b/gi, "someone who loved too intensely and without wisdom"]
];

const MODERN_PASSAGE_WORDS: Array<[RegExp, string]> = [
  [/\bthee\b/gi, "you"],
  [/\bthou\b/gi, "you"],
  [/\bthy\b/gi, "your"],
  [/\bthine\b/gi, "yours"],
  [/\bye\b/gi, "you"],
  [/\bart\b/gi, "are"],
  [/\bhast\b/gi, "have"],
  [/\bhath\b/gi, "has"],
  [/\bdost\b/gi, "do"],
  [/\bdoth\b/gi, "does"],
  [/\bdidst\b/gi, "did"],
  [/\bhadst\b/gi, "had"],
  [/\bwouldst\b/gi, "would"],
  [/\bshouldst\b/gi, "should"],
  [/\bcanst\b/gi, "can"],
  [/\bwilt\b/gi, "will"],
  [/\bshalt\b/gi, "shall"],
  [/\bmayst\b/gi, "may"],
  [/\bmust needs\b/gi, "must"],
  [/\bere\b/gi, "before"],
  [/\boft\b/gi, "often"],
  [/\banon\b/gi, "soon"],
  [/\bnay\b/gi, "no"],
  [/\bay\b/gi, "yes"],
  [/\bforsooth\b/gi, "really"],
  [/\bprithee\b/gi, "please"],
  [/\bmethinks\b/gi, "it seems to me"],
  [/\bwhence\b/gi, "from where"],
  [/\bwhither\b/gi, "where"],
  [/\bwherefore\b/gi, "why"],
  [/\bnaught\b/gi, "nothing"],
  [/\baught\b/gi, "anything"],
  [/\bmoe\b/gi, "more"],
  [/\bpractise\b/gi, "practice"],
  [/\bne'er\b/gi, "never"],
  [/\bo'er\b/gi, "over"],
  [/\bwi'\b/gi, "with"],
  [/\bi'th'\b/gi, "in the"],
  [/\bo'th'\b/gi, "of the"],
  [/\bth'\b/gi, "the "],
  [/'tis/gi, "it is"],
  [/'twas/gi, "it was"],
  [/'twere/gi, "it would be"],
  [/'twixt/gi, "between"],
  [/'gainst/gi, "against"],
  [/'yond/gi, "that"]
];

const MODERN_PASSAGE_CLEANUP: Array<[RegExp, string]> = [
  [/\b([A-Za-z]+)'st\b/g, "$1"],
  [/\byou did ([a-z]+)ed\b/gi, "you $1ed"],
  [/\byou did ([a-z]+)\b/gi, "you $1"],
  [/\byou have had my purse\b/gi, "you have been using my money"],
  [/\bas if the strings were yours\b/gi, "as if it were yours"],
  [/\bshould know of this\b/gi, "should know about this"],
  [/\bI take that as a real insult That\b/gi, "I take that as a real insult that"],
  [/\s+--\s+/g, " -- "]
];

function applyTextReplacements(value: string, replacements: Array<[RegExp, string]>) {
  return replacements.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);
}

async function fetchRemoteHtml(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch ${url} (${response.status}).`);
  }
  return response.text();
}

function splitHtmlLines(fragmentHtml: string) {
  return fragmentHtml
    .split(/<br\s*\/?>/i)
    .map((segment) => normalizeWhitespace(cheerio.load(`<div>${segment}</div>`).text()))
    .filter(Boolean);
}

function parseMitSceneBlocks(rawHtml: string): TranscriptBlock[] {
  const $ = cheerio.load(rawHtml);
  const blocks: TranscriptBlock[] = [];
  let started = false;
  let pendingSpeaker: string | null = null;

  $("body")
    .children()
    .each((_, element) => {
      const tagName = element.tagName?.toLowerCase();
      if (!tagName) {
        return;
      }
      if (!started) {
        if (tagName === "h3") {
          started = true;
        }
        return;
      }
      if (tagName === "p") {
        return;
      }
      if (tagName === "a") {
        const speaker = normalizeWhitespace($(element).text());
        if (speaker) {
          pendingSpeaker = speaker;
        }
        return;
      }
      if (tagName !== "blockquote") {
        return;
      }

      const lines = splitHtmlLines($(element).html() ?? "");
      if (lines.length === 0) {
        pendingSpeaker = null;
        return;
      }

      if (pendingSpeaker) {
        blocks.push({ kind: "speech", speaker: pendingSpeaker, lines });
      } else {
        blocks.push({ kind: "stage", lines });
      }
      pendingSpeaker = null;
    });

  return blocks;
}

function modernizePassage(text: string) {
  let modern = normalizeWhitespace(text);
  modern = applyTextReplacements(modern, MODERN_PASSAGE_PHRASES);
  modern = applyTextReplacements(modern, MODERN_PASSAGE_WORDS);
  modern = applyTextReplacements(modern, MODERN_PASSAGE_CLEANUP);
  modern = modern
    .replace(/\bi\b/g, "I")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s{2,}/g, " ")
    .trim();
  modern = modern.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix: string, character: string) => `${prefix}${character.toUpperCase()}`);
  return modern;
}

function modernizeStageDirection(lines: string[]) {
  return lines
    .map((line) =>
      normalizeWhitespace(
        line
          .replace(/\bExeunt\b/gi, "They exit.")
          .replace(/\bExit\b/gi, "Exit")
          .replace(/\bEnter\b/gi, "Enter")
      )
    )
    .filter(Boolean);
}

function renderTranscriptLines(lines: string[]) {
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("\n");
}

function modernizeTranscriptBlock(block: TranscriptBlock): TranscriptBlock {
  if (block.kind === "stage") {
    return {
      kind: "stage",
      lines: modernizeStageDirection(block.lines)
    };
  }

  return {
    kind: "speech",
    speaker: block.speaker,
    lines: [modernizePassage(block.lines.join(" "))]
  };
}

function renderTranscriptBlock(block: TranscriptBlock, mode: "original" | "modern") {
  if (block.kind === "stage") {
    return `<div class="parallel-reading-transcript-stage${mode === "modern" ? " modern" : ""}">${renderTranscriptLines(block.lines)}</div>`;
  }

  return `<article class="parallel-reading-transcript-entry${mode === "modern" ? " modern" : ""}">
            <div class="parallel-reading-transcript-speaker">${escapeHtml(block.speaker)}</div>
            <div class="parallel-reading-transcript-lines">${renderTranscriptLines(block.lines)}</div>
          </article>`;
}

function renderAlignedTranscriptHtml(blocks: TranscriptBlock[]) {
  return `<article class="parallel-reading-pair-card parallel-reading-transcript-pair">
            <div class="parallel-reading-block-heading">
              <div>
                <div class="parallel-reading-label">Scene-by-scene comparison</div>
                <p class="parallel-reading-frame-copy">Move down the scene with the original speech on the left and our modern-English version beside it.</p>
              </div>
            </div>
            <div class="parallel-reading-pair-head">
              <div>Original Shakespeare text</div>
              <div>Our modern-English version</div>
            </div>
            <div class="parallel-reading-pair-table">
              ${blocks
                .map((block) => {
                  const modernBlock = modernizeTranscriptBlock(block);
                  return `<div class="parallel-reading-pair-row">
                    <div class="parallel-reading-pair-cell original">${renderTranscriptBlock(block, "original")}</div>
                    <div class="parallel-reading-pair-cell modern">${renderTranscriptBlock(modernBlock, "modern")}</div>
                  </div>`;
                })
                .join("\n")}
            </div>
          </article>`;
}

async function hydrateParallelReadingScene(scene: ParallelReadingScene): Promise<HydratedParallelReadingScene> {
  const mitHtml = await fetchRemoteHtml(scene.mitHref);
  const originalBlocks = parseMitSceneBlocks(mitHtml);

  return {
    ...scene,
    alignedSceneHtml: renderAlignedTranscriptHtml(originalBlocks)
  };
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
  return cleaned && !/^embedded video$/i.test(cleaned) ? cleaned : "Othello Material Video";
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

function findOthelloUnit($: cheerio.CheerioAPI) {
  let matched: Element | null = null;
  $("item").each((_, element) => {
    const title = directChildText($, element as Element, "title").toLowerCase();
    if (title === "shakespearean drama - othello") {
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
  const text = body.length ? normalizeWhitespace(body.text()) : normalizeWhitespace($.root().text());
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
  return false;
}

function isFictionElementsHub(lesson: Lesson) {
  return false;
}

function topLevelLessons(lessons: Lesson[]) {
  return lessons
    .filter((lesson) => !isFictionElementLesson(lesson))
    .sort((first, second) => {
      const firstIsSuggestions = /Suggestions for Reading Shakespeare: Othello/i.test(first.title);
      const secondIsSuggestions = /Suggestions for Reading Shakespeare: Othello/i.test(second.title);
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
      title: "Shakespeare Context",
      lessons: visibleLessons.filter((lesson) => lesson.sequence <= 5)
    },
    {
      title: "Othello Study",
      lessons: visibleLessons.filter((lesson) => lesson.sequence >= 6)
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
  const resourceOptions = groups.map((group, index) => ({ value: group.id, label: group.title, selected: index === 0 }));
  return `${localBlock}
  <div class="scene-overview-control">
    <div class="film-room-label">Choose a lesson group</div>
    ${renderOverlaySelect({ id: "resource-select", nativeDataAttr: "data-resource-select", nativeClass: "film-room-select", options: resourceOptions })}
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
    return `<article class="empty-route-card"><h3>Library is ready for handouts</h3><p>No PDF or local document handouts were found in the Shakespeare: Othello unit export. Rubrics, exemplars, and teacher files can be added here next.</p></article>`;
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
    return `<article class="empty-route-card"><h3>Film Room is ready for media</h3><p>No video or audio media was included in this Brightspace export. Shakespeare context, performance clips, and Othello reading-support videos can be added here later.</p></article>`;
  }
  const videoOptions = videos.map((video, index) => ({ value: video.id, label: video.title, selected: index === 0 }));
  return `<div class="film-room-shell">
    <div class="film-room-stage">
      ${videos
        .map(
          (video, index) => `<section class="film-panel" data-film-panel="${escapeHtml(video.id)}"${index === 0 ? "" : " hidden"}>
            <div class="film-room-header"><h3>${escapeHtml(video.title)}</h3></div>
            ${video.origin === "local"
              ? `<video class="film-room-frame film-room-video" src="${escapeHtml(video.embedSrc)}" controls preload="metadata"></video>`
              : `<iframe class="film-room-frame" src="${escapeHtml(video.embedSrc)}" title="${escapeHtml(video.title)}" allowfullscreen loading="lazy"></iframe>`}
          </section>`
        )
        .join("\n")}
    </div>
    <aside class="film-room-sidebar">
      <div class="film-room-control-panel">
        <h3>Media Playlist</h3>
        <div class="film-room-label">Choose a video</div>
        ${renderOverlaySelect({ id: "film-select", nativeDataAttr: "data-film-select", nativeClass: "film-room-select", options: videoOptions })}
      </div>
    </aside>
  </div>`;
}

function renderShortStoryBank(items: StoryBankItem[]) {
  if (items.length === 0) {
    return `<article class="empty-route-card">
      <h3>Othello Materials</h3>
      <p>This section will hold the Othello notes, act questions, and support resources for the unit.</p>
    </article>`;
  }
  return `<div class="library-browser story-bank-browser">
    <aside class="library-list-panel">
      <h3>Othello Files</h3>
      <p>Select a support file or live reading source to open in the reader.</p>
      <div class="library-doc-list">
        ${items
          .map(
            (item, index) => `<button class="library-doc-tab${index === 0 ? " active" : ""}" type="button" data-story-doc-target="${escapeHtml(item.id)}" aria-pressed="${index === 0 ? "true" : "false"}">
              <span class="library-doc-index">${index + 1}</span>
              <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.description)}</small></span>
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
              <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div>
              <div class="library-actions">
                <button class="library-action-button" type="button" data-story-open-src="${escapeHtml(item.workspaceHref)}">${item.kind === "external" ? "Open Source" : "Open"}</button>
                <button class="library-action-button" type="button" data-story-fullscreen-src="${escapeHtml(item.workspaceHref)}" data-story-fullscreen-title="${escapeHtml(item.title)}">Full Screen</button>
                ${item.downloadable ? `<button class="library-action-button" type="button" data-story-download-src="${escapeHtml(item.workspaceHref)}">Download</button>` : ""}
              </div>
            </div>
            <iframe class="library-document-frame" src="${escapeHtml(item.workspaceHref)}" title="${escapeHtml(item.title)}" loading="lazy"></iframe>
          </section>`
        )
        .join("\n")}
    </div>
  </div>`;
}

function renderParallelReadingReader(scenes: HydratedParallelReadingScene[]) {
  const sceneOptions = scenes.map((scene, index) => ({
    value: scene.id,
    label: `${scene.label} - ${scene.title}`,
    selected: index === 0
  }));
  return `<div class="parallel-reading-browser">
    <section class="parallel-reading-toolbar">
      <div class="parallel-reading-toolbar-copy">
        <h3>Scene Guide</h3>
        <p>Choose a scene to compare the original text and the modern-English companion.</p>
      </div>
      <div class="parallel-reading-picker">
        <div class="parallel-reading-picker-label">Choose a scene</div>
        ${renderOverlaySelect({ id: "parallel-scene-select", nativeDataAttr: "data-parallel-select", nativeClass: "parallel-reading-select", options: sceneOptions })}
      </div>
    </section>
    <div class="parallel-reading-panel-stack">
      ${scenes
        .map(
          (scene, index) => `<section class="parallel-reading-panel" data-parallel-panel="${escapeHtml(scene.id)}"${index === 0 ? "" : " hidden"}>
            <div class="library-reader-header parallel-reading-header">
              <div>
                <p class="parallel-reading-scene-label">${escapeHtml(scene.label)}</p>
                <h3>${escapeHtml(scene.title)}</h3>
                <p>${escapeHtml(scene.summary)}</p>
              </div>
              <div class="library-actions">
                <button class="library-action-button" type="button" data-parallel-open-src="${escapeHtml(scene.mitHref)}">Open Full MIT Scene</button>
              </div>
            </div>
            ${scene.alignedSceneHtml}
            <div class="parallel-reading-watch-heading">
              <h4>What to watch</h4>
              <p>${escapeHtml(scene.focus)}</p>
            </div>
            <div class="parallel-reading-support-heading">
              <h4>Anchor lines to notice</h4>
              <p>Keep these touchstone lines in mind while you move between the original scene and the modern-English companion.</p>
            </div>
            <div class="parallel-reading-anchor-grid">
              ${scene.beats
                .map(
                  (beat) => `<article class="parallel-reading-anchor-card">
                    <div class="parallel-reading-label">Original text</div>
                    <div class="parallel-reading-speaker">${escapeHtml(beat.speaker)}</div>
                    <p class="parallel-reading-anchor-original">${escapeHtml(beat.original)}</p>
                    <div class="parallel-reading-label">Modern-English meaning</div>
                    <p>${escapeHtml(beat.modern)}</p>
                    <p class="parallel-reading-note">${escapeHtml(beat.note)}</p>
                  </article>`
                )
                .join("\n")}
            </div>
            <div class="parallel-reading-summary-heading">
              <h4>Scene summary</h4>
              <p>Use this recap after you work through the full scene, the anchor lines, and the modern-English build.</p>
            </div>
            <div class="parallel-reading-summary-list">
              ${scene.translationSections
                .map(
                  (section) => `<article class="parallel-reading-summary-card">
                    <h5>${escapeHtml(section.heading)}</h5>
                    ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
                  </article>`
                )
                .join("\n")}
            </div>
          </section>`
        )
        .join("\n")}
    </div>
  </div>`;
}

const anticipationStatementsForRender = [
  { id: 1, text: "You should always be able to be brutally honest with a true friend." },
  { id: 2, text: "People are never really what we seem: we are all playing a part." },
  { id: 3, text: "Stereotypes can sometimes be helpful and positive." },
  { id: 4, text: "True love can overcome any obstacle." },
  { id: 5, text: "Deep friendship should come before a romantic relationship." },
  { id: 6, text: "Jealousy makes a person completely irrational." },
  { id: 7, text: "Ambition is a negative personality trait." }
];
const anticipationOptionsForRender = ["Strongly Disagree", "Disagree", "Agree", "Strongly Agree"];
type OverlaySelectOption = {
  value: string;
  label: string;
  selected?: boolean;
};

function renderAnticipationChoiceField(label: string, responseId: string) {
  return `<fieldset class="othello-response-field anticipation-choice-field">
          <legend>${escapeHtml(label)}</legend>
          <div class="anticipation-choice-list">
            ${anticipationOptionsForRender.map((option) => `<label class="anticipation-choice-option">
              <input type="radio" name="${escapeHtml(responseId)}" value="${escapeHtml(option)}" data-response-id="${escapeHtml(responseId)}">
              <span>${escapeHtml(option)}</span>
            </label>`).join("")}
          </div>
        </fieldset>`;
}
function renderOverlaySelect(config: {
  id: string;
  nativeDataAttr: string;
  options: OverlaySelectOption[];
  nativeClass?: string;
}) {
  const defaultOption = config.options.find((option) => option.selected) ?? config.options[0];
  const nativeClass = config.nativeClass ? ` ${escapeHtml(config.nativeClass)}` : "";
  return `<div class="overlay-select-shell" data-overlay-select-shell>
    <button
      id="${escapeHtml(config.id)}-trigger"
      class="overlay-select-trigger"
      type="button"
      data-overlay-select-trigger
      aria-haspopup="listbox"
      aria-expanded="false"
      aria-controls="${escapeHtml(config.id)}-options"
    >
      <span data-overlay-select-label>${escapeHtml(defaultOption?.label ?? "Choose...")}</span>
      <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
    </button>
    <div id="${escapeHtml(config.id)}-options" class="overlay-select-options" data-overlay-select-options role="listbox" hidden>
      ${config.options
        .map((option) => `<button
          type="button"
          class="overlay-select-option${option.selected ? " is-active" : ""}"
          data-overlay-select-option="${escapeHtml(option.value)}"
          role="option"
          aria-selected="${option.selected ? "true" : "false"}"
        >${escapeHtml(option.label)}</button>`)
        .join("\n")}
    </div>
    <select id="${escapeHtml(config.id)}" class="overlay-select-native${nativeClass}" data-overlay-select-native ${config.nativeDataAttr} aria-hidden="true" tabindex="-1">
      ${config.options
        .map((option) => `<option value="${escapeHtml(option.value)}"${option.selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`)
        .join("\n")}
    </select>
  </div>`;
}
function renderAnticipationPhaseOneContent() {
  return `<div class="anticipation-guide-flow anticipation-phase-one">
        <section class="anticipation-phase-note">
          <h3>Phase 1: Pre-reading moral compass</h3>
          <p>Before reading <em>Othello</em>, record your first position on each topic. These answers become your Act 1 baseline, so do not try to guess what Shakespeare will prove yet.</p>
        </section>
        <div class="anticipation-statement-list">
          ${anticipationStatementsForRender.map((statement) => `<section class="anticipation-statement-card" data-anticipation-statement="${statement.id}">
          <h4>${statement.id}. ${escapeHtml(statement.text)}</h4>
          ${renderAnticipationChoiceField("Your initial stance", `othello-anticipation-${statement.id}-pre-rating`)}
          <label class="othello-response-field"><span>Why do you think this before reading?</span><textarea rows="4" data-response-id="othello-anticipation-${statement.id}-pre-reason" placeholder="Explain your reasoning using your current beliefs, experiences, or expectations..."></textarea></label>
        </section>`).join("")}
        </div>
        <section class="othello-task-card">
          <h4>Before you read</h4>
          <label class="othello-response-field"><span>Which statement feels easiest to defend right now?</span><textarea rows="4" data-response-id="othello-anticipation-pre-easiest" placeholder="Name the statement and explain why..."></textarea></label>
          <label class="othello-response-field"><span>Which statement might the play challenge?</span><textarea rows="4" data-response-id="othello-anticipation-pre-challenge" placeholder="Predict where your thinking might shift..."></textarea></label>
        </section>
      </div>`;
}
function buildAnticipationPhaseOneLesson() {
  return {
    id: "key-topics-anticipation-guide",
    title: "Lesson 11: Key Topics Anticipation Guide",
    sequence: 11,
    sourceHref: "#key-topics-anticipation-guide",
    sourceKind: "html",
    text: "Before reading Othello, students record initial positions on friendship, appearance, stereotypes, love, jealousy, ambition, and moral responsibility.",
    contentHtml: renderAnticipationPhaseOneContent(),
    links: [],
    videos: []
  } as Lesson;
}
function renderAnticipationPhaseTwo() {
  return `<section class="anticipation-guide-flow anticipation-phase-two" data-anticipation-phase-two hidden>
        <section class="anticipation-phase-note anticipation-phase-note-post">
          <h3>Post-Reading Reflection</h3>
          <p>Now that you have finished the play, revisit the seven key topics from Lesson 11. Compare your final stance to your Act 1 bias and explain which character, conflict, or event reinforced or changed your view.</p>
        </section>
        <div class="anticipation-statement-list">
          ${anticipationStatementsForRender.map((statement) => `<section class="anticipation-statement-card anticipation-reflection-card" data-anticipation-statement="${statement.id}">
          <div class="anticipation-statement-shell">
          <div class="anticipation-statement-header">
            <div>
              <p class="anticipation-statement-kicker">Statement ${statement.id}</p>
              <h4>${statement.id}. "${escapeHtml(statement.text)}"</h4>
            </div>
            <strong data-anticipation-shift="${statement.id}">No comparison yet</strong>
          </div>
          <div class="anticipation-locked-response">
            <span>Your initial bias (Act 1)</span>
            <p><strong data-anticipation-pre-rating="${statement.id}">Not answered yet</strong></p>
            <p data-anticipation-pre-reason="${statement.id}">Complete Lesson 11 Phase 1 to compare this statement.</p>
          </div>
          <div class="anticipation-phase-two-grid">
            ${renderAnticipationChoiceField("Your new stance (Act 5)", `othello-anticipation-${statement.id}-post-rating`)}
            <label class="othello-response-field">
              <span>Which moment in Othello changed or confirmed your thinking?</span>
              <textarea rows="4" data-response-id="othello-anticipation-${statement.id}-post-reason" data-anticipation-post-reason="${statement.id}" placeholder="Which specific character or event in the play changed your mind?"></textarea>
            </label>
          </div>
          </div>
        </section>`).join("")}
        </div>
        <section class="anticipation-synthesis-card">
          <div class="anticipation-synthesis-copy">
            <h4>Final Synthesis</h4>
            <p>Looking across all seven statements, choose the one belief that evolved the most or was most strongly challenged.</p>
          </div>
          <label class="othello-response-field"><span>Statement number and topic</span><input data-response-id="othello-anticipation-final-statement" placeholder="Example: Statement 6 - jealousy"></label>
          <label class="othello-response-field"><span>How does Shakespeare challenge or confirm that assumption?</span><textarea rows="7" data-response-id="othello-anticipation-final-synthesis" placeholder="In Othello, Shakespeare challenges the assumption that..."></textarea></label>
          <div class="anticipation-synthesis-actions">
            <p data-anticipation-post-status>0 of 7 comparisons complete.</p>
            <button type="button" data-anticipation-print data-anticipation-print-ready hidden><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
          </div>
        </section>
      </section>`;
}

const OTHELLO_LANGUAGE_PAGES = [
  { id: "matchmaker", label: "Vocabulary Match", icon: "swap_horiz" },
  { id: "contractions", label: "Contraction Cracker", icon: "short_text" },
  { id: "pronouns", label: "Pronoun Power", icon: "record_voice_over" },
  { id: "translator", label: "The Translator", icon: "spellcheck" }
] as const;

const OTHELLO_LANGUAGE_MATCHING_PAIRS = [
  { eliz: "Wherefore", mod: "Why" },
  { eliz: "Sirrah", mod: "Boy" },
  { eliz: "Privy", mod: "Informed" },
  { eliz: "Tidings", mod: "News" },
  { eliz: "Anon", mod: "Soon" },
  { eliz: "Dispatch", mod: "Kill" },
  { eliz: "Hark", mod: "Listen" },
  { eliz: "Hie", mod: "Hurry / Go" },
  { eliz: "Thither", mod: "There" },
  { eliz: "Woe", mod: "Misery" },
  { eliz: "Perchance", mod: "Maybe" },
  { eliz: "Fray", mod: "Fight" }
] as const;

const OTHELLO_LANGUAGE_CONTRACTIONS = [
  { eliz: "ne'er", mod: "never" },
  { eliz: "o'er", mod: "over" },
  { eliz: "ta'en", mod: "taken" },
  { eliz: "e'en", mod: "even" },
  { eliz: "ha'", mod: "have" },
  { eliz: "'cause", mod: "because" },
  { eliz: "'fore", mod: "before" },
  { eliz: "whoe'er", mod: "whoever" },
  { eliz: "'midst", mod: "amidst" },
  { eliz: "'tis", mod: "it is" }
] as const;

const OTHELLO_LANGUAGE_PRONOUNS = [
  {
    before: "I give this sword to ",
    after: ".",
    answer: "thee",
    hint: "Object of the sentence: the person receiving the action.",
    options: ["thou", "thee", "thy", "thine"]
  },
  {
    before: "",
    after: " art my most loyal friend.",
    answer: "Thou",
    hint: "Subject of the sentence: the one doing the action.",
    options: ["Thou", "Thee", "Thy", "Thine"]
  },
  {
    before: "Do not forget ",
    after: " honor.",
    answer: "thy",
    hint: "Possessive adjective: it comes right before the noun.",
    options: ["thou", "thee", "thy", "thine"]
  },
  {
    before: "The victory is completely ",
    after: ".",
    answer: "thine",
    hint: "Possessive pronoun: it stands on its own.",
    options: ["thou", "thee", "thy", "thine"]
  },
  {
    before: "Dost ",
    after: " bite thy thumb at us, sir?",
    answer: "thou",
    hint: "Subject form: the person doing the action of biting.",
    options: ["thou", "thee", "thy", "thine"]
  },
  {
    before: "Dost thou bite ",
    after: " thumb at us, sir?",
    answer: "thy",
    hint: "Possessive adjective: it describes whose thumb it is.",
    options: ["thou", "thee", "thy", "thine"]
  },
  {
    before: "I pray ",
    after: ", hear my counsel.",
    answer: "thee",
    hint: "Object form: the person being addressed or appealed to.",
    options: ["thou", "thee", "thy", "thine"]
  }
] as const;

const OTHELLO_LANGUAGE_SENTENCES = [
  {
    original: "Curse you, boy! Why are you my enemy?",
    words: ["Plague", "thee,", "sirrah!", "Wherefore", "art", "thou", "my", "foe?"],
    shuffled: ["sirrah!", "foe?", "Wherefore", "thee,", "my", "art", "Plague", "thou"]
  },
  {
    original: "Yes, I think I am informed of the news to which you provided.",
    words: ["Aye,", "methinks", "I", "am", "privy", "to", "the", "tidings", "whereto", "thou", "wrought."],
    shuffled: ["am", "the", "Aye,", "wrought.", "methinks", "thou", "privy", "tidings", "whereto", "to", "I"]
  },
  {
    original: "I beg you, listen to my advice.",
    words: ["I", "pray", "thee,", "hark", "to", "my", "counsel."],
    shuffled: ["hark", "pray", "my", "I", "counsel.", "thee,", "to"]
  },
  {
    original: "Goodbye, I must hurry there soon.",
    words: ["Adieu,", "I", "must", "hie", "thither", "anon."],
    shuffled: ["hie", "anon.", "Adieu,", "must", "thither", "I"]
  }
] as const;

const OTHELLO_LANGUAGE_MAX_SCORE =
  OTHELLO_LANGUAGE_MATCHING_PAIRS.length +
  OTHELLO_LANGUAGE_CONTRACTIONS.length +
  OTHELLO_LANGUAGE_PRONOUNS.length +
  OTHELLO_LANGUAGE_SENTENCES.length * 2;

const OTHELLO_CLOSE_READING_CATEGORIES = {
  general: ["Characterization", "Important diction", "Metaphor", "Imagery", "Appearance vs. Reality", "Dramatic irony", "Tone", "Foreshadowing", "Question", "Confusion", "Performance / stage direction"],
  manipulation: ["Repetition", "Leading question", "Hesitation", "Dropping hints", "Animalistic imagery", "Appearing honest", "Emotional provocation", "Other persuasive technique"],
  lenses: ["Meaning and content", "Manipulation", "Language"]
} as const;

const OTHELLO_CLOSE_READING_PASSAGES = [
  {
    id: "p1-iago-service",
    moduleTitle: "1. Iago: 'I am not what I am'",
    citationRange: "1.1.41-65",
    lines: [
      { lineId: "1.1.41", lineNumber: "41", speaker: "IAGO", text: "O, sir, content you;" },
      { lineId: "1.1.42", lineNumber: "42", speaker: "", text: "I follow him to serve my turn upon him:" },
      { lineId: "1.1.50", lineNumber: "50", speaker: "", text: "Who, trimm'd in forms and visages of duty," },
      { lineId: "1.1.51", lineNumber: "51", speaker: "", text: "Keep yet their hearts attending on themselves," },
      { lineId: "1.1.58", lineNumber: "58", speaker: "", text: "In following him, I follow but myself;" },
      { lineId: "1.1.64", lineNumber: "64", speaker: "", text: "But I will wear my heart upon my sleeve" },
      { lineId: "1.1.65", lineNumber: "65", speaker: "", text: "For daws to peck at: I am not what I am." }
    ]
  },
  {
    id: "p2-othello-wooing",
    moduleTitle: "2. Othello: How I won her",
    citationRange: "1.3.128-170",
    lines: [
      { lineId: "1.3.128", lineNumber: "128", speaker: "OTHELLO", text: "Her father loved me; oft invited me;" },
      { lineId: "1.3.130", lineNumber: "130", speaker: "", text: "From year to year, the battles, sieges, fortunes," },
      { lineId: "1.3.149", lineNumber: "149", speaker: "", text: "She'ld come again, and with a greedy ear" },
      { lineId: "1.3.150", lineNumber: "150", speaker: "", text: "Devour up my discourse: which I observing," },
      { lineId: "1.3.166", lineNumber: "166", speaker: "", text: "She loved me for the dangers I had pass'd," },
      { lineId: "1.3.167", lineNumber: "167", speaker: "", text: "And I loved her that she did pity them." },
      { lineId: "1.3.168", lineNumber: "168", speaker: "", text: "This only is the witchcraft I have used:" }
    ]
  },
  {
    id: "p3-iago-villain",
    moduleTitle: "3. Iago: 'Play the villain?'",
    citationRange: "2.3.326-352",
    lines: [
      { lineId: "2.3.326", lineNumber: "326", speaker: "IAGO", text: "And what's he then that says I play the villain?" },
      { lineId: "2.3.327", lineNumber: "327", speaker: "", text: "When this advice is free I give and honest," },
      { lineId: "2.3.337", lineNumber: "337", speaker: "", text: "When devils will the blackest sins put on," },
      { lineId: "2.3.338", lineNumber: "338", speaker: "", text: "They do suggest at first with heavenly shows," },
      { lineId: "2.3.346", lineNumber: "346", speaker: "", text: "I'll pour this pestilence into his ear," },
      { lineId: "2.3.351", lineNumber: "351", speaker: "", text: "So will I turn her virtue into pitch," },
      { lineId: "2.3.352", lineNumber: "352", speaker: "", text: "And out of her own goodness make the net that shall enmesh them all." }
    ]
  },
  {
    id: "p4-iago-jealousy",
    moduleTitle: "4. Iago: The Green-Eyed Monster",
    citationRange: "3.3.165-171",
    lines: [
      { lineId: "3.3.165", lineNumber: "165", speaker: "IAGO", text: "O, beware, my lord, of jealousy;" },
      { lineId: "3.3.166", lineNumber: "166", speaker: "", text: "It is the green-eyed monster which doth mock" },
      { lineId: "3.3.167", lineNumber: "167", speaker: "", text: "The meat it feeds on;" },
      { lineId: "3.3.169", lineNumber: "169", speaker: "", text: "But, O, what damned minutes tells he o'er" },
      { lineId: "3.3.170", lineNumber: "170", speaker: "", text: "Who dotes, yet doubts, suspects, yet strongly loves!" }
    ]
  },
  {
    id: "p5-othello-farewell",
    moduleTitle: "5. Othello: 'Farewell the tranquil mind!'",
    citationRange: "3.3.345-357",
    lines: [
      { lineId: "3.3.345", lineNumber: "345", speaker: "OTHELLO", text: "O, now, for ever" },
      { lineId: "3.3.346", lineNumber: "346", speaker: "", text: "Farewell the tranquil mind! farewell content!" },
      { lineId: "3.3.347", lineNumber: "347", speaker: "", text: "Farewell the plumed troop, and the big wars," },
      { lineId: "3.3.348", lineNumber: "348", speaker: "", text: "That make ambition virtue! O, farewell!" },
      { lineId: "3.3.357", lineNumber: "357", speaker: "", text: "Farewell! Othello's occupation's gone!" }
    ]
  },
  {
    id: "p6-othello-ocular",
    moduleTitle: "6. Othello: Demand for Proof",
    citationRange: "3.3.359-363",
    lines: [
      { lineId: "3.3.359", lineNumber: "359", speaker: "OTHELLO", text: "Villain, be sure thou prove my love a whore," },
      { lineId: "3.3.360", lineNumber: "360", speaker: "", text: "Be sure of it; give me the ocular proof:" },
      { lineId: "3.3.361", lineNumber: "361", speaker: "", text: "Or by the worth of man's eternal soul," },
      { lineId: "3.3.362", lineNumber: "362", speaker: "", text: "Thou hadst been better have been born a dog" },
      { lineId: "3.3.363", lineNumber: "363", speaker: "", text: "Than answer my waked wrath!" }
    ]
  },
  {
    id: "p7-emilia-husbands",
    moduleTitle: "7. Emilia: 'Husbands' faults'",
    citationRange: "4.3.86-103",
    lines: [
      { lineId: "4.3.86", lineNumber: "86", speaker: "EMILIA", text: "But I do think it is their husbands' faults" },
      { lineId: "4.3.87", lineNumber: "87", speaker: "", text: "If wives do fall: say that they slack their duties," },
      { lineId: "4.3.89", lineNumber: "89", speaker: "", text: "Or else break out in peevish jealousies," },
      { lineId: "4.3.93", lineNumber: "93", speaker: "", text: "Why, we have galls, and though we have some grace," },
      { lineId: "4.3.95", lineNumber: "95", speaker: "", text: "Their wives have sense like them: they see and smell" },
      { lineId: "4.3.103", lineNumber: "103", speaker: "", text: "The ills we do, their ills instruct us so." }
    ]
  },
  {
    id: "p8-othello-cause",
    moduleTitle: "8. Othello: 'It is the cause'",
    citationRange: "5.2.1-22",
    lines: [
      { lineId: "5.2.1", lineNumber: "1", speaker: "OTHELLO", text: "It is the cause, it is the cause, my soul,--" },
      { lineId: "5.2.3", lineNumber: "3", speaker: "", text: "It is the cause. Yet I'll not shed her blood," },
      { lineId: "5.2.4", lineNumber: "4", speaker: "", text: "Nor scar that whiter skin of hers than snow," },
      { lineId: "5.2.5", lineNumber: "5", speaker: "", text: "And smooth as monumental alabaster." },
      { lineId: "5.2.6", lineNumber: "6", speaker: "", text: "Yet she must die, else she'll betray more men." },
      { lineId: "5.2.7", lineNumber: "7", speaker: "", text: "Put out the light, and then put out the light:" }
    ]
  },
  {
    id: "p9-emilia-speak",
    moduleTitle: "9. Emilia: 'I will speak'",
    citationRange: "5.2.219-225",
    lines: [
      { lineId: "5.2.219", lineNumber: "219", speaker: "EMILIA", text: "I will not charm my tongue; I am bound to speak:" },
      { lineId: "5.2.220", lineNumber: "220", speaker: "", text: "My mistress here lies murder'd in her bed,--" },
      { lineId: "5.2.222", lineNumber: "222", speaker: "", text: "And your reports have set the murder on." },
      { lineId: "5.2.223", lineNumber: "223", speaker: "OTHELLO", text: "Nay, stare not, masters: it is true, indeed." },
      { lineId: "5.2.225", lineNumber: "225", speaker: "IAGO", text: "What, are you mad? I charge you, get you home." }
    ]
  },
  {
    id: "p10-othello-speak",
    moduleTitle: "10. Othello: 'Speak of me as I am'",
    citationRange: "5.2.338-352",
    lines: [
      { lineId: "5.2.338", lineNumber: "338", speaker: "OTHELLO", text: "Soft you; a word or two before you go." },
      { lineId: "5.2.342", lineNumber: "342", speaker: "", text: "Speak of me as I am; nothing extenuate," },
      { lineId: "5.2.344", lineNumber: "344", speaker: "", text: "Of one that loved not wisely but too well;" },
      { lineId: "5.2.345", lineNumber: "345", speaker: "", text: "Of one not easily jealous, but being wrought" },
      { lineId: "5.2.347", lineNumber: "347", speaker: "", text: "Like the base Indian, threw a pearl away" },
      { lineId: "5.2.348", lineNumber: "348", speaker: "", text: "Richer than all his tribe..." }
    ]
  }
] as const;

function renderOthelloLanguageTranslatorActivity() {
  return `<section class="othello-language-shell" data-othello-language-root>
    <div class="othello-language-toolbar">
      <div class="othello-language-nav">
        ${renderOverlaySelect({
          id: "othello-language-page-select",
          nativeDataAttr: 'data-othello-language-page-select aria-label="Choose a Shakespeare language activity"',
          options: OTHELLO_LANGUAGE_PAGES.map((page, index) => ({
            value: page.id,
            label: page.label,
            selected: index === 0
          }))
        })}
      </div>
      <section class="othello-language-scorecard" aria-live="polite">
        <span>Fluency score</span>
        <strong data-othello-language-score>0 / ${OTHELLO_LANGUAGE_MAX_SCORE}</strong>
        <div class="othello-language-progress"><div data-othello-language-progress></div></div>
        <p data-othello-language-progress-note>Complete each section to build vocabulary, grammar, and translation fluency.</p>
      </section>
    </div>

    <section class="othello-language-page" data-othello-language-page="matchmaker">
      <div class="othello-language-page-head">
        <h4>Vocabulary Matchmaker</h4>
        <p>Select an Elizabethan word on the left, then match it to the correct modern meaning on the right.</p>
      </div>
      <div class="othello-language-status" data-othello-language-match-status>0 of ${OTHELLO_LANGUAGE_MATCHING_PAIRS.length} pairs matched.</div>
      <div class="othello-language-match-grid">
        <section class="othello-language-choice-column">
          <div class="othello-language-column-label">Elizabethan</div>
          <div class="othello-language-choice-list" data-othello-language-eliz-list></div>
        </section>
        <section class="othello-language-choice-column">
          <div class="othello-language-column-label">Modern meaning</div>
          <div class="othello-language-choice-list" data-othello-language-mod-list></div>
        </section>
      </div>
    </section>

    <section class="othello-language-page" data-othello-language-page="contractions" hidden>
      <div class="othello-language-page-head">
        <h4>Contraction Cracker</h4>
        <p>Fill in the full modern word or phrase for each shortened Shakespearean contraction.</p>
      </div>
      <div class="othello-language-contraction-grid">
        ${OTHELLO_LANGUAGE_CONTRACTIONS.map((item, index) => `<div class="othello-language-contraction-card" data-othello-language-contraction-card="${index}">
          <div class="othello-language-contraction-head">
            <strong>${escapeHtml(item.eliz)}</strong>
            <span>equals</span>
          </div>
          <div class="othello-language-input-wrap">
            <input type="text" data-othello-language-contraction-input="${index}" placeholder="Type the full word or phrase">
            <span class="material-symbols-outlined othello-language-inline-icon" data-othello-language-contraction-icon="${index}" hidden>check_circle</span>
          </div>
          <small data-othello-language-contraction-feedback="${index}">Type the full modern meaning.</small>
        </div>`).join("")}
      </div>
    </section>

    <section class="othello-language-page" data-othello-language-page="pronouns" hidden>
      <div class="othello-language-page-head">
        <h4>Pronoun Power</h4>
        <p>Choose the correct Elizabethan form of <em>you</em> by thinking about subject, object, and possession.</p>
      </div>
      <div class="othello-language-pronoun-grid">
        ${OTHELLO_LANGUAGE_PRONOUNS.map((item, index) => `<article class="othello-language-pronoun-card" data-othello-language-pronoun-card="${index}">
          <p>${escapeHtml(item.before)}<select data-othello-language-pronoun-input="${index}">
            <option value="">Select...</option>
            ${item.options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
          </select>${escapeHtml(item.after)}</p>
          <small data-othello-language-pronoun-feedback="${index}">${escapeHtml(item.hint)}</small>
        </article>`).join("")}
      </div>
    </section>

    <section class="othello-language-page" data-othello-language-page="translator" hidden>
      <div class="othello-language-page-head">
        <h4>The Translator</h4>
        <p>Click the words in the bank to rebuild each modern sentence in an Elizabethan-style word order.</p>
      </div>
      <div class="othello-language-sentence-list">
        ${OTHELLO_LANGUAGE_SENTENCES.map((sentence, index) => `<article class="othello-language-sentence-card" data-othello-language-sentence-card="${index}">
          <div class="othello-language-sentence-prompt">
            <span>Modern English</span>
            <p>"${escapeHtml(sentence.original)}"</p>
          </div>
          <div class="othello-language-sentence-build">
            <span>Your translation</span>
            <div class="othello-language-built-area" data-othello-language-built-area="${index}"></div>
          </div>
          <div class="othello-language-sentence-bank">
            <span>Word bank</span>
            <div class="othello-language-word-bank" data-othello-language-word-bank="${index}"></div>
          </div>
          <div class="othello-language-sentence-actions">
            <button type="button" data-othello-language-check="${index}">Check translation</button>
            <p data-othello-language-sentence-status="${index}">Build the sentence, then check your translation.</p>
          </div>
        </article>`).join("")}
      </div>
    </section>
  </section>`;
}

function renderOthelloCloseReadingLabActivity() {
  const passageOptions = OTHELLO_CLOSE_READING_PASSAGES.map((passage, index) => `<option value="${escapeHtml(passage.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(passage.moduleTitle)}</option>`).join("");
  const filterOptions = [
    `<option value="All">All categories</option>`,
    ...OTHELLO_CLOSE_READING_CATEGORIES.lenses.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`),
    ...OTHELLO_CLOSE_READING_CATEGORIES.general.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`),
    ...OTHELLO_CLOSE_READING_CATEGORIES.manipulation.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)
  ].join("");
  return `<section class="othello-close-reading-shell" data-othello-close-reading-root>
    <section class="othello-task-card othello-close-reading-summary">
      <div>
        <h4>Master close-reading lab</h4>
        <p>Annotate the play across ten high-leverage passages, then turn those notes into analysis tasks and a final synthesis response.</p>
      </div>
      <div class="othello-close-reading-summary-grid">
        <div class="othello-close-reading-summary-box">
          <span>Passages</span>
          <strong>10</strong>
          <p>Build your evidence library scene by scene.</p>
        </div>
        <div class="othello-close-reading-summary-box">
          <span>Analysis tasks</span>
          <strong>3</strong>
          <p>Hashtag summary, revealing words, and technique analysis.</p>
        </div>
        <div class="othello-close-reading-summary-box">
          <span>Progress</span>
          <strong data-close-reading-progress-percent>0%</strong>
          <p data-close-reading-progress-copy>0 of 3 requirements complete.</p>
        </div>
      </div>
    </section>

    <section class="othello-close-reading-browser">
      <div class="othello-close-reading-toolbar">
        <label class="othello-response-field">
          <span>Choose a passage</span>
          <select data-close-reading-passage-select>${passageOptions}</select>
        </label>
        <div class="othello-close-reading-toolbar-actions">
          <button type="button" data-close-reading-font="decrease">A-</button>
          <button type="button" data-close-reading-font="increase">A+</button>
          <label><input type="checkbox" data-close-reading-toggle-lines checked> <span>Show line numbers</span></label>
          <button type="button" data-close-reading-toggle-fallback>Select by lines</button>
        </div>
      </div>
      <div class="othello-close-reading-fallback" data-close-reading-fallback hidden>
        <label class="othello-response-field"><span>Start line</span><select data-close-reading-fallback-start></select></label>
        <label class="othello-response-field"><span>End line</span><select data-close-reading-fallback-end></select></label>
        <button type="button" data-close-reading-create-fallback>Create annotation</button>
      </div>
      <div class="othello-close-reading-layout">
        <article class="othello-close-reading-passage">
          <div class="othello-close-reading-passage-head">
            <div>
              <p data-close-reading-passage-title>Passage title</p>
              <h4 data-close-reading-passage-range>Act / scene</h4>
            </div>
            <p data-close-reading-passage-instruction>Select text directly in the passage to open a new annotation.</p>
          </div>
          <div class="othello-close-reading-passage-text" data-close-reading-passage-text></div>
        </article>

        <aside class="othello-close-reading-sidebar">
          <div class="othello-close-reading-sidebar-head">
            <div>
              <h4>Current passage annotations</h4>
              <p data-close-reading-annotation-count>0 notes in this passage.</p>
            </div>
            <label class="othello-response-field">
              <span>Filter</span>
              <select data-close-reading-filter>${filterOptions}</select>
            </label>
          </div>
          <div class="othello-close-reading-annotation-list" data-close-reading-annotation-list></div>
        </aside>
      </div>
    </section>

    <section class="othello-task-card othello-close-reading-analysis">
      <div class="othello-close-reading-analysis-head">
        <div>
          <h4>Analysis tasks</h4>
          <p>Choose one annotation from your evidence library, then deepen it into interpretation.</p>
        </div>
        <label class="othello-response-field">
          <span>Select an annotation to analyze</span>
          <select data-close-reading-analysis-select><option value="">Choose from your annotations...</option></select>
        </label>
      </div>
      <div data-close-reading-selected-reference></div>
      <div data-close-reading-analysis-body></div>
    </section>

    <section class="othello-task-card othello-close-reading-synthesis">
      <h4>Final close-reading synthesis</h4>
      <p>Based on your close reading of these passages, explain how language is used to construct and destroy reality in <em>Othello</em>.</p>
      <div class="othello-close-reading-evidence-bank" data-close-reading-evidence-bank></div>
      <label class="othello-response-field">
        <span>Synthesis response</span>
        <textarea rows="10" data-close-reading-final-response placeholder="Write a 150+ word synthesis that pulls evidence from your annotations and analysis tasks."></textarea>
      </label>
      <div class="othello-close-reading-synthesis-meta">
        <p>Target: at least 150 words and evidence drawn from your close reading above.</p>
        <strong data-close-reading-word-count>0 words</strong>
      </div>
    </section>

    <div class="othello-close-reading-modal" data-close-reading-modal hidden></div>
  </section>`;
}

const OTHELLO_THEME_TOPICS = [
  "Jealousy",
  "Honesty and trust",
  "Prejudice and bias",
  "Appearance and reality"
] as const;

const OTHELLO_THEME_SORT_CARDS = [
  { id: "topic-1", text: "Jealousy", answer: "topic" },
  { id: "topic-2", text: "Honesty and trust", answer: "topic" },
  { id: "topic-3", text: "Prejudice and bias", answer: "topic" },
  { id: "topic-4", text: "Appearance and reality", answer: "topic" },
  { id: "theme-1", text: "Jealousy can cause suspicion to feel more convincing than evidence.", answer: "theme" },
  { id: "theme-2", text: "A reputation for honesty can become a powerful instrument of deception.", answer: "theme" },
  { id: "theme-3", text: "Prejudice influences which accusations people are willing to believe.", answer: "theme" },
  { id: "theme-4", text: "When appearances are trusted more than evidence, manipulation becomes easier.", answer: "theme" }
] as const;

const OTHELLO_THEME_DIAGNOSTICS = [
  {
    weak: "Jealousy",
    issue: "Only a topic",
    strong: "In Othello, jealousy destroys reasoning, making the victim believe fabrications over facts."
  },
  {
    weak: "Jealousy is bad.",
    issue: "Too vague",
    strong: "Unchecked jealousy can distort reality, leading individuals to destroy the very relationships they value."
  },
  {
    weak: "Othello becomes jealous and kills Desdemona.",
    issue: "Plot summary",
    strong: "When suspicion is planted, even the most noble individuals can lose their capacity for rational judgment."
  },
  {
    weak: "Everyone who becomes jealous will destroy their life.",
    issue: "Unsupported absolute statement",
    strong: "Jealousy makes individuals vulnerable to manipulation by exploiting their deepest insecurities."
  }
] as const;

const OTHELLO_THEME_DIAGNOSTIC_ISSUES = [
  "Only a topic",
  "Too vague",
  "Plot summary",
  "Empty wording",
  "Unsupported absolute statement"
] as const;

type OthelloThemeBuilderVariant = "pathway" | "editorial" | "workshop" | "notebook";

function renderOthelloThemeBuilderSection(config: {
  variant: OthelloThemeBuilderVariant;
  step: string;
  title: string;
  description: string;
  body: string;
  actions?: string;
  status?: string;
  extraClass?: string;
}) {
  return `<section class="othello-task-card othello-theme-section othello-theme-section--${config.variant}${config.extraClass ? ` ${config.extraClass}` : ""}">
    <div class="othello-theme-section-head">
      <div>
        <p class="othello-theme-step">${escapeHtml(config.step)}</p>
        <h4>${escapeHtml(config.title)}</h4>
        <p>${escapeHtml(config.description)}</p>
      </div>
      ${config.status ? `<div class="othello-theme-pill">${config.status}</div>` : ""}
      ${config.actions ? `<div class="othello-theme-actions">${config.actions}</div>` : ""}
    </div>
    ${config.body}
  </section>`;
}

function renderOthelloThemeBuilderSummary(variant: OthelloThemeBuilderVariant) {
  if (variant === "workshop") {
    return `<section class="othello-task-card othello-theme-summary othello-theme-summary--workshop">
      <div class="othello-theme-summary-copy">
        <p class="othello-theme-step">Creative route</p>
        <h4>Workshop board</h4>
        <p>Move through the same builder as if you are pinning ideas, testing claims, and clustering evidence on a live workshop wall.</p>
      </div>
      <div class="othello-theme-summary-grid">
        <div class="othello-theme-summary-box">
          <span>Core topics</span>
          <strong>4</strong>
          <p>Generate a few possible directions before you commit.</p>
        </div>
        <div class="othello-theme-summary-box">
          <span>Evidence target</span>
          <strong>4</strong>
          <p>Pull quotations from at least three acts to widen the reading.</p>
        </div>
        <div class="othello-theme-summary-box">
          <span>Pattern groups</span>
          <strong>2</strong>
          <p>Spot repeated moves, turning points, or rising pressure.</p>
        </div>
        <div class="othello-theme-summary-box">
          <span>Progress</span>
          <strong data-theme-progress-percent>0%</strong>
          <p data-theme-progress-copy>0 of 8 builder goals complete.</p>
        </div>
      </div>
    </section>`;
  }
  if (variant === "notebook") {
    return `<section class="othello-task-card othello-theme-summary othello-theme-summary--notebook">
      <div class="othello-theme-summary-copy">
        <p class="othello-theme-step">Writer's notebook</p>
        <h4>From topic to theme</h4>
        <p>This version softens the task into a more literary drafting surface: test language, save revisions, and build a claim that feels written rather than filled out.</p>
      </div>
      <div class="othello-theme-summary-grid">
        <div class="othello-theme-summary-box">
          <span>Draft paths</span>
          <strong>4</strong>
          <p>Start with four possible ideas and let one deepen.</p>
        </div>
        <div class="othello-theme-summary-box">
          <span>Evidence bank</span>
          <strong>4</strong>
          <p>Collect moments that can actually carry interpretation.</p>
        </div>
        <div class="othello-theme-summary-box">
          <span>Revision trail</span>
          <strong>2+</strong>
          <p>Track how your wording sharpens from draft to final claim.</p>
        </div>
        <div class="othello-theme-summary-box">
          <span>Progress</span>
          <strong data-theme-progress-percent>0%</strong>
          <p data-theme-progress-copy>0 of 8 builder goals complete.</p>
        </div>
      </div>
    </section>`;
  }
  return `<section class="othello-task-card othello-theme-summary othello-theme-summary--editorial">
    <div class="othello-theme-summary-copy">
      <p class="othello-theme-step">Editorial studio</p>
      <h4>Build one argument with real flow</h4>
      <p>Instead of moving box by box, use this version as a continuous drafting studio: sort, test, select, gather, and refine until the paragraph reads as one deliberate interpretation.</p>
    </div>
    <div class="othello-theme-summary-grid">
      <div class="othello-theme-summary-box">
        <span>Core topics</span>
        <strong>4</strong>
        <p>Draft one claim for each before choosing your strongest path.</p>
      </div>
      <div class="othello-theme-summary-box">
        <span>Evidence target</span>
        <strong>4</strong>
        <p>Gather evidence across at least three acts.</p>
      </div>
      <div class="othello-theme-summary-box">
        <span>Pattern groups</span>
        <strong>2</strong>
        <p>Connect evidence into developments, repetitions, or contrasts.</p>
      </div>
      <div class="othello-theme-summary-box">
        <span>Progress</span>
        <strong data-theme-progress-percent>0%</strong>
        <p data-theme-progress-copy>0 of 8 builder goals complete.</p>
      </div>
    </div>
  </section>`;
}

function renderOthelloThemeBuilderActivity(variant: OthelloThemeBuilderVariant) {
  const sortSection = renderOthelloThemeBuilderSection({
    variant,
    step: "Step 1",
    title: "Topic vs. theme sort",
    description: "Sort each card to show whether it is only a topic or a full arguable theme statement.",
    status: `<span data-theme-sort-status>0 of 8 placed</span>`,
    body: `<div data-theme-sort-board></div>`
  });
  const diagnosticSection = renderOthelloThemeBuilderSection({
    variant,
    step: "Step 2",
    title: "Theme diagnostic",
    description: "Identify the main weakness in each weak draft, then use the stronger model as a guide.",
    body: `<div data-theme-diagnostic-board></div>`
  });
  const draftsSection = renderOthelloThemeBuilderSection({
    variant,
    step: "Step 3",
    title: "Quick theme drafts",
    description: "Draft one possible theme statement for each major topic before choosing your deep-dive focus.",
    body: `<div data-theme-drafts-board></div>`
  });
  const topicSection = renderOthelloThemeBuilderSection({
    variant,
    step: "Step 4",
    title: "Choose your strongest topic",
    description: "Select the topic that gives you the best opportunity for a complex, evidence-based interpretation.",
    body: `<div data-theme-topic-focus></div>`
  });
  const evidenceSection = renderOthelloThemeBuilderSection({
    variant,
    step: "Step 5",
    title: "Evidence bank",
    description: "Collect quotations, context, and analysis connected to your chosen topic.",
    actions: `<button type="button" data-theme-add-evidence>Add evidence</button>`,
    body: `<div data-theme-evidence-board></div>`
  });
  const patternSection = renderOthelloThemeBuilderSection({
    variant,
    step: "Step 6",
    title: "Pattern groups",
    description: "Group your quotations into meaningful patterns that show development, repetition, or contrast.",
    actions: `<button type="button" data-theme-add-pattern>New pattern group</button>`,
    body: `<div data-theme-pattern-board></div>`
  });
  const finalSection = renderOthelloThemeBuilderSection({
    variant,
    step: "Step 7",
    title: "Refine the final theme statement",
    description: "Turn your topic and patterns into a polished, arguable statement about human behaviour.",
    actions: `<button type="button" data-theme-commit-final>Commit final theme</button>`,
    body: `<div data-theme-final-board></div>`
  });
  const responseSection = renderOthelloThemeBuilderSection({
    variant,
    step: "Step 8",
    title: "Assemble the analytical paragraph",
    description: "Build your response in parts, then combine it into one polished paragraph.",
    actions: `<button type="button" data-theme-assemble-response>Assemble paragraph</button>`,
    body: `<div data-theme-response-board></div>`
  });

  if (variant === "pathway") {
    const stageOptions = [
      { value: "sort", label: "Step 1: Sort ideas", selected: true },
      { value: "diagnostic", label: "Step 2: Test claims" },
      { value: "drafts", label: "Step 3: Draft options" },
      { value: "topic", label: "Step 4: Choose focus" },
      { value: "evidence", label: "Step 5: Gather proof" },
      { value: "patterns", label: "Step 6: Find movement" },
      { value: "final", label: "Step 7: Shape theme" },
      { value: "response", label: "Step 8: Write it" }
    ];
    return `<section class="othello-theme-shell othello-theme-shell--pathway" data-othello-theme-root data-theme-variant="pathway">
      <section class="othello-theme-pathway-brief">
        <div>
          <h4>Build the argument one move at a time</h4>
          <p>Use the path to move from raw idea to finished paragraph. Only the current work surface stays open, so the builder feels like a sequence instead of a worksheet pile.</p>
        </div>
        <div class="othello-theme-pathway-progress">
          <strong data-theme-progress-percent>0%</strong>
          <span data-theme-progress-copy>0 of 8 builder goals complete.</span>
        </div>
      </section>
      <div class="othello-theme-stage-picker">
        <label>Current builder move</label>
        ${renderOverlaySelect({ id: "othello-theme-stage-select", nativeDataAttr: "data-theme-stage-select", options: stageOptions })}
      </div>
      <div class="othello-theme-pathway-stage">
        <div data-theme-stage-panel="sort">${sortSection}</div>
        <div data-theme-stage-panel="diagnostic" hidden>${diagnosticSection}</div>
        <div data-theme-stage-panel="drafts" hidden>${draftsSection}</div>
        <div data-theme-stage-panel="topic" hidden>${topicSection}</div>
        <div data-theme-stage-panel="evidence" hidden>${evidenceSection}</div>
        <div data-theme-stage-panel="patterns" hidden>${patternSection}</div>
        <div data-theme-stage-panel="final" hidden>${finalSection}</div>
        <div data-theme-stage-panel="response" hidden>${responseSection}</div>
      </div>
    </section>`;
  }

  if (variant === "workshop") {
    return `<section class="othello-theme-shell othello-theme-shell--workshop" data-othello-theme-root data-theme-variant="workshop">
      ${renderOthelloThemeBuilderSummary("workshop")}
      <div class="othello-theme-variant-grid othello-theme-variant-grid--pair">
        ${sortSection}
        ${diagnosticSection}
      </div>
      <div class="othello-theme-variant-grid othello-theme-variant-grid--pair">
        ${draftsSection}
        ${topicSection}
      </div>
      ${evidenceSection}
      <div class="othello-theme-variant-grid othello-theme-variant-grid--pair">
        ${patternSection}
        ${finalSection}
      </div>
      ${responseSection}
    </section>`;
  }

  if (variant === "notebook") {
    return `<section class="othello-theme-shell othello-theme-shell--notebook" data-othello-theme-root data-theme-variant="notebook">
      ${renderOthelloThemeBuilderSummary("notebook")}
      <div class="othello-theme-notebook-stack">
        ${sortSection}
        ${diagnosticSection}
        ${draftsSection}
        ${topicSection}
        ${evidenceSection}
        ${patternSection}
        ${finalSection}
        ${responseSection}
      </div>
    </section>`;
  }

  return `<section class="othello-theme-shell othello-theme-shell--editorial" data-othello-theme-root data-theme-variant="editorial">
    ${renderOthelloThemeBuilderSummary("editorial")}
    <div class="othello-theme-editorial-flow">
      ${sortSection}
      ${diagnosticSection}
      <div class="othello-theme-variant-grid othello-theme-variant-grid--editorial">
        ${draftsSection}
        ${topicSection}
      </div>
      ${evidenceSection}
      <div class="othello-theme-variant-grid othello-theme-variant-grid--editorial">
        ${patternSection}
        ${finalSection}
      </div>
      ${responseSection}
    </div>
  </section>`;
}

function renderWritingStudio(stories: WritingWorksheetStory[]) {
  const assignmentOptions = [
    { value: "language-translator", label: "Shakespeare Language Translator", selected: true },
    { value: "annotation-lab", label: "Close Reading Annotation Lab" },
    { value: "theme-builder-pathway", label: "Theme Builder: Argument Path" }
  ];
  return `<div class="worksheet-studio othello-writing-studio">
    <section class="othello-assignment-shell" data-othello-writing-studio>
      <div class="othello-assignment-picker">
        <div class="othello-assignment-picker-copy">
          <label>Choose a workbook activity</label>
          <p>Switch between quick language practice, close reading, evidence tracking, and paragraph-building tools. Your draft responses stay in this browser.</p>
        </div>
        ${renderOverlaySelect({ id: "othello-assignment-select", nativeDataAttr: "data-othello-assignment-select", options: assignmentOptions })}
      </div>

      <article class="othello-assignment-panel" data-othello-assignment-panel="language-translator">
        <header class="othello-assignment-header">
          <h3>Shakespeare Language Translator</h3>
          <p>Use the workbook language practice to translate Elizabethan words, notice contractions, and explain how pronouns shape relationships on stage.</p>
        </header>
        <div class="othello-assignment-body">
          ${renderOthelloLanguageTranslatorActivity()}
        </div>
      </article>

      <article class="othello-assignment-panel" data-othello-assignment-panel="annotation-lab" hidden>
        <header class="othello-assignment-header">
          <h3>Close Reading Annotation Lab</h3>
          <p>Annotate the play across key passages, build an evidence library, and turn those annotations into full analytical writing.</p>
        </header>
        <div class="othello-assignment-body">
          ${renderOthelloCloseReadingLabActivity()}
        </div>
      </article>

      <article class="othello-assignment-panel" data-othello-assignment-panel="theme-builder-pathway" hidden>
        <header class="othello-assignment-header">
          <h3>Theme Builder: Argument Path</h3>
          <p>A focused interactive route that opens one move at a time, guiding students from topic sorting to a finished analytical paragraph.</p>
        </header>
        <div class="othello-assignment-body">
          ${renderOthelloThemeBuilderActivity("pathway")}
        </div>
      </article>

      <section class="othello-task-card othello-export-card">
        <h4>Print your draft</h4>
        <p>Everything saves locally in this browser. Use this button to open a polished print layout and save your current Writing Studio work as a PDF.</p>
        <div class="othello-action-row"><button type="button" data-othello-print-writing><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button></div>
      </section>
    </section>
  </div>`;
}

const CHARACTER_DOSSIER_CHARACTERS = ["Othello", "Iago", "Desdemona", "Emilia", "Cassio"] as const;
const CHARACTER_DOSSIER_ACTS = ["Act 1", "Act 2", "Act 3", "Act 4", "Act 5"] as const;
const CHARACTER_DOSSIER_ACCENTS: Record<(typeof CHARACTER_DOSSIER_CHARACTERS)[number], string> = {
  Othello: "#2d5b4f",
  Iago: "#6a4a36",
  Desdemona: "#7b6a4c",
  Emilia: "#6d5263",
  Cassio: "#4e667b",
};

function characterDossierHexToRgbCsv(hex: string) {
  const cleaned = hex.replace("#", "").trim();
  if (!/^[0-9a-f]{6}$/i.test(cleaned)) return "45, 91, 79";
  const red = Number.parseInt(cleaned.slice(0, 2), 16);
  const green = Number.parseInt(cleaned.slice(2, 4), 16);
  const blue = Number.parseInt(cleaned.slice(4, 6), 16);
  return `${red}, ${green}, ${blue}`;
}

function renderCharacterNotesStudio() {
  const defaultCharacter = CHARACTER_DOSSIER_CHARACTERS[0];
  const defaultColor = CHARACTER_DOSSIER_ACCENTS[defaultCharacter];
  const defaultColorRgb = characterDossierHexToRgbCsv(defaultColor);

  return `<div class="character-dossier-studio" data-character-dossier-studio data-active-character-dossier="${escapeHtml(defaultCharacter)}" style="--character-accent: ${escapeHtml(defaultColor)}; --character-accent-rgb: ${escapeHtml(defaultColorRgb)};">
    <div class="character-dossier-shell">
      <aside class="character-dossier-nav" aria-label="Choose a character dossier">
        <div class="character-dossier-nav-copy">
          <h3>Character Dossiers</h3>
          <p>Build evidence-rich profiles for each major character. Everything saves locally in this browser.</p>
        </div>
        <div class="character-dossier-nav-list">
          ${CHARACTER_DOSSIER_CHARACTERS.map((character, index) => `<button type="button" class="character-dossier-target${index === 0 ? " active" : ""}" data-character-dossier-target="${escapeHtml(character)}" aria-pressed="${index === 0 ? "true" : "false"}">
            <div class="character-dossier-target-copy">
              <strong>${escapeHtml(character)}</strong>
              <span data-character-dossier-progress-for="${escapeHtml(character)}">0% complete</span>
            </div>
            <div class="character-dossier-target-meter" aria-hidden="true"><div data-character-dossier-progress-bar="${escapeHtml(character)}" style="width:0%"></div></div>
          </button>`).join("\n")}
        </div>
        <div class="character-dossier-nav-actions">
          <button type="button" data-character-dossier-print>Print / PDF</button>
          <button type="button" class="is-secondary" data-character-dossier-reset>Reset dossier data</button>
        </div>
      </aside>

      <article class="worksheet-document character-dossier-document">
        <header class="worksheet-document-header character-dossier-heading">
          <div class="character-dossier-heading-copy">
            <p>ELA 30-1 Character Study</p>
            <h3 data-character-dossier-title>${escapeHtml(defaultCharacter)}</h3>
            <span data-character-dossier-subtitle>Track first impressions, public image, tragic flaw, thematic function, and textual evidence for this character.</span>
          </div>
          <div class="character-dossier-heading-tools">
            <label class="character-dossier-color-control">
              <span>Aura / theme</span>
              <div>
                <input type="color" value="${escapeHtml(defaultColor)}" data-character-dossier-field="color" aria-label="Choose a color for the active character dossier">
                <strong data-character-dossier-color-value>${escapeHtml(defaultColor.toUpperCase())}</strong>
              </div>
            </label>
            <div class="character-dossier-progress-badge">
              <strong data-character-dossier-progress-value>0%</strong>
              <span>complete</span>
            </div>
          </div>
        </header>
        <div class="character-dossier-body" data-character-dossier-body></div>
      </article>
    </div>
  </div>`;
}

function renderShortStoryQuestions(stories: WritingWorksheetStory[]) {
  const defaultStory = stories[0]?.id ?? "";
  const pickerOptions = [
    ...stories.map((story, index) => ({ value: story.id, label: story.title, selected: index === 0 })),
    { value: "othello-phase-2-anticipation-reflection", label: "Phase 2: Key Topics Anticipation Guide", selected: false }
  ];
  const defaultLabel = pickerOptions.find((option) => option.selected)?.label ?? pickerOptions[0]?.label ?? "Choose...";
  return `<div class="worksheet-studio story-questions-studio" data-worksheet-studio data-default-worksheet-story="${escapeHtml(defaultStory)}">
    <section class="story-question-selector">
      <div class="story-question-selector-label">Choose an act or reflection</div>
      <div class="story-question-picker" data-worksheet-picker-shell>
        <button
          id="story-question-trigger"
          class="story-question-trigger"
          type="button"
          data-worksheet-select-trigger
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-controls="story-question-options"
        >
          <span data-worksheet-select-label>${escapeHtml(defaultLabel)}</span>
          <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
        </button>
        <div id="story-question-options" class="story-question-options" data-worksheet-select-options role="listbox" hidden>
          ${pickerOptions
            .map((option) => `<button
              type="button"
              class="story-question-option${option.selected ? " is-active" : ""}"
              data-worksheet-option="${escapeHtml(option.value)}"
              role="option"
              aria-selected="${option.selected ? "true" : "false"}"
            >${escapeHtml(option.label)}</button>`)
            .join("\n")}
        </div>
        <select id="story-question-select" class="story-question-native-select" data-worksheet-select aria-hidden="true" tabindex="-1">
          ${pickerOptions
            .map((option) => `<option value="${escapeHtml(option.value)}"${option.selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`)
            .join("\n")}
        </select>
      </div>
    </section>
    <section class="scene-checkpoint-shell" data-scene-checkpoints hidden>
      <article class="worksheet-document scene-checkpoint-document">
        <header class="worksheet-document-header scene-checkpoint-heading">
          <div>
            <p>ELA 30-1 Critical Analysis</p>
            <h3 data-scene-checkpoint-title>Scene Checkpoints</h3>
            <span data-scene-checkpoint-summary>Use the same checkpoint routine for each scene in this act: summarize, track a key quote, answer character and language questions, collect evidence, name the mood, and go deeper.</span>
          </div>
          <strong class="scene-checkpoint-count" data-scene-checkpoint-count>0 scenes</strong>
        </header>
        <div class="scene-checkpoint-body">
          <div class="scene-checkpoint-list" data-scene-checkpoint-list></div>
        </div>
      </article>
    </section>
    <section class="worksheet-panel anticipation-phase-two-panel" data-anticipation-phase-two-panel hidden>
      <article class="worksheet-document">
        <header class="worksheet-document-header anticipation-phase-two-heading">
          <p>ELA 30-1 | Key Topics Anticipation Guide</p>
          <h3>Phase 2: Key Topics Anticipation Guide</h3>
          <span>Post-reading reflection after Act 5</span>
          <div class="worksheet-progress">
            <div><span>Post-Reading Progress</span><strong data-anticipation-post-progress-label>0 of 7 answered</strong></div>
            <div class="worksheet-progress-track"><div data-anticipation-post-progress-fill></div></div>
          </div>
        </header>
        ${renderAnticipationPhaseTwo()}
      </article>
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
        <div class="worksheet-footer-actions">
          <button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
        </div>
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

async function copyLocalFilmItems(workspaceDir: string): Promise<SourceVideo[]> {
  const filmDir = path.join(workspaceDir, "assets", "film-room");
  await mkdir(filmDir, { recursive: true });

  const videos: SourceVideo[] = [];
  for (const source of LOCAL_FILM_SOURCES) {
    await copyFile(source.sourcePath, path.join(filmDir, source.fileName));
    videos.push({
      id: source.id,
      title: source.title,
      embedSrc: `assets/film-room/${source.fileName}`,
      originalSrc: source.sourcePath,
      origin: "local",
    });
  }
  return videos;
}

async function copyStoryBankItems(workspaceDir: string) {
  const storyBankDir = path.join(workspaceDir, "assets", "story-bank");
  await mkdir(storyBankDir, { recursive: true });
  const items: StoryBankItem[] = [];
  for (const source of STORY_BANK_SOURCES) {
    if (source.kind === "pdf") {
      const sourcePath = path.join(STORY_BANK_SOURCE_DIR, source.fileName);
      const fileName = toSafeFileName(`${source.title}.pdf`);
      const workspaceHref = `assets/story-bank/${fileName}`;
      await copyFile(sourcePath, path.join(workspaceDir, workspaceHref));
      items.push({
        id: toSafeId(source.title, "story"),
        title: source.title,
        sourcePath,
        workspaceHref,
        kind: "pdf",
        description: source.description,
        downloadable: true
      });
      continue;
    }
    items.push({
      id: toSafeId(source.title, "story"),
      title: source.title,
      sourcePath: source.href,
      workspaceHref: source.href,
      kind: "external",
      description: source.description,
      downloadable: false
    });
  }
  return items;
}

async function loadWritingWorksheets() {
  return [
    {
      "id": "othello-act-1-questions",
      "title": "Othello Act 1 Questions",
      "author": "William Shakespeare",
      "diplomaTheme": "first impressions, reputation, prejudice, and Iago's opening manipulation in Othello",
      "sections": [
        {
          "title": "Act 1 Reading Questions",
          "questions": [
            {
              "id": "act-1-question-1",
              "text": "Question 1: What is Iago's complaint in Scene I?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-2",
              "text": "Question 2: Who is Brabantio, and why do Iago and Roderigo awaken him in the middle of the night?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-3",
              "text": "Question 3: Why does Iago leave Roderigo at Brabantio's house?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-4",
              "text": "Question 4: What is Roderigo’s previous relationship with Brabantio and Desdemona?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-5",
              "text": "Question 5: What is Brabantio's reaction to Othello's marriage to Desdemona?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-6",
              "text": "Question 6: Why does the Duke send for Othello?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-7",
              "text": "Question 7: What danger is Cyprus facing?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-8",
              "text": "Question 8: Brabantio complains to the Duke about Othello's marriage to Desdemona. After listening to both sides of the story, what is the Duke's reply?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-9",
              "text": "Question 9: What is Roderigo's complaint, and what is Iago's reply to it?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-10",
              "text": "Question 10: Who is Othello, and why is he so respected by the Duke?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-11",
              "text": "Question 11: What warning does Brabantio give to Othello?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-12",
              "text": "Question 12: Othello and Desdemona have just been married. Will they stay together or separate? Why do you think this based on the information in Act I?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-13",
              "text": "Question 13: What does Iago say must happen to Desdemona?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-14",
              "text": "Question 14: Why does Iago “hate the Moor”?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-1-question-15",
              "text": "Question 15: How would you grade Iago on racial insensitivity?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            }
          ]
        }
      ]
    },
    {
      "id": "othello-act-2-questions",
      "title": "Othello Act 2 Questions",
      "author": "William Shakespeare",
      "diplomaTheme": "public celebration, private scheming, Cassio's fall, and Iago's opportunism in Othello",
      "sections": [
        {
          "title": "Act 2 Reading Questions",
          "questions": [
            {
              "id": "act-2-question-16",
              "text": "Question 16: What is the setting as Act II begins? What is the situation at sea?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-17",
              "text": "Question 17: What has happened to the Turkish fleet?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-18",
              "text": "Question 18: Which ship from Venice arrives first?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-19",
              "text": "Question 19: Which ship arrives second? Why is it surprising that it arrives before Othello’s?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-20",
              "text": "Question 20: What does the discussion between Desdemona and Emilia tell us about their relationship?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-21",
              "text": "Question 21: Who is Emilia?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-22",
              "text": "Question 22: How does Cassio greet Desdemona and Emilia?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-23",
              "text": "Question 23: Why does Iago want Roderigo to anger Cassio?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-24",
              "text": "Question 24: What is the purpose of Iago's plan?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-25",
              "text": "Question 25: What evidence is Iago using to rationalize his plan? Is his evidence solid?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-26",
              "text": "Question 26: What keeps Roderigo from seeing the truth instead of Iago’s lies?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-27",
              "text": "Question 27: What emotion seems to be governing Iago’s thoughts and actions?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-28",
              "text": "Question 28: How does Iago see Desdemona, and how does Cassio see Desdemona?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-29",
              "text": "Question 29: Why does Iago want Cassio to drink more wine?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-30",
              "text": "Question 30: What is the outcome of Cassio’s drinking?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-31",
              "text": "Question 31: What lie does Iago tell Montano about Cassio?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-32",
              "text": "Question 32: Why does Othello strip Cassio of his rank?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-33",
              "text": "Question 33: Why does Iago want Cassio to ask Desdemona for help in restoring Othello's faith in Cassio?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-34",
              "text": "Question 34: How does Iago get back in Othello’s good graces?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-2-question-35",
              "text": "Question 35: What is Roderigo’s complaint, and how does Iago answer it?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            }
          ]
        }
      ]
    },
    {
      "id": "othello-act-3-questions",
      "title": "Othello Act 3 Questions",
      "author": "William Shakespeare",
      "diplomaTheme": "the temptation scene, jealousy, proof, trust, and Othello's turning point in Othello",
      "sections": [
        {
          "title": "Act 3 Reading Questions",
          "questions": [
            {
              "id": "act-3-question-36",
              "text": "Question 36: Why does Cassio bring musicians? What is Othello’s response to them?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-37",
              "text": "Question 37: What does Emilia tell Cassio that Desdemona is already doing for him?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-38",
              "text": "Question 38: What responses do Iago and Othello have to seeing Cassio leave Desdemona?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-39",
              "text": "Question 39: How successfully does Desdemona plead for Cassio? What is Othello's response to Desdemona as she leaves?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-40",
              "text": "Question 40: Why doesn't Iago simply tell Othello right away that Desdemona and Cassio are having an affair?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-41",
              "text": "Question 41: Othello’s love for Desdemona is solid as can be seen through line 93 of Act III, Scene 3. Why does he become a man in “misery” by his next speech? What has moved him from love to jealousy?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-42",
              "text": "Question 42: How can anyone provide proof of fidelity?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-43",
              "text": "Question 43: What thing does Emilia find and give to Iago? What does Iago intend to do with it?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-44",
              "text": "Question 44: What is Iago's reply when Othello demanded proof of his wife's disloyalty?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-45",
              "text": "Question 45: What does Othello decide and command at the end of Scene 3?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-46",
              "text": "Question 46: How likely is it that Othello will keep an open mind until he has seen real proof? How much have Iago's suggestions about Desdemona's \"nature\" worked on Othello?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-47",
              "text": "Question 47: Is there any chance of his changing his mind or of Desdemona's convincing him of her innocence after this speech?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-48",
              "text": "Question 48: What is Emilia's relationship with Iago? Desdemona?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-49",
              "text": "Question 49: What, according to Othello, is the history of the handkerchief? Is Othello telling the truth here? What else might he be doing?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-50",
              "text": "Question 50: What does the argument between Othello and Desdemona show about both them and their relationship?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-51",
              "text": "Question 51: What is Emilia's view of men? How justified is she?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-52",
              "text": "Question 52: Who is Bianca? What is her relationship to Cassio? What does he ask her to do? What is her emotional response? Sound familiar? How does Cassio get the handkerchief?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-3-question-53",
              "text": "Question 53: Who had the handkerchief at the end of Act III? Why?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            }
          ]
        }
      ]
    },
    {
      "id": "othello-act-4-questions",
      "title": "Othello Act 4 Questions",
      "author": "William Shakespeare",
      "diplomaTheme": "emotional collapse, public humiliation, gender, power, and trapped choices in Othello",
      "sections": [
        {
          "title": "Act 4 Reading Questions",
          "questions": [
            {
              "id": "act-4-question-54",
              "text": "Question 54: After Iago lied and told Othello that Cassio confessed going to bed with Desdemona, what advice does he give the overwhelmed Othello?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-55",
              "text": "Question 55: What happens to Othello in Scene 1? How does Iago respond?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-56",
              "text": "Question 56: How does Iago trick Othello into thinking Cassio is gloating and bragging about his affair with Desdemona?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-57",
              "text": "Question 57: Why is Bianca angry with Cassio?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-58",
              "text": "Question 58: How does Bianca's return with the handkerchief help Iago?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-59",
              "text": "Question 59: Why does Othello hit Desdemona?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-60",
              "text": "Question 60: Who is Lodovico, and why has he come to Venice?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-61",
              "text": "Question 61: What is Lodovico's reaction to Othello's behavior towards Desdemona? How does Iago later explain Othello's behavior to Lodovico?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-62",
              "text": "Question 62: Why does Othello ask Emilia about Cassio's affair with Desdemona, and what is her reply?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-63",
              "text": "Question 63: How correctly does Othello identify his weakness in Scene 2?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-64",
              "text": "Question 64: To whom does Desdemona turn for help after Othello calls her a strumpet?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-65",
              "text": "Question 65: Why does Iago tell Roderigo to kill Cassio? Why does Roderigo consent to think about it?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-66",
              "text": "Question 66: If Roderigo kills Cassio, what promise has Iago taken care of?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-4-question-67",
              "text": "Question 67: Given Scene 3, between Desdemona and Emilia, is it at all possible that Desdemona could ever be unfaithful to Othello?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            }
          ]
        }
      ]
    },
    {
      "id": "othello-act-5-questions",
      "title": "Othello Act 5 Questions",
      "author": "William Shakespeare",
      "diplomaTheme": "consequences, recognition, tragedy, justice, and final interpretation in Othello",
      "sections": [
        {
          "title": "Act 5 Reading Questions",
          "questions": [
            {
              "id": "act-5-question-68",
              "text": "Question 68: How would Iago gain from Roderigo's death? Cassio's?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-69",
              "text": "Question 69: What happens when Roderigo attacks Cassio? Who actually wounds Cassio?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-70",
              "text": "Question 70: What does Othello assume has happened? Is he correct?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-71",
              "text": "Question 71: After Bianca appears, what new part of his plot does Iago begin in Scene 1?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-72",
              "text": "Question 72: Who will get the blame for the attack on Cassio if Iago has his way?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-73",
              "text": "Question 73: What justification does Othello try to give the murder of Desdemona in Scene 2?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-74",
              "text": "Question 74: How does Othello kill Desdemona? What interruption occurs while he is doing it?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-75",
              "text": "Question 75: Whom does Desdemona blame for her death? Does Emilia believe her?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-76",
              "text": "Question 76: How is Desdemona faithful to Othello to the end?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-77",
              "text": "Question 77: What happens when Iago tells his wife not to speak and to go home, orders which good Renaissance wives should follow without question?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-78",
              "text": "Question 78: What is Emilia’s reaction when Othello tells her that Iago has revealed Desdemona's affair with Cassio to him?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-79",
              "text": "Question 79: What is Othello finally beginning to realize at after talking to Emilia? What has happened to Desdemona’s father?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-80",
              "text": "Question 80: Why does Othello attack Iago?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-81",
              "text": "Question 81: What is Othello’s reaction to having his sword taken away?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-82",
              "text": "Question 82: How does Othello use the second sword he finds in the room?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-83",
              "text": "Question 83: How do Roderigo’s pockets conveniently help to clarify much of what has happened?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-84",
              "text": "Question 84: What happens to the following characters in the end? a. Othello b. Iago c. Cassio",
              "hint": "Answer with specific evidence from the scene whenever possible."
            },
            {
              "id": "act-5-question-85",
              "text": "Question 85: Who gets Othello’s estate? Why?",
              "hint": "Answer with specific evidence from the scene whenever possible."
            }
          ]
        }
      ]
    }
  ] as WritingWorksheetStory[];
}

function buildHtml(input: {
  headAssets: string;
  lessons: Lesson[];
  resourceGroups: ResourceGroup[];
  localResources: SourceLink[];
  parallelReadingScenes: HydratedParallelReadingScene[];
  storyBankItems: StoryBankItem[];
  writingWorksheets: WritingWorksheetStory[];
  videos: SourceVideo[];
}) {
  const lessons = [...input.lessons, buildAnticipationPhaseOneLesson()];
  const lessonIds = lessons.map((lesson) => lesson.id);
  const visibleLessonIds = topLevelLessons(lessons).map((lesson) => lesson.id);
  const elementIds = lessons.filter(isFictionElementLesson).map((lesson) => lesson.id);
  const elementHubId = lessons.find(isFictionElementsHub)?.id ?? "";
  const total = lessons.length;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>ELA 30-1 - Shakespeare: Othello</title>
${input.headAssets}
<style>
.course-main { min-height: 100vh; }
.course-topbar.course-topbar,
.course-sidebar.course-sidebar { background: #1a1c1e !important; color: #f6f7f5 !important; }
.course-topbar.course-topbar { border-bottom: 1px solid rgba(255,255,255,0.08); }
.course-sidebar.course-sidebar { border-right: 1px solid rgba(255,255,255,0.08); }
body.bg-surface-container-lowest { background: #ffffff !important; color: #191c1d !important; }
.course-main.course-main {
  min-height: 100vh;
  background: #ffffff !important;
  padding-top: 104px !important;
}
@media (min-width: 768px) {
  .course-main.course-main {
    margin-left: 288px !important;
    padding-left: 64px !important;
    padding-right: 64px !important;
  }
}
.course-main > .max-w-6xl {
  width: 100%;
  max-width: 1152px;
  margin-left: auto;
  margin-right: auto;
}
.course-page[hidden] { display: none !important; }
.course-page {
  background: transparent !important;
  color: #191c1d;
}
#overview > div { max-width: 780px; }
.unit-outcomes {
  margin-top: 24px;
}
.unit-outcomes-lead {
  margin: 0 0 10px;
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #171b17;
}
.unit-focus-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 10px;
  margin-top: 24px;
}
.unit-focus-list li {
  border-left: 3px solid #154212;
  background: #f8f9fa;
  padding: 10px 14px;
}
.completed-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid #c3cbbb;
  border-radius: 8px;
  background: #ffffff;
  color: #3f463d;
}
.completed-pill strong { color: #0d4f12; }
.external-resource-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  width: fit-content;
  padding: 0 18px;
  border-radius: 8px;
  background: #0d4f12;
  color: #ffffff !important;
  font-weight: 800;
  text-decoration: none;
}
.library-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  width: fit-content;
  padding: 0 18px;
  border: 1px solid #0d4f12;
  border-radius: 8px;
  background: #0d4f12;
  color: #ffffff;
  font: inherit;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
}
.external-resource-action:hover,
.external-resource-action:focus-visible,
.library-action-button:hover,
.library-action-button:focus-visible {
  background: #0a3e0e;
  border-color: #0a3e0e;
  outline: 3px solid rgba(13,79,18,0.22);
  outline-offset: 2px;
}
.student-response-field { display: grid; gap: 8px; margin-top: 14px; }
.student-response-field span { font-family: "IBM Plex Sans"; font-size: 13px; color: #154212; }
.student-response-field textarea { width: 100%; border: 1px solid #c2c9bb; border-radius: 8px; background: #fff; padding: 12px; font-family: "Work Sans"; font-size: 15px; line-height: 1.55; }
.worksheet-studio { margin-top: 28px; }
.story-questions-studio { margin-top: 22px; }
.parallel-reading-browser {
  display: grid;
  gap: 18px;
}
.parallel-reading-toolbar,
.parallel-reading-panel {
  border: 1px solid #e1e3e4;
  border-radius: 10px;
  background: #ffffff;
}
.parallel-reading-toolbar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  align-items: start;
  padding: 18px;
}
.parallel-reading-toolbar-copy h3 {
  margin: 0 0 8px;
  font-family: "Hanken Grotesk";
  font-size: 28px;
  line-height: 1.1;
  font-weight: 800;
  color: #191c1d;
}
.parallel-reading-toolbar-copy p {
  margin: 0;
  color: #42493e;
  font-size: 15px;
  line-height: 1.55;
}
.parallel-reading-picker {
  display: grid;
  gap: 8px;
  max-width: 420px;
}
.parallel-reading-picker-label {
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
}
.parallel-reading-panel-stack {
  display: grid;
}
.parallel-reading-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
}
.parallel-reading-header {
  margin-bottom: 0;
}
.parallel-reading-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}
.parallel-reading-pair-card {
  grid-column: 1 / -1;
  border: 1px solid #d9ded2;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
}
.parallel-reading-pair-head {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid #e4e8de;
  border-bottom: 1px solid #e4e8de;
  background: #f6f8f2;
}
.parallel-reading-pair-head div {
  padding: 12px 18px;
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
}
.parallel-reading-pair-head div + div {
  border-left: 1px solid #d9ded2;
}
.parallel-reading-pair-table {
  display: grid;
}
.parallel-reading-pair-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.parallel-reading-pair-row + .parallel-reading-pair-row {
  border-top: 1px solid #e4e8de;
}
.parallel-reading-pair-cell {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  align-content: start;
}
.parallel-reading-pair-cell.original {
  border-right: 1px solid #d9ded2;
  background: #fcfdf9;
}
.parallel-reading-pair-cell.modern {
  background: linear-gradient(180deg, #ffffff 0%, #f7faf4 100%);
}
.parallel-reading-pair-cell p {
  margin: 0;
  color: #1f2320;
  font-size: 15px;
  line-height: 1.65;
}
.parallel-reading-transcript-pair .parallel-reading-block-heading {
  border-bottom: 1px solid #e4e8de;
}
.parallel-reading-transcript-pair .parallel-reading-pair-head {
  border-top: 0;
}
.parallel-reading-pair-label {
  color: #31372f;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
}
.parallel-reading-transcript-card {
  border: 1px solid #d9ded2;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
}
.parallel-reading-transcript-card {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}
.parallel-reading-block-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
  padding: 16px 18px 12px;
  border-bottom: 1px solid #e4e8de;
  background: #fbfcf9;
}
.parallel-reading-frame-copy {
  margin: 6px 0 0;
  color: #566053;
  font-size: 14px;
  line-height: 1.5;
}
.parallel-reading-transcript-card.modern {
  background: linear-gradient(180deg, #ffffff 0%, #f8faf5 100%);
}
.parallel-reading-transcript-body {
  display: grid;
  gap: 16px;
  padding: 16px 18px;
  min-height: 980px;
  max-height: 980px;
  overflow: auto;
}
.parallel-reading-transcript-entry {
  display: grid;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e5e8df;
}
.parallel-reading-transcript-entry:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.parallel-reading-transcript-speaker {
  margin: 0;
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.parallel-reading-transcript-lines {
  display: grid;
  gap: 8px;
}
.parallel-reading-transcript-lines p {
  margin: 0;
  color: #1f2320;
  font-size: 15px;
  line-height: 1.65;
}
.parallel-reading-transcript-stage {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border-left: 3px solid #bfc9b3;
  border-radius: 0 8px 8px 0;
  background: #f6f8f2;
}
.parallel-reading-transcript-stage.modern {
  border-left-color: #8eb17a;
  background: #f2f7ea;
}
.parallel-reading-transcript-stage p {
  margin: 0;
  color: #4a5247;
  font-size: 14px;
  line-height: 1.55;
  font-style: italic;
}
.parallel-reading-scene-label {
  margin: 0 0 6px;
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
}
.parallel-reading-intro {
  padding: 14px 16px;
  border: 1px solid #dde4d7;
  border-radius: 8px;
  background: #fafbf8;
  color: #3e463b;
  font-size: 14px;
  line-height: 1.55;
}
.parallel-reading-focus {
  margin: 0 18px 18px;
  padding: 14px 16px;
  border-left: 3px solid #154212;
  border-radius: 0 8px 8px 0;
  background: #f5f7f2;
  color: #31372f;
  font-size: 15px;
  line-height: 1.6;
}
.parallel-reading-watch-heading,
.parallel-reading-support-heading {
  display: grid;
  gap: 6px;
}
.parallel-reading-watch-heading h4,
.parallel-reading-support-heading h4 {
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
}
.parallel-reading-watch-heading p,
.parallel-reading-support-heading p {
  margin: 0;
  color: #4e564b;
  font-size: 14px;
  line-height: 1.55;
}
.parallel-reading-summary-heading {
  display: grid;
  gap: 6px;
}
.parallel-reading-summary-heading h4 {
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
}
.parallel-reading-summary-heading p {
  margin: 0;
  color: #4e564b;
  font-size: 14px;
  line-height: 1.55;
}
.parallel-reading-summary-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.parallel-reading-summary-card {
  display: grid;
  gap: 10px;
  border: 1px solid #d9ded2;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px 20px;
}
.parallel-reading-summary-card h5 {
  margin: 0;
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 20px;
  line-height: 1.15;
  font-weight: 800;
}
.parallel-reading-summary-card p {
  margin: 0;
  color: #1f2320;
  font-size: 15px;
  line-height: 1.65;
}
.parallel-reading-anchor-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.parallel-reading-anchor-card {
  display: grid;
  gap: 8px;
  border: 1px solid #d9ded2;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px 20px;
}
.parallel-reading-label {
  margin-bottom: 0;
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
}
.parallel-reading-speaker {
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  color: #31372f;
}
.parallel-reading-anchor-card p {
  margin: 0;
  color: #1f2320;
  font-size: 15px;
  line-height: 1.65;
}
.parallel-reading-anchor-original {
  font-style: italic;
}
.parallel-reading-note {
  color: #4a5247 !important;
}

.story-question-selector { margin-bottom: 18px; max-width: 520px; display: grid; gap: 8px; }
.story-question-selector-label { color: #154212; font-family: "IBM Plex Sans"; font-size: 13px; font-weight: 700; }
.story-question-picker { position: relative; display: grid; }
.story-question-trigger {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #b9c5b1;
  border-radius: 8px;
  background: #ffffff;
  color: #171b17;
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.story-question-trigger .material-symbols-outlined {
  font-size: 20px;
  color: #5d6359;
  transition: transform 140ms ease;
}
.story-question-picker.is-open .story-question-trigger {
  border-color: #7fa076;
  box-shadow: 0 0 0 2px rgba(31, 90, 31, 0.14);
}
.story-question-picker.is-open .story-question-trigger .material-symbols-outlined {
  transform: rotate(180deg);
}
.story-question-options {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 15;
  display: grid;
  max-height: 320px;
  border: 1px solid #cfd7c7;
  border-radius: 10px;
  overflow: hidden;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(17, 24, 17, 0.08);
}
.story-question-option {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border: 0;
  border-top: 1px solid #e4e8df;
  background: #ffffff;
  color: #171b17;
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.story-question-option:first-child {
  border-top: 0;
}
.story-question-option:hover,
.story-question-option:focus-visible {
  background: #f6faf2;
  outline: none;
}
.story-question-option.is-active {
  background: #eef5ea;
  color: #154212;
}
.story-question-native-select {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
  opacity: 0;
  pointer-events: none;
}
.overlay-select-shell { position: relative; display: grid; }
.overlay-select-trigger {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #b9c5b1;
  border-radius: 8px;
  background: #ffffff;
  color: #171b17;
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.overlay-select-trigger .material-symbols-outlined {
  font-size: 20px;
  color: #5d6359;
  transition: transform 140ms ease;
}
.overlay-select-shell.is-open .overlay-select-trigger {
  border-color: #7fa076;
  box-shadow: 0 0 0 2px rgba(31, 90, 31, 0.14);
}
.overlay-select-shell.is-open .overlay-select-trigger .material-symbols-outlined {
  transform: rotate(180deg);
}
.overlay-select-options {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 24;
  display: grid;
  max-height: 320px;
  border: 1px solid #cfd7c7;
  border-radius: 10px;
  overflow: hidden;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(17, 24, 17, 0.08);
}
.overlay-select-option {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border: 0;
  border-top: 1px solid #e4e8df;
  background: #ffffff;
  color: #171b17;
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.overlay-select-option:first-child {
  border-top: 0;
}
.overlay-select-option:hover,
.overlay-select-option:focus-visible {
  background: #f6faf2;
  outline: none;
}
.overlay-select-option.is-active {
  background: #eef5ea;
  color: #154212;
}
.overlay-select-native {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
  opacity: 0;
  pointer-events: none;
}
.story-questions-studio .worksheet-panel { margin-top: 0; }
.scene-checkpoint-shell { margin: 0 0 18px; }
.scene-checkpoint-document { overflow: hidden; }
.scene-checkpoint-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.scene-checkpoint-heading > div { min-width: 0; }
.scene-checkpoint-heading h3 { margin: 0; }
.scene-checkpoint-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(215, 221, 212, 0.24);
  border-radius: 999px;
  color: #d7ddd4;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.scene-checkpoint-body {
  display: grid;
  gap: 20px;
  padding: 26px 28px 28px;
  background: #fff;
}
.scene-checkpoint-list { display: grid; gap: 28px; }
.scene-checkpoint-picker { max-width: 560px; }
.scene-checkpoint-picker label { display: grid; gap: 8px; color: #154212; font-family: "IBM Plex Sans"; font-size: 13px; font-weight: 700; }
.scene-checkpoint-picker select { min-height: 48px; border: 1px solid #b9c5b1; border-radius: 8px; background: #fff; color: #171b17; font: inherit; font-weight: 700; padding: 10px 12px; }
.scene-checkpoint-card { display: grid; gap: 22px; }
.scene-checkpoint-card .worksheet-question { margin-bottom: 0; }
.scene-key-quote {
  margin-left: 44px;
  padding: 16px 18px;
  border-left: 3px solid #154212;
  border-radius: 0 10px 10px 0;
  background: #f5f7f2;
  color: #31372f;
}
.scene-key-quote blockquote {
  margin: 0;
  font-family: "Hanken Grotesk";
  font-size: 24px;
  line-height: 1.3;
  font-weight: 700;
}
.scene-checkpoint-two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}
.worksheet-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.worksheet-toolbar button,
.worksheet-footer-actions button,
.worksheet-back { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; color: #154212; padding: 9px 12px; font-weight: 700; cursor: pointer; }
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
.worksheet-answer-field select { width: 100%; min-height: 50px; border: 1px solid #c5c9c1; border-radius: 8px; background: #f8f9fa; padding: 0 12px; font-family: "Work Sans"; font-size: 15px; line-height: 1.55; color: #171b17; }
.worksheet-answer-field textarea:focus { outline: 2px solid rgba(21, 66, 18, 0.18); border-color: #154212; background: #fff; }
.worksheet-answer-field select:focus { outline: 2px solid rgba(21, 66, 18, 0.18); border-color: #154212; background: #fff; }
.worksheet-word-count { justify-self: end; color: #747a70; font-size: 12px; }
.worksheet-synthesis { margin: 28px; padding: 24px; background: #161a17; color: #fff; border-radius: 10px; }
.worksheet-synthesis h3 { margin: 0 0 8px; font-family: "Hanken Grotesk"; font-size: 26px; font-weight: 800; }
.worksheet-synthesis p { color: #d7ddd4; }
.worksheet-synthesis .worksheet-answer-field { margin-left: 0; margin-top: 18px; }
.worksheet-footer-actions { display: flex; justify-content: flex-end; padding: 0 28px 28px; }
.worksheet-synthesis .worksheet-answer-field span { color: #cfe8c7; }
.worksheet-synthesis .worksheet-answer-field small { color: #d7ddd4; }
.worksheet-synthesis textarea { background: #222822; border-color: #3b4639; color: #fff; }
.anticipation-phase-two-panel .anticipation-guide-flow {
  display: grid;
  gap: 20px;
  padding: 26px 28px 28px;
  background: #f5f7f2;
}
.anticipation-phase-two-panel .anticipation-phase-note {
  padding: 18px 20px;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
  background: #ffffff;
}
.anticipation-phase-two-panel .anticipation-phase-note h3 {
  margin: 0 0 8px;
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 28px;
  line-height: 1.1;
  font-weight: 800;
}
.anticipation-phase-two-panel .anticipation-phase-note p {
  margin: 0;
  max-width: 780px;
  color: #4d554a;
  line-height: 1.6;
}
.anticipation-phase-two-panel .anticipation-statement-list {
  display: grid;
  gap: 18px;
}
.anticipation-phase-two-panel .anticipation-reflection-card {
  background: #ffffff;
  border: 1px solid #d9dadb;
  border-radius: 12px;
  overflow: hidden;
}
.anticipation-phase-two-panel .anticipation-statement-shell {
  display: grid;
  gap: 18px;
  padding: 20px;
}
.anticipation-phase-two-panel .anticipation-statement-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}
.anticipation-phase-two-panel .anticipation-statement-kicker {
  margin: 0 0 8px;
  color: #5d6359;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.anticipation-phase-two-panel .anticipation-statement-header h4 {
  margin: 0;
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 28px;
  line-height: 1.18;
  font-weight: 800;
}
.anticipation-phase-two-panel [data-anticipation-shift] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #d0d8c8;
  border-radius: 999px;
  background: #f4f7ef;
  color: #566051;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.anticipation-phase-two-panel [data-anticipation-shift].is-shift-up {
  border-color: #c6d8ac;
  background: #eef7e3;
  color: #3f6411;
}
.anticipation-phase-two-panel [data-anticipation-shift].is-shift-down {
  border-color: #c7d0ea;
  background: #eef2fb;
  color: #34558e;
}
.anticipation-phase-two-panel [data-anticipation-shift].is-stable {
  border-color: #d8dfd1;
  background: #f7f8f4;
  color: #5d6359;
}
.anticipation-phase-two-panel .anticipation-locked-response {
  padding: 18px;
  border: 1px solid #dde2de;
  border-radius: 10px;
  background: #f7f8fa;
}
.anticipation-phase-two-panel .anticipation-locked-response > span {
  display: inline-block;
  margin-bottom: 10px;
  color: #5d6359;
  font-family: "IBM Plex Sans";
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.anticipation-phase-two-panel .anticipation-locked-response p {
  margin: 0;
  color: #495147;
  line-height: 1.55;
}
.anticipation-phase-two-panel .anticipation-locked-response p + p {
  margin-top: 8px;
}
.anticipation-phase-two-panel .anticipation-locked-response strong {
  color: #154212;
}
.anticipation-phase-two-panel .anticipation-phase-two-grid {
  display: grid;
  grid-template-columns: minmax(250px, 280px) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.anticipation-phase-two-panel .othello-response-field {
  display: grid;
  gap: 8px;
  margin: 0;
}
.anticipation-phase-two-panel .othello-response-field > span,
.anticipation-phase-two-panel .othello-response-field > legend {
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
}
.anticipation-phase-two-panel .othello-response-field > legend {
  padding: 0;
}
.anticipation-phase-two-panel .othello-response-field input:not([type="radio"]),
.anticipation-phase-two-panel .othello-response-field textarea {
  width: 100%;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #ffffff;
  color: #191c1d;
  font: inherit;
  padding: 10px 12px;
}
.anticipation-phase-two-panel .othello-response-field input:not([type="radio"]) {
  min-height: 46px;
}
.anticipation-phase-two-panel .othello-response-field textarea {
  min-height: 140px;
  background: #f8f9fa;
  resize: vertical;
}
.anticipation-phase-two-panel .othello-response-field input:not([type="radio"]):focus,
.anticipation-phase-two-panel .othello-response-field textarea:focus {
  outline: 2px solid rgba(21, 66, 18, 0.18);
  border-color: #154212;
  background: #ffffff;
}
.anticipation-phase-two-panel .anticipation-choice-field {
  min-width: 0;
  padding: 0;
  border: 0;
}
.anticipation-phase-two-panel .anticipation-choice-list {
  display: grid;
  gap: 8px;
}
.anticipation-phase-two-panel .anticipation-choice-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 48px;
  padding: 10px 12px;
  border: 1px solid #b9c5b1;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
}
.anticipation-phase-two-panel .anticipation-choice-option:hover {
  background: #f6faf2;
  border-color: #7fa076;
}
.anticipation-phase-two-panel .anticipation-choice-option input {
  margin: 3px 0 0;
  width: 16px;
  min-width: 16px;
  height: 16px;
  min-height: 16px;
  border: 0;
  padding: 0;
  background: transparent;
  accent-color: #1f5a1f;
  flex: 0 0 auto;
}
.anticipation-phase-two-panel .anticipation-choice-option span {
  color: #17201a;
  font-size: .95rem;
  font-weight: 600;
  line-height: 1.35;
}
.anticipation-phase-two-panel .anticipation-choice-option:has(input:checked) {
  border-color: #1f5a1f;
  background: #eef5ea;
  box-shadow: inset 0 0 0 1px #1f5a1f;
}
.anticipation-phase-two-panel .anticipation-choice-option:has(input:focus-visible) {
  outline: 2px solid #1f5a1f;
  outline-offset: 2px;
}
.anticipation-phase-two-panel .anticipation-synthesis-card {
  display: grid;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  background: #161a17;
  color: #ffffff;
}
.anticipation-phase-two-panel .anticipation-synthesis-copy h4 {
  margin: 0 0 8px;
  font-family: "Hanken Grotesk";
  font-size: 32px;
  line-height: 1.08;
  font-weight: 800;
}
.anticipation-phase-two-panel .anticipation-synthesis-copy p {
  margin: 0;
  max-width: 760px;
  color: #d7ddd4;
  line-height: 1.6;
}
.anticipation-phase-two-panel .anticipation-synthesis-card .othello-response-field > span {
  color: #cfe8c7;
}
.anticipation-phase-two-panel .anticipation-synthesis-card input,
.anticipation-phase-two-panel .anticipation-synthesis-card textarea {
  background: #222822;
  border-color: #3b4639;
  color: #ffffff;
}
.anticipation-phase-two-panel .anticipation-synthesis-card input::placeholder,
.anticipation-phase-two-panel .anticipation-synthesis-card textarea::placeholder {
  color: #8e978b;
}
.anticipation-phase-two-panel .anticipation-synthesis-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.anticipation-phase-two-panel .anticipation-synthesis-actions p {
  margin: 0;
  color: #d7ddd4;
  font-size: 14px;
  line-height: 1.5;
}
.anticipation-phase-two-panel .anticipation-synthesis-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #51624c;
  border-radius: 8px;
  background: #ffffff;
  color: #154212;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 900px) {
  .scene-checkpoint-heading {
    flex-direction: column;
  }
  .scene-checkpoint-two-column {
    grid-template-columns: 1fr;
  }
  .anticipation-phase-two-panel .anticipation-phase-two-grid {
    grid-template-columns: 1fr;
  }
  #writing .othello-language-toolbar,
  #writing .othello-language-match-grid,
  #writing .othello-language-contraction-grid,
  #writing .othello-language-pronoun-grid {
    grid-template-columns: 1fr;
  }
  #writing .othello-language-sentence-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 720px) {
  .scene-checkpoint-body {
    padding: 22px 20px 24px;
  }
  .scene-key-quote {
    margin-left: 0;
  }
  .scene-key-quote blockquote {
    font-size: 20px;
  }
  .anticipation-phase-two-panel .anticipation-guide-flow {
    padding: 22px 20px 24px;
  }
  .anticipation-phase-two-panel .anticipation-statement-header {
    flex-direction: column;
  }
  .anticipation-phase-two-panel .anticipation-statement-header h4 {
    font-size: 24px;
  }
  .anticipation-phase-two-panel .anticipation-choice-list {
    grid-template-columns: 1fr;
  }
  .anticipation-phase-two-panel .anticipation-synthesis-card {
    padding: 20px;
  }
  .anticipation-phase-two-panel .anticipation-synthesis-copy h4 {
    font-size: 28px;
  }
  #writing .othello-language-tab {
    width: 100%;
    justify-content: center;
  }
  #writing .othello-language-pronoun-card p {
    font-size: 16px;
  }
  #writing .othello-language-pronoun-card select {
    width: 100%;
    margin: 8px 0;
  }
  #writing .othello-language-built-area {
    min-height: 84px;
  }
}

#character-notes .character-dossier-studio {
  margin-top: 24px;
  --character-accent: #2d5b4f;
  --character-accent-rgb: 45, 91, 79;
  --character-accent-soft: rgba(var(--character-accent-rgb), 0.08);
  --character-accent-medium: rgba(var(--character-accent-rgb), 0.18);
  --character-accent-strong: rgba(var(--character-accent-rgb), 0.28);
  --character-accent-deep: rgba(var(--character-accent-rgb), 0.94);
  --character-accent-fade: rgba(var(--character-accent-rgb), 0.86);
}
#character-notes .character-dossier-shell {
  display: grid;
  grid-template-columns: minmax(240px, 272px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}
#character-notes .character-dossier-nav {
  display: grid;
  gap: 18px;
  padding: 18px;
  background: linear-gradient(155deg, var(--character-accent-fade), #161a17 84%);
  border: 1px solid var(--character-accent-strong);
  border-radius: 10px;
  color: #f6f7f5;
  box-shadow: 0 8px 28px rgba(var(--character-accent-rgb), 0.12);
}
#character-notes .character-dossier-nav-copy {
  display: grid;
  gap: 8px;
}
#character-notes .character-dossier-nav-copy h3 {
  margin: 0;
  font-family: "Hanken Grotesk";
  font-size: 24px;
  line-height: 1.1;
  font-weight: 800;
}
#character-notes .character-dossier-nav-copy p {
  margin: 0;
  color: rgba(255,255,255,0.82);
  line-height: 1.55;
}
#character-notes .character-dossier-nav-list {
  display: grid;
  gap: 10px;
}
#character-notes .character-dossier-target {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(var(--character-accent-rgb), 0.22);
  border-radius: 10px;
  background: rgba(var(--character-accent-rgb), 0.12);
  color: #f6f7f5;
  text-align: left;
  cursor: pointer;
}
#character-notes .character-dossier-target:hover,
#character-notes .character-dossier-target:focus-visible {
  border-color: rgba(var(--character-accent-rgb), 0.38);
  background: rgba(var(--character-accent-rgb), 0.18);
  outline: none;
}
#character-notes .character-dossier-target.active {
  border-color: var(--character-accent);
  background: rgba(var(--character-accent-rgb), 0.24);
  box-shadow: inset 0 0 0 1px var(--character-accent-strong);
}
#character-notes .character-dossier-target-copy {
  display: grid;
  gap: 4px;
}
#character-notes .character-dossier-target-copy strong {
  font-family: "IBM Plex Sans";
  font-size: 14px;
  font-weight: 700;
}
#character-notes .character-dossier-target-copy span {
  color: rgba(255,255,255,0.78);
  font-size: 13px;
}
#character-notes .character-dossier-target-meter {
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.14);
  overflow: hidden;
}
#character-notes .character-dossier-target-meter div {
  height: 100%;
  width: 0;
  background: var(--character-accent);
}
#character-notes .character-dossier-nav-actions {
  display: grid;
  gap: 10px;
}
#character-notes .character-dossier-nav-actions button,
#character-notes .character-dossier-section-heading button,
#character-notes .character-dossier-entry-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #ffffff;
  color: #154212;
  font-weight: 700;
  cursor: pointer;
}
#character-notes .character-dossier-nav-actions button {
  border-color: var(--character-accent-medium);
  color: var(--character-accent);
}
#character-notes .character-dossier-nav-actions button:hover,
#character-notes .character-dossier-nav-actions button:focus-visible {
  background: rgba(var(--character-accent-rgb), 0.16);
  border-color: var(--character-accent);
  outline: none;
}
#character-notes .character-dossier-nav-actions .is-secondary {
  background: rgba(var(--character-accent-rgb), 0.08);
  color: #f6f7f5;
  border-color: rgba(var(--character-accent-rgb), 0.3);
}
#character-notes .character-dossier-document {
  overflow: hidden;
  border-color: var(--character-accent-medium);
  box-shadow: 0 8px 28px rgba(var(--character-accent-rgb), 0.08);
}
#character-notes .character-dossier-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  background: linear-gradient(135deg, var(--character-accent-fade), #161a17 82%);
}
#character-notes .character-dossier-heading-copy {
  min-width: 0;
}
#character-notes .character-dossier-heading-copy h3 {
  margin: 0;
}
#character-notes .character-dossier-heading-tools {
  display: grid;
  gap: 14px;
  justify-items: end;
}
#character-notes .character-dossier-color-control {
  display: grid;
  gap: 8px;
  justify-items: end;
}
#character-notes .character-dossier-color-control > span {
  color: #d7ddd4;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
#character-notes .character-dossier-color-control > div {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
#character-notes .character-dossier-color-control input[type="color"] {
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid var(--character-accent-strong);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.08);
}
#character-notes .character-dossier-color-control strong,
#character-notes .character-dossier-progress-badge span {
  color: #d7ddd4;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
#character-notes .character-dossier-progress-badge {
  display: inline-grid;
  justify-items: center;
  gap: 4px;
  min-width: 92px;
  padding: 10px 14px;
  border: 1px solid var(--character-accent-strong);
  border-radius: 10px;
  background: rgba(255,255,255,0.07);
}
#character-notes .character-dossier-progress-badge strong {
  color: #ffffff;
  font-family: "Hanken Grotesk";
  font-size: 24px;
  line-height: 1;
  font-weight: 800;
}
#character-notes .character-dossier-body {
  display: grid;
  gap: 18px;
  padding: 26px 28px 28px;
  background: #ffffff;
}
#character-notes .character-dossier-overview,
#character-notes .character-dossier-grid,
#character-notes .character-dossier-quote-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}
#character-notes .character-dossier-card,
#character-notes .character-dossier-focus,
#character-notes .character-dossier-entry {
  padding: 18px 20px;
  background: linear-gradient(180deg, var(--character-accent-soft), #f8f9f6 76%);
  border: 1px solid var(--character-accent-medium);
  border-radius: 10px;
}
#character-notes .character-dossier-field {
  display: grid;
  gap: 8px;
}
#character-notes .character-dossier-field span {
  color: var(--character-accent);
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}
#character-notes .character-dossier-field small,
#character-notes .character-dossier-section-heading p,
#character-notes .character-dossier-card p,
#character-notes .character-dossier-focus p,
#character-notes .character-dossier-empty p {
  margin: 0;
  color: #5d6359;
  font-size: 14px;
  line-height: 1.5;
}
#character-notes .character-dossier-field input,
#character-notes .character-dossier-field select,
#character-notes .character-dossier-field textarea {
  width: 100%;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #ffffff;
  color: #191c1d;
  font: inherit;
  padding: 10px 12px;
}
#character-notes .character-dossier-field input {
  min-height: 46px;
}
#character-notes .character-dossier-field select {
  min-height: 46px;
}
#character-notes .character-dossier-field textarea {
  min-height: 132px;
  background: #f8f9fa;
  resize: vertical;
}
#character-notes .character-dossier-field input:focus,
#character-notes .character-dossier-field select:focus,
#character-notes .character-dossier-field textarea:focus {
  outline: 2px solid var(--character-accent-medium);
  border-color: var(--character-accent);
  background: #ffffff;
}
#character-notes .character-dossier-card h4,
#character-notes .character-dossier-focus h4,
#character-notes .character-dossier-section-heading h4,
#character-notes .character-dossier-entry h5 {
  margin: 0;
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-weight: 800;
}
#character-notes .character-dossier-card h4,
#character-notes .character-dossier-focus h4,
#character-notes .character-dossier-section-heading h4 {
  font-size: 24px;
  line-height: 1.2;
}
#character-notes .character-dossier-card h4,
#character-notes .character-dossier-section-heading h4,
#character-notes .character-dossier-entry h5 {
  color: var(--character-accent);
}
#character-notes .character-dossier-focus {
  display: grid;
  gap: 14px;
  background: linear-gradient(145deg, var(--character-accent-fade), #161a17 92%);
  border-color: var(--character-accent-strong);
  color: #ffffff;
}
#character-notes .character-dossier-focus h4,
#character-notes .character-dossier-focus p {
  color: #ffffff;
}
#character-notes .character-dossier-focus .character-dossier-field span,
#character-notes .character-dossier-focus .character-dossier-field small {
  color: #d7ddd4;
}
#character-notes .character-dossier-focus .character-dossier-field textarea {
  background: #222822;
  border-color: rgba(255,255,255,0.18);
  color: #ffffff;
}
#character-notes .character-dossier-focus .character-dossier-field textarea:focus {
  border-color: rgba(255,255,255,0.52);
  outline: 2px solid var(--character-accent-medium);
  background: rgba(255,255,255,0.08);
}
#character-notes .character-dossier-section {
  display: grid;
  gap: 16px;
}
#character-notes .character-dossier-section-heading,
#character-notes .character-dossier-entry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
#character-notes .character-dossier-section-heading > div {
  display: grid;
  gap: 6px;
}
#character-notes .character-dossier-empty {
  padding: 18px 20px;
  border: 1px dashed var(--character-accent-medium);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(var(--character-accent-rgb), 0.03), #ffffff 80%);
}
#character-notes .character-dossier-timeline,
#character-notes .character-dossier-quote-list {
  display: grid;
  gap: 14px;
}
#character-notes .character-dossier-entry {
  display: grid;
  gap: 14px;
}
#character-notes .character-dossier-entry-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
#character-notes .character-dossier-entry-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(var(--character-accent-rgb), 0.1);
  border: 1px solid var(--character-accent-medium);
  color: var(--character-accent);
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
}
#character-notes .character-dossier-section-heading button {
  border-color: var(--character-accent-medium);
  background: rgba(var(--character-accent-rgb), 0.08);
  color: var(--character-accent);
}
#character-notes .character-dossier-section-heading button:hover,
#character-notes .character-dossier-section-heading button:focus-visible,
#character-notes .character-dossier-entry-remove:hover,
#character-notes .character-dossier-entry-remove:focus-visible {
  background: rgba(var(--character-accent-rgb), 0.12);
  border-color: var(--character-accent);
  outline: none;
}
#character-notes .character-dossier-entry-head h5 {
  font-size: 20px;
  line-height: 1.2;
}
#character-notes .character-dossier-quote-entry textarea[data-character-dossier-quote-field="text"] {
  font-family: "Hanken Grotesk";
  font-size: 20px;
  line-height: 1.4;
}

@media (max-width: 1200px) {
  #character-notes .character-dossier-shell {
    grid-template-columns: 1fr;
  }
  #character-notes .character-dossier-nav-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  #character-notes .character-dossier-heading,
  #character-notes .character-dossier-section-heading,
  #character-notes .character-dossier-entry-head {
    flex-direction: column;
  }
  #character-notes .character-dossier-heading-tools {
    width: 100%;
    justify-items: start;
  }
  #character-notes .character-dossier-overview,
  #character-notes .character-dossier-grid,
  #character-notes .character-dossier-quote-grid,
  #character-notes .character-dossier-nav-list {
    grid-template-columns: 1fr;
  }
  #character-notes .character-dossier-body {
    padding: 22px 20px 24px;
  }
}

@media print {
  #character-notes .character-dossier-nav,
  #character-notes .character-dossier-section-heading button,
  #character-notes .character-dossier-entry-remove {
    display: none !important;
  }
  #character-notes .character-dossier-shell {
    display: block;
  }
}

#writing .othello-writing-studio {
  max-width: 1040px;
}
#writing .othello-assignment-shell {
  display: grid;
  gap: 18px;
}
#writing .othello-assignment-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 18px;
  align-items: end;
  padding: 18px 20px;
  background: #f8f9f6;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
}
#writing .othello-assignment-picker-copy {
  display: grid;
  gap: 8px;
}
#writing .othello-assignment-picker-copy label {
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
}
#writing .othello-assignment-picker-copy p {
  margin: 0;
  color: #4d554a;
  line-height: 1.55;
}
#writing .othello-assignment-picker select {
  width: 100%;
}
#writing .othello-assignment-panel {
  background: #ffffff;
  border: 1px solid #d9dadb;
  border-radius: 10px;
  overflow: hidden;
}
#writing .othello-assignment-header {
  padding: 24px 28px;
  background: #161a17;
  color: #ffffff;
}
#writing .othello-assignment-header h3 {
  margin: 0;
  font-family: "Hanken Grotesk";
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.08;
  font-weight: 800;
}
#writing .othello-assignment-header p {
  max-width: 760px;
  margin: 10px 0 0;
  color: #d7ddd4;
  font-size: 16px;
  line-height: 1.55;
}
#writing .othello-assignment-body {
  display: grid;
  gap: 18px;
  padding: 24px 28px 28px;
}
#writing .othello-assignment-grid,
#writing .othello-field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}
#writing .othello-task-card,
#writing .othello-trial-panel,
#writing .othello-trial-checklist,
#writing .othello-progress-note {
  padding: 18px 20px;
  background: #f8f9f6;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
}
#writing .othello-task-card h4,
#writing .othello-trial-panel h4,
#writing .othello-trial-checklist h4 {
  margin: 0 0 12px;
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 24px;
  line-height: 1.2;
  font-weight: 800;
}
#writing .othello-task-card p,
#writing .othello-trial-panel p,
#writing .othello-trial-checklist p {
  margin: 0;
  color: #4d554a;
  line-height: 1.55;
}
#writing .othello-response-field {
  display: grid;
  gap: 8px;
  margin: 0;
}
#writing .othello-response-field > span {
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}
#writing .othello-response-field > small {
  color: #5d6359;
  font-size: 14px;
  line-height: 1.45;
}
#writing .othello-response-field input,
#writing .othello-response-field select,
#writing .othello-response-field textarea,
#writing .othello-micro-table input,
#writing .othello-micro-table select,
#writing .othello-assignment-picker select {
  width: 100%;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #ffffff;
  color: #191c1d;
  font: inherit;
  padding: 10px 12px;
}
#writing .othello-response-field input,
#writing .othello-micro-table input {
  min-height: 46px;
}
#writing .othello-response-field select,
#writing .othello-micro-table select,
#writing .othello-assignment-picker select {
  min-height: 48px;
}
#writing .othello-response-field textarea {
  min-height: 112px;
  background: #f8f9fa;
  resize: vertical;
}
#writing .othello-response-field input:focus,
#writing .othello-response-field select:focus,
#writing .othello-response-field textarea:focus,
#writing .othello-micro-table input:focus,
#writing .othello-micro-table select:focus,
#writing .othello-assignment-picker select:focus {
  outline: 2px solid rgba(21, 66, 18, 0.18);
  border-color: #154212;
}
#writing .othello-language-shell {
  display: grid;
  gap: 18px;
}
#writing .othello-language-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 260px);
  gap: 16px;
  align-items: start;
}
#writing .othello-language-nav {
  width: min(100%, 320px);
}
#writing .othello-language-nav .overlay-select-trigger {
  min-height: 46px;
  border-color: #d3d9cb;
  padding: 10px 14px;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
}
#writing .othello-language-nav .overlay-select-trigger:hover,
#writing .othello-language-nav .overlay-select-trigger:focus-visible,
#writing .othello-language-nav .overlay-select-shell.is-open .overlay-select-trigger {
  border-color: #154212;
  color: #154212;
}
#writing .othello-language-nav .overlay-select-shell.is-open .overlay-select-trigger {
  box-shadow: 0 0 0 2px rgba(21, 66, 18, 0.14);
}
#writing .othello-language-nav .overlay-select-trigger .material-symbols-outlined {
  color: #5d6359;
}
#writing .othello-language-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #d3d9cb;
  border-radius: 8px;
  background: #ffffff;
  color: #2e342d;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
}
#writing .othello-language-tab .material-symbols-outlined {
  font-size: 18px;
}
#writing .othello-language-tab:hover,
#writing .othello-language-tab:focus-visible {
  border-color: #154212;
  color: #154212;
}
#writing .othello-language-tab.is-active {
  border-color: #154212;
  background: #154212;
  color: #ffffff;
}
#writing .othello-language-scorecard {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
  background: #f8f9f6;
}
#writing .othello-language-scorecard span {
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
#writing .othello-language-scorecard strong {
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
}
#writing .othello-language-scorecard p {
  margin: 0;
  color: #596056;
  font-size: 14px;
  line-height: 1.5;
}
#writing .othello-language-progress {
  height: 8px;
  border-radius: 999px;
  background: #dde4d7;
  overflow: hidden;
}
#writing .othello-language-progress > div {
  width: 0;
  height: 100%;
  background: #154212;
  transition: width 180ms ease;
}
#writing .othello-language-page {
  display: grid;
  gap: 16px;
}
#writing .othello-language-page[hidden] {
  display: none;
}
#writing .othello-language-page-head {
  display: grid;
  gap: 8px;
}
#writing .othello-language-page-head h4 {
  margin: 0;
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 28px;
  line-height: 1.1;
  font-weight: 800;
}
#writing .othello-language-page-head p {
  margin: 0;
  max-width: 760px;
  color: #4d554a;
  line-height: 1.55;
}
#writing .othello-language-status {
  padding: 12px 14px;
  border-left: 3px solid #154212;
  border-radius: 0 8px 8px 0;
  background: #f5f7f2;
  color: #31372f;
  font-size: 14px;
  line-height: 1.5;
}
#writing .othello-language-match-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
#writing .othello-language-choice-column,
#writing .othello-language-contraction-card,
#writing .othello-language-pronoun-card,
#writing .othello-language-sentence-card {
  padding: 18px 20px;
  background: #f8f9f6;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
}
#writing .othello-language-column-label,
#writing .othello-language-sentence-prompt span,
#writing .othello-language-sentence-build span,
#writing .othello-language-sentence-bank span {
  display: block;
  margin-bottom: 12px;
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
#writing .othello-language-choice-list {
  display: grid;
  gap: 10px;
}
#writing .othello-language-choice-button {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #d2d9cb;
  border-radius: 8px;
  background: #ffffff;
  color: #222723;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: border-color 140ms ease, background-color 140ms ease, color 140ms ease, opacity 140ms ease;
}
#writing .othello-language-choice-button:hover,
#writing .othello-language-choice-button:focus-visible {
  border-color: #154212;
}
#writing .othello-language-choice-button.is-selected {
  border-color: #154212;
  background: #eef5ea;
  color: #154212;
}
#writing .othello-language-choice-button.is-error {
  border-color: #b44528;
  background: #fbefeb;
  color: #8e2f18;
}
#writing .othello-language-choice-button.is-complete {
  border-color: #7eab73;
  background: #eaf3e4;
  color: #0d4f12;
  cursor: default;
}
#writing .othello-language-contraction-grid,
#writing .othello-language-pronoun-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
#writing .othello-language-contraction-card {
  display: grid;
  gap: 12px;
}
#writing .othello-language-contraction-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
#writing .othello-language-contraction-head strong {
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 22px;
  line-height: 1.1;
  font-weight: 800;
}
#writing .othello-language-contraction-head span {
  color: #697066;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
#writing .othello-language-input-wrap {
  position: relative;
}
#writing .othello-language-input-wrap input {
  width: 100%;
  min-height: 48px;
  padding: 0 42px 0 12px;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #ffffff;
  color: #191c1d;
  font: inherit;
}
#writing .othello-language-inline-icon {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  font-size: 20px;
}
#writing .othello-language-contraction-card small,
#writing .othello-language-pronoun-card small,
#writing .othello-language-sentence-actions p {
  color: #5c6359;
  font-size: 14px;
  line-height: 1.5;
}
#writing .othello-language-contraction-card.is-correct .othello-language-input-wrap input,
#writing .othello-language-pronoun-card.is-correct select,
#writing .othello-language-built-area.is-correct {
  border-color: #7eab73;
  background: #f3f8ef;
}
#writing .othello-language-contraction-card.is-correct .othello-language-inline-icon,
#writing .othello-language-sentence-actions.is-correct p {
  color: #0d4f12;
}
#writing .othello-language-contraction-card.is-incorrect .othello-language-input-wrap input,
#writing .othello-language-pronoun-card.is-incorrect select,
#writing .othello-language-built-area.is-error {
  border-color: #b44528;
  background: #fcf1ec;
}
#writing .othello-language-contraction-card.is-incorrect .othello-language-inline-icon,
#writing .othello-language-sentence-actions.is-error p {
  color: #8e2f18;
}
#writing .othello-language-pronoun-card {
  display: grid;
  gap: 12px;
}
#writing .othello-language-pronoun-card p {
  margin: 0;
  color: #1f2320;
  font-size: 18px;
  line-height: 1.65;
}
#writing .othello-language-pronoun-card select {
  min-width: 140px;
  margin: 0 6px;
  padding: 8px 10px;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #ffffff;
  color: #191c1d;
  font: inherit;
}
#writing .othello-language-sentence-list {
  display: grid;
  gap: 16px;
}
#writing .othello-language-sentence-card {
  display: grid;
  gap: 16px;
}
#writing .othello-language-sentence-prompt p {
  margin: 0;
  color: #191c1d;
  font-size: 20px;
  line-height: 1.45;
  font-weight: 600;
}
#writing .othello-language-built-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 96px;
  padding: 14px;
  border: 1px dashed #bfc6b7;
  border-radius: 10px;
  background: #ffffff;
  align-content: start;
}
#writing .othello-language-built-placeholder {
  color: #72796f;
  font-style: italic;
}
#writing .othello-language-word-bank {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
#writing .othello-language-word-chip {
  padding: 9px 12px;
  border: 1px solid #cdd3c7;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2320;
  font-family: "Work Sans";
  font-size: 16px;
  line-height: 1.3;
  cursor: pointer;
  transition: border-color 140ms ease, background-color 140ms ease, color 140ms ease;
}
#writing .othello-language-word-chip:hover,
#writing .othello-language-word-chip:focus-visible {
  border-color: #154212;
  color: #154212;
}
#writing .othello-language-word-chip.is-built {
  background: #154212;
  border-color: #154212;
  color: #ffffff;
}
#writing .othello-language-sentence-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
#writing .othello-language-sentence-actions button {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid #154212;
  border-radius: 8px;
  background: #154212;
  color: #ffffff;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
#writing .othello-language-sentence-actions button:disabled {
  border-color: #d0d6cb;
  background: #eef1eb;
  color: #7b8378;
  cursor: not-allowed;
}
#writing .othello-language-sentence-actions p {
  margin: 0;
}
@media (max-width: 900px) {
  #writing .othello-language-toolbar,
  #writing .othello-language-match-grid,
  #writing .othello-language-contraction-grid,
  #writing .othello-language-pronoun-grid {
    grid-template-columns: 1fr;
  }
  #writing .othello-language-sentence-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
@media (max-width: 720px) {
  #writing .othello-language-tab {
    width: 100%;
    justify-content: center;
  }
  #writing .othello-language-pronoun-card p {
    font-size: 16px;
  }
  #writing .othello-language-pronoun-card select {
    width: 100%;
    margin: 8px 0;
  }
  #writing .othello-language-built-area {
    min-height: 84px;
  }
}
#writing .othello-close-reading-shell {
  display: grid;
  gap: 18px;
}
#writing .othello-close-reading-summary {
  display: grid;
  gap: 18px;
}
#writing .othello-close-reading-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
#writing .othello-close-reading-summary-box {
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
}
#writing .othello-close-reading-summary-box span,
#writing .othello-close-reading-note p span,
#writing .othello-close-reading-reference-grid span,
#writing .othello-close-reading-evidence-chip strong {
  display: block;
  margin-bottom: 4px;
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
#writing .othello-close-reading-summary-box strong {
  display: block;
  margin-top: 6px;
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 28px;
  line-height: 1.05;
  font-weight: 800;
}
#writing .othello-close-reading-summary-box p {
  margin: 8px 0 0;
  color: #596056;
  line-height: 1.5;
}
#writing .othello-close-reading-browser {
  display: grid;
  background: #ffffff;
  border: 1px solid #d9dadb;
  border-radius: 10px;
  overflow: hidden;
}
#writing .othello-close-reading-toolbar,
#writing .othello-close-reading-fallback {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e8e1;
  background: #f8f9f6;
}
#writing .othello-close-reading-toolbar-actions {
  display: flex;
  align-items: end;
  gap: 10px;
  flex-wrap: wrap;
}
#writing .othello-close-reading-toolbar-actions button,
#writing .othello-close-reading-fallback button,
#writing .othello-close-reading-note-actions button {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #cfd7c8;
  border-radius: 8px;
  background: #ffffff;
  color: #2e342d;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
}
#writing .othello-close-reading-toolbar-actions label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #cfd7c8;
  border-radius: 8px;
  background: #ffffff;
  color: #2e342d;
  font-size: 14px;
}
#writing .othello-close-reading-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  align-items: start;
}
#writing .othello-close-reading-passage {
  min-width: 0;
  border-right: 1px solid #e5e8e1;
}
#writing .othello-close-reading-passage-head,
#writing .othello-close-reading-sidebar-head {
  display: grid;
  gap: 8px;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e8e1;
  background: #ffffff;
}
#writing .othello-close-reading-passage-head p:first-child,
#writing .othello-close-reading-sidebar-head h4 {
  margin: 0;
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
#writing .othello-close-reading-passage-head h4 {
  margin: 0;
  color: #191c1d;
  font-family: "Hanken Grotesk";
  font-size: 28px;
  line-height: 1.1;
  font-weight: 800;
}
#writing .othello-close-reading-passage-head p:last-child,
#writing .othello-close-reading-sidebar-head p {
  margin: 0;
  color: #596056;
  line-height: 1.5;
}
#writing .othello-close-reading-passage-text {
  display: grid;
  gap: 12px;
  padding: 22px;
  background: #ffffff;
}
#writing .othello-close-reading-line {
  display: grid;
  grid-template-columns: 44px 110px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}
#writing .othello-close-reading-line-number {
  color: #7c8478;
  font-size: 12px;
  line-height: 1.7;
  text-align: right;
}
#writing .othello-close-reading-line-speaker {
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.7;
}
#writing .othello-close-reading-line-text {
  color: #202523;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 19px;
  line-height: 1.8;
}
#writing .othello-close-reading-line-text.is-annotated {
  padding: 2px 8px;
  border-left: 3px solid #154212;
  background: #f4f7f1;
  border-radius: 6px;
}
#writing .othello-close-reading-sidebar {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  background: #fbfcfa;
}
#writing .othello-close-reading-annotation-list {
  display: grid;
  gap: 14px;
  padding: 18px 22px 22px;
}
#writing .othello-close-reading-empty {
  padding: 22px 18px;
  border: 1px dashed #cfd7c8;
  border-radius: 10px;
  background: #ffffff;
  color: #65705f;
  line-height: 1.55;
}
#writing .othello-close-reading-note {
  padding: 16px 18px;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
  background: #ffffff;
}
#writing .othello-close-reading-note.is-selected {
  border-color: #154212;
  box-shadow: inset 0 0 0 1px #154212;
}
#writing .othello-close-reading-note-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}
#writing .othello-close-reading-note-head strong {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 7px;
  background: #edf4e7;
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
#writing .othello-close-reading-note-actions {
  display: inline-flex;
  gap: 6px;
}
#writing .othello-close-reading-note blockquote,
#writing .othello-close-reading-reference blockquote {
  margin: 12px 0;
  padding-left: 12px;
  border-left: 3px solid #d8dfd1;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 16px;
  line-height: 1.7;
}
#writing .othello-close-reading-note p {
  margin: 8px 0 0;
  color: #535c51;
  line-height: 1.55;
}
#writing .othello-close-reading-analysis {
  display: grid;
  gap: 18px;
}
#writing .othello-close-reading-analysis-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 18px;
  align-items: end;
}
#writing .othello-close-reading-reference {
  padding: 18px 20px;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
  background: #161a17;
  color: #ffffff;
}
#writing .othello-close-reading-reference strong {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 7px;
  background: rgba(255,255,255,0.08);
  color: #d7ddd4;
  font-family: "IBM Plex Sans";
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
#writing .othello-close-reading-reference-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
#writing .othello-close-reading-reference-grid div {
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
}
#writing .othello-close-reading-analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
#writing .othello-close-reading-analysis-card {
  display: grid;
  gap: 12px;
}
#writing .othello-close-reading-synthesis {
  display: grid;
  gap: 16px;
}
#writing .othello-close-reading-evidence-bank {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
#writing .othello-close-reading-evidence-chip {
  padding: 14px 16px;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
  background: #ffffff;
}
#writing .othello-close-reading-evidence-chip p {
  margin: 0;
  color: #535c51;
  line-height: 1.5;
}
#writing .othello-close-reading-synthesis-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
#writing .othello-close-reading-synthesis-meta p {
  margin: 0;
  color: #596056;
}
#writing .othello-close-reading-synthesis-meta strong {
  color: #191c1d;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
}
#writing .othello-close-reading-modal {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(18, 22, 19, 0.68);
}
#writing .othello-close-reading-modal[hidden] {
  display: none !important;
  pointer-events: none;
}
#writing .othello-close-reading-modal-card {
  width: min(760px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 24px 56px rgba(17, 21, 18, 0.24);
}
#writing .othello-close-reading-modal-head,
#writing .othello-close-reading-modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
}
#writing .othello-close-reading-modal-head {
  border-bottom: 1px solid #e5e8e1;
  background: #161a17;
  color: #ffffff;
}
#writing .othello-close-reading-modal-head h4,
#writing .othello-close-reading-modal-foot p {
  margin: 0;
}
#writing .othello-close-reading-modal-body {
  display: grid;
  gap: 16px;
  padding: 22px;
}
#writing .othello-close-reading-modal-quote {
  padding: 16px 18px;
  border-left: 3px solid #154212;
  border-radius: 0 10px 10px 0;
  background: #f6f8f3;
  color: #202523;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 17px;
  line-height: 1.7;
}
#writing .othello-close-reading-modal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
#writing .othello-close-reading-modal-check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
  background: #f8f9f6;
  color: #2e342d;
  font-size: 14px;
  line-height: 1.5;
}
#writing .othello-close-reading-modal-foot {
  border-top: 1px solid #e5e8e1;
  background: #f8f9f6;
}
#writing .othello-close-reading-modal-foot-buttons {
  display: inline-flex;
  gap: 10px;
}
#writing .othello-close-reading-modal-foot button {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
}
#writing .othello-close-reading-modal-foot button[data-close-reading-modal-close] {
  border: 1px solid #cfd7c8;
  background: #ffffff;
  color: #2e342d;
}
#writing .othello-close-reading-modal-foot button[data-close-reading-modal-save] {
  border: 1px solid #154212;
  background: #154212;
  color: #ffffff;
}
#writing .othello-theme-shell {
  display: grid;
  gap: 20px;
}
#writing .othello-theme-summary,
#writing .othello-theme-section {
  display: grid;
  gap: 18px;
}
#writing .othello-theme-summary-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
}
#writing .othello-theme-summary-box,
#writing .othello-theme-card,
#writing .othello-theme-diagnostic-card,
#writing .othello-theme-evidence-card,
#writing .othello-theme-pattern-card,
#writing .othello-theme-final-layout,
#writing .othello-theme-response-layout,
#writing .othello-theme-compiled,
#writing .othello-theme-draft-card,
#writing .othello-theme-topic-reason {
  border: 1px solid #d9dfd4;
  border-radius: 14px;
  background: #ffffff;
}
#writing .othello-theme-summary-box,
#writing .othello-theme-draft-card,
#writing .othello-theme-topic-reason,
#writing .othello-theme-final-layout,
#writing .othello-theme-response-layout,
#writing .othello-theme-compiled {
  padding: 18px;
}
#writing .othello-theme-summary-box span,
#writing .othello-theme-step,
#writing .othello-theme-subhead,
#writing .othello-theme-meta,
#writing .othello-theme-evidence-card small,
#writing .othello-theme-compiled-meta {
  display: block;
  color: #35583a;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
#writing .othello-theme-summary-box strong {
  display: block;
  margin-top: 8px;
  color: #171b17;
  font-family: "Hanken Grotesk";
  font-size: 42px;
  line-height: 1;
  font-weight: 800;
}
#writing .othello-theme-summary-box p,
#writing .othello-theme-section-head p,
#writing .othello-theme-card p,
#writing .othello-theme-diagnostic-card p,
#writing .othello-theme-pattern-copy p,
#writing .othello-theme-compiled p {
  margin: 0;
  color: #4d564c;
  line-height: 1.6;
}
#writing .othello-theme-section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}
#writing .othello-theme-section-head h4,
#writing .othello-theme-card h5,
#writing .othello-theme-diagnostic-card h5,
#writing .othello-theme-pattern-card h5,
#writing .othello-theme-final-layout h5,
#writing .othello-theme-response-layout h5,
#writing .othello-theme-compiled h5,
#writing .othello-theme-sort-column h5,
#writing .othello-theme-pattern-column h5,
#writing .othello-theme-pattern-workspace h5 {
  margin: 4px 0 8px;
  color: #171b17;
  font-family: "Hanken Grotesk";
  font-size: 20px;
  line-height: 1.15;
  font-weight: 800;
}
#writing .othello-theme-section-head h4 {
  font-size: 32px;
}
#writing .othello-theme-pill {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #c7d0c3;
  background: #f7f9f5;
  color: #35583a;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}
#writing .othello-theme-actions,
#writing .othello-theme-classify,
#writing .othello-theme-diagnostic-issues,
#writing .othello-theme-topic-choice,
#writing .othello-theme-pattern-toggle-list,
#writing .othello-theme-tag-list,
#writing .othello-theme-pattern-actions,
#writing .othello-theme-evidence-toolbar,
#writing .othello-theme-save-row,
#writing .othello-theme-response-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
#writing .othello-theme-actions button,
#writing .othello-theme-save-row button,
#writing .othello-theme-evidence-toolbar button,
#writing .othello-theme-pattern-actions button,
#writing .othello-theme-response-toolbar button,
#writing .othello-theme-classify button,
#writing .othello-theme-diagnostic-issues button,
#writing .othello-theme-topic-choice button,
#writing .othello-theme-pattern-toggle-list button {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid #c3cbbb;
  background: #ffffff;
  color: #25462a;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
#writing .othello-theme-actions button,
#writing .othello-theme-save-row button[data-theme-save-evidence],
#writing .othello-theme-response-toolbar button,
#writing .othello-theme-save-row button[data-theme-commit-final] {
  background: #0d4f12;
  border-color: #0d4f12;
  color: #ffffff;
}
#writing .othello-theme-classify button.is-active,
#writing .othello-theme-diagnostic-issues button.is-active,
#writing .othello-theme-topic-choice button.is-active,
#writing .othello-theme-pattern-toggle-list button.is-active {
  background: #ebf5ec;
  border-color: #0d4f12;
  color: #0d4f12;
}
#writing .othello-theme-sort-grid,
#writing .othello-theme-diagnostic-grid,
#writing .othello-theme-drafts-grid,
#writing .othello-theme-pattern-layout,
#writing .othello-theme-final-grid,
#writing .othello-theme-response-grid {
  display: grid;
  gap: 16px;
}
#writing .othello-theme-sort-grid {
  grid-template-columns: 1.2fr 1fr 1fr;
}
#writing .othello-theme-diagnostic-grid,
#writing .othello-theme-drafts-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
#writing .othello-theme-sort-column,
#writing .othello-theme-pattern-column,
#writing .othello-theme-pattern-workspace {
  border: 1px solid #d9dfd4;
  border-radius: 14px;
  background: #f8faf7;
  padding: 16px;
}
#writing .othello-theme-card,
#writing .othello-theme-diagnostic-card,
#writing .othello-theme-evidence-card,
#writing .othello-theme-pattern-card {
  padding: 16px;
}
#writing .othello-theme-card blockquote,
#writing .othello-theme-diagnostic-card blockquote,
#writing .othello-theme-evidence-card blockquote,
#writing .othello-theme-final-quote {
  margin: 12px 0;
  padding: 14px 16px;
  border-left: 3px solid #0d4f12;
  background: #f8faf7;
  color: #242924;
  font-family: "Lora", serif;
  font-size: 19px;
  line-height: 1.55;
}
#writing .othello-theme-diagnostic-feedback,
#writing .othello-theme-callout,
#writing .othello-theme-empty {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #d9dfd4;
  background: #f8faf7;
}
#writing .othello-theme-empty {
  border-style: dashed;
  background: #fbfcfa;
  color: #596056;
}
#writing .othello-theme-draft-card textarea,
#writing .othello-theme-topic-reason textarea,
#writing .othello-theme-evidence-form textarea,
#writing .othello-theme-evidence-form input,
#writing .othello-theme-evidence-form select,
#writing .othello-theme-pattern-card textarea,
#writing .othello-theme-pattern-card input,
#writing .othello-theme-final-grid textarea,
#writing .othello-theme-response-grid textarea,
#writing .othello-theme-compiled textarea {
  width: 100%;
  border: 1px solid #c9d1c4;
  border-radius: 12px;
  background: #ffffff;
  padding: 12px 14px;
  font: inherit;
}
#writing .othello-theme-draft-card textarea,
#writing .othello-theme-topic-reason textarea,
#writing .othello-theme-final-grid textarea,
#writing .othello-theme-response-grid textarea {
  min-height: 120px;
}
#writing .othello-theme-compiled textarea {
  min-height: 260px;
  font-family: "Lora", serif;
  font-size: 17px;
  line-height: 1.7;
}
#writing .othello-theme-draft-meta,
#writing .othello-theme-topic-meta,
#writing .othello-theme-evidence-meta,
#writing .othello-theme-final-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  color: #596056;
  font-size: 12px;
}
#writing .othello-theme-evidence-form,
#writing .othello-theme-pattern-stack,
#writing .othello-theme-revision-list {
  display: grid;
  gap: 14px;
}
#writing .othello-theme-evidence-grid,
#writing .othello-theme-final-grid,
#writing .othello-theme-response-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
#writing .othello-theme-evidence-grid .othello-response-field:last-child,
#writing .othello-theme-final-grid .othello-response-field:first-child,
#writing .othello-theme-final-grid .othello-response-field:last-child,
#writing .othello-theme-response-grid .othello-response-field {
  grid-column: 1 / -1;
}
#writing .othello-theme-pattern-layout {
  grid-template-columns: minmax(240px, 0.95fr) minmax(0, 1.3fr);
}
#writing .othello-theme-pattern-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ebf5ec;
  color: #0d4f12;
  font-size: 13px;
  font-weight: 700;
}
#writing .othello-theme-pattern-copy {
  display: grid;
  gap: 10px;
}
#writing .othello-theme-revision-item {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #d9dfd4;
  background: #f8faf7;
  color: #2d332d;
  font-size: 13px;
}
#writing .othello-theme-summary-copy {
  display: grid;
  gap: 8px;
}
#writing .othello-theme-variant-grid,
#writing .othello-theme-editorial-flow,
#writing .othello-theme-notebook-stack {
  display: grid;
  gap: 18px;
}
#writing .othello-theme-variant-grid--pair {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}
#writing .othello-theme-variant-grid--editorial {
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  align-items: start;
}
#writing .othello-theme-shell--editorial {
  gap: 28px;
}
#writing .othello-theme-shell--editorial .othello-theme-summary {
  padding: 28px 30px;
  border-radius: 14px;
  background: #f3f0e7;
  border-color: #ddd6c6;
}
#writing .othello-theme-shell--editorial .othello-theme-summary-grid {
  margin-top: 6px;
}
#writing .othello-theme-shell--editorial .othello-theme-summary-box {
  background: rgba(255,255,255,0.72);
  border-color: #d9d1c0;
}
#writing .othello-theme-shell--editorial .othello-theme-section {
  padding: 24px 0 0;
  border: none;
  border-top: 1px solid #ddd9cd;
  border-radius: 0;
  background: transparent;
}
#writing .othello-theme-shell--editorial .othello-theme-section:first-child {
  padding-top: 0;
  border-top: none;
}
#writing .othello-theme-shell--editorial .othello-theme-section-head {
  padding: 0 4px 4px;
}
#writing .othello-theme-shell--editorial .othello-theme-pill {
  background: #ffffff;
  border-color: #d4cebe;
}
#writing .othello-theme-shell--editorial .othello-theme-sort-column,
#writing .othello-theme-shell--editorial .othello-theme-pattern-column,
#writing .othello-theme-shell--editorial .othello-theme-pattern-workspace {
  background: #fbfaf7;
  border-color: #ddd9cd;
}
#writing .othello-theme-shell--workshop {
  gap: 22px;
}
#writing .othello-theme-shell--workshop .othello-theme-summary {
  padding: 24px 26px;
  border-radius: 14px;
  background: #edf4e8;
  border-color: #d1ddcd;
}
#writing .othello-theme-shell--workshop .othello-theme-summary-box {
  background: #f8fbf5;
  border-color: #cfdbca;
}
#writing .othello-theme-shell--workshop .othello-theme-section {
  padding: 22px 22px 24px;
  border-radius: 16px;
  background: #fbfcf9;
  border-color: #d6ddd2;
}
#writing .othello-theme-shell--workshop .othello-theme-section-head {
  gap: 14px;
}
#writing .othello-theme-shell--workshop .othello-theme-section-head h4 {
  font-size: 28px;
}
#writing .othello-theme-shell--workshop .othello-theme-pill {
  background: #ffffff;
}
#writing .othello-theme-shell--workshop .othello-theme-sort-column,
#writing .othello-theme-shell--workshop .othello-theme-pattern-column,
#writing .othello-theme-shell--workshop .othello-theme-pattern-workspace {
  background: #f3f7ef;
  border-style: dashed;
}
#writing .othello-theme-shell--notebook {
  gap: 24px;
}
#writing .othello-theme-shell--notebook .othello-theme-summary {
  padding: 26px 28px;
  border-radius: 14px;
  background: #faf7ef;
  border-color: #ddd2be;
}
#writing .othello-theme-shell--notebook .othello-theme-summary-box {
  background: rgba(255,255,255,0.74);
  border-color: #ded3c2;
}
#writing .othello-theme-shell--notebook .othello-theme-section {
  padding: 24px 24px 24px 28px;
  border-radius: 14px;
  background: #fffdf7;
  border-color: #ddd2be;
  box-shadow: inset 5px 0 0 #d9c29b;
}
#writing .othello-theme-shell--notebook .othello-theme-section-head {
  grid-template-columns: minmax(0, 1fr);
}
#writing .othello-theme-shell--notebook .othello-theme-section-head h4 {
  font-size: 30px;
}
#writing .othello-theme-shell--notebook .othello-theme-step,
#writing .othello-theme-shell--notebook .othello-theme-summary-box span,
#writing .othello-theme-shell--notebook .othello-theme-subhead,
#writing .othello-theme-shell--notebook .othello-theme-meta,
#writing .othello-theme-shell--notebook .othello-theme-evidence-card small,
#writing .othello-theme-shell--notebook .othello-theme-compiled-meta {
  color: #715e34;
}
#writing .othello-theme-shell--notebook .othello-theme-pill {
  width: fit-content;
  background: #fffaf0;
  border-color: #d8ccb7;
  color: #715e34;
}
#writing .othello-theme-shell--notebook .othello-theme-card blockquote,
#writing .othello-theme-shell--notebook .othello-theme-diagnostic-card blockquote,
#writing .othello-theme-shell--notebook .othello-theme-evidence-card blockquote,
#writing .othello-theme-shell--notebook .othello-theme-final-quote {
  border-left-color: #9a7b48;
  background: #fcf8ef;
}
#writing .othello-theme-shell--notebook .othello-theme-sort-column,
#writing .othello-theme-shell--notebook .othello-theme-pattern-column,
#writing .othello-theme-shell--notebook .othello-theme-pattern-workspace,
#writing .othello-theme-shell--notebook .othello-theme-diagnostic-feedback,
#writing .othello-theme-shell--notebook .othello-theme-callout,
#writing .othello-theme-shell--notebook .othello-theme-empty,
#writing .othello-theme-shell--notebook .othello-theme-revision-item {
  background: #fcf8ef;
  border-color: #e2d6c2;
}
#writing .othello-theme-shell--pathway {
  gap: 18px;
}
#writing .othello-theme-pathway-brief {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  gap: 24px;
  align-items: end;
  padding: 24px 26px;
  border: 1px solid #d8dfd1;
  border-radius: 12px;
  background: #f7f8f2;
}
#writing .othello-theme-pathway-brief h4 {
  margin: 0 0 8px;
  color: #171b17;
  font-family: "Hanken Grotesk";
  font-size: 30px;
  line-height: 1.1;
  font-weight: 800;
}
#writing .othello-theme-pathway-brief p {
  max-width: 780px;
  margin: 0;
  color: #4d564c;
  line-height: 1.55;
}
#writing .othello-theme-pathway-progress {
  display: grid;
  gap: 6px;
  justify-items: end;
  color: #35583a;
  font-weight: 700;
}
#writing .othello-theme-pathway-progress strong {
  color: #171b17;
  font-family: "Hanken Grotesk";
  font-size: 40px;
  line-height: 1;
  font-weight: 800;
}
#writing .othello-theme-pathway-progress span {
  text-align: right;
  font-size: 13px;
  line-height: 1.35;
}
#writing .othello-theme-stage-picker {
  display: grid;
  gap: 8px;
  max-width: 520px;
}
#writing .othello-theme-stage-picker > label {
  color: #35583a;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
}
#writing .othello-theme-pathway-stage {
  min-width: 0;
}
#writing .othello-theme-shell--pathway .othello-theme-section {
  padding: 26px;
  border-radius: 12px;
  background: #ffffff;
  border-color: #d8dfd1;
}
#writing .othello-theme-shell--pathway .othello-theme-section-head {
  padding-bottom: 18px;
  border-bottom: 1px solid #e2e6de;
}
#writing .othello-theme-shell--pathway .othello-theme-section-head h4 {
  font-size: 34px;
}
#writing .othello-theme-shell--pathway .othello-theme-pill {
  border-radius: 8px;
}
#writing .othello-theme-shell--pathway .othello-theme-sort-column,
#writing .othello-theme-shell--pathway .othello-theme-pattern-column,
#writing .othello-theme-shell--pathway .othello-theme-pattern-workspace {
  border-radius: 10px;
  background: #fbfcfa;
}
@media (max-width: 980px) {
  #writing .othello-close-reading-summary-grid,
  #writing .othello-close-reading-analysis-grid,
  #writing .othello-close-reading-evidence-bank,
  #writing .othello-close-reading-reference-grid,
  #writing .othello-close-reading-modal-grid,
  #writing .othello-close-reading-layout,
  #writing .othello-close-reading-analysis-head,
  #writing .othello-close-reading-toolbar,
  #writing .othello-close-reading-fallback,
  #writing .othello-theme-variant-grid--pair,
  #writing .othello-theme-variant-grid--editorial,
  #writing .othello-theme-sort-grid,
  #writing .othello-theme-pattern-layout,
  #writing .othello-theme-evidence-grid,
  #writing .othello-theme-final-grid,
  #writing .othello-theme-response-grid,
  #writing .othello-theme-pathway-brief {
    grid-template-columns: 1fr;
  }
  #writing .othello-theme-pathway-progress {
    justify-items: start;
  }
  #writing .othello-theme-pathway-progress span {
    text-align: left;
  }
  #writing .othello-close-reading-passage {
    border-right: none;
    border-bottom: 1px solid #e5e8e1;
  }
}
@media (max-width: 720px) {
  #writing .othello-close-reading-line {
    grid-template-columns: 36px 80px minmax(0, 1fr);
    gap: 10px;
  }
  #writing .othello-close-reading-line-text {
    font-size: 17px;
  }
  #writing .othello-theme-section-head,
  #writing .othello-theme-evidence-toolbar,
  #writing .othello-theme-save-row,
  #writing .othello-theme-response-toolbar,
  #writing .othello-theme-draft-meta,
  #writing .othello-theme-topic-meta,
  #writing .othello-theme-evidence-meta,
  #writing .othello-theme-final-meta {
    flex-direction: column;
    align-items: start;
  }
  #writing .othello-theme-section-head h4 {
    font-size: 28px;
  }
  #writing .othello-theme-shell--notebook .othello-theme-section {
    padding-left: 22px;
  }
}
#writing .othello-inline-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 14px;
}
#writing .othello-inline-options label {
  display: flex;
  align-items: start;
  gap: 8px;
  min-height: 100%;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  color: #31372f;
  line-height: 1.45;
  cursor: pointer;
}
#writing .othello-inline-options input {
  margin-top: 2px;
}
#writing .othello-inline-options span {
  display: inline-block;
}
#writing .othello-table-wrap {
  overflow-x: auto;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
  background: #ffffff;
}
#writing .othello-micro-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}
#writing .othello-micro-table th,
#writing .othello-micro-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #e6e8e5;
  text-align: left;
  vertical-align: top;
}
#writing .othello-micro-table th {
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.01em;
  background: #f5f7f2;
}
#writing .othello-micro-table tbody tr:last-child td {
  border-bottom: 0;
}
#writing .othello-trial-heading {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}
#writing .othello-responsibility-total {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #d0d8c8;
  border-radius: 999px;
  background: #f4f7ef;
  color: #154212;
  font-family: "IBM Plex Sans";
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
#writing .othello-responsibility-total.is-on {
  border-color: #7fab73;
  background: #e8f2e3;
  color: #0d4f12;
}
#writing .othello-responsibility-total.is-off {
  border-color: #d8c9ad;
  background: #fbf8ef;
  color: #68511b;
}
#writing .othello-blame-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}
#writing .othello-blame-row {
  display: grid;
  grid-template-columns: minmax(120px, 160px) minmax(0, 1fr) 52px;
  gap: 12px;
  align-items: center;
}
#writing .othello-blame-row > span {
  color: #191c1d;
  font-weight: 700;
}
#writing .othello-blame-row input[type="range"] {
  width: 100%;
  accent-color: #154212;
}
#writing .othello-blame-row strong {
  color: #154212;
  text-align: right;
}
#writing .othello-progress-note {
  color: #5b5434;
  line-height: 1.5;
}
#writing .othello-citation-guide {
  padding: 16px 18px;
  border-left: 3px solid #154212;
  border-radius: 0 10px 10px 0;
  background: #f5f7f2;
  color: #31372f;
}
#writing .othello-citation-guide strong {
  color: #154212;
}
#writing .othello-citation-guide ul {
  margin: 10px 0 0;
  padding-left: 18px;
}
#writing .othello-citation-guide li + li {
  margin-top: 8px;
}
#writing .othello-trial-card h4 small {
  display: inline-block;
  margin-left: 6px;
  color: #5d6359;
  font-size: 14px;
  font-weight: 600;
}
#writing .othello-trial-checklist {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px 16px;
}
#writing .othello-trial-checklist h4 {
  grid-column: 1 / -1;
}
#writing .othello-trial-checklist label {
  display: flex;
  align-items: start;
  gap: 8px;
  color: #31372f;
  line-height: 1.45;
}
#writing .othello-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
#writing .othello-action-row button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #154212;
  background: #154212;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
#writing .othello-action-row button + button {
  background: #ffffff;
  color: #154212;
}
#writing .othello-action-row button:hover,
#writing .othello-action-row button:focus-visible {
  outline: 2px solid rgba(21, 66, 18, 0.18);
  outline-offset: 2px;
}
#writing .othello-export-box {
  margin: 0;
  padding: 14px 16px;
  background: #161a17;
  border: 1px solid #2b332c;
  border-radius: 10px;
  color: #e5ede1;
  font-size: 13px;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;
}
#writing .othello-export-card {
  display: grid;
  gap: 14px;
}

@media print {
  .course-topbar,
  .course-sidebar,
  #topbar-menu-toggle {
    display: none !important;
  }
  .course-main {
    margin: 0 !important;
    padding: 0 !important;
  }
  .course-main > div {
    max-width: none !important;
  }
  .course-page {
    display: none !important;
  }
  #writing.course-page {
    display: block !important;
  }
  #writing .othello-assignment-picker,
  #writing .othello-action-row,
  #writing .othello-export-card,
  #writing .othello-language-nav,
  #writing .othello-language-scorecard {
    display: none !important;
  }
  #writing .othello-writing-studio,
  #writing .othello-assignment-shell,
  #writing .othello-assignment-body,
  #writing .othello-language-page {
    gap: 12px;
  }
  #writing .othello-assignment-panel {
    border: none;
    box-shadow: none;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  #writing .othello-assignment-header {
    background: #161a17 !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  #writing .othello-task-card,
  #writing .othello-trial-panel,
  #writing .othello-trial-checklist,
  #writing .othello-progress-note,
  #writing .othello-language-choice-column,
  #writing .othello-language-contraction-card,
  #writing .othello-language-pronoun-card,
  #writing .othello-language-sentence-card {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  #writing textarea,
  #writing input,
  #writing select {
    background: #ffffff !important;
    color: #161a17 !important;
    border-color: #c8d0c1 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

@media (max-width: 980px) {
  #writing .othello-assignment-picker,
  #writing .othello-assignment-grid,
  #writing .othello-field-grid {
    grid-template-columns: 1fr;
  }
  #writing .othello-trial-heading {
    flex-direction: column;
  }
  #writing .othello-blame-row {
    grid-template-columns: 1fr;
  }
  #writing .othello-blame-row strong {
    text-align: left;
  }
}

@media (max-width: 720px) {
  #writing .othello-assignment-header,
  #writing .othello-assignment-body {
    padding: 20px;
  }
  #writing .othello-task-card,
  #writing .othello-trial-panel,
  #writing .othello-trial-checklist,
  #writing .othello-progress-note {
    padding: 16px;
  }
  #writing .othello-trial-checklist {
    grid-template-columns: 1fr;
  }
}

#key-topics-anticipation-guide .lesson-detail-panel {
  max-width: 900px;
  margin: 0 auto;
  padding: 44px 48px;
  background: #f7f8f4 !important;
  border: 1px solid #d8dfd1;
  border-top: 4px solid #1f5a1f;
  border-radius: 10px;
}
#key-topics-anticipation-guide .lesson-detail-panel > .flex {
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #d8dfd1;
}
#key-topics-anticipation-guide .source-content {
  max-width: none;
}
#key-topics-anticipation-guide .anticipation-guide-flow {
  display: grid;
  gap: 18px;
}
#key-topics-anticipation-guide .anticipation-phase-note {
  background: #fff;
  border: 1px solid #d8dfd1;
  border-left: 4px solid #1f5a1f;
  border-radius: 10px;
  padding: 22px 24px;
}
#key-topics-anticipation-guide .anticipation-phase-note h3 {
  margin: 0 0 10px;
  color: #17201a;
  font-size: 1.35rem;
  line-height: 1.2;
}
#key-topics-anticipation-guide .anticipation-phase-note p {
  max-width: 760px;
  margin: 0;
  color: #465044;
}
#key-topics-anticipation-guide .anticipation-statement-list {
  display: grid;
  gap: 14px;
}
#key-topics-anticipation-guide .anticipation-statement-card {
  display: grid;
  grid-template-columns: minmax(0, 220px) minmax(180px, 240px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  padding: 18px;
  background: #fff;
  border: 1px solid #d8dfd1;
  border-radius: 10px;
}
#key-topics-anticipation-guide .anticipation-statement-card h4 {
  margin: 0;
  color: #17201a;
  font-size: 1rem;
  line-height: 1.45;
}
#key-topics-anticipation-guide .othello-response-field {
  display: grid;
  gap: 6px;
  margin: 0;
}
#key-topics-anticipation-guide .othello-response-field > span,
#key-topics-anticipation-guide .othello-response-field > legend {
  color: #154212;
  font-size: .92rem;
  font-weight: 800;
}
#key-topics-anticipation-guide .othello-response-field > legend {
  padding: 0;
}
#key-topics-anticipation-guide .othello-response-field select,
#key-topics-anticipation-guide .othello-response-field textarea {
  width: 100%;
  border: 1px solid #b9c5b1;
  border-radius: 8px;
  background: #fff;
  color: #191c1d;
  font: inherit;
  padding: 10px 12px;
}
#key-topics-anticipation-guide .othello-response-field select {
  min-height: 44px;
}
#key-topics-anticipation-guide .othello-response-field textarea {
  min-height: 112px;
  resize: vertical;
}
#key-topics-anticipation-guide .anticipation-choice-field {
  min-width: 0;
  padding: 0;
  border: 0;
}
#key-topics-anticipation-guide .anticipation-choice-list {
  display: grid;
  gap: 8px;
}
#key-topics-anticipation-guide .anticipation-choice-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #b9c5b1;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease;
}
#key-topics-anticipation-guide .anticipation-choice-option:hover {
  border-color: #7fa076;
  background: #f6faf2;
}
#key-topics-anticipation-guide .anticipation-choice-option input {
  margin: 3px 0 0;
  accent-color: #1f5a1f;
  flex: 0 0 auto;
}
#key-topics-anticipation-guide .anticipation-choice-option span {
  color: #17201a;
  font-size: .95rem;
  font-weight: 600;
  line-height: 1.35;
}
#key-topics-anticipation-guide .anticipation-choice-option:has(input:checked) {
  border-color: #1f5a1f;
  background: #eef5ea;
  box-shadow: inset 0 0 0 1px #1f5a1f;
}
#key-topics-anticipation-guide .anticipation-choice-option:has(input:focus-visible) {
  outline: 2px solid #1f5a1f;
  outline-offset: 2px;
}
#key-topics-anticipation-guide .anticipation-submit-card {
  display: grid;
  gap: 14px;
  padding: 22px 24px;
  background: #eef5ea;
  border: 1px solid #b9cfae;
  border-radius: 10px;
}
#key-topics-anticipation-guide .anticipation-submit-card.is-submitted {
  background: #e6f2e1;
  border-color: #7fab73;
}
#key-topics-anticipation-guide .anticipation-submit-card h4 {
  margin: 0;
  color: #17201a;
  font-size: 1.2rem;
}
#key-topics-anticipation-guide .anticipation-submit-card p {
  margin: 0;
  color: #465044;
}
#key-topics-anticipation-guide .anticipation-submit-card button {
  justify-self: start;
  min-height: 44px;
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  background: #0d4f12;
  color: #fff;
  font-weight: 800;
}
#key-topics-anticipation-guide [data-anticipation-pre-status] {
  color: #154212;
  font-weight: 800;
}
@media (max-width: 980px) {
  #key-topics-anticipation-guide .lesson-detail-panel {
    padding: 32px 24px;
  }
  #key-topics-anticipation-guide .anticipation-statement-card {
    grid-template-columns: 1fr;
  }
}



/* short-stories-sidebar-behavior-sync */
@media (min-width: 1025px) {
  body .course-sidebar {
    position: fixed !important;
    left: 0 !important;
    top: 64px !important;
    bottom: 0 !important;
    right: auto !important;
    width: 18rem !important;
    max-width: 18rem !important;
    height: auto !important;
    max-height: none !important;
    display: flex !important;
    flex-direction: column !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 0 !important;
  }
  body .course-sidebar .sidebar-header {
    display: block !important;
    padding: 24px !important;
    min-height: auto !important;
  }
  body .course-sidebar nav {
    display: flex !important;
    flex-direction: column !important;
    gap: 4px !important;
    padding: 0 8px 24px !important;
    max-height: none !important;
    overflow: visible !important;
  }
  body .course-sidebar .course-nav-link,
  body .course-sidebar .lessons-toggle {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 12px !important;
    min-height: auto !important;
    width: auto !important;
    padding: 12px 14px !important;
    border-radius: 8px !important;
  }
  body .course-sidebar .sidebar-label,
  body .course-sidebar .sidebar-title {
    display: initial !important;
  }
  body .course-sidebar .lesson-subnav {
    display: none !important;
  }
  body .course-sidebar .lessons-nav.is-open .lesson-subnav {
    display: block !important;
  }
  body .course-main {
    margin-left: 18rem !important;
    padding-top: 48px !important;
  }
  body.sidebar-collapsed .course-sidebar {
    width: 64px !important;
    max-width: 64px !important;
  }
  body.sidebar-collapsed .course-sidebar .sidebar-header {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 14px 8px 12px !important;
    min-height: 72px !important;
  }
  body.sidebar-collapsed .course-main {
    margin-left: 64px !important;
  }
  body.sidebar-collapsed .course-sidebar .sidebar-title,
  body.sidebar-collapsed .course-sidebar .sidebar-label,
  body.sidebar-collapsed .course-sidebar .lesson-subnav,
  body.sidebar-collapsed .course-sidebar .sidebar-header h1,
  body.sidebar-collapsed .course-sidebar .sidebar-header p,
  body.sidebar-collapsed .course-sidebar .lessons-toggle span:not(.material-symbols-rounded) {
    display: none !important;
  }
  body.sidebar-collapsed .course-sidebar .course-nav-link,
  body.sidebar-collapsed .course-sidebar .lessons-toggle {
    justify-content: center !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  body.sidebar-collapsed .course-sidebar .sidebar-toggle-button {
    position: static !important;
    margin: 0 auto !important;
  }
  #topbar-menu-toggle {
    display: none !important;
  }
}

@media (max-width: 1024px) {
  body.sidebar-collapsed .course-sidebar {
    display: none !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar {
    position: fixed !important;
    top: 64px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: auto !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    max-height: 244px !important;
    display: block !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 0 !important;
    z-index: 45 !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar .sidebar-header {
    display: flex !important;
    align-items: center !important;
    gap: 14px !important;
    padding: 14px 24px 8px !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar .sidebar-header h1 {
    font-size: 22px !important;
    line-height: 1.1 !important;
    margin: 0 !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar .sidebar-header p {
    margin: 0 !important;
    font-size: 14px !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar nav {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 8px !important;
    padding: 8px 18px 20px !important;
    max-height: none !important;
    overflow: visible !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar .course-nav-link,
  body:not(.sidebar-collapsed) .course-sidebar .lessons-toggle {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 10px !important;
    min-height: 46px !important;
    padding: 8px 12px !important;
    border-radius: 8px !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar .lesson-subnav {
    display: none !important;
  }
  body .course-main {
    margin-left: 0 !important;
  }
  body.sidebar-collapsed .course-main {
    padding-top: 84px !important;
  }
  body:not(.sidebar-collapsed) .course-main {
    padding-top: 284px !important;
  }
  #topbar-menu-toggle {
    display: inline-flex !important;
  }
}

@media (max-width: 640px) {
  body:not(.sidebar-collapsed) .course-sidebar {
    max-height: 316px !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar nav {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    padding-bottom: 24px !important;
  }
  body:not(.sidebar-collapsed) .course-main {
    padding-top: 352px !important;
  }
  .parallel-reading-toolbar {
    grid-template-columns: 1fr;
  }
  .parallel-reading-layout {
    grid-template-columns: 1fr;
  }
  .parallel-reading-pair-head,
  .parallel-reading-pair-row,
  .parallel-reading-summary-list {
    grid-template-columns: 1fr;
  }
  .parallel-reading-pair-head div + div {
    border-left: 0;
    border-top: 1px solid #d9ded2;
  }
  .parallel-reading-pair-cell.original {
    border-right: 0;
    border-bottom: 1px solid #e4e8de;
  }
  .parallel-reading-transcript-body {
    min-height: 680px;
    max-height: none;
  }
  .parallel-reading-anchor-grid {
    grid-template-columns: 1fr;
  }
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
    <h1 class="sidebar-title font-headline-md text-headline-md font-bold text-white mb-1">Shakespeare:<br>Othello</h1>
    <p class="sidebar-course-label font-caption text-caption text-surface-variant">ELA 30-1</p>
  </div>
  <nav class="flex flex-col gap-1 pb-lg">
    <a class="course-nav-link active flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#overview" data-page-target="overview"><span class="material-symbols-outlined" aria-hidden="true">dashboard</span><span class="sidebar-label">Overview</span></a>
    <div class="lessons-nav">
      <a class="course-nav-link lessons-toggle flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#lessons" data-page-target="lessons" data-lessons-toggle aria-expanded="false" aria-controls="lesson-subnav"><span class="material-symbols-outlined" aria-hidden="true">menu_book</span><span class="sidebar-label">Lessons</span><span class="material-symbols-outlined lessons-toggle-icon ml-auto" aria-hidden="true">expand_more</span></a>
      <div id="lesson-subnav" class="lesson-subnav ml-12 mr-3 mt-1 space-y-1">${renderNavLinks(lessons)}</div>
    </div>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#side-by-side" data-page-target="side-by-side"><span class="material-symbols-outlined" aria-hidden="true">view_column</span><span class="sidebar-label">Side-by-Side Reader</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#story-bank" data-page-target="story-bank"><span class="material-symbols-outlined" aria-hidden="true">auto_stories</span><span class="sidebar-label">Othello Materials</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#story-questions" data-page-target="story-questions"><span class="material-symbols-outlined" aria-hidden="true">quiz</span><span class="sidebar-label">Othello Act Questions</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#character-notes" data-page-target="character-notes"><span class="material-symbols-outlined" aria-hidden="true">groups</span><span class="sidebar-label">Othello Character Notes</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#writing" data-page-target="writing"><span class="material-symbols-outlined" aria-hidden="true">edit_note</span><span class="sidebar-label">Writing Studio</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#film-room" data-page-target="film-room"><span class="material-symbols-outlined" aria-hidden="true">live_tv</span><span class="sidebar-label">Film Room</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#resources" data-page-target="resources"><span class="material-symbols-outlined" aria-hidden="true">folder_open</span><span class="sidebar-label">Resources</span></a>
  </nav>
</aside>
<main class="course-main md:ml-72 px-md md:px-xl py-xl">
  <div class="max-w-6xl mx-auto">
    <section id="overview" class="course-page">
      <div>
        <p class="font-label-md text-label-md text-on-surface-variant font-semibold">ELA 30-1 | Unit Frame</p>
        <h2 class="font-display-lg text-display-lg font-black mt-sm">Shakespeare: Othello</h2>
        <p class="font-body-lg text-body-lg mt-md text-on-surface-variant max-w-3xl">
          In this unit, you will build confidence with Shakespearean drama while reading <em>Othello</em>. You will track character motivation, dramatic irony, manipulation, jealousy, reputation, race, gender, and responsibility as the tragedy develops.
        </p>
        <div class="unit-outcomes">
          <p class="unit-outcomes-lead">I can...</p>
          <ul class="unit-focus-list font-body-md text-body-md">
            <li>read Shakespearean language closely enough to explain character motivation.</li>
            <li>connect scenes, quotations, and dramatic techniques to larger themes.</li>
            <li>use evidence from <em>Othello</em> to support critical and analytical writing.</li>
          </ul>
        </div>
        <div class="flex flex-wrap gap-md mt-xl">
          <span class="completed-pill"><strong data-complete-count>0</strong> / ${total} lessons complete</span>
          <span class="completed-pill">${total} source lessons</span>
        </div>
        <a href="#lessons" class="external-resource-action inline-flex mt-xl">Open Lesson Frame</a>
      </div>
    </section>

    <section id="lessons" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Lessons</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Othello Lesson Sequence</h2>
      <div class="resource-stack mt-lg">${renderLessonsOverview(lessons)}</div>
    </section>
    <section id="side-by-side" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Side-by-Side Reader</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Side-by-Side Reader</h2>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">Move through the full play scene by scene. Every scene now keeps the complete original text beside a full modern-English build, then follows with anchor lines and recap notes.</p>
      <div class="mt-lg">${renderParallelReadingReader(input.parallelReadingScenes)}</div>
    </section>
    ${lessons.map((lesson) => renderLessonPanel(lesson, lessons)).join("\n")}
    <section id="story-bank" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Othello Materials</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Othello Materials</h2>
      <div class="mt-lg">${renderShortStoryBank(input.storyBankItems)}</div>
    </section>
    <section id="story-questions" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Othello Act Questions</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Othello Act Questions</h2>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">Choose an act or the Phase 2 reflection to open guided response questions, evidence prompts, and diploma-writing practice.</p>
      ${renderShortStoryQuestions(input.writingWorksheets)}
    </section>
    <section id="character-notes" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Othello Character Notes</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Othello Character Notes</h2>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">Track how each major character is introduced, judged by others, changed by conflict, and connected to the tragedy. These notes support Act Questions, Responsibility Trial work, and critical/analytical writing.</p>
      ${renderCharacterNotesStudio()}
    </section>
    <section id="writing" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Writing Studio</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Othello Writing Studio</h2>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">Use these tools to turn scene notes, quotations, and character evidence into stronger analytical writing.</p>
      ${renderWritingStudio(input.writingWorksheets)}
    </section>
    <section id="film-room" class="course-page" hidden>
      <p class="font-label-md text-label-md text-secondary">${COURSE_CODE} | Film Room</p>
      <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Film Room</h2>
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
      <h2 id="story-reader-title" class="story-reader-title" data-story-reader-title>Othello Material</h2>
      <button class="story-reader-close" type="button" data-story-reader-close aria-label="Close full screen reader"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
    </div>
    <iframe class="story-reader-frame" data-story-reader-frame title="Othello full screen reader"></iframe>
  </div>
</div>
<script>
const writingWorksheets = (() => {
  const stripQuestionPrefix = (text) => String(text || "").replace(/^\\s*Question\\s+\\d+\\s*:\\s*/i, "").trim();
  const rawWorksheets = ${JSON.stringify(input.writingWorksheets, null, 2)};
  return rawWorksheets.map((worksheet) => ({
    ...worksheet,
    sections: (worksheet.sections || []).map((section) => ({
      ...section,
      questions: (section.questions || []).map((question) => ({
        ...question,
        text: stripQuestionPrefix(question.text)
      }))
    }))
  }));
})();
const PHASE_TWO_ANTICIPATION_ID = "othello-phase-2-anticipation-reflection";

const STORAGE_KEY = "canvas-helper:ela30-1-shakespeare-othello:complete";
const sceneCheckpoints = [
  {
    "id": "act-1-scene-1",
    "actId": "othello-act-1-questions",
    "title": "Act 1, Scene 1: Iago Opens the Wound",
    "summaryPrompt": "Summarize how Iago and Roderigo begin the conflict before Othello even appears.",
    "keyQuote": "I am not what I am.",
    "characterQuestion": "What does Iago reveal about his character in this opening scene?",
    "themeQuestion": "How does the scene introduce appearance versus reality?",
    "evidencePrompt": "Use one detail from the scene to explain how Iago controls what others believe.",
    "deeperQuestion": "Why might Shakespeare begin with Iago's voice instead of Othello's?"
  },
  {
    "id": "act-1-scene-2",
    "actId": "othello-act-1-questions",
    "title": "Act 1, Scene 2: Othello Under Accusation",
    "summaryPrompt": "Summarize how Othello responds when Brabantio and others confront him.",
    "keyQuote": "Keep up your bright swords, for the dew will rust them.",
    "characterQuestion": "How does Othello's response shape our first impression of him?",
    "themeQuestion": "How does language of public honour and private accusation shape the scene?",
    "evidencePrompt": "Use one moment to show whether Othello seems confident, threatened, or controlled.",
    "deeperQuestion": "How does this scene complicate the racial prejudice directed at Othello?"
  },
  {
    "id": "act-1-scene-3",
    "actId": "othello-act-1-questions",
    "title": "Act 1, Scene 3: Love on Trial",
    "summaryPrompt": "Summarize what happens when Othello and Desdemona defend their marriage before the Senate.",
    "keyQuote": "She loved me for the dangers I had passed.",
    "characterQuestion": "How does Desdemona prove she has agency in this scene?",
    "themeQuestion": "How does storytelling become a form of self-defense?",
    "evidencePrompt": "Use one quote or event to explain how love and reputation are judged publicly.",
    "deeperQuestion": "What warning signs does Iago's final soliloquy create for the audience?"
  },
  {
    "id": "act-2-scene-1",
    "actId": "othello-act-2-questions",
    "title": "Act 2, Scene 1: Cyprus and Calculation",
    "summaryPrompt": "Summarize how the arrival in Cyprus shifts the play from public danger to private manipulation.",
    "keyQuote": "With as little a web as this will I ensnare as great a fly as Cassio.",
    "characterQuestion": "How does Iago read other people in order to use them?",
    "themeQuestion": "How does the storm outside mirror or contrast the emotional danger inside the group?",
    "evidencePrompt": "Use one detail to show how Iago turns ordinary behaviour into evidence for his plan.",
    "deeperQuestion": "Why does the end of the Turkish threat make Iago's private threat more important?"
  },
  {
    "id": "act-2-scene-2",
    "actId": "othello-act-2-questions",
    "title": "Act 2, Scene 2: Celebration Before Collapse",
    "summaryPrompt": "Summarize the public announcement and how it creates a temporary sense of order.",
    "keyQuote": "It is Othello's pleasure... that every man put himself into triumph.",
    "characterQuestion": "What does this brief scene suggest about Othello's public authority?",
    "themeQuestion": "How does celebration create dramatic irony for the audience?",
    "evidencePrompt": "Use one detail to explain why this public joy feels unstable.",
    "deeperQuestion": "Why might Shakespeare include a short public scene before Cassio's fall?"
  },
  {
    "id": "act-2-scene-3",
    "actId": "othello-act-2-questions",
    "title": "Act 2, Scene 3: Cassio Falls",
    "summaryPrompt": "Summarize how Iago engineers Cassio's disgrace.",
    "keyQuote": "Reputation, reputation, reputation! O, I have lost my reputation!",
    "characterQuestion": "What weakness in Cassio does Iago exploit most effectively?",
    "themeQuestion": "How does the scene connect reputation to identity?",
    "evidencePrompt": "Use one event to explain how Iago makes manipulation look like accident.",
    "deeperQuestion": "Is Cassio mainly responsible for his fall, or is Iago? Explain the balance."
  },
  {
    "id": "act-3-scene-1",
    "actId": "othello-act-3-questions",
    "title": "Act 3, Scene 1: Seeking Access",
    "summaryPrompt": "Summarize how Cassio tries to regain access to Othello through Emilia and Desdemona.",
    "keyQuote": "I never knew / A Florentine more kind and honest.",
    "characterQuestion": "How does Cassio's trust in others make him vulnerable?",
    "themeQuestion": "How does the word honest become unstable in the play?",
    "evidencePrompt": "Use one detail to show how a reasonable request can become dangerous in Iago's world.",
    "deeperQuestion": "Why is indirect access to Othello so important at this point?"
  },
  {
    "id": "act-3-scene-2",
    "actId": "othello-act-3-questions",
    "title": "Act 3, Scene 2: Official Business",
    "summaryPrompt": "Summarize what this brief transition shows about Othello's duties.",
    "keyQuote": "These letters give, Iago, to the pilot.",
    "characterQuestion": "What does Othello's trust in Iago suggest before the temptation scene?",
    "themeQuestion": "How does public responsibility contrast with private vulnerability?",
    "evidencePrompt": "Use one detail to explain why Othello depends on Iago.",
    "deeperQuestion": "How does this short scene prepare us for Act 3, Scene 3?"
  },
  {
    "id": "act-3-scene-3",
    "actId": "othello-act-3-questions",
    "title": "Act 3, Scene 3: Seeds of Doubt",
    "summaryPrompt": "Summarize how Iago begins to transform Othello's trust into suspicion.",
    "keyQuote": "O, beware, my lord, of jealousy; / It is the green-eyed monster which doth mock / The meat it feeds on.",
    "characterQuestion": "How does Iago manipulate Othello while pretending to protect him?",
    "themeQuestion": "How does imagery make jealousy feel alive and dangerous?",
    "evidencePrompt": "Use one question, hesitation, or repeated phrase to explain Iago's persuasive method.",
    "deeperQuestion": "At what point does Othello begin participating in his own manipulation?"
  },
  {
    "id": "act-3-scene-4",
    "actId": "othello-act-3-questions",
    "title": "Act 3, Scene 4: The Handkerchief Becomes Proof",
    "summaryPrompt": "Summarize how the handkerchief changes from love token to supposed evidence.",
    "keyQuote": "Fetch me the handkerchief: my mind misgives.",
    "characterQuestion": "How does Desdemona misunderstand the danger she is in?",
    "themeQuestion": "How does a symbol gain power because characters interpret it differently?",
    "evidencePrompt": "Use one moment to explain how misunderstanding replaces direct communication.",
    "deeperQuestion": "Why is the handkerchief more powerful as an idea than as an object?"
  },
  {
    "id": "act-4-scene-1",
    "actId": "othello-act-4-questions",
    "title": "Act 4, Scene 1: Jealousy Takes Over",
    "summaryPrompt": "Summarize how Iago pushes Othello into physical and emotional collapse.",
    "keyQuote": "Lie with her? lie on her? We say lie on her when they belie her.",
    "characterQuestion": "How has Othello's language changed from earlier in the play?",
    "themeQuestion": "How does broken or obsessive language reveal psychological collapse?",
    "evidencePrompt": "Use one detail to show how jealousy changes Othello's judgment.",
    "deeperQuestion": "Why does Iago stage-manage what Othello sees and hears?"
  },
  {
    "id": "act-4-scene-2",
    "actId": "othello-act-4-questions",
    "title": "Act 4, Scene 2: Desdemona Accused",
    "summaryPrompt": "Summarize how Othello confronts Desdemona and how she responds.",
    "keyQuote": "I understand a fury in your words, / But not the words.",
    "characterQuestion": "How does Desdemona's innocence affect the emotional impact of the scene?",
    "themeQuestion": "How does the scene show the damage caused by false certainty?",
    "evidencePrompt": "Use one exchange to explain how communication breaks down between husband and wife.",
    "deeperQuestion": "Why is Othello unable or unwilling to ask for direct evidence?"
  },
  {
    "id": "act-4-scene-3",
    "actId": "othello-act-4-questions",
    "title": "Act 4, Scene 3: The Willow Scene",
    "summaryPrompt": "Summarize the conversation between Desdemona and Emilia before the final act.",
    "keyQuote": "The poor soul sat sighing by a sycamore tree, / Sing all a green willow.",
    "characterQuestion": "How do Desdemona and Emilia reveal different views of marriage and loyalty?",
    "themeQuestion": "How does song create mood, foreshadowing, or symbolic meaning?",
    "evidencePrompt": "Use one detail to explain how the scene prepares the audience emotionally for tragedy.",
    "deeperQuestion": "How does Emilia's realism contrast with Desdemona's idealism?"
  },
  {
    "id": "act-5-scene-1",
    "actId": "othello-act-5-questions",
    "title": "Act 5, Scene 1: Violence in the Dark",
    "summaryPrompt": "Summarize how Iago's plot begins to unravel through the attack on Cassio and Roderigo.",
    "keyQuote": "This is the night / That either makes me or fordoes me quite.",
    "characterQuestion": "How does Iago adapt when his plan becomes dangerous to him?",
    "themeQuestion": "How does darkness shape confusion, violence, and mistaken judgment?",
    "evidencePrompt": "Use one moment to explain how Iago tries to erase evidence against himself.",
    "deeperQuestion": "Why does Shakespeare separate the attack on Cassio from Desdemona's death?"
  },
  {
    "id": "act-5-scene-2",
    "actId": "othello-act-5-questions",
    "title": "Act 5, Scene 2: Recognition and Ruin",
    "summaryPrompt": "Summarize the final bedroom scene, including Desdemona's death, Emilia's revelation, and Othello's final act.",
    "keyQuote": "Then must you speak / Of one that loved not wisely but too well.",
    "characterQuestion": "How does Othello try to control the story of himself at the end?",
    "themeQuestion": "How does the final scene resolve themes of jealousy, reputation, and appearance versus reality?",
    "evidencePrompt": "Use one final speech or revelation to explain what Othello understands too late.",
    "deeperQuestion": "Does Othello's final speech create sympathy, judgment, or both?"
  }
];

const characterDossierCharacters = ${JSON.stringify(Array.from(CHARACTER_DOSSIER_CHARACTERS))};
const characterDossierActs = ${JSON.stringify(Array.from(CHARACTER_DOSSIER_ACTS))};
const characterDossierAccents = ${JSON.stringify(CHARACTER_DOSSIER_ACCENTS)};
const CHARACTER_DOSSIER_STORAGE_KEY = "canvas-helper:ela30-1-shakespeare-othello:character-dossiers";
const CHARACTER_DOSSIER_ACTIVE_KEY = "canvas-helper:ela30-1-shakespeare-othello:character-dossiers:active";

const RESPONSE_STORAGE_KEY = "canvas-helper:ela30-1-shakespeare-othello:responses";
const WORKSHEET_STORAGE_KEY = "canvas-helper:ela30-1-shakespeare-othello:worksheet-responses";
const lessonsNav = document.querySelector(".lessons-nav");
function readComplete(){ try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { return new Set(); } }
function writeComplete(values){ localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(values))); }
function readResponses(){ try { return JSON.parse(localStorage.getItem(RESPONSE_STORAGE_KEY) || "{}"); } catch { return {}; } }
function writeResponses(values){ localStorage.setItem(RESPONSE_STORAGE_KEY, JSON.stringify(values)); }
function readWorksheetAnswers(){ try { return JSON.parse(localStorage.getItem(WORKSHEET_STORAGE_KEY) || "{}"); } catch { return {}; } }
function writeWorksheetAnswers(values){ localStorage.setItem(WORKSHEET_STORAGE_KEY, JSON.stringify(values)); }
function escapeClientHtml(value){ return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
const othelloLanguagePages = ${JSON.stringify(OTHELLO_LANGUAGE_PAGES)};
const othelloLanguageMatchingPairs = ${JSON.stringify(OTHELLO_LANGUAGE_MATCHING_PAIRS)};
const othelloLanguageContractions = ${JSON.stringify(OTHELLO_LANGUAGE_CONTRACTIONS)};
const othelloLanguagePronouns = ${JSON.stringify(OTHELLO_LANGUAGE_PRONOUNS)};
const othelloLanguageSentences = ${JSON.stringify(OTHELLO_LANGUAGE_SENTENCES)};
const othelloLanguageMaxScore = ${OTHELLO_LANGUAGE_MAX_SCORE};
const OTHELLO_LANGUAGE_STATE_KEY = "othello-language-translator-state";
let othelloLanguageState = null;
const othelloLanguageUi = { selectedEliz: "", selectedMod: "", wrongEliz: "", wrongMod: "", wrongTimer: 0, sentenceErrorIndex: -1, sentenceTimers: {} };
const othelloCloseReadingPassages = ${JSON.stringify(OTHELLO_CLOSE_READING_PASSAGES)};
const othelloCloseReadingCategories = ${JSON.stringify(OTHELLO_CLOSE_READING_CATEGORIES)};
const OTHELLO_CLOSE_READING_STATE_KEY = "othello-close-reading-lab-state";
let othelloCloseReadingState = null;
const othelloCloseReadingUi = { fallbackMode: false, fallbackStart: "", fallbackEnd: "", showForm: false, editingId: "", formDraft: null };
const othelloThemeTopics = ${JSON.stringify(OTHELLO_THEME_TOPICS)};
const othelloThemeSortCards = ${JSON.stringify(OTHELLO_THEME_SORT_CARDS)};
const othelloThemeDiagnostics = ${JSON.stringify(OTHELLO_THEME_DIAGNOSTICS)};
const othelloThemeDiagnosticIssues = ${JSON.stringify(OTHELLO_THEME_DIAGNOSTIC_ISSUES)};
const OTHELLO_THEME_STATE_KEY = "othello-theme-builder-state";
let othelloThemeState = null;
const othelloThemeUi = { evidenceOpen: false, editingEvidenceId: "", evidenceDraft: null, activeStage: "sort" };

function shuffleClientArray(values){
  const next = values.slice();
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = current;
  }
  return next;
}
function isPermutation(values, expected){
  if (!Array.isArray(values) || values.length !== expected.length) return false;
  const counts = new Map();
  expected.forEach((item) => counts.set(item, (counts.get(item) || 0) + 1));
  for (const value of values) {
    if (!counts.has(value)) return false;
    const remaining = (counts.get(value) || 0) - 1;
    if (remaining < 0) return false;
    counts.set(value, remaining);
  }
  return Array.from(counts.values()).every((count) => count === 0);
}
function createOthelloLanguageSentenceState(sentence){
  return { built: [], bank: sentence.shuffled.slice(), completed: false };
}
function createOthelloLanguageState(){
  return {
    activePage: othelloLanguagePages[0].id,
    matchedPairs: [],
    elizOrder: shuffleClientArray(othelloLanguageMatchingPairs.map((pair) => pair.eliz)),
    modOrder: shuffleClientArray(othelloLanguageMatchingPairs.map((pair) => pair.mod)),
    contractions: Array(othelloLanguageContractions.length).fill(""),
    pronouns: Array(othelloLanguagePronouns.length).fill(""),
    sentences: othelloLanguageSentences.map((sentence) => createOthelloLanguageSentenceState(sentence))
  };
}
function normalizeOthelloLanguageState(input){
  const fallback = createOthelloLanguageState();
  if (!input || typeof input !== "object") return fallback;
  const normalized = { ...fallback };
  const pageIds = new Set(othelloLanguagePages.map((page) => page.id));
  normalized.activePage = typeof input.activePage === "string" && pageIds.has(input.activePage) ? input.activePage : fallback.activePage;
  normalized.matchedPairs = Array.isArray(input.matchedPairs)
    ? Array.from(new Set(input.matchedPairs.filter((value) => othelloLanguageMatchingPairs.some((pair) => pair.eliz === value))))
    : [];
  normalized.elizOrder = isPermutation(input.elizOrder, fallback.elizOrder) ? input.elizOrder.slice() : fallback.elizOrder;
  normalized.modOrder = isPermutation(input.modOrder, fallback.modOrder) ? input.modOrder.slice() : fallback.modOrder;
  normalized.contractions = fallback.contractions.map((value, index) => typeof input.contractions?.[index] === "string" ? input.contractions[index] : value);
  normalized.pronouns = fallback.pronouns.map((value, index) => typeof input.pronouns?.[index] === "string" ? input.pronouns[index] : value);
  normalized.sentences = othelloLanguageSentences.map((sentence, index) => {
    const fallbackState = createOthelloLanguageSentenceState(sentence);
    const candidate = input.sentences?.[index];
    if (!candidate || !Array.isArray(candidate.built) || !Array.isArray(candidate.bank)) return fallbackState;
    const built = candidate.built.filter((word) => typeof word === "string");
    const bank = candidate.bank.filter((word) => typeof word === "string");
    const inventory = sentence.words.slice();
    if (!isPermutation(built.concat(bank), inventory)) return fallbackState;
    return {
      built,
      bank,
      completed: candidate.completed === true && built.join(" ") === sentence.words.join(" ")
    };
  });
  return normalized;
}
function readOthelloLanguageState(){
  return normalizeOthelloLanguageState(readResponses()[OTHELLO_LANGUAGE_STATE_KEY]);
}
function writeOthelloLanguageState(){
  const responses = readResponses();
  responses[OTHELLO_LANGUAGE_STATE_KEY] = othelloLanguageState;
  writeResponses(responses);
}
function getOthelloLanguageScore(){
  const contractionsSolved = othelloLanguageContractions.filter((item, index) => (othelloLanguageState.contractions[index] || "").trim().toLowerCase() === item.mod.toLowerCase()).length;
  const pronounsSolved = othelloLanguagePronouns.filter((item, index) => othelloLanguageState.pronouns[index] === item.answer).length;
  const sentencesSolved = othelloLanguageState.sentences.filter((sentence) => sentence.completed).length;
  return othelloLanguageState.matchedPairs.length + contractionsSolved + pronounsSolved + (sentencesSolved * 2);
}
function getOthelloLanguageCompletedSectionCount(){
  let count = 0;
  if (othelloLanguageState.matchedPairs.length === othelloLanguageMatchingPairs.length) count += 1;
  if (othelloLanguageContractions.every((item, index) => (othelloLanguageState.contractions[index] || "").trim().toLowerCase() === item.mod.toLowerCase())) count += 1;
  if (othelloLanguagePronouns.every((item, index) => othelloLanguageState.pronouns[index] === item.answer)) count += 1;
  if (othelloLanguageState.sentences.every((sentence) => sentence.completed)) count += 1;
  return count;
}
function renderOthelloLanguageScorecard(){
  const scoreNode = document.querySelector("[data-othello-language-score]");
  const progressNode = document.querySelector("[data-othello-language-progress]");
  const noteNode = document.querySelector("[data-othello-language-progress-note]");
  if (scoreNode) scoreNode.textContent = getOthelloLanguageScore() + " / " + othelloLanguageMaxScore;
  if (progressNode) progressNode.style.width = Math.round((getOthelloLanguageScore() / othelloLanguageMaxScore) * 100) + "%";
  if (noteNode) {
    const completeCount = getOthelloLanguageCompletedSectionCount();
    noteNode.textContent = completeCount === othelloLanguagePages.length
      ? "All four activities are complete. Your translator work is ready to keep or export."
      : completeCount + " of " + othelloLanguagePages.length + " activities complete so far.";
  }
}
function renderOthelloLanguageChrome(){
  document.querySelectorAll("[data-othello-language-page-select]").forEach((select) => {
    if (select.value !== othelloLanguageState.activePage) select.value = othelloLanguageState.activePage;
    syncOverlaySelectUI(select);
  });
  document.querySelectorAll("[data-othello-language-page-trigger]").forEach((button) => {
    const isActive = button.getAttribute("data-othello-language-page-trigger") === othelloLanguageState.activePage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
  document.querySelectorAll("[data-othello-language-page]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-othello-language-page") !== othelloLanguageState.activePage;
  });
  renderOthelloLanguageScorecard();
}
function renderOthelloLanguageMatchmaker(){
  const elizList = document.querySelector("[data-othello-language-eliz-list]");
  const modList = document.querySelector("[data-othello-language-mod-list]");
  const status = document.querySelector("[data-othello-language-match-status]");
  if (!elizList || !modList) return;
  elizList.innerHTML = othelloLanguageState.elizOrder.map((word) => {
    const isComplete = othelloLanguageState.matchedPairs.includes(word);
    const isSelected = othelloLanguageUi.selectedEliz === word;
    const isError = othelloLanguageUi.wrongEliz === word;
    return '<button type="button" class="othello-language-choice-button'
      + (isComplete ? ' is-complete' : '')
      + (isSelected ? ' is-selected' : '')
      + (isError ? ' is-error' : '')
      + '" data-othello-language-eliz="' + escapeClientHtml(word) + '"' + (isComplete ? ' disabled' : '') + '>'
      + escapeClientHtml(word)
      + '</button>';
  }).join("");
  modList.innerHTML = othelloLanguageState.modOrder.map((word) => {
    const pair = othelloLanguageMatchingPairs.find((item) => item.mod === word);
    const isComplete = pair ? othelloLanguageState.matchedPairs.includes(pair.eliz) : false;
    const isSelected = othelloLanguageUi.selectedMod === word;
    const isError = othelloLanguageUi.wrongMod === word;
    return '<button type="button" class="othello-language-choice-button'
      + (isComplete ? ' is-complete' : '')
      + (isSelected ? ' is-selected' : '')
      + (isError ? ' is-error' : '')
      + '" data-othello-language-mod="' + escapeClientHtml(word) + '"' + (isComplete ? ' disabled' : '') + '>'
      + escapeClientHtml(word)
      + '</button>';
  }).join("");
  if (status) {
    status.textContent = othelloLanguageState.matchedPairs.length === othelloLanguageMatchingPairs.length
      ? "All " + othelloLanguageMatchingPairs.length + " pairs matched."
      : othelloLanguageState.matchedPairs.length + " of " + othelloLanguageMatchingPairs.length + " pairs matched.";
  }
}
function contractionStatus(index){
  const value = (othelloLanguageState.contractions[index] || "").trim().toLowerCase();
  if (!value) return "";
  return value === othelloLanguageContractions[index].mod.toLowerCase() ? "correct" : "incorrect";
}
function updateOthelloLanguageContractionCard(index){
  const card = document.querySelector('[data-othello-language-contraction-card="' + index + '"]');
  const input = document.querySelector('[data-othello-language-contraction-input="' + index + '"]');
  const feedback = document.querySelector('[data-othello-language-contraction-feedback="' + index + '"]');
  const icon = document.querySelector('[data-othello-language-contraction-icon="' + index + '"]');
  if (!card || !input || !feedback || !icon) return;
  const status = contractionStatus(index);
  if (document.activeElement !== input) input.value = othelloLanguageState.contractions[index] || "";
  card.classList.toggle("is-correct", status === "correct");
  card.classList.toggle("is-incorrect", status === "incorrect");
  if (!status) {
    icon.hidden = true;
    feedback.textContent = "Type the full modern meaning.";
  } else if (status === "correct") {
    icon.hidden = false;
    icon.textContent = "check_circle";
    feedback.textContent = "Correct.";
  } else {
    icon.hidden = false;
    icon.textContent = "cancel";
    feedback.textContent = "Not quite yet. Try another full modern form.";
  }
}
function renderOthelloLanguageContractions(){
  othelloLanguageContractions.forEach((_, index) => updateOthelloLanguageContractionCard(index));
  renderOthelloLanguageScorecard();
}
function pronounStatus(index){
  const value = othelloLanguageState.pronouns[index] || "";
  if (!value) return "";
  return value === othelloLanguagePronouns[index].answer ? "correct" : "incorrect";
}
function updateOthelloLanguagePronounCard(index){
  const card = document.querySelector('[data-othello-language-pronoun-card="' + index + '"]');
  const select = document.querySelector('[data-othello-language-pronoun-input="' + index + '"]');
  const feedback = document.querySelector('[data-othello-language-pronoun-feedback="' + index + '"]');
  if (!card || !select || !feedback) return;
  const status = pronounStatus(index);
  select.value = othelloLanguageState.pronouns[index] || "";
  card.classList.toggle("is-correct", status === "correct");
  card.classList.toggle("is-incorrect", status === "incorrect");
  feedback.textContent = status === "correct" ? "Correct." : status === "incorrect" ? "Try again: " + othelloLanguagePronouns[index].hint : othelloLanguagePronouns[index].hint;
}
function renderOthelloLanguagePronouns(){
  othelloLanguagePronouns.forEach((_, index) => updateOthelloLanguagePronounCard(index));
  renderOthelloLanguageScorecard();
}
function renderOthelloLanguageSentenceCard(index){
  const card = document.querySelector('[data-othello-language-sentence-card="' + index + '"]');
  if (!card) return;
  const sentence = othelloLanguageSentences[index];
  const state = othelloLanguageState.sentences[index];
  const builtArea = card.querySelector('[data-othello-language-built-area="' + index + '"]');
  const bank = card.querySelector('[data-othello-language-word-bank="' + index + '"]');
  const bankSection = card.querySelector(".othello-language-sentence-bank");
  const checkButton = card.querySelector('[data-othello-language-check="' + index + '"]');
  const status = card.querySelector('[data-othello-language-sentence-status="' + index + '"]');
  const actions = card.querySelector(".othello-language-sentence-actions");
  if (!builtArea || !bank || !bankSection || !checkButton || !status || !actions) return;
  builtArea.classList.toggle("is-correct", state.completed);
  builtArea.classList.toggle("is-error", othelloLanguageUi.sentenceErrorIndex === index);
  builtArea.innerHTML = state.built.length
    ? state.built.map((word, wordIndex) => '<button type="button" class="othello-language-word-chip is-built" data-othello-language-built-word="' + wordIndex + '" data-othello-language-sentence-index="' + index + '">' + escapeClientHtml(word) + '</button>').join("")
    : '<span class="othello-language-built-placeholder">Click words from the bank to build the Elizabethan version.</span>';
  bankSection.hidden = state.completed;
  bank.innerHTML = state.bank.map((word, wordIndex) => '<button type="button" class="othello-language-word-chip" data-othello-language-bank-word="' + wordIndex + '" data-othello-language-sentence-index="' + index + '">' + escapeClientHtml(word) + '</button>').join("");
  checkButton.disabled = state.completed || state.built.length !== sentence.words.length;
  actions.classList.toggle("is-correct", state.completed);
  actions.classList.toggle("is-error", othelloLanguageUi.sentenceErrorIndex === index);
  status.textContent = state.completed
    ? "Correct (+2 points)."
    : othelloLanguageUi.sentenceErrorIndex === index
      ? "That order is not quite right yet. Rearrange and try again."
      : "Build the sentence, then check your translation.";
}
function renderOthelloLanguageSentences(){
  othelloLanguageSentences.forEach((_, index) => renderOthelloLanguageSentenceCard(index));
  renderOthelloLanguageScorecard();
}
function renderOthelloLanguageTranslator(){
  const root = document.querySelector("[data-othello-language-root]");
  if (!root) return;
  if (!othelloLanguageState) othelloLanguageState = readOthelloLanguageState();
  renderOthelloLanguageChrome();
  renderOthelloLanguageMatchmaker();
  renderOthelloLanguageContractions();
  renderOthelloLanguagePronouns();
  renderOthelloLanguageSentences();
}
function setActiveOthelloLanguagePage(id){
  if (!id || !othelloLanguagePages.some((page) => page.id === id)) return;
  othelloLanguageState.activePage = id;
  writeOthelloLanguageState();
  renderOthelloLanguageChrome();
}
function getOthelloCloseReadingDefaultTasks(){
  return {
    hashtags: [{ text: "#", explanation: "" }],
    revealingWords: [{ word: "", trait: "", explanation: "" }],
    persuasiveTechnique: { technique: "", explanation: "", effect: "" }
  };
}
function normalizeOthelloCloseReadingState(raw){
  const firstPassageId = othelloCloseReadingPassages[0]?.id || "";
  const annotations = Array.isArray(raw?.annotations) ? raw.annotations.filter(Boolean).map((annotation) => ({
    id: typeof annotation.id === "string" && annotation.id ? annotation.id : Math.random().toString(36).slice(2, 11),
    sourceAssignmentId: typeof annotation.sourceAssignmentId === "string" ? annotation.sourceAssignmentId : firstPassageId,
    startLineId: typeof annotation.startLineId === "string" ? annotation.startLineId : "",
    endLineId: typeof annotation.endLineId === "string" ? annotation.endLineId : "",
    selectedText: typeof annotation.selectedText === "string" ? annotation.selectedText : "",
    broadLens: typeof annotation.broadLens === "string" ? annotation.broadLens : "",
    specificCategory: typeof annotation.specificCategory === "string" ? annotation.specificCategory : "",
    paraphrase: typeof annotation.paraphrase === "string" ? annotation.paraphrase : "",
    significance: typeof annotation.significance === "string" ? annotation.significance : "",
    effect: typeof annotation.effect === "string" ? annotation.effect : "",
    confidence: typeof annotation.confidence === "string" && annotation.confidence ? annotation.confidence : "Still uncertain",
    teacherQuestion: annotation.teacherQuestion === true
  })) : [];
  const analysisTasks = raw && typeof raw.analysisTasks === "object" && raw.analysisTasks ? Object.fromEntries(Object.entries(raw.analysisTasks).map(([key, value]) => {
    const current = value && typeof value === "object" ? value : {};
    return [key, {
      hashtags: Array.isArray(current.hashtags) && current.hashtags.length ? current.hashtags.map((item) => ({
        text: typeof item?.text === "string" ? item.text : "#",
        explanation: typeof item?.explanation === "string" ? item.explanation : ""
      })) : getOthelloCloseReadingDefaultTasks().hashtags,
      revealingWords: Array.isArray(current.revealingWords) && current.revealingWords.length ? current.revealingWords.map((item) => ({
        word: typeof item?.word === "string" ? item.word : "",
        trait: typeof item?.trait === "string" ? item.trait : "",
        explanation: typeof item?.explanation === "string" ? item.explanation : ""
      })) : getOthelloCloseReadingDefaultTasks().revealingWords,
      persuasiveTechnique: {
        technique: typeof current.persuasiveTechnique?.technique === "string" ? current.persuasiveTechnique.technique : "",
        explanation: typeof current.persuasiveTechnique?.explanation === "string" ? current.persuasiveTechnique.explanation : "",
        effect: typeof current.persuasiveTechnique?.effect === "string" ? current.persuasiveTechnique.effect : ""
      }
    }];
  })) : {};
  return {
    activePassageId: othelloCloseReadingPassages.some((passage) => passage.id === raw?.activePassageId) ? raw.activePassageId : firstPassageId,
    fontSize: Number.isFinite(Number(raw?.fontSize)) ? Math.min(24, Math.max(12, Number(raw.fontSize))) : 18,
    showLines: raw?.showLines !== false,
    activeFilter: typeof raw?.activeFilter === "string" && raw.activeFilter ? raw.activeFilter : "All",
    annotations,
    analysisTasks,
    finalResponse: typeof raw?.finalResponse === "string" ? raw.finalResponse : "",
    selectedAnalysisAnnotationId: typeof raw?.selectedAnalysisAnnotationId === "string" ? raw.selectedAnalysisAnnotationId : ""
  };
}
function readOthelloCloseReadingState(){
  return normalizeOthelloCloseReadingState(readResponses()[OTHELLO_CLOSE_READING_STATE_KEY]);
}
function writeOthelloCloseReadingState(){
  const responses = readResponses();
  responses[OTHELLO_CLOSE_READING_STATE_KEY] = othelloCloseReadingState;
  writeResponses(responses);
}
function getActiveOthelloCloseReadingPassage(){
  return othelloCloseReadingPassages.find((passage) => passage.id === othelloCloseReadingState.activePassageId) || othelloCloseReadingPassages[0];
}
function getOthelloCloseReadingPassageById(id){
  return othelloCloseReadingPassages.find((passage) => passage.id === id) || null;
}
function getOthelloCloseReadingTasks(annotationId){
  return othelloCloseReadingState.analysisTasks[annotationId] || getOthelloCloseReadingDefaultTasks();
}
function othelloCloseReadingWordCount(text){
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}
function getOthelloCloseReadingProgress(){
  const annotationGoalMet = othelloCloseReadingState.annotations.length >= 10;
  const analyzedGoalMet = Object.keys(othelloCloseReadingState.analysisTasks).length >= 3;
  const synthesisGoalMet = othelloCloseReadingWordCount(othelloCloseReadingState.finalResponse) >= 150;
  const complete = [annotationGoalMet, analyzedGoalMet, synthesisGoalMet].filter(Boolean).length;
  return {
    complete,
    total: 3,
    percent: Math.round((complete / 3) * 100),
    annotationGoalMet,
    analyzedGoalMet,
    synthesisGoalMet
  };
}
function findOthelloCloseReadingLineIndex(passage, lineId){
  return passage.lines.findIndex((line) => line.lineId === lineId);
}
function othelloCloseReadingAnnotationMatchesLine(passage, annotation, lineId){
  const lineIndex = findOthelloCloseReadingLineIndex(passage, lineId);
  const startIndex = findOthelloCloseReadingLineIndex(passage, annotation.startLineId);
  const endIndex = findOthelloCloseReadingLineIndex(passage, annotation.endLineId || annotation.startLineId);
  if (lineIndex < 0 || startIndex < 0 || endIndex < 0) return false;
  return lineIndex >= Math.min(startIndex, endIndex) && lineIndex <= Math.max(startIndex, endIndex);
}
function getFilteredOthelloCloseReadingAnnotations(passageId){
  const annotations = othelloCloseReadingState.annotations.filter((annotation) => annotation.sourceAssignmentId === passageId);
  if (othelloCloseReadingState.activeFilter === "All") return annotations;
  return annotations.filter((annotation) => annotation.broadLens === othelloCloseReadingState.activeFilter || annotation.specificCategory === othelloCloseReadingState.activeFilter);
}
function openOthelloCloseReadingDraft(draft, editingId){
  othelloCloseReadingUi.formDraft = { ...draft };
  othelloCloseReadingUi.editingId = editingId || "";
  othelloCloseReadingUi.showForm = true;
  renderOthelloCloseReadingLab();
}
function createOthelloCloseReadingDraft(passageId, startLineId, endLineId, selectedText){
  return {
    id: "annotation-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
    sourceAssignmentId: passageId,
    startLineId,
    endLineId,
    selectedText,
    broadLens: "",
    specificCategory: "",
    paraphrase: "",
    significance: "",
    effect: "",
    confidence: "Still uncertain",
    teacherQuestion: false
  };
}
function normalizeOthelloCloseReadingSelectedText(text){
  return String(text || "").replace(/\s+/g, " ").trim();
}
function getOthelloCloseReadingLineNode(target){
  if (!target) return null;
  if (typeof target.closest === "function") return target.closest("[data-close-reading-line]");
  if (target.parentElement && typeof target.parentElement.closest === "function") return target.parentElement.closest("[data-close-reading-line]");
  return null;
}
function buildOthelloCloseReadingRangeText(passage, startLineId, endLineId){
  if (!passage) return "";
  const startIndex = findOthelloCloseReadingLineIndex(passage, startLineId);
  const endIndex = findOthelloCloseReadingLineIndex(passage, endLineId || startLineId);
  if (startIndex < 0 || endIndex < 0) return "";
  return normalizeOthelloCloseReadingSelectedText(
    passage.lines
      .slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
      .map((line) => line.text)
      .join(" ")
  );
}
function removeOthelloCloseReadingAnnotation(annotationId){
  const nextAnnotations = othelloCloseReadingState.annotations.filter((annotation) => annotation.id !== annotationId);
  othelloCloseReadingState.annotations = nextAnnotations;
  delete othelloCloseReadingState.analysisTasks[annotationId];
  if (othelloCloseReadingState.selectedAnalysisAnnotationId === annotationId) {
    othelloCloseReadingState.selectedAnalysisAnnotationId = nextAnnotations[0]?.id || "";
  }
  writeOthelloCloseReadingState();
  renderOthelloCloseReadingLab();
}
function updateOthelloCloseReadingDraftField(field, value){
  if (!othelloCloseReadingUi.formDraft) return;
  othelloCloseReadingUi.formDraft[field] = value;
}
function closeOthelloCloseReadingDraft(){
  othelloCloseReadingUi.showForm = false;
  othelloCloseReadingUi.editingId = "";
  othelloCloseReadingUi.formDraft = null;
  renderOthelloCloseReadingLab();
}
function renderOthelloCloseReadingProgress(){
  const progress = getOthelloCloseReadingProgress();
  document.querySelectorAll("[data-close-reading-progress-percent]").forEach((node) => node.textContent = progress.percent + "%");
  document.querySelectorAll("[data-close-reading-progress-copy]").forEach((node) => {
    node.textContent = progress.complete + " of " + progress.total + " requirements complete.";
  });
}
function renderOthelloCloseReadingPassageControls(){
  const passage = getActiveOthelloCloseReadingPassage();
  document.querySelectorAll("[data-close-reading-passage-select]").forEach((select) => { select.value = passage.id; });
  document.querySelectorAll("[data-close-reading-toggle-lines]").forEach((field) => { field.checked = othelloCloseReadingState.showLines; });
  document.querySelectorAll("[data-close-reading-passage-title]").forEach((node) => { node.textContent = passage.moduleTitle; });
  document.querySelectorAll("[data-close-reading-passage-range]").forEach((node) => { node.textContent = passage.citationRange; });
  document.querySelectorAll("[data-close-reading-annotation-count]").forEach((node) => {
    const count = othelloCloseReadingState.annotations.filter((annotation) => annotation.sourceAssignmentId === passage.id).length;
    node.textContent = count + " note" + (count === 1 ? "" : "s") + " in this passage.";
  });
  document.querySelectorAll("[data-close-reading-filter]").forEach((select) => { select.value = othelloCloseReadingState.activeFilter; });
  document.querySelectorAll("[data-close-reading-fallback]").forEach((node) => { node.hidden = !othelloCloseReadingUi.fallbackMode; });
  document.querySelectorAll("[data-close-reading-fallback-start]").forEach((select) => {
    select.innerHTML = '<option value="">Choose...</option>' + passage.lines.map((line) => '<option value="' + escapeClientHtml(line.lineId) + '">' + escapeClientHtml(line.lineNumber) + '</option>').join("");
    select.value = othelloCloseReadingUi.fallbackStart;
  });
  document.querySelectorAll("[data-close-reading-fallback-end]").forEach((select) => {
    select.innerHTML = '<option value="">Choose...</option>' + passage.lines.map((line) => '<option value="' + escapeClientHtml(line.lineId) + '">' + escapeClientHtml(line.lineNumber) + '</option>').join("");
    select.value = othelloCloseReadingUi.fallbackEnd;
  });
}
function renderOthelloCloseReadingPassageText(){
  const passage = getActiveOthelloCloseReadingPassage();
  const annotations = othelloCloseReadingState.annotations.filter((annotation) => annotation.sourceAssignmentId === passage.id);
  document.querySelectorAll("[data-close-reading-passage-text]").forEach((container) => {
    container.style.fontSize = othelloCloseReadingState.fontSize + "px";
    container.innerHTML = passage.lines.map((line) => {
      const lineAnnotations = annotations.filter((annotation) => othelloCloseReadingAnnotationMatchesLine(passage, annotation, line.lineId));
      const title = lineAnnotations.length ? lineAnnotations.map((annotation) => annotation.specificCategory || annotation.broadLens || "Annotation").join(" | ") : "";
      return '<div class="othello-close-reading-line" data-close-reading-line="' + escapeClientHtml(line.lineId) + '">'
        + '<div class="othello-close-reading-line-number">' + (othelloCloseReadingState.showLines ? escapeClientHtml(line.lineNumber) : "") + '</div>'
        + '<div class="othello-close-reading-line-speaker">' + escapeClientHtml(line.speaker || "") + '</div>'
        + '<div class="othello-close-reading-line-text' + (lineAnnotations.length ? ' is-annotated' : '') + '"' + (title ? ' title="' + escapeClientHtml(title) + '"' : '') + '>' + escapeClientHtml(line.text) + '</div>'
        + '</div>';
    }).join("");
  });
}
function renderOthelloCloseReadingAnnotationList(){
  const passage = getActiveOthelloCloseReadingPassage();
  const annotations = getFilteredOthelloCloseReadingAnnotations(passage.id);
  document.querySelectorAll("[data-close-reading-annotation-list]").forEach((container) => {
    if (!annotations.length) {
      container.innerHTML = '<div class="othello-close-reading-empty">Highlight text in the passage or use the line selector to begin a new annotation.</div>';
      return;
    }
    container.innerHTML = annotations.map((annotation) => '<article class="othello-close-reading-note' + (annotation.id === othelloCloseReadingState.selectedAnalysisAnnotationId ? ' is-selected' : '') + '" data-close-reading-note="' + escapeClientHtml(annotation.id) + '">'
      + '<div class="othello-close-reading-note-head"><strong>' + escapeClientHtml(annotation.specificCategory || annotation.broadLens || "Annotation") + '</strong>'
      + '<div class="othello-close-reading-note-actions"><button type="button" data-close-reading-edit="' + escapeClientHtml(annotation.id) + '">Edit</button><button type="button" data-close-reading-delete="' + escapeClientHtml(annotation.id) + '">Delete</button></div></div>'
      + '<blockquote>' + escapeClientHtml(annotation.selectedText) + '</blockquote>'
      + '<p><span>Paraphrase</span>' + escapeClientHtml(annotation.paraphrase || "Add your paraphrase in the note form.") + '</p>'
      + '<p><span>Significance</span>' + escapeClientHtml(annotation.significance || "Explain why this language matters.") + '</p>'
      + '</article>').join("");
  });
}
function renderOthelloCloseReadingAnalysis(){
  const options = ['<option value="">Choose from your annotations...</option>'].concat(othelloCloseReadingState.annotations.map((annotation) => '<option value="' + escapeClientHtml(annotation.id) + '">' + escapeClientHtml("[" + (annotation.specificCategory || annotation.broadLens || "Annotation") + "] " + annotation.selectedText.slice(0, 72) + (annotation.selectedText.length > 72 ? "..." : "")) + '</option>'));
  document.querySelectorAll("[data-close-reading-analysis-select]").forEach((select) => {
    select.innerHTML = options.join("");
    select.value = othelloCloseReadingState.selectedAnalysisAnnotationId;
  });
  const annotation = othelloCloseReadingState.annotations.find((item) => item.id === othelloCloseReadingState.selectedAnalysisAnnotationId);
  const tasks = annotation ? getOthelloCloseReadingTasks(annotation.id) : null;
  document.querySelectorAll("[data-close-reading-selected-reference]").forEach((container) => {
    if (!annotation) {
      container.innerHTML = '<div class="othello-close-reading-empty">Choose one saved annotation to open the three analysis tasks below.</div>';
      return;
    }
    container.innerHTML = '<div class="othello-close-reading-reference"><strong>Active evidence reference</strong><blockquote>' + escapeClientHtml(annotation.selectedText) + '</blockquote><div class="othello-close-reading-reference-grid"><div><span>Category</span>' + escapeClientHtml(annotation.specificCategory || annotation.broadLens || "Annotation") + '</div><div><span>Paraphrase</span>' + escapeClientHtml(annotation.paraphrase || "Not added yet") + '</div><div><span>Significance</span>' + escapeClientHtml(annotation.significance || "Not added yet") + '</div></div></div>';
  });
  document.querySelectorAll("[data-close-reading-analysis-body]").forEach((container) => {
    if (!annotation || !tasks) {
      container.innerHTML = "";
      return;
    }
    const hashtag = tasks.hashtags[0] || { text: "#", explanation: "" };
    const revealingWord = tasks.revealingWords[0] || { word: "", trait: "", explanation: "" };
    container.innerHTML = '<div class="othello-close-reading-analysis-grid">'
      + '<section class="othello-task-card othello-close-reading-analysis-card"><h4>Task 1: Hashtag summary</h4><p>Create a hashtag that captures the thematic shift or motivation revealed in this quotation.</p><label class="othello-response-field"><span>Hashtag</span><input data-close-reading-task-field="hashtag-text" placeholder="#ThemeShift" value="' + escapeClientHtml(hashtag.text || "#") + '"></label><label class="othello-response-field"><span>Explanation</span><textarea rows="4" data-close-reading-task-field="hashtag-explanation" placeholder="Explain why this hashtag fits this quotation.">' + escapeClientHtml(hashtag.explanation || "") + '</textarea></label></section>'
      + '<section class="othello-task-card othello-close-reading-analysis-card"><h4>Task 2: Revealing words</h4><p>Choose one word from the quotation and explain what it reveals about the speaker, mood, or conflict.</p><label class="othello-response-field"><span>Selected word</span><input data-close-reading-task-field="revealing-word" placeholder="Word from the quote" value="' + escapeClientHtml(revealingWord.word || "") + '"></label><label class="othello-response-field"><span>Trait or emotion revealed</span><input data-close-reading-task-field="revealing-trait" placeholder="Trait, motive, or emotion" value="' + escapeClientHtml(revealingWord.trait || "") + '"></label><label class="othello-response-field"><span>Explanation</span><textarea rows="4" data-close-reading-task-field="revealing-explanation" placeholder="Explain why this word choice matters in context.">' + escapeClientHtml(revealingWord.explanation || "") + '</textarea></label></section>'
      + '</div>'
      + '<section class="othello-task-card othello-close-reading-analysis-card"><h4>Task 3: Technique analysis</h4><p>If the quotation shows manipulation or a dramatic device, explain how it works and what effect it creates.</p><label class="othello-response-field"><span>Technique</span><select data-close-reading-task-field="technique"><option value="">Choose...</option><option' + (tasks.persuasiveTechnique.technique === "Repetition" ? ' selected' : '') + '>Repetition</option><option' + (tasks.persuasiveTechnique.technique === "Leading question" ? ' selected' : '') + '>Leading question</option><option' + (tasks.persuasiveTechnique.technique === "Dropping hints" ? ' selected' : '') + '>Dropping hints</option><option' + (tasks.persuasiveTechnique.technique === "Animalistic imagery" ? ' selected' : '') + '>Animalistic imagery</option><option' + (tasks.persuasiveTechnique.technique === "Dramatic Irony" ? ' selected' : '') + '>Dramatic Irony</option><option' + (tasks.persuasiveTechnique.technique === "Metaphor / simile" ? ' selected' : '') + '>Metaphor / simile</option><option' + (tasks.persuasiveTechnique.technique === "Other" ? ' selected' : '') + '>Other</option></select></label><div class="othello-field-grid"><label class="othello-response-field"><span>How the technique works</span><textarea rows="4" data-close-reading-task-field="technique-explanation" placeholder="Explain how the device operates in this quotation.">' + escapeClientHtml(tasks.persuasiveTechnique.explanation || "") + '</textarea></label><label class="othello-response-field"><span>Resulting effect</span><textarea rows="4" data-close-reading-task-field="technique-effect" placeholder="Explain the psychological or dramatic effect.">' + escapeClientHtml(tasks.persuasiveTechnique.effect || "") + '</textarea></label></div></section>';
  });
}
function renderOthelloCloseReadingSynthesis(){
  const wordCount = othelloCloseReadingWordCount(othelloCloseReadingState.finalResponse);
  document.querySelectorAll("[data-close-reading-final-response]").forEach((field) => { if (document.activeElement !== field) field.value = othelloCloseReadingState.finalResponse; });
  document.querySelectorAll("[data-close-reading-word-count]").forEach((node) => node.textContent = wordCount + " words");
  document.querySelectorAll("[data-close-reading-evidence-bank]").forEach((container) => {
    if (!othelloCloseReadingState.annotations.length) {
      container.innerHTML = '<div class="othello-close-reading-empty">Your evidence library will appear here as you save annotations from the passage browser.</div>';
      return;
    }
    container.innerHTML = othelloCloseReadingState.annotations.map((annotation) => '<article class="othello-close-reading-evidence-chip"><strong>' + escapeClientHtml(annotation.specificCategory || annotation.broadLens || "Annotation") + '</strong><p>"' + escapeClientHtml(annotation.selectedText) + '"</p></article>').join("");
  });
}
function renderOthelloCloseReadingModal(){
  document.querySelectorAll("[data-close-reading-modal]").forEach((container) => {
    if (!othelloCloseReadingUi.showForm || !othelloCloseReadingUi.formDraft) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }
    const draft = othelloCloseReadingUi.formDraft;
    container.hidden = false;
    container.innerHTML = '<div class="othello-close-reading-modal-card"><div class="othello-close-reading-modal-head"><h4>' + escapeClientHtml(othelloCloseReadingUi.editingId ? "Edit annotation" : "New annotation") + '</h4><button type="button" data-close-reading-modal-close>Close</button></div><div class="othello-close-reading-modal-body"><div class="othello-close-reading-modal-quote">"' + escapeClientHtml(draft.selectedText || "") + '"</div><div class="othello-close-reading-modal-grid"><label class="othello-response-field"><span>Broad lens</span><select data-close-reading-draft-field="broadLens"><option value="">Choose...</option>' + othelloCloseReadingCategories.lenses.map((item) => '<option value="' + escapeClientHtml(item) + '"' + (draft.broadLens === item ? ' selected' : '') + '>' + escapeClientHtml(item) + '</option>').join("") + '</select></label><label class="othello-response-field"><span>Specific category</span><select data-close-reading-draft-field="specificCategory"><option value="">Choose...</option><optgroup label="General">' + othelloCloseReadingCategories.general.map((item) => '<option value="' + escapeClientHtml(item) + '"' + (draft.specificCategory === item ? ' selected' : '') + '>' + escapeClientHtml(item) + '</option>').join("") + '</optgroup><optgroup label="Manipulation">' + othelloCloseReadingCategories.manipulation.map((item) => '<option value="' + escapeClientHtml(item) + '"' + (draft.specificCategory === item ? ' selected' : '') + '>' + escapeClientHtml(item) + '</option>').join("") + '</optgroup></select></label></div><label class="othello-response-field"><span>Paraphrase</span><textarea rows="4" data-close-reading-draft-field="paraphrase" placeholder="What does this mean in your own words?">' + escapeClientHtml(draft.paraphrase || "") + '</textarea></label><label class="othello-response-field"><span>Significance</span><textarea rows="5" data-close-reading-draft-field="significance" placeholder="Why does this language, action, or technique matter?">' + escapeClientHtml(draft.significance || "") + '</textarea></label><div class="othello-close-reading-modal-grid"><label class="othello-response-field"><span>Primary effect</span><select data-close-reading-draft-field="effect"><option value="">Choose...</option>' + ["Reveals character", "Creates suspicion", "Changes tone", "Influences another", "Develops theme", "Creates irony", "Builds tension"].map((item) => '<option value="' + escapeClientHtml(item) + '"' + (draft.effect === item ? ' selected' : '') + '>' + escapeClientHtml(item) + '</option>').join("") + '</select></label><label class="othello-response-field"><span>Confidence level</span><select data-close-reading-draft-field="confidence"><option' + (draft.confidence === "Still uncertain" ? ' selected' : '') + '>Still uncertain</option><option' + (draft.confidence === "Fairly confident" ? ' selected' : '') + '>Fairly confident</option><option' + (draft.confidence === "Very confident" ? ' selected' : '') + '>Very confident</option></select></label></div><label class="othello-close-reading-modal-check"><input type="checkbox" data-close-reading-draft-field="teacherQuestion"' + (draft.teacherQuestion ? ' checked' : '') + '> <span>Mark this as a question to revisit with your teacher.</span></label></div><div class="othello-close-reading-modal-foot"><p>Select a lens and category before saving.</p><div class="othello-close-reading-modal-foot-buttons"><button type="button" data-close-reading-modal-close>Cancel</button><button type="button" data-close-reading-modal-save>Save annotation</button></div></div></div>';
  });
}
function renderOthelloCloseReadingLab(){
  const root = document.querySelector("[data-othello-close-reading-root]");
  if (!root) return;
  if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
  renderOthelloCloseReadingProgress();
  renderOthelloCloseReadingPassageControls();
  renderOthelloCloseReadingPassageText();
  renderOthelloCloseReadingAnnotationList();
  renderOthelloCloseReadingAnalysis();
  renderOthelloCloseReadingSynthesis();
  renderOthelloCloseReadingModal();
}
function saveOthelloCloseReadingAnnotation(){
  if (!othelloCloseReadingUi.formDraft) return;
  if (!othelloCloseReadingUi.formDraft.specificCategory) {
    window.alert("Choose a specific category before saving this annotation.");
    return;
  }
  const draft = { ...othelloCloseReadingUi.formDraft };
  const index = othelloCloseReadingState.annotations.findIndex((annotation) => annotation.id === draft.id);
  if (index >= 0) othelloCloseReadingState.annotations.splice(index, 1, draft);
  else othelloCloseReadingState.annotations.push(draft);
  if (!othelloCloseReadingState.selectedAnalysisAnnotationId) othelloCloseReadingState.selectedAnalysisAnnotationId = draft.id;
  writeOthelloCloseReadingState();
  othelloCloseReadingUi.showForm = false;
  othelloCloseReadingUi.editingId = "";
  othelloCloseReadingUi.formDraft = null;
  const selection = window.getSelection();
  if (selection) selection.removeAllRanges();
  renderOthelloCloseReadingLab();
}
function updateOthelloCloseReadingTaskField(field, value){
  const annotationId = othelloCloseReadingState.selectedAnalysisAnnotationId;
  if (!annotationId) return;
  const tasks = JSON.parse(JSON.stringify(getOthelloCloseReadingTasks(annotationId)));
  if (field === "hashtag-text") tasks.hashtags[0].text = value;
  else if (field === "hashtag-explanation") tasks.hashtags[0].explanation = value;
  else if (field === "revealing-word") tasks.revealingWords[0].word = value;
  else if (field === "revealing-trait") tasks.revealingWords[0].trait = value;
  else if (field === "revealing-explanation") tasks.revealingWords[0].explanation = value;
  else if (field === "technique") tasks.persuasiveTechnique.technique = value;
  else if (field === "technique-explanation") tasks.persuasiveTechnique.explanation = value;
  else if (field === "technique-effect") tasks.persuasiveTechnique.effect = value;
  othelloCloseReadingState.analysisTasks[annotationId] = tasks;
  writeOthelloCloseReadingState();
  renderOthelloCloseReadingProgress();
}
function openOthelloCloseReadingSelectionDraftFromRange(startLineId, endLineId, selectedText){
  const passage = getActiveOthelloCloseReadingPassage();
  const cleanedText = normalizeOthelloCloseReadingSelectedText(selectedText);
  if (!passage || !startLineId || !endLineId || !cleanedText) return;
  openOthelloCloseReadingDraft(createOthelloCloseReadingDraft(passage.id, startLineId, endLineId, cleanedText));
}
function createOthelloThemeBuilderState(){
  return {
    sortingAssignments: Object.fromEntries(othelloThemeSortCards.map((card) => [card.id, "unassigned"])),
    diagnosticSelections: othelloThemeDiagnostics.map(() => ""),
    quickDrafts: Object.fromEntries(othelloThemeTopics.map((topic) => [topic, ""])),
    selectedTopic: "",
    topicReason: "",
    evidenceItems: [],
    patterns: [],
    finalThemeDraft: "",
    finalTheme: "",
    themeRevisions: [],
    response: {
      opening: "",
      evidenceOne: "",
      evidenceTwo: "",
      complexity: "",
      conclusion: "",
      compiled: ""
    }
  };
}
function normalizeOthelloThemeBuilderState(raw){
  const fallback = createOthelloThemeBuilderState();
  const quickDrafts = Object.fromEntries(othelloThemeTopics.map((topic) => [topic, typeof raw?.quickDrafts?.[topic] === "string" ? raw.quickDrafts[topic] : ""]));
  return {
    sortingAssignments: Object.fromEntries(othelloThemeSortCards.map((card) => {
      const value = raw?.sortingAssignments?.[card.id];
      return [card.id, value === "topic" || value === "theme" ? value : "unassigned"];
    })),
    diagnosticSelections: othelloThemeDiagnostics.map((entry, index) => typeof raw?.diagnosticSelections?.[index] === "string" ? raw.diagnosticSelections[index] : ""),
    quickDrafts,
    selectedTopic: othelloThemeTopics.includes(raw?.selectedTopic) ? raw.selectedTopic : "",
    topicReason: typeof raw?.topicReason === "string" ? raw.topicReason : "",
    evidenceItems: Array.isArray(raw?.evidenceItems) ? raw.evidenceItems.map((item, index) => ({
      id: typeof item?.id === "string" && item.id ? item.id : "theme-evidence-" + index,
      topic: othelloThemeTopics.includes(item?.topic) ? item.topic : "",
      act: typeof item?.act === "string" ? item.act : "",
      scene: typeof item?.scene === "string" ? item.scene : "",
      speaker: typeof item?.speaker === "string" ? item.speaker : "",
      quote: typeof item?.quote === "string" ? item.quote : "",
      citation: typeof item?.citation === "string" ? item.citation : "",
      context: typeof item?.context === "string" ? item.context : "",
      explanation: typeof item?.explanation === "string" ? item.explanation : "",
      role: typeof item?.role === "string" ? item.role : "Supports"
    })) : fallback.evidenceItems,
    patterns: Array.isArray(raw?.patterns) ? raw.patterns.map((item, index) => ({
      id: typeof item?.id === "string" && item.id ? item.id : "theme-pattern-" + index,
      name: typeof item?.name === "string" ? item.name : "",
      evidenceIds: Array.isArray(item?.evidenceIds) ? item.evidenceIds.filter((value) => typeof value === "string") : [],
      connection: typeof item?.connection === "string" ? item.connection : "",
      changes: typeof item?.changes === "string" ? item.changes : ""
    })) : fallback.patterns,
    finalThemeDraft: typeof raw?.finalThemeDraft === "string" ? raw.finalThemeDraft : "",
    finalTheme: typeof raw?.finalTheme === "string" ? raw.finalTheme : "",
    themeRevisions: Array.isArray(raw?.themeRevisions) ? raw.themeRevisions.map((entry) => ({
      text: typeof entry?.text === "string" ? entry.text : "",
      timestamp: typeof entry?.timestamp === "string" ? entry.timestamp : ""
    })).filter((entry) => entry.text) : [],
    response: {
      opening: typeof raw?.response?.opening === "string" ? raw.response.opening : "",
      evidenceOne: typeof raw?.response?.evidenceOne === "string" ? raw.response.evidenceOne : "",
      evidenceTwo: typeof raw?.response?.evidenceTwo === "string" ? raw.response.evidenceTwo : "",
      complexity: typeof raw?.response?.complexity === "string" ? raw.response.complexity : "",
      conclusion: typeof raw?.response?.conclusion === "string" ? raw.response.conclusion : "",
      compiled: typeof raw?.response?.compiled === "string" ? raw.response.compiled : ""
    }
  };
}
function readOthelloThemeBuilderState(){
  return normalizeOthelloThemeBuilderState(readResponses()[OTHELLO_THEME_STATE_KEY]);
}
function writeOthelloThemeBuilderState(){
  const responses = readResponses();
  responses[OTHELLO_THEME_STATE_KEY] = othelloThemeState;
  writeResponses(responses);
}
function createOthelloThemeEvidenceDraft(topic){
  return {
    topic: topic || othelloThemeTopics[0],
    act: "",
    scene: "",
    speaker: "",
    quote: "",
    citation: "",
    context: "",
    explanation: "",
    role: "Supports"
  };
}
function othelloThemeWordCount(text){
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}
function getOthelloThemeActiveEvidence(){
  if (!othelloThemeState.selectedTopic) return [];
  return othelloThemeState.evidenceItems
    .filter((item) => item.topic === othelloThemeState.selectedTopic)
    .sort((left, right) => Number(left.act || 0) - Number(right.act || 0) || Number(left.scene || 0) - Number(right.scene || 0));
}
function getOthelloThemeProgress(){
  const sortingPlaced = Object.values(othelloThemeState.sortingAssignments).filter((value) => value !== "unassigned").length;
  const sortingCorrect = othelloThemeSortCards.filter((card) => othelloThemeState.sortingAssignments[card.id] === card.answer).length;
  const diagnosticDone = othelloThemeState.diagnosticSelections.every(Boolean);
  const draftsDone = othelloThemeTopics.every((topic) => othelloThemeWordCount(othelloThemeState.quickDrafts[topic]) >= 5);
  const topicDone = Boolean(othelloThemeState.selectedTopic) && othelloThemeWordCount(othelloThemeState.topicReason) >= 40;
  const activeEvidence = getOthelloThemeActiveEvidence();
  const evidenceDone = activeEvidence.length >= 4 && new Set(activeEvidence.map((item) => item.act).filter(Boolean)).size >= 3;
  const patternDone = othelloThemeState.patterns.length >= 2;
  const finalThemeDone = othelloThemeWordCount(othelloThemeState.finalTheme) >= 12;
  const responseDone = othelloThemeWordCount(othelloThemeState.response.compiled) >= 200;
  const complete = [sortingCorrect >= 6 && sortingPlaced === othelloThemeSortCards.length, diagnosticDone, draftsDone, topicDone, evidenceDone, patternDone, finalThemeDone, responseDone].filter(Boolean).length;
  return { complete, total: 8, percent: Math.round((complete / 8) * 100), sortingPlaced, sortingCorrect, activeEvidence };
}
function renderOthelloThemeBuilderProgress(){
  const progress = getOthelloThemeProgress();
  document.querySelectorAll("[data-theme-progress-percent]").forEach((node) => node.textContent = progress.percent + "%");
  document.querySelectorAll("[data-theme-progress-copy]").forEach((node) => node.textContent = progress.complete + " of " + progress.total + " builder goals complete.");
  document.querySelectorAll("[data-theme-sort-status]").forEach((node) => node.textContent = progress.sortingPlaced + " of 8 placed | " + progress.sortingCorrect + " correct");
}
function renderOthelloThemeSortBoard(){
  const unassigned = othelloThemeSortCards.filter((card) => othelloThemeState.sortingAssignments[card.id] === "unassigned");
  const topics = othelloThemeSortCards.filter((card) => othelloThemeState.sortingAssignments[card.id] === "topic");
  const themes = othelloThemeSortCards.filter((card) => othelloThemeState.sortingAssignments[card.id] === "theme");
  const renderCard = (card) => '<article class="othello-theme-card"><h5>' + escapeClientHtml(card.text) + '</h5><div class="othello-theme-classify"><button type="button" class="' + (othelloThemeState.sortingAssignments[card.id] === "topic" ? 'is-active' : '') + '" data-theme-sort="' + escapeClientHtml(card.id) + '" data-theme-sort-value="topic">Topic</button><button type="button" class="' + (othelloThemeState.sortingAssignments[card.id] === "theme" ? 'is-active' : '') + '" data-theme-sort="' + escapeClientHtml(card.id) + '" data-theme-sort-value="theme">Theme</button><button type="button" data-theme-sort="' + escapeClientHtml(card.id) + '" data-theme-sort-value="unassigned">Reset</button></div></article>';
  document.querySelectorAll("[data-theme-sort-board]").forEach((container) => {
    container.innerHTML = '<div class="othello-theme-sort-grid"><section class="othello-theme-sort-column"><h5>Cards to sort</h5>' + (unassigned.length ? unassigned.map(renderCard).join("") : '<div class="othello-theme-empty">All cards have been sorted. Review your placements below.</div>') + '</section><section class="othello-theme-sort-column"><h5>Topic bucket</h5>' + (topics.length ? topics.map(renderCard).join("") : '<div class="othello-theme-empty">Move topic-only ideas here.</div>') + '</section><section class="othello-theme-sort-column"><h5>Theme bucket</h5>' + (themes.length ? themes.map(renderCard).join("") : '<div class="othello-theme-empty">Move full claims here.</div>') + '</section></div>';
  });
}
function renderOthelloThemeDiagnosticBoard(){
  document.querySelectorAll("[data-theme-diagnostic-board]").forEach((container) => {
    container.innerHTML = '<div class="othello-theme-diagnostic-grid">' + othelloThemeDiagnostics.map((entry, index) => {
      const selected = othelloThemeState.diagnosticSelections[index] || "";
      const feedback = selected ? '<div class="othello-theme-diagnostic-feedback"><strong>' + escapeClientHtml(selected === entry.issue ? "Correct." : "Best answer: " + entry.issue) + '</strong><blockquote>' + escapeClientHtml(entry.strong) + '</blockquote></div>' : "";
      return '<article class="othello-theme-diagnostic-card"><span class="othello-theme-meta">Weak draft ' + String(index + 1).padStart(2, "0") + '</span><blockquote>' + escapeClientHtml(entry.weak) + '</blockquote><p>Identify the main issue.</p><div class="othello-theme-diagnostic-issues">' + othelloThemeDiagnosticIssues.map((issue) => '<button type="button" class="' + (selected === issue ? 'is-active' : '') + '" data-theme-diagnostic="' + index + '" data-theme-diagnostic-value="' + escapeClientHtml(issue) + '">' + escapeClientHtml(issue) + '</button>').join("") + '</div>' + feedback + '</article>';
    }).join("") + '</div>';
  });
}
function renderOthelloThemeDraftsBoard(){
  document.querySelectorAll("[data-theme-drafts-board]").forEach((container) => {
    container.innerHTML = '<div class="othello-theme-drafts-grid">' + othelloThemeTopics.map((topic) => {
      const draft = othelloThemeState.quickDrafts[topic] || "";
      const wordCount = othelloThemeWordCount(draft);
      return '<article class="othello-theme-draft-card"><span class="othello-theme-subhead">' + escapeClientHtml(topic) + '</span><label class="othello-response-field"><span>Draft a theme statement</span><textarea rows="5" data-theme-draft="' + escapeClientHtml(topic) + '" placeholder="Write a full arguable claim, not just a topic.">' + escapeClientHtml(draft) + '</textarea></label><div class="othello-theme-draft-meta"><span>Word count: ' + wordCount + '</span><span>' + (wordCount >= 12 ? "On track" : "Aim for 12+ words") + '</span></div></article>';
    }).join("") + '</div>';
  });
}
function renderOthelloThemeTopicFocus(){
  document.querySelectorAll("[data-theme-topic-focus]").forEach((container) => {
    container.innerHTML = '<div class="othello-theme-topic-reason"><div class="othello-theme-topic-choice">' + othelloThemeTopics.map((topic) => '<button type="button" class="' + (othelloThemeState.selectedTopic === topic ? 'is-active' : '') + '" data-theme-topic="' + escapeClientHtml(topic) + '">' + escapeClientHtml(topic) + '</button>').join("") + '</div><label class="othello-response-field"><span>Why is this the strongest topic for analysis?</span><textarea rows="6" data-theme-topic-reason placeholder="Explain why this topic allows a more complex and defensible interpretation of Othello.">' + escapeClientHtml(othelloThemeState.topicReason) + '</textarea></label><div class="othello-theme-topic-meta"><span>Selected topic: ' + escapeClientHtml(othelloThemeState.selectedTopic || "None yet") + '</span><span>Reason word count: ' + othelloThemeWordCount(othelloThemeState.topicReason) + '</span></div></div>';
  });
}
function renderOthelloThemeEvidenceBoard(){
  const activeEvidence = getOthelloThemeActiveEvidence();
  document.querySelectorAll("[data-theme-evidence-board]").forEach((container) => {
    if (!othelloThemeState.selectedTopic) {
      container.innerHTML = '<div class="othello-theme-empty">Choose your deep-dive topic first so the evidence bank knows what line of analysis you are building.</div>';
      return;
    }
    const draft = othelloThemeUi.evidenceDraft || createOthelloThemeEvidenceDraft(othelloThemeState.selectedTopic);
    const formHtml = othelloThemeUi.evidenceOpen ? '<section class="othello-theme-evidence-form"><div class="othello-theme-evidence-toolbar"><div class="othello-theme-callout"><strong>Working topic:</strong> ' + escapeClientHtml(othelloThemeState.selectedTopic) + '</div><button type="button" data-theme-cancel-evidence>Cancel</button></div><div class="othello-theme-evidence-grid"><label class="othello-response-field"><span>Act</span><input data-theme-evidence-field="act" value="' + escapeClientHtml(draft.act) + '" placeholder="1"></label><label class="othello-response-field"><span>Scene</span><input data-theme-evidence-field="scene" value="' + escapeClientHtml(draft.scene) + '" placeholder="3"></label><label class="othello-response-field"><span>Speaker</span><input data-theme-evidence-field="speaker" value="' + escapeClientHtml(draft.speaker) + '" placeholder="Iago"></label><label class="othello-response-field"><span>Role in argument</span><select data-theme-evidence-field="role"><option' + (draft.role === "Supports" ? ' selected' : '') + '>Supports</option><option' + (draft.role === "Complicates" ? ' selected' : '') + '>Complicates</option><option' + (draft.role === "Shows Development" ? ' selected' : '') + '>Shows Development</option></select></label><label class="othello-response-field"><span>Quotation</span><textarea rows="4" data-theme-evidence-field="quote" placeholder="Copy the exact line or short passage.">' + escapeClientHtml(draft.quote) + '</textarea></label><label class="othello-response-field"><span>Citation</span><input data-theme-evidence-field="citation" value="' + escapeClientHtml(draft.citation) + '" placeholder="(3.3.165-167)"></label><label class="othello-response-field"><span>Context</span><textarea rows="4" data-theme-evidence-field="context" placeholder="Who is speaking, to whom, and under what circumstances?">' + escapeClientHtml(draft.context) + '</textarea></label><label class="othello-response-field"><span>Explanation</span><textarea rows="5" data-theme-evidence-field="explanation" placeholder="Explain how this evidence connects to your selected topic.">' + escapeClientHtml(draft.explanation) + '</textarea></label></div><div class="othello-theme-save-row"><div class="othello-theme-evidence-meta"><span>Explanation words: ' + othelloThemeWordCount(draft.explanation) + '</span><span>Acts represented after save: ' + new Set(activeEvidence.map((item) => item.act).filter(Boolean)).size + '</span></div><button type="button" data-theme-save-evidence>' + escapeClientHtml(othelloThemeUi.editingEvidenceId ? "Update evidence" : "Save evidence") + '</button></div></section>' : "";
    const listHtml = activeEvidence.length ? activeEvidence.map((item) => '<article class="othello-theme-evidence-card"><small>Act ' + escapeClientHtml(item.act || "?") + ', Scene ' + escapeClientHtml(item.scene || "?") + ' | ' + escapeClientHtml(item.speaker || "Speaker") + ' | ' + escapeClientHtml(item.role || "Supports") + '</small><blockquote>' + escapeClientHtml(item.quote) + '</blockquote><p><strong>Context:</strong> ' + escapeClientHtml(item.context || "Add context.") + '</p><p><strong>Analysis:</strong> ' + escapeClientHtml(item.explanation || "Add an explanation.") + '</p><div class="othello-theme-pattern-actions"><button type="button" data-theme-edit-evidence="' + escapeClientHtml(item.id) + '">Edit</button><button type="button" data-theme-delete-evidence="' + escapeClientHtml(item.id) + '">Delete</button></div></article>').join("") : '<div class="othello-theme-empty">No evidence saved for ' + escapeClientHtml(othelloThemeState.selectedTopic) + ' yet.</div>';
    container.innerHTML = '<div class="othello-theme-callout"><strong>Current focus:</strong> ' + escapeClientHtml(othelloThemeState.selectedTopic) + ' | ' + activeEvidence.length + ' evidence items | ' + new Set(activeEvidence.map((item) => item.act).filter(Boolean)).size + ' acts represented</div>' + formHtml + '<div class="othello-theme-pattern-stack">' + listHtml + '</div>';
  });
}
function renderOthelloThemePatternBoard(){
  const activeEvidence = getOthelloThemeActiveEvidence();
  document.querySelectorAll("[data-theme-pattern-board]").forEach((container) => {
    if (!othelloThemeState.selectedTopic) {
      container.innerHTML = '<div class="othello-theme-empty">Choose a topic and save evidence first. Pattern groups work best when you can compare evidence across acts.</div>';
      return;
    }
    const timeline = activeEvidence.length ? activeEvidence.map((item) => '<article class="othello-theme-evidence-card"><small>Act ' + escapeClientHtml(item.act || "?") + ', Scene ' + escapeClientHtml(item.scene || "?") + ' | ' + escapeClientHtml(item.speaker || "Speaker") + '</small><blockquote>' + escapeClientHtml(item.quote) + '</blockquote><div class="othello-theme-pattern-toggle-list">' + (othelloThemeState.patterns.length ? othelloThemeState.patterns.map((pattern, index) => '<button type="button" class="' + (pattern.evidenceIds.includes(item.id) ? 'is-active' : '') + '" data-theme-pattern-toggle="' + escapeClientHtml(pattern.id) + '" data-theme-pattern-evidence="' + escapeClientHtml(item.id) + '">' + escapeClientHtml(pattern.name || "Pattern " + String(index + 1)) + '</button>').join("") : '<span class="othello-theme-meta">Add a pattern group to begin sorting evidence.</span>') + '</div></article>').join("") : '<div class="othello-theme-empty">Your evidence timeline is empty. Add at least four quotations before looking for patterns.</div>';
    const patterns = othelloThemeState.patterns.length ? othelloThemeState.patterns.map((pattern, index) => '<article class="othello-theme-pattern-card"><div class="othello-theme-pattern-actions"><h5>' + escapeClientHtml(pattern.name || "Pattern " + String(index + 1)) + '</h5><button type="button" data-theme-delete-pattern="' + escapeClientHtml(pattern.id) + '">Delete</button></div><label class="othello-response-field"><span>Name this pattern</span><input data-theme-pattern-field="name" data-theme-pattern-id="' + escapeClientHtml(pattern.id) + '" value="' + escapeClientHtml(pattern.name) + '" placeholder="Suspicion replacing trust"></label><div class="othello-theme-tag-list">' + (pattern.evidenceIds.length ? pattern.evidenceIds.map((evidenceId) => {
      const match = activeEvidence.find((item) => item.id === evidenceId) || othelloThemeState.evidenceItems.find((item) => item.id === evidenceId);
      return match ? '<span class="othello-theme-pattern-chip">Act ' + escapeClientHtml(match.act || "?") + '.' + escapeClientHtml(match.scene || "?") + ' ' + escapeClientHtml(match.speaker || "Speaker") + '</span>' : "";
    }).join("") : '<span class="othello-theme-meta">No evidence linked yet.</span>') + '</div><div class="othello-theme-pattern-copy"><label class="othello-response-field"><span>What connects this evidence?</span><textarea rows="4" data-theme-pattern-field="connection" data-theme-pattern-id="' + escapeClientHtml(pattern.id) + '" placeholder="Explain the common thread tying these quotations together.">' + escapeClientHtml(pattern.connection) + '</textarea></label><label class="othello-response-field"><span>What changes across the play?</span><textarea rows="4" data-theme-pattern-field="changes" data-theme-pattern-id="' + escapeClientHtml(pattern.id) + '" placeholder="Describe the development, escalation, or contrast you notice.">' + escapeClientHtml(pattern.changes) + '</textarea></label></div></article>').join("") : '<div class="othello-theme-empty">Create at least two pattern groups so you can track recurring ideas and developments.</div>';
    container.innerHTML = '<div class="othello-theme-pattern-layout"><section class="othello-theme-pattern-column"><h5>Evidence timeline</h5><p>Review your saved evidence in order and assign it to pattern groups.</p><div class="othello-theme-pattern-stack">' + timeline + '</div></section><section class="othello-theme-pattern-workspace"><h5>Pattern workspace</h5><p>Build at least two groups that help you move from quotations to interpretation.</p><div class="othello-theme-pattern-stack">' + patterns + '</div></section></div>';
  });
}
function renderOthelloThemeFinalBoard(){
  const draft = othelloThemeState.finalThemeDraft || othelloThemeState.quickDrafts[othelloThemeState.selectedTopic] || "";
  const wordCount = othelloThemeWordCount(draft);
  const hasBadPhrasing = /the theme is/i.test(draft);
  const hasAbsolute = /\b(always|never|everyone|nobody)\b/i.test(draft);
  const hasCharacterName = /(Othello|Iago|Desdemona|Cassio|Emilia|Roderigo|Brabantio)/i.test(draft);
  document.querySelectorAll("[data-theme-final-board]").forEach((container) => {
    container.innerHTML = '<div class="othello-theme-final-grid"><section class="othello-theme-final-layout"><span class="othello-theme-subhead">Selected topic</span><h5>' + escapeClientHtml(othelloThemeState.selectedTopic || "Choose a topic first") + '</h5><div class="othello-theme-final-quote">' + escapeClientHtml(othelloThemeState.quickDrafts[othelloThemeState.selectedTopic] || "Your best quick draft will appear here once a topic is selected.") + '</div><label class="othello-response-field"><span>Refined final theme</span><textarea rows="6" data-theme-final-draft placeholder="Turn the topic into a polished claim about human behaviour.">' + escapeClientHtml(draft) + '</textarea></label><div class="othello-theme-final-meta"><span>Draft words: ' + wordCount + '</span><span>Committed versions: ' + othelloThemeState.themeRevisions.length + '</span></div></section><section class="othello-theme-final-layout"><span class="othello-theme-subhead">Automated checks</span><div class="othello-theme-callout"><strong>' + (wordCount >= 12 ? "Length is on track." : "Aim for at least 12 words.") + '</strong><p>' + (hasBadPhrasing ? 'Avoid starting with "The theme is...".' : "Phrase the idea directly.") + '</p><p>' + (hasAbsolute ? "Check whether your absolute wording is too broad." : "No absolute wording detected.") + '</p><p>' + (hasCharacterName ? "Try making the claim more universal instead of naming one character." : "The wording already feels more universal.") + '</p></div><div class="othello-theme-revision-list">' + (othelloThemeState.themeRevisions.length ? othelloThemeState.themeRevisions.map((entry) => '<div class="othello-theme-revision-item"><strong>' + escapeClientHtml(entry.timestamp || "Saved") + '</strong><p>' + escapeClientHtml(entry.text) + '</p></div>').join("") : '<div class="othello-theme-empty">Commit your strongest version to build a revision trail.</div>') + '</div></section></div>';
  });
  document.querySelectorAll("[data-theme-final-draft]").forEach((field) => { if (document.activeElement !== field) field.value = draft; });
}
function renderOthelloThemeResponseBoard(){
  const response = othelloThemeState.response;
  document.querySelectorAll("[data-theme-response-board]").forEach((container) => {
    container.innerHTML = '<div class="othello-theme-response-grid"><section class="othello-theme-response-layout"><h5>Build the paragraph in sections</h5><label class="othello-response-field"><span>Opening and claim</span><textarea rows="4" data-theme-response-field="opening" placeholder="Introduce the play and state your final theme clearly.">' + escapeClientHtml(response.opening) + '</textarea></label><label class="othello-response-field"><span>First evidence sequence</span><textarea rows="5" data-theme-response-field="evidenceOne" placeholder="Integrate one quotation and explain how it proves your theme.">' + escapeClientHtml(response.evidenceOne) + '</textarea></label><label class="othello-response-field"><span>Second evidence sequence</span><textarea rows="5" data-theme-response-field="evidenceTwo" placeholder="Build on the first pattern with a second piece of evidence.">' + escapeClientHtml(response.evidenceTwo) + '</textarea></label><label class="othello-response-field"><span>Complexity / qualification</span><textarea rows="4" data-theme-response-field="complexity" placeholder="Acknowledge the nuance, contradiction, or limit in your argument.">' + escapeClientHtml(response.complexity) + '</textarea></label><label class="othello-response-field"><span>Conclusion</span><textarea rows="4" data-theme-response-field="conclusion" placeholder="Restate the insight in a new way and explain the broader significance.">' + escapeClientHtml(response.conclusion) + '</textarea></label></section><section class="othello-theme-compiled"><h5>Composed paragraph</h5><p>Use the assemble button above to combine your sections, then polish the finished paragraph here.</p><textarea rows="14" data-theme-response-field="compiled" placeholder="Your assembled paragraph will appear here.">' + escapeClientHtml(response.compiled) + '</textarea><div class="othello-theme-compiled-meta">Word count: ' + othelloThemeWordCount(response.compiled) + ' | Aim for a developed analytical paragraph.</div></section></div>';
  });
}
function syncOthelloThemePathway(){
  const validStages = ["sort", "diagnostic", "drafts", "topic", "evidence", "patterns", "final", "response"];
  if (!validStages.includes(othelloThemeUi.activeStage)) othelloThemeUi.activeStage = "sort";
  document.querySelectorAll("[data-theme-stage-select]").forEach((select) => {
    if (select.value !== othelloThemeUi.activeStage) select.value = othelloThemeUi.activeStage;
    syncOverlaySelectUI(select);
  });
  document.querySelectorAll("[data-theme-stage]").forEach((button) => {
    const isActive = button.getAttribute("data-theme-stage") === othelloThemeUi.activeStage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");
  });
  document.querySelectorAll("[data-theme-stage-panel]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-theme-stage-panel") !== othelloThemeUi.activeStage;
  });
}
function renderOthelloThemeBuilder(){
  const root = document.querySelector("[data-othello-theme-root]");
  if (!root) return;
  if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
  renderOthelloThemeBuilderProgress();
  renderOthelloThemeSortBoard();
  renderOthelloThemeDiagnosticBoard();
  renderOthelloThemeDraftsBoard();
  renderOthelloThemeTopicFocus();
  renderOthelloThemeEvidenceBoard();
  renderOthelloThemePatternBoard();
  renderOthelloThemeFinalBoard();
  renderOthelloThemeResponseBoard();
  syncOthelloThemePathway();
}
function openOthelloThemeEvidenceDraft(evidenceId){
  const existing = evidenceId ? othelloThemeState.evidenceItems.find((item) => item.id === evidenceId) : null;
  othelloThemeUi.evidenceOpen = true;
  othelloThemeUi.editingEvidenceId = evidenceId || "";
  othelloThemeUi.evidenceDraft = existing ? { ...existing } : createOthelloThemeEvidenceDraft(othelloThemeState.selectedTopic || othelloThemeTopics[0]);
  renderOthelloThemeEvidenceBoard();
}
function closeOthelloThemeEvidenceDraft(){
  othelloThemeUi.evidenceOpen = false;
  othelloThemeUi.editingEvidenceId = "";
  othelloThemeUi.evidenceDraft = null;
  renderOthelloThemeEvidenceBoard();
}
function saveOthelloThemeEvidenceDraft(){
  if (!othelloThemeUi.evidenceDraft) return;
  const draft = { ...othelloThemeUi.evidenceDraft, topic: othelloThemeState.selectedTopic || othelloThemeUi.evidenceDraft.topic };
  if (!draft.act || !draft.quote || othelloThemeWordCount(draft.explanation) < 20) {
    window.alert("Add an act, a quotation, and at least 20 words of explanation before saving this evidence.");
    return;
  }
  if (othelloThemeUi.editingEvidenceId) {
    othelloThemeState.evidenceItems = othelloThemeState.evidenceItems.map((item) => item.id === othelloThemeUi.editingEvidenceId ? { ...item, ...draft } : item);
  } else {
    othelloThemeState.evidenceItems.push({ id: "theme-evidence-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7), ...draft });
  }
  writeOthelloThemeBuilderState();
  closeOthelloThemeEvidenceDraft();
  renderOthelloThemeBuilder();
}
function assembleOthelloThemeResponse(){
  const response = othelloThemeState.response;
  othelloThemeState.response.compiled = [response.opening, response.evidenceOne, response.evidenceTwo, response.complexity, response.conclusion].join(" ").replace(/\s+/g, " ").trim();
  writeOthelloThemeBuilderState();
  renderOthelloThemeResponseBoard();
  renderOthelloThemeBuilderProgress();
}
function commitOthelloThemeFinal(){
  const draft = (othelloThemeState.finalThemeDraft || "").trim();
  if (othelloThemeWordCount(draft) < 12) {
    window.alert("Refine the theme statement a bit more before committing it as your final version.");
    return;
  }
  othelloThemeState.finalTheme = draft;
  othelloThemeState.themeRevisions.push({ text: draft, timestamp: new Date().toLocaleTimeString() });
  writeOthelloThemeBuilderState();
  renderOthelloThemeFinalBoard();
  renderOthelloThemeBuilderProgress();
}
function handleOthelloLanguageMatchSelection(kind, value){
  if (!value) return;
  if (kind === "eliz") othelloLanguageUi.selectedEliz = value;
  if (kind === "mod") othelloLanguageUi.selectedMod = value;
  if (!othelloLanguageUi.selectedEliz || !othelloLanguageUi.selectedMod) {
    renderOthelloLanguageMatchmaker();
    return;
  }
  const selectedPair = othelloLanguageMatchingPairs.find((pair) => pair.eliz === othelloLanguageUi.selectedEliz);
  if (selectedPair && selectedPair.mod === othelloLanguageUi.selectedMod) {
    if (!othelloLanguageState.matchedPairs.includes(selectedPair.eliz)) {
      othelloLanguageState.matchedPairs.push(selectedPair.eliz);
      writeOthelloLanguageState();
    }
    othelloLanguageUi.selectedEliz = "";
    othelloLanguageUi.selectedMod = "";
    renderOthelloLanguageMatchmaker();
    renderOthelloLanguageScorecard();
    return;
  }
  clearTimeout(othelloLanguageUi.wrongTimer);
  othelloLanguageUi.wrongEliz = othelloLanguageUi.selectedEliz;
  othelloLanguageUi.wrongMod = othelloLanguageUi.selectedMod;
  othelloLanguageUi.selectedEliz = "";
  othelloLanguageUi.selectedMod = "";
  renderOthelloLanguageMatchmaker();
  othelloLanguageUi.wrongTimer = setTimeout(() => {
    othelloLanguageUi.wrongEliz = "";
    othelloLanguageUi.wrongMod = "";
    renderOthelloLanguageMatchmaker();
  }, 700);
}
function updateOthelloLanguageContraction(index, value){
  othelloLanguageState.contractions[index] = value;
  writeOthelloLanguageState();
  updateOthelloLanguageContractionCard(index);
  renderOthelloLanguageScorecard();
}
function updateOthelloLanguagePronoun(index, value){
  othelloLanguageState.pronouns[index] = value;
  writeOthelloLanguageState();
  updateOthelloLanguagePronounCard(index);
  renderOthelloLanguageScorecard();
}
function moveOthelloLanguageWordToBuilt(sentenceIndex, wordIndex){
  const sentence = othelloLanguageState.sentences[sentenceIndex];
  if (!sentence || sentence.completed) return;
  const word = sentence.bank[wordIndex];
  if (word === undefined) return;
  sentence.bank.splice(wordIndex, 1);
  sentence.built.push(word);
  writeOthelloLanguageState();
  renderOthelloLanguageSentenceCard(sentenceIndex);
}
function moveOthelloLanguageWordToBank(sentenceIndex, wordIndex){
  const sentence = othelloLanguageState.sentences[sentenceIndex];
  if (!sentence || sentence.completed) return;
  const word = sentence.built[wordIndex];
  if (word === undefined) return;
  sentence.built.splice(wordIndex, 1);
  sentence.bank.push(word);
  writeOthelloLanguageState();
  renderOthelloLanguageSentenceCard(sentenceIndex);
}
function checkOthelloLanguageSentence(sentenceIndex){
  const sentence = othelloLanguageState.sentences[sentenceIndex];
  const target = othelloLanguageSentences[sentenceIndex];
  if (!sentence || sentence.completed) return;
  if (sentence.built.join(" ") === target.words.join(" ")) {
    sentence.completed = true;
    writeOthelloLanguageState();
    renderOthelloLanguageSentenceCard(sentenceIndex);
    renderOthelloLanguageScorecard();
    return;
  }
  clearTimeout(othelloLanguageUi.sentenceTimers[sentenceIndex]);
  othelloLanguageUi.sentenceErrorIndex = sentenceIndex;
  renderOthelloLanguageSentenceCard(sentenceIndex);
  othelloLanguageUi.sentenceTimers[sentenceIndex] = setTimeout(() => {
    if (othelloLanguageUi.sentenceErrorIndex === sentenceIndex) {
      othelloLanguageUi.sentenceErrorIndex = -1;
      renderOthelloLanguageSentenceCard(sentenceIndex);
    }
  }, 1200);
}
function characterDossierDefaultColor(character){ return characterDossierAccents[character] || "#4f6542"; }
function createCharacterDossierState(character){
  return {
    oneWord: "",
    color: characterDossierDefaultColor(character),
    animal: "",
    animalReason: "",
    firstImpression: "",
    othersView: "",
    role: "",
    hamartia: "",
    foil: "",
    evolution: [],
    quotes: []
  };
}
function normalizeCharacterDossiers(payload){
  const normalized = {};
  characterDossierCharacters.forEach(function(character){
    const source = payload && typeof payload[character] === "object" && payload[character] ? payload[character] : {};
    const base = createCharacterDossierState(character);
    normalized[character] = {
      ...base,
      ...source,
      color: typeof source.color === "string" && source.color ? source.color : base.color,
      evolution: Array.isArray(source.evolution)
        ? source.evolution.map(function(entry, index){
            return {
              id: entry?.id || "evolution-" + character.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + "-" + index,
              act: characterDossierActs.includes(entry?.act) ? entry.act : characterDossierActs[0],
              text: String(entry?.text || "")
            };
          })
        : [],
      quotes: Array.isArray(source.quotes)
        ? source.quotes.map(function(entry, index){
            return {
              id: entry?.id || "quote-" + character.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + "-" + index,
              act: characterDossierActs.includes(entry?.act) ? entry.act : characterDossierActs[0],
              text: String(entry?.text || ""),
              citation: String(entry?.citation || ""),
              meaning: String(entry?.meaning || "")
            };
          })
        : []
    };
  });
  return normalized;
}
function readCharacterDossiers(){
  try {
    return normalizeCharacterDossiers(JSON.parse(localStorage.getItem(CHARACTER_DOSSIER_STORAGE_KEY) || "{}"));
  } catch {
    return normalizeCharacterDossiers({});
  }
}
function writeCharacterDossiers(values){
  localStorage.setItem(CHARACTER_DOSSIER_STORAGE_KEY, JSON.stringify(normalizeCharacterDossiers(values)));
}
function readActiveCharacterDossier(){
  const value = localStorage.getItem(CHARACTER_DOSSIER_ACTIVE_KEY) || characterDossierCharacters[0];
  return characterDossierCharacters.includes(value) ? value : characterDossierCharacters[0];
}
function writeActiveCharacterDossier(value){
  if (characterDossierCharacters.includes(value)) {
    localStorage.setItem(CHARACTER_DOSSIER_ACTIVE_KEY, value);
  }
}
function characterDossierRgbChannels(color){
  const cleaned = String(color || "").replace("#", "").trim();
  if (!/^[0-9a-f]{6}$/i.test(cleaned)) return "45, 91, 79";
  return Number.parseInt(cleaned.slice(0, 2), 16) + ", "
    + Number.parseInt(cleaned.slice(2, 4), 16) + ", "
    + Number.parseInt(cleaned.slice(4, 6), 16);
}
function applyCharacterDossierTheme(root, color){
  if (!root) return;
  const nextColor = /^#[0-9a-f]{6}$/i.test(String(color || "").trim()) ? String(color).trim() : "#2d5b4f";
  root.style.setProperty("--character-accent", nextColor);
  root.style.setProperty("--character-accent-rgb", characterDossierRgbChannels(nextColor));
}
function activeCharacterDossierName(){
  const root = document.querySelector("[data-character-dossier-studio]");
  const current = root?.getAttribute("data-active-character-dossier") || "";
  return characterDossierCharacters.includes(current) ? current : readActiveCharacterDossier();
}
function characterDossierProgress(data){
  let score = 0;
  const total = 9;
  if ((data.oneWord || "").trim()) score += 1;
  if ((data.animal || "").trim() && (data.animalReason || "").trim()) score += 1;
  if ((data.firstImpression || "").trim()) score += 1;
  if ((data.othersView || "").trim()) score += 1;
  if ((data.role || "").trim()) score += 1;
  if ((data.hamartia || "").trim()) score += 1;
  if ((data.foil || "").trim()) score += 1;
  if ((data.evolution || []).some(function(entry){ return (entry.text || "").trim(); })) score += 1;
  if ((data.quotes || []).some(function(entry){ return (entry.text || "").trim(); })) score += 1;
  return Math.min(100, Math.round((score / total) * 100));
}
function characterDossierEntryId(prefix){
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}
function renderCharacterDossierActOptions(selectedAct){
  return characterDossierActs.map(function(act){
    return '<option value="' + escapeClientHtml(act) + '"' + (act === selectedAct ? ' selected' : '') + '>' + escapeClientHtml(act) + '</option>';
  }).join("");
}
function renderCharacterDossierBody(character){
  const dossiers = readCharacterDossiers();
  const data = dossiers[character] || createCharacterDossierState(character);
  const evolutionHtml = data.evolution.length
    ? data.evolution.map(function(entry){
        return '<article class="character-dossier-entry">'
          + '<div class="character-dossier-entry-head"><div class="character-dossier-entry-meta"><span class="character-dossier-entry-pill">' + escapeClientHtml(entry.act) + '</span><h5>Arc point</h5></div><button type="button" class="character-dossier-entry-remove" data-character-dossier-remove="evolution" data-character-dossier-entry-id="' + escapeClientHtml(entry.id) + '">Remove</button></div>'
          + '<div class="character-dossier-grid">'
          + '<label class="character-dossier-field"><span>Act</span><select data-character-dossier-evolution-field="act" data-character-dossier-entry-id="' + escapeClientHtml(entry.id) + '">' + renderCharacterDossierActOptions(entry.act) + '</select></label>'
          + '<label class="character-dossier-field"><span>Shift in character</span><textarea rows="4" data-character-dossier-evolution-field="text" data-character-dossier-entry-id="' + escapeClientHtml(entry.id) + '" placeholder="How has the character&#39;s mindset, loyalty, reputation, or behavior shifted?">' + escapeClientHtml(entry.text) + '</textarea></label>'
          + '</div>'
          + '</article>';
      }).join("")
    : '<div class="character-dossier-empty"><p>No arc points yet. Add one scene-based shift in motivation, reputation, or self-understanding.</p></div>';
  const quoteHtml = data.quotes.length
    ? data.quotes.map(function(entry, index){
        return '<article class="character-dossier-entry character-dossier-quote-entry">'
          + '<div class="character-dossier-entry-head"><div class="character-dossier-entry-meta"><span class="character-dossier-entry-pill">Entry ' + String(index + 1).padStart(2, "0") + '</span><h5>Quotation bank</h5></div><button type="button" class="character-dossier-entry-remove" data-character-dossier-remove="quote" data-character-dossier-entry-id="' + escapeClientHtml(entry.id) + '">Remove</button></div>'
          + '<div class="character-dossier-quote-grid">'
          + '<label class="character-dossier-field"><span>Act</span><select data-character-dossier-quote-field="act" data-character-dossier-entry-id="' + escapeClientHtml(entry.id) + '">' + renderCharacterDossierActOptions(entry.act) + '</select></label>'
          + '<label class="character-dossier-field"><span>Citation</span><input type="text" value="' + escapeClientHtml(entry.citation) + '" data-character-dossier-quote-field="citation" data-character-dossier-entry-id="' + escapeClientHtml(entry.id) + '" placeholder="(Act.Scene.Line)"></label>'
          + '<label class="character-dossier-field"><span>Quotation</span><textarea rows="4" data-character-dossier-quote-field="text" data-character-dossier-entry-id="' + escapeClientHtml(entry.id) + '" placeholder="Copy the line or short passage that matters most for this character.">' + escapeClientHtml(entry.text) + '</textarea></label>'
          + '<label class="character-dossier-field"><span>Analysis / significance</span><textarea rows="4" data-character-dossier-quote-field="meaning" data-character-dossier-entry-id="' + escapeClientHtml(entry.id) + '" placeholder="Explain what this quotation reveals about motive, flaw, power, or change.">' + escapeClientHtml(entry.meaning) + '</textarea></label>'
          + '</div>'
          + '</article>';
      }).join("")
    : '<div class="character-dossier-empty"><p>No quotations logged yet. Add a line that captures the character&#39;s voice, motive, or turning point.</p></div>';

  return '<div class="character-dossier-overview">'
    + '<section class="character-dossier-card"><label class="character-dossier-field"><span>Defining trait</span><small>Choose one word or short phrase that captures the character at this stage of the play.</small><input type="text" value="' + escapeClientHtml(data.oneWord) + '" data-character-dossier-field="oneWord" placeholder="e.g. honorable, manipulative, trusting"></label></section>'
    + '<section class="character-dossier-card"><div class="character-dossier-field"><span>Animal symbol</span><small>If this character were an animal, what would fit best, and why?</small><input type="text" value="' + escapeClientHtml(data.animal) + '" data-character-dossier-field="animal" placeholder="Choose an animal or symbol"><textarea rows="3" data-character-dossier-field="animalReason" placeholder="Explain how the animal reflects instinct, power, vulnerability, or reputation.">' + escapeClientHtml(data.animalReason) + '</textarea></div></section>'
    + '</div>'
    + '<div class="character-dossier-grid">'
    + '<section class="character-dossier-card"><div class="character-dossier-field"><span>First impression</span><small>What do we first notice about this character, and how are they presented?</small><textarea rows="5" data-character-dossier-field="firstImpression" placeholder="In the opening scenes, this character appears to be...">' + escapeClientHtml(data.firstImpression) + '</textarea></div></section>'
    + '<section class="character-dossier-card"><div class="character-dossier-field"><span>Public perception</span><small>How do other characters describe or judge this person, and what do we learn beneath that image?</small><textarea rows="5" data-character-dossier-field="othersView" placeholder="Venice sees this character as..., but the play reveals...">' + escapeClientHtml(data.othersView) + '</textarea></div></section>'
    + '<section class="character-dossier-card"><div class="character-dossier-field"><span>Hamartia</span><small>Name the tragic flaw, blind spot, or weakness that drives later consequences.</small><textarea rows="5" data-character-dossier-field="hamartia" placeholder="This character is most vulnerable when...">' + escapeClientHtml(data.hamartia) + '</textarea></div></section>'
    + '<section class="character-dossier-card"><div class="character-dossier-field"><span>Foil dynamics</span><small>Which character sharpens this one by contrast, and what does that comparison reveal?</small><textarea rows="5" data-character-dossier-field="foil" placeholder="This character acts as a foil to... because...">' + escapeClientHtml(data.foil) + '</textarea></div></section>'
    + '</div>'
    + '<section class="character-dossier-focus"><div><h4>Thematic function</h4><p>What larger idea about jealousy, trust, power, gender, manipulation, innocence, or responsibility does this character carry in the tragedy?</p></div><label class="character-dossier-field"><span>Critical role in the play</span><textarea rows="5" data-character-dossier-field="role" placeholder="In the architecture of the tragedy, this character helps Shakespeare show that...">' + escapeClientHtml(data.role) + '</textarea></label></section>'
    + '<section class="character-dossier-card character-dossier-section"><div class="character-dossier-section-heading"><div><h4>Arc & evolution</h4><p>Track how this character changes from act to act.</p></div><button type="button" data-character-dossier-add="evolution">Add arc point</button></div><div class="character-dossier-timeline">' + evolutionHtml + '</div></section>'
    + '<section class="character-dossier-card character-dossier-section"><div class="character-dossier-section-heading"><div><h4>Quotation bank</h4><p>Collect lines you can reuse in act questions, responsibility work, and analytical writing.</p></div><button type="button" data-character-dossier-add="quote">Add quotation</button></div><div class="character-dossier-quote-list">' + quoteHtml + '</div></section>';
}
function syncCharacterDossierChrome(){
  const root = document.querySelector("[data-character-dossier-studio]");
  if (!root) return;
  const dossiers = readCharacterDossiers();
  const active = activeCharacterDossierName();
  const data = dossiers[active] || createCharacterDossierState(active);
  const activeColor = data.color || characterDossierDefaultColor(active);
  applyCharacterDossierTheme(root, activeColor);
  root.querySelectorAll("[data-character-dossier-target]").forEach(function(button){
    const name = button.getAttribute("data-character-dossier-target") || "";
    const dossier = dossiers[name] || createCharacterDossierState(name);
    const progress = characterDossierProgress(dossier);
    const activeButton = name === active;
    button.classList.toggle("active", activeButton);
    button.setAttribute("aria-pressed", String(activeButton));
    const label = button.querySelector("[data-character-dossier-progress-for]");
    if (label) label.textContent = progress + "% complete";
    const bar = button.querySelector("[data-character-dossier-progress-bar]");
    if (bar) bar.style.width = progress + "%";
  });
  const title = root.querySelector("[data-character-dossier-title]");
  if (title) title.textContent = active;
  const subtitle = root.querySelector("[data-character-dossier-subtitle]");
  if (subtitle) subtitle.textContent = "Track first impressions, public image, tragic flaw, thematic function, and textual evidence for " + active + ".";
  const colorInput = root.querySelector('[data-character-dossier-field="color"]');
  if (colorInput) colorInput.value = activeColor;
  const colorValue = root.querySelector("[data-character-dossier-color-value]");
  if (colorValue) colorValue.textContent = activeColor.toUpperCase();
  const progressValue = root.querySelector("[data-character-dossier-progress-value]");
  if (progressValue) progressValue.textContent = characterDossierProgress(data) + "%";
}
function renderCharacterDossierStudio(){
  const root = document.querySelector("[data-character-dossier-studio]");
  if (!root) return;
  const requested = root.getAttribute("data-active-character-dossier") || "";
  const active = characterDossierCharacters.includes(requested) ? requested : readActiveCharacterDossier();
  root.setAttribute("data-active-character-dossier", active);
  writeActiveCharacterDossier(active);
  const body = root.querySelector("[data-character-dossier-body]");
  if (body) body.innerHTML = renderCharacterDossierBody(active);
  syncCharacterDossierChrome();
}
function setActiveCharacterDossier(value){
  if (!characterDossierCharacters.includes(value)) return;
  const root = document.querySelector("[data-character-dossier-studio]");
  if (!root) return;
  root.setAttribute("data-active-character-dossier", value);
  writeActiveCharacterDossier(value);
  renderCharacterDossierStudio();
}
function updateCharacterDossierField(field, value){
  const active = activeCharacterDossierName();
  const dossiers = readCharacterDossiers();
  dossiers[active] = dossiers[active] || createCharacterDossierState(active);
  dossiers[active][field] = value;
  writeCharacterDossiers(dossiers);
  syncCharacterDossierChrome();
}
function updateCharacterDossierEntry(collection, entryId, field, value){
  const active = activeCharacterDossierName();
  const dossiers = readCharacterDossiers();
  const entries = Array.isArray(dossiers[active]?.[collection]) ? dossiers[active][collection] : [];
  dossiers[active][collection] = entries.map(function(entry){
    return entry.id === entryId ? { ...entry, [field]: value } : entry;
  });
  writeCharacterDossiers(dossiers);
  syncCharacterDossierChrome();
}
function addCharacterDossierEntry(collection){
  const active = activeCharacterDossierName();
  const dossiers = readCharacterDossiers();
  dossiers[active] = dossiers[active] || createCharacterDossierState(active);
  const entries = Array.isArray(dossiers[active][collection]) ? dossiers[active][collection].slice() : [];
  if (collection === "evolution") {
    entries.push({ id: characterDossierEntryId("evolution"), act: characterDossierActs[0], text: "" });
  } else if (collection === "quotes") {
    entries.push({ id: characterDossierEntryId("quote"), act: characterDossierActs[0], text: "", citation: "", meaning: "" });
  }
  dossiers[active][collection] = entries;
  writeCharacterDossiers(dossiers);
  renderCharacterDossierStudio();
}
function removeCharacterDossierEntry(collection, entryId){
  const active = activeCharacterDossierName();
  const dossiers = readCharacterDossiers();
  const entries = Array.isArray(dossiers[active]?.[collection]) ? dossiers[active][collection] : [];
  dossiers[active][collection] = entries.filter(function(entry){ return entry.id !== entryId; });
  writeCharacterDossiers(dossiers);
  renderCharacterDossierStudio();
}
function resetCharacterDossiers(){
  const confirmed = window.confirm("Clear all saved Othello character dossier notes for every character?");
  if (!confirmed) return;
  localStorage.removeItem(CHARACTER_DOSSIER_STORAGE_KEY);
  localStorage.removeItem(CHARACTER_DOSSIER_ACTIVE_KEY);
  const root = document.querySelector("[data-character-dossier-studio]");
  if (root) root.setAttribute("data-active-character-dossier", characterDossierCharacters[0]);
  renderCharacterDossierStudio();
}

const pageSections = Array.from(document.querySelectorAll(".course-page"));
const visibleLessonIds = pageSections
  .filter((section) => section.classList.contains("course-page") && section.id && !["overview", "lessons", "side-by-side", "story-bank", "story-questions", "character-notes", "writing", "film-room", "resources"].includes(section.id))
  .map((section) => section.id);

function setLessonsOpen(open) {
  if (!lessonsNav) return;
  lessonsNav.classList.toggle("is-open", Boolean(open));
  document.querySelectorAll("[data-lessons-toggle]").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function showPage(pageId, pushHash = true) {
  const fallbackId = document.getElementById("overview") ? "overview" : (pageSections[0]?.id || "");
  const targetId = document.getElementById(pageId) ? pageId : fallbackId;
  if (!targetId) return;
  pageSections.forEach((section) => {
    section.hidden = section.id !== targetId;
  });
  document.querySelectorAll("[data-page-target]").forEach((link) => {
    const isActive = link.getAttribute("data-page-target") === targetId;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  document.querySelectorAll(".sublesson-link").forEach((link) => {
    const hrefTarget = (link.getAttribute("href") || "").replace(/^#/, "");
    const isActive = hrefTarget === targetId || link.getAttribute("data-page-target") === targetId;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  if (targetId === "lessons" || visibleLessonIds.includes(targetId)) {
    setLessonsOpen(true);
  }
  if (pushHash && location.hash.replace(/^#/, "") !== targetId) {
    history.pushState(null, "", "#" + targetId);
  }
}

function route() {
  const requestedId = decodeURIComponent(location.hash.replace(/^#/, "")) || "overview";
  showPage(requestedId, false);
}

function updateComplete() {
  const completed = readComplete();
  const completedLessons = visibleLessonIds.filter((id) => completed.has(id));
  const total = visibleLessonIds.length || 1;
  const percent = Math.round((completedLessons.length / total) * 100);
  document.querySelectorAll(".top-progress-meta strong").forEach((node, index) => {
    node.textContent = index === 0 ? completedLessons.length + " / " + total + " LESSONS" : percent + "%";
  });
  document.querySelectorAll(".top-progress-fill").forEach((node) => {
    node.style.width = percent + "%";
  });
  document.querySelectorAll("[data-complete-id]").forEach((button) => {
    const lessonId = button.getAttribute("data-complete-id");
    const isDone = completed.has(lessonId);
    button.classList.toggle("is-complete", isDone);
    button.textContent = isDone ? "Complete" : "Mark Complete";
  });
}


const anticipationStatements = [
  { id: 1, text: "You should always be able to be brutally honest with a true friend." },
  { id: 2, text: "People are never really what we seem: we are all playing a part." },
  { id: 3, text: "Stereotypes can sometimes be helpful and positive." },
  { id: 4, text: "True love can overcome any obstacle." },
  { id: 5, text: "Deep friendship should come before a romantic relationship." },
  { id: 6, text: "Jealousy makes a person completely irrational." },
  { id: 7, text: "Ambition is a negative personality trait." }
];
const anticipationScale = ["Strongly Disagree", "Disagree", "Agree", "Strongly Agree"];
function anticipationScore(value){ return anticipationScale.indexOf(value) + 1; }

function updateAnticipationPreSubmitStatus(){
  const responses = readResponses();
  const submittedAt = responses["othello-anticipation-pre-submitted-at"] || "";
  const filled = anticipationStatements.filter((statement) => responses["othello-anticipation-" + statement.id + "-pre-rating"] && responses["othello-anticipation-" + statement.id + "-pre-reason"]).length;
  document.querySelectorAll("[data-anticipation-pre-status]").forEach((node) => {
    node.textContent = submittedAt
      ? "Submitted: " + filled + " of " + anticipationStatements.length + " statements ready for Phase 2."
      : filled + " of " + anticipationStatements.length + " statements complete. Submit before starting the play.";
  });
  document.querySelectorAll("[data-anticipation-submit-card]").forEach((node) => node.classList.toggle("is-submitted", Boolean(submittedAt)));
}
function submitAnticipationPre(){
  const responses = readResponses();
  responses["othello-anticipation-pre-submitted-at"] = new Date().toISOString();
  writeResponses(responses);
  
}
function anticipationPostReasonPlaceholder(preRating, postRating){
  const pre = anticipationScore(preRating);
  const post = anticipationScore(postRating);
  if (!pre || !post) return "Which specific character or event in the play changed your mind?";
  if (pre === post) return "Your opinion stayed the same. Which character or event in the play reinforced your original belief?";
  return "Your opinion shifted. Which specific character or event in the play changed your mind?";
}

function updateAnticipationGuide(){
  const responses = readResponses();
  let postFilled = 0;
  anticipationStatements.forEach((statement) => {
    const preRating = responses["othello-anticipation-" + statement.id + "-pre-rating"] || "";
    const postRating = responses["othello-anticipation-" + statement.id + "-post-rating"] || "";
    const preReason = responses["othello-anticipation-" + statement.id + "-pre-reason"] || "";
    const postReason = responses["othello-anticipation-" + statement.id + "-post-reason"] || "";
    if (postRating && postReason.trim()) postFilled += 1;
    document.querySelectorAll('[data-anticipation-pre-rating="' + statement.id + '"]').forEach((node) => node.textContent = preRating || "Not answered yet");
    document.querySelectorAll('[data-anticipation-pre-reason="' + statement.id + '"]').forEach((node) => node.textContent = preReason || "Complete Lesson 11 Phase 1 to compare this statement.");
    document.querySelectorAll('[data-anticipation-post-reason="' + statement.id + '"]').forEach((node) => {
      node.placeholder = anticipationPostReasonPlaceholder(preRating, postRating);
    });
    document.querySelectorAll('[data-anticipation-shift="' + statement.id + '"]').forEach((node) => {
      node.classList.remove("is-shift-up", "is-shift-down", "is-stable");
      const pre = anticipationScore(preRating);
      const post = anticipationScore(postRating);
      if(!pre || !post){ node.textContent = "No comparison yet"; return; }
      if(post > pre){ node.textContent = "Shifted to Agree"; node.classList.add("is-shift-up"); }
      else if(post < pre){ node.textContent = "Shifted to Disagree"; node.classList.add("is-shift-down"); }
      else { node.textContent = "No Change"; node.classList.add("is-stable"); }
    });
  });
  const synthesis = responses["othello-anticipation-final-synthesis"] || "";
  const readyToPrint = postFilled === anticipationStatements.length && synthesis.trim();
  const percent = Math.round((postFilled / anticipationStatements.length) * 100);
  document.querySelectorAll("[data-anticipation-post-progress-label]").forEach((node) => {
    node.textContent = postFilled + " of " + anticipationStatements.length + " answered";
  });
  document.querySelectorAll("[data-anticipation-post-progress-fill]").forEach((node) => {
    node.style.width = percent + "%";
  });
  document.querySelectorAll("[data-anticipation-post-status]").forEach((node) => {
    node.textContent = readyToPrint
      ? "All seven comparisons are complete. You can print the final comparison."
      : postFilled + " of " + anticipationStatements.length + " comparisons complete. Finish each statement and your synthesis to unlock print.";
  });
  document.querySelectorAll("[data-anticipation-print-ready]").forEach((node) => {
    node.hidden = !readyToPrint;
  });
  updateAnticipationPreSubmitStatus();
}
function updateActQuestionAddons(){
  // Act Questions uses direct render handlers for both regular worksheets
  // and the dedicated anticipation guide reflection panel.
}

function renderSceneCheckpoints() {
  const shell = document.querySelector("[data-scene-checkpoints]");
  const list = document.querySelector("[data-scene-checkpoint-list]");
  const count = document.querySelector("[data-scene-checkpoint-count]");
  const select = document.querySelector("[data-worksheet-select]");
  if (!shell || !list || !select) return;
  const activeAct = select.value;
  const activeWorksheet = writingWorksheets.find(function(worksheet) { return worksheet.id === activeAct; });
  const scenes = sceneCheckpoints.filter(function(scene) { return scene.actId === activeAct; });
  if (!scenes.length) {
    shell.hidden = true;
    list.innerHTML = "";
    return;
  }
  const previousSceneId = list.querySelector("[data-scene-checkpoint-select]")?.value || "";
  const selectedSceneId = scenes.some(function(scene) { return scene.id === previousSceneId; }) ? previousSceneId : scenes[0].id;
  const scene = scenes.find(function(item) { return item.id === selectedSceneId; }) || scenes[0];
  const moods = ["tense", "suspicious", "hopeful", "chaotic", "grieving", "ironic", "intimate", "violent", "reflective"];
  shell.hidden = false;
  const heading = shell.querySelector("[data-scene-checkpoint-title]");
  const subheading = shell.querySelector("[data-scene-checkpoint-summary]");
  if (heading) heading.textContent = '"' + (activeWorksheet ? activeWorksheet.title.replace(" Questions", " Scene Checkpoints") : "Othello Scene Checkpoints") + '"';
  if (subheading) subheading.textContent = "Choose one scene, then complete the same evidence routine before the reading questions.";
  if (count) count.textContent = scenes.length + " scene" + (scenes.length === 1 ? "" : "s");
  const sceneOptions = scenes.map(function(item) {
    return { value: item.id, label: item.title, selected: item.id === scene.id };
  });
  const base = "othello-scene-" + scene.id;
  const moodOptions = moods.map(function(mood) {
    return '<option value="' + mood + '">' + mood.charAt(0).toUpperCase() + mood.slice(1) + '</option>';
  }).join("");
  list.innerHTML = '<div class="scene-checkpoint-picker"><label for="scene-checkpoint-select-trigger">Choose a scene</label>' + renderOverlaySelectMarkup("scene-checkpoint-select", "data-scene-checkpoint-select", sceneOptions) + '</div>'
    + '<article class="scene-checkpoint-card">'
    + '<div class="worksheet-question"><div class="worksheet-question-prompt"><strong>1.</strong><span>Scene summary</span></div><label class="worksheet-answer-field"><textarea rows="4" data-response-id="' + base + '-summary" placeholder="' + escapeClientHtml(scene.summaryPrompt) + '"></textarea></label></div>'
    + '<div class="worksheet-question"><div class="worksheet-question-prompt"><strong>2.</strong><span>Key quote</span></div><div class="scene-key-quote"><blockquote>' + escapeClientHtml(scene.keyQuote) + '</blockquote></div></div>'
    + '<div class="scene-checkpoint-two-column">'
    + '<div class="worksheet-question"><div class="worksheet-question-prompt"><strong>3.</strong><span>Character question</span></div><label class="worksheet-answer-field"><textarea rows="4" data-response-id="' + base + '-character" placeholder="' + escapeClientHtml(scene.characterQuestion) + '"></textarea></label></div>'
    + '<div class="worksheet-question"><div class="worksheet-question-prompt"><strong>4.</strong><span>Theme/language question</span></div><label class="worksheet-answer-field"><textarea rows="4" data-response-id="' + base + '-theme" placeholder="' + escapeClientHtml(scene.themeQuestion) + '"></textarea></label></div>'
    + '</div>'
    + '<div class="worksheet-question"><div class="worksheet-question-prompt"><strong>5.</strong><span>Evidence-based short response</span></div><label class="worksheet-answer-field"><textarea rows="5" data-response-id="' + base + '-evidence" placeholder="' + escapeClientHtml(scene.evidencePrompt) + '"></textarea></label></div>'
    + '<div class="scene-checkpoint-two-column">'
    + '<div class="worksheet-question"><div class="worksheet-question-prompt"><strong>6.</strong><span>Mood/tone selector</span></div><label class="worksheet-answer-field"><select data-response-id="' + base + '-mood"><option value="">Choose the dominant mood or tone...</option>' + moodOptions + '</select></label></div>'
    + '<div class="worksheet-question"><div class="worksheet-question-prompt"><strong>7.</strong><span>Go deeper</span></div><label class="worksheet-answer-field"><textarea rows="4" data-response-id="' + base + '-deeper" placeholder="' + escapeClientHtml(scene.deeperQuestion) + '"></textarea></label></div>'
    + '</div>'
    + '</article>';
  const responses = readResponses();
  list.querySelectorAll("[data-response-id]").forEach(function(field) {
    const key = field.getAttribute("data-response-id");
    if (key && Object.prototype.hasOwnProperty.call(responses, key)) {
      setResponseFieldValue(field, responses[key]);
    }
  });
  syncOverlaySelectUI(list.querySelector("[data-scene-checkpoint-select]"));
}

function responseFieldValue(field){
  if (field.type === "checkbox") return field.checked;
  if (field.type === "radio") return field.checked ? field.value : "";
  return field.value;
}
function setResponseFieldValue(field, value){
  if (field.type === "checkbox") field.checked = value === true || value === "true";
  else if (field.type === "radio") field.checked = field.value === value;
  else if (value !== undefined) field.value = value;
}
function saveResponseField(field){
  if(!field) return;
  const id = field.getAttribute("data-response-id") || field.name;
  if(!id) return;
  const responses = readResponses();
  responses[id] = responseFieldValue(field);
  writeResponses(responses);
  
  updateAnticipationGuide();
  updateActQuestionAddons();
  updateResponsibilityTotal();
}

function setActiveOthelloAssignment(id){
  if(!id) return;
  document.querySelectorAll("[data-othello-assignment-panel]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-othello-assignment-panel") !== id;
  });
  if (id === "language-translator") renderOthelloLanguageTranslator();
  if (id === "annotation-lab") renderOthelloCloseReadingLab();
  if (id.startsWith("theme-builder")) renderOthelloThemeBuilder();
}
function getResponsibilityData(){
  const responses = readResponses();
  const sliders = Array.from(document.querySelectorAll("[data-responsibility-slider]"));
  return sliders.map(function(slider){
    const id = slider.getAttribute("data-response-id") || "";
    return {
      character: slider.getAttribute("data-responsibility-character") || id || "Character",
      value: Number(slider.value || 0),
      evidence: responses[id + "-evidence"] || "",
      reasoning: responses[id + "-reason"] || ""
    };
  });
}

function updateResponsibilityTotal(){
  const sliders = Array.from(document.querySelectorAll("[data-responsibility-slider]"));
  const total = sliders.reduce(function(sum, slider){ return sum + Number(slider.value || 0); }, 0);
  const exactTotal = total === 100;
  const ranking = sliders
    .map(function(slider){
      return {
        character: slider.getAttribute("data-responsibility-character") || "Character",
        value: Number(slider.value || 0)
      };
    })
    .sort(function(a, b){ return b.value - a.value; });

  document.querySelectorAll("[data-responsibility-total]").forEach(function(node){
    node.textContent = exactTotal
      ? "Total: 100% - ready for evidence"
      : "Total: " + total + "% - adjust to 100% before submitting";
    node.classList.toggle("is-on", exactTotal);
    node.classList.toggle("is-off", !exactTotal);
  });
  sliders.forEach(function(slider){
    const card = slider.closest(".othello-trial-card, .responsibility-row, .worksheet-question");
    const output = card ? card.querySelector("[data-responsibility-value]") : null;
    if(output) output.textContent = slider.value;
    const rangeLabel = document.querySelector('[data-range-label-for="' + slider.getAttribute("data-response-id") + '"]');
    if (rangeLabel) rangeLabel.textContent = slider.value + "%";
  });
  document.querySelectorAll("[data-responsibility-status]").forEach(function(node){
    if (exactTotal) {
      node.textContent = "Your blame ranking totals 100%. Use the evidence sections below to defend your top two choices.";
      return;
    }
    const difference = Math.abs(100 - total);
    node.textContent = total < 100
      ? "You have " + difference + "% left to allocate before your defense is complete."
      : "You are " + difference + "% over the required total. Reduce one or more characters until the ranking equals 100%.";
  });
  document.querySelectorAll("[data-responsibility-gated]").forEach(function(node){
    node.hidden = !exactTotal;
  });
  document.querySelectorAll("[data-responsibility-top-name]").forEach(function(node){
    node.textContent = ranking[0]?.value ? ranking[0].character : "Choose blame above";
  });
  document.querySelectorAll("[data-responsibility-top-value]").forEach(function(node){
    node.textContent = ranking[0]?.value ? ranking[0].value + "%" : "";
  });
  document.querySelectorAll("[data-responsibility-second-name]").forEach(function(node){
    node.textContent = ranking[1]?.value ? ranking[1].character : "Choose blame above";
  });
  document.querySelectorAll("[data-responsibility-second-value]").forEach(function(node){
    node.textContent = ranking[1]?.value ? ranking[1].value + "%" : "";
  });
  document.querySelectorAll("[data-responsibility-least-name]").forEach(function(node){
    node.textContent = ranking.length ? ranking[ranking.length - 1].character : "the least-blamed character";
  });
}

function exportResponsibilityTrial(){
  const output = document.querySelector("[data-responsibility-export-output]");
  if(!output) return;
  output.textContent = JSON.stringify(getResponsibilityData(), null, 2);
  output.hidden = false;
}

function exportOthelloWriting(){
  const activeAssignmentSelect = document.querySelector("[data-othello-assignment-select]");
  const payload = {
    course: "ELA 30-1 | Shakespeare: Othello",
    section: "Writing Studio",
    activeAssignment: activeAssignmentSelect ? {
      id: activeAssignmentSelect.value,
      label: activeAssignmentSelect.selectedOptions?.[0]?.textContent?.trim() || activeAssignmentSelect.value
    } : null,
    exportedAt: new Date().toISOString(),
    responses: readResponses()
  };

  document.querySelectorAll("[data-othello-export-output]").forEach(function(node){
    node.textContent = JSON.stringify(payload, null, 2);
    node.hidden = false;
  });
}

function setActiveLibraryDocument(id){
  if(!id) return;
  document.querySelectorAll("[data-library-doc-panel]").forEach(function(panel){
    panel.hidden = panel.getAttribute("data-library-doc-panel") !== id;
  });
  document.querySelectorAll("[data-library-doc-button]").forEach(function(button){
    const isActive = button.getAttribute("data-library-doc-button") === id;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
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
function setActiveParallelScene(id){
  if(!id) return;
  document.querySelectorAll("[data-parallel-panel]").forEach((panel) => panel.hidden = panel.getAttribute("data-parallel-panel") !== id);
  document.querySelectorAll("[data-parallel-target]").forEach((button) => {
    const active = button.getAttribute("data-parallel-target") === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-parallel-select]").forEach((select) => {
    if (select.value !== id) select.value = id;
    syncOverlaySelectUI(select);
  });
}
function setActiveResourcePanel(id){ if(!id) return; document.querySelectorAll("[data-resource-panel]").forEach((panel) => panel.hidden = panel.getAttribute("data-resource-panel") !== id); }
let activeWorksheetStoryId = "";
let activeWorksheetRoot = null;
let worksheetHintsVisible = false;
let worksheetSaveTimer = null;
function worksheetAnswerKey(storyId, questionId){ return storyId + "-" + questionId; }
function worksheetWordCount(value){ return String(value || "").trim().split(/\\s+/).filter(Boolean).length; }
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
function formatWorksheetQuestionPrompt(text){
  return String(text || "").replace(/^Question\\s+\\d+\\s*:\\s*/i, "").trim();
}
function getWorksheetRoot(source){
  const sourceRoot = source?.closest?.("[data-worksheet-studio]");
  if (sourceRoot && sourceRoot.querySelector("[data-worksheet-panel]")) return sourceRoot;
  if (activeWorksheetRoot && activeWorksheetRoot.isConnected) return activeWorksheetRoot;
  return document.querySelector(".story-questions-studio[data-worksheet-studio]") || document.querySelector("[data-worksheet-studio]");
}
function setWorksheetPickerOpen(open, source){
  const root = getWorksheetRoot(source);
  const shell = root?.querySelector("[data-worksheet-picker-shell]");
  const trigger = root?.querySelector("[data-worksheet-select-trigger]");
  const options = root?.querySelector("[data-worksheet-select-options]");
  if (!shell || !trigger || !options) return;
  shell.classList.toggle("is-open", open);
  trigger.setAttribute("aria-expanded", String(open));
  options.hidden = !open;
}
function closeWorksheetPickers(){
  document.querySelectorAll("[data-worksheet-picker-shell]").forEach((shell) => {
    shell.classList.remove("is-open");
    const trigger = shell.querySelector("[data-worksheet-select-trigger]");
    const options = shell.querySelector("[data-worksheet-select-options]");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (options) options.hidden = true;
  });
}
function getOverlaySelectShell(source){
  if (!source) return null;
  if (source.matches?.("[data-overlay-select-shell]")) return source;
  return source.closest?.("[data-overlay-select-shell]") || null;
}
function setOverlaySelectOpen(source, open){
  const shell = getOverlaySelectShell(source);
  const trigger = shell?.querySelector("[data-overlay-select-trigger]");
  const options = shell?.querySelector("[data-overlay-select-options]");
  if (!shell || !trigger || !options) return;
  shell.classList.toggle("is-open", open);
  trigger.setAttribute("aria-expanded", String(open));
  options.hidden = !open;
}
function closeOverlaySelectMenus(){
  document.querySelectorAll("[data-overlay-select-shell]").forEach(function(shell){
    shell.classList.remove("is-open");
    const trigger = shell.querySelector("[data-overlay-select-trigger]");
    const options = shell.querySelector("[data-overlay-select-options]");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (options) options.hidden = true;
  });
}
function syncOverlaySelectUI(source){
  const shell = getOverlaySelectShell(source);
  const select = shell?.querySelector("[data-overlay-select-native]");
  const label = shell?.querySelector("[data-overlay-select-label]");
  if (!shell || !select || !label) return;
  const selectedOption = select.options[select.selectedIndex];
  label.textContent = selectedOption?.textContent || "";
  shell.querySelectorAll("[data-overlay-select-option]").forEach(function(node){
    const active = node.getAttribute("data-overlay-select-option") === select.value;
    node.classList.toggle("is-active", active);
    node.setAttribute("aria-selected", String(active));
  });
}
function toggleOverlaySelect(source){
  const shell = getOverlaySelectShell(source);
  if (!shell) return;
  const nextOpen = !shell.classList.contains("is-open");
  closeOverlaySelectMenus();
  setOverlaySelectOpen(shell, nextOpen);
}
function selectOverlaySelectOption(source){
  const option = source?.closest?.("[data-overlay-select-option]");
  const shell = getOverlaySelectShell(source);
  const select = shell?.querySelector("[data-overlay-select-native]");
  if (!option || !select) return;
  const value = option.getAttribute("data-overlay-select-option") || "";
  const isOthelloLanguagePageSelect = select.matches?.("[data-othello-language-page-select]");
  if (select.value !== value) {
    select.value = value;
    if (isOthelloLanguagePageSelect) {
      setActiveOthelloLanguagePage(value);
      syncOverlaySelectUI(shell);
    }
    select.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    if (isOthelloLanguagePageSelect) {
      setActiveOthelloLanguagePage(value);
    }
    syncOverlaySelectUI(shell);
  }
  setOverlaySelectOpen(shell, false);
}
function renderOverlaySelectMarkup(id, nativeDataAttr, options){
  const defaultOption = options.find(function(option){ return option.selected; }) || options[0];
  return '<div class="overlay-select-shell" data-overlay-select-shell>'
    + '<button id="' + escapeClientHtml(id) + '-trigger" class="overlay-select-trigger" type="button" data-overlay-select-trigger aria-haspopup="listbox" aria-expanded="false" aria-controls="' + escapeClientHtml(id) + '-options">'
    + '<span data-overlay-select-label>' + escapeClientHtml(defaultOption?.label || "Choose...") + '</span>'
    + '<span class="material-symbols-outlined" aria-hidden="true">expand_more</span>'
    + '</button>'
    + '<div id="' + escapeClientHtml(id) + '-options" class="overlay-select-options" data-overlay-select-options role="listbox" hidden>'
    + options.map(function(option){
      return '<button type="button" class="overlay-select-option' + (option.selected ? ' is-active' : '') + '" data-overlay-select-option="' + escapeClientHtml(option.value) + '" role="option" aria-selected="' + (option.selected ? 'true' : 'false') + '">' + escapeClientHtml(option.label) + '</button>';
    }).join("")
    + '</div>'
    + '<select id="' + escapeClientHtml(id) + '" class="overlay-select-native" data-overlay-select-native ' + nativeDataAttr + ' aria-hidden="true" tabindex="-1">'
    + options.map(function(option){
      return '<option value="' + escapeClientHtml(option.value) + '"' + (option.selected ? ' selected' : '') + '>' + escapeClientHtml(option.label) + '</option>';
    }).join("")
    + '</select>'
    + '</div>';
}
function syncWorksheetPickerUI(source){
  const root = getWorksheetRoot(source);
  const select = root?.querySelector("[data-worksheet-select]");
  const label = root?.querySelector("[data-worksheet-select-label]");
  if (!root || !select || !label) return;
  const selectedOption = select.options[select.selectedIndex];
  label.textContent = selectedOption?.textContent || "";
  root.querySelectorAll("[data-worksheet-option]").forEach((node) => {
    const active = node.getAttribute("data-worksheet-option") === select.value;
    node.classList.toggle("is-active", active);
    node.setAttribute("aria-selected", String(active));
  });
}
function toggleWorksheetPicker(source){
  const root = getWorksheetRoot(source);
  const shell = root?.querySelector("[data-worksheet-picker-shell]");
  if (!shell) return;
  const nextOpen = !shell.classList.contains("is-open");
  closeWorksheetPickers();
  setWorksheetPickerOpen(nextOpen, root);
}
function selectWorksheetPickerOption(source){
  const option = source?.closest?.("[data-worksheet-option]");
  const root = getWorksheetRoot(source);
  const select = root?.querySelector("[data-worksheet-select]");
  if (!option || !select) return;
  const value = option.getAttribute("data-worksheet-option") || "";
  if (select.value !== value) {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    syncWorksheetPickerUI(root);
  }
  setWorksheetPickerOpen(false, root);
}
function renderWorksheetStory(storyId, source){
  const root = getWorksheetRoot(source);
  if(!root) return;
  const anticipationPanel = root.querySelector("[data-anticipation-phase-two-panel]");
  const worksheetPanel = root.querySelector("[data-worksheet-panel]");
  const sceneCheckpointShell = root.querySelector("[data-scene-checkpoints]");
  root.querySelector("[data-anticipation-phase-two-panel]")?.setAttribute("hidden", "");
  root.querySelectorAll("[data-anticipation-phase-two]").forEach((node) => { node.hidden = true; node.setAttribute("hidden", ""); });
  if (storyId === PHASE_TWO_ANTICIPATION_ID) {
    activeWorksheetRoot = root;
    activeWorksheetStoryId = storyId;
    root.querySelector("[data-worksheet-picker]")?.setAttribute("hidden", "");
    sceneCheckpointShell?.setAttribute("hidden", "");
    sceneCheckpointShell && (sceneCheckpointShell.hidden = true);
    worksheetPanel?.setAttribute("hidden", "");
    anticipationPanel?.removeAttribute("hidden");
    anticipationPanel && (anticipationPanel.hidden = false);
    root.querySelectorAll("[data-anticipation-phase-two]").forEach((node) => { node.hidden = false; node.removeAttribute("hidden"); });
    const worksheetSelect = root.querySelector("[data-worksheet-select]");
    if (worksheetSelect) worksheetSelect.value = PHASE_TWO_ANTICIPATION_ID;
    syncWorksheetPickerUI(root);
    updateAnticipationGuide();
    updateActQuestionAddons();
    renderSceneCheckpoints();
    return;
  }
  const story = writingWorksheets.find((item) => item.id === storyId);
  if(!story) return;
  activeWorksheetRoot = root;
  activeWorksheetStoryId = story.id;
  const answers = readWorksheetAnswers();
  root.querySelector("[data-worksheet-picker]")?.setAttribute("hidden", "");
  worksheetPanel?.removeAttribute("hidden");
  worksheetPanel && (worksheetPanel.hidden = false);
  const worksheetSelect = root.querySelector("[data-worksheet-select]");
  if (worksheetSelect) worksheetSelect.value = story.id;
  syncWorksheetPickerUI(root);
  root.querySelector("[data-worksheet-title]").textContent = '"' + story.title + '"';
  root.querySelector("[data-worksheet-author]").textContent = "by " + story.author;
  root.querySelector("[data-worksheet-theme-prompt]").textContent = "Write a 1-2 sentence thesis about " + story.diplomaTheme + ".";
  root.querySelector("[data-worksheet-prt-prompt]").textContent = "What does this text suggest to you about " + story.diplomaTheme + "?";
  const questionsNode = root.querySelector("[data-worksheet-questions]");
  questionsNode.innerHTML = story.sections.map((section) => '<section class="worksheet-section"><h4>' + escapeClientHtml(section.title) + '</h4>' + section.questions.map((question, index) => {
    const key = worksheetAnswerKey(story.id, question.id);
    const value = answers[key] || "";
    return '<div class="worksheet-question"><div class="worksheet-question-prompt"><strong>' + (index + 1) + '.</strong><span>' + escapeClientHtml(formatWorksheetQuestionPrompt(question.text)) + '</span></div>' + (worksheetHintsVisible && question.hint ? '<div class="worksheet-hint"><strong>Teacher Hint:</strong> ' + escapeClientHtml(question.hint) + '</div>' : '') + '<label class="worksheet-answer-field"><textarea rows="5" data-worksheet-answer="' + escapeClientHtml(question.id) + '" placeholder="Type your analytical response here...">' + escapeClientHtml(value) + '</textarea><span class="worksheet-word-count">' + worksheetWordCount(value) + ' words</span></label></div>';
  }).join("") + '</section>').join("");
  root.querySelectorAll("[data-worksheet-answer='thesis']").forEach((field) => field.value = answers[worksheetAnswerKey(story.id, "thesis")] || "");
  root.querySelectorAll("[data-worksheet-answer='prt']").forEach((field) => field.value = answers[worksheetAnswerKey(story.id, "prt")] || "");
  updateWorksheetProgress();
  updateActQuestionAddons();
  renderSceneCheckpoints();
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
  frame.src = src || "";
  if(titleNode) titleNode.textContent = title || "Story reader";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeStoryReader(){
  const overlay = document.querySelector("[data-story-reader-overlay]");
  const frame = document.querySelector("[data-story-reader-frame]");
  if(!overlay) return;
  overlay.hidden = true;
  if(frame) frame.src = "";
  document.body.style.overflow = "";
}
function openStorySource(src){
  if(!src) return;
  window.open(src, "_blank", "noopener,noreferrer");
}
function downloadStorySource(src){
  if(!src) return;
  const link = document.createElement("a");
  link.href = src;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  link.remove();
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
  const worksheetPickerOption = event.target.closest("[data-worksheet-option]");
  if (worksheetPickerOption) { event.preventDefault(); selectWorksheetPickerOption(worksheetPickerOption); return; }
  const worksheetPickerTrigger = event.target.closest("[data-worksheet-select-trigger]");
  if (worksheetPickerTrigger) { event.preventDefault(); toggleWorksheetPicker(worksheetPickerTrigger); return; }
  if (!event.target.closest("[data-worksheet-picker-shell]")) closeWorksheetPickers();
  const overlaySelectOption = event.target.closest("[data-overlay-select-option]");
  if (overlaySelectOption) { event.preventDefault(); selectOverlaySelectOption(overlaySelectOption); return; }
  const overlaySelectTrigger = event.target.closest("[data-overlay-select-trigger]");
  if (overlaySelectTrigger) { event.preventDefault(); toggleOverlaySelect(overlaySelectTrigger); return; }
  if (!event.target.closest("[data-overlay-select-shell]")) closeOverlaySelectMenus();
  const characterTarget = event.target.closest("[data-character-dossier-target]");
  if (characterTarget) { event.preventDefault(); setActiveCharacterDossier(characterTarget.getAttribute("data-character-dossier-target") || ""); return; }
  const characterPrint = event.target.closest("[data-character-dossier-print]");
  if (characterPrint) { event.preventDefault(); window.print(); return; }
  const characterReset = event.target.closest("[data-character-dossier-reset]");
  if (characterReset) { event.preventDefault(); resetCharacterDossiers(); return; }
  const characterAdd = event.target.closest("[data-character-dossier-add]");
  if (characterAdd) { event.preventDefault(); addCharacterDossierEntry((characterAdd.getAttribute("data-character-dossier-add") || "") === "evolution" ? "evolution" : "quotes"); return; }
  const characterRemove = event.target.closest("[data-character-dossier-remove]");
  if (characterRemove) {
    event.preventDefault();
    removeCharacterDossierEntry((characterRemove.getAttribute("data-character-dossier-remove") || "") === "evolution" ? "evolution" : "quotes", characterRemove.getAttribute("data-character-dossier-entry-id") || "");
    return;
  }
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
  const parallelTarget = event.target.closest("[data-parallel-target]");
  if (parallelTarget) setActiveParallelScene(parallelTarget.getAttribute("data-parallel-target"));
  const worksheetOpen = event.target.closest("[data-worksheet-open]");
  if (worksheetOpen) renderWorksheetStory(worksheetOpen.getAttribute("data-worksheet-open"), worksheetOpen);
  const worksheetBack = event.target.closest("[data-worksheet-back]");
  if (worksheetBack) showWorksheetPicker(worksheetBack);
  const worksheetHints = event.target.closest("[data-worksheet-toggle-hints]");
  if (worksheetHints && activeWorksheetStoryId) { worksheetHintsVisible = !worksheetHintsVisible; worksheetHints.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ' + (worksheetHintsVisible ? "Hide Hints" : "Show Hints"); renderWorksheetStory(activeWorksheetStoryId, worksheetHints); }
  const worksheetPrint = event.target.closest("[data-worksheet-print]");
  if (worksheetPrint) window.print();
  const anticipationPrint = event.target.closest("[data-anticipation-print]");
  if (anticipationPrint) { event.preventDefault(); window.print(); }
  const writingExport = event.target.closest("[data-othello-export-writing]");
  if (writingExport) { event.preventDefault(); exportOthelloWriting(); }
  const writingPrint = event.target.closest("[data-othello-print-writing]");
  if (writingPrint) { event.preventDefault(); window.print(); }
  const storyOpen = event.target.closest("[data-story-open-src]");
  if (storyOpen) { event.preventDefault(); openStorySource(storyOpen.getAttribute("data-story-open-src")); }
  const parallelOpen = event.target.closest("[data-parallel-open-src]");
  if (parallelOpen) { event.preventDefault(); openStorySource(parallelOpen.getAttribute("data-parallel-open-src")); }
  const storyFullscreen = event.target.closest("[data-story-fullscreen-src]");
  if (storyFullscreen) { event.preventDefault(); openStoryReader(storyFullscreen.getAttribute("data-story-fullscreen-src"), storyFullscreen.getAttribute("data-story-fullscreen-title")); }
  const storyDownload = event.target.closest("[data-story-download-src]");
  if (storyDownload) { event.preventDefault(); downloadStorySource(storyDownload.getAttribute("data-story-download-src")); }
  const storyReaderClose = event.target.closest("[data-story-reader-close]");
  if (storyReaderClose) { event.preventDefault(); closeStoryReader(); }
  const othelloLanguagePageTrigger = event.target.closest("[data-othello-language-page-trigger]");
  if (othelloLanguagePageTrigger) {
    event.preventDefault();
    setActiveOthelloLanguagePage(othelloLanguagePageTrigger.getAttribute("data-othello-language-page-trigger") || "");
    return;
  }
  const othelloLanguageEliz = event.target.closest("[data-othello-language-eliz]");
  if (othelloLanguageEliz) {
    event.preventDefault();
    handleOthelloLanguageMatchSelection("eliz", othelloLanguageEliz.getAttribute("data-othello-language-eliz") || "");
    return;
  }
  const othelloLanguageMod = event.target.closest("[data-othello-language-mod]");
  if (othelloLanguageMod) {
    event.preventDefault();
    handleOthelloLanguageMatchSelection("mod", othelloLanguageMod.getAttribute("data-othello-language-mod") || "");
    return;
  }
  const othelloLanguageBuiltWord = event.target.closest("[data-othello-language-built-word]");
  if (othelloLanguageBuiltWord) {
    event.preventDefault();
    moveOthelloLanguageWordToBank(
      Number.parseInt(othelloLanguageBuiltWord.getAttribute("data-othello-language-sentence-index") || "-1", 10),
      Number.parseInt(othelloLanguageBuiltWord.getAttribute("data-othello-language-built-word") || "-1", 10)
    );
    return;
  }
  const othelloLanguageBankWord = event.target.closest("[data-othello-language-bank-word]");
  if (othelloLanguageBankWord) {
    event.preventDefault();
    moveOthelloLanguageWordToBuilt(
      Number.parseInt(othelloLanguageBankWord.getAttribute("data-othello-language-sentence-index") || "-1", 10),
      Number.parseInt(othelloLanguageBankWord.getAttribute("data-othello-language-bank-word") || "-1", 10)
    );
    return;
  }
  const othelloLanguageCheck = event.target.closest("[data-othello-language-check]");
  if (othelloLanguageCheck) {
    event.preventDefault();
    checkOthelloLanguageSentence(Number.parseInt(othelloLanguageCheck.getAttribute("data-othello-language-check") || "-1", 10));
    return;
  }
  const closeReadingFont = event.target.closest("[data-close-reading-font]");
  if (closeReadingFont) {
    event.preventDefault();
    if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
    const direction = closeReadingFont.getAttribute("data-close-reading-font");
    othelloCloseReadingState.fontSize = Math.max(12, Math.min(24, othelloCloseReadingState.fontSize + (direction === "increase" ? 1 : -1)));
    writeOthelloCloseReadingState();
    renderOthelloCloseReadingPassageText();
    return;
  }
  const closeReadingToggleFallback = event.target.closest("[data-close-reading-toggle-fallback]");
  if (closeReadingToggleFallback) {
    event.preventDefault();
    othelloCloseReadingUi.fallbackMode = !othelloCloseReadingUi.fallbackMode;
    if (!othelloCloseReadingUi.fallbackMode) {
      othelloCloseReadingUi.fallbackStart = "";
      othelloCloseReadingUi.fallbackEnd = "";
    }
    renderOthelloCloseReadingPassageControls();
    return;
  }
  const closeReadingCreateFallback = event.target.closest("[data-close-reading-create-fallback]");
  if (closeReadingCreateFallback) {
    event.preventDefault();
    const passage = getActiveOthelloCloseReadingPassage();
    const fallbackStartField = document.querySelector("[data-close-reading-fallback-start]");
    const fallbackEndField = document.querySelector("[data-close-reading-fallback-end]");
    const fallbackStartValue = othelloCloseReadingUi.fallbackStart || fallbackStartField?.value || "";
    const fallbackEndValue = othelloCloseReadingUi.fallbackEnd || fallbackEndField?.value || fallbackStartValue;
    othelloCloseReadingUi.fallbackStart = fallbackStartValue;
    othelloCloseReadingUi.fallbackEnd = fallbackEndValue;
    const selectedText = buildOthelloCloseReadingRangeText(passage, fallbackStartValue, fallbackEndValue);
    if (!selectedText) {
      window.alert("Choose a start line and end line before creating an annotation.");
      return;
    }
    openOthelloCloseReadingSelectionDraftFromRange(fallbackStartValue, fallbackEndValue, selectedText);
    return;
  }
  const closeReadingEdit = event.target.closest("[data-close-reading-edit]");
  if (closeReadingEdit) {
    event.preventDefault();
    if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
    const annotation = othelloCloseReadingState.annotations.find((item) => item.id === (closeReadingEdit.getAttribute("data-close-reading-edit") || ""));
    if (annotation) openOthelloCloseReadingDraft(annotation, annotation.id);
    return;
  }
  const closeReadingDelete = event.target.closest("[data-close-reading-delete]");
  if (closeReadingDelete) {
    event.preventDefault();
    if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
    const annotationId = closeReadingDelete.getAttribute("data-close-reading-delete") || "";
    if (annotationId && window.confirm("Delete this annotation from your evidence library?")) {
      removeOthelloCloseReadingAnnotation(annotationId);
    }
    return;
  }
  const closeReadingNote = event.target.closest("[data-close-reading-note]");
  if (closeReadingNote && !event.target.closest("[data-close-reading-edit], [data-close-reading-delete]")) {
    event.preventDefault();
    if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
    othelloCloseReadingState.selectedAnalysisAnnotationId = closeReadingNote.getAttribute("data-close-reading-note") || "";
    writeOthelloCloseReadingState();
    renderOthelloCloseReadingAnnotationList();
    renderOthelloCloseReadingAnalysis();
    return;
  }
  const closeReadingModalClose = event.target.closest("[data-close-reading-modal-close]");
  if (closeReadingModalClose) {
    event.preventDefault();
    closeOthelloCloseReadingDraft();
    return;
  }
  const closeReadingModalSave = event.target.closest("[data-close-reading-modal-save]");
  if (closeReadingModalSave) {
    event.preventDefault();
    saveOthelloCloseReadingAnnotation();
    return;
  }
  const themeSort = event.target.closest("[data-theme-sort]");
  if (themeSort) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    othelloThemeState.sortingAssignments[themeSort.getAttribute("data-theme-sort") || ""] = themeSort.getAttribute("data-theme-sort-value") || "unassigned";
    writeOthelloThemeBuilderState();
    renderOthelloThemeBuilderProgress();
    renderOthelloThemeSortBoard();
    return;
  }
  const themeStage = event.target.closest("[data-theme-stage]");
  if (themeStage) {
    event.preventDefault();
    othelloThemeUi.activeStage = themeStage.getAttribute("data-theme-stage") || "sort";
    syncOthelloThemePathway();
    return;
  }
  const themeDiagnostic = event.target.closest("[data-theme-diagnostic]");
  if (themeDiagnostic) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    const index = Number.parseInt(themeDiagnostic.getAttribute("data-theme-diagnostic") || "-1", 10);
    if (index >= 0) {
      othelloThemeState.diagnosticSelections[index] = themeDiagnostic.getAttribute("data-theme-diagnostic-value") || "";
      writeOthelloThemeBuilderState();
      renderOthelloThemeBuilderProgress();
      renderOthelloThemeDiagnosticBoard();
    }
    return;
  }
  const themeTopic = event.target.closest("[data-theme-topic]");
  if (themeTopic) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    othelloThemeState.selectedTopic = themeTopic.getAttribute("data-theme-topic") || "";
    othelloThemeUi.evidenceOpen = false;
    othelloThemeUi.editingEvidenceId = "";
    othelloThemeUi.evidenceDraft = null;
    writeOthelloThemeBuilderState();
    renderOthelloThemeBuilder();
    return;
  }
  const themeAddEvidence = event.target.closest("[data-theme-add-evidence]");
  if (themeAddEvidence) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    openOthelloThemeEvidenceDraft("");
    return;
  }
  const themeCancelEvidence = event.target.closest("[data-theme-cancel-evidence]");
  if (themeCancelEvidence) {
    event.preventDefault();
    closeOthelloThemeEvidenceDraft();
    return;
  }
  const themeSaveEvidence = event.target.closest("[data-theme-save-evidence]");
  if (themeSaveEvidence) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    saveOthelloThemeEvidenceDraft();
    return;
  }
  const themeEditEvidence = event.target.closest("[data-theme-edit-evidence]");
  if (themeEditEvidence) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    openOthelloThemeEvidenceDraft(themeEditEvidence.getAttribute("data-theme-edit-evidence") || "");
    return;
  }
  const themeDeleteEvidence = event.target.closest("[data-theme-delete-evidence]");
  if (themeDeleteEvidence) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    const evidenceId = themeDeleteEvidence.getAttribute("data-theme-delete-evidence") || "";
    if (evidenceId && window.confirm("Delete this evidence entry?")) {
      othelloThemeState.evidenceItems = othelloThemeState.evidenceItems.filter((item) => item.id !== evidenceId);
      othelloThemeState.patterns = othelloThemeState.patterns.map((pattern) => ({ ...pattern, evidenceIds: pattern.evidenceIds.filter((id) => id !== evidenceId) }));
      writeOthelloThemeBuilderState();
      renderOthelloThemeBuilder();
    }
    return;
  }
  const themeAddPattern = event.target.closest("[data-theme-add-pattern]");
  if (themeAddPattern) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    othelloThemeState.patterns.push({ id: "theme-pattern-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7), name: "", evidenceIds: [], connection: "", changes: "" });
    writeOthelloThemeBuilderState();
    renderOthelloThemeBuilder();
    return;
  }
  const themeDeletePattern = event.target.closest("[data-theme-delete-pattern]");
  if (themeDeletePattern) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    othelloThemeState.patterns = othelloThemeState.patterns.filter((pattern) => pattern.id !== (themeDeletePattern.getAttribute("data-theme-delete-pattern") || ""));
    writeOthelloThemeBuilderState();
    renderOthelloThemeBuilder();
    return;
  }
  const themePatternToggle = event.target.closest("[data-theme-pattern-toggle]");
  if (themePatternToggle) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    const patternId = themePatternToggle.getAttribute("data-theme-pattern-toggle") || "";
    const evidenceId = themePatternToggle.getAttribute("data-theme-pattern-evidence") || "";
    othelloThemeState.patterns = othelloThemeState.patterns.map((pattern) => pattern.id === patternId ? { ...pattern, evidenceIds: pattern.evidenceIds.includes(evidenceId) ? pattern.evidenceIds.filter((id) => id !== evidenceId) : pattern.evidenceIds.concat(evidenceId) } : pattern);
    writeOthelloThemeBuilderState();
    renderOthelloThemePatternBoard();
    renderOthelloThemeBuilderProgress();
    return;
  }
  const themeCommitFinal = event.target.closest("[data-theme-commit-final]");
  if (themeCommitFinal) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    commitOthelloThemeFinal();
    return;
  }
  const themeAssembleResponse = event.target.closest("[data-theme-assemble-response]");
  if (themeAssembleResponse) {
    event.preventDefault();
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    assembleOthelloThemeResponse();
    return;
  }
});
document.addEventListener("keydown", (event) => {
  if(event.key === "Escape") {
    closeWorksheetPickers();
    closeOverlaySelectMenus();
    closeStoryReader();
    closeOthelloCloseReadingDraft();
  }
});
document.addEventListener("change", (event) => {
  const characterColor = event.target.closest('input[data-character-dossier-field="color"]');
  if (characterColor) {
    updateCharacterDossierField("color", characterColor.value);
    return;
  }

  const characterField = event.target.closest("select[data-character-dossier-field]");
  if (characterField) {
    updateCharacterDossierField(characterField.getAttribute("data-character-dossier-field") || "", characterField.value);
    return;
  }

  const characterEvolutionField = event.target.closest("select[data-character-dossier-evolution-field]");
  if (characterEvolutionField) {
    updateCharacterDossierEntry("evolution", characterEvolutionField.getAttribute("data-character-dossier-entry-id") || "", characterEvolutionField.getAttribute("data-character-dossier-evolution-field") || "", characterEvolutionField.value);
    renderCharacterDossierStudio();
    return;
  }

  const characterQuoteField = event.target.closest("select[data-character-dossier-quote-field]");
  if (characterQuoteField) {
    updateCharacterDossierEntry("quotes", characterQuoteField.getAttribute("data-character-dossier-entry-id") || "", characterQuoteField.getAttribute("data-character-dossier-quote-field") || "", characterQuoteField.value);
    renderCharacterDossierStudio();
    return;
  }

  const analysisTermSelect = event.target.closest("[data-analysis-term-select]");
  if (analysisTermSelect) {
    activeAnalysisTermId = analysisTermSelect.value;
    renderAnalysisExplorer();
    return;
  }

  const analysisStorySelect = event.target.closest("[data-analysis-story-select]");
  if (analysisStorySelect) {
    renderAnalysisExplorer();
    return;
  }

  const resourceSelect = event.target.closest("[data-resource-select]");
  if (resourceSelect) {
    setActiveResourcePanel(resourceSelect.value);
    syncOverlaySelectUI(resourceSelect);
    return;
  }

  const filmSelect = event.target.closest("[data-film-select]");
  if (filmSelect) {
    setActiveFilm(filmSelect.value);
    syncOverlaySelectUI(filmSelect);
    return;
  }

  const worksheetSelect = event.target.closest("[data-worksheet-select]");
  if (worksheetSelect) {
    renderWorksheetStory(worksheetSelect.value, worksheetSelect);
    return;
  }

  const sceneCheckpointSelect = event.target.closest("[data-scene-checkpoint-select]");
  if (sceneCheckpointSelect) {
    renderSceneCheckpoints();
    return;
  }

  const othelloAssignmentSelect = event.target.closest("[data-othello-assignment-select]");
  if (othelloAssignmentSelect) {
    setActiveOthelloAssignment(othelloAssignmentSelect.value);
    syncOverlaySelectUI(othelloAssignmentSelect);
    return;
  }

  const othelloLanguagePageSelect = event.target.closest("[data-othello-language-page-select]");
  if (othelloLanguagePageSelect) {
    setActiveOthelloLanguagePage(othelloLanguagePageSelect.value);
    syncOverlaySelectUI(othelloLanguagePageSelect);
    return;
  }

  const themeStageSelect = event.target.closest("[data-theme-stage-select]");
  if (themeStageSelect) {
    othelloThemeUi.activeStage = themeStageSelect.value || "sort";
    syncOthelloThemePathway();
    return;
  }

  const parallelSceneSelect = event.target.closest("[data-parallel-select]");
  if (parallelSceneSelect) {
    setActiveParallelScene(parallelSceneSelect.value);
    syncOverlaySelectUI(parallelSceneSelect);
    return;
  }

  const closeReadingPassageSelect = event.target.closest("[data-close-reading-passage-select]");
  if (closeReadingPassageSelect) {
    if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
    othelloCloseReadingState.activePassageId = closeReadingPassageSelect.value;
    othelloCloseReadingUi.fallbackStart = "";
    othelloCloseReadingUi.fallbackEnd = "";
    writeOthelloCloseReadingState();
    renderOthelloCloseReadingLab();
    return;
  }

  const closeReadingFilter = event.target.closest("[data-close-reading-filter]");
  if (closeReadingFilter) {
    if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
    othelloCloseReadingState.activeFilter = closeReadingFilter.value || "All";
    writeOthelloCloseReadingState();
    renderOthelloCloseReadingAnnotationList();
    return;
  }

  const closeReadingAnalysisSelect = event.target.closest("[data-close-reading-analysis-select]");
  if (closeReadingAnalysisSelect) {
    if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
    othelloCloseReadingState.selectedAnalysisAnnotationId = closeReadingAnalysisSelect.value || "";
    writeOthelloCloseReadingState();
    renderOthelloCloseReadingAnnotationList();
    renderOthelloCloseReadingAnalysis();
    renderOthelloCloseReadingProgress();
    return;
  }

  const closeReadingToggleLines = event.target.closest("[data-close-reading-toggle-lines]");
  if (closeReadingToggleLines) {
    if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
    othelloCloseReadingState.showLines = closeReadingToggleLines.checked;
    writeOthelloCloseReadingState();
    renderOthelloCloseReadingPassageText();
    return;
  }

  const closeReadingFallbackStart = event.target.closest("[data-close-reading-fallback-start]");
  if (closeReadingFallbackStart) {
    othelloCloseReadingUi.fallbackStart = closeReadingFallbackStart.value || "";
    if (!othelloCloseReadingUi.fallbackEnd) othelloCloseReadingUi.fallbackEnd = othelloCloseReadingUi.fallbackStart;
    renderOthelloCloseReadingPassageControls();
    return;
  }

  const closeReadingFallbackEnd = event.target.closest("[data-close-reading-fallback-end]");
  if (closeReadingFallbackEnd) {
    othelloCloseReadingUi.fallbackEnd = closeReadingFallbackEnd.value || "";
    renderOthelloCloseReadingPassageControls();
    return;
  }

  const closeReadingDraftSelect = event.target.closest("select[data-close-reading-draft-field]");
  if (closeReadingDraftSelect) {
    updateOthelloCloseReadingDraftField(closeReadingDraftSelect.getAttribute("data-close-reading-draft-field") || "", closeReadingDraftSelect.value);
    return;
  }

  const closeReadingDraftCheckbox = event.target.closest('input[type="checkbox"][data-close-reading-draft-field]');
  if (closeReadingDraftCheckbox) {
    updateOthelloCloseReadingDraftField(closeReadingDraftCheckbox.getAttribute("data-close-reading-draft-field") || "", closeReadingDraftCheckbox.checked);
    return;
  }

  const closeReadingTaskSelect = event.target.closest("select[data-close-reading-task-field]");
  if (closeReadingTaskSelect) {
    updateOthelloCloseReadingTaskField(closeReadingTaskSelect.getAttribute("data-close-reading-task-field") || "", closeReadingTaskSelect.value);
    return;
  }
  const themeEvidenceSelect = event.target.closest("select[data-theme-evidence-field]");
  if (themeEvidenceSelect) {
    if (!othelloThemeUi.evidenceDraft) othelloThemeUi.evidenceDraft = createOthelloThemeEvidenceDraft(othelloThemeState?.selectedTopic || othelloThemeTopics[0]);
    othelloThemeUi.evidenceDraft[themeEvidenceSelect.getAttribute("data-theme-evidence-field") || ""] = themeEvidenceSelect.value;
    renderOthelloThemeEvidenceBoard();
    return;
  }

  const responseSelect = event.target.closest("select[data-response-id]");
  if (responseSelect) {
    saveResponseField(responseSelect);
    return;
  }

  const responseRadio = event.target.closest('input[type="radio"][data-response-id]');
  if (responseRadio) saveResponseField(responseRadio);
});

document.addEventListener("change", (event) => {
  const othelloLanguagePronoun = event.target.closest("[data-othello-language-pronoun-input]");
  if (othelloLanguagePronoun) {
    updateOthelloLanguagePronoun(Number.parseInt(othelloLanguagePronoun.getAttribute("data-othello-language-pronoun-input") || "-1", 10), othelloLanguagePronoun.value);
    return;
  }
  if (event.target.matches?.("[data-worksheet-select]")) { updateActQuestionAddons(); renderSceneCheckpoints(); }
});
document.addEventListener("input", (event) => {
  const othelloLanguageContraction = event.target.closest("[data-othello-language-contraction-input]");
  if (othelloLanguageContraction) {
    updateOthelloLanguageContraction(Number.parseInt(othelloLanguageContraction.getAttribute("data-othello-language-contraction-input") || "-1", 10), othelloLanguageContraction.value);
    return;
  }
  const characterField = event.target.closest("input[data-character-dossier-field], textarea[data-character-dossier-field]");
  if (characterField) {
    updateCharacterDossierField(characterField.getAttribute("data-character-dossier-field") || "", characterField.value);
    return;
  }

  const characterEvolutionField = event.target.closest("textarea[data-character-dossier-evolution-field]");
  if (characterEvolutionField) {
    updateCharacterDossierEntry("evolution", characterEvolutionField.getAttribute("data-character-dossier-entry-id") || "", characterEvolutionField.getAttribute("data-character-dossier-evolution-field") || "", characterEvolutionField.value);
    return;
  }

  const characterQuoteField = event.target.closest("input[data-character-dossier-quote-field], textarea[data-character-dossier-quote-field]");
  if (characterQuoteField) {
    updateCharacterDossierEntry("quotes", characterQuoteField.getAttribute("data-character-dossier-entry-id") || "", characterQuoteField.getAttribute("data-character-dossier-quote-field") || "", characterQuoteField.value);
    return;
  }

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
  const closeReadingDraftField = event.target.closest("input[data-close-reading-draft-field], textarea[data-close-reading-draft-field]");
  if (closeReadingDraftField) {
    updateOthelloCloseReadingDraftField(closeReadingDraftField.getAttribute("data-close-reading-draft-field") || "", closeReadingDraftField.value);
    return;
  }
  const closeReadingTaskField = event.target.closest("[data-close-reading-task-field]");
  if (closeReadingTaskField) {
    updateOthelloCloseReadingTaskField(closeReadingTaskField.getAttribute("data-close-reading-task-field") || "", closeReadingTaskField.value);
    return;
  }
  const closeReadingFinalResponse = event.target.closest("[data-close-reading-final-response]");
  if (closeReadingFinalResponse) {
    if (!othelloCloseReadingState) othelloCloseReadingState = readOthelloCloseReadingState();
    othelloCloseReadingState.finalResponse = closeReadingFinalResponse.value;
    writeOthelloCloseReadingState();
    renderOthelloCloseReadingSynthesis();
    renderOthelloCloseReadingProgress();
    return;
  }
  const themeDraftField = event.target.closest("[data-theme-draft]");
  if (themeDraftField) {
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    othelloThemeState.quickDrafts[themeDraftField.getAttribute("data-theme-draft") || ""] = themeDraftField.value;
    writeOthelloThemeBuilderState();
    renderOthelloThemeBuilderProgress();
    return;
  }
  const themeTopicReason = event.target.closest("[data-theme-topic-reason]");
  if (themeTopicReason) {
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    othelloThemeState.topicReason = themeTopicReason.value;
    writeOthelloThemeBuilderState();
    renderOthelloThemeBuilderProgress();
    return;
  }
  const themeEvidenceField = event.target.closest("input[data-theme-evidence-field], textarea[data-theme-evidence-field]");
  if (themeEvidenceField) {
    if (!othelloThemeUi.evidenceDraft) othelloThemeUi.evidenceDraft = createOthelloThemeEvidenceDraft(othelloThemeState?.selectedTopic || othelloThemeTopics[0]);
    othelloThemeUi.evidenceDraft[themeEvidenceField.getAttribute("data-theme-evidence-field") || ""] = themeEvidenceField.value;
    renderOthelloThemeEvidenceBoard();
    return;
  }
  const themePatternField = event.target.closest("[data-theme-pattern-field]");
  if (themePatternField) {
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    const patternId = themePatternField.getAttribute("data-theme-pattern-id") || "";
    const fieldName = themePatternField.getAttribute("data-theme-pattern-field") || "";
    othelloThemeState.patterns = othelloThemeState.patterns.map((pattern) => pattern.id === patternId ? { ...pattern, [fieldName]: themePatternField.value } : pattern);
    writeOthelloThemeBuilderState();
    renderOthelloThemeBuilderProgress();
    return;
  }
  const themeFinalDraft = event.target.closest("[data-theme-final-draft]");
  if (themeFinalDraft) {
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    othelloThemeState.finalThemeDraft = themeFinalDraft.value;
    writeOthelloThemeBuilderState();
    renderOthelloThemeFinalBoard();
    renderOthelloThemeBuilderProgress();
    return;
  }
  const themeResponseField = event.target.closest("[data-theme-response-field]");
  if (themeResponseField) {
    if (!othelloThemeState) othelloThemeState = readOthelloThemeBuilderState();
    othelloThemeState.response[themeResponseField.getAttribute("data-theme-response-field") || ""] = themeResponseField.value;
    writeOthelloThemeBuilderState();
    renderOthelloThemeBuilderProgress();
    if ((themeResponseField.getAttribute("data-theme-response-field") || "") === "compiled") renderOthelloThemeResponseBoard();
    return;
  }
  const field = event.target.closest("[data-response-id]");
  if (!field || field.type === "radio") return;
  saveResponseField(field);
});
document.addEventListener("mouseup", (event) => {
  const passageText = event.target.closest("[data-close-reading-passage-text]");
  if (!passageText || othelloCloseReadingUi.showForm) return;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (!passageText.contains(range.commonAncestorContainer)) return;
  const selectedText = normalizeOthelloCloseReadingSelectedText(selection.toString());
  if (!selectedText || selectedText.length < 3) return;
  const startLine = getOthelloCloseReadingLineNode(range.startContainer);
  const endLine = getOthelloCloseReadingLineNode(range.endContainer);
  const startLineId = startLine?.getAttribute("data-close-reading-line") || "";
  const endLineId = endLine?.getAttribute("data-close-reading-line") || startLineId;
  if (!startLineId) return;
  openOthelloCloseReadingSelectionDraftFromRange(startLineId, endLineId, selectedText);
});
function restoreResponses(){ const responses = readResponses(); document.querySelectorAll("[data-response-id]").forEach((field) => { setResponseFieldValue(field, responses[field.getAttribute("data-response-id")]); }); updateResponsibilityTotal(); updateAnticipationGuide();  }
const defaultWorksheetRoot = document.querySelector("[data-default-worksheet-story]");
const defaultWorksheetStory = defaultWorksheetRoot?.getAttribute("data-default-worksheet-story");
if (defaultWorksheetStory) renderWorksheetStory(defaultWorksheetStory, defaultWorksheetRoot);
renderCharacterDossierStudio();
document.getElementById("sidebar-toggle")?.addEventListener("click", toggleCourseMenu);
document.getElementById("topbar-menu-toggle")?.addEventListener("click", toggleCourseMenu);
window.addEventListener("hashchange", route);
restoreResponses();
othelloLanguageState = readOthelloLanguageState();
othelloCloseReadingState = readOthelloCloseReadingState();
othelloThemeState = readOthelloThemeBuilderState();
renderOthelloLanguageTranslator();
route();
updateComplete();

const analysisExplorerRoot = document.querySelector(".analysis-explorer, [data-analysis-explorer]");
if (analysisExplorerRoot && typeof renderAnalysisExplorer === "function") {
  renderAnalysisExplorer();
}

const activeOthelloAssignmentSelect = document.querySelector("[data-othello-assignment-select]");
if (activeOthelloAssignmentSelect) {
  setActiveOthelloAssignment(activeOthelloAssignmentSelect.value || "language-translator");
}

updateResponsibilityTotal();
document.querySelectorAll("[data-resource-select]").forEach((select) => setActiveResourcePanel(select.value));
document.querySelectorAll("[data-parallel-select]").forEach((select) => setActiveParallelScene(select.value));
document.querySelectorAll("[data-story-doc-target].active").forEach((button) => setActiveStoryDocument(button.getAttribute("data-story-doc-target")));
document.querySelectorAll("[data-overlay-select-shell]").forEach((shell) => syncOverlaySelectUI(shell));

</script>
</body>
</html>`;
}

async function buildOthelloProject(options: { zipPath: string; slug: string; force: boolean }) {
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
  const sourceUnit = findOthelloUnit($);
  if (!sourceUnit) {
    throw new Error("Could not find Shakespeare: Othello item in imsmanifest.xml.");
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
  const parallelReadingScenes = await Promise.all(PARALLEL_READING_SCENES.map((scene) => hydrateParallelReadingScene(scene)));
  const storyBankItems = await copyStoryBankItems(workspaceDir);
  const writingWorksheets = await loadWritingWorksheets();
  const recoveredVideos = uniqueBy(lessons.flatMap((lesson) => lesson.videos), (video) => video.embedSrc);
  const localFilmVideos = await copyLocalFilmItems(workspaceDir);
  const videos = uniqueBy([...recoveredVideos, ...localFilmVideos], (video) => video.embedSrc);
  const html = normalizeOthelloWorkspaceHtml(
    buildHtml({ headAssets, lessons, resourceGroups, localResources, parallelReadingScenes, storyBankItems, writingWorksheets, videos })
  );
  await writeFile(path.join(workspaceDir, "index.html"), html, "utf8");

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
    regenerateCommand: `npx tsx scripts/build-ela-shakespeare-othello.ts --zip "${options.zipPath}" --slug ${options.slug} --force`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: options.zipPath,
      importedAt: now,
      notes: "D2L/Brightspace Shakespeare: Othello unit converted into the Streetcar-style ELA 30-1 course shell."
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
        notes: "Standalone HTML preview for shaping the replicated Shakespeare: Othello unit."
      }
    ],
    authoringStatus: "active",
    referenceOnly: [path.join(rawDir, path.basename(options.zipPath))],
    sourceOfTruthNotes: "Edit workspace/index.html as the canonical Shakespeare: Othello course shell. Regenerate SCORM after workspace edits."
  };
  await writeFile(path.join(metaDir, "project.json"), `${JSON.stringify(manifestJson, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(metaDir, "conversion-notes.md"),
    `# Shakespeare: Othello Conversion Notes\n\n- Source ZIP: ${options.zipPath}\n- Lessons imported: ${lessons.length}\n- Local resources found: ${localResources.length}\n- Othello materials: ${storyBankItems.length}\n- Act-question workspaces: ${writingWorksheets.length}\n- Videos found: ${videos.length}\n- Canonical source: projects/${options.slug}/workspace/index.html\n\nThis is the first pass using the Streetcar-style shell plus Short Stories refinements. Othello materials, act questions, Film Room, and Writing Studio should be curated with unit-specific supports as they become available.\n`,
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

function normalizeOthelloWorkspaceHtml(html: string): string {
  return html
    .replace(
      /This semester you will be studying(?:&nbsp;|\s)*<strong>King Lear<\/strong>(?:&nbsp;|\s)*so you will need to get yourself a copy of the play\./g,
      "This semester you will be studying <strong>Othello</strong> so you will need to get yourself a copy of the play."
    )
    .replace(/assets\/source\/King-Lear-crown\.jpg/g, "assets/source/othello-iago.jpg")
    .replace(
      /<img class="source-image" src="assets\/source\/othello-iago\.jpg" alt="" title="" loading="lazy">/g,
      '<img class="source-image" src="assets/source/othello-iago.jpg" alt="Othello and Iago" title="Othello" loading="eager">'
    );
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const zipPath = getStringFlag(parsedArgs, "zip") ?? parsedArgs.positionals[0];
  if (!zipPath) {
    throw new Error('Usage: npx tsx scripts/build-ela-shakespeare-othello.ts --zip "<path-to-d2l-export.zip>" [--slug ela30-1-shakespeare-othello] [--force]');
  }
  const result = await buildOthelloProject({
    zipPath,
    slug: getStringFlag(parsedArgs, "slug") ?? DEFAULT_SLUG,
    force: hasFlag(parsedArgs, "force")
  });
  console.log(`Built ${result.slug}`);
  console.log(`Lessons: ${result.lessonCount}`);
  console.log(`Local resources: ${result.localResourceCount}`);
  console.log(`Othello materials: ${result.storyBankCount}`);
  console.log(`Act-question workspaces: ${result.writingWorksheetCount}`);
  console.log(`Videos: ${result.videoCount}`);
  console.log(`Workspace: ${result.workspaceEntrypoint}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
