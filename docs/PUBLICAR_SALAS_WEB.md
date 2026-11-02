# Publicar salas en Cloudflare

PapYá conserva https://papya.pages.dev. Pages sirve el juego; el Worker `papya-salas` aloja los Durable Objects (una sala por objeto). Todo queda en la misma cuenta, sin otro proveedor ni dominio.

## Activación inicial

En una terminal en `C:\PapYA`:

```powershell
npm run cloudflare:login
npm run rooms:deploy
```

El primer comando abre la autorización oficial: entrar con la **misma cuenta que contiene Pages papya**. El segundo publica el servicio y crea el recurso de salas. Si aparecen varias cuentas, seleccionar la de PapYá. No compartir contraseñas ni tokens en el chat.

Después:

1. Subir los cambios al GitHub conectado a Pages, incluyendo `cloudflare`, `functions`, `wrangler.jsonc`, `public/_routes.json`, `package.json` y el lockfile. No se ha hecho commit ni push automáticamente.
2. En Pages `papya`, conservar build `npm run build` y salida `dist`. **Eliminar `VITE_MULTIPLAYER_SERVER_URL` si tiene otra dirección**, o dejarla vacía. El binding `TROMPO_ROOMS` ya está declarado en el `wrangler.jsonc` raíz; no hay que añadirlo manualmente en el panel.
3. Esperar el despliegue. Publicar el Worker **antes** de desplegar Pages, para que exista el recurso al cual apunta el binding.
4. Abrir https://papya.pages.dev/api/multiplayer/health: debe devolver `{"ok":true,"service":"papya-rooms"}`. Crear sala desde un teléfono y entrar con el código desde otro.

Los cambios del juego siguen publicándose mediante GitHub. Cuando cambie el código de las salas o su física compartida, ejecutar también `npm run rooms:deploy`. Opcionalmente conectar el Worker al mismo repositorio mediante Workers Builds (raíz del repositorio, comando de despliegue `npm run rooms:deploy`) para automatizarlo.

## Archivos

- `cloudflare/wrangler.jsonc`: Worker, binding interno y migración SQLite de `TrompoRoom`.
- `wrangler.jsonc` raíz: Pages y binding hacia `TrompoRoom` del Worker `papya-salas`.
- `functions/api/multiplayer/[[path]].js`: acceso desde la web al binding privado, sin URL externa.
- `public/_routes.json`: solo las rutas de salas usan Functions; los assets siguen siendo estáticos.
- `workers_dev: false`: el Worker no necesita una dirección pública adicional.

## Prueba local

Primera terminal: `npm run rooms:dev`. Segunda terminal:

```powershell
npm run build
npx wrangler pages dev dist --port 8788
```

Abrir http://127.0.0.1:8788. Pages debe mostrar el binding `local [connected]`. Ejecutar `node tests/cloudflare-live.mjs` con ambos procesos activos para verificar dos jugadores y una victoria a tres puntos. No ejecutar a la vez el servidor Node antiguo en 8787.

## Funcionamiento y diagnóstico

Las salas duran como máximo 15 minutos y una alarma elimina sus datos. El estado se guarda en el Durable Object: la simulación avanza con reloj del servidor en pasos de 1/60 s antes de aplicar nuevas entradas. No acepta posiciones ni puntajes del cliente. Las entradas vencen en 500 ms; una desconexión de 15 segundos cierra el duelo. El modo individual y su progreso no cambian.

Las consultas cada 80 ms consumen solicitudes y operaciones de almacenamiento sujetas a las cuotas de Cloudflare. No se promete uso ilimitado; WebSockets sería la siguiente mejora para más jugadores simultáneos. La APK local requiere adaptar su conexión; esta configuración cubre la web.

Si el despliegue menciona una clase inexistente, publicar primero `npm run rooms:deploy` en la misma cuenta y redesplegar Pages. Si health devuelve HTML, revisar que se publicaron las Functions desde la raíz del repositorio. Si create llama a otro dominio, borrar la variable Vite antigua y reconstruir.

Documentación oficial: [configuración de Pages](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) y [Durable Objects](https://developers.cloudflare.com/durable-objects/get-started/).

## Validación de esta adaptación

Tipos y compilación correctos. Pasan 80 pruebas del juego existente, 3 de simulación/servidor local y 2 de Cloudflare (persistencia, credenciales, normalización, victoria, caducidad y acceso por Pages). Además se probó con Wrangler real local: Pages enlazado al Durable Object, creación de sala, entrada del segundo cliente, rechazo del tercero, movimiento y resultado 3–0. No se ha publicado en la cuenta de Cloudflare ni hecho push a GitHub.
