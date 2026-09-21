import { TEJO_CONFIG } from '../config/tejoConfig'
import type { TejoImpactResult, TejoScoreSnapshot } from '../types/TejoTypes'

export default class TejoScoreManager {
  private score = 0
  private mechas = 0
  private throws = 0

  registerImpact(result: TejoImpactResult): TejoScoreSnapshot {
    this.throws += 1

    if (result === 'MECHA') {
      this.score += TEJO_CONFIG.MECHA_SCORE
      this.mechas += 1
    }

    if (result === 'NEAR') {
      this.score += TEJO_CONFIG.NEAR_SCORE
    }

    return this.getSnapshot()
  }

  hasWon(): boolean {
    return this.mechas >= TEJO_CONFIG.WIN_MECHAS || this.score >= TEJO_CONFIG.WIN_SCORE
  }

  getSnapshot(): TejoScoreSnapshot {
    return {
      score: this.score,
      mechas: this.mechas,
      throws: this.throws,
      victory: this.hasWon(),
    }
  }
}
