# Tejiendo la Ruana

Prototipo tecnico del primer microjuego de PapYA. Valida sincronizacion temporal, carriles con falsa perspectiva 2.5D, input tactil por lane, scoring y victoria por precision sin introducir arte final.

## Estructura

- `RuanaScene.ts`: coordina intro, countdown, gameplay, input, resultado y salida al flujo central.
- `config/ruanaConfig.ts`: centraliza ventanas de precision, posiciones, tiempos y colores temporales.
- `config/beatmapPrototype.ts`: beatmap local provisional con 18 notas `{ id, lane, hitTime }`, listo para migrar a JSON.
- `systems/RhythmClock.ts`: reloj de alta precision basado en `performance.now()`. El tiempo absoluto es la fuente de verdad para evitar drift por FPS.
- `systems/LaneProjector.ts`: convierte `lane + progress` en `x, y, scale` usando interpolacion y easing visual.
- `systems/NoteManager.ts`: crea notas desde el beatmap, actualiza posiciones, detecta notas vencidas y limpia entidades.
- `systems/HitJudge.ts`: selecciona la nota activa mas cercana dentro del lane tocado y clasifica `PERFECT`, `GOOD` o `MISS`.
- `systems/RuanaScoreManager.ts`: acumula resultados, score, precision y condicion de victoria.
- `entities/RhythmNote.ts`: representacion visual placeholder del hilo.
- `ui/HitZone.ts`: cuatro marcas provisionales del telar, deteccion de lane y feedback local.
- `ui/RuanaHUD.ts`: HUD de precision, conteos, feedback y controles debug especificos.
- `ui/RuanaProgressDisplay.ts`: placeholder visual del tejido que crece con aciertos validos.

## Flujo

Al entrar se muestra una introduccion breve, luego cuenta regresiva `3, 2, 1, ¡YA!`. Despues inicia `RhythmClock`, aparecen las notas segun `hitTime - NOTE_TRAVEL_TIME`, el jugador toca una de las cuatro zonas inferiores con `pointerdown`, y la escena evalua contra la nota activa mas cercana solamente en ese lane. Al terminar todas las notas se muestra el resultado y se llama a `gameManager.completeCurrentMinigame(victory)` para continuar con `TransitionScene` o `ResultsScene`.

## Timing

Las notas no usan movimiento acumulativo tipo `x += velocity * delta`. Cada posicion se reconstruye desde `currentTime`, `scheduledHitTime` y `NOTE_TRAVEL_TIME`:

`progress = (currentTime - spawnTime) / (hitTime - spawnTime)`

`LaneProjector` aplica un easing visual configurable y proyecta:

- `x = Linear(startX, endX, visualProgress)`
- `y = Linear(startY, endY, visualProgress)`
- `scale = Linear(MIN_NOTE_SCALE, MAX_NOTE_SCALE, visualProgress)`

La sincronizacion depende siempre de `hitTime`; la perspectiva es solo representacion.

## Precision

Valores actuales:

- `PERFECT`: `<= 80 ms`
- `GOOD`: `<= 160 ms`
- `MISS`: `> 160 ms`

Formula:

`accuracy = ((perfect + good * 0.75) / totalNotes) * 100`

`GOOD` es un acierto valido, pero ponderado para reflejar menor precision temporal. La victoria se obtiene con `accuracy >= 85`.

## Debug

Con `DEBUG_MODE = true` en `src/config/constants.ts` se muestran controles globales y controles especificos: clock, siguiente `hitTime`, lane siguiente, progreso visual, offset, notas activas, FPS, `PERFECT`, `MISS`, `FIN`, `GUIAS`, `REINICIAR`, y previsualizacion manual de una nota en `0%`, `25%`, `50%`, `75%` y `100%`.

Con `DEBUG_MODE = false` estas herramientas no se crean.

## Assets futuros

Los placeholders con `Graphics` y formas simples tienen comentarios `TODO` en la escena, nota e hit zone para reemplazarlos por sprites PNG/pixel art sin cambiar el contrato del microjuego.
