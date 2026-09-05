import type { MinigameKey, MinigameResult } from './Minigame'

export interface GameState {
  currentIndex: number
  victories: number
  defeats: number
  score: number
  minigameOrder: MinigameKey[]
  results: MinigameResult[]
  isRunning: boolean
}
