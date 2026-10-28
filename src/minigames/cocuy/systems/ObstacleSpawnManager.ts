import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'
import CocuyObstacle from '../entities/CocuyObstacle'
import type { ObstacleType } from '../types/CocuyTypes'

export default class ObstacleSpawnManager {
  private readonly obstacles: CocuyObstacle[] = []
  private elapsedSinceSpawn = 0
  private nextSpawnDelay: number = COCUY_CONFIG.SPAWN_INTERVAL_MAX
  private idCounter = 0
  private hitboxesVisible = false

  constructor(private readonly scene: Phaser.Scene) {}

  update(delta: number, elapsedMs: number, worldSpeed: number, playerX: number, reactionScale = 1): void {
    this.elapsedSinceSpawn += delta

    if (this.elapsedSinceSpawn >= this.nextSpawnDelay && this.obstacles.length < COCUY_CONFIG.MAX_ACTIVE_OBSTACLES) {
      const paired = this.spawnRandom(elapsedMs, worldSpeed, playerX, reactionScale)
      this.elapsedSinceSpawn = 0
      this.nextSpawnDelay = this.getNextSpawnDelay(elapsedMs)
      if (paired) this.nextSpawnDelay = Math.max(this.nextSpawnDelay, COCUY_CONFIG.PAIR_SPAWN_BREAK_MS * reactionScale)
    }

    for (const obstacle of this.obstacles) {
      obstacle.update(delta, worldSpeed)
    }

    this.removeDestroyed()
  }

  spawnObstacle(type: ObstacleType, windDirection: -1 | 1 = 1, x?: number, speed = 0, y = -90): void {
    if (this.obstacles.length >= COCUY_CONFIG.MAX_ACTIVE_OBSTACLES) return
    const radius = Phaser.Math.Between(COCUY_CONFIG.ROCK_VISUAL_RADIUS_MIN, COCUY_CONFIG.ROCK_VISUAL_RADIUS_MAX)
    const obstacle = new CocuyObstacle(this.scene, {
      id: `cocuy-obstacle-${this.idCounter}`,
      type,
      x: x ?? Phaser.Math.Between(130, 1150),
      y,
      speed,
      radius,
      windDirection,
    })
    this.idCounter += 1
    obstacle.setHitboxVisible(this.hitboxesVisible)
    this.obstacles.push(obstacle)
  }

  spawnWindPattern(direction: -1 | 1, x: number, speed = 0, reactionScale = 1): boolean {
    if (this.obstacles.length > COCUY_CONFIG.MAX_ACTIVE_OBSTACLES - 2) return false
    const offset = COCUY_CONFIG.WIND_ROCK_OFFSET_X
    const windX = Phaser.Math.Clamp(x, direction === -1 ? 130 + offset : 130, direction === 1 ? 1150 - offset : 1150)
    // Misma velocidad para ambos. La roca llega después y queda del lado del empuje.
    // Calcular con la velocidad máxima mantiene un margen real incluso al acelerar.
    const gap = (COCUY_CONFIG.WORLD_SCROLL_SPEED_END + speed) * COCUY_CONFIG.WIND_ROCK_REACTION_SECONDS * Math.max(1, reactionScale)
    this.spawnObstacle('WIND', direction, windX, speed)
    this.spawnObstacle('ROCK', direction, windX + direction * offset, speed, -90 - gap)
    return true
  }

  clear(): void {
    for (const obstacle of this.obstacles) {
      obstacle.destroy()
    }

    this.obstacles.length = 0
  }

  setHitboxesVisible(visible: boolean): void {
    this.hitboxesVisible = visible

    for (const obstacle of this.obstacles) {
      obstacle.setHitboxVisible(visible)
    }
  }

  getActiveObstacles(): readonly CocuyObstacle[] {
    return this.obstacles
  }

  getActiveCount(): number {
    return this.obstacles.filter((obstacle) => obstacle.isActive()).length
  }

  destroy(): void {
    this.clear()
  }

  private spawnRandom(elapsedMs: number, worldSpeed: number, playerX: number, reactionScale: number): boolean {
    const type = this.pickObstacleType()
    const minDistance = worldSpeed * COCUY_CONFIG.MIN_REACTION_TIME
    const avoidsPlayer = type === 'ROCK' && Phaser.Math.Between(0, 100) < 62
    const x = avoidsPlayer ? this.getFairRockX(playerX, minDistance) : Phaser.Math.Between(130, 1150)
    const speed = Phaser.Math.Linear(12, 74, Phaser.Math.Clamp(elapsedMs / COCUY_CONFIG.GAME_DURATION_MS, 0, 1))
    const windDirection: -1 | 1 = Phaser.Math.Between(0, 1) === 0 ? -1 : 1
    if (type === 'WIND' && this.spawnWindPattern(windDirection, playerX + Phaser.Math.Between(-120, 120), speed, reactionScale)) return true
    this.spawnObstacle(type, windDirection, x, speed)
    return false
  }

  private getFairRockX(playerX: number, minDistance: number): number {
    const side: -1 | 1 = Phaser.Math.Between(0, 1) === 0 ? -1 : 1
    return Phaser.Math.Clamp(playerX + side * Phaser.Math.Between(Math.min(200, Math.round(minDistance)), 280), 130, 1150)
  }

  private pickObstacleType(): ObstacleType {
    const totalWeight = COCUY_CONFIG.ROCK_SPAWN_WEIGHT + COCUY_CONFIG.CLOUD_SPAWN_WEIGHT + COCUY_CONFIG.WIND_SPAWN_WEIGHT
    const roll = Phaser.Math.Between(1, totalWeight)

    if (roll <= COCUY_CONFIG.ROCK_SPAWN_WEIGHT) {
      return 'ROCK'
    }

    if (roll <= COCUY_CONFIG.ROCK_SPAWN_WEIGHT + COCUY_CONFIG.CLOUD_SPAWN_WEIGHT) {
      return 'CLOUD'
    }

    return 'WIND'
  }

  private getNextSpawnDelay(elapsedMs: number): number {
    const progress = Phaser.Math.Clamp(elapsedMs / COCUY_CONFIG.GAME_DURATION_MS, 0, 1)
    const min = Phaser.Math.Linear(COCUY_CONFIG.SPAWN_INTERVAL_MAX, COCUY_CONFIG.SPAWN_INTERVAL_MIN, progress)
    const max = Phaser.Math.Linear(COCUY_CONFIG.SPAWN_INTERVAL_MAX + 360, COCUY_CONFIG.SPAWN_INTERVAL_MAX, progress)
    return Phaser.Math.Between(Math.round(min), Math.round(max))
  }

  private removeDestroyed(): void {
    for (let index = this.obstacles.length - 1; index >= 0; index -= 1) {
      if (this.obstacles[index].isDestroyed()) {
        this.obstacles[index].destroy()
        this.obstacles.splice(index, 1)
      }
    }
  }
}
