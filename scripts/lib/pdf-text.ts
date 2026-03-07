import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import pdf from "pdf-parse";

const execFile = promisify(execFileCallback);
const OCR_RENDER_DPI = 180;
const COMMAND_BUFFER_BYTES = 32 * 1024 * 1024;

export type PdfTextExtractionMethod = "native" | "ocr";
export type PdfTextPage = {
  page: number;
  text: string;
};

export type PdfTextExtractionResult = {
  text: string | null;
  method: PdfTextExtractionMethod | null;
  issue: string | null;
  pages: PdfTextPage[];
  pageCount: number;
};

export function getExecutableNameCandidates(
  commandName: string,
  platform: NodeJS.Platform = process.platform
) {
  return platform === "win32" ? [`${commandName}.exe`, commandName] : [commandName, `${commandName}.exe`];
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

async function pathExists(candidatePath: string) {
  try {
    await stat(candidatePath);
    return true;
  } catch {
    return false;
  }
}

function splitPathEntries(value: string | undefined) {
  return (value ?? "")
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

async function listPopplerCandidates() {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) {
    return [];
  }

  const packageRoot = path.join(
    localAppData,
    "Microsoft",
    "WinGet",
    "Packages",
    "oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe"
  );

  if (!(await pathExists(packageRoot))) {
    return [];
  }

  const entries = await readdir(packageRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packageRoot, entry.name, "Library", "bin", "pdftoppm.exe"))
    .reverse();
}

