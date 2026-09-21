import Phaser from 'phaser'
import { DEBUG_MODE } from '../../../config/constants'
import { TEJO_CONFIG } from '../config/tejoConfig'
import type { TejoDebugSnapshot, TejoImpactResult, TejoScoreSnapshot } from '../types/TejoTypes'

interface TejoHUDActions {
  forceMecha: () => void
  forceNear: () => void
  forceOut: () => void
  forceWin: () => void
  forceLose: () => void
  reset: () => void
}

export default class TejoHUD {
  private readonly scoreText: Phaser.GameObjects.Text
  private readonly mechasText: Phaser.GameObjects.Text
  private readonly timeText: Phaser.GameObjects.Text
  private readonly resultText: Phaser.GameObjects.Text
  private readonly finalText: Phaser.GameObjects.Text
  private readonly debugText?: Phaser.GameObjects.Text

  constructor(private readonly scene: Phaser.Scene, actions: TejoHUDActions) {
    scene.add.rectangle(358, TEJO_CONFIG.SAFE_MARGIN_Y + 30, 604, 84, 0x0f172a, 0.82).setStrokeStyle(2, 0x334155)
    scene.add.text(TEJO_CONFIG.SAFE_MARGIN_X, TEJO_CONFIG.SAFE_MARGIN_Y, 'TEJO AL BOCIN', {
      fontSize: '28px',
      fontStyle: '700',
      color: '#f8fafc',
    })

    this.scoreText = scene.add.text(TEJO_CONFIG.SAFE_MARGIN_X, TEJO_CONFIG.SAFE_MARGIN_Y + 40, 'PUNTAJE: 0 / 10', {
      fontSize: '21px',
      color: '#f8fafc',
    })
    this.mechasText = scene.add.text(300, TEJO_CONFIG.SAFE_MARGIN_Y + 40, 'MECHAS: 0 / 3', { fontSize: '21px', color: '#f8fafc' })
    this.timeText = scene.add.text(514, TEJO_CONFIG.SAFE_MARGIN_Y + 40, 'TIEMPO: 30', { fontSize: '21px', color: '#f8fafc' })

    this.resultText = scene.add.text(640, 354, '', { fontSize: '34px', fontStyle: '700', color: '#ffffff' }).setOrigin(0.5).setDepth(960)
    this.finalText = scene.add
      .text(640, 328, '', {
        fontSize: '46px',
        fontStyle: '700',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12,
      })
      .setOrigin(0.5)
      .setDepth(1000)

    if (DEBUG_MODE) {
      scene.add.rectangle(888, 202, 372, 186, 0x05070c, 0.7).setOrigin(0, 0).setDepth(900)
      this.debugText = scene.add.text(902, 214, '', { fontSize: '13px', color: '#d6e4ff', lineSpacing: 4 }).setDepth(901)
      this.addButton(902, 336, 'MECHA', actions.forceMecha, 62)
      this.addButton(970, 336, 'NEAR', actions.forceNear, 56)
      this.addButton(1032, 336, 'OUT', actions.forceOut, 50)
      this.addButton(1088, 336, 'WIN', actions.forceWin, 48)
      this.addButton(1142, 336, 'LOSE', actions.forceLose, 54)
      this.addButton(1202, 336, 'RESET', actions.reset, 56)
    }
  }

  update(score: TejoScoreSnapshot, remainingMs: number): void {
    this.scoreText.setText(`PUNTAJE: ${score.score} / ${TEJO_CONFIG.WIN_SCORE}`)
    this.mechasText.setText(`MECHAS: ${score.mechas} / ${TEJO_CONFIG.WIN_MECHAS}`)
    this.timeText.setText(`TIEMPO: ${Math.ceil(remainingMs / 1000)}`)
  }

  updateDebug(snapshot: TejoDebugSnapshot): void {
    if (!this.debugText) {
      return
    }

    this.debugText.setText([
      `State: ${snapshot.phase}`,
      `Power: ${Math.round(snapshot.power * 100)}%`,
      `Norm: ${Math.round(snapshot.normalizedPower * 100)}%`,
      `Drag px: ${Math.round(snapshot.dragDistance)} | Eff: ${Math.round(snapshot.effectiveDragDistance)}`,
      `Max power drag: ${TEJO_CONFIG.MAX_POWER_DRAG_DISTANCE}px`,
      `Drag: ${snapshot.drag ? `${Math.round(snapshot.drag.x)}, ${Math.round(snapshot.drag.y)}` : '-'}`,
      `Target: ${snapshot.target ? `${Math.round(snapshot.target.x)}, ${Math.round(snapshot.target.y)}` : '-'}`,
      `Elapsed: ${Math.round(snapshot.elapsedMs)} ms`,
      `Near radius: ${TEJO_CONFIG.NEAR_RADIUS}`,
      `Mecha radius: ${TEJO_CONFIG.MECHA_RADIUS}`,
      `Touch radius: ${TEJO_CONFIG.DISC_VISUAL_RADIUS + TEJO_CONFIG.TOUCH_PADDING}`,
    ])
  }

  showImpact(result: TejoImpactResult): void {
    this.resultText.setText(result === 'MECHA' ? 'MECHA +5' : result === 'NEAR' ? 'CERCA +1' : 'FUERA')
    this.resultText.setColor(result === 'MECHA' ? '#ef4444' : result === 'NEAR' ? '#fbbf24' : '#f8fafc')
    this.resultText.setAlpha(1)
    this.scene.tweens.add({
      targets: this.resultText,
      alpha: 0,
      duration: 620,
      ease: 'Sine.easeOut',
    })
  }

  showFinal(victory: boolean, score: TejoScoreSnapshot): void {
    this.finalText.setText(`${victory ? '¡Bocin conquistado!' : 'Lanzamiento finalizado'}\n${victory ? 'VICTORIA' : 'DERROTA'}\nPuntaje: ${score.score}`)
    this.finalText.setColor(victory ? '#6ee7b7' : '#f87171')
  }

  private addButton(x: number, y: number, label: string, action: () => void, width: number): void {
    const button = this.scene.add.rectangle(x, y, width, 24, 0x1f2937, 0.94).setOrigin(0, 0).setDepth(902)
    button.setStrokeStyle(1, 0x64748b)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)
    this.scene.add.text(x + width / 2, y + 12, label, { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5).setDepth(903)
  }
}
