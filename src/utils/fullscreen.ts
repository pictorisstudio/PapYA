import { requestLandscapeOrientation } from './landscapeLock'

type FullscreenDocument = Document & { webkitFullscreenElement?: Element }
type FullscreenRoot = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }

// Solo se llama desde un gesto real del jugador; no bloquear el juego si se rechaza.
export async function requestGameFullscreen(): Promise<boolean> {
  const doc = document as FullscreenDocument
  if (doc.fullscreenElement || doc.webkitFullscreenElement) {
    await requestLandscapeOrientation()
    return true
  }
  const root = doc.documentElement as FullscreenRoot | undefined
  try {
    if (root?.requestFullscreen) await root.requestFullscreen({ navigationUI: 'hide' })
    else if (root?.webkitRequestFullscreen) await root.webkitRequestFullscreen()
    else { await requestLandscapeOrientation(); return false }
    await requestLandscapeOrientation()
    return true
  } catch {
    await requestLandscapeOrientation()
    return false
  }
}

export function requestFullscreenOnPlay(): void {
  // Los botones Phaser usan pointerdown; en pantallas táctiles la activación
  // requerida por fullscreen llega en pointerup, al soltar el dedo.
  window.addEventListener('pointerup', () => { void requestGameFullscreen() }, { once: true })
}
