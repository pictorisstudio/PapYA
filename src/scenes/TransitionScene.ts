import Phaser from 'phaser'
import InstructionPanel from '../components/InstructionPanel'
import VictoryCounter from '../components/VictoryCounter'
import DebugPanel from '../components/DebugPanel'
import { gameManager } from '../core/GameManager'

export default class TransitionScene extends Phaser.Scene {
  private nextSceneKey = ''
  private transitionTimeoutId: number | null = null

  constructor() {
    super('TransitionScene')
  }

  create(): void {
    const minigame = gameManager.getCurrentMinigame()
    const state = gameManager.roundManager.getState()

    this.nextSceneKey = minigame.sceneKey

    this.cameras.main.setBackgroundColor('#10131a')
    this.add.text(640, 126, `Reto ${state.currentIndex + 1}/5`, { fontSize: '30px', color: '#aab3c5' }).setOrigin(0.5)
    this.add.text(640, 210, minigame.name, { fontSize: '48px', fontStyle: '700', color: '#f8fafc' }).setOrigin(0.5)
    new InstructionPanel(this, 640, 324, minigame.instruction)

    const counter = new VictoryCounter(this, 640, 438)
    counter.update(state.victories, state.minigameOrder.length)

    new DebugPanel(this)
    this.transitionTimeoutId = window.setTimeout(() => this.startNextScene(), 1100)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  private startNextScene(): void {
    if (!this.nextSceneKey) {
      return
    }

    const sceneKey = this.nextSceneKey
    this.nextSceneKey = ''
    this.scene.start(sceneKey)
  }

  private cleanup(): void {
    if (this.transitionTimeoutId !== null) {
      window.clearTimeout(this.transitionTimeoutId)
      this.transitionTimeoutId = null
    }
  }
}
