"use strict";

const STORAGE_KEY = "calm-life-adventure-module1-v3";

const WORDS = {
  look: ["look", "examine", "read", "see", "inspect", "view", "check", "study", "watch"],
  talk: ["talk", "ask", "speak", "chat", "tell"],
  take: ["take", "get", "grab", "pickup", "pick", "collect"],
  use: ["use", "text", "call", "dial"],
  go: ["go", "walk", "enter", "open", "head", "move", "leave"],
  inventory: ["inventory", "inv", "items", "i"],
  help: ["help", "hint", "commands", "what", "how"]
};

const PHRASE_NORMALIZATIONS = [
  ["pick up", "take"],
  ["look at", "look"],
  ["talk to", "talk"],
  ["go to", "go"],
  ["head to", "go"],
  ["walk to", "go"],
  ["check out", "look"],
  ["call up", "talk"]
];

const IGNORED_WORDS = new Set([
  "the",
  "a",
  "an",
  "at",
  "to",
  "on",
  "with",
  "into",
  "inside",
  "in",
  "my",
  "your",
  "our",
  "me",
  "can",
  "could",
  "would",
  "please",
  "just",
  "from",
  "up",
  "out",
  "around"
]);

const ROOM_MESSAGES = {
  bedroom: {
    1: "You are outside on the strip before the night gets louder. Module 1 starts here: what works for you, what does not, and what happens when pressure shows up first.",
    2: "The flyer stand is stuffed with local handouts. One of them is a blank planner sheet, which is more useful than it looks.",
    3: "The payphone is where the risky invite finds you. The message tries very hard to make consequences sound optional.",
    4: "The street poster pushes the same lesson as Module 1: vague promises do not help nearly as much as one clear next move.",
    5: "You take the planner sheet and fold it into your pocket.",
    6: "You already have the planner.",
    7: "Without support or boundaries, using the phone just pulls you closer to the bad plan.",
    8: "You send a clear reply and back away from the risky invite. It feels awkward for a second and healthier for much longer.",
    9: "The front door leads inside."
  },
  hallway: {
    1: "You are in a side hall just off the main room. It is quieter here, which makes it easier to hear your own thinking.",
    2: "Maya looks like someone who can tell the difference between being fine and acting fine.",
    3: "The wall is mostly bare except for one relationship poster and the marks left behind by old arguments.",
    4: "The bench is not comfortable, but it is good enough for one honest pause.",
    5: "Maya reminds you that healthy relationships start with basic communication and basic trust, not pressure.",
    6: "Reading the board gives you one useful push: stop promising yourself a vague better future and write one real goal.",
    7: "The lounge door is open behind you."
  },
  classroom: {
    1: "You are in the lounge. It looks like a place where people kill time, but it works just as well for choosing better habits.",
    2: "The mentor at the counter has the expression of someone who has watched a lot of students confuse intensity with growth.",
    3: "The counter shelf is cluttered with leftovers from other nights, but the room still holds onto one useful rule: choose what actually helps.",
    4: "The packet on the counter holds Module 1 handouts on goals and evaluating relationships.",
    5: "The mentor helps you turn a wish into one specific goal card.",
    6: "You take the relationship worksheet. Now you have language for a boundary instead of just hoping one appears.",
    7: "The board behind the counter frames the whole chapter: what works for you, goals, relationships, risk, and mental health awareness."
  },
  counselor: {
    1: "You are in the back room. The noise drops away back here. This is where panic starts turning into a plan.",
    2: "Ms. Singh does not offer magic answers. She offers better questions and concrete next steps.",
    3: "The pamphlet rack covers stress, mental health awareness, and what support looks like before things get worse.",
    4: "The planning desk is where Module 1 ends. The sheet only counts if it reflects real choices, not wishful thinking.",
    5: "Ms. Singh talks you through a reset: identify the stress, breathe on purpose, and contact support before your brain invents a disaster movie.",
    6: "You take a breathing card and tuck it into your planner.",
    7: "You complete the planner with a real goal, a safer response to the risky invite, and at least two healthy support paths."
  }
};

const OBJECT_TABLE = {
  planner: {
    id: "planner",
    statusName: "Planner",
    startRoom: "bedroom",
    aliases: ["planner", "notebook", "sheet", "planning", "planning sheet"]
  },
  supportNote: {
    id: "supportNote",
    statusName: "Support Note",
    startRoom: null,
    aliases: ["support", "support note", "note"]
  },
  goalCard: {
    id: "goalCard",
    statusName: "Goal Card",
    startRoom: null,
    aliases: ["goal", "goal card", "card"]
  },
  relationshipSheet: {
    id: "relationshipSheet",
    statusName: "Relationship Sheet",
    startRoom: null,
    aliases: ["worksheet", "sheet", "relationship sheet"]
  },
  breathingCard: {
    id: "breathingCard",
    statusName: "Breathing Card",
    startRoom: null,
    aliases: ["breathing card", "card", "pamphlet"]
  }
};

