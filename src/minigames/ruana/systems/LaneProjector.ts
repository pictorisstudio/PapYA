import Phaser from 'phaser'
import { RUANA_CONFIG } from '../config/ruanaConfig'
import type { RuanaLaneDefinition, RuanaLaneId, RuanaProjection } from '../types/RuanaTypes'

export default class LaneProjector {
  private readonly lanes: RuanaLaneDefinition[]

  constructor() {
    this.lanes = [0, 1, 2, 3].map((laneId) => ({
      id: laneId as RuanaLaneId,
      startX: RUANA_CONFIG.LANE_START_POSITIONS[laneId],
      endX: RUANA_CONFIG.LANE_END_POSITIONS[laneId],
      startY: RUANA_CONFIG.LANE_START_Y,
      endY: RUANA_CONFIG.LANE_END_Y,
    }))
  }

  project(laneId: RuanaLaneId, progress: number): RuanaProjection {
    const lane = this.getLane(laneId)
    const safeProgress = Phaser.Math.Clamp(progress, 0, 1)
    const visualProgress = this.ease(safeProgress)

    return {
      x: Math.round(Phaser.Math.Linear(lane.startX, lane.endX, visualProgress)),
      y: Math.round(Phaser.Math.Linear(lane.startY, lane.endY, visualProgress)),
      scale: Phaser.Math.Linear(RUANA_CONFIG.MIN_NOTE_SCALE, RUANA_CONFIG.MAX_NOTE_SCALE, visualProgress),
      visualProgress,
    }
  }

  getProgressForTime(currentTime: number, hitTime: number): number {
    const spawnTime = hitTime - RUANA_CONFIG.NOTE_TRAVEL_TIME
    return Phaser.Math.Clamp((currentTime - spawnTime) / RUANA_CONFIG.NOTE_TRAVEL_TIME, 0, 1.12)
  }

  getLane(laneId: RuanaLaneId): RuanaLaneDefinition {
    return this.lanes[laneId]
  }

  getLanes(): readonly RuanaLaneDefinition[] {
    return this.lanes
  }

  private ease(progress: number): number {
    if (RUANA_CONFIG.PERSPECTIVE_EASING === 'quadIn') {
      return progress * progress
    }

    return progress
  }
}