async function resolveExecutable(commandName: string, explicitCandidates: string[]) {
  const executableNames = getExecutableNameCandidates(commandName);
  const pathCandidates = splitPathEntries(process.env.Path ?? process.env.PATH).flatMap((entry) =>
    executableNames.map((candidateName) => path.join(entry, candidateName))
  );

  const uniqueCandidates = [...explicitCandidates, ...pathCandidates].filter(
    (candidate, index, values) => candidate.length > 0 && values.indexOf(candidate) === index
  );

  for (const candidate of uniqueCandidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function resolveTesseractPath() {
  const localAppData = process.env.LOCALAPPDATA ?? "";
  const programFiles = process.env.ProgramFiles ?? "";
  const explicitCandidates = [
    process.env.CANVAS_HELPER_TESSERACT_PATH ?? "",
    process.env.TESSERACT_PATH ?? "",
    path.join(os.homedir(), ".local", "bin", "tesseract"),
    "/opt/homebrew/bin/tesseract",
    "/usr/local/bin/tesseract",
    "/opt/local/bin/tesseract",
    path.join(localAppData, "Programs", "Tesseract-OCR", "tesseract.exe"),
    path.join(programFiles, "Tesseract-OCR", "tesseract.exe")
  ];

  return resolveExecutable("tesseract", explicitCandidates);
}

async function resolvePdftoppmPath() {
  const localAppData = process.env.LOCALAPPDATA ?? "";
  const explicitCandidates = [
    process.env.CANVAS_HELPER_PDFTOPPM_PATH ?? "",
    process.env.PDFTOPPM_PATH ?? "",
    path.join(os.homedir(), ".local", "bin", "pdftoppm"),
    "/opt/homebrew/bin/pdftoppm",
    "/usr/local/bin/pdftoppm",
    "/opt/local/bin/pdftoppm",
    ...(await listPopplerCandidates()),
    path.join(localAppData, "Programs", "Poppler", "bin", "pdftoppm.exe")
  ];

  return resolveExecutable("pdftoppm", explicitCandidates);
}

export type PdfOcrSupportStatus = {
  available: boolean;
  tesseractPath: string | null;
  pdftoppmPath: string | null;
  missing: string[];
};

export async function inspectPdfOcrSupport(): Promise<PdfOcrSupportStatus> {
  const [tesseractPath, pdftoppmPath] = await Promise.all([resolveTesseractPath(), resolvePdftoppmPath()]);
  const missing = [
    !pdftoppmPath ? "Poppler/pdftoppm" : null,
    !tesseractPath ? "Tesseract OCR" : null
  ].filter((value): value is string => Boolean(value));

  return {
    available: missing.length === 0,
    tesseractPath,
    pdftoppmPath,
    missing
  };
}

function cleanExtractedText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function renderPageText(pageData: {
  getTextContent: (options: {
    normalizeWhitespace: boolean;
    disableCombineTextItems: boolean;
  }) => Promise<{ items: Array<{ str: string; transform: number[] }> }>;
}) {
  const textContent = await pageData.getTextContent({
    normalizeWhitespace: false,
    disableCombineTextItems: false
  });

  let lastY: number | undefined;
  let text = "";
  for (const item of textContent.items) {
    if (lastY === item.transform[5] || typeof lastY === "undefined") {
      text += item.str;
    } else {
      text += `\n${item.str}`;
    }
    lastY = item.transform[5];
  }

  return text;
}

async function extractNativePdfText(buffer: Buffer) {
  const pages: PdfTextPage[] = [];
  const parsed = await pdf(buffer, {
    pagerender: async (pageData) => {
      const pageNumber = pages.length + 1;
      const pageText = cleanExtractedText(await renderPageText(pageData));
      pages.push({
        page: pageNumber,
        text: pageText
      });
      return pageText;
    }
  });

  return {
    text: cleanExtractedText(parsed.text),
    pages: pages.filter((page) => page.text.length > 0),
    pageCount: parsed.numpages
  };
}

export function detectPdfTextIssue(extractedText: string | null) {
  const normalized = cleanExtractedText(extractedText ?? "");
  if (!normalized) {
    return "No selectable text detected. Add an OCR-readable PDF or a matching .txt/.docx source.";
  }

  const privateUseCount = countMatches(normalized, /[\uE000-\uF8FF]/gu);
  const latinLetterCount = countMatches(normalized, /[A-Za-z]/g);
  const latinWordCount = countMatches(normalized, /[A-Za-z]{3,}/g);
  const suspiciousAlphaRuns = normalized.match(/\b[A-Za-z]{20,}\b/g) ?? [];
  const suspiciousAlphaRunChars = suspiciousAlphaRuns.reduce((total, run) => total + run.length, 0);
  const privateUseRatio = privateUseCount / Math.max(1, normalized.length);
  const latinLetterRatio = latinLetterCount / Math.max(1, normalized.length);
  const suspiciousAlphaRunRatio = suspiciousAlphaRunChars / Math.max(1, latinLetterCount);

  if (privateUseRatio > 0.02 || (latinWordCount < 40 && latinLetterRatio < 0.2)) {
    return "Extracted text appears garbled (likely font-encoded PDF text).";
  }

  if (latinWordCount < 80 && suspiciousAlphaRuns.length >= 3 && suspiciousAlphaRunRatio > 0.25) {
    return "Extracted text appears garbled (likely font-encoded PDF text).";
  }

  return null;
}

async function runCommand(commandPath: string, args: string[]) {
  try {
    return await execFile(commandPath, args, { maxBuffer: COMMAND_BUFFER_BYTES });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${path.basename(commandPath)} failed: ${message}`);
  }
}

async function ocrPdfText(filePath: string) {
  const support = await inspectPdfOcrSupport();
  if (!support.available) {
    throw new Error(
      `OCR fallback is unavailable because ${support.missing.join(" and ")} ${
        support.missing.length === 1 ? "is" : "are"
      } not installed or not on PATH.`
    );
  }
  const tesseractPath = support.tesseractPath!;
  const pdftoppmPath = support.pdftoppmPath!;

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-ocr-"));

  try {
    const pagePrefix = path.join(tempDir, "page");
    await runCommand(pdftoppmPath, ["-png", "-r", `${OCR_RENDER_DPI}`, filePath, pagePrefix]);

    const pageImages = (await readdir(tempDir))
      .filter((fileName) => /^page-\d+\.png$/i.test(fileName))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    if (pageImages.length === 0) {
      throw new Error("OCR fallback could not render any PDF pages.");
    }

    const pages: PdfTextPage[] = [];
    for (const [index, pageImage] of pageImages.entries()) {
      const imagePath = path.join(tempDir, pageImage);
      const { stdout } = await runCommand(tesseractPath, [imagePath, "stdout", "-l", "eng"]);
      const cleanedPage = cleanExtractedText(stdout);
      if (cleanedPage.length > 0) {
        pages.push({
          page: index + 1,
          text: cleanedPage
        });
      }
    }

    return {
      text: cleanExtractedText(pages.map((page) => page.text).join("\n\n")),
      pages,
      pageCount: pageImages.length
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function extractPdfTextWithFallback(filePath: string): Promise<PdfTextExtractionResult> {
  try {
    const buffer = await readFile(filePath);
    const native = await extractNativePdfText(buffer);
    const nativeText = native.text;
    const nativeIssue = detectPdfTextIssue(nativeText);

    if (!nativeIssue) {
      return {
        text: nativeText,
        method: "native",
        issue: null,
        pages: native.pages,
        pageCount: native.pageCount
      };
    }

    try {
      const ocr = await ocrPdfText(filePath);
      const ocrText = ocr.text;
      const ocrIssue = detectPdfTextIssue(ocrText);

      if (!ocrIssue) {
        return {
          text: ocrText,
          method: "ocr",
          issue: null,
          pages: ocr.pages,
          pageCount: ocr.pageCount
        };
      }

      return {
        text: null,
        method: null,
        issue: `${nativeIssue} OCR fallback ran, but the recovered text is still not readable enough to trust.`,
        pages: [],
        pageCount: ocr.pageCount
      };
    } catch (error) {
      const ocrFailure = error instanceof Error ? error.message : String(error);
      return {
        text: null,
        method: null,
        issue: `${nativeIssue} ${ocrFailure}`,
        pages: native.pages,
        pageCount: native.pageCount
      };
    }
  } catch (error) {
    return {
      text: null,
      method: null,
      issue: error instanceof Error ? error.message : String(error),
      pages: [],
      pageCount: 0
    };
  }
}
