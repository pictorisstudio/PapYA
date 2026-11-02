import test from 'node:test'
import assert from 'node:assert/strict'
import { TrompoRoom } from '../cloudflare/rooms.mjs'
import { roomsApi } from '../cloudflare/rooms-api.mjs'

test('Cloudflare: salas persistentes, autenticación, entradas y victoria a tres puntos', async () => {
  const realNow = Date.now
  let now = 100_000
  Date.now = () => now
  const data = new Map()
  let alarmAt
  const ctx = {
    blockConcurrencyWhile: callback => callback(),
    storage: {
      get: async key => structuredClone(data.get(key)),
      put: async (key, value) => data.set(key, structuredClone(value)),
      setAlarm: async value => { alarmAt = value },
      deleteAll: async () => data.clear(),
    },
  }
  let object = new TrompoRoom(ctx)
  const call = async (action, body = {}) => {
    const response = await object.fetch(new Request(`https://room/${action}`, { method: 'POST', body: JSON.stringify(body) }))
    return { status: response.status, body: await response.json() }
  }
  try {
    assert.equal((await call('join')).status, 404)
    const host = (await call('create', { code: 'ABCDEF' })).body
    assert.equal(alarmAt, now + 900_000)
    assert.equal((await call('create')).status, 409)
    object = new TrompoRoom(ctx) // Simular desalojo del objeto: la sala sigue disponible.
    const guest = (await call('join')).body
    assert.equal(guest.player, 1)
    assert.equal((await call('join')).status, 409)
    assert.equal((await call('state', { token: 'falso' })).status, 403)
    let state = (await call('state', { token: host.token, input: { x: 99, y: 99 }, scores: [99, 0] })).body
    assert.deepEqual(state.scores, [0, 0])
    assert.equal(JSON.stringify(state).includes(host.token), false)
    assert.equal(JSON.stringify(state).includes(guest.token), false)
    assert.ok(Math.hypot(data.get('room').players[0].input.x, data.get('room').players[0].input.y) <= 1)
    await call('state', { token: host.token, input: { x: 0, y: 0 } })
    for (let i = 0; i < 300 && state.status !== 'finished'; i++) {
      await call('state', { token: guest.token, input: { x: 1, y: 0 } })
      now += 80
      state = (await call('state', { token: host.token, input: { x: 0, y: 0 } })).body
    }
    assert.equal(state.status, 'finished')
    assert.equal(state.winner, 0)
    assert.deepEqual(state.scores, [3, 0])
    await call('leave', { token: host.token })
    assert.equal(data.get('room').match.winner, 0)
    await object.alarm()
    assert.equal((await call('state', { token: host.token })).status, 404)

    const fresh = (await call('create', { code: 'AAAAAA' })).body
    now += 16_000
    assert.equal((await call('join')).status, 410)
    now += 900_000
    assert.equal((await call('state', { token: fresh.token })).status, 404)
  } finally { Date.now = realNow }
})

test('Pages: mismo origen, rutas, códigos y binding de Cloudflare', async () => {
  const calls = []
  const env = { TROMPO_ROOMS: {
    idFromName: code => code,
    get: code => ({ fetch: async request => {
      calls.push({ code, body: await request.json() })
      return Response.json({ code })
    } }),
  } }
  const request = (action, body = {}, headers = {}) => new Request(`https://papya.pages.dev/api/multiplayer/${action}`, { method: 'POST', body: JSON.stringify(body), headers })
  assert.equal((await roomsApi(request('create'), {})).status, 503)
  assert.equal((await roomsApi(request('state', { code: '../' }), env)).status, 400)
  assert.equal((await roomsApi(request('create', {}, { Origin: 'https://otro.example' }), env)).status, 403)
  assert.equal((await roomsApi(request('invalido'), env)).status, 404)
  assert.equal((await roomsApi(request('join', { code: ' abcdef ' }), env)).status, 200)
  assert.equal(calls.at(-1).code, 'ABCDEF')
  const created = await roomsApi(request('create'), env)
  assert.match((await created.json()).code, /^[A-F0-9]{6}$/)
  assert.equal((await roomsApi(new Request('https://papya.pages.dev/api/multiplayer/health'), env)).status, 200)
})
