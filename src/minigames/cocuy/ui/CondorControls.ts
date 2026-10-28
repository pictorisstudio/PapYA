import Phaser from 'phaser'
import { LAYERS } from '../../../config/layers'

// Controles separados del movimiento; cada dedo se libera de forma independiente.
export default class CondorControls {
  private readonly buttons: Phaser.GameObjects.Rectangle[] = []
  private readonly labels: Phaser.GameObjects.Text[] = []

  constructor(scene: Phaser.Scene, press: (id: number, direction: -1 | 1) => void,
    release: (id: number) => void) {
    for (const direction of [-1, 1] as const) {
      const x = direction === -1 ? 150 : 1130
      const button = scene.add.rectangle(x, 626, 190, 116, 0x102b44, 0.9)
        .setStrokeStyle(4, 0xbae6fd).setDepth(LAYERS.hud)
        .setInteractive({ useHandCursor: true })
      button.on('pointerdown', (pointer: Phaser.Input.Pointer) => press(pointer.id, direction))
      button.on('pointerup', (pointer: Phaser.Input.Pointer) => release(pointer.id))
      button.on('pointerout', (pointer: Phaser.Input.Pointer) => release(pointer.id))
      this.buttons.push(button)
      this.labels.push(scene.add.text(x, 626, direction === -1 ? '◀' : '▶', {
        fontFamily: 'Arial', fontSize: '72px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(LAYERS.hud + 1))
    }
  }

  update(direction: number): void {
    this.buttons.forEach((button, index) => button.setFillStyle(
      direction === (index === 0 ? -1 : 1) ? 0x2879a6 : 0x102b44, 0.9))
  }

  destroy(): void {
    this.buttons.forEach(button => button.destroy())
    this.labels.forEach(label => label.destroy())
  }
}
