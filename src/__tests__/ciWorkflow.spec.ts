import { describe, it, expect } from 'vitest'
import workflow from '../../.github/workflows/ci-cd.yml?raw'

// The workflow is read as text (no YAML parser is a dependency of the project): every check below
// is a line-level fact of the file, and each one protects the pipeline from a supply-chain,
// privilege or test-depth regression.
const lines = workflow.split('\n')

function jobBlock(name: string): string {
  const start = lines.findIndex((line) => line === `  ${name}:`)
  expect(start, `job ${name} exists`).toBeGreaterThan(-1)
  const rest = lines.slice(start + 1)
  const end = rest.findIndex((line) => /^ {2}\S/.test(line))
  // Comment lines are left out: they may mention the very flags a check forbids.
  return rest
    .slice(0, end === -1 ? undefined : end)
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')
}

const jobNames = lines
  .slice(lines.indexOf('jobs:') + 1)
  .filter((line) => /^ {2}[\w-]+:$/.test(line))
  .map((line) => line.trim().slice(0, -1))

describe('ci-cd.yml', () => {
  it('has the five jobs the release depends on', () => {
    expect(jobNames).toEqual([
      'lint',
      'quality',
      'security',
      'smoke-test-readonly',
      'release-image',
    ])
  })

  it('publishes :latest only for a push or a manual dispatch on main', () => {
    const release = jobBlock('release-image')

    expect(release).toContain(
      "if: (github.event_name == 'push' || github.event_name == 'workflow_dispatch') && github.ref == 'refs/heads/main'",
    )
    expect(release).toContain('needs: [lint, quality, security, smoke-test-readonly]')
  })

  it('gives the token read access to the contents and nothing else by default', () => {
    expect(workflow).toMatch(/^permissions:\n {2}contents: read\n/m)
    expect(jobBlock('release-image')).toMatch(/permissions:\n\s+contents: read\n\s+packages: write/)
  })

  it('serialises the runs of a ref and only cancels pull-request runs', () => {
    expect(workflow).toMatch(
      /^concurrency:\n {2}group: .*github\.ref.*\n {2}cancel-in-progress: .*pull_request/m,
    )
  })

  it('pins every action to a commit', () => {
    const uses = lines.filter((line) => /^\s*-?\s*uses:/.test(line))

    expect(uses.length).toBeGreaterThan(0)
    for (const line of uses) {
      expect(line, line).toMatch(/uses: \S+@[0-9a-f]{40} # v\d+/)
    }
  })

  it('stops every job after a timeout', () => {
    for (const name of jobNames) {
      expect(jobBlock(name), name).toMatch(/timeout-minutes: \d+/)
    }
  })

  describe('smoke test', () => {
    const smoke = jobBlock('smoke-test-readonly')

    it('boots the image with every capability dropped and adds none back', () => {
      expect(smoke).toContain('--read-only --cap-drop=all --security-opt no-new-privileges')
      expect(smoke).not.toContain('--cap-add')
    })

    it('reaches the unprivileged port 8080', () => {
      expect(smoke).toContain('-p 8090:8080')
      expect(smoke).not.toContain(':80 ')
    })

    it('checks the capability set, the user, the 404s, the server header and the cache header', () => {
      for (const check of [
        'CapEff:.0000000000000000',
        'id -u',
        '/.env',
        '/config.template.js',
        '^server: nginx.$',
        "grep -ci '^cache-control:'",
      ]) {
        expect(smoke, check).toContain(check)
      }
    })

    it('makes sure the container refuses a bad API_BASE_URL', () => {
      expect(smoke).toContain('Refuse a bad API_BASE_URL')
      for (const value of ['"api.example.test"', `"https://x.test/a'b"`, '"https://x.test/a b"']) {
        expect(smoke, value).toContain(value)
      }
      expect(smoke).toContain('nginx -t')
    })
  })
})
