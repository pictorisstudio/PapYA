import Phaser from 'phaser'
import { TEXTS } from '../config/texts'
import { MENU_UI_ASSETS } from '../config/uiAssets'

export default class PauseScene extends Phaser.Scene {
  private owner = ''
  constructor() { super('PauseScene') }
  init(data: { owner: string }): void { this.owner = data.owner }
  create(): void {
    this.scene.bringToTop()
    this.add.rectangle(640, 360, 1280, 720, 0x05070c, 0.88).setInteractive()
    this.add.text(640, 250, TEXTS.paused, { fontSize: '52px', color: '#f8fafc' }).setOrigin(0.5)
    this.button(360, MENU_UI_ASSETS.resume.key, () => this.resumeOwner())
    this.button(510, MENU_UI_ASSETS.menu.key, () => {
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
  private button(y: number, key: string, action: () => void): void {
    const height = key === MENU_UI_ASSETS.resume.key ? 130 : 126
    const width = key === MENU_UI_ASSETS.resume.key ? 258 : 330
    this.add.image(640, y, key, 'button').setDisplaySize(width, height)
      .setInteractive({ useHandCursor: true }).on('pointerdown', action)
  }
}
