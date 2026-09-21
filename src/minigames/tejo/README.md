# Tejo al Bocin

Minijuego funcional de lanzamiento 2.5D construido con Phaser 2D. La escena coordina input, HUD, flujo y resultado; la matematica del apuntado, vuelo, impacto y puntaje vive en sistemas separados.

## Flujo

El jugador presiona el tejo, arrastra hacia atras y suelta. `TejoAimSystem` calcula `power`, direccion y punto final; `TejoThrowSystem` anima el disco con un `progress` normalizado hasta ese punto; `TejoImpactSystem` clasifica el impacto solamente al finalizar el vuelo. `TejoScoreManager` decide victoria por 3 mechas o 10 puntos.

## Trayectoria

La posicion visual usa:

```ts
x = Linear(startX, targetX, progress)
baseY = Linear(startY, targetY, progress)
arc = sin(progress * PI) * arcHeight
y = baseY - arc
scale = Linear(START_SCALE, END_SCALE, progress)
```

Esto evita drift y mantiene coincidencia entre el punto visual final y el impacto logico.

## Debug

Con `DEBUG_MODE = true`, el HUD permite forzar `MECHA`, `NEAR`, `OUT`, victoria, derrota y reset. El panel global `TOUCH` muestra zonas del tablero, radio near, mechas, punto de impacto, safe area y touch area del disco. Con `DEBUG_MODE = false`, estas herramientas no se crean.
