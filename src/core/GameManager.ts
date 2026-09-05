import { MINIGAMES_CONFIG } from '../config/minigamesConfig'
import { REQUIRED_VICTORIES } from '../config/constants'
import WebStorageAdapter from '../storage/WebStorageAdapter'
import type { MinigameConfig } from '../types/Minigame'
import type { RouteId } from '../types/SaveData'
import AudioManager from './AudioManager'
import DebugManager from './DebugManager'
import ProgressManager from './ProgressManager'
import RoundManager from './RoundManager'
import SaveManager from './SaveManager'

export default class GameManager {
  saveManager!: SaveManager
  progressManager!: ProgressManager
  roundManager!: RoundManager
  audioManager!: AudioManager
  debugManager!: DebugManager

  lastUnlockedRoute: RouteId | null = null
  lastRoutePerfect = false
  private runFinished = false

  initialize(): void {
    this.saveManager = new SaveManager(new WebStorageAdapter())
    this.progressManager = new ProgressManager(this.saveManager)
    this.roundManager = new RoundManager()
    this.audioManager = new AudioManager()
    this.debugManager = new DebugManager()
  }

  startNewRun(): MinigameConfig {
    this.lastUnlockedRoute = null
    this.lastRoutePerfect = false
    this.runFinished = false
    this.roundManager.start()
    return this.getCurrentMinigame()
  }

  getCurrentMinigame(): MinigameConfig {
    const key = this.roundManager.getCurrentMinigameKey()

    if (!key) {
      throw new Error('No hay microjuego activo.')
    }

    return MINIGAMES_CONFIG[key]
  }

  completeCurrentMinigame(won: boolean): 'next' | 'results' {
    const state = this.roundManager.recordResult(won)
    return state.isRunning ? 'next' : 'results'
  }

  finishRun(): void {
    if (this.runFinished) {
      return
    }

    const state = this.roundManager.getState()
    const isSuccessful = state.victories >= REQUIRED_VICTORIES
    const isPerfect = state.victories === state.minigameOrder.length

    this.progressManager.registerRun(state.victories, state.score)
    this.lastUnlockedRoute = isSuccessful ? this.progressManager.unlockNextRoute(isPerfect) : null
    this.lastRoutePerfect = Boolean(this.lastUnlockedRoute && isPerfect)
    this.runFinished = true
  }
}

export const gameManager = new GameManager()
