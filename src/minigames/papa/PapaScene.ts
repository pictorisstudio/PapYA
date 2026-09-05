import Phaser from 'phaser'
import DebugPanel from '../../components/DebugPanel'
import { DEBUG_MODE } from '../../config/constants'
import { gameManager } from '../../core/GameManager'
import { PAPA_CONFIG } from './config/papaConfig'
import Potato from './entities/Potato'
import PotatoScoreManager from './systems/PotatoScoreManager'
import PotatoSpawnManager from './systems/PotatoSpawnManager'
import FieldDisplay from './ui/FieldDisplay'
import PapaHUD from './ui/PapaHUD'
import type { PotatoType } from './types/PapaTypes'

type PapaPhase = 'playing' | 'finished'

export default class PapaScene extends Phaser.Scene {
  private spawnManager?: PotatoSpawnManager
  private scoreManager?: PotatoScoreManager
  private hud?: PapaHUD
  private inputHandler?: (pointer: Phaser.Input.Pointer) => void
  private phase: PapaPhase = 'playing'
  private elapsedMs = 0
  private finished = false

  constructor() {
    super('PapaScene')
  }

  create(): void {
    this.resetState()
    new FieldDisplay(this)

    this.scoreManager = new PotatoScoreManager()
    this.spawnManager = new PotatoSpawnManager(this)
    this.spawnManager.setHitboxesVisible(DEBUG_MODE && gameManager.debugManager.arePapaHitboxesVisible())
    this.hud = new PapaHUD(this, {
      spawnGood: () => this.spawnDebugPotato('GOOD'),
      spawnBad: () => this.spawnDebugPotato('BAD'),
      clearPotatoes: () => this.spawnManager?.clear(),
      forceVictory: () => this.finish(true),
      forceDefeat: () => this.finish(false),
      toggleHitboxes: () => this.toggleHitboxes(),
      toggleSpawn: () => this.spawnManager?.togglePaused(),
      restart: () => this.scene.restart(),
    })

    this.inputHandler = (pointer) => this.handlePointerDown(pointer)
    this.input.on('pointerdown', this.inputHandler)

    new DebugPanel(this)
    this.refreshHud()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  update(_time: number, delta: number): void {
    if (this.phase !== 'playing' || !this.spawnManager || !this.scoreManager) {
      return
    }

    this.elapsedMs += delta
    this.spawnManager.update(delta)

    for (const potato of this.spawnManager.getActivePotatoes()) {
      potato.update(delta)
    }

    this.spawnManager.removeInactivePotatoes()
    this.refreshHud()

    if (this.scoreManager.hasWon()) {
      this.finish(true)
      return
    }

    if (this.elapsedMs >= PAPA_CONFIG.GAME_DURATION) {
      this.finish(false)
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.phase !== 'playing' || !this.spawnManager || !this.scoreManager) {
      return
    }

    const potato = this.spawnManager.getPotatoAt(pointer.worldX, pointer.worldY)

    if (!potato) {
      return
    }

    this.collectPotato(potato)
  }

  private collectPotato(potato: Potato): void {
    if (!this.scoreManager || !this.hud) {
      return
    }

    const result = this.scoreManager.collect(potato.type)
    potato.hit()
    this.hud.showFloatingFeedback(potato.x, potato.y, potato.type === 'GOOD' ? '+1' : 'X', potato.type)

    if (result.defeat) {
      this.finish(false)
      return
    }

    this.refreshHud()
  }

  private spawnDebugPotato(type: PotatoType): void {
    this.spawnManager?.spawnPotato(type)
  }

  private toggleHitboxes(): void {
    const visible = gameManager.debugManager.togglePapaHitboxes()
    this.spawnManager?.setHitboxesVisible(visible)
  }

  private finish(victory: boolean): void {
    if (this.finished || !this.hud) {
      return
    }

    this.finished = true
    this.phase = 'finished'
    this.removeInputHandler()
    this.spawnManager?.pause()
    this.hud.showFinal(victory, this.scoreManager?.getSnapshot().score ?? 0)

    this.time.delayedCall(PAPA_CONFIG.RESULT_DURATION_MS, () => {
      const nextScene = gameManager.completeCurrentMinigame(victory)
      this.scene.start(nextScene === 'next' ? 'TransitionScene' : 'ResultsScene')
    })
  }

  private refreshHud(): void {
    if (!this.scoreManager || !this.spawnManager || !this.hud) {
      return
    }

    const remainingMs = Math.max(0, PAPA_CONFIG.GAME_DURATION - this.elapsedMs)
    this.hud.update(this.scoreManager.getSnapshot(), remainingMs, {
      activePotatoes: this.spawnManager.getActiveCount(),
      spawnPaused: this.spawnManager.isPaused(),
      velocityText: this.spawnManager.getVelocityDebugText(),
    })
  }

  private resetState(): void {
    this.phase = 'playing'
    this.elapsedMs = 0
    this.finished = false
  }

  private cleanup(): void {
    this.removeInputHandler()
    this.spawnManager?.destroy()
    this.spawnManager = undefined
    this.scoreManager = undefined
    this.hud = undefined
  }

  private removeInputHandler(): void {
    if (!this.inputHandler) {
      return
    }

    this.input.off('pointerdown', this.inputHandler)
    this.inputHandler = undefined
  }
}
