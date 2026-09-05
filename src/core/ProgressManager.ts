import { TOTAL_ROUTES } from '../config/constants'
import type SaveManager from './SaveManager'
import type { RouteId, SaveData } from '../types/SaveData'

const ROUTES: RouteId[] = ['route1', 'route2', 'route3', 'route4', 'route5']

export type RouteState = 'locked' | 'next' | 'unlocked'

export default class ProgressManager {
  private saveData: SaveData

  constructor(private readonly saveManager: SaveManager) {
    this.saveData = saveManager.load()
  }

  getSaveData(): SaveData {
    return this.saveManager.getData()
  }

  getRouteState(routeId: RouteId): RouteState {
    const data = this.getSaveData()

    if (data.unlockedRoutes.includes(routeId)) {
      return 'unlocked'
    }

    return this.getNextRoute() === routeId ? 'next' : 'locked'
  }

  getNextRoute(): RouteId | null {
    const data = this.getSaveData()
    return ROUTES.find((routeId) => !data.unlockedRoutes.includes(routeId)) ?? null
  }

  unlockNextRoute(isPerfect = false): RouteId | null {
    const routeId = this.getNextRoute()

    if (!routeId) {
      return null
    }

    const data = this.getSaveData()
    data.unlockedRoutes.push(routeId)

    if (isPerfect && !data.perfectRoutes.includes(routeId)) {
      data.perfectRoutes.push(routeId)
    }

    data.explorationUnlocked = data.unlockedRoutes.length >= TOTAL_ROUTES
    this.saveManager.save(data)
    return routeId
  }

  unlockAllRoutes(): void {
    const data = this.getSaveData()
    data.unlockedRoutes = [...ROUTES]
    data.explorationUnlocked = true
    this.saveManager.save(data)
  }

  registerRun(victories: number, score: number): void {
    const data = this.getSaveData()
    data.totalRuns += 1
    data.bestVictories = Math.max(data.bestVictories, victories)
    data.recordScore = Math.max(data.recordScore, score)
    this.saveManager.save(data)
  }

  reset(): void {
    this.saveData = this.saveManager.reset()
  }

  get routes(): RouteId[] {
    return ROUTES
  }
}
