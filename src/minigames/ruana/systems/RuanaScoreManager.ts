import { RUANA_CONFIG } from '../config/ruanaConfig'
import type { RuanaJudgeResult } from '../types/RuanaTypes'

export interface RuanaScoreSnapshot {
  perfect: number
  good: number
  miss: number
  totalNotes: number
  notesHit: number
  score: number
  accuracy: number
  victory: boolean
}

export default class RuanaScoreManager {
  private perfect = 0
  private good = 0
  private miss = 0
  private score = 0

  constructor(private readonly totalNotes: number) {}

  register(result: RuanaJudgeResult): void {
    if (this.getResolvedNotes() >= this.totalNotes) {
      return
    }

    if (result === 'PERFECT') {
      this.perfect += 1
      this.score += 100
      return
    }

    if (result === 'GOOD') {
      this.good += 1
      this.score += 75
      return
    }

    this.miss += 1
  }

  getAccuracy(): number {
    if (this.totalNotes === 0) {
      return 0
    }

    // GOOD cuenta como acierto valido, pero ponderado para medir precision temporal.
    return ((this.perfect + this.good * 0.75) / this.totalNotes) * 100
  }

  isVictory(): boolean {
    return this.getAccuracy() >= RUANA_CONFIG.WIN_ACCURACY
  }

  getSnapshot(): RuanaScoreSnapshot {
    return {
      perfect: this.perfect,
      good: this.good,
      miss: this.miss,
      totalNotes: this.totalNotes,
      notesHit: this.perfect + this.good,
      score: this.score,
      accuracy: this.getAccuracy(),
      victory: this.isVictory(),
    }
  }

  private getResolvedNotes(): number {
    return this.perfect + this.good + this.miss
  }
}
