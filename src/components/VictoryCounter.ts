import Phaser from 'phaser'
import { REQUIRED_VICTORIES } from '../config/constants'

export default class VictoryCounter {
  private readonly text: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add
      .text(x, y, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#f4f7fb',
      })
      .setOrigin(0.5)
  }

  update(victories: number, total: number): void {
    this.text.setText(`Victorias: ${victories}/${total} · Meta: ${REQUIRED_VICTORIES}`)
  }
}
