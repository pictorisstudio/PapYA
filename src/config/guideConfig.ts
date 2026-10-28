import { MINIGAME_ORDER, MINIGAMES_CONFIG } from './minigamesConfig'
import { REQUIRED_VICTORIES } from './constants'
import type { MinigameKey } from '../types/Minigame'

export const PAPA_GUIDE_ASSET = { key: 'papa-guide', path: 'assets/ui/guide/papa-guia.png' } as const

// Consejos breves y editables, separados del personaje y de las mecánicas.
export const GUIDE_TEXTS = {
  title: 'Tu papa guía', button: 'Cómo jugar', previous: 'Anterior', next: 'Siguiente', done: 'Entendido',
  introTitle: '¡Vamos por Boyacá!',
  intro: `Completa ${REQUIRED_VICTORIES} de los ${MINIGAME_ORDER.length} retos de una ronda para abrir una ruta.`,
  introControl: 'Los juegos comienzan de inmediato. Toca, arrastra y sigue el ritmo.',
  controls: {
    ruana: 'Toca el botón del mismo color cuando llegue el hilo. Más adelante aparecerán parejas.',
    trompo: 'Mueve el joystick con un dedo y empuja al rival fuera del círculo.',
    papa: 'Toca las papas buenas cerca de lo más alto. Evita las podridas.',
    tejo: 'Arrastra hacia atrás y suelta. Haz estallar dos mechas distintas.',
    cocuy: 'Mantén pulsados los botones ◀ o ▶ para dirigir al cóndor. Las flechas de las nubes indican hacia dónde te empuja el viento.',
    cocina: 'Pon los ingredientes correctos en la olla y regula la temperatura.',
  } satisfies Record<MinigameKey, string>,
  goals: {
    ruana: 'Teje acertando al menos el 85 % de los hilos.', trompo: '¡Saca al trompo rival de la pista!',
    papa: 'Recoge 20 papas buenas.', tejo: 'Cada mecha solo puede explotar una vez.',
    cocuy: 'Esquiva las rocas: cada golpe te hace bajar 25 metros.', cocina: 'Cocina el plato sin quemarlo.',
  } satisfies Record<MinigameKey, string>,
} as const

export function guidePages() {
  return [
    { title: GUIDE_TEXTS.introTitle, control: GUIDE_TEXTS.introControl, goal: GUIDE_TEXTS.intro },
    ...MINIGAME_ORDER.map(key => ({ title: MINIGAMES_CONFIG[key].name, control: GUIDE_TEXTS.controls[key], goal: GUIDE_TEXTS.goals[key] })),
  ]
}
