import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const sourceWorkspace = path.join(repoRoot, 'projects/aboriginal-studies-30/workspace');

function loadWindowScript(file: string, initialWindow: Record<string, unknown> = {}) {
  const context = { window: initialWindow };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return context.window as Record<string, any>;
}

function assetPaths(value: unknown, found = new Set<string>()) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\.\/assets\/[A-Za-z0-9_@%+.,()' -]+(?:\/[A-Za-z0-9_@%+.,()' -]+)*/g)) {
      found.add(match[0].replace(/[),.;:]+$/, ''));
    }
  } else if (Array.isArray(value)) {
    value.forEach((item) => assetPaths(item, found));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => assetPaths(item, found));
  }
  return found;
}

test('AB30 theme projects partition content and use independent saved-work namespaces', () => {
  const sourceWindow = loadWindowScript(path.join(sourceWorkspace, 'course-data.js'));
  const sourceData = sourceWindow.ABORIGINAL_STUDIES_30_DATA;
  const sourcePractice = loadWindowScript(path.join(sourceWorkspace, 'practice-data.js')).AB30PracticeData;
  const seen = {
    lessons: new Set<string>(),
    assignments: new Set<string>(),
    vocabulary: new Set<string>(),
    activities: new Set<string>(),
    films: new Set<string>(),
    practice: new Set<string>(),
    storage: new Set<string>()
  };
  const expectedLibraries: Record<number, string[]> = {
    1: ['chapter-1', 'chapter-2', 'chapter-3', 'glossary', 'critical-response-criteria', 'critical-response-rubric'],
    2: ['chapter-1', 'chapter-4', 'glossary', 'critical-response-criteria', 'critical-response-rubric'],
    3: ['chapter-5', 'chapter-6', 'glossary', 'critical-response-criteria', 'critical-response-rubric'],
    4: ['chapter-5', 'chapter-7', 'glossary', 'critical-response-criteria', 'critical-response-rubric', 'halfbreed-maria-campbell']
  };

  for (let themeNumber = 1; themeNumber <= 4; themeNumber += 1) {
    const slug = `aboriginal-studies-30-theme-${themeNumber}`;
    const projectRoot = path.join(repoRoot, 'projects', slug);
    const workspace = path.join(projectRoot, 'workspace');
    const window = loadWindowScript(path.join(workspace, 'course-data.js'));
    const data = window.ABORIGINAL_STUDIES_30_DATA;
    assert.equal(data.units.length, 1);
    assert.equal(data.units[0].id, `theme-${themeNumber}`);
    assert.match(data.course.title, new RegExp(`Theme ${themeNumber}$`));
    assert.deepEqual(Array.from(data.libraryItems, (item: any) => item.id), expectedLibraries[themeNumber]);

    const lessonIds = new Set<string>(data.units[0].lessons.map((lesson: any) => lesson.id));
    for (const lessonId of lessonIds) {
      assert.equal(seen.lessons.has(lessonId), false, `duplicate lesson ${lessonId}`);
      seen.lessons.add(lessonId);
    }
    for (const assignment of data.assignments) {
      assert.equal(assignment.unitId, `theme-${themeNumber}`);
      assert.equal(seen.assignments.has(assignment.id), false, `duplicate assignment ${assignment.id}`);
      seen.assignments.add(assignment.id);
    }
    for (const item of data.coreVocabulary) {
      assert.equal(item.unitId, `theme-${themeNumber}`);
      assert.equal(seen.vocabulary.has(item.id), false, `duplicate vocabulary ${item.id}`);
      seen.vocabulary.add(item.id);
    }
    data.themeActivities.forEach((item: any) => seen.activities.add(item.id));
    data.filmRoomItems.forEach((item: any) => seen.films.add(item.id));

    const practice = loadWindowScript(path.join(workspace, 'practice-data.js')).AB30PracticeData;
    for (const item of practice.ITEMS) {
      assert.ok(lessonIds.has(item.lessonId), `${item.id} belongs outside ${slug}`);
      assert.equal(seen.practice.has(item.id), false, `duplicate practice item ${item.id}`);
      seen.practice.add(item.id);
    }

    for (const asset of assetPaths(data)) {
      assert.ok(fs.existsSync(path.join(workspace, asset.replace(/^\.\//, ''))), `${slug} is missing ${asset}`);
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'meta/project.json'), 'utf8'));
    assert.equal(manifest.authoring.driverId, 'legacy-snapshot-v1');
    assert.equal(manifest.exportTargets.every((target: any) => target.enabled === false), true);
    assert.deepEqual(manifest.googleHosted.trackedStorageKeys, [
      `${slug}.progress`, `${slug}.ui`, `${slug}.activityResponses`
    ]);
    for (const key of manifest.googleHosted.trackedStorageKeys) {
      assert.equal(seen.storage.has(key), false, `duplicate storage key ${key}`);
      seen.storage.add(key);
    }
    const main = fs.readFileSync(path.join(workspace, 'main.js'), 'utf8');
    const store = fs.readFileSync(path.join(workspace, 'learning-store.js'), 'utf8');
    for (const key of manifest.googleHosted.trackedStorageKeys) {
      assert.ok(main.includes(key));
      assert.ok(store.includes(key));
    }
    assert.match(main, /function renderFilmEmbed\([\s\S]*loading="eager"/);
    assert.match(main, /return renderFilmEmbed\(embedUrl, item\.title\);/);
    const styles = fs.readFileSync(path.join(workspace, 'styles.css'), 'utf8');
    assert.match(styles, /\.sidebar-header\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;/s);
  }

  assert.deepEqual(seen.lessons, new Set(sourceData.units.flatMap((unit: any) => unit.lessons.map((lesson: any) => lesson.id))));
  assert.deepEqual(seen.assignments, new Set(sourceData.assignments.map((item: any) => item.id)));
  assert.deepEqual(seen.vocabulary, new Set(sourceData.coreVocabulary.map((item: any) => item.id)));
  assert.deepEqual(seen.activities, new Set(sourceData.themeActivities.map((item: any) => item.id)));
  assert.deepEqual(seen.films, new Set(sourceData.filmRoomItems.map((item: any) => item.id)));
  assert.deepEqual(seen.practice, new Set(sourcePractice.ITEMS.map((item: any) => item.id)));
});
