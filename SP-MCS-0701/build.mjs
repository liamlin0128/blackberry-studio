import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const edition = (await readFile(join(root, 'edition.txt'), 'utf8')).trim()
for (const system of ['task', 'orbit', 'visual', 'resource']) {
  console.log(`Building ${edition}/${system}`)
  const args = ['run', 'build', '--', `--base=/_${system}/`]
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd: join(root, system), stdio: 'inherit', shell: process.platform === 'win32',
    env: { ...process.env, VITE_SP_MCS_EDITION: edition === '0701' ? '0701' : 'standard' },
  })
  if (result.status !== 0) process.exit(result.status || 1)
}
