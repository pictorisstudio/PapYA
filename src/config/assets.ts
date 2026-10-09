import type { RouteId } from '../types/SaveData'

// Claves fijas: cambiar un archivo o su ruta no cambia las escenas.
export const POTATO_ASSETS = {
  GOOD: [
    { key: 'papa-good-01', path: 'assets/minigames/papa/Papa-Buena-01.png' },
    { key: 'papa-good-02', path: 'assets/minigames/papa/Papa-Buena-02.png' },
    { key: 'papa-good-03', path: 'assets/minigames/papa/Papa-Buena-03.png' },
  ],
  BAD: [
    { key: 'papa-bad-01', path: 'assets/minigames/papa/Papa-Mala-01.png' },
    { key: 'papa-bad-02', path: 'assets/minigames/papa/Papa-Mala-02.png' },
    { key: 'papa-bad-03', path: 'assets/minigames/papa/Papa-Mala-03.png' },
  ],
} as const

// Sustituir estos SVG por el arte final o cambiar solo path (PNG/JPG/SVG).
export const ROUTE_CARD_ASSETS: Record<RouteId, { key: string; path: string }> = {
  route1: { key: 'route-card-1', path: 'assets/routes/route1.svg' },
  route2: { key: 'route-card-2', path: 'assets/routes/route2.svg' },
  route3: { key: 'route-card-3', path: 'assets/routes/route3.svg' },
  route4: { key: 'route-card-4', path: 'assets/routes/route4.svg' },
  route5: { key: 'route-card-5', path: 'assets/routes/route5.svg' },
}
