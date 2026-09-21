import Phaser from 'phaser'
import { TEJO_CONFIG } from '../config/tejoConfig'
import TejoDisc from '../entities/TejoDisc'
import type { TejoAimState, TejoPoint } from '../types/TejoTypes'

type ThrowComplete = () => void

export default class TejoThrowSystem {
  private elapsedMs = 0
  private aim: TejoAimState | null = null
  private onComplete: ThrowComplete | null = null
  private active = false
  private readonly origin: TejoPoint = { x: TEJO_CONFIG.THROW_START_X, y: TEJO_CONFIG.THROW_START_Y }

  start(aim: TejoAimState, onComplete: ThrowComplete): void {
    this.elapsedMs = 0
    this.aim = aim
    this.onComplete = onComplete
    this.active = true
  }

  update(delta: number, disc: TejoDisc): void {
    if (!this.active || !this.aim) {
      return
    }

    this.elapsedMs += delta
    const progress = Phaser.Math.Clamp(this.elapsedMs / this.aim.durationMs, 0, 1)
    const point = this.getPoint(this.aim, progress)
    const scale = Phaser.Math.Linear(TEJO_CONFIG.START_SCALE, TEJO_CONFIG.END_SCALE, progress)

    disc.setPosition(point)
    disc.setScale(scale)
    disc.setRotation(progress * Math.PI * 4)

    if (progress >= 1) {
      const complete = this.onComplete
      this.stop()
      complete?.()
    }
  }

  isActive(): boolean {
    return this.active
  }

  stop(): void {
    this.active = false
    this.aim = null
    this.onComplete = null
    this.elapsedMs = 0
  }

  private getPoint(aim: TejoAimState, progress: number): TejoPoint {
    const baseX = Phaser.Math.Linear(this.origin.x, aim.target.x, progress)
    const baseY = Phaser.Math.Linear(this.origin.y, aim.target.y, progress)
    const arc = Math.sin(progress * Math.PI) * aim.arcHeight

    return {
      x: baseX,
      y: baseY - arc,
    }
  }
}
