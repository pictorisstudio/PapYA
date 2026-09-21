import Phaser from 'phaser'
import DebugPanel from '../../components/DebugPanel'
import { DEBUG_MODE } from '../../config/constants'
import { gameManager } from '../../core/GameManager'
import { TEJO_CONFIG } from './config/tejoConfig'
import TejoBoard from './entities/TejoBoard'
import TejoDisc from './entities/TejoDisc'
import TejoAimSystem from './systems/TejoAimSystem'
import TejoImpactSystem from './systems/TejoImpactSystem'
import TejoScoreManager from './systems/TejoScoreManager'
import TejoThrowSystem from './systems/TejoThrowSystem'
import TejoHUD from './ui/TejoHUD'
import type { TejoAimState, TejoImpactResult, TejoPhase, TejoPoint } from './types/TejoTypes'

export default class TejoScene extends Phaser.Scene {
  private board?: TejoBoard
  private disc?: TejoDisc
  private aimSystem?: TejoAimSystem
  private throwSystem?: TejoThrowSystem
  private impactSystem?: TejoImpactSystem
  private scoreManager?: TejoScoreManager
  private hud?: TejoHUD
  private phase: TejoPhase = 'READY'
  private elapsedMs = 0
  private finished = false
  private activeAim: TejoAimState | null = null
  private cleanupEvents: Phaser.Time.TimerEvent[] = []

  constructor() {
    super('TejoScene')
  }

  create(): void {
    this.resetState()
    this.cameras.main.setBackgroundColor(TEJO_CONFIG.COLORS.background)

    this.board = new TejoBoard(this)
    this.disc = new TejoDisc(this)
    this.aimSystem = new TejoAimSystem(this)
    this.throwSystem = new TejoThrowSystem()
    this.impactSystem = new TejoImpactSystem(this.board)
    this.scoreManager = new TejoScoreManager()
    this.hud = new TejoHUD(this, {
      forceMecha: () => this.forceImpact('MECHA'),
      forceNear: () => this.forceImpact('NEAR'),
      forceOut: () => this.forceImpact('OUT'),
      forceWin: () => this.finish(true),
      forceLose: () => this.finish(false),
      reset: () => this.scene.restart(),
    })

    this.setDebugVisible(DEBUG_MODE && gameManager.debugManager.areTouchAreasVisible())
    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)
    this.input.on('pointerupoutside', this.handlePointerUp, this)
    this.events.on('debug:touch-areas-changed', this.handleDebugTouchAreasChanged, this)

    new DebugPanel(this)
    this.refreshHud()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  update(_time: number, delta: number): void {
    if (this.phase === 'FINISHED' || !this.scoreManager || !this.hud || !this.disc) {
      return
    }

    this.elapsedMs += delta
    this.throwSystem?.update(delta, this.disc)
    this.refreshHud()

    if (this.elapsedMs >= TEJO_CONFIG.GAME_DURATION_MS) {
      this.finish(this.scoreManager.hasWon())
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.phase !== 'READY' || !this.disc || !this.aimSystem) {
      return
    }

    if (!this.disc.contains(pointer.worldX, pointer.worldY)) {
      return
    }

    this.phase = 'AIMING'
    this.disc.setHighlighted(true)
    this.updateAim(pointer)
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.phase !== 'AIMING') {
      return
    }

