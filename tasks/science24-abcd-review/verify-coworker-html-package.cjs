#!/usr/bin/env node

const { chromium } = require("playwright");

const base = process.argv[2] || "http://127.0.0.1:4768";
const units = {
  a: { questions: 32, title: "Matter and Chemical Change" },
  b: { questions: 35, title: "Energy Transformations" },
  c: { questions: 29, title: "Disease Defence and Human Health" },
  d: { questions: 50, title: "Safety in Transportation" },
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const report = { base, launcher: {}, units: {}, errors: [] };
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on("pageerror", error => report.errors.push(`launcher: ${error.message}`));
    const response = await page.goto(`${base}/index.html`, { waitUntil: "networkidle" });
    report.launcher = {
      status: response?.status(),
      title: await page.title(),
      unitLinks: await page.locator('.unit a.primary').count(),
      reviewStatusVisible: await page.getByText("Review candidate", { exact: true }).isVisible(),
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1),
    };

    for (const [unit, expected] of Object.entries(units)) {
      const unitPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const unitErrors = [];
      unitPage.on("pageerror", error => unitErrors.push(error.message));
      const overviewResponse = await unitPage.goto(`${base}/units/unit-${unit}/index.html#overview`, { waitUntil: "networkidle" });
      await unitPage.locator("#overview:not([hidden])").waitFor();
      const heading = (await unitPage.locator("#overview h1").first().textContent() || "").trim();
      const overviewOverflow = await unitPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

      await unitPage.goto(`${base}/units/unit-${unit}/index.html#textbook-practice`, { waitUntil: "networkidle" });
      await unitPage.locator("#textbook-practice:not([hidden])").waitFor();
      await unitPage.locator("[data-book-select]").first().waitFor();
      const questionCount = await unitPage.locator("[data-book-select]").count();
      const crop = unitPage.locator("img.book-crop").first();
      await crop.waitFor();
      const cropLoaded = await crop.evaluate(image => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
      const practiceOverflow = await unitPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

      await unitPage.setViewportSize({ width: 390, height: 844 });
      await unitPage.reload({ waitUntil: "networkidle" });
      await unitPage.locator("#textbook-practice:not([hidden])").waitFor();
      const mobileOverflow = await unitPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

      report.units[unit] = {
        status: overviewResponse?.status(),
        heading,
        expectedTitleFound: heading.toLowerCase().includes(expected.title.toLowerCase().split(" ")[0]),
        questionCount,
        expectedQuestions: expected.questions,
        cropLoaded,
        overviewOverflow,
        practiceOverflow,
        mobileOverflow,
        pageErrors: unitErrors,
      };
    }
  } finally {
    await browser.close();
  }

  const failed = report.launcher.status !== 200 ||
    report.launcher.unitLinks !== 4 ||
    !report.launcher.reviewStatusVisible ||
    report.launcher.overflow ||
    report.errors.length > 0 ||
    Object.values(report.units).some(unit =>
      unit.status !== 200 ||
      unit.questionCount !== unit.expectedQuestions ||
      !unit.cropLoaded ||
      unit.overviewOverflow ||
      unit.practiceOverflow ||
      unit.mobileOverflow ||
      unit.pageErrors.length > 0
    );
  console.log(JSON.stringify(report, null, 2));
  if (failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
