/* AB30 practice bank — T09 reviewed-item registry.
 *
 * The bank declares which practice modes are genuinely offered. Scored modes
 * require reviewed keys/feedback/models; modes without them are visibly NOT
 * offered with an explicit reason (PRACT12) — the engine never fabricates
 * historical facts, testimony, answer keys, or feedback (CONTENT06).
 *
 * Shipped offered modes derive ONLY from reviewed course data:
 * - matching: term<->meaning pairs from DATA.coreVocabulary (stable vocab
 *   ids as option keys; meanings as feedback text; lesson links from the
 *   entry's own lessonId/unitId). No new facts.
 * - concept-cards: unscored term<->meaning reveals. No submissions, scores,
 *   or grades (PRACT10).
 *
 * R08: the registry below holds the reviewed Lesson 7 specimen items (6
 * objective multipleChoice + 2 written), pinned by stable id, option ids,
 * source ids, and content version. Objective items run in-lesson through
 * the supported-selection control and in the selected-response catalogue.
 * Written items run in-lesson
 * through the first-save/criteria/revision lifecycle with criteria (not
 * auto-grading); written-comparison stays not-offered until reviewed
 * model responses exist.
 */
(function (global) {
  'use strict';

  var BANK_VERSION = 'ab30-practice-bank-v1';

  var MODES = [
    {
      id: 'matching',
      title: 'Term and meaning matching',
      offered: true,
      scored: true,
      description: 'Match each term to its meaning. Answer keys and feedback come only from the reviewed vocabulary bank.'
    },
    {
      id: 'concept-cards',
      title: 'Concept cards',
      offered: true,
      scored: false,
      description: 'Flip term and meaning cards for review. Cards never submit, score, or grade anything.'
    },
    {
      id: 'selected-response',
      title: 'Selected-response source reasoning',
      offered: true,
      scored: true,
      description: 'Five reviewed questions per run, with feedback and a link back to the lesson. First answers and later revisions stay separate.'
    },
    {
      id: 'written-comparison',
      title: 'Written response with model comparison',
      offered: false,
      scored: false,
      reason: 'Not offered yet: no reviewed model responses have been recorded.'
    },
    {
      id: 'sequence',
      title: 'Sequence with explanation',
      offered: false,
      scored: true,
      reason: 'Not offered yet: no reviewed sequences have been recorded.'
    },
    {
      id: 'fill-in',
      title: 'Fill in the term',
      offered: false,
      scored: true,
      reason: 'Not offered yet: no reviewed accepted answers have been recorded.'
    },
    {
      id: 'mixed-review',
      title: 'Mixed review',
      offered: false,
      scored: true,
      reason: 'Not offered yet: mixed review needs two or more offered scored modes.'
    }
  ];

  // R08 reviewed specimen items: Lesson 7, teaching/specimens/
  // lesson07-practice-specimen.json. Objective items carry a reviewed key
  // plus per-option feedback; written items carry criteria and are never
  // auto-graded. formalMarks null + compulsory false: formative only.
  var ITEMS = [
    {
      id: 'ab30-v2-l7-concept-1',
      contentVersion: '1',
      lessonId: 't1-l07-numbered-treaties',
      mode: 'multipleChoice',
      skillTag: 'source-kind',
      sourceIds: ['L7-A'],
      stimulusId: 'l7-concept-1',
      familyId: 'l7-source-kind',
      prompt: 'How should Source A be introduced?',
      options: [
        { id: 'a', text: 'As a verbatim statement by a named treaty negotiator' },
        { id: 'b', text: 'As the textbook authors\u2019 summary of differing understandings' },
        { id: 'c', text: 'As the learner\u2019s own eyewitness account' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The extract is textbook narration, not a named negotiator\u2019s direct speech.',
        b: 'The card identifies the textbook summary; that is the appropriate attribution.',
        c: 'The learner did not witness the events; the source is a published textbook summary.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l7-concept-2',
      contentVersion: '1',
      lessonId: 't1-l07-numbered-treaties',
      mode: 'multipleChoice',
      skillTag: 'purpose-understanding',
      sourceIds: ['L7-A'],
      stimulusId: 'l7-concept-2',
      familyId: 'l7-purpose-understanding',
      prompt: 'Which question asks about an understanding rather than a purpose?',
      options: [
        { id: 'a', text: 'What did the participant hope to obtain?' },
        { id: 'b', text: 'What resource did the participant need access to?' },
        { id: 'c', text: 'What did the participant believe the agreement established?' }
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'This asks about a goal or purpose.',
        b: 'This asks what was sought, rather than the meaning assigned to the agreement.',
        c: 'This asks what the agreement was believed to establish, which is the distinction taught.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l7-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l07-numbered-treaties',
      mode: 'multipleChoice',
      skillTag: 'evidence-selection',
      sourceIds: ['L7-B'],
      stimulusId: 'l7-evidence-1',
      familyId: 'l7-evidence-selection',
      prompt: 'Which detail indicates that Ahnassay is recounting an account rather than claiming eyewitness observation?',
      options: [
        { id: 'a', text: 'I\u2019ve heard' },
        { id: 'b', text: 'traditional lands' },
        { id: 'c', text: 'for years to come' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'The phrase identifies that he has heard the account.',
        b: 'This identifies the subject of concern, not how he knows the account.',
        c: 'This identifies a future-oriented concern, not his relationship to the event.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l7-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l07-numbered-treaties',
      mode: 'multipleChoice',
      skillTag: 'evidence-selection',
      sourceIds: ['L7-B'],
      stimulusId: 'l7-evidence-2',
      familyId: 'l7-evidence-selection',
      prompt: 'Which statement is supported by the passage?',
      options: [
        { id: 'a', text: 'Ahnassay witnessed every numbered-treaty negotiation.' },
        { id: 'b', text: 'The account identifies future protection of traditional lands as a concern for Chief Chateh.' },
        { id: 'c', text: 'Every First Nation understood every treaty in exactly the same way.' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'He says \u201CI\u2019ve heard\u201D; the passage is not presented as that eyewitness claim.',
        b: 'The passage explicitly describes a concern about protecting traditional lands into the future.',
        c: 'A particular account does not establish a universal understanding.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l7-application-1',
      contentVersion: '1',
      lessonId: 't1-l07-numbered-treaties',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L7-A', 'L7-B'],
      stimulusId: 'l7-application-1',
      familyId: 'l7-scope-of-inference',
      prompt: 'A student writes, \u201CThese extracts establish the understanding of every person who signed every treaty.\u201D What needs repair?',
      options: [
        { id: 'a', text: 'Only the spelling of the word treaty' },
        { id: 'b', text: 'The response needs more dramatic language' },
        { id: 'c', text: 'The scope of the conclusion exceeds the accounts supplied' }
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'The issue is the unsupported universal claim, not spelling.',
        b: 'Stronger language would not provide the missing evidence.',
        c: 'The extracts support a bounded source comparison, not every participant\u2019s understanding.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l7-application-2',
      contentVersion: '1',
      lessonId: 't1-l07-numbered-treaties',
      mode: 'multipleChoice',
      skillTag: 'attribution',
      sourceIds: ['L7-N'],
      stimulusId: 'l7-application-2',
      familyId: 'l7-attribution',
      prompt: 'A student introduces Source N as \u201CAhnassay said\u2026\u201D. Which repair is supported by the source layout?',
      options: [
        { id: 'a', text: 'Introduce it as the textbook narrator\u2019s question' },
        { id: 'b', text: 'Remove all source attribution' },
        { id: 'c', text: 'Describe it as a transcript from the treaty signing' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'It lies outside his quotation and belongs to the narrator\u2019s framing.',
        b: 'Removing attribution makes the source relationship less accurate, not more.',
        c: 'The textbook does not present this sentence as a transcript from the signing.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l7-independent-1',
      contentVersion: '1',
      lessonId: 't1-l07-numbered-treaties',
      mode: 'written',
      sourceIds: ['L7-C'],
      familyId: 'l7-translation-transfer',
      prompt: 'Using Source C, explain why interpretation involved more than replacing words from one language with words from another. Use a specific detail and identify one conclusion about individual interpreters that the passage alone does not establish.',
      criteria: [
        'Distinguishes words from larger implications/cultural context',
        'Uses a relevant detail and explains how it supports the response',
        'Does not turn the difficulty described into proof of every interpreter\u2019s intention or conduct'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l7-independent-2',
      contentVersion: '1',
      lessonId: 't1-l07-numbered-treaties',
      mode: 'written',
      sourceIds: ['L7-D'],
      familyId: 'l7-written-oral-transfer',
      prompt: 'Using Source D, distinguish what the textbook reports was promised from what it reports was recorded in writing. Explain why that distinction matters when comparing accounts, without claiming the passage is a verbatim treaty transcript.',
      criteria: [
        'Identifies the reported promise',
        'Identifies its reported absence from the written treaty',
        'Explains the importance of distinguishing promise/account/written record without adding unsupported claims'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      "id": "ab30-v2-l01-concept-1",
      "contentVersion": "2",
      "lessonId": "t1-l01-oral-tradition",
      "mode": "multipleChoice",
      "skillTag": "source-kind",
      "sourceIds": [
        "L01-C"
      ],
      "stimulusId": "l01-concept-1",
      "familyId": "l01-source-kind",
      "prompt": "How should the Dan George passage be introduced?",
      "options": [
        {
          "id": "a",
          "text": "As the textbook authors’ own sentence"
        },
        {
          "id": "b",
          "text": "As a 1974 quotation from Chief Dan George in the course reading"
        },
        {
          "id": "c",
          "text": "As an anonymous proverb of unknown date"
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The page presents it as a quotation from a named speaker, not the authors’ own sentence.",
        "b": "The card names the speaker, the year, and the reading — that is the appropriate attribution.",
        "c": "Both the speaker and the year are given on the page; nothing about it is anonymous."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l01-concept-2",
      "contentVersion": "2",
      "lessonId": "t1-l01-oral-tradition",
      "mode": "multipleChoice",
      "skillTag": "content-purpose",
      "sourceIds": [
        "L01-D"
      ],
      "stimulusId": "l01-concept-2",
      "familyId": "l01-content-purpose",
      "prompt": "Which question asks about a telling’s purpose rather than its content?",
      "options": [
        {
          "id": "a",
          "text": "Which creatures appear in the story?"
        },
        {
          "id": "b",
          "text": "What happens first in the story?"
        },
        {
          "id": "c",
          "text": "What does the telling teach listeners to do?"
        }
      ],
      "correctOptionId": "c",
      "feedbackByOption": {
        "a": "This asks what the story contains, not what it is for.",
        "b": "This asks about the order of events, not the telling’s purpose.",
        "c": "This asks what the telling teaches — the purpose the passage on stories guiding how people live describes."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l01-evidence-1",
      "contentVersion": "2",
      "lessonId": "t1-l01-oral-tradition",
      "mode": "multipleChoice",
      "skillTag": "detail-selection",
      "sourceIds": [
        "L01-B"
      ],
      "stimulusId": "l01-evidence-1",
      "familyId": "l01-teller-identification",
      "prompt": "Which detail identifies the tellers of the Wisakejak story?",
      "options": [
        {
          "id": "a",
          "text": "“lived peacefully together”"
        },
        {
          "id": "b",
          "text": "“a creation story of the Nehiyawak, who are also known as the Cree”"
        },
        {
          "id": "c",
          "text": "“the deep blue ocean”"
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "This describes the story world’s condition, not who tells the story.",
        "b": "The frame names the Nehiyawak (Cree) as the story’s people.",
        "c": "This is a setting detail, not an identification of the tellers."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l01-evidence-2",
      "contentVersion": "2",
      "lessonId": "t1-l01-oral-tradition",
      "mode": "multipleChoice",
      "skillTag": "attribution-limit",
      "sourceIds": [
        "L01-C"
      ],
      "stimulusId": "l01-evidence-2",
      "familyId": "l01-attribution-limit",
      "prompt": "What does the Dan George page NOT establish?",
      "options": [
        {
          "id": "a",
          "text": "The year attached to the quotation"
        },
        {
          "id": "b",
          "text": "The speaker’s name"
        },
        {
          "id": "c",
          "text": "The speaker’s community"
        }
      ],
      "correctOptionId": "c",
      "feedbackByOption": {
        "a": "The page gives 1974 with the quotation.",
        "b": "The page names Chief Dan George as the speaker.",
        "c": "No community label appears beside the speaker’s name, so a careful response claims none."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l01-application-1",
      "contentVersion": "2",
      "lessonId": "t1-l01-oral-tradition",
      "mode": "multipleChoice",
      "skillTag": "scope-of-inference",
      "sourceIds": [
        "L01-E"
      ],
      "stimulusId": "l01-application-1",
      "familyId": "l01-tradition-scope",
      "prompt": "A student writes, “Every nation tells the same stories in the same way.” What needs repair?",
      "options": [
        {
          "id": "a",
          "text": "Only the punctuation of the sentence"
        },
        {
          "id": "b",
          "text": "The sentence needs longer words"
        },
        {
          "id": "c",
          "text": "Each nation has its own distinct oral tradition; versions vary"
        }
      ],
      "correctOptionId": "c",
      "feedbackByOption": {
        "a": "The issue is the false universal claim, not punctuation.",
        "b": "Longer words would not fix the unsupported generalization.",
        "c": "the reading on four purposes of storytelling states that each nation has its own distinct tradition, and the reading notes many versions."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l01-purpose-1",
      "contentVersion": "2",
      "lessonId": "t1-l01-oral-tradition",
      "mode": "multipleChoice",
      "skillTag": "purpose-identification",
      "sourceIds": [
        "L01-D"
      ],
      "stimulusId": "l01-purpose-1",
      "familyId": "l01-purpose-identification",
      "prompt": "Which interpretation is supported by the reading’s explanation of storytelling?",
      "options": [
        {
          "id": "a",
          "text": "The stories are only entertainment from long ago."
        },
        {
          "id": "b",
          "text": "The stories instruct behaviour and guide how to live."
        },
        {
          "id": "c",
          "text": "The stories replace every other kind of evidence."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The reading says stories instruct and guide. They may be engaging to hear, but entertainment alone does not explain their teaching role.",
        "b": "Yes. “Instruct and educate” and “guides for how to live” both describe a teaching role.",
        "c": "The passage explains what stories can teach. It does not say that they replace every other way of learning."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l01-independent-1",
      "contentVersion": "2",
      "lessonId": "t1-l01-oral-tradition",
      "mode": "written",
      "sourceIds": [
        "L01-E"
      ],
      "familyId": "l01-component-purpose",
      "prompt": "Choose one of the four purposes in “Why stories are passed on.” Use a detail from the Nehiyawak telling to explain how that purpose could help listeners or the community. Name the reading and page you used, then add one sentence you could use in your notes for Assignment 1.1.",
      "criteria": "Name one purpose accurately. Connect it to a specific story detail and explain the connection rather than simply listing both. Include the reading and page and a useful Assignment 1.1 note. Your example should remain clearly identified as one telling; it does not have to explain every oral tradition.",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l01-independent-2",
      "contentVersion": "2",
      "lessonId": "t1-l01-oral-tradition",
      "mode": "written",
      "sourceIds": [
        "L01-F"
      ],
      "familyId": "l01-evidence-boundary",
      "prompt": "Choose one of the four purposes in “Why stories are passed on.” Use a detail from the Nehiyawak telling to explain how that purpose could help listeners or the community. Name the reading and page you used, then add one sentence you could use in your notes for Assignment 1.1.",
      "criteria": "Name one purpose accurately. Connect it to a specific story detail and explain the connection rather than simply listing both. Include the reading and page and a useful Assignment 1.1 note. Your example should remain clearly identified as one telling; it does not have to explain every oral tradition.",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l02-concept-1",
      "contentVersion": "2",
      "lessonId": "t1-l02-nations-peoples",
      "mode": "multipleChoice",
      "skillTag": "source-kind",
      "sourceIds": [
        "L02-A"
      ],
      "stimulusId": "l02-concept-1",
      "familyId": "l02-declaration-kind",
      "prompt": "How should the Declaration’s opening sentence be introduced?",
      "options": [
        {
          "id": "a",
          "text": "As a census table of the Northwest Territories"
        },
        {
          "id": "b",
          "text": "As a 1975 political assertion by its Dene authors"
        },
        {
          "id": "c",
          "text": "As a court ruling on Aboriginal rights"
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The passage asserts a right; it reports no population count.",
        "b": "The card identifies the 1975 Declaration and its authors — that is the appropriate attribution.",
        "c": "No court speaks here; the speaker is the Dene through their 1975 Declaration."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l02-concept-2",
      "contentVersion": "2",
      "lessonId": "t1-l02-nations-peoples",
      "mode": "multipleChoice",
      "skillTag": "dated-reading",
      "sourceIds": [
        "L02-C"
      ],
      "stimulusId": "l02-concept-2",
      "familyId": "l02-dated-reading",
      "prompt": "What does the Declaration’s 1975 population statement establish?",
      "options": [
        {
          "id": "a",
          "text": "Today’s Northwest Territories demographics"
        },
        {
          "id": "b",
          "text": "The Declaration’s 1975 population claim about the N.W.T."
        },
        {
          "id": "c",
          "text": "The Dene Nation’s citizenship rules"
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "A 1975 sentence cannot report today’s territory; populations change.",
        "b": "The passage states the majority claim as it stood when adopted in 1975.",
        "c": "The passage says nothing about citizenship rules."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l02-evidence-1",
      "contentVersion": "2",
      "lessonId": "t1-l02-nations-peoples",
      "mode": "multipleChoice",
      "skillTag": "word-support",
      "sourceIds": [
        "L02-A"
      ],
      "stimulusId": "l02-evidence-1",
      "familyId": "l02-word-support",
      "prompt": "Which words show the claim is about regard and recognition?",
      "options": [
        {
          "id": "a",
          "text": "“by ourselves and the world”"
        },
        {
          "id": "b",
          "text": "“July 19, 1975”"
        },
        {
          "id": "c",
          "text": "“Fort Simpson”"
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "The double audience names whose regard is claimed — self and world.",
        "b": "This dates the assertion; it does not carry the recognition claim.",
        "c": "This locates the adoption meeting; it does not carry the claim."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l02-evidence-2",
      "contentVersion": "2",
      "lessonId": "t1-l02-nations-peoples",
      "mode": "multipleChoice",
      "skillTag": "distinction",
      "sourceIds": [
        "L02-F"
      ],
      "stimulusId": "l02-evidence-2",
      "familyId": "l02-people-distinction",
      "prompt": "In the textbook’s rights language, what is “a people”?",
      "options": [
        {
          "id": "a",
          "text": "The plural of person — a crowd of individuals"
        },
        {
          "id": "b",
          "text": "The group as a whole, with rights international law recognizes"
        },
        {
          "id": "c",
          "text": "One elected representative of a group"
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "the textbook explanation of a people explicitly denies this reading: not the plural of person.",
        "b": "The passage defines the special meaning and adds the international-law rights.",
        "c": "The passage discusses no representative; it defines the group itself."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l02-application-1",
      "contentVersion": "2",
      "lessonId": "t1-l02-nations-peoples",
      "mode": "multipleChoice",
      "skillTag": "definition-misfit",
      "sourceIds": [
        "L02-E"
      ],
      "stimulusId": "l02-application-1",
      "familyId": "l02-definition-misfit",
      "prompt": "A student writes, “The territory-plus-government definition covers every Aboriginal people.” What needs repair?",
      "options": [
        {
          "id": "a",
          "text": "Nothing — the definition fits every case"
        },
        {
          "id": "b",
          "text": "The textbook warns neither definition easily includes all cases, and gives the western Métis as a misfit"
        },
        {
          "id": "c",
          "text": "The definition needs a longer name"
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The textbook explicitly refuses this universal fit.",
        "b": "Page 4 states the caution and shows shared identity without common territory among the western Métis.",
        "c": "The issue is the unsupported universal claim, not the name."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l02-match-1",
      "contentVersion": "2",
      "lessonId": "t1-l02-nations-peoples",
      "mode": "multipleChoice",
      "skillTag": "claim-matching",
      "sourceIds": [
        "L02-D1"
      ],
      "stimulusId": "l02-match-1",
      "familyId": "l02-claim-matching",
      "prompt": "Which line states that the Dene seek recognition as a Nation?",
      "options": [
        {
          "id": "a",
          "text": "“Ancient civilizations and ways of life have been destroyed.”"
        },
        {
          "id": "b",
          "text": "“What we the Dene are struggling for is the recognition of the Dene Nation.”"
        },
        {
          "id": "c",
          "text": "“A majority of the population of the N.W.T.”"
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "This explains the harm described by the Declaration. Look for the line that states what the authors are seeking in response.",
        "b": "Yes. This line states the goal directly: recognition of the Dene Nation.",
        "c": "This describes the population in the Declaration’s time. It does not state the demand for recognition."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l02-independent-1",
      "contentVersion": "2",
      "lessonId": "t1-l02-nations-peoples",
      "mode": "written",
      "sourceIds": [
        "L02-D2"
      ],
      "familyId": "l02-settlement-assertion",
      "prompt": "Use the passage “What a just land settlement means” to explain one aim of the Declaration and name the people it concerns. Then identify one question about the present that this 1975 passage cannot answer.",
      "criteria": "Explain independence and self-determination within Canada, and identify the Dene Nation. Name a present-day question that needs further evidence, such as current population figures, the status of negotiations, or the result of a particular settlement. Support your explanation with the passage; you are not being assessed on whether you agree with its position.",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l02-independent-2",
      "contentVersion": "2",
      "lessonId": "t1-l02-nations-peoples",
      "mode": "written",
      "sourceIds": [
        "L02-C"
      ],
      "familyId": "l02-population-transfer",
      "prompt": "Use the passage “What a just land settlement means” to explain one aim of the Declaration and name the people it concerns. Then identify one question about the present that this 1975 passage cannot answer.",
      "criteria": "Explain independence and self-determination within Canada, and identify the Dene Nation. Name a present-day question that needs further evidence, such as current population figures, the status of negotiations, or the result of a particular settlement. Support your explanation with the passage; you are not being assessed on whether you agree with its position.",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      id: 'ab30-v2-l03-concept-1',
      contentVersion: '1',
      lessonId: 't1-l03-rights-distinctions',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L03-A'],
      stimulusId: 'l03-concept-1',
      familyId: 'l03-human-rights',
      prompt: 'According to Source A, what are human rights?',
      options: [
        { id: 'a', text: 'Rights granted by a constitution' },
        { id: 'b', text: 'Rights held simply by being human, above constitutions and governments' },
        { id: 'c', text: 'Rights to land held by one nation only' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source A places human rights above constitutions, not inside them.',
        b: 'The passage states both the holder and the rank directly.',
        c: 'The passage discusses no particular nation or territory.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l03-concept-2',
      contentVersion: '1',
      lessonId: 't1-l03-rights-distinctions',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L03-E'],
      stimulusId: 'l03-concept-2',
      familyId: 'l03-inherent-meaning',
      prompt: 'According to Source E, what makes a right inherent?',
      options: [
        { id: 'a', text: 'A government grants it as a benefit' },
        { id: 'b', text: 'It cannot be taken, transferred, or surrendered — only recognized, never given' },
        { id: 'c', text: 'A court creates it during a trial' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source E denies this: inherent rights cannot be given.',
        b: 'The passage states the full definition in two sentences.',
        c: 'Courts define particular rights case by case; they do not create inherent rights.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l03-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l03-rights-distinctions',
      mode: 'multipleChoice',
      skillTag: 'distinction',
      sourceIds: ['L03-B', 'L03-C'],
      stimulusId: 'l03-evidence-1',
      familyId: 'l03-group-holding',
      prompt: 'Which detail shows Aboriginal rights being held by a group?',
      options: [
        { id: 'a', text: '“because of their position as indigenous peoples” with ancestors and the unborn included' },
        { id: 'b', text: '“December 10, 1948”' },
        { id: 'c', text: '“Battle of Seven Oaks”' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Sources B and C together tie group-holding to Indigenous position across generations.',
        b: 'This dates the Universal Declaration; it shows no group-holding.',
        c: 'This names the Métis nationalism event; it shows no group-holding.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l03-application-1',
      contentVersion: '1',
      lessonId: 't1-l03-rights-distinctions',
      mode: 'multipleChoice',
      skillTag: 'confusion-repair',
      sourceIds: ['L03-S'],
      stimulusId: 'l03-application-1',
      familyId: 'l03-sovereignty-repair',
      prompt: 'A student writes, “Demanding sovereignty means wanting to separate from Canada.” Which repair fits Source S?',
      options: [
        { id: 'a', text: 'Agree — separation is what the passage demands' },
        { id: 'b', text: 'Most leaders do not seek separation but an end to imposed rules and interference' },
        { id: 'c', text: 'Remove the word sovereignty from the course' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source S reports the opposite of separation.',
        b: 'The passage states what most leaders seek instead: non-interference.',
        c: 'Dropping the term would discard the distinction the lesson teaches.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l03-application-2',
      contentVersion: '1',
      lessonId: 't1-l03-rights-distinctions',
      mode: 'multipleChoice',
      skillTag: 'term-relation',
      sourceIds: ['L03-F', 'L03-G'],
      stimulusId: 'l03-application-2',
      familyId: 'l03-determination-government',
      prompt: 'How do self-determination and self-government relate in Sources F and G?',
      options: [
        { id: 'a', text: 'They are interchangeable names for one idea' },
        { id: 'b', text: 'Determination is the nation’s future and goal; government is community internal decisions, its most common means' },
        { id: 'c', text: 'Government outranks determination and replaces it' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The passages define different holders and different scopes.',
        b: 'Source F states the goal; Source G states the means the passage names.',
        c: 'The textbook calls government the means, not the replacement.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l03-inherent-1',
      contentVersion: '1',
      lessonId: 't1-l03-rights-distinctions',
      mode: 'multipleChoice',
      skillTag: 'explanation-fit',
      sourceIds: ['L03-E'],
      stimulusId: 'l03-inherent-1',
      familyId: 'l03-explanation-fit',
      prompt: 'Which explanation fits the textbook’s account of inherent rights?',
      options: [
        { id: 'a', text: 'They are benefits a government gives and can take back.' },
        { id: 'b', text: 'They cannot be given, only recognized — and cannot be taken, transferred, or surrendered.' },
        { id: 'c', text: 'They apply only inside courtrooms during trials.' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source E says the opposite: a government cannot give inherent rights, so it cannot take them back either.',
        b: 'The passage states both halves — recognized, not given; and never taken, transferred, or surrendered.',
        c: 'Courts define particular rights case by case, but inherent rights are not confined to trials.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l03-independent-1',
      contentVersion: '1',
      lessonId: 't1-l03-rights-distinctions',
      mode: 'written',
      sourceIds: ['L03-D'],
      familyId: 'l03-winter-application',
      prompt: 'Using Source D, explain which collective-rights ideas the hoarding example illustrates. Apply the terms collective rights and individual rights to the winter choice and the spring outcome.',
      criteria: [
        'Applies individual rights to the winter choice (pursuing self-interest by hoarding)',
        'Applies collective rights to the spring outcome (survival depending on group support)',
        'States the textbook’s one-and-the-same conclusion without treating the example as a real winter'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l03-independent-2',
      contentVersion: '1',
      lessonId: 't1-l03-rights-distinctions',
      mode: 'written',
      sourceIds: ['L03-S'],
      familyId: 'l03-sovereignty-transfer',
      prompt: 'Using Source S, distinguish what the passage reports most leaders want from what it reports they are misunderstood as wanting. Explain why that distinction matters for reading sovereignty claims.',
      criteria: [
        'States what most leaders want (an end to imposed rules and interference)',
        'States the misunderstanding the passage corrects (seeking separation)',
        'Explains why the distinction matters without adding unsupported claims'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l04-concept-1',
      contentVersion: '1',
      lessonId: 't1-l04-worldview',
      mode: 'multipleChoice',
      skillTag: 'source-kind',
      sourceIds: ['L04-A'],
      stimulusId: 'l04-concept-1',
      familyId: 'l04-framing-caution',
      prompt: 'How should Source A be used in this lesson?',
      options: [
        { id: 'a', text: 'As proof that all worldviews are identical' },
        { id: 'b', text: 'As the boundary: general features exist, but each group expresses them in its own way' },
        { id: 'c', text: 'As a population count of First Nations' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source A states the opposite: there is no single First Nations worldview.',
        b: 'The passage permits general features while requiring group-specific expression.',
        c: 'The passage counts no population; it cautions about generalizing.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l04-concept-2',
      contentVersion: '1',
      lessonId: 't1-l04-worldview',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L04-B'],
      stimulusId: 'l04-concept-2',
      familyId: 'l04-holistic-meaning',
      prompt: 'According to Source B, what does holistic mean?',
      options: [
        { id: 'a', text: 'Focused on the whole of creation rather than individual parts' },
        { id: 'b', text: 'Placing humans above every other part of creation' },
        { id: 'c', text: 'Owning land in the European sense' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'The passage defines holistic as whole-of-creation attention, humans included as one part.',
        b: 'Source B denies this: people are no more important than any other part.',
        c: 'The passage discusses no ownership; individual land ownership is called alien on the same pages.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l04-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l04-worldview',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L04-C'],
      stimulusId: 'l04-evidence-1',
      familyId: 'l04-interdependence-detail',
      prompt: 'Which detail shows interdependence in Source C?',
      options: [
        { id: 'a', text: '“Each person depends on others and in turn is depended upon”' },
        { id: 'b', text: '“decisions made through voting”' },
        { id: 'c', text: '“the sixteenth century”' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'The sentence states mutual dependence directly, with the stronger whole as its result.',
        b: 'Source C discusses no voting; consensus appears in a different passage.',
        c: 'This dates the worldview discussion; it shows no interdependence.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l04-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l04-worldview',
      mode: 'multipleChoice',
      skillTag: 'distinction',
      sourceIds: ['L04-E'],
      stimulusId: 'l04-evidence-2',
      familyId: 'l04-noninterference-distinction',
      prompt: 'What does Source E say about nations dealing with one another?',
      options: [
        { id: 'a', text: 'Nations should remain isolated with no contact' },
        { id: 'b', text: 'Traditional non-interference, with the same respect expected in return' },
        { id: 'c', text: 'Stronger nations should absorb weaker ones' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The passage describes respectful relations and treaties, not isolation.',
        b: 'The passage states the practice and its reciprocal expectation directly.',
        c: 'Nothing in the passage supports absorption; it supports mutual respect.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l04-application-1',
      contentVersion: '1',
      lessonId: 't1-l04-worldview',
      mode: 'multipleChoice',
      skillTag: 'autonomy-balance',
      sourceIds: ['L04-D'],
      stimulusId: 'l04-application-1',
      familyId: 'l04-autonomy-balance',
      prompt: 'A student writes, “Harmony means the group erases individual choice.” What needs repair?',
      options: [
        { id: 'a', text: 'Nothing — the group always overrides the person' },
        { id: 'b', text: 'Harmony depends on balancing personal autonomy with the group’s needs' },
        { id: 'c', text: 'Harmony means leaders coerce the unwilling' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source D keeps personal autonomy in the balance; it is never erased.',
        b: 'The passage names both values and makes their balance the condition of harmony.',
        c: 'The passage says leaders are supported for wisdom, not feared for coercion.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l04-scope-1',
      contentVersion: '1',
      lessonId: 't1-l04-worldview',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L04-F'],
      stimulusId: 'l04-scope-1',
      familyId: 'l04-account-scope',
      prompt: 'Which explanation does Source F support?',
      options: [
        { id: 'a', text: 'The Pimicikamak people claim European-style ownership of their lands.' },
        { id: 'b', text: 'The Pimicikamak people describe stewardship under their own law.' },
        { id: 'c', text: 'All Indigenous peoples hold identical worldviews about land.' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source F states the reverse: the lands do not belong to the people.',
        b: 'The statement names stewardship under Cree law, grounded in a named history.',
        c: 'One nation’s statement cannot prove a universal worldview — Source A forbids exactly this move.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l04-independent-1',
      contentVersion: '1',
      lessonId: 't1-l04-worldview',
      mode: 'written',
      sourceIds: ['L04-G'],
      familyId: 'l04-dual-presence',
      prompt: 'Using Source G, explain how independence and interdependence can both be present in one account. Point to a specific detail for each, and state one thing the passage does not establish about other nations’ declarations.',
      criteria: [
        'Points to a detail showing independence (distinct people, roots, birthplace)',
        'Points to a detail showing interdependence (duty to future generations, Earth held sacred)',
        'States a scope limit without stretching this 1978 text to other declarations'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l04-independent-2',
      contentVersion: '1',
      lessonId: 't1-l04-worldview',
      mode: 'written',
      sourceIds: ['L04-F'],
      familyId: 'l04-stewardship-transfer',
      prompt: 'Using Source F, distinguish what the statement establishes about Pimicikamak law from what it does not establish about other nations. Explain why the named speaker and publication matter to that boundary.',
      criteria: [
        'States what the passage establishes (stewardship, belonging-to-land, named history)',
        'Names something it does not establish about other nations’ law',
        'Explains why the named speaker and publication set the boundary'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l05-concept-1',
      contentVersion: '1',
      lessonId: 't1-l05-early-treaties',
      mode: 'multipleChoice',
      skillTag: 'agreement-kind',
      sourceIds: ['L05-A'],
      stimulusId: 'l05-concept-1',
      familyId: 'l05-mutual-respect',
      prompt: 'According to Source A, what governed early treaties?',
      options: [
        { id: 'a', text: 'Conquest by the stronger nation' },
        { id: 'b', text: 'Mutual respect in a reciprocal relationship of giving and taking' },
        { id: 'c', text: 'Written contracts enforced by courts' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source A names respect and reciprocity, not conquest.',
        b: 'The passage states the governing principle and the reciprocal relationship directly.',
        c: 'The passage discusses no courts; wampum records came later in the lesson.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l05-concept-2',
      contentVersion: '1',
      lessonId: 't1-l05-early-treaties',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L05-D'],
      stimulusId: 'l05-concept-2',
      familyId: 'l05-two-row-recognition',
      prompt: 'What did the Two Row Wampum treaty recognize?',
      options: [
        { id: 'a', text: 'Dutch ownership of Haudenosaunee lands' },
        { id: 'b', text: 'Each nation’s right to maintain its own traditions, customs, values, and ways of living' },
        { id: 'c', text: 'A military alliance against all other nations' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The treaty recognized independence, not anyone’s ownership.',
        b: 'Source D states the recognized rights directly.',
        c: 'The treaty established peaceful co-existence, not a military alliance.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l05-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l05-early-treaties',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L05-C'],
      stimulusId: 'l05-evidence-1',
      familyId: 'l05-consensus-detail',
      prompt: 'Which detail shows the Grand Council’s decision procedure?',
      options: [
        { id: 'a', text: '“discussed all issues until consensus was achieved”' },
        { id: 'b', text: '“voted by majority on every issue”' },
        { id: 'c', text: '“the eldest leader decided alone”' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source C states the consensus rule and what it protected: no dissenting minority.',
        b: 'Source C explicitly denies voting: leaders did not vote.',
        c: 'Leaders were equal; no single decider appears in the passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l05-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l05-early-treaties',
      mode: 'multipleChoice',
      skillTag: 'symbolism-discipline',
      sourceIds: ['L05-E'],
      stimulusId: 'l05-evidence-2',
      familyId: 'l05-belt-reading',
      prompt: 'How should the Two Row belt’s symbolism be read in this course?',
      options: [
        { id: 'a', text: 'By freelancing a personal meaning for the beads' },
        { id: 'b', text: 'By the textbook’s given explanation: vessels as customs and laws, parallel paths as separate and equal' },
        { id: 'c', text: 'By ignoring the belt as decoration' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source E exists precisely so readers do not invent the symbolism.',
        b: 'The passage gives the reading — vessels, paths, separate and equal — and the lesson stays inside it.',
        c: 'The textbook treats the belt as the treaty’s record, not decoration.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l05-application-1',
      contentVersion: '1',
      lessonId: 't1-l05-early-treaties',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L05-F', 'L05-G'],
      stimulusId: 'l05-application-1',
      familyId: 'l05-agreement-scope',
      prompt: 'A student writes, “The 1844 agreement created a five-nation confederacy.” What needs repair?',
      options: [
        { id: 'a', text: 'Nothing — all three agreements created confederacies' },
        { id: 'b', text: 'The 1844 agreement was Dakota–Métis peace through kinship; the confederacy belongs to the Great Law' },
        { id: 'c', text: 'The year should be 1645' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Only the Great Law formed the confederacy; the agreements differ.',
        b: 'Sources F and G show kinship adoption settling the Dakota–Métis conflict — no confederacy involved.',
        c: 'The year is correct; the merged description is the problem.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l05-organizer-1',
      contentVersion: '1',
      lessonId: 't1-l05-early-treaties',
      mode: 'multipleChoice',
      skillTag: 'organizer-completion',
      sourceIds: ['L05-D'],
      stimulusId: 'l05-organizer-1',
      familyId: 'l05-organizer-completion',
      prompt: 'Which line belongs in the Two Row column’s recorded-commitments cell?',
      options: [
        { id: 'a', text: 'Enemies accepted as kin through adoption.' },
        { id: 'b', text: 'Non-interference, with each people keeping full independence.' },
        { id: 'c', text: 'Consensus of all leaders with no vote ever called.' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'That commitment belongs to the 1844 agreement’s column, not the Two Row’s.',
        b: 'Sources D and E together support exactly this cell: non-interference plus full independence.',
        c: 'That commitment belongs to the Great Law’s column, not the Two Row’s.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l05-independent-1',
      contentVersion: '1',
      lessonId: 't1-l05-early-treaties',
      mode: 'written',
      sourceIds: ['L05-B', 'L05-D', 'L05-F'],
      familyId: 'l05-two-agreement-synthesis',
      prompt: 'Choose any two of the three agreements. Explain one similarity and one difference between them, with each claim supported by the supplied accounts. Do not rank which people or form of government is superior.',
      criteria: [
        'States one similarity with its supporting detail',
        'States one difference with its supporting detail',
        'Keeps both claims inside the supplied sources without ranking peoples or governments'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l05-independent-2',
      contentVersion: '1',
      lessonId: 't1-l05-early-treaties',
      mode: 'written',
      sourceIds: ['L05-G'],
      familyId: 'l05-letter-transfer',
      prompt: 'Using Source G, distinguish what the father’s words establish about the Dakota response from what they do not establish about the agreement’s full terms. Explain why grief and law appear together here.',
      criteria: [
        'States what the words establish (adoption offer as alliance means, from the most offended)',
        'Names something they do not establish (e.g., the full terms; other leaders’ views)',
        'Explains the grief-and-law pairing without adding unsupported claims'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l06-concept-1',
      contentVersion: '1',
      lessonId: 't1-l06-colonization-proclamation',
      mode: 'multipleChoice',
      skillTag: 'source-kind',
      sourceIds: ['L06-A'],
      stimulusId: 'l06-concept-1',
      familyId: 'l06-worldview-bounds',
      prompt: 'What bounds Source A’s worldview claim?',
      options: [
        { id: 'a', text: 'Nothing — it states an eternal truth about all Europeans' },
        { id: 'b', text: '“Most” Europeans “in the sixteenth century”' },
        { id: 'c', text: 'It concerns only France' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source A qualifies itself twice; dropping the qualifiers invents a broader claim.',
        b: 'The passage’s own “most” and “in the sixteenth century” set its bounds.',
        c: 'The passage discusses Europeans generally, not one country.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l06-concept-2',
      contentVersion: '1',
      lessonId: 't1-l06-colonization-proclamation',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L06-B'],
      stimulusId: 'l06-concept-2',
      familyId: 'l06-colonization-types',
      prompt: 'What are the two types of colonization in Source B?',
      options: [
        { id: 'a', text: 'Political and religious colonization' },
        { id: 'b', text: 'Land and sea colonization' },
        { id: 'c', text: 'Trade and sport colonization' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source B names both: political control and conversion pursued as right and duty.',
        b: 'The passage divides by domain of control, not by element.',
        c: 'Neither term appears in the passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l06-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l06-colonization-proclamation',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L06-C'],
      stimulusId: 'l06-evidence-1',
      familyId: 'l06-mutual-benefit',
      prompt: 'Which detail shows mutual benefit in Source C?',
      options: [
        { id: 'a', text: '“Each group had something to offer the other”' },
        { id: 'b', text: '“the peak of human civilization”' },
        { id: 'c', text: '“by force, if necessary”' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'The sentence states the reciprocal benefit directly.',
        b: 'That phrase belongs to Source A’s superiority claim, not to Source C.',
        c: 'That phrase belongs to Source B’s religious colonization, not to Source C.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l06-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l06-colonization-proclamation',
      mode: 'multipleChoice',
      skillTag: 'wording-support',
      sourceIds: ['L06-D'],
      stimulusId: 'l06-evidence-2',
      familyId: 'l06-reservation-wording',
      prompt: 'Which words reserve the lands in Source D?',
      options: [
        { id: 'a', text: '“reserved to them or any of them as their Hunting Grounds”' },
        { id: 'b', text: '“Just and reasonable”' },
        { id: 'c', text: '“1982”' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'The quoted document words perform the reservation directly.',
        b: 'Those words open the preamble (Source F); they reserve nothing here.',
        c: 'That year belongs to the Charter mention, not to this passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l06-application-1',
      contentVersion: '1',
      lessonId: 't1-l06-colonization-proclamation',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L06-G'],
      stimulusId: 'l06-application-1',
      familyId: 'l06-implementation-scope',
      prompt: 'A student writes, “The Proclamation proves every promise was kept.” What needs repair?',
      options: [
        { id: 'a', text: 'Nothing — documents guarantee their own delivery' },
        { id: 'b', text: 'Existence is not implementation: paternalism and settler pressure shaped what followed' },
        { id: 'c', text: 'The Proclamation was never actually issued' }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source G exists to deny exactly this: the same document imposed paternalism.',
        b: 'The lesson’s rule: a document proves its wording, not its delivery.',
        c: 'The Proclamation was issued October 7, 1763; the issue is consequences, not existence.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l06-sort-1',
      contentVersion: '1',
      lessonId: 't1-l06-colonization-proclamation',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L06-F'],
      stimulusId: 'l06-sort-1',
      familyId: 'l06-quotation-sort',
      prompt: 'Which response is a quotation from Source F?',
      options: [
        { id: 'a', text: '“Reserved to them or any of them as their Hunting Grounds.”' },
        { id: 'b', text: 'The preamble sets aside unceded lands for First Nations use.' },
        { id: 'c', text: 'This proves Britain always protected First Nations perfectly.' }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'These are the document’s own quoted words, in original spelling.',
        b: 'That is an accurate paraphrase — a restatement, not a quotation.',
        c: 'That is an unsupported generalization: it claims perfect protection the wording never states.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l06-independent-1',
      contentVersion: '1',
      lessonId: 't1-l06-colonization-proclamation',
      mode: 'written',
      sourceIds: ['L06-H'],
      familyId: 'l06-document-relationship',
      prompt: 'Using Source H, explain one source-supported connection between the British North America Act and the relationship it discusses. State what the document did and what it means today, in the textbook’s terms.',
      criteria: [
        'States what the act did (created Canada in 1867; transferred the relationship to Ottawa)',
        'States what it means today (sovereign-to-sovereign negotiation of self-government and land claims)',
        'Keeps both claims in the textbook’s terms without adding later constitutional history'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l06-independent-2',
      contentVersion: '1',
      lessonId: 't1-l06-colonization-proclamation',
      mode: 'written',
      sourceIds: ['L06-E'],
      familyId: 'l06-frauds-transfer',
      prompt: 'Using Source E, distinguish what the private-purchase ban establishes from what it does not establish. Explain what the stated reason (frauds and abuses) does and does not prove about First Nations consent to the Crown’s intermediary role.',
      criteria: [
        'States what the ban establishes (Crown-only negotiation; the stated fraud reason)',
        'Names something it does not establish (e.g., that fraud ended; consent to the intermediary role)',
        'Explains the reason/consent distinction without adding unsupported claims'
      ],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l08-concept-1',
      contentVersion: '1',
      lessonId: 't1-l08-treaty-promises-alberta',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L08-A'],
      stimulusId: 'l08-concept-1',
      familyId: 'l08-promise-record-gap',
      prompt: 'What makes Source A a spoken promise rather than a written term?',
      options: [
        {
          id: 'a',
          text: 'It reports Archibald’s speech and then states its absence from the page'
        },
        {
          id: 'b',
          text: 'It quotes the treaty’s reserve sizes'
        },
        {
          id: 'c',
          text: 'It lists the annuity payments'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source A does both jobs: the speech (“hunt, fish, and trap throughout traditional territories”) and the record gap (“not included”).',
        b: 'Reserve sizes appear in the surrounding narration, not in this extract.',
        c: 'Annuities appear in the surrounding narration, not in this extract.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l08-concept-2',
      contentVersion: '1',
      lessonId: 't1-l08-treaty-promises-alberta',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L08-G'],
      stimulusId: 'l08-concept-2',
      familyId: 'l08-adhesion-meaning',
      prompt: 'What is an adhesion in this chapter?',
      options: [
        {
          id: 'a',
          text: 'A group left out of the talks, added later to an existing treaty'
        },
        {
          id: 'b',
          text: 'A survey method for laying out reserves'
        },
        {
          id: 'c',
          text: 'A permit to hunt off-reserve'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source G defines the pattern: left out of talks, added later, continuing into the 1950s.',
        b: 'Surveying is discussed for Treaty Eight reserves, not as adhesions.',
        c: 'Hunting rights are promises, not adhesions.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l08-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l08-treaty-promises-alberta',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L08-A'],
      stimulusId: 'l08-evidence-1',
      familyId: 'l08-treaty-one-scope',
      prompt: 'Which promise does Source A say was left out of the written treaty?',
      options: [
        {
          id: 'a',
          text: 'Hunting, fishing, and trapping throughout traditional territories'
        },
        {
          id: 'b',
          text: 'Three dollars per person each year'
        },
        {
          id: 'c',
          text: 'A school on every reserve'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'The extract names the activities and the scope — the passage Question 32 asks about.',
        b: 'The $3 payment is a written Treaty One term from the surrounding pages, not this extract.',
        c: 'The school promise is a written Treaty One term from the surrounding pages, not this extract.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l08-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l08-treaty-promises-alberta',
      mode: 'multipleChoice',
      skillTag: 'wording-support',
      sourceIds: ['L08-D'],
      stimulusId: 'l08-evidence-2',
      familyId: 'l08-medicine-chest-growth',
      prompt: 'What did the medicine-chest clause later lead to?',
      options: [
        {
          id: 'a',
          text: 'Universal health coverage for treaty First Nations'
        },
        {
          id: 'b',
          text: 'A hospital built in every treaty town'
        },
        {
          id: 'c',
          text: 'The end of the reserve system'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source D states the growth directly: one chest per agent’s house became health coverage.',
        b: 'The passage never mentions hospitals in towns.',
        c: 'The passage says nothing about ending reserves.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l08-application-1',
      contentVersion: '1',
      lessonId: 't1-l08-treaty-promises-alberta',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L08-D'],
      stimulusId: 'l08-application-1',
      familyId: 'l08-identical-terms-repair',
      prompt: 'A student writes, “Every numbered treaty had identical terms.” What repair does the lesson support?',
      options: [
        {
          id: 'a',
          text: 'Nothing — the textbook confirms all terms were identical'
        },
        {
          id: 'b',
          text: 'Later treaties added concessions, such as the medicine chest, after learning from earlier ones'
        },
        {
          id: 'c',
          text: 'The treaties had no written terms at all'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Sources C and D plus the learning passage (p. 30) deny this: terms evolved across councils.',
        b: 'Treaty Six won what earlier treaties lacked, and later treaties carried further concessions.',
        c: 'Written terms existed — reserves, annuities, schools — alongside the spoken gaps.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l08-classify-1',
      contentVersion: '1',
      lessonId: 't1-l08-treaty-promises-alberta',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L08-A', 'L08-C'],
      stimulusId: 'l08-classify-1',
      familyId: 'l08-claim-sort',
      prompt: 'Which statement describes an implementation problem rather than a treaty term or a spoken promise?',
      options: [
        {
          id: 'a',
          text: 'People away at counting time could be left off the census lists.'
        },
        {
          id: 'b',
          text: 'Treaty Six promised assistance in pestilence or famine.'
        },
        {
          id: 'c',
          text: 'Archibald verbally promised hunting rights.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The census passage (p. 31) makes counting an implementation problem: people away at the time could be left off the lists, which then corrupted reserve allocation and payments. The evidence supports this classification.',
        b: 'That is a written treaty term — Source C quotes the Treaty Six assistance promise directly. A term states what was agreed; it does not describe what went wrong afterward.',
        c: 'That is a spoken promise with a documented record gap — Source A reports both the speech and its absence from the page. The inference this question asks for is the third kind: implementation.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l08-independent-1',
      contentVersion: '1',
      lessonId: 't1-l08-treaty-promises-alberta',
      mode: 'written',
      sourceIds: ['L08-F'],
      familyId: 'l08-reserves-decision',
      prompt: 'Using Source F, explain what the Treaty Eight commissioners decided about reserves and why — then name one question the passage leaves unanswered.',
      criteria: ['States the decision and reason (no immediate laying out; settlement would make surveying necessary later)', 'Names one genuine unanswered question (e.g., when surveying would happen; how much land would follow; whether the promise was met)', 'Invents no outcome the passage does not state'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l08-independent-2',
      contentVersion: '1',
      lessonId: 't1-l08-treaty-promises-alberta',
      mode: 'written',
      sourceIds: ['L08-I'],
      familyId: 'l08-cardinal-claim',
      prompt: 'Using Source I, explain what Cardinal claims the treaties meant to the First Nations signers, and distinguish his claim from the textbook’s narration.',
      criteria: ['States the signers’ meaning in Cardinal’s terms (sacred honourable agreement; entered with faith and hope, as equals)', 'Attributes the claim (Cardinal, 1969, answering the White Paper) rather than treating it as narration', 'Adds no treaty term the excerpt does not state'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l09-concept-1',
      contentVersion: '1',
      lessonId: 't1-l09-geography-governance',
      mode: 'multipleChoice',
      skillTag: 'source-kind',
      sourceIds: ['L09-F'],
      stimulusId: 'l09-concept-1',
      familyId: 'l09-framework-bounds',
      prompt: 'What bounds the chapter’s six-region framework?',
      options: [
        {
          id: 'a',
          text: 'It is only a rough framework; peoples did not always conform to it'
        },
        {
          id: 'b',
          text: 'Nothing — the chapter presents it as exact'
        },
        {
          id: 'c',
          text: 'It applies only to the Arctic'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source F states the limit explicitly: “only a rough framework.”',
        b: 'Source F exists to deny exactly this reading.',
        c: 'The framework covers all six regions — the limit is fit, not scope.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l09-concept-2',
      contentVersion: '1',
      lessonId: 't1-l09-geography-governance',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L09-F'],
      stimulusId: 'l09-concept-2',
      familyId: 'l09-region-not-nation',
      prompt: 'Why is a cultural region not the same as a Nation?',
      options: [
        {
          id: 'a',
          text: 'Groups in similar environments sometimes held very different ideas, languages, and lifestyles'
        },
        {
          id: 'b',
          text: 'Each region contained exactly one Nation'
        },
        {
          id: 'c',
          text: 'Nations never moved between regions'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'The textbook’s own reason (p. 40): shared setting never meant shared identity.',
        b: 'The chapter describes many peoples per region — and the Métis across categories.',
        c: 'Seasonal movement across territories is described throughout the chapter.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l09-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l09-geography-governance',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L09-A'],
      stimulusId: 'l09-evidence-1',
      familyId: 'l09-six-names',
      prompt: 'Which list names the chapter’s six environments?',
      options: [
        {
          id: 'a',
          text: 'Arctic, Subarctic, Eastern Woodlands, Plains, Plateau, Pacific Northwest'
        },
        {
          id: 'b',
          text: 'Arctic, Subarctic, Plains, Plateau, Great Basin, Southwest'
        },
        {
          id: 'c',
          text: 'Pacific Northwest, California, Southeast, Plains, Arctic, Plateau'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source A’s exact six, in the chapter’s order.',
        b: 'Great Basin and Southwest are United States regions on the chapter map — not the Canadian six.',
        c: 'California and Southeast are United States regions on the chapter map — not the Canadian six.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l09-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l09-geography-governance',
      mode: 'multipleChoice',
      skillTag: 'wording-support',
      sourceIds: ['L09-D'],
      stimulusId: 'l09-evidence-2',
      familyId: 'l09-plains-size-organization',
      prompt: 'How does Source D connect Plains group size and organization?',
      options: [
        {
          id: 'a',
          text: 'Groups of 80 to 240 most of the year; larger summer gatherings with more structured institutions'
        },
        {
          id: 'b',
          text: 'A fixed band of 80 people under one permanent chief'
        },
        {
          id: 'c',
          text: 'Groups shrank each summer to avoid decisions'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source D states the sizes, the gatherings, and the adapting institutions.',
        b: 'No fixed size or permanent chief appears in the passage.',
        c: 'The passage describes gathering, not shrinking, in summer.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l09-application-1',
      contentVersion: '1',
      lessonId: 't1-l09-geography-governance',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L09-B'],
      stimulusId: 'l09-application-1',
      familyId: 'l09-arctic-city-repair',
      prompt: 'A student writes, “The Inuit lived in large permanent cities like the Pacific Northwest.” What repair?',
      options: [
        {
          id: 'a',
          text: 'Nothing — all regions housed themselves identically'
        },
        {
          id: 'b',
          text: 'Arctic life centered on extended family groups whose camps joined and parted with hunting conditions'
        },
        {
          id: 'c',
          text: 'The Inuit never lived in the Arctic'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Sources B and I describe small mobile camps — the opposite of identical cities.',
        b: 'The textbook’s Arctic account (pp. 38–39): family groups, good hunting together, scarce food apart.',
        c: 'The Arctic is the Inuit homeland throughout the chapter.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l09-compare-1',
      contentVersion: '1',
      lessonId: 't1-l09-geography-governance',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L09-B', 'L09-H'],
      stimulusId: 'l09-compare-1',
      familyId: 'l09-region-contrast',
      prompt: 'Which comparison does the textbook support?',
      options: [
        {
          id: 'a',
          text: 'Southern Eastern Woodlands settlements were large with more structured politics, while Arctic and Subarctic groups were smaller and mobile.'
        },
        {
          id: 'b',
          text: 'All six regions organized themselves identically, because geography determines culture.'
        },
        {
          id: 'c',
          text: 'The Arctic supported the largest settlements, because extreme cold requires big groups.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source H states the large-settlement, structured-politics link, while Sources B and I describe small mobile family groups — the evidence supports exactly this contrast.',
        b: 'Source F denies this: the regions are only a rough framework, and similar environments sometimes produced very different lives. The inference overclaims what geography can determine.',
        c: 'No source states this — the Arctic passages describe small camps that joined and parted with hunting conditions, so the claim reverses the evidence.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l09-independent-1',
      contentVersion: '1',
      lessonId: 't1-l09-geography-governance',
      mode: 'written',
      sourceIds: ['L09-I', 'L09-J'],
      familyId: 'l09-subarctic-plateau',
      prompt: 'Explain a comparison between Source I (Subarctic) and Source J (Plateau): one similarity in how the two peoples supported themselves and one difference the two cards state — without claiming geography alone determines culture.',
      criteria: ['States one similarity from the cards (the mixed hunting-gathering-fishing economy)', 'States one difference from the cards (e.g., Subarctic trapping and extended-family movement vs Plateau river-and-stream fishing)', 'Refuses the determinist conclusion; no claim beyond the two cards'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l09-independent-2',
      contentVersion: '1',
      lessonId: 't1-l09-geography-governance',
      mode: 'written',
      sourceIds: ['L09-G'],
      familyId: 'l09-gathering-places',
      prompt: 'Using Source G and the lesson, explain what groups did at traditional gathering places and name the two Alberta examples.',
      criteria: ['States the gathering activities (trade, renew alliances, socialize; use communal resources)', 'Names both Alberta examples (Head-Smashed-In; Ena K’ering Ká Tuwe / Cree Burn Lake)', 'Adds no invented location or activity'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l10-concept-1',
      contentVersion: '1',
      lessonId: 't1-l10-land-law-knowledge',
      mode: 'multipleChoice',
      skillTag: 'source-kind',
      sourceIds: ['L10-H'],
      stimulusId: 'l10-concept-1',
      familyId: 'l10-law-in-people',
      prompt: 'What does the lesson mean by “law lived in people, not archives”?',
      options: [
        {
          id: 'a',
          text: 'Societies’ rules were carried as lived experience and renewed in ceremony'
        },
        {
          id: 'b',
          text: 'There were no rules to carry'
        },
        {
          id: 'c',
          text: 'Laws were written down in books instead'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source H’s image: law libraries whose walking files are people, renewed in ceremony processes.',
        b: 'The passage is about how rules lived — not their absence.',
        c: 'The passage contrasts living memory with exactly this archive image.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l10-concept-2',
      contentVersion: '1',
      lessonId: 't1-l10-land-law-knowledge',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L10-I'],
      stimulusId: 'l10-concept-2',
      familyId: 'l10-knowledge-limits',
      prompt: 'Why does the lesson stop where the published pages stop?',
      options: [
        {
          id: 'a',
          text: 'Public mention never authorizes reproducing restricted knowledge; protocol governs going further'
        },
        {
          id: 'b',
          text: 'Ceremony had no meaning worth explaining'
        },
        {
          id: 'c',
          text: 'Elders never speak about governance publicly'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'The lesson’s ethic with Source I: invite teaching through correct protocol instead of inventing it.',
        b: 'Source H treats ceremony as where law renews — the opposite of meaningless.',
        c: 'O’Chiese’s published 1976 statement is exactly such public teaching.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l10-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l10-land-law-knowledge',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L10-A'],
      stimulusId: 'l10-evidence-1',
      familyId: 'l10-stem-meaning',
      prompt: 'In Source A, what does the pipe stem symbolize?',
      options: [
        {
          id: 'a',
          text: 'The straight road the people have to follow'
        },
        {
          id: 'b',
          text: 'The timber trade with newcomers'
        },
        {
          id: 'c',
          text: 'A weapon for defending territory'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'O’Chiese’s stated pairing — the answer’s second third for Question 35.',
        b: '“We do not give our timber” means the stem was never given — not a trade.',
        c: 'No weapon meaning appears anywhere in the statement.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l10-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l10-land-law-knowledge',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L10-F'],
      stimulusId: 'l10-evidence-2',
      familyId: 'l10-governance-needs',
      prompt: 'Whose needs did governance always answer to?',
      options: [
        {
          id: 'a',
          text: 'The people and the land'
        },
        {
          id: 'b',
          text: 'The Crown alone'
        },
        {
          id: 'c',
          text: 'The fur traders alone'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source F’s principle in the authors’ own words — the passage Question 41 asks about.',
        b: 'The Crown’s arrival comes later in the chapter, not in this passage.',
        c: 'Traders appear in the Métis passage, not in this principle.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l10-application-1',
      contentVersion: '1',
      lessonId: 't1-l10-land-law-knowledge',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L10-E'],
      stimulusId: 'l10-application-1',
      familyId: 'l10-wilderness-repair',
      prompt: 'A student writes, “The Blackfoot saw the land as empty wilderness to be tamed.” What repair?',
      options: [
        {
          id: 'a',
          text: 'Nothing — the textbook agrees with the student'
        },
        {
          id: 'b',
          text: 'The textbook contrasts European “wilderness” eyes with First Nations home-eyes; Fox and Mistaken Chief describe land as mother and teacher'
        },
        {
          id: 'c',
          text: 'The Blackfoot never managed the land at all'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Pages 40–42 deny this: “wilderness” is the newcomers’ word, answered by home, mother, and teacher.',
        b: 'The chapter’s contrast plus the researchers’ account — “the Blackfoot are the land.”',
        c: 'Sources C and J show deliberate management: burns, timed moves, spaced camps.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l10-paraphrase-1',
      contentVersion: '1',
      lessonId: 't1-l10-land-law-knowledge',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L10-E'],
      stimulusId: 'l10-paraphrase-1',
      familyId: 'l10-paraphrase-bound',
      prompt: 'Which response paraphrases Source E without adding claims?',
      options: [
        {
          id: 'a',
          text: 'The authors conclude the Blackfoot relationship is so close that the people and the land are one.'
        },
        {
          id: 'b',
          text: '“So, we begin to see, as Mr. Russell implies, that the Blackfoot are the land.”'
        },
        {
          id: 'c',
          text: 'This proves the Blackfoot never hunted, because the land was too sacred to use.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. “So close that people and land are one” restates the authors’ conclusion without adding claims — a paraphrase stays inside the source’s inference.',
        b: 'Those are the authors’ own quoted words from Source E — accurate as a quotation, but the question asks for a paraphrase, which restates the evidence in new words.',
        c: 'The passage never mentions a hunting ban; inventing one from the land’s sacredness adds a claim the source cannot support.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l10-independent-1',
      contentVersion: '1',
      lessonId: 't1-l10-land-law-knowledge',
      mode: 'written',
      sourceIds: ['L10-J'],
      familyId: 'l10-timed-move',
      prompt: 'Using Source J, explain the connection it reports: what practice does Russell describe, and what reason does he give for it? Do not add causes the passage does not state.',
      criteria: ['States the reported practice (moving every three days)', 'States the given reason (so the grass could stand back up; not overusing an area)', 'Adds no unstated cause (ceremony schedules, trader demands, wildlife counts)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l10-independent-2',
      contentVersion: '1',
      lessonId: 't1-l10-land-law-knowledge',
      mode: 'written',
      sourceIds: ['L10-C'],
      familyId: 'l10-burn-uses',
      prompt: 'Using Source C, explain two uses of controlled burns and the knowledge that guided them.',
      criteria: ['Names two uses from the passage (meadows; shores; trails; deadwood)', 'States the guiding knowledge (generations of observation and experience through oral tradition)', 'Invents no technique the passage does not state'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l11-concept-1',
      contentVersion: '1',
      lessonId: 't1-l11-metis-governance-elders',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L11-E', 'L11-G'],
      stimulusId: 'l11-concept-1',
      familyId: 'l11-leader-kinds',
      prompt: 'What distinguishes an informal leader from a crisis leader in this chapter?',
      options: [
        {
          id: 'a',
          text: 'Informal leaders evolve through sought-out skill and wisdom; crisis leaders emerge when communities are threatened'
        },
        {
          id: 'b',
          text: 'They are the same kind of leader'
        },
        {
          id: 'c',
          text: 'Crisis leaders are elected; informal leaders inherit their office'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Sources E and G define the two kinds: emergence under threat versus evolution through recognition.',
        b: 'The chapter introduces them as different kinds — Source E for crisis, Source G for informal.',
        c: 'No election or inheritance appears in either passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l11-concept-2',
      contentVersion: '1',
      lessonId: 't1-l11-metis-governance-elders',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L11-J'],
      stimulusId: 'l11-concept-2',
      familyId: 'l11-elder-meaning',
      prompt: 'What makes someone an Elder?',
      options: [
        {
          id: 'a',
          text: 'Significant wisdom, experience, and knowledge, plus community acceptance — not a certain age'
        },
        {
          id: 'b',
          text: 'Reaching age sixty-five'
        },
        {
          id: 'c',
          text: 'Being the oldest person in the room'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source J states the rule: designation plus acceptance as worthy.',
        b: 'No age number appears in the passage.',
        c: 'Presence and age are never the test; recognized wisdom is.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l11-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l11-metis-governance-elders',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L11-C'],
      stimulusId: 'l11-evidence-1',
      familyId: 'l11-st-albert-laws',
      prompt: 'What were the Laws of St. Albert?',
      options: [
        {
          id: 'a',
          text: 'The 1870 comprehensive parish laws with enforcement'
        },
        {
          id: 'b',
          text: 'The 1840 Pembina hunt rules'
        },
        {
          id: 'c',
          text: 'Federal Indian Act regulations'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source C names them directly — the passage Question 44 asks about.',
        b: 'Those are the hunt rules of Source B, a different example.',
        c: 'The Indian Act comes later in the chapter, not in this passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l11-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l11-metis-governance-elders',
      mode: 'multipleChoice',
      skillTag: 'wording-support',
      sourceIds: ['L11-L'],
      stimulusId: 'l11-evidence-2',
      familyId: 'l11-cardinal-service',
      prompt: 'In Source L, how does Bob Cardinal describe being an Elder?',
      options: [
        {
          id: 'a',
          text: 'Being a servant of the Creator, the people, and lastly yourself'
        },
        {
          id: 'b',
          text: 'Holding elected office for life'
        },
        {
          id: 'c',
          text: 'Owning the most land in the parish'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Cardinal’s stated meaning, quoted exactly.',
        b: 'Elected office belongs to formal leadership, not to this account.',
        c: 'Landholding appears nowhere in the passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l11-application-1',
      contentVersion: '1',
      lessonId: 't1-l11-metis-governance-elders',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L11-A', 'L11-G'],
      stimulusId: 'l11-application-1',
      familyId: 'l11-elected-governor-repair',
      prompt: 'A student writes, “Métis hunt leaders were elected governors who kept power permanently.” What repair?',
      options: [
        {
          id: 'a',
          text: 'Nothing — the chapter confirms this'
        },
        {
          id: 'b',
          text: 'Captains were selected per hunt, and informal authority ended with the task'
        },
        {
          id: 'c',
          text: 'The chapter describes no hunt leaders at all'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Sources A and G deny both halves: selected, not elected; returning, not permanent.',
        b: 'Per-hunt selection plus the hunter’s return — authority that expires with the task.',
        c: 'Sources A and B describe the hunt organization in detail.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l11-match-1',
      contentVersion: '1',
      lessonId: 't1-l11-metis-governance-elders',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L11-A', 'L11-B'],
      stimulusId: 'l11-match-1',
      familyId: 'l11-role-match',
      prompt: 'Which role matches its evidence — with community, context, and period attached?',
      options: [
        {
          id: 'a',
          text: 'An 1840 Pembina hunt captain: selected by the group, enforcing the Sabbath and order rules.'
        },
        {
          id: 'b',
          text: 'An 1870 St. Albert parishioner: elected governor of all Métis everywhere.'
        },
        {
          id: 'c',
          text: 'A hunt soldier who kept his command permanently after the hunt ended.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Community (Pembina Métis, 1840), context (buffalo hunt), period (pre-Confederation season) — all three fields attach to evidence in Sources A and B.',
        b: 'Source C describes parish laws for three named parishes in 1870 — no governor of all Métis anywhere. The generalization overclaims what the source can support.',
        c: 'Source G’s hunter returns to his usual position when the hunt ends — authority that expires with the task, so permanent command contradicts the evidence.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l11-independent-1',
      contentVersion: '1',
      lessonId: 't1-l11-metis-governance-elders',
      mode: 'written',
      sourceIds: ['L11-F', 'L11-G'],
      familyId: 'l11-formal-informal',
      prompt: 'Explain one difference between the formal leadership arrangement (Source F) and the informal one (Source G), using details from both accounts.',
      criteria: ['States the formal arrangement (structured governance over a group, often long-term; chiefs and band councillors)', 'States the informal arrangement (evolving recognition for skill, experience, or wisdom; authority ends with the task)', 'Draws from both accounts without inventing elections, appointments, or permanent titles'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l11-independent-2',
      contentVersion: '1',
      lessonId: 't1-l11-metis-governance-elders',
      mode: 'written',
      sourceIds: ['L11-J', 'L11-L'],
      familyId: 'l11-recognition-service',
      prompt: 'Using Sources J and L, explain what community recognition has to do with becoming an Elder.',
      criteria: ['States the designation rule (wisdom, experience, knowledge plus acceptance as worthy)', 'Uses Cardinal’s servant account (Creator, people, self — humility before title)', 'Invents no age rule or election either passage never states'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l12-concept-1',
      contentVersion: '1',
      lessonId: 't1-l12-first-nations-inuit-relations',
      mode: 'multipleChoice',
      skillTag: 'source-kind',
      sourceIds: ['L12-A'],
      stimulusId: 'l12-concept-1',
      familyId: 'l12-no-treaty-divergence',
      prompt: 'Why do Métis and Inuit relationships with Ottawa differ from First Nations’?',
      options: [
        {
          id: 'a',
          text: 'Neither group signed a treaty with Canada'
        },
        {
          id: 'b',
          text: 'They refused all contact with Ottawa'
        },
        {
          id: 'c',
          text: 'They joined Confederation as provinces instead'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source A’s divergence sentence — the passage Question 48 asks about.',
        b: 'The chapter describes extensive contact, policy, and negotiation.',
        c: 'No province-hood for either group appears in the chapter.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l12-concept-2',
      contentVersion: '1',
      lessonId: 't1-l12-first-nations-inuit-relations',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L12-E', 'L12-J'],
      stimulusId: 'l12-concept-2',
      familyId: 'l12-separate-lanes',
      prompt: 'Why does the lesson keep First Nations and Inuit histories in separate lanes?',
      options: [
        {
          id: 'a',
          text: 'One argues over a signed text’s meaning; the other had no treaty until modern claims'
        },
        {
          id: 'b',
          text: 'The chapter describes both identically'
        },
        {
          id: 'c',
          text: 'Only one of the two groups has a history'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Contested text (Sources B–H) versus no text until claims (Sources I–L) need different evidence.',
        b: 'Source A opens by denying exactly this: the paths differ.',
        c: 'Both lanes carry full dated histories in the chapter.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l12-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l12-first-nations-inuit-relations',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L12-B'],
      stimulusId: 'l12-evidence-1',
      familyId: 'l12-hunting-government',
      prompt: 'To First Nations negotiators, what did a hunting-rights guarantee include?',
      options: [
        {
          id: 'a',
          text: 'Traditional forms of government — inseparable from the hunt'
        },
        {
          id: 'b',
          text: 'Only the economic right to sell furs'
        },
        {
          id: 'c',
          text: 'Nothing beyond a single season'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source B states the inseparability — the passage Question 49 asks about.',
        b: 'Economic-only is the federal negotiators’ reading, not the First Nations one.',
        c: 'No single-season limit appears in the passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l12-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l12-first-nations-inuit-relations',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L12-J'],
      stimulusId: 'l12-evidence-2',
      familyId: 'l12-sixties-pressure',
      prompt: 'What changed for the Inuit in the 1960s?',
      options: [
        {
          id: 'a',
          text: 'Resource exploration created pressure to settle agreements'
        },
        {
          id: 'b',
          text: 'The Arctic was abandoned by its people'
        },
        {
          id: 'c',
          text: 'All existing treaties were repealed'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source J’s turning point — the second half of Question 51.',
        b: 'The passage describes organization and negotiation, not abandonment.',
        c: 'No Inuit treaty existed to repeal.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l12-application-1',
      contentVersion: '1',
      lessonId: 't1-l12-first-nations-inuit-relations',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L12-J'],
      stimulusId: 'l12-application-1',
      familyId: 'l12-never-agreement-repair',
      prompt: 'A student writes, “The Inuit never entered any agreement with Canada.” What repair?',
      options: [
        {
          id: 'a',
          text: 'Nothing — no agreement was ever discussed'
        },
        {
          id: 'b',
          text: 'The chapter ends with organized Inuit negotiating modern land-claim agreements'
        },
        {
          id: 'c',
          text: 'The Inuit signed the numbered treaties instead'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source J’s lane ends in negotiation — “no treaty then” never meant “no agreements ever.”',
        b: 'Organized negotiators pursuing claims serving their people (p. 53).',
        c: 'Source A rules this out: neither group signed a treaty.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l12-lanes-1',
      contentVersion: '1',
      lessonId: 't1-l12-first-nations-inuit-relations',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L12-B', 'L12-J'],
      stimulusId: 'l12-lanes-1',
      familyId: 'l12-lane-marker',
      prompt: 'Which lane-marker keeps the two histories separate?',
      options: [
        {
          id: 'a',
          text: 'First Nations: treaty hunting guarantees read as governance; Inuit: no treaty push until 1960s resources.'
        },
        {
          id: 'b',
          text: 'Both peoples signed numbered treaties in 1876 with identical terms.'
        },
        {
          id: 'c',
          text: 'The Inuit signed Treaty Eight, then pursued land claims for fun.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Each lane carries its own dated evidence: treaty readings with Elder testimony (Sources B, E) against no-treaty until 1960s resources (Source J).',
        b: 'Source A denies the shared premise — neither Métis nor Inuit signed a treaty — and no source dates any 1876 joint signing. The claim invents the evidence it needs.',
        c: 'Treaty Eight was a First Nations treaty (Source G); the chapter never places Inuit inside it, and “for fun” invents a motive no source states.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l12-independent-1',
      contentVersion: '1',
      lessonId: 't1-l12-first-nations-inuit-relations',
      mode: 'written',
      sourceIds: ['L12-B', 'L12-C', 'L12-E', 'L12-I', 'L12-J'],
      familyId: 'l12-one-account-fails',
      prompt: 'Explain why the same generalized account cannot describe both historical experiences, using supplied evidence from both lanes.',
      criteria: ['States the treaty-path condition (signed text with two attributed readings)', 'States the no-treaty-path condition (no push until 1960s resources; organized modern-claim negotiation)', 'Explains the asymmetry without inventing any treaty or date'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l12-independent-2',
      contentVersion: '1',
      lessonId: 't1-l12-first-nations-inuit-relations',
      mode: 'written',
      sourceIds: ['L12-F', 'L12-G'],
      familyId: 'l12-witness-trust',
      prompt: 'Using Source F or Source G, explain how one witness account supports the First Nations reading of the treaties.',
      criteria: ['Names the witness and the stated content (Breynat’s broken word or the priest’s assurance to Mikisew)', 'Links the account to the First Nations reading (trust given on assurances, not on text alone)', 'Adds no treaty term the account does not state'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l13-concept-1',
      contentVersion: '1',
      lessonId: 't1-l13-scrip-road-allowances',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L13-B'],
      stimulusId: 'l13-concept-1',
      familyId: 'l13-sorting-system',
      prompt: 'What was the “sorting system” of Question 52?',
      options: [
        {
          id: 'a',
          text: 'Classifying Métis as First Nations or European by lived tradition'
        },
        {
          id: 'b',
          text: 'The scrip certificate process'
        },
        {
          id: 'c',
          text: 'The road allowance map'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source B’s two boxes with no Métis box — the passage Question 52 asks about.',
        b: 'Scrip was the later land mechanism (Source G), not the classification.',
        c: 'Road allowances came decades later (Source K).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l13-concept-2',
      contentVersion: '1',
      lessonId: 't1-l13-scrip-road-allowances',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L13-A'],
      stimulusId: 'l13-concept-2',
      familyId: 'l13-nationhood-claim',
      prompt: 'Why is “Métis equals a fraction of ancestry” wrong for this chapter?',
      options: [
        {
          id: 'a',
          text: 'The chapter presents Métis as a people with nationhood, flag, and land-rights claims'
        },
        {
          id: 'b',
          text: 'Ancestry fractions are the chapter’s own definition'
        },
        {
          id: 'c',
          text: 'The Métis had no distinct culture'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source A’s 1818 nationhood claim — property, flag, protection.',
        b: 'No fraction or blood rule appears anywhere in these pages.',
        c: 'Sources A through D evidence distinct culture throughout.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l13-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l13-scrip-road-allowances',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L13-G'],
      stimulusId: 'l13-evidence-1',
      familyId: 'l13-scrip-disaster',
      prompt: 'Why does the textbook call scrip a disaster?',
      options: [
        {
          id: 'a',
          text: 'Fraud, confusion, greed, and incompetence'
        },
        {
          id: 'b',
          text: 'Too much land was granted too fast'
        },
        {
          id: 'c',
          text: 'Nobody applied for certificates'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source G’s four named causes — the core of Question 54.',
        b: 'The chapter stresses how little land reached Métis hands.',
        c: 'Applications were widespread; delivery was the failure.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l13-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l13-scrip-road-allowances',
      mode: 'multipleChoice',
      skillTag: 'wording-support',
      sourceIds: ['L13-J'],
      stimulusId: 'l13-evidence-2',
      familyId: 'l13-rcap-verdict',
      prompt: 'What did the 1991 Royal Commission report conclude about Manitoba Métis promises?',
      options: [
        {
          id: 'a',
          text: 'Violated or ignored on a massive scale — a national disgrace'
        },
        {
          id: 'b',
          text: 'Fully honoured ahead of schedule'
        },
        {
          id: 'c',
          text: 'No promises were ever made'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source J’s verdict, quoted exactly — the Question 55 answer.',
        b: 'The report states the opposite on the textbook’s page.',
        c: 'The Manitoba Act promises fill Sources E and F.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l13-application-1',
      contentVersion: '1',
      lessonId: 't1-l13-scrip-road-allowances',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L13-L'],
      stimulusId: 'l13-application-1',
      familyId: 'l13-hardship-only-repair',
      prompt: 'A student writes, “Road allowance life was only suffering.” What repair?',
      options: [
        {
          id: 'a',
          text: 'Nothing — the chapter shows only suffering'
        },
        {
          id: 'b',
          text: 'Elders remember vibrant social and cultural lives too — hardship and community together'
        },
        {
          id: 'c',
          text: 'Road allowances never existed'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Source L’s first two sentences deny this: happy memories, parties, dance nights.',
        b: 'Both halves as the chapter holds them — joy and precariousness together.',
        c: 'Sources K through M document the communities in detail.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l13-chronology-1',
      contentVersion: '1',
      lessonId: 't1-l13-scrip-road-allowances',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L13-C', 'L13-E', 'L13-G', 'L13-K'],
      stimulusId: 'l13-chronology-1',
      familyId: 'l13-lane-order',
      prompt: 'Which sequence does the chapter support?',
      options: [
        {
          id: 'a',
          text: 'Red River Resistance (1870) → Manitoba Act land promise → scrip disaster → road allowance communities.'
        },
        {
          id: 'b',
          text: 'Road allowances → scrip → Manitoba Act → Red River Resistance.'
        },
        {
          id: 'c',
          text: 'Manitoba Act → Red River Resistance → 1991 RCAP → scrip invented.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Resistance → Act → scrip → road allowances matches the chapter’s dated stages (Sources C, E, G, K).',
        b: 'The chapter runs the other way: resistance and the Act precede scrip, and road allowances come last (pp. 54–57). Reversing the chain breaks every dated link.',
        c: 'The Resistance forced the Act — Riel first, legislation second (Sources C, E) — and the 1991 RCAP judges history a century later; nothing in the chapter supports the claim that scrip was invented after 1991.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l13-independent-1',
      contentVersion: '1',
      lessonId: 't1-l13-scrip-road-allowances',
      mode: 'written',
      sourceIds: ['L13-E', 'L13-G', 'L13-K', 'L13-L'],
      familyId: 'l13-chain-both-halves',
      prompt: 'Explain one consequence of the Manitoba Act’s land exchange using a linked sequence of evidence — and identify one detail that prevents reducing road-allowance life to hardship alone.',
      criteria: ['Links the sequence (recognized rights exchanged; scrip delivery failing; displacement onto road allowances)', 'Names the anti-reduction detail (happy Elder memories; vibrant social and cultural lives; parties and dance nights)', 'Keeps both halves without inventing any stage or motive'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l13-independent-2',
      contentVersion: '1',
      lessonId: 't1-l13-scrip-road-allowances',
      mode: 'written',
      sourceIds: ['L13-G', 'L13-J'],
      familyId: 'l13-document-assessment',
      prompt: 'Using Sources G and J, distinguish what the chapter documents about scrip from the Royal Commission’s later assessment.',
      criteria: ['States the documented mechanism (convertible paper; sales; who ended with the land)', 'States the later assessment (violated or ignored massively; national disgrace)', 'Keeps documentation and assessment on separate levels'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l14-concept-1',
      contentVersion: '1',
      lessonId: 't1-l14-indian-act',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L14-A', 'L14-C'],
      stimulusId: 'l14-concept-1',
      familyId: 'l14-purpose-test',
      prompt: 'What test does Source C set for the Act’s stated purpose?',
      options: [
        {
          id: 'a',
          text: 'Legislation must comply with the treaty, which binds as international law'
        },
        {
          id: 'b',
          text: 'The Act automatically overrides all treaties'
        },
        {
          id: 'c',
          text: 'Treaties expire when legislation passes'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source C’s rule: signatories must ensure compliance; treaties bind as international law.',
        b: 'Source C states the opposite obligation.',
        c: 'No expiry appears in the passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l14-concept-2',
      contentVersion: '1',
      lessonId: 't1-l14-indian-act',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L14-D', 'L14-E'],
      stimulusId: 'l14-concept-2',
      familyId: 'l14-status-identity',
      prompt: 'Why is Act status not the same as cultural identity?',
      options: [
        {
          id: 'a',
          text: 'Status was a legal category routed through male lines and marriage rules'
        },
        {
          id: 'b',
          text: 'The Act defined every ceremony’s meaning'
        },
        {
          id: 'c',
          text: 'Identity was decided by popular vote'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Sources D–F route status through rules; identity lived in practice the Act never defined.',
        b: 'The Act banned practices; it never defined their meaning.',
        c: 'No vote on identity appears in these pages.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l14-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l14-indian-act',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L14-G', 'L14-H'],
      stimulusId: 'l14-evidence-1',
      familyId: 'l14-agent-array',
      prompt: 'Which powers did the Indian agent hold?',
      options: [
        {
          id: 'a',
          text: 'Controlled meetings, approved bylaws, managed finances, removed chiefs'
        },
        {
          id: 'b',
          text: 'Only delivered the mail'
        },
        {
          id: 'c',
          text: 'Commanded the provincial police'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Sources G and H name the array — the passage Question 59 asks about.',
        b: 'Mail delivery appears nowhere in the powers.',
        c: 'Policing belonged to other authorities, not the agent’s listed powers.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l14-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l14-indian-act',
      mode: 'multipleChoice',
      skillTag: 'wording-support',
      sourceIds: ['L14-K'],
      stimulusId: 'l14-evidence-2',
      familyId: 'l14-six-nations-consent',
      prompt: 'What did the Six Nations council predict in 1879?',
      options: [
        {
          id: 'a',
          text: 'Superintendent control of lands, moneys, and properties without chiefs’ consent'
        },
        {
          id: 'b',
          text: 'Immediate repeal of the Act'
        },
        {
          id: 'c',
          text: 'A personal apology from Laird'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source K’s prediction, quoted exactly.',
        b: 'No repeal followed; the Act took hold instead.',
        c: 'No apology appears in the passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l14-application-1',
      contentVersion: '1',
      lessonId: 't1-l14-indian-act',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L14-D'],
      stimulusId: 'l14-application-1',
      familyId: 'l14-todays-rule-repair',
      prompt: 'A student writes, “The 1876 status rule decides who has status today.” What repair?',
      options: [
        {
          id: 'a',
          text: 'Nothing — historical rules apply unchanged'
        },
        {
          id: 'b',
          text: 'The card quotes an 1876 provision; later law changed the rules, so it evidences then, not now'
        },
        {
          id: 'c',
          text: 'Status no longer exists at all'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The lesson fences every 1876 provision as historical evidence only.',
        b: 'Dated provisions prove what the Act did — never any living person’s standing.',
        c: 'Status law continues; the point is which rules apply when.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l14-authority-1',
      contentVersion: '1',
      lessonId: 't1-l14-indian-act',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L14-G', 'L14-H'],
      stimulusId: 'l14-authority-1',
      familyId: 'l14-authority-id',
      prompt: 'Which authority does the passage describe?',
      options: [
        {
          id: 'a',
          text: 'The Indian agent: controlled meetings, approved bylaws, managed finances, removed chiefs.'
        },
        {
          id: 'b',
          text: 'The band council: an independent taxing legislature free of oversight.'
        },
        {
          id: 'c',
          text: 'The Superintendent: consulted the chiefs before every decision.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Meetings, bylaws, finances, plus removal power — Sources G and H name the agent’s array, and Source I summarizes it across four domains.',
        b: 'Sources L and M deny both halves: councils faced override on almost anything and could not levy taxes — an independent taxing legislature is the opposite of the evidence.',
        c: 'Source K states the opposite: management of lands, moneys, and properties without first obtaining the chiefs’ consent — consultation is exactly what was missing.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l14-independent-1',
      contentVersion: '1',
      lessonId: 't1-l14-indian-act',
      mode: 'written',
      sourceIds: ['L14-K'],
      familyId: 'l14-predicted-effect',
      prompt: 'Using Source K, explain one effect the Six Nations council predicted from the Act’s control powers — without treating the 1879 provision as today’s law.',
      criteria: ['States the predicted effect (superintendent management of lands, moneys, properties without chiefs’ consent)', 'Fences it as an 1879 statement about the 1876 Act', 'Makes no claim about today’s law, offices, or standing'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l14-independent-2',
      contentVersion: '1',
      lessonId: 't1-l14-indian-act',
      mode: 'written',
      sourceIds: ['L14-J'],
      familyId: 'l14-cardinal-reading',
      prompt: 'Using Source J, explain Cardinal’s claim about what the Indian Act did to the treaties.',
      criteria: ['States the claim (the Act displaced the treaties as the working source of legal standing)', 'Attributes it (Cardinal, 1969, a First Nations reading — not Ottawa’s intent)', 'Adds no provision the excerpt does not state'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l15-concept-1',
      contentVersion: '1',
      lessonId: 't1-l15-resistance-1951',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L15-H'],
      stimulusId: 'l15-concept-1',
      familyId: 'l15-revision-kind',
      prompt: 'Why is the secret ballot a revision rather than a response?',
      options: [
        {
          id: 'a',
          text: 'It changed the Act’s rules; responses are what people did about the rules'
        },
        {
          id: 'b',
          text: 'Ballots are responses by definition'
        },
        {
          id: 'c',
          text: 'Only effects count as revisions'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Revisions rewrite law (Source H); responses like re-election answer it (Source B).',
        b: 'The lesson sorts by who acts: legislatures revise, people respond.',
        c: 'Effects (like the 263 count) prove revisions; they are not revisions.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l15-concept-2',
      contentVersion: '1',
      lessonId: 't1-l15-resistance-1951',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L15-O'],
      stimulusId: 'l15-concept-2',
      familyId: 'l15-partial-repair',
      prompt: 'Why does the lesson call 1951 a turning point rather than a transformation?',
      options: [
        {
          id: 'a',
          text: 'Lives did not immediately improve; resurgence was gradual and limits remained'
        },
        {
          id: 'b',
          text: 'Nothing changed at all'
        },
        {
          id: 'c',
          text: 'Every restriction vanished at once'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source O’s verdict plus the register and intervention limits.',
        b: 'Six catalogued changes deny this.',
        c: 'Source O exists to deny exactly this reading.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l15-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l15-resistance-1951',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L15-D'],
      stimulusId: 'l15-evidence-1',
      familyId: 'l15-piapot-removal',
      prompt: 'What happened after Piapot’s 1899 removal?',
      options: [
        {
          id: 'a',
          text: 'His band regarded him as chief until his death in 1918'
        },
        {
          id: 'b',
          text: 'He was never heard from again'
        },
        {
          id: 'c',
          text: 'The band immediately elected a replacement'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source D’s nineteen-year disregard — office and authority split.',
        b: 'The passage follows him to 1918.',
        c: 'No replacement election appears in the passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l15-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l15-resistance-1951',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L15-F'],
      stimulusId: 'l15-evidence-2',
      familyId: 'l15-coercion-tool',
      prompt: 'How did Ottawa force compliance with the Act?',
      options: [
        {
          id: 'a',
          text: 'Withheld treaty promises — annuities and services — from rule-breaking bands'
        },
        {
          id: 'b',
          text: 'Doubled annuity payments as rewards'
        },
        {
          id: 'c',
          text: 'Abolished the superintendent’s office'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source F states the mechanism — the Question 63 answer.',
        b: 'The passage describes withholding, not doubling.',
        c: 'The superintendent’s office continued.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l15-application-1',
      contentVersion: '1',
      lessonId: 't1-l15-resistance-1951',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L15-L'],
      stimulusId: 'l15-application-1',
      familyId: 'l15-lawsuit-repair',
      prompt: 'A student writes, “The 1951 revisions reopened the road to Calder.” What repair?',
      options: [
        {
          id: 'a',
          text: 'Nothing — Calder is the chapter’s 1951 case'
        },
        {
          id: 'b',
          text: 'The chapter credits land-claim lawsuits generally; Calder is not in these pages'
        },
        {
          id: 'c',
          text: 'Lawsuits stayed illegal after 1951'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Calder appears nowhere on pages 63–65 — the name is imported.',
        b: 'Source L: suing legal again, land-claim lawsuits followed — no case named.',
        c: 'Source L removes exactly that ban.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l15-sort-1',
      contentVersion: '1',
      lessonId: 't1-l15-resistance-1951',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L15-H'],
      stimulusId: 'l15-sort-1',
      familyId: 'l15-revision-sort',
      prompt: 'Which item is a 1951 revision rather than a response or an effect?',
      options: [
        {
          id: 'a',
          text: 'A 1951 revision: voting by secret ballot replaced open voting.'
        },
        {
          id: 'b',
          text: 'A 1951 revision: First Nations re-elected overturned leaders.'
        },
        {
          id: 'c',
          text: 'A 1951 revision: bands electing leaders rose to 263.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. A dated 1951 revision from the Question 64 catalogue (Source H) — the kind of item q64 asks students to list and explain.',
        b: 'Re-electing the overturned is a First Nations response (Source B) — resistance to the system, not a revision of it. The lesson sorts responses from revisions.',
        c: 'The 263 count is an effect of the revisions (p. 64) — evidence the changes bit, not a change itself. Effects prove revisions; they are not revisions.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l15-independent-1',
      contentVersion: '1',
      lessonId: 't1-l15-resistance-1951',
      mode: 'written',
      sourceIds: ['L15-L', 'L15-N'],
      familyId: 'l15-change-continuity',
      prompt: 'Explain one 1951 change and one continuity that survived it, using the lesson’s passages.',
      criteria: ['States the change (suing legal again; land-claim lawsuits followed)', 'States the continuity (federal intervention retained; register omissions unrepaired)', 'Refuses the instant-transformation reading'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l15-independent-2',
      contentVersion: '1',
      lessonId: 't1-l15-resistance-1951',
      mode: 'written',
      sourceIds: ['L15-C', 'L15-D'],
      familyId: 'l15-piapot-account',
      prompt: 'Using Sources C and D, explain how Piapot’s story shows resistance in both words and standing.',
      criteria: ['States the words (the reciprocal prayer challenge to the missionaries)', 'States the standing (removed 1899, regarded as chief to 1918)', 'Adds no policy outcome the passages do not state'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l16-concept-1',
      contentVersion: '1',
      lessonId: 't1-l16-policy-councils-devolution',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L16-D', 'L16-E'],
      stimulusId: 'l16-concept-1',
      familyId: 'l16-devolution-kind',
      prompt: 'What is devolution in this chapter?',
      options: [
        {
          id: 'a',
          text: 'Ottawa’s post-1970s transfer of administrative control to band councils'
        },
        {
          id: 'b',
          text: 'The end of all band councils'
        },
        {
          id: 'c',
          text: 'Provincial takeover of reserves'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Sources D and E define it — the Question 66 answer.',
        b: 'Councils multiplied and gained powers instead.',
        c: 'Transfer went to band councils, not provinces.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l16-concept-2',
      contentVersion: '1',
      lessonId: 't1-l16-policy-councils-devolution',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L16-F'],
      stimulusId: 'l16-concept-2',
      familyId: 'l16-admin-policy',
      prompt: 'What separates self-administration from policy-making?',
      options: [
        {
          id: 'a',
          text: 'Implementing programs versus setting direction and choosing what is offered'
        },
        {
          id: 'b',
          text: 'Nothing — they are synonyms'
        },
        {
          id: 'c',
          text: 'Policy-making is only about budgets'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source F draws the line exactly.',
        b: 'The passage exists to deny this equation.',
        c: 'Direction and program choice, not budgets alone.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l16-evidence-1',
      contentVersion: '1',
      lessonId: 't1-l16-policy-councils-devolution',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L16-B'],
      stimulusId: 'l16-evidence-1',
      familyId: 'l16-withdrawal-date',
      prompt: 'What happened to the White Paper in 1973?',
      options: [
        {
          id: 'a',
          text: 'Protests forced its withdrawal, ending formal assimilation policy'
        },
        {
          id: 'b',
          text: 'It was enacted unanimously'
        },
        {
          id: 'c',
          text: 'It was forgotten without response'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source B dates the outcome — the 1973 third of Question 65.',
        b: 'No enactment followed; withdrawal did.',
        c: 'The protests are the passage’s subject.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l16-evidence-2',
      contentVersion: '1',
      lessonId: 't1-l16-policy-councils-devolution',
      mode: 'multipleChoice',
      skillTag: 'wording-support',
      sourceIds: ['L16-J'],
      stimulusId: 'l16-evidence-2',
      familyId: 'l16-swan-river',
      prompt: 'How does Swan River’s election use tradition?',
      options: [
        {
          id: 'a',
          text: 'It bases the election on its traditional clan system'
        },
        {
          id: 'b',
          text: 'It bans all voting'
        },
        {
          id: 'c',
          text: 'It appoints chiefs by lottery'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Source J states it — the Question 67 example.',
        b: 'Clans elect council members; voting continues.',
        c: 'No lottery appears in the passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l16-application-1',
      contentVersion: '1',
      lessonId: 't1-l16-policy-councils-devolution',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L16-B'],
      stimulusId: 'l16-application-1',
      familyId: 'l16-1973-merge-repair',
      prompt: 'A student writes, “The chapter proves every residential school closed in 1973.” What repair?',
      options: [
        {
          id: 'a',
          text: 'Nothing — 1973 closed everything'
        },
        {
          id: 'b',
          text: 'The chapter dates a 1973 policy shift; the lesson claims no school’s closing date from it'
        },
        {
          id: 'c',
          text: 'The chapter never mentions 1973'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Withdrawal, transfer, and closure are different event types sharing only a year.',
        b: 'The fenced reading: a list item for Question 65, not a system end date.',
        c: 'Two 1973 events sit on page 66.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l16-sequence-1',
      contentVersion: '1',
      lessonId: 't1-l16-policy-councils-devolution',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L16-A', 'L16-B', 'L16-C', 'L16-K'],
      stimulusId: 'l16-sequence-1',
      familyId: 'l16-landmark-order',
      prompt: 'Which sequence-and-responsibility pair does the chapter support?',
      options: [
        {
          id: 'a',
          text: '1969 White Paper → 1973 withdrawal → 1988 tax powers; tribal councils pool resources outside the Act.'
        },
        {
          id: 'b',
          text: '1988 tax powers → 1969 White Paper → 1973 withdrawal; band councils were never regulated.'
        },
        {
          id: 'c',
          text: '1973 Calder decision → 1969 White Paper → 1988 school closures.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The dated order holds — 1969 proposal, 1973 withdrawal, 1988 powers — and tribal councils pool resources outside Act regulation (Sources A, B, C, K).',
        b: 'The chapter runs the other way — 1969 precedes 1988 by nineteen years — and band councils stayed regulated: BCRs need federal approval (Source H).',
        c: 'Calder appears nowhere in this chapter — the 1973 events are the withdrawal and the school-policy shift — and no source closes any school in 1988. The claim imports what the chapter never states.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l16-independent-1',
      contentVersion: '1',
      lessonId: 't1-l16-policy-councils-devolution',
      mode: 'written',
      sourceIds: ['L16-C'],
      familyId: 'l16-1988-authority',
      prompt: 'Using Source C, explain one 1988 change and name one remaining question about who decides.',
      criteria: ['States the 1988 change (tax, lease, royalty-money authority)', 'Names one remaining question (who sets policy; BCR approval; minister’s retained powers)', 'Refuses the unrestricted-self-government conclusion'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l16-independent-2',
      contentVersion: '1',
      lessonId: 't1-l16-policy-councils-devolution',
      mode: 'written',
      sourceIds: ['L16-L'],
      familyId: 'l16-mutual-support',
      prompt: 'Using Source L and the lesson, explain two tribal-council roles beyond pooling resources.',
      criteria: ['States the mutual-support role (reinforcing traditional political, economic, social systems)', 'States the unreached-areas role (justice, public safety, law enforcement initiatives)', 'Adds no power the page does not state'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l17-no-ownership-1',
      contentVersion: '1',
      lessonId: 't1-l17-land-knowledge-constitution',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L17-A', 'L17-C'],
      stimulusId: 'l17-no-ownership-1',
      familyId: 'l17-lived-teaching',
      prompt: 'What does Carpenter\'s statement teach about owning land?',
      options: [
        {
          id: 'a',
          text: 'Land is for use and living; Native people never say they own it.'
        },
        {
          id: 'b',
          text: 'Land should be mapped, bounded, and individually held.'
        },
        {
          id: 'c',
          text: 'Land belongs to whoever reaches the hunting ground first.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Sources A and C state the ethic directly: use and living, never ownership, never exclusion.',
        b: 'Mapping and boundaries are what the statement sets aside — respect persisted \'despite these limitations and boundaries\' (p. 76).',
        c: 'First arrival grants no ownership in Carpenter\'s account — abundance is shared with whoever meets you on the land (Source B).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l17-concern-provision-1',
      contentVersion: '1',
      lessonId: 't1-l17-land-knowledge-constitution',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L17-L', 'L17-N'],
      stimulusId: 'l17-concern-provision-1',
      familyId: 'l17-statement-sort',
      prompt: 'How do Source L and Source N differ as kinds of statement?',
      options: [
        {
          id: 'a',
          text: 'L states an attributed concern; N states an enacted provision.'
        },
        {
          id: 'b',
          text: 'Both state enacted provisions of the constitution.'
        },
        {
          id: 'c',
          text: 'Both state lived teachings from experience.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. L warns what the Charter might do; N declares what Section 25 does. Concern and provision support different claims.',
        b: 'L attributes a worry to leaders — it enacts nothing. Only N carries the Act\'s declaring voice.',
        c: 'Neither comes from lived experience on the land — that voice belongs to Sources A–D.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l17-sharing-1',
      contentVersion: '1',
      lessonId: 't1-l17-land-knowledge-constitution',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L17-B'],
      stimulusId: 'l17-sharing-1',
      familyId: 'l17-detail-locate',
      prompt: 'Which detail shows sharing within need?',
      options: [
        {
          id: 'a',
          text: 'Inviting another to fish where fish are abundant.'
        },
        {
          id: 'b',
          text: 'Fencing a hunting ground against fellow Natives.'
        },
        {
          id: 'c',
          text: 'Selling trapping rights to the highest bidder.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source B\'s invitation — fish with me, trap with me — is sharing within need.',
        b: 'Source C forbids exactly this: the Native person never says \'Don\'t trap there.\'',
        c: 'No sale appears anywhere in Sources A–D; the ethic shares use, never sells it.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l17-metis-line-1',
      contentVersion: '1',
      lessonId: 't1-l17-land-knowledge-constitution',
      mode: 'multipleChoice',
      skillTag: 'wording-support',
      sourceIds: ['L17-P', 'L17-Q'],
      stimulusId: 'l17-metis-line-1',
      familyId: 'l17-document-locate',
      prompt: 'What did the Act\'s definition change for Métis?',
      options: [
        {
          id: 'a',
          text: 'It named Métis in the constitution for the first time.'
        },
        {
          id: 'b',
          text: 'It removed Métis from the Act\'s peoples.'
        },
        {
          id: 'c',
          text: 'It defined Métis as provincial residents only.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source P\'s definition names Indian, Inuit, and Métis — and Source Q confirms the first-time recognition and its legal foothold.',
        b: 'The definition includes, not removes — \'includes the Indian, Inuit and Métis peoples\' (Source P).',
        c: 'No province appears in Source P; the definition is national, and the foothold is for rights and claims (Source Q).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l17-sidelines-1',
      contentVersion: '1',
      lessonId: 't1-l17-land-knowledge-constitution',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L17-G'],
      stimulusId: 'l17-sidelines-1',
      familyId: 'l17-context-apply',
      prompt: 'Why did Aboriginal efforts \'take place from the sidelines\'?',
      options: [
        {
          id: 'a',
          text: 'Leaders were denied an official place in the discussions.'
        },
        {
          id: 'b',
          text: 'Leaders chose to boycott the talks entirely.'
        },
        {
          id: 'c',
          text: 'The constitution was already signed before talks began.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source G states the denial directly — sidelined, not absent by choice.',
        b: 'Source G shows leaders trying to secure a part, not boycotting — the boycott reading reverses the evidence.',
        c: 'The talks Source G describes came before patriation; the 1981 protests (Source J) still changed the text.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l17-sort-1',
      contentVersion: '1',
      lessonId: 't1-l17-land-knowledge-constitution',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L17-A', 'L17-L', 'L17-P'],
      stimulusId: 'l17-sort-1',
      familyId: 'l17-three-sort',
      prompt: 'Which statement is document wording — not a lived teaching or an attributed concern?',
      options: [
        {
          id: 'a',
          text: '\'I have never heard Native people say they own the land.\' (Source A)'
        },
        {
          id: 'b',
          text: '\'Leaders feared an individual might use the Charter to override Aboriginal rights.\' (Source L)'
        },
        {
          id: 'c',
          text: '\'Aboriginal peoples of Canada includes the Indian, Inuit and Métis peoples of Canada.\' (Source P)'
        }
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Source A is a lived teaching — Carpenter\'s land ethic from experience, not text from the Act. The document wording names the Act\'s peoples (Source P).',
        b: 'Source L states an attributed concern — leaders\' warning about Charter readings. Warnings evidence what was feared; only the Act\'s own lines evidence what was enacted (Source P).',
        c: 'Correct. Source P quotes the Act\'s definition — document wording. Sorting it apart from lived teaching (Source A) and attributed concern (Source L) is the inference the lesson requires: each kind of source supports a different kind of claim.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l17-independent-1',
      contentVersion: '1',
      lessonId: 't1-l17-land-knowledge-constitution',
      mode: 'written',
      sourceIds: ['L17-B', 'L17-Q'],
      familyId: 'l17-carpenter-constitution',
      prompt: 'Using Source B and Source Q, explain one connection between Carpenter\'s ethic and the 1982 recognition.',
      criteria: ['States the Source B detail (sharing within need / invitation)', 'States the Source Q detail (first recognition; legal foothold)', 'Explains the link without claiming the law explains the ethic or the ethic enacted the law'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l17-independent-2',
      contentVersion: '1',
      lessonId: 't1-l17-land-knowledge-constitution',
      mode: 'written',
      sourceIds: ['L17-M', 'L17-N'],
      familyId: 'l17-gisdaywa-charter',
      prompt: 'Using Source M and Source N, explain how Gisdaywa\'s statement and Section 25 each protect group life — in different ways.',
      criteria: ['States the Source M detail (House responsibility / care / respect and balance)', 'States the Source N shield (no Charter override of Aboriginal rights)', 'Keeps the two protections distinct (lived law vs enacted provision)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l18-proposal-law-1',
      contentVersion: '1',
      lessonId: 't1-l18-constitutional-negotiations',
      mode: 'multipleChoice',
      skillTag: 'agreement-kind',
      sourceIds: ['L18-G', 'L18-L'],
      stimulusId: 'l18-proposal-law-1',
      familyId: 'l18-status-distinguish',
      prompt: 'What became law — Meech Lake, Charlottetown, or neither?',
      options: [
        {
          id: 'a',
          text: 'Neither: Meech expired and Charlottetown was rejected.'
        },
        {
          id: 'b',
          text: 'Both became constitutional law.'
        },
        {
          id: 'c',
          text: 'Meech became law; Charlottetown did not.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Expired (Source G) and rejected by 54 per cent (Source L) — two proposals, zero enactments.',
        b: 'No source enacts either accord — the chapter records an expiry and a referendum defeat.',
        c: 'Harper\'s No killed Meech before any enactment (Sources F–H); nothing in law followed.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l18-inherent-1',
      contentVersion: '1',
      lessonId: 't1-l18-constitutional-negotiations',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L18-S'],
      stimulusId: 'l18-inherent-1',
      familyId: 'l18-inherent-meaning',
      prompt: 'What does \'inherent\' mean in Source S?',
      options: [
        {
          id: 'a',
          text: 'Always held by the people — recognized, never granted.'
        },
        {
          id: 'b',
          text: 'Granted by Section 35 in 1982.'
        },
        {
          id: 'c',
          text: 'Approved by the 1992 referendum.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. \'Always been within us,\' Coon Come says — Section 35 recognizes; it does not give.',
        b: 'Source S refuses exactly this: \'Section 35 does not give us any rights.\'',
        c: 'The referendum rejected Charlottetown (Source L); inherent rights predate and survive it (Source T).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l18-harper-1',
      contentVersion: '1',
      lessonId: 't1-l18-constitutional-negotiations',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L18-H'],
      stimulusId: 'l18-harper-1',
      familyId: 'l18-harper-identify',
      prompt: 'Who halted passage of the Meech Lake Accord?',
      options: [
        {
          id: 'a',
          text: 'Manitoba MLA Elijah Harper.'
        },
        {
          id: 'b',
          text: 'Prime Minister Brian Mulroney.'
        },
        {
          id: 'c',
          text: 'National Chief Matthew Coon Come.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The chapter\'s caption names him — Manitoba MLA Elijah Harper, holding an eagle feather (Source H).',
        b: 'Mulroney approved the package at Meech Lake (Source A); Harper stopped it in Manitoba (Sources F–H).',
        c: 'Coon Come\'s press release came a decade later, in 2002 (Source S); the 1990 No was Harper\'s.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l18-features-1',
      contentVersion: '1',
      lessonId: 't1-l18-constitutional-negotiations',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L18-J'],
      stimulusId: 'l18-features-1',
      familyId: 'l18-offer-locate',
      prompt: 'What did Charlottetown offer Aboriginal peoples?',
      options: [
        {
          id: 'a',
          text: 'Inherent self-government, a third order of government, and Senate seats.'
        },
        {
          id: 'b',
          text: 'Immediate independence for Quebec.'
        },
        {
          id: 'c',
          text: 'An end to all existing treaties.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source J lists all three — the offer\'s exact contents.',
        b: 'Quebec\'s distinct society was Meech\'s language (Source B), repeated at Charlottetown — never independence.',
        c: 'Treaty Six and Seven feared for their treaties (Source N); no offer ended any.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l18-bilateral-demand-1',
      contentVersion: '1',
      lessonId: 't1-l18-constitutional-negotiations',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L18-N', 'L18-O'],
      stimulusId: 'l18-bilateral-demand-1',
      familyId: 'l18-bilateral-demand',
      prompt: 'What process did Treaty Six and Seven First Nations demand?',
      options: [
        {
          id: 'a',
          text: 'Bilateral, nation-to-nation talks with the Crown.'
        },
        {
          id: 'b',
          text: 'A multilateral constitutional conference.'
        },
        {
          id: 'c',
          text: 'A Supreme Court ruling on the accords.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Sources N and O: treaty talks belong in a bilateral nation-to-nation process — the multilateral route violated their agreements.',
        b: 'The multilateral process is what they condemned (p. 83), not what they sought.',
        c: 'No court appears in Sources N–O; the demand is for Crown talks, not rulings.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l18-sequence-1',
      contentVersion: '1',
      lessonId: 't1-l18-constitutional-negotiations',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L18-A', 'L18-C', 'L18-G', 'L18-K'],
      stimulusId: 'l18-sequence-1',
      familyId: 'l18-accord-order',
      prompt: 'Which dated order — with statuses — does the chapter support?',
      options: [
        {
          id: 'a',
          text: '1987 Meech proposed → June 1990 Meech expired → October 1992 Charlottetown rejected.'
        },
        {
          id: 'b',
          text: '1992 Charlottetown rejected → 1987 Meech proposed → 1990 Meech enacted.'
        },
        {
          id: 'c',
          text: '1987 Meech enacted → 1990 distinct-society law → 1992 Charlottetown enacted.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The dates hold — 1987 package, June 1990 expiry, October 1992 referendum — and the statuses with them: proposal, expired; proposal, rejected (Sources A, C, G, K, L). That dated detail is the sequence the chapter supports.',
        b: 'The chapter runs the other way — Meech precedes Charlottetown by five years — and Meech was never enacted: Harper\'s No killed it (Sources A, G, J).',
        c: 'Neither accord became law — that is the lesson\'s status fence. Meech expired (Source G) and Charlottetown lost the referendum (Source L); the claim otherwise invents enactments the chapter never states.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l18-independent-1',
      contentVersion: '1',
      lessonId: 't1-l18-constitutional-negotiations',
      mode: 'written',
      sourceIds: ['L18-D'],
      familyId: 'l18-participant-distinction',
      prompt: 'Using Source D and the lesson, explain how Aboriginal participation differed between the two negotiations.',
      criteria: ['States Meech\'s exclusion (concerns unaddressed; partners denied — Source D)', 'States Charlottetown\'s seating (AFN, Inuit Tapirisat, Métis National Council at the table, p. 82)', 'Explains the distinction without ranking which politics was best'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l18-independent-2',
      contentVersion: '1',
      lessonId: 't1-l18-constitutional-negotiations',
      mode: 'written',
      sourceIds: ['L18-C', 'L18-K'],
      familyId: 'l18-ratification-distinction',
      prompt: 'Using Sources C and K, explain how the two accords\' ratification paths differed — and how each path ended.',
      criteria: ['States Meech\'s path (every legislature by June 1990) and end (expired)', 'States Charlottetown\'s path (national referendum) and end (rejected, 54%)', 'Keeps proposal, expiry, and rejection distinct — neither became law'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l19-title-def-1',
      contentVersion: '1',
      lessonId: 't1-l19-title-treaties-constraints',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L19-A'],
      stimulusId: 'l19-title-def-1',
      familyId: 'l19-title-meaning',
      prompt: 'What is Aboriginal title?',
      options: [
        {
          id: 'a',
          text: 'A group\'s right to a specific territory: exclusive occupation plus economic benefits.'
        },
        {
          id: 'b',
          text: 'An individual\'s fee-simple ownership of reserve land.'
        },
        {
          id: 'c',
          text: 'Permission to hunt anywhere in Canada.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source A\'s definition — group right, specific territory, occupation plus benefits from longstanding occupancy.',
        b: 'Title is collective and sui generis (Source C) — fee simple is what title is not.',
        c: 'Hunting without title is a rights example (Source D), not the title definition.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l19-source-debate-1',
      contentVersion: '1',
      lessonId: 't1-l19-title-treaties-constraints',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L19-E', 'L19-G'],
      stimulusId: 'l19-source-debate-1',
      familyId: 'l19-source-compare',
      prompt: 'How do the two source claims about title differ?',
      options: [
        {
          id: 'a',
          text: 'Creator origin means inherent and unremovable; Crown origin means limitable.'
        },
        {
          id: 'b',
          text: 'Both agree title comes from the Royal Proclamation.'
        },
        {
          id: 'c',
          text: 'Both agree title can never be defined.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source E\'s Creator title cannot be removed or limited; Source G\'s Crown title can be limited or extinguished.',
        b: 'Only the governments\' interpretation stems from the Proclamation (Source F); First Nations and Inuit maintain Creator origin (Source E).',
        c: 'Only Source E claims indefinability; Source G\'s whole point is that Crown-derived title can be limited.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l19-test-1',
      contentVersion: '1',
      lessonId: 't1-l19-title-treaties-constraints',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L19-H'],
      stimulusId: 'l19-test-1',
      familyId: 'l19-test-locate',
      prompt: 'What must a group show under the Aboriginal Title Test?',
      options: [
        {
          id: 'a',
          text: 'Pre-sovereignty occupation, exclusive occupation, still-living connection.'
        },
        {
          id: 'b',
          text: 'A written deed signed before contact.'
        },
        {
          id: 'c',
          text: 'Provincial approval of its land claim.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source H\'s three parts — occupation before sovereignty, exclusivity, and substantial connection still held.',
        b: 'No deed appears in Source H — occupation is provable through traditional laws.',
        c: 'No province appears in Source H; the test runs on occupation, exclusivity, and connection.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l19-delgamuukw-1',
      contentVersion: '1',
      lessonId: 't1-l19-title-treaties-constraints',
      mode: 'multipleChoice',
      skillTag: 'evidence-selection',
      sourceIds: ['L19-M'],
      stimulusId: 'l19-delgamuukw-1',
      familyId: 'l19-case-locate',
      prompt: 'What did Delgamuukw (1997) decide about oral history?',
      options: [
        {
          id: 'a',
          text: 'It equals written records and can establish title.'
        },
        {
          id: 'b',
          text: 'It is inadmissible in land cases.'
        },
        {
          id: 'c',
          text: 'It abolished Aboriginal title.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source M\'s two holdings — equality with written records, title-establishing power.',
        b: 'Source M rules the opposite: oral history counts equal and can establish title.',
        c: 'The decision strengthens title proof; it abolishes nothing.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l19-mortgage-1',
      contentVersion: '1',
      lessonId: 't1-l19-title-treaties-constraints',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L19-Q'],
      stimulusId: 'l19-mortgage-1',
      familyId: 'l19-constraint-apply',
      prompt: 'Why can\'t the community raise business capital?',
      options: [
        {
          id: 'a',
          text: 'Reserve land cannot be sold or mortgaged.'
        },
        {
          id: 'b',
          text: 'The Manitoba Act banned all businesses.'
        },
        {
          id: 'c',
          text: 'Title requires giving up hunting rights.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source Q\'s chain — no sale or mortgage, no capital for ventures or housing loans.',
        b: 'The Manitoba Act example concerns scrip surrender (Source O), not a business ban.',
        c: 'No source trades title for hunting rights; Source D keeps rights exercisable without title.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l19-title-1',
      contentVersion: '1',
      lessonId: 't1-l19-title-treaties-constraints',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L19-A', 'L19-D', 'L19-Q'],
      stimulusId: 'l19-title-1',
      familyId: 'l19-title-sort',
      prompt: 'Which statement describes Aboriginal title — not a treaty right or a reserve rule?',
      options: [
        {
          id: 'a',
          text: 'A group\'s right to a specific territory: exclusive occupation plus economic benefits from longstanding occupancy.'
        },
        {
          id: 'b',
          text: 'The right to hunt or fish on Crown land without holding title to that land.'
        },
        {
          id: 'c',
          text: 'Land that cannot be sold or mortgaged, so communities cannot raise business capital.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Exclusive occupation plus economic benefits from longstanding occupancy is Source A\'s definition — title is about the group\'s land itself, and only it.',
        b: 'Hunting or fishing without title is Source D\'s treaty-rights example — an activity right exercisable on Crown land. Rights evidence activities; title evidences the land.',
        c: 'No sale or mortgage is the reserve-land constraint from Source Q — an Indian Act rule about capital, not the title definition. The sort holds only when each statement meets its own source: title claims land, rights claim activities, reserve rules constrain dealing.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l19-independent-1',
      contentVersion: '1',
      lessonId: 't1-l19-title-treaties-constraints',
      mode: 'written',
      sourceIds: ['L19-D'],
      familyId: 'l19-title-rights',
      prompt: 'Using Source D, explain the title/rights distinction and give the chapter\'s Crown-land example.',
      criteria: ['States the distinction (title = land; rights = activities)', 'Gives the Crown-land example (hunt/fish without title)', 'Adds no activity the chapter does not name'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l19-independent-2',
      contentVersion: '1',
      lessonId: 't1-l19-title-treaties-constraints',
      mode: 'written',
      sourceIds: ['L19-J', 'L19-K'],
      familyId: 'l19-treaty-views',
      prompt: 'Using Sources J and K, explain the two readings of the treaty process — and what each reading implies about giving land.',
      criteria: ['States the First Nations reading (sharing; never theirs to give)', 'States the government\'s reading (extinguishment in exchange for rights)', 'Explains the giving implication without merging the two readings'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l20-nrta-1',
      contentVersion: '1',
      lessonId: 't1-l20-harvesting-rights',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L20-A', 'L20-B'],
      stimulusId: 'l20-nrta-1',
      familyId: 'l20-nrta-meaning',
      prompt: 'What did the Natural Resources Transfer Agreements do?',
      options: [
        {
          id: 'a',
          text: 'In 1930 they moved Crown land to four western provinces, with harvesting protections.'
        },
        {
          id: 'b',
          text: 'They abolished all First Nations reserves.'
        },
        {
          id: 'c',
          text: 'They wrote Section 35 into the constitution.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Four provinces, federal land to provincial hands, 1930 — with Sections 10 and 12 fencing reserves and harvesting (Sources A–D).',
        b: 'Reserves stayed federal — Section 10 excluded them from transfer (Source D).',
        c: 'Section 35 came in 1982, half a century later (Source L); the NRTAs date to 1930 (Source B).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l20-subsistence-1',
      contentVersion: '1',
      lessonId: 't1-l20-harvesting-rights',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L20-C', 'L20-J'],
      stimulusId: 'l20-subsistence-1',
      familyId: 'l20-subsistence-meaning',
      prompt: 'After Badger, what harvesting do the NRTAs protect?',
      options: [
        {
          id: 'a',
          text: 'Subsistence hunting, trapping, and fishing for food.'
        },
        {
          id: 'b',
          text: 'Unlimited commercial harvesting of all resources.'
        },
        {
          id: 'c',
          text: 'No harvesting of any kind.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Section 12\'s food harvesting stands (Source C); commercial harvesting was extinguished (Source J).',
        b: 'Badger ended exactly this — the NRTAs extinguished commercial rights, overriding treaty promise (Source J).',
        c: 'Subsistence harvesting survives fully — at all seasons, on unoccupied Crown land (Sources C, F, G).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l20-outside-1',
      contentVersion: '1',
      lessonId: 't1-l20-harvesting-rights',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L20-G'],
      stimulusId: 'l20-outside-1',
      familyId: 'l20-scope-locate',
      prompt: 'The \'even outside the province\' reach in Source G depends on what?',
      options: [
        {
          id: 'a',
          text: 'Treaty rights, unoccupied Crown land, and food purpose.'
        },
        {
          id: 'b',
          text: 'Nothing — it applies to everyone everywhere.'
        },
        {
          id: 'c',
          text: 'Provincial permission granted each year.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source G\'s reach sits inside Source F\'s bounds — treaty holders, Crown land, food.',
        b: 'Every bound matters: people, place, and purpose all stated (Sources F, G).',
        c: 'No annual permission appears — the right flows from treaty and court readings (Sources C, G).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l20-distinctive-1',
      contentVersion: '1',
      lessonId: 't1-l20-harvesting-rights',
      mode: 'multipleChoice',
      skillTag: 'wording-support',
      sourceIds: ['L20-P'],
      stimulusId: 'l20-distinctive-1',
      familyId: 'l20-q80-locate',
      prompt: 'For modern resource use, what must the practice be part of?',
      options: [
        {
          id: 'a',
          text: 'The distinctive culture of the group.'
        },
        {
          id: 'b',
          text: 'A federal statute passed after 1982.'
        },
        {
          id: 'c',
          text: 'Provincial park regulations.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source P\'s exact answer — part of the distinctive culture, rooted pre-contact, living in modern form.',
        b: 'No statute appears in Source P — the test runs on culture, roots, and continuity (Sources P, Y).',
        c: 'Parks narrow rights; they never define the test (Sources O, P).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l20-powley-scope-1',
      contentVersion: '1',
      lessonId: 't1-l20-harvesting-rights',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L20-U'],
      stimulusId: 'l20-powley-scope-1',
      familyId: 'l20-jurisdiction-apply',
      prompt: 'Where does the Powley decision bind?',
      options: [
        {
          id: 'a',
          text: 'Ontario only — persuasive precedent everywhere else.'
        },
        {
          id: 'b',
          text: 'Every province and territory as binding law.'
        },
        {
          id: 'c',
          text: 'Nowhere — it was overturned.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Ontario-only binding with national persuasive force (Source U) — jurisdiction made visible.',
        b: 'Source U states the Ontario limit plainly; \'hailed as precedent\' is not \'binding everywhere.\'',
        c: 'No overturning appears — Powley stands, bounded (Sources S, U).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l20-paraphrase-1',
      contentVersion: '1',
      lessonId: 't1-l20-harvesting-rights',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L20-F', 'L20-G', 'L20-C'],
      stimulusId: 'l20-paraphrase-1',
      familyId: 'l20-bounded-paraphrase',
      prompt: 'Which paraphrase of Question 79 stays inside the chapter\'s bounds?',
      options: [
        {
          id: 'a',
          text: 'First Nations people with treaty rights can hunt, fish, and trap for food on unoccupied Crown land, even outside their province.'
        },
        {
          id: 'b',
          text: 'All Aboriginal peoples can hunt, fish, and trap anywhere in Canada at any time for any purpose.'
        },
        {
          id: 'c',
          text: 'First Nations people can hunt, fish, and trap commercially on any land, since treaties promised it.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Treaty-rights holders, food purpose, unoccupied Crown land, outside-province reach — every bound the chapter states (Sources C, F, G).',
        b: 'Each dropped bound breaks the claim: Métis protection is still argued (Source K), rights stay geographically specific (Source O), and purpose matters — food, not anything (Source G).',
        c: 'Badger extinguished commercial harvesting under the NRTAs, overriding the treaty promise (Source J). Treaties promise; courts bound — the evidence supports subsistence, not sale.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l20-independent-1',
      contentVersion: '1',
      lessonId: 't1-l20-harvesting-rights',
      mode: 'written',
      sourceIds: ['L20-X'],
      familyId: 'l20-ubcic-scope',
      prompt: 'Using Source X, explain what the UBCIC statement supports and one thing it leaves uncertain.',
      criteria: ['States what Source X supports (pre-existing, inviolable rights from time immemorial)', 'Names one uncertainty (for example, a specific harvest\'s court bounds, or Métis dating)', 'Determines no one\'s current legal permission'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l20-independent-2',
      contentVersion: '1',
      lessonId: 't1-l20-harvesting-rights',
      mode: 'written',
      sourceIds: ['L20-T'],
      familyId: 'l20-sharpe-scope',
      prompt: 'Using Source T, explain what Sharpe\'s ruling supports and one thing it leaves uncertain.',
      criteria: ['States what Source T supports (identification uncertainty cannot justify denying rights)', 'Names one uncertainty (for example, how identification gets settled, or where the ruling binds)', 'Determines no one\'s current legal permission'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l21-inherent-1',
      contentVersion: '1',
      lessonId: 't1-l21-rebuilding-goals',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L21-D'],
      stimulusId: 'l21-inherent-1',
      familyId: 'l21-inherent-meaning',
      prompt: 'Where does the inherent right to self-government come from?',
      options: [
        {
          id: 'a',
          text: 'The Creator for First Nations and Inuit; a uniquely Canadian position for Métis.'
        },
        {
          id: 'b',
          text: 'A 1998 federal grant to all bands.'
        },
        {
          id: 'c',
          text: 'Provincial legislation in each province.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source D\'s two sources — Creator and uniquely Canadian indigeneity.',
        b: '1998 brought pledges, not grants of inherence (Source K); inherent predates all of it (Source D).',
        c: 'No province grants this right in the chapter — it is inherent, then negotiated (Sources D, P).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l21-tripartite-1',
      contentVersion: '1',
      lessonId: 't1-l21-rebuilding-goals',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L21-Z'],
      stimulusId: 'l21-tripartite-1',
      familyId: 'l21-tripartite-meaning',
      prompt: 'Who are the three partners in self-government negotiations?',
      options: [
        {
          id: 'a',
          text: 'The federal government, a provincial or territorial government, and Aboriginal governments.'
        },
        {
          id: 'b',
          text: 'The federal government, the courts, and the media.'
        },
        {
          id: 'c',
          text: 'Three Aboriginal organizations acting alone.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source Z\'s tripartite table — federal, provincial/territorial, Aboriginal.',
        b: 'Courts influence and media report, but neither sits at the table (Sources Z, AA).',
        c: 'Aboriginal governments are one partner of three — federal and provincial chairs complete it (Source Z).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l21-rcap-1',
      contentVersion: '1',
      lessonId: 't1-l21-rebuilding-goals',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L21-E', 'L21-F'],
      stimulusId: 'l21-rcap-1',
      familyId: 'l21-rcap-locate',
      prompt: 'What was the Royal Commission\'s scale?',
      options: [
        {
          id: 'a',
          text: '1990–1996: 178 hearing days, 3500 witnesses, six volumes.'
        },
        {
          id: 'b',
          text: 'One summer: three meetings and a pamphlet.'
        },
        {
          id: 'c',
          text: 'A single court case decided in 1998.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Six years, 178 days, 3500 witnesses, six volumes calling for renewed relationship (Sources E, F).',
        b: 'The chapter\'s numbers dwarf this — 178 days and 3500 witnesses (Source F).',
        c: 'The Commission inquired and recommended; it decided no case (Sources E–G).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l21-pledge-1',
      contentVersion: '1',
      lessonId: 't1-l21-rebuilding-goals',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L21-K'],
      stimulusId: 'l21-pledge-1',
      familyId: 'l21-pledge-locate',
      prompt: 'What was Gathering Strength?',
      options: [
        {
          id: 'a',
          text: 'The 1998 federal response: regret plus a new-relationship plan with pledges.'
        },
        {
          id: 'b',
          text: 'A 1982 constitutional accord.'
        },
        {
          id: 'c',
          text: 'A Supreme Court ruling on harvesting.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. January 1998 response document — regret for past damage, then pledges on treaties, self-government, funding, and programs (Source K, p. 99).',
        b: '1982 is the Constitution Act (Lesson 17); Gathering Strength answers the 1996 report (Source K).',
        c: 'No court ruled here — a government responded with a plan (Source K).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l21-mandate-1',
      contentVersion: '1',
      lessonId: 't1-l21-rebuilding-goals',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L21-AA'],
      stimulusId: 'l21-mandate-1',
      familyId: 'l21-mandate-apply',
      prompt: 'Why can negotiations stall even in good faith?',
      options: [
        {
          id: 'a',
          text: 'Each level brings its own mandate and priorities to the table.'
        },
        {
          id: 'b',
          text: 'The rooms seat too few negotiators.'
        },
        {
          id: 'c',
          text: 'Aboriginal governments refuse all meetings.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Three mandates, three priority sets — relevant or not, all play at the table (Source AA).',
        b: 'No room size appears — the friction is mandates, not furniture (Source AA).',
        c: 'The chapter shows engagement through commissions, policies, and stages — not refusal (Sources E–V).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l21-link-1',
      contentVersion: '1',
      lessonId: 't1-l21-rebuilding-goals',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L21-A', 'L21-U', 'L21-V'],
      stimulusId: 'l21-link-1',
      familyId: 'l21-goal-link',
      prompt: 'Which goal–example–question link does the chapter support?',
      options: [
        {
          id: 'a',
          text: 'Economic goal (A) → Janvier-style negotiated settlement (p. 101) → who funds and implements, and when (U, V).'
        },
        {
          id: 'b',
          text: 'Cultural-services goal → automatic federal funding with no negotiation needed.'
        },
        {
          id: 'c',
          text: 'Political-control goal → immediate constitutional amendment in 1998.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The promise (Source A), a documented negotiated outcome (p. 101), and the implementation questions the chapter requires (Sources U, V) — goal, example, and open authority question linked.',
        b: 'No source funds anything automatically — money moves through negotiated agreements with implementation plans fixing contributions (Sources U, V). The claim skips the machine.',
        c: 'No 1998 amendment exists in this chapter — Gathering Strength is a plan and pledges (Source K), and recognition stays unamended while talks proceed. Promises evidence intent, not enactment.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l21-independent-1',
      contentVersion: '1',
      lessonId: 't1-l21-rebuilding-goals',
      mode: 'written',
      sourceIds: ['L21-C'],
      familyId: 'l21-cardinal-argument',
      prompt: 'Using Source C, explain Cardinal\'s argument and its evidence without presenting it as an outcome.',
      criteria: ['States Cardinal\'s demand (true independence; regained everyday decisions)', 'Names his supporting ground (parents\' rights; livelihood reflecting identity)', 'Keeps the demand advocated, never reported as achieved'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l21-independent-2',
      contentVersion: '1',
      lessonId: 't1-l21-rebuilding-goals',
      mode: 'written',
      sourceIds: ['L21-J'],
      familyId: 'l21-one-size',
      prompt: 'Using Source J, explain why one size cannot fit all — and what the Commission proposed instead.',
      criteria: ['States the reason (diversity of cultures and history)', 'States the alternative (diverse selection of models; three noted)', 'Adds no model the chapter does not name here'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l22-enshrine-1',
      contentVersion: '1',
      lessonId: 't1-l22-models',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L22-D'],
      stimulusId: 'l22-enshrine-1',
      familyId: 'l22-enshrine-meaning',
      prompt: 'What are the benefits of enshrining self-government in the Constitution?',
      options: [
        {
          id: 'a',
          text: 'Unremovable by other levels, symbolic with practical meaning, community accountability.'
        },
        {
          id: 'b',
          text: 'Faster agreement within weeks.'
        },
        {
          id: 'c',
          text: 'Freedom from all financial limits.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source D\'s three benefits — protection, symbolism with powers, answerability to communities.',
        b: 'The chapter warns the opposite — agreement could take decades (Source E).',
        c: 'No freedom from limits appears — resources stay a stated constraint (Sources B, E).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l22-delegation-1',
      contentVersion: '1',
      lessonId: 't1-l22-models',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L22-M'],
      stimulusId: 'l22-delegation-1',
      familyId: 'l22-delegation-meaning',
      prompt: 'What is the core risk of delegated powers?',
      options: [
        {
          id: 'a',
          text: 'They can be changed or taken away by the delegating level.'
        },
        {
          id: 'b',
          text: 'They automatically become constitutional rights.'
        },
        {
          id: 'c',
          text: 'They apply only on weekends.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Lent powers return — legislation giveth and legislation can taketh (Source M).',
        b: 'Delegation is the opposite of enshrinement — compare Sources D and M.',
        c: 'No schedule appears — the risk is revocability, not timing (Source M).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l22-nunavut-1',
      contentVersion: '1',
      lessonId: 't1-l22-models',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L22-I'],
      stimulusId: 'l22-nunavut-1',
      familyId: 'l22-example-locate',
      prompt: 'What is a current example of an Aboriginal public government?',
      options: [
        {
          id: 'a',
          text: 'Nunavut.'
        },
        {
          id: 'b',
          text: 'The Sechelt Indian Band.'
        },
        {
          id: 'c',
          text: 'The Cree of Northern Quebec.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The chapter\'s one-line example — Nunavut is a current public government (Source I).',
        b: 'Sechelt is municipal legislation, Bill C-43 (Source K) — not public government.',
        c: 'The Cree 1984 first is municipal legislation (Source J) — not public government.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l22-sechelt-1',
      contentVersion: '1',
      lessonId: 't1-l22-models',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L22-J', 'L22-K'],
      stimulusId: 'l22-sechelt-1',
      familyId: 'l22-bill-locate',
      prompt: 'Which bill, and which first, does the chapter give for municipal government?',
      options: [
        {
          id: 'a',
          text: 'Bill C-43 (1986 Sechelt); the 1984 Cree first came by unnamed legislation.'
        },
        {
          id: 'b',
          text: 'Bill C-43 created the 1984 Cree government.'
        },
        {
          id: 'c',
          text: 'No bill is named anywhere.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The honest pair — 1984 Cree first, unnamed (Source J); C-43 named for 1986 Sechelt (Source K).',
        b: 'C-43 is 1986 Sechelt — the 1984 Cree first predates it by unnamed legislation (Sources J, K).',
        c: 'C-43 is named with its full Act title (Source K); only the 1984 instrument is unnamed (Source J).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l22-urban-1',
      contentVersion: '1',
      lessonId: 't1-l22-models',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L22-N', 'L22-O'],
      stimulusId: 'l22-urban-1',
      familyId: 'l22-context-apply',
      prompt: 'Which model fits urban peoples without a land base?',
      options: [
        {
          id: 'a',
          text: 'The community-of-interest model.'
        },
        {
          id: 'b',
          text: 'The third-order model only.'
        },
        {
          id: 'c',
          text: 'None — the chapter offers nothing.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Nearly alone for diverse landless communities — delegated powers for urban peoples (Sources N, O).',
        b: 'Third order needs constitutional jurisdictions (Source C); the urban answer is community of interest (Sources N, O).',
        c: 'The chapter offers exactly this — the Commission\'s urban design (Source N).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l22-match-1',
      contentVersion: '1',
      lessonId: 't1-l22-models',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L22-I', 'L22-K', 'L22-O'],
      stimulusId: 'l22-match-1',
      familyId: 'l22-feature-match',
      prompt: 'Which feature–model match does the chapter support?',
      options: [
        {
          id: 'a',
          text: 'Nunavut — public government; Sechelt 1986 — municipal legislation; urban landless — community of interest.'
        },
        {
          id: 'b',
          text: 'Nunavut — municipal district; Sechelt — third order; Cree 1984 — public government.'
        },
        {
          id: 'c',
          text: 'All models need constitutional amendment; none works through legislation.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Nunavut exemplifies public government (Source I), Sechelt\'s Bill C-43 is municipal legislation (Source K), and landless urban peoples meet the community-of-interest design (Source O) — each match resting on its cited detail.',
        b: 'Every match is crossed: Nunavut is public (Source I), Sechelt municipal (Source K), and the Cree 1984 first is municipal legislation (Source J). Re-match each example to its own source.',
        c: 'Municipal government works precisely through legislation (Sources J, K) — and only the third-order model needs the constitution (Source C). The claim flattens four models into one.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l22-independent-1',
      contentVersion: '1',
      lessonId: 't1-l22-models',
      mode: 'written',
      sourceIds: ['L22-C', 'L22-J'],
      familyId: 'l22-authority-compare',
      prompt: 'Using Sources C and J, explain how third-order and municipal authority differ — and what follows for accountability.',
      criteria: ['States the authority difference (constitutional order vs legislation)', 'States the accountability follow (communities vs delegating level)', 'Cites both sources with locators; invents no power'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l22-independent-2',
      contentVersion: '1',
      lessonId: 't1-l22-models',
      mode: 'written',
      sourceIds: ['L22-D', 'L22-M'],
      familyId: 'l22-protection-flex',
      prompt: 'Using Sources D and M, explain the protection/flexibility trade between enshrined and delegated powers.',
      criteria: ['States the enshrined side (unremovable; symbolic; community-accountable)', 'States the delegated side (quick; revocable)', 'Evaluates fit without declaring a universal best'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l23-guswentah-1',
      contentVersion: '1',
      lessonId: 't1-l23-synthesis',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L23-A', 'L23-B'],
      stimulusId: 'l23-guswentah-1',
      familyId: 'l23-treaty-meaning',
      prompt: 'What was the Guswentah?',
      options: [
        {
          id: 'a',
          text: 'The 1645 first Haudenosaunee–European treaty, proposing mutual respect and peaceful co-existence.'
        },
        {
          id: 'b',
          text: 'A 1982 constitutional accord.'
        },
        {
          id: 'c',
          text: 'A 1930 land-transfer agreement.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Among the earliest First Nations–European treaties (Source A); first for the Haudenosaunee, with a mutual-respect proposal (Source B).',
        b: '1982 is the Constitution Act (Lesson 17); the Guswentah dates to 1645 (Source B).',
        c: '1930 is the NRTA year (Lesson 20); the Guswentah predates it by centuries (Source B).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l23-relationship-1',
      contentVersion: '1',
      lessonId: 't1-l23-synthesis',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L23-B', 'L17-A'],
      stimulusId: 'l23-relationship-1',
      familyId: 'l23-relationship-meaning',
      prompt: 'What claim do the Guswentah proposal and Carpenter\'s ethic both support?',
      options: [
        {
          id: 'a',
          text: 'Relationship without domination: use without ownership, alliance without steering.'
        },
        {
          id: 'b',
          text: 'That treaties were land sales for cash.'
        },
        {
          id: 'c',
          text: 'That only written documents bind nations.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Mutual respect beside no-ownership (Sources B, L17-A) — the relationship thread both sources braid.',
        b: 'Neither source sells land — Carpenter forbids ownership-talk and the Guswentah proposes respect (Sources B, L17-A).',
        c: 'The theme\'s arc runs the other way — oral tradition carries law equal to text (Lesson 19, Source M).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l23-dutch-1',
      contentVersion: '1',
      lessonId: 't1-l23-synthesis',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L23-B'],
      stimulusId: 'l23-dutch-1',
      familyId: 'l23-detail-locate',
      prompt: 'Why did the Dutch seek agreement with the Haudenosaunee?',
      options: [
        {
          id: 'a',
          text: 'To establish a trading fort on Haudenosaunee lands.'
        },
        {
          id: 'b',
          text: 'To found a missionary colony.'
        },
        {
          id: 'c',
          text: 'To recruit soldiers for Europe.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source B\'s stated motive — a trading fort, answered by a mutual-respect proposal.',
        b: 'No mission appears in Sources A–C — the motive is trade, the answer respect.',
        c: 'No army appears in Sources A–C — the Dutch wanted a fort for trade.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l23-values-1',
      contentVersion: '1',
      lessonId: 't1-l23-synthesis',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L23-C'],
      stimulusId: 'l23-values-1',
      familyId: 'l23-values-locate',
      prompt: 'What do the Seventh Generation, Great Law, and Two Row form the basis for?',
      options: [
        {
          id: 'a',
          text: 'Kanien:keha\'ka values and beliefs.'
        },
        {
          id: 'b',
          text: 'Dutch trading profits.'
        },
        {
          id: 'c',
          text: 'Federal funding formulas.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Source C\'s exact holding — the concepts ground a living values system.',
        b: 'Profits belong to no source here — Source C speaks of values and beliefs.',
        c: 'Funding belongs to Lesson 21\'s implementation (Sources U–V) — not to this passage.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l23-group-lens-1',
      contentVersion: '1',
      lessonId: 't1-l23-synthesis',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L23-C', 'L20-V'],
      stimulusId: 'l23-group-lens-1',
      familyId: 'l23-lens-apply',
      prompt: 'Read through Lesson 20\'s group-rights lens, what kind of good is Source C\'s values basis?',
      options: [
        {
          id: 'a',
          text: 'A group-held good: concepts a people carry as a people.'
        },
        {
          id: 'b',
          text: 'An individual possession like a deed.'
        },
        {
          id: 'c',
          text: 'A federal program delivered per person.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Values carried by the Kanien:keha\'ka as a people (Source C) — group-level goods, group-held rights (Lesson 20, Source V).',
        b: 'Deeds individualize; Source C collectivizes — the basis belongs to the people\'s life together.',
        c: 'No program delivers this — the reading describes a people\'s own concepts, not a service.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l23-inference-1',
      contentVersion: '1',
      lessonId: 't1-l23-synthesis',
      mode: 'multipleChoice',
      skillTag: 'response-sort',
      sourceIds: ['L23-A', 'L23-B'],
      stimulusId: 'l23-inference-1',
      familyId: 'l23-unsupported-inference',
      prompt: 'A student writes: (1) The Guswentah was the first treaty the Haudenosaunee negotiated with Europeans. (2) It created a Dutch colony governed from Amsterdam. (3) It proposed mutual respect and peaceful co-existence. Which sentence makes a claim no source supports?',
      options: [
        {
          id: 'a',
          text: 'Sentence 1 — the first-treaty claim.'
        },
        {
          id: 'b',
          text: 'Sentence 2 — the Dutch-colony claim.'
        },
        {
          id: 'c',
          text: 'Sentence 3 — the mutual-respect claim.'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Sentence 1 is supported — Source B states the 1645 first treaty directly. Look for the sentence with no source behind it.',
        b: 'Correct. Sentence 2\'s colony detail has no source behind it — Source B proposes mutual respect and peaceful co-existence, not colonial rule. The inference from fort to colony is the unsupported claim. Targeted review: re-read Source B, then revisit Lesson 17\'s lived-teaching sort.',
        c: 'Sentence 3 follows Source B almost verbatim — the proposal is mutual respect. The unsupported claim sits in sentence 2.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l23-independent-1',
      contentVersion: '1',
      lessonId: 't1-l23-synthesis',
      mode: 'written',
      sourceIds: ['L23-A', 'L23-B'],
      familyId: 'l23-guswentah-explain',
      prompt: 'Using Sources A and B, explain what the Guswentah proposed — and one thing it did not.',
      criteria: ['States the proposal (mutual respect; peaceful co-existence; 1645 first treaty)', 'Names one unsupported thing (for example, colony rule, land sale, modern holding)', 'Keeps every element traceable to Sources A–B'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l23-independent-2',
      contentVersion: '1',
      lessonId: 't1-l23-synthesis',
      mode: 'written',
      sourceIds: ['L23-C'],
      familyId: 'l23-values-explain',
      prompt: 'Using Source C, explain how the Two Row lives on beyond 1645 — and what the passage does not say.',
      criteria: ['States the living role (basis of Kanien:keha\'ka values and beliefs)', 'Names one thing the passage does not say (for example, treaty terms, dates, legal force)', 'Adds no concept the passage does not name'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      "id": "ab30-v2-l24-emphasis-1",
      "contentVersion": "2",
      "lessonId": "t2-l01-why-land-matters",
      "mode": "multipleChoice",
      "skillTag": "detail-selection",
      "sourceIds": [
        "L24-D"
      ],
      "stimulusId": "l24-emphasis-1",
      "familyId": "l24-verb-match",
      "prompt": "A student answers Question 1 with “free citizenship, land ownership, and self-government.” How should the answer change?",
      "options": [
        {
          "id": "a",
          "text": "Keep the answer — those three triumphs are the three emphases."
        },
        {
          "id": "b",
          "text": "Replace it — the three emphases are self-reliance, personal responsibility, and modern education."
        },
        {
          "id": "c",
          "text": "Shorten it — the only emphasis is modern education."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "Those ideas do appear in the speech. The question asks for the three priorities named after “emphasizes,” so a different list is needed.",
        "b": "Yes. The speech names self-reliance, personal responsibility, and modern education together. This answer includes all three priorities.",
        "c": "Modern education is one priority. Include self-reliance and personal responsibility as well."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
{
      "id": "ab30-v2-l24-wards-1",
      "contentVersion": "2",
      "lessonId": "t2-l01-why-land-matters",
      "mode": "multipleChoice",
      "skillTag": "term-meaning",
      "sourceIds": [
        "L24-A"
      ],
      "stimulusId": "l24-wards-1",
      "familyId": "l24-ends-meaning",
      "prompt": "What ends for the Nisga'a under the treaty, in Gosnell's words?",
      "options": [
        {
          "id": "a",
          "text": "Wardship and beggary in their own lands."
        },
        {
          "id": "b",
          "text": "All connection to Canadian law."
        },
        {
          "id": "c",
          "text": "The need for modern education."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "Correct. No longer wards of the state, no longer beggars in their own lands (Gosnell’s words on wardship).",
        "b": "Gosnell sets the opposite boundary — self-government within the context of Canadian law (Gosnell’s statement on self-government).",
        "c": "Modern education is one of the treaty's emphases (Gosnell’s three treaty priorities), not something the treaty ends."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
{
      "id": "ab30-v2-l24-land-1",
      "contentVersion": "2",
      "lessonId": "t2-l01-why-land-matters",
      "mode": "multipleChoice",
      "skillTag": "detail-selection",
      "sourceIds": [
        "L24-B"
      ],
      "stimulusId": "l24-land-1",
      "familyId": "l24-begins-detail",
      "prompt": "About how much land will the Nisga'a collectively own under the treaty?",
      "options": [
        {
          "id": "a",
          "text": "About 2000 square kilometres."
        },
        {
          "id": "b",
          "text": "About 200 square kilometres."
        },
        {
          "id": "c",
          "text": "Only the existing reserves."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "Correct. About 2000 square kilometres, collectively owned (Gosnell’s description of collective land ownership).",
        "b": "The figure is ten times larger — about 2000 square kilometres (Gosnell’s description of collective land ownership).",
        "c": "The treaty moves beyond the reserves Gosnell calls postage-stamp (p. 108); ownership is collective and far larger (Gosnell’s description of collective land ownership)."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
{
      "id": "ab30-v2-l24-govern-1",
      "contentVersion": "2",
      "lessonId": "t2-l01-why-land-matters",
      "mode": "multipleChoice",
      "skillTag": "claim-kind",
      "sourceIds": [
        "L24-C"
      ],
      "stimulusId": "l24-govern-1",
      "familyId": "l24-boundary-read",
      "prompt": "What boundary does Gosnell set on Nisga'a self-government?",
      "options": [
        {
          "id": "a",
          "text": "Own institutions, within the context of Canadian law."
        },
        {
          "id": "b",
          "text": "Own institutions, outside all Canadian law."
        },
        {
          "id": "c",
          "text": "Canadian institutions, with Nisga'a advisors."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "Correct. Once again governing by their own institutions — but within the context of Canadian law (Gosnell’s statement on self-government).",
        "b": "Gosnell keeps Canadian law as the context; independence from it is not claimed (Gosnell’s statement on self-government).",
        "c": "The direction runs the other way: Nisga'a institutions, Canadian legal context (Gosnell’s statement on self-government)."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
{
      "id": "ab30-v2-l24-treaty-1",
      "contentVersion": "2",
      "lessonId": "t2-l01-why-land-matters",
      "mode": "multipleChoice",
      "skillTag": "term-meaning",
      "sourceIds": [
        "L24-E"
      ],
      "stimulusId": "l24-treaty-1",
      "familyId": "l24-definition-read",
      "prompt": "In Gosnell's definition, a treaty is foremost an understanding between what?",
      "options": [
        {
          "id": "a",
          "text": "Distinct cultures, showing respect for each other's way of life."
        },
        {
          "id": "b",
          "text": "Lawyers, showing respect for procedure."
        },
        {
          "id": "c",
          "text": "Provinces, showing respect for jurisdiction."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "Correct. A sacred instrument: an understanding between distinct cultures with mutual respect (Gosnell’s definition of a treaty).",
        "b": "Gosnell defines treaty by cultures in relationship, not by legal procedure (Gosnell’s definition of a treaty).",
        "c": "The parties are distinct cultures, not provinces dividing jurisdiction (Gosnell’s definition of a treaty)."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
{
      "id": "ab30-v2-l24-triumph-1",
      "contentVersion": "2",
      "lessonId": "t2-l01-why-land-matters",
      "mode": "multipleChoice",
      "skillTag": "scope-of-inference",
      "sourceIds": [
        "L24-A",
        "L24-D"
      ],
      "stimulusId": "l24-triumph-1",
      "familyId": "l24-list-sort",
      "prompt": "'Free citizenship, land ownership, and self-government' best describes which list?",
      "options": [
        {
          "id": "a",
          "text": "Three triumphs of the treaty — not its three emphases."
        },
        {
          "id": "b",
          "text": "The three emphases of Question 1."
        },
        {
          "id": "c",
          "text": "Three things the treaty abolishes."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "Correct. Those are triumphs the speech celebrates; the emphases are self-reliance, personal responsibility, and modern education (Gosnell’s words on wardship and Gosnell’s three treaty priorities).",
        "b": "Question 1 asks what the treaty emphasizes — only Gosnell’s three treaty priorities uses that verb, and it names three different nouns.",
        "c": "The treaty ends wardship, not citizenship, land, or self-government — those begin (Gosnell’s words on wardship–C)."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
{
      "id": "ab30-v2-l24-independent-1",
      "contentVersion": "2",
      "lessonId": "t2-l01-why-land-matters",
      "mode": "written",
      "sourceIds": [
        "L24-D"
      ],
      "familyId": "l24-emphasis-explain",
      "prompt": "Explain what Gosnell means by calling a treaty a sacred instrument. Connect his definition to one change in the comparison above, such as the shift from wardship toward self-government. Name the reading and page, then identify one question about the treaty that these excerpts leave unanswered.",
      "criteria": "Explain understanding and respect between distinct cultures. Connect that meaning to a change supported by the speech, and identify Gosnell’s definition on textbook page 110. Name a question that needs further reading, such as the treaty’s complete terms or how a provision worked in practice. Your position on the treaty is not being graded here.",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
{
      "id": "ab30-v2-l24-independent-2",
      "contentVersion": "2",
      "lessonId": "t2-l01-why-land-matters",
      "mode": "written",
      "sourceIds": [
        "L24-E",
        "L24-A"
      ],
      "familyId": "l24-treaty-explain",
      "prompt": "Explain what Gosnell means by calling a treaty a sacred instrument. Connect his definition to one change in the comparison above, such as the shift from wardship toward self-government. Name the reading and page, then identify one question about the treaty that these excerpts leave unanswered.",
      "criteria": "Explain understanding and respect between distinct cultures. Connect that meaning to a change supported by the speech, and identify Gosnell’s definition on textbook page 110. Name a question that needs further reading, such as the treaty’s complete terms or how a provision worked in practice. Your position on the treaty is not being graded here.",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
{
      id: 'ab30-v2-l25-value-1',
      contentVersion: '1',
      lessonId: 't2-l05-land-values',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L25-E', 'L25-F'],
      stimulusId: 'l25-value-1',
      familyId: 'l25-row-sort',
      prompt: 'A student writes the spiritual row as \'Mother Earth — the Turton Lake Trapping School.\' What is wrong?',
      options: [
        {
          id: 'a',
          text: 'Nothing — both halves are chapter content.'
        },
        {
          id: 'b',
          text: 'The value half is wrong — Mother Earth is an economic image.'
        },
        {
          id: 'c',
          text: 'The example half is wrong — the trapping school teaches the educational value, not the spiritual one.'
        }
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Both halves are chapter content, but they belong to different rows: Mother Earth states the spiritual value (Source E) while the trapping school illustrates the educational value (p. 114). A row needs a value and its own example. Targeted review: re-read Sources E and F and sort each example to its value.',
        b: 'Mother Earth is the chapter\'s spiritual image — the land births and nourishes the people (Source E). The value half is right; the example half slipped a row down. Targeted review: match each panel example to its source before writing.',
        c: 'Correct. The value half is sound (Source E), but the trapping school belongs to the educational row (Source F): Dene teens learning on the land. The spiritual row needs a spiritual example — Sundance grounds, burial sites, or places of power (p. 113). The inference is bounded: examples prove only the value they illustrate.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l25-market-1',
      contentVersion: '1',
      lessonId: 't2-l05-land-values',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L25-A'],
      stimulusId: 'l25-market-1',
      familyId: 'l25-market-define',
      prompt: 'In the non-Aboriginal worldview, what is land\'s most prevalent value?',
      options: [
        {
          id: 'a',
          text: 'Its market price: what it can be bought or sold for.'
        },
        {
          id: 'b',
          text: 'Its spiritual kinship with the people.'
        },
        {
          id: 'c',
          text: 'Its use as a classroom.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Economic value first: price on the open market (Source A).',
        b: 'Kinship is the Aboriginal spiritual image — Mother Earth (Source E) — not the market view.',
        c: 'The classroom is the educational value (Source F); the market view prices the land (Source A).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l25-sustain-1',
      contentVersion: '1',
      lessonId: 't2-l05-land-values',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L25-B'],
      stimulusId: 'l25-sustain-1',
      familyId: 'l25-goal-read',
      prompt: 'What end goal does Source B set for Aboriginal land use?',
      options: [
        {
          id: 'a',
          text: 'Maintaining a way of life and a community.'
        },
        {
          id: 'b',
          text: 'Maximizing the return on every hectare.'
        },
        {
          id: 'c',
          text: 'Selling surplus land to fund services.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Land so much part of life that destroying it equals self-destruction — continuity is the goal (Source B).',
        b: 'Maximum return is the market goal Source A describes; Source B replaces it with continuity.',
        c: 'Sale for revenue reverses the passage: use within need, never destruction (Source B).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l25-metis-1',
      contentVersion: '1',
      lessonId: 't2-l05-land-values',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L25-D'],
      stimulusId: 'l25-metis-1',
      familyId: 'l25-metis-meaning',
      prompt: 'In the Métis culture, what does land mean?',
      options: [
        {
          id: 'a',
          text: 'Freedom and autonomy — a means to an end.'
        },
        {
          id: 'b',
          text: 'A commodity to be bought and sold.'
        },
        {
          id: 'c',
          text: 'A spiritual mother who must be worshipped.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Freedom and autonomy, a means to an independent way of life (Source D).',
        b: 'Commodity pricing is the non-Aboriginal market view (Source A), not the Métis meaning.',
        c: 'The chapter ties the Mother image to some First Nations people and describes Métis culture as less spiritually connected to land (Source E).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l25-mother-1',
      contentVersion: '1',
      lessonId: 't2-l05-land-values',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L25-E'],
      stimulusId: 'l25-mother-1',
      familyId: 'l25-boundary-read',
      prompt: 'What boundary does the chapter set on the Mother Earth expression?',
      options: [
        {
          id: 'a',
          text: 'It is used by some First Nations people — not claimed for all peoples.'
        },
        {
          id: 'b',
          text: 'It is used by every Aboriginal person in Canada.'
        },
        {
          id: 'c',
          text: 'It applies only to Métis Catholics.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. \'Some First Nations people\' use the expression; the chapter limits Métis spiritual connection (Source E).',
        b: 'The chapter says \'some\' and distinguishes Métis experience — universality is not claimed (Source E).',
        c: 'Métis culture is associated with Christian religions and less of this connection — the reverse of the claim (Source E).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l25-spring-1',
      contentVersion: '1',
      lessonId: 't2-l05-land-values',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L25-H'],
      stimulusId: 'l25-spring-1',
      familyId: 'l25-political-read',
      prompt: 'What image states the political value of land?',
      options: [
        {
          id: 'a',
          text: 'A springboard for working politically to meet community needs.'
        },
        {
          id: 'b',
          text: 'An anchor holding the community in place.'
        },
        {
          id: 'c',
          text: 'A classroom teaching the young.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Land as political springboard toward self-government (Source H).',
        b: 'The anchor is the social value — home and belonging (Source G), not the political one.',
        c: 'The classroom is the educational value (Source F); politics gets the springboard (Source H).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l25-independent-1',
      contentVersion: '1',
      lessonId: 't2-l05-land-values',
      mode: 'written',
      sourceIds: ['L25-C', 'L25-D'],
      familyId: 'l25-cultural-explain',
      prompt: 'Using Sources C and D, describe the cultural value of land — and explain what the Métis example adds.',
      criteria: ['States the cultural value (identity rooted in homeland; stories tied to ancestors\' land)', 'Explains the Métis addition (freedom and autonomy; independent way of life)', 'Keeps every element traceable to Sources C–D'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l25-independent-2',
      contentVersion: '1',
      lessonId: 't2-l05-land-values',
      mode: 'written',
      sourceIds: ['L25-I', 'L25-B'],
      familyId: 'l25-willier-explain',
      prompt: 'Using Sources B and I, explain how Willier\'s logging question applies the sustainability rule — and one thing the two cards do not settle.',
      criteria: ['States the application (take the big trees; leave the small standing; use within need)', 'Connects it to the rule (no more destroy the land than themselves)', 'Names one unsettled thing (for example, any specific forestry policy or dispute outcome)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l26-calder-1',
      contentVersion: '1',
      lessonId: 't2-l02-two-kinds-of-claims',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L26-E', 'L26-F'],
      stimulusId: 'l26-calder-1',
      familyId: 'l26-outcome-declare',
      prompt: 'A student writes \'The Calder case won the Nisga\'a their land back.\' Which correction do Sources E and F require?',
      options: [
        {
          id: 'a',
          text: 'No correction — the court awarded the Nass Valley to the Nisga\'a.'
        },
        {
          id: 'b',
          text: 'The court rejected the claim but declared title survives unless explicitly extinguished — the win was the declaration, not land.'
        },
        {
          id: 'c',
          text: 'The court declared Aboriginal title never existed as a legal concept.'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The court rejected the Nisga\'a claim on a technicality — it awarded no land (p. 120). The victory sits in the declaration beside the rejection: title survives (Source E). Targeted review: re-read Sources E and F and separate outcome from declaration.',
        b: 'Correct. Rejection plus declaration: the claim fell on a technicality while the court declared title survives without explicit extinguishment (Source E) and pre-exists Crown sovereignty (Source F). That declaration forced Ottawa\'s 1973 policy — the win was the point, not the parcel. The inference is bounded: no land changed hands.',
        c: 'That was Ottawa\'s position before Calder — that title did not exist as a legal concept (p. 121). The ruling reversed it: title exists and survives (Sources E, F). Targeted review: re-read the comparison panel\'s third column.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l26-proc-1',
      contentVersion: '1',
      lessonId: 't2-l02-two-kinds-of-claims',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L26-A'],
      stimulusId: 'l26-proc-1',
      familyId: 'l26-proc-rule',
      prompt: 'What land rule did the Royal Proclamation of 1763 set?',
      options: [
        {
          id: 'a',
          text: 'It recognized Aboriginal title and gave the Crown alone the right to negotiate its extinguishment.'
        },
        {
          id: 'b',
          text: 'It gave the Crown outright ownership of all western land.'
        },
        {
          id: 'c',
          text: 'It banned all future treaties with First Nations.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Title recognized; extinguishment negotiable only by the Crown (Source A).',
        b: 'The Proclamation recognized title — it did not grant the Crown ownership (Source A).',
        c: 'Treaty-making continued for a century and a half under the Proclamation\'s rule (Source B).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l26-leftout-1',
      contentVersion: '1',
      lessonId: 't2-l02-two-kinds-of-claims',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L26-B'],
      stimulusId: 'l26-leftout-1',
      familyId: 'l26-leftout-detail',
      prompt: 'Which peoples signed no treaties at all?',
      options: [
        {
          id: 'a',
          text: 'Métis and Inuit groups — plus some First Nations.'
        },
        {
          id: 'b',
          text: 'Only the Nisga\'a.'
        },
        {
          id: 'c',
          text: 'Every First Nation west of Ontario.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. No Métis or Inuit group signed any treaty; some First Nations were also left out (Source B).',
        b: 'The Nisga\'a are one nation among many left out — the passage names whole peoples (Source B).',
        c: 'Many First Nations did sign treaties; the passage names Métis, Inuit, and some First Nations as the left-out (Source B).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l26-petition-1',
      contentVersion: '1',
      lessonId: 't2-l02-two-kinds-of-claims',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L26-C'],
      stimulusId: 'l26-petition-1',
      familyId: 'l26-first-read',
      prompt: 'What made the Nisga\'a petition historic?',
      options: [
        {
          id: 'a',
          text: 'It was the first time a First Nation used European law to argue for its rights.'
        },
        {
          id: 'b',
          text: 'It was the first treaty signed in British Columbia.'
        },
        {
          id: 'c',
          text: 'It was the first time Ottawa funded a land claim.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The historic first was the legal strategy: European law for Aboriginal rights (Source C).',
        b: 'No B.C. treaty followed the petition — Britain referred it back to Ottawa and little happened (p. 119).',
        c: 'Ottawa did the reverse: the 1927 amendment banned fundraising for claims (Source D).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l26-block-1',
      contentVersion: '1',
      lessonId: 't2-l02-two-kinds-of-claims',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L26-D'],
      stimulusId: 'l26-block-1',
      familyId: 'l26-block-detail',
      prompt: 'What did the 1927 amendment ban, and how long did the ban last?',
      options: [
        {
          id: 'a',
          text: 'First Nations fundraising for land claims — until 1951.'
        },
        {
          id: 'b',
          text: 'All treaty payments — until 1973.'
        },
        {
          id: 'c',
          text: 'Nisga\'a hunting and fishing — until 1955.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Fundraising banned, partly in response to the petition; restriction until 1951 (Source D).',
        b: 'The ban targeted claim fundraising, not treaty payments, and lifted in 1951 (Source D).',
        c: 'Hunting and fishing are not the ban\'s subject; 1955 is the Tribal Council year, not the ban\'s end (Source D, p. 120).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l26-ceded-1',
      contentVersion: '1',
      lessonId: 't2-l02-two-kinds-of-claims',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L26-G', 'L26-H'],
      stimulusId: 'l26-ceded-1',
      familyId: 'l26-views-contrast',
      prompt: 'How do the two views of treaty lands differ?',
      options: [
        {
          id: 'a',
          text: 'The government reads surrender; many First Nations read sharing without surrender.'
        },
        {
          id: 'b',
          text: 'Both sides agree the treaties were land sales.'
        },
        {
          id: 'c',
          text: 'The government reads sharing; First Nations read surrender.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Ceded-as-given-up versus ancestors-agreeing-to-share (Sources G, H).',
        b: 'Neither side calls the treaties simple sales — the dispute is surrender versus sharing (Sources G, H).',
        c: 'The positions are reversed: surrender is the government\'s reading, sharing the First Nations reading (Sources G, H).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l26-independent-1',
      contentVersion: '1',
      lessonId: 't2-l02-two-kinds-of-claims',
      mode: 'written',
      sourceIds: ['L26-E', 'L26-F'],
      familyId: 'l26-declare-explain',
      prompt: 'Using Sources E and F, state what the Calder court declared about Aboriginal title — and what it did not do.',
      criteria: ['States the survival rule (title holds without explicit extinguishment)', 'States the consequence (title pre-exists Crown sovereignty)', 'Names one thing the ruling did not do (for example, award land or settle the claim)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l26-independent-2',
      contentVersion: '1',
      lessonId: 't2-l02-two-kinds-of-claims',
      mode: 'written',
      sourceIds: ['L26-D'],
      familyId: 'l26-laws-explain',
      prompt: 'Using Source D and page 119, explain how Ottawa changed the laws to block claims — and when the block lifted.',
      criteria: ['Names the 1927 change (fundraising ban; partly answering the petition)', 'Names the 1876 gate (arbiter of Status; claims from Status Indians only — p. 119)', 'Names the endpoints (ban until 1951; reorganization in 1955 — p. 120)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l27-aspects-1',
      contentVersion: '1',
      lessonId: 't2-l06-claims-machine',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L27-I', 'L27-J', 'L27-K', 'L27-L', 'L27-M'],
      stimulusId: 'l27-aspects-1',
      familyId: 'l27-proof-process',
      prompt: 'A student answers Question 10 with \'research, submit, review, negotiate, appeal.\' What does the question require instead?',
      options: [
        {
          id: 'a',
          text: 'Keep it — research, submit, review, negotiate, appeal are the five aspects.'
        },
        {
          id: 'b',
          text: 'Replace it — the five aspects are the criteria: organized society, immemorial occupation, exclusion, continued use, unceded title.'
        },
        {
          id: 'c',
          text: 'Replace it — the five aspects are the economic, political, social, and cultural issues.'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'That is the machine\'s process, not the claim\'s proof: research through appeal describes steps (Sources F–H), while Question 10 asks for the five criteria (Sources I–M). Targeted review: re-read the five criterion cards and group them by question.',
        b: 'Correct. Who, how long, how alone, how now, how free — organized society, immemorial occupation, exclusion, continued use, unceded title (Sources I–M). The process moves the file; the criteria prove it. The inference is bounded: criteria win merit review, not settlement.',
        c: 'Those are the Coolican negotiation issues (Source E) — what talks must weigh, not what a claim must prove. Question 10 wants the five criteria. Targeted review: separate the issues card from the criterion cards.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l27-types-1',
      contentVersion: '1',
      lessonId: 't2-l06-claims-machine',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L27-A', 'L27-B'],
      stimulusId: 'l27-types-1',
      familyId: 'l27-type-sort',
      prompt: 'Which file runs comprehensive, and which runs specific?',
      options: [
        {
          id: 'a',
          text: 'Unceded title goes comprehensive; unfulfilled obligations go specific.'
        },
        {
          id: 'b',
          text: 'Unceded title goes specific; unfulfilled obligations go comprehensive.'
        },
        {
          id: 'c',
          text: 'Both kinds run through the comprehensive door.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Never-ceded title runs comprehensive toward a modern treaty; believed non-fulfilment runs specific (Sources A, B).',
        b: 'The doors are swapped: unceded title is comprehensive, broken promises specific (Sources A, B).',
        c: 'The chapter defines two doors, not one — and the machine processes each differently (Sources A–C).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l27-policy-1',
      contentVersion: '1',
      lessonId: 't2-l06-claims-machine',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L27-D'],
      stimulusId: 'l27-policy-1',
      familyId: 'l27-policy-name',
      prompt: 'What was the name of the 1981 updated Land Claims policy?',
      options: [
        {
          id: 'a',
          text: 'In All Fairness: A Native Claims Policy.'
        },
        {
          id: 'b',
          text: 'About Time: A Native Claims Policy.'
        },
        {
          id: 'c',
          text: 'Truth and Reconciliation: A Native Claims Policy.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The 1981 update is titled In All Fairness: A Native Claims Policy (Source D).',
        b: 'That title is a booklet distractor — the chapter names In All Fairness (Source D).',
        c: 'That title is a booklet distractor — the chapter names In All Fairness (Source D).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l27-issues-1',
      contentVersion: '1',
      lessonId: 't2-l06-claims-machine',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L27-E'],
      stimulusId: 'l27-issues-1',
      familyId: 'l27-issues-list',
      prompt: 'What four issues did the Coolican Report want considered in land-claims talks?',
      options: [
        {
          id: 'a',
          text: 'Political, social, and cultural issues alongside economic ones.'
        },
        {
          id: 'b',
          text: 'Four new economic programs.'
        },
        {
          id: 'c',
          text: 'Four new reserve surveys.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Political, social, and cultural issues join the economic one — four in total (Source E).',
        b: 'The issues widen what talks weigh; they are not four new programs (Source E).',
        c: 'Surveys are not the issues — political, social, cultural, and economic weight is (Source E).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l27-icc-1',
      contentVersion: '1',
      lessonId: 't2-l06-claims-machine',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L27-H'],
      stimulusId: 'l27-icc-1',
      familyId: 'l27-icc-role',
      prompt: 'What is the ICC and what is its role?',
      options: [
        {
          id: 'a',
          text: 'An independent 1991 body holding inquiries into rejected claims; sometimes mediates.'
        },
        {
          id: 'b',
          text: 'A 1974 office launching all claims.'
        },
        {
          id: 'c',
          text: 'A court awarding reserves.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Created 1991, independent, inquiries into rejected claims, sometimes mediates (Source H).',
        b: '1974 is the ONC\'s launch year for receiving claims — the ICC reviews rejections from 1991 (Sources C, H).',
        c: 'The ICC inquires and mediates; it awards no reserves (Source H).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l27-grass-1',
      contentVersion: '1',
      lessonId: 't2-l06-claims-machine',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L27-N'],
      stimulusId: 'l27-grass-1',
      familyId: 'l27-grass-earth',
      prompt: 'What does Gladstone\'s telling distinguish?',
      options: [
        {
          id: 'a',
          text: 'Grass to use versus earth to keep for the children of the future.'
        },
        {
          id: 'b',
          text: 'Reserves to sell versus land to lease.'
        },
        {
          id: 'c',
          text: 'Treaties to sign versus laws to obey.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Grass handed over to use; earth pressed to the heart to keep for the children of the future (Source N).',
        b: 'Gladstone sells and leases nothing — use is loaned, the land itself kept (Source N).',
        c: 'The telling contrasts use with keeping, not signing with obeying (Source N).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l27-independent-1',
      contentVersion: '1',
      lessonId: 't2-l06-claims-machine',
      mode: 'written',
      sourceIds: ['L27-I', 'L27-J', 'L27-K', 'L27-L', 'L27-M'],
      familyId: 'l27-criteria-explain',
      prompt: 'Using Sources I–M, state the five comprehensive criteria — and explain which two phrases set the proof standard.',
      criteria: ['Names all five criteria (organized society; immemorial occupation; exclusion; continued use; unceded title)', 'Quotes the proof-setting phrases (\'an established fact\'; \'mostly to the exclusion\')', 'Keeps every element traceable to Sources I–M'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l27-independent-2',
      contentVersion: '1',
      lessonId: 't2-l06-claims-machine',
      mode: 'written',
      sourceIds: ['L27-D', 'L27-E'],
      familyId: 'l27-policy-explain',
      prompt: 'Using Sources D and E, explain what the 1981 policy changed — and what critics still demanded.',
      criteria: ['States the 1981 update (In All Fairness title; room to manoeuvre; stopped short of self-determination)', 'States the criticism plus the four issues (fundamentally flawed exchange; political/social/cultural alongside economic)', 'Names one thing the passages do not settle (for example, any specific claim\'s outcome)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l28-parts-1',
      contentVersion: '1',
      lessonId: 't2-l07-bigstone-specific',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L28-A', 'L28-B', 'L28-C', 'L28-D', 'L28-E'],
      stimulusId: 'l28-parts-1',
      familyId: 'l28-list-file',
      prompt: 'A student answers Question 11 with the Bigstone story alone. What is missing?',
      options: [
        {
          id: 'a',
          text: 'Nothing — Bigstone\'s story covers every aspect.'
        },
        {
          id: 'b',
          text: 'The trigger plus the other three reasons — Bigstone proves reason 1 only.'
        },
        {
          id: 'c',
          text: 'The five comprehensive criteria — organized society through unceded title.'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Bigstone proves one reason — entitlement shortfall (Sources L–N). The question asks for five parts: the trigger plus all four reasons (Sources A–E). Targeted review: re-read the reasons cards and list what Bigstone cannot cover.',
        b: 'Correct. The trigger opens (Lesson 4, Source B) and the four reasons follow (Sources B–E): obligations, takings, compensation, trusts. Bigstone then proves reason 1 as the worked file. The inference is bounded: examples illustrate reasons; they never replace the list.',
        c: 'Those are the comprehensive criteria (Lesson 4, Sources I–M) — what unceded-title claims must prove, not what specific claims allege. Question 11 wants the specific side. Targeted review: separate the criteria cards from the reasons cards.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l28-reasons-1',
      contentVersion: '1',
      lessonId: 't2-l07-bigstone-specific',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L28-C', 'L28-E'],
      stimulusId: 'l28-reasons-1',
      familyId: 'l28-reason-pair',
      prompt: 'Which pair are both federal filing reasons?',
      options: [
        {
          id: 'a',
          text: 'Illegal sale/expropriation plus mismanaged trusts/leases.'
        },
        {
          id: 'b',
          text: 'Organized society plus immemorial occupation.'
        },
        {
          id: 'c',
          text: 'Hunting rights plus fishing rights.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Unlawful takings and mishandled trusts are both on the federal list (Sources C, E).',
        b: 'Those are comprehensive criteria — proof of unceded title, not specific-claim reasons (Lesson 4, Sources I, J).',
        c: 'Hunting and fishing rights are 1981 policy gains, not filing reasons (Lesson 4, p. 122).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l28-scrip-1',
      contentVersion: '1',
      lessonId: 't2-l07-bigstone-specific',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L28-J'],
      stimulusId: 'l28-scrip-1',
      familyId: 'l28-split-count',
      prompt: 'By 1901, how had Bigstone members split between treaty and scrip?',
      options: [
        {
          id: 'a',
          text: '235 treaty, 106 scrip.'
        },
        {
          id: 'b',
          text: '106 treaty, 235 scrip.'
        },
        {
          id: 'c',
          text: 'All treaty, none scrip.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. 235 took treaty; 106 received scrip (Source J).',
        b: 'The counts are swapped — 235 treaty, 106 scrip (Source J).',
        c: 'The split is the point: 106 took scrip instead of treaty (Source J).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l28-survey-1',
      contentVersion: '1',
      lessonId: 't2-l07-bigstone-specific',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L28-K', 'L28-L'],
      stimulusId: 'l28-survey-1',
      familyId: 'l28-survey-fail',
      prompt: 'Why did the surveys fail Bigstone?',
      options: [
        {
          id: 'a',
          text: '1913 too small for growth; the 1937 top-up only partly delivered.'
        },
        {
          id: 'b',
          text: 'Surveys gave too much land too fast.'
        },
        {
          id: 'c',
          text: 'No survey was ever attempted.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Growth outran the 1913 survey; the 1937 top-up arrived only in part (Sources K, L).',
        b: 'The surveys gave too little, too late — the shortfall is the claim (Sources K, L).',
        c: 'Surveys happened in 1913 and 1937; both fell short of the actual population (Sources K–M).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l28-reversal-1',
      contentVersion: '1',
      lessonId: 't2-l07-bigstone-specific',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L28-N'],
      stimulusId: 'l28-reversal-1',
      familyId: 'l28-reversal-path',
      prompt: 'How did Bigstone\'s rejected claim get accepted for negotiation?',
      options: [
        {
          id: 'a',
          text: 'Appealed to the ISCC; Ottawa reversed itself in 1998 before the inquiry finished.'
        },
        {
          id: 'b',
          text: 'Won in the Supreme Court in 1998.'
        },
        {
          id: 'c',
          text: 'Accepted immediately in 1989.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Rejected on 1909 figures, appealed to the ISCC, accepted in 1998 mid-inquiry (Source N).',
        b: 'No court decided Bigstone — Ottawa reversed its own policy call (Source N).',
        c: 'Ottawa rejected the 1989 filing first; acceptance came in 1998 (Source N).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l28-third-1',
      contentVersion: '1',
      lessonId: 't2-l07-bigstone-specific',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L28-H'],
      stimulusId: 'l28-third-1',
      familyId: 'l28-third-kind',
      prompt: 'Who counts as a third party in a land-claim dispute?',
      options: [
        {
          id: 'a',
          text: 'Innocent residents/businesses on disputed land; sometimes other Aboriginal groups.'
        },
        {
          id: 'b',
          text: 'Only federal negotiators.'
        },
        {
          id: 'c',
          text: 'Only the media.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Innocent residents and businesses on disputed land — and sometimes other Aboriginal groups (Source H).',
        b: 'Negotiators are parties, not third parties — outsiders with interests on the land count (Source H).',
        c: 'The media report disputes; residents, businesses, and other groups hold the interests (Source H).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l28-independent-1',
      contentVersion: '1',
      lessonId: 't2-l07-bigstone-specific',
      mode: 'written',
      sourceIds: ['L28-A', 'L28-B', 'L28-C', 'L28-D', 'L28-E'],
      familyId: 'l28-five-explain',
      prompt: 'Using Sources A–E, state the five parts of a specific claim — and explain why the trigger counts as the first.',
      criteria: ['States the trigger plus all four reasons (non-fulfilment; obligations; takings; compensation; trusts)', 'Explains trigger-first (every reason is a way obligations go unfulfilled)', 'Keeps every element traceable to Sources A–E plus Lesson 4, Source B'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l28-independent-2',
      contentVersion: '1',
      lessonId: 't2-l07-bigstone-specific',
      mode: 'written',
      sourceIds: ['L28-I'],
      familyId: 'l28-urban-explain',
      prompt: 'Using Source I, explain what makes Saskatchewan\'s urban reserves different — and what the passage does not say.',
      criteria: ['States the difference (bought city land converted; Opawikoscikan 1982 first)', 'Contrasts with sprawl-swallowed rural reserves elsewhere', 'Names one thing the passage does not say (for example, any specific reserve\'s income)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l29-oka-1',
      contentVersion: '1',
      lessonId: 't2-l08-paths-resolution',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L29-F', 'L29-G', 'L29-H', 'L29-I', 'L29-J', 'L29-K'],
      stimulusId: 'l29-oka-1',
      familyId: 'l29-chain-root',
      prompt: 'A student sequences Oka as \'golf dispute, standoff, deal.\' What must the sequence add?',
      options: [
        {
          id: 'a',
          text: 'Nothing — golf dispute, standoff, deal is the whole chain.'
        },
        {
          id: 'b',
          text: 'The 1717 root with rejected claims, plus the injunction-to-standoff middle.'
        },
        {
          id: 'c',
          text: 'The Cardston tipi blockade as Oka\'s opening event.'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'That chain skips the cause and the middle: no 1717 root, no rejected claims, no injunction-to-standoff escalation (Sources G–J). Targeted review: re-read the Oka cards and chain root, trigger, escalation, standoff, deal.',
        b: 'Correct. The 1717 grant and rejected 1975/1986 claims root the crisis (Source G); the stormed barricade and killed officer turn protest into standoff (Source H); the 78 days with Mercier Bridge carry it (Sources I, J). The inference is bounded: sequence, not motives — the booklet asks for events, not dates.',
        c: 'Cardston\'s 1980 tipi blockade is a different case (Sources B, C) — borrowing its events breaks the Oka chain. Question 14 wants Oka\'s main events in order. Targeted review: keep each panel column separate.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l29-cardston-1',
      contentVersion: '1',
      lessonId: 't2-l08-paths-resolution',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L29-B'],
      stimulusId: 'l29-cardston-1',
      familyId: 'l29-blockade-date',
      prompt: 'When did the Cardston blockade take place?',
      options: [
        {
          id: 'a',
          text: 'July 21, 1980.'
        },
        {
          id: 'b',
          text: 'July 26, 1980.'
        },
        {
          id: 'c',
          text: 'July 1981.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The tipi roadblock went up in the early hours of July 21, 1980 (Source B).',
        b: 'July 26 is the RCMP breakup with dogs — five days after the blockade began (Source C).',
        c: 'The blockade and its breakup both fall in July 1980 (Sources B, C).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l29-bigclaim-1',
      contentVersion: '1',
      lessonId: 't2-l08-paths-resolution',
      mode: 'multipleChoice',
      skillTag: 'evidence-selection',
      sourceIds: ['L29-D'],
      stimulusId: 'l29-bigclaim-1',
      familyId: 'l29-attention-aim',
      prompt: 'What was the Cardston blockade meant to draw attention to?',
      options: [
        {
          id: 'a',
          text: 'The unsettled Big Claim under Cardston.'
        },
        {
          id: 'b',
          text: 'A new highway route.'
        },
        {
          id: 'c',
          text: 'A school funding vote.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The unsettled Big Claim beneath Cardston itself (Source D).',
        b: 'No highway is at issue — the blockade targeted the outstanding claim (Sources B, D).',
        c: 'No school vote is at issue — the blockade targeted the outstanding claim (Sources B, D).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l29-1717-1',
      contentVersion: '1',
      lessonId: 't2-l08-paths-resolution',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L29-G'],
      stimulusId: 'l29-1717-1',
      familyId: 'l29-root-grant',
      prompt: 'What rooted the Oka dispute long before 1990?',
      options: [
        {
          id: 'a',
          text: 'A 1717 grant without consultation, disputed ever since; 1975/1986 claims rejected.'
        },
        {
          id: 'b',
          text: 'A 1990 survey error.'
        },
        {
          id: 'c',
          text: 'A provincial park boundary.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. An unconsulted 1717 grant disputed ever since, with 1975 and 1986 rejections on top (Source G).',
        b: 'No 1990 survey error is in the chapter — the root is 1717 plus rejected claims (Source G).',
        c: 'No park boundary is at issue — the Pines title reaches back to 1717 (Sources F, G).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l29-standoff-1',
      contentVersion: '1',
      lessonId: 't2-l08-paths-resolution',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L29-H', 'L29-I'],
      stimulusId: 'l29-standoff-1',
      familyId: 'l29-standoff-turn',
      prompt: 'What turned Oka\'s barricade into an armed standoff?',
      options: [
        {
          id: 'a',
          text: 'Police stormed it against diplomacy orders; an officer was killed.'
        },
        {
          id: 'b',
          text: 'The town agreed to talks.'
        },
        {
          id: 'c',
          text: 'The bridge closed for repairs.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. A stormed barricade and a killed officer launched the 78-day standoff (Sources H, I).',
        b: 'Talks collapsed — Oka walked out and announced development (p. 133).',
        c: 'The bridge was blocked in solidarity during the standoff, not closed for repairs (Source J).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l29-lubicon-1',
      contentVersion: '1',
      lessonId: 't2-l08-paths-resolution',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L29-M'],
      stimulusId: 'l29-lubicon-1',
      familyId: 'l29-torch-event',
      prompt: 'What event did the Lubicon use to bring attention to the treatment of their land?',
      options: [
        {
          id: 'a',
          text: '1988 Olympic torch-relay demonstrations plus a press campaign.'
        },
        {
          id: 'b',
          text: 'A 1988 election boycott.'
        },
        {
          id: 'c',
          text: 'A 1988 court strike.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Demonstrations greeting the 1988 relay plus Ominayak\'s press campaign (Source M).',
        b: 'No election boycott is in the chapter — the torch relay was the stage (Source M).',
        c: 'No court strike is in the chapter — demonstrations and press releases were the tools (Source M).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l29-independent-1',
      contentVersion: '1',
      lessonId: 't2-l08-paths-resolution',
      mode: 'written',
      sourceIds: ['L29-F', 'L29-G', 'L29-H', 'L29-I', 'L29-J', 'L29-K'],
      familyId: 'l29-sequence-explain',
      prompt: 'Using Sources F–K, sequence Oka\'s main events — and state which link the golf course cannot explain alone.',
      criteria: ['Chains root, trigger, escalation, standoff, and deal in order', 'Names what the trigger alone omits (the 1717 root plus the rejected claims)', 'Keeps every element traceable to Sources F–K'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l29-independent-2',
      contentVersion: '1',
      lessonId: 't2-l08-paths-resolution',
      mode: 'written',
      sourceIds: ['L29-D', 'L29-E'],
      familyId: 'l29-voices-explain',
      prompt: 'Using Sources D and E, explain what the two Kainai voices add that the narration alone does not.',
      criteria: ['States Fox\'s addition (the Big Claim plus the lease memory)', 'States Many Chief\'s addition (the peaceful ask versus the armed response)', 'Names one thing the two cards do not settle (for example, the lease\'s legal status)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l30-status-1',
      contentVersion: '1',
      lessonId: 't2-l03-metis-non-status-claims',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L30-A'],
      stimulusId: 'l30-status-1',
      familyId: 'l30-list-imposter',
      prompt: 'A student answers Question 16 with \'scrip, enfranchisement, Act rules, and moving away.\' Which item is the imposter?',
      options: [
        {
          id: 'a',
          text: 'Nothing — all four items are on the chapter\'s list.'
        },
        {
          id: 'b',
          text: '\'Moving away\' — the card lists scrip, enfranchisement, Act rules, and register mistakes.'
        },
        {
          id: 'c',
          text: '\'Register mistakes\' — the card lists only the first three causes.'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Three are real — scrip, enfranchisement, Act rules — but \'moving away\' is invented; the fourth cause is register mistakes (Source A). Targeted review: re-read Source A and count four, then name three.',
        b: 'Correct. Scrip process, involuntary enfranchisement, and Act rules are three of the chapter\'s four causes (Source A) — \'moving away\' appears nowhere in the passage. The inference is bounded: the card lists four causes; any three answer the question.',
        c: 'Register mistakes are the chapter\'s fourth cause, not an invention (Source A). The imposter is \'moving away.\' Targeted review: memorize the four nouns, then drop any one.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l30-kakfwi-1',
      contentVersion: '1',
      lessonId: 't2-l03-metis-non-status-claims',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L30-B'],
      stimulusId: 'l30-kakfwi-1',
      familyId: 'l30-kakfwi-case',
      prompt: 'Why is Stephen Kakfwi officially non-status?',
      options: [
        {
          id: 'a',
          text: 'His grandfather gave up status to own property and open a business.'
        },
        {
          id: 'b',
          text: 'His parents were not Dene.'
        },
        {
          id: 'c',
          text: 'A register clerk misspelled the family name.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. A grandfather\'s choice made the Dene leader officially non-status (Source B).',
        b: 'Kakfwi\'s parents are Dene — heritage is not the issue; the grandfather\'s enfranchisement is (Source B).',
        c: 'No register error is in the card — the grandfather gave up status for property and business (Source B).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l30-rights-1',
      contentVersion: '1',
      lessonId: 't2-l03-metis-non-status-claims',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L30-D'],
      stimulusId: 'l30-rights-1',
      familyId: 'l30-rights-split',
      prompt: 'What is the status-rights split?',
      options: [
        {
          id: 'a',
          text: 'Status does not necessarily bring treaty rights.'
        },
        {
          id: 'b',
          text: 'Status always brings treaty rights.'
        },
        {
          id: 'c',
          text: 'Treaty rights always bring band membership.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Status usually accompanies treaty rights but never guarantees them (Source D).',
        b: 'The card states the reverse — status without treaty rights is common (Source D).',
        c: 'Band membership, usually required for treaty rights, is a separate gate (p. 136).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l30-individual-1',
      contentVersion: '1',
      lessonId: 't2-l03-metis-non-status-claims',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L30-G', 'L30-H'],
      stimulusId: 'l30-individual-1',
      familyId: 'l30-individual-why',
      prompt: 'Why did Ottawa deal only with individual Métis people?',
      options: [
        {
          id: 'a',
          text: 'Ottawa refused collective claims, dealt with individuals only, and facilitated fraud.'
        },
        {
          id: 'b',
          text: 'Ottawa preferred individuals because it was simpler.'
        },
        {
          id: 'c',
          text: 'The Métis asked to be dealt with as individuals.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Collective dealing refused, individuals only, fraud facilitated (Sources G, H).',
        b: 'Simplicity is not the chapter\'s reason — collective blocks were refused and fraud followed (Sources G, H).',
        c: 'The Métis sought collective land; Ottawa imposed individual dealing (Sources G, H).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l30-association-1',
      contentVersion: '1',
      lessonId: 't2-l03-metis-non-status-claims',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L30-I'],
      stimulusId: 'l30-association-1',
      familyId: 'l30-provincial-turn',
      prompt: 'What was different about the Métis Association of Alberta?',
      options: [
        {
          id: 'a',
          text: 'It pursued land rights with the province, plus schools, care, and permits.'
        },
        {
          id: 'b',
          text: 'It petitioned the federal government again.'
        },
        {
          id: 'c',
          text: 'It went straight to court in 1932.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The provincial turn plus the wider demands made the difference (Source I).',
        b: 'Federal petitioning was the old pattern the Association broke with (Source I).',
        c: 'Courts came later (1969); the 1932 difference was the province plus wider demands (Source I, p. 139).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l30-settlement-1',
      contentVersion: '1',
      lessonId: 't2-l03-metis-non-status-claims',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L30-L'],
      stimulusId: 'l30-settlement-1',
      familyId: 'l30-settlement-parts',
      prompt: 'What was the 1988 settlement?',
      options: [
        {
          id: 'a',
          text: '$310 million, title to Settlement lands, and legislated self-government.'
        },
        {
          id: 'b',
          text: '$30 million and nothing else.'
        },
        {
          id: 'c',
          text: 'Title only, with no compensation.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Money, title, and legislated self-government (Source L).',
        b: 'The figure is $310 million — and money is one of three parts (Source L).',
        c: 'Title without compensation reverses the answer — all three parts were won (Source L).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l30-independent-1',
      contentVersion: '1',
      lessonId: 't2-l03-metis-non-status-claims',
      mode: 'written',
      sourceIds: ['L30-A', 'L30-B', 'L30-C'],
      familyId: 'l30-loss-explain',
      prompt: 'Using Sources A–C, name three ways status was lost — and illustrate one with Kakfwi or the 1876 definition.',
      criteria: ['Names three of the four causes (scrip; enfranchisement; Act rules; register mistakes)', 'Illustrates one cause with Kakfwi or the 1876 definition (Sources B, C)', 'Keeps every element traceable to Sources A–C'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l30-independent-2',
      contentVersion: '1',
      lessonId: 't2-l03-metis-non-status-claims',
      mode: 'written',
      sourceIds: ['L30-I', 'L30-J'],
      familyId: 'l30-road-explain',
      prompt: 'Using Sources I and J, explain the Association\'s road from 1932 to the Betterment Act — and one thing the cards do not settle.',
      criteria: ['States the provincial turn plus the wider demands (land; schools; care; permits)', 'Traces Ewing to Betterment (1934 commission; farming colonies; 1938 act)', 'Names one thing the cards do not settle (for example, any settlement\'s current governance dispute)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l31-trigger-1',
      contentVersion: '1',
      lessonId: 't2-l09-first-modern-treaties',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L31-G', 'L31-H'],
      stimulusId: 'l31-trigger-1',
      familyId: 'l31-trigger-treaty',
      prompt: 'A student answers Question 23 with \'the 1975 agreement.\' What must the answer name instead?',
      options: [
        {
          id: 'a',
          text: 'Nothing — the 1975 agreement is what forced negotiation.'
        },
        {
          id: 'b',
          text: 'Bourassa\'s 1970 hydro announcement plus the organizing and court path it triggered.'
        },
        {
          id: 'c',
          text: 'The Powley decision\'s affirmation of Métis rights.'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: '1975 is the settlement year — the JBNQA signed, the first modern treaty (Source H). The question asks what forced talks to start: the 1970 announcement (Source G). Targeted review: separate the trigger card from the treaty card.',
        b: 'Correct. Bourassa\'s April 30, 1970 hydro announcement threatened the waterways and the way of life (Source G); organizing, the 1973 injunction, and unstoppable construction did the rest (pp. 144–145). The inference is bounded: the trigger starts talks; the 1975 terms are a separate answer.',
        c: 'The Powley decision (2003) opened the Métis new era (p. 142) — three decades after James Bay talks began. Question 23 wants the 1970 trigger. Targeted review: keep the lesson\'s two halves in order.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l31-responsibility-1',
      contentVersion: '1',
      lessonId: 't2-l09-first-modern-treaties',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L31-A'],
      stimulusId: 'l31-responsibility-1',
      familyId: 'l31-reserve-reading',
      prompt: 'Who does Ottawa accept responsibility for under its clause reading?',
      options: [
        {
          id: 'a',
          text: 'First Nations people living on reserves — \'Indians on lands reserved for Indians.\''
        },
        {
          id: 'b',
          text: 'Every Aboriginal person in Canada.'
        },
        {
          id: 'c',
          text: 'Only Métis people with a federal contact.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Reserve residents claimed; everyone else assigned to the provinces (Source A).',
        b: 'The clause reading excludes off-reserve people — the narrowest map, not the widest (Source A).',
        c: 'No Métis-contact claim is in the card — reserve residence is the test (Sources A, D).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l31-scrip-1',
      contentVersion: '1',
      lessonId: 't2-l09-first-modern-treaties',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L31-B'],
      stimulusId: 'l31-scrip-1',
      familyId: 'l31-scrip-argument',
      prompt: 'Why does Ottawa call provincial Métis a provincial responsibility?',
      options: [
        {
          id: 'a',
          text: 'Provincial Métis are provincial: scrip extinguished their rights.'
        },
        {
          id: 'b',
          text: 'Provincial Métis are fully federal.'
        },
        {
          id: 'c',
          text: 'The Supreme Court assigned Métis to Ottawa.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Scrip, Ottawa argues, ended provincial Métis rights — so the provinces own the file (Source B).',
        b: 'Refusal is the point — Ottawa assigns provincial Métis to the provinces (Source B).',
        c: 'No court has ruled on Métis under 91(24); the scrip argument is Ottawa\'s own (Source B, p. 141).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l31-interlocutor-1',
      contentVersion: '1',
      lessonId: 't2-l09-first-modern-treaties',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L31-D'],
      stimulusId: 'l31-interlocutor-1',
      familyId: 'l31-contact-office',
      prompt: 'What 1985 office became the first federal point of contact?',
      options: [
        {
          id: 'a',
          text: 'Federal Interlocutor for Métis and Non-Status Indians.'
        },
        {
          id: 'b',
          text: 'Federal Minister of Aboriginal Affairs.'
        },
        {
          id: 'c',
          text: 'Federal Minister Responsible for Métis and Non-Status Indians.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Created 1985: the first official federal point of contact (Source D).',
        b: 'That title is a booklet distractor — the chapter names the Federal Interlocutor (Source D).',
        c: 'That title is a booklet distractor — the chapter names the Federal Interlocutor (Source D).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l31-aip-1',
      contentVersion: '1',
      lessonId: 't2-l09-first-modern-treaties',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L31-E'],
      stimulusId: 'l31-aip-1',
      familyId: 'l31-aip-stage',
      prompt: 'Which negotiation stage runs longest?',
      options: [
        {
          id: 'a',
          text: 'The Agreement-in-Principle — the longest stage.'
        },
        {
          id: 'b',
          text: 'The Memorandum of Understanding — the longest stage.'
        },
        {
          id: 'c',
          text: 'The Final Agreement — the longest stage.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The AIP is the longest stage, holding every agreement the settlement will contain (Source E).',
        b: 'The MOU only affirms commitment to negotiate — the AIP is the longest stage (Source E, p. 143).',
        c: 'The Final Agreement details the settlement — the AIP stage runs longest (Sources E, F).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l31-exchange-1',
      contentVersion: '1',
      lessonId: 't2-l09-first-modern-treaties',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L31-I'],
      stimulusId: 'l31-exchange-1',
      familyId: 'l31-exchange-terms',
      prompt: 'What did the JBNQA exchange?',
      options: [
        {
          id: 'a',
          text: 'Surrendered title for land, cash compensation, and ongoing support.'
        },
        {
          id: 'b',
          text: 'Cash for full provincial control of the territory.'
        },
        {
          id: 'c',
          text: 'Shared title with no compensation.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Surrendered title bought land, cash, and ongoing support (Source I).',
        b: 'The direction runs the other way: title surrendered, land-plus-cash received (Source I).',
        c: 'The exchange kept Aboriginal title out — full title was surrendered for the package (Source I).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l31-independent-1',
      contentVersion: '1',
      lessonId: 't2-l09-first-modern-treaties',
      mode: 'written',
      sourceIds: ['L31-A', 'L31-B'],
      familyId: 'l31-map-explain',
      prompt: 'Using Sources A and B, explain who Ottawa claims responsibility for and why — including the Inuit exception.',
      criteria: ['States Ottawa\'s map (reserve residents claimed; provincial Métis refused via the scrip argument)', 'Explains the why (clause reading; Inuit included by the court; no Métis ruling)', 'Keeps every element traceable to Sources A–B plus p. 141'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l31-independent-2',
      contentVersion: '1',
      lessonId: 't2-l09-first-modern-treaties',
      mode: 'written',
      sourceIds: ['L31-I', 'L31-J'],
      familyId: 'l31-newground-explain',
      prompt: 'Using Sources I and J, explain what the JBNQA copied from the old treaties — and what ground it broke.',
      criteria: ['States what was old (surrender for land/cash/support, like the numbered treaties)', 'States what was new (governing roles; a voice in future development)', 'Names one thing the cards do not settle (for example, any specific unfulfilled expectation)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l32-timeline-1',
      contentVersion: '1',
      lessonId: 't2-l10-north-and-west',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L32-E', 'L32-B'],
      stimulusId: 'l32-timeline-1',
      familyId: 'l32-year-entry',
      prompt: 'A student fills the 1994 blank with \'The Gwich\'in Agreement.\' What does the timeline require instead?',
      options: [
        {
          id: 'a',
          text: 'The Gwich\'in Agreement — it must be 1994\'s answer.'
        },
        {
          id: 'b',
          text: 'The Sahtú Dene and Métis Agreement — the out-of-order 1994 entry.'
        },
        {
          id: 'c',
          text: 'The Umbrella Final Agreement — it must be 1994\'s answer.'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The Gwich\'in Agreement is the 1992 blank (Source B) — copying it to 1994 doubles one answer and strands another. Targeted review: re-read Source E and match each year to its own entry.',
        b: 'Correct. The 1994 entry sits out of order after 2002: the Sahtú Dene and Métis Agreement (Source E). Timelines reward readers, not assumers. The inference is bounded: one year, one entry, as printed.',
        c: 'The Umbrella Final Agreement is the first 1993 entry (Source B), not the 1994 answer. Targeted review: separate the two 1993 lines before touching 1994.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l32-aip-1',
      contentVersion: '1',
      lessonId: 't2-l10-north-and-west',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L32-F'],
      stimulusId: 'l32-aip-1',
      familyId: 'l32-aip-layers',
      prompt: 'What did the 1990 AIP offer?',
      options: [
        {
          id: 'a',
          text: '181,300 sq km plus minerals; $500M plus royalties; hunting/fishing rights plus co-management.'
        },
        {
          id: 'b',
          text: '$500M and nothing else.'
        },
        {
          id: 'c',
          text: 'A new province for the Dene and Métis.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Quantum, cash, and standing — all three layers as printed (Source F).',
        b: 'Cash alone drops the land and the rights — the package has three layers (Source F).',
        c: 'No province changed hands — the offer was land, money, and standing (Source F).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l32-represent-1',
      contentVersion: '1',
      lessonId: 't2-l10-north-and-west',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L32-G', 'L32-J'],
      stimulusId: 'l32-represent-1',
      familyId: 'l32-mandate-width',
      prompt: 'Who did the Yukon Council represent in the Umbrella talks?',
      options: [
        {
          id: 'a',
          text: 'All fourteen Yukon First Nations — status and non-status alike.'
        },
        {
          id: 'b',
          text: 'Only status First Nations.'
        },
        {
          id: 'c',
          text: 'Only the Champagne and Aishihik First Nations.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. All fourteen nations, status and non-status alike, under one framework (Sources G, J).',
        b: 'The mandate covered all fourteen — status never limited it (Sources G, J).',
        c: 'No single nation was the client — the framework served all fourteen (Source G).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l32-unlock-1',
      contentVersion: '1',
      lessonId: 't2-l10-north-and-west',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L32-H', 'L32-I'],
      stimulusId: 'l32-unlock-1',
      familyId: 'l32-unlock-policy',
      prompt: 'What unlocked the Yukon table, and when did it sign?',
      options: [
        {
          id: 'a',
          text: 'The 1986 policy dropped extinguishment; the UFA signed May 29, 1993.'
        },
        {
          id: 'b',
          text: 'The 1986 policy added an extinguishment demand.'
        },
        {
          id: 'c',
          text: 'The UFA signed in 1986.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Extinguishment dropped in 1986; the Umbrella signed May 29, 1993 (Sources H, I).',
        b: '1986 removed the demand — it never added one (Source H).',
        c: 'The signing came in 1993, seven years after the unlock (Sources H, I).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l32-quantum-1',
      contentVersion: '1',
      lessonId: 't2-l10-north-and-west',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L32-L'],
      stimulusId: 'l32-quantum-1',
      familyId: 'l32-quantum-share',
      prompt: 'What land quantum did the Nisga\'a accept?',
      options: [
        {
          id: 'a',
          text: 'About 2000 sq km with surface and subsurface — eight per cent of the territory.'
        },
        {
          id: 'b',
          text: 'Eighty per cent of the territory.'
        },
        {
          id: 'c',
          text: 'Surface resources only.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. 2000 sq km with both resource layers — eight per cent of the territory (Source L).',
        b: 'The share is eight per cent — the fraction is the point (Source L).',
        c: 'Subsurface came with surface — both layers, eight per cent (Source L).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l32-first-1',
      contentVersion: '1',
      lessonId: 't2-l10-north-and-west',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L32-M'],
      stimulusId: 'l32-first-1',
      familyId: 'l32-combined-first',
      prompt: 'What made the Nisga\'a Agreement a first in Canada?',
      options: [
        {
          id: 'a',
          text: 'Land claim plus constitutionally protected self-government in one deal.'
        },
        {
          id: 'b',
          text: 'The largest cash payment ever.'
        },
        {
          id: 'c',
          text: 'Self-government with no constitutional protection.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Land plus protected self-government in one deal — Canada\'s first (Source M).',
        b: 'Cash alone was never the first — the combination was (Source M).',
        c: 'The protection is constitutional — changeable only by all-three agreement (Source M, p. 152).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l32-independent-1',
      contentVersion: '1',
      lessonId: 't2-l10-north-and-west',
      mode: 'written',
      sourceIds: ['L32-F'],
      familyId: 'l32-package-explain',
      prompt: 'Using Source F, state the 1990 AIP package — and explain why the offer failed.',
      criteria: ['States all three layers (quantum; cash; standing) with the printed figures', 'Explains why the offer failed (title-surrender clauses; regional split)', 'Keeps the offer separate from what replaced it (Gwich\'in 1992; Sahtú 1994)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l32-independent-2',
      contentVersion: '1',
      lessonId: 't2-l10-north-and-west',
      mode: 'written',
      sourceIds: ['L32-G', 'L32-J'],
      familyId: 'l32-umbrella-explain',
      prompt: 'Using Sources G and J, explain how one council represented fourteen nations — and one thing the cards do not settle.',
      criteria: ['States the framework (one umbrella; fourteen nations; individual settlements)', 'States the mandate\'s width (status plus non-status from the start)', 'Names one thing the cards do not settle (for example, any single nation\'s final terms)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l33-justice-1',
      contentVersion: '1',
      lessonId: 't2-l04-resolving-claims',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L33-G', 'L33-H'],
      stimulusId: 'l33-justice-1',
      familyId: 'l33-structure-staff',
      prompt: 'A student answers Question 28 with \'Nunavut uses the same courts as everyone else.\' What must the answer name?',
      options: [
        {
          id: 'a',
          text: 'Nothing — Nunavut uses the same courts as everyone else.'
        },
        {
          id: 'b',
          text: 'One court level, community diversion, land-based camps — structures, not staff.'
        },
        {
          id: 'c',
          text: 'The Akitsiraq Law School — that is the whole difference.'
        }
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Nunavut\'s justice differs structurally: one court level, community diversion, land-based camps (Sources G, H) — not merely in who staffs it. Targeted review: re-read Sources G and H and list structures, not staff.',
        b: 'Correct. One level by tradition, committees and justices diverting cases, camps teaching land-based life (Sources G, H) — plus an Elders-majority commission reviewing the laws themselves (p. 155). The inference is bounded: structures described, outcomes unfenced.',
        c: 'Akitsiraq trains Inuit lawyers in Nunavut (Source J) — one program, not the justice system\'s shape. Question 28 wants the structural differences. Targeted review: separate the law school from the court system.'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l33-largest-1',
      contentVersion: '1',
      lessonId: 't2-l04-resolving-claims',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L33-A'],
      stimulusId: 'l33-largest-1',
      familyId: 'l33-largest-name',
      prompt: 'What is the largest comprehensive land claim settlement in Canadian history?',
      options: [
        {
          id: 'a',
          text: 'The Nunavut Land Claims Agreement.'
        },
        {
          id: 'b',
          text: 'The James Bay and Northern Quebec Agreement.'
        },
        {
          id: 'c',
          text: 'The Umbrella Final Agreement.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The 1993 Nunavut Agreement is the largest comprehensive settlement ever (Source A).',
        b: 'James Bay was first, not largest — Nunavut holds the record (Source A).',
        c: 'The Umbrella was a framework year, not the largest settlement — Nunavut holds the record (Source A).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l33-majority-1',
      contentVersion: '1',
      lessonId: 't2-l04-resolving-claims',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L33-C'],
      stimulusId: 'l33-majority-1',
      familyId: 'l33-majority-mechanism',
      prompt: 'How does an 85 per cent majority deliver self-government?',
      options: [
        {
          id: 'a',
          text: '85 per cent Inuit: voting plus running equals effective control.'
        },
        {
          id: 'b',
          text: 'Only Inuit may vote or run.'
        },
        {
          id: 'c',
          text: 'Ottawa holds a veto over Inuit laws.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. An 85 per cent majority makes votes and candidacies effective control (Source C).',
        b: 'No ancestry bar exists — anyone may run; the majority does the work (Source C, p. 153).',
        c: 'No veto is in the card — voting plus running is the mechanism (Source C).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l33-policy-1',
      contentVersion: '1',
      lessonId: 't2-l04-resolving-claims',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L33-E', 'L33-F'],
      stimulusId: 'l33-policy-1',
      familyId: 'l33-policy-aim',
      prompt: 'What does the cultural policy aim to build?',
      options: [
        {
          id: 'a',
          text: 'Inuit principles under every decision; government open and accountable to Inuit.'
        },
        {
          id: 'b',
          text: 'Abolishing the public government.'
        },
        {
          id: 'c',
          text: 'Banning all non-Inuit languages.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Inuit principles under decisions; government open, responsive, accountable (Sources E, F).',
        b: 'The policy guides decisions — it replaces no government (Sources E, F).',
        c: 'No language ban is in the cards — principles and knowledge guide the work (Sources E, F).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l33-akitsiraq-1',
      contentVersion: '1',
      lessonId: 't2-l04-resolving-claims',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L33-J'],
      stimulusId: 'l33-akitsiraq-1',
      familyId: 'l33-school-shape',
      prompt: 'What is the Akitsiraq Law School?',
      options: [
        {
          id: 'a',
          text: 'A one-time program for Inuit law degrees earned in Nunavut.'
        },
        {
          id: 'b',
          text: 'A permanent Ottawa boarding school.'
        },
        {
          id: 'c',
          text: 'A second court level for Nunavut.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. A one-time program for Inuit law degrees earned in Nunavut (Source J).',
        b: 'The school runs in Nunavut — students stay while studying (Source J).',
        c: 'Akitsiraq is one law school, not the court system (Sources G, J).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l33-scale-1',
      contentVersion: '1',
      lessonId: 't2-l04-resolving-claims',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L33-D'],
      stimulusId: 'l33-scale-1',
      familyId: 'l33-scale-figures',
      prompt: 'What was Nunavut\'s settlement scale?',
      options: [
        {
          id: 'a',
          text: '350,000 sq km plus minerals on 37,000; $1.17B over fourteen years plus royalties.'
        },
        {
          id: 'b',
          text: '181,300 sq km plus minerals on 10,100; $500M over fifteen years.'
        },
        {
          id: 'c',
          text: '$1.17B and nothing else.'
        }
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. 350,000 sq km with minerals on 37,000; $1.17B over fourteen years plus royalties (Source D).',
        b: 'Those are the AIP\'s figures — Nunavut\'s are larger on every line (Sources D, L32-F).',
        c: 'Cash alone drops the land, minerals, and royalties (Source D).'
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l33-independent-1',
      contentVersion: '1',
      lessonId: 't2-l04-resolving-claims',
      mode: 'written',
      sourceIds: ['L33-C', 'L33-E', 'L33-F'],
      familyId: 'l33-sensitivity-explain',
      prompt: 'Using Sources C, E, and F, explain why cultural sensitivity is structural in Nunavut — and what stays fenced.',
      criteria: ['States the paradox (public door; Inuit purpose)', 'Shows the machinery (85 per cent; protocol; policy; programs)', 'Fences outcomes (design described; results unclaimed)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
{
      id: 'ab30-v2-l33-independent-2',
      contentVersion: '1',
      lessonId: 't2-l04-resolving-claims',
      mode: 'written',
      sourceIds: ['L33-G', 'L33-H', 'L33-J'],
      familyId: 'l33-justice-explain',
      prompt: 'Using Sources G, H, and J, explain how Nunavut justice differs — and one thing the cards do not settle.',
      criteria: ['Names the structural differences (one level; diversion; land camps)', 'Distinguishes the law school\'s role (training lawyers, not shaping courts)', 'Names one thing the cards do not settle (for example, any case outcome or recidivism result)'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l34-blend-1',
      contentVersion: '1',
      lessonId: 't3-l01-stereotypes-media',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L34-J', 'L34-L'],
      stimulusId: 'l34-blend-1',
      familyId: 'l34-blend-split',
      prompt: 'A student writes that multiculturalism and assimilation are the same thing: everybody blending into one Canadian way of life. What does the chapter require instead?',
      options: [
        { id: 'a', text: 'They are the same \u2014 both describe everyone blending into one Canadian way of life.' },
        { id: 'b', text: 'They differ: assimilation adopts mainstream ways to fit in, while multiculturalism keeps distinct cultures practising.' },
        { id: 'c', text: 'They differ: multiculturalism is the older policy and assimilation replaced it in 1971.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Merged \u2014 and wrong. Source J keeps distinct cultures practising (own ways, own languages), while Source L moves people toward majority ways. Name who changes and what survives, and the pair splits.',
        b: 'Correct. Assimilation adopts mainstream ways to fit in (Source L); multiculturalism protects distinct practice inside one society (Source J). The conclusion follows the evidence: different mechanisms, different survivors.',
        c: 'No replacement happened. Source J dates the multiculturalism policy to 1971 and says nothing about ending assimilation; Source L describes assimilation as ongoing human behaviour. Check dates against claims before concluding.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l34-famous-1',
      contentVersion: '1',
      lessonId: 't3-l01-stereotypes-media',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L34-B'],
      stimulusId: 'l34-famous-1',
      familyId: 'l34-famous-infamous',
      prompt: 'Why does Dumont call her ancestor \u201cthe famous or infamous Gabriel Dumont\u201d?',
      options: [
        { id: 'a', text: 'Her M\u00e9tis people call him famous; her school history calls him infamous.' },
        { id: 'b', text: 'She is unsure whether Gabriel Dumont is really her ancestor.' },
        { id: 'c', text: 'Famous and infamous are his first and middle names.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Home and school read the same ancestor opposite ways \u2014 the essay\'s first split (Source B).',
        b: 'Dumont never doubts the kinship; the doubt is about the adjective. Two audiences, two verdicts (Source B).',
        c: 'No middle name appears \u2014 famous/infamous is one ancestor seen from two sides (Source B).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l34-teasing-1',
      contentVersion: '1',
      lessonId: 't3-l01-stereotypes-media',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L34-D'],
      stimulusId: 'l34-teasing-1',
      familyId: 'l34-teasing-spread',
      prompt: 'What happens after the classroom names Duck Lake and the Rebellion?',
      options: [
        { id: 'a', text: 'The teacher stopped the teasing at once and defended the family.' },
        { id: 'b', text: 'The brother ignored the teasing and finished school with honours.' },
        { id: 'c', text: 'Classroom talk becomes playground teasing, unstopped, until a brother drops out.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'The teacher asked the question and said nothing after \u2014 no stop, no defence (Source D).',
        b: 'The brother skipped school and dropped out at fourteen \u2014 the teasing cost him school (Source D).',
        c: 'Correct. A classroom label becomes playground teasing the teacher never stops, and a brother leaves school (Source D).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l34-messages-1',
      contentVersion: '1',
      lessonId: 't3-l01-stereotypes-media',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L34-F'],
      stimulusId: 'l34-messages-1',
      familyId: 'l34-home-reach',
      prompt: 'What do Dumont\'s \u201cmixed messages\u201d show about where stereotypes reach?',
      options: [
        { id: 'a', text: 'Home cancels the school\'s damage, leaving her confident and open.' },
        { id: 'b', text: 'Home repeats the damage, leaving her shy, proud with difficulty, and conflicted.' },
        { id: 'c', text: 'Home is neutral; only teachers and classmates hold stereotypes.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The essay shows the opposite: pride is hard, hurt is easy, messages conflict (Source F).',
        b: 'Correct. Shame learned where no teacher reaches \u2014 the stereotype\'s longest arm is home (Source F).',
        c: 'Her mother says les sauvages too; no one in the passage is exempt (Source F).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l34-alienation-1',
      contentVersion: '1',
      lessonId: 't3-l01-stereotypes-media',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L34-H'],
      stimulusId: 'l34-alienation-1',
      familyId: 'l34-alienation-def',
      prompt: 'What does the chapter mean by alienation?',
      options: [
        { id: 'a', text: 'Feeling isolated from a social group.' },
        { id: 'b', text: 'Being born outside the country.' },
        { id: 'c', text: 'Feeling angry at your family.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Isolation from the group \u2014 peers, community, even family (Source H).',
        b: 'Foreign birth is not the test; Dumont was born at Duck Lake and still feels it (Source H).',
        c: 'Anger may follow, but the definition is isolation, not rage (Source H).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l34-resist-1',
      contentVersion: '1',
      lessonId: 't3-l01-stereotypes-media',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L34-N'],
      stimulusId: 'l34-resist-1',
      familyId: 'l34-special-position',
      prompt: 'What does the chapter conclude about Aboriginal peoples and assimilation?',
      options: [
        { id: 'a', text: 'Nearly all assimilated under government pressure.' },
        { id: 'b', text: 'All resisted except the M\u00e9tis, who are immigrants.' },
        { id: 'c', text: 'Most resisted, holding a position no immigrant group shares.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Most did not \u2014 resistance is the passage\'s headline, not surrender (Source N).',
        b: 'No exception is named; the claim covers First Nations, M\u00e9tis, and Inuit together (Source N).',
        c: 'Correct. Pressured to assimilate, most did not \u2014 and no immigrant group shares their standing (Source N).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l34-independent-1',
      contentVersion: '1',
      lessonId: 't3-l01-stereotypes-media',
      mode: 'written',
      sourceIds: ['L34-C', 'L34-D', 'L34-F'],
      familyId: 'l34-holders-map',
      prompt: 'Using Sources C, D, and F, explain how two stereotypes Dumont met shaped her self-confidence. Name each stereotype, trace its effect, and identify one thing the essay alone does not settle.',
      criteria: ['Names at least two essay stereotypes with the passages that carry them', 'Traces each stereotype\'s effect on Dumont\'s confidence with a supporting detail', 'Fences one thing the essay does not settle instead of claiming it'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l34-independent-2',
      contentVersion: '1',
      lessonId: 't3-l01-stereotypes-media',
      mode: 'written',
      sourceIds: ['L34-I', 'L34-K'],
      familyId: 'l34-mainstream-apply',
      prompt: 'Using Sources I and K, explain what the mainstream is and why the chapter doubts the official policy tamed it. Define the mainstream, show the limit, and identify one conclusion the passages alone do not establish.',
      criteria: ['Defines the mainstream from the chapter in the response\'s own words', 'Shows the policy\'s limit with the Euro-Canadian dominance detail', 'Fences one verdict about multiculturalism the cards do not state'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l35-landlord-1',
      contentVersion: '1',
      lessonId: 't3-l05-words-that-wound',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L35-F', 'L35-G', 'L35-J'],
      stimulusId: 'l35-landlord-1',
      familyId: 'l35-landlord-class',
      prompt: 'A landlord\'s sign says For Rent, yet minority applicants never get the rooms. How does the chapter classify this?',
      options: [
        { id: 'a', text: 'Prejudice only \u2014 the landlord holds ideas but takes no discriminatory act.' },
        { id: 'b', text: 'Covert, subtle discrimination \u2014 hidden acts with no proof, but acts all the same.' },
        { id: 'c', text: 'Overt discrimination \u2014 the vacancies announce the exclusion openly.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Half right, fully wrong. Holding ideas without acting is prejudice only (Source F) \u2014 but this landlord acts, month after month, by never renting. An act with no announcement is still an act; conclude from behaviour, not volume.',
        b: 'Correct. Hidden, deniable, unprovable \u2014 the vacancy that never fills is covert and subtle discrimination (Sources G, J). The evidence supports the charge even though no single refusal can prove it.',
        c: 'Nothing here is obvious. Overt discrimination announces itself \u2014 refused entry, a banning sign (Sources G, J). This landlord\'s politeness is the whole point: subtle means no proof, not no harm.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l35-lens-1',
      contentVersion: '1',
      lessonId: 't3-l05-words-that-wound',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L35-D'],
      stimulusId: 'l35-lens-1',
      familyId: 'l35-exception-armour',
      prompt: 'Why don\'t stereotypes break when you meet someone from the stereotyped group?',
      options: [
        { id: 'a', text: 'Meeting one person from the group always destroys the stereotype.' },
        { id: 'b', text: 'The stereotype lenses strangers as odd, and known people as exceptions.' },
        { id: 'c', text: 'Stereotypes persist because people travel too little.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Knowing one person rarely breaks the lens \u2014 the chapter says the person reads as an exception (Source D).',
        b: 'Correct. The lens makes the stranger look odd, and the known individual reads as an exception (Source D).',
        c: 'The passage never blames travel; the barrier is the generalizing lens itself (Source D).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l35-positive-1',
      contentVersion: '1',
      lessonId: 't3-l05-words-that-wound',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L35-E'],
      stimulusId: 'l35-positive-1',
      familyId: 'l35-flattery-harm',
      prompt: 'What harm can the \u201cwomen are naturally nurturing\u201d stereotype do?',
      options: [
        { id: 'a', text: 'It still denies individual differences and the freedom to express unique gifts.' },
        { id: 'b', text: 'It does no harm; only negative stereotypes wound.' },
        { id: 'c', text: 'It harms because nurturing is a bad quality.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Kindness is not the test \u2014 room for individual gifts is (Source E).',
        b: 'The chapter calls even positive stereotypes harmful; exemption is the trap (Source E).',
        c: 'Nurturing is praised as a quality \u2014 the harm is the cage around every woman (Source E).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l35-institutional-1',
      contentVersion: '1',
      lessonId: 't3-l05-words-that-wound',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L35-I'],
      stimulusId: 'l35-institutional-1',
      familyId: 'l35-design-excludes',
      prompt: 'What makes the chapter\'s wheelchair and legal-form examples institutional?',
      options: [
        { id: 'a', text: 'It needs a prejudiced official shouting slurs at the counter.' },
        { id: 'b', text: 'It only counts when wheelchair users complain in writing.' },
        { id: 'c', text: 'The service design itself blocks part of the population.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'The form example needs no shouting bigot \u2014 legal language alone does the excluding (Source I).',
        b: 'The stairs example excludes wheelchair users by design, whatever anyone intends (Source I).',
        c: 'Correct. The design excludes \u2014 stairs, forms \u2014 with no single actor required (Source I).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l35-columbus-1',
      contentVersion: '1',
      lessonId: 't3-l05-words-that-wound',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L35-L'],
      stimulusId: 'l35-columbus-1',
      familyId: 'l35-words-barrier',
      prompt: 'Why did Aboriginal groups condemn celebrating the 1992 quincentenary?',
      options: [
        { id: 'a', text: 'Aboriginal groups welcomed the celebration with minor corrections.' },
        { id: 'b', text: 'Celebrating \u201cdiscovery\u201d erases the perspective of the dominated.' },
        { id: 'c', text: 'The dispute is only about how to spell Columbus.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Near-unanimous condemnation is the passage\'s headline \u2014 no welcome appears (Source L).',
        b: 'Correct. Celebration language for domination builds a barrier against a hemisphere\'s view (Source L).',
        c: 'The passage never discusses spelling; the fight is over discovery and domination (Source L).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l35-skungun-1',
      contentVersion: '1',
      lessonId: 't3-l05-words-that-wound',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L35-N'],
      stimulusId: 'l35-skungun-1',
      familyId: 'l35-share-reserve',
      prompt: 'What does Littlechild say skungun agreed at treaty time?',
      options: [
        { id: 'a', text: 'Share everything, but reserve a small portion for ceremony and tradition.' },
        { id: 'b', text: 'Give up all distinct rights so everyone is identical.' },
        { id: 'c', text: 'Sell the surface rights and keep nothing back.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Share everything, reserve a small portion \u2014 sharing with sanctuary kept (Source N).',
        b: 'Skungun defends distinct rights against exactly that levelling (Source N).',
        c: 'Ceremony and traditional pursuits are what the portion is for \u2014 never surrendered (Source N).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l35-independent-1',
      contentVersion: '1',
      lessonId: 't3-l05-words-that-wound',
      mode: 'written',
      sourceIds: ['L35-G', 'L35-H', 'L35-I', 'L35-J', 'L35-K'],
      familyId: 'l35-table-explain',
      prompt: 'Using Sources G, H, I, J, and K, explain how the chapter sorts discrimination three ways: how open, how aware, and how built-in. Define each pair with its example and identify one case the passages alone do not classify.',
      criteria: ['Distinguishes the three pairs with the chapter\'s own examples', 'Explains what makes each type hard or easy to prove', 'Fences one classification the passages alone do not settle'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l35-independent-2',
      contentVersion: '1',
      lessonId: 't3-l05-words-that-wound',
      mode: 'written',
      sourceIds: ['L35-N', 'L35-O'],
      familyId: 'l35-equal-apply',
      prompt: 'Using Sources N and O, explain Littlechild\'s distinction between being equal and being the same. State the distinction, apply it to one Aboriginal right, and identify one thing the cards do not settle.',
      criteria: ['States the equal-versus-same distinction in the response\'s own words', 'Applies it to a distinct right with a supporting card detail', 'Fences one disagreement the cards describe but do not resolve'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l36-guardian-1',
      contentVersion: '1',
      lessonId: 't3-l06-screens-punchlines',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L36-G', 'L36-K'],
      stimulusId: 'l36-guardian-1',
      familyId: 'l36-guardian-verdict',
      prompt: 'A student writes that films now portray Aboriginal people positively as guardians of the environment, so the stereotype problem in film is solved. Has it been?',
      options: [
        { id: 'a', text: 'Yes \u2014 a positive portrayal ends the stereotype; only negative pictures wound.' },
        { id: 'b', text: 'No \u2014 flattering pictures still erase differences, and one repair is not a finale.' },
        { id: 'c', text: 'Yes \u2014 APTN\'s 1999 launch turned the whole tide for good.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Too early. Source G calls the guardian role damaging despite its kindness \u2014 it erases the normal range of individual differences. Judge a portrayal by what it allows people to be, then conclude.',
        b: 'Correct. Flattering but false: the guardian picture ignores individual differences (Source G), and one good show cannot retire the machinery \u2014 for many viewers it is the only other picture they own (Source K). The evidence refuses the victory lap.',
        c: 'One network is not a turning tide. Source J dates APTN to 1999 with mostly Aboriginal-made programming \u2014 a real answer, but the chapter frames it as an answer, not a finale. Claims about eras need era-sized evidence.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l36-monopoly-1',
      contentVersion: '1',
      lessonId: 't3-l06-screens-punchlines',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L36-D'],
      stimulusId: 'l36-monopoly-1',
      familyId: 'l36-only-teacher',
      prompt: 'Why do screen stereotypes persist despite real gains?',
      options: [
        { id: 'a', text: 'The media teach nothing about Aboriginal peoples at all.' },
        { id: 'b', text: 'Stereotypes faded as soon as real gains were made.' },
        { id: 'c', text: 'The screen is nearly the only teacher, so its pictures persist.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'The screen teaches plenty \u2014 the trouble is that it teaches alone (Source D).',
        b: 'Gains happened and pictures persisted anyway; the monopoly explains why (Source D).',
        c: 'Correct. One teacher, no rivals \u2014 persistence follows from monopoly (Source D).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l36-internalized-1',
      contentVersion: '1',
      lessonId: 't3-l06-screens-punchlines',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L36-F'],
      stimulusId: 'l36-internalized-1',
      familyId: 'l36-boomerang',
      prompt: 'What does the chapter mean by internalized stereotypes?',
      options: [
        { id: 'a', text: 'Aboriginal viewers are immune to screen stereotypes.' },
        { id: 'b', text: 'Some Aboriginal viewers absorbed the pictures, displacing real knowledge.' },
        { id: 'c', text: 'Studios apologized and the damage reversed itself.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The passage says some viewers absorbed the pictures \u2014 immunity is the wrong inference (Source F).',
        b: 'Correct. Screen pictures can displace real knowledge \u2014 in any viewer, including Aboriginal ones (Source F).',
        c: 'No studio apology appears; the damage is absorption, not remorse (Source F).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l36-reclaim-1',
      contentVersion: '1',
      lessonId: 't3-l06-screens-punchlines',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L36-I', 'L36-J'],
      stimulusId: 'l36-reclaim-1',
      familyId: 'l36-ibc-aptn',
      prompt: 'How do the IBC and APTN answer screen stereotypes?',
      options: [
        { id: 'a', text: 'IBC (1981) airs Inuit-made programs; APTN (1999) is mostly Aboriginal-made.' },
        { id: 'b', text: 'Both networks air only mainstream-made programs about Aboriginal peoples.' },
        { id: 'c', text: 'APTN came first in 1981 and the IBC followed in 1999.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. 1981 Inuit-made programs; 1999 mostly Aboriginal-made network (Sources I, J).',
        b: 'Both outlets center Aboriginal makers \u2014 mainstream-only staffing is backwards (Sources I, J).',
        c: 'The dates run the other way: IBC 1981 first, APTN 1999 after (Sources I, J).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l36-joke-1',
      contentVersion: '1',
      lessonId: 't3-l06-screens-punchlines',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L36-O'],
      stimulusId: 'l36-joke-1',
      familyId: 'l36-laugh-bond',
      prompt: 'Why are jokes so powerful at reinforcing stereotypes?',
      options: [
        { id: 'a', text: 'Jokes dissolve group boundaries by including everyone.' },
        { id: 'b', text: 'Staying silent during a cruel joke breaks the belief system.' },
        { id: 'c', text: 'Laughing together at a target bonds the laughers by excluding it.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'The chapter says jokes reinforce the us-versus-them bond \u2014 dissolving it is backwards (Source O).',
        b: 'Silence keeps the belief system safe; the passage asks whether you spoke or stayed silent (Source O).',
        c: 'Correct. Shared laughter at a target bonds the laughers through exclusion (Source O).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l36-identity-1',
      contentVersion: '1',
      lessonId: 't3-l06-screens-punchlines',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L36-Q'],
      stimulusId: 'l36-identity-1',
      familyId: 'l36-new-stereotype',
      prompt: 'What does Brave Rock mean by a \u201clonging for a new stereotype\u201d?',
      options: [
        { id: 'a', text: 'He rejects contemporary life and demands a return to teepees.' },
        { id: 'b', text: 'He voices an identity crisis: the old pictures don\'t fit, and no new one exists.' },
        { id: 'c', text: 'He announces the new stereotype that solves the crisis.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Brave Rock lists English, cars, and houses as his ordinary life \u2014 not rejection (Source Q).',
        b: 'Correct. The old pictures never fit, and the longing names what is missing (Source Q).',
        c: 'No new stereotype is offered \u2014 the passage ends in crisis, not resolution (Source Q).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l36-independent-1',
      contentVersion: '1',
      lessonId: 't3-l06-screens-punchlines',
      mode: 'written',
      sourceIds: ['L36-B', 'L36-D', 'L36-E', 'L36-H'],
      familyId: 'l36-media-roles',
      prompt: 'Using Sources B, D, E, and H, explain the roles film and television play in reinforcing stereotypes. Name one role per medium, show the monopoly behind them, and identify one conclusion the passages alone do not establish.',
      criteria: ['Names one reinforcing role per medium with its supporting passage', 'Shows how the single-teacher monopoly keeps pictures in place', 'Fences one repair claim the cards do not support'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l36-independent-2',
      contentVersion: '1',
      lessonId: 't3-l06-screens-punchlines',
      mode: 'written',
      sourceIds: ['L36-P'],
      familyId: 'l36-twist-fence',
      prompt: 'Using Source P, explain how Burnstick\'s humour removes power from stereotypes. State his mechanism, show what it depends on, and identify one thing the passage alone does not settle.',
      criteria: ['States Burnstick\'s twist mechanism with the card\'s own terms', 'Explains what the twist depends on in the teller', 'Fences whether anyone else could twist the same joke'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l37-recognition-1',
      contentVersion: '1',
      lessonId: 't3-l02-breaking-barriers',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L37-A', 'L37-B', 'L37-F', 'L37-I'],
      stimulusId: 'l37-recognition-1',
      familyId: 'l37-trophies-structures',
      prompt: 'A student writes that the Achievement Awards have solved stereotyping because famous Aboriginal people exist. Has the chapter\'s work been done?',
      options: [
        { id: 'a', text: 'Yes \u2014 famous winners prove stereotyping is finished.' },
        { id: 'b', text: 'No \u2014 winners chip the picture, but tables and courtrooms do the structural work.' },
        { id: 'c', text: 'The awards change nothing; only government agreements matter.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Too early. Winners knock chips (Source A), but the chapter\'s next move is structural \u2014 tables and courtrooms, not trophies. Fame opens the door; adoption rebuilds the room. Conclude from the whole section, not the ceremony.',
        b: 'Correct. Chips plus structures: role models and scholarships (Sources B, D) alongside tripartite voice (Source F) and mended relationships (Source I). The evidence demands both halves.',
        c: 'Too far. Role models educate the mainstream and $2 million educates youth (Sources B, D) \u2014 the chapter leads with the awards because they work. Denying one half to praise the other misreads the section.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l37-chip-1',
      contentVersion: '1',
      lessonId: 't3-l02-breaking-barriers',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L37-A'],
      stimulusId: 'l37-chip-1',
      familyId: 'l37-chip-theory',
      prompt: 'How does seeing non-conforming individuals dispel stereotypes?',
      options: [
        { id: 'a', text: 'By hiding accomplished people so no one generalizes.' },
        { id: 'b', text: 'By showing individuals who do not fit the stereotyped picture.' },
        { id: 'c', text: 'By banning all discussion of group differences.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Concealment is the opposite move \u2014 the theory needs visible counter-examples (Source A).',
        b: 'Correct. Visible non-conformity educates; each exception cracks the picture (Source A).',
        c: 'The passage promises chips from examples, not silence from anyone (Source A).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l37-categories-1',
      contentVersion: '1',
      lessonId: 't3-l02-breaking-barriers',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L37-C'],
      stimulusId: 'l37-categories-1',
      familyId: 'l37-jury-scope',
      prompt: 'What do the Achievement Award categories and jury look like?',
      options: [
        { id: 'a', text: 'Sports winners picked by a mainstream jury.' },
        { id: 'b', text: 'One lifetime winner picked by Ottawa.' },
        { id: 'c', text: 'Thirteen winners across many careers, picked by an Aboriginal jury.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'The jury is Aboriginal and the categories span a dozen-plus fields (Source C).',
        b: 'Twelve careers plus youth plus lifetime \u2014 thirteen honours, not one (Source C).',
        c: 'Correct. Broad careers, Aboriginal jury, thirteen honours a year (Source C).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l37-tripartite-1',
      contentVersion: '1',
      lessonId: 't3-l02-breaking-barriers',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L37-E', 'L37-F'],
      stimulusId: 'l37-tripartite-1',
      familyId: 'l37-tripartite-voice',
      prompt: 'How do tripartite agreements decide?',
      options: [
        { id: 'a', text: 'Three governments decide together with equal voice toward a common goal.' },
        { id: 'b', text: 'Ottawa decides alone and informs the other two afterward.' },
        { id: 'c', text: 'The tables cover policing only and nothing else.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Three governments, equal voice, shared goal \u2014 and everyone learns (Sources E, F).',
        b: 'Equal voice is the passage\'s headline; Ottawa-alone is backwards (Source F).',
        c: 'Six-plus fields and counting \u2014 the tables keep spreading (Source E).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l37-habitant-1',
      contentVersion: '1',
      lessonId: 't3-l02-breaking-barriers',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L37-G'],
      stimulusId: 'l37-habitant-1',
      familyId: 'l37-seven-generations',
      prompt: 'What standard does Habitant set for decisions?',
      options: [
        { id: 'a', text: 'Respect others only; the self does not count.' },
        { id: 'b', text: 'Respect self, all things, and others, seven generations ahead.' },
        { id: 'c', text: 'Respect only the people alive right now.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Habitant asks respect for self, all things, and others \u2014 the self included (Source G).',
        b: 'Correct. Respect in every direction, weighed seven generations out (Source G).',
        c: 'The standard counts organisms unborn \u2014 the living alone are too narrow (Source G).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l37-reilly-1',
      contentVersion: '1',
      lessonId: 't3-l02-breaking-barriers',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L37-I'],
      stimulusId: 'l37-reilly-1',
      familyId: 'l37-tear-mend',
      prompt: 'What is the objective of justice in Reilly\'s Aboriginal account?',
      options: [
        { id: 'a', text: 'Deter freely choosing offenders with harsher punishment.' },
        { id: 'b', text: 'Go soft on crime and skip the victim entirely.' },
        { id: 'c', text: 'Mend the torn relationship back to community cohesiveness.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Deterring free choice is the European view Reilly contrasts \u2014 not his own (Source I).',
        b: 'Softness is disavowed; victim, community, remorse, and reparation all count (Source I).',
        c: 'Correct. A torn bond mended back to cohesiveness \u2014 that is the objective (Source I).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l37-independent-1',
      contentVersion: '1',
      lessonId: 't3-l02-breaking-barriers',
      mode: 'written',
      sourceIds: ['L37-A', 'L37-B', 'L37-D', 'L37-F', 'L37-I'],
      familyId: 'l37-roads-explain',
      prompt: 'Using Sources A, B, D, F, and I, explain how recognition and structural adoption each break barriers. Show both mechanisms with details and identify one thing the cards do not settle.',
      criteria: ['Explains the awards mechanism with foundation and scholarship details', 'Shows one structural adoption with its equal-voice or mending logic', 'Fences one barrier the cards do not show broken'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l37-independent-2',
      contentVersion: '1',
      lessonId: 't3-l02-breaking-barriers',
      mode: 'written',
      sourceIds: ['L37-L', 'L37-M'],
      familyId: 'l37-winner-apply',
      prompt: 'Using Source L or M, show how one winner knocks a chip in a stereotype. Name the achievement, explain the chip, and identify one conclusion the card alone does not establish.',
      criteria: ['Names the winner\'s field and achievement with card details', 'Explains which stereotype the winner chips and how', 'Fences one thing the card does not establish about the winner'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l38-diverse-1',
      contentVersion: '1',
      lessonId: 't3-l03-community-life',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L38-L', 'L38-N'],
      stimulusId: 'l38-diverse-1',
      familyId: 'l38-flattened-verdict',
      prompt: 'A student writes that all reserves are wealthy from oil like Hobbema, so Smallboy had no reason to leave. What do the cards require instead?',
      options: [
        { id: 'a', text: 'Yes \u2014 every reserve is oil-rich, so Smallboy had no reason to leave.' },
        { id: 'b', text: 'No \u2014 reserves differ wildly, and Hobbema\'s wealth is why he left.' },
        { id: 'c', text: 'No \u2014 Smallboy left because reserves had abandoned all tradition forever.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Flattened \u2014 and backwards. Reserves differ in economy and politics (Source N), and Hobbema\'s wealth caused the abandonment Smallboy fled (Source L). Argue from the case, not the average.',
        b: 'Correct. Diverse places (Source N); sudden money abandoned the ways, and 125 people walked to Nordegg for the old life (Source L). The evidence keeps both the difference and the motive.',
        c: 'Reversed. Smallboy left modern influences FOR tradition \u2014 hunting, fishing, trapping near Nordegg (Source L). Check the direction of every walk before concluding.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l38-song-1',
      contentVersion: '1',
      lessonId: 't3-l03-community-life',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L38-C'],
      stimulusId: 'l38-song-1',
      familyId: 'l38-sauna-sweat',
      prompt: 'What downtown problems open Shingoose\'s song?',
      options: [
        { id: 'a', text: 'Mocked dancing and a sauna where prayer clears the room.' },
        { id: 'b', text: 'A warm civic welcome with reserved ceremony space.' },
        { id: 'c', text: 'An electric sweat box the singer fully endorses.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Stares for dancing, weird looks for praying \u2014 nowhere to stand (Source C).',
        b: 'The song reports mockery and evacuation, never welcome (Source C).',
        c: 'Coils, wires, and a fire scare \u2014 the box is the joke\'s target (Source C).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l38-hair-1',
      contentVersion: '1',
      lessonId: 't3-l03-community-life',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L38-E'],
      stimulusId: 'l38-hair-1',
      familyId: 'l38-hair-schedule',
      prompt: 'What does the song\'s hair chorus complain about?',
      options: [
        { id: 'a', text: 'The singer copied his braids from the hippies.' },
        { id: 'b', text: 'His hair was shaved last week by his hairdresser.' },
        { id: 'c', text: 'Braids were cut, then came back as fashion on others\' timing.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'The hippies grew long hair later; the braids came first (Source E).',
        b: 'The shaving happened around the turn of the century \u2014 long before the song (Source E).',
        c: 'Correct. Cut by others\' order, fashionable on others\' schedule \u2014 never his own (Source E).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l38-draw-1',
      contentVersion: '1',
      lessonId: 't3-l03-community-life',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L38-H', 'L38-I', 'L38-J', 'L38-K'],
      stimulusId: 'l38-draw-1',
      familyId: 'l38-chart-rows',
      prompt: 'What draws First Nations people to reserve life?',
      options: [
        { id: 'a', text: 'Nothing draws anyone; the chapter lists no benefits.' },
        { id: 'b', text: 'Kin, pace, children, bills, housing, and sensitive work.' },
        { id: 'c', text: 'Only tax exemption, and nothing else.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Kin, Elders, pace, and rooted children are all named as draws (Sources H\u2013J).',
        b: 'Correct. Kinship, pace, children, plus bills, housing, and work (Sources H\u2013K).',
        c: 'The cards list real benefits first; the drag comes later, not first (Sources H\u2013K).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l38-smallboy-1',
      contentVersion: '1',
      lessonId: 't3-l03-community-life',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L38-L'],
      stimulusId: 'l38-smallboy-1',
      familyId: 'l38-nordegg-motive',
      prompt: 'Why did Smallboy leave for Nordegg in 1968?',
      options: [
        { id: 'a', text: 'Sudden oil wealth abandoned tradition, so he led 125 people to live it again.' },
        { id: 'b', text: 'Hobbema\'s poverty starved his people into the foothills.' },
        { id: 'c', text: 'He wanted to open an oil company near Nordegg.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Wealth abandoned the ways; 125 people walked back to them (Source L).',
        b: 'Hobbema was the richest area in Canada \u2014 poverty is backwards (Source L).',
        c: 'The camp sought hunting, fishing, and trapping \u2014 the old life, not the new (Source L).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l38-schools-1',
      contentVersion: '1',
      lessonId: 't3-l03-community-life',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L38-O'],
      stimulusId: 'l38-schools-1',
      familyId: 'l38-schools-jobs',
      prompt: 'Why do most people leave reserves?',
      options: [
        { id: 'a', text: 'Nobody ever leaves; every need is met locally.' },
        { id: 'b', text: 'Reserve schools all exceed urban schools in range.' },
        { id: 'c', text: 'Most leavers chase jobs and schooling found elsewhere.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Fewer options and thinner schools \u2014 leaving is the documented pattern (Source O).',
        b: 'Repairs lag, let alone range; abundance is backwards (Source O).',
        c: 'Correct. Jobs and schooling pull hardest \u2014 the top recorded reason (Source O).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l38-independent-1',
      contentVersion: '1',
      lessonId: 't3-l03-community-life',
      mode: 'written',
      sourceIds: ['L38-H', 'L38-I', 'L38-J', 'L38-K', 'L38-M', 'L38-O'],
      familyId: 'l38-tug-argue',
      prompt: 'Using Sources H, I, J, K, M, and O, argue one family\'s stay-or-leave tug-of-war. Show both sides with details and identify one thing the cards do not settle.',
      criteria: ['Names one draw and one drag with supporting card details', 'Explains the tug-of-war the family feels between them', 'Fences one thing the cards do not settle about the family\'s future'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l38-independent-2',
      contentVersion: '1',
      lessonId: 't3-l03-community-life',
      mode: 'written',
      sourceIds: ['L38-C', 'L38-D', 'L38-E', 'L38-F'],
      familyId: 'l38-song-theme',
      prompt: 'Using Sources C, D, E, and F, state Shingoose\'s main theme in one sentence. Support it with two details from different verses and identify one thing the song alone does not settle.',
      criteria: ['States the song\'s main theme in a single sentence', 'Supports it with two song details from different verses', 'Fences one thing the song alone does not establish'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l39-alone-1',
      contentVersion: '1',
      lessonId: 't3-l07-running-own-show',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L39-C', 'L39-D'],
      stimulusId: 'l39-alone-1',
      familyId: 'l39-alongside-apart',
      prompt: 'A student writes that self-government means cutting all ties with Canada. What do the cards require instead?',
      options: [
        { id: 'a', text: 'Yes \u2014 self-government means cutting all ties with Canada.' },
        { id: 'b', text: 'No \u2014 it means community-held instruments and decisions, inside Canada.' },
        { id: 'c', text: 'Nothing changes; self-government is only a new name.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Too far. The plan is alongside, culturally distinct \u2014 a part of Canada (Source C). Instruments and decisions stay inside the country. Read the preposition before concluding.',
        b: 'Correct. Self-government means community-held instruments and community-made decisions (Source D) while living alongside Canada, distinct but inside it (Source C). The evidence holds both halves.',
        c: 'Too flat. Returned powers over language, education, and economies are the passage\'s headline (Source C) \u2014 the change is real even inside the country. Denying motion to deny secession misreads twice.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l39-electricity-1',
      contentVersion: '1',
      lessonId: 't3-l07-running-own-show',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L39-A'],
      stimulusId: 'l39-electricity-1',
      familyId: 'l39-ten-percent',
      prompt: 'What percentage of First Nations communities had no electric services in 2000?',
      options: [
        { id: 'a', text: '15' },
        { id: 'b', text: '12' },
        { id: 'c', text: '10' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Fifteen is a booklet distractor \u2014 the audit says ten (Section 1, p. 184).',
        b: 'Twelve is the roads figure, not the power figure (Section 1, p. 184).',
        c: 'Correct. Ten per cent without electric services in 2000 (Section 1, p. 184).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l39-trio-1',
      contentVersion: '1',
      lessonId: 't3-l07-running-own-show',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L39-E', 'L39-F', 'L39-G'],
      stimulusId: 'l39-trio-1',
      familyId: 'l39-trio-match',
      prompt: 'How do the three reserve-life problems differ?',
      options: [
        { id: 'a', text: 'Pollution means gangs; youth at risk means TV; television means mines.' },
        { id: 'b', text: 'Pollution fouls land/water; youth face substances and gangs; TV draws children out.' },
        { id: 'c', text: 'All three problems are really just television.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Pollution fouls land and water; substances and gangs belong to youth at risk (Sources E, F).',
        b: 'Correct. Each plague keeps its own card: land, youth, screen (Sources E\u2013G).',
        c: 'The screen draws children to outside values \u2014 gangs are the youth card, not the TV card (Sources F, G).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l39-language-1',
      contentVersion: '1',
      lessonId: 't3-l07-running-own-show',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L39-I'],
      stimulusId: 'l39-language-1',
      familyId: 'l39-quick-thinker',
      prompt: 'What does the Blackfoot word aikkamiksimstaa literally mean?',
      options: [
        { id: 'a', text: '\u201cQuick thinker\u201d \u2014 the Blackfoot computer.' },
        { id: 'b', text: '\u201cBecoming visible\u201d \u2014 the Blackfoot computer.' },
        { id: 'c', text: '\u201cTap the line\u201d \u2014 the Blackfoot computer.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Quick thinker \u2014 the old tongue naming the new machine (Source I).',
        b: 'Becoming visible is the television/movie word, aisaiksistto (Source I).',
        c: 'Tap the line is the Cree telephone, k\u00eew\u00eepahkam\u00e2howin p\u00eehw\u00e2pskos (Source I).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l39-settlements-1',
      contentVersion: '1',
      lessonId: 't3-l07-running-own-show',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L39-J', 'L39-K'],
      stimulusId: 'l39-settlements-1',
      familyId: 'l39-title-law',
      prompt: 'What is unique about the M\u00e9tis Settlements?',
      options: [
        { id: 'a', text: 'Every M\u00e9tis community holds collective title and self-government.' },
        { id: 'b', text: 'Open towns restrict belonging by ancestry; Settlements do not.' },
        { id: 'c', text: 'Settlements hold title plus self-government; towns stay open.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Only the Settlements hold both; towns hold neither gate (Source J).',
        b: 'Towns are open to all ancestries \u2014 restriction is backwards (Source J).',
        c: 'Correct. Title plus law for Settlements; open doors for towns (Sources J, K).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l39-elias-1',
      contentVersion: '1',
      lessonId: 't3-l07-running-own-show',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L39-N'],
      stimulusId: 'l39-elias-1',
      familyId: 'l39-visiting-died',
      prompt: 'What did television do to visiting, in Elias\'s account?',
      options: [
        { id: 'a', text: 'Everyone turned the television off and visited more.' },
        { id: 'b', text: 'Visiting died while the set stayed on, and health suffered.' },
        { id: 'c', text: 'Television made everyone fitter and more social.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The set stays on through visits; off is backwards (Source N).',
        b: 'Correct. Company with the set on is company lost \u2014 and health follows (Source N).',
        c: 'Sedate, inactive, and unwell is the passage\'s verdict, not fitter (Source N).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l39-independent-1',
      contentVersion: '1',
      lessonId: 't3-l07-running-own-show',
      mode: 'written',
      sourceIds: ['L39-J', 'L39-K', 'L39-L'],
      familyId: 'l39-settlements-explain',
      prompt: 'Using Sources J, K, and L, explain how Alberta\'s M\u00e9tis Settlements differ from open M\u00e9tis towns. Show both sides with details and identify one thing the cards do not settle.',
      criteria: ['States what the Settlements uniquely hold with card details', 'Shows the open-town contrast with the St. Laurent example', 'Fences one thing the cards do not settle about either community'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l39-independent-2',
      contentVersion: '1',
      lessonId: 't3-l07-running-own-show',
      mode: 'written',
      sourceIds: ['L39-G', 'L39-N'],
      familyId: 'l39-screen-faces',
      prompt: 'Using Sources G and N, explain television\'s two faces: the harm it does and how Aboriginal makers answer it. Show both with details and identify one thing the cards do not settle.',
      criteria: ['Shows television harming with reserve and Elias details', 'Shows Aboriginal makers answering with the APTN detail', 'Fences one thing the cards do not settle about the screen'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l40-point-1',
      contentVersion: '1',
      lessonId: 't3-l08-city-test',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L40-H'],
      stimulusId: 'l40-point-1',
      familyId: 'l40-standoff-file',
      prompt: 'A student writes that Ottawa handles all Aboriginal services everywhere. What does the jurisdiction passage require instead?',
      options: [
        { id: 'a', text: 'Ottawa handles all Aboriginal services everywhere.' },
        { id: 'b', text: 'Each government points at the other; urban members fall between.' },
        { id: 'c', text: 'The provinces handle all Aboriginal services everywhere.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Half the file. Ottawa claims reserves, Inuit, and northern M\u00e9tis \u2014 and argues the provinces own the rest (Source H). Filing everything in Ottawa ignores Ottawa\'s own filing.',
        b: 'Correct. Each order points at the other while urban members wait \u2014 the standoff is the finding (Source H). Conclude from the pointing, not from a wish.',
        c: 'The other half-file. Provinces argue Ottawa owns all Aboriginal people no matter where they live (Source H) \u2014 assigning everything to them ignores their answer too.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l40-reason-1',
      contentVersion: '1',
      lessonId: 't3-l08-city-test',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L40-C'],
      stimulusId: 'l40-reason-1',
      familyId: 'l40-housing-work',
      prompt: 'What is the most common reason Aboriginal people move to cities?',
      options: [
        { id: 'a', text: 'Excitement and new friends above all else.' },
        { id: 'b', text: 'Housing plus education, training, and employment.' },
        { id: 'c', text: 'Better medical facilities above all else.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Excitement and friends are draws, but housing-plus-work tops the list (Source C).',
        b: 'Correct. Housing first, then education, training, and work (Source C).',
        c: 'Clinics draw some, but the chapter ranks housing and work first (Source C).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l40-gap-1',
      contentVersion: '1',
      lessonId: 't3-l08-city-test',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L40-E'],
      stimulusId: 'l40-gap-1',
      familyId: 'l40-five-six',
      prompt: 'How does First Nations urban unemployment compare?',
      options: [
        { id: 'a', text: 'Five to six times higher, for four named reasons.' },
        { id: 'b', text: 'Exactly equal to non-Aboriginal neighbours.' },
        { id: 'c', text: 'Higher only because of training gaps.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Five to six times, four named causes, same city (Source E).',
        b: 'Same-city comparison is the passage\'s control \u2014 rates differ wildly (Source E).',
        c: 'Training gaps are one of four causes, never the whole story (Source E).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l40-edmonton-1',
      contentVersion: '1',
      lessonId: 't3-l08-city-test',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L40-F', 'L40-G'],
      stimulusId: 'l40-edmonton-1',
      familyId: 'l40-edmonton-drop',
      prompt: 'How can a younger population change unemployment trends?',
      options: [
        { id: 'a', text: 'Young people replace all older workers at once.' },
        { id: 'b', text: 'Edmonton unemployment rose from 13 to 22 per cent.' },
        { id: 'c', text: 'Trained youth fill the labour shortage; Edmonton fell 22 to 13.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'The young fill shortages \u2014 replacement is backwards (Source G).',
        b: 'Nine points down in five years; rising is backwards (Source G).',
        c: 'Correct. Youth plus training answers the shortage; Edmonton proves it (Source G).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l40-irony-1',
      contentVersion: '1',
      lessonId: 't3-l08-city-test',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L40-I'],
      stimulusId: 'l40-irony-1',
      familyId: 'l40-taxes-services',
      prompt: 'What is ironic about urban taxes and services?',
      options: [
        { id: 'a', text: 'Nobody pays any taxes anywhere.' },
        { id: 'b', text: 'Urban members pay taxes yet receive fewer services.' },
        { id: 'c', text: 'Urban life is cheaper, so the gap does not matter.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Reserve residents skip those taxes; urban members pay them (Source I).',
        b: 'Correct. Urban members pay more and get less \u2014 the stated irony (Source I).',
        c: 'Higher urban costs deepen the irony; cheaper is backwards (Source I).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l40-fontaine-1',
      contentVersion: '1',
      lessonId: 't3-l08-city-test',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L40-N'],
      stimulusId: 'l40-fontaine-1',
      familyId: 'l40-reinvent-afn',
      prompt: 'What new direction does Fontaine set for the AFN?',
      options: [
        { id: 'a', text: 'Represent all members better in cities, possibly re-inventing the AFN.' },
        { id: 'b', text: 'Serve reserve members only and ignore the cities.' },
        { id: 'c', text: 'Keep everything exactly as it has always been.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. All members, better city voice \u2014 reinvention on the table (Source N).',
        b: 'Urban members are the gap Fontaine names; served is backwards (Source N).',
        c: 'Re-invention is Fontaine\'s own word \u2014 stasis is backwards (Source N).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l40-independent-1',
      contentVersion: '1',
      lessonId: 't3-l08-city-test',
      mode: 'written',
      sourceIds: ['L40-M', 'L40-H'],
      familyId: 'l40-mismatch-price',
      prompt: 'Using Sources M and one more card, explain the urban funding mismatch. State the figures, show one consequence, and identify one fix the cards do not guarantee.',
      criteria: ['States the funding mismatch with both figures', 'Shows one consequence for urban members with a second card', 'Fences one fix the cards describe but do not guarantee'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l40-independent-2',
      contentVersion: '1',
      lessonId: 't3-l08-city-test',
      mode: 'written',
      sourceIds: ['L40-D', 'L40-E', 'L40-L'],
      familyId: 'l40-tolls-explain',
      prompt: 'Using Sources D, E, and L, explain the city\'s tolls on Aboriginal newcomers. Name the challenges, detail two, and identify one the cards do not solve.',
      criteria: ['Names the six challenges with the chapter\'s own terms', 'Explains two challenges with supporting card details', 'Fences one challenge the cards price but do not solve'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l41-leave-1',
      contentVersion: '1',
      lessonId: 't3-l09-friendship-success',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L41-F', 'L41-G', 'L41-H', 'L41-L'],
      stimulusId: 'l41-leave-1',
      familyId: 'l41-exit-verdict',
      prompt: 'A student writes that success requires leaving Aboriginal identity behind. What do the stories require instead?',
      options: [
        { id: 'a', text: 'Yes \u2014 every success story left Aboriginal identity behind.' },
        { id: 'b', text: 'No \u2014 the winners keep both memberships, city and community.' },
        { id: 'c', text: 'Nobody succeeds; the city defeats everyone eventually.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The exit reading \u2014 and wrong. Leach keeps Lillooet while working Toronto, needing both (Source G); Hodson\'s youth walk in both worlds (Source L). Success adds a membership; conclude accordingly.',
        b: 'Correct. Both societies for Leach (Source G), both worlds for Hodson\'s youth (Source L), and a happy sister who never left (Source H). The evidence refuses the exit.',
        c: 'Too bleak. A Grand Chief, a minister, a playwright, and every trade between prove the city workable (Source F) \u2014 the chapter parades them because they worked. Denying motion to deny exit misreads twice.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l41-birth-1',
      contentVersion: '1',
      lessonId: 't3-l09-friendship-success',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L41-A', 'L41-B'],
      stimulusId: 'l41-birth-1',
      familyId: 'l41-desks-network',
      prompt: 'How did friendship centres begin?',
      options: [
        { id: 'a', text: 'Ottawa invented them from nothing in 1972.' },
        { id: 'b', text: 'Corporations opened them as downtown charities.' },
        { id: 'c', text: 'Volunteers opened referral desks; a network grew; Ottawa funded it.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Ottawa funded forty centres in 1972 \u2014 founding came decades earlier (Sources A, B).',
        b: 'The 1950s desks were volunteer referral work, never corporate (Source A).',
        c: 'Correct. Volunteer desks, then network, then federal funding (Sources A, B).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l41-model-1',
      contentVersion: '1',
      lessonId: 't3-l09-friendship-success',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L41-D'],
      stimulusId: 'l41-model-1',
      familyId: 'l41-seven-benefits',
      prompt: 'Which set of friendship centre benefits matches the chapter?',
      options: [
        { id: 'a', text: 'They do exactly one thing: run bingos.' },
        { id: 'b', text: 'Awareness, agency model, health, jobs, women\'s groups, connection.' },
        { id: 'c', text: 'They replace all government services entirely.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Seven benefits are listed; one is far short of the passage (Source D).',
        b: 'Correct. Three from the chapter\'s seven \u2014 any three hold (Source D).',
        c: 'The model helps agencies serve; replacement is backwards (Source D).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l41-leach-1',
      contentVersion: '1',
      lessonId: 't3-l09-friendship-success',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L41-G'],
      stimulusId: 'l41-leach-1',
      familyId: 'l41-both-societies',
      prompt: 'How does Leach hold both societies?',
      options: [
        { id: 'a', text: 'He needs both Toronto and Lillooet, problems and all.' },
        { id: 'b', text: 'He cut every tie to Lillooet forever.' },
        { id: 'c', text: 'He works only in Lillooet and never visits Toronto.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Toronto works, Lillooet roots \u2014 both, with problems in both (Source G).',
        b: 'He listens to the lake and fasts on return \u2014 severed is backwards (Source G).',
        c: 'Producer, agent, and Nikita all sit in Toronto (Source G).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l41-racism-1',
      contentVersion: '1',
      lessonId: 't3-l09-friendship-success',
      mode: 'multipleChoice',
      skillTag: 'term-meaning',
      sourceIds: ['L41-I'],
      stimulusId: 'l41-racism-1',
      familyId: 'l41-worst-toll',
      prompt: 'What do youth call the worst urban experience?',
      options: [
        { id: 'a', text: 'Racism barely exists in cities anymore.' },
        { id: 'b', text: 'Racism leaves self-esteem completely untouched.' },
        { id: 'c', text: 'Daily racism everywhere is the most terrible urban experience.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Racism is named the most terrible experience \u2014 rare is backwards (Source I).',
        b: 'Self-esteem, confidence, and everything else all diminish (Source I).',
        c: 'Correct. Daily racism in stores and streets, from all other groups (Source I).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l41-blind-1',
      contentVersion: '1',
      lessonId: 't3-l09-friendship-success',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L41-M'],
      stimulusId: 'l41-blind-1',
      familyId: 'l41-need-not-blood',
      prompt: 'What does Simons demand for urban services?',
      options: [
        { id: 'a', text: 'Serve people by purity of bloodlines alone.' },
        { id: 'b', text: 'Serve all in need, status blind, with four governments acting.' },
        { id: 'c', text: 'Order more commissions and wait for inquiries.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Need, not bloodlines, is the demand \u2014 purity tests are backwards (Source M).',
        b: 'Correct. Four governments, one concert, services by need (Source M).',
        c: 'More commissions are explicitly refused \u2014 action is the demand (Source M).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l41-independent-1',
      contentVersion: '1',
      lessonId: 't3-l09-friendship-success',
      mode: 'written',
      sourceIds: ['L41-F', 'L41-G', 'L41-H'],
      familyId: 'l41-two-memberships',
      prompt: 'Using Sources F, G, and H, explain how urban success holds both memberships. Show two cases with details and identify one thing the cards do not settle.',
      criteria: ['Names two winners with their fields and achievements', 'Shows how each holds both memberships with card details', 'Fences one thing the cards do not establish about success'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l41-independent-2',
      contentVersion: '1',
      lessonId: 't3-l09-friendship-success',
      mode: 'written',
      sourceIds: ['L41-I', 'L41-M'],
      familyId: 'l41-voice-argue',
      prompt: 'Using one of Sources I, J, K, L, or M plus one more card, argue the biggest urban issue and its answer. State the issue, argue the solution, and identify one thing left open.',
      criteria: ['States the voice\'s issue with its own terms', 'Argues one solution from these pages with a second source', 'Fences one thing the voices leave open or dispute'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l42-blind-1',
      contentVersion: '1',
      lessonId: 't3-l10-devolution',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L42-H', 'L42-M'],
      stimulusId: 'l42-blind-1',
      familyId: 'l42-status-blind',
      prompt: 'A student writes that status-blind services are always fairer because everyone gets the same thing. What do the sources require instead?',
      options: [
        { id: 'a', text: 'Agree \u2014 sameness is fairness, so tailor nothing.' },
        { id: 'b', text: 'Reject it \u2014 sameness can erase identity and treaty rights; ask what each group needs.' },
        { id: 'c', text: 'Reject services entirely \u2014 no program ever fits.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The sameness reading \u2014 and wrong. Source H proves one size fails an Inuit hamlet and a southern Alberta reserve differently; Source M warns that status-blindness trades identity and historic rights for overlap savings. That conclusion must follow the evidence, not the slogan.',
        b: 'Correct. Source H\'s diversity sidebar plus Source M\'s identity-and-rights clause require tailored questions: who is served, what history binds them, what fits. Fairness is fit, and the evidence shows sameness missing twice.',
        c: 'Too bleak. The chapter\'s verdict is devolution, not abandonment \u2014 83 per cent satisfaction where Aboriginal hands deliver (Source N). Denying every program to deny sameness misreads the evidence twice.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l42-ahrds-1',
      contentVersion: '1',
      lessonId: 't3-l10-devolution',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L42-D'],
      stimulusId: 'l42-ahrds-1',
      familyId: 'l42-ahrds',
      prompt: 'A student says AHRDS is Ottawa delivering employment programs alone. What corrects this?',
      options: [
        { id: 'a', text: 'Nothing \u2014 Ottawa runs all 400 locations directly.' },
        { id: 'b', text: 'AHRDS is joint delivery: local Aboriginal agreement holders set programming with five national organizations.' },
        { id: 'c', text: 'AHRDS ended in 1972 after funding forty centres.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Ottawa alone misreads the card. Source D names joint delivery \u2014 communities plus government \u2014 with local holders deciding needs.',
        b: 'Correct. Joint model, employment mission, 400-plus locations, local control, five co-designing organizations (Source D).',
        c: 'Wrong program, wrong decade. Forty centres in 1972 belongs to friendship centres (Lesson 8); AHRDS is the joint employment strategy (Source D).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l42-time-1',
      contentVersion: '1',
      lessonId: 't3-l10-devolution',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L42-F', 'L42-G'],
      stimulusId: 'l42-time-1',
      familyId: 'l42-time',
      prompt: 'A community can launch only two or three major initiatives at once. What explains the limit?',
      options: [
        { id: 'a', text: 'Thin muscle: fifty physicians, out-migration, and an overworked core (Sources F–G).' },
        { id: 'b', text: 'Treaties forbid more than three programs per community.' },
        { id: 'c', text: 'Friendship Centres absorb all available funding.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Capacity \u2014 land, location, values, history, and scarce skilled people \u2014 paces development, which is why it takes significant time (Sources F–G).',
        b: 'No treaty sets a program quota. The limit is human and financial muscle, not a legal cap (Source F).',
        c: 'Friendship Centres deliver urban services; they do not cap reserve initiatives. The chapter names capacity, not competition (Source G).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l42-tax-1',
      contentVersion: '1',
      lessonId: 't3-l10-devolution',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L42-K', 'L42-F'],
      stimulusId: 'l42-tax-1',
      familyId: 'l42-tax',
      prompt: 'What is the problem with assuming Aboriginal services place an unfair tax burden on the average citizen?',
      options: [
        { id: 'a', text: 'It ignores the benefits \u2014 and the costs of not improving services may be far greater (Source K).' },
        { id: 'b', text: 'Taxes never fund any government services.' },
        { id: 'c', text: 'Only cities pay the taxes that fund reserves.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The fear counts spending without returns: economic, social, and moral benefits \u2014 against the greater cost of failure (Source K).',
        b: 'Taxes fund services everywhere; the chapter disputes the ledger, not the fact of taxation (Source K).',
        c: 'The chapter never divides taxpayers by city. The answer is benefits-versus-failure-costs, not who pays (Sources K, F).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l42-health-1',
      contentVersion: '1',
      lessonId: 't3-l10-devolution',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L42-P', 'L42-C'],
      stimulusId: 'l42-health-1',
      familyId: 'l42-health',
      prompt: 'What is the difference between non-Aboriginal and Aboriginal health care services?',
      options: [
        { id: 'a', text: 'Only Aboriginal care employs trained doctors.' },
        { id: 'b', text: 'Symptoms versus holistic causes \u2014 Zoe\'s whole person as policy (Sources P, C).' },
        { id: 'c', text: 'There is no difference between the two.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Backwards. The chapter\'s shortage runs the other way \u2014 some fifty Aboriginal physicians nationwide (Source F) \u2014 and Zoe defines health, not staffing (Source C).',
        b: 'Correct. Non-Aboriginal care treats symptoms; Aboriginal methods seek holistic causes \u2014 the fed, housed, secure whole (Sources P, C).',
        c: 'The chapter\'s whole point is the difference: symptom billing versus whole-cause healing (Source P).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l42-bias-1',
      contentVersion: '1',
      lessonId: 't3-l10-devolution',
      mode: 'multipleChoice',
      skillTag: 'evidence-selection',
      sourceIds: ['L42-O', 'L42-N'],
      stimulusId: 'l42-bias-1',
      familyId: 'l42-bias',
      prompt: 'Why does the chapter warn that outside delivery carries cultural bias?',
      options: [
        { id: 'a', text: 'All outside workers intend deliberate harm.' },
        { id: 'b', text: 'Bias ended permanently with the 1969 White Paper.' },
        { id: 'c', text: 'Residential schools proved paper services can devastate \u2014 and bias persists unintentionally (Sources O–N).' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Intent is not the charge. Source O warns of unintended bias \u2014 programs designed without respect for values and cultures.',
        b: 'No ending is claimed. Even today, programs may contain unintended cultural bias (Source O).',
        c: 'Correct. The catastrophic proof plus the present warning \u2014 against 83 per cent satisfaction where Aboriginal hands deliver (Sources O, N).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l42-independent-1',
      contentVersion: '1',
      lessonId: 't3-l10-devolution',
      mode: 'written',
      sourceIds: ['L42-I', 'L42-J', 'L42-K'],
      familyId: 'l42-objections-table',
      prompt: 'Using Sources I, J, and K, table two objections to distinct services against the chapter\'s answers. State each objection fairly and close with the stronger answer.',
      criteria: ['States two objections fairly in the chapter\'s own terms', 'Answers each with its source clauses (treaties, evolution, benefits)', 'Closes by judging which answer runs deeper, with reasons'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l42-independent-2',
      contentVersion: '1',
      lessonId: 't3-l10-devolution',
      mode: 'written',
      sourceIds: ['L42-N', 'L42-O', 'L42-P'],
      familyId: 'l42-devolution-case',
      prompt: 'Using Sources N, O, and P, make the devolution case in your own words: the support, the bias warning, and the fixes. Name one thing the cards do not settle.',
      criteria: ['Cites the support verdict with the 83 per cent detail', 'States the bias warning with the residential-schools proof', 'Fences one thing the cards do not establish'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l43-proof-1',
      contentVersion: '1',
      lessonId: 't3-l04-urban-life-services',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L43-A', 'L43-B', 'L43-F'],
      stimulusId: 'l43-proof-1',
      familyId: 'l43-neutrality',
      prompt: 'A student writes that outside experts deliver better services because they are neutral. What does the chapter require instead?',
      options: [
        { id: 'a', text: 'Agree \u2014 neutrality fits every community best.' },
        { id: 'b', text: 'Reject it \u2014 consulted communities design fitting services; outsiders risk bias.' },
        { id: 'c', text: 'Reject all services \u2014 fit is impossible.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The neutrality reading \u2014 and wrong. Source A proves consulted communities empower themselves through fitting programs; Sources B and F show the design working in justice and policing. That conclusion must follow the evidence, not the expert\'s title.',
        b: 'Correct. Consultation-built programs address needs appropriately (Source A), Elder direction heals (Source B), and residents\' committees keep policing accountable (Source F). Fit comes from the community, and the evidence refuses the neutral outsider.',
        c: 'Too bleak. The chapter parades working services \u2014 healing centres, policing agreements, nurses \u2014 because they worked. Denying every service to deny neutrality misreads the evidence twice.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l43-begin-1',
      contentVersion: '1',
      lessonId: 't3-l04-urban-life-services',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L43-D', 'L43-E'],
      stimulusId: 'l43-begin-1',
      familyId: 'l43-sivuniksavut',
      prompt: 'A student says Sivuniksavut has always been a college program. What corrects this?',
      options: [
        { id: 'a', text: 'Nothing \u2014 it began as a college in 1985.' },
        { id: 'b', text: 'It began as a policing service for Ottawa youth.' },
        { id: 'c', text: 'It began in 1985 carrying land-claim news (Source D); the college transition came after settlement (Source E).' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: '1985 is the founding, not the college. The original trainees carried negotiation news to communities (Source D).',
        b: 'No policing link exists. Sivuniksavut is Inuit youth education \u2014 claims communication first, campus now (Sources D–E).',
        c: 'Correct. Tunngavik-founded news carriers first; eight-month college transition since the claim settled (Sources D–E).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l43-examples-1',
      contentVersion: '1',
      lessonId: 't3-l04-urban-life-services',
      mode: 'multipleChoice',
      skillTag: 'evidence-selection',
      sourceIds: ['L43-B', 'L43-F'],
      stimulusId: 'l43-examples-1',
      familyId: 'l43-examples',
      prompt: 'Which pair best answers Question 30\'s two Aboriginal-delivered examples?',
      options: [
        { id: 'a', text: 'Stan Daniels Healing Centre plus Alexis policing, each detailed (Sources B, F).' },
        { id: 'b', text: 'Two unnamed friendship centres with no details.' },
        { id: 'c', text: 'AHRDS plus the 1969 White Paper.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Elder-directed healing plus tripartite policing \u2014 two sectors, each with card details (Sources B, F).',
        b: 'Unnamed and undetailed answers nothing. Question 30 wants textbook exhibits with their facts (Sources B–H).',
        c: 'AHRDS is joint delivery, not Aboriginal-delivered \u2014 and the White Paper proposed erasing distinct status (Lesson 9, Sources D and A).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l43-johnson-1',
      contentVersion: '1',
      lessonId: 't3-l04-urban-life-services',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L43-I', 'L43-J'],
      stimulusId: 'l43-johnson-1',
      familyId: 'l43-johnson',
      prompt: 'What does Lee Ann Johnson\'s story prove about the capacity shortage?',
      options: [
        { id: 'a', text: 'Nursing requires leaving the community forever.' },
        { id: 'b', text: 'The pipeline works: thirteen years from wards to diabetes education \u2014 and she recruits next (Sources I–J).' },
        { id: 'c', text: 'Capacity needs buildings, never people.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'She works Population Health serving her people \u2014 and points youth to opportunities in their community (Sources I–J).',
        b: 'Correct. Wards to university to diabetes educator, grown confidence \u2014 then a direct pitch to enter health (Sources I–J).',
        c: 'The chapter\'s shortage is human resources \u2014 skilled people \u2014 not buildings (Lesson 9, Source F; Sources I–J here).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l43-design-1',
      contentVersion: '1',
      lessonId: 't3-l04-urban-life-services',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L43-K', 'L43-L'],
      stimulusId: 'l43-design-1',
      familyId: 'l43-design',
      prompt: 'A service pitch names only its goals. What does Source K still require?',
      options: [
        { id: 'a', text: 'Nothing \u2014 goals alone suffice.' },
        { id: 'b', text: 'A federal takeover plan with new funding.' },
        { id: 'c', text: 'The offer, the qualifiers, and the access path \u2014 plus benefits and problems of community control.' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Goals open the brief; Source K demands the offer, qualifiers, and access path \u2014 then the honest benefits-and-problems weighing.',
        b: 'The brief runs the other way: Aboriginal-run design, with government\'s role an open discussion question (Source L).',
        c: 'Correct. Three brochure details plus the control trade-off, researched through federal and Aboriginal-delivered services (Sources K, L).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l43-francis-1',
      contentVersion: '1',
      lessonId: 't3-l04-urban-life-services',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L43-N', 'L43-O'],
      stimulusId: 'l43-francis-1',
      familyId: 'l43-francis',
      prompt: 'What is Francis\'s point in mcPemmican, and how does the chapter use it?',
      options: [
        { id: 'a', text: 'A genuine recipe for traditional pemmican.' },
        { id: 'b', text: 'Fast-food disposable culture served back as satire \u2014 then set against Shingoose\'s voice (Sources N–O).' },
        { id: 'c', text: 'Praise for healthy city food options.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Grease, mystery meat, and lies with that is satire, not supper \u2014 the chapter assigns discussing his point (Source N).',
        b: 'Correct. Disposable culture beaded bright, then compared with Shingoose\'s song \u2014 humour as evidence (Sources N–O).',
        c: 'The poem indicts city food culture; nothing in it praises a single meal (Source N).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l43-independent-1',
      contentVersion: '1',
      lessonId: 't3-l04-urban-life-services',
      mode: 'written',
      sourceIds: ['L43-K', 'L43-A', 'L43-F'],
      familyId: 'l43-brief',
      prompt: 'Using Sources K, A, and F, draft a service brief: the offer, qualifiers, and access path, one benefit and one problem of community control, and the exhibit that grounds each. Name one thing the cards do not settle.',
      criteria: ['Names offer, qualifiers, and access path', 'Grounds one benefit and one problem in exhibits', 'Fences one thing the cards do not establish'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l43-independent-2',
      contentVersion: '1',
      lessonId: 't3-l04-urban-life-services',
      mode: 'written',
      sourceIds: ['L43-M', 'L43-L', 'L43-N'],
      familyId: 'l43-verdict',
      prompt: 'Using Sources M, L, and N, argue the chapter\'s closing verdict: Aboriginal management makes the difference. Defend with exhibits and close with the self-determination question.',
      criteria: ['Defends Aboriginal management with two exhibits', 'States the difference for recipients', 'Closes with the self-determination question'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l44-pair-1',
      contentVersion: '1',
      lessonId: 't4-l01-one-world-many-peoples',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L44-C', 'L44-N'],
      stimulusId: 'l44-pair-1',
      familyId: 'l44-similarity-difference',
      prompt: 'A student offers both faced colonizers as a similarity and Guatemala\'s Indigenous people are the majority as a difference. What holds?',
      options: [
        { id: 'a', text: 'Both fail \u2014 Guatemala and Canada share nothing.' },
        { id: 'b', text: 'Both hold \u2014 the shared colonial wound plus Guatemala\'s 65 per cent majority.' },
        { id: 'c', text: 'Only the difference holds \u2014 colonization touched Guatemala alone.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The nothing-shared reading \u2014 and wrong. Source N counts the wound on both continents: conquest, decline, survival willed. That conclusion must follow the evidence, not the distance.',
        b: 'Correct. The colonial wound is shared (Source N); the 65 per cent majority with its protection question is Guatemala\'s own (Source C). Similarity plus difference, each with its card.',
        c: 'Half right, half blind. Colonization reached Canada too \u2014 conquest, disease, survival (Source N) \u2014 so the similarity stands with the difference. Dropping it misreads the evidence.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l44-anniversary-1',
      contentVersion: '1',
      lessonId: 't4-l01-one-world-many-peoples',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L44-A', 'L44-B'],
      stimulusId: 'l44-anniversary-1',
      familyId: 'l44-anniversary',
      prompt: 'What did the 500th anniversary open, on Menchú\'s account?',
      options: [
        { id: 'a', text: 'Nothing \u2014 pure insult, no opening.' },
        { id: 'b', text: 'International forums and the 1993 International Year, won by walking brothers (Source B).' },
        { id: 'c', text: 'A Nobel Prize for the interviewing journalist.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'Half the case. The insult stands (Source A) \u2014 but the anniversary also opened forums and won 1993 (Source B).',
        b: 'Correct. Triumphism denounced, then the opening seized: forums, the International Year, cultural diversity named (Sources A–B).',
        c: 'No prize for Riis-Hansen exists in the cards. The 1992 Nobel went to Menchú \u2014 and 1993 to Indigenous peoples (Source B).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l44-indigenous-1',
      contentVersion: '1',
      lessonId: 't4-l01-one-world-many-peoples',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L44-G'],
      stimulusId: 'l44-indigenous-1',
      familyId: 'l44-indigenous',
      prompt: 'What does indigenous mean, and where does cultural identity grow?',
      options: [
        { id: 'a', text: 'Originating in a region, naturally there; identity from the place of origin (Source G).' },
        { id: 'b', text: 'Living in cities; identity from passports and offices.' },
        { id: 'c', text: 'Speaking 700 languages; identity from schools.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Two sentences, two answers: originate there (q2), identity from there (q3) \u2014 Source G whole.',
        b: 'Cities and passports appear nowhere in the definition. Origin in a region does (Source G).',
        c: '700 languages belong to Australia\'s diversity row (Source L), not to the definition (Source G).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l44-voices-1',
      contentVersion: '1',
      lessonId: 't4-l01-one-world-many-peoples',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L44-H'],
      stimulusId: 'l44-voices-1',
      familyId: 'l44-voices',
      prompt: 'What do the three page-210 voices share?',
      options: [
        { id: 'a', text: 'A demand for new national borders.' },
        { id: 'b', text: 'A recipe for traditional pemmican.' },
        { id: 'c', text: 'Land-as-kin: nature relationship, shared peace, environment-as-people (Source H).' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Borders divide peoples in Lesson 2 (Source A there); these voices unite them in land (Source H).',
        b: 'Pemmican belongs to Francis (Lesson 43). These voices serve nature, peace, and kinship (Source H).',
        c: 'Correct. Boine\'s first relationship, Coon Come\'s shared peace, Goldtooth\'s one-and-same \u2014 Source H whole.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l44-colonial-1',
      contentVersion: '1',
      lessonId: 't4-l01-one-world-many-peoples',
      mode: 'multipleChoice',
      skillTag: 'evidence-selection',
      sourceIds: ['L44-N'],
      stimulusId: 'l44-colonial-1',
      familyId: 'l44-colonial',
      prompt: 'What does the shared colonial history count?',
      options: [
        { id: 'a', text: 'No deaths anywhere \u2014 contact was peaceful.' },
        { id: 'b', text: 'Twenty-five million dead in the Spanish conquest; Caribbean elimination; Australia and Maori plunges \u2014 and survival (Source N).' },
        { id: 'c', text: 'Only language loss, nothing more.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The card counts millions dead. Peaceful contact contradicts every clause of Source N.',
        b: 'Correct. Conquest counted honestly, then the survival that answers it: lands, languages, and beliefs willed forward (Source N).',
        c: 'Language loss is real but partial. Source N counts dead peoples \u2014 then the will that outlived conquest.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l44-ethno-1',
      contentVersion: '1',
      lessonId: 't4-l01-one-world-many-peoples',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L44-O', 'L44-A'],
      stimulusId: 'l44-ethno-1',
      familyId: 'l44-ethnocentrism',
      prompt: 'A colonizer calls conquest discovery. What names this?',
      options: [
        { id: 'a', text: 'Ethnocentrism: own standards, differences as inferiority (Sources O, A).' },
        { id: 'b', text: 'Accuracy \u2014 discovery is the right word.' },
        { id: 'c', text: 'Oral tradition \u2014 a story-map term.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Superior-own-culture belief with a parade: triumphism naming conquest discovery (Sources O, A).',
        b: 'Menchú\'s whole answer refuses this word \u2014 triumphism, occupation, presumptuousness (Source A).',
        c: 'Story maps trace ancestors across land (Source J); they do not rename conquest (Sources O, A).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l44-independent-1',
      contentVersion: '1',
      lessonId: 't4-l01-one-world-many-peoples',
      mode: 'written',
      sourceIds: ['L44-I', 'L44-J', 'L44-K'],
      familyId: 'l44-characteristics',
      prompt: 'Using Sources I, J, and K, outline three shared characteristics with their card details. Add one Canadian connection and fence one thing the cards do not settle.',
      criteria: ['Outlines three characteristics with card details', 'Adds one Canadian connection from your own knowledge', 'Fences one thing the cards do not establish'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l44-independent-2',
      contentVersion: '1',
      lessonId: 't4-l01-one-world-many-peoples',
      mode: 'written',
      sourceIds: ['L44-L', 'L44-M', 'L44-N'],
      familyId: 'l44-survival',
      prompt: 'Using Sources L, M, and N, argue that diversity and community survived conquest. Show two survivals and name the will behind them.',
      criteria: ['Shows two survivals with card details', 'Names the preserving will with its objects', 'Keeps card facts separate from your own claims'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l45-eight-1',
      contentVersion: '1',
      lessonId: 't4-l05-nine-issues',
      mode: 'multipleChoice',
      skillTag: 'scope-of-inference',
      sourceIds: ['L45-B', 'L45-O'],
      stimulusId: 'l45-eight-1',
      familyId: 'l45-eight-nine',
      prompt: 'A student fills the eight booklet rows and stops. What must they still check?',
      options: [
        { id: 'a', text: 'Nothing \u2014 eight rows close the question.' },
        { id: 'b', text: 'The textbook\'s ninth area: intellectual property rights \u2014 know it though the table holds eight.' },
        { id: 'c', text: 'A ninth row must be added to the booklet.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The eight-is-all reading \u2014 and wrong. Source B groups nine areas and Source O teaches the ninth: appropriated knowledge, unshared wealth. That conclusion must follow the evidence, not the row count.',
        b: 'Correct. Nine grouped (Source B), eight tabled, the ninth learned anyway (Source O). The booklet asks eight rows; the chapter asks nine areas \u2014 know both numbers.',
        c: 'Too much. The booklet\'s eight rows stand as printed; nothing authorizes rewriting them. Learn the ninth area (Source O) alongside the table, not inside it \u2014 the evidence bounds the claim.',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l45-land-1',
      contentVersion: '1',
      lessonId: 't4-l05-nine-issues',
      mode: 'multipleChoice',
      skillTag: 'evidence-selection',
      sourceIds: ['L45-C'],
      stimulusId: 'l45-land-1',
      familyId: 'l45-land',
      prompt: 'What makes land first among the issues?',
      options: [
        { id: 'a', text: 'Java: ten million moved, hundreds killed, 400,000 in camps \u2014 over sacred ground and wealth (Source C).' },
        { id: 'b', text: 'Land is irrelevant to Indigenous peoples.' },
        { id: 'c', text: 'Only cities and offices matter.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Sacred ground plus wealth shares, proved by Java\'s counted cost \u2014 Source C whole.',
        b: 'Everything stands on land, the lesson opens. The card\'s first sentence says nearly all peoples fight for it (Source C).',
        c: 'Offices divide land; they do not replace it. Sacred sites and wealth shares do the work (Source C).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l45-laboucan-1',
      contentVersion: '1',
      lessonId: 't4-l05-nine-issues',
      mode: 'multipleChoice',
      skillTag: 'claim-kind',
      sourceIds: ['L45-D'],
      stimulusId: 'l45-laboucan-1',
      familyId: 'l45-laboucan',
      prompt: 'What does Laboucan-Massimo add to the land row?',
      options: [
        { id: 'a', text: 'A Java relocation timetable.' },
        { id: 'b', text: 'A dance troupe schedule.' },
        { id: 'c', text: 'A voice: forced loss of languages, cultures, land; appropriation; frustration turned to action (Source D).' },
      ],
      correctOptionId: 'c',
      feedbackByOption: {
        a: 'Java\'s numbers belong to Source C. Laboucan-Massimo brings the cost in a voice (Source D).',
        b: 'Dance belongs to Cherith Mark (Sources E–F). Laboucan-Massimo brings governance-bound frustration (Source D).',
        c: 'Correct. Loss named, commodification refused, culture kept integral \u2014 her words, her direction (Source D).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l45-language-1',
      contentVersion: '1',
      lessonId: 't4-l05-nine-issues',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L45-I'],
      stimulusId: 'l45-language-1',
      familyId: 'l45-language',
      prompt: 'What do the language numbers warn?',
      options: [
        { id: 'a', text: '2,000-plus wiped; 6,000 left; half may go in your lifetime (Source I).' },
        { id: 'b', text: 'Languages are safe forever now.' },
        { id: 'c', text: 'Only 700 languages remain worldwide.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. Wiped since 1492, imperilled today, forbidden in schools yesterday \u2014 Source I whole.',
        b: 'Half may disappear in your lifetime, the card warns. Safety is the opposite of its claim (Source I).',
        c: '700 was Australia\'s contact count (Lesson 1, Source L); the world holds 6,000 \u2014 imperilled (Source I).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l45-health-1',
      contentVersion: '1',
      lessonId: 't4-l05-nine-issues',
      mode: 'multipleChoice',
      skillTag: 'detail-selection',
      sourceIds: ['L45-M'],
      stimulusId: 'l45-health-1',
      familyId: 'l45-health',
      prompt: 'What does the health row count?',
      options: [
        { id: 'a', text: 'Perfect health in every community.' },
        { id: 'b', text: 'Central Australia: 40 per cent hospitalized under three; triple the baby deaths; twenty years lost (Source M).' },
        { id: 'c', text: 'Only dental appointments.' },
      ],
      correctOptionId: 'b',
      feedbackByOption: {
        a: 'The card counts the opposite: lagging health and care, honestly numbered (Source M).',
        b: 'Correct. Hospitalized toddlers, triple deaths, twenty lost years \u2014 plus the developed-world complication (Source M).',
        c: 'Respiratory illness and mortality, not dentistry. The numbers name the gap (Source M).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l45-stats-1',
      contentVersion: '1',
      lessonId: 't4-l05-nine-issues',
      mode: 'multipleChoice',
      skillTag: 'evidence-selection',
      sourceIds: ['L45-J'],
      stimulusId: 'l45-stats-1',
      familyId: 'l45-stats',
      prompt: 'Which statistic seasons the war row?',
      options: [
        { id: 'a', text: 'Almost three-quarters of 120 armed conflicts pit governments against Indigenous peoples (Source J).' },
        { id: 'b', text: '150 of 25,000 students \u2014 the education row.' },
        { id: 'c', text: '45 per cent chronic conditions \u2014 the health row.' },
      ],
      correctOptionId: 'a',
      feedbackByOption: {
        a: 'Correct. The conflicts number belongs to war; the box seasons each row with its own (Source J).',
        b: 'Guatemala\'s 150 belongs to the education row \u2014 right box, wrong row (Source J).',
        c: 'Canada\'s 45 per cent belongs to the health row \u2014 right box, wrong row (Source J).',
      },
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l45-independent-1',
      contentVersion: '1',
      lessonId: 't4-l05-nine-issues',
      mode: 'written',
      sourceIds: ['L45-G', 'L45-H', 'L45-J'],
      familyId: 'l45-link',
      prompt: 'Using Sources G, H, and J, argue the environment–war link with two grounded examples. Close with the pattern they share.',
      criteria: ['Grounds two examples with card numbers', 'States the environment–war link explicitly', 'Closes with the shared pattern'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      id: 'ab30-v2-l45-independent-2',
      contentVersion: '1',
      lessonId: 't4-l05-nine-issues',
      mode: 'written',
      sourceIds: ['L45-L', 'L45-E', 'L45-P'],
      familyId: 'l45-answers',
      prompt: 'Using Sources L, E, and P, show three answers: organization, art, and testimony. Defend each with its card.',
      criteria: ['Defends organization with ICC details', 'Defends art with Mark details', 'Defends testimony with Kusugak details'],
      automaticScore: false,
      formalMarks: null,
      compulsory: false,
      reviewed: true,
      status: 'AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW'
    },
    {
      "id": "ab30-v2-l46-concept-1",
      "contentVersion": "1",
      "lessonId": "t4-l02-colonial-wounds",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "distinct-peoples",
      "sourceIds": [
        "L46-booklet-p6"
      ],
      "stimulusId": "l46-concept-1",
      "familyId": "l46-concept-1",
      "prompt": "Which wording respects the distinction introduced before the Australia study?",
      "options": [
        {
          "id": "a",
          "text": "ATSI and FNMI are suitable names for any individual."
        },
        {
          "id": "b",
          "text": "Name the person or Nation when known; distinguish Aboriginal and Torres Strait Islander peoples, and First Nations, Inuit and Métis."
        },
        {
          "id": "c",
          "text": "Use one collective name because all communities have the same history."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The booklet asks why these acronyms can be disrespectful when naming a person. They are no substitute for a preferred name.",
        "b": "Correct. The booklet and Finlay’s terminology prompt call for precise names and distinct peoples.",
        "c": "A collective label can be useful in context, but it does not erase distinct peoples or histories."
      }
    },
    {
      "id": "ab30-v2-l46-concept-2",
      "contentVersion": "1",
      "lessonId": "t4-l02-colonial-wounds",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "comparison-category",
      "sourceIds": [
        "L46-booklet-p8"
      ],
      "stimulusId": "l46-concept-2",
      "familyId": "l46-concept-2",
      "prompt": "Which statement answers the chart category “destinations after removal,” rather than a different category?",
      "options": [
        {
          "id": "a",
          "text": "The policy aimed at assimilation."
        },
        {
          "id": "b",
          "text": "The inquiry made recommendations in 1997."
        },
        {
          "id": "c",
          "text": "Australian institutions or foster families; Canadian residential schools."
        }
      ],
      "correctOptionId": "c",
      "feedbackByOption": {
        "a": "That addresses government rationale, not destinations.",
        "b": "That belongs under reports and outcomes, not destinations.",
        "c": "Correct. It names where children were placed in each country, as the sources describe."
      }
    },
    {
      "id": "ab30-v2-l46-evidence-1",
      "contentVersion": "1",
      "lessonId": "t4-l02-colonial-wounds",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "source-attribution",
      "sourceIds": [
        "L46-A"
      ],
      "stimulusId": "l46-evidence-1",
      "familyId": "l46-evidence-1",
      "prompt": "What can the Australian fact sheet support directly?",
      "options": [
        {
          "id": "a",
          "text": "A 1915 amendment permitted removals without parental consent or court order."
        },
        {
          "id": "b",
          "text": "Every child spent exactly six years away."
        },
        {
          "id": "c",
          "text": "A scene-by-scene account of the film."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "Correct. The fact sheet states this policy change. Keep it attributed to Australia.",
        "b": "The source warns that records are incomplete; it gives no single duration for every child.",
        "c": "The fact sheet is historical background, not a film transcript."
      }
    },
    {
      "id": "ab30-v2-l46-evidence-2",
      "contentVersion": "1",
      "lessonId": "t4-l02-colonial-wounds",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "source-limit",
      "sourceIds": [
        "L46-B"
      ],
      "stimulusId": "l46-evidence-2",
      "familyId": "l46-evidence-2",
      "prompt": "Which claim stays within the NCTR overview?",
      "options": [
        {
          "id": "a",
          "text": "All children had identical experiences."
        },
        {
          "id": "b",
          "text": "First Nations, Inuit and Métis children were separated from communities for residential schooling, and language punishment occurred."
        },
        {
          "id": "c",
          "text": "Canada used Australian foster placements."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The NCTR describes a system and harms, not identical experiences for every child.",
        "b": "Correct. Both separation and language punishment appear in the NCTR overview.",
        "c": "This imports an Australian destination into the Canadian history."
      }
    },
    {
      "id": "ab30-v2-l46-application-1",
      "contentVersion": "1",
      "lessonId": "t4-l02-colonial-wounds",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "paired-comparison",
      "sourceIds": [
        "L46-A",
        "L46-B"
      ],
      "stimulusId": "l46-application-1",
      "familyId": "l46-application-1",
      "prompt": "Which paired note best answers the chart’s loss category using the two sources?",
      "options": [
        {
          "id": "a",
          "text": "Both countries sent every child to the same kind of school for the same length of time."
        },
        {
          "id": "b",
          "text": "The Australian source describes disrupted family, land and culture connections; the Canadian source describes separation and punishment for speaking Indigenous languages."
        },
        {
          "id": "c",
          "text": "Australia produced a report in 1997, so no further comparison is needed."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "That collapses the systems and claims “every child” without evidence. The sources name different destinations and do not give one duration for all children.",
        "b": "This note addresses losses in each country and identifies which source supports each detail. It leaves individual experiences open.",
        "c": "The Australian report belongs in a later chart row. It does not answer what children lost, nor does it supply Canadian evidence."
      }
    },
    {
      "id": "ab30-v2-l46-application-2",
      "contentVersion": "1",
      "lessonId": "t4-l02-colonial-wounds",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "film-versus-history",
      "sourceIds": [
        "L46-booklet-p10",
        "L46-A"
      ],
      "stimulusId": "l46-application-2",
      "familyId": "l46-application-2",
      "prompt": "A film question asks what Molly does in one scene. Which evidence should you use?",
      "options": [
        {
          "id": "a",
          "text": "The 1997 inquiry alone, because it records every film scene."
        },
        {
          "id": "b",
          "text": "A scene you actually viewed, identified as a film depiction, with historical background kept separate."
        },
        {
          "id": "c",
          "text": "An invented quotation that sounds like Molly."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The inquiry is historical evidence, not a scene log for this film.",
        "b": "Correct. Attribute scene evidence to the film and historical policy evidence to the fact sheet.",
        "c": "Never invent dialogue or testimony when the film is unavailable."
      }
    },
    {
      "id": "ab30-v2-l46-independent-1",
      "contentVersion": "1",
      "lessonId": "t4-l02-colonial-wounds",
      "mode": "written",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "sourceIds": [
        "L46-A",
        "L46-B"
      ],
      "familyId": "l46-policy",
      "prompt": "Compare the policy rationale described by the Australian fact sheet and the Canadian NCTR overview. Give one sourced note for each country and one limit of the comparison.",
      "criteria": [
        "Attributes each country’s rationale to its own source",
        "Distinguishes removal placements from residential schooling",
        "States a specific limit without claiming every child had the same experience"
      ]
    },
    {
      "id": "ab30-v2-l46-independent-2",
      "contentVersion": "1",
      "lessonId": "t4-l02-colonial-wounds",
      "mode": "written",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "sourceIds": [
        "L46-booklet-p8",
        "L46-A",
        "L46-B"
      ],
      "familyId": "l46-chart",
      "prompt": "Choose the chart row on language and cultural losses. Draft two sourced cells, one for Australia and one for Canada, then explain what additional evidence you would need to describe an individual experience.",
      "criteria": [
        "Completes two separate country cells",
        "Supports each cell with the correct source",
        "Identifies a need for specific testimony or records before describing an individual"
      ]
    },
    {
      "id": "ab30-v2-l47-concept-1",
      "contentVersion": "1",
      "lessonId": "t4-l06-resources-conflict",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "sustainable-development",
      "sourceIds": [
        "L47-textbook-p220"
      ],
      "stimulusId": "l47-concept-1",
      "familyId": "l47-concept-1",
      "prompt": "Which definition matches the textbook’s “sustainable development”?",
      "options": [
        {
          "id": "a",
          "text": "Meeting present needs without compromising future generations’ needs."
        },
        {
          "id": "b",
          "text": "Extracting as much as possible this year."
        },
        {
          "id": "c",
          "text": "Stopping all activity on every Indigenous territory."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "That is the definition the textbook introduces before the resource cases.",
        "b": "Present benefit alone does not answer the future-generations part.",
        "c": "The term sets a test for development; it is not a blanket description of all land use."
      }
    },
    {
      "id": "ab30-v2-l47-concept-2",
      "contentVersion": "1",
      "lessonId": "t4-l06-resources-conflict",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "principle-versus-verdict",
      "sourceIds": [
        "L47-B"
      ],
      "stimulusId": "l47-concept-2",
      "familyId": "l47-concept-2",
      "prompt": "Which statement keeps a declaration principle separate from a project verdict?",
      "options": [
        {
          "id": "a",
          "text": "Principle 22 itself approves the Oldman Dam."
        },
        {
          "id": "b",
          "text": "Principle 22 calls for effective Indigenous participation; evidence about a particular decision is needed to judge that project."
        },
        {
          "id": "c",
          "text": "Principle 22 means consultation has already occurred everywhere."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The declaration does not name or approve the Oldman Dam.",
        "b": "The principle supplies a standard; a project verdict needs its own evidence.",
        "c": "A call for participation is not evidence that a given community was included."
      }
    },
    {
      "id": "ab30-v2-l47-evidence-1",
      "contentVersion": "1",
      "lessonId": "t4-l06-resources-conflict",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "supply-chain",
      "sourceIds": [
        "L47-A"
      ],
      "stimulusId": "l47-evidence-1",
      "familyId": "l47-evidence-1",
      "prompt": "Which detail best starts an answer to booklet Question 15?",
      "options": [
        {
          "id": "a",
          "text": "Sahtú Dene men carried uranium ore for Eldorado near Great Bear Lake."
        },
        {
          "id": "b",
          "text": "Every Dene worker chose the bomb target."
        },
        {
          "id": "c",
          "text": "The Rio Declaration was signed in 1945."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "This names the community, work and mine before tracing the wartime customer.",
        "b": "The source does not attribute that choice or knowledge to ore carriers.",
        "c": "Rio is a 1992 declaration and belongs to Question 16."
      }
    },
    {
      "id": "ab30-v2-l47-evidence-2",
      "contentVersion": "1",
      "lessonId": "t4-l06-resources-conflict",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "dated-source",
      "sourceIds": [
        "L47-C"
      ],
      "stimulusId": "l47-evidence-2",
      "familyId": "l47-evidence-2",
      "prompt": "What does the textbook’s 2005 Syncrude passage directly support?",
      "options": [
        {
          "id": "a",
          "text": "A verified account of every present-day Fort McKay view."
        },
        {
          "id": "b",
          "text": "The textbook’s report of a Fort McKay partnership and Aboriginal employment at the time of writing."
        },
        {
          "id": "c",
          "text": "Proof that mining has no costs."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "A historical textbook passage cannot verify every current community view.",
        "b": "That is the report the passage makes; attribute it to its 2005 source.",
        "c": "The chapter also discusses mining costs. One company example proves no universal claim."
      }
    },
    {
      "id": "ab30-v2-l47-rio-1",
      "contentVersion": "1",
      "lessonId": "t4-l06-resources-conflict",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "principle-application",
      "sourceIds": [
        "L47-B"
      ],
      "stimulusId": "l47-rio-1",
      "familyId": "l47-rio",
      "prompt": "Which claim does Principle 22 support?",
      "options": [
        {
          "id": "a",
          "text": "A country can ignore affected Indigenous communities whenever a project creates jobs."
        },
        {
          "id": "b",
          "text": "States should recognize Indigenous knowledge, identity, culture and interests and enable effective participation in sustainable development."
        },
        {
          "id": "c",
          "text": "The declaration itself cancels every mine or dam built before 1992."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The principle calls for effective participation; jobs alone do not answer that demand.",
        "b": "This is the principle’s direction. Apply it to a project only after checking the affected community and decision process.",
        "c": "The declaration sets principles. It does not itself decide or undo every project."
      }
    },
    {
      "id": "ab30-v2-l47-application-2",
      "contentVersion": "1",
      "lessonId": "t4-l06-resources-conflict",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "case-comparison",
      "sourceIds": [
        "L47-textbook-p222"
      ],
      "stimulusId": "l47-application-2",
      "familyId": "l47-application-2",
      "prompt": "The textbook contrasts tourism in Wechiau and the Cordillera. What question transfers to a new tourism proposal?",
      "options": [
        {
          "id": "a",
          "text": "Will visitors enjoy the same wildlife in both places?"
        },
        {
          "id": "b",
          "text": "Who controls the project, who benefits, and were Indigenous land and cultural interests respected?"
        },
        {
          "id": "c",
          "text": "Can all tourism be judged by one 2005 example?"
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "Visitor enjoyment alone leaves out community control and rights.",
        "b": "This tests the decision process and distribution of benefits in a new case.",
        "c": "The two textbook examples differ; neither decides every later proposal."
      }
    },
    {
      "id": "ab30-v2-l47-independent-1",
      "contentVersion": "1",
      "lessonId": "t4-l06-resources-conflict",
      "mode": "written",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "sourceIds": [
        "L47-A"
      ],
      "familyId": "l47-supply",
      "prompt": "Trace the textbook’s Great Bear Lake uranium supply chain to Hiroshima. State what the source does and does not say about the Sahtú Dene ore carriers’ responsibility.",
      "criteria": [
        "Names Sahtú Dene work and Eldorado",
        "Identifies the wartime customer and Hiroshima connection",
        "Does not assign the bombing decision to ore carriers"
      ]
    },
    {
      "id": "ab30-v2-l47-independent-2",
      "contentVersion": "1",
      "lessonId": "t4-l06-resources-conflict",
      "mode": "written",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "sourceIds": [
        "L47-B",
        "L47-C"
      ],
      "familyId": "l47-decision",
      "prompt": "Use Principle 22 to frame two questions you would ask about the 2005 Syncrude example; identify which answers require a current Fort McKay First Nation source.",
      "criteria": [
        "States Principle 22 as a participation standard",
        "Asks two concrete decision or benefit questions",
        "Separates the dated textbook account from current community evidence"
      ]
    },
    {
      "id": "ab30-v2-l48-concept-1",
      "contentVersion": "1",
      "lessonId": "t4-l03-land-resources-un",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "committee-power",
      "sourceIds": [
        "L48-B"
      ],
      "stimulusId": "l48-concept-1",
      "familyId": "l48-concept-1",
      "prompt": "What is the right limit on a UN Human Rights Committee finding?",
      "options": [
        {
          "id": "a",
          "text": "It can document a concern and create pressure, but does not itself rewrite Canadian law."
        },
        {
          "id": "b",
          "text": "It is a Canadian court judgment that automatically repeals a statute."
        },
        {
          "id": "c",
          "text": "It has no public effect or possible influence."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "That is the distinction the textbook makes between findings and domestic action.",
        "b": "A UN committee is not a Canadian court or legislature.",
        "c": "The textbook gives examples of public pressure and government responses."
      }
    },
    {
      "id": "ab30-v2-l48-concept-2",
      "contentVersion": "1",
      "lessonId": "t4-l03-land-resources-un",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "four-purposes",
      "sourceIds": [
        "L48-B"
      ],
      "stimulusId": "l48-concept-2",
      "familyId": "l48-concept-2",
      "prompt": "Which item belongs among the four UN purposes in the textbook?",
      "options": [
        {
          "id": "a",
          "text": "Require every NGO to become a member state."
        },
        {
          "id": "b",
          "text": "Cooperate in solving international problems and promoting human rights."
        },
        {
          "id": "c",
          "text": "Replace all national governments."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "NGOs do not become member states by participating.",
        "b": "This is one of the four purposes listed from the UN Charter.",
        "c": "The textbook explicitly says the UN is not a world government."
      }
    },
    {
      "id": "ab30-v2-l48-evidence-1",
      "contentVersion": "1",
      "lessonId": "t4-l03-land-resources-un",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "canada-response",
      "sourceIds": [
        "L48-A"
      ],
      "stimulusId": "l48-evidence-1",
      "familyId": "l48-evidence-1",
      "prompt": "What response does Source A report after the UN findings?",
      "options": [
        {
          "id": "a",
          "text": "Canada committed to end the “practice of extinguishment.”"
        },
        {
          "id": "b",
          "text": "The UN passed Bill C-31 in 1999."
        },
        {
          "id": "c",
          "text": "All land disputes were declared resolved."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "Correct as a reported commitment; later implementation needs separate evidence.",
        "b": "Bill C-31 was a Canadian amendment in 1985, not an act of the UN in 1999.",
        "c": "The source reports a commitment, not resolution of every dispute."
      }
    },
    {
      "id": "ab30-v2-l48-evidence-2",
      "contentVersion": "1",
      "lessonId": "t4-l03-land-resources-un",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "draft-timeline",
      "sourceIds": [
        "L48-C"
      ],
      "stimulusId": "l48-evidence-2",
      "familyId": "l48-evidence-2",
      "prompt": "What timeline does the textbook give for the Working Group’s draft declaration?",
      "options": [
        {
          "id": "a",
          "text": "It began in 1985 and the draft was completed in 1993."
        },
        {
          "id": "b",
          "text": "It began and was completed in 1989."
        },
        {
          "id": "c",
          "text": "The draft was completed in 1945 before the UN existed."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "The textbook says drafting began in 1985 and the group completed a draft in 1993.",
        "b": "The textbook does not give 1989 as the completion date.",
        "c": "The UN was established in 1945; this working group came later."
      }
    },
    {
      "id": "ab30-v2-l48-route-1",
      "contentVersion": "1",
      "lessonId": "t4-l03-land-resources-un",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "forum-application",
      "sourceIds": [
        "L48-C"
      ],
      "stimulusId": "l48-route-1",
      "familyId": "l48-route",
      "prompt": "How can an Indigenous organization use a UN forum according to Source C?",
      "options": [
        {
          "id": "a",
          "text": "It automatically receives a country’s vote and can change Canadian law."
        },
        {
          "id": "b",
          "text": "It can present views, build a public record and seek international support, while domestic action remains necessary."
        },
        {
          "id": "c",
          "text": "It must stop organizing in Canada once it speaks at the UN."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The textbook reserves votes for countries and does not give an NGO the power to amend Canadian law.",
        "b": "This identifies a route for influence and its limit. A forum can amplify evidence; domestic change requires further action.",
        "c": "International participation can complement domestic organizing; the source does not demand abandoning it."
      }
    },
    {
      "id": "ab30-v2-l48-application-2",
      "contentVersion": "1",
      "lessonId": "t4-l03-land-resources-un",
      "mode": "multipleChoice",
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "skillTag": "response-evidence",
      "sourceIds": [
        "L48-A",
        "L48-C"
      ],
      "stimulusId": "l48-application-2",
      "familyId": "l48-application-2",
      "prompt": "A learner wants to know whether a UN finding improved a community’s access to land. What evidence should they seek next?",
      "options": [
        {
          "id": "a",
          "text": "Only the committee’s original wording."
        },
        {
          "id": "b",
          "text": "Later government actions and community accounts of what changed on the ground."
        },
        {
          "id": "c",
          "text": "An unrelated list of UN member countries."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The finding establishes a public record; outcome needs follow-through evidence.",
        "b": "This tests both domestic action and the affected community’s experience.",
        "c": "Membership does not show an outcome for that community."
      }
    },
    {
      "id": "ab30-v2-l48-independent-1",
      "contentVersion": "1",
      "lessonId": "t4-l03-land-resources-un",
      "mode": "written",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "sourceIds": [
        "L48-A",
        "L48-B"
      ],
      "familyId": "l48-response",
      "prompt": "Explain the response to the 1998–1999 UN findings reported by the textbook, and state what additional evidence would prove implementation.",
      "criteria": [
        "Names the reported Canadian commitment",
        "Distinguishes a response from implemented change",
        "Specifies later policy and community evidence to seek"
      ]
    },
    {
      "id": "ab30-v2-l48-independent-2",
      "contentVersion": "1",
      "lessonId": "t4-l03-land-resources-un",
      "mode": "written",
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW",
      "sourceIds": [
        "L48-B",
        "L48-C"
      ],
      "familyId": "l48-purposes",
      "prompt": "Choose two distinct UN Charter purposes, then connect each to one Indigenous participation route described by the textbook without claiming that NGOs have member-state votes.",
      "criteria": [
        "Names two distinct purposes accurately",
        "Connects each to a relevant participation route",
        "States the NGO voting limit accurately"
      ]
    },
    {
      "id": "ab30-v2-l49-concept-1",
      "contentVersion": "1",
      "lessonId": "t4-l07-education-odds",
      "mode": "multipleChoice",
      "skillTag": "quantifier",
      "sourceIds": [
        "L49-A"
      ],
      "stimulusId": "l49-concept-1",
      "familyId": "l49-concept-1",
      "prompt": "If Indigenous children are disproportionately represented in a group, what follows?",
      "options": [
        {
          "id": "a",
          "text": "They must be most of the group."
        },
        {
          "id": "b",
          "text": "Their share is higher than a relevant comparison share; a majority is not established."
        },
        {
          "id": "c",
          "text": "There are no Indigenous children in the group."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "Disproportionate does not imply over half.",
        "b": "That is the precise inference the booklet’s true-or-false question tests.",
        "c": "The source says the opposite: Indigenous children are represented disproportionately."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l49-concept-2",
      "contentVersion": "1",
      "lessonId": "t4-l07-education-odds",
      "mode": "multipleChoice",
      "skillTag": "education-mechanism",
      "sourceIds": [
        "L49-C"
      ],
      "stimulusId": "l49-concept-2",
      "familyId": "l49-concept-2",
      "prompt": "Which claim explains a way education can support voice without promising an automatic outcome?",
      "options": [
        {
          "id": "a",
          "text": "Research and networks can help advocates share evidence across communities and institutions."
        },
        {
          "id": "b",
          "text": "A degree alone removes all discrimination."
        },
        {
          "id": "c",
          "text": "Only classroom instruction can pass on cultural knowledge."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "That names mechanisms and leaves room for further organizing and barriers.",
        "b": "The Perkins profile describes continued discrimination and activism.",
        "c": "The chapter also values community knowledge and exchange."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l49-evidence-1",
      "contentVersion": "1",
      "lessonId": "t4-l07-education-odds",
      "mode": "multipleChoice",
      "skillTag": "dated-statistic",
      "sourceIds": [
        "L49-A"
      ],
      "stimulusId": "l49-evidence-1",
      "familyId": "l49-evidence-1",
      "prompt": "What should accompany the textbook’s 130-million figure if you mention it?",
      "options": [
        {
          "id": "a",
          "text": "A label saying it is the current count."
        },
        {
          "id": "b",
          "text": "The textbook edition and that the figure is historical rather than current."
        },
        {
          "id": "c",
          "text": "A claim that most of the children were Indigenous."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The book is from 2005; this figure is not verified as current.",
        "b": "Dating prevents a historical figure from masquerading as today’s estimate.",
        "c": "The source says disproportionate, not majority."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l49-evidence-2",
      "contentVersion": "1",
      "lessonId": "t4-l07-education-odds",
      "mode": "multipleChoice",
      "skillTag": "named-participant",
      "sourceIds": [
        "L49-C"
      ],
      "stimulusId": "l49-evidence-2",
      "familyId": "l49-evidence-2",
      "prompt": "Which pair correctly identifies a textbook exchange participant and work?",
      "options": [
        {
          "id": "a",
          "text": "Jonathan Breaker of Siksika — UNESCO work on sustainable development."
        },
        {
          "id": "b",
          "text": "Charles Perkins of Siksika — a New Zealand commission placement."
        },
        {
          "id": "c",
          "text": "Bev Lafond of Arrernte descent — the Australian Freedom Rides."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "The textbook identifies Breaker and his UNESCO placement.",
        "b": "Perkins is the Australian activist in Source B, not this participant.",
        "c": "The textbook identifies Lafond as Muskeg Lake Cree and describes a New Zealand placement."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l49-voice-1",
      "contentVersion": "1",
      "lessonId": "t4-l07-education-odds",
      "mode": "multipleChoice",
      "skillTag": "voice-application",
      "sourceIds": [
        "L49-B"
      ],
      "stimulusId": "l49-voice-1",
      "familyId": "l49-voice-1",
      "prompt": "How does the textbook’s Perkins profile help answer Question 22?",
      "options": [
        {
          "id": "a",
          "text": "It proves that every educated person becomes a national leader."
        },
        {
          "id": "b",
          "text": "It shows a named activist using learning, organizing and public protest to bring discrimination to wider attention."
        },
        {
          "id": "c",
          "text": "It shows that discrimination ended when he enrolled in school."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "One profile cannot prove what happens to every educated person.",
        "b": "This connects a specific example to a public-voice mechanism while keeping organizing visible.",
        "c": "The profile describes barriers and later activism; enrolment alone did not end discrimination."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l49-application-2",
      "contentVersion": "1",
      "lessonId": "t4-l07-education-odds",
      "mode": "multipleChoice",
      "skillTag": "transfer",
      "sourceIds": [
        "L49-C"
      ],
      "stimulusId": "l49-application-2",
      "familyId": "l49-application-2",
      "prompt": "A learner proposes an exchange for language teaching. What question best tests its value?",
      "options": [
        {
          "id": "a",
          "text": "Was the host city famous?"
        },
        {
          "id": "b",
          "text": "How did community language goals shape the placement, and what knowledge returned to the community?"
        },
        {
          "id": "c",
          "text": "Did the participant become a celebrity?"
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "Location alone does not show relevance or benefit.",
        "b": "This tests community purpose and exchange, the mechanism in Source C.",
        "c": "Celebrity is not the educational goal described."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l49-independent-1",
      "contentVersion": "1",
      "lessonId": "t4-l07-education-odds",
      "mode": "written",
      "sourceIds": [
        "L49-A"
      ],
      "familyId": "l49-independent-1",
      "prompt": "Explain why the booklet’s “vast majority” statement is false using the textbook’s actual quantifier and date the figure.",
      "criteria": [
        "Distinguishes disproportionate representation from majority",
        "Answers false with an explanation",
        "Labels the figure as historical"
      ],
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l49-independent-2",
      "contentVersion": "1",
      "lessonId": "t4-l07-education-odds",
      "mode": "written",
      "sourceIds": [
        "L49-B",
        "L49-C"
      ],
      "familyId": "l49-independent-2",
      "prompt": "Compare Perkins’s organizing with one named international internship as two ways education can help concerns be heard.",
      "criteria": [
        "Names people and contexts accurately",
        "Explains a distinct voice mechanism for each",
        "Avoids claiming education alone ended discrimination"
      ],
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l50-concept-1",
      "contentVersion": "1",
      "lessonId": "t4-l04-youth-future-response",
      "mode": "multipleChoice",
      "skillTag": "active-profile",
      "sourceIds": [
        "L50-A"
      ],
      "stimulusId": "l50-concept-1",
      "familyId": "l50-concept-1",
      "prompt": "Which text is the active Assignment 4.3 based on?",
      "options": [
        {
          "id": "a",
          "text": "Maria Campbell’s Halfbreed."
        },
        {
          "id": "b",
          "text": "Thomas King’s The Inconvenient Indian."
        },
        {
          "id": "c",
          "text": "Rabbit-Proof Fence."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "The official Theme 4 booklet’s current Assignment 4.3 is the Halfbreed response.",
        "b": "Those prompts are preserved under the older profile, not the active one.",
        "c": "The film belongs to Assignment 4.2."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l50-concept-2",
      "contentVersion": "1",
      "lessonId": "t4-l04-youth-future-response",
      "mode": "multipleChoice",
      "skillTag": "memoir-scope",
      "sourceIds": [
        "L50-B"
      ],
      "stimulusId": "l50-concept-2",
      "familyId": "l50-concept-2",
      "prompt": "What can one memoir passage establish?",
      "options": [
        {
          "id": "a",
          "text": "Every Métis person had the same life."
        },
        {
          "id": "b",
          "text": "How Campbell presents a particular experience in that passage, with later chapters needed for a whole-life judgment."
        },
        {
          "id": "c",
          "text": "A government’s current position in 2026."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "A memoir is one person’s account, not a universal template.",
        "b": "That is a source-bounded interpretation.",
        "c": "A memoir passage does not establish current government policy."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l50-evidence-1",
      "contentVersion": "1",
      "lessonId": "t4-l04-youth-future-response",
      "mode": "multipleChoice",
      "skillTag": "source-kind",
      "sourceIds": [
        "L50-A"
      ],
      "stimulusId": "l50-evidence-1",
      "familyId": "l50-evidence-1",
      "prompt": "Where do you find the four options and 2–3 paragraph requirement?",
      "options": [
        {
          "id": "a",
          "text": "The Theme 4 booklet, Assignment 4.3, page 21."
        },
        {
          "id": "b",
          "text": "The Rio Declaration."
        },
        {
          "id": "c",
          "text": "The textbook’s UN membership table."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "That is the official active assignment source.",
        "b": "Rio concerns environment and development, not this memoir response.",
        "c": "The UN section does not set the novel-study assignment."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l50-evidence-2",
      "contentVersion": "1",
      "lessonId": "t4-l04-youth-future-response",
      "mode": "multipleChoice",
      "skillTag": "intro-inference",
      "sourceIds": [
        "L50-B"
      ],
      "stimulusId": "l50-evidence-2",
      "familyId": "l50-evidence-2",
      "prompt": "Which claim is supported by Campbell’s Introduction alone?",
      "options": [
        {
          "id": "a",
          "text": "Every event after she left home improved her life."
        },
        {
          "id": "b",
          "text": "On returning, she sees a changed place and frames writing as part of seeking peace."
        },
        {
          "id": "c",
          "text": "She never left home."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The Introduction alone cannot decide the entire later-life question.",
        "b": "That stays within the opening passage.",
        "c": "The Introduction recounts leaving and returning."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l50-plan-1",
      "contentVersion": "1",
      "lessonId": "t4-l04-youth-future-response",
      "mode": "multipleChoice",
      "skillTag": "response-planning",
      "sourceIds": [
        "L50-A",
        "L50-B"
      ],
      "stimulusId": "l50-plan-1",
      "familyId": "l50-plan-1",
      "prompt": "Which plan best prepares a response to the fourth Halfbreed prompt?",
      "options": [
        {
          "id": "a",
          "text": "Decide that moving improved everything, then ignore scenes that complicate the claim."
        },
        {
          "id": "b",
          "text": "Track Campbell’s reasons for leaving, what changed afterward and what did not; use passages from different chapters before deciding."
        },
        {
          "id": "c",
          "text": "Answer a question about The Inconvenient Indian instead."
        }
      ],
      "correctOptionId": "b",
      "feedbackByOption": {
        "a": "The prompt asks for an explained judgment. Ignoring complicating evidence weakens it.",
        "b": "This plan reads across the memoir, allows a nuanced judgment and stays with the assigned question.",
        "c": "Those prompts belong to the preserved older profile, not the active Halfbreed task."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l50-application-2",
      "contentVersion": "1",
      "lessonId": "t4-l04-youth-future-response",
      "mode": "multipleChoice",
      "skillTag": "evidence-limit",
      "sourceIds": [
        "L50-B"
      ],
      "stimulusId": "l50-application-2",
      "familyId": "l50-application-2",
      "prompt": "A learner chooses the government-discrimination prompt. What evidence plan is strongest?",
      "options": [
        {
          "id": "a",
          "text": "Use a named event in Campbell’s memoir, explain the law or government action and its effect on her family, then check the passage."
        },
        {
          "id": "b",
          "text": "Write that all governments always act the same way."
        },
        {
          "id": "c",
          "text": "Use an unrelated film scene instead of the memoir."
        }
      ],
      "correctOptionId": "a",
      "feedbackByOption": {
        "a": "This connects a particular policy event and effect to the chosen memoir question.",
        "b": "The prompt asks for one example, not a universal claim.",
        "c": "The task is about Campbell’s family in Halfbreed."
      },
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l50-independent-1",
      "contentVersion": "1",
      "lessonId": "t4-l04-youth-future-response",
      "mode": "written",
      "sourceIds": [
        "L50-A",
        "L50-B"
      ],
      "familyId": "l50-independent-1",
      "prompt": "Choose one active Halfbreed prompt and outline two distinct memoir moments, one possible claim and one uncertainty to verify before drafting.",
      "criteria": [
        "Identifies an active prompt",
        "Locates two distinct memoir moments",
        "States a claim and a real uncertainty"
      ],
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    },
    {
      "id": "ab30-v2-l50-independent-2",
      "contentVersion": "1",
      "lessonId": "t4-l04-youth-future-response",
      "mode": "written",
      "sourceIds": [
        "L50-B"
      ],
      "familyId": "l50-independent-2",
      "prompt": "Draft one evidence-based paragraph for a chosen Halfbreed prompt, with a specific passage and a limit on what it proves.",
      "criteria": [
        "Answers the chosen question",
        "Explains a specific memoir passage",
        "Keeps Campbell’s experience distinct from universal claims"
      ],
      "automaticScore": false,
      "formalMarks": null,
      "compulsory": false,
      "reviewed": true,
      "status": "AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW"
    }
  ];

  function modeById(modeId) {
    for (var i = 0; i < MODES.length; i += 1) {
      if (MODES[i].id === modeId) return MODES[i];
    }
    return null;
  }

  function offeredModes() {
    return MODES.filter(function (mode) { return mode.offered; });
  }

  function itemById(itemId) {
    for (var i = 0; i < ITEMS.length; i += 1) {
      if (ITEMS[i].id === itemId) return ITEMS[i];
    }
    return null;
  }

  function objectiveItems() {
    return ITEMS.filter(function (item) { return item.mode === 'multipleChoice'; });
  }

  function writtenItems() {
    return ITEMS.filter(function (item) { return item.mode === 'written'; });
  }

  function itemsForLesson(lessonId) {
    return ITEMS.filter(function (item) { return item.lessonId === lessonId; });
  }

  global.AB30PracticeData = {
    BANK_VERSION: BANK_VERSION,
    MODES: MODES,
    ITEMS: ITEMS,
    modeById: modeById,
    offeredModes: offeredModes,
    itemById: itemById,
    objectiveItems: objectiveItems,
    writtenItems: writtenItems,
    itemsForLesson: itemsForLesson
  };
})(typeof window !== 'undefined' ? window : globalThis);

;(function scopePracticeToTheme(global) {
  'use strict';
  var source = global.AB30PracticeData;
  var allowedLessonIds = new Set(["t3-l01-stereotypes-media","t3-l05-words-that-wound","t3-l06-screens-punchlines","t3-l02-breaking-barriers","t3-l03-community-life","t3-l07-running-own-show","t3-l08-city-test","t3-l09-friendship-success","t3-l10-devolution","t3-l04-urban-life-services"]);
  var items = source.ITEMS.filter(function (item) { return allowedLessonIds.has(item.lessonId); });
  global.AB30PracticeData = Object.freeze({
    ITEMS: items,
    MODES: source.MODES,
    itemById: function (id) { return items.find(function (item) { return item.id === id; }) || null; },
    objectiveItems: function () { return items.filter(function (item) { return item.mode === 'objective'; }); },
    writtenItems: function () { return items.filter(function (item) { return item.mode === 'written'; }); },
    itemsForLesson: function (lessonId) { return items.filter(function (item) { return item.lessonId === lessonId; }); }
  });
})(typeof window !== 'undefined' ? window : globalThis);
