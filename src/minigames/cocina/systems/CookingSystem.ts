import { COCINA_CONFIG } from '../config/cocinaConfig'
import type { CookingSnapshot, HeatZone } from '../types/CocinaTypes'

export default class CookingSystem {
  private fireLevel: number = COCINA_CONFIG.INITIAL_FIRE_LEVEL
  private temperature: number = COCINA_CONFIG.INITIAL_TEMPERATURE
  private cookingProgress = 0
  private burnProgress = 0

  increaseHeat(): void {
    this.fireLevel = Math.min(1, this.fireLevel + COCINA_CONFIG.HEAT_STEP)
  }

  decreaseHeat(): void {
    this.fireLevel = Math.max(0, this.fireLevel - COCINA_CONFIG.HEAT_STEP)
  }

  forceOptimalTemperature(): void {
    this.fireLevel = 0.58
    this.temperature = 0.58
  }

  forceHighTemperature(): void {
    this.fireLevel = 0.9
    this.temperature = 0.9
  }

  forceCookingProgress(value: number): void {
    this.cookingProgress = Math.max(0, Math.min(100, value))
  }

  forceBurnProgress(value: number): void {
    this.burnProgress = Math.max(0, Math.min(100, value))
  }

  update(deltaMs: number, cookingActive: boolean): CookingSnapshot {
    const deltaSeconds = deltaMs / 1000
    this.temperature += (this.fireLevel - this.temperature) * COCINA_CONFIG.HEAT_RESPONSE * deltaSeconds

    if (cookingActive) {
      const zone = this.getHeatZone()

      if (zone === 'LOW') {
        this.cookingProgress += COCINA_CONFIG.COOK_RATE_LOW * deltaSeconds
      }

      if (zone === 'OPTIMAL') {
        this.cookingProgress += COCINA_CONFIG.COOK_RATE_OPTIMAL * deltaSeconds
        this.burnProgress = Math.max(0, this.burnProgress - 1.5 * deltaSeconds)
      }

      if (zone === 'HIGH') {
        this.cookingProgress += COCINA_CONFIG.COOK_RATE_HIGH * deltaSeconds
        this.burnProgress += COCINA_CONFIG.BURN_RATE_HIGH * deltaSeconds
      }
    }

    this.cookingProgress = Math.max(0, Math.min(100, this.cookingProgress))
    this.burnProgress = Math.max(0, Math.min(100, this.burnProgress))

    return this.getSnapshot()
  }

  getSnapshot(): CookingSnapshot {
    return {
      fireLevel: this.fireLevel,
      temperature: this.temperature,
      heatZone: this.getHeatZone(),
      cookingProgress: this.cookingProgress,
      burnProgress: this.burnProgress,
      victory: this.cookingProgress >= 100 && this.burnProgress < 100,
      burned: this.burnProgress >= 100,
    }
  }

  private getHeatZone(): HeatZone {
    if (this.temperature <= COCINA_CONFIG.LOW_MAX) {
      return 'LOW'
    }

    if (this.temperature >= COCINA_CONFIG.HIGH_MIN) {
      return 'HIGH'
    }

    return 'OPTIMAL'
  }
}
