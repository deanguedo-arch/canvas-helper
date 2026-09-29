/* AB30 learning store — T04-approved persistence adapter (lead-approved 2026-09-23).
 *
 * Classic script (no modules): loaded before main.js. Zero side effects at
 * load; main.js calls AB30Store.init() explicitly. No DOM access here —
 * main.js owns all rendering.
 *
 * Design contract: projects/aboriginal-studies-30/meta/ab30-parity/store-design.md
 * Pure behavior verified by: scripts/tests/aboriginal-studies-30-state.test.ts
 * (which loads THIS file and asserts the approved semantics).
 *
 * R02 (v2 package, PENDING lead integration review): AB30Store is the sole
 * writer of the three tracked keys. Durable practice runs/exposure moved from
 * the shared .ui object into the activity envelope (schema ab30-store-v2);
 * .ui is navigation-only via saveNavigation(); .progress is a derived
 * projection via saveProgress(). main.js submits commands, never serializes
 * whole tracked objects. See meta/ab30-v2/R02-COMPLETION.json + lead handoff.
 *
 * Non-negotiables (from the approved design):
 * - The exact 3 storage key names never change (hosts track names).
 * - The migration marker lives inside a tracked value, never a new key.
 * - Over-budget / corrupt / conflict states surface explicit recovery —
 *   never truncation, eviction, or silent overwrite.
 * - No invented timestamps: unobserved times stay null.
 */
