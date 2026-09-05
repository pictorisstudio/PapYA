import { PAPA_CONFIG } from '../config/papaConfig'
import type { PotatoScoreSnapshot, PotatoType } from '../types/PapaTypes'

export default class PotatoScoreManager {
  private goodPotatoesCollected = 0
  private badPotatoesTouched = 0
  private score = 0

  collect(type: PotatoType): { victory: boolean; defeat: boolean } {
    if (type === 'GOOD') {
      this.goodPotatoesCollected += 1
      this.score += PAPA_CONFIG.POTATO_SCORE
      return {
        victory: this.hasWon(),
        defeat: false,
      }
    }

    this.badPotatoesTouched += 1
    return {
      victory: false,
      defeat: PAPA_CONFIG.BAD_POTATO_IMMEDIATE_DEFEAT,
    }
  }

  hasWon(): boolean {
    return this.goodPotatoesCollected >= PAPA_CONFIG.GOOD_POTATO_TARGET
  }

  getSnapshot(): PotatoScoreSnapshot {
    return {
      goodPotatoesCollected: this.goodPotatoesCollected,
      badPotatoesTouched: this.badPotatoesTouched,
      score: this.score,
      target: PAPA_CONFIG.GOOD_POTATO_TARGET,
      victory: this.hasWon(),
    }
  }
}
