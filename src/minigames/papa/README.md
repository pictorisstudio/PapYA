# Cosecha de Papa

Prototipo tecnico del segundo microjuego de PapYA. Valida spawn, trayectorias parabolicas, input tactil sobre papas, good/bad, puntaje y condicion de victoria sin arte final.

## Estructura

- `PapaScene.ts`: coordina escena, input, update, resultado y salida al flujo central.
- `config/papaConfig.ts`: centraliza objetivo, duracion, spawn, velocidades, gravedad y colores temporales.
- `systems/PotatoSpawnManager.ts`: controla frecuencia, tipo, origen, trayectoria inicial y maximo de papas activas.
- `systems/PotatoScoreManager.ts`: acumula papas buenas, papas dañadas, puntaje y victoria.
- `entities/Potato.ts`: entidad visual placeholder con estado `ACTIVE`, `HIT`, `MISSED`, `DESTROYED`.
- `ui/FieldDisplay.ts`: escenario provisional con cielo, paisaje y cultivo.
- `ui/PapaHUD.ts`: HUD y controles debug especificos.
- `types/PapaTypes.ts`: contratos internos del modulo.

## Reglas

- Objetivo: `GOOD_POTATO_TARGET = 20`.
- Duracion: `GAME_DURATION = 30000`.
- Papa buena: suma `POTATO_SCORE`.
- Papa dañada: registra error y derrota inmediata si `BAD_POTATO_IMMEDIATE_DEFEAT = true`.
- Sin vidas, combos, swipe ni powerups por ahora.

## Trayectoria

Cada papa nace bajo el cultivo con velocidad vertical negativa, velocidad horizontal variable, gravedad y rotacion ligera. La curva es parabolica y desaparece al volver bajo la linea del cultivo o al salir del ancho visible.

## Debug

Con `DEBUG_MODE = true`, el HUD permite generar papa buena/dañada, limpiar papas, forzar victoria/derrota, mostrar hitboxes, pausar spawn y reiniciar la escena. Con `DEBUG_MODE = false`, estas herramientas no se crean.

## Object Pooling

En esta fase las papas se crean y destruyen con un limite bajo (`MAX_ACTIVE_POTATOES`). La entidad y el spawn manager quedan aislados para introducir pooling despues sin tocar `PapaScene` ni la logica de scoring.
