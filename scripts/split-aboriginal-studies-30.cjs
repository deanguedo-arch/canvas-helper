#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const sourceSlug = 'aboriginal-studies-30';
const sourceWorkspace = path.join(repoRoot, 'projects', sourceSlug, 'workspace');
const sourceDataPath = path.join(sourceWorkspace, 'course-data.js');
const force = process.argv.includes('--force');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function write(file, contents) {
  mkdirFor(file);
  fs.writeFileSync(file, contents);
}

function copy(relativePath, destinationWorkspace) {
  const clean = relativePath.replace(/^\.\//, '');
  const source = path.join(sourceWorkspace, clean);
  const destination = path.join(destinationWorkspace, clean);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
    throw new Error(`Missing referenced source file: ${clean}`);
  }
  mkdirFor(destination);
  fs.copyFileSync(source, destination);
}

function collectAssetPaths(value, output = new Set()) {
  if (typeof value === 'string') {
    const matches = value.match(/\.\/assets\/[A-Za-z0-9_@%+.,()' -]+(?:\/[A-Za-z0-9_@%+.,()' -]+)*/g) || [];
    matches.forEach((item) => output.add(item.replace(/[),.;:]+$/, '')));
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectAssetPaths(item, output));
    return output;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectAssetPaths(item, output));
  }
  return output;
}

function loadCourseData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read(sourceDataPath), context, { filename: sourceDataPath });
  return {
    data: clone(context.window.ABORIGINAL_STUDIES_30_DATA),
    vocabularyEnrichment: clone(context.window.AS30_VOCAB_ENRICHMENT || {})
  };
}

function gitValue(args, fallback) {
  try {
    return require('node:child_process').execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim() || fallback;
  } catch (_error) {
    return fallback;
  }
}

function buildIndex(source, slug, themeNumber) {
  return source
    .replace('<title>Aboriginal Studies 30</title>', `<title>Aboriginal Studies 30 · Theme ${themeNumber}</title>`)
    .replace('data-project-slug="aboriginal-studies-30"', `data-project-slug="${slug}"`)
    .replace('<strong id="progress-count">0 / 4 themes</strong>', '<strong id="progress-count">0 / 1 theme</strong>')
    .replace('<p class="sidebar-course-label">ABS 30</p>', `<p class="sidebar-course-label">ABS 30 · Theme ${themeNumber}</p>`);
}

function buildMain(source, slug) {
  return source
    .replaceAll("'aboriginal-studies-30.progress'", `'${slug}.progress'`)
    .replaceAll("'aboriginal-studies-30.ui'", `'${slug}.ui'`)
    .replaceAll("'aboriginal-studies-30.activityResponses'", `'${slug}.activityResponses'`)
    .replaceAll('/preview/workspace/aboriginal-studies-30/index.html', `/preview/workspace/${slug}/index.html`)
    .replaceAll("'aboriginal-studies-30-my-work.json'", `'${slug}-my-work.json'`)
    .replaceAll("'aboriginal-studies-30-evidence.json'", `'${slug}-evidence.json'`);
}

function buildStore(source, slug) {
  return source
    .replaceAll("'aboriginal-studies-30.activityResponses'", `'${slug}.activityResponses'`)
    .replaceAll("'aboriginal-studies-30.progress'", `'${slug}.progress'`)
    .replaceAll("'aboriginal-studies-30.ui'", `'${slug}.ui'`)
    .replaceAll("projectSlug: 'aboriginal-studies-30'", `projectSlug: '${slug}'`);
}

function buildPracticeData(source, lessonIds) {
  const allowed = JSON.stringify([...lessonIds]);
  return `${source.trim()}\n\n;(function scopePracticeToTheme(global) {\n  'use strict';\n  var source = global.AB30PracticeData;\n  var allowedLessonIds = new Set(${allowed});\n  var items = source.ITEMS.filter(function (item) { return allowedLessonIds.has(item.lessonId); });\n  global.AB30PracticeData = Object.freeze({\n    ITEMS: items,\n    MODES: source.MODES,\n    itemById: function (id) { return items.find(function (item) { return item.id === id; }) || null; },\n    objectiveItems: function () { return items.filter(function (item) { return item.mode === 'objective'; }); },\n    writtenItems: function () { return items.filter(function (item) { return item.mode === 'written'; }); },\n    itemsForLesson: function (lessonId) { return items.filter(function (item) { return item.lessonId === lessonId; }); }\n  });\n})(typeof window !== 'undefined' ? window : globalThis);\n`;
}

