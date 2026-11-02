import { roomsApi } from '../../../cloudflare/rooms-api.mjs'

export function onRequest({ request, env }) { return roomsApi(request, env) }
