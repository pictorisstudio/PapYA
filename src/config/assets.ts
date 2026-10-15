import type { RouteId } from '../types/SaveData'

// Piezas independientes, no cuadros de animación. Los originales son PNG de 64×64.
export const COCINA_ASSETS = {
  cubios: { key: 'cocina-cubios', path: 'assets/minigames/cocina/cubios.png' },
  mazorca: { key: 'cocina-mazorca', path: 'assets/minigames/cocina/mazorca.png' },
  fresa: { key: 'cocina-fresa', path: 'assets/minigames/cocina/fresa.png' },
  berenjena: { key: 'cocina-berenjena', path: 'assets/minigames/cocina/berenjena.png' },
  pared: { key: 'cocina-pared', path: 'assets/minigames/cocina/fondo-pared.png' },
  mesa: { key: 'cocina-mesa', path: 'assets/minigames/cocina/mesa-fondo.png' },
  hornilla: { key: 'cocina-hornilla', path: 'assets/minigames/cocina/hornilla.png' },
  fuego1: { key: 'cocina-fuego-01', path: 'assets/minigames/cocina/fuego-01.png' },
  fuego2: { key: 'cocina-fuego-02', path: 'assets/minigames/cocina/fuego-02.png' },
  fuego3: { key: 'cocina-fuego-03', path: 'assets/minigames/cocina/fuego-03.png' },
  brocoli: { key: 'cocina-brocoli', path: 'assets/minigames/cocina/brocoli.png' },
  costilla: { key: 'cocina-costilla', path: 'assets/minigames/cocina/costilla-vaca.png' },
  habas: { key: 'cocina-habas', path: 'assets/minigames/cocina/habas.png' },
  papa: { key: 'cocina-papa', path: 'assets/minigames/cocina/papa.png' },
  ollaAtras: { key: 'cocina-olla-atras', path: 'assets/minigames/cocina/olla-atras.png' },
  caldo: { key: 'cocina-caldo', path: 'assets/minigames/cocina/olla-caldo-medio.png' },
  ollaFrente: { key: 'cocina-olla-frente', path: 'assets/minigames/cocina/olla-frente.png' },
} as const

// Dos diseños alternativos del disco; no se deben alternar como una animación.
export const TEJO_ASSETS = {
  bocin: { key: 'tejo-bocin', path: 'assets/minigames/tejo/bocin.png' },
  cancha: { key: 'tejo-cancha', path: 'assets/minigames/tejo/cancha.png' },
  explosion: { key: 'tejo-explosion', path: 'assets/minigames/tejo/explosion.png' },
  mecha: { key: 'tejo-mecha', path: 'assets/minigames/tejo/mecha.png' },
  sombra: { key: 'tejo-sombra', path: 'assets/minigames/tejo/sombra.png' },
  discoSimple: { key: 'tejo-disco-simple', path: 'assets/minigames/tejo/tejo-simple.png' },
  discoDetallado: { key: 'tejo-disco-detallado', path: 'assets/minigames/tejo/tejo-detallado.png' },
} as const

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
