import Phaser from 'phaser'
import { POTATO_ASSETS } from '../../../config/assets'
import { LAYERS } from '../../../config/layers'
import type { PotatoScoreSnapshot } from '../types/PapaTypes'

// Canasta provisional dibujada en código; reutiliza los PNG de las papas buenas.
export default class HarvestBasket {
  private readonly container: Phaser.GameObjects.Container
  private readonly countText: Phaser.GameObjects.Text
  private readonly remainingText: Phaser.GameObjects.Text
  private readonly potatoes: Phaser.GameObjects.Image[]
  private count = -1
  private target = -1
  private readonly flights = new Set<Phaser.GameObjects.Image>()

  constructor(private readonly scene: Phaser.Scene) {
    const back = scene.add.graphics()
    back.fillStyle(0x14251c, 0.88).fillRoundedRect(-116, -120, 232, 268, 16)
    back.lineStyle(12, 0x684023).strokeEllipse(0, -6, 148, 140)
    back.fillStyle(0x59361e, 1).fillRoundedRect(-93, -5, 186, 108, 12)
    this.potatoes = Array.from({ length: 20 }, (_, index) => scene.add.image(
      -68 + (index % 5) * 34, 67 - Math.floor(index / 5) * 26,
      POTATO_ASSETS.GOOD[index % POTATO_ASSETS.GOOD.length]!.key,
    ).setDisplaySize(40, 40).setVisible(false))
    const front = scene.add.graphics()
    front.fillStyle(0xb77839, 1).fillRect(-98, 35, 196, 12)
    front.fillStyle(0x935a29, 1).fillRect(-87, 88, 174, 15)
    for (let x = -87; x <= 87; x += 29) front.fillRect(x, 47, 9, 41)
    front.fillStyle(0xd39a53, 1).fillRect(-92, 63, 184, 8)
    this.countText = scene.add.text(0, -87, '', {
      fontFamily: 'Arial', fontSize: '34px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5)
    this.remainingText = scene.add.text(0, 126, '', {
      fontFamily: 'Arial', fontSize: '28px', color: '#ffe2a2',
    }).setOrigin(0.5)
    this.container = scene.add.container(145, 320,
      [back, ...this.potatoes, front, this.countText, this.remainingText]).setDepth(LAYERS.scenery + 1)
  }

  update(score: PotatoScoreSnapshot): void {
    if (this.count === score.goodPotatoesCollected && this.target === score.target) return
    this.count = score.goodPotatoesCollected
    this.target = score.target
    this.countText.setText(`${this.count} / ${this.target}`)
    this.remainingText.setText(`Faltan ${Math.max(0, this.target - this.count)}`)
    this.potatoes.forEach((potato, index) => potato.setVisible(index < this.count))
  }

  collect(x: number, y: number): void {
    const potato = this.scene.add.image(x, y, POTATO_ASSETS.GOOD[0].key)
      .setDisplaySize(90, 90).setDepth(LAYERS.feedback)
    this.flights.add(potato)
    this.scene.tweens.add({ targets: potato, x: 145, y: 345, scaleX: potato.scaleX * 0.4,
      scaleY: potato.scaleY * 0.4, duration: 320, ease: 'Sine.easeInOut',
      onComplete: () => { this.flights.delete(potato); potato.destroy() } })
  }

  destroy(): void {
    for (const potato of this.flights) {
      this.scene.tweens.killTweensOf(potato)
      potato.destroy()
    }
    this.flights.clear()
    this.container.destroy(true)
  }
}
