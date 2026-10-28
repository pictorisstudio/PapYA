import Phaser from 'phaser'
import { LAYERS } from '../../../config/layers'
import { COCUY_CONFIG } from '../config/cocuyConfig'

// Señales breves cerca del cóndor; no agregan paneles permanentes al HUD.
export default class CocuyFeedback {
  constructor(private readonly scene: Phaser.Scene) {}

  rock(x: number, y: number): void {
    const ring = this.scene.add.circle(x, y, 34, 0xffa578, 0.15).setStrokeStyle(5, 0xffb3a7).setDepth(LAYERS.feedback)
    this.scene.tweens.add({ targets: ring, scale: 2, alpha: 0, duration: 260, onComplete: () => ring.destroy() })
    this.cue(x, y - 90, `−${COCUY_CONFIG.ROCK_ALTITUDE_PENALTY} m`, '#ffb3a7', 0)
  }

  wind(x: number, y: number, direction: -1 | 1): void {
    this.cue(x + direction * 80, y - 80, direction === 1 ? '→ →' : '← ←', '#7dd3fc', direction * 90)
  }

  cloud(x: number, y: number): void { this.cue(x, y - 85, 'Niebla', '#e0f2fe', 0) }

  private cue(x: number, y: number, text: string, color: string, distance: number): void {
    const label = this.scene.add.text(x, y, text, { fontFamily: 'Arial, sans-serif', fontSize: '38px', fontStyle: 'bold', color, stroke: '#10263d', strokeThickness: 6 }).setOrigin(0.5).setDepth(LAYERS.feedback + 1)
    this.scene.tweens.add({ targets: label, x: x + distance, y: y - 45, alpha: 0, duration: 760, onComplete: () => label.destroy() })
  }
}
