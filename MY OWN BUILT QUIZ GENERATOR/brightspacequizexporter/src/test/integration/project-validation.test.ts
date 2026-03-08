import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolveRepoPath } from '../helpers/fixtureLoader'

describe('project validation scaffold', () => {
  it('tracks validation rules documentation', () => {
    expect(existsSync(resolveRepoPath('docs', 'validation-rules.md'))).toBe(
      true,
    )
  })

  it('has a validation entry point ready for Phase 2', () => {
    expect(
      existsSync(
        resolveRepoPath('src', 'core', 'validation', 'validateProject.ts'),
      ),
    ).toBe(true)
  })
})
