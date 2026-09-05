import Phaser from 'phaser'
import { PAPA_CONFIG } from '../config/papaConfig'
import Potato from '../entities/Potato'
import type { PotatoType } from '../types/PapaTypes'

export default class PotatoSpawnManager {
  private readonly potatoes: Potato[] = []
  private elapsedSinceSpawn = 0
  private nextSpawnDelay = 0
  private idCounter = 0
  private paused = false
  private hitboxesVisible = false

  constructor(private readonly scene: Phaser.Scene) {
    this.nextSpawnDelay = this.getNextSpawnDelay()
  }

  update(delta: number): void {
    if (this.paused || this.potatoes.length >= PAPA_CONFIG.MAX_ACTIVE_POTATOES) {
      return
    }

    this.elapsedSinceSpawn += delta

    if (this.elapsedSinceSpawn >= this.nextSpawnDelay) {
      this.spawnPotato()
      this.elapsedSinceSpawn = 0
      this.nextSpawnDelay = this.getNextSpawnDelay()
    }
  }

  spawnPotato(forcedType?: PotatoType): void {
    if (this.potatoes.length >= PAPA_CONFIG.MAX_ACTIVE_POTATOES) {
      return
    }

    const type = forcedType ?? (Math.random() <= PAPA_CONFIG.GOOD_POTATO_PROBABILITY ? 'GOOD' : 'BAD')
    const x = Phaser.Math.Between(PAPA_CONFIG.SPAWN_MARGIN_X, 1280 - PAPA_CONFIG.SPAWN_MARGIN_X)
    const directionBias = x < 640 ? 1 : -1
    const velocityX = Phaser.Math.Between(PAPA_CONFIG.MIN_HORIZONTAL_SPEED, PAPA_CONFIG.MAX_HORIZONTAL_SPEED) + directionBias * Phaser.Math.Between(20, 80)
    const velocityY = Phaser.Math.Between(PAPA_CONFIG.MIN_VERTICAL_SPEED, PAPA_CONFIG.MAX_VERTICAL_SPEED)
    const rotationSpeed = Phaser.Math.FloatBetween(-2.6, 2.6)
    const scale = Phaser.Math.FloatBetween(0.86, 1.12)

    const potato = new Potato(this.scene, {
      id: `potato-${this.idCounter}`,
      type,
      x,
      y: PAPA_CONFIG.FIELD_BASE_Y + 20,
      velocityX,
      velocityY,
      rotationSpeed,
      scale,
    })

    this.idCounter += 1
    potato.setHitboxVisible(this.hitboxesVisible)
    this.potatoes.push(potato)
  }

  getPotatoAt(x: number, y: number): Potato | null {
    for (let index = this.potatoes.length - 1; index >= 0; index -= 1) {
      const potato = this.potatoes[index]

      if (potato.contains(x, y)) {
        return potato
      }
    }

    return null
  }

  removeInactivePotatoes(): void {
    for (let index = this.potatoes.length - 1; index >= 0; index -= 1) {
      const potato = this.potatoes[index]

      if (potato.isInactive()) {
        potato.destroy()
        this.potatoes.splice(index, 1)
      }
    }
  }

  clear(): void {
    for (const potato of this.potatoes) {
      potato.destroy()
    }

    this.potatoes.length = 0
  }

  setHitboxesVisible(visible: boolean): void {
    this.hitboxesVisible = visible

    for (const potato of this.potatoes) {
      potato.setHitboxVisible(visible)
    }
  }

  getActivePotatoes(): readonly Potato[] {
    return this.potatoes
  }

  getActiveCount(): number {
    return this.potatoes.reduce((total, potato) => total + (potato.isActive() ? 1 : 0), 0)
  }

  getVelocityDebugText(): string {
    const labels: string[] = []

    for (const potato of this.potatoes) {
      if (potato.isActive()) {
        labels.push(`${potato.id}: ${potato.velocityLabel}`)
      }

      if (labels.length >= 3) {
        break
      }
    }

    return labels.length > 0 ? labels.join(' | ') : '-'
  }

  pause(): void {
    this.paused = true
  }

  togglePaused(): boolean {
    this.paused = !this.paused
    return this.paused
  }

  isPaused(): boolean {
    return this.paused
  }

  destroy(): void {
    this.clear()
  }

  private getNextSpawnDelay(): number {
    return Phaser.Math.Between(PAPA_CONFIG.SPAWN_INTERVAL_MIN, PAPA_CONFIG.SPAWN_INTERVAL_MAX)
  }
}
