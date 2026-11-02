const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

// Compartido entre Pages y el Worker. El navegador nunca recibe acceso al binding.
export async function roomsApi(request, env) {
  const url = new URL(request.url)
  const action = url.pathname.split('/').at(-1)
  const origin = request.headers.get('Origin')
  if (origin && origin !== url.origin) return json({ error: 'Origen no permitido.' }, 403)
  if (action === 'health' && request.method === 'GET') {
    return json({ ok: Boolean(env.TROMPO_ROOMS), service: 'papya-rooms' }, env.TROMPO_ROOMS ? 200 : 503)
  }
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405)
  if (!['create', 'join', 'state', 'leave'].includes(action)) return json({ error: 'Acción no válida.' }, 404)
  if (!env.TROMPO_ROOMS) return json({ error: 'Falta vincular las salas de trompos en Cloudflare.' }, 503)
  let body
  try {
    const raw = await request.text()
    if (raw.length > 2048) return json({ error: 'Solicitud demasiado grande.' }, 413)
    body = JSON.parse(raw || '{}')
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error()
  } catch { return json({ error: 'Solicitud no válida.' }, 400) }
  const forward = (code) => {
    const id = env.TROMPO_ROOMS.idFromName(code)
    return env.TROMPO_ROOMS.get(id).fetch(new Request(`https://room/${action}`, {
      method: 'POST', body: JSON.stringify({ ...body, code }),
    }))
  }
  if (action === 'create') {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = Array.from(crypto.getRandomValues(new Uint8Array(3)), b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
      const response = await forward(code)
      if (response.status !== 409) return response
    }
    return json({ error: 'Intenta crear la sala nuevamente.' }, 503)
  }
  const code = String(body.code ?? '').trim().toUpperCase()
  if (!/^[A-F0-9]{6}$/.test(code)) return json({ error: 'Código de sala no válido.' }, 400)
  return forward(code)
}
