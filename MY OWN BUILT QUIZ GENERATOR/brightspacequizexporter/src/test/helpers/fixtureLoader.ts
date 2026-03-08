import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const helpersDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(helpersDirectory, '..', '..', '..')

export function resolveRepoPath(...segments: string[]) {
  return join(repoRoot, ...segments)
}

export function resolveFixturePath(...segments: string[]) {
  return resolveRepoPath('fixtures', ...segments)
}

export function loadJsonFixture<T>(...segments: string[]) {
  return JSON.parse(readFileSync(resolveFixturePath(...segments), 'utf8')) as T
}

export function loadTextFixture(...segments: string[]) {
  return readFileSync(resolveFixturePath(...segments), 'utf8')
}
