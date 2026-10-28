# Tejiendo la Ruana

Minijuego de ritmo con cuatro carriles de colores. La victoria depende de los aciertos; la precision temporal determina el puntaje.

## Estructura

- `RuanaScene.ts`: coordina intro, countdown, gameplay, input, resultado y salida al flujo central.
- `config/ruanaConfig.ts`: centraliza ventanas de precision, posiciones, tiempos y colores temporales.
- `config/beatmapPrototype.ts`: pulso base provisional de 18 notas `{ id, lane, hitTime }`.
- `config/ruanaDifficulty.ts`: cinco patrones automaticos de 18, 22, 26, 30 y 34 notas. Agrega contratiempos y despues acordes de dos dedos, conservando los cuatro colores.
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

El reloj y las notas comienzan de inmediato, sin instrucciones ni cuenta regresiva. El jugador toca las cuatro zonas inferiores; cada dedo se transforma con la camara actual y se evalua contra la nota pendiente mas cercana de ese carril. El nivel aumenta tras rondas exitosas, se conserva al fallar y tiene limite; una sesion voluntaria nueva comienza en el nivel inicial. La musica usa la misma velocidad que el reloj al acelerar. Los tiempos base siguen siendo provisionales y requieren validar el ajuste musical con el equipo.

La duracion se calcula a partir de la ultima nota y de su margen de limpieza. Al terminar se entrega el resultado al ciclo compartido, que avanza inmediatamente si no se completa o muestra brevemente Ganaste.

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

- `PERFECT`: `<= 110 ms`
- `GOOD`: `<= 220 ms`
- `MISS`: `> 220 ms`

Formula:

`accuracy = ((perfect + good * 0.75) / totalNotes) * 100`

`GOOD` y `PERFECT` cuentan igual para completar al menos el 85 % de las notas. La ponderacion 0.75 solo se usa para medir precision y puntuar: acertar todas las notas como GOOD tambien permite ganar.

## Debug

Con `DEBUG_MODE = true` en `src/config/constants.ts` se muestran controles globales y controles especificos: clock, siguiente `hitTime`, lane siguiente, progreso visual, offset, notas activas, FPS, `PERFECT`, `MISS`, `FIN`, `GUIAS`, `REINICIAR`, y previsualizacion manual de una nota en `0%`, `25%`, `50%`, `75%` y `100%`.

Con `DEBUG_MODE = false` estas herramientas no se crean.

## Assets futuros

Los placeholders con `Graphics` y formas simples tienen comentarios `TODO` en la escena, nota e hit zone para reemplazarlos por sprites PNG/pixel art sin cambiar el contrato del microjuego.
