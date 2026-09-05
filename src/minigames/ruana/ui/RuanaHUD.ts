import Phaser from 'phaser'
import { DEBUG_MODE, REQUIRED_VICTORIES } from '../../../config/constants'
import { RUANA_CONFIG } from '../config/ruanaConfig'
import type { RuanaScoreSnapshot } from '../systems/RuanaScoreManager'
import type { RuanaDebugSnapshot, RuanaJudgeResult } from '../types/RuanaTypes'

interface RuanaHUDActions {
  forcePerfect: () => void
  forceMiss: () => void
  finishNow: () => void
  toggleGuides: () => void
  resumeClock: () => void
  previewProgress: (progress: number) => void
  restart: () => void
}

export default class RuanaHUD {
  private readonly accuracyText: Phaser.GameObjects.Text
  private readonly statsText: Phaser.GameObjects.Text
  private readonly progressText: Phaser.GameObjects.Text
  private readonly feedbackText: Phaser.GameObjects.Text
  private readonly debugText?: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, actions: RuanaHUDActions) {
    scene.add.rectangle(640, 64, 1160, 74, 0x0f172a, 0.82).setStrokeStyle(2, 0x334155)
    scene.add.text(84, 38, 'TEJIENDO LA RUANA', { fontSize: '28px', fontStyle: '700', color: '#f8fafc' })

    this.accuracyText = scene.add.text(410, 38, 'Precisión: 0%', { fontSize: '22px', color: '#6ee7b7' })
    this.statsText = scene.add.text(410, 68, 'Perfect: 0  Good: 0  Miss: 0', { fontSize: '18px', color: '#d8dee9' })
    this.progressText = scene.add.text(720, 68, `Victorias: 0/5  Meta: ${REQUIRED_VICTORIES}`, {
      fontSize: '20px',
      color: '#aab3c5',
    })

    this.feedbackText = scene.add
      .text(640, 548, '', {
        fontSize: '38px',
        fontStyle: '700',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5)

    if (DEBUG_MODE) {
      scene.add.rectangle(894, 188, 360, 158, 0x05070c, 0.7).setOrigin(0, 0)
      this.debugText = scene.add.text(908, 200, '', { fontSize: '14px', color: '#d6e4ff', lineSpacing: 4 })
      this.addButton(scene, 908, 286, 'PERFECT', actions.forcePerfect)
      this.addButton(scene, 984, 286, 'MISS', actions.forceMiss)
      this.addButton(scene, 1044, 286, 'FIN', actions.finishNow)
      this.addButton(scene, 1104, 286, 'GUIAS', actions.toggleGuides)
      this.addButton(scene, 1172, 286, 'REINICIAR', actions.restart, 74)
      this.addButton(scene, 908, 318, '0%', () => actions.previewProgress(0), 44)
      this.addButton(scene, 958, 318, '25%', () => actions.previewProgress(0.25), 44)
      this.addButton(scene, 1008, 318, '50%', () => actions.previewProgress(0.5), 44)
      this.addButton(scene, 1058, 318, '75%', () => actions.previewProgress(0.75), 44)
      this.addButton(scene, 1108, 318, '100%', () => actions.previewProgress(1), 48)
      this.addButton(scene, 1164, 318, 'PLAY', actions.resumeClock, 56)
    }
  }

  update(score: RuanaScoreSnapshot, currentVictories: number, totalMinigames: number): void {
    this.accuracyText.setText(`Precisión: ${score.accuracy.toFixed(1)}%`)
    this.statsText.setText(`Perfect: ${score.perfect}  Good: ${score.good}  Miss: ${score.miss}`)
    this.progressText.setText(
      `Notas: ${score.perfect + score.good + score.miss}/${score.totalNotes}  Victorias: ${currentVictories}/${totalMinigames}  Meta: ${REQUIRED_VICTORIES}`,
    )
  }

  showFeedback(result: RuanaJudgeResult, offsetMs?: number): void {
    const suffix = offsetMs === undefined ? '' : ` ${offsetMs} ms`
    this.feedbackText.setText(`${result}${suffix}`)
    this.feedbackText.setAlpha(1)
    this.feedbackText.setColor(result === 'PERFECT' ? '#6ee7b7' : result === 'GOOD' ? '#fbbf24' : '#f87171')
    this.feedbackText.scene.tweens.add({
      targets: this.feedbackText,
      alpha: { from: 1, to: 0 },
      duration: 450,
      ease: 'Sine.easeOut',
    })
  }

  showFinal(accuracy: number, victory: boolean): void {
    this.feedbackText.setAlpha(1)
    this.feedbackText.setText(`PRECISIÓN FINAL: ${accuracy.toFixed(1)}%\n${victory ? '¡Ruana completada!\nVICTORIA' : 'Inténtalo nuevamente\nDERROTA'}`)
    this.feedbackText.setColor(victory ? '#6ee7b7' : '#f87171')
  }

  updateDebug(snapshot: RuanaDebugSnapshot): void {
    if (!this.debugText) {
      return
    }

    this.debugText.setText([
      `Clock: ${Math.round(snapshot.clockMs)} ms`,
      `Next note: ${snapshot.nextNoteMs === null ? '-' : `${Math.round(snapshot.nextNoteMs)} ms`}`,
      `Next lane: ${snapshot.nextNoteLane === null ? '-' : snapshot.nextNoteLane}`,
      `Note progress: ${snapshot.nextNoteProgress === null ? '-' : `${Math.round(snapshot.nextNoteProgress * 100)}%`}`,
      `Offset: ${snapshot.offsetMs === null ? '-' : `${Math.round(snapshot.offsetMs)} ms`}`,
      `Active notes: ${snapshot.activeNotes}`,
      `FPS: ${Math.round(snapshot.fps)}`,
      `Win accuracy: ${RUANA_CONFIG.WIN_ACCURACY}%`,
    ])
  }

  private addButton(scene: Phaser.Scene, x: number, y: number, label: string, action: () => void, width = 64): void {
    const button = scene.add.rectangle(x, y, width, 22, 0x1f2937, 0.94).setOrigin(0, 0)
    button.setStrokeStyle(1, 0x64748b)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)
    scene.add.text(x + width / 2, y + 11, label, { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5)
  }
}
