import Phaser from 'phaser'
import { DEBUG_MODE } from '../../../config/constants'
import { COCUY_CONFIG } from '../config/cocuyConfig'
import type { CocuyDebugSnapshot } from '../types/CocuyTypes'

interface CocuyHUDActions {
  spawnRock: () => void
  spawnCloud: () => void
  spawnWindLeft: () => void
  spawnWindRight: () => void
  clearObstacles: () => void
  setAltitude450: () => void
  setAltitude490: () => void
  simulateRockHit: () => void
  activateCloud: () => void
  activateWind: () => void
  forceWin: () => void
  forceLose: () => void
  restart: () => void
}

export default class CocuyHUD {
  private readonly altitudeText: Phaser.GameObjects.Text
  private readonly timerText: Phaser.GameObjects.Text
  private readonly messageText: Phaser.GameObjects.Text
  private readonly finalText: Phaser.GameObjects.Text
  private readonly progressGraphics: Phaser.GameObjects.Graphics
  private readonly debugText?: Phaser.GameObjects.Text

  constructor(private readonly scene: Phaser.Scene, actions: CocuyHUDActions) {
    scene.add.rectangle(414, COCUY_CONFIG.SAFE_MARGIN_Y + 30, 716, 84, 0x0f172a, 0.78).setStrokeStyle(2, 0x334155)
    scene.add.text(COCUY_CONFIG.SAFE_MARGIN_X, COCUY_CONFIG.SAFE_MARGIN_Y, 'ASCENSO AL COCUY', {
      fontSize: '28px',
      fontStyle: '700',
      color: '#f8fafc',
    })
    this.altitudeText = scene.add.text(COCUY_CONFIG.SAFE_MARGIN_X, COCUY_CONFIG.SAFE_MARGIN_Y + 42, '0 / 500 m', {
      fontSize: '22px',
      color: '#f8fafc',
    })
    this.timerText = scene.add.text(1036, COCUY_CONFIG.SAFE_MARGIN_Y, '00:30', {
      fontSize: '30px',
      fontStyle: '700',
      color: '#f8fafc',
    })
    this.messageText = scene.add.text(640, 132, '', { fontSize: '26px', fontStyle: '700', color: '#f8fafc' }).setOrigin(0.5).setDepth(880)
    this.finalText = scene.add
      .text(640, 316, '', { fontSize: '46px', fontStyle: '700', color: '#ffffff', align: 'center', lineSpacing: 12 })
      .setOrigin(0.5)
      .setDepth(1000)
    this.progressGraphics = scene.add.graphics().setDepth(730)

    if (DEBUG_MODE) {
      scene.add.rectangle(846, 166, 420, 256, 0x05070c, 0.72).setOrigin(0, 0).setDepth(900)
      this.debugText = scene.add.text(860, 178, '', { fontSize: '13px', color: '#d6e4ff', lineSpacing: 4 }).setDepth(901)
      this.addButton(860, 340, 'ROCK', actions.spawnRock, 52)
      this.addButton(918, 340, 'CLOUD', actions.spawnCloud, 60)
      this.addButton(984, 340, 'W-L', actions.spawnWindLeft, 46)
      this.addButton(1036, 340, 'W-R', actions.spawnWindRight, 46)
      this.addButton(1088, 340, 'CLEAR', actions.clearObstacles, 58)
      this.addButton(1152, 340, 'A450', actions.setAltitude450, 50)
      this.addButton(1208, 340, 'A490', actions.setAltitude490, 50)
      this.addButton(860, 370, 'HIT', actions.simulateRockHit, 46)
      this.addButton(912, 370, 'FOG', actions.activateCloud, 44)
      this.addButton(962, 370, 'WIND', actions.activateWind, 54)
      this.addButton(1022, 370, 'WIN', actions.forceWin, 46)
      this.addButton(1074, 370, 'LOSE', actions.forceLose, 54)
      this.addButton(1134, 370, 'RESET', actions.restart, 58)
    }
  }

  update(altitude: number, remainingMs: number): void {
    this.altitudeText.setText(`${Math.round(altitude)} / ${COCUY_CONFIG.TARGET_ALTITUDE} m`)
    const seconds = Math.ceil(remainingMs / 1000)
    this.timerText.setText(`00:${seconds.toString().padStart(2, '0')}`)
    this.drawProgress(altitude / COCUY_CONFIG.TARGET_ALTITUDE)
  }

  updateDebug(snapshot: CocuyDebugSnapshot): void {
    if (!this.debugText) {
      return
    }

    this.debugText.setText([
      `State: ${snapshot.state}`,
      `Elapsed: ${Math.round(snapshot.elapsedMs)} ms`,
      `Altitude: ${Math.round(snapshot.ascent.altitude)} m`,
      `Rate: ${snapshot.ascent.rate.toFixed(1)} m/s`,
      `Zone: ${snapshot.ascent.environmentZone}`,
      `X: ${Math.round(snapshot.movement.x)} | Vx: ${Math.round(snapshot.movement.velocity)}`,
      `Input: ${snapshot.movement.inputDirection}`,
      `Wind: ${Math.round(snapshot.movement.windInfluence)}`,
      `Scroll: ${Math.round(snapshot.worldScrollSpeed)} px/s`,
      `Obstacles: ${snapshot.activeObstacles}`,
    ])
  }

  showMessage(message: string, color = '#f8fafc'): void {
    this.messageText.setText(message)
    this.messageText.setColor(color)
    this.messageText.setAlpha(1)
    this.scene.tweens.add({
      targets: this.messageText,
      alpha: { from: 1, to: 0 },
      duration: 820,
      ease: 'Sine.easeOut',
    })
  }

  showFinal(victory: boolean, altitude: number, score: number): void {
    this.finalText.setText(`${victory ? '¡Cumbre alcanzada!' : 'Ascenso incompleto'}\n${victory ? 'VICTORIA' : 'DERROTA'}\n${Math.round(altitude)} m | Puntaje: ${score}`)
    this.finalText.setColor(victory ? '#6ee7b7' : '#f87171')
  }

  destroy(): void {
    this.progressGraphics.destroy()
  }

  private drawProgress(progress: number): void {
    const clamped = Phaser.Math.Clamp(progress, 0, 1)
    this.progressGraphics.clear()
    this.progressGraphics.fillStyle(0x05070c, 0.48)
    this.progressGraphics.fillRoundedRect(292, COCUY_CONFIG.SAFE_MARGIN_Y + 48, 360, 16, 8)
    this.progressGraphics.fillStyle(0x6ee7b7, 1)
    this.progressGraphics.fillRoundedRect(292, COCUY_CONFIG.SAFE_MARGIN_Y + 48, 360 * clamped, 16, 8)
  }

  private addButton(x: number, y: number, label: string, action: () => void, width: number): void {
    const button = this.scene.add.rectangle(x, y, width, 24, 0x1f2937, 0.94).setOrigin(0, 0).setDepth(902)
    button.setStrokeStyle(1, 0x64748b)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', action)
    this.scene.add.text(x + width / 2, y + 12, label, { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5).setDepth(903)
  }
}
