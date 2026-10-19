import Phaser from 'phaser'
import { TEXTS } from '../config/texts'

export default class PauseScene extends Phaser.Scene {
  private owner = ''
  constructor() { super('PauseScene') }
  init(data: { owner: string }): void { this.owner = data.owner }
  create(): void {
    this.scene.bringToTop()
    this.add.rectangle(640, 360, 1280, 720, 0x05070c, 0.88).setInteractive()
    this.add.text(640, 250, TEXTS.paused, { fontSize: '52px', color: '#f8fafc' }).setOrigin(0.5)
    this.button(360, TEXTS.resume, () => this.resumeOwner())
    this.button(470, TEXTS.leave, () => {
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
    this.add.rectangle(640, y, 440, 84, 0xfbbf24).setInteractive({ useHandCursor: true }).on('pointerdown', action)
    this.add.text(640, y, text, { fontSize: '34px', color: '#1f2937' }).setOrigin(0.5)
  }
}