(function (global) {
  'use strict';

  var KEY_ACTIVITY = 'aboriginal-studies-30-theme-2.activityResponses';
  var KEY_PROGRESS = 'aboriginal-studies-30-theme-2.progress';
  var KEY_UI = 'aboriginal-studies-30-theme-2.ui';
  var SCORM_2004_BUDGET = 60000;
  var SCORM_12_BUDGET = 3500;
  var TRACKING_HEADROOM = 1500;
  // R04 host profiles: browser-local (default) applies NO character budget —
  // only real storage failures gate saves. A character budget applies solely
  // under an explicitly configured host profile (lead-owned measurement).
  // No host save bridge exists for this course; host capacity is UNKNOWN.

  // Verbatim from scripts/tests/fixtures/ab30-parity/assignment-aliases.json
  // (contract affinity). One logical assignment, several legacy view keys.
  var ASSIGNMENT_ALIASES = [
    { assignmentId: 'oral-tradition', legacyKeys: ['written::oral-tradition', 'theme-1-online-booklet::assignment-1-1'] },
    { assignmentId: 'rebuilding-self-government', legacyKeys: ['written::rebuilding-self-government', 'theme-1-online-booklet::assignment-1-2'] },
    { assignmentId: '2-1-land-stewardship', legacyKeys: ['written::2-1-land-stewardship', 'assignment-draft::2-1-land-stewardship'] },
    { assignmentId: '2-2-specific-land-claims', legacyKeys: ['written::2-2-specific-land-claims', 'assignment-draft::2-2-specific-land-claims'] },
    { assignmentId: 'assignment-3-1-breaking-stereotypes', legacyKeys: ['written::assignment-3-1-breaking-stereotypes', 'assignment-draft::assignment-3-1-breaking-stereotypes'] },
    { assignmentId: 'attawapiskat-report', legacyKeys: ['written::attawapiskat-report', 'assignment-draft::attawapiskat-report'] },
    { assignmentId: '4-2-rabbit-proof-fence', legacyKeys: ['written::4-2-rabbit-proof-fence', 'assignment-draft::4-2-rabbit-proof-fence'] },
    { assignmentId: '4-3-personal-response', legacyKeys: ['written::4-3-personal-response', 'assignment-draft::4-3-personal-response'] }
  ];

  var BOOKLET_PREFIXES = ['theme-1-online-booklet::'];
  var LEGACY_NOVEL_VERSIONS = { '4-3-personal-response': 'legacy-inconvenient-indian' };

  function storeHash(value) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function storeClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function storeEmptyPractice() {
    return { runs: {}, exposure: {}, counter: 0 };
  }

  function storeEmptyEnvelope() {
    return {
      schema: 'ab30-store-v2',
      revision: 1,
      records: {},
      conflicts: [],
      attempts: [],
      submissions: [],
      taskExposure: {},
      practice: storeEmptyPractice(),
      legacy: { raw: {} },
      migration: { from: 'flat-v0', at: null, complete: false },
      migrationHistory: []
    };
  }

  function isBookletKey(key) {
    for (var i = 0; i < BOOKLET_PREFIXES.length; i += 1) {
      if (key.indexOf(BOOKLET_PREFIXES[i]) === 0) return true;
    }
    return false;
  }

  // T04-approved migration; T05 change log: booklet membership is classified
  // by key prefix instead of a precomputed Set (same semantics, no DATA
  // dependency, no load-order coupling). Verified by STATE01/04/05/12.
  function storeMigrateFlatToV1(flat, aliases, promptVersions) {
    if (flat && (flat.schema === 'ab30-store-v1' || flat.schema === 'ab30-store-v2')) {
      var asIs = storeClone(flat);
      return {
        envelope: asIs,
        report: {
          records: Object.keys(asIs.records).length,
          conflicts: asIs.conflicts.length,
          unknowns: Object.keys((asIs.legacy || {}).raw || {}).length,
          nonstrings: []
        }
      };
    }
    var keyToGroup = {};
    aliases.forEach(function (alias) {
      alias.legacyKeys.forEach(function (key) { keyToGroup[key] = alias.assignmentId; });
    });
    var grouped = {};
    var envelope = storeEmptyEnvelope();
    var report = { records: 0, conflicts: 0, unknowns: 0, nonstrings: [] };
    Object.keys(flat).forEach(function (key) {
      var rawValue = flat[key];
      if (typeof rawValue !== 'string') {
        envelope.legacy.raw[key] = storeClone(rawValue);
        report.unknowns += 1;
        report.nonstrings.push(key);
        return;
      }
      var value = rawValue;
      var group = keyToGroup[key];
      if (group !== undefined) {
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push({ key: key, value: value });
        return;
      }
      if (isBookletKey(key)) {
        envelope.records[key] = {
          id: key, kind: 'booklet-field', draft: value, revision: 1,
          contentVersion: 'legacy-v0', origins: [{ key: key, value: value }], updatedAt: null
        };
        report.records += 1;
        return;
      }
      if (key.indexOf('frayer::') === 0) {
        envelope.records[key] = {
          id: key, kind: 'vocabulary', draft: value, revision: 1,
          contentVersion: 'legacy-v0', origins: [{ key: key, value: value }], updatedAt: null
        };
        report.records += 1;
        return;
      }
      envelope.legacy.raw[key] = value;
      report.unknowns += 1;
    });
    Object.keys(grouped).forEach(function (assignmentId) {
      var origins = grouped[assignmentId];
      var recordId = 'assignment:' + assignmentId;
      var sorted = origins.slice().sort(function (a, b) { return a.key < b.key ? -1 : 1; });
      var seen = {};
      var distinctNonempty = [];
      sorted.forEach(function (origin) {
        if (origin.value !== '' && !seen[origin.value]) {
          seen[origin.value] = true;
          distinctNonempty.push(origin.value);
        }
      });
      var contentVersion = (promptVersions && promptVersions[assignmentId]) || 'legacy-v0';
      if (distinctNonempty.length > 1) {
        var conflictId = 'conf:' + storeHash([recordId].concat(sorted.map(function (o) { return o.key + '\n' + o.value; })).join('\n'));
        envelope.conflicts.push({ id: conflictId, recordId: recordId, candidates: sorted, status: 'unresolved', resolution: null });
        envelope.records[recordId] = {
          id: recordId, kind: 'assignment', draft: '', revision: 1,
          contentVersion: contentVersion, origins: sorted, updatedAt: null
        };
        report.conflicts += 1;
      } else {
        envelope.records[recordId] = {
          id: recordId, kind: 'assignment', draft: distinctNonempty[0] || '', revision: 1,
          contentVersion: contentVersion, origins: sorted, updatedAt: null
        };
      }
      report.records += 1;
    });
    return { envelope: envelope, report: report };
  }

  // R02 pure migration to schema ab30-store-v2. Inputs are exact raw strings
  // (or null when a key is absent); no storage access here. Deterministic:
  // the same inputs always yield byte-identical outputs (no timestamps, no
  // randomness), so crash-replay and repeated migration cannot duplicate.
  // Practice runs/exposure move from the shared .ui object into the activity
  // envelope; .ui keeps navigation props only. Unknown props are preserved.
  function storeMigrateToV2(activityRaw, uiRaw, progressRaw) {
    var raws = {
      activity: activityRaw === undefined ? null : activityRaw,
      ui: uiRaw === undefined ? null : uiRaw,
      progress: progressRaw === undefined ? null : progressRaw
    };
    function parseObject(raw) {
      if (raw === null || raw === undefined || raw === '') return { ok: true, empty: true, value: null };
      var parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (_error) {
        return { ok: false, empty: false, value: null };
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ok: false, empty: false, value: null };
      return { ok: true, empty: false, value: parsed };
    }
    var activity = parseObject(activityRaw);
    if (!activity.ok) return { ok: false, kind: 'corrupt', raws: raws, raw: activityRaw };
    var uiParsed = parseObject(uiRaw);
    var progressParsed = parseObject(progressRaw);
    var ui = uiParsed.ok ? storeClone(uiParsed.value || {}) : {};
    var uiRawPreserved = uiParsed.ok ? null : String(uiRaw);
    var progress = progressParsed.ok ? storeClone(progressParsed.value || {}) : {};
    var envelope = null;
    var fromSchema = 'flat-v0';
    if (activity.empty) {
      envelope = storeEmptyEnvelope();
    } else if (activity.value.schema === 'ab30-store-v2') {
      if (!storeValidateEnvelopeShape(activity.value)) return { ok: false, kind: 'corrupt', raws: raws, raw: activityRaw };
      envelope = storeClone(activity.value);
      fromSchema = 'ab30-store-v2';
    } else if (activity.value.schema === 'ab30-store-v1') {
      if (!storeValidateEnvelopeShape(activity.value)) return { ok: false, kind: 'corrupt', raws: raws, raw: activityRaw };
      envelope = storeClone(activity.value);
      fromSchema = 'ab30-store-v1';
    } else {
      var flatResult = storeMigrateFlatToV1(activity.value, ASSIGNMENT_ALIASES, LEGACY_NOVEL_VERSIONS);
      envelope = flatResult.envelope;
      fromSchema = 'flat-v0';
    }
    if (!envelope.practice || typeof envelope.practice !== 'object') envelope.practice = storeEmptyPractice();
    if (!envelope.practice.runs || typeof envelope.practice.runs !== 'object') envelope.practice.runs = {};
    if (!envelope.practice.exposure || typeof envelope.practice.exposure !== 'object') envelope.practice.exposure = {};
    if (typeof envelope.practice.counter !== 'number') envelope.practice.counter = 0;
    if (!Array.isArray(envelope.migrationHistory)) envelope.migrationHistory = [];
    if (!Array.isArray(envelope.submissions)) envelope.submissions = [];
    if (!envelope.taskExposure || typeof envelope.taskExposure !== 'object') envelope.taskExposure = {};
    // Merge practice leftovers from .ui (v1 writers) into the envelope domain.
    var movedRuns = 0;
    var movedExposure = 0;
    var uiRuns = (ui && typeof ui.practiceRuns === 'object' && ui.practiceRuns) || null;
    var uiExposed = (ui && typeof ui.practiceExposed === 'object' && ui.practiceExposed) || null;
    var uiCounter = (ui && typeof ui.practiceRunCounter === 'number') ? ui.practiceRunCounter : null;
    if (uiRuns) {
      Object.keys(uiRuns).forEach(function (id) {
        var incoming = uiRuns[id];
        var mine = envelope.practice.runs[id];
        if (!mine) {
          envelope.practice.runs[id] = storeClone(incoming);
          movedRuns += 1;
          return;
        }
        if (JSON.stringify(mine) === JSON.stringify(incoming)) return;
        var conflictId = 'conf:' + storeHash(['practice:' + id, JSON.stringify(mine), JSON.stringify(incoming)].join('\n'));
        var exists = envelope.conflicts.some(function (item) { return item.id === conflictId; });
        if (!exists) {
          envelope.conflicts.push({
            id: conflictId, recordId: 'practice:' + id,
            candidates: [
              { key: 'envelope:' + id, value: JSON.stringify(mine) },
              { key: 'ui:' + id, value: JSON.stringify(incoming) }
            ],
            status: 'unresolved', resolution: null
          });
        }
        movedRuns += 1;
      });
    }
    if (uiExposed) {
      Object.keys(uiExposed).forEach(function (itemId) {
        var prior = envelope.practice.exposure[itemId] || [];
        var next = prior.slice();
        (Array.isArray(uiExposed[itemId]) ? uiExposed[itemId] : [uiExposed[itemId]]).forEach(function (entry) {
          if (next.indexOf(entry) === -1) { next.push(entry); movedExposure += 1; }
        });
        envelope.practice.exposure[itemId] = next;
      });
    }
    if (uiCounter !== null && uiCounter > envelope.practice.counter) envelope.practice.counter = uiCounter;
    var hadUiPractice = Boolean(uiRuns || uiExposed || uiCounter !== null);
    if (ui && typeof ui === 'object') {
      delete ui.practiceRuns;
      delete ui.practiceExposed;
      delete ui.practiceRunCounter;
    }
    if (uiRawPreserved !== null) ui['legacy:raw-ui'] = uiRawPreserved;
    // Accurately label legacy single-character origins (first-write artefacts,
    // never complete first attempts). Deterministic: reapplying is identical.
    var annotated = 0;
    Object.keys(envelope.records || {}).forEach(function (id) {
      var record = envelope.records[id];
      if (record && Array.isArray(record.origins) && record.origins.length
        && typeof record.origins[0].value === 'string' && record.origins[0].value.length === 1
        && record.originNote !== 'legacy-first-write-artefact') {
        record.originNote = 'legacy-first-write-artefact';
        annotated += 1;
      }
    });
    var migrated = fromSchema !== 'ab30-store-v2' || hadUiPractice || annotated > 0;
    envelope.schema = 'ab30-store-v2';
    if (migrated) {
      envelope.revision = (typeof envelope.revision === 'number' ? envelope.revision : 0) + 1;
      envelope.migrationHistory.push({
        from: fromSchema, at: null, complete: true,
        runsMoved: movedRuns, exposureMoved: movedExposure, originsAnnotated: annotated,
        uiKeysPreserved: Object.keys(ui).sort(),
        sourceDigests: {
          activity: activityRaw ? storeHash(String(activityRaw)) : null,
          ui: uiRaw ? storeHash(String(uiRaw)) : null,
          progress: progressRaw ? storeHash(String(progressRaw)) : null
        }
      });
      envelope.migration = { from: fromSchema, at: null, complete: true };
    }
    if (!envelope.legacy || typeof envelope.legacy !== 'object') envelope.legacy = { raw: {} };
    return {
      ok: true,
      kind: migrated ? 'migrated' : 'already-v2',
      envelope: envelope, ui: ui, progress: progress,
      raws: raws,
      report: { from: fromSchema, runsMoved: movedRuns, exposureMoved: movedExposure, originsAnnotated: annotated }
    };
  }

  function storeFlattenForRollback(envelope) {
    var flat = {};
    var dropped = [];
    Object.keys(envelope.legacy.raw).forEach(function (key) {
      if (typeof envelope.legacy.raw[key] === 'string') flat[key] = envelope.legacy.raw[key];
    });
    Object.keys(envelope.records).forEach(function (id) {
      var record = envelope.records[id];
      record.origins.forEach(function (origin) { flat[origin.key] = origin.value; });
      var conflict = null;
      for (var i = 0; i < envelope.conflicts.length; i += 1) {
        var item = envelope.conflicts[i];
        if (item.recordId === record.id && item.status === 'unresolved') conflict = item;
      }
      if (!conflict && record.draft !== '' && !record.origins.some(function (origin) { return origin.value === record.draft; })) {
        var primary = record.origins.slice().sort(function (a, b) { return a.key < b.key ? -1 : 1; })[0];
        if (primary) flat[primary.key] = record.draft;
        else if (record.kind === 'booklet-field' || record.kind === 'vocabulary') flat[record.id] = record.draft;
      }
      if ((record.kind === 'booklet-field' || record.kind === 'vocabulary') && !(record.id in flat)) {
        flat[record.id] = record.draft;
      }
    });
    if (envelope.attempts.length > 0) dropped.push(envelope.attempts.length + ' attempt(s)');
    var resolved = envelope.conflicts.filter(function (item) { return item.status === 'resolved'; }).length;
    if (resolved > 0) dropped.push(resolved + ' conflict resolution(s)');
    return { flat: flat, dropped: dropped };
  }

  function storeReadDraft(envelope, recordId) {
    var record = envelope.records[recordId];
    if (!record) throw new Error('record ' + recordId + ' must exist');
    var conflict = null;
    for (var i = 0; i < envelope.conflicts.length; i += 1) {
      var item = envelope.conflicts[i];
      if (item.recordId === recordId && item.status === 'unresolved') conflict = item;
    }
    return {
      text: record.draft, revision: record.revision, contentVersion: record.contentVersion,
      hasConflict: conflict !== null, conflictId: conflict ? conflict.id : null
    };
  }

  function storeValidateTask(task) {
    if (!task || typeof task !== 'object') return { ok: false, code: 'invalid-submission' };
    if (typeof task.id !== 'string' || !task.id) return { ok: false, code: 'invalid-submission' };
    if (typeof task.contentVersion !== 'string' || !task.contentVersion) return { ok: false, code: 'invalid-submission' };
    return { ok: true };
  }

  function storeWriteDraft(envelope, recordId, text, expectedRevision) {
    var next = storeClone(envelope);
    var record = next.records[recordId];
    if (!record) {
      next.records[recordId] = {
        id: recordId, kind: 'booklet-field', draft: text, revision: 1,
        contentVersion: 'legacy-v0', origins: [{ key: recordId, value: text }], updatedAt: null
      };
      next.revision += 1;
      return { envelope: next, result: { ok: true, revision: 1 } };
    }
    if (record.revision !== expectedRevision) {
      return {
        envelope: envelope,
        result: { ok: false, code: 'stale-revision', currentRevision: record.revision, currentText: record.draft }
      };
    }
    record.draft = text;
    record.revision += 1;
    next.revision += 1;
    return { envelope: next, result: { ok: true, revision: record.revision } };
  }

  function storeResolveConflict(envelope, conflictId, choice, observedAt) {
    var next = storeClone(envelope);
    var conflict = null;
    for (var i = 0; i < next.conflicts.length; i += 1) {
      if (next.conflicts[i].id === conflictId) conflict = next.conflicts[i];
    }
    if (!conflict) throw new Error('conflict ' + conflictId + ' must exist');
    if (conflict.status !== 'unresolved') throw new Error('only unresolved conflicts resolve');
    var record = next.records[conflict.recordId];
    if (!record) throw new Error('conflict record must exist');
    var ordered = conflict.candidates.slice().sort(function (a, b) { return a.key < b.key ? -1 : 1; });
    var mergedText = choice.mode === 'keep-first' ? ordered[0].value
      : choice.mode === 'keep-second' ? ordered[ordered.length - 1].value
      : choice.mergedText;
    if (choice.mode === 'merged' && mergedText === undefined) throw new Error('merged choice needs mergedText');
    record.draft = mergedText;
    record.revision += 1;
    conflict.status = 'resolved';
    conflict.resolution = {
      choice: choice.mode, mergedText: mergedText, resolvedAt: observedAt === undefined ? null : observedAt,
      predecessors: conflict.candidates.map(function (candidate) { return candidate.key; })
    };
    next.revision += 1;
    return next;
  }

  function storeBeginRun(envelope, input) {
    var next = storeClone(envelope);
    var attemptId = 'run:' + storeHash([input.taskId, input.contentVersion, String(next.attempts.length)].join('\n'));
    next.attempts.push({
      id: attemptId, taskId: input.taskId, contentVersion: input.contentVersion, response: '',
      optionOrder: [], selectedOptions: [], role: 'first', revisionOf: null,
      conditions: { intended: input.intended || 'guided', helpDeclared: '' },
      modelExposure: [], submittedAt: null, reviewState: 'in-progress'
    });
    next.revision += 1;
    return { envelope: next, attemptId: attemptId };
  }

  function storeSubmitAttempt(envelope, input) {
    var attemptId = 'att:' + storeHash(
      [input.taskId, input.contentVersion, input.role || 'first', input.revisionOf || '-', input.response].join('\n')
    );
    var existing = null;
    for (var i = 0; i < envelope.attempts.length; i += 1) {
      if (envelope.attempts[i].id === attemptId) existing = envelope.attempts[i];
    }
    if (existing) return { envelope: envelope, attemptId: attemptId, duplicate: true };
    var next = storeClone(envelope);
    next.attempts.push({
      id: attemptId, taskId: input.taskId, contentVersion: input.contentVersion, response: input.response,
      optionOrder: input.optionOrder || [], selectedOptions: input.selectedOptions || [],
      role: input.role || 'first', revisionOf: input.revisionOf || null,
      conditions: { intended: input.intended || 'independent', helpDeclared: input.helpDeclared || '' },
      modelExposure: [], submittedAt: input.observedAt === undefined ? null : input.observedAt, reviewState: 'submitted'
    });
    next.revision += 1;
    return { envelope: next, attemptId: attemptId, duplicate: false };
  }

  function storeResetRun(envelope, attemptId) {
    var next = storeClone(envelope);
    var attempt = null;
    for (var i = 0; i < next.attempts.length; i += 1) {
      if (next.attempts[i].id === attemptId) attempt = next.attempts[i];
    }
    if (!attempt) throw new Error('attempt ' + attemptId + ' must exist');
    if (attempt.reviewState !== 'in-progress') throw new Error('reset targets unfinished runs only; submitted attempts are immutable');
    attempt.reviewState = 'reset';
    var record = next.records[attempt.taskId];
    if (record) {
      record.draft = '';
      record.revision += 1;
    }
    next.revision += 1;
    return next;
  }

  function storeCheckVersion(record, currentVersion) {
    return record.contentVersion === currentVersion ? 'current' : 'needs-review';
  }

  function storeExportSet(activity, progress, ui, observedAt) {
    return {
      format: 'ab30-export-v1', exportedAt: observedAt === undefined ? null : observedAt,
      activity: storeClone(activity), progress: storeClone(progress), ui: storeClone(ui)
    };
  }

  function storeValidateEnvelopeShape(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    if (value.schema !== 'ab30-store-v1' && value.schema !== 'ab30-store-v2') return false;
    if (typeof value.revision !== 'number') return false;
    if (!value.records || typeof value.records !== 'object' || Array.isArray(value.records)) return false;
    var ids = Object.keys(value.records);
    for (var i = 0; i < ids.length; i += 1) {
      var candidate = value.records[ids[i]];
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return false;
      if (typeof candidate.id !== 'string' || typeof candidate.draft !== 'string') return false;
      if (!Array.isArray(candidate.origins)) return false;
    }
    if (value.conflicts !== undefined && !Array.isArray(value.conflicts)) return false;
    if (value.attempts !== undefined && !Array.isArray(value.attempts)) return false;
    if (value.schema === 'ab30-store-v2') {
      var practice = value.practice;
      if (!practice || typeof practice !== 'object') return false;
      if (!practice.runs || typeof practice.runs !== 'object') return false;
      if (!practice.exposure || typeof practice.exposure !== 'object') return false;
      if (typeof practice.counter !== 'number') return false;
      if (value.migrationHistory !== undefined && !Array.isArray(value.migrationHistory)) return false;
      if (value.submissions !== undefined && !Array.isArray(value.submissions)) return false;
      if (value.taskExposure !== undefined && (typeof value.taskExposure !== 'object' || Array.isArray(value.taskExposure))) return false;
    }
    return true;
  }

  function storeImportSet(current, incoming) {
    var pack = incoming;
    if (!pack || pack.format !== 'ab30-export-v1' || !storeValidateEnvelopeShape(pack.activity)) {
      return { ok: false, envelope: current };
    }
    var next = storeClone(current);
    var backup = storeClone(current);
    var report = [];
    var incomingRecords = pack.activity.records || {};
    Object.keys(incomingRecords).forEach(function (id) {
      var record = incomingRecords[id];
      var mine = next.records[id];
      if (!mine) {
        next.records[id] = storeClone(record);
        report.push('added ' + id);
        return;
      }
      if (mine.draft === record.draft && mine.contentVersion === record.contentVersion) {
        var seen = {};
        mine.origins.forEach(function (origin) { seen[origin.key + '\n' + origin.value] = true; });
        (record.origins || []).forEach(function (origin) {
          if (!seen[origin.key + '\n' + origin.value]) mine.origins.push(storeClone(origin));
        });
        return;
      }
      var conflictId = 'conf:' + storeHash([id, mine.draft, record.draft, record.contentVersion].join('\n'));
      var exists = next.conflicts.some(function (item) { return item.id === conflictId; });
      if (!exists) {
        next.conflicts.push({
          id: conflictId, recordId: id,
          candidates: [
            { key: 'local:' + id, value: mine.draft },
            { key: 'import:' + id, value: record.draft }
          ],
          status: 'unresolved', resolution: null
        });
        report.push('conflict ' + id);
      }
    });
    (pack.activity.attempts || []).forEach(function (attempt) {
      var exists = next.attempts.some(function (item) { return item.id === attempt.id; });
      if (!exists) next.attempts.push(storeClone(attempt));
    });
    // R03: submissions merge by ID (deterministic by construction); a same-ID
    // difference means tampering or a fork — preserved as a conflict.
    if (!Array.isArray(next.submissions)) next.submissions = [];
    (pack.activity.submissions || []).forEach(function (incoming) {
      var mine = null;
      next.submissions.forEach(function (item) { if (item.id === incoming.id) mine = item; });
      if (!mine) {
        next.submissions.push(storeClone(incoming));
        report.push('added submission ' + incoming.id);
        return;
      }
      if (JSON.stringify(mine) === JSON.stringify(incoming)) return;
      var conflictId = 'conf:' + storeHash(['submission:' + incoming.id, JSON.stringify(mine), JSON.stringify(incoming)].join('\n'));
      var exists = next.conflicts.some(function (item) { return item.id === conflictId; });
      if (!exists) {
        next.conflicts.push({
          id: conflictId, recordId: mine.recordId || incoming.recordId || String(incoming.id),
          candidates: [
            { key: 'local-submission:' + incoming.id, value: JSON.stringify(mine) },
            { key: 'import-submission:' + incoming.id, value: JSON.stringify(incoming) }
          ],
          status: 'unresolved', resolution: null
        });
        report.push('conflict submission ' + incoming.id);
      }
    });
    if (!next.taskExposure || typeof next.taskExposure !== 'object') next.taskExposure = {};
    Object.keys((pack.activity && pack.activity.taskExposure) || {}).forEach(function (taskId) {
      var prior = next.taskExposure[taskId] || [];
      var merged = prior.slice();
      (pack.activity.taskExposure[taskId] || []).forEach(function (kind) {
        if (merged.indexOf(kind) === -1) merged.push(kind);
      });
      next.taskExposure[taskId] = merged;
    });
    // R02: merge the practice domain by ID+payload identity; same-ID
    // differences become preserved conflict candidates, never overwrites.
    if (!next.practice || typeof next.practice !== 'object') next.practice = storeEmptyPractice();
    var incomingPractice = (pack.activity && pack.activity.practice) || {};
    Object.keys(incomingPractice.runs || {}).forEach(function (id) {
      var mine = next.practice.runs[id];
      var theirs = incomingPractice.runs[id];
      if (!mine) {
        next.practice.runs[id] = storeClone(theirs);
        report.push('added run ' + id);
        return;
      }
      if (JSON.stringify(mine) === JSON.stringify(theirs)) return;
      var conflictId = 'conf:' + storeHash(['practice:' + id, JSON.stringify(mine), JSON.stringify(theirs)].join('\n'));
      var exists = next.conflicts.some(function (item) { return item.id === conflictId; });
      if (!exists) {
        next.conflicts.push({
          id: conflictId, recordId: 'practice:' + id,
          candidates: [
            { key: 'local-run:' + id, value: JSON.stringify(mine) },
            { key: 'import-run:' + id, value: JSON.stringify(theirs) }
          ],
          status: 'unresolved', resolution: null
        });
        report.push('conflict run ' + id);
      }
    });
    Object.keys(incomingPractice.exposure || {}).forEach(function (itemId) {
      var prior = next.practice.exposure[itemId] || [];
      var merged = prior.slice();
      (Array.isArray(incomingPractice.exposure[itemId]) ? incomingPractice.exposure[itemId] : [incomingPractice.exposure[itemId]]).forEach(function (entry) {
        if (merged.indexOf(entry) === -1) merged.push(entry);
      });
      next.practice.exposure[itemId] = merged;
    });
    if (typeof incomingPractice.counter === 'number' && incomingPractice.counter > next.practice.counter) {
      next.practice.counter = incomingPractice.counter;
    }
    (pack.activity.migrationHistory || []).forEach(function (entry) {
      var digest = JSON.stringify(entry);
      var seen = (next.migrationHistory || []).some(function (item) { return JSON.stringify(item) === digest; });
      if (!seen) {
        if (!Array.isArray(next.migrationHistory)) next.migrationHistory = [];
        next.migrationHistory.push(storeClone(entry));
      }
    });
    (pack.activity.conflicts || []).forEach(function (conflict) {
      var exists = next.conflicts.some(function (item) { return item.id === conflict.id; });
      if (!exists) next.conflicts.push(storeClone(conflict));
    });
    var incomingRaw = (pack.activity.legacy || {}).raw || {};
    Object.keys(incomingRaw).forEach(function (key) {
      if (!(key in next.legacy.raw)) next.legacy.raw[key] = storeClone(incomingRaw[key]);
      else if (JSON.stringify(next.legacy.raw[key]) !== JSON.stringify(incomingRaw[key])) report.push('kept-local-raw ' + key);
    });
    next.revision += 1;
    return { ok: true, envelope: next, backup: backup, report: report };
  }

  function storeMeasurePayload(activity, progress, ui) {
    var values = {};
    values[KEY_ACTIVITY] = JSON.stringify(activity);
    values[KEY_PROGRESS] = JSON.stringify(progress);
    values[KEY_UI] = JSON.stringify(ui);
    var wrapper = JSON.stringify({
      version: 1, projectSlug: 'aboriginal-studies-30-theme-2', savedAt: '2026-09-23T00:00:00.000Z',
      values: values, tracking: {}
    });
    var totalChars = wrapper.length + TRACKING_HEADROOM;
    var totalBytes = wrapper.length + TRACKING_HEADROOM;
    try {
      if (typeof TextEncoder !== 'undefined') totalBytes = new TextEncoder().encode(wrapper).length + TRACKING_HEADROOM;
    } catch (_error) { /* keep char estimate */ }
    return {
      activityChars: values[KEY_ACTIVITY].length,
      progressChars: values[KEY_PROGRESS].length,
      uiChars: values[KEY_UI].length,
      wrapperChars: wrapper.length,
      totalChars: totalChars, totalBytes: totalBytes,
      fitsSCORM2004: totalChars <= SCORM_2004_BUDGET,
      fitsSCORM12: totalChars <= SCORM_12_BUDGET,
      fitsLocalStorage: totalBytes <= 5 * 1024 * 1024,
      fitsFirestore: totalBytes <= 1024 * 1024
    };
  }

  function runtimeBudgetChars() {
    if (runtime.hostProfile === 'scorm-2004') return SCORM_2004_BUDGET;
    return Infinity;
  }

  function storeCommitRuntime(storage, envelopes, observedAt) {
    return storeCommitWithChecks(storage, envelopes, observedAt, runtimeBudgetChars());
  }

  function storeCommitWithChecks(storage, envelopes, observedAt, budgetChars) {
    var measure = storeMeasurePayload(envelopes.activity, envelopes.progress, envelopes.ui);
    var budget = (budgetChars === undefined || budgetChars === null) ? SCORM_2004_BUDGET : budgetChars;
    if (measure.totalChars > budget) return { ok: false, code: 'over-budget', wrote: [] };
    var pairs = [
      [KEY_ACTIVITY, envelopes.activity],
      [KEY_PROGRESS, envelopes.progress],
      [KEY_UI, envelopes.ui]
    ];
    var wrote = [];
    function writePhase(markComplete) {
      for (var i = 0; i < pairs.length; i += 1) {
        var key = pairs[i][0];
        var serializable = storeClone(pairs[i][1]);
        if (key === KEY_ACTIVITY && serializable && typeof serializable === 'object' && serializable.migration) {
          serializable.migration.complete = markComplete;
          serializable.migration.at = markComplete ? (observedAt === undefined ? null : observedAt) : null;
        }
        var text = JSON.stringify(serializable);
        try {
          storage.setItem(key, text);
        } catch (_error) {
          return { ok: false, code: 'write-failed', failedKey: key };
        }
        wrote.push(key);
        var readback = null;
        try {
          readback = storage.getItem(key);
        } catch (_error) {
          return { ok: false, code: 'readback-mismatch', failedKey: key };
        }
        if (readback !== text) return { ok: false, code: 'readback-mismatch', failedKey: key };
      }
      return { ok: true };
    }
    var phase1 = writePhase(false);
    if (!phase1.ok) return { ok: false, code: phase1.code, wrote: wrote, failedKey: phase1.failedKey };
    var phase2 = writePhase(true);
    if (!phase2.ok) {
      return {
        ok: false,
        code: phase2.code === 'readback-mismatch' ? 'readback-mismatch' : 'marker-commit-failed',
        wrote: wrote, failedKey: phase2.failedKey
      };
    }
    return { ok: true, wrote: wrote, markerCommitted: true, revision: envelopes.activity.revision };
  }

  function storeDeriveSaveStatus(outcome) {
    if (outcome.phase === 'editing') return 'Unsaved changes';
    if (outcome.phase === 'writing') return 'Saving…';
    if (outcome.phase === 'failed' && outcome.code === 'external-change') {
      return 'Stopped to protect work from another tab — export your work to keep both';
    }
    if (outcome.phase === 'failed') return 'Save failed — keep this page open and export your work';
    if (outcome.durableTarget === 'memory') return 'Kept for this session only';
    if (outcome.durableTarget === 'lms' && outcome.receipt) return 'Saved to Brightspace';
    return 'Saved in this browser';
  }

  function storeResolveViewKey(aliases, viewKey) {
    for (var i = 0; i < aliases.length; i += 1) {
      if (aliases[i].legacyKeys.indexOf(viewKey) !== -1) return 'assignment:' + aliases[i].assignmentId;
    }
    return viewKey;
  }

  // ---------------------------------------------------------------------------
  // Runtime adapter: single source of truth for learner response state.
  // main.js calls init() once at boot, then reads/writes through this object.
  // Modes: 'envelope' (migrated, full behavior) | 'passthrough' (flat-backed:
  // over-budget or failed migration; logical reads still unify, conflict
  // detection re-derives per load, resolutions dual-write) | 'memory'
  // (no durable storage at all; explicit failed status, never a saved claim).
  // ---------------------------------------------------------------------------

  var runtime = {
    mode: 'memory',
    envelope: null,
    flat: null,
    storage: null,
    progress: null,
    ui: null,
    lastOutcome: { phase: 'editing' },
    lastMeasure: null,
    recovery: null,
    externalDirty: {},
    pendingNav: null,
    pendingProgress: null,
    migrationReport: null,
    sessionExposure: {},
    hostProfile: 'browser-local'
  };

  function readRawKey(storage, key) {
    try {
      var value = storage.getItem(key);
      return { ok: true, raw: value === null || value === undefined ? null : String(value) };
    } catch (error) {
      return { ok: false, error: error };
    }
  }

  function openActivityState(storage) {
    var read = readRawKey(storage, KEY_ACTIVITY);
    if (!read.ok) return { kind: 'unreadable', error: read.error };
    if (read.raw === null || read.raw === '') {
      return { kind: 'flat', flat: {} };
    }
    var parsed = null;
    try {
      parsed = JSON.parse(read.raw);
    } catch (_error) {
      return { kind: 'corrupt', raw: read.raw };
    }
    if (parsed && (parsed.schema === 'ab30-store-v1' || parsed.schema === 'ab30-store-v2')) {
      if (!storeValidateEnvelopeShape(parsed)) return { kind: 'corrupt', raw: read.raw };
      return { kind: 'envelope', envelope: parsed };
    }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { kind: 'flat', flat: parsed };
    }
    return { kind: 'corrupt', raw: read.raw };
  }

  function readJsonKey(storage, key, fallback) {
    var read = readRawKey(storage, key);
    if (!read.ok || read.raw === null || read.raw === '') return storeClone(fallback);
    try {
      var parsed = JSON.parse(read.raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (_error) { /* fall through to fallback */ }
    return storeClone(fallback);
  }

  function unresolvedConflicts(envelope) {
    return envelope.conflicts.filter(function (item) { return item.status === 'unresolved'; });
  }

  // Passthrough conflict derivation: same flat input always yields the same
  // conflicts, so nothing needs persisting; resolutions dual-write instead.
  function derivePassthroughConflicts(flat) {
    var found = [];
    ASSIGNMENT_ALIASES.forEach(function (alias) {
      var present = alias.legacyKeys
        .filter(function (key) { return typeof flat[key] === 'string'; })
        .map(function (key) { return { key: key, value: flat[key] }; });
      var distinct = {};
      present.forEach(function (origin) {
        if (origin.value !== '') distinct[origin.value] = true;
      });
      if (Object.keys(distinct).length > 1) {
        var recordId = 'assignment:' + alias.assignmentId;
        var sorted = present.slice().sort(function (a, b) { return a.key < b.key ? -1 : 1; });
        found.push({
          id: 'conf:' + storeHash([recordId].concat(sorted.map(function (o) { return o.key + '\n' + o.value; })).join('\n')),
          recordId: recordId, candidates: sorted, status: 'unresolved', resolution: null
        });
      }
    });
    return found;
  }

  function passthroughRead(flat, viewKey) {
    var recordId = storeResolveViewKey(ASSIGNMENT_ALIASES, viewKey);
    if (recordId === viewKey) {
      return typeof flat[viewKey] === 'string' ? flat[viewKey] : '';
    }
    var assignmentId = recordId.slice('assignment:'.length);
    var alias = null;
    for (var i = 0; i < ASSIGNMENT_ALIASES.length; i += 1) {
      if (ASSIGNMENT_ALIASES[i].assignmentId === assignmentId) alias = ASSIGNMENT_ALIASES[i];
    }
    var values = (alias ? alias.legacyKeys : [])
      .filter(function (key) { return typeof flat[key] === 'string' && flat[key] !== ''; });
    if (values.length === 0) return '';
    var first = flat[values[0]];
    for (var j = 1; j < values.length; j += 1) {
      if (flat[values[j]] !== first) return '';
    }
    return first;
  }

  // R02: the store owns all three keys. main.js submits nav/progress
  // patches (saveNavigation/saveProgress); this still re-reads progress/ui
  // fresh before EVERY commit — never trust a snapshot, or a later activity
  // write would clobber newer derived data.
  function refreshProgressUi() {
    if (!runtime.storage) return;
    runtime.progress = readJsonKey(runtime.storage, KEY_PROGRESS, { completedUnits: [], completedAssignments: [] });
    runtime.ui = readJsonKey(runtime.storage, KEY_UI, {});
  }

  var AB30Store = {
    keys: { activity: KEY_ACTIVITY, progress: KEY_PROGRESS, ui: KEY_UI },
    aliases: ASSIGNMENT_ALIASES,

    init: function (options) {
      options = options || {};
      var storage = options.storage || null;
      if (!storage && typeof global.localStorage !== 'undefined' && global.localStorage) {
        try {
          var probe = '__ab30_probe__';
          global.localStorage.setItem(probe, '1');
          global.localStorage.removeItem(probe);
          storage = global.localStorage;
        } catch (_error) {
          storage = null;
        }
      }
      runtime.storage = storage;
      runtime.externalDirty = {};
      runtime.pendingNav = null;
      runtime.pendingProgress = null;
      runtime.migrationReport = null;
      runtime.sessionExposure = {};
      runtime.hostProfile = (options.hostProfile === 'scorm-2004') ? 'scorm-2004' : 'browser-local';
      if (!storage) {
        runtime.progress = { completedUnits: [], completedAssignments: [] };
        runtime.ui = {};
        runtime.mode = 'memory';
        runtime.envelope = storeEmptyEnvelope();
        runtime.flat = {};
        runtime.lastOutcome = { phase: 'failed', code: 'no-durable-storage' };
        return { ok: false, mode: 'memory', code: 'no-durable-storage' };
      }
      // R02 coordinator: exact raw strings in, phased activity-first commit.
      var activityRead = readRawKey(storage, KEY_ACTIVITY);
      var uiRead = readRawKey(storage, KEY_UI);
      var progressRead = readRawKey(storage, KEY_PROGRESS);
      if (!activityRead.ok) {
        runtime.progress = readJsonKey(storage, KEY_PROGRESS, { completedUnits: [], completedAssignments: [] });
        runtime.ui = readJsonKey(storage, KEY_UI, {});
        runtime.mode = 'memory';
        runtime.envelope = storeEmptyEnvelope();
        runtime.flat = {};
        runtime.recovery = null;
        runtime.lastOutcome = { phase: 'failed', code: 'unreadable' };
        return { ok: false, mode: 'memory', code: 'unreadable', recovery: runtime.recovery };
      }
      var migrated = storeMigrateToV2(activityRead.raw, uiRead.ok ? uiRead.raw : null, progressRead.ok ? progressRead.raw : null);
      if (!migrated.ok) {
        runtime.progress = readJsonKey(storage, KEY_PROGRESS, { completedUnits: [], completedAssignments: [] });
        runtime.ui = readJsonKey(storage, KEY_UI, {});
        runtime.mode = 'memory';
        runtime.envelope = storeEmptyEnvelope();
        runtime.flat = {};
        runtime.recovery = { raw: migrated.raw };
        runtime.lastOutcome = { phase: 'failed', code: 'corrupt' };
        return { ok: false, mode: 'memory', code: 'corrupt', recovery: runtime.recovery };
      }
      runtime.migrationReport = migrated.report;
      var envelope = migrated.envelope;
      var projectedUi = migrated.ui;
      var projectedProgress = (migrated.progress && Object.keys(migrated.progress).length)
        ? migrated.progress
        : { completedUnits: [], completedAssignments: [] };
      var measure = storeMeasurePayload(envelope, projectedProgress, projectedUi);
      runtime.lastMeasure = measure;
      if (measure.totalChars > runtimeBudgetChars()) {
        runtime.mode = 'passthrough';
        runtime.envelope = envelope;
        runtime.flat = storeFlattenForRollback(envelope).flat;
        runtime.progress = projectedProgress;
        runtime.ui = projectedUi;
        runtime.lastOutcome = { phase: 'failed', code: 'over-budget', measure: measure };
        return { ok: false, mode: 'passthrough', code: 'over-budget', measure: measure };
      }
      // Phase 1: activity durable first (progress/ui untouched on disk).
      var currentProgress = readJsonKey(storage, KEY_PROGRESS, projectedProgress);
      var currentUi = readJsonKey(storage, KEY_UI, projectedUi);
      var commitActivity = storeCommitRuntime(storage, { activity: envelope, progress: currentProgress, ui: currentUi }, null);
      if (!commitActivity.ok) {
        runtime.mode = 'passthrough';
        runtime.envelope = envelope;
        runtime.flat = storeFlattenForRollback(envelope).flat;
        runtime.progress = currentProgress;
        runtime.ui = currentUi;
        runtime.lastOutcome = { phase: 'failed', code: commitActivity.code };
        return { ok: false, mode: 'passthrough', code: commitActivity.code };
      }
      // Phase 2: project cleaned ui/progress. A crash before this replays
      // idempotently (storeMigrateToV2 merges by ID+payload identity).
      var commitProjected = storeCommitRuntime(storage, { activity: envelope, progress: projectedProgress, ui: projectedUi }, null);
      if (!commitProjected.ok) {
        runtime.mode = 'envelope';
        runtime.envelope = storeClone(envelope);
        runtime.envelope.migration.complete = true;
        runtime.flat = null;
        runtime.progress = currentProgress;
        runtime.ui = currentUi;
        runtime.lastOutcome = { phase: 'failed', code: commitProjected.code };
        return { ok: false, mode: 'envelope', code: commitProjected.code, projectionStale: true };
      }
      runtime.mode = 'envelope';
      runtime.envelope = storeClone(envelope);
      runtime.envelope.migration.complete = true;
      runtime.flat = null;
      runtime.progress = storeClone(projectedProgress);
      runtime.ui = storeClone(projectedUi);
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true, mode: 'envelope', revision: runtime.envelope.revision };
    },

    mode: function () { return runtime.mode; },

    status: function () {
      var conflicts = this.conflicts().length;
      var outcome = runtime.lastOutcome;
      var state = 'ready';
      if (outcome.phase === 'failed') state = outcome.code === 'over-budget' ? 'over-budget' : 'save-failed';
      else if (outcome.phase === 'editing') state = 'unsaved';
      else if (outcome.phase === 'writing') state = 'saving';
      else if (conflicts > 0) state = 'conflict';
      else state = 'saved';
      return {
        state: state,
        text: outcome.phase === 'failed' && outcome.code === 'over-budget'
          ? 'Too much work to save to Brightspace — export your work to keep it safe'
          : storeDeriveSaveStatus(outcome),
        conflicts: conflicts,
        revision: runtime.envelope ? runtime.envelope.revision : 0,
        mode: runtime.mode,
        heldNav: runtime.pendingNav !== null,
        heldProgress: runtime.pendingProgress !== null,
        externalDirtyKeys: Object.keys(runtime.externalDirty).filter(function (key) { return runtime.externalDirty[key]; }),
        host: {
          profile: runtime.hostProfile,
          budgetChars: runtime.hostProfile === 'scorm-2004' ? SCORM_2004_BUDGET : null,
          acknowledged: false,
          capacity: 'unknown'
        }
      };
    },

    conflicts: function () {
      if (runtime.mode === 'envelope' && runtime.envelope) return unresolvedConflicts(runtime.envelope);
      if (runtime.mode === 'passthrough' && runtime.flat) return derivePassthroughConflicts(runtime.flat);
      return [];
    },

    read: function (viewKey) {
      if (runtime.mode === 'envelope' && runtime.envelope) {
        var recordId = storeResolveViewKey(ASSIGNMENT_ALIASES, viewKey);
        var record = runtime.envelope.records[recordId];
        if (!record) return '';
        var conflicted = runtime.envelope.conflicts.some(function (item) {
          return item.recordId === recordId && item.status === 'unresolved';
        });
        return conflicted ? '' : record.draft;
      }
      if (runtime.mode === 'passthrough' && runtime.flat) return passthroughRead(runtime.flat, viewKey);
      if (runtime.mode === 'memory' && runtime.envelope) {
        var memId = storeResolveViewKey(ASSIGNMENT_ALIASES, viewKey);
        var mem = runtime.envelope.records[memId];
        return mem ? mem.draft : '';
      }
      return '';
    },

    scanPrefix: function (prefix) {
      var texts = [];
      if (runtime.mode === 'envelope' && runtime.envelope) {
        Object.keys(runtime.envelope.records).forEach(function (id) {
          if (id.indexOf(prefix) === 0) texts.push(runtime.envelope.records[id].draft);
        });
        return texts;
      }
      var flat = runtime.mode === 'passthrough' ? runtime.flat : null;
      if (flat) {
        Object.keys(flat).forEach(function (key) {
          if (key.indexOf(prefix) === 0 && typeof flat[key] === 'string') texts.push(flat[key]);
        });
      }
      return texts;
    },

    write: function (viewKey, text) {
      runtime.lastOutcome = { phase: 'writing' };
      if (runtime.mode === 'envelope' && runtime.envelope && runtime.storage) {
        var recordId = storeResolveViewKey(ASSIGNMENT_ALIASES, viewKey);
        var record = runtime.envelope.records[recordId];
        var attempted = storeWriteDraft(runtime.envelope, recordId, String(text), record ? record.revision : 0);
        if (!attempted.result.ok) {
          runtime.lastOutcome = { phase: 'failed', code: attempted.result.code };
          return { ok: false, code: attempted.result.code };
        }
        refreshProgressUi();
        var commit = storeCommitRuntime(
          runtime.storage,
          { activity: attempted.envelope, progress: runtime.progress, ui: runtime.ui },
          null
        );
        if (!commit.ok) {
          runtime.lastOutcome = { phase: 'failed', code: commit.code };
          return { ok: false, code: commit.code, candidate: String(text) };
        }
        runtime.envelope = storeClone(attempted.envelope);
        runtime.envelope.migration.complete = true;
        runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
        return { ok: true, revision: runtime.envelope.revision };
      }
      if (runtime.mode === 'passthrough' && runtime.flat && runtime.storage) {
        var recordId2 = storeResolveViewKey(ASSIGNMENT_ALIASES, viewKey);
        var targets = [viewKey];
        if (recordId2 !== viewKey) {
          var assignmentId = recordId2.slice('assignment:'.length);
          for (var i = 0; i < ASSIGNMENT_ALIASES.length; i += 1) {
            if (ASSIGNMENT_ALIASES[i].assignmentId === assignmentId) targets = ASSIGNMENT_ALIASES[i].legacyKeys.slice();
          }
        }
        targets.forEach(function (key) { runtime.flat[key] = String(text); });
        try {
          runtime.storage.setItem(KEY_ACTIVITY, JSON.stringify(runtime.flat));
        } catch (error) {
          runtime.lastOutcome = { phase: 'failed', code: 'write-failed' };
          return { ok: false, code: 'write-failed', candidate: String(text) };
        }
        var verify = readRawKey(runtime.storage, KEY_ACTIVITY);
        if (!verify.ok || verify.raw !== JSON.stringify(runtime.flat)) {
          runtime.lastOutcome = { phase: 'failed', code: 'readback-mismatch' };
          return { ok: false, code: 'readback-mismatch', candidate: String(text) };
        }
        runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
        return { ok: true, revision: runtime.envelope ? runtime.envelope.revision : 0 };
      }
      if (runtime.mode === 'memory' && runtime.envelope) {
        var memId = storeResolveViewKey(ASSIGNMENT_ALIASES, viewKey);
        var mem = runtime.envelope.records[memId];
        var memAttempted = storeWriteDraft(runtime.envelope, memId, String(text), mem ? mem.revision : 0);
        if (memAttempted.result.ok) runtime.envelope = memAttempted.envelope;
      }
      runtime.lastOutcome = { phase: 'failed', code: 'no-durable-storage' };
      return { ok: false, code: 'no-durable-storage', candidate: String(text) };
    },

    // ---- R03 first-submission + revision lifecycle (spec S-03/S-04).
    // Drafts stay editable; submissions are immutable, idempotent per
    // commandId, and committed before any criteria exposure they unlock.
    writeDraft: function (task, text, expectedRevision) {
      runtime.lastOutcome = { phase: 'writing' };
      var valid = storeValidateTask(task);
      if (!valid.ok) {
        runtime.lastOutcome = { phase: 'failed', code: valid.code };
        return { ok: false, code: valid.code };
      }
      if (runtime.mode !== 'envelope' || !runtime.envelope || !runtime.storage) {
        return this.write(task.id, text);
      }
      var recordId = storeResolveViewKey(ASSIGNMENT_ALIASES, task.id);
      var record = runtime.envelope.records[recordId];
      if (record && expectedRevision !== undefined && expectedRevision !== null
        && record.revision !== expectedRevision) {
        runtime.lastOutcome = { phase: 'failed', code: 'stale-revision' };
        return { ok: false, code: 'stale-revision', candidate: String(text) };
      }
      var attempted = storeWriteDraft(runtime.envelope, recordId, String(text), record ? record.revision : 0);
      if (!attempted.result.ok) {
        runtime.lastOutcome = { phase: 'failed', code: attempted.result.code };
        return { ok: false, code: attempted.result.code };
      }
      attempted.envelope.records[recordId].contentVersion = task.contentVersion;
      refreshProgressUi();
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: attempted.envelope, progress: runtime.progress, ui: runtime.ui },
        null
      );
      if (!commit.ok) {
        runtime.lastOutcome = { phase: 'failed', code: commit.code };
        return { ok: false, code: commit.code, candidate: String(text) };
      }
      runtime.envelope = storeClone(attempted.envelope);
      runtime.envelope.migration.complete = true;
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true, revision: runtime.envelope.revision, recordId: recordId };
    },

    submitFirstResponse: function (task, commandId, text) {
      runtime.lastOutcome = { phase: 'writing' };
      var valid = storeValidateTask(task);
      if (!valid.ok || typeof commandId !== 'string' || !commandId) {
        runtime.lastOutcome = { phase: 'failed', code: 'invalid-submission' };
        return { ok: false, code: 'invalid-submission' };
      }
      if (runtime.mode !== 'envelope' || !runtime.envelope || !runtime.storage) {
        runtime.lastOutcome = { phase: 'failed', code: runtime.storage ? 'over-budget' : 'no-durable-storage' };
        return { ok: false, code: runtime.storage ? 'over-budget' : 'no-durable-storage', candidate: String(text) };
      }
      var id = 'sub:' + storeHash([task.id, commandId, String(text)].join('\n'));
      var submissions = runtime.envelope.submissions;
      var same = null;
      var first = null;
      submissions.forEach(function (item) {
        if (item.id === id) same = item;
        if (item.task && item.task.id === task.id && !item.parentAttemptId) first = item;
      });
      if (same) {
        runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
        return { ok: true, submission: storeClone(same), duplicate: true };
      }
      if (first) {
        runtime.lastOutcome = { phase: 'failed', code: 'already-submitted' };
        return { ok: false, code: 'already-submitted', submission: storeClone(first) };
      }
      var recordId = storeResolveViewKey(ASSIGNMENT_ALIASES, task.id);
      var record = runtime.envelope.records[recordId];
      if (!record) {
        record = {
          id: recordId, kind: 'independent', draft: '', revision: 0,
          contentVersion: task.contentVersion, origins: [{ key: recordId, value: '' }],
          submissionIds: []
        };
        runtime.envelope.records[recordId] = record;
      }
      if (!Array.isArray(record.submissionIds)) record.submissionIds = [];
      var sessionHeld = (runtime.sessionExposure[task.id] || []).length > 0;
      var committed = (runtime.envelope.taskExposure[task.id] || []).slice();
      var submission = {
        id: id,
        commandId: commandId,
        task: { id: task.id, contentVersion: task.contentVersion, sourceIds: task.sourceIds || [], stimulusId: task.stimulusId || '' },
        recordId: recordId,
        text: String(text),
        parentAttemptId: null,
        evidenceKind: sessionHeld ? 'unknown' : (committed.length ? 'review' : 'first-before-comparison'),
        exposureIds: committed,
        observedAt: new Date().toISOString()
      };
      submissions.push(submission);
      record.submissionIds.push(id);
      runtime.envelope.revision += 1;
      refreshProgressUi();
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: runtime.envelope, progress: runtime.progress, ui: runtime.ui },
        null
      );
      if (!commit.ok) {
        submissions.pop();
        record.submissionIds.pop();
        runtime.envelope.revision -= 1;
        runtime.lastOutcome = { phase: 'failed', code: commit.code };
        return { ok: false, code: commit.code, candidate: String(text) };
      }
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true, submission: storeClone(submission) };
    },

    submitRevision: function (task, commandId, parentAttemptId, text) {
      runtime.lastOutcome = { phase: 'writing' };
      var valid = storeValidateTask(task);
      if (!valid.ok || typeof commandId !== 'string' || !commandId
        || typeof parentAttemptId !== 'string' || !parentAttemptId) {
        runtime.lastOutcome = { phase: 'failed', code: 'invalid-submission' };
        return { ok: false, code: 'invalid-submission' };
      }
      if (runtime.mode !== 'envelope' || !runtime.envelope || !runtime.storage) {
        runtime.lastOutcome = { phase: 'failed', code: runtime.storage ? 'over-budget' : 'no-durable-storage' };
        return { ok: false, code: runtime.storage ? 'over-budget' : 'no-durable-storage', candidate: String(text) };
      }
      var id = 'sub:' + storeHash([task.id, commandId, parentAttemptId, String(text)].join('\n'));
      var submissions = runtime.envelope.submissions;
      var same = null;
      var parent = null;
      submissions.forEach(function (item) {
        if (item.id === id) same = item;
        if (item.id === parentAttemptId) parent = item;
      });
      if (same) {
        runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
        return { ok: true, submission: storeClone(same), duplicate: true };
      }
      if (!parent) {
        runtime.lastOutcome = { phase: 'failed', code: 'unknown-parent' };
        return { ok: false, code: 'unknown-parent', candidate: String(text) };
      }
      if (!parent.task || parent.task.id !== task.id) {
        runtime.lastOutcome = { phase: 'failed', code: 'parent-mismatch' };
        return { ok: false, code: 'parent-mismatch', candidate: String(text) };
      }
      var recordId = storeResolveViewKey(ASSIGNMENT_ALIASES, task.id);
      var record = runtime.envelope.records[recordId];
      if (!record) {
        record = {
          id: recordId, kind: 'independent', draft: '', revision: 0,
          contentVersion: task.contentVersion, origins: [{ key: recordId, value: '' }],
          submissionIds: []
        };
        runtime.envelope.records[recordId] = record;
      }
      if (!Array.isArray(record.submissionIds)) record.submissionIds = [];
      var sessionHeld = (runtime.sessionExposure[task.id] || []).length > 0;
      var committed = (runtime.envelope.taskExposure[task.id] || []).slice();
      var submission = {
        id: id,
        commandId: commandId,
        task: { id: task.id, contentVersion: task.contentVersion, sourceIds: task.sourceIds || [], stimulusId: task.stimulusId || '' },
        recordId: recordId,
        text: String(text),
        parentAttemptId: parentAttemptId,
        evidenceKind: sessionHeld ? 'unknown' : (committed.length ? 'review' : 'first-before-comparison'),
        exposureIds: committed,
        observedAt: new Date().toISOString()
      };
      submissions.push(submission);
      record.submissionIds.push(id);
      runtime.envelope.revision += 1;
      refreshProgressUi();
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: runtime.envelope, progress: runtime.progress, ui: runtime.ui },
        null
      );
      if (!commit.ok) {
        submissions.pop();
        record.submissionIds.pop();
        runtime.envelope.revision -= 1;
        runtime.lastOutcome = { phase: 'failed', code: commit.code };
        return { ok: false, code: commit.code, candidate: String(text) };
      }
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true, submission: storeClone(submission) };
    },

    recordExposure: function (task, kind) {
      runtime.lastOutcome = { phase: 'writing' };
      var valid = storeValidateTask(task);
      if (!valid.ok || typeof kind !== 'string' || !kind) {
        runtime.lastOutcome = { phase: 'failed', code: 'invalid-submission' };
        return { ok: false, code: 'invalid-submission' };
      }
      if (runtime.mode !== 'envelope' || !runtime.envelope || !runtime.storage) {
        if (!runtime.sessionExposure[task.id]) runtime.sessionExposure[task.id] = [];
        if (runtime.sessionExposure[task.id].indexOf(kind) === -1) runtime.sessionExposure[task.id].push(kind);
        runtime.lastOutcome = { phase: 'failed', code: runtime.storage ? 'over-budget' : 'no-durable-storage' };
        return { ok: false, code: runtime.storage ? 'over-budget' : 'no-durable-storage', sessionHeld: true };
      }
      if (!runtime.envelope.taskExposure[task.id]) runtime.envelope.taskExposure[task.id] = [];
      var kinds = runtime.envelope.taskExposure[task.id];
      if (kinds.indexOf(kind) === -1) kinds.push(kind);
      runtime.envelope.revision += 1;
      refreshProgressUi();
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: runtime.envelope, progress: runtime.progress, ui: runtime.ui },
        null
      );
      if (!commit.ok) {
        kinds.pop();
        runtime.envelope.revision -= 1;
        if (!runtime.sessionExposure[task.id]) runtime.sessionExposure[task.id] = [];
        if (runtime.sessionExposure[task.id].indexOf(kind) === -1) runtime.sessionExposure[task.id].push(kind);
        runtime.lastOutcome = { phase: 'failed', code: commit.code };
        return { ok: false, code: commit.code, sessionHeld: true };
      }
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true };
    },

    submissionsForTask: function (taskId) {
      if (!runtime.envelope || !Array.isArray(runtime.envelope.submissions)) return [];
      return runtime.envelope.submissions
        .filter(function (item) { return item.task && item.task.id === taskId; })
        .map(storeClone);
    },

    resolveConflict: function (conflictId, mode, mergedText) {
      if (runtime.mode === 'envelope' && runtime.envelope && runtime.storage) {
        var next = storeResolveConflict(runtime.envelope, conflictId, { mode: mode, mergedText: mergedText }, null);
        refreshProgressUi();
        var commit = storeCommitRuntime(
          runtime.storage,
          { activity: next, progress: runtime.progress, ui: runtime.ui },
          null
        );
        if (!commit.ok) {
          runtime.lastOutcome = { phase: 'failed', code: commit.code };
          return { ok: false, code: commit.code };
        }
        runtime.envelope = storeClone(next);
        runtime.envelope.migration.complete = true;
        runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
        return { ok: true };
      }
      if (runtime.mode === 'passthrough' && runtime.flat && runtime.storage) {
        var conflicts = derivePassthroughConflicts(runtime.flat);
        var found = null;
        for (var i = 0; i < conflicts.length; i += 1) {
          if (conflicts[i].id === conflictId) found = conflicts[i];
        }
        if (!found) return { ok: false, code: 'unknown-conflict' };
        var ordered = found.candidates.slice().sort(function (a, b) { return a.key < b.key ? -1 : 1; });
        var resolved = mode === 'keep-first' ? ordered[0].value
          : mode === 'keep-second' ? ordered[ordered.length - 1].value
          : mergedText;
        var keys = [];
        for (var k = 0; k < ASSIGNMENT_ALIASES.length; k += 1) {
          if ('assignment:' + ASSIGNMENT_ALIASES[k].assignmentId === found.recordId) keys = ASSIGNMENT_ALIASES[k].legacyKeys;
        }
        keys.forEach(function (key) { runtime.flat[key] = String(resolved); });
        try {
          runtime.storage.setItem(KEY_ACTIVITY, JSON.stringify(runtime.flat));
        } catch (_error) {
          runtime.lastOutcome = { phase: 'failed', code: 'write-failed' };
          return { ok: false, code: 'write-failed' };
        }
        runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
        return { ok: true };
      }
      return { ok: false, code: 'no-durable-storage' };
    },

    // ---- T09 practice runtime (R02: sessions + exposure live in the
    // activity envelope practice domain, committed atomically with attempts).
    // Attempts require durable envelope storage: without it (or over budget)
    // every write fails with the input preserved as draft — feedback must
    // never show for an unsaved attempt (PRACT03).
    practiceRunStore: function () {
      if (!runtime.envelope || typeof runtime.envelope !== 'object') return storeEmptyPractice();
      if (!runtime.envelope.practice || typeof runtime.envelope.practice !== 'object') {
        runtime.envelope.practice = storeEmptyPractice();
      }
      var practice = runtime.envelope.practice;
      if (!practice.runs || typeof practice.runs !== 'object') practice.runs = {};
      if (!practice.exposure || typeof practice.exposure !== 'object') practice.exposure = {};
      if (typeof practice.counter !== 'number') practice.counter = 0;
      return practice;
    },

    startPracticeRun: function (spec) {
      runtime.lastOutcome = { phase: 'writing' };
      if (!runtime.storage) {
        runtime.lastOutcome = { phase: 'failed', code: 'no-durable-storage' };
        return { ok: false, code: 'no-durable-storage' };
      }
      if (runtime.mode !== 'envelope' || !runtime.envelope) {
        runtime.lastOutcome = { phase: 'failed', code: 'over-budget' };
        return { ok: false, code: 'over-budget' };
      }
      refreshProgressUi();
      var practice = this.practiceRunStore();
      practice.counter += 1;
      var run = {
        id: 'run:' + practice.counter,
        mode: spec.mode,
        attemptMode: spec.attemptMode || 'independent',
        itemIds: spec.itemIds || [],
        seed: spec.seed === undefined ? null : spec.seed,
        stimuli: spec.stimuli || [],
        versions: spec.versions || [],
        optionOrders: spec.optionOrders || [],
        attemptIds: {},
        status: 'in-progress'
      };
      practice.runs[run.id] = run;
      var priorRevision = runtime.envelope.revision;
      runtime.envelope.revision += 1;
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: runtime.envelope, progress: runtime.progress, ui: runtime.ui },
        null
      );
      if (!commit.ok) {
        delete practice.runs[run.id];
        runtime.envelope.revision = priorRevision;
        runtime.lastOutcome = { phase: 'failed', code: commit.code };
        return { ok: false, code: commit.code };
      }
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true, run: storeClone(run) };
    },

    getPracticeRun: function (runId) {
      var practice = this.practiceRunStore();
      return practice.runs[runId] ? storeClone(practice.runs[runId]) : null;
    },

    listPracticeRuns: function () {
      var practice = this.practiceRunStore();
      return {
        runs: Object.keys(practice.runs).map(function (id) { return storeClone(practice.runs[id]); }),
        exposed: storeClone(practice.exposure),
        counter: practice.counter
      };
    },

    getPracticeExposure: function () {
      return storeClone(this.practiceRunStore().exposure);
    },

    getPracticeAttempt: function (attemptId) {
      if (!runtime.envelope || !Array.isArray(runtime.envelope.attempts)) return null;
      for (var i = 0; i < runtime.envelope.attempts.length; i += 1) {
        if (runtime.envelope.attempts[i].id === attemptId) return storeClone(runtime.envelope.attempts[i]);
      }
      return null;
    },

    submitPracticeAttempt: function (runId, input) {
      runtime.lastOutcome = { phase: 'writing' };
      if (!runtime.storage) {
        runtime.lastOutcome = { phase: 'failed', code: 'no-durable-storage' };
        return { ok: false, code: 'no-durable-storage', draft: input };
      }
      if (runtime.mode !== 'envelope' || !runtime.envelope) {
        runtime.lastOutcome = { phase: 'failed', code: 'over-budget' };
        return { ok: false, code: 'over-budget', draft: input };
      }
      refreshProgressUi();
      var practice = this.practiceRunStore();
      var run = practice.runs[runId];
      if (!run) {
        runtime.lastOutcome = { phase: 'failed', code: 'unknown-run' };
        return { ok: false, code: 'unknown-run', draft: input };
      }
      var submitted = storeSubmitAttempt(runtime.envelope, input);
      var prior = run.attemptIds[input.taskId] || [];
      if (submitted.duplicate && prior.indexOf(submitted.attemptId) !== -1) {
        return { ok: true, attemptId: submitted.attemptId, duplicate: true };
      }
      var next = prior.slice();
      if (next.indexOf(submitted.attemptId) === -1) next.push(submitted.attemptId);
      // The attempt and the run link commit atomically in ONE envelope.
      submitted.envelope.practice.runs[runId].attemptIds[input.taskId] = next;
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: submitted.envelope, progress: runtime.progress, ui: runtime.ui },
        null
      );
      if (!commit.ok) {
        runtime.lastOutcome = { phase: 'failed', code: commit.code };
        if (submitted.duplicate) return { ok: true, attemptId: submitted.attemptId, duplicate: true, linkOk: false };
        return { ok: false, code: commit.code, draft: input };
      }
      runtime.envelope = storeClone(submitted.envelope);
      runtime.envelope.migration.complete = true;
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true, attemptId: submitted.attemptId, duplicate: submitted.duplicate };
    },

    markPracticeExposed: function (itemId, exposureId) {
      runtime.lastOutcome = { phase: 'writing' };
      if (!runtime.storage) {
        runtime.lastOutcome = { phase: 'failed', code: 'no-durable-storage' };
        return { ok: false, code: 'no-durable-storage' };
      }
      if (runtime.mode !== 'envelope' || !runtime.envelope) {
        runtime.lastOutcome = { phase: 'failed', code: 'over-budget' };
        return { ok: false, code: 'over-budget' };
      }
      refreshProgressUi();
      var practice = this.practiceRunStore();
      var prior = practice.exposure[itemId] || [];
      var next = prior.slice();
      if (next.indexOf(exposureId) === -1) next.push(exposureId);
      practice.exposure[itemId] = next;
      var priorRevision = runtime.envelope.revision;
      runtime.envelope.revision += 1;
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: runtime.envelope, progress: runtime.progress, ui: runtime.ui },
        null
      );
      if (!commit.ok) {
        practice.exposure[itemId] = prior;
        runtime.envelope.revision = priorRevision;
        runtime.lastOutcome = { phase: 'failed', code: commit.code };
        return { ok: false, code: commit.code };
      }
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true };
    },

    finishPracticeRun: function (runId, status) {
      var done = status === 'abandoned' ? 'abandoned' : 'complete';
      if (!runtime.storage) return { ok: false, code: 'no-durable-storage' };
      if (runtime.mode !== 'envelope' || !runtime.envelope) return { ok: false, code: 'over-budget' };
      refreshProgressUi();
      var practice = this.practiceRunStore();
      var run = practice.runs[runId];
      if (!run) return { ok: false, code: 'unknown-run' };
      var priorStatus = run.status;
      run.status = done;
      var priorRevision = runtime.envelope.revision;
      runtime.envelope.revision += 1;
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: runtime.envelope, progress: runtime.progress, ui: runtime.ui },
        null
      );
      if (!commit.ok) {
        run.status = priorStatus;
        runtime.envelope.revision = priorRevision;
        return { ok: false, code: commit.code };
      }
      return { ok: true, status: done };
    },

    exportWork: function () {
      var activity = runtime.envelope && runtime.mode === 'envelope'
        ? runtime.envelope
        : storeMigrateFlatToV1(runtime.flat || {}, ASSIGNMENT_ALIASES, LEGACY_NOVEL_VERSIONS).envelope;
      var pack = storeExportSet(activity, runtime.progress, runtime.ui, null);
      pack.coordinator = {
        pendingNav: storeClone(runtime.pendingNav),
        pendingProgress: storeClone(runtime.pendingProgress),
        externalDirtyKeys: Object.keys(runtime.externalDirty).filter(function (key) { return runtime.externalDirty[key]; }),
        migrationReport: storeClone(runtime.migrationReport)
      };
      return pack;
    },

    exportAllWork: function () {
      return this.exportWork();
    },

    importAllWork: function (pack) {
      return this.importWork(pack);
    },

    importWork: function (pack) {
      if (!runtime.envelope) return { ok: false, code: 'not-initialized' };
      var result = storeImportSet(runtime.envelope, pack);
      if (!result.ok) return { ok: false, code: 'invalid-import' };
      if (runtime.mode === 'envelope' && runtime.storage) {
        refreshProgressUi();
        var commit = storeCommitRuntime(
          runtime.storage,
          { activity: result.envelope, progress: runtime.progress, ui: runtime.ui },
          null
        );
        if (!commit.ok) {
          runtime.lastOutcome = { phase: 'failed', code: commit.code };
          return { ok: false, code: commit.code };
        }
        runtime.envelope = storeClone(result.envelope);
        runtime.envelope.migration.complete = true;
      } else if (runtime.mode === 'passthrough' && runtime.flat && runtime.storage) {
        var flattened = storeFlattenForRollback(result.envelope);
        runtime.flat = flattened.flat;
        try {
          runtime.storage.setItem(KEY_ACTIVITY, JSON.stringify(runtime.flat));
        } catch (_error) {
          runtime.lastOutcome = { phase: 'failed', code: 'write-failed' };
          return { ok: false, code: 'write-failed' };
        }
        runtime.envelope = result.envelope;
      } else {
        runtime.envelope = result.envelope;
      }
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true, report: result.report, backup: result.backup };
    },

    flush: function () {
      if (!runtime.storage) {
        runtime.lastOutcome = { phase: 'failed', code: 'no-durable-storage' };
        return { ok: false, code: 'no-durable-storage' };
      }
      if (runtime.mode === 'envelope' && runtime.envelope) {
        refreshProgressUi();
        var commit = storeCommitRuntime(
          runtime.storage,
          { activity: runtime.envelope, progress: runtime.progress, ui: runtime.ui },
          null
        );
        if (!commit.ok) {
          runtime.lastOutcome = { phase: 'failed', code: commit.code };
          return { ok: false, code: commit.code };
        }
        runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
        return { ok: true };
      }
      if (runtime.mode === 'passthrough' && runtime.flat) {
        try {
          runtime.storage.setItem(KEY_ACTIVITY, JSON.stringify(runtime.flat));
        } catch (_error) {
          runtime.lastOutcome = { phase: 'failed', code: 'write-failed' };
          return { ok: false, code: 'write-failed' };
        }
        runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
        return { ok: true };
      }
      return { ok: true };
    },

    // R02 coordinated writers: the ONLY path that serializes tracked keys.
    // Read-modify-write over the CURRENT stored value; unknown/legacy props
    // preserved; a __rev counter versions each key for digest checks.
    saveNavigation: function (patch) {
      runtime.lastOutcome = { phase: 'writing' };
      if (!runtime.storage) {
        runtime.ui = Object.assign({}, runtime.ui, storeClone(patch || {}));
        runtime.lastOutcome = { phase: 'failed', code: 'no-durable-storage' };
        return { ok: false, target: 'browser', code: 'no-durable-storage', confirmedRevision: null, hostAcknowledged: false, pendingTargets: [] };
      }
      if (runtime.mode !== 'envelope' || !runtime.envelope) {
        runtime.ui = Object.assign({}, runtime.ui, storeClone(patch || {}));
        runtime.lastOutcome = { phase: 'done', durableTarget: 'memory', receipt: null };
        return { ok: true, target: 'browser', code: 'held-memory', confirmedRevision: null, hostAcknowledged: false, pendingTargets: [] };
      }
      if (runtime.externalDirty[KEY_UI]) {
        runtime.pendingNav = Object.assign({}, runtime.pendingNav, storeClone(patch || {}));
        runtime.lastOutcome = { phase: 'failed', code: 'external-change' };
        return { ok: false, target: 'browser', code: 'external-change', held: true, confirmedRevision: null, hostAcknowledged: false, pendingTargets: [] };
      }
      var current = readJsonKey(runtime.storage, KEY_UI, {});
      var next = storeClone(current);
      Object.keys(patch || {}).forEach(function (key) { next[key] = storeClone(patch[key]); });
      next.__rev = (typeof current.__rev === 'number' ? current.__rev : 0) + 1;
      refreshProgressUi();
      runtime.ui = next;
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: runtime.envelope, progress: runtime.progress, ui: next },
        null
      );
      if (!commit.ok) {
        runtime.lastOutcome = { phase: 'failed', code: commit.code };
        return { ok: false, target: 'browser', code: commit.code, confirmedRevision: null, hostAcknowledged: false, pendingTargets: [] };
      }
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true, target: 'browser', code: 'saved', confirmedRevision: next.__rev, hostAcknowledged: false, pendingTargets: [] };
    },

    saveProgress: function (patch) {
      runtime.lastOutcome = { phase: 'writing' };
      if (!runtime.storage) {
        runtime.progress = Object.assign({}, runtime.progress, storeClone(patch || {}));
        runtime.lastOutcome = { phase: 'failed', code: 'no-durable-storage' };
        return { ok: false, target: 'browser', code: 'no-durable-storage', confirmedRevision: null, hostAcknowledged: false, pendingTargets: [] };
      }
      if (runtime.mode !== 'envelope' || !runtime.envelope) {
        runtime.progress = Object.assign({}, runtime.progress, storeClone(patch || {}));
        runtime.lastOutcome = { phase: 'done', durableTarget: 'memory', receipt: null };
        return { ok: true, target: 'browser', code: 'held-memory', confirmedRevision: null, hostAcknowledged: false, pendingTargets: [] };
      }
      if (runtime.externalDirty[KEY_PROGRESS]) {
        runtime.pendingProgress = Object.assign({}, runtime.pendingProgress, storeClone(patch || {}));
        runtime.lastOutcome = { phase: 'failed', code: 'external-change' };
        return { ok: false, target: 'browser', code: 'external-change', held: true, confirmedRevision: null, hostAcknowledged: false, pendingTargets: [] };
      }
      var current = readJsonKey(runtime.storage, KEY_PROGRESS, {});
      var next = storeClone(current);
      Object.keys(patch || {}).forEach(function (key) { next[key] = storeClone(patch[key]); });
      next.__rev = (typeof current.__rev === 'number' ? current.__rev : 0) + 1;
      refreshProgressUi();
      runtime.progress = next;
      var commit = storeCommitRuntime(
        runtime.storage,
        { activity: runtime.envelope, progress: next, ui: runtime.ui },
        null
      );
      if (!commit.ok) {
        runtime.lastOutcome = { phase: 'failed', code: commit.code };
        return { ok: false, target: 'browser', code: commit.code, confirmedRevision: null, hostAcknowledged: false, pendingTargets: [] };
      }
      runtime.lastOutcome = { phase: 'done', durableTarget: 'browser', receipt: null };
      return { ok: true, target: 'browser', code: 'saved', confirmedRevision: next.__rev, hostAcknowledged: false, pendingTargets: [] };
    },

    // Cross-tab minimum (spec S-05): main.js forwards storage events here.
    // A flagged key stops automatic overwrites; the local patch is held in
    // memory and stays exportable. No lock is claimed: a read/check/write is
    // not a cross-process compare-and-swap. Lead owns any lock upgrade.
    noteExternalChange: function (key) {
      if (key === KEY_ACTIVITY || key === KEY_PROGRESS || key === KEY_UI) {
        runtime.externalDirty[key] = true;
        if (runtime.lastOutcome && runtime.lastOutcome.phase !== 'failed') {
          runtime.lastOutcome = { phase: 'failed', code: 'external-change' };
        }
        return true;
      }
      return false;
    },

    pendingHeld: function () {
      return {
        nav: storeClone(runtime.pendingNav),
        progress: storeClone(runtime.pendingProgress),
        externalDirtyKeys: Object.keys(runtime.externalDirty).filter(function (key) { return runtime.externalDirty[key]; })
      };
    },

    migrationReport: function () {
      return storeClone(runtime.migrationReport);
    },

    flatView: function () {
      if (runtime.mode === 'envelope' && runtime.envelope) return storeFlattenForRollback(runtime.envelope).flat;
      if (runtime.flat) return storeClone(runtime.flat);
      return {};
    },

    measure: function () {
      var activity = runtime.mode === 'envelope' && runtime.envelope
        ? runtime.envelope
        : storeMigrateFlatToV1(runtime.flat || {}, ASSIGNMENT_ALIASES, LEGACY_NOVEL_VERSIONS).envelope;
      return storeMeasurePayload(activity, runtime.progress, runtime.ui);
    }
  };

  // T01 seam names: logical view reads/writes with legacy-safe fallbacks when
  // the adapter cannot serve (kept narrow; main.js prefers AB30Store).
  function readLogicalResponse(viewKey) {
    try {
      return AB30Store.read(String(viewKey));
    } catch (_error) {
      return '';
    }
  }

  function writeLogicalResponse(viewKey, value) {
    return AB30Store.write(String(viewKey), String(value));
  }

  global.AB30Store = AB30Store;
  global.readLogicalResponse = readLogicalResponse;
  global.writeLogicalResponse = writeLogicalResponse;
  global.AB30LearningStoreInternals = {
    storeClone: storeClone,
    storeHash: storeHash,
    storeEmptyEnvelope: storeEmptyEnvelope,
    storeEmptyPractice: storeEmptyPractice,
    storeMigrateFlatToV1: storeMigrateFlatToV1,
    storeMigrateToV2: storeMigrateToV2,
    storeFlattenForRollback: storeFlattenForRollback,
    storeReadDraft: storeReadDraft,
    storeWriteDraft: storeWriteDraft,
    storeResolveConflict: storeResolveConflict,
    storeBeginRun: storeBeginRun,
    storeSubmitAttempt: storeSubmitAttempt,
    storeResetRun: storeResetRun,
    storeCheckVersion: storeCheckVersion,
    storeExportSet: storeExportSet,
    storeValidateEnvelopeShape: storeValidateEnvelopeShape,
    storeImportSet: storeImportSet,
    storeMeasurePayload: storeMeasurePayload,
    storeCommitWithChecks: storeCommitWithChecks,
    storeDeriveSaveStatus: storeDeriveSaveStatus,
    storeResolveViewKey: storeResolveViewKey
  };
})(typeof window !== 'undefined' ? window : globalThis);
