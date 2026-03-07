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

export type PdfTextExtractionResult = {
  text: string | null;
  method: PdfTextExtractionMethod | null;
  issue: string | null;
};

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
  const pathCandidates = splitPathEntries(process.env.Path ?? process.env.PATH).map((entry) =>
    path.join(entry, commandName)
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
    path.join(localAppData, "Programs", "Tesseract-OCR", "tesseract.exe"),
    path.join(programFiles, "Tesseract-OCR", "tesseract.exe")
  ];

  return resolveExecutable("tesseract.exe", explicitCandidates);
}

async function resolvePdftoppmPath() {
  const localAppData = process.env.LOCALAPPDATA ?? "";
  const explicitCandidates = [
    process.env.CANVAS_HELPER_PDFTOPPM_PATH ?? "",
    process.env.PDFTOPPM_PATH ?? "",
    ...(await listPopplerCandidates()),
    path.join(localAppData, "Programs", "Poppler", "bin", "pdftoppm.exe")
  ];

  return resolveExecutable("pdftoppm.exe", explicitCandidates);
}

function cleanExtractedText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function detectPdfTextIssue(extractedText: string | null) {
  const normalized = cleanExtractedText(extractedText ?? "");
  if (!normalized) {
    return "No selectable text detected. Add an OCR-readable PDF or a matching .txt/.docx source.";
  }

  const privateUseCount = countMatches(normalized, /[\uE000-\uF8FF]/gu);
  const latinLetterCount = countMatches(normalized, /[A-Za-z]/g);
  const latinWordCount = countMatches(normalized, /[A-Za-z]{3,}/g);
  const privateUseRatio = privateUseCount / Math.max(1, normalized.length);
  const latinLetterRatio = latinLetterCount / Math.max(1, normalized.length);

  if (privateUseRatio > 0.02 || (latinWordCount < 40 && latinLetterRatio < 0.2)) {
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
  const tesseractPath = await resolveTesseractPath();
  const pdftoppmPath = await resolvePdftoppmPath();

  if (!tesseractPath || !pdftoppmPath) {
    const missingParts = [
      !pdftoppmPath ? "Poppler/pdftoppm" : null,
      !tesseractPath ? "Tesseract OCR" : null
    ].filter((value): value is string => Boolean(value));

    throw new Error(
      `OCR fallback is unavailable because ${missingParts.join(" and ")} ${
        missingParts.length === 1 ? "is" : "are"
      } not installed or not on PATH.`
    );
  }

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

    const pages: string[] = [];
    for (const pageImage of pageImages) {
      const imagePath = path.join(tempDir, pageImage);
      const { stdout } = await runCommand(tesseractPath, [imagePath, "stdout", "-l", "eng"]);
      const cleanedPage = cleanExtractedText(stdout);
      if (cleanedPage.length > 0) {
        pages.push(cleanedPage);
      }
    }

    return cleanExtractedText(pages.join("\n\n"));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function extractPdfTextWithFallback(filePath: string): Promise<PdfTextExtractionResult> {
  try {
    const buffer = await readFile(filePath);
    const parsed = await pdf(buffer);
    const nativeText = cleanExtractedText(parsed.text);
    const nativeIssue = detectPdfTextIssue(nativeText);

    if (!nativeIssue) {
      return {
        text: nativeText,
        method: "native",
        issue: null
      };
    }

    try {
      const ocrText = await ocrPdfText(filePath);
      const ocrIssue = detectPdfTextIssue(ocrText);

      if (!ocrIssue) {
        return {
          text: ocrText,
          method: "ocr",
          issue: null
        };
      }

      return {
        text: null,
        method: null,
        issue: `${nativeIssue} OCR fallback ran, but the recovered text is still not readable enough to trust.`
      };
    } catch (error) {
      const ocrFailure = error instanceof Error ? error.message : String(error);
      return {
        text: null,
        method: null,
        issue: `${nativeIssue} ${ocrFailure}`
      };
    }
  } catch (error) {
    return {
      text: null,
      method: null,
      issue: error instanceof Error ? error.message : String(error)
    };
  }
}
