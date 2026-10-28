import Phaser from 'phaser'
import PauseScene from '../scenes/PauseScene'
import DevScene from '../scenes/DevScene'
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './constants'
import BootScene from '../scenes/BootScene'
import PreloaderScene from '../scenes/PreloaderScene'
import MenuScene from '../scenes/MenuScene'
import MapScene from '../scenes/MapScene'
import TransitionScene from '../scenes/TransitionScene'
import ResultsScene from '../scenes/ResultsScene'
import ExplorationScene from '../scenes/ExplorationScene'
import RuanaScene from '../minigames/ruana/RuanaScene'
import CocinaScene from '../minigames/cocina/CocinaScene'
import PapaScene from '../minigames/papa/PapaScene'
import TejoScene from '../minigames/tejo/TejoScene'
import CocuyScene from '../minigames/cocuy/CocuyScene'
import TrompoScene from '../minigames/trompo/TrompoScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#10131a',
  pixelArt: true,
  input: { activePointers: 5 },
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT,
  },
  scene: [
    BootScene,
    PauseScene,
    DevScene,
    PreloaderScene,
    MenuScene,
    MapScene,
    TransitionScene,
    ResultsScene,
    ExplorationScene,
    RuanaScene,
    CocinaScene,
    TrompoScene,
    PapaScene,
    TejoScene,
    CocuyScene,
  ],
}
