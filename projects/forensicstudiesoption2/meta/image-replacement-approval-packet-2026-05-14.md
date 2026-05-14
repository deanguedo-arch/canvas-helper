# Forensics 25 Image Replacement Approval Packet - 2026-05-14

Project: `forensicstudiesoption2`
Status: review packet only. No replacement images have been inserted into the course.
Rule: nothing in this packet gets downloaded, generated, or placed in course content until Dean approves that item.

## Decision legend

- `Approve source`: use a pulled/source image and localize it into the course so it no longer depends on a remote URL.
- `Approve create`: create a clearly non-documentary educational illustration and label it as generated in metadata.
- `Remove`: remove the broken image block or replace it with course-native text/card styling.
- `Hold`: do not change until a better source is found.

## Active visible course issues

These are the items most likely to affect what learners see in the Forensics 25 course shell.

### 1. Sir Francis Galton portrait

- Where it appears: Chapter 2, A Brief History of Fingerprinting.
- Original issue: remote Wikimedia thumbnail returned a failed audit response.
- Content purpose: identifies Galton in the historical fingerprinting section.
- Candidate: pull/localize `File:Francis Galton 1850s.jpg` from Wikimedia Commons.
- Source/license: https://commons.wikimedia.org/wiki/File:Francis_Galton_1850s.jpg; public domain according to the file page.
- AI-created: no.
- Recommendation: `Approve source`. This is a proper historical portrait and should not be AI-generated.

### 2. Juan Vucetich portrait

- Where it appears: Chapter 2, A Brief History of Fingerprinting.
- Original issue: remote Wikimedia thumbnail returned a failed audit response.
- Content purpose: identifies Vucetich in the fingerprint classification history section.
- Candidate: pull/localize `File:Juan Vucetich 100.jpg` from Wikimedia Commons.
- Source/license: https://commons.wikimedia.org/wiki/File:Juan_Vucetich_100.jpg; public domain mark on the file page.
- AI-created: no.
- Recommendation: `Approve source`. This is a proper historical portrait and should not be AI-generated.

### 3. Legacy Moodle notes icon

- Where it appears: Chapter 2, table section around a note/callout.
- Original issue: `http://moodle.aspenview.org:18321/file.php?file=%2F267%2Fmag.jpg` timed out.
- Content purpose: decorative LMS note icon, not instructional content.
- Candidate: replace the image with a course-native note/callout style, or remove the image only.
- Source/license: no source candidate needed.
- AI-created: no.
- Recommendation: `Remove`. Do not generate or source a new picture for a Moodle UI icon.

### 4. Central Park photo

- Where it appears: Chapter 3, The Central Park Jogger Case Revisited.
- Original issue: remote Wikimedia image returned a failed audit response.
- Content purpose: establishes the location of the Central Park case.
- Candidate: pull/localize `File:Southwest corner of Central Park, looking east, NYC.jpg` from Wikimedia Commons.
- Source/license: https://commons.wikimedia.org/wiki/File:Southwest_corner_of_Central_Park,_looking_east,_NYC.jpg; CC BY-SA 2.0 on the file page.
- AI-created: no.
- Recommendation: `Approve source`. Use a real location photo, not an AI crime-scene image.

### 5. Karl Landsteiner portrait

- Where it appears: Chapter 4, blood typing section.
- Original issue: remote Wikimedia thumbnail returned a failed audit response.
- Content purpose: identifies Landsteiner while explaining blood typing.
- Candidate: pull/localize `File:Karl Landsteiner nobel.jpg` from Wikimedia Commons.
- Source/license: https://commons.wikimedia.org/wiki/File:Karl_Landsteiner_nobel.jpg; public domain according to the file page.
- AI-created: no.
- Recommendation: `Approve source`. This is a proper historical portrait and should not be AI-generated.

### 6. William Marston / polygraph image

- Where it appears: Chapter 6, The Invention of the Polygraph Instrument.
- Original issue: remote Amazon/IMDb-style image returned `404`.
- Content purpose: supports the early polygraph invention/history section.
- Candidate A: replace with a public-domain historical polygraph test image, `File:Lie detector test.jpg`.
- Candidate B: create a neutral educational illustration of an early polygraph apparatus.
- Source/license for Candidate A: https://commons.wikimedia.org/wiki/File:Lie_detector_test.jpg; public domain U.S. government work according to the file page.
- AI-created for Candidate B: yes, if approved. Proposed context label: `Generated educational illustration of an early polygraph apparatus; not a historical photograph.`
- Recommendation: `Approve source` using the public-domain polygraph test image. Avoid replacing this with a celebrity/movie/Amazon image.

### 7. Robert Hanssen portrait

- Where it appears: Chapter 6, polygraph employment screening section.
- Original issue: remote Wikimedia thumbnail returned a failed audit response.
- Content purpose: identifies Hanssen in the FBI polygraph policy example.
- Candidate: pull/localize `File:Robert Hanssen.jpg` from Wikimedia Commons.
- Source/license: https://commons.wikimedia.org/wiki/File:Robert_Hanssen.jpg; public domain FBI/U.S. government work according to the file page.
- AI-created: no.
- Recommendation: `Approve source`. This is a proper case-related portrait and should not be AI-generated.

### 8. Eukaryotic DNA diagram

