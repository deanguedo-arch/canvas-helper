# Codex integration instructions

Use `label_answer_manifest.json` as the source of truth.

For each asset:

1. Load the image from the `image` path.
2. Render the letter markers exactly as they already appear in the image.
3. Ask the student to match each letter to the correct label.
4. Randomize the label-bank order on each attempt.
5. Do not expose `answer`, `accepted`, or `notes` until the student submits.
6. Allow click-to-select or dropdown matching. Do not require drag-and-drop.
7. After submission:
   - mark each letter correct/incorrect,
   - show the correct answer for missed letters,
   - show a short explanation derived from `notes`.
8. On retry, reshuffle the answer bank.
9. Track mastery using the asset `id`, not the filename.
10. Support chapter filters and mixed practice.

## Recommended question object

```js
{
  type: "labeling",
  id: asset.id,
  chapter: asset.chapter,
  title: asset.title,
  image: asset.image,
  prompt: asset.prompt,
  labels: asset.labels
}
```

## Accepted-answer handling

`answer` is the canonical display answer.
`accepted` contains synonyms/alternate text if the activity ever supports typed answers.

For standard label-bank matching, use only the canonical `answer` values as draggable/selectable labels.

## Student UI

Recommended flow:

- show image
- list letters A, B, C...
- provide randomized answer bank
- submit
- feedback
- retry missed labels
- next image

Do not show the CSV or JSON answer key in the student-facing bundle/navigation.
