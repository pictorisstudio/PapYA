import Phaser from 'phaser'

export default class PreloaderScene extends Phaser.Scene {
  private menuTimeoutId: number | null = null

  constructor() {
    super('PreloaderScene')
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#10131a')
    this.add.rectangle(640, 360, 420, 18, 0x2d3748)
    const bar = this.add.rectangle(430, 360, 0, 18, 0x6ee7b7).setOrigin(0, 0.5)

    this.tweens.add({
      targets: bar,
      width: 420,
      duration: 600,
      ease: 'Sine.easeInOut',
    })

    this.add
      .text(640, 320, 'Cargando PapYA...', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#f4f7fb',
      })
      .setOrigin(0.5)

    this.menuTimeoutId = window.setTimeout(() => this.scene.start('MenuScene'), 700)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  private cleanup(): void {
    if (this.menuTimeoutId !== null) {
      window.clearTimeout(this.menuTimeoutId)
      this.menuTimeoutId = null
    }
  }
}
