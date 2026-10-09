import type { MinigameKey, RecordedMinigameResult } from './Minigame'

export interface GameState {
  currentIndex: number
  victories: number
  defeats: number
  score: number
  minigameOrder: MinigameKey[]
  results: RecordedMinigameResult[]
  isRunning: boolean
}
