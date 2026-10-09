import type Phaser from 'phaser'
import { gameManager } from '../core/GameManager'
import RoundManager from '../core/RoundManager'

// Herramienta descartable: borrar este módulo y su único import en DebugPanel.
// No se incluye en producción. Nunca borra otros datos del almacenamiento.
export function openProgressReset(scene: Phaser.Scene): void {
  if (!import.meta.env.DEV || !gameManager.debugManager.areControlsEnabled()) return
  if (document.getElementById('papya-dev-reset')) return

  const overlay = document.createElement('div')
  overlay.id = 'papya-dev-reset'
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#05070cee;display:grid;place-items:center;font-family:Arial,sans-serif;color:#f8fafc'
  const panel = document.createElement('section')
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-modal', 'true')
  panel.setAttribute('aria-labelledby', 'papya-dev-reset-title')
  panel.style.cssText = 'background:#172033;padding:28px;border:2px solid #f87171;border-radius:12px;width:min(460px,80vw)'
  const title = document.createElement('h2')
  title.id = 'papya-dev-reset-title'
  title.textContent = 'Borrar progreso de PapYá'
  const copy = document.createElement('p')
  copy.textContent = 'Solo desarrollo. Se borrarán rutas, récords y el viaje actual de este dispositivo. Escribe BORRAR para confirmar.'
  const input = document.createElement('input')
  input.setAttribute('aria-label', 'Escribe BORRAR')
  input.autocomplete = 'off'
  input.style.cssText = 'box-sizing:border-box;width:100%;font-size:22px;padding:10px;margin:10px 0 20px'
  const cancel = document.createElement('button')
  cancel.textContent = 'Cancelar'
  const confirm = document.createElement('button')
  confirm.textContent = 'Borrar todo el progreso'
  confirm.disabled = true
  for (const button of [cancel, confirm]) button.style.cssText = 'font-size:16px;padding:12px;margin:4px;cursor:pointer'
  confirm.style.background = '#f87171'
  panel.append(title, copy, input, cancel, confirm)
  overlay.append(panel)
  document.body.append(overlay)
  scene.scene.pause()
  scene.sound.pauseAll()

  const dispose = () => {
    overlay.remove()
    window.removeEventListener('keydown', onKey, true)
    window.removeEventListener('papya:back', onBack, true)
    scene.events.off('shutdown', dispose)
  }
  const close = () => {
    dispose()
    scene.scene.resume()
    scene.sound.resumeAll()
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close() }
  }
  const onBack = (event: Event) => {
    event.preventDefault(); event.stopImmediatePropagation(); close()
  }
  input.addEventListener('input', () => { confirm.disabled = input.value !== 'BORRAR' })
  cancel.addEventListener('click', close)
  confirm.addEventListener('click', () => {
    if (!import.meta.env.DEV || !gameManager.debugManager.areControlsEnabled() || input.value !== 'BORRAR') return
    gameManager.progressManager.reset()
    if (!gameManager.saveManager.storageAvailable) {
      copy.textContent = 'No se pudo guardar el borrado en este dispositivo. Comprueba el almacenamiento antes de continuar.'
      return
    }
    gameManager.roundManager = new RoundManager()
    gameManager.lastUnlockedRoute = null
    gameManager.lastRoutePerfect = false
    gameManager.isPractice = false
    dispose()
    scene.sound.stopAll()
    scene.scene.stop('PauseScene')
    scene.scene.start('MenuScene')
  })
  window.addEventListener('keydown', onKey, true)
  window.addEventListener('papya:back', onBack, true)
  scene.events.once('shutdown', dispose)
  input.focus()
}
