import type Phaser from 'phaser'
import { SCENE_ASSETS } from '../config/sceneAssets'
import { COCINA_ASSETS } from '../config/assets'
import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../config/constants'
import { LAYERS } from '../config/layers'

// visualViewport excluye las barras del navegador; el contenedor interior respeta el notch.
export function installMobileViewport(game: Phaser.Game): void {
  const app = document.getElementById('app')
  if (!app) return
  app.style.backgroundImage = 'none'
  let frame = 0
  const refresh = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const viewport = window.visualViewport
      app.style.width = `${viewport?.width ?? window.innerWidth}px`
      app.style.height = `${viewport?.height ?? window.innerHeight}px`
      app.style.left = `${viewport?.offsetLeft ?? 0}px`
      app.style.top = `${viewport?.offsetTop ?? 0}px`
      game.scale.refresh()
    })
  }
  // Reusar texturas decodificadas: no hay imágenes CSS que cargar al cambiar de juego.
  const backgrounds = new Set<string>([
    SCENE_ASSETS.menuBackground.key, SCENE_ASSETS.papaBackground.key, SCENE_ASSETS.papaFloor.key,
    SCENE_ASSETS.ruanaBackground.key, SCENE_ASSETS.tejoBackground.key, COCINA_ASSETS.pared.key, COCINA_ASSETS.mesa.key,
  ])
  const layouts = new WeakMap<Phaser.Scene, { width: number; height: number; first: Phaser.GameObjects.GameObject | undefined }>()
  const updateLayout = () => {
    const width = game.scale.gameSize?.width ?? LOGICAL_WIDTH
    const height = game.scale.gameSize?.height ?? LOGICAL_HEIGHT
    for (const scene of game.scene.getScenes(true)) {
      const camera = scene.cameras?.main
      if (!camera) continue
      const children = scene.children.list
      const previous = layouts.get(scene)
      if (previous?.width === width && previous.height === height && previous.first === children[0]) continue
      layouts.set(scene, { width, height, first: children[0] })
      camera.setScroll((LOGICAL_WIDTH - width) / 2, (LOGICAL_HEIGHT - height) / 2)
      for (const child of children) {
        const item = child as Phaser.GameObjects.Image
        if (item.texture?.key === SCENE_ASSETS.summit.key) {
          // Compensar el recorte del PNG y cubrir también el ancho extra del móvil.
          item.setDisplaySize((width + 32) * 64 / 62, Math.max(1280, height + 400))
        } else if (backgrounds.has(item.texture?.key)) {
          item.setOrigin(0.5).setPosition(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2).setDisplaySize(width, height)
        } else if (child.type === 'Rectangle' && item.width === LOGICAL_WIDTH && item.height === LOGICAL_HEIGHT) {
          item.setDisplaySize(width, height)
        } else if (child.type === 'Graphics' && item.depth === LAYERS.background) {
          item.setScale(width / LOGICAL_WIDTH, height / LOGICAL_HEIGHT)
          item.setPosition((LOGICAL_WIDTH - width) / 2, (LOGICAL_HEIGHT - height) / 2)
        }
      }
    }
  }
  window.addEventListener('resize', refresh)
  window.addEventListener('orientationchange', refresh)
  window.visualViewport?.addEventListener('resize', refresh)
  window.visualViewport?.addEventListener('scroll', refresh)
  game.events.on('prerender', updateLayout)
  game.events.once('destroy', () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', refresh)
    window.removeEventListener('orientationchange', refresh)
    window.visualViewport?.removeEventListener('resize', refresh)
    window.visualViewport?.removeEventListener('scroll', refresh)
    game.events.off('prerender', updateLayout)
  })
  refresh()
}
