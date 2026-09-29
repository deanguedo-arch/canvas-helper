#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const i = process.argv.indexOf('--project');
const slug = i >= 0 ? process.argv[i + 1] : '';
if (!/^science24-unit-[bcd]$/.test(slug)) {
  throw new Error('Usage: node scripts/compile-science24-bcd-data.cjs --project science24-unit-<b|c|d>');
}
const root = path.resolve(__dirname, '..');
const workspace = path.join(root, 'projects', slug, 'workspace');
const data = JSON.parse(fs.readFileSync(path.join(workspace, 'course-data.json'), 'utf8'));
const html = fs.readFileSync(path.join(workspace, 'index.html'), 'utf8');
const unit = slug.at(-1);
const prefix = `s24-${unit}`;
const isReplacement = data.courseId === `${slug}-excellence-v2`;
if (isReplacement) {
  const teachingCount = data.topics?.length;
  if (!/^2\.\d+\.\d+$/.test(data.contentVersion) || data.topicId !== prefix || !Number.isInteger(teachingCount) || teachingCount < 1 || Object.keys(data.checks || {}).length !== teachingCount + 1) {
    throw new Error(`Unit ${unit.toUpperCase()} replacement identity or lesson/check count is invalid.`);
  }
  const ids = new Set();
  const claim = (id, label) => {
    if (typeof id !== 'string' || !id.startsWith(`${prefix}-`) || ids.has(id)) throw new Error(`Invalid or duplicate ${label}: ${id}`);
    ids.add(id);
  };
  data.topics.forEach((topic, index) => {
    const number = String(index + 1).padStart(2, '0');
    const route = `lesson-${number}`;
    const required = Object.values(data.checks || {}).filter((check) => check.route === route);
    if (topic.id !== number || !html.includes(`id="${route}"`) || required.length !== 1 || !html.includes(`data-required="${required[0].id}"`)) {
      throw new Error(`Unit ${unit.toUpperCase()} lesson ${number} does not match canonical HTML.`);
    }
    for (const role of ['error', 'guided1', 'guided2', 'independent1', 'independent2']) {
      const matches = Object.values(data.exercises || {}).filter((exercise) => exercise.topic === number && exercise.role === role);
      if (matches.length !== 1 || !html.includes(`data-exercise="${matches[0].id}"`)) throw new Error(`Missing ${role} exercise for lesson ${number}.`);
    }
    const notes = Object.entries(data.notes || {}).filter(([, note]) => note.route === route);
    if (notes.length < 2) throw new Error(`Missing saved transfer or retrieval note for lesson ${number}.`);
    for (const [id] of notes) claim(id, 'lesson note');
  });
  const reviewNumber = String(teachingCount + 1).padStart(2, '0');
  const reviewRoute = `lesson-${reviewNumber}`;
  const finalChecks = Object.values(data.checks || {}).filter((check) => check.route === reviewRoute);
  if (!html.includes(`id="${reviewRoute}"`) || finalChecks.length !== 1 || !html.includes(`data-required="${finalChecks[0].id}"`)) throw new Error('Missing integrated review.');
  for (const [id, note] of Object.entries(data.notes || {})) {
    if (!note.prompt || !note.model || !html.includes(`data-note-id="${id}"`)) throw new Error(`Missing note contract ${id}.`);
  }
  for (const question of [...data.banks['multiple-choice'], ...data.banks['fill-in-the-blanks'], ...data.banks.practice]) claim(question.id, 'bank question');
  for (const [id, check] of Object.entries(data.checks)) {
    if (check.id !== id || !html.includes(`data-required="${id}"`) || check.writing?.length !== 2 || check.questions?.length !== (check.route === reviewRoute ? 8 : 2)) {
      throw new Error(`Invalid required check ${id}.`);
    }
    for (const question of check.questions) claim(question.id, 'check question');
    for (const response of check.writing) claim(response.id, 'check writing');
  }
  for (const word of data.vocabulary) {
    claim(word.id, 'vocabulary word');
    if (!word.model?.meaning || !word.model?.features || !word.model?.example || !word.model?.nonexample) throw new Error(`Incomplete Frayer model ${word.id}.`);
  }
  const expectedSourcePages = {b:51,c:49,d:0}[unit];
  if ((expectedSourcePages && data.resources?.[0]?.pages?.length !== expectedSourcePages) || data.bookQuestions?.length < 12 || data.labeling?.length < 4 || data.videos?.length < 8) {
    throw new Error(`Unit ${unit.toUpperCase()} source reader, textbook, diagram, or video coverage is incomplete.`);
  }
} else {
  if (data.courseId !== `${slug}-review-v1` || !Array.isArray(data.lessons) || data.lessons.length !== 8) {
    throw new Error('Course identity or eight-lesson contract is invalid.');
  }
  const ids = new Set();
  for (const [index, lesson] of data.lessons.entries()) {
    const number = String(index + 1).padStart(2, '0');
    if (lesson.id !== `s24-${data.code.toLowerCase()}-l${number}` || ids.has(lesson.id)) {
      throw new Error(`Lesson ${index + 1} has an invalid or duplicate stable ID.`);
    }
    ids.add(lesson.id);
    if (lesson.checkId !== `${lesson.id}-check` || lesson.writingId !== `${lesson.id}-writing`) {
      throw new Error(`Lesson ${index + 1} changed a saved-work ID.`);
    }
    if (!html.includes(`id="lesson-${number}"`) || !html.includes(`data-check="${lesson.checkId}"`) || !html.includes(`data-writing="${lesson.writingId}"`)) {
      throw new Error(`Lesson ${index + 1} does not match the canonical HTML.`);
    }
    for (const term of lesson.words || []) {
      if (!data.glossary?.[term]) throw new Error(`Missing glossary meaning for ${term}.`);
    }
  }
}
const output = path.join(workspace, 'course-data.js');
const temp = `${output}.tmp-${process.pid}`;
const globalName = isReplacement ? 'S24_DATA' : 'S24_UNIT';
fs.writeFileSync(temp, `window.${globalName} = ${JSON.stringify(data)};\n`);
fs.renameSync(temp, output);
console.log(isReplacement
  ? `Compiled ${slug}: ${data.topics.length} teaching lessons, ${data.vocabulary.length} vocabulary terms.`
  : `Compiled ${slug}: ${data.lessons.length} lessons, ${Object.keys(data.glossary).length} glossary terms.`);
