import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { validateBuildEnv, validateViteEnv } from './vite.env-check'

describe('validateViteEnv', () => {
  it('throws when VITE_APP_ENVIRONMENT is missing', () => {
    expect(() => validateViteEnv({})).toThrow('VITE_APP_ENVIRONMENT is not set')
  })

  it('throws when VITE_APP_ENVIRONMENT is invalid', () => {
    expect(() => validateViteEnv({ VITE_APP_ENVIRONMENT: 'staging' })).toThrow(
      "VITE_APP_ENVIRONMENT='staging' is invalid",
    )
  })

  it('does not throw for production without VITE_API_BASE_URL', () => {
    expect(() => validateViteEnv({ VITE_APP_ENVIRONMENT: 'production' })).not.toThrow()
  })

  it.each(['development', 'test', 'qa'])(
    'throws for %s without VITE_API_BASE_URL',
    (appEnvironment) => {
      expect(() => validateViteEnv({ VITE_APP_ENVIRONMENT: appEnvironment })).toThrow(
        'VITE_API_BASE_URL must be set',
      )
    },
  )

  it.each(['development', 'test', 'qa', 'production'])(
    'does not throw for %s with VITE_API_BASE_URL set',
    (appEnvironment) => {
      expect(() =>
        validateViteEnv({
          VITE_APP_ENVIRONMENT: appEnvironment,
          VITE_API_BASE_URL: 'https://example.test/api',
        }),
      ).not.toThrow()
    },
  )
})

// Vite reads ".env" files into import.meta.env, not into process.env: the guard has to see them.
describe('validateBuildEnv', () => {
  let envDir: string

  beforeEach(() => {
    envDir = mkdtempSync(join(tmpdir(), 'vb-www-env-'))
    // The shell of the machine that runs the tests must not decide these cases.
    vi.stubEnv('VITE_APP_ENVIRONMENT', undefined)
    vi.stubEnv('VITE_API_BASE_URL', undefined)
  })

  afterEach(() => {
    rmSync(envDir, { recursive: true, force: true })
    vi.unstubAllEnvs()
  })

  const write = (file: string, lines: string[]) =>
    writeFileSync(join(envDir, file), lines.join('\n') + '\n')

  it('accepts the variables of a ".env" file', () => {
    write('.env', [
      'VITE_APP_ENVIRONMENT=development',
      'VITE_API_BASE_URL=http://localhost:20000/api',
    ])

    expect(() => validateBuildEnv('development', envDir)).not.toThrow()
  })

  it('throws when neither a file nor the shell sets the stage', () => {
    expect(() => validateBuildEnv('development', envDir)).toThrow('VITE_APP_ENVIRONMENT is not set')
  })

  it('reads the file of the mode', () => {
    write('.env.production', ['VITE_APP_ENVIRONMENT=production'])

    expect(() => validateBuildEnv('production', envDir)).not.toThrow()
    expect(() => validateBuildEnv('development', envDir)).toThrow('VITE_APP_ENVIRONMENT is not set')
  })

  it('lets ".env.local" override ".env"', () => {
    write('.env', ['VITE_APP_ENVIRONMENT=qa', 'VITE_API_BASE_URL=https://qa.example/api'])
    write('.env.local', ['VITE_APP_ENVIRONMENT=staging'])

    expect(() => validateBuildEnv('development', envDir)).toThrow(
      "VITE_APP_ENVIRONMENT='staging' is invalid",
    )
  })

  it('lets a variable of the shell override the file, as Vite does', () => {
    write('.env', [
      'VITE_APP_ENVIRONMENT=development',
      'VITE_API_BASE_URL=http://localhost:20000/api',
    ])
    vi.stubEnv('VITE_APP_ENVIRONMENT', 'staging')

    expect(() => validateBuildEnv('development', envDir)).toThrow(
      "VITE_APP_ENVIRONMENT='staging' is invalid",
    )
  })

  it('still demands the API address outside production', () => {
    write('.env', ['VITE_APP_ENVIRONMENT=qa'])

    expect(() => validateBuildEnv('development', envDir)).toThrow('VITE_API_BASE_URL must be set')
  })

  it('ignores variables without the VITE_ prefix', () => {
    write('.env', ['APP_ENVIRONMENT=production'])

    expect(() => validateBuildEnv('production', envDir)).toThrow('VITE_APP_ENVIRONMENT is not set')
  })
})
