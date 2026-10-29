import { TEJO_CONFIG } from '../config/tejoConfig'
import type { TejoImpactResult, TejoScoreSnapshot } from '../types/TejoTypes'

export default class TejoScoreManager {
  private score = 0
  private mechas = 0
  private throws = 0

  registerImpact(result: TejoImpactResult): TejoScoreSnapshot {
    this.throws += 1

    if (result === 'MECHA' || result === 'MONONA') {
      this.score += result === 'MONONA' ? TEJO_CONFIG.MONONA_SCORE : TEJO_CONFIG.MECHA_SCORE
      this.mechas += 1
    }

    if (result === 'BOCIN') this.score += TEJO_CONFIG.BOCIN_SCORE

    if (result === 'NEAR') {
      this.score += TEJO_CONFIG.NEAR_SCORE
    }

    return this.getSnapshot()
  }

  hasWon(): boolean {
    return this.score >= TEJO_CONFIG.WIN_SCORE && this.mechas >= TEJO_CONFIG.MIN_MECHAS_TO_WIN
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