const ROOMS = {
  bedroom: {
    id: "bedroom",
    agiRoom: 11,
    picId: 11,
    title: "Outside",
    subtitle: "Street Entry",
    sceneClass: "scene-bedroom",
    introMessage: 1,
    exits: [
      { noun: "door", target: "hallway", aliases: ["door", "hallway", "hall"] }
    ],
    hotspots: [
      { noun: "flyers", label: "Flyer Stand", aliases: ["flyers", "flyer", "stand", "notebook"], x: 14, y: 66, w: 12, h: 18, kind: "object" },
      { noun: "phone", label: "Payphone", aliases: ["phone", "telephone", "payphone"], x: 24, y: 14, w: 14, h: 56, kind: "object" },
      { noun: "poster", label: "Street Poster", aliases: ["poster", "board", "sign"], x: 62, y: 8, w: 18, h: 18, kind: "object" },
      { noun: "door", label: "Front Door", aliases: ["door", "lounge", "inside"], x: 43, y: 48, w: 18, h: 28, kind: "exit" }
    ],
    walkTo: { x: 46, y: 83 }
  },
  hallway: {
    id: "hallway",
    agiRoom: 14,
    picId: 14,
    title: "School Hallway",
    subtitle: "Between Classes",
    sceneClass: "scene-hallway",
    introMessage: 1,
    exits: [
      { noun: "outside", target: "bedroom", aliases: ["outside", "exit"] },
      { noun: "classroom", target: "classroom", aliases: ["classroom", "class", "room"] },
      { noun: "office", target: "counselor", aliases: ["office", "counselor", "counsellor"] }
    ],
    hotspots: [
      { noun: "maya", label: "Maya", aliases: ["maya", "friend"], x: 20, y: 54, w: 12, h: 24, kind: "person" },
      { noun: "bench", label: "Bench", aliases: ["bench", "seat"], x: 18, y: 58, w: 16, h: 10, kind: "object" },
      { noun: "poster", label: "Boundary Poster", aliases: ["poster", "relationship poster", "wall"], x: 84, y: 8, w: 14, h: 18, kind: "object" },
      { noun: "classroom", label: "Lounge Door", aliases: ["classroom", "class", "lounge", "door"], x: 82, y: 22, w: 14, h: 28, kind: "exit" },
      { noun: "outside", label: "Street Exit", aliases: ["outside", "street", "exit"], x: 44, y: 76, w: 12, h: 12, kind: "exit" }
    ],
    walkTo: { x: 50, y: 84 }
  },
  classroom: {
    id: "classroom",
    agiRoom: 15,
    picId: 15,
    title: "Lounge",
    subtitle: "Conversation Room",
    sceneClass: "scene-classroom",
    introMessage: 1,
    exits: [
      { noun: "hallway", target: "hallway", aliases: ["hallway", "hall", "door"] }
    ],
    hotspots: [
      { noun: "teacher", label: "Mentor", aliases: ["teacher", "mentor", "bartender"], x: 46, y: 42, w: 14, h: 28, kind: "person" },
      { noun: "basket", label: "Counter Packet", aliases: ["basket", "worksheet", "worksheets", "packet"], x: 58, y: 54, w: 28, h: 12, kind: "object" },
      { noun: "board", label: "Board", aliases: ["board", "counter board", "shelf"], x: 62, y: 8, w: 20, h: 12, kind: "object" },
      { noun: "hallway", label: "Hallway Door", aliases: ["hallway", "hall", "door"], x: 8, y: 28, w: 16, h: 28, kind: "exit" },
      { noun: "office", label: "Back Room", aliases: ["office", "backroom", "back room"], x: 86, y: 36, w: 14, h: 28, kind: "exit" }
    ],
    walkTo: { x: 50, y: 84 }
  },
  counselor: {
    id: "counselor",
    agiRoom: 16,
    picId: 16,
    title: "Back Room",
    subtitle: "Support and Strategy",
    sceneClass: "scene-counselor",
    introMessage: 1,
    exits: [
      { noun: "hallway", target: "hallway", aliases: ["hallway", "hall", "door"] }
    ],
    hotspots: [
      { noun: "counselor", label: "Ms. Singh", aliases: ["counselor", "singh", "ms singh"], x: 76, y: 44, w: 10, h: 22, kind: "person" },
      { noun: "rack", label: "Pamphlet Rack", aliases: ["rack", "pamphlet", "pamphlet rack"], x: 18, y: 26, w: 16, h: 28, kind: "object" },
      { noun: "desk", label: "Planning Desk", aliases: ["desk", "planning desk"], x: 36, y: 64, w: 24, h: 14, kind: "object" },
      { noun: "hallway", label: "Lounge Door", aliases: ["hallway", "hall", "door", "lounge"], x: 6, y: 48, w: 10, h: 22, kind: "exit" }
    ],
    walkTo: { x: 50, y: 84 }
  }
};

