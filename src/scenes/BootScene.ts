import Phaser from 'phaser'
import { gameManager } from '../core/GameManager'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  create(): void {
    gameManager.initialize()
    this.scene.start('PreloaderScene')
  }
}
