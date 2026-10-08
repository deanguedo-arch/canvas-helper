import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { repoRoot as defaultRepoRoot } from './paths.js';

type ArchiveEntry = { originalPath: string; archiveRelativePath: string; sizeBytes: number; sha256: string };
type Options = { repoRoot?: string; archiveRoot?: string };
const safeRelative = (value: string) => typeof value === 'string' && value.length > 0 && !path.isAbsolute(value) && !value.split(/[\\/]/).some(part => part === '..' || part === '' || part === '.');
export async function archiveSha256(file: string): Promise<string> {
  const digest = createHash('sha256');
  for await (const bytes of createReadStream(file)) digest.update(bytes);
  return digest.digest('hex');
}
/** Resolve only explicitly registered external recovery sources. Never fetch, restore or regenerate. */
export async function resolveProjectArchiveSource(source: string, options: Options = {}): Promise<string> {
  const repoRoot = options.repoRoot ?? defaultRepoRoot;
  const original = path.resolve(repoRoot, source);
  try { if ((await stat(original)).isFile()) return original; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  let registry: { schemaVersion: number; entries: ArchiveEntry[] };
  try { registry = JSON.parse(await readFile(path.join(repoRoot, 'config/project-archives.json'), 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return original; throw error; }
  if (registry.schemaVersion !== 1 || !Array.isArray(registry.entries)) throw new Error('Invalid project archive registry');
  const relative = path.relative(repoRoot, original).split(path.sep).join('/');
  const entry = registry.entries.find(item => item.originalPath === relative);
  if (!entry) return original; // Preserve existing missing-input errors for unrelated sources.
  if (!safeRelative(entry.originalPath) || !safeRelative(entry.archiveRelativePath) || !/^[a-f0-9]{64}$/.test(entry.sha256) || !Number.isSafeInteger(entry.sizeBytes) || entry.sizeBytes < 0) throw new Error('Invalid project archive entry');
  const archiveRoot = options.archiveRoot ?? process.env.CANVAS_HELPER_ARCHIVE_ROOT ?? path.join(homedir(), 'Documents', 'Project Archives');
  const archived = path.resolve(archiveRoot, entry.archiveRelativePath);
  let size: number;
  try { const info = await stat(archived); if (!info.isFile()) throw new Error('Not a file'); size = info.size; }
  catch { throw new Error(`Archived source unavailable: ${relative}. Connect the recovery archive or set CANVAS_HELPER_ARCHIVE_ROOT to its Project Archives root.`); }
  if (size !== entry.sizeBytes || await archiveSha256(archived) !== entry.sha256) throw new Error(`Archived source integrity check failed: ${relative}`);
  return archived;
}
