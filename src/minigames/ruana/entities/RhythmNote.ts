import Phaser from 'phaser'
import { RUANA_CONFIG } from '../config/ruanaConfig'
import type LaneProjector from '../systems/LaneProjector'
import type { RuanaBeatNote, RuanaLaneId } from '../types/RuanaTypes'

export default class RhythmNote {
  readonly id: string
  readonly lane: RuanaLaneId
  readonly hitTime: number
  private readonly shape: Phaser.GameObjects.Rectangle
  private judged = false
  private progress = 0

  constructor(
    scene: Phaser.Scene,
    note: RuanaBeatNote,
    private readonly projector: LaneProjector,
  ) {
    this.id = note.id
    this.lane = note.lane
    this.hitTime = note.hitTime

    const start = this.projector.project(this.lane, 0)

    // TODO: reemplazar por sprite pixel art de hilo/patrón textil.
    this.shape = scene.add.rectangle(start.x, start.y, 92, 20, RUANA_CONFIG.COLORS.threadIdle)
    this.shape.setStrokeStyle(2, 0xffffff, 0.65)
    this.shape.setScale(start.scale)
  }

  update(currentTime: number): void {
    this.setProgress(this.projector.getProgressForTime(currentTime, this.hitTime))
  }

  setProgress(progress: number): void {
    this.progress = Phaser.Math.Clamp(progress, 0, 1)
    const projection = this.projector.project(this.lane, this.progress)
    this.shape.setPosition(projection.x, projection.y)
    this.shape.setScale(projection.scale)
    this.shape.setDepth(Math.round(projection.y))
  }

  markJudged(resultColor: number, alpha = 0.45): void {
    this.judged = true
    this.shape.setFillStyle(resultColor, alpha)
    this.shape.setAlpha(alpha)
  }

  isJudged(): boolean {
    return this.judged
  }

  getProgress(): number {
    return this.progress
  }

  destroy(): void {
    this.shape.destroy()
  }
}
