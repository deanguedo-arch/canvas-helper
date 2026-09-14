# Return checklist

The returned ZIP is ready for Canvas Helper integration only when all items below are present.

- [ ] `neural-pathway-labeling.png` is an original, high-resolution diagram containing only callouts A, B, C, D and J.
- [ ] The diagram contains no answer words or interface controls.
- [ ] `interactive-labeling.html` works locally without a server or network connection.
- [ ] Dropdowns sit near their callouts on desktop and move below the image on narrow screens.
- [ ] Every dropdown uses the exact control ID and answer values in `answer-key.json`.
- [ ] Individual checking and `Check all labels` work without revealing incorrect answers.
- [ ] The activity never opens the image in a separate window.
- [ ] Keyboard, focus, alt-text and long-description requirements are implemented.
- [ ] `hotspots.json` contains percentage coordinates for A, B, C, D and J.
- [ ] `implementation-notes.md` documents dimensions, positioning and responsive behaviour.
- [ ] The returned ZIP contains no external libraries, remote assets, trackers or LMS-specific code.

Canvas Helper will adapt the prototype to its existing timer, save-state, attempt-history and Process Collection runtime. Those systems should not be recreated in the prototype.
