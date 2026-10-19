import Phaser from 'phaser'
import { COCUY_CONFIG } from '../config/cocuyConfig'
import type { CocuyInputDirection, MovementSnapshot } from '../types/CocuyTypes'

export default class CondorMovementSystem {
  private x = 640
  private velocity = 0
  private inputDirection: CocuyInputDirection = 0
  private windInfluence = 0
  private readonly activePointers = new Map<number, CocuyInputDirection>()
  private lastPointerId: number | null = null

  pointerDown(pointerId: number, x: number): void {
    const direction = this.getDirectionForX(x)
    this.activePointers.set(pointerId, direction)
    this.lastPointerId = pointerId
    this.refreshInputDirection()
  }

  pointerMove(pointerId: number, x: number): void {
    if (!this.activePointers.has(pointerId)) {
      return
    }

    this.activePointers.set(pointerId, this.getDirectionForX(x))
    this.lastPointerId = pointerId
    this.refreshInputDirection()
  }

  pointerUp(pointerId: number): void {
    this.activePointers.delete(pointerId)

    if (this.lastPointerId === pointerId) {
      this.lastPointerId = this.activePointers.size > 0 ? [...this.activePointers.keys()][this.activePointers.size - 1] : null
    }

    this.refreshInputDirection()
  }

  update(delta: number): MovementSnapshot {
    const seconds = delta / 1000
    const targetVelocity = this.inputDirection * COCUY_CONFIG.MAX_HORIZONTAL_SPEED
    const response = this.inputDirection === 0 ? COCUY_CONFIG.HORIZONTAL_DECELERATION : COCUY_CONFIG.HORIZONTAL_ACCELERATION

    this.velocity = Phaser.Math.Linear(this.velocity, targetVelocity, Math.min(1, response * seconds))
    this.x += (this.velocity + this.windInfluence) * seconds
    this.windInfluence = Phaser.Math.Linear(this.windInfluence, 0, Math.min(1, 2.2 * seconds))

    if (this.x <= COCUY_CONFIG.PLAYER_MIN_X || this.x >= COCUY_CONFIG.PLAYER_MAX_X) {
      this.x = Phaser.Math.Clamp(this.x, COCUY_CONFIG.PLAYER_MIN_X, COCUY_CONFIG.PLAYER_MAX_X)
      this.velocity = 0
    }

    return this.getSnapshot()
  }

  applyWind(force: number): void {
    this.windInfluence = Phaser.Math.Clamp(this.windInfluence + force, -COCUY_CONFIG.WIND_FORCE, COCUY_CONFIG.WIND_FORCE)
  }

  clearInput(): void {
    this.activePointers.clear()
    this.lastPointerId = null
    this.inputDirection = 0
  }

  getSnapshot(): MovementSnapshot {
    return {
      x: this.x,
      velocity: this.velocity,
      inputDirection: this.inputDirection,
      windInfluence: this.windInfluence,
    }
  }

  private refreshInputDirection(): void {
    if (this.lastPointerId === null) {
      this.inputDirection = 0
      return
    }

    this.inputDirection = this.activePointers.get(this.lastPointerId) ?? 0
  }

  private getDirectionForX(x: number): CocuyInputDirection {
    return x < 640 ? -1 : 1
  }
}
