/* AB30 lesson teaching blocks — T08 versioned components.
 *
 * Renders v2 lesson `blocks` (see contracts/learning-contract.d.ts).
 * Self-contained: no dependency on main.js (mirrors its escapeHtml exactly).
 * Loaded via script tag before main.js; main.js delegates v2 lessons here
 * and keeps the v1 legacy path for lessons without blocks.
 *
 * Safety rules (proven by the content suite):
 * - every author string is escaped; learner writing can never become markup;
 * - figure/src URLs pass the approval policy (relative ./assets, #anchor,
 *   https only); unapproved URLs are never emitted;
 * - unknown block types and missing required parts render VISIBLE badges,
 *   never silent gaps;
 * - `editorial` authoring notes are never read by any renderer.
 */
(function (global) {
  'use strict';

  var KNOWN_TYPES = [
    'explanation',
    'source',
    'timeline',
    'comparison',
    'figure',
    'workedExample',
    'supportedPractice',
    'supportedSelection',
    'independentTask',
    'reflection',
    'assignmentConnection'
  ];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isApprovedAssetUrl(src) {
    var s = String(src || '').trim();
    if (!s || /[\s]/.test(s)) return false;
    if (s.charAt(0) === '#') return s.length > 1;
    if (s.indexOf('./assets/') === 0) return s.indexOf('..') === -1;
    if (/^https:\/\//i.test(s)) return true;
    return false;
  }

  function nonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  // Teacher presentation keeps the canonical source records and activity
  // identities intact while replacing editorial source letters in learner
  // copy with the reading, speaker, document, or page students can recognize.
  function printedPage(locator) {
    var match = String(locator || '').match(/printed\s+p(?:p)?\.\s*([0-9]+(?:\s*[–-]\s*[0-9]+)?)/i);
    return match ? match[1].replace(/\s+/g, '') : '';
  }

  function stripSourceProvenance(value) {
    return String(value || '')
      .replace(/,?\s+as (?:reproduced|quoted|excerpted|printed|presented) (?:in|from|by|via) .+$/i, '')
      .replace(/,?\s+via the textbook.*$/i, '')
      .trim();
  }

  function speakerDisplayName(block) {
    return stripSourceProvenance(block && block.speaker);
  }

  function sourceDisplayName(block) {
    var speaker = speakerDisplayName(block);
    if (speaker) return speaker;
    var creator = String(block && block.creator || '').trim();
    var type = String(block && block.sourceType || '').trim();
    if (/textbook authors/i.test(creator)) return 'the textbook explanation';
    if (creator) {
      return stripSourceProvenance(creator)
        .replace(/,?\s+from .+$/i, '')
        .trim();
    }
    if (/document/i.test(type)) return 'the document';
    if (type) return 'the ' + type.toLowerCase();
    return 'the course reading';
  }

  function sourceFamilyKey(block) {
    var speaker = speakerDisplayName(block);
    if (speaker) return 'speaker:' + speaker.toLowerCase();
    var creator = String(block && block.creator || '').trim();
    if (/textbook authors/i.test(creator)) return 'textbook';
    if (creator) {
      return 'creator:' + stripSourceProvenance(creator)
        .replace(/\s*\(subsection\s+.+\)$/i, '')
        .toLowerCase()
        .trim();
    }
    return 'type:' + String(block && block.sourceType || '').toLowerCase().trim();
  }

  function documentTitle(block, grouped) {
    var creator = stripSourceProvenance(block && block.creator);
    var quoted = creator.match(/^Contemporary Issues textbook authors,\s+quoting\s+(.+)$/i);
    if (quoted) creator = quoted[1].trim();
    if (grouped) return creator.replace(/\s*\(subsection\s+.+\)$/i, '').trim();
    return creator.replace(/\s*\(subsection\s+(.+)\)$/i, ': subsection $1');
  }

  var STUDENT_HEADING_REWRITES = {
    'Why this matters in a course about rights': 'Why oral tradition matters when studying rights',
    'Reading the Royal Proclamation': 'The Royal Proclamation of 1763',
    'Try a different source yourself': 'How interpretation can change across accounts',
    'What the published source explains': 'How communities cared for land and governed gatherings',
    'Different histories require separate explanations': 'Why First Nations and Inuit histories need separate explanations',
    'How scrip is described in the source': 'How scrip transferred Métis land',
    'Different responses in the sources': 'Responses to the Charlottetown Accord',
    'The fresh dossier': 'Two accounts of the Two Row Wampum',
    'Two doors into the machine': 'Comprehensive and specific claims processes',
    'Audits of promises': 'How specific claims test unfulfilled promises',
    'Past the table': 'When negotiations stall',
    'Who counts': 'Métis and non-status claims',
    'A new era opens': 'Modern treaties and land claims',
    'Sixteen claims, six blanks': 'Sixteen claims across northern and western Canada',
    'Our Land, biggest first': 'The Nunavut Agreement and the creation of Nunavut',
    'The mainstream and its pull': 'How mainstream culture shapes expectations',
    'The chain: from a rigid belief to unequal treatment': 'How stereotypes become discrimination',
    'Ways adopted, justice restored': 'Indigenous approaches to justice',
    'Reserve life: the draw and the drag': 'Benefits and challenges of reserve life',
    'The gap in numbers': 'Community infrastructure gaps',
    'Running their own show': 'Community control of services',
    'The city charges, the governments point': 'Barriers to urban services and unclear responsibility',
    'Success with two memberships': 'Success in Indigenous and mainstream communities',
    'Citizens Plus buys the services': 'Treaty rights and public services',
    'Capacity sets the pace': 'What shapes local service delivery',
    'The evidence for Aboriginal hands': 'Evidence for Indigenous-led services',
    'The chapter tests you': 'Apply what you learned',
    'What indigenous means': 'What Indigenous means',
    'The shared wound and the superior lens': 'Colonial harm and claims of superiority',
    "A dancer's answer": 'Byron Chief-Moon and cultural expression',
    'Read Rio by principle': 'Applying the Rio Declaration principles',
    'Test a company claim against the source date': 'What a dated company example can and cannot prove',
    'Four purposes, several routes': 'The United Nations\u2019 four purposes',
    'Choose the active assignment': 'Choosing the final assignment'
  };

  function studentSectionHeading(value) {
    var heading = String(value || '').replace(/^\d+\.\s*/, '').trim();
    return STUDENT_HEADING_REWRITES[heading] || heading;
  }

  function learnerReadingTitle(block, context, grouped) {
    var passages = Array.isArray(block && block.passages) ? block.passages : [block];
    var first = passages[0] || block || {};
    var speaker = speakerDisplayName(first);
    var creator = String(first.creator || '').trim();
    var type = String(first.sourceType || '').trim();
    var studentTitle = String(first.studentTitle || block.studentTitle || '').trim();
    if (studentTitle) return studentTitle;
    if (speaker) return 'In their own words: ' + speaker;
    if (/document/i.test(type) || /\b(?:Act|Declaration|Agreement|Treaty|Proclamation|Constitution)\b/i.test(creator)) {
      var document = documentTitle(first, grouped || passages.length > 1);
      return document ? 'Read: ' + document.replace(/^the\s+/i, '') : 'Read the document';
    }
    var creatorTitle = sourceDisplayName(first);
    if (/^NSW Department of Education$/i.test(creatorTitle)) return 'Child removal policies in Australia';
    if (/^National Centre for Truth and Reconciliation$/i.test(creatorTitle)) return 'Canada\u2019s residential school system';
    var sectionHeading = studentSectionHeading(first.sectionHeading || block.sectionHeading);
    if (sectionHeading) return sectionHeading;
    if (/textbook authors/i.test(creator)) return 'Read the textbook explanation';
    var name = sourceDisplayName(first);
    if (name && !/^the\s/i.test(name)) return 'Read: ' + name;
    return 'Read this course selection';
  }

  function readingByline(block) {
    var passages = Array.isArray(block && block.passages) ? block.passages : [block];
    var first = passages[0] || block || {};
    var speaker = speakerDisplayName(first);
    var creator = String(first.creator || '').trim();
    var nation = String(first.nation || '').trim();
    var date = String(first.date || '').trim();
    var pages = passages.map(function (part) { return printedPage(part.locator); }).filter(nonEmptyString)
      .filter(function (page, index, all) { return all.indexOf(page) === index; });
    var pageLabel = pages.length ? 'Textbook ' + (pages.length > 1 ? 'pages ' : 'page ') + pages.join(', ') : '';
    if (/textbook authors/i.test(creator)) return ['Contemporary Issues', pageLabel].filter(nonEmptyString).join(' · ');
    if (speaker) return [speaker, nation, date, pageLabel].filter(nonEmptyString)
      .filter(function (value, index, all) { return all.indexOf(value) === index; }).join(' · ');
    if (/document/i.test(String(first.sourceType || ''))) return [date, pageLabel].filter(nonEmptyString).join(' · ');
    var shortCreator = sourceDisplayName(first);
    return [shortCreator, date, pageLabel].filter(nonEmptyString).join(' · ');
  }

  function sourceLabelMap(blocks) {
    var labels = {};
    var used = {};
    (Array.isArray(blocks) ? blocks : []).forEach(function (block) {
      if (!block || block.type !== 'source' || !nonEmptyString(block.title)) return;
      var name = sourceDisplayName(block);
      var key = name.toLowerCase();
      used[key] = (used[key] || 0) + 1;
      labels[block.title.trim()] = used[key] > 1 ? name + ' (' + used[key] + ')' : name;
    });
    return labels;
  }

  function joinedReadingNames(raw, labels) {
    var ids = String(raw || '').match(/[A-Z]{1,2}\d?/g) || [];
    var names = ids.map(function (id) { return labels['Source ' + id] || 'the named reading'; })
      .map(function (name) { return name.replace(/\s+\(\d+\)$/, ''); })
      .filter(function (name, index, all) { return all.indexOf(name) === index; });
    if (names.length === 1 && ids.length > 1) return 'passages from ' + names[0].replace(/^the\s+/i, 'the ');
    if (names.length < 2) return names[0] || raw;
    if (names.length === 2) return names[0] + ' and ' + names[1];
    return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
  }

  function presentTeacherText(value, labels, field) {
    if (!nonEmptyString(value)) return value;
    var text = value.replace(/\bSources?\s+([A-Z]{1,2}\d?(?:\s*(?:,|and|&|[–-])\s*[A-Z]{1,2}\d?)*)/g,
      function (_match, ids) { return joinedReadingNames(ids, labels); });
    text = text
      .replace(/\bthe passage actually supports\b/gi, 'the reading supports')
      .replace(/\bactually supports\b/gi, 'supports')
      .replace(/\bevidence-bounded\b/gi, 'supported by the reading')
      .replace(/\bmisconception\b/gi, 'common mix-up')
      .replace(/\bThen repair this sentence\b/g, 'Then revise this sentence')
      .replace(/\bA strong repair\b/g, 'A clear revision')
      .replace(/\bWrite your repair below\b/gi, 'Write your revised explanation below')
      .replace(/\bYour repair\b/gi, 'Your revised explanation')
      .replace(/\bwritten repair\b/gi, 'written revision')
      .replace(/\bthis repair\b/gi, 'this revision')
      .replace(/\bthe repair\b/gi, 'the revision')
      .replace(/\bsupported repair\b/gi, 'supported revision')
      .replace(/\bchronology repair\b/gi, 'chronology revision')
      .replace(/\bthen repair\b/gi, 'then revise')
      .replace(/\brepair(?=\s+(?:a|an|the|this|your)\b)/gi, 'revise')
      .replace(/\brepair your explanation\b/gi, 'improve your explanation')
      .replace(/\brepair your answer\b/gi, 'improve your answer')
      .replace(/\brepair the answer\b/gi, 'improve the answer')
      .replace(/\brepair the sentence\b/gi, 'revise the sentence')
      .replace(/\bRepair the\b/g, 'Improve the')
      .replace(/\bRepair a\b/g, 'Improve a')
      .replace(/\bfence one\b/gi, 'state the limit of one')
      .replace(/\band fence\b/gi, 'and state the limit of')
      .replace(/\bwith a fence\b/gi, 'with a clear limit')
      .replace(/\bfence the rest\b/gi, 'state the limits')
      .replace(/\bhistorical fence\b/gi, 'historical limit')
      .replace(/\bstatus fence\b/gi, 'status limit')
      .replace(/\bevent-type fence\b/gi, 'event-type distinction')
      .replace(/\bfence the neighbouring\b/gi, 'separate the neighbouring')
      .replace(/\bfences the evidence\b/gi, 'keeps the evidence within its historical context')
      .replace(/\bfences the rest\b/gi, 'limits the rest of the claim')
      .replace(/\bfenced beside it\b/gi, 'kept separate from it')
      .replace(/\bfenced by limits\b/gi, 'limited by changes')
      .replace(/\bevidence fence\b/gi, 'evidence limit');
    if (field === 'title' || field === 'heading') {
      text = text.replace(/^\d+\.\s*/, '')
        .replace(/^Supported practice:\s*/i, '')
        .replace(/^Independent:\s*/i, '')
        .replace(/^Worked example:\s*/i, '');
      if (text) text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    return text;
  }

  function presentTeacherValue(value, labels, field) {
    if (typeof value === 'string') return presentTeacherText(value, labels, field);
    if (Array.isArray(value)) return value.map(function (item) { return presentTeacherValue(item, labels, field); });
    if (!value || typeof value !== 'object') return value;
    var copy = {};
    Object.keys(value).forEach(function (key) {
      // Source quotations, source records, URLs, and stable activity fields
      // remain byte-for-byte canonical. Only learner-facing instructional
      // prose is presented in the teacher voice.
      var protectedField = ['extract', 'creator', 'speaker', 'nation', 'date', 'sourceType', 'locator',
        'attribution', 'href', 'src', 'type', 'itemId', 'contentVersion', 'responseKey',
        'sourceId', 'stimulusId', 'assignmentId', 'id', 'key'].indexOf(key) !== -1;
      copy[key] = protectedField ? value[key] : presentTeacherValue(value[key], labels, key);
    });
    return copy;
  }

  function presentTeacherBlocks(blocks) {
    var labels = sourceLabelMap(blocks);
    var sectionHeading = '';
    return (Array.isArray(blocks) ? blocks : []).map(function (block) {
      var copy = presentTeacherValue(block, labels, '');
      if (copy && copy.type === 'explanation' && nonEmptyString(copy.heading)) sectionHeading = copy.heading;
      if (copy && copy.type === 'source') {
        copy.title = labels[block.title] || sourceDisplayName(block);
        copy.readingStyle = 'compact';
        copy.context = copy.context || presentTeacherText(block.contextLimits || '', labels, 'context');
        copy.sectionHeading = sectionHeading;
      }
      if (copy && copy.type === 'independentTask' && copy.sectionLabel === 'Supported practice') {
        copy.sectionLabel = 'Try it yourself';
      }
      return copy;
    });
  }

  function presentPracticeItem(item, lessonBlocks) {
    return presentTeacherValue(item, sourceLabelMap(lessonBlocks), '');
  }

  function nonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
  }

  function allNonEmptyStrings(values) {
    return values.every(nonEmptyString);
  }

  function issue(index, type, code, detail) {
    return { index: index, type: type, code: code, detail: detail };
  }

  function validateBlock(block, index) {
    var at = typeof index === 'number' ? index : 0;
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      return [issue(at, 'unknown', 'not-an-object', 'Block must be an object.')];
    }
    var type = block.type;
    if (KNOWN_TYPES.indexOf(type) === -1) {
      return [issue(at, String(type), 'unknown-type', 'Unknown block type: ' + String(type))];
    }
    var issues = [];
    switch (type) {
      case 'explanation':
        if (!nonEmptyArray(block.paragraphs) || !allNonEmptyStrings(block.paragraphs)) {
          issues.push(issue(at, type, 'missing-paragraphs', 'Explanation needs one or more paragraphs.'));
        }
        break;
      case 'timeline':
        if (!nonEmptyArray(block.events) || !block.events.every(function (event) {
          return event && nonEmptyString(event.date) && nonEmptyString(event.text);
        })) issues.push(issue(at, type, 'missing-events', 'Timeline needs dated events.'));
        if (!nonEmptyArray(block.sourceLinks) || !block.sourceLinks.every(function (link) {
          return link && nonEmptyString(link.label) && isApprovedAssetUrl(link.href);
        })) issues.push(issue(at, type, 'invalid-links', 'Timeline needs approved source links.'));
        break;
      case 'source':
        if (block.passages !== undefined) {
          if (!nonEmptyArray(block.passages)) issues.push(issue(at, type, 'missing-passages', 'Reading needs passages.'));
          else block.passages.forEach(function (passage) {
            if (!passage || passage.type !== 'source' || passage.passages) issues.push(issue(at, type, 'invalid-passage', 'Reading passages must be individual sources.'));
            else issues = issues.concat(validateBlock(passage, at));
          });
        }
        if (block.annotations !== undefined && (!Array.isArray(block.annotations) || !block.annotations.every(function (note) {
          return note && nonEmptyString(note.phrase) && nonEmptyString(note.note) && typeof block.extract === 'string' && block.extract.indexOf(note.phrase) !== -1;
        }))) issues.push(issue(at, type, 'invalid-annotation', 'Annotations must identify a phrase in the reading.'));
        if (block.passages === undefined && !nonEmptyString(block.extract)) {
          issues.push(issue(at, type, 'missing-extract', 'Source needs an extract.'));
        }
        break;
      case 'comparison':
        if (!nonEmptyArray(block.columns) || block.columns.length < 2 ||
            !block.columns.every(function (column) {
              return column && nonEmptyString(column.heading) &&
                nonEmptyArray(column.points) && allNonEmptyStrings(column.points);
            })) {
          issues.push(issue(at, type, 'missing-columns', 'Comparison needs 2+ headed columns with points.'));
        }
        break;
      case 'figure':
        if (!isApprovedAssetUrl(block.src)) {
          issues.push(issue(at, type, 'unapproved-src', 'Figure src must be an approved URL.'));
        }
        if (!nonEmptyString(block.alt)) {
          issues.push(issue(at, type, 'missing-alt', 'Figure needs alt text teaching the same relationship.'));
        }
        if (!nonEmptyString(block.caption)) {
          issues.push(issue(at, type, 'missing-caption', 'Figure needs a caption teaching the same relationship.'));
        }
        break;
      case 'workedExample':
        if (!nonEmptyArray(block.evidence) || !block.evidence.every(function (item) {
          return item && nonEmptyString(item.ref) && nonEmptyString(item.text);
        })) {
          issues.push(issue(at, type, 'missing-evidence', 'Worked example needs evidence with references.'));
        }
        if (!nonEmptyArray(block.reasoning) || !allNonEmptyStrings(block.reasoning)) {
          issues.push(issue(at, type, 'missing-reasoning', 'Worked example needs intermediate reasoning steps.'));
        }
        if (!nonEmptyString(block.response)) {
          issues.push(issue(at, type, 'missing-response', 'Worked example needs a completed response.'));
        }
        break;
      case 'supportedPractice':
        if (!nonEmptyString(block.method)) {
          issues.push(issue(at, type, 'missing-method', 'Supported practice needs the method to apply.'));
        }
        if (!nonEmptyString(block.task)) {
          issues.push(issue(at, type, 'missing-task', 'Supported practice needs a task.'));
        }
        if (!nonEmptyString(block.feedback)) {
          issues.push(issue(at, type, 'missing-feedback', 'Supported practice needs useful feedback.'));
        }
        break;
      case 'supportedSelection': {
        if (!nonEmptyString(block.itemId)) {
          issues.push(issue(at, type, 'missing-item', 'Supported selection needs a bank item id.'));
        }
        if (!nonEmptyString(block.prompt)) {
          issues.push(issue(at, type, 'missing-prompt', 'Supported selection needs a prompt.'));
        }
        var selOptions = Array.isArray(block.options) ? block.options : [];
        var selIds = [];
        var selValid = selOptions.length >= 2 && selOptions.every(function (option) {
          if (!option || !nonEmptyString(option.id) || !nonEmptyString(option.text)) return false;
          var id = option.id.trim();
          if (selIds.indexOf(id) !== -1) return false;
          selIds.push(id);
          return true;
        });
        if (!selValid) {
          issues.push(issue(at, type, 'invalid-options', 'Supported selection needs 2+ uniquely-keyed options with text.'));
        }
        if (!nonEmptyString(block.key)) {
          issues.push(issue(at, type, 'missing-key', 'Supported selection needs a reviewed key.'));
        } else if (selIds.indexOf(block.key.trim()) === -1) {
          issues.push(issue(at, type, 'key-not-an-option', 'Supported selection key must be one of the option ids.'));
        }
        var selFeedback = block.feedbackByOption && typeof block.feedbackByOption === 'object'
          ? block.feedbackByOption : {};
        var selCovered = selIds.length > 0 && selIds.every(function (id) {
          return nonEmptyString(selFeedback[id]);
        });
        if (!selCovered) {
          issues.push(issue(at, type, 'missing-feedback', 'Supported selection needs feedback for every option.'));
        }
        break;
      }
      case 'independentTask':
        if (!nonEmptyString(block.task)) {
          issues.push(issue(at, type, 'missing-task', 'Independent task needs a task.'));
        }
        if (!block.differsFrom || (!nonEmptyString(block.differsFrom.evidence) && !nonEmptyString(block.differsFrom.example))) {
          issues.push(issue(at, type, 'missing-difference', 'Independent task must declare how it differs (evidence or example).'));
        }
        if (block.responseKey !== undefined && !nonEmptyString(block.responseKey)) {
          issues.push(issue(at, type, 'invalid-response-key', 'Independent task responseKey must be a non-empty string.'));
        }
        if (nonEmptyString(block.criteria) && !nonEmptyString(block.responseKey)) {
          issues.push(issue(at, type, 'criteria-without-response', 'Gated criteria need a responseKey; without one they render openly.'));
        }
        break;
      case 'reflection':
        if (!nonEmptyString(block.prompt)) {
          issues.push(issue(at, type, 'missing-prompt', 'Reflection needs a prompt.'));
        }
        break;
      case 'assignmentConnection':
        if (!nonEmptyString(block.assignmentId)) {
          issues.push(issue(at, type, 'missing-assignment', 'Assignment connection needs an assignment id.'));
        }
        break;
      default:
        break;
    }
    return issues;
  }

  function validateLessonBlocks(blocks) {
    if (!Array.isArray(blocks)) return [issue(-1, 'lesson', 'blocks-not-an-array', 'Lesson blocks must be an array.')];
    var issues = [];
    blocks.forEach(function (block, index) {
      var found = validateBlock(block, index);
      for (var i = 0; i < found.length; i += 1) issues.push(found[i]);
    });
    return issues;
  }

  function renderIncompleteBadge(type, codes) {
    return '<p class="block-incomplete" role="note">Incomplete ' + escapeHtml(type) +
      ': needs ' + codes.map(escapeHtml).join(', ') + '.</p>';
  }

  // R05: two equal columns (Learning goal / Before you begin), normal-weight
  // explanation. aria-label keeps the "Lesson goal" region name. The
  // essential question renders below the lesson h1 (main.js), never here.
  function renderGoalStrip(goal) {
    if (!goal || !nonEmptyString(goal.goal)) return '';
    var hasPrior = nonEmptyString(goal.prerequisite);
    return '<div class="lesson-goal-strip' + (hasPrior ? '' : ' lesson-goal-strip--solo') +
      '" data-testid="learning-goal" role="region" aria-label="Lesson goal">' +
      '<div>' +
      '<p class="section-label">Learning goal</p>' +
      '<p>' + escapeHtml(goal.goal) + '</p>' +
      '</div>' +
      (hasPrior
        ? '<div data-testid="before-you-begin">' +
          '<p class="section-label">Before you begin</p>' +
          '<p>' + escapeHtml(goal.prerequisite) + '</p>' +
          '</div>'
        : '') +
      '</div>';
  }

  // R05: visible title + creator/speaker + date/context + locator line, live
  // extract, then extended attribution inside a "Source details"
  // disclosure (R08 data-testid hook). No <dl> when no metadata.
  function sourceDetails(block) {
    var fields = [['Speaker', block.speaker], ['Creator', block.creator], ['Nation / community', block.nation],
      ['Date', block.date], ['Type', block.sourceType], ['Locator', block.locator],
      ['Attribution', block.attribution], ['Context and limits', block.contextLimits]];
    return '<dl>' + fields.filter(function (pair) { return nonEmptyString(pair[1]); }).map(function (pair) {
      return '<div><dt>' + pair[0] + '</dt><dd>' + escapeHtml(pair[1]) + '</dd></div>';
    }).join('') + '</dl>';
  }

  function annotatedExtract(block) {
    var text = typeof block.extract === 'string' ? block.extract : '';
    return escapeHtml(text);
  }

  function renderReadingPassage(block, hideTitle) {
    var notes = Array.isArray(block.annotations) ? block.annotations : [];
    return '<figure class="source-card source-passage" data-testid="source-card" data-source-locator="' + escapeHtml(block.locator || '') + '">' +
      (hideTitle ? '' : '<h3>' + escapeHtml(block.title || 'Reading') + '</h3>') +
      '<blockquote>' + annotatedExtract(block) + '</blockquote>' +
      (notes.length ? '<dl class="reading-annotations" aria-label="Notes on key phrases">' + notes.map(function (note) {
        return '<div><dt>' + escapeHtml(note.phrase) + '</dt><dd>' + escapeHtml(note.note) + '</dd></div>';
      }).join('') + '</dl>' : '') + '</figure>';
  }

  function renderSourceCard(block, context) {
    if (block.readingStyle === 'compact') {
      var passages = Array.isArray(block.passages) ? block.passages : [block];
      var title = learnerReadingTitle(block, context, passages.length > 1);
      var byline = readingByline(block);
      return '<section class="reading-group" data-testid="reading-group" aria-label="' + escapeHtml(title) + '">' +
        '<h2>' + escapeHtml(title) + '</h2>' +
        (byline ? '<p class="reading-byline">' + escapeHtml(byline) + '</p>' : '') +
        passages.map(function (part) { return renderReadingPassage(part, true); }).join('') +
        '</section>';
    }
    return renderLegacySourceCard(block);
  }

  function renderLegacySourceCard(block) {
    var voice = [block.speaker, block.creator, block.nation].filter(nonEmptyString).join(' · ');
    var context = [block.date, block.sourceType, block.locator].filter(nonEmptyString).join(' · ');
    var headBits = [];
    if (nonEmptyString(block.title)) headBits.push('<strong>' + escapeHtml(block.title) + '</strong>');
    if (voice) headBits.push(escapeHtml(voice));
    if (context) headBits.push(escapeHtml(context));
    var rows = [];
    var fields = [
      ['Speaker', block.speaker],
      ['Creator', block.creator],
      ['Nation / community', block.nation],
      ['Date', block.date],
      ['Type', block.sourceType],
      ['Locator', block.locator]
    ];
    fields.forEach(function (pair) {
      if (nonEmptyString(pair[1])) {
        rows.push('<div><dt>' + escapeHtml(pair[0]) + '</dt><dd>' + escapeHtml(pair[1]) + '</dd></div>');
      }
    });
    if (nonEmptyString(block.attribution)) {
      rows.push('<div><dt>Attribution</dt><dd>' + escapeHtml(block.attribution) + '</dd></div>');
    }
    return '<figure class="source-card" data-testid="source-card">' +
      (headBits.length ? '<p class="source-head">' + headBits.join('<br>') + '</p>' : '') +
      '<blockquote>' + escapeHtml(block.extract || '') + '</blockquote>' +
      (nonEmptyString(block.contextLimits)
        ? '<p class="source-context"><strong>Context and limits:</strong> ' + escapeHtml(block.contextLimits) + '</p>' : '') +
      (rows.length
        ? '<details class="source-details" data-testid="source-details"><summary>Source details</summary>' +
          '<dl>' + rows.join('') + '</dl></details>' : '') +
      '</figure>';
  }

  function renderTimeline(block) {
    return '<section class="lesson-timeline" aria-label="' + escapeHtml(block.title || 'Timeline') + '">' +
      '<h2>' + escapeHtml(block.title || 'Timeline') + '</h2><ol>' + (Array.isArray(block.events) ? block.events : []).map(function (event) {
        return '<li><strong>' + escapeHtml(event.date) + '</strong><p>' + escapeHtml(event.text) + '</p></li>';
      }).join('') + '</ol><p class="timeline-sources">Timeline references: ' + (Array.isArray(block.sourceLinks) ? block.sourceLinks : []).filter(function (link) {
        return isApprovedAssetUrl(link.href);
      }).map(function (link) { return '<a href="' + escapeHtml(link.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(link.label) + '</a>'; }).join(' · ') + '</p></section>';
  }

  function renderComparison(block, context) {
    var columns = Array.isArray(block.columns) ? block.columns : [];
    if (context && context.teacherVoice) {
      return '<figure class="comparison-table comparison-pilot">' +
        (nonEmptyString(block.caption) ? '<figcaption>' + escapeHtml(block.caption) + '</figcaption>' : '') +
        '<div class="comparison-columns">' + columns.map(function (column) {
          return '<section><h3>' + escapeHtml(column.heading || '') + '</h3><ul>' +
            (Array.isArray(column.points) ? column.points : []).map(function (point) {
              return '<li>' + escapeHtml(point) + '</li>';
            }).join('') + '</ul></section>';
        }).join('') + '</div></figure>';
    }
    var cells = columns.map(function (column) {
      var points = Array.isArray(column.points) ? column.points : [];
      return '<td><ul>' + points.map(function (point) {
        return '<li>' + escapeHtml(point) + '</li>';
      }).join('') + '</ul></td>';
    }).join('');
    return '<figure class="comparison-table">' +
      (nonEmptyString(block.caption) ? '<figcaption>' + escapeHtml(block.caption) + '</figcaption>' : '') +
      '<table><thead><tr>' + columns.map(function (column) {
        return '<th scope="col">' + escapeHtml(column.heading || '') + '</th>';
      }).join('') + '</tr></thead><tbody><tr>' + cells + '</tr></tbody></table>' +
      '</figure>';
  }

  function renderFigure(block) {
    if (!isApprovedAssetUrl(block.src)) return '';
    return '<figure class="lesson-figure">' +
      '<img src="' + escapeHtml(String(block.src).trim()) + '" alt="' + escapeHtml(block.alt || '') + '" loading="lazy" />' +
      '<figcaption' + (block.captionDisplay === 'hidden' ? ' class="visually-hidden"' : '') + '>' + escapeHtml(block.caption || '') + '</figcaption>' +
      '</figure>';
  }

  function renderWorkedExample(block, context) {
    var evidence = Array.isArray(block.evidence) ? block.evidence : [];
    var reasoning = Array.isArray(block.reasoning) ? block.reasoning : [];
    return '<section class="worked-example" aria-label="' + escapeHtml(block.title || 'Worked example') + '">' +
      '<p class="section-label">' + (context && context.teacherVoice ? 'See the thinking' : 'Worked example') + '</p>' +
      (nonEmptyString(block.title) ? '<h2>' + escapeHtml(block.title) + '</h2>' : '') +
      (nonEmptyString(block.directions) ? '<p>' + escapeHtml(block.directions) + '</p>' : '') +
      (evidence.length ? '<h3>Evidence</h3><ol>' + evidence.map(function (item) {
        return '<li><strong>' + escapeHtml(item.ref || '') + ':</strong> ' + escapeHtml(item.text || '') + '</li>';
      }).join('') + '</ol>' : '') +
      (reasoning.length ? '<h3>Reasoning</h3><ol>' + reasoning.map(function (step) {
        return '<li>' + escapeHtml(step) + '</li>';
      }).join('') + '</ol>' : '') +
      (nonEmptyString(block.response)
        ? '<h3>Finished response</h3><p>' + escapeHtml(block.response) + '</p>' : '') +
      '</section>';
  }

  function savedFormativeText(context, key) {
    if (!context || typeof context.formativeResponse !== 'function') return '';
    try {
      var value = context.formativeResponse(key);
      return typeof value === 'string' ? value : '';
    } catch (_error) {
      return '';
    }
  }

  function submittedForTask(context, key) {
    if (!context || typeof context.submissionsForTask !== 'function') return [];
    try {
      var list = context.submissionsForTask(key);
      return Array.isArray(list) ? list : [];
    } catch (_error) {
      return [];
    }
  }

  // R08: answerable supported selection. Real radio controls plus a Check
  // button; per-option feedback arrives from the check handler (main.js
  // through the practice engine), never from a details reveal. Options
  // render in authored order with pinned stable ids; the submitted
  // optionOrder records exactly what the learner saw.
  function renderSupportedSelection(block, at, context) {
    var itemId = nonEmptyString(block.itemId) ? block.itemId.trim() : '';
    var version = nonEmptyString(block.contentVersion) ? block.contentVersion.trim() : 'legacy-v0';
    var groupName = 'supported-' + at + '-' + itemId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40);
    var options = Array.isArray(block.options) ? block.options : [];
    var choices = options.map(function (option, position) {
      var optionId = option && nonEmptyString(option.id) ? option.id.trim() : 'option-' + position;
      var choiceTestId = 'supported-choice-' + optionId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      var inputId = groupName + '-' + position;
      return '<label class="supported-choice" for="' + escapeHtml(inputId) + '">' +
        '<input type="radio" name="' + escapeHtml(groupName) + '" id="' + escapeHtml(inputId) + '" ' +
        'value="' + escapeHtml(optionId) + '" data-option-id="' + escapeHtml(optionId) + '" ' +
        'data-testid="' + escapeHtml(choiceTestId) + '" />' +
        '<span>' + escapeHtml(option.text || '') + '</span></label>';
    }).join('');
    var exposed = false;
    if (itemId && context && typeof context.practiceExposed === 'function') {
      try {
        exposed = !!context.practiceExposed(itemId);
      } catch (_error) {
        exposed = false;
      }
    }
    return '<section class="supported-practice supported-selection" data-testid="supported-task" aria-label="' +
      escapeHtml(block.title || 'Supported practice') + '"' +
      (itemId ? ' data-supported-item="' + escapeHtml(itemId) + '" data-content-version="' + escapeHtml(version) + '"' : '') + '>' +
      '<p class="section-label">' + (context && context.teacherVoice ? 'Check your understanding' : 'Supported practice') + '</p>' +
      (nonEmptyString(block.title) ? '<h2>' + escapeHtml(block.title) + '</h2>' : '') +
      (nonEmptyString(block.method) ? '<p>' + (context && context.teacherVoice ? '' : '<strong>Method:</strong> ') + escapeHtml(block.method) + '</p>' : '') +
      (nonEmptyString(block.prompt) ? '<p>' + escapeHtml(block.prompt) + '</p>' : '') +
      (exposed ? '<p class="supported-review-note" data-supported-review>Review — you have tried this item before. Your earlier attempt is kept.</p>' : '') +
      '<div class="supported-options" role="radiogroup" aria-label="' + escapeHtml(block.prompt || 'Choose an answer') + '">' +
      choices + '</div>' +
      '<p class="submission-actions"><button type="button" class="lesson-jump primary" ' +
      'data-testid="supported-check" data-supported-check="' + escapeHtml(itemId) + '">Check answer</button></p>' +
      '<div class="supported-feedback" data-testid="supported-feedback" role="status" aria-live="polite" hidden></div>' +
      '</section>';
  }

  function renderIndependentTask(block, at, context) {
    var key = nonEmptyString(block.responseKey) ? block.responseKey.trim() : '';
    var version = nonEmptyString(block.contentVersion) ? block.contentVersion.trim() : 'legacy-v0';
    var sectionLabel = nonEmptyString(block.sectionLabel) ? block.sectionLabel.trim() : 'Independent practice';
    var html = '<section class="independent-task" data-testid="independent-task" aria-label="' + escapeHtml(block.title || 'Independent task') + '"' +
      (key ? ' data-task-id="' + escapeHtml(key) + '" data-content-version="' + escapeHtml(version) + '"' : '') + '>' +
      '<p class="section-label">' + escapeHtml(sectionLabel) + '</p>' +
      (nonEmptyString(block.title) ? '<h2>' + escapeHtml(block.title) + '</h2>' : '') +
      (nonEmptyString(block.task) ? '<p>' + escapeHtml(block.task) + '</p>' : '') +
      (!(context && context.teacherVoice) && block.differsFrom && (nonEmptyString(block.differsFrom.evidence) || nonEmptyString(block.differsFrom.example))
        ? '<p class="task-difference"><strong>How this differs:</strong> ' +
          escapeHtml(
            [block.differsFrom.evidence, block.differsFrom.example].filter(nonEmptyString).join(' / ')
          ) + '</p>' : '');
    if (key) {
      var inputId = 'formative-' + at + '-' + key.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40);
      var saved = savedFormativeText(context, key);
      var submissions = submittedForTask(context, key);
      var first = null;
      var revisions = [];
      submissions.forEach(function (item) {
        if (item && !item.parentAttemptId && !first) first = item;
        else if (item && item.parentAttemptId) revisions.push(item);
      });
      html += '<div class="formative-response">' +
        '<label for="' + escapeHtml(inputId) + '">' + escapeHtml(block.responseLabel || 'Your response (formative — saves automatically)') + '</label>' +
        '<textarea id="' + escapeHtml(inputId) + '" class="activity-response" rows="5" ' +
        'data-testid="independent-draft" ' +
        'data-activity-response="' + escapeHtml(key) + '" ' +
        'data-content-version="' + escapeHtml(version) + '">' + escapeHtml(saved) + '</textarea>' +
        '<p class="formative-save-note" data-activity-save-status>Your writing saves in this browser as you type.</p>' +
        '<p class="task-save-status" data-testid="task-save-status" data-task-status="' + escapeHtml(key) + '" role="status"></p>' +
        '</div>';
      if (!first) {
        html += '<p class="submission-actions"><button type="button" class="lesson-jump primary" ' +
          'data-testid="save-first-response" data-submit-first="' + escapeHtml(key) + '">Save first response</button></p>';
      } else {
        html += '<div class="submission-frozen">' +
          '<p class="section-label">First submission (kept as submitted)</p>' +
          '<blockquote data-testid="first-submission-text">' + escapeHtml(first.text || '') + '</blockquote>' +
          '</div>';
      }
      if (nonEmptyString(block.criteria)) {
        html += '<div class="criteria-region" data-criteria-region="' + escapeHtml(key) + '"' +
          (first ? '' : ' data-criteria="' + escapeHtml(block.criteria) + '"') + '>';
        if (first) {
          html += '<p class="submission-actions"><button type="button" class="lesson-jump" ' +
            'data-testid="comparison-toggle" data-comparison-toggle="' + escapeHtml(key) + '" aria-expanded="false">Compare with criteria</button></p>' +
            '<div class="task-criteria" data-testid="comparison-criteria" hidden><p>' +
            escapeHtml(block.criteria) + '</p></div>';
        } else {
          html += '<p class="task-criteria-locked" role="note">Save your first response above to unlock the comparison criteria.</p>';
        }
        html += '</div>';
      }
      if (first) {
        var latest = revisions.length ? revisions[revisions.length - 1].text : first.text;
        var revisionSeed = saved.trim() ? saved : (latest || '');
        var revisionId = 'revision-' + at + '-' + key.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40);
        html += '<div class="revision-area">' +
          '<label for="' + escapeHtml(revisionId) + '">Revise your response (your first submission is kept)</label>' +
          '<textarea id="' + escapeHtml(revisionId) + '" class="activity-response" rows="5" ' +
          'data-testid="revision-draft" data-revision-draft="' + escapeHtml(key) + '">' + escapeHtml(revisionSeed) + '</textarea>' +
          '<p class="submission-actions"><button type="button" class="lesson-jump" ' +
          'data-testid="save-revision" data-submit-revision="' + escapeHtml(key) + '">Save revision</button></p>';
        revisions.forEach(function (item, index) {
          html += '<p class="section-label">Revision ' + (index + 1) + '</p>' +
            '<blockquote data-testid="latest-revision-text">' + escapeHtml(item.text || '') + '</blockquote>';
        });
        html += '</div>';
      }
    } else if (nonEmptyString(block.criteria)) {
      html += '<details class="task-criteria"><summary>Comparison criteria</summary><p>' +
        escapeHtml(block.criteria) + '</p></details>';
    }
    return html + '</section>';
  }

  function renderBlock(block, index, context) {
    var at = typeof index === 'number' ? index : 0;
    var issues = validateBlock(block, at);
    var unknown = issues.some(function (item) { return item.code === 'unknown-type' || item.code === 'not-an-object'; });
    if (unknown || !block || typeof block !== 'object') {
      return '<p class="block-incomplete" role="note">Unsupported teaching block: ' +
        escapeHtml(block && block.type ? String(block.type) : 'not-an-object') + '.</p>';
    }
    var html = '';
    switch (block.type) {
      case 'explanation':
        html = '<section class="teaching-block" data-testid="lesson-prose" aria-label="' + escapeHtml(block.heading || 'Explanation') + '">' +
          (nonEmptyString(block.heading) ? '<h2>' + escapeHtml(block.heading) + '</h2>' : '') +
          (Array.isArray(block.paragraphs) ? block.paragraphs : []).map(function (paragraph) {
            return '<p>' + escapeHtml(paragraph) + '</p>';
          }).join('') +
          '</section>';
        break;
      case 'timeline':
        html = renderTimeline(block);
        break;
      case 'source':
        html = renderSourceCard(block, context);
        break;
      case 'comparison':
        html = renderComparison(block, context);
        break;
      case 'figure':
        html = renderFigure(block);
        if (!html) issues = issues.concat([issue(at, block.type, 'unapproved-src', 'Figure src must be an approved URL.')]);
        break;
      case 'workedExample':
        html = renderWorkedExample(block, context);
        break;
      case 'supportedPractice':
        html = '<section class="supported-practice" data-testid="supported-task" aria-label="' + escapeHtml(block.title || 'Supported practice') + '">' +
          '<p class="section-label">' + (context && context.teacherVoice ? 'Check your understanding' : 'Supported practice') + '</p>' +
          (nonEmptyString(block.title) ? '<h2>' + escapeHtml(block.title) + '</h2>' : '') +
          (nonEmptyString(block.method) ? '<p>' + (context && context.teacherVoice ? '' : '<strong>Method:</strong> ') + escapeHtml(block.method) + '</p>' : '') +
          (nonEmptyString(block.task) ? '<p>' + escapeHtml(block.task) + '</p>' : '') +
          (nonEmptyString(block.feedback)
            ? '<details class="practice-feedback"><summary>Feedback</summary><p>' + escapeHtml(block.feedback) + '</p></details>' : '') +
          '</section>';
        break;
      case 'supportedSelection':
        html = renderSupportedSelection(block, at, context);
        break;
      case 'independentTask':
        html = renderIndependentTask(block, at, context);
        break;
      case 'reflection':
        html = '<section class="reflection-prompt" aria-label="Reflection">' +
          '<p><strong>Reflection (optional):</strong> ' + escapeHtml(block.prompt || '') + '</p>' +
          '</section>';
        break;
      case 'assignmentConnection': {
        var href = context && typeof context.assignmentHref === 'function'
          ? context.assignmentHref(block.assignmentId) : '';
        var exists = context && typeof context.assignmentExists === 'function'
          ? context.assignmentExists(block.assignmentId) : true;
        if (!nonEmptyString(block.assignmentId) || !exists || !href) {
          issues = issues.concat([issue(at, block.type, 'unknown-assignment', 'Assignment connection needs a known assignment.')]);
          html = '';
        } else {
          html = '<p class="assignment-connection"><a href="' + escapeHtml(href) + '">' +
            'Open the connected assignment' + '</a>' +
            (nonEmptyString(block.note) ? ' — ' + escapeHtml(block.note) : '') + '</p>';
        }
        break;
      }
      default:
        html = '';
        break;
    }
    var missing = issues.map(function (item) { return item.code; });
    if (missing.length) html += renderIncompleteBadge(block.type, missing);
    return html;
  }

  function renderBlocks(blocks, context) {
    if (!Array.isArray(blocks)) return '';
    var ctx = context || {};
    var presented = ctx.teacherVoice ? presentTeacherBlocks(blocks) : blocks;
    var html = '';
    for (var index = 0; index < presented.length; index += 1) {
      var block = presented[index];
      if (ctx.teacherVoice && block && block.type === 'explanation' && presented[index + 1] && presented[index + 1].type === 'figure') {
        html += '<section class="lesson-visual-split">' + renderBlock(block, index, ctx) + renderBlock(presented[index + 1], index + 1, ctx) + '</section>';
        index += 1;
        continue;
      }
      if (ctx.teacherVoice && block && block.type === 'source') {
        var run = [block];
        while (index + 1 < presented.length) {
          var next = presented[index + 1];
          var first = run[0];
          var sameFamily = next && next.type === 'source' &&
            sourceFamilyKey(first) === sourceFamilyKey(next);
          if (!sameFamily) break;
          run.push(next);
          index += 1;
        }
        if (run.length > 1) {
          html += renderBlock({
            type: 'source',
            title: '',
            readingStyle: 'compact',
            creator: run.every(function (part) { return part.creator === run[0].creator; }) ? run[0].creator : '',
            sectionHeading: run[0].sectionHeading || '',
            passages: run
          }, index - run.length + 1, ctx);
          continue;
        }
      }
      html += renderBlock(block, index, ctx);
    }
    return html;
  }

  global.AB30LessonBlocks = {
    KNOWN_TYPES: KNOWN_TYPES,
    escapeHtml: escapeHtml,
    isApprovedAssetUrl: isApprovedAssetUrl,
    validateBlock: validateBlock,
    validateLessonBlocks: validateLessonBlocks,
    sourceLabelMap: sourceLabelMap,
    presentTeacherText: presentTeacherText,
    presentTeacherBlocks: presentTeacherBlocks,
    presentPracticeItem: presentPracticeItem,
    renderGoalStrip: renderGoalStrip,
    renderBlock: renderBlock,
    renderBlocks: renderBlocks
  };
})(typeof window !== 'undefined' ? window : globalThis);
