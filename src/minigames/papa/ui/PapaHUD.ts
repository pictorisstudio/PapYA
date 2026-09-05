import Phaser from 'phaser'
import { DEBUG_MODE } from '../../../config/constants'
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
  private readonly finalText: Phaser.GameObjects.Text
  private readonly debugText?: Phaser.GameObjects.Text

  constructor(private readonly scene: Phaser.Scene, actions: PapaHUDActions) {
    scene.add.rectangle(292, 58, 500, 86, 0x102132, 0.76).setStrokeStyle(2, 0xffffff, 0.32)
    scene.add.text(58, 30, 'COSECHA DE PAPA', { fontSize: '28px', fontStyle: '700', color: '#f8fafc' })

    this.potatoesText = scene.add.text(58, 70, 'Papas: 0 / 20', { fontSize: '22px', color: '#f8fafc' })
    this.scoreText = scene.add.text(260, 70, 'Puntaje: 0', { fontSize: '22px', color: '#f8fafc' })
    this.timeText = scene.add.text(452, 70, 'Tiempo: 30', { fontSize: '22px', color: '#f8fafc' })

    this.finalText = scene.add
      .text(640, 318, '', {
        fontSize: '46px',
        fontStyle: '700',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12,
      })
      .setOrigin(0.5)
      .setDepth(1000)

    if (DEBUG_MODE) {
      scene.add.rectangle(884, 288, 356, 158, 0x05070c, 0.7).setOrigin(0, 0).setDepth(900)
      this.debugText = scene.add.text(898, 300, '', { fontSize: '14px', color: '#d6e4ff', lineSpacing: 4 }).setDepth(901)
      this.addButton(898, 376, 'GOOD', actions.spawnGood)
      this.addButton(960, 376, 'BAD', actions.spawnBad)
      this.addButton(1018, 376, 'CLEAR', actions.clearPotatoes)
      this.addButton(1086, 376, 'WIN', actions.forceVictory)
      this.addButton(1140, 376, 'LOSE', actions.forceDefeat)
      this.addButton(898, 406, 'HITBOX', actions.toggleHitboxes)
      this.addButton(974, 406, 'SPAWN', actions.toggleSpawn)
      this.addButton(1046, 406, 'RESTART', actions.restart, 76)
    }
  }

  update(score: PotatoScoreSnapshot, remainingMs: number, debug: PapaDebugSnapshot): void {
    this.potatoesText.setText(`Papas: ${score.goodPotatoesCollected} / ${score.target}`)
    this.scoreText.setText(`Puntaje: ${score.score}`)
    this.timeText.setText(`Tiempo: ${Math.ceil(remainingMs / 1000)}`)

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

  showFloatingFeedback(x: number, y: number, label: string, type: PotatoType): void {
    const text = this.scene.add
      .text(x, y - 28, label, {
        fontSize: '30px',
        fontStyle: '700',
        color: type === 'GOOD' ? '#f8fafc' : '#ff4d4d',
      })
      .setOrigin(0.5)
      .setDepth(950)

    this.scene.tweens.add({
      targets: text,
      y: y - 76,
      alpha: 0,
      duration: 520,
      ease: 'Sine.easeOut',
      onComplete: () => text.destroy(),
    })
  }

  showFinal(victory: boolean, score: number): void {
    this.finalText.setText(`${victory ? '¡Cosecha completa!' : 'Cosecha fallida'}\n${victory ? 'VICTORIA' : 'DERROTA'}\nPuntaje: ${score}`)
    this.finalText.setColor(victory ? '#14532d' : '#991b1b')
  }

  private addButton(x: number, y: number, label: string, action: () => void, width = 56): void {
    const button = this.scene.add.rectangle(x, y, width, 22, 0x1f2937, 0.94).setOrigin(0, 0).setDepth(902)
    button.setStrokeStyle(1, 0x64748b)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)
    this.scene.add.text(x + width / 2, y + 11, label, { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5).setDepth(903)
  }
}
