import Phaser from 'phaser'
import { DEBUG_MODE } from '../config/constants'
import { MINIGAME_ORDER, MINIGAMES_CONFIG } from '../config/minigamesConfig'
import { TEXTS } from '../config/texts'
import { gameManager } from '../core/GameManager'
import DebugPanel from '../components/DebugPanel'
import { LAYERS } from '../config/layers'

export default class DevScene extends Phaser.Scene {
  constructor() { super('DevScene') }
  create(): void {
    if (!DEBUG_MODE) { this.scene.start('MenuScene'); return }
    this.cameras.main.setBackgroundColor('#10131a')
    this.add.text(640, 70, TEXTS.dev, { fontSize: '42px', color: '#ffffff' }).setOrigin(0.5)
    MINIGAME_ORDER.forEach((key, index) => {
      this.button(162 + index * 76, MINIGAMES_CONFIG[key].name, () => {
        gameManager.startNewRun([key], true)
        this.scene.start('TransitionScene')
      })
    })
    this.button(572, TEXTS.orderedRun, () => {
      gameManager.startNewRun([...MINIGAME_ORDER], true)
      this.scene.start('TransitionScene')
    })
    this.button(650, TEXTS.menu, () => this.scene.start('MenuScene'))
    new DebugPanel(this)
  }
  private button(y: number, label: string, action: () => void): void {
    const depth = label === TEXTS.menu ? 0 : LAYERS.debug
    this.add.rectangle(640, y, 620, 54, 0xfbbf24).setDepth(depth).setInteractive({ useHandCursor: true }).on('pointerdown', action)
    this.add.text(640, y, label, { fontSize: '25px', color: '#1f2937' }).setOrigin(0.5).setDepth(depth)
  }
}
