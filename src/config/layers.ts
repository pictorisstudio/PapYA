import type Phaser from 'phaser'

// El mundo usa profundidad por Y; el HUD siempre queda por encima.
export const LAYERS = {
  background: -100, scenery: -50, world: 0,
  hud: 1200, feedback: 1300, debug: 1800, overlay: 2200,
} as const

// Mantiene juntos los objetos creados por un HUD, incluidos sus controles debug.
export function applyHudLayers(scene: Phaser.Scene, firstObject: number, minimal = true): void {
  for (const object of scene.children.list.slice(firstObject)) {
    const drawable = object as Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Depth
    if (typeof drawable.setDepth !== 'function') continue
    const isDebug = drawable.depth >= 900 && drawable.depth <= 903
    drawable.setDepth(isDebug ? LAYERS.debug + drawable.depth - 900 : LAYERS.hud)
    if (minimal && !isDebug) (drawable as unknown as { setVisible(value: boolean): void }).setVisible(false)
  }
}
