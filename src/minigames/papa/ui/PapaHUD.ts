import { applyHudLayers, LAYERS } from '../../../config/layers'
import { TEXTS } from '../../../config/texts'
import Phaser from 'phaser'
import { DEBUG_MODE, SAFE_MARGIN_X, SAFE_MARGIN_Y } from '../../../config/constants'
import type { PotatoScoreSnapshot } from '../types/PapaTypes'
import type { PapaDebugSnapshot, PotatoType } from '../types/PapaTypes'

interface PapaHUDActions {
  spawnGood: () => void
  spawnBad: () => void
  clearPotatoes: () => void
  forceVictory: () => void
  forceDefeat: () => void
  toggleHitboxes: () => void
  toggleSpawn: () => void
  restart: () => void
}

export default class PapaHUD {
  private readonly potatoesText: Phaser.GameObjects.Text
  private readonly scoreText: Phaser.GameObjects.Text
  private readonly timeText: Phaser.GameObjects.Text
  private readonly debugText?: Phaser.GameObjects.Text

  constructor(private readonly scene: Phaser.Scene, actions: PapaHUDActions) {
    const hudStart = scene.children.list.length
    scene.add.rectangle(430, SAFE_MARGIN_Y + 30, 748, 86, 0x102132, 0.76).setStrokeStyle(2, 0xffffff, 0.32)
    scene.add.text(SAFE_MARGIN_X, SAFE_MARGIN_Y, TEXTS.minigames.papa.name, { fontSize: '28px', fontStyle: '700', color: '#f8fafc' })

    this.potatoesText = scene.add.text(SAFE_MARGIN_X, SAFE_MARGIN_Y + 40, TEXTS.minigames.papa.count(0, 20), { fontSize: '22px', color: '#f8fafc' })
    this.scoreText = scene.add.text(260, SAFE_MARGIN_Y + 40, TEXTS.score(0), { fontSize: '22px', color: '#f8fafc' })
    this.timeText = scene.add.text(452, SAFE_MARGIN_Y + 40, TEXTS.time(30), { fontSize: '22px', color: '#f8fafc' })


    if (DEBUG_MODE) {
      scene.add.rectangle(497.25, 512, 200.25, 280.89, 0x05070c, 0.7).setOrigin(0, 0).setDepth(900)
      this.debugText = scene.add.text(505.13, 533.33, '', { fontSize: '14px', color: '#d6e4ff', lineSpacing: 4 }).setDepth(901)
      this.addButton(898, 376, 'GOOD', actions.spawnGood)
      this.addButton(960, 376, 'BAD', actions.spawnBad)
      this.addButton(1018, 376, 'CLEAR', actions.clearPotatoes)
      this.addButton(1086, 376, 'WIN', actions.forceVictory)
      this.addButton(1140, 376, 'LOSE', actions.forceDefeat)
      this.addButton(898, 406, 'HITBOX', actions.toggleHitboxes)
      this.addButton(974, 406, 'SPAWN', actions.toggleSpawn)
      this.addButton(1046, 406, 'RESTART', actions.restart, 76)
    }
    applyHudLayers(scene, hudStart)
  }

  update(score: PotatoScoreSnapshot, remainingMs: number, debug: PapaDebugSnapshot): void {
    this.potatoesText.setText(TEXTS.minigames.papa.count(score.goodPotatoesCollected, score.target))
    this.scoreText.setText(TEXTS.score(score.score))
    this.timeText.setText(TEXTS.time(remainingMs / 1000))

    if (this.debugText) {
      this.debugText.setText([
        `Active potatoes: ${debug.activePotatoes}`,
        `Spawn: ${debug.spawnPaused ? 'PAUSED' : 'ON'}`,
        `Good: ${score.goodPotatoesCollected}`,
        `Bad touched: ${score.badPotatoesTouched}`,
        `Velocity: ${debug.velocityText}`,
      ])
    }
  }

  showFloatingFeedback(_x: number, _y: number, _label: string, _type: PotatoType): void {}

  private addButton(x: number, y: number, label: string, action: () => void, width = 56): void {
    const button = this.scene.add.rectangle(x, y, width, 22, 0x1f2937, 0.94).setOrigin(0, 0).setDepth(902)
    button.setStrokeStyle(1, 0x64748b)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)
    this.scene.add.text(x + width / 2, y + 11, label, { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5).setDepth(903)
  }
}
