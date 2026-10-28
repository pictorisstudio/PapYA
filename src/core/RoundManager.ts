import { MINIGAME_ORDER, MINIGAMES_CONFIG } from '../config/minigamesConfig'
import type { GameState } from '../types/GameState'
import type { MinigameKey, MinigameResult, RecordedMinigameResult } from '../types/Minigame'
import { shuffle } from '../utils/shuffle'

export default class RoundManager {
  private state: GameState = this.createEmptyState()

  start(order: MinigameKey[] = shuffle(MINIGAME_ORDER)): GameState {
    if (!order.length || new Set(order).size !== order.length || order.some(key => !Object.hasOwn(MINIGAMES_CONFIG, key))) {
      throw new Error('Orden de minijuegos inválido')
    }
    this.state = {
      ...this.createEmptyState(),
      minigameOrder: [...order],
      isRunning: true,
    }

    return this.getState()
  }

  recordResult(outcome: MinigameResult): GameState {
    const key = this.getCurrentMinigameKey()

    if (!this.state.isRunning || !key || outcome.key !== key) {
      return this.getState()
    }

    const won = outcome.won
    const result: RecordedMinigameResult = {
      key,
      won,
      score: won ? 100 : 0,
      rawScore: Number.isFinite(outcome.rawScore) ? Math.max(0, outcome.rawScore) : 0,
      metrics: Object.fromEntries(Object.entries(outcome.metrics).filter(([, value]) => Number.isFinite(value))),
    }

    this.state.results.push(result)
    this.state.victories += won ? 1 : 0
    this.state.defeats += won ? 0 : 1
    this.state.score += result.score
    this.state.currentIndex += 1
    this.state.isRunning = this.state.currentIndex < this.state.minigameOrder.length

    return this.getState()
  }

  getCurrentMinigameKey(): MinigameKey | null {
    return this.state.minigameOrder[this.state.currentIndex] ?? null
  }

  getState(): GameState {
    return {
      ...this.state,
      minigameOrder: [...this.state.minigameOrder],
      results: this.state.results.map(result => ({ ...result, metrics: { ...result.metrics } })),
    }
  }

  private createEmptyState(): GameState {
    return {
      currentIndex: 0,
      victories: 0,
      defeats: 0,
      score: 0,
      minigameOrder: [],
      results: [],
      isRunning: false,
    }
  }
}
