import Phaser from 'phaser'
import GameplaySession from '../../components/GameplaySession'
import DebugPanel from '../../components/DebugPanel'
import { DEBUG_MODE } from '../../config/constants'
import { gameManager } from '../../core/GameManager'
import { COCUY_CONFIG } from './config/cocuyConfig'
import Condor from './entities/Condor'
import AscentSystem from './systems/AscentSystem'
import CondorMovementSystem from './systems/CondorMovementSystem'
import CocuyScoreManager from './systems/CocuyScoreManager'
import ObstacleEffectSystem from './systems/ObstacleEffectSystem'
import ObstacleSpawnManager from './systems/ObstacleSpawnManager'
import WorldScrollSystem from './systems/WorldScrollSystem'
import CocuyHUD from './ui/CocuyHUD'
import VisibilityOverlay from './ui/VisibilityOverlay'
import CocuyFeedback from './ui/CocuyFeedback'
import type { CocuyGameState } from './types/CocuyTypes'

export default class CocuyScene extends Phaser.Scene {
  private session?: GameplaySession
  private condor?: Condor
  private movementSystem?: CondorMovementSystem
  private ascentSystem?: AscentSystem
  private worldScrollSystem?: WorldScrollSystem
  private obstacleSpawnManager?: ObstacleSpawnManager
  private obstacleEffectSystem?: ObstacleEffectSystem
  private scoreManager?: CocuyScoreManager
  private visibilityOverlay?: VisibilityOverlay
  private hud?: CocuyHUD
  private inputDebugGraphics?: Phaser.GameObjects.Graphics
  private inputDebugLabels: Phaser.GameObjects.Text[] = []
  private state: CocuyGameState = 'READY'
  private elapsedMs = 0
  private finished = false
  private rockHits = 0
  private nextRockHitMs = 0
  private feedback?: CocuyFeedback
  private cleanupEvents: Phaser.Time.TimerEvent[] = []

  constructor() {
    super('CocuyScene')
  }

  create(): void {
    this.resetState()
    this.cameras.main.setBackgroundColor(COCUY_CONFIG.COLORS.skyTop)

    this.worldScrollSystem = new WorldScrollSystem(this)
    this.condor = new Condor(this)
    this.movementSystem = new CondorMovementSystem()
    this.ascentSystem = new AscentSystem()
    this.obstacleSpawnManager = new ObstacleSpawnManager(this)
    this.obstacleEffectSystem = new ObstacleEffectSystem()
    this.scoreManager = new CocuyScoreManager()
    this.visibilityOverlay = new VisibilityOverlay(this)
    this.feedback = new CocuyFeedback(this)
    this.inputDebugGraphics = this.add.graphics().setDepth(890)
    this.inputDebugLabels = [
      this.add.text(320, 360, 'LEFT', { fontSize: '34px', fontStyle: '700', color: '#bae6fd' }).setOrigin(0.5).setDepth(891).setVisible(false),
      this.add.text(960, 360, 'RIGHT', { fontSize: '34px', fontStyle: '700', color: '#bae6fd' }).setOrigin(0.5).setDepth(891).setVisible(false),
    ]
    this.hud = new CocuyHUD(this, {
      spawnRock: () => this.spawnObstacle('ROCK'),
      spawnCloud: () => this.spawnObstacle('CLOUD'),
      spawnWindLeft: () => this.spawnObstacle('WIND', -1),
      spawnWindRight: () => this.spawnObstacle('WIND', 1),
      clearObstacles: () => this.obstacleSpawnManager?.clear(),
      setAltitude450: () => this.setAltitude(450),
      setAltitude490: () => this.setAltitude(490),
      simulateRockHit: () => this.applyRockHit(),
      activateCloud: () => this.activateCloudEffect(),
      activateWind: () => this.applyWind(COCUY_CONFIG.WIND_FORCE),
      forceWin: () => this.finish(true),
      forceLose: () => this.finish(false),
      restart: () => this.scene.restart(),
    })

    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)
    this.input.on('pointerupoutside', this.handlePointerUp, this)
    this.game.events.on(Phaser.Core.Events.BLUR, this.clearInput, this)
    this.events.on('debug:touch-areas-changed', this.handleDebugTouchAreasChanged, this)

