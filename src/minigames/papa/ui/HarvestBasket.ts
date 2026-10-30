import Phaser from 'phaser'
import { SACK_ASSETS } from '../../../config/uiAssets'
import { LAYERS } from '../../../config/layers'
import type { PotatoScoreSnapshot } from '../types/PapaTypes'

// Tres estados de arte; el puntaje sigue perteneciendo a PotatoScoreManager.
export default class HarvestBasket {
  private readonly container: Phaser.GameObjects.Container
  private readonly countText: Phaser.GameObjects.Text
  private readonly remainingText: Phaser.GameObjects.Text
  private readonly sack: Phaser.GameObjects.Image
  private count = -1
  private target = -1

  constructor(scene: Phaser.Scene) {
    this.sack = scene.add.image(0, 0, SACK_ASSETS[0].key).setDisplaySize(190, 190)
    this.countText = scene.add.text(0, -110, '', {
      fontSize: '34px', fontStyle: 'bold', color: '#ffffff', stroke: '#24180f', strokeThickness: 5,
    }).setOrigin(0.5)
    this.remainingText = scene.add.text(0, 126, '', {
      fontSize: '28px', color: '#ffe2a2', stroke: '#24180f', strokeThickness: 5,
    }).setOrigin(0.5)
    this.container = scene.add.container(145, 550,
      [this.sack, this.countText, this.remainingText]).setDepth(LAYERS.scenery + 1)
  }

  update(score: PotatoScoreSnapshot): void {
    if (this.count === score.goodPotatoesCollected && this.target === score.target) return
    this.count = score.goodPotatoesCollected
    this.target = score.target
    this.countText.setText(`${this.count} / ${this.target}`)
    this.remainingText.setText(`Faltan ${Math.max(0, this.target - this.count)}`)
    const progress = this.target > 0 ? this.count / this.target : 0
    const frame = progress >= 2 / 3 ? 2 : progress >= 1 / 3 ? 1 : 0
    this.sack.setTexture(SACK_ASSETS[frame].key).setDisplaySize(190, 190)
  }

  destroy(): void { this.container.destroy(true) }
}