const ROOM_NPCS = {
  hallway: [
    { noun: "maya", x: 24, y: 79, w: 28, h: 64, src: "./assets/agi/views/vBarGreaser/loop0-cel0.svg" }
  ],
  classroom: [
    { noun: "teacher", x: 55, y: 76, w: 28, h: 64, src: "./assets/agi/views/vBartender/loop0-cel0.svg" }
  ],
  counselor: [
    { noun: "counselor", x: 80, y: 76, w: 20, h: 48, src: "./assets/agi/views/vReceptionist/loop0-cel0.svg" }
  ]
};

function createInitialState() {
  return {
    roomId: "bedroom",
    commandBuffer: "",
    inventory: [],
    flags: [],
    transcript: ["Module 1 objective: build a real personal choices plan before the risky invite writes the day for you."],
    player: { x: 46, y: 83 },
    facing: "down",
    stepFrame: 0,
    stats: {
      wellbeing: 5,
      confidence: 4,
      relationships: 4,
      stress: 5
    }
  };
}

let state = loadState();

const WORD_INDEX = buildWordIndex();
const VOCABULARY = buildVocabulary();

function buildWordIndex() {
  const index = new Map();
  Object.entries(WORDS).forEach(([canonical, words]) => {
    words.forEach((word) => index.set(word, canonical));
  });
  return index;
}

function buildVocabulary() {
  const words = new Set();
  Object.values(WORDS).forEach((entries) => entries.forEach((entry) => words.add(entry)));
  Object.values(OBJECT_TABLE).forEach((item) => item.aliases.forEach((alias) => alias.split(" ").forEach((part) => words.add(part))));
  Object.values(ROOMS).forEach((room) => {
    room.hotspots.forEach((hotspot) => hotspot.aliases.forEach((alias) => alias.split(" ").forEach((part) => words.add(part))));
    room.exits.forEach((exit) => exit.aliases.forEach((alias) => alias.split(" ").forEach((part) => words.add(part))));
  });
  return [...words];
}

function levenshtein(left, right) {
  if (left === right) {
    return 0;
  }

  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }
  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

function fuzzyNormalizeToken(token) {
  if (WORD_INDEX.has(token)) {
    return WORD_INDEX.get(token);
  }

  let bestMatch = token;
  let bestDistance = Infinity;

  for (const candidate of VOCABULARY) {
    const distance = levenshtein(token, candidate);
    const allowed = candidate.length >= 7 ? 2 : 1;
    if (distance <= allowed && distance < bestDistance) {
      bestMatch = candidate;
      bestDistance = distance;
    }
  }

  return WORD_INDEX.get(bestMatch) || bestMatch;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getRoom(roomId = state.roomId) {
  return ROOMS[roomId];
}

function hasFlag(flag) {
  return state.flags.includes(flag);
}

function addFlag(flag) {
  if (!hasFlag(flag)) {
    state.flags.push(flag);
  }
}

function hasItem(itemId) {
  return state.inventory.includes(itemId);
}

function addItem(itemId) {
  if (!hasItem(itemId)) {
    state.inventory.push(itemId);
  }
}

function pushTranscript(line) {
  state.transcript.unshift(line);
  state.transcript = state.transcript.slice(0, 10);
}

function changeStats(effects) {
  if (!effects) {
    return;
  }
  Object.entries(effects).forEach(([key, delta]) => {
    state.stats[key] = clamp((state.stats[key] || 0) + delta, 0, 10);
  });
}

function setPlayerPosition(x, y) {
  state.player = {
    x: clamp(x, 6, 94),
    y: clamp(y, 18, 86)
  };
}

function say(roomId, messageId) {
  const line = ROOM_MESSAGES[roomId]?.[messageId];
  if (line) {
    pushTranscript(line);
  }
}

function moveToRoom(roomId) {
  const room = getRoom(roomId);
  if (!room) {
    return;
  }
  state.roomId = roomId;
  state.commandBuffer = "";
  setPlayerPosition(room.walkTo.x, room.walkTo.y);
  say(roomId, room.introMessage);
  persistState();
  render();
}

function getPathTokenCount() {
  return ["path.goal", "path.relationship", "path.coping"].filter((flag) => hasFlag(flag)).length;
}

function canFinishModule() {
  return hasItem("planner") && hasFlag("invite.resolved") && getPathTokenCount() >= 2;
}

function getScore() {
  return [
    hasItem("planner"),
    hasFlag("invite.resolved"),
    hasFlag("path.goal"),
    hasFlag("path.relationship"),
    hasFlag("path.coping"),
    hasFlag("module1.complete")
  ].filter(Boolean).length;
}

function normalizeCommand(raw) {
  let normalized = raw.toLowerCase().trim();
  PHRASE_NORMALIZATIONS.forEach(([from, to]) => {
    normalized = normalized.replaceAll(from, to);
  });

  const tokens = normalized
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !IGNORED_WORDS.has(token))
    .map((token) => fuzzyNormalizeToken(token));

  const verbIndex = tokens.findIndex((token) => Object.prototype.hasOwnProperty.call(WORDS, token));
  if (verbIndex > 0) {
    tokens.unshift(tokens.splice(verbIndex, 1)[0]);
  }

  if (tokens.length && !Object.prototype.hasOwnProperty.call(WORDS, tokens[0])) {
    tokens.unshift("look");
  }

  return tokens;
}

