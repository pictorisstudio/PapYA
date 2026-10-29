import Phaser from 'phaser'
import { TEJO_CONFIG } from '../config/tejoConfig'
import TejoBoard from '../entities/TejoBoard'
import type { TejoImpactResult, TejoPoint } from '../types/TejoTypes'

export default class TejoImpactSystem {
  constructor(private readonly board: TejoBoard) {}

  evaluate(point: TejoPoint): TejoImpactResult {
    const center = this.board.getBocinCenter()
    const inBocin = Phaser.Math.Distance.Between(point.x, point.y, center.x, center.y) <= TEJO_CONFIG.BOCIN_RADIUS
    if (inBocin) {
      const touchesMecha = this.board.getMechaZones().some(mecha =>
        Phaser.Math.Distance.Between(point.x, point.y, mecha.x, mecha.y) <= mecha.radius + TEJO_CONFIG.IMPACT_DISC_RADIUS)
      return touchesMecha ? 'MONONA' : 'BOCIN'
    }
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
