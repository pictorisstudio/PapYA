import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
// Usa las matemáticas y geometría reales de Phaser; sustituye solo el entorno gráfico.
export default {
  Math: require('../node_modules/phaser/src/math'),
  Geom: require('../node_modules/phaser/src/geom'),
  Core: { Events: require('../node_modules/phaser/src/core/events') },
  Scenes: { Events: require('../node_modules/phaser/src/scene/events') },
  Scene: class { constructor(key) { this.scene = { key } } },
  GameObjects: { Image: class {} },
}

