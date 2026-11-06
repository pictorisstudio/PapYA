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
const url = new URL(`/api/multiplayer/live?code=${host.code}`, base)
url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
const states = []
const votes = [undefined, undefined]
const sockets = [host, guest].map((player, index) => {
  assert.equal(player.live, true)
  const socket = new WebSocket(url)
  socket.addEventListener('message', event => {
    assert.equal(event.data.includes(host.token) || event.data.includes(guest.token), false)
    states[index] = JSON.parse(event.data)
  })
  return socket
})
const tick = setInterval(() => sockets.forEach((socket, index) => {
  if (socket.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify({
    token: [host, guest][index].token,
    matchNumber: states[index]?.matchNumber,
    input: { x: index === 1 && states[index]?.matchNumber !== 2 ? 1 : 0, y: 0 },
    rematchMatch: votes[index],
  }))
}), 33)
const waitFor = async (predicate) => {
  const deadline = Date.now() + 15_000
  while (!predicate()) {
    assert.ok(Date.now() < deadline, `Tiempo agotado: ${JSON.stringify(states)}`)
    await new Promise(resolve => setTimeout(resolve, 40))
  }
}
try {
  await waitFor(() => states[0]?.status === 'finished' && states[1]?.status === 'finished')
  assert.deepEqual(states[0].scores, [3, 0])
  assert.deepEqual(states[1].wins, [1, 0])
  votes[0] = 1
  await waitFor(() => states[1].rematch[0])
  assert.equal(states[1].status, 'finished')
  votes[1] = 1
  await waitFor(() => states[0].matchNumber === 2 && states[1].matchNumber === 2)
  for (const state of states) {
    assert.equal(state.status, 'playing')
    assert.deepEqual(state.scores, [0, 0])
    assert.deepEqual(state.wins, [1, 0])
  }
  await call('leave', host)
  await waitFor(() => states[1].status === 'abandoned')
  console.log('Pages → WebSocket → Durable Object: victoria 3–0, revancha de ambos y salida verificadas.')
} finally {
  clearInterval(tick)
  for (const socket of sockets) socket.close()
  await call('leave', host)
  await call('leave', guest)
}
