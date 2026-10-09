import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import GameplaySession from '../components/GameplaySession'
import { MINIGAME_INSTRUCTION_DURATION_MS } from '../config/constants'
import { TEXTS } from '../config/texts'
import { gameManager } from '../core/GameManager'

export default class TransitionScene extends Phaser.Scene {
  constructor() { super('TransitionScene') }
  create(): void {
    const game = gameManager.getCurrentMinigame()
    const state = gameManager.roundManager.getState()
    const copy = TEXTS.minigames[game.key]
    this.cameras.main.setBackgroundColor('#10131a')
    this.add.text(640, 66, gameManager.isPractice ? TEXTS.practice : TEXTS.challenge(state.currentIndex + 1, state.minigameOrder.length), {
      fontSize: '27px', color: '#aab3c5',
    }).setOrigin(0.5)
    this.add.text(640, 360, copy.objective, {
      fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#6ee7b7',
      align: 'center', wordWrap: { width: 1000 },
    }).setOrigin(0.5)
    this.time.delayedCall(MINIGAME_INSTRUCTION_DURATION_MS, () => this.scene.start(game.sceneKey))
    new GameplaySession(this)
    new DebugPanel(this)
  }
}
