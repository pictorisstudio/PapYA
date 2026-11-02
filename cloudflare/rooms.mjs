import { TrompoMatch } from '../src/multiplayer/TrompoMatch.ts'
import { roomsApi } from './rooms-api.mjs'

const TTL = 15 * 60_000
const STEP = 1000 / 60
const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
const newPlayer = now => ({ token: crypto.randomUUID(), seen: now, inputAt: 0, input: { x: 0, y: 0 } })

export default { fetch: roomsApi }

// Una sala por objeto: los dos teléfonos comparten la misma simulación autoritativa.
export class TrompoRoom {
  constructor(ctx) { this.ctx = ctx }

  fetch(request) {
    return this.ctx.blockConcurrencyWhile(async () => {
      const now = Date.now()
      const action = new URL(request.url).pathname.slice(1)
      const body = await request.json()
      let room = await this.ctx.storage.get('room')
      if (room && now >= room.expires) { await this.ctx.storage.deleteAll(); room = undefined }
      if (action === 'create') {
        if (room) return reply({ error: 'Sala ocupada.' }, 409)
        const player = newPlayer(now)
        room = { code: body.code, players: [player], match: new TrompoMatch(), status: 'waiting', tickAt: now, expires: now + TTL }
        await this.ctx.storage.put('room', room)
        await this.ctx.storage.setAlarm(room.expires)
        return reply({ code: room.code, token: player.token, player: 0 })
      }
      if (!room) return reply({ error: 'La sala no existe o ha caducado.' }, 404)
      room.match = Object.assign(new TrompoMatch(), room.match)
      if (action === 'join') {
        if (room.status !== 'waiting') return reply({ error: 'Esta sala ya está ocupada o terminó.' }, 409)
        if (now - room.players[0].seen > 15_000) return reply({ error: 'El creador salió de la sala.' }, 410)
        const player = newPlayer(now)
        room.players.push(player); room.status = 'playing'; room.tickAt = now
        await this.ctx.storage.put('room', room)
        return reply({ code: room.code, token: player.token, player: 1 })
      }
      const index = room.players.findIndex(p => p.token === body.token)
      if (index < 0) return reply({ error: 'Acceso no válido a la sala.' }, 403)
      // Avanzar el reloj anterior ANTES de aplicar la nueva entrada. Sin timers en memoria:
      // la simulación sobrevive al reposo/reinicio del objeto y nunca depende del reloj del cliente.
      if (room.status === 'playing') {
        const absent = room.players.map(p => now - p.seen > 15_000)
        if (absent.some(Boolean)) {
          room.status = 'abandoned'
          room.match.winner = absent[0] === absent[1] ? null : absent[0] ? 1 : 0
        } else {
          while (room.tickAt + STEP <= now && room.status === 'playing') {
            room.tickAt += STEP
            room.match.step(1 / 60, room.players.map(p => room.tickAt - p.inputAt > 500 ? { x: 0, y: 0 } : p.input))
            if (room.match.winner !== null) room.status = 'finished'
          }
        }
      }
      const player = room.players[index]
      player.seen = now
      if (action === 'leave') {
        if (['waiting', 'playing'].includes(room.status)) {
          room.status = 'abandoned'; room.match.winner = room.players.length === 2 ? 1 - index : null
        }
      } else if (action === 'state') {
        const input = body.input
        if (input && Number.isFinite(input.x) && Number.isFinite(input.y)) {
          const length = Math.max(1, Math.hypot(input.x, input.y))
          player.input = { x: input.x / length, y: input.y / length }; player.inputAt = now
        }
      } else return reply({ error: 'Acción no válida.' }, 404)
      await this.ctx.storage.put('room', room)
      return action === 'leave' ? reply({ ok: true }) : reply({ code: room.code, status: room.status, player: index, ...room.match })
    })
  }

  async alarm() { await this.ctx.storage.deleteAll() }
}
