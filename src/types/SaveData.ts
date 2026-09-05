export type RouteId = 'route1' | 'route2' | 'route3' | 'route4' | 'route5'

export interface SaveData {
  version: number
  unlockedRoutes: RouteId[]
  totalRuns: number
  bestVictories: number
  recordScore: number
  perfectRoutes: RouteId[]
  explorationUnlocked: boolean
}
