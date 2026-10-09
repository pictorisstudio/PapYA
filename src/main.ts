import Phaser from 'phaser'
import { gameConfig } from './config/gameConfig'
import type MapScene from './scenes/MapScene'
import './style.css'

const game = new Phaser.Game(gameConfig)

// Android Atrás: las escenas de juego lo consumen como pausa.
// Fuera del reto regresa una pantalla; en el menú deja actuar al sistema.
window.addEventListener('papya:back', event => {
  const active = game.scene.getScenes(true).find(scene => scene.scene.key !== 'PauseScene')
  if (active?.scene.key === 'MapScene' && (active as MapScene).closeRouteCard()) {
    event.preventDefault()
    return
  }
  const destinations: Record<string, string> = {
    MapScene: 'MenuScene', ExplorationScene: 'MapScene', ResultsScene: 'MapScene', DevScene: 'MenuScene',
  }
  const destination = active && destinations[active.scene.key]
  if (destination && active) {
    event.preventDefault()
    active.scene.start(destination)
  }
})
