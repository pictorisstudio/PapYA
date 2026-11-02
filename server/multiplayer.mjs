import http from 'node:http'
import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TrompoMatch } from '../src/multiplayer/TrompoMatch.ts'

export function createMultiplayerServer() {
  const rooms = new Map()
  const token = () => randomBytes(18).toString('hex')
  const send = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)) }
  const tick = setInterval(() => {
    const now = Date.now()
    for (const [code, room] of rooms) {
      if (now - room.touched > 15 * 60_000) { rooms.delete(code); continue }
      if (room.players.length === 2 && room.status === 'playing') {
        const absent = room.players.map(p => now - p.seen > 15_000)
        if (absent.some(Boolean)) {
          room.status = 'abandoned'; room.match.winner = absent[0] === absent[1] ? null : absent[0] ? 1 : 0
        } else {
          room.match.step(1 / 60, room.players.map(p => now - p.inputAt > 500 ? { x: 0, y: 0 } : p.input))
          if (room.match.winner !== null) room.status = 'finished'
        }
      }
    }
  }, 1000 / 60)
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname.startsWith('/api/multiplayer/')) {
      try {
        if (req.method !== 'POST') return send(res, 405, { error: 'Método no permitido' })
        // No aceptar peticiones de otros sitios desde un navegador.
        if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return send(res, 403, { error: 'Origen no permitido' })
        let raw = ''
        for await (const chunk of req) { raw += chunk; if (raw.length > 2048) return send(res, 413, { error: 'Solicitud demasiado grande' }) }
        const body = JSON.parse(raw || '{}'), action = url.pathname.split('/').at(-1)
        if (action === 'create') {
          if (rooms.size >= 200) return send(res, 503, { error: 'No hay salas disponibles. Intenta después.' })
          let code; do { code = randomBytes(3).toString('hex').toUpperCase() } while (rooms.has(code))
          const player = { token: token(), seen: Date.now(), inputAt: 0, input: { x: 0, y: 0 } }
          rooms.set(code, { players: [player], match: new TrompoMatch(), status: 'waiting', touched: Date.now() })
          return send(res, 200, { code, token: player.token, player: 0 })
        }
        const code = String(body.code ?? '').trim().toUpperCase(), room = rooms.get(code)
        if (!room) return send(res, 404, { error: 'La sala no existe o ha caducado.' })
        if (action === 'join') {
          if (room.players.length !== 1 || room.status !== 'waiting') return send(res, 409, { error: 'Esta sala ya está ocupada o terminó.' })
          if (Date.now() - room.players[0].seen > 15_000) { rooms.delete(code); return send(res, 410, { error: 'El creador salió de la sala.' }) }
          const player = { token: token(), seen: Date.now(), inputAt: 0, input: { x: 0, y: 0 } }
          room.players.push(player); room.status = 'playing'; room.touched = Date.now()
          return send(res, 200, { code, token: player.token, player: 1 })
        }
        const index = room.players.findIndex(p => p.token === body.token)
        if (index < 0) return send(res, 403, { error: 'Acceso no válido a la sala.' })
        room.touched = Date.now(); const player = room.players[index]; player.seen = room.touched
        if (action === 'leave') {
          if (room.status === 'waiting' || room.status === 'playing') {
            room.status = 'abandoned'; room.match.winner = room.players.length === 2 ? 1 - index : null
          }
          return send(res, 200, { ok: true })
        }
        if (action !== 'state') return send(res, 404, { error: 'Acción no válida' })
        const input = body.input
        if (input && Number.isFinite(input.x) && Number.isFinite(input.y)) {
          const length = Math.max(1, Math.hypot(input.x, input.y))
          player.input = { x: input.x / length, y: input.y / length }; player.inputAt = Date.now()
        }
        return send(res, 200, { code, status: room.status, player: index, ...room.match })
      } catch { return send(res, 400, { error: 'Solicitud no válida' }) }
    }
    if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, { error: 'Método no permitido' })
    let pathname
    try { pathname = decodeURIComponent(url.pathname) } catch { return send(res, 400, { error: 'Ruta no válida' }) }
    const root = resolve('dist')
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname))
    if (!path.startsWith(root + sep)) return send(res, 403, { error: 'Ruta no válida' })
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.ogg': 'audio/ogg', '.wav': 'audio/wav' }
    try { const data = await readFile(path); res.writeHead(200, { 'Content-Type': mime[extname(path)] ?? 'application/octet-stream' }); res.end(req.method === 'HEAD' ? undefined : data) }
    catch { send(res, 404, { error: 'Archivo no encontrado. Ejecuta npm run build.' }) }
  })
  server.on('close', () => clearInterval(tick))
  return server
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 8787)
  createMultiplayerServer().listen(port, '0.0.0.0', () => console.log(`PapYá multijugador: http://localhost:${port} (usa la IP del equipo para otros dispositivos)`))
}
