function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildStandalonePreviewHost(targetUrl: string) {
  const escapedTarget = escapeHtmlAttribute(targetUrl);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Canvas Helper course preview</title>
    <style>
      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
        background: #eef2f7;
      }

      [data-canvas-helper-standalone-course] {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
        background: #fff;
      }
    </style>
    <script src="/standalone-preview-bridge.js"></script>
  </head>
  <body>
    <iframe
      src="${escapedTarget}"
      title="Course preview"
      data-canvas-helper-standalone-course="true"
    ></iframe>
  </body>
</html>`;
}