    this.updateAim(pointer)
  }

  private handlePointerUp(): void {
    if (this.phase !== 'AIMING' || !this.aimSystem || !this.throwSystem || !this.disc) {
      return
    }

    const aim = this.aimSystem.getCurrentAim()

    if (!aim || !this.aimSystem.hasValidDrag()) {
      this.resetDisc()
      return
    }

    this.activeAim = aim
    this.phase = 'THROWING'
    this.aimSystem.clear()
    this.disc.setHighlighted(false)
    this.disc.setPosition({ x: TEJO_CONFIG.THROW_START_X, y: TEJO_CONFIG.THROW_START_Y })
    this.board?.clearImpactPoint()
    this.throwSystem.start(aim, () => this.resolveImpact(aim.target))
  }

  private updateAim(pointer: Phaser.Input.Pointer): void {
    if (!this.aimSystem || !this.disc) {
      return
    }

    const aim = this.aimSystem.update(pointer.worldX, pointer.worldY)
    this.activeAim = aim
    this.disc.setPosition({
      x: TEJO_CONFIG.THROW_START_X + aim.dragX,
      y: TEJO_CONFIG.THROW_START_Y + aim.dragY,
    })
    this.refreshHud()
  }

  private resolveImpact(point: TejoPoint): void {
    if (this.finished || !this.impactSystem) {
      return
    }

    const result = this.impactSystem.evaluate(point)
    this.applyImpact(result, point)
  }

  private applyImpact(result: TejoImpactResult, point: TejoPoint): void {
    if (!this.scoreManager || !this.hud) {
      return
    }

    this.phase = 'IMPACT'
    const score = this.scoreManager.registerImpact(result)
    this.board?.showImpactPoint(point, result)
    this.board?.flashResult(point, result)
    this.hud.showImpact(result)
    this.refreshHud()

    if (score.victory) {
      this.finish(true)
      return
    }

    this.phase = 'RESETTING'
    this.trackTimer(this.time.delayedCall(TEJO_CONFIG.RESET_DELAY_MS, () => this.resetDisc()))
  }

  private resetDisc(): void {
    if (this.finished || !this.disc || !this.aimSystem) {
      return
    }

    this.phase = 'READY'
    this.activeAim = null
    this.aimSystem.clear()
    this.disc.reset()
    this.disc.setTouchAreaVisible(DEBUG_MODE && gameManager.debugManager.areTouchAreasVisible())
    this.refreshHud()
  }

  private forceImpact(result: TejoImpactResult): void {
    if (this.phase === 'FINISHED') {
      return
    }

    const point = this.getDebugImpactPoint(result)
    this.throwSystem?.stop()
    this.aimSystem?.clear()
    this.disc?.setHighlighted(false)
    this.disc?.setPosition(point)
    this.disc?.setScale(TEJO_CONFIG.END_SCALE)
    this.applyImpact(result, point)
  }

  private getDebugImpactPoint(result: TejoImpactResult): TejoPoint {
    if (result === 'MECHA') {
      const mecha = this.board?.getMechaZones()[0]
      return mecha ? { x: mecha.x, y: mecha.y } : { x: TEJO_CONFIG.BOARD_CENTER_X - 72, y: TEJO_CONFIG.BOARD_Y - 42 }
    }

    if (result === 'NEAR') {
      return { x: TEJO_CONFIG.BOARD_CENTER_X, y: TEJO_CONFIG.BOARD_Y + TEJO_CONFIG.BOCIN_RADIUS + 18 }
    }

    return { x: TEJO_CONFIG.BOARD_CENTER_X + TEJO_CONFIG.NEAR_RADIUS + 72, y: TEJO_CONFIG.BOARD_Y + 36 }
  }

  private finish(victory: boolean): void {
    if (this.finished || !this.hud || !this.scoreManager) {
      return
    }

    this.finished = true
    this.phase = 'FINISHED'
    this.throwSystem?.stop()
    this.aimSystem?.clear()
    this.disc?.setHighlighted(false)
    this.hud.showFinal(victory, this.scoreManager.getSnapshot())
    this.removeInputHandlers()

    this.trackTimer(
      this.time.delayedCall(TEJO_CONFIG.RESET_DELAY_MS + 900, () => {
        const nextScene = gameManager.completeCurrentMinigame(victory)
        this.scene.start(nextScene === 'next' ? 'TransitionScene' : 'ResultsScene')
      }),
    )
  }

  private refreshHud(): void {
    if (!this.scoreManager || !this.hud) {
      return
    }

    const remainingMs = Math.max(0, TEJO_CONFIG.GAME_DURATION_MS - this.elapsedMs)
    this.hud.update(this.scoreManager.getSnapshot(), remainingMs)
    this.hud.updateDebug({
      phase: this.phase,
      power: this.activeAim?.power ?? 0,
      normalizedPower: this.activeAim?.normalizedPower ?? 0,
      dragDistance: this.activeAim?.dragDistance ?? 0,
      effectiveDragDistance: this.activeAim?.effectiveDragDistance ?? 0,
      target: this.activeAim?.target ?? null,
      drag: this.activeAim ? { x: this.activeAim.dragX, y: this.activeAim.dragY } : null,
      elapsedMs: this.elapsedMs,
    })
  }

  private handleDebugTouchAreasChanged(visible: boolean): void {
    this.setDebugVisible(DEBUG_MODE && visible)
  }

  private setDebugVisible(visible: boolean): void {
    this.board?.setDebugVisible(visible)
    this.disc?.setTouchAreaVisible(visible)
  }

  private resetState(): void {
    this.phase = 'READY'
    this.elapsedMs = 0
    this.finished = false
    this.activeAim = null
    this.cleanupEvents = []
  }

  private trackTimer(timer: Phaser.Time.TimerEvent): void {
    this.cleanupEvents.push(timer)
  }

  private cleanup(): void {
    this.removeInputHandlers()
    this.events.off('debug:touch-areas-changed', this.handleDebugTouchAreasChanged, this)

    for (const timer of this.cleanupEvents) {
      timer.remove(false)
    }

    this.board?.destroy()
    this.disc?.destroy()
    this.aimSystem?.destroy()
    this.throwSystem?.stop()
    this.board = undefined
    this.disc = undefined
    this.aimSystem = undefined
    this.throwSystem = undefined
    this.impactSystem = undefined
    this.scoreManager = undefined
    this.hud = undefined
    this.activeAim = null
  }

  private removeInputHandlers(): void {
    this.input.off('pointerdown', this.handlePointerDown, this)
    this.input.off('pointermove', this.handlePointerMove, this)
    this.input.off('pointerup', this.handlePointerUp, this)
    this.input.off('pointerupoutside', this.handlePointerUp, this)
  }
}
