import Phaser from 'phaser'
import { gameManager } from '../core/GameManager'

export default class TransitionScene extends Phaser.Scene {
  constructor() { super('TransitionScene') }
  create(): void {
    const game = gameManager.getCurrentMinigame()
    this.scene.start(game.sceneKey)
  }
}
