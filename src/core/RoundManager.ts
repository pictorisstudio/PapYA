import { MINIGAME_ORDER } from '../config/minigamesConfig'
import type { GameState } from '../types/GameState'
import type { MinigameKey, MinigameResult } from '../types/Minigame'
import { shuffle } from '../utils/shuffle'

export default class RoundManager {
  private state: GameState = this.createEmptyState()

  start(): GameState {
    this.state = {
      ...this.createEmptyState(),
      minigameOrder: shuffle(MINIGAME_ORDER),
      isRunning: true,
    }

    return this.getState()
  }

  recordResult(won: boolean): GameState {
    const key = this.getCurrentMinigameKey()

    if (!key) {
      return this.getState()
    }

    const result: MinigameResult = {
      key,
      won,
      score: won ? 100 : 20,
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
      results: [...this.state.results],
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
