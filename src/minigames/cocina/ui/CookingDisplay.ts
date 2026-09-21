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
    this.graphics = scene.add.graphics().setDepth(720)
    this.bars = [
      this.createBar(92, 594, 260, 'TEMPERATURA'),
      this.createBar(510, 594, 260, 'COCCION'),
      this.createBar(928, 594, 260, 'QUEMADO'),
    ]
    this.setTextVisible(false)
  }

  update(snapshot: CookingSnapshot, visible: boolean): void {
    this.graphics.clear()
    this.setTextVisible(visible)

    if (!visible) {
      return
    }

    this.bars[0].value.setText(`${Math.round(snapshot.temperature * 100)}%`)
    this.bars[1].value.setText(`${Math.round(snapshot.cookingProgress)}%`)
    this.bars[2].value.setText(`${Math.round(snapshot.burnProgress)}%`)
    this.drawBar(this.bars[0], snapshot.temperature, snapshot.heatZone === 'OPTIMAL' ? 0x6ee7b7 : snapshot.heatZone === 'HIGH' ? 0xf87171 : 0xfbbf24)
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
      label: this.scene.add.text(x + 16, y + 10, label, { fontSize: '14px', fontStyle: '700', color: '#f8fafc' }).setDepth(721),
      value: this.scene.add.text(x + width - 16, y + 10, '0%', { fontSize: '14px', color: '#f8fafc' }).setOrigin(1, 0).setDepth(721),
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
    this.graphics.fillRoundedRect(bar.x, bar.y, bar.width, 52, 10)
    this.graphics.lineStyle(2, 0xffffff, 0.28)
    this.graphics.strokeRoundedRect(bar.x, bar.y, bar.width, 52, 10)
    this.graphics.fillStyle(0xffffff, 0.18)
    this.graphics.fillRect(bar.x + 16, bar.y + 34, bar.width - 32, 8)
    this.graphics.fillStyle(color, 1)
    this.graphics.fillRect(bar.x + 16, bar.y + 34, (bar.width - 32) * clamped, 8)
  }
}
