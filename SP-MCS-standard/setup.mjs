import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
for (const system of ['task', 'orbit', 'visual', 'resource']) {
  console.log(`Installing ${system}`)
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci'], {
    cwd: join(root, system), stdio: 'inherit', shell: process.platform === 'win32',
  })
  if (result.status !== 0) process.exit(result.status || 1)
}
