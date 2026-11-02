import test from 'node:test'
import assert from 'node:assert/strict'
import { createMultiplayerServer } from '../server/multiplayer.mjs'
import { TrompoMatch, MATCH_ARENA } from '../src/multiplayer/TrompoMatch.ts'

test('duelo simétrico: tres expulsiones ganan y una salida simultánea no concede punto', () => {
  const match = new TrompoMatch()
  const inputs = [{ x: 0, y: 0 }, { x: 0, y: 0 }]
  for (let round = 0; round < 3; round++) {
    match.countdown = 0
    match.bodies[1].x = MATCH_ARENA.x + 300
    match.step(1 / 60, inputs)
    assert.equal(match.scores[0], round + 1)
    assert.equal(match.winner, round === 2 ? 0 : null)
  }
  match.step(1 / 60, inputs)
  assert.deepEqual(match.scores, [3, 0])
  const tie = new TrompoMatch(); tie.countdown = 0
  tie.bodies[0].x = MATCH_ARENA.x - 300; tie.bodies[1].x = MATCH_ARENA.x + 300
  tie.step(1 / 60, inputs)
  assert.deepEqual(tie.scores, [0, 0])
  assert.equal(tie.round, 2)
  assert.equal(tie.winner, null)
})

test('dos entradas humanas tienen la misma aceleración sin IA', () => {
  const match = new TrompoMatch(); match.countdown = 0
  match.step(1 / 60, [{ x: -1, y: 0 }, { x: 1, y: 0 }])
  assert.ok(Math.abs(match.bodies[0].vx + match.bodies[1].vx) < 1e-8)
  assert.ok(match.bodies[0].vx < 0 && match.bodies[1].vx > 0)
})

test('servidor real: crea sala, entra segundo jugador, rechaza tercero y valida resultados', async () => {
  const server = createMultiplayerServer({ allowedOrigins: 'https://papya.example' })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  const api = async (action, data) => {
    const response = await fetch(`${base}/api/multiplayer/${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    return { status: response.status, body: await response.json() }
  }
  try {
    const first = await api('create', {})
    assert.match(first.body.code, /^[A-F0-9]{6}$/)
    const waiting = await api('state', first.body)
    assert.equal(waiting.body.status, 'waiting')
    const second = await api('join', { code: first.body.code.toLowerCase() })
    assert.equal(second.status, 200)
    assert.equal(second.body.player, 1)
    assert.notEqual(first.body.token, second.body.token)
    assert.equal((await api('join', { code: first.body.code })).status, 409)
    assert.equal((await api('state', { code: first.body.code, token: 'invalid' })).status, 403)
    const state = await api('state', { ...first.body, scores: [3, 0], winner: 0, input: { x: 1e9, y: -1e9 } })
    assert.equal(state.body.status, 'playing')
    assert.deepEqual(state.body.scores, [0, 0])
    assert.equal(state.body.winner, null)
    assert.ok(!JSON.stringify(state.body).includes(second.body.token))
    assert.equal((await api('state', second.body)).body.player, 1)
    await api('leave', second.body)
    const left = await api('state', first.body)
    assert.equal(left.body.status, 'abandoned')
    assert.equal(left.body.winner, 0)
    await api('leave', first.body)
    assert.equal((await api('state', first.body)).body.winner, 0, 'salir después no cambia un resultado ya cerrado')
    assert.equal((await api('join', { code: 'XXXXXX' })).status, 404)
    assert.equal((await fetch(`${base}/api/multiplayer/state`)).status, 405)
    const foreign = await fetch(`${base}/api/multiplayer/create`, { method: 'POST', headers: { Origin: 'http://evil.invalid' }, body: '{}' })
    assert.equal(foreign.status, 403)
    const preflight = await fetch(`${base}/api/multiplayer/create`, { method: 'OPTIONS', headers: { Origin: 'https://papya.example' } })
    assert.equal(preflight.status, 204)
    assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://papya.example')
    const hosted = await fetch(`${base}/api/multiplayer/create`, { method: 'POST', headers: { Origin: 'https://papya.example', 'Content-Type': 'application/json' }, body: '{}' })
    assert.equal(hosted.status, 200)
    assert.equal(hosted.headers.get('access-control-allow-origin'), 'https://papya.example')
    assert.deepEqual(await (await fetch(`${base}/api/multiplayer/health`)).json(), { ok: true, service: 'papya-rooms' })
  } finally { await new Promise(resolve => server.close(resolve)) }
})
