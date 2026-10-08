/* AB30 practice engine — T09 finite practice on one store.
 *
 * Modes run through the approved store adapter (attempts for firsts and
 * revisions; ui key for run sessions and exposure). The engine never
 * generates facts, testimony, keys, or feedback: items arrive reviewed or
 * are excluded with reasons (PRACT01); fill-in grading is narrow reviewed
 * matching only, never fuzzy (PRACT11); written reasoning is stored, never
 * keyword-graded (PRACT04); reflection reveals persist nothing (PRACT10).
 *
 * Self-contained apart from the injected store interface:
 * { startPracticeRun, getPracticeRun, listPracticeRuns, submitPracticeAttempt,
 *   beginPracticeAttempt, resetPracticeAttempt, getPracticeAttempt,
 *   markPracticeExposed, finishPracticeRun, getPracticeExposure }.
 * Production passes AB30Store; tests pass fakes with identical shapes.
 */
(function (global) {
  'use strict';

  function hashSeed(text) {
    var hash = 0x811c9dc5;
    var s = String(text || '');
    for (var i = 0; i < s.length; i += 1) {
      hash ^= s.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    var state = seed >>> 0;
    return function next() {
      state = (state + 0x6d2b79f5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(items, rand) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function practiceTaskId(item) {
    return 'practice:' + item.version + ':' + item.id;
  }

  function buildMatchingItems(vocabList, count, seed, bankVersion, exposedMap) {
    var vocab = Array.isArray(vocabList) ? vocabList.filter(function (entry) {
      return entry && entry.id && entry.term && entry.meaning;
    }) : [];
    var rand = mulberry32(hashSeed('matching:' + String(seed)));
    var picked = shuffled(vocab, rand).slice(0, Math.max(0, count));
    var exposed = exposedMap || {};
    return picked.map(function (entry) {
      var others = shuffled(vocab.filter(function (candidate) {
        return candidate.id !== entry.id;
      }), rand).slice(0, 3);
      var options = shuffled(
        [{ id: entry.id, text: entry.meaning }].concat(others.map(function (candidate) {
          return { id: candidate.id, text: candidate.meaning };
        })),
        rand
      );
      var feedbackByOption = {};
      options.forEach(function (option) {
        feedbackByOption[option.id] = option.id === entry.id
          ? 'Correct. \u201C' + entry.term + '\u201D means: ' + entry.meaning
          : 'Not quite. \u201C' + entry.term + '\u201D means: ' + entry.meaning;
      });
      var itemId = 'match:' + entry.id;
      return {
        id: itemId,
        family: 'term-meaning',
        mode: 'matching',
        concept: entry.term,
        lessonId: entry.lessonId || null,
        unitId: entry.unitId || null,
        stimulus: { term: entry.term, termId: entry.id },
        stimulusVersion: bankVersion,
        prompt: 'What does \u201C' + entry.term + '\u201D mean?',
        options: options,
        optionOrder: options.map(function (option) { return option.id; }),
        key: entry.id,
        feedbackByOption: feedbackByOption,
        version: bankVersion,
        reviewed: true,
        role: 'formative',
        review: !!exposed[itemId]
      };
    });
  }

  // R08: reviewed selected-response items from the bank registry.
  // Options keep authored order with pinned stable ids (optionOrder
  // records exactly what the learner saw); sourceIds/stimulusId pin the
  // stimulus. Only reviewed multipleChoice items map — written items are
  // never option-graded, and anything else is excluded, never fabricated.
  function buildSelectedResponseItems(bankItems, seed, bankVersion, exposedMap) {
    var list = Array.isArray(bankItems) ? bankItems : [];
    var exposed = exposedMap || {};
    var versionBase = String(bankVersion || 'unversioned-bank');
    return list
      .filter(function (item) {
        return item && item.mode === 'multipleChoice' && item.reviewed === true &&
          item.id && item.contentVersion && item.correctOptionId &&
          Array.isArray(item.options) && item.options.length >= 2 &&
          item.feedbackByOption && typeof item.feedbackByOption === 'object';
      })
      .map(function (item) {
        var options = item.options.map(function (option) {
          return { id: option.id, text: option.text };
        });
        var feedbackByOption = {};
        options.forEach(function (option) {
          feedbackByOption[option.id] = item.feedbackByOption[option.id];
        });
        var version = versionBase + ':' + String(item.contentVersion);
        return {
          id: item.id,
          family: item.familyId || item.skillTag || 'selected-response',
          mode: 'selected-response',
          concept: item.skillTag || '',
          lessonId: item.lessonId || null,
          unitId: item.unitId || null,
          stimulus: {
            stimulusId: item.stimulusId || null,
            sourceIds: Array.isArray(item.sourceIds) ? item.sourceIds.slice() : [],
            prompt: item.prompt
          },
          stimulusVersion: version,
          prompt: item.prompt,
          options: options,
          optionOrder: options.map(function (option) { return option.id; }),
          key: item.correctOptionId,
          feedbackByOption: feedbackByOption,
          version: version,
          reviewed: true,
          role: 'formative',
          seed: String(seed == null ? item.id : seed),
          review: !!exposed[item.id]
        };
      });
  }

  function eligibleItems(items) {
    var eligible = [];
    var excluded = [];
    (Array.isArray(items) ? items : []).forEach(function (item) {
      var reasons = [];
      if (!item || typeof item !== 'object') {
        excluded.push({ id: 'unknown', reasons: ['not-an-item'] });
        return;
      }
      if (item.reviewed !== true) reasons.push('unreviewed');
      if (!item.id) reasons.push('missing-id');
      if (!item.version) reasons.push('missing-version');
      if (!item.key) reasons.push('missing-key');
      var options = Array.isArray(item.options) ? item.options : [];
      if (!options.length) reasons.push('missing-options');
      var feedback = item.feedbackByOption || {};
      var missingFeedback = options.filter(function (option) {
        return !option || !option.id || typeof feedback[option.id] !== 'string' || !feedback[option.id].trim();
      });
      if (missingFeedback.length) reasons.push('missing-feedback');
      if (reasons.length) excluded.push({ id: item.id || 'unknown', reasons: reasons });
      else eligible.push(item);
    });
    return { eligible: eligible, excluded: excluded };
  }

  function sampleItems(eligible, count, seed) {
    var pool = Array.isArray(eligible) ? eligible.slice() : [];
    var rand = mulberry32(hashSeed('sample:' + String(seed)));
    var picked = shuffled(pool, rand).slice(0, Math.max(0, count));
    return {
      items: picked,
      requested: count,
      offered: picked.length,
      exhausted: picked.length < count
    };
  }

  function conceptCards(vocabList) {
    return (Array.isArray(vocabList) ? vocabList : []).filter(function (entry) {
      return entry && entry.term && entry.meaning;
    }).map(function (entry) {
      return {
        term: entry.term,
        meaning: entry.meaning,
        lessonId: entry.lessonId || null,
        unitId: entry.unitId || null
      };
    });
  }

  function reflect() {
    return { revealed: true, persisted: false };
  }

  function selectOption(selection, itemId, optionId) {
    var next = {};
    for (const key of Object.keys(selection || {})) next[key] = selection[key];
    next[itemId] = optionId;
    return next;
  }

  function moveOrderItem(order, fromIndex, toIndex) {
    var list = Array.isArray(order) ? order.slice() : [];
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) {
      return { order: list, moved: false };
    }
    var item = list.splice(fromIndex, 1)[0];
    list.splice(toIndex, 0, item);
    return { order: list, moved: true };
  }

  function normalizeFillIn(response) {
    return String(response || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function gradeFillIn(item, response) {
    var accepted = item && Array.isArray(item.accepted) ? item.accepted : [];
    if (!accepted.length) return { match: false, normalized: normalizeFillIn(response), code: 'no-reviewed-key' };
    if (item.normalize && item.normalize !== 'narrow') {
      return { match: false, normalized: normalizeFillIn(response), code: 'unreviewed-rule' };
    }
    var normalized = normalizeFillIn(response);
    var match = accepted.some(function (answer) {
      return typeof answer === 'string' && normalizeFillIn(answer) === normalized;
    });
    return { match: match, normalized: normalized, code: match ? 'match' : 'no-match' };
  }

  function feedbackFor(item, selectedId) {
    var feedback = (item && item.feedbackByOption) || {};
    var text = typeof feedback[selectedId] === 'string' ? feedback[selectedId] : '';
    return {
      correct: !!item && selectedId === item.key,
      text: text,
      lessonId: item ? (item.lessonId || null) : null,
      unitId: item ? (item.unitId || null) : null
    };
  }

  function startRun(store, spec) {
    var gate = eligibleItems(spec.items);
    if (gate.excluded.length) {
      return { ok: false, code: 'unreviewed-items', excluded: gate.excluded };
    }
    return store.startPracticeRun({
      mode: spec.mode,
      attemptMode: spec.attemptMode || 'independent',
      itemIds: gate.eligible.map(function (item) { return item.id; }),
      seed: spec.seed,
      stimuli: gate.eligible.map(function (item) {
        return {
          itemId: item.id, stimulus: item.stimulus, options: item.options,
          lessonId: item.lessonId || null, unitId: item.unitId || null, concept: item.concept || '',
          key: item.key, feedbackByOption: item.feedbackByOption,
          reviewed: item.reviewed === true
        };
      }),
      versions: gate.eligible.map(function (item) { return item.version; }),
      optionOrders: gate.eligible.map(function (item) { return item.optionOrder || []; })
    });
  }

  function submitFirst(store, run, item, input, attemptDefaults) {
    var payload = {
      taskId: practiceTaskId(item),
      response: (input && input.response) || '',
      contentVersion: item.version,
      optionOrder: item.optionOrder || [],
      selectedOptions: (input && input.selectedOptions) || [],
      role: 'first',
      intended: run.attemptMode || 'independent'
    };
    if (attemptDefaults && typeof attemptDefaults === 'object') {
      for (const key of Object.keys(attemptDefaults)) payload[key] = attemptDefaults[key];
    }
    var result = store.submitPracticeAttempt(run.id, payload);
    if (!result.ok) return { ok: false, code: result.code, draft: input };
    return {
      ok: true,
      attemptId: result.attemptId,
      duplicate: !!result.duplicate,
      feedback: feedbackFor(item, ((input && input.selectedOptions) || [])[0])
    };
  }

  function submitRevision(store, run, item, firstAttemptId, input) {
    var payload = {
      taskId: practiceTaskId(item),
      response: (input && input.response) || '',
      contentVersion: item.version,
      optionOrder: item.optionOrder || [],
      selectedOptions: (input && input.selectedOptions) || [],
      role: 'revision',
      revisionOf: firstAttemptId,
      intended: run.attemptMode || 'independent'
    };
    var result = store.submitPracticeAttempt(run.id, payload);
    if (!result.ok) return { ok: false, code: result.code, draft: input };
    return {
      ok: true,
      attemptId: result.attemptId,
      duplicate: !!result.duplicate,
      feedback: feedbackFor(item, ((input && input.selectedOptions) || [])[0])
    };
  }

  function recordExposure(store, itemId, exposureId) {
    return store.markPracticeExposed(itemId, exposureId);
  }

  function runStatus(run, exposedMap) {
    var total = (run && Array.isArray(run.itemIds) ? run.itemIds : []).length;
    var attemptIds = (run && run.attemptIds) || {};
    var answered = Object.keys(attemptIds).length;
    var exposed = exposedMap || {};
    var review = (run && Array.isArray(run.itemIds) ? run.itemIds : []).filter(function (itemId) {
      return !!exposed[itemId] && !attemptIds[itemId];
    });
    return { answered: answered, total: total, review: review, complete: run ? run.status === 'complete' : false };
  }

  global.AB30PracticeEngine = {
    practiceTaskId: practiceTaskId,
    buildMatchingItems: buildMatchingItems,
    buildSelectedResponseItems: buildSelectedResponseItems,
    eligibleItems: eligibleItems,
    sampleItems: sampleItems,
    conceptCards: conceptCards,
    reflect: reflect,
    selectOption: selectOption,
    moveOrderItem: moveOrderItem,
    normalizeFillIn: normalizeFillIn,
    gradeFillIn: gradeFillIn,
    feedbackFor: feedbackFor,
    startRun: startRun,
    submitFirst: submitFirst,
    submitRevision: submitRevision,
    recordExposure: recordExposure,
    runStatus: runStatus
  };
})(typeof window !== 'undefined' ? window : globalThis);