function resolveNoun(room, nounWords) {
  const nounText = nounWords.join(" ").trim();
  if (!nounText) {
    return null;
  }

  const candidates = [
    ...room.hotspots.map((hotspot) => ({ type: hotspot.kind, noun: hotspot.noun, target: hotspot, aliases: hotspot.aliases })),
    ...room.exits.map((exit) => ({ type: "exit", noun: exit.noun, target: exit, aliases: exit.aliases })),
    ...Object.values(OBJECT_TABLE).map((object) => ({ type: "inventory", noun: object.id, target: object, aliases: object.aliases }))
  ];

  let bestMatch = null;
  let bestScore = Infinity;

  for (const candidate of candidates) {
    for (const alias of candidate.aliases) {
      if (alias === nounText) {
        return candidate;
      }

      const aliasParts = alias.split(" ");
      const overlap = aliasParts.every((part) => nounWords.includes(part));
      if (overlap) {
        return candidate;
      }

      const distance = levenshtein(nounText.replace(/\s+/g, ""), alias.replace(/\s+/g, ""));
      const allowed = alias.length >= 8 ? 3 : 2;
      if (distance <= allowed && distance < bestScore) {
        bestMatch = candidate;
        bestScore = distance;
      }
    }
  }

  return bestMatch;
}

function renderSceneArt(room) {
  if (room.picId) {
    return `<img class="scene-art scene-art-image" src="./assets/agi/pics/pic-${room.picId}/visual.svg" alt="" />`;
  }
  return "";
}

function handleInventoryCommand(itemId, verb) {
  if (!hasItem(itemId)) {
    pushTranscript(`You do not have ${OBJECT_TABLE[itemId]?.statusName?.toLowerCase() || "that"} right now.`);
    return;
  }

  if (verb === "look") {
    switch (itemId) {
      case "planner":
        pushTranscript("The planner is still mostly blank. It only becomes useful when you fill it with real choices.");
        return;
      case "supportNote":
        pushTranscript("The note from Maya says what healthy people usually say more simply: communication and trust beat pressure.");
        return;
      case "goalCard":
        pushTranscript("The goal card has one clear next step instead of a dramatic promise about becoming a new person overnight.");
        return;
      case "relationshipSheet":
        pushTranscript("The worksheet compares healthy relationships with unhealthy ones. It gives you language for a real boundary.");
        return;
      case "breathingCard":
        pushTranscript("The breathing card is simple on purpose: name the stress, breathe, reach out, reset.");
        return;
      default:
        pushTranscript("You look it over.");
        return;
    }
  }

  if (verb === "use") {
    if (itemId === "breathingCard") {
      changeStats({ stress: -1, wellbeing: 1 });
      pushTranscript("You use the breathing card and slow the moment down enough to think clearly again.");
      return;
    }

    if (itemId === "planner" && state.roomId === "counselor") {
      handleCounselorDeskUse();
      return;
    }

    pushTranscript(`Using ${OBJECT_TABLE[itemId].statusName.toLowerCase()} here does not change anything yet.`);
    return;
  }

  pushTranscript("That command works better on a person, object, or exit in the room.");
}

function resolveInviteThroughPhone() {
  if (!hasFlag("invite.seen")) {
    addFlag("invite.seen");
    say("bedroom", 3);
    return;
  }

  if (hasFlag("invite.resolved")) {
    pushTranscript("You already dealt with the invite. The bigger question is whether your plan still holds later.");
    return;
  }

  if (hasFlag("path.relationship") || hasFlag("path.coping")) {
    addFlag("invite.resolved");
    addFlag("invite.declined");
    changeStats({ confidence: 1, stress: -1, wellbeing: 1 });
    say("bedroom", 8);
    return;
  }

  addFlag("invite.accepted");
  changeStats({ stress: 1, wellbeing: -1, relationships: 1 });
  say("bedroom", 7);
}