function projectManifest(slug, themeNumber, themeTitle, now) {
  const workspaceFiles = [
    'index.html', 'course-data.js', 'main.js', 'learning-store.js',
    'lesson-components.js', 'practice-data.js', 'practice-engine.js',
    'source-locator-links.js', 'styles.css'
  ];
  return {
    id: slug,
    slug,
    title: `Aboriginal Studies 30 · Theme ${themeNumber}: ${themeTitle}`,
    sourcePath: `projects/${sourceSlug}/workspace`,
    inputKind: 'derived-workspace-split',
    brightspaceTarget: 'course-page',
    previewModes: ['workspace'],
    workspaceEntrypoint: 'workspace/index.html',
    migrationState: 'migrated',
    projectType: 'conversion',
    preferredWorkflows: ['conversion'],
    canonicalEntry: `projects/${slug}/workspace/index.html`,
    canonicalSources: workspaceFiles.map((file) => `projects/${slug}/workspace/${file}`),
    importedFirstPassOrigin: {
      sourceSystem: 'canvas-helper-project',
      sourcePath: `projects/${sourceSlug}/workspace`,
      importedAt: now,
      notes: `Theme ${themeNumber} was separated from the current Aboriginal Studies 30 review candidate.`
    },
    generatedOutputs: [],
    injectedComponents: [],
    exportTargets: [
      { target: 'brightspace', enabled: false, notes: 'Enable only after the four-course split is reviewed and rollout checks pass.' },
      { target: 'google-hosted', enabled: false, notes: 'No review site has been assigned.' }
    ],
    authoringStatus: 'active',
    referenceOnly: [],
    sourceOfTruthNotes: `This workspace is the canonical editable Theme ${themeNumber} course. It was initialized from ${sourceSlug}; future edits belong in this project and must not be overwritten by rerunning the split script. Preserve lesson, assignment, response, and activity IDs.`,
    googleHosted: {
      trackedStorageKeys: [`${slug}.progress`, `${slug}.ui`, `${slug}.activityResponses`],
      authMode: 'google'
    },
    authoring: {
      driverId: 'legacy-snapshot-v1',
      familyId: 'builder-legacy-snapshot',
      qualityProfile: 'legacy-snapshot-rendered',
      studioEditing: { enabled: true, renameCourse: false, imageAssets: true }
    },
    createdAt: now,
    updatedAt: now
  };
}

