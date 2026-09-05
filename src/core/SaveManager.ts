import { SAVE_KEY, SAVE_VERSION } from '../config/constants'
import type { StorageAdapter } from '../storage/StorageAdapter'
import type { SaveData } from '../types/SaveData'

export default class SaveManager {
  private data: SaveData

  constructor(private readonly storage: StorageAdapter) {
    this.data = this.createDefaultSave()
  }

  load(): SaveData {
    const rawSave = this.storage.read(SAVE_KEY)

    if (!rawSave) {
      this.data = this.createDefaultSave()
      this.save()
      return this.getData()
    }

    try {
      this.data = { ...this.createDefaultSave(), ...JSON.parse(rawSave) }
    } catch {
      this.data = this.createDefaultSave()
      this.save()
    }

    return this.getData()
  }

  save(data: SaveData = this.data): void {
    this.data = data
    this.storage.write(SAVE_KEY, JSON.stringify(this.data))
  }

  reset(): SaveData {
    this.data = this.createDefaultSave()
    this.save()
    return this.getData()
  }

  hasSave(): boolean {
    return this.storage.has(SAVE_KEY)
  }

  getData(): SaveData {
    return {
      ...this.data,
      unlockedRoutes: [...this.data.unlockedRoutes],
      perfectRoutes: [...this.data.perfectRoutes],
    }
  }

  private createDefaultSave(): SaveData {
    return {
      version: SAVE_VERSION,
      unlockedRoutes: [],
      totalRuns: 0,
      bestVictories: 0,
      recordScore: 0,
      perfectRoutes: [],
      explorationUnlocked: false,
    }
  }
}
