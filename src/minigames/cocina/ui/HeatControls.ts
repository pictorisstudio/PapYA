import Phaser from 'phaser'
import { COCINA_CONFIG } from '../config/cocinaConfig'

export default class HeatControls {
  private readonly objects: Phaser.GameObjects.GameObject[] = []
  private readonly buttons: Phaser.GameObjects.Rectangle[] = []

  constructor(private readonly scene: Phaser.Scene, decrease: () => void, increase: () => void) {
    this.createButton(494, COCINA_CONFIG.CONTROL_Y, '-', decrease)
    this.createButton(786, COCINA_CONFIG.CONTROL_Y, '+', increase)
  }

  setEnabled(enabled: boolean): void {
    for (const button of this.buttons) {
      button.setAlpha(enabled ? 1 : 0.42)
    }
  }

  destroy(): void {
    for (const object of this.objects) {
      object.destroy()
    }

    this.objects.length = 0
    this.buttons.length = 0
  }

  private createButton(x: number, y: number, label: string, action: () => void): void {
    const button = this.scene.add
      .rectangle(x, y, COCINA_CONFIG.CONTROL_TOUCH_WIDTH, COCINA_CONFIG.CONTROL_TOUCH_HEIGHT, 0xfbbf24, 0.96)
      .setStrokeStyle(4, 0xfff7cc)
      .setDepth(740)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)
    const text = this.scene.add
      .text(x, y - 2, label, { fontSize: '54px', fontStyle: '700', color: '#1f2937' })
      .setOrigin(0.5)
      .setDepth(741)
    this.buttons.push(button)
    this.objects.push(button, text)
  }
}