function handleCounselorDeskUse() {
  if (hasFlag("module1.complete")) {
    pushTranscript("The planner is already complete. Module 1 is ready to move on.");
    return;
  }

  if (!hasItem("planner")) {
    pushTranscript("You need the planner first.");
    return;
  }

  if (!hasFlag("invite.resolved")) {
    pushTranscript("The risky invite is still unresolved. The plan is not real until that part is real.");
    return;
  }

  if (getPathTokenCount() < 2) {
    pushTranscript("You need more than one support idea. Find at least two: a goal, a relationship clue, or a coping strategy.");
    return;
  }

  addFlag("module1.complete");
  changeStats({ wellbeing: 2, confidence: 2, relationships: 1, stress: -2 });
  say("counselor", 7);
}

function handleRoomCommand(roomId, verb, noun) {
  switch (roomId) {
    case "bedroom":
      return handleBedroom(verb, noun);
    case "hallway":
      return handleHallway(verb, noun);
    case "classroom":
      return handleClassroom(verb, noun);
    case "counselor":
      return handleCounselor(verb, noun);
    default:
      pushTranscript("Nothing happens.");
  }
}

function handleBedroom(verb, noun) {
  if (!noun && verb === "look") {
    say("bedroom", 1);
    return;
  }

  if (noun === "flyers") {
    if (verb === "look") {
      say("bedroom", 2);
      return;
    }
    if (verb === "take") {
      if (hasItem("planner")) {
        say("bedroom", 6);
      } else {
        addItem("planner");
        changeStats({ confidence: 1, stress: -1 });
        say("bedroom", 5);
      }
      return;
    }
  }

  if (noun === "phone") {
    if (verb === "look") {
      say("bedroom", 3);
      addFlag("invite.seen");
      return;
    }
    if (verb === "use") {
      resolveInviteThroughPhone();
      return;
    }
  }

  if (noun === "poster" && verb === "look") {
    say("bedroom", 4);
    return;
  }

  if (noun === "door") {
    if (verb === "look") {
      say("bedroom", 9);
      return;
    }
    if (verb === "go") {
      moveToRoom("hallway");
      return;
    }
  }

  pushTranscript("That does not get you much here.");
}

function handleHallway(verb, noun) {
  if (!noun && verb === "look") {
    say("hallway", 1);
    return;
  }

  if (noun === "maya") {
    if (verb === "look") {
      say("hallway", 2);
      return;
    }
    if (verb === "talk") {
      addFlag("path.relationship");
      addItem("supportNote");
      changeStats({ relationships: 2, stress: -1, wellbeing: 1 });
      say("hallway", 5);
      return;
    }
  }

  if (noun === "poster") {
    if (verb === "look") {
      addFlag("path.goal");
      changeStats({ confidence: 1, stress: -1 });
      say("hallway", 6);
      return;
    }
  }

  if (noun === "bench" && verb === "look") {
    say("hallway", 4);
    return;
  }

  if (noun === "classroom" && verb === "go") {
    moveToRoom("classroom");
    return;
  }

  if ((noun === "outside" || noun === "exit") && verb === "go") {
    moveToRoom("bedroom");
    return;
  }

  if (noun === "classroom" && verb === "look") {
    say("hallway", 7);
    return;
  }

  pushTranscript("That does not unlock anything useful here.");
}

function handleClassroom(verb, noun) {
  if (!noun && verb === "look") {
    say("classroom", 1);
    return;
  }

  if (noun === "teacher") {
    if (verb === "look") {
      say("classroom", 2);
      return;
    }
    if (verb === "talk") {
      addFlag("path.goal");
      addItem("goalCard");
      changeStats({ confidence: 1, wellbeing: 1 });
      say("classroom", 5);
      return;
    }
  }

  if (noun === "basket") {
    if (verb === "look") {
      say("classroom", 4);
      return;
    }
    if (verb === "take") {
      addFlag("path.relationship");
      addItem("relationshipSheet");
      say("classroom", 6);
      return;
    }
  }

  if (noun === "hallway" && verb === "go") {
    moveToRoom("hallway");
    return;
  }

  if (noun === "office" && verb === "go") {
    moveToRoom("counselor");
    return;
  }

  if ((noun === "board" || noun === "room") && verb === "look") {
    say("classroom", 7);
    return;
  }

  pushTranscript("The classroom is trying to teach you something, but not through that command.");
}

