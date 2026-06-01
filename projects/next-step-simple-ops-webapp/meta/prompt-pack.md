# Next Step Simple Ops Web App

## Role

This project is a displayed Canvas Helper project for the Next Step teacher operations web app.

Canvas Helper should preview it like a normal project. It should not be merged into the Studio shell or treated as a core Canvas Helper feature.

## Canonical Sources

- `projects/next-step-simple-ops-webapp/workspace/index.html`
- `projects/next-step-simple-ops-webapp/workspace/styles.css`
- `projects/next-step-simple-ops-webapp/workspace/app.js`

## Product Boundary

The project should focus on:

- dashboard state
- student progress
- simple announcements
- email preview
- course scope
- reports and logs
- bridge settings

It should not reintroduce the retired course-builder workflow as the daily teacher-facing experience.

## Spreadsheet Bridge

The spreadsheet/App Script source remains the source of truth.

The project can pull live state by entering the deployed bound Apps Script web app URL in the Settings view. The front end expects a JSONP read endpoint:

```text
?nextStepBridge=1&action=state&callback=<callbackName>
```

Live writes should remain gated in Apps Script. Do not turn this project into an ungated Classroom/email write surface.

## Safety Rules

- Email must stay preview-first and selected-send only.
- Announcement posting must stay selected-row gated.
- Clearing displayed queue rows must not delete Classroom announcements.
- Do not add Classroom delete/edit behavior here.
- Do not add automatic email sends.
- Do not duplicate spreadsheet business logic in the browser if it already exists in Apps Script.
