import { COCINA_CONFIG } from '../config/cocinaConfig'
import type { CookingSnapshot, HeatZone } from '../types/CocinaTypes'

export default class CookingSystem {
  private fireLevel: number = COCINA_CONFIG.INITIAL_FIRE_LEVEL
  private temperature: number = COCINA_CONFIG.INITIAL_TEMPERATURE
  private cookingProgress = 0
  private burnProgress = 0
  private temperatureDirection: 1 | -1 = 1

  increaseHeat(): void {
    this.temperatureDirection = 1
    this.fireLevel = COCINA_CONFIG.INITIAL_FIRE_LEVEL
  }

  decreaseHeat(): void {
    this.temperatureDirection = -1
    this.fireLevel = 0.18
  }

  forceOptimalTemperature(): void {
    this.increaseHeat()
    this.temperature = 0.58
  }

  forceHighTemperature(): void {
    this.increaseHeat()
    this.temperature = 0.9
  }

  forceCookingProgress(value: number): void {
    this.cookingProgress = Math.max(0, Math.min(100, value))
  }

  forceBurnProgress(value: number): void {
    this.burnProgress = Math.max(0, Math.min(100, value))
  }

  update(deltaMs: number, cookingActive: boolean): CookingSnapshot {
    if (deltaMs <= 0) return this.getSnapshot()
    // Pasos cortos para atravesar las zonas igual con FPS variables.
    const steps = Math.ceil(deltaMs / (1000 / 60))
    const deltaSeconds = deltaMs / steps / 1000
    for (let step = 0; step < steps; step++) {
      if (this.burnProgress >= 100 || this.cookingProgress >= 100) break
      this.temperature = Math.max(0, Math.min(1, this.temperature + this.temperatureDirection * COCINA_CONFIG.TEMPERATURE_RATE_PER_SECOND * deltaSeconds))
      const zone = this.getHeatZone()
      if (!cookingActive) {
        if (zone === 'HIGH') this.burnProgress += COCINA_CONFIG.BURN_RATE_HIGH * deltaSeconds
        else if (zone === 'OPTIMAL') this.burnProgress = Math.max(0, this.burnProgress - 1.5 * deltaSeconds)
        continue
      }

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
      temperatureRate: this.temperatureDirection * COCINA_CONFIG.TEMPERATURE_RATE_PER_SECOND,
      temperature: this.temperature,
      heatZone: this.getHeatZone(),
      cookingProgress: this.cookingProgress,
      burnProgress: this.burnProgress,
      victory: this.cookingProgress >= 100 && this.burnProgress < 100,
      burned: this.burnProgress >= 100,
    }
  }

  private getHeatZone(): HeatZone {
    if (this.temperature < COCINA_CONFIG.OPTIMAL_MIN) {
      return 'LOW'
    }

    if (this.temperature > COCINA_CONFIG.OPTIMAL_MAX) {
      return 'HIGH'
    }

    return 'OPTIMAL'
  }
}
