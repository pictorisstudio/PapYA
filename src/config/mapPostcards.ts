import type { RouteId } from '../types/SaveData'

type Art = { key: string; path: string }
type Postcard = { label: string; title: string; fact: string; icon: Art; paper?: Art }

const routeIcon = (name: string): Art => ({
  key: `map-icon-${name.toLowerCase()}`,
  path: `assets/ui/IconoRuta/${name}.png`,
})

// Agregar «paper» con la clave y ruta del fondo definitivo de cada postal.
export const MAP_POSTCARDS: Record<RouteId, Postcard> = {
  route1: {
    label: 'Tiple',
    title: 'Los sonidos de Boyacá',
    icon: routeIcon('TIPLE'),
    fact: '¿Sabías que el tiple colombiano tiene 12 cuerdas agrupadas en cuatro órdenes de tres cuerdas y fue declarado patrimonio cultural y artístico de Colombia en 2005?',
  },
  route2: {
    label: 'Cosecha de papa',
    title: 'Tesoros de la tierra',
    icon: routeIcon('PAPApng'),
    fact: '¿Sabías que en Boyacá se cultivan diferentes variedades de papa, como la Parda Pastusa, la Criolla y la Diacol Capiro? Cada una tiene características propias de sabor, color y textura.',
  },
  route3: {
    label: 'Tejo al bocín',
    title: '¡Al bocín!',
    icon: routeIcon('TEJO'),
    fact: '¿Sabías que el tejo también se conoce como turmequé? Es un juego tradicional colombiano asociado con las prácticas recreativas de los pueblos muiscas de la región andina.',
  },
  route4: {
    label: 'Torneo de trompos',
    title: 'Duelo de Trompos',
    icon: routeIcon('TROMPO'),
    fact: '¿Sabías que uno de los juegos tradicionales con trompos consiste en hacerlos girar dentro de un círculo e intentar sacar el trompo del rival? ¡La destreza y la precisión son fundamentales!',
  },
  route5: {
    label: 'Ascenso al Cocuy',
    title: 'Cumbres del Cocuy',
    icon: routeIcon('CONDOR'),
    fact: '¿Sabías que la Sierra Nevada del Cocuy alberga la mayor superficie glaciar de Colombia? Sus montañas y páramos forman parte de un ecosistema donde habitan especies emblemáticas como el cóndor de los Andes.',
  },
}
