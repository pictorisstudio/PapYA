type LockableOrientation = ScreenOrientation & { lock?: (orientation: 'landscape') => Promise<void> }

// Algunos navegadores solo permiten bloquear la orientación en pantalla completa.
export async function requestLandscapeOrientation(): Promise<boolean> {
  const orientation = window.screen?.orientation as LockableOrientation | undefined
  if (!orientation?.lock) return false
  try {
    await orientation.lock('landscape')
    return true
  } catch {
    // El aviso de giro sigue bloqueando el juego si el navegador no lo permite.
    return false
  }
}