    this.setDebugVisible(DEBUG_MODE && gameManager.debugManager.areTouchAreasVisible())
    this.session = new GameplaySession(this, { remainingMs: () => Math.max(0, COCUY_CONFIG.GAME_DURATION_MS - this.elapsedMs) / gameManager.pace, debugFinish: won => this.finish(won), cancelInput: () => this.clearInput() })
    new DebugPanel(this)
    this.state = 'PLAYING'
    this.refreshHud()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  update(_time: number, delta: number): void {
    if (this.state !== 'PLAYING' || !this.condor || !this.movementSystem || !this.ascentSystem || !this.worldScrollSystem) {
      return
    }

    delta *= gameManager.pace
    this.elapsedMs += delta
    this.ascentSystem.update(this.elapsedMs, delta)
    const movement = this.movementSystem.update(delta)
    this.worldScrollSystem.update(this.elapsedMs, delta)
    this.condor.setX(movement.x)
    this.condor.update(delta, movement.velocity, movement.windInfluence)
    this.visibilityOverlay?.update(this.elapsedMs)
    this.obstacleSpawnManager?.update(delta, this.elapsedMs, this.worldScrollSystem.getSpeed(), movement.x, gameManager.pace)
    this.obstacleEffectSystem?.update(this.condor, this.obstacleSpawnManager?.getActiveObstacles() ?? [], {
      onRockHit: rockX => this.applyRockHit(rockX),
      onCloud: () => this.activateCloudEffect(),
      onWind: (force) => this.applyWind(force),
    })

    this.refreshHud()

    if (this.ascentSystem.getSnapshot().victory) {
      this.ascentSystem.setAltitude(COCUY_CONFIG.TARGET_ALTITUDE)
      this.finish(true)
      return
    }

    if (this.elapsedMs >= COCUY_CONFIG.GAME_DURATION_MS) {
      this.finish(this.ascentSystem.getSnapshot().victory)
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer, objects: Phaser.GameObjects.GameObject[] = []): void {
    if (this.state !== 'PLAYING' || objects.length) {
      return
    }

    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    this.movementSystem?.pointerDown(pointer.id, point.x)
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.state !== 'PLAYING') {
      return
    }

    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    this.movementSystem?.pointerMove(pointer.id, point.x)
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    this.movementSystem?.pointerUp(pointer.id)
  }

  private applyRockHit(rockX?: number): void {
    if (this.state !== 'PLAYING' || this.elapsedMs < this.nextRockHitMs) {
      return
    }

    gameManager.audioManager.playEffect(this, 'cocuyCollision')
    this.nextRockHitMs = this.elapsedMs + COCUY_CONFIG.ROCK_PROTECTION_MS
    this.rockHits += 1
    this.ascentSystem?.applyRockPenalty()
    this.condor?.flashHit()
    const x = this.movementSystem?.getSnapshot().x ?? 640
    this.movementSystem?.applyRockKnockback(x >= (rockX ?? x + 1) ? 1 : -1)
    this.feedback?.rock(x, COCUY_CONFIG.PLAYER_Y)
    this.cameras?.main.shake?.(110, 0.003)
  }

  private activateCloudEffect(): void {
    if (this.state !== 'PLAYING') {
      return
    }

    this.visibilityOverlay?.activate(this.elapsedMs)
    this.feedback?.cloud(this.movementSystem?.getSnapshot().x ?? 640, COCUY_CONFIG.PLAYER_Y)
  }

  private applyWind(force: number): void {
    if (this.state !== 'PLAYING') {
      return
    }

    this.movementSystem?.applyWind(force)
    this.feedback?.wind(this.movementSystem?.getSnapshot().x ?? 640, COCUY_CONFIG.PLAYER_Y, force > 0 ? 1 : -1)
  }

  private spawnObstacle(type: 'ROCK' | 'CLOUD' | 'WIND', windDirection: -1 | 1 = 1): void {
    if (type === 'WIND') {
      this.obstacleSpawnManager?.spawnWindPattern(windDirection, this.movementSystem?.getSnapshot().x ?? 640, 0, gameManager.pace)
      return
    }
    this.obstacleSpawnManager?.spawnObstacle(type, windDirection)
  }

  private setAltitude(altitude: number): void {
    this.ascentSystem?.setAltitude(altitude)
    this.refreshHud()
  }