function handleCounselor(verb, noun) {
  if (!noun && verb === "look") {
    say("counselor", 1);
    return;
  }

  if (noun === "counselor") {
    if (verb === "look") {
      say("counselor", 2);
      return;
    }
    if (verb === "talk") {
      addFlag("path.coping");
      changeStats({ wellbeing: 1, stress: -2, confidence: 1 });
      say("counselor", 5);
      return;
    }
  }

  if (noun === "rack") {
    if (verb === "look") {
      say("counselor", 3);
      return;
    }
    if (verb === "take") {
      addFlag("path.coping");
      addItem("breathingCard");
      changeStats({ wellbeing: 1, stress: -1 });
      say("counselor", 6);
      return;
    }
  }

  if (noun === "desk") {
    if (verb === "look") {
      say("counselor", 4);
      return;
    }
    if (verb === "use") {
      handleCounselorDeskUse();
      return;
    }
  }

  if (noun === "hallway" && verb === "go") {
    moveToRoom("hallway");
    return;
  }

  pushTranscript("That is not the move that gets you out of this room.");
}

function runCommand(rawCommand) {
  const tokens = normalizeCommand(rawCommand);

  if (!tokens.length) {
    pushTranscript("Type a command like LOOK DESK, TALK MAYA, TAKE PLANNER, GO HALLWAY, or USE PHONE.");
    return;
  }

  const [verb, ...nounWords] = tokens;
  const room = getRoom();

  if (verb === "help") {
    pushTranscript("Try commands like LOOK PHONE, TAKE PLANNER, TALK MAYA, LOOK POSTER, GO LOUNGE, GO BACKROOM, USE PHONE, INVENTORY.");
    return;
  }

  if (verb === "inventory") {
    const items = state.inventory.map((itemId) => OBJECT_TABLE[itemId].statusName).join(", ");
    pushTranscript(items ? `You are carrying: ${items}.` : "You are not carrying anything.");
    return;
  }

  const resolved = resolveNoun(room, nounWords);
  if (!resolved && nounWords.length > 0) {
    pushTranscript("That noun is not something the game understands here.");
    return;
  }

  if (resolved?.type === "inventory") {
    handleInventoryCommand(resolved.noun, verb);
    return;
  }

  if (resolved?.type === "exit" && verb === "go") {
    moveToRoom(resolved.target.target);
    return;
  }

  handleRoomCommand(room.id, verb, resolved?.noun || null);
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createInitialState();
    }
    const parsed = JSON.parse(saved);
    const base = createInitialState();
    return {
      ...base,
      ...parsed,
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      transcript: Array.isArray(parsed.transcript) && parsed.transcript.length ? parsed.transcript : base.transcript,
      facing: typeof parsed.facing === "string" ? parsed.facing : base.facing,
      stepFrame: Number.isFinite(parsed.stepFrame) ? parsed.stepFrame : base.stepFrame,
      stats: {
        ...base.stats,
        ...(parsed.stats || {})
      }
    };
  } catch (error) {
    return createInitialState();
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetGame() {
  state = createInitialState();
  persistState();
  render();
}

function handleArrowMovement(event) {
  const step = 3;
  if (event.key === "ArrowLeft") {
    state.facing = "left";
    state.stepFrame += 1;
    setPlayerPosition(state.player.x - step, state.player.y);
  } else if (event.key === "ArrowRight") {
    state.facing = "right";
    state.stepFrame += 1;
    setPlayerPosition(state.player.x + step, state.player.y);
  } else if (event.key === "ArrowUp") {
    state.facing = "up";
    state.stepFrame += 1;
    setPlayerPosition(state.player.x, state.player.y - step);
  } else if (event.key === "ArrowDown") {
    state.facing = "down";
    state.stepFrame += 1;
    setPlayerPosition(state.player.x, state.player.y + step);
  } else {
    return;
  }

  persistState();
  render();
}

function renderStatusLine() {
  const room = getRoom();
  return `
    <div class="status-left">CALM LIFE ADVENTURE  |  MODULE 1  |  ROOM ${room.agiRoom}</div>
    <div class="status-right">
      <span>SCORE: ${getScore()}/6</span>
      <span>PATHS: ${getPathTokenCount()}/3</span>
      <span>PLAN: ${hasFlag("module1.complete") ? "COMPLETE" : canFinishModule() ? "READY" : "OPEN"}</span>
      <span>INVENTORY: ${state.inventory.length}</span>
    </div>
  `;
}

function getEgoSpriteSrc() {
  const loopByFacing = {
    right: 0,
    left: 1,
    down: 2,
    up: 3
  };
  const celCounts = {
    0: 8,
    1: 8,
    2: 6,
    3: 6
  };
  const loop = loopByFacing[state.facing] ?? 2;
  const frame = state.stepFrame % celCounts[loop];
  return `./assets/agi/views/vEgo/loop${loop}-cel${frame}.svg`;
}

function renderNpcSprites(room) {
  const npcs = ROOM_NPCS[room.id] || [];
  return npcs
    .map(
      (npc) => `
        <img
          class="npc-sprite npc-sprite-${npc.noun}"
          src="${npc.src}"
          alt=""
          style="left:${npc.x}%; top:${npc.y}%; width:${npc.w}px; height:${npc.h}px"
        />
      `
    )
    .join("");
}

function renderRoomScene() {
  const room = getRoom();
  return `
    <section class="screen-shell">
      <div class="scene-frame ${room.sceneClass}">
        ${renderSceneArt(room)}
        ${renderNpcSprites(room)}
        ${room.hotspots
          .map(
            (hotspot) => `
              <button
                class="scene-hotspot scene-hotspot-${hotspot.kind}"
                style="left:${hotspot.x}%; top:${hotspot.y}%; width:${hotspot.w}%; height:${hotspot.h}%"
                data-noun="${hotspot.noun}"
                aria-label="${hotspot.label}"
              >
                <span>${hotspot.label}</span>
              </button>
            `
          )
          .join("")}
        <div class="ego" style="left:${state.player.x}%; top:${state.player.y}%">
          <img class="ego-sprite" src="${getEgoSpriteSrc()}" alt="" />
        </div>
      </div>
      <div class="scene-caption">
        <strong>ROOM ${room.agiRoom}  ${room.title}</strong>
        <span>${room.subtitle}</span>
      </div>
    </section>
  `;
}

function renderNotebook() {
  const goals = [
    { label: "Get the planner", done: hasItem("planner") },
    { label: "Resolve the risky invite", done: hasFlag("invite.resolved") },
    { label: "Find a goal path", done: hasFlag("path.goal") },
    { label: "Find a relationship path", done: hasFlag("path.relationship") },
    { label: "Find a coping path", done: hasFlag("path.coping") },
    { label: "Complete the counselor plan", done: hasFlag("module1.complete") }
  ];

  return `
    <section class="notebook-shell">
      <div class="notebook-panel">
        <div class="notebook-heading">
          <strong>Field Notes</strong>
          <span class="notebook-subtitle">Module 1 objectives</span>
        </div>
        <p class="notebook-copy">
          Module 1 is based on What Works For Me, Goals, Romantic Relationships, Evaluating Relationships, Risk Taking, and Mental Health Awareness.
        </p>
        <ul class="goal-list">
          ${goals
            .map(
              (goal) => `
                <li class="${goal.done ? "is-done" : ""}">
                  <span class="check">${goal.done ? "x" : " "}</span>
                  <span>${goal.label}</span>
                </li>
              `
            )
            .join("")}
        </ul>
      </div>
      <div class="notebook-panel">
        <div class="notebook-heading">
          <strong>Status Board</strong>
          <span class="notebook-subtitle">Student profile</span>
        </div>
        <div class="stats-grid">
          ${Object.entries(state.stats)
            .map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, " $1");
              return `
                <div class="stat-card">
                  <div class="stat-head">
                    <span>${label.charAt(0).toUpperCase()}${label.slice(1)}</span>
                    <span class="mono">${value}/10</span>
                  </div>
                  <div class="stat-meter"><span style="width:${value * 10}%"></span></div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderCaseFile() {
  const goals = [
    { label: "Pick up a real plan", done: hasItem("planner") },
    { label: "Refuse the risky invite", done: hasFlag("invite.resolved") },
    { label: "Lock in one real goal", done: hasFlag("path.goal") },
    { label: "Practice a healthy boundary", done: hasFlag("path.relationship") },
    { label: "Find one support strategy", done: hasFlag("path.coping") },
    { label: "Finish the plan in back room", done: hasFlag("module1.complete") }
  ];

  return `
    <section class="case-file">
      <div class="case-panel">
        <div class="notebook-heading">
          <strong>Case File</strong>
          <span class="notebook-subtitle">Personal choices</span>
        </div>
        <ul class="goal-list">
          ${goals
            .map(
              (goal) => `
                <li class="${goal.done ? "is-done" : ""}">
                  <span class="check">${goal.done ? "x" : " "}</span>
                  <span>${goal.label}</span>
                </li>
              `
            )
            .join("")}
        </ul>
      </div>
      <div class="case-panel">
        <div class="notebook-heading">
          <strong>Status</strong>
          <span class="notebook-subtitle">Current profile</span>
        </div>
        <div class="stats-grid">
          ${Object.entries(state.stats)
            .map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, " $1");
              return `
                <div class="stat-card">
                  <div class="stat-head">
                    <span>${label.charAt(0).toUpperCase()}${label.slice(1)}</span>
                    <span class="mono">${value}/10</span>
                  </div>
                  <div class="stat-meter"><span style="width:${value * 10}%"></span></div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderParser() {
  const room = getRoom();
  const words = Array.from(new Set([
    ...room.hotspots.map((hotspot) => hotspot.noun),
    ...room.exits.map((exit) => exit.noun),
    "look",
    "talk",
    "take",
    "use",
    "go",
    "inventory"
  ]));

  return `
    <section class="parser-shell">
      <div class="message-pane">
        <div class="message-title mono">MESSAGE WINDOW</div>
        <div class="message-current">${state.transcript[0]}</div>
        <div class="message-history">
          ${state.transcript
            .slice(1, 4)
            .map((line, index) => `<div>${index === 0 ? "<strong>LAST:</strong> " : ""}${line}</div>`)
            .join("")}
        </div>
      </div>
      <form class="command-form" data-command-form>
        <label class="command-label mono" for="command-input">&gt;</label>
        <input
          id="command-input"
          name="command"
          class="command-input"
          autocomplete="off"
          spellcheck="false"
          value="${escapeHtml(state.commandBuffer)}"
          placeholder="LOOK PHONE, TALK MAYA, TAKE PLANNER, GO LOUNGE"
        />
        <button class="command-submit" type="submit">ENTER</button>
      </form>
      <div class="command-help">
        <div class="help-title">ROOM WORDS / QUICK INSERT</div>
        <div class="word-bar">
          ${words
            .map((word) => `<button type="button" class="word-chip" data-word="${word}">${word.toUpperCase()}</button>`)
            .join("")}
        </div>
      </div>
      <div class="inventory-strip">
        <div class="mono inventory-title">INVENTORY</div>
        <div class="inventory-items">
          ${state.inventory.length
            ? state.inventory
                .map(
                  (itemId) => `
                    <button type="button" class="inventory-chip" data-item="${itemId}">
                      ${OBJECT_TABLE[itemId].statusName.toUpperCase()}
                    </button>
                  `
                )
                .join("")
            : `<span class="inventory-empty">NO ITEMS</span>`}
        </div>
      </div>
    </section>
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bindEvents(root) {
  const form = root.querySelector("[data-command-form]");
  const input = root.querySelector("#command-input");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const command = input.value.trim();
    if (!command) {
      pushTranscript("Type a command.");
      persistState();
      render();
      return;
    }
    runCommand(command);
    state.commandBuffer = "";
    persistState();
    render();
  });

  input.addEventListener("input", (event) => {
    state.commandBuffer = event.target.value;
  });

  root.querySelectorAll("[data-word]").forEach((button) => {
    button.addEventListener("click", () => {
      const word = button.dataset.word;
      state.commandBuffer = state.commandBuffer ? `${state.commandBuffer} ${word}` : word;
      persistState();
      render();
      const nextInput = document.querySelector("#command-input");
      if (nextInput) {
        nextInput.focus();
      }
    });
  });

  root.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const itemId = button.dataset.item;
      const name = OBJECT_TABLE[itemId].aliases[0];
      state.commandBuffer = state.commandBuffer ? `${state.commandBuffer} ${name}` : `look ${name}`;
      persistState();
      render();
      const nextInput = document.querySelector("#command-input");
      if (nextInput) {
        nextInput.focus();
      }
    });
  });

  root.querySelectorAll("[data-noun]").forEach((button) => {
    button.addEventListener("click", () => {
      const noun = button.dataset.noun;
      state.commandBuffer = state.commandBuffer ? `${state.commandBuffer} ${noun}` : `look ${noun}`;
      persistState();
      render();
      const nextInput = document.querySelector("#command-input");
      if (nextInput) {
        nextInput.focus();
      }
    });
  });

  const resetButton = root.querySelector("[data-reset]");
  resetButton.addEventListener("click", resetGame);
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="game-shell">
      <header class="status-line">
        ${renderStatusLine()}
      </header>
      <main class="game-layout">
        <section class="play-column">
          ${renderRoomScene()}
          ${renderParser()}
          ${renderCaseFile()}
          <section class="meta-panel">
            <div class="meta-copy">
              <strong>Known words</strong>
              <p>LOOK, TALK, TAKE, USE, GO, INVENTORY. Short commands feel best, but rough phrasing still works.</p>
            </div>
            <button class="reset-button" type="button" data-reset>RESET GAME</button>
          </section>
        </section>
      </main>
    </div>
  `;

  bindEvents(app);
}

window.addEventListener("keydown", handleArrowMovement);
render();