function main() {
  const { data, vocabularyEnrichment } = loadCourseData();
  const sourceFiles = {
    index: read(path.join(sourceWorkspace, 'index.html')),
    main: read(path.join(sourceWorkspace, 'main.js')),
    store: read(path.join(sourceWorkspace, 'learning-store.js')),
    practice: read(path.join(sourceWorkspace, 'practice-data.js'))
  };
  const sharedRuntimeFiles = ['lesson-components.js', 'practice-engine.js', 'source-locator-links.js', 'styles.css'];
  const now = new Date().toISOString();
  const git = {
    branch: gitValue(['branch', '--show-current'], 'unknown'),
    head: gitValue(['rev-parse', 'HEAD'], 'unknown')
  };

  for (const unit of data.units) {
    const themeNumber = Number(String(unit.id).replace('theme-', ''));
    const slug = `${sourceSlug}-theme-${themeNumber}`;
    const projectRoot = path.join(repoRoot, 'projects', slug);
    const workspace = path.join(projectRoot, 'workspace');
    if (fs.existsSync(projectRoot) && !force) {
      throw new Error(`${slug} already exists. Refusing to overwrite its canonical workspace. Remove it intentionally or rerun with --force.`);
    }
    if (force) fs.rmSync(projectRoot, { recursive: true, force: true });
    fs.mkdirSync(workspace, { recursive: true });

    const lessonIds = new Set(unit.lessons.map((lesson) => lesson.id));
    const assignmentIds = new Set(unit.lessons.flatMap((lesson) => [
      ...(lesson.assignmentIds || []), ...(lesson.assignmentHomeIds || [])
    ]));
    assignmentIds.add(`${sourceSlug}-theme-${themeNumber}-assignment`);
    const assignments = data.assignments
      .filter((assignment) => assignmentIds.has(assignment.id))
      .map((assignment) => ({ ...clone(assignment), unitId: unit.id }));
    const coreVocabulary = data.coreVocabulary.filter((item) => item.unitId === unit.id);
    const selected = {
      ...clone(data),
      course: {
        ...clone(data.course),
        title: `Aboriginal Studies 30 · Theme ${themeNumber}`,
        shortTitle: `AS30 T${themeNumber}`,
        subtitle: unit.title.replace(/^Theme \d+\s*-\s*/, '')
      },
      units: [clone(unit)],
      coreVocabulary,
      themeActivities: data.themeActivities.filter((item) => item.unitId === unit.id),
      filmRoomItems: data.filmRoomItems.filter((item) => item.unitId === unit.id),
      assignments,
      libraryItems: [],
      quizzes: data.quizzes.filter((item) => item.unitId === unit.id || lessonIds.has(item.lessonId))
    };

    const referencedAssets = collectAssetPaths(selected);
    referencedAssets.add('./assets/brand/nxt-ce-logo-white-with-ce.png');
    referencedAssets.add('./assets/fonts/HankenGrotesk-Variable.ttf');
    referencedAssets.add('./assets/fonts/WorkSans-Variable.ttf');
    referencedAssets.add('./assets/library/glossary.pdf');
    referencedAssets.add('./assets/library/critical-response-criteria.pdf');
    referencedAssets.add('./assets/library/critical-response-rubric.pdf');
    selected.libraryItems = data.libraryItems.filter((item) => referencedAssets.has(item.file));
    collectAssetPaths(selected.libraryItems, referencedAssets);

    const allowedTerms = new Set(coreVocabulary.map((item) => item.term));
    const selectedEnrichment = Object.fromEntries(
      Object.entries(vocabularyEnrichment).filter(([term]) => allowedTerms.has(term))
    );

    write(path.join(workspace, 'index.html'), buildIndex(sourceFiles.index, slug, themeNumber));
    write(path.join(workspace, 'main.js'), buildMain(sourceFiles.main, slug));
    write(path.join(workspace, 'learning-store.js'), buildStore(sourceFiles.store, slug));
    write(path.join(workspace, 'practice-data.js'), buildPracticeData(sourceFiles.practice, lessonIds));
    write(
      path.join(workspace, 'course-data.js'),
      `window.ABORIGINAL_STUDIES_30_DATA = ${JSON.stringify(selected, null, 2)};\n\nwindow.AS30_VOCAB_ENRICHMENT = Object.freeze(${JSON.stringify(selectedEnrichment, null, 2)});\n`
    );
    sharedRuntimeFiles.forEach((file) => copy(file, workspace));
    [...referencedAssets].sort().forEach((file) => copy(file, workspace));

    const manifest = projectManifest(slug, themeNumber, selected.course.subtitle, now);
    write(path.join(projectRoot, 'meta', 'project.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    const splitManifest = {
      schemaVersion: 1,
      sourceProject: sourceSlug,
      themeId: unit.id,
      themeTitle: unit.title,
      createdAt: now,
      sourceGit: git,
      sourceHashes: Object.fromEntries(
        ['index.html', 'course-data.js', 'main.js', 'learning-store.js', 'lesson-components.js', 'practice-data.js', 'practice-engine.js', 'source-locator-links.js', 'styles.css']
          .map((file) => [file, sha256(path.join(sourceWorkspace, file))])
      ),
      counts: {
        lessons: unit.lessons.length,
        vocabularyTerms: coreVocabulary.length,
        activities: selected.themeActivities.length,
        assignments: assignments.length,
        filmRoomItems: selected.filmRoomItems.length,
        libraryItems: selected.libraryItems.length
      },
      lessonIds: [...lessonIds],
      assignmentIds: assignments.map((item) => item.id),
      storageKeys: manifest.googleHosted.trackedStorageKeys,
      copiedAssets: [...referencedAssets].sort()
    };
    write(path.join(projectRoot, 'meta', 'theme-course-split.json'), `${JSON.stringify(splitManifest, null, 2)}\n`);
    console.log(`${slug}: ${unit.lessons.length} lessons, ${assignments.length} assignments, ${referencedAssets.size} assets`);
  }
}

main();
