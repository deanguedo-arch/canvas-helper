(() => {
  'use strict';
  const lessons = {
    'ce1-03': {
      name: 'Compare routes into a career',
      points: [
        ['opening', 'Opening instructions', 'Does the learner know Leah’s decision and the product expected?', 'Current start', 'Decision-first opening'],
        ['documents', 'Leah’s documents', 'Find the employer’s role, Leah’s record and the two route conditions before a question.', 'Current case', 'Role and route notices'],
        ['method', 'Clip and decision method', 'The video sequence becomes criteria tied to Leah’s route lines.', 'Current FINLIT placement', 'Video, transcript and five steps'],
        ['practice', 'Route B practice', 'Check whether feedback names the travel month or entry condition that needs revision.', 'Current guided task', 'Targeted calculation feedback'],
        ['apply', 'Owen’s final task', 'Owen has new limits. The final response uses the same method, with a backup condition.', 'Current independent case', 'Independent case and sign-off'],
      ],
    },
    'fl3-04': {
      name: 'Check what your money will buy',
      points: [
        ['opening', 'Opening instructions', 'Does the learner know the required Riley product and where the optional investigation sits?', 'Current start', 'Required path named'],
        ['documents', '$100 basket and balance', 'The account and basket records make the purchasing-power question concrete.', 'Current case', 'Two dated records'],
        ['compounding', 'Optional compounding placement', 'The earlier Version A put this clip in FL3-06 beside a zero-interest case. Version B keeps the clip with its original $500 comparison and a return to the required lesson.', 'Current FL3-06 clip', 'Optional $500 investigation'],
        ['practice', 'Fee comparison', 'Both runs hold their other assumptions fixed, and feedback distinguishes fee from assumed return.', 'Current guided task', 'Controlled comparison and feedback'],
        ['apply', 'Riley’s final task', 'The near-term, confirmed quotation remains the required product after optional learning.', 'Current independent case', 'Required plan and sign-off'],
      ],
    },
  };
  const lessonInput = document.getElementById('compare-lesson');
  const pointInput = document.getElementById('compare-point');
  const sizeInput = document.getElementById('compare-size');
  const note = document.getElementById('compare-point-note');
  const current = document.getElementById('compare-current-link');
  const proposed = document.getElementById('compare-proposed-link');
  function fillPoints() {
    const selected = pointInput.value;
    pointInput.replaceChildren(...lessons[lessonInput.value].points.map(([id, label]) => new Option(label, id)));
    if (lessons[lessonInput.value].points.some(([id]) => id === selected)) pointInput.value = selected;
  }
  function render() {
    const lesson = lessonInput.value;
    const point = lessons[lesson].points.find(([id]) => id === pointInput.value) || lessons[lesson].points[0];
    const size = sizeInput.value;
    note.textContent = point[2];
    const currentRoute = lesson;
    current.href = `./index.html#${currentRoute}`;
    proposed.href = `./${lesson}-finlit-review.html#${lesson}-${point[0]}`;
    for (const [version, caption] of [['a', point[3]], ['b', point[4]]]) {
      const src = `./review-assets/finlit/${lesson}-${point[0]}-${size}-${version}.jpg`;
      const img = document.getElementById(`compare-${version}-image`);
      document.getElementById(`compare-${version}-image-link`).href = src;
      img.src = src;
      img.alt = `${version === 'a' ? 'Earlier snapshot of' : 'Reviewed prototype of'} ${lessons[lesson].name}, ${point[1].toLowerCase()}, ${size} view`;
      document.getElementById(`compare-${version}-caption`).textContent = caption;
    }
    history.replaceState(null, '', `#${lesson}`);
  }
  const initial = location.hash.slice(1);
  if (lessons[initial]) lessonInput.value = initial;
  fillPoints();
  lessonInput.addEventListener('change', () => { fillPoints(); render(); });
  pointInput.addEventListener('change', render);
  sizeInput.addEventListener('change', render);
  render();
})();
