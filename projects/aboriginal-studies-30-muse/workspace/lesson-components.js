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
      case 'source':
        if (!nonEmptyString(block.extract)) {
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
  function renderSourceCard(block) {
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

  function renderComparison(block) {
    var columns = Array.isArray(block.columns) ? block.columns : [];
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
      '<figcaption>' + escapeHtml(block.caption || '') + '</figcaption>' +
      '</figure>';
  }

  function renderWorkedExample(block) {
    var evidence = Array.isArray(block.evidence) ? block.evidence : [];
    var reasoning = Array.isArray(block.reasoning) ? block.reasoning : [];
    return '<section class="worked-example" aria-label="' + escapeHtml(block.title || 'Worked example') + '">' +
      '<p class="section-label">Worked example</p>' +
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
      '<p class="section-label">Supported practice</p>' +
      (nonEmptyString(block.title) ? '<h2>' + escapeHtml(block.title) + '</h2>' : '') +
      (nonEmptyString(block.method) ? '<p><strong>Method:</strong> ' + escapeHtml(block.method) + '</p>' : '') +
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
      (block.differsFrom && (nonEmptyString(block.differsFrom.evidence) || nonEmptyString(block.differsFrom.example))
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
      case 'source':
        html = renderSourceCard(block);
        break;
      case 'comparison':
        html = renderComparison(block);
        break;
      case 'figure':
        html = renderFigure(block);
        if (!html) issues = issues.concat([issue(at, block.type, 'unapproved-src', 'Figure src must be an approved URL.')]);
        break;
      case 'workedExample':
        html = renderWorkedExample(block);
        break;
      case 'supportedPractice':
        html = '<section class="supported-practice" data-testid="supported-task" aria-label="' + escapeHtml(block.title || 'Supported practice') + '">' +
          '<p class="section-label">Supported practice</p>' +
          (nonEmptyString(block.title) ? '<h2>' + escapeHtml(block.title) + '</h2>' : '') +
          (nonEmptyString(block.method) ? '<p><strong>Method:</strong> ' + escapeHtml(block.method) + '</p>' : '') +
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
    return blocks.map(function (block, index) {
      return renderBlock(block, index, context || {});
    }).join('');
  }

  global.AB30LessonBlocks = {
    KNOWN_TYPES: KNOWN_TYPES,
    escapeHtml: escapeHtml,
    isApprovedAssetUrl: isApprovedAssetUrl,
    validateBlock: validateBlock,
    validateLessonBlocks: validateLessonBlocks,
    renderGoalStrip: renderGoalStrip,
    renderBlock: renderBlock,
    renderBlocks: renderBlocks
  };
})(typeof window !== 'undefined' ? window : globalThis);
