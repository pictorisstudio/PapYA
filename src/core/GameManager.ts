import { MINIGAMES_CONFIG } from '../config/minigamesConfig'
import { REQUIRED_VICTORIES } from '../config/constants'
import WebStorageAdapter from '../storage/WebStorageAdapter'
import type { MinigameConfig, MinigameKey, MinigameResult } from '../types/Minigame'
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
  isPractice = false
  private paceLevel = 0
  get pace(): number { return 30 / [30, 27, 24, 21, 18][this.paceLevel]! }
  get difficultyLevel(): number { return this.paceLevel }

  initialize(): void {
    this.saveManager = new SaveManager(new WebStorageAdapter())
    this.progressManager = new ProgressManager(this.saveManager)
    this.roundManager = new RoundManager()
    this.audioManager = new AudioManager()
    this.debugManager = new DebugManager()
    this.paceLevel = 0
  }

  startNewRun(order?: MinigameKey[], practice = false, continueSession = false): MinigameConfig {
    if (!continueSession || practice) this.paceLevel = 0
    this.lastUnlockedRoute = null
    this.lastRoutePerfect = false
    this.runFinished = false
    this.isPractice = practice
    this.roundManager.start(order)
    return this.getCurrentMinigame()
  }

  getCurrentMinigame(): MinigameConfig {
    const key = this.roundManager.getCurrentMinigameKey()

    if (!key) {
      throw new Error('No hay microjuego activo.')
    }

    return MINIGAMES_CONFIG[key]
  }

  completeCurrentMinigame(result: MinigameResult): 'next' | 'results' | 'practice' {
    const state = this.roundManager.recordResult(result)
    if (this.isPractice && !state.isRunning) return 'practice'
    return state.isRunning ? 'next' : 'results'
  }

  finishRun(): void {
    if (this.runFinished) {
      return
    }

    const state = this.roundManager.getState()
    if (this.isPractice || state.isRunning || state.results.length === 0 || state.results.length !== state.minigameOrder.length) return
    const isSuccessful = state.victories >= REQUIRED_VICTORIES
    const isPerfect = state.victories === state.minigameOrder.length
    if (isSuccessful) this.paceLevel = Math.min(4, this.paceLevel + 1)

    this.progressManager.registerRun(state.victories, state.score, state.results)
    this.lastUnlockedRoute = isSuccessful ? this.progressManager.unlockNextRoute(isPerfect) : null
    this.lastRoutePerfect = Boolean(this.lastUnlockedRoute && isPerfect)
    this.runFinished = true
  }
}

export const gameManager = new GameManager()