- Where it appears: Chapter 7, Description of DNA.
- Original issue: remote Wikimedia rendered PNG returned a failed audit response.
- Content purpose: explains where DNA sits inside a eukaryotic cell/chromosome context.
- Candidate: pull/localize the original SVG `File:Eukaryote DNA-en.svg` from Wikimedia Commons.
- Source/license: https://commons.wikimedia.org/wiki/File:Eukaryote_DNA-en.svg; CC BY-SA 3.0 attribution to Radio89 on the file page.
- AI-created: no.
- Recommendation: `Approve source`. Use the diagram source file locally instead of generating a biology diagram.

## Dead link only, visible image already works

These failed because the `<a href>` points to an old D2L URL, but the visible `<img src>` already points to a local course image.

### 9. Polygraph examination room link

- Where it appears: Chapter 6, Polygraph Testing & Forensic Document Analysis.
- Original issue: old D2L click-through URL is dead.
- Visible image status: local `Poly Room.jpg` appears to be used as the image source.
- Recommendation: `Remove` only the dead external link wrapper or replace the click-through with no link. No image replacement needed.

### 10. Jack the Ripper Lusk letter link

- Where it appears: Chapter 6, forensic writing analysis section.
- Original issue: old D2L click-through URL is dead.
- Visible image status: local `jack-ripper4.jpg` appears to be used as the image source.
- Recommendation: `Remove` only the dead external link wrapper or keep the local image without the broken link. No image replacement needed.

## Extracted reference HTML issues, not active visible chapter hits

The image audit found these in extracted reference HTML under `workspace/references/...`. A targeted search found no matching filename hits in active `workspace/content` or `course-data.js`, so these may not affect the learner-facing shell unless those reference pages are opened directly.

### 11. 9/11 WTC image in extracted reference page

- Reference page: `references/forensics/.../chapter_12056.html`, Case Study: Identifying the Victims of 9-11.
- Original issue: local file is missing from extracted reference assets.
- Content purpose: shows the World Trade Center towers during the 9/11 attack context.
- Candidate: source a real archival/historical image only. Possible source collections include Library of Congress or Wikimedia Commons 9/11 categories.
- Source candidate: https://loc.gov/pictures/resource/ppmsca.01670/
- AI-created: no.
- Recommendation: `Hold` unless this reference page is learner-facing. If it is visible, use a real sourced archival image, not AI.

### 12. Princess Diana crash image in extracted reference page

- Reference page: `references/forensics/.../chapter_12023.html`, The Death of Princess Diana.
- Original issue: local crash-scene image is missing from extracted reference assets.
- Content purpose: supports impaired-driving case study context.
- Candidate: replace with a neutral sourced photo of the Pont de l'Alma tunnel, not a graphic crash image.
- Source/license: https://commons.wikimedia.org/wiki/File:Alma_tunnel_Paris.jpg; CC BY-SA options/GFDL on the file page.
- AI-created: no.
- Recommendation: `Approve source` only if this reference page is visible. Avoid AI and avoid graphic accident imagery.

### 13. Tomb of the Unknown Soldier honor guard image in extracted reference page

- Reference page: `references/forensics/.../chapter_12055.html`, Forensic Identification of Unknown Soldiers.
- Original issue: local image is missing from extracted reference assets.
- Content purpose: supports the unknown-soldier identification case study.
- Candidate: source a real Arlington Tomb of the Unknown Soldier image from Wikimedia Commons.
- Source candidate: https://commons.wikimedia.org/wiki/Category:Tomb_of_the_Unknown_Soldier_(Arlington)_in_2012
- AI-created: no.
- Recommendation: `Approve source` only if this reference page is visible. Use real sourced memorial imagery, not AI.

### 14. Susan Smith court/escort image in extracted reference page

- Reference page: `references/forensics/.../chapter_12043.html`, Nine Long Days - The Susan Smith Case.
- Original issue: local news-style image is missing from extracted reference assets.
- Content purpose: supports a true-crime polygraph/writing-analysis case study.
- Candidate: no safe open-license replacement identified in this pass.
- AI-created option: possible, but not recommended for a real criminal case.
- Recommendation: `Remove` or `Hold`. Do not generate a fake documentary-style image of a real case.

### 15. Microscopic fibre image in extracted reference page

- Reference page: `references/forensics/.../chapter_12229.html`, fibre evidence content.
- Original issue: local microscope image is missing from extracted reference assets.
- Content purpose: illustrates fibres under a microscope.
- Candidate A: source a microscopic textile fibre image from Wikimedia Commons.
- Candidate B: generate a clearly non-documentary educational microscope-style illustration of textile fibres.
- Source candidate: https://commons.wikimedia.org/wiki/Category:Microscopic_images_of_textile_fibres
- AI-created for Candidate B: yes, if approved. Proposed context label: `Generated educational illustration of textile fibres under magnification; not a forensic case photograph.`
- Recommendation: `Approve source` if the reference page is visible. `Approve create` is acceptable here because it is generic instructional science, not a real case photo.

## Recommended approval batch

If you want the safest first fix, approve these active visible items first:

- Approve source: 1, 2, 4, 5, 6A, 7, 8.
- Remove: 3, 9, 10.
- Hold or ignore until proven visible: 11, 12, 13, 14, 15.

If you want one generated image candidate, the safest item is 15 only: a generic educational textile-fibre microscope illustration.
