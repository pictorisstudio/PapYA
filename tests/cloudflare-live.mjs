// Con rooms:dev y wrangler pages dev activos. No publica nada.
import assert from 'node:assert/strict'
const base = process.env.ROOMS_TEST_URL ?? 'http://127.0.0.1:8788'
const call = async (action, body) => {
  const response = await fetch(`${base}/api/multiplayer/${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify(body),
  })
  return { status: response.status, body: await response.json() }
}
assert.equal((await fetch(`${base}/`)).status, 200)
assert.equal((await fetch(`${base}/api/multiplayer/health`)).status, 200)
const host = (await call('create', {})).body
assert.match(host.code, /^[A-F0-9]{6}$/)
const guest = (await call('join', { code: host.code.toLowerCase() })).body
assert.equal(guest.player, 1)
assert.equal((await call('join', { code: host.code })).status, 409)
assert.equal((await call('state', { code: host.code, token: 'falso' })).status, 403)
let state
try {
  for (let i = 0; i < 250; i++) {
    await call('state', { ...guest, input: { x: 1, y: 0 } })
    const response = await call('state', { ...host, input: { x: 0, y: 0 } })
    assert.equal(response.status, 200)
    state = response.body
    assert.equal(JSON.stringify(state).includes(guest.token), false)
    if (state.status === 'finished') break
    await new Promise(resolve => setTimeout(resolve, 80))
  }
  assert.equal(state.status, 'finished')
  assert.deepEqual(state.scores, [3, 0])
  assert.equal(state.winner, 0)
  console.log('Pages → Durable Object: dos jugadores, movimiento y victoria 3–0 verificados.')
} finally {
  await call('leave', host)
  await call('leave', guest)
}