  private finish(victory: boolean): void {
    if (this.finished || !this.ascentSystem || !this.hud || !this.scoreManager) {
      return
    }

    this.finished = true
    this.state = 'FINISHED'
    this.clearInput()
    this.removeInputHandlers()
    const altitude = this.ascentSystem.getSnapshot().altitude
    const remainingMs = Math.max(0, COCUY_CONFIG.GAME_DURATION_MS - this.elapsedMs) / gameManager.pace
    const score = this.scoreManager.calculateScore(altitude, remainingMs, this.rockHits)
    this.session?.complete({ key: 'cocuy', won: victory, rawScore: score,
      metrics: { altitude, rockHits: this.rockHits } })
  }

  private refreshHud(): void {
    if (!this.hud || !this.ascentSystem || !this.movementSystem || !this.worldScrollSystem || !this.obstacleSpawnManager) {
      return
    }

    const remainingMs = Math.max(0, COCUY_CONFIG.GAME_DURATION_MS - this.elapsedMs) / gameManager.pace
    const ascent = this.ascentSystem.getSnapshot()
    const movement = this.movementSystem.getSnapshot()
    this.hud.update(ascent.altitude, remainingMs)
    this.hud.updateDebug({
      state: this.state,
      elapsedMs: this.elapsedMs,
      ascent,
      movement,
      worldScrollSpeed: this.worldScrollSystem.getSpeed(),
      activeObstacles: this.obstacleSpawnManager.getActiveCount(),
    })
  }

  private handleDebugTouchAreasChanged(visible: boolean): void {
    this.setDebugVisible(DEBUG_MODE && visible)
  }

  private setDebugVisible(visible: boolean): void {
    this.condor?.setHitboxVisible(visible)
    this.obstacleSpawnManager?.setHitboxesVisible(visible)
    this.drawInputDebug(visible)
  }

  private drawInputDebug(visible: boolean): void {
    if (!this.inputDebugGraphics) {
      return
    }

    this.inputDebugGraphics.clear()
    for (const label of this.inputDebugLabels) {
      label.setVisible(visible)
    }

    if (!visible) {
      return
    }

    this.inputDebugGraphics.lineStyle(3, COCUY_CONFIG.COLORS.touchArea, 0.7)
    this.inputDebugGraphics.strokeRect(0, 0, 640, 720)
    this.inputDebugGraphics.strokeRect(640, 0, 640, 720)
    this.inputDebugGraphics.fillStyle(COCUY_CONFIG.COLORS.touchArea, 0.08)
    this.inputDebugGraphics.fillRect(0, 0, 640, 720)
    this.inputDebugGraphics.fillRect(640, 0, 640, 720)
  }

  private clearInput(): void {
    this.movementSystem?.clearInput()
  }

  private resetState(): void {
    this.state = 'READY'
    this.elapsedMs = 0
    this.finished = false
    this.rockHits = 0
    this.nextRockHitMs = 0
    this.cleanupEvents = []
  }

  private trackTimer(timer: Phaser.Time.TimerEvent): void {
    this.cleanupEvents.push(timer)
  }

  private cleanup(): void {
    this.removeInputHandlers()
    this.game.events.off(Phaser.Core.Events.BLUR, this.clearInput, this)
    this.events.off('debug:touch-areas-changed', this.handleDebugTouchAreasChanged, this)

    for (const timer of this.cleanupEvents) {
      timer.remove(false)
    }

    this.obstacleSpawnManager?.destroy()
    this.worldScrollSystem?.destroy()
    this.visibilityOverlay?.destroy()
    this.condor?.destroy()
    this.hud?.destroy()
    this.inputDebugGraphics?.destroy()
    for (const label of this.inputDebugLabels) {
      label.destroy()
    }
    this.condor = undefined
    this.movementSystem = undefined
    this.ascentSystem = undefined
    this.worldScrollSystem = undefined
    this.obstacleSpawnManager = undefined
    this.obstacleEffectSystem = undefined
    this.scoreManager = undefined
    this.visibilityOverlay = undefined
    this.hud = undefined
    this.inputDebugGraphics = undefined
    this.feedback = undefined
    this.inputDebugLabels = []
  }

  private removeInputHandlers(): void {
    this.input.off('pointerdown', this.handlePointerDown, this)
    this.input.off('pointermove', this.handlePointerMove, this)
    this.input.off('pointerup', this.handlePointerUp, this)
    this.input.off('pointerupoutside', this.handlePointerUp, this)
  }
}
