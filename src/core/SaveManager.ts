import { SAVE_KEY, SAVE_VERSION, TOTAL_ROUTES } from '../config/constants'
import { MINIGAME_ORDER } from '../config/minigamesConfig'
import type { StorageAdapter } from '../storage/StorageAdapter'
import type { RouteId, SaveData } from '../types/SaveData'

const ROUTES: RouteId[] = ['route1', 'route2', 'route3', 'route4', 'route5']
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const count = (value: unknown, max = Number.MAX_SAFE_INTEGER): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : 0

export default class SaveManager {
  private data = this.createDefaultSave()
  private futureVersion = false
  storageAvailable = true

  constructor(private readonly storage: StorageAdapter) {}

  load(): SaveData {
    this.futureVersion = false
    try {
      const raw = this.storage.read(SAVE_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : null
      if (object(parsed) && typeof parsed.version === 'number' && parsed.version > SAVE_VERSION) {
        // Conservar un guardado de una app más reciente sin sobrescribirlo.
        this.futureVersion = true
        this.data = this.createDefaultSave()
      } else {
        this.data = this.validate(parsed)
        this.save()
      }
    } catch {
      this.data = this.createDefaultSave()
      this.save()
    }
    return this.getData()
  }

  save(data: SaveData = this.data): void {
    this.data = this.validate(data)
    if (this.futureVersion) return
    try {
      this.storage.write(SAVE_KEY, JSON.stringify(this.data))
      this.storageAvailable = true
    } catch {
      this.storageAvailable = false
    }
  }

  reset(): SaveData {
    this.futureVersion = false
    this.save(this.createDefaultSave())
    return this.getData()
  }

  hasSave(): boolean {
    try { return this.storage.has(SAVE_KEY) } catch { return false }
  }

  getData(): SaveData {
    return { ...this.data, unlockedRoutes: [...this.data.unlockedRoutes],
      perfectRoutes: [...this.data.perfectRoutes], bestScores: { ...this.data.bestScores } }
  }

  private validate(value: unknown): SaveData {
    const defaults = this.createDefaultSave()
    if (!object(value)) return defaults
    if (value.version !== undefined && value.version !== 1 && value.version !== SAVE_VERSION) return defaults
    const routes = (items: unknown): RouteId[] => Array.isArray(items)
      ? ROUTES.filter(route => items.includes(route)) : []
    const unlockedRoutes = routes(value.unlockedRoutes)
    const bestScores = { ...defaults.bestScores }
    if (object(value.bestScores)) {
      for (const key of MINIGAME_ORDER) bestScores[key] = count(value.bestScores[key])
    }
    return {
      version: SAVE_VERSION, unlockedRoutes,
      perfectRoutes: routes(value.perfectRoutes).filter(route => unlockedRoutes.includes(route)),
      totalRuns: count(value.totalRuns), bestVictories: count(value.bestVictories, MINIGAME_ORDER.length),
      // v1 sumaba 20 al no completar. Reconstruir el récord en la nueva escala.
      recordScore: value.version === 1
        ? count(value.bestVictories, MINIGAME_ORDER.length) * 100
        : count(value.recordScore, MINIGAME_ORDER.length * 100),
      bestScores, explorationUnlocked: unlockedRoutes.length === TOTAL_ROUTES,
    }
  }

  private createDefaultSave(): SaveData {
    return {
      version: SAVE_VERSION, unlockedRoutes: [], perfectRoutes: [], totalRuns: 0,
      bestVictories: 0, recordScore: 0, explorationUnlocked: false,
      bestScores: { papa: 0, cocina: 0, ruana: 0, tejo: 0, cocuy: 0 },
    }
  }
}
