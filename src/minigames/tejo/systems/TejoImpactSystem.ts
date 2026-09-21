import Phaser from 'phaser'
import { TEJO_CONFIG } from '../config/tejoConfig'
import TejoBoard from '../entities/TejoBoard'
import type { TejoImpactResult, TejoPoint } from '../types/TejoTypes'

export default class TejoImpactSystem {
  constructor(private readonly board: TejoBoard) {}

  evaluate(point: TejoPoint): TejoImpactResult {
    for (const mecha of this.board.getMechaZones()) {
      if (Phaser.Math.Distance.Between(point.x, point.y, mecha.x, mecha.y) <= mecha.radius) {
        return 'MECHA'
      }
    }

    const bocin = this.board.getBocinCenter()

    if (Phaser.Math.Distance.Between(point.x, point.y, bocin.x, bocin.y) <= TEJO_CONFIG.NEAR_RADIUS) {
      return 'NEAR'
    }

    return 'OUT'
  }
}
