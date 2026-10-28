import Phaser from 'phaser'
import { GUIDE_TEXTS, PAPA_GUIDE_ASSET, guidePages } from '../config/guideConfig'
import { LAYERS } from '../config/layers'

export default class PapaGuide {
  private modal?: Phaser.GameObjects.Container
  private page = 0
  private readonly fairy: Phaser.GameObjects.Image

  constructor(private readonly scene: Phaser.Scene, x = 500, y = 390) {
    scene.add.circle(x, y + 4, 75, 0x7dd3fc, 0.1)
    this.fairy = scene.add.image(x, y, PAPA_GUIDE_ASSET.key).setDisplaySize(174, 174)
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.open())
    scene.tweens.add({ targets: this.fairy, y: y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    scene.add.rectangle(x, y + 106, 210, 42, 0x102d32, 0.94).setStrokeStyle(2, 0x7dd3fc)
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.open())
    scene.add.text(x, y + 106, GUIDE_TEXTS.button, { fontFamily: 'Arial, sans-serif', fontSize: '26px', fontStyle: 'bold', color: '#e0f2fe' }).setOrigin(0.5)
    scene.input.keyboard?.on('keydown-ESC', this.close, this)
    scene.scale?.on?.(Phaser.Scale.Events.RESIZE, this.resize)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this)
  }

  open(): void {
    if (this.modal) return
    this.page = 0
    this.renderPage()
  }

  close(): boolean {
    if (!this.modal) return false
    this.modal.destroy(true)
    this.modal = undefined
    return true
  }

  private next(): void {
    if (this.page === guidePages().length - 1) { this.close(); return }
    this.page++
    this.renderPage()
  }

  private previous(): void {
    if (this.page === 0) return
    this.page--
    this.renderPage()
  }

  private renderPage(): void {
    this.modal?.destroy(true)
    const pages = guidePages(), page = pages[this.page]!
    const objects: Phaser.GameObjects.GameObject[] = []
    const width = this.scene.scale?.gameSize?.width ?? 1280
    const height = this.scene.scale?.gameSize?.height ?? 720
    objects.push(this.scene.add.rectangle(640, 360, width, height, 0x030b12, 0.9)
      .setInteractive().on('pointerdown', () => this.close()))
    objects.push(this.scene.add.rectangle(640, 360, 1130, 610, 0x142c35).setStrokeStyle(3, 0x7dd3fc).setInteractive())
    objects.push(this.scene.add.text(155, 100, GUIDE_TEXTS.title, { fontFamily: 'Arial, sans-serif', fontSize: '32px', fontStyle: 'bold', color: '#7dd3fc' }))
    objects.push(this.scene.add.image(260, 340, PAPA_GUIDE_ASSET.key).setDisplaySize(260, 260))
    objects.push(this.scene.add.text(770, 180, page.title, { fontFamily: 'Arial, sans-serif', fontSize: '40px', color: '#fff4ce', fontStyle: 'bold', align: 'center', wordWrap: { width: 680 } }).setOrigin(0.5))
    objects.push(this.scene.add.text(770, 320, page.control, { fontFamily: 'Arial, sans-serif', fontSize: '34px', color: '#ffffff', align: 'center', wordWrap: { width: 670 }, lineSpacing: 10 }).setOrigin(0.5))
    objects.push(this.scene.add.text(770, 458, page.goal, { fontFamily: 'Arial, sans-serif', fontSize: '28px', color: '#a7f3d0', align: 'center', wordWrap: { width: 670 } }).setOrigin(0.5))
    objects.push(this.scene.add.text(770, 530, `${this.page + 1} / ${pages.length}`, { fontSize: '24px', color: '#b6c7d5' }).setOrigin(0.5))
    const button = (x: number, y: number, width: number, label: string, action: () => void, disabled = false) => {
      const box = this.scene.add.rectangle(x, y, width, 68, disabled ? 0x334155 : 0xfbbf24).setStrokeStyle(2, 0xfff1c5)
      if (!disabled) box.setInteractive({ useHandCursor: true }).on('pointerdown', action)
      objects.push(box, this.scene.add.text(x, y, label, { fontFamily: 'Arial, sans-serif', fontSize: '28px', color: disabled ? '#94a3b8' : '#142c35' }).setOrigin(0.5))
    }
    button(600, 604, 250, GUIDE_TEXTS.previous, () => this.previous(), this.page === 0)
    button(940, 604, 250, this.page === pages.length - 1 ? GUIDE_TEXTS.done : GUIDE_TEXTS.next, () => this.next())
    button(1140, 110, 70, '×', () => this.close())
    this.modal = this.scene.add.container(0, 0, objects).setDepth(LAYERS.overlay)
  }

  private destroy(): void {
    this.close()
    this.scene.tweens.killTweensOf(this.fairy)
    this.scene.input.keyboard?.off('keydown-ESC', this.close, this)
    this.scene.scale?.off?.(Phaser.Scale.Events.RESIZE, this.resize)
  }

  private resize = (): void => { if (this.modal) this.renderPage() }
}
