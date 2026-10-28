import type Phaser from 'phaser'
import { requestGameFullscreen } from './fullscreen'
import { requestLandscapeOrientation } from './landscapeLock'
import { MINIGAMES_CONFIG } from '../config/minigamesConfig'

export function installLandscapeOnly(game: Phaser.Game): void {
  const app = document.getElementById('app')
  const notice = document.getElementById('orientation-guard')
  const button = document.getElementById('orientation-fullscreen')
  if (!app || !notice) return
  let blocked = false
  let pausedByGuard = false
  let inputWasEnabled = true
  let pausedSounds: Phaser.Sound.BaseSound[] = []
  const minigameScenes = new Set(Object.values(MINIGAMES_CONFIG).map(config => config.sceneKey))

  const update = () => {
    const portrait = window.innerHeight >= window.innerWidth
    notice.hidden = !portrait
    app.inert = portrait
    if (portrait) {
      if (!blocked) {
        blocked = true
        inputWasEnabled = game.input?.enabled ?? true
        // Usa la pausa habitual del reto: cancela dedos y detiene también el reloj rítmico.
        window.dispatchEvent(new Event('papya:suspend'))
        // ScenePlugin.pause se encola para el próximo cuadro. Pausar ahora evita
        // que el reloj basado en performance.now siga corriendo mientras Game está detenido.
        for (const scene of game.scene.getScenes(true)) {
          if (minigameScenes.has(scene.scene.key)) game.scene.pause(scene.scene.key)
        }
        pausedSounds = game.sound?.getAllPlaying() ?? []
        pausedSounds.forEach(sound => sound.pause())
        pausedByGuard = !game.isPaused
      }
      if (game.input) game.input.enabled = false
      game.pause()
    } else if (blocked) {
      blocked = false
      if (game.input) game.input.enabled = inputWasEnabled
      if (pausedByGuard) game.resume()
      pausedSounds.forEach(sound => { if (sound.isPaused && !sound.pendingRemove) sound.resume() })
      pausedSounds = []
      pausedByGuard = false
      // Si se estaba jugando, se conserva PauseScene hasta que se pulse Continuar.
    }
  }
  const enterFullscreen = () => { void requestGameFullscreen() }
  const retryLock = () => { void requestLandscapeOrientation() }
  button?.addEventListener('click', enterFullscreen)
  window.addEventListener('resize', update)
  window.addEventListener('orientationchange', update)
  window.screen?.orientation?.addEventListener('change', update)
  window.addEventListener('pointerup', retryLock)
  document.addEventListener('fullscreenchange', retryLock)
  document.addEventListener('webkitfullscreenchange', retryLock)
  game.events.once('ready', update)
  game.events.once('destroy', () => {
    button?.removeEventListener('click', enterFullscreen)
    window.removeEventListener('resize', update)
    window.removeEventListener('orientationchange', update)
    window.screen?.orientation?.removeEventListener('change', update)
    window.removeEventListener('pointerup', retryLock)
    document.removeEventListener('fullscreenchange', retryLock)
    document.removeEventListener('webkitfullscreenchange', retryLock)
    game.events.off('ready', update)
  })
  update()
  retryLock()
}
