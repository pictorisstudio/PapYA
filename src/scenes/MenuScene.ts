import { TEXTS } from '../config/texts'
import { DEBUG_MODE } from '../config/constants'
import { LAYERS } from '../config/layers'
import Phaser from 'phaser'
import DebugPanel from '../components/DebugPanel'
import { gameManager } from '../core/GameManager'

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create(): void {
    gameManager.audioManager.playMusic(this, 'menuMusic')
    this.cameras.main.setBackgroundColor('#10131a')

    this.add
      .text(640, 96, TEXTS.title, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '72px',
        fontStyle: '700',
        color: '#f8fafc',
      })
      .setOrigin(0.5)

    this.add
      .text(640, 154, TEXTS.subtitle, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        color: '#aab3c5',
      })
      .setOrigin(0.5)

    // TODO: reemplazar por PNG final de PapYá.
    this.add.circle(422, 348, 78, 0x6ee7b7, 1).setStrokeStyle(4, 0xf8fafc)
    this.add.rectangle(422, 454, 240, 28, 0x334155, 1)
    this.add.text(422, 454, TEXTS.companion, { fontSize: '18px', color: '#f8fafc' }).setOrigin(0.5)

    // TODO: reemplazar por mapa pixel art de Boyacá.
    this.add.rectangle(806, 352, 322, 210, 0x172033, 1).setStrokeStyle(4, 0x475569)
    this.add.circle(740, 324, 22, 0x94a3b8)
    this.add.circle(846, 372, 28, 0x64748b)
    this.add.circle(900, 300, 18, 0x334155)
    this.add.text(806, 472, TEXTS.mapPreview, { fontSize: '20px', color: '#d8dee9' }).setOrigin(0.5)

    this.addButton(640, 592, 300, 64, TEXTS.travel, () => {
      gameManager.startNewRun()
      this.scene.start('TransitionScene')
    })

    this.addButton(640, 660, 190, 34, TEXTS.map, () => this.scene.start('MapScene'))
    if (DEBUG_MODE) {
      const first = this.children.list.length
      this.addButton(1100, 654, 300, 34, TEXTS.dev, () => this.scene.start('DevScene'))
      for (const object of this.children.list.slice(first)) (object as Phaser.GameObjects.Rectangle).setDepth(LAYERS.debug)
    }
    new DebugPanel(this)
  }

  private addButton(x: number, y: number, width: number, height: number, label: string, action: () => void): void {
    const button = this.add.rectangle(x, y, width, height, 0xfbbf24, 1).setStrokeStyle(3, 0xfff7cc)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)

    this.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: height > 40 ? '30px' : '18px',
        fontStyle: '700',
        color: '#1f2937',
      })
      .setOrigin(0.5)
  }
}
