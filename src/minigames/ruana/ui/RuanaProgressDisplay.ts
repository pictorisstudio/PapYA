import Phaser from 'phaser'
import { RUANA_CONFIG } from '../config/ruanaConfig'

export default class RuanaProgressDisplay {
  private readonly segments: Phaser.GameObjects.Rectangle[] = []
  private readonly label: Phaser.GameObjects.Text
  private completed = 0

  constructor(scene: Phaser.Scene, x: number, y: number, totalSegments: number) {
    scene.add.text(x, y - 28, 'Progreso de tejido', { fontSize: '18px', color: '#d8dee9' }).setOrigin(0.5)
    this.label = scene.add.text(x, y + 28, '0%', { fontSize: '18px', color: '#aab3c5' }).setOrigin(0.5)

    const segmentWidth = 14
    const gap = 3
    const totalWidth = totalSegments * segmentWidth + (totalSegments - 1) * gap
    const startX = x - totalWidth / 2

    for (let index = 0; index < totalSegments; index += 1) {
      const segment = scene.add.rectangle(startX + index * (segmentWidth + gap), y, segmentWidth, 34, RUANA_CONFIG.COLORS.progressEmpty, 1)
      segment.setStrokeStyle(1, 0x64748b, 0.8)
      this.segments.push(segment)
    }
  }

  setProgress(validHits: number): void {
    this.completed = Phaser.Math.Clamp(validHits, 0, this.segments.length)

    for (let index = 0; index < this.segments.length; index += 1) {
      const isFilled = index < this.completed
      this.segments[index].setFillStyle(isFilled ? RUANA_CONFIG.COLORS.progressFilled : RUANA_CONFIG.COLORS.progressEmpty, 1)
    }

    this.label.setText(`${Math.round((this.completed / this.segments.length) * 100)}%`)
  }
}
