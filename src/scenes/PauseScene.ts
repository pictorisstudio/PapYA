import Phaser from 'phaser'
import { TEXTS } from '../config/texts'

export default class PauseScene extends Phaser.Scene {
  private owner = ''
  constructor() { super('PauseScene') }
  init(data: { owner: string }): void { this.owner = data.owner }
  create(): void {
    this.scene.bringToTop()
    this.add.rectangle(360, 640, 720, 1280, 0x05070c, 0.88).setInteractive()
    this.add.text(360, 444.44, TEXTS.paused, { fontSize: '44px', color: '#f8fafc' }).setOrigin(0.5)
    this.button(640, TEXTS.resume, () => this.resumeOwner())
    this.button(780, TEXTS.leave, () => {
      this.scene.stop(this.owner)
      this.sound.stopAll()
      this.scene.start('MenuScene')
    })
    window.addEventListener('papya:back', this.resumeOwner)
    this.input.keyboard?.on('keydown-ESC', this.resumeOwner)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('papya:back', this.resumeOwner)
    })
  }
  private resumeOwner = (event?: Event): void => {
    event?.preventDefault?.()
    if (document.hidden) return
    this.scene.resume(this.owner)
    this.scene.stop()
  }
  private button(y: number, text: string, action: () => void): void {
    this.add.rectangle(360, y, 360, 62, 0xfbbf24).setInteractive({ useHandCursor: true }).on('pointerdown', action)
    this.add.text(360, y, text, { fontSize: '26px', color: '#1f2937' }).setOrigin(0.5)
  }
}
