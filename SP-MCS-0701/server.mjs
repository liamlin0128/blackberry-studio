import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const edition = (await readFile(join(root, 'edition.txt'), 'utf8')).trim()
const port = Number(process.env.PORT || (edition === '0701' ? 5273 : 5173))
const names = ['task', 'orbit', 'visual', 'resource']
const routePrefixes = [
  ['/app/mccs/tasksys', 'task'],
  ['/app/mccs/orbitsys', 'orbit'],
  ['/app/mccs/visualsys', 'visual'],
  ['/app/mccs/resourcesys', 'resource'],
]
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.mp4': 'video/mp4',
}

async function existingFile(system, relativePath) {
  const dist = resolve(root, system, 'dist')
  const file = resolve(dist, relativePath)
  if (file !== dist && !file.startsWith(dist + sep)) return null
  try { if ((await stat(file)).isFile()) return file } catch { /* Try another route. */ }
  return null
}

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405).end()
    return
  }
  let pathname
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname) }
  catch { response.writeHead(400).end(); return }
  if (pathname === '/__spmcs/health') {
    const body = JSON.stringify({ edition, systems: names })
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(request.method === 'HEAD' ? undefined : body)
    return
  }

  let file = null
  const assetMatch = pathname.match(/^\/_([a-z]+)\/(.*)$/)
  if (assetMatch && names.includes(assetMatch[1])) {
    file = await existingFile(assetMatch[1], assetMatch[2])
  } else {
    const matched = routePrefixes.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/'))
    if (matched) file = await existingFile(matched[1], 'index.html')
    else if (pathname === '/') file = await existingFile('task', 'index.html')
    else {
      // Vite copies files from public/ to the site root. Find those assets here.
      for (const name of names) {
        file = await existingFile(name, pathname.slice(1))
        if (file) break
      }
    }
  }
  if (!file) { response.writeHead(404).end('Not found'); return }
  try {
    const body = await readFile(file)
    response.writeHead(200, {
      'Content-Type': mime[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-cache',
    })
    response.end(request.method === 'HEAD' ? undefined : body)
  } catch {
    response.writeHead(500).end('Failed to read page')
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`${edition} prototype: http://127.0.0.1:${port}/`)
})
