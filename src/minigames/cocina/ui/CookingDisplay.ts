import { applyHudLayers, LAYERS } from '../../../config/layers'
import { TEXTS } from '../../../config/texts'
import Phaser from 'phaser'
import type { CookingSnapshot } from '../types/CocinaTypes'

interface BarElements {
  x: number
  y: number
  width: number
  label: Phaser.GameObjects.Text
  value: Phaser.GameObjects.Text
}

export default class CookingDisplay {
  private readonly graphics: Phaser.GameObjects.Graphics
  private readonly bars: BarElements[]

  constructor(private readonly scene: Phaser.Scene) {
    const hudStart = scene.children.list.length
    this.graphics = scene.add.graphics().setDepth(720)
    this.bars = [
      this.createBar(60, 570, 300, TEXTS.minigames.cocina.temperature),
      this.createBar(490, 570, 300, TEXTS.minigames.cocina.cooking),
      this.createBar(920, 570, 300, TEXTS.minigames.cocina.burn),
    ]
    this.setTextVisible(false)
    applyHudLayers(scene, hudStart, false)
  }

  update(snapshot: CookingSnapshot, visible: boolean): void {
    this.graphics.setVisible(visible)
    this.graphics.clear()
    this.setTextVisible(visible)

    if (!visible) {
      return
    }

    this.bars[0].value.setText(`${Math.round(snapshot.temperature * 100)}%`)
    this.bars[0].label.setText(`${TEXTS.minigames.cocina.temperature} ${snapshot.temperatureRate > 0 ? '↑' : '↓'}`)
    this.drawBar(this.bars[0], snapshot.temperature, snapshot.heatZone === 'OPTIMAL' ? 0x6ee7b7 : snapshot.heatZone === 'HIGH' ? 0xf87171 : 0xfbbf24)
    this.bars[1].value.setText(`${Math.round(snapshot.cookingProgress)}%`)
    this.bars[2].value.setText(`${Math.round(snapshot.burnProgress)}%`)
    this.drawBar(this.bars[1], snapshot.cookingProgress / 100, 0x6ee7b7)
    this.drawBar(this.bars[2], snapshot.burnProgress / 100, 0xf87171)
  }

  destroy(): void {
    this.graphics.destroy()

    for (const bar of this.bars) {
      bar.label.destroy()
      bar.value.destroy()
    }
  }

  private createBar(x: number, y: number, width: number, label: string): BarElements {
    return {
      x,
      y,
      width,
      label: this.scene.add.text(x + 16, y + 8, label, { fontSize: '26px', fontStyle: '700', color: '#f8fafc' }).setDepth(721),
      value: this.scene.add.text(x + width - 16, y + 8, '0%', { fontSize: '26px', color: '#f8fafc' }).setOrigin(1, 0).setDepth(721),
    }
  }

  private setTextVisible(visible: boolean): void {
    for (const bar of this.bars) {
      bar.label.setVisible(visible)
      bar.value.setVisible(visible)
    }
  }

  private drawBar(bar: BarElements, progress: number, color: number): void {
    const clamped = Phaser.Math.Clamp(progress, 0, 1)
    this.graphics.fillStyle(0x05070c, 0.58)
    this.graphics.fillRoundedRect(bar.x, bar.y, bar.width, 64, 10)
    this.graphics.lineStyle(2, 0xffffff, 0.28)
    this.graphics.strokeRoundedRect(bar.x, bar.y, bar.width, 64, 10)
    this.graphics.fillStyle(0xffffff, 0.18)
    this.graphics.fillRect(bar.x + 16, bar.y + 44, bar.width - 32, 12)
    this.graphics.fillStyle(color, 1)
    this.graphics.fillRect(bar.x + 16, bar.y + 44, (bar.width - 32) * clamped, 12)
  }
}
