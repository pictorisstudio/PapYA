import Phaser from 'phaser'

export default class TimerDisplay {
  private readonly text: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add
      .text(x, y, '3', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
  }

  setSeconds(seconds: number): void {
    this.text.setText(String(Math.max(0, Math.ceil(seconds))))
  }
}
