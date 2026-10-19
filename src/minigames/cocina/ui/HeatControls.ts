import { applyHudLayers, LAYERS } from '../../../config/layers'
import { TEXTS } from '../../../config/texts'
import Phaser from 'phaser'
import { COCINA_CONFIG } from '../config/cocinaConfig'

export default class HeatControls {
  private readonly objects: Phaser.GameObjects.GameObject[] = []
  private readonly buttons: Phaser.GameObjects.Rectangle[] = []
  private enabled?: boolean

  constructor(private readonly scene: Phaser.Scene, decrease: () => void, increase: () => void) {
    const hudStart = scene.children.list.length
    this.createButton(230, COCINA_CONFIG.CONTROL_Y, '-', decrease)
    this.createButton(490, COCINA_CONFIG.CONTROL_Y, '+', increase)
    applyHudLayers(scene, hudStart, false)
    this.setEnabled(true)
  }

  setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) return
    this.enabled = enabled
    for (const object of this.objects) {
      (object as Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text).setVisible(enabled)
    }
    for (const button of this.buttons) {
      if (enabled) button.setInteractive({ useHandCursor: true })
      else button.disableInteractive()
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
